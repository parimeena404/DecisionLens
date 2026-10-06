# DecisionLens: Customer Decision Intelligence & Evidence Platform

> **DISCLAIMER:** The dataset used in this project is **synthetic** and was
> generated programmatically for demonstration purposes. All results, insights,
> and metrics are derived from this synthetic data and are **not real market
> estimates**.

---

## Overview

**DecisionLens** is a free, open-source customer decision intelligence and evidence platform. It demonstrates a rigorous, reproducible analytical workflow that translates raw transactional data into structured, evidence-backed business decisions:

$$\text{Data} \longrightarrow \text{Quality / Cleaning} \longrightarrow \text{Analysis} \longrightarrow \text{Prediction} \longrightarrow \text{Evidence} \longrightarrow \text{Decision}$$

The platform is built across two complementary parts:
- **Part 1 — Data & Analytics Foundation:** Synthetic FMCG generation, data cleaning, SQLite warehousing, customer feature engineering, RFM segmentation, and monthly cohort retention analysis.
- **Part 2 — Churn Prediction & Evidence Engine:** Strict temporal churn modeling with zero future leakage, logistic regression risk scoring, feature importance analysis, and a structured evidence engine separating **Prediction**, **Explanation**, and **Causation**.

---

## Core Philosophy: Prediction vs Explanation vs Causation

DecisionLens enforces an explicit epistemic boundary:

| Concept | What It Answers | How DecisionLens Handles It |
|---|---|---|
| **Prediction** | *"Who is likely to become inactive?"* | Supervised binary classification on strictly historical data ($t \le \text{cutoff}$). Evaluated by ROC-AUC, Recall, Precision. |
| **Explanation** | *"Which historical signals are statistically associated with inactivity?"* | Standardized logistic regression coefficients and odds ratios indicate correlation direction and relative feature importance. |
| **Causation** | *"What happens if we actively intervene (e.g. give discounts)?"* | **Not claimed.** Observational data cannot establish counterfactual causality without randomized experiments (A/B testing). Every insight explicitly states limitations and proposes controlled follow-up trials. |

---

## Part 1: Data & Analytics Foundation

### Synthetic Dataset Architecture
- **Volume:** 5,000 customers, ~45,000 transactions across 19 FMCG products in 5 categories (*Beverages, Snacks, Personal Care, Household, Dairy*).
- **Timeframe:** 2023-01-01 to 2024-12-31 (2 full years).
- **Reproducibility:** Fixed random seed `42`.
- **7 Realistic Customer Archetypes:** *Premium Loyalist (5%)*, *Steady Regular (15%)*, *Emerging Buyer (10%)*, *Sporadic Shopper (30%)*, *Bargain Seeker (15%)*, *Fading Patron (15%)*, *Minimal Engager (10%)*.
- **Injected Data Anomalies:** Duplicates, missing values, category casing discrepancies, invalid discounts ($>100\%$ / negative), and extreme quantity outliers to test audit and cleaning pipelines.

### Data Cleaning & SQLite Storage
- Pipeline: Deduplication $\to$ null handling $\to$ category canonicalization $\to$ discount clamping $\to$ quantity bounds validation $\to$ recalculation of net revenue (`quantity * unit_price * (1 - discount)`).
- Stored in SQLite (`data/decisionlens.db`) with composite indexes on customer IDs, order dates, and categories.

### RFM & Cohort Analysis
- **RFM Segmentation:** Quintile scoring (1–5) mapping customers into 6 rule-based segments: *High Value*, *Loyal*, *At Risk*, *Growing*, *Occasional*, and *Low Engagement*.
- **Cohort Retention:** Monthly acquisition cohorts tracked across 24 rolling months with retention decay matrices.

---

## Part 2: Temporal Churn Prediction & Evidence Engine

### 1. Zero-Leakage Temporal Design
To eliminate lookahead bias and temporal data leakage:
- **Observation Window ($t \le 2024\text{-}09\text{-}30$):** Exactly 21 months of transaction history used to compute customer behavioral features.
- **Cutoff Date:** `2024-09-30`.
- **Prediction Target Window ($t > 2024\text{-}09\text{-}30$):** Q4 2024 (92 days: 2024-10-01 to 2024-12-31).
- **Target Definition:** Binary churn indicator:
  - $\text{churn} = 1$ if zero purchases occurred in Q4 2024.
  - $\text{churn} = 0$ if at least one purchase occurred in Q4 2024.
- **Guarantee:** Features are calculated strictly from pre-cutoff transactions; no target-window information leaks into training or inference.

```
|---------------- Observation Period (Features) ----------------|--- Target Period (Label) ---|
2023-01-01                                              2024-09-30                      2024-12-31
                                                        [CUTOFF]
```

