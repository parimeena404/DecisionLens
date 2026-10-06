"""
Synthetic FMCG Transaction Data Generator
==========================================
Generates a realistic but synthetic dataset for customer analytics
demonstration. Dataset is fully reproducible via fixed random seed.

Customer Archetypes:
    - premium_loyalist  (5%)  : High-frequency, high-spend, low discount
    - steady_regular    (15%) : Consistent mid-range buyers
    - emerging_buyer    (10%) : Joined recently, building purchase habit
    - sporadic_shopper  (30%) : Infrequent, small basket size
    - bargain_seeker    (15%) : Discount-driven, moderate frequency
    - fading_patron     (15%) : Active early, gone quiet recently
    - minimal_engager   (10%) : Very few purchases overall

WARNING: This dataset is synthetic and is used to demonstrate the
analytical workflow. Results are not real market estimates.
"""

import numpy as np
import pandas as pd
from pathlib import Path

# ── Configuration ────────────────────────────────────────────
SEED = 42
ANALYSIS_START = "2023-01-01"
ANALYSIS_END = "2024-12-31"
NUM_CUSTOMERS = 5000
OUTPUT_DIR = Path(__file__).resolve().parent.parent / "data"

# ── Product Catalog (19 products, 5 categories) ─────────────
PRODUCT_CATALOG = {
    "PRD001": {"name": "Cola 500ml",            "category": "Beverages",      "unit_price": 40},
    "PRD002": {"name": "Orange Juice 1L",       "category": "Beverages",      "unit_price": 90},
    "PRD003": {"name": "Green Tea Pack",        "category": "Beverages",      "unit_price": 150},
    "PRD004": {"name": "Energy Drink 250ml",    "category": "Beverages",      "unit_price": 75},
    "PRD005": {"name": "Potato Chips 150g",     "category": "Snacks",         "unit_price": 30},
    "PRD006": {"name": "Chocolate Bar",         "category": "Snacks",         "unit_price": 50},
    "PRD007": {"name": "Biscuit Pack",          "category": "Snacks",         "unit_price": 25},
    "PRD008": {"name": "Namkeen Mix",           "category": "Snacks",         "unit_price": 45},
    "PRD009": {"name": "Shampoo 200ml",         "category": "Personal Care",  "unit_price": 180},
    "PRD010": {"name": "Soap Bar 3Pack",        "category": "Personal Care",  "unit_price": 95},
    "PRD011": {"name": "Toothpaste 100g",       "category": "Personal Care",  "unit_price": 70},
    "PRD012": {"name": "Face Wash 100ml",       "category": "Personal Care",  "unit_price": 120},
    "PRD013": {"name": "Dish Soap 500ml",       "category": "Household",      "unit_price": 55},
    "PRD014": {"name": "Floor Cleaner 1L",      "category": "Household",      "unit_price": 110},
    "PRD015": {"name": "Laundry Detergent 1kg", "category": "Household",      "unit_price": 200},
    "PRD016": {"name": "Milk 1L",               "category": "Dairy",          "unit_price": 60},
    "PRD017": {"name": "Yogurt 400g",           "category": "Dairy",          "unit_price": 45},
    "PRD018": {"name": "Cheese Slice Pack",     "category": "Dairy",          "unit_price": 130},
    "PRD019": {"name": "Butter 200g",           "category": "Dairy",          "unit_price": 85},
}

