"""
Evidence-Based Business Insight Engine
========================================
Generates structured business insights from Part 1 analytics and
Part 2 churn predictions, with explicit evidence grading.

EVIDENCE FRAMEWORK
------------------
Each insight is structured as:

    business_question   : the decision-relevant question
    finding             : the observed result
    supporting_metric   : the quantitative evidence
    evidence_strength   : Strong / Moderate / Preliminary
    limitation          : known caveats
    association_causal  : Association / Association (not causal)
    next_investigation  : suggested follow-up

IMPORTANT
---------
    All insights are derived from SYNTHETIC data.
    No causal claims are made from observational analysis.
    Evidence strength reflects data completeness, NOT real-world validity.
"""

import pandas as pd
import numpy as np
from pathlib import Path
import json

OUTPUT_DIR = Path(__file__).resolve().parent.parent / "outputs"


def build_evidence_table(rfm_summary, cohort_data, churn_results,
                         customer_features):
    """Generate the evidence table with 5-8 structured insights.

    Parameters
    ----------
    rfm_summary : pd.DataFrame
        Segment-level summary from Part 1 RFM analysis.
    cohort_data : pd.DataFrame
        Cohort retention data from Part 1.
    churn_results : dict
        Output from train_churn_model().
    customer_features : pd.DataFrame
        Part 1 customer feature table.

    Returns
    -------
    pd.DataFrame
        The evidence table with one row per insight.
    """
    insights = []
    scored = churn_results["scored_customers"]
    importance = churn_results["feature_importance"]
    metrics = churn_results["metrics"]

    # ── Insight 1: Revenue concentration risk ────────────────
    hv = rfm_summary[rfm_summary["segment"] == "High Value"]
    if not hv.empty:
        h = hv.iloc[0]
        insights.append({
            "id": 1,
            "business_question": (
                "How concentrated is revenue among top customers, "
                "and does this create business risk?"
            ),
            "finding": (
                f"The 'High Value' segment ({h['customer_share_pct']}% of "
                f"customers) accounts for {h['revenue_share_pct']}% of "
                f"observed revenue."
            ),
            "supporting_metric": (
                f"Revenue share: {h['revenue_share_pct']}%, "
                f"Customer share: {h['customer_share_pct']}%"
            ),
            "evidence_strength": "Strong",
            "limitation": (
                "Synthetic data; real revenue distributions may differ. "
                "Revenue share is retrospective and may not predict "
                "future concentration."
            ),
            "association_causal": "Association (not causal)",
            "next_investigation": (
                "Track high-value segment stability over time. "
                "Investigate whether segment membership is persistent "
                "or transient."
            ),
        })

    # ── Insight 2: Churn model - recency is strongest signal ─
    top_feat = importance.iloc[0]
    insights.append({
        "id": 2,
        "business_question": (
            "Which customer behaviours are most strongly associated "
            "with future inactivity?"
        ),
        "finding": (
            f"'{top_feat['feature']}' has the strongest association with "
            f"future inactivity (|coef|={top_feat['abs_coefficient']:.3f}). "
            f"Direction: {top_feat['direction']}."
        ),
        "supporting_metric": (
            f"Logistic Regression coefficient: {top_feat['coefficient']:+.4f}, "
            f"Model ROC-AUC: {metrics['roc_auc']}"
        ),
        "evidence_strength": "Moderate",
        "limitation": (
            "Model trained on synthetic data. Coefficients reflect "
            "associations, not interventions. Model uses class "
            "weighting which affects coefficient magnitudes."
        ),
        "association_causal": "Association (not causal)",
        "next_investigation": (
            "Run controlled experiments (e.g., A/B test re-engagement "
            "campaigns targeting high-recency customers) to test "
            "whether reducing recency actually prevents churn."
        ),
    })

    # ── Insight 3: At-risk segment and churn overlap ─────────
    ar = rfm_summary[rfm_summary["segment"] == "At Risk"]
    if not ar.empty:
        a = ar.iloc[0]
        # Check overlap with high churn risk
        high_risk_count = (scored["risk_tier"] == "High").sum()
        total = len(scored)
        insights.append({
            "id": 3,
            "business_question": (
                "Do RFM 'At Risk' customers also show high predicted "
                "churn probability?"
            ),
            "finding": (
                f"{int(a['customer_count']):,} customers are RFM 'At Risk'. "
                f"Separately, {high_risk_count:,} customers ({high_risk_count/total*100:.1f}%) "
                f"are predicted as 'High' churn risk by the model."
            ),
            "supporting_metric": (
                f"At Risk count: {int(a['customer_count'])}, "
                f"High churn risk count: {high_risk_count}, "
                f"Model ROC-AUC: {metrics['roc_auc']}"
            ),
            "evidence_strength": "Moderate",
            "limitation": (
                "RFM segments and churn predictions use different "
                "methodologies; overlap is expected but not guaranteed. "
                "Both are computed from the same underlying data."
            ),
            "association_causal": "Association (not causal)",
            "next_investigation": (
                "Cross-tabulate RFM segments with predicted risk tiers "
                "to identify customers flagged by both methods for "
                "priority intervention."
            ),
        })

    # ── Insight 4: Discount usage and churn ──────────────────
    disc_row = importance[importance["feature"] == "discount_usage"]
    if not disc_row.empty:
        dr = disc_row.iloc[0]
        insights.append({
            "id": 4,
            "business_question": (
                "Is discount usage associated with higher or lower "
                "likelihood of future inactivity?"
            ),
            "finding": (
                f"Discount usage has a coefficient of {dr['coefficient']:+.4f} "
                f"in the churn model. {dr['direction']}."
            ),
            "supporting_metric": (
                f"Coefficient: {dr['coefficient']:+.4f}, "
                f"Rank by importance: "
                f"{int(disc_row.index[0]) + 1}/{len(importance)}"
            ),
            "evidence_strength": "Preliminary",
            "limitation": (
                "Discount-churn association is confounded: customers "
                "who use discounts may differ systematically from those "
                "who do not. Discounts may be offered to already-at-risk "
                "customers. Cannot infer that discounts cause or prevent churn."
            ),
            "association_causal": "Association (not causal)",
            "next_investigation": (
                "Design a randomised experiment: randomly assign "
                "discount offers to a subset of similar customers and "
                "measure retention differences."
            ),
        })

    # ── Insight 5: Cohort retention decay ────────────────────
    if cohort_data is not None and not cohort_data.empty:
        month6 = cohort_data[cohort_data["months_since_first"] == 6]
        if not month6.empty:
            avg_ret = month6["retention_pct"].mean()
            best_cohort = month6.loc[month6["retention_pct"].idxmax()]
            worst_cohort = month6.loc[month6["retention_pct"].idxmin()]
            insights.append({
                "id": 5,
                "business_question": (
                    "How quickly does customer retention decay, and "
                    "which acquisition cohorts retain best?"
                ),
                "finding": (
                    f"Average 6-month retention is {avg_ret:.1f}%. "
                    f"Best cohort: {best_cohort['cohort_month']} "
                    f"({best_cohort['retention_pct']:.1f}%), "
                    f"Worst: {worst_cohort['cohort_month']} "
                    f"({worst_cohort['retention_pct']:.1f}%)."
                ),
                "supporting_metric": (
                    f"6-month avg retention: {avg_ret:.1f}%, "
                    f"Range: {worst_cohort['retention_pct']:.1f}% - "
                    f"{best_cohort['retention_pct']:.1f}%"
                ),
                "evidence_strength": "Strong",
                "limitation": (
                    "Retention is measured by any purchase, not by "
                    "revenue or engagement depth. Cohort sizes vary "
                    "significantly, making small cohorts less reliable."
                ),
                "association_causal": "Association (not causal)",
                "next_investigation": (
                    "Investigate what differed about the best-performing "
                    "cohort's acquisition channel or onboarding experience."
                ),
            })

    # ── Insight 6: Category diversity and retention ──────────
    cat_row = importance[importance["feature"] == "category_count"]
    if not cat_row.empty:
        cr = cat_row.iloc[0]
        insights.append({
            "id": 6,
            "business_question": (
                "Is purchasing across more product categories associated "
                "with lower churn risk?"
            ),
            "finding": (
                f"Category count has a coefficient of {cr['coefficient']:+.4f} "
                f"in the churn model. {cr['direction']}."
            ),
            "supporting_metric": (
                f"Coefficient: {cr['coefficient']:+.4f}, "
                f"Mean categories (High Value segment): "
                f"{rfm_summary[rfm_summary['segment']=='High Value']['avg_categories'].values[0]:.1f}"
            ),
            "evidence_strength": "Moderate",
            "limitation": (
                "Category diversity may be a proxy for overall "
                "engagement rather than an independent driver. "
                "Customers who buy more also buy more categories."
            ),
            "association_causal": "Association (not causal)",
            "next_investigation": (
                "Test whether cross-category recommendations "
                "increase retention via controlled experiment."
            ),
        })

    # ── Insight 7: Model prediction confidence ───────────────
    high_conf = scored[scored["churn_probability"] >= 0.80]
    low_conf = scored[scored["churn_probability"] <= 0.20]
    insights.append({
        "id": 7,
        "business_question": (
            "How confident is the churn model in its predictions, "
            "and how many customers fall in the uncertain zone?"
        ),
        "finding": (
            f"{len(high_conf):,} customers have churn probability >= 80% "
            f"(high confidence inactive). {len(low_conf):,} have <= 20% "
            f"(high confidence active). "
            f"{len(scored) - len(high_conf) - len(low_conf):,} are in the "
            f"uncertain middle zone."
        ),
        "supporting_metric": (
            f"High confidence inactive: {len(high_conf)}, "
            f"High confidence active: {len(low_conf)}, "
            f"Uncertain: {len(scored) - len(high_conf) - len(low_conf)}"
        ),
        "evidence_strength": "Moderate",
        "limitation": (
            "Probability calibration has not been separately validated. "
            "The model uses balanced class weights which can shift "
            "probability distributions."
        ),
        "association_causal": "Prediction (not causal)",
        "next_investigation": (
            "Apply probability calibration (e.g., Platt scaling) "
            "and validate on held-out temporal data."
        ),
    })

    return pd.DataFrame(insights)


