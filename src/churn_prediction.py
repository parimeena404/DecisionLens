"""
Temporal Churn Prediction
==========================
Predicts which customers are likely to become inactive using a
strict temporal split that prevents future data leakage.

TEMPORAL DESIGN
---------------
    Observation window : dataset start  -->  PREDICTION_CUTOFF
    Future window      : PREDICTION_CUTOFF + 1 day  -->  dataset end

    Features are computed ONLY from the observation window.
    Target is computed ONLY from the future window.

    future_purchase = 1 if customer has >= 1 order in future window
    future_inactive = 1 - future_purchase  (this is the churn label)

MODEL
-----
    Logistic Regression (interpretable, no black-box).
    Standardised features via StandardScaler.
    Stratified 80/20 train-test split to preserve class balance.

IMPORTANT
---------
    This module does NOT claim any causal relationships.
    All feature-outcome associations are observational.
    The synthetic dataset is used for methodology demonstration only.
"""

import pandas as pd
import numpy as np
from pathlib import Path
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import (
    roc_auc_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report,
)
import json

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
OUTPUT_DIR = Path(__file__).resolve().parent.parent / "outputs"

# ── Temporal boundaries ──────────────────────────────────────
# Observation: all transactions on or before this date
# Future:      all transactions strictly after this date
PREDICTION_CUTOFF = pd.Timestamp("2024-08-31")


# ── Feature engineering (observation window only) ────────────

