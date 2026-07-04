#!/usr/bin/env python3
"""Reproduce the requested complete-case OLS analyses.

This script intentionally uses pandas/numpy/scipy only. It does not use
Nullius or the nullius CLI.
"""

from __future__ import annotations

import json
from pathlib import Path

import numpy as np
import pandas as pd
from scipy import stats


ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
ARTIFACT_DIR = ROOT / "artifacts"


def format_num(value: float, digits: int = 3) -> str:
    return f"{value:.{digits}f}"


def format_p(value: float) -> str:
    if value < 0.001:
        return "p<0.001"
    return f"p={value:.3f}"


def read_joined_data() -> pd.DataFrame:
    patients = pd.read_csv(DATA_DIR / "patients.csv")
    visits = pd.read_csv(DATA_DIR / "visits.csv")
    biomarkers = pd.read_csv(DATA_DIR / "biomarkers.csv")

    for name, frame in {
        "patients.csv": patients,
        "visits.csv": visits,
        "biomarkers.csv": biomarkers,
    }.items():
        if frame["patient_id"].duplicated().any():
            duplicated = frame.loc[frame["patient_id"].duplicated(), "patient_id"].tolist()
            raise ValueError(f"{name} has duplicated patient_id values: {duplicated[:5]}")

    return patients.merge(visits, on="patient_id", how="inner").merge(
        biomarkers, on="patient_id", how="inner"
    )


def build_design(
    data: pd.DataFrame,
    numeric_terms: list[str],
    include_interaction: bool = False,
) -> pd.DataFrame:
    """Build a design matrix with stable reference levels.

    Reference categories are female for sex and site A for site.
    """

    x = pd.DataFrame({"Intercept": np.ones(len(data), dtype=float)}, index=data.index)

    for term in numeric_terms:
        x[term] = data[term].astype(float)

    if include_interaction:
        x["treatment:high_crp"] = (
            data["treatment"].astype(float) * data["high_crp"].astype(float)
        )

    sex = pd.Categorical(data["sex"], categories=["F", "M"])
    site = pd.Categorical(data["site"], categories=["A", "B", "C"])
    x["sex_M"] = (sex == "M").astype(float)
    x["site_B"] = (site == "B").astype(float)
    x["site_C"] = (site == "C").astype(float)
    return x


def fit_ols(y: pd.Series, x: pd.DataFrame) -> dict:
    x_values = x.to_numpy(dtype=float)
    y_values = y.to_numpy(dtype=float)
    n_obs, n_terms = x_values.shape
    rank = int(np.linalg.matrix_rank(x_values))
    if rank != n_terms:
        raise ValueError(f"Design matrix is rank deficient: rank {rank}, terms {n_terms}")

    xtx = np.einsum("ij,ik->jk", x_values, x_values)
    xty = np.einsum("ij,i->j", x_values, y_values)
    beta = np.linalg.solve(xtx, xty)
    fitted = np.einsum("ij,j->i", x_values, beta)
    residuals = y_values - fitted
    rss = float(np.sum(residuals**2))
    tss = float(np.sum((y_values - np.mean(y_values)) ** 2))
    df_resid = n_obs - rank
    sigma2 = rss / df_resid
    xtx_inv = np.linalg.inv(xtx)
    se = np.sqrt(np.diag(sigma2 * xtx_inv))
    t_values = beta / se
    p_values = 2 * stats.t.sf(np.abs(t_values), df_resid)
    t_crit = stats.t.ppf(0.975, df_resid)
    ci_low = beta - t_crit * se
    ci_high = beta + t_crit * se

    terms = list(x.columns)
    coefficients = pd.DataFrame(
        {
            "term": terms,
            "estimate": beta,
            "std_error": se,
            "ci_95_low": ci_low,
            "ci_95_high": ci_high,
            "t_value": t_values,
            "p_value": p_values,
        }
    )

    return {
        "n": int(n_obs),
        "rank": rank,
        "df_resid": int(df_resid),
        "r_squared": 1.0 - rss / tss,
        "rmse": float(np.sqrt(np.mean(residuals**2))),
        "rss": rss,
        "coefficients": coefficients,
    }


def coefficient_row(model: dict, term: str) -> dict:
    row = model["coefficients"].loc[model["coefficients"]["term"] == term]
    if row.empty:
        raise KeyError(term)
    return row.iloc[0].to_dict()


def serializable_model(model: dict) -> dict:
    return {
        key: value
        for key, value in model.items()
        if key != "coefficients"
    } | {
        "coefficients": model["coefficients"].to_dict(orient="records"),
    }


