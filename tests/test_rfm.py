"""Tests for RFM scoring and segment assignment."""
import pytest
import pandas as pd
import numpy as np
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from src.rfm import calculate_rfm_scores, assign_segments

VALID_SEGMENTS = {
    "High Value", "Loyal", "At Risk", "Growing", "Occasional", "Low Engagement",
}


def _sample_features(n=100):
    rng = np.random.RandomState(99)
    return pd.DataFrame({
        "customer_id":  [f"C{i:04d}" for i in range(n)],
        "recency":      rng.randint(1, 365, n),
        "frequency":    rng.randint(1, 30, n),
        "monetary_value": np.round(rng.uniform(100, 50000, n), 2),
    })


def test_scores_in_range():
    rfm = calculate_rfm_scores(_sample_features())
    for col in ("r_score", "f_score", "m_score"):
        assert rfm[col].between(1, 5).all(), f"{col} out of [1,5]"


def test_composite_range():
    rfm = calculate_rfm_scores(_sample_features())
    assert rfm["rfm_score"].between(3, 15).all()


def test_every_customer_gets_segment():
    rfm = assign_segments(calculate_rfm_scores(_sample_features()))
    assert rfm["segment"].notna().all()


def test_segment_names_valid():
    rfm = assign_segments(calculate_rfm_scores(_sample_features()))
    assert set(rfm["segment"].unique()).issubset(VALID_SEGMENTS)


def test_high_value_criteria():
    rfm = assign_segments(calculate_rfm_scores(_sample_features()))
    hv = rfm[rfm["segment"] == "High Value"]
    if len(hv):
        assert (hv["r_score"] >= 4).all()
        assert (hv["f_score"] >= 4).all()
        assert (hv["m_score"] >= 4).all()