def build_churn_features(df, cutoff=PREDICTION_CUTOFF):
    """Build customer features using ONLY pre-cutoff transactions.

    Parameters
    ----------
    df : pd.DataFrame
        Cleaned transaction data with columns: customer_id, order_id,
        order_date, quantity, unit_price, discount, revenue,
        product_category, product_id.
    cutoff : pd.Timestamp
        The prediction cutoff date.  Features use data <= cutoff.

    Returns
    -------
    pd.DataFrame
        One row per customer with behavioural features.
    """
    df = df.copy()
    df["order_date"] = pd.to_datetime(df["order_date"])

    # STRICT temporal filter — only observation-window data
    obs = df[df["order_date"] <= cutoff].copy()

    if obs.empty:
        raise ValueError("No transactions found in the observation window.")

    agg = obs.groupby("customer_id").agg(
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

    # Recency relative to cutoff (not to future data)
    agg["recency"] = (cutoff - agg["last_order"]).dt.days
    agg["frequency"] = agg["total_orders"]
    agg["monetary_value"] = agg["total_revenue"].round(2)
    agg["average_order_value"] = (
        agg["total_revenue"] / agg["total_orders"]
    ).round(2)
    agg["discount_usage"] = (
        agg["discount_order_count"] / agg["total_orders"]
    ).round(4)
    agg["tenure_days"] = (agg["last_order"] - agg["first_order"]).dt.days

    # Average days between consecutive orders
    def _avg_gap(group):
        dates = np.sort(group["order_date"].unique())
        if len(dates) < 2:
            return np.nan
        deltas = np.diff(dates).astype("timedelta64[D]").astype(float)
        return round(float(deltas.mean()), 1)

    gaps = (
        obs.groupby("customer_id")
        .apply(_avg_gap, include_groups=False)
        .reset_index()
    )
    gaps.columns = ["customer_id", "avg_days_between_orders"]
    agg = agg.merge(gaps, on="customer_id", how="left")

    # Store cutoff used (for audit)
    agg["_obs_cutoff"] = cutoff

    feature_cols = [
        "customer_id", "recency", "frequency", "monetary_value",
        "total_orders", "total_quantity", "average_order_value",
        "discount_usage", "category_count", "product_count",
        "avg_days_between_orders", "tenure_days", "_obs_cutoff",
    ]
    return agg[feature_cols]


# ── Target variable (future window only) ─────────────────────

def build_churn_target(df, cutoff=PREDICTION_CUTOFF):
    """Label each pre-cutoff customer as active/inactive in the future.

    Parameters
    ----------
    df : pd.DataFrame
        Full cleaned transaction data.
    cutoff : pd.Timestamp
        Same cutoff used for features.

    Returns
    -------
    pd.DataFrame
        Columns: customer_id, future_purchase, future_inactive.
    """
    df = df.copy()
    df["order_date"] = pd.to_datetime(df["order_date"])

    # Customers who existed in the observation window
    obs_customers = set(df[df["order_date"] <= cutoff]["customer_id"].unique())

    # Customers who purchased in the future window
    future = df[df["order_date"] > cutoff]
    future_customers = set(future["customer_id"].unique())

    rows = []
    for cid in obs_customers:
        purchased = 1 if cid in future_customers else 0
        rows.append({
            "customer_id": cid,
            "future_purchase": purchased,
            "future_inactive": 1 - purchased,
        })

    return pd.DataFrame(rows)


# ── Model training ───────────────────────────────────────────

FEATURE_COLUMNS = [
    "recency", "frequency", "monetary_value", "total_orders",
    "average_order_value", "discount_usage", "category_count",
    "product_count", "avg_days_between_orders", "tenure_days",
]


def train_churn_model(features_df, target_df):
    """Train a Logistic Regression churn model.

    Returns
    -------
    dict with keys:
        model, scaler, metrics, feature_importance, X_test, y_test,
        y_pred, y_prob, scored_customers
    """
    merged = features_df.merge(target_df, on="customer_id")

    # Fill NaN in avg_days_between_orders (single-order customers)
    merged["avg_days_between_orders"] = merged[
        "avg_days_between_orders"
    ].fillna(merged["avg_days_between_orders"].median())

    X = merged[FEATURE_COLUMNS].copy()
    y = merged["future_inactive"].values
    cids = merged["customer_id"].values

    # Stratified split
    X_train, X_test, y_train, y_test, cid_train, cid_test = train_test_split(
        X, y, cids, test_size=0.20, random_state=42, stratify=y,
    )

    # Scale features
    scaler = StandardScaler()
    X_train_sc = scaler.fit_transform(X_train)
    X_test_sc = scaler.transform(X_test)

    # Logistic Regression
    model = LogisticRegression(
        max_iter=1000,
        random_state=42,
        class_weight="balanced",
        solver="lbfgs",
    )
    model.fit(X_train_sc, y_train)

    # Predictions
    y_pred = model.predict(X_test_sc)
    y_prob = model.predict_proba(X_test_sc)[:, 1]

    # Metrics
    metrics = {
        "roc_auc": round(roc_auc_score(y_test, y_prob), 4),
        "precision": round(precision_score(y_test, y_pred), 4),
        "recall": round(recall_score(y_test, y_pred), 4),
        "f1": round(f1_score(y_test, y_pred), 4),
        "confusion_matrix": confusion_matrix(y_test, y_pred).tolist(),
        "test_size": len(y_test),
        "train_size": len(y_train),
        "churn_rate_train": round(y_train.mean(), 4),
        "churn_rate_test": round(y_test.mean(), 4),
    }

    # Feature importance (coefficients from logistic regression)
    coefs = model.coef_[0]
    importance = pd.DataFrame({
        "feature": FEATURE_COLUMNS,
        "coefficient": coefs.round(4),
        "abs_coefficient": np.abs(coefs).round(4),
        "direction": ["higher -> more likely inactive" if c > 0
                       else "higher -> less likely inactive"
                       for c in coefs],
    }).sort_values("abs_coefficient", ascending=False).reset_index(drop=True)

    # Score ALL customers (not just test set)
    X_all = merged[FEATURE_COLUMNS].copy()
    X_all_sc = scaler.transform(X_all)
    all_prob = model.predict_proba(X_all_sc)[:, 1]

    scored = merged[["customer_id", "future_inactive"]].copy()
    scored["churn_probability"] = all_prob.round(4)
    scored["risk_tier"] = pd.cut(
        scored["churn_probability"],
        bins=[0.0, 0.35, 0.65, 1.0],
        labels=["Low", "Medium", "High"],
        include_lowest=True,
    )

    return {
        "model": model,
        "scaler": scaler,
        "metrics": metrics,
        "feature_importance": importance,
        "X_test": X_test,
        "y_test": y_test,
        "y_pred": y_pred,
        "y_prob": y_prob,
        "scored_customers": scored,
        "cid_test": cid_test,
    }


# ── Pipeline runner ──────────────────────────────────────────

def run_churn_prediction(df=None):
    """Execute the full temporal churn prediction pipeline."""
    print("\n" + "=" * 60)
    print("PART 2: TEMPORAL CHURN PREDICTION")
    print("=" * 60)

    if df is None:
        df = pd.read_csv(DATA_DIR / "cleaned_transactions.csv")
    df["order_date"] = pd.to_datetime(df["order_date"])

    print(f"\nTemporal Design:")
    print(f"  Dataset range       : {df['order_date'].min().date()} to "
          f"{df['order_date'].max().date()}")
    print(f"  Observation cutoff  : {PREDICTION_CUTOFF.date()}")
    print(f"  Future window start : {(PREDICTION_CUTOFF + pd.Timedelta(days=1)).date()}")
    print(f"  Future window end   : {df['order_date'].max().date()}")

    # 1. Build features (observation window only)
    print("\n--- Building features (pre-cutoff only) ---")
    features = build_churn_features(df, PREDICTION_CUTOFF)
    print(f"  Customers with pre-cutoff data: {len(features):,}")

    # 2. Build target (future window only)
    print("\n--- Building target (post-cutoff only) ---")
    target = build_churn_target(df, PREDICTION_CUTOFF)
    active = (target["future_purchase"] == 1).sum()
    inactive = (target["future_inactive"] == 1).sum()
    print(f"  Active in future   : {active:,} ({active/len(target)*100:.1f}%)")
    print(f"  Inactive (churned) : {inactive:,} ({inactive/len(target)*100:.1f}%)")

    # 3. Train model
    print("\n--- Training Logistic Regression ---")
    results = train_churn_model(features, target)
    m = results["metrics"]

    print(f"\n  Model Evaluation (test set, n={m['test_size']}):")
    print(f"    ROC-AUC   : {m['roc_auc']}")
    print(f"    Precision : {m['precision']}")
    print(f"    Recall    : {m['recall']}")
    print(f"    F1 Score  : {m['f1']}")
    cm = m["confusion_matrix"]
    print(f"\n  Confusion Matrix:")
    print(f"    Predicted:    Active  Inactive")
    print(f"    Actual Active  [{cm[0][0]:5d}   {cm[0][1]:5d}]")
    print(f"    Actual Inactive[{cm[1][0]:5d}   {cm[1][1]:5d}]")

    # 4. Feature importance
    imp = results["feature_importance"]
    print(f"\n--- Feature Importance (by |coefficient|) ---")
    for _, row in imp.iterrows():
        print(f"  {row['feature']:28s}  coef={row['coefficient']:+.4f}  "
              f"({row['direction']})")

    # 5. Risk distribution
    scored = results["scored_customers"]
    print(f"\n--- Customer Risk Distribution ---")
    for tier in ["Low", "Medium", "High"]:
        cnt = (scored["risk_tier"] == tier).sum()
        pct = cnt / len(scored) * 100
        print(f"  {tier:8s}: {cnt:5,d} customers ({pct:.1f}%)")

    # 6. Save outputs
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    scored.to_csv(OUTPUT_DIR / "churn_risk_scores.csv", index=False)
    imp.to_csv(OUTPUT_DIR / "churn_feature_importance.csv", index=False)
    features.to_csv(OUTPUT_DIR / "churn_features_pre_cutoff.csv", index=False)

    with open(OUTPUT_DIR / "churn_model_metrics.json", "w") as f:
        json.dump(m, f, indent=2)

    print(f"\n  Saved churn outputs -> {OUTPUT_DIR}")

    return results, features, target


if __name__ == "__main__":
    run_churn_prediction()