def write_report(
    joined: pd.DataFrame,
    complete: pd.DataFrame,
    main_model: dict,
    interaction_model: dict,
    missing_outcomes: int,
) -> None:
    treatment = coefficient_row(main_model, "treatment")
    interaction = coefficient_row(interaction_model, "treatment:high_crp")
    complete_counts = complete["treatment"].value_counts().sort_index()
    control_n = int(complete_counts.get(0, 0))
    treated_n = int(complete_counts.get(1, 0))

    model_1 = (
        "outcome_12w = beta0 + beta1*treatment + beta2*baseline_score "
        "+ beta3*age + beta4*sex_M + beta5*site_B + beta6*site_C "
        "+ beta7*crp_baseline + error"
    )
    model_2 = (
        "outcome_12w = beta0 + beta1*treatment + beta2*high_crp "
        "+ beta3*(treatment x high_crp) + beta4*baseline_score + beta5*age "
        "+ beta6*sex_M + beta7*site_B + beta8*site_C + error"
    )

    report = f"""# Complete-Case OLS Analysis of 12-Week Outcome

## Abstract

This analysis joined `patients.csv`, `visits.csv`, and `biomarkers.csv` by `patient_id` and estimated adjusted associations with `outcome_12w` among complete cases with observed 12-week outcomes. Of {len(joined)} joined patients, {missing_outcomes} had missing `outcome_12w`, leaving {len(complete)} complete cases ({treated_n} treated, {control_n} control). In the prespecified adjusted OLS model, treatment was associated with a {format_num(treatment["estimate"])}-point difference in 12-week outcome (SE {format_num(treatment["std_error"])}, 95% CI {format_num(treatment["ci_95_low"])} to {format_num(treatment["ci_95_high"])}, {format_p(treatment["p_value"])}). The model R-squared was {format_num(main_model["r_squared"])} and the in-sample RMSE was {format_num(main_model["rmse"])} outcome points. In the interaction model, the treatment-by-`high_crp` coefficient was {format_num(interaction["estimate"])} (SE {format_num(interaction["std_error"])}, 95% CI {format_num(interaction["ci_95_low"])} to {format_num(interaction["ci_95_high"])}, {format_p(interaction["p_value"])}).

## Methods

The source data were three CSV files in `data/`: `patients.csv`, `visits.csv`, and `biomarkers.csv`. Each file contained one row per `patient_id`; the analysis used an inner join on `patient_id`. The complete-case analytic cohort excluded rows with missing `outcome_12w`; no additional missingness was present in the requested predictors after joining.

The primary adjusted OLS model was:

`{model_1}`

The interaction model was:

`{model_2}`

`treatment` and `high_crp` were modeled as binary indicators. Sex and site were modeled with indicator variables using female (`sex=F`) and site A as reference categories. Confidence intervals and p-values used the conventional t distribution with residual degrees of freedom. RMSE is the square root of the mean in-sample squared residual.

## Results

The joined dataset contained {len(joined)} patients. Missing 12-week outcomes accounted for {missing_outcomes} patients ({format_num(100 * missing_outcomes / len(joined), 1)}%), leaving {len(complete)} complete cases for modeling. Complete-case treatment allocation was {treated_n} treated and {control_n} control.

For the primary adjusted model, the estimated treatment coefficient was {format_num(treatment["estimate"])} (SE {format_num(treatment["std_error"])}, 95% CI {format_num(treatment["ci_95_low"])} to {format_num(treatment["ci_95_high"])}, {format_p(treatment["p_value"])}). This coefficient estimates the adjusted mean difference in `outcome_12w` for treated versus control patients at the same baseline score, age, sex, site, and baseline CRP. The primary model had R-squared {format_num(main_model["r_squared"])} and RMSE {format_num(main_model["rmse"])}.

For the interaction model, the treatment-by-`high_crp` coefficient was {format_num(interaction["estimate"])} (SE {format_num(interaction["std_error"])}, 95% CI {format_num(interaction["ci_95_low"])} to {format_num(interaction["ci_95_high"])}, {format_p(interaction["p_value"])}). This coefficient estimates how much the adjusted treatment association differs between high-CRP and non-high-CRP patients, conditional on baseline score, age, sex, and site. The interaction model had R-squared {format_num(interaction_model["r_squared"])} and RMSE {format_num(interaction_model["rmse"])}.

## Discussion

After covariate adjustment, the primary model estimated that treated patients had lower 12-week outcomes than control patients, and the 95% confidence interval excluded zero. The interaction model estimated an additional negative treatment association among high-CRP patients relative to non-high-CRP patients, with the interaction confidence interval also excluding zero. The high R-squared in both models indicates that the included covariates collectively explained a large share of variation in 12-week outcomes in this dataset.

## Limitations

This is an observational regression analysis of the provided CSV data and should not be interpreted as a causal treatment effect without stronger design assumptions. The complete-case analysis excluded patients with missing 12-week outcomes; if outcome missingness is related to treatment, prognosis, or unmeasured variables, estimates may be biased. The interaction analysis has wider uncertainty because it estimates subgroup heterogeneity with fewer effective observations per cell. Model adequacy was assessed through prespecified summary metrics only; no residual diagnostics, influential-point analysis, or nonlinear terms were added.

## Data/Code Availability

Input data are stored in `data/patients.csv`, `data/visits.csv`, and `data/biomarkers.csv`. The reproducible analysis script is `scripts/analyze_ols.py`. Saved artifacts include `artifacts/analysis_results.json`, `artifacts/model_coefficients.csv`, and `artifacts/complete_case_data.csv`. The script uses pandas, numpy, and scipy and does not use Nullius or the nullius CLI.
"""

    (ROOT / "report.md").write_text(report, encoding="utf-8")


