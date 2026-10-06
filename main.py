"""
DecisionLens – Part 1 Pipeline Orchestrator
=============================================
Runs the complete data-and-analytics foundation:

    1. Generate synthetic FMCG transaction data
    2. Assess data quality and clean
    3. Store in SQLite and run SQL aggregations
    4. Engineer customer-level features
    5. Perform RFM segmentation
    6. Conduct monthly cohort retention analysis
    7. Produce deterministic business insights

IMPORTANT: The dataset is synthetic and is used to demonstrate
the analytical workflow.  Results are not real market estimates.
"""

import sys
import os

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

import pandas as pd
from pathlib import Path

from src.generate_data import generate_dataset
from src.clean_data import run_cleaning
from src.sql_analysis import run_sql_analysis
from src.customer_analysis import run_customer_analysis
from src.rfm import run_rfm_analysis
from src.cohorts import run_cohort_analysis

OUTPUT_DIR = Path(__file__).resolve().parent / "outputs"


def generate_business_insights(rfm, rfm_summary, cohort_data,
                               customer_features, sql_results):
    """Produce deterministic, association-aware business insights."""
    print("\n" + "=" * 60)
    print("BUSINESS INSIGHTS  (Part 1)")
    print("=" * 60)

    insights = []

    # 1 – Revenue concentration
    top = rfm_summary.sort_values("total_revenue", ascending=False).iloc[0]
    insights.append(
        f"1. REVENUE CONCENTRATION: The '{top['segment']}' segment "
        f"contributes {top['revenue_share_pct']}% of total revenue "
        f"while representing {top['customer_share_pct']}% of customers."
    )

    # 2 – High-value impact
    hv = rfm_summary[rfm_summary["segment"] == "High Value"]
    if not hv.empty:
        h = hv.iloc[0]
        insights.append(
            f"2. HIGH-VALUE IMPACT: {int(h['customer_count']):,} high-value "
            f"customers ({h['customer_share_pct']}% of base) generate "
            f"{h['revenue_share_pct']}% of total observed revenue."
        )

    # 3 – At-risk retention opportunity
    ar = rfm_summary[rfm_summary["segment"] == "At Risk"]
    if not ar.empty:
        a = ar.iloc[0]
        insights.append(
            f"3. RETENTION OPPORTUNITY: {int(a['customer_count']):,} customers "
            f"are 'At Risk' (avg recency {a['avg_recency']:.0f} days). "
            f"They represent {a['revenue_share_pct']}% of historical revenue."
        )

    # 4 – AOV variation
    hi_aov = rfm_summary.loc[rfm_summary["avg_aov"].idxmax()]
    lo_aov = rfm_summary.loc[rfm_summary["avg_aov"].idxmin()]
    insights.append(
        f"4. ORDER VALUE VARIATION: '{hi_aov['segment']}' shows the "
        f"highest avg order value (₹{hi_aov['avg_aov']:.2f}), "
        f"'{lo_aov['segment']}' the lowest (₹{lo_aov['avg_aov']:.2f})."
    )

    # 5 – Discount association (NOT causal)
    if "avg_discount_usage" in rfm_summary.columns:
        hi_d = rfm_summary.loc[rfm_summary["avg_discount_usage"].idxmax()]
        lo_d = rfm_summary.loc[rfm_summary["avg_discount_usage"].idxmin()]
        insights.append(
            f"5. DISCOUNT ASSOCIATION: '{hi_d['segment']}' customers show "
            f"the highest avg discount usage ({hi_d['avg_discount_usage']:.1%}); "
            f"'{lo_d['segment']}' the lowest ({lo_d['avg_discount_usage']:.1%}). "
            f"NOTE: This is an observed association, not a causal claim."
        )

    # 6 – Cohort retention
    month6 = cohort_data[cohort_data["months_since_first"] == 6]
    if not month6.empty:
        avg_ret = month6["retention_pct"].mean()
        best = month6.loc[month6["retention_pct"].idxmax()]
        insights.append(
            f"6. COHORT RETENTION: Average 6-month retention is "
            f"{avg_ret:.1f}%. Best cohort at 6 months: "
            f"{best['cohort_month']} ({best['retention_pct']:.1f}%)."
        )

    # 7 – Category engagement
    if "avg_categories" in rfm_summary.columns:
        div = rfm_summary.loc[rfm_summary["avg_categories"].idxmax()]
        insights.append(
            f"7. CATEGORY ENGAGEMENT: '{div['segment']}' customers engage "
            f"with the most categories on average ({div['avg_categories']:.1f}), "
            f"suggesting broader basket composition."
        )

    # print & save
    text_lines = []
    for ins in insights:
        print(f"\n{ins}")
        text_lines.append(ins)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_DIR / "business_insights.txt", "w", encoding="utf-8") as fh:
        fh.write("DECISIONLENS — PART 1 BUSINESS INSIGHTS\n")
        fh.write("=" * 50 + "\n")
        fh.write("NOTE: All findings are from synthetic data.\n")
        fh.write("Associations below are NOT causal claims.\n")
        fh.write("=" * 50 + "\n\n")
        fh.write("\n\n".join(text_lines) + "\n")

    return insights


def main():
    """Run the complete Part 1 pipeline."""
    banner = (
        "\n" + "=" * 60 + "\n"
        "  DECISIONLENS - Customer Decision Intelligence Platform\n"
        "  Part 1: Data & Analytics Foundation\n"
        + "=" * 60 + "\n"
    )
    print(banner)

    # 1. Generate data
    df_raw = generate_dataset()

    # 2. Clean
    df_clean, quality_report = run_cleaning()

    # 3. SQL
    sql_results = run_sql_analysis(df_clean)

    # 4. Customer features
    cust_features = run_customer_analysis(df_clean)

    # 5. RFM
    rfm, rfm_summary = run_rfm_analysis(cust_features)

    # 6. Cohorts
    cohort_data, retention_matrix, cohort_sizes = run_cohort_analysis(df_clean)

    # 7. Insights
    insights = generate_business_insights(
        rfm, rfm_summary, cohort_data, cust_features, sql_results,
    )

    # Final summary
    raw_count = len(pd.read_csv(
        Path(__file__).resolve().parent / "data" / "raw_transactions.csv"
    ))
    print("\n" + "=" * 60)
    print("  PIPELINE COMPLETE")
    print("=" * 60)
    print(f"  Raw transactions     : {raw_count:,}")
    print(f"  Cleaned transactions : {len(df_clean):,}")
    print(f"  Customers analysed   : {len(cust_features):,}")
    print(f"  RFM segments         : {rfm['segment'].nunique()}")
    print(f"  Cohorts tracked      : {len(cohort_sizes)}")
    print(f"  Insights generated   : {len(insights)}")
    print(f"\n  Outputs -> outputs/")
    print(f"  Database -> data/decisionlens.db\n")


if __name__ == "__main__":
    main()
