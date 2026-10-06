"""Tests for revenue calculation logic."""
import pytest
import pandas as pd
import numpy as np
from pathlib import Path


def test_revenue_formula_basic():
    """revenue = quantity × unit_price × (1 - discount)."""
    assert round(3 * 100 * (1 - 0.10), 2) == 270.0


def test_revenue_zero_discount():
    """No discount → revenue = quantity × unit_price."""
    assert round(2 * 50 * (1 - 0.0), 2) == 100.0


def test_revenue_full_discount():
    """100% discount → revenue = 0."""
    assert round(5 * 200 * (1 - 1.0), 2) == 0.0


def test_revenue_never_negative():
    """With valid inputs, revenue must be ≥ 0."""
    for qty in [1, 5, 10]:
        for price in [25, 100, 200]:
            for disc in [0.0, 0.1, 0.5, 1.0]:
                assert qty * price * (1 - disc) >= 0


def test_revenue_column_in_cleaned_data():
    """If cleaned CSV exists, verify revenue column is consistent."""
    path = Path(__file__).resolve().parent.parent / "data" / "cleaned_transactions.csv"
    if not path.exists():
        pytest.skip("Cleaned data not yet generated")

    df = pd.read_csv(path)
    assert "revenue" in df.columns
    assert (df["revenue"] >= 0).all()
    expected = (df["quantity"] * df["unit_price"] * (1 - df["discount"])).round(2)
    pd.testing.assert_series_equal(df["revenue"], expected, check_names=False)