# ── Customer Archetypes ──────────────────────────────────────
ARCHETYPES = {
    "premium_loyalist": {
        "proportion": 0.05,
        "orders_range": (15, 40),
        "discount_range": (0.0, 0.05),
        "qty_range": (1, 5),
        "active_start": "2023-01-01",
        "active_end": "2024-12-31",
    },
    "steady_regular": {
        "proportion": 0.15,
        "orders_range": (8, 20),
        "discount_range": (0.0, 0.10),
        "qty_range": (1, 4),
        "active_start": "2023-01-01",
        "active_end": "2024-12-31",
    },
    "emerging_buyer": {
        "proportion": 0.10,
        "orders_range": (3, 10),
        "discount_range": (0.0, 0.12),
        "qty_range": (1, 3),
        "active_start": "2024-01-01",
        "active_end": "2024-12-31",
    },
    "sporadic_shopper": {
        "proportion": 0.30,
        "orders_range": (2, 6),
        "discount_range": (0.0, 0.08),
        "qty_range": (1, 3),
        "active_start": "2023-01-01",
        "active_end": "2024-12-31",
    },
    "bargain_seeker": {
        "proportion": 0.15,
        "orders_range": (5, 15),
        "discount_range": (0.10, 0.30),
        "qty_range": (2, 6),
        "active_start": "2023-01-01",
        "active_end": "2024-12-31",
    },
    "fading_patron": {
        "proportion": 0.15,
        "orders_range": (4, 12),
        "discount_range": (0.0, 0.10),
        "qty_range": (1, 4),
        "active_start": "2023-01-01",
        "active_end": "2024-06-30",
    },
    "minimal_engager": {
        "proportion": 0.10,
        "orders_range": (1, 3),
        "discount_range": (0.0, 0.05),
        "qty_range": (1, 2),
        "active_start": "2023-01-01",
        "active_end": "2024-12-31",
    },
}


def assign_archetypes(num_customers, rng):
    """Assign a behavior archetype to each customer."""
    archetypes = []
    for archetype, config in ARCHETYPES.items():
        count = int(num_customers * config["proportion"])
        archetypes.extend([archetype] * count)

    # fill remainder with the largest group
    remaining = num_customers - len(archetypes)
    archetypes.extend(["sporadic_shopper"] * remaining)

    rng.shuffle(archetypes)
    return archetypes


def _build_product_weights(archetype):
    """Build per-product sampling weights based on archetype preference."""
    product_ids = list(PRODUCT_CATALOG.keys())
    if archetype == "premium_loyalist":
        weights = np.array([
            3.0 if PRODUCT_CATALOG[pid]["unit_price"] > 100 else 1.0
            for pid in product_ids
        ])
    elif archetype == "bargain_seeker":
        weights = np.array([
            3.0 if PRODUCT_CATALOG[pid]["unit_price"] < 60 else 1.0
            for pid in product_ids
        ])
    else:
        weights = np.ones(len(product_ids))
    return product_ids, weights / weights.sum()


def generate_orders_for_customer(customer_id, archetype, order_counter, rng):
    """Generate all transaction records for one customer.

    Parameters
    ----------
    customer_id : str
    archetype   : str
    order_counter : list
        Mutable single-element list used as a global order counter.
    rng         : numpy Generator
    """
    config = ARCHETYPES[archetype]

    num_orders = int(rng.integers(
        config["orders_range"][0],
        config["orders_range"][1] + 1,
    ))

    start_ts = pd.Timestamp(config["active_start"])
    end_ts = pd.Timestamp(config["active_end"])
    span_days = max((end_ts - start_ts).days, 1)

    # random order dates within the active window
    day_offsets = sorted(rng.integers(0, span_days + 1, size=num_orders))
    order_dates = [start_ts + pd.Timedelta(days=int(d)) for d in day_offsets]

    product_ids, weights = _build_product_weights(archetype)

    records = []
    for odate in order_dates:
        order_counter[0] += 1
        pid = rng.choice(product_ids, p=weights)
        product = PRODUCT_CATALOG[pid]

        qty = int(rng.integers(config["qty_range"][0], config["qty_range"][1] + 1))
        disc = round(float(rng.uniform(config["discount_range"][0],
                                       config["discount_range"][1])), 2)
        rev = round(qty * product["unit_price"] * (1 - disc), 2)

        records.append({
            "customer_id": customer_id,
            "order_id": f"ORD{order_counter[0]:06d}",
            "order_date": odate.strftime("%Y-%m-%d"),
            "product_id": pid,
            "product_category": product["category"],
            "quantity": qty,
            "unit_price": product["unit_price"],
            "discount": disc,
            "revenue": rev,
        })

    return records


# ── Quality-Issue Injection ──────────────────────────────────

