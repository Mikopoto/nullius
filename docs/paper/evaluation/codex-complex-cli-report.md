# Complete-Case OLS Analysis of 12-Week Outcome

## Abstract

This analysis joined three patient-level CSV files and estimated adjusted associations with the 12-week outcome among complete cases. Of 240 joined patients, 18 had missing 12-week outcomes, leaving 222 complete cases with 123 treated and 99 control patients. The primary adjusted model estimated a treatment coefficient of -5.053 with SE 0.209, 95% CI -5.465 to -4.641, p=3.89e-63, R-squared 0.885, and RMSE 1.505. The treatment-by-high-CRP interaction coefficient was -1.235 with SE 0.449, 95% CI -2.119 to -0.350, and p=0.006429.

## Introduction

The analysis estimates whether treatment is associated with a different 12-week outcome after adjusting for baseline severity, age, sex, site, and baseline CRP. A second model examines whether the adjusted treatment association differs for high-CRP patients.

## Methods

The source files were joined by patient identifier. The analytic cohort used complete cases with observed outcome, treatment, baseline score, age, sex, site, CRP, and high-CRP status. The primary model regressed the 12-week outcome on treatment, baseline score, age, sex, site, and baseline CRP. The interaction model replaced baseline CRP with high-CRP status and a treatment-by-high-CRP interaction term, while retaining baseline score, age, sex, and site adjustment.

## Results

The joined dataset contained 240 patients. Missing 12-week outcomes accounted for 18 patients, leaving 222 complete cases. Complete-case treatment allocation was 123 treated and 99 control patients.

In the primary adjusted model, the treatment coefficient was -5.053 with SE 0.209, 95% CI -5.465 to -4.641, and p=3.89e-63. The primary model had R-squared 0.885 and RMSE 1.505.

In the interaction model, the treatment-by-high-CRP coefficient was -1.235 with SE 0.449, 95% CI -2.119 to -0.350, and p=0.006429. The interaction model had R-squared 0.880 and RMSE 1.535.

## Discussion

The adjusted treatment association was negative in the complete-case cohort, and the 95% confidence interval excluded zero. The interaction estimate was also negative, indicating a more negative adjusted treatment association among high-CRP patients than among non-high-CRP patients in this synthetic dataset. These estimates describe associations in the supplied data and do not establish a causal treatment effect.

## Limitations

The analysis is observational and uses complete cases only. If missing 12-week outcomes depend on treatment, prognosis, or unmeasured factors, the complete-case estimates may be biased. The interaction estimate is more model-dependent than the primary treatment coefficient because subgroup heterogeneity is represented through a single product term.

## Data and Code Availability

The source CSV files are stored in the project data directory. The analysis script is stored as scripts/analyze_ols.py. The result artifacts are stored as artifacts/analysis_results.json, artifacts/model_coefficients.csv, artifacts/complete_case_data.csv, and artifacts/nullius-gate-metrics.csv.
