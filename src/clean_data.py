"""
Data Quality Assessment and Cleaning
=====================================
Assesses raw transaction data for quality issues, produces a
human-readable quality report, and outputs a cleaned dataset.

Quality checks performed:
    1. Missing values (per column)
    2. Exact duplicate rows
    3. Invalid discount values  (< 0 or > 1.0)
    4. Suspicious quantities    (> 100 per order line)
    5. Inconsistent category labels

Cleaning steps:
    1. Remove exact duplicates
    2. Drop rows missing critical fields (customer_id, order_id, order_date)
    3. Normalize category labels to canonical names
    4. Impute missing categories from product_id lookup
    5. Remove rows with invalid / suspicious quantities
    6. Clamp discounts to [0.0, 1.0]; fill missing with 0.0
    7. Recalculate revenue after cleaning
"""

import pandas as pd
import numpy as np
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
OUTPUT_DIR = Path(__file__).resolve().parent.parent / "outputs"

# ── Canonical categories ─────────────────────────────────────
VALID_CATEGORIES = {"Beverages", "Snacks", "Personal Care", "Household", "Dairy"}

CATEGORY_NORMALIZE = {
    "beverages": "Beverages",  "BEVERAGES": "Beverages",  "Beverage": "Beverages",
    "snacks": "Snacks",        "SNACKS": "Snacks",        "Snack": "Snacks",
    "personal care": "Personal Care", "PersonalCare": "Personal Care",
    "PERSONAL CARE": "Personal Care",
    "household": "Household",  "HOUSEHOLD": "Household",  "Home Care": "Household",
    "dairy": "Dairy",          "DAIRY": "Dairy",          "Dairy Products": "Dairy",
}


# ── Quality Assessment ───────────────────────────────────────

def assess_quality(df):
    """Return a DataFrame summarising every detected quality issue."""
    rows = []

    # 1. Missing values
    for col in df.columns:
        n_miss = int(df[col].isna().sum())
        if n_miss > 0:
            treatment = (
                f"Drop rows with missing '{col}'"
                if col in ("customer_id", "order_id", "order_date")
                else "Impute from product_id lookup or fill with default"
            )
            rows.append({
                "issue": f"Missing values in '{col}'",
                "count": n_miss,
                "treatment": treatment,
            })

    # 2. Duplicates
    n_dup = int(df.duplicated().sum())
    if n_dup > 0:
        rows.append({
            "issue": "Duplicate rows",
            "count": n_dup,
            "treatment": "Remove exact duplicates, keep first occurrence",
        })

    # 3. Invalid discounts
    if "discount" in df.columns:
        disc = pd.to_numeric(df["discount"], errors="coerce")
        n_neg = int((disc < 0).sum())
        n_over = int((disc > 1.0).sum())
        total_bad = n_neg + n_over
        if total_bad > 0:
            rows.append({
                "issue": "Invalid discount values (negative or >100%)",
                "count": total_bad,
                "treatment": "Clamp to valid range [0.0, 1.0]",
            })

    # 4. Suspicious quantities
    if "quantity" in df.columns:
        qty = pd.to_numeric(df["quantity"], errors="coerce")
        n_sus = int((qty > 100).sum())
        if n_sus > 0:
            rows.append({
                "issue": "Suspicious quantities (>100 units per line)",
                "count": n_sus,
                "treatment": "Remove orders with quantity > 100",
            })
        n_nonpos = int((qty <= 0).sum())
        if n_nonpos > 0:
            rows.append({
                "issue": "Non-positive quantities",
                "count": n_nonpos,
                "treatment": "Remove rows with quantity ≤ 0",
            })

    # 5. Inconsistent category labels
    if "product_category" in df.columns:
        unique_cats = df["product_category"].dropna().unique()
        bad_labels = [c for c in unique_cats if c not in VALID_CATEGORIES]
        if bad_labels:
            n_incon = int(df["product_category"].isin(bad_labels).sum())
            rows.append({
                "issue": f"Inconsistent category labels: {bad_labels}",
                "count": n_incon,
                "treatment": "Normalize to canonical category names",
            })

    return pd.DataFrame(rows)


