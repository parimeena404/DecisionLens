"""Tests for temporal churn prediction (data leakage prevention)."""
import pytest
import pandas as pd
import numpy as np
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from src.churn_prediction import (
    build_churn_features,
    build_churn_target,
    PREDICTION_CUTOFF,
    FEATURE_COLUMNS,
)


@pytest.fixture
def sample_transactions():
    """Minimal transaction dataset spanning observation and future windows."""
    np.random.seed(99)
    rows = []
    # Customer A: orders in both windows
    for i, d in enumerate(["2024-06-01", "2024-07-15", "2024-09-10"]):
        rows.append({
            "customer_id": "A", "order_id": f"A-{i}",
            "order_date": d, "quantity": 2, "unit_price": 100.0,
            "discount": 0.1, "revenue": 180.0,
            "product_category": "Snacks", "product_id": "P1",
        })
    # Customer B: orders ONLY in observation window
    for i, d in enumerate(["2024-03-01", "2024-05-20"]):
        rows.append({
            "customer_id": "B", "order_id": f"B-{i}",
            "order_date": d, "quantity": 1, "unit_price": 50.0,
            "discount": 0.0, "revenue": 50.0,
            "product_category": "Beverages", "product_id": "P2",
        })
    # Customer C: orders ONLY in future window
    rows.append({
        "customer_id": "C", "order_id": "C-0",
        "order_date": "2024-10-15", "quantity": 3, "unit_price": 200.0,
        "discount": 0.05, "revenue": 570.0,
        "product_category": "Dairy", "product_id": "P3",
    })
    return pd.DataFrame(rows)


class TestTemporalLeakage:
    """Verify that future data NEVER enters the feature matrix."""

    def test_features_use_only_pre_cutoff_data(self, sample_transactions):
        """Features must be computed from observation window only."""
        features = build_churn_features(sample_transactions)
        # Customer A should appear (has pre-cutoff orders)
        assert "A" in features["customer_id"].values
        # Customer B should appear (all orders are pre-cutoff)
        assert "B" in features["customer_id"].values
        # Customer C should NOT appear (only has future orders)
        assert "C" not in features["customer_id"].values

    def test_customer_a_recency_ignores_future_order(self, sample_transactions):
        """Customer A's recency must be relative to cutoff, using only
        their pre-cutoff last order (2024-07-15), not the future one."""
        features = build_churn_features(sample_transactions)
        a = features[features["customer_id"] == "A"].iloc[0]
        # Last pre-cutoff order: 2024-07-15
        # Cutoff: 2024-08-31
        expected_recency = (PREDICTION_CUTOFF - pd.Timestamp("2024-07-15")).days
        assert a["recency"] == expected_recency, (
            f"Recency should be {expected_recency} days, got {a['recency']}. "
            f"This may indicate future data leakage."
        )

    def test_customer_a_frequency_excludes_future(self, sample_transactions):
        """Customer A's frequency must count only pre-cutoff orders (2)."""
        features = build_churn_features(sample_transactions)
        a = features[features["customer_id"] == "A"].iloc[0]
        assert a["frequency"] == 2, (
            f"Frequency should be 2 (pre-cutoff only), got {a['frequency']}. "
            f"Future order may have leaked into features."
        )

    def test_customer_a_revenue_excludes_future(self, sample_transactions):
        """Customer A's monetary_value must exclude the Sep 10 order."""
        features = build_churn_features(sample_transactions)
        a = features[features["customer_id"] == "A"].iloc[0]
        expected_revenue = 180.0 * 2  # two pre-cutoff orders
        assert a["monetary_value"] == expected_revenue, (
            f"Revenue should be {expected_revenue}, got {a['monetary_value']}."
        )

    def test_target_labels_are_correct(self, sample_transactions):
        """Verify future_inactive labels:
        A -> purchased in future -> inactive=0
        B -> did NOT purchase in future -> inactive=1
        C -> no pre-cutoff orders -> should not appear
        """
        target = build_churn_target(sample_transactions)
        a = target[target["customer_id"] == "A"].iloc[0]
        b = target[target["customer_id"] == "B"].iloc[0]
        assert a["future_inactive"] == 0, "A purchased in future, should be active"
        assert b["future_inactive"] == 1, "B did not purchase in future, should be inactive"
        # C has no pre-cutoff orders, so should not be in the target
        assert "C" not in target["customer_id"].values

    def test_cutoff_date_stored_in_features(self, sample_transactions):
        """The observation cutoff used should be stored for audit."""
        features = build_churn_features(sample_transactions)
        assert "_obs_cutoff" in features.columns
        assert (features["_obs_cutoff"] == PREDICTION_CUTOFF).all()

    def test_no_feature_column_contains_future_info(self, sample_transactions):
        """None of the model feature columns should reference dates
        beyond the cutoff."""
        features = build_churn_features(sample_transactions)
        # Check that no date-like column in features exceeds cutoff
        for col in features.columns:
            if features[col].dtype == "datetime64[ns]":
                max_date = features[col].max()
                assert max_date <= PREDICTION_CUTOFF, (
                    f"Column '{col}' has date {max_date} beyond cutoff "
                    f"{PREDICTION_CUTOFF}. Possible data leakage!"
                )

    def test_feature_columns_match_expected_set(self, sample_transactions):
        """Verify the model uses the documented feature columns."""
        features = build_churn_features(sample_transactions)
        for col in FEATURE_COLUMNS:
            assert col in features.columns, f"Missing feature column: {col}"


class TestTargetConstruction:
    """Test the target variable construction."""

    def test_target_is_binary(self, sample_transactions):
        target = build_churn_target(sample_transactions)
        assert set(target["future_inactive"].unique()).issubset({0, 1})
        assert set(target["future_purchase"].unique()).issubset({0, 1})

    def test_target_complements_sum_to_one(self, sample_transactions):
        target = build_churn_target(sample_transactions)
        sums = target["future_purchase"] + target["future_inactive"]
        assert (sums == 1).all()

    def test_all_pre_cutoff_customers_get_label(self, sample_transactions):
        """Every customer with pre-cutoff data must get a target label."""
        df = sample_transactions.copy()
        df["order_date"] = pd.to_datetime(df["order_date"])
        pre_custs = set(df[df["order_date"] <= PREDICTION_CUTOFF]["customer_id"])
        target = build_churn_target(sample_transactions)
        target_custs = set(target["customer_id"])
        assert pre_custs == target_custs
