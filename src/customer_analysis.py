"""
Customer-Level Feature Engineering
===================================
Builds a single row-per-customer analytical table with
behavioural metrics derived from cleaned transaction data.

Analysis cutoff date: 2024-12-31

Features computed:
    recency                 – days since last purchase (from cutoff)
    frequency               – unique order count
    monetary_value           – total lifetime revenue
    total_orders            – same as frequency
    total_quantity          – sum of all quantities
    average_order_value      – monetary_value / frequency
    discount_usage          – fraction of orders with discount > 0
    category_count          – distinct product categories purchased
    product_count           – distinct products purchased
    avg_days_between_orders – mean gap between consecutive orders
    tenure_days             – span from first to last order
"""

import pandas as pd
import numpy as np
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
OUTPUT_DIR = Path(__file__).resolve().parent.parent / "outputs"

CUTOFF_DATE = pd.Timestamp("2024-12-31")


def build_customer_features(df):
    """Build the customer-level feature table."""
    df = df.copy()
    df["order_date"] = pd.to_datetime(df["order_date"])

    # ── Core aggregation ─────────────────────────────────────
    agg = df.groupby("customer_id").agg(
        first_order=("order_date", "min"),
        last_order=("order_date", "max"),
        total_orders=("order_id", "nunique"),
        total_quantity=("quantity", "sum"),
        total_revenue=("revenue", "sum"),
        avg_discount=("discount", "mean"),
        discount_order_count=("discount", lambda s: int((s > 0).sum())),
        category_count=("product_category", "nunique"),
        product_count=("product_id", "nunique"),
    ).reset_index()

    # ── Derived metrics ──────────────────────────────────────
    agg["recency"] = (CUTOFF_DATE - agg["last_order"]).dt.days
    agg["frequency"] = agg["total_orders"]
    agg["monetary_value"] = agg["total_revenue"].round(2)
    agg["average_order_value"] = (agg["total_revenue"] / agg["total_orders"]).round(2)
    agg["discount_usage"] = (agg["discount_order_count"] / agg["total_orders"]).round(4)
    agg["tenure_days"] = (agg["last_order"] - agg["first_order"]).dt.days

    # ── Average days between orders ──────────────────────────
    def _avg_gap(group):
        dates = np.sort(group["order_date"].unique())
        if len(dates) < 2:
            return np.nan
        deltas = np.diff(dates).astype("timedelta64[D]").astype(float)
        return round(float(deltas.mean()), 1)

    gaps = df.groupby("customer_id").apply(_avg_gap, include_groups=False).reset_index()
    gaps.columns = ["customer_id", "avg_days_between_orders"]
    agg = agg.merge(gaps, on="customer_id", how="left")

    # ── Select & order columns ───────────────────────────────
    cols = [
        "customer_id", "recency", "frequency", "monetary_value",
        "total_orders", "total_quantity", "average_order_value",
        "discount_usage", "category_count", "product_count",
        "avg_days_between_orders", "tenure_days",
        "first_order", "last_order",
    ]
    return agg[cols]


def run_customer_analysis(df=None):
    """Execute the customer feature engineering pipeline."""
    print("=" * 60)
    print("CUSTOMER FEATURE ENGINEERING")
    print("=" * 60)
    print(f"Analysis cutoff date: {CUTOFF_DATE.date()}")

    if df is None:
        df = pd.read_csv(DATA_DIR / "cleaned_transactions.csv")

    features = build_customer_features(df)

    print(f"\nCustomer table shape: {features.shape}")
    print(f"\n--- Summary Statistics ---")
    print(features.describe().round(2).to_string())

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    out = OUTPUT_DIR / "customer_features.csv"
    features.to_csv(out, index=False)
    print(f"\nSaved -> {out}")

    return features


if __name__ == "__main__":
    run_customer_analysis()
