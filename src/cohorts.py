"""
Monthly Cohort Retention Analysis
===================================
Groups customers by first-purchase month (cohort), then tracks
how many return in each subsequent month.

Definitions:
    cohort_month        – calendar month of a customer's first order
    months_since_first  – offset from the cohort month (0 = acquisition)
    retained_customers  – distinct customers who transacted that month
    retention_pct       – retained / cohort_size × 100
"""

import pandas as pd
import numpy as np
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
OUTPUT_DIR = Path(__file__).resolve().parent.parent / "outputs"


def build_cohort_data(df):
    """Tag each transaction with its customer's cohort month and offset."""
    df = df.copy()
    df["order_date"] = pd.to_datetime(df["order_date"])
    df["order_month"] = df["order_date"].dt.to_period("M")

    # first purchase month per customer
    first_purchase = (
        df.groupby("customer_id")["order_month"]
        .min()
        .reset_index()
        .rename(columns={"order_month": "cohort_month"})
    )

    df = df.merge(first_purchase, on="customer_id", how="left")
    df["months_since_first"] = (
        df["order_month"].astype(int) - df["cohort_month"].astype(int)
    )
    return df, first_purchase


def calculate_retention(df):
    """Compute retention counts and percentages per cohort × offset."""
    cohort_counts = (
        df.groupby(["cohort_month", "months_since_first"])["customer_id"]
        .nunique()
        .reset_index()
        .rename(columns={"customer_id": "retained_customers"})
    )

    # cohort size = customers at month 0
    sizes = (
        cohort_counts[cohort_counts["months_since_first"] == 0]
        [["cohort_month", "retained_customers"]]
        .rename(columns={"retained_customers": "cohort_size"})
    )

    cohort_counts = cohort_counts.merge(sizes, on="cohort_month", how="left")
    cohort_counts["retention_pct"] = (
        cohort_counts["retained_customers"] / cohort_counts["cohort_size"] * 100
    ).round(2)

    return cohort_counts, sizes


def create_retention_matrix(cohort_counts):
    """Pivot into a cohort × month_offset retention matrix."""
    return cohort_counts.pivot_table(
        index="cohort_month",
        columns="months_since_first",
        values="retention_pct",
    )


def run_cohort_analysis(df=None):
    """Execute the full cohort retention pipeline."""
    print("=" * 60)
    print("MONTHLY COHORT RETENTION ANALYSIS")
    print("=" * 60)

    if df is None:
        df = pd.read_csv(DATA_DIR / "cleaned_transactions.csv")

    df_cohort, first_purchase = build_cohort_data(df)
    cohort_data, cohort_sizes = calculate_retention(df_cohort)
    retention_matrix = create_retention_matrix(cohort_data)

    print(f"\nTotal cohorts: {len(cohort_sizes)}")
    print(f"\n--- Cohort Sizes (first 12) ---")
    print(cohort_sizes.head(12).to_string(index=False))

    display_cols = [c for c in retention_matrix.columns if c <= 12]
    print(f"\n--- Retention Matrix (%, months 0-12) ---")
    print(retention_matrix[display_cols].round(1).to_string())

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    cohort_data.to_csv(OUTPUT_DIR / "cohort_retention_data.csv", index=False)
    retention_matrix.to_csv(OUTPUT_DIR / "cohort_retention_matrix.csv")
    cohort_sizes.to_csv(OUTPUT_DIR / "cohort_sizes.csv", index=False)
    print(f"\nSaved cohort outputs -> {OUTPUT_DIR}")

    return cohort_data, retention_matrix, cohort_sizes


if __name__ == "__main__":
    run_cohort_analysis()
