"""Tests for customer feature aggregation."""
import pytest
import pandas as pd
import numpy as np
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from src.customer_analysis import build_customer_features


def _sample_txns():
    """Small transaction set with known aggregation outcomes."""
    return pd.DataFrame({
        "customer_id":     ["C001", "C001", "C001", "C002", "C002"],
        "order_id":        ["O001", "O002", "O003", "O004", "O005"],
        "order_date":      ["2024-01-10", "2024-03-15", "2024-06-20",
                            "2024-02-01", "2024-05-01"],
        "product_id":      ["P01", "P02", "P01", "P03", "P01"],
        "product_category":["Beverages", "Snacks", "Beverages",
                            "Dairy", "Beverages"],
        "quantity":        [2, 1, 3, 4, 2],
        "unit_price":      [50, 30, 50, 60, 50],
        "discount":        [0.0, 0.1, 0.0, 0.05, 0.0],
        "revenue":         [100.0, 27.0, 150.0, 228.0, 100.0],
    })


def test_one_row_per_customer():
    features = build_customer_features(_sample_txns())
    assert len(features) == 2


def test_frequency():
    features = build_customer_features(_sample_txns())
    c001 = features[features["customer_id"] == "C001"].iloc[0]
    assert c001["frequency"] == 3


def test_monetary():
    features = build_customer_features(_sample_txns())
    c001 = features[features["customer_id"] == "C001"].iloc[0]
    assert c001["monetary_value"] == 277.0


def test_category_count():
    features = build_customer_features(_sample_txns())
    c001 = features[features["customer_id"] == "C001"].iloc[0]
    assert c001["category_count"] == 2  # Beverages, Snacks


def test_recency():
    features = build_customer_features(_sample_txns())
    c001 = features[features["customer_id"] == "C001"].iloc[0]
    expected = (pd.Timestamp("2024-12-31") - pd.Timestamp("2024-06-20")).days
    assert c001["recency"] == expected


def test_average_order_value():
    features = build_customer_features(_sample_txns())
    c001 = features[features["customer_id"] == "C001"].iloc[0]
    assert c001["average_order_value"] == round(277.0 / 3, 2)