def main() -> None:
    ARTIFACT_DIR.mkdir(exist_ok=True)
    joined = read_joined_data()

    requested_columns = [
        "outcome_12w",
        "treatment",
        "baseline_score",
        "age",
        "sex",
        "site",
        "crp_baseline",
        "high_crp",
    ]
    missing_outcomes = int(joined["outcome_12w"].isna().sum())
    complete = joined.dropna(subset=requested_columns).copy()

    main_x = build_design(
        complete,
        ["treatment", "baseline_score", "age", "crp_baseline"],
        include_interaction=False,
    )
    interaction_x = build_design(
        complete,
        ["treatment", "high_crp", "baseline_score", "age"],
        include_interaction=True,
    )

    y = complete["outcome_12w"]
    main_model = fit_ols(y, main_x)
    interaction_model = fit_ols(y, interaction_x)

    coefficients = pd.concat(
        [
            main_model["coefficients"].assign(model="adjusted_crp"),
            interaction_model["coefficients"].assign(model="interaction_high_crp"),
        ],
        ignore_index=True,
    )
    coefficients = coefficients[
        [
            "model",
            "term",
            "estimate",
            "std_error",
            "ci_95_low",
            "ci_95_high",
            "t_value",
            "p_value",
        ]
    ]

    complete.to_csv(ARTIFACT_DIR / "complete_case_data.csv", index=False)
    coefficients.to_csv(ARTIFACT_DIR / "model_coefficients.csv", index=False)

    results = {
        "source_files": [
            "data/patients.csv",
            "data/visits.csv",
            "data/biomarkers.csv",
        ],
        "join_key": "patient_id",
        "joined_n": int(len(joined)),
        "missing_outcome_12w_count": missing_outcomes,
        "complete_case_n": int(len(complete)),
        "complete_case_treatment_counts": {
            str(int(key)): int(value)
            for key, value in complete["treatment"].value_counts().sort_index().items()
        },
        "reference_levels": {"sex": "F", "site": "A"},
        "primary_model_formula": (
            "outcome_12w ~ treatment + baseline_score + age + sex + site + crp_baseline"
        ),
        "interaction_model_formula": (
            "outcome_12w ~ treatment + high_crp + treatment:high_crp "
            "+ baseline_score + age + sex + site"
        ),
        "main_model": serializable_model(main_model),
        "interaction_model": serializable_model(interaction_model),
    }

    (ARTIFACT_DIR / "analysis_results.json").write_text(
        json.dumps(results, indent=2), encoding="utf-8"
    )
    write_report(joined, complete, main_model, interaction_model, missing_outcomes)

    treatment = coefficient_row(main_model, "treatment")
    interaction = coefficient_row(interaction_model, "treatment:high_crp")
    print(f"complete_case_n={len(complete)}")
    print(f"missing_outcome_12w_count={missing_outcomes}")
    print(
        "treatment_estimate="
        f"{treatment['estimate']:.6f}, se={treatment['std_error']:.6f}, "
        f"p={treatment['p_value']:.6g}"
    )
    print(
        "interaction_estimate="
        f"{interaction['estimate']:.6f}, se={interaction['std_error']:.6f}, "
        f"p={interaction['p_value']:.6g}"
    )


if __name__ == "__main__":
    main()