# ── Cleaning Pipeline ────────────────────────────────────────

def clean_data(df):
    """Clean raw transactions and return (cleaned_df, step_log)."""
    out = df.copy()
    log = []
    initial = len(out)

    # 1 – duplicates
    before = len(out)
    out = out.drop_duplicates()
    log.append(f"Removed {before - len(out)} duplicate rows")

    # 2 – missing critical fields
    before = len(out)
    out = out.dropna(subset=["customer_id", "order_id", "order_date"])
    log.append(f"Removed {before - len(out)} rows with missing critical fields")

    # 3 – normalize categories
    out["product_category"] = out["product_category"].map(
        lambda x: CATEGORY_NORMALIZE.get(x, x) if pd.notna(x) else x
    )

    # 4 – impute missing categories from product_id
    known_map = (
        out[out["product_category"].isin(VALID_CATEGORIES)]
        .groupby("product_id")["product_category"]
        .first()
        .to_dict()
    )
    bad_cat = out["product_category"].isna() | ~out["product_category"].isin(VALID_CATEGORIES)
    out.loc[bad_cat, "product_category"] = out.loc[bad_cat, "product_id"].map(known_map)
    still_missing = int(out["product_category"].isna().sum())
    log.append(f"Normalized categories; {still_missing} unresolvable after imputation")

    # 5 – quantities
    out["quantity"] = pd.to_numeric(out["quantity"], errors="coerce")
    before = len(out)
    out = out[(out["quantity"].notna()) & (out["quantity"] > 0) & (out["quantity"] <= 100)]
    log.append(f"Removed {before - len(out)} rows with invalid / suspicious quantities")

    # 6 – discounts
    out["discount"] = pd.to_numeric(out["discount"], errors="coerce").fillna(0.0)
    out["discount"] = out["discount"].clip(0.0, 1.0)
    log.append("Filled missing discounts with 0.0; clamped to [0.0, 1.0]")

    # 7 – recalculate revenue
    out["revenue"] = (out["quantity"] * out["unit_price"] * (1 - out["discount"])).round(2)
    log.append("Recalculated revenue after cleaning")

    # dtypes
    out["order_date"] = pd.to_datetime(out["order_date"])
    out["quantity"] = out["quantity"].astype(int)

    # drop any remaining null categories
    before = len(out)
    out = out.dropna(subset=["product_category"])
    if before - len(out) > 0:
        log.append(f"Removed {before - len(out)} rows with unresolvable categories")

    out = out.reset_index(drop=True)
    log.append(f"Final: {len(out):,} rows (removed {initial - len(out):,} total)")
    return out, log


# ── Runner ───────────────────────────────────────────────────

def run_cleaning():
    """Execute the full quality-assessment and cleaning pipeline."""
    print("=" * 60)
    print("DATA QUALITY ASSESSMENT & CLEANING")
    print("=" * 60)

    raw_path = DATA_DIR / "raw_transactions.csv"
    df_raw = pd.read_csv(raw_path)
    print(f"\nLoaded raw data: {df_raw.shape}")

    # assess
    report = assess_quality(df_raw)
    print("\n--- Data Quality Report ---")
    print(report.to_string(index=False))

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    report.to_csv(OUTPUT_DIR / "data_quality_report.csv", index=False)
    print(f"\nSaved quality report -> {OUTPUT_DIR / 'data_quality_report.csv'}")

    # clean
    df_clean, steps = clean_data(df_raw)
    print("\n--- Cleaning Steps ---")
    for s in steps:
        print(f"  [OK] {s}")

    cleaned_path = DATA_DIR / "cleaned_transactions.csv"
    df_clean.to_csv(cleaned_path, index=False)
    print(f"\nSaved cleaned data -> {cleaned_path}")
    print(f"Cleaned shape: {df_clean.shape}")

    return df_clean, report


if __name__ == "__main__":
    run_cleaning()