### 2. Engineered Pre-Cutoff Behavioral Features
1. `recency`: Days from customer's last pre-cutoff purchase to cutoff date.
2. `frequency`: Count of unique pre-cutoff purchase dates.
3. `monetary_value`: Net pre-cutoff spend.
4. `total_orders`: Total pre-cutoff transactions.
5. `average_order_value`: Mean basket value pre-cutoff.
6. `discount_usage`: Percentage of orders using promotional discounts.
7. `category_count`: Number of distinct categories purchased from.
8. `product_count`: Number of unique SKUs purchased.
9. `avg_days_between_orders`: Mean inter-purchase interval.
10. `tenure_days`: Days between customer's first pre-cutoff order and cutoff date.

### 3. Model Architecture & Evaluation
A transparent, interpretable **Logistic Regression** model with balanced class weighting and standard scaling:

| Metric | Score | Interpretation |
|---|---|---|
| **ROC-AUC** | **0.705** | Solid discriminatory ability across risk thresholds on unseen test data. |
| **Recall (Churn)** | **70.05%** | Successfully catches 7 out of 10 inactive customers. |
| **Precision (Churn)** | **58.46%** | Minimizes wasted retention outreach while maintaining high capture. |
| **F1 Score** | **0.6373** | Harmonic balance between precision and recall. |
| **Test Set Size** | 989 customers | Stratified 80/20 train/test split. |

#### Confusion Matrix (Test Set, N=989)
- **True Inactive (True Positives):** 297
- **False Inactive (False Positives):** 211
- **True Active (True Negatives):** 354
- **Missed Inactive (False Negatives):** 127

### 4. Risk Scoring Tiers
Every customer is assigned a calibrated risk score:
- **Low Risk ($p < 0.40$):** Healthy activity, regular purchasing cadence.
- **Medium Risk ($0.40 \le p \le 0.65$):** Moderate inactivity signal; prime candidates for nurturing.
- **High Risk ($p > 0.65$):** Severe recency and fading frequency; priority candidates for targeted intervention.

### 5. Feature Importance & Direction

| Feature | Coefficient | Direction | Analytical Interpretation |
|---|---|---|---|
| `recency` | **+0.5453** | Higher $\to$ More Inactive | Strongest predictor: longer idle time signals imminent churn. |
| `tenure_days` | **+0.5356** | Higher $\to$ More Inactive | Older accounts that slowed down have higher probability of staying quiet. |
| `monetary_value` | **-0.4869** | Higher $\to$ Less Inactive | High spenders exhibit stronger persistence and brand commitment. |
| `frequency` | **-0.4301** | Higher $\to$ Less Inactive | Habitual buyers are significantly more likely to repeat purchase. |
| `total_orders` | **-0.4301** | Higher $\to$ Less Inactive | Order volume negatively correlates with inactivity. |
| `category_count` | **+0.2785** | Higher $\to$ More Inactive | Higher category breadth in synthetic data correlates with sporadic basket fill. |
| `product_count` | **+0.2092** | Higher $\to$ More Inactive | Multiple product sampling without deep frequency. |
| `discount_usage` | **-0.1008** | Higher $\to$ Less Inactive | Promotional buyers show slightly higher return rates (association only). |
| `average_order_value` | **-0.0426** | Higher $\to$ Less Inactive | Slight negative correlation with inactivity. |
| `avg_days_between_orders`| **+0.0121** | Higher $\to$ More Inactive | Minor positive association. |

---

## Evidence-Based Decision Engine

Rather than unstructured narrative output, DecisionLens structures business insights into an **Evidence Table** containing rigorous metadata:
1. **Business Question:** What operational question is being answered?
2. **Finding:** Concrete empirical finding.
3. **Supporting Metric:** Exact numerical evidence.
4. **Evidence Strength:** Categorized as *Strong*, *Moderate*, or *Preliminary*.
5. **Limitations:** Known caveats, potential confounders, and data boundaries.
6. **Causal Status:** Explicitly flagged as *Association (not causal)* or *Prediction (not causal)*.
7. **Recommended Next Step:** Controlled experiments, A/B tests, or cohort segmentation.

### Synthesized Evidence Table

