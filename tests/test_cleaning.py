"""Tests for data cleaning logic."""
import pytest
import pandas as pd
import numpy as np
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from src.clean_data import assess_quality, clean_data


def _dirty_data():
    return pd.DataFrame({
        "customer_id":     ["C1", "C1", "C2", "C3", "C3", "C3", None],
        "order_id":        ["O1", "O1", "O2", "O3", "O4", "O4", "O5"],
        "order_date":      ["2024-01-01"] * 7,
        "product_id":      ["P1", "P1", "P2", "P3", "P1", "P1", "P2"],
        "product_category":["Beverages", "Beverages", "snacks",
                            "Dairy", "Beverages", "Beverages", "Snacks"],
        "quantity":        [2, 2, 3, 500, 1, 1, 2],
        "unit_price":      [50, 50, 30, 60, 50, 50, 30],
        "discount":        [0.1, 0.1, -0.2, 0.0, 1.5, 1.5, 0.0],
        "revenue":         [90, 90, 36, 30000, -25, -25, 60],
    })


def test_detects_duplicates():
    report = assess_quality(_dirty_data())
    assert report["issue"].str.contains("Duplicate", case=False).any()


def test_detects_invalid_discounts():
    report = assess_quality(_dirty_data())
    assert report["issue"].str.contains("discount", case=False).any()


def test_removes_duplicates():
    cleaned, _ = clean_data(_dirty_data())
    assert cleaned.duplicated().sum() == 0


def test_normalizes_categories():
    cleaned, _ = clean_data(_dirty_data())
    valid = {"Beverages", "Snacks", "Personal Care", "Household", "Dairy"}
    assert set(cleaned["product_category"].unique()).issubset(valid)


def test_clamps_discounts():
    cleaned, _ = clean_data(_dirty_data())
    assert (cleaned["discount"] >= 0).all()
    assert (cleaned["discount"] <= 1).all()


def test_removes_suspicious_quantities():
    cleaned, _ = clean_data(_dirty_data())
    assert (cleaned["quantity"] <= 100).all()


def test_drops_null_customer():
    cleaned, _ = clean_data(_dirty_data())
    assert cleaned["customer_id"].notna().all()
