# DecisionLens: Customer Decision Intelligence & Evidence Platform

## Part 1 — Data & Analytics Foundation

> **DISCLAIMER:** The dataset used in this project is **synthetic** and was
> generated programmatically for demonstration purposes. All results, insights,
> and metrics are derived from this synthetic data and are **not real market
> estimates**.

---

## Problem Statement

FMCG businesses generate large volumes of transactional data but often lack a
structured approach to translate raw data into evidence-backed retention
decisions. Questions like *"Which customers are at risk?"* or *"Where should
retention efforts focus?"* need more than ad-hoc dashboards — they need a
systematic **Data → Analysis → Insight → Evidence → Decision** workflow.

## Objective

Build the **data and analytics foundation** for a customer decision intelligence
platform:

1. Create a realistic synthetic FMCG transaction dataset
2. Demonstrate a data-quality assessment and cleaning workflow
3. Structure data in SQLite for SQL-based aggregation
4. Engineer customer-level behavioural features
5. Implement RFM segmentation with documented rules
6. Conduct monthly cohort retention analysis
7. Generate deterministic, association-aware business insights

## Dataset

| Attribute | Value |
|-----------|-------|
| Customers | ~5,000 |
| Transactions | ~45,000 (before quality-issue injection) |
| Products | 19 |
| Categories | 5 — Beverages, Snacks, Personal Care, Household, Dairy |
| Date Range | 2023-01-01 → 2024-12-31 |
| Random Seed | 42 (fully reproducible) |

### Customer Archetypes

| Archetype | Share | Behaviour |
|-----------|-------|-----------|
| Premium Loyalist | 5% | High frequency, high spend, low discount |
| Steady Regular | 15% | Consistent mid-range purchases |
| Emerging Buyer | 10% | Joined in 2024, building habit |
| Sporadic Shopper | 30% | Infrequent, small baskets |
| Bargain Seeker | 15% | Discount-driven, moderate frequency |
| Fading Patron | 15% | Active early, quiet since mid-2024 |
| Minimal Engager | 10% | Very few lifetime purchases |

### Injected Data-Quality Issues

| Issue | Count | Purpose |
|-------|-------|---------|
| Duplicate rows | ~100 | Demonstrate de-duplication |
| Missing values | ~300 | Test imputation / drop logic |
| Inconsistent categories | ~50 | Demonstrate label normalisation |
| Invalid discounts | ~30 | Show range validation |
| Suspicious quantities | ~20 | Outlier detection |

## Methods

### Data Quality & Cleaning
- Automated quality report listing every detected issue with counts and
  prescribed treatments
- Cleaning pipeline: dedup → drop nulls in critical fields → normalise labels
  → impute categories → validate quantities & discounts → recalculate revenue

### SQL Analysis (SQLite)
- Indexed `transactions` table with customer, date, and category indexes
- Six SQL queries: total metrics, revenue by category, top customers,
  average order value, monthly trend, discount band analysis

### Customer Feature Engineering (cutoff: 2024-12-31)
- Recency, Frequency, Monetary value
- Average order value, discount usage rate
- Category count, product count, avg days between orders, tenure

### RFM Segmentation
- Quintile-based scoring (1–5):
  - **R:** lower recency → higher score
  - **F:** higher frequency → higher score
  - **M:** higher spend → higher score
- Rule-based segments (applied in priority order):

| Segment | Rule |
|---------|------|
| High Value | R ≥ 4 AND F ≥ 4 AND M ≥ 4 |
| Loyal | F ≥ 4 AND M ≥ 3 |
| At Risk | R ≤ 2 AND (F ≥ 3 OR M ≥ 3) |
| Growing | R ≥ 4 AND F ∈ {2, 3} |
| Occasional | F ∈ {2, 3} |
| Low Engagement | All remaining |

### Cohort Retention
- Monthly cohorts defined by first-purchase month
- Retention % tracked over subsequent months
- Retention matrix (cohort × month offset)

## Architecture

```
DecisionLens/
├── data/                         # Raw + cleaned CSVs, SQLite DB
├── src/
│   ├── generate_data.py          # Synthetic data generation
│   ├── clean_data.py             # Quality assessment & cleaning
│   ├── customer_analysis.py      # Customer feature engineering
│   ├── rfm.py                    # RFM scoring & segmentation
│   ├── cohorts.py                # Cohort retention analysis
│   └── sql_analysis.py           # SQLite storage & SQL queries
├── sql/
│   └── queries.sql               # SQL query reference
├── outputs/                      # All analysis outputs
├── tests/                        # pytest unit tests
├── main.py                       # Pipeline orchestrator
├── requirements.txt
└── README.md
```

## How to Run

### Prerequisites
- Python 3.9 or later

### Setup
```bash
pip install -r requirements.txt
```

### Run Full Pipeline
```bash
python main.py
```

This will generate data, clean it, store in SQLite, compute features,
run RFM segmentation, cohort analysis, and print business insights.

### Run Tests
```bash
pytest tests/ -v
```

### Run Individual Modules
```bash
python -m src.generate_data
python -m src.clean_data
python -m src.sql_analysis
python -m src.customer_analysis
python -m src.rfm
python -m src.cohorts
```

## Limitations

1. **Synthetic Data Only:** All data is programmatically generated. Observed
   patterns reflect the generation logic, not real market dynamics.
2. **No Causal Claims:** All insights describe observed **associations** in
   synthetic data. For example, *"Customers with higher discount usage show
   lower observed monetary value"* is not a claim that discounts cause lower
   value.
3. **Simplified Segmentation:** RFM segments use rule-based thresholds that may
   not generalise to real-world data without re-calibration.
4. **No External Validation:** There is no real-world benchmark to validate
   against.
5. **Part 1 Only:** This is the analytical foundation. Predictive models,
   dashboards, and decision-support tools will be considered in subsequent
   parts.

## Tech Stack

| Tool | Purpose |
|------|---------|
| Python | Core language |
| pandas | Data manipulation |
| NumPy | Numerical operations |
| SQLite | Structured data storage |
| SQL | Aggregation queries |
| pytest | Unit testing |

## License

This project is for educational and demonstration purposes.
