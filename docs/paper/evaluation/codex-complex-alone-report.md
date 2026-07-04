# Complete-Case OLS Analysis of 12-Week Outcome

## Abstract

This analysis joined `patients.csv`, `visits.csv`, and `biomarkers.csv` by `patient_id` and estimated adjusted associations with `outcome_12w` among complete cases with observed 12-week outcomes. Of 240 joined patients, 18 had missing `outcome_12w`, leaving 222 complete cases (123 treated, 99 control). In the prespecified adjusted OLS model, treatment was associated with a -5.053-point difference in 12-week outcome (SE 0.209, 95% CI -5.465 to -4.641, p<0.001). The model R-squared was 0.885 and the in-sample RMSE was 1.505 outcome points. In the interaction model, the treatment-by-`high_crp` coefficient was -1.235 (SE 0.449, 95% CI -2.119 to -0.350, p=0.006).

## Methods

The source data were three CSV files in `data/`: `patients.csv`, `visits.csv`, and `biomarkers.csv`. Each file contained one row per `patient_id`; the analysis used an inner join on `patient_id`. The complete-case analytic cohort excluded rows with missing `outcome_12w`; no additional missingness was present in the requested predictors after joining.

The primary adjusted OLS model was:

`outcome_12w = beta0 + beta1*treatment + beta2*baseline_score + beta3*age + beta4*sex_M + beta5*site_B + beta6*site_C + beta7*crp_baseline + error`

The interaction model was:

`outcome_12w = beta0 + beta1*treatment + beta2*high_crp + beta3*(treatment x high_crp) + beta4*baseline_score + beta5*age + beta6*sex_M + beta7*site_B + beta8*site_C + error`

`treatment` and `high_crp` were modeled as binary indicators. Sex and site were modeled with indicator variables using female (`sex=F`) and site A as reference categories. Confidence intervals and p-values used the conventional t distribution with residual degrees of freedom. RMSE is the square root of the mean in-sample squared residual.

## Results

The joined dataset contained 240 patients. Missing 12-week outcomes accounted for 18 patients (7.5%), leaving 222 complete cases for modeling. Complete-case treatment allocation was 123 treated and 99 control.

For the primary adjusted model, the estimated treatment coefficient was -5.053 (SE 0.209, 95% CI -5.465 to -4.641, p<0.001). This coefficient estimates the adjusted mean difference in `outcome_12w` for treated versus control patients at the same baseline score, age, sex, site, and baseline CRP. The primary model had R-squared 0.885 and RMSE 1.505.

For the interaction model, the treatment-by-`high_crp` coefficient was -1.235 (SE 0.449, 95% CI -2.119 to -0.350, p=0.006). This coefficient estimates how much the adjusted treatment association differs between high-CRP and non-high-CRP patients, conditional on baseline score, age, sex, and site. The interaction model had R-squared 0.880 and RMSE 1.535.

## Discussion

After covariate adjustment, the primary model estimated that treated patients had lower 12-week outcomes than control patients, and the 95% confidence interval excluded zero. The interaction model estimated an additional negative treatment association among high-CRP patients relative to non-high-CRP patients, with the interaction confidence interval also excluding zero. The high R-squared in both models indicates that the included covariates collectively explained a large share of variation in 12-week outcomes in this dataset.

## Limitations

This is an observational regression analysis of the provided CSV data and should not be interpreted as a causal treatment effect without stronger design assumptions. The complete-case analysis excluded patients with missing 12-week outcomes; if outcome missingness is related to treatment, prognosis, or unmeasured variables, estimates may be biased. The interaction analysis has wider uncertainty because it estimates subgroup heterogeneity with fewer effective observations per cell. Model adequacy was assessed through prespecified summary metrics only; no residual diagnostics, influential-point analysis, or nonlinear terms were added.

## Data/Code Availability

Input data are stored in `data/patients.csv`, `data/visits.csv`, and `data/biomarkers.csv`. The reproducible analysis script is `scripts/analyze_ols.py`. Saved artifacts include `artifacts/analysis_results.json`, `artifacts/model_coefficients.csv`, and `artifacts/complete_case_data.csv`. The script uses pandas, numpy, and scipy and does not use Nullius or the nullius CLI.
