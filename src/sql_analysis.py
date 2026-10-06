"""
SQLite Storage and SQL-Based Analysis
======================================
Loads cleaned transaction data into an SQLite database and
executes key aggregation queries using pure SQL.
"""

import sqlite3
import pandas as pd
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
OUTPUT_DIR = Path(__file__).resolve().parent.parent / "outputs"
DB_PATH = DATA_DIR / "decisionlens.db"

# ── SQL Queries ──────────────────────────────────────────────
QUERIES = {
    "total_revenue": """
        SELECT
            ROUND(SUM(revenue), 2)          AS total_revenue,
            COUNT(DISTINCT order_id)        AS total_orders,
            COUNT(DISTINCT customer_id)     AS total_customers
        FROM transactions;
    """,

    "revenue_by_category": """
        SELECT
            product_category,
            ROUND(SUM(revenue), 2)          AS category_revenue,
            COUNT(DISTINCT order_id)        AS category_orders,
            COUNT(DISTINCT customer_id)     AS category_customers,
            ROUND(AVG(revenue), 2)          AS avg_order_revenue
        FROM transactions
        GROUP BY product_category
        ORDER BY category_revenue DESC;
    """,

    "top_customers_by_revenue": """
        SELECT
            customer_id,
            COUNT(DISTINCT order_id)        AS total_orders,
            ROUND(SUM(revenue), 2)          AS total_revenue,
            ROUND(AVG(revenue), 2)          AS avg_order_value,
            MIN(order_date)                 AS first_order,
            MAX(order_date)                 AS last_order
        FROM transactions
        GROUP BY customer_id
        ORDER BY total_revenue DESC
        LIMIT 20;
    """,

    "average_order_value": """
        SELECT ROUND(AVG(order_rev), 2) AS overall_aov
        FROM (
            SELECT order_id, SUM(revenue) AS order_rev
            FROM transactions
            GROUP BY order_id
        );
    """,

    "monthly_revenue": """
        SELECT
            strftime('%%Y-%%m', order_date) AS month,
            ROUND(SUM(revenue), 2)          AS monthly_revenue,
            COUNT(DISTINCT order_id)        AS monthly_orders,
            COUNT(DISTINCT customer_id)     AS active_customers
        FROM transactions
        GROUP BY strftime('%%Y-%%m', order_date)
        ORDER BY month;
    """,

    "discount_analysis": """
        SELECT
            CASE
                WHEN discount = 0            THEN 'No Discount'
                WHEN discount <= 0.10        THEN 'Low (1-10%%)'
                WHEN discount <= 0.20        THEN 'Medium (11-20%%)'
                ELSE                              'High (>20%%)'
            END                              AS discount_band,
            COUNT(*)                         AS order_count,
            ROUND(SUM(revenue), 2)           AS total_revenue,
            ROUND(AVG(revenue), 2)           AS avg_revenue
        FROM transactions
        GROUP BY discount_band
        ORDER BY total_revenue DESC;
    """,
}


def create_database(df):
    """Create SQLite DB, load data, and add indexes."""
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(DB_PATH))
    df.to_sql("transactions", conn, if_exists="replace", index=False)

    cur = conn.cursor()
    cur.execute("CREATE INDEX IF NOT EXISTS idx_cust    ON transactions(customer_id);")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_odate   ON transactions(order_date);")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_cat     ON transactions(product_category);")
    conn.commit()
    return conn


def run_sql_queries(conn):
    """Execute all defined queries and return {name: DataFrame}."""
    results = {}
    for name, sql in QUERIES.items():
        results[name] = pd.read_sql_query(sql, conn)
    return results


def run_sql_analysis(df=None):
    """Full SQL analysis pipeline."""
    print("=" * 60)
    print("SQLITE STORAGE & SQL ANALYSIS")
    print("=" * 60)

    if df is None:
        df = pd.read_csv(DATA_DIR / "cleaned_transactions.csv")

    conn = create_database(df)
    print(f"\nDatabase created -> {DB_PATH}")

    results = run_sql_queries(conn)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    for name, rdf in results.items():
        print(f"\n--- {name.replace('_', ' ').title()} ---")
        print(rdf.to_string(index=False))
        rdf.to_csv(OUTPUT_DIR / f"sql_{name}.csv", index=False)

    conn.close()
    return results


if __name__ == "__main__":
    run_sql_analysis()
