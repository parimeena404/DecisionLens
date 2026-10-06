"""Tests for cohort retention analysis."""
import pytest
import pandas as pd
import numpy as np
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from src.cohorts import build_cohort_data, calculate_retention


def _sample_txns():
    return pd.DataFrame({
        "customer_id":     ["A", "A", "A", "B", "B", "C"],
        "order_id":        ["O1", "O2", "O3", "O4", "O5", "O6"],
        "order_date":      ["2024-01-15", "2024-02-10", "2024-03-05",
                            "2024-01-20", "2024-03-15", "2024-02-10"],
        "product_id":      ["P1"] * 6,
        "product_category":["Snacks"] * 6,
        "quantity":        [1] * 6,
        "unit_price":      [50] * 6,
        "discount":        [0.0] * 6,
        "revenue":         [50.0] * 6,
    })


def test_cohort_assignment():
    _, fp = build_cohort_data(_sample_txns())
    a = fp[fp["customer_id"] == "A"]["cohort_month"].iloc[0]
    c = fp[fp["customer_id"] == "C"]["cohort_month"].iloc[0]
    assert str(a) == "2024-01"
    assert str(c) == "2024-02"


def test_month_zero_is_100_pct():
    df_c, _ = build_cohort_data(_sample_txns())
    cd, _ = calculate_retention(df_c)
    m0 = cd[cd["months_since_first"] == 0]
    assert (m0["retention_pct"] == 100.0).all()


def test_retention_capped_at_100():
    df_c, _ = build_cohort_data(_sample_txns())
    cd, _ = calculate_retention(df_c)
    assert (cd["retention_pct"] <= 100.0).all()


def test_required_columns():
    df_c, _ = build_cohort_data(_sample_txns())
    cd, _ = calculate_retention(df_c)
    for col in ("cohort_month", "months_since_first",
                "retained_customers", "retention_pct"):
        assert col in cd.columns
