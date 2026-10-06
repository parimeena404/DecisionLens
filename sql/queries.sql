-- =============================================================
-- DecisionLens: SQL Query Reference
-- =============================================================
-- These queries run against the 'transactions' table in SQLite.
-- Table schema: customer_id, order_id, order_date, product_id,
--               product_category, quantity, unit_price, discount,
--               revenue
-- =============================================================

-- 1. Overall Business Metrics
SELECT 
    ROUND(SUM(revenue), 2) AS total_revenue,
    COUNT(DISTINCT order_id) AS total_orders,
    COUNT(DISTINCT customer_id) AS total_customers
FROM transactions;


-- 2. Revenue by Product Category
SELECT 
    product_category,
    ROUND(SUM(revenue), 2) AS category_revenue,
    COUNT(DISTINCT order_id) AS category_orders,
    COUNT(DISTINCT customer_id) AS category_customers,
    ROUND(AVG(revenue), 2) AS avg_order_revenue
FROM transactions
GROUP BY product_category
ORDER BY category_revenue DESC;


-- 3. Top 20 Customers by Revenue
SELECT 
    customer_id,
    COUNT(DISTINCT order_id) AS total_orders,
    ROUND(SUM(revenue), 2) AS total_revenue,
    ROUND(AVG(revenue), 2) AS avg_order_value,
    MIN(order_date) AS first_order,
    MAX(order_date) AS last_order
FROM transactions
GROUP BY customer_id
ORDER BY total_revenue DESC
LIMIT 20;


-- 4. Average Order Value
SELECT 
    ROUND(AVG(order_revenue), 2) AS overall_aov
FROM (
    SELECT 
        order_id,
        SUM(revenue) AS order_revenue
    FROM transactions
    GROUP BY order_id
);


-- 5. Monthly Revenue Trend
SELECT 
    strftime('%Y-%m', order_date) AS month,
    ROUND(SUM(revenue), 2) AS monthly_revenue,
    COUNT(DISTINCT order_id) AS monthly_orders,
    COUNT(DISTINCT customer_id) AS active_customers
FROM transactions
GROUP BY strftime('%Y-%m', order_date)
ORDER BY month;


-- 6. Discount Band Analysis
SELECT 
    CASE 
        WHEN discount = 0 THEN 'No Discount'
        WHEN discount <= 0.10 THEN 'Low (1-10%)'
        WHEN discount <= 0.20 THEN 'Medium (11-20%)'
        ELSE 'High (>20%)'
    END AS discount_band,
    COUNT(*) AS order_count,
    ROUND(SUM(revenue), 2) AS total_revenue,
    ROUND(AVG(revenue), 2) AS avg_revenue
FROM transactions
GROUP BY discount_band
ORDER BY total_revenue DESC;
