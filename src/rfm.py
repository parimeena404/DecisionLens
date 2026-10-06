"""
RFM Analysis and Customer Segmentation
========================================
Calculates Recency-Frequency-Monetary scores using quintile-based
scoring and assigns interpretable customer segments with documented
rules.

Scoring (quintile, 1-5 scale):
    R score – lower recency  → higher score (5 = most recent)
    F score – higher frequency → higher score (5 = most frequent)
    M score – higher monetary → higher score (5 = highest spender)

Segment Assignment (applied in priority order):
    1. High Value     : R ≥ 4  AND  F ≥ 4  AND  M ≥ 4
    2. Loyal          : F ≥ 4  AND  M ≥ 3
    3. At Risk        : R ≤ 2  AND  (F ≥ 3 OR M ≥ 3)
    4. Growing        : R ≥ 4  AND  F ∈ {2, 3}
    5. Occasional     : F ∈ {2, 3}
    6. Low Engagement : all remaining
"""

import pandas as pd
import numpy as np
from pathlib import Path

OUTPUT_DIR = Path(__file__).resolve().parent.parent / "outputs"


def calculate_rfm_scores(customer_features):
    """Compute quintile-based R, F, M scores."""
    rfm = customer_features[
        ["customer_id", "recency", "frequency", "monetary_value"]
    ].copy()

    # R: lower recency → higher score
    rfm["r_score"] = pd.qcut(
        rfm["recency"], q=5, labels=[5, 4, 3, 2, 1], duplicates="drop"
    ).astype(int)

    # F: higher frequency → higher score
    rfm["f_score"] = pd.qcut(
        rfm["frequency"].rank(method="first"),
        q=5, labels=[1, 2, 3, 4, 5], duplicates="drop",
    ).astype(int)

    # M: higher monetary → higher score
    rfm["m_score"] = pd.qcut(
        rfm["monetary_value"].rank(method="first"),
        q=5, labels=[1, 2, 3, 4, 5], duplicates="drop",
    ).astype(int)

    rfm["rfm_score"] = rfm["r_score"] + rfm["f_score"] + rfm["m_score"]
    return rfm


def assign_segments(rfm):
    """Assign segments using priority-ordered rule set."""
    conditions = [
        (rfm["r_score"] >= 4) & (rfm["f_score"] >= 4) & (rfm["m_score"] >= 4),
        (rfm["f_score"] >= 4) & (rfm["m_score"] >= 3),
        (rfm["r_score"] <= 2) & ((rfm["f_score"] >= 3) | (rfm["m_score"] >= 3)),
        (rfm["r_score"] >= 4) & (rfm["f_score"].isin([2, 3])),
        rfm["f_score"].isin([2, 3]),
    ]
    labels = ["High Value", "Loyal", "At Risk", "Growing", "Occasional"]

    rfm["segment"] = np.select(conditions, labels, default="Low Engagement")
    return rfm


def generate_segment_summary(rfm, customer_features):
    """Aggregate key metrics by segment."""
    merged = rfm.merge(
        customer_features[[
            "customer_id", "average_order_value", "discount_usage",
            "category_count", "avg_days_between_orders",
        ]],
        on="customer_id", how="left",
    )

    summary = merged.groupby("segment").agg(
        customer_count=("customer_id", "count"),
        avg_recency=("recency", "mean"),
        avg_frequency=("frequency", "mean"),
        avg_monetary=("monetary_value", "mean"),
        total_revenue=("monetary_value", "sum"),
        avg_aov=("average_order_value", "mean"),
        avg_discount_usage=("discount_usage", "mean"),
        avg_categories=("category_count", "mean"),
    ).round(2)

    total_rev = summary["total_revenue"].sum()
    summary["revenue_share_pct"] = (summary["total_revenue"] / total_rev * 100).round(2)
    summary["customer_share_pct"] = (
        summary["customer_count"] / summary["customer_count"].sum() * 100
    ).round(2)

    return summary.reset_index()


def run_rfm_analysis(customer_features=None):
    """Execute full RFM pipeline."""
    print("=" * 60)
    print("RFM ANALYSIS & SEGMENTATION")
    print("=" * 60)

    if customer_features is None:
        customer_features = pd.read_csv(OUTPUT_DIR / "customer_features.csv")

    rfm = calculate_rfm_scores(customer_features)
    rfm = assign_segments(rfm)

    print(f"\nRFM table: {rfm.shape}")
    print("\n--- Segment Distribution ---")
    for seg, cnt in rfm["segment"].value_counts().items():
        pct = round(cnt / len(rfm) * 100, 1)
        print(f"  {seg:20s}: {cnt:5,d} customers ({pct}%)")

    summary = generate_segment_summary(rfm, customer_features)
    print("\n--- Segment Summary ---")
    print(summary.to_string(index=False))

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    rfm.to_csv(OUTPUT_DIR / "rfm_scores.csv", index=False)
    summary.to_csv(OUTPUT_DIR / "rfm_segment_summary.csv", index=False)
    print(f"\nSaved RFM outputs -> {OUTPUT_DIR}")

    return rfm, summary


if __name__ == "__main__":
    run_rfm_analysis()