_CATEGORY_VARIANTS = {
    "Beverages":      ["beverages", "BEVERAGES", "Beverage"],
    "Snacks":         ["snacks", "SNACKS", "Snack"],
    "Personal Care":  ["personal care", "PersonalCare", "PERSONAL CARE"],
    "Household":      ["household", "HOUSEHOLD", "Home Care"],
    "Dairy":          ["dairy", "DAIRY", "Dairy Products"],
}


def inject_quality_issues(df, rng):
    """Inject controlled data-quality problems for demonstration.

    Returns
    -------
    df_dirty : DataFrame
    issues_log : list[str]
    """
    df = df.copy()
    n = len(df)
    issues_log = []

    # 1. Duplicate rows (~100)
    dup_idx = rng.choice(n, size=100, replace=False)
    df = pd.concat([df, df.iloc[dup_idx].copy()], ignore_index=True)
    issues_log.append("Injected 100 duplicate rows")

    # 2. Missing values (~300 total across 4 columns)
    for col, count in [("product_category", 80), ("quantity", 70),
                       ("discount", 80), ("order_date", 70)]:
        idx = rng.choice(len(df), size=count, replace=False)
        df.loc[idx, col] = np.nan
    issues_log.append("Injected ~300 missing values across 4 columns")

    # 3. Inconsistent category labels (~50)
    valid_mask = df["product_category"].notna()
    valid_idx = df.index[valid_mask].to_numpy()
    chosen = rng.choice(valid_idx, size=50, replace=False)
    for idx in chosen:
        orig = df.at[idx, "product_category"]
        if orig in _CATEGORY_VARIANTS:
            df.at[idx, "product_category"] = rng.choice(
                _CATEGORY_VARIANTS[orig]
            )
    issues_log.append("Injected 50 inconsistent category labels")

    # 4. Invalid discount values (~30)
    disc_idx = rng.choice(len(df), size=30, replace=False)
    for idx in disc_idx:
        df.at[idx, "discount"] = round(float(rng.choice([
            rng.uniform(-0.5, -0.01),
            rng.uniform(1.1, 2.5),
        ])), 2)
    issues_log.append("Injected 30 invalid discount values (negative or >100%)")

    # 5. Suspicious quantities (~20)
    sus_idx = rng.choice(len(df), size=20, replace=False)
    for idx in sus_idx:
        df.at[idx, "quantity"] = float(rng.integers(200, 999))
    issues_log.append("Injected 20 suspicious quantities (200-999)")

    # shuffle to spread issues
    df = df.sample(frac=1, random_state=SEED).reset_index(drop=True)
    return df, issues_log


# ── Main Entry Point ─────────────────────────────────────────

def generate_dataset():
    """Generate the full synthetic FMCG transaction dataset."""
    rng = np.random.default_rng(SEED)

    print("=" * 60)
    print("SYNTHETIC FMCG DATA GENERATION")
    print("=" * 60)

    archetypes = assign_archetypes(NUM_CUSTOMERS, rng)

    order_counter = [0]  # mutable counter
    all_records = []
    for i in range(NUM_CUSTOMERS):
        cid = f"CUST{i + 1:05d}"
        recs = generate_orders_for_customer(cid, archetypes[i], order_counter, rng)
        all_records.extend(recs)

    df = pd.DataFrame(all_records)

    print(f"\nClean dataset generated:")
    print(f"  Rows            : {len(df):,}")
    print(f"  Unique customers: {df['customer_id'].nunique():,}")
    print(f"  Unique orders   : {df['order_id'].nunique():,}")
    print(f"  Unique products : {df['product_id'].nunique()}")
    print(f"  Categories      : {df['product_category'].nunique()}")
    print(f"  Date range      : {df['order_date'].min()} -> {df['order_date'].max()}")

    # inject quality issues
    df_dirty, issues_log = inject_quality_issues(df, rng)

    print(f"\nAfter injecting data-quality issues:")
    print(f"  Dataset shape: {df_dirty.shape}")
    for note in issues_log:
        print(f"  * {note}")

    # save
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    out_path = OUTPUT_DIR / "raw_transactions.csv"
    df_dirty.to_csv(out_path, index=False)
    print(f"\nSaved raw dataset -> {out_path}")

    return df_dirty


if __name__ == "__main__":
    generate_dataset()