def run_evidence_engine(rfm_summary, cohort_data, churn_results,
                        customer_features):
    """Execute the evidence engine and save the table."""
    print("\n" + "=" * 60)
    print("PART 2: EVIDENCE-BASED INSIGHT ENGINE")
    print("=" * 60)

    evidence = build_evidence_table(
        rfm_summary, cohort_data, churn_results, customer_features,
    )

    print(f"\nGenerated {len(evidence)} structured insights")
    print("\n--- Evidence Summary ---")
    for _, row in evidence.iterrows():
        print(f"\n  [{row['id']}] {row['business_question']}")
        print(f"      Finding    : {row['finding'][:100]}...")
        print(f"      Strength   : {row['evidence_strength']}")
        print(f"      Causal?    : {row['association_causal']}")

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    evidence.to_csv(OUTPUT_DIR / "evidence_table.csv", index=False)

    # Also save as readable text
    with open(OUTPUT_DIR / "evidence_report.txt", "w", encoding="utf-8") as f:
        f.write("DECISIONLENS -- EVIDENCE-BASED INSIGHT REPORT\n")
        f.write("=" * 60 + "\n")
        f.write("NOTE: All findings are from SYNTHETIC data.\n")
        f.write("No causal claims are made.\n")
        f.write("=" * 60 + "\n\n")

        for _, row in evidence.iterrows():
            f.write(f"INSIGHT {row['id']}\n")
            f.write("-" * 40 + "\n")
            f.write(f"Question       : {row['business_question']}\n")
            f.write(f"Finding        : {row['finding']}\n")
            f.write(f"Metric         : {row['supporting_metric']}\n")
            f.write(f"Strength       : {row['evidence_strength']}\n")
            f.write(f"Limitation     : {row['limitation']}\n")
            f.write(f"Causal Status  : {row['association_causal']}\n")
            f.write(f"Next Step      : {row['next_investigation']}\n\n")

    print(f"\n  Saved evidence outputs -> {OUTPUT_DIR}")

    return evidence


if __name__ == "__main__":
    # Standalone run requires Part 1 outputs to exist
    rfm_summary = pd.read_csv(OUTPUT_DIR / "rfm_segment_summary.csv")
    cohort_data = pd.read_csv(OUTPUT_DIR / "cohort_retention_data.csv")
    customer_features = pd.read_csv(OUTPUT_DIR / "customer_features.csv")

    from churn_prediction import run_churn_prediction
    churn_results, _, _ = run_churn_prediction()
    run_evidence_engine(rfm_summary, cohort_data, churn_results,
                        customer_features)