| ID | Business Question | Finding | Supporting Metric | Evidence Strength | Causal Status | Next Recommended Step |
|---|---|---|---|---|---|---|
| **1** | How concentrated is revenue among top customers? | High Value segment (21.1% of base) generates 50.55% of revenue. | Revenue share: 50.55%, Base share: 21.06% | **Strong** | Association | Track High Value stability over time; analyze member churn risk. |
| **2** | Which customer behaviors most strongly associate with inactivity? | Recency is the primary predictor of future non-purchase ($+0.545$ coefficient). | Model ROC-AUC: 0.705, Recency coef: $+0.5453$ | **Moderate** | Association | Run A/B tested re-engagement campaigns before day 90. |
| **3** | Do RFM 'At Risk' customers overlap with predicted churn risk? | 579 customers are RFM At Risk; 942 customers flagged as High Risk by ML. | 579 RFM At Risk vs 942 High ML Risk | **Moderate** | Association | Cross-tabulate segments to prioritize multi-flagged customers. |
| **4** | Is discount usage associated with churn? | Higher discount usage associates with slightly lower churn (coef $-0.101$). | Rank 8/10, Coef: $-0.1008$ | **Preliminary** | Association | Run randomized trial before expanding discount budgets. |
| **5** | How quickly does cohort retention decay? | 6-month retention averages 26.2% across cohorts (range: 12.8%–36.7%). | 6-month mean: 26.2% | **Strong** | Association | Isolate channel drivers behind the high-performing 2023-01 cohort. |
| **6** | Does multi-category buying shield against churn? | Category count shows a $+0.279$ association with inactivity. | Category coef: $+0.2785$ | **Moderate** | Association | Test category cross-sell in controlled cohorts. |
| **7** | How confident is the churn model? | 76 customers have $p \ge 80\%$, 285 have $p \le 20\%$, 4,583 in intermediate band. | High confidence inactive: 76, active: 285 | **Moderate** | Prediction | Apply probability calibration (e.g. Platt scaling) on held-out data. |

---

## Project Structure

```
DecisionLens/
├── data/                                 # Raw & cleaned datasets, SQLite DB
│   ├── synthetic_transactions_raw.csv
│   ├── transactions_cleaned.csv
│   └── decisionlens.db
├── src/
│   ├── __init__.py
│   ├── generate_data.py                  # Synthetic FMCG transaction generator
│   ├── clean_data.py                     # Data quality assessment & cleaning pipeline
│   ├── sql_analysis.py                   # SQLite indexing & aggregation queries
│   ├── customer_analysis.py              # Customer-level feature engineering
│   ├── rfm.py                            # RFM scoring & segmentation
│   ├── cohorts.py                        # Cohort retention matrix computation
│   ├── churn_prediction.py               # Part 2: Temporal churn modeling & risk scoring
│   └── evidence_engine.py                # Part 2: Evidence table & decision report generator
├── sql/
│   └── queries.sql                       # Standalone SQL analytics queries
├── outputs/                              # Pipeline outputs & artifacts
│   ├── business_insights.txt
│   ├── churn_features_pre_cutoff.csv
│   ├── churn_risk_scores.csv
│   ├── churn_feature_importance.csv
│   ├── churn_model_metrics.json
│   ├── evidence_table.csv
│   └── evidence_report.txt
├── tests/                                # pytest test suite (38 unit tests)
│   ├── test_cleaning.py
│   ├── test_revenue.py
│   ├── test_customer_aggregation.py
│   ├── test_rfm.py
│   ├── test_cohorts.py
│   └── test_churn.py                     # 11 tests verifying zero temporal leakage
├── main.py                               # Unified pipeline orchestrator (Parts 1 & 2)
├── requirements.txt                      # Dependencies
└── README.md
```

---

## Getting Started

### Prerequisites
- Python 3.9+
- SQLite3 (standard library)

### Installation
```bash
git clone https://github.com/parimeena404/DecisionLens.git
cd DecisionLens
pip install -r requirements.txt
```

### Run Full Pipeline
To execute the complete end-to-end pipeline (data generation, cleaning, SQL analysis, RFM, cohorts, churn prediction, and evidence generation):
```bash
python main.py
```

### Run Unit Tests
To run all 38 test cases:
```bash
pytest -v
```

To run only the temporal leakage & churn tests:
```bash
pytest tests/test_churn.py -v
```

---

## Tech Stack

| Tool | Purpose | License |
|---|---|---|
| **Python** | Core platform logic | Open Source (PSFL) |
| **pandas** | Tabular transformations & cohort aggregation | Open Source (BSD-3) |
| **NumPy** | Array computations & reproducible sampling | Open Source (BSD-3) |
| **scikit-learn** | Logistic regression & evaluation metrics | Open Source (BSD-3) |
| **SQLite3** | SQL storage & indexed relational querying | Public Domain |
| **pytest** | Automated test suite & temporal validation | Open Source (MIT) |

---

## License

This project is built from scratch for educational, research, and portfolio demonstration purposes. All tools and dependencies are strictly free and open-source.

