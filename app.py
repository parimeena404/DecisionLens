"""
DecisionLens: Customer Decision Intelligence & Evidence Platform
Streamlit Frontend Application

Provides 4 core analytical sections:
1. Overview: Executive KPIs, segment breakdown, and key business insights.
2. Customer Intelligence: RFM distribution, revenue concentration, and filterable customer table.
3. Retention & Churn: Cohort retention heatmap, churn risk scores, model metrics, and feature importance.
4. Insight Investigation: Evidence table explorer with deep-dive cards separating prediction, explanation, and causation.
"""

from pathlib import Path
import json
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import streamlit as st

# -----------------------------------------------------------------------------
# Configuration & Theme
# -----------------------------------------------------------------------------
st.set_page_config(
    page_title="DecisionLens — Customer Decision Intelligence",
    page_icon="🔍",
    layout="wide",
    initial_sidebar_state="expanded",
)

# Custom Styling for polished, clean appearance
st.markdown(
    """
    <style>
    .main-header {
        font-size: 2.1rem;
        font-weight: 700;
        color: #1E293B;
        margin-bottom: 0.2rem;
    }
    .sub-header {
        font-size: 1.05rem;
        color: #64748B;
        margin-bottom: 1.2rem;
    }
    .metric-card {
        background-color: #F8FAFC;
        border: 1px solid #E2E8F0;
        border-radius: 8px;
        padding: 1rem;
        text-align: center;
    }
    .badge-strong {
        background-color: #DCFCE7;
        color: #166534;
        padding: 3px 8px;
        border-radius: 4px;
        font-weight: 600;
        font-size: 0.85rem;
    }
    .badge-moderate {
        background-color: #FEF3C7;
        color: #92400E;
        padding: 3px 8px;
        border-radius: 4px;
        font-weight: 600;
        font-size: 0.85rem;
    }
    .badge-preliminary {
        background-color: #E0E7FF;
        color: #3730A3;
        padding: 3px 8px;
        border-radius: 4px;
        font-weight: 600;
        font-size: 0.85rem;
    }
    .disclaimer-banner {
        background-color: #F1F5F9;
        border-left: 4px solid #3B82F6;
        padding: 0.6rem 1rem;
        margin-bottom: 1rem;
        font-size: 0.85rem;
        color: #334155;
    }
    </style>
    """,
    unsafe_allow_html=True,
)

# Base Path
BASE_DIR = Path(__file__).parent.resolve()
OUTPUTS_DIR = BASE_DIR / "outputs"


# -----------------------------------------------------------------------------
# Data Loaders (Cached for Performance)
# -----------------------------------------------------------------------------
@st.cache_data
def load_all_data():
    data = {}

    # 1. Overview metrics
    data["total_rev"] = pd.read_csv(OUTPUTS_DIR / "sql_total_revenue.csv")
    data["aov"] = pd.read_csv(OUTPUTS_DIR / "sql_average_order_value.csv")
    data["rfm_summary"] = pd.read_csv(OUTPUTS_DIR / "rfm_segment_summary.csv")

    # 2. Customer intelligence
    data["rfm_scores"] = pd.read_csv(OUTPUTS_DIR / "rfm_scores.csv")
    data["cust_features"] = pd.read_csv(OUTPUTS_DIR / "customer_features.csv")
    data["churn_scores"] = pd.read_csv(OUTPUTS_DIR / "churn_risk_scores.csv")

    # Merge customer-level master table
    merged = data["cust_features"].merge(
        data["rfm_scores"][["customer_id", "segment", "r_score", "f_score", "m_score", "rfm_score"]],
        on="customer_id",
        how="left",
    )
    merged = merged.merge(
        data["churn_scores"][["customer_id", "churn_probability", "risk_tier"]],
        on="customer_id",
        how="left",
    )
    # Default risk tier for customers without churn scores if any
    merged["risk_tier"] = merged["risk_tier"].fillna("N/A")
    merged["churn_probability"] = merged["churn_probability"].fillna(0.0)
    data["customer_master"] = merged

    # 3. Retention & Churn
    data["cohort_matrix"] = pd.read_csv(OUTPUTS_DIR / "cohort_retention_matrix.csv")
    data["feat_imp"] = pd.read_csv(OUTPUTS_DIR / "churn_feature_importance.csv")

    with open(OUTPUTS_DIR / "churn_model_metrics.json", "r", encoding="utf-8") as f:
        data["churn_metrics"] = json.load(f)

    # 4. Evidence table
    data["evidence_table"] = pd.read_csv(OUTPUTS_DIR / "evidence_table.csv")

    return data


try:
    DATA = load_all_data()
except Exception as e:
    st.error(f"Error loading project outputs from '{OUTPUTS_DIR}': {e}")
    st.stop()


# -----------------------------------------------------------------------------
# Sidebar Navigation & Global Controls
# -----------------------------------------------------------------------------
st.sidebar.title("DecisionLens")
st.sidebar.caption("Evidence-Based Decision Platform")

nav_section = st.sidebar.radio(
    "Navigation",
    options=[
        "1. Overview",
        "2. Customer Intelligence",
        "3. Retention & Churn",
        "4. Insight Investigation",
    ],
    index=0,
)

st.sidebar.markdown("---")
st.sidebar.markdown(
    """
    **Project Info:**
    - **Cutoff Date:** `2024-09-30`
    - **Target Period:** Q4 2024
    - **Data Type:** Synthetic FMCG
    - **Stack:** Python · Streamlit · Plotly
    """
)


# -----------------------------------------------------------------------------
# Section 1: Overview
# -----------------------------------------------------------------------------
if nav_section == "1. Overview":
    st.markdown('<div class="main-header">Executive Overview</div>', unsafe_allow_html=True)
    st.markdown(
        '<div class="sub-header">High-level customer base health, financial performance, and primary business observations.</div>',
        unsafe_allow_html=True,
    )

    st.markdown(
        """
        <div class="disclaimer-banner">
            ⚠️ <b>Synthetic Data Notice:</b> All figures and patterns are generated programmatically for methodological demonstration.
            Observed relationships describe statistical associations, not verified real-world causal drivers.
        </div>
        """,
        unsafe_allow_html=True,
    )

    # KPI Summary Cards
    tot_rev = float(DATA["total_rev"]["total_revenue"].iloc[0])
    tot_orders = int(DATA["total_rev"]["total_orders"].iloc[0])
    tot_customers = int(DATA["total_rev"]["total_customers"].iloc[0])
    overall_aov = float(DATA["aov"]["overall_aov"].iloc[0])

    kpi1, kpi2, kpi3, kpi4 = st.columns(4)
    with kpi1:
        st.metric(label="Total Customers", value=f"{tot_customers:,}")
    with kpi2:
        st.metric(label="Total Net Revenue", value=f"₹{tot_rev:,.2f}")
    with kpi3:
        st.metric(label="Overall AOV", value=f"₹{overall_aov:.2f}")
    with kpi4:
        st.metric(label="Total Completed Orders", value=f"{tot_orders:,}")

    st.markdown("---")

    # Customer Segments Overview
    st.subheader("Customer Segments Breakdown")
    rfm_df = DATA["rfm_summary"].sort_values(by="total_revenue", ascending=False)

    col_chart, col_table = st.columns([1, 1])

    with col_chart:
        fig_segments = px.pie(
            rfm_df,
            values="customer_count",
            names="segment",
            title="Customer Base Share by RFM Segment",
            hole=0.45,
            color_discrete_sequence=px.colors.qualitative.Safe,
        )
        fig_segments.update_traces(textposition="inside", textinfo="percent+label")
        fig_segments.update_layout(showlegend=False, margin=dict(t=40, b=20, l=20, r=20))
        st.plotly_chart(fig_segments, use_container_width=True)

    with col_table:
        display_rfm = rfm_df[
            [
                "segment",
                "customer_count",
                "customer_share_pct",
                "revenue_share_pct",
                "avg_aov",
            ]
        ].copy()
        display_rfm.columns = [
            "Segment",
            "Customers",
            "Customer Share (%)",
            "Revenue Share (%)",
            "Avg AOV (₹)",
        ]
        st.dataframe(
            display_rfm.style.format(
                {
                    "Customers": "{:,}",
                    "Customer Share (%)": "{:.2f}%",
                    "Revenue Share (%)": "{:.2f}%",
                    "Avg AOV (₹)": "₹{:.2f}",
                }
            ),
            use_container_width=True,
            hide_index=True,
        )

    st.markdown("---")

    # 3 Important Business Insights
    st.subheader("3 Key Business Insights")
    st.caption("Evidence-grounded observations derived directly from data and modeling pipelines:")

    ins_col1, ins_col2, ins_col3 = st.columns(3)

    with ins_col1:
        st.markdown(
            """
            <div class="metric-card">
                <span class="badge-strong">Strong Evidence</span>
                <h4 style="margin-top: 0.6rem; margin-bottom: 0.4rem; color: #1E293B;">Revenue Concentration</h4>
                <p style="font-size: 0.9rem; color: #475569; text-align: left;">
                    The <b>High Value</b> segment represents <b>21.06%</b> of customers but delivers <b>50.55%</b> of cumulative net revenue (₹4.49M).
                </p>
                <div style="font-size: 0.8rem; color: #64748B; text-align: left; border-top: 1px solid #E2E8F0; padding-top: 0.4rem;">
                    <b>Risk:</b> High reliance on top quartile spenders requires continuous monitoring of high-value retention health.
                </div>
            </div>
            """,
            unsafe_allow_html=True,
        )

    with ins_col2:
        st.markdown(
            """
            <div class="metric-card">
                <span class="badge-moderate">Moderate Evidence</span>
                <h4 style="margin-top: 0.6rem; margin-bottom: 0.4rem; color: #1E293B;">Recency Signals Inactivity</h4>
                <p style="font-size: 0.9rem; color: #475569; text-align: left;">
                    Days since last purchase (<b>recency</b>) is the single strongest indicator of inactivity with a standardized logistic coefficient of <b>+0.5453</b>.
                </p>
                <div style="font-size: 0.8rem; color: #64748B; text-align: left; border-top: 1px solid #E2E8F0; padding-top: 0.4rem;">
                    <b>Action:</b> Deploy re-engagement nudges when recency crosses the 60–90 day threshold before dormancy hardens.
                </div>
            </div>
            """,
            unsafe_allow_html=True,
        )

    with ins_col3:
        st.markdown(
            """
            <div class="metric-card">
                <span class="badge-strong">Strong Evidence</span>
                <h4 style="margin-top: 0.6rem; margin-bottom: 0.4rem; color: #1E293B;">Cohort Retention Decay</h4>
                <p style="font-size: 0.9rem; color: #475569; text-align: left;">
                    Customer retention drops to an average of <b>26.2%</b> by Month 6 across all cohorts, with older cohorts (e.g. 2023-01 at 36.7%) retaining best.
                </p>
                <div style="font-size: 0.8rem; color: #64748B; text-align: left; border-top: 1px solid #E2E8F0; padding-top: 0.4rem;">
                    <b>Opportunity:</b> Strengthen onboarding during Months 1–3 where the steepest drop-off in activity occurs.
                </div>
            </div>
            """,
            unsafe_allow_html=True,
        )


# -----------------------------------------------------------------------------
# Section 2: Customer Intelligence
# -----------------------------------------------------------------------------
elif nav_section == "2. Customer Intelligence":
    st.markdown('<div class="main-header">Customer Intelligence</div>', unsafe_allow_html=True)
    st.markdown(
        '<div class="sub-header">RFM behavioral segmentation, financial contribution, and granular customer exploration.</div>',
        unsafe_allow_html=True,
    )

    rfm_summary = DATA["rfm_summary"]
    cust_df = DATA["customer_master"]

    # Visualizations: RFM Distribution & Revenue by Segment
    vcol1, vcol2 = st.columns(2)

    with vcol1:
        fig_rfm_dist = px.bar(
            rfm_summary.sort_values("customer_count", ascending=True),
            x="customer_count",
            y="segment",
            orientation="h",
            title="Customer Count by RFM Segment",
            labels={"customer_count": "Customers", "segment": "Segment"},
            text="customer_count",
            color="segment",
            color_discrete_sequence=px.colors.qualitative.Prism,
        )
        fig_rfm_dist.update_layout(showlegend=False, margin=dict(t=40, b=20, l=20, r=20))
        st.plotly_chart(fig_rfm_dist, use_container_width=True)

    with vcol2:
        fig_rev_seg = px.bar(
            rfm_summary.sort_values("total_revenue", ascending=True),
            x="total_revenue",
            y="segment",
            orientation="h",
            title="Total Revenue by RFM Segment (₹)",
            labels={"total_revenue": "Revenue (₹)", "segment": "Segment"},
            text=rfm_summary.sort_values("total_revenue", ascending=True)["total_revenue"].apply(lambda v: f"₹{v:,.0f}"),
            color="segment",
            color_discrete_sequence=px.colors.qualitative.Prism,
        )
        fig_rev_seg.update_layout(showlegend=False, margin=dict(t=40, b=20, l=20, r=20))
        st.plotly_chart(fig_rev_seg, use_container_width=True)

    st.markdown("---")

    # Customer-Level Table with Filters
    st.subheader("Customer Directory & Segment Explorer")
    st.caption("Filter and inspect individual customer behavioral scores and predicted risk tiers:")

    # Filter Controls
    fcol1, fcol2, fcol3, fcol4 = st.columns(4)

    with fcol1:
        segments_available = sorted(cust_df["segment"].dropna().unique().tolist())
        selected_segments = st.multiselect(
            "Filter by Segment",
            options=segments_available,
            default=segments_available,
        )

    with fcol2:
        tiers_available = sorted(cust_df["risk_tier"].dropna().unique().tolist())
        selected_tiers = st.multiselect(
            "Filter by Churn Risk Tier",
            options=tiers_available,
            default=tiers_available,
        )

    with fcol3:
        min_spend = float(cust_df["monetary_value"].min())
        max_spend = float(cust_df["monetary_value"].max())
        spend_range = st.slider(
            "Monetary Value Range (₹)",
            min_value=min_spend,
            max_value=max_spend,
            value=(min_spend, max_spend),
            step=100.0,
        )

    with fcol4:
        search_query = st.text_input("Search Customer ID", placeholder="e.g. CUST00005").strip()

    # Apply Filters
    filtered_df = cust_df[
        (cust_df["segment"].isin(selected_segments))
        & (cust_df["risk_tier"].isin(selected_tiers))
        & (cust_df["monetary_value"] >= spend_range[0])
        & (cust_df["monetary_value"] <= spend_range[1])
    ]

    if search_query:
        filtered_df = filtered_df[filtered_df["customer_id"].str.contains(search_query, case=False, na=False)]

    st.markdown(f"**Showing {len(filtered_df):,} matching customers** out of {len(cust_df):,} total.")

    # Table columns to show
    show_cols = [
        "customer_id",
        "segment",
        "risk_tier",
        "churn_probability",
        "monetary_value",
        "frequency",
        "recency",
        "average_order_value",
        "discount_usage",
        "category_count",
        "tenure_days",
    ]

    table_data = filtered_df[show_cols].copy()
    table_data.columns = [
        "Customer ID",
        "Segment",
        "Risk Tier",
        "Churn Prob",
        "Spend (₹)",
        "Frequency",
        "Recency (Days)",
        "AOV (₹)",
        "Discount Rate",
        "Categories",
        "Tenure (Days)",
    ]

    st.dataframe(
        table_data.head(500).style.format(
            {
                "Churn Prob": "{:.1%}",
                "Spend (₹)": "₹{:,.2f}",
                "AOV (₹)": "₹{:,.2f}",
                "Discount Rate": "{:.1%}",
            }
        ),
        use_container_width=True,
        hide_index=True,
    )

    if len(filtered_df) > 500:
        st.caption("Displaying top 500 matching records for browser responsiveness. Download CSV for complete dataset.")

    # CSV Download
    csv_bytes = filtered_df.to_csv(index=False).encode("utf-8")
    st.download_button(
        label="📥 Download Filtered Customer Data (CSV)",
        data=csv_bytes,
        file_name="filtered_customer_intelligence.csv",
        mime="text/csv",
    )


# -----------------------------------------------------------------------------
# Section 3: Retention & Churn
# -----------------------------------------------------------------------------
elif nav_section == "3. Retention & Churn":
    st.markdown('<div class="main-header">Retention & Churn Analytics</div>', unsafe_allow_html=True)
    st.markdown(
        '<div class="sub-header">Temporal cohort retention matrices, forward-looking churn classification, and feature attribution.</div>',
        unsafe_allow_html=True,
    )

    # 1. Cohort Retention Heatmap
    st.subheader("1. Monthly Cohort Retention Matrix")
    st.caption("Percentage of customer base actively making transactions at monthly intervals post-acquisition:")

    matrix_df = DATA["cohort_matrix"].copy()
    cohort_months = matrix_df["cohort_month"].tolist()
    month_cols = [c for c in matrix_df.columns if c != "cohort_month"]
    retention_values = matrix_df[month_cols].values

    fig_heatmap = go.Figure(
        data=go.Heatmap(
            z=retention_values,
            x=[f"M+{c}" for c in month_cols],
            y=cohort_months,
            colorscale="Blues",
            colorbar=dict(title="Retention %"),
            hovertemplate="Cohort: %{y}<br>Period: %{x}<br>Retention: %{z:.1f}%<extra></extra>",
        )
    )
    fig_heatmap.update_layout(
        title="Cohort Retention Heatmap (%)",
        xaxis_title="Months Since First Order",
        yaxis_title="Acquisition Cohort",
        yaxis=dict(autorange="reversed"),
        height=520,
        margin=dict(t=40, b=30, l=40, r=30),
    )
    st.plotly_chart(fig_heatmap, use_container_width=True)

    st.markdown("---")

    # 2. Churn Risk Distribution & Predictive Model Performance
    st.subheader("2. Future Inactivity Prediction (Cutoff: 2024-09-30)")
    st.caption("Strict zero-leakage temporal setup: historical features ($t \\le 2024\\text{-}09\\text{-}30$) predict activity in Q4 2024.")

    c1, c2 = st.columns([1, 1])

    # Churn Risk Distribution
    with c1:
        churn_df = DATA["churn_scores"]
        tier_counts = churn_df["risk_tier"].value_counts().reset_index()
        tier_counts.columns = ["risk_tier", "count"]

        fig_tier = px.pie(
            tier_counts,
            values="count",
            names="risk_tier",
            title="Customer Churn Risk Tier Distribution",
            color="risk_tier",
            color_discrete_map={
                "Low": "#10B981",
                "Medium": "#F59E0B",
                "High": "#EF4444",
            },
            hole=0.45,
        )
        fig_tier.update_traces(textposition="inside", textinfo="percent+label")
        fig_tier.update_layout(margin=dict(t=40, b=20, l=20, r=20))
        st.plotly_chart(fig_tier, use_container_width=True)

    # Churn Model Metrics & Confusion Matrix
    with c2:
        metrics = DATA["churn_metrics"]
        st.markdown("#### Model Evaluation Metrics (Test Set, N = 989)")

        mcol1, mcol2, mcol3, mcol4 = st.columns(4)
        with mcol1:
            st.metric("ROC-AUC", f"{metrics['roc_auc']:.3f}")
        with mcol2:
            st.metric("Recall", f"{metrics['recall']:.1%}")
        with mcol3:
            st.metric("Precision", f"{metrics['precision']:.1%}")
        with mcol4:
            st.metric("F1-Score", f"{metrics['f1']:.3f}")

        # Confusion Matrix Heatmap
        cm = metrics["confusion_matrix"]
        cm_labels = [["True Active (TN): " + str(cm[0][0]), "False Inactive (FP): " + str(cm[0][1])],
                     ["False Active (FN): " + str(cm[1][0]), "True Inactive (TP): " + str(cm[1][1])]]

        fig_cm = go.Figure(
            data=go.Heatmap(
                z=cm,
                x=["Pred Active (0)", "Pred Inactive (1)"],
                y=["Actual Active (0)", "Actual Inactive (1)"],
                text=cm_labels,
                texttemplate="%{text}",
                colorscale="Teal",
                showscale=False,
            )
        )
        fig_cm.update_layout(
            title="Confusion Matrix (Holdout Test Set)",
            height=280,
            margin=dict(t=40, b=30, l=30, r=30),
        )
        st.plotly_chart(fig_cm, use_container_width=True)

    st.markdown("---")

    # 3. Feature Importance & Direction
    st.subheader("3. Model Feature Importance & Statistical Direction")
    st.caption("Standardized Logistic Regression coefficients. Positive values increase inactivity probability; negative values decrease it.")

    feat_df = DATA["feat_imp"].sort_values(by="coefficient", ascending=True)

    # Bar chart of coefficients
    fig_feat = px.bar(
        feat_df,
        x="coefficient",
        y="feature",
        orientation="h",
        title="Logistic Regression Feature Coefficients",
        labels={"coefficient": "Standardized Coefficient", "feature": "Feature"},
        color="coefficient",
        color_continuous_scale="RdBu_r",
    )
    fig_feat.update_layout(height=400, margin=dict(t=40, b=30, l=40, r=30))
    st.plotly_chart(fig_feat, use_container_width=True)

    # Table with plain english explanations
    st.dataframe(
        DATA["feat_imp"][["feature", "coefficient", "direction"]].rename(
            columns={
                "feature": "Feature",
                "coefficient": "Standardized Coefficient",
                "direction": "Direction & Interpretation",
            }
        ),
        use_container_width=True,
        hide_index=True,
    )


# -----------------------------------------------------------------------------
# Section 4: Insight Investigation
# -----------------------------------------------------------------------------
elif nav_section == "4. Insight Investigation":
    st.markdown('<div class="main-header">Insight Investigation & Evidence Engine</div>', unsafe_allow_html=True)
    st.markdown(
        '<div class="sub-header">Structured evidence cards separating empirical prediction, observed explanation, and counterfactual causation.</div>',
        unsafe_allow_html=True,
    )

    ev_df = DATA["evidence_table"].copy()

    # Epistemic Boundary Notice
    with st.expander("ℹ️ About the DecisionLens Evidence Framework", expanded=False):
        st.markdown(
            """
            This platform strictly separates three epistemic levels:
            - **Prediction:** *"Who is statistically likely to become inactive?"* (Supervised classification evaluated by ROC-AUC and Recall).
            - **Explanation:** *"What historical behaviors correlate with that outcome?"* (Statistical regression coefficients and odds ratios).
            - **Causation:** *"What happens if we intervene?"* (**Cannot be claimed from observational data alone.** Requires randomized controlled experiments / A/B testing).
            """
        )

    # Full Evidence Table Display
    st.subheader("Evidence Table Overview")

    display_ev = ev_df[
        [
            "id",
            "business_question",
            "evidence_strength",
            "association_causal",
            "supporting_metric",
        ]
    ].copy()
    display_ev.columns = [
        "ID",
        "Business Question",
        "Evidence Strength",
        "Causal Classification",
        "Supporting Metric",
    ]

    st.dataframe(display_ev, use_container_width=True, hide_index=True)

    st.markdown("---")

    # Interactive Deep Dive
    st.subheader("Interactive Insight Deep-Dive")
    st.caption("Select an insight below to inspect its supporting metrics, caveats, and proposed experimental design:")

    # Selectbox to pick insight
    insight_options = [f"#{row['id']}: {row['business_question']}" for _, row in ev_df.iterrows()]
    selected_option = st.selectbox("Select Business Question", options=insight_options, index=0)

    selected_id = int(selected_option.split(":")[0].replace("#", ""))
    insight_card = ev_df[ev_df["id"] == selected_id].iloc[0]

    # Render Card
    strength_badge_class = {
        "Strong": "badge-strong",
        "Moderate": "badge-moderate",
        "Preliminary": "badge-preliminary",
    }.get(insight_card["evidence_strength"], "badge-moderate")

    st.markdown(
        f"""
        <div style="background-color: #F8FAFC; border: 1px solid #CBD5E1; border-radius: 8px; padding: 1.5rem; margin-top: 1rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.8rem;">
                <span style="font-size: 1.1rem; font-weight: 700; color: #1E293B;">Insight #{insight_card['id']}</span>
                <div>
                    <span class="{strength_badge_class}">{insight_card['evidence_strength']} Evidence</span>
                    <span style="background-color: #E2E8F0; color: #475569; padding: 3px 8px; border-radius: 4px; font-weight: 600; font-size: 0.85rem; margin-left: 6px;">
                        {insight_card['association_causal']}
                    </span>
                </div>
            </div>
            <h3 style="color: #0F172A; margin-top: 0; margin-bottom: 0.8rem;">
                {insight_card['business_question']}
            </h3>
            <div style="background-color: #FFFFFF; border-left: 4px solid #3B82F6; padding: 0.8rem 1rem; margin-bottom: 1rem; border-radius: 0 4px 4px 0;">
                <b>Core Empirical Finding:</b><br>
                {insight_card['finding']}
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )

    detail_col1, detail_col2 = st.columns(2)

    with detail_col1:
        st.markdown("#### 📊 Quantitative Evidence")
        st.info(insight_card["supporting_metric"])

        st.markdown("#### ⚠️ Boundary Conditions & Limitations")
        st.warning(insight_card["limitation"])

    with detail_col2:
        st.markdown("#### 🔬 Causal Status Classification")
        st.info(f"**Classification:** {insight_card['association_causal']}\n\n*This finding reflects an observed statistical relationship in synthetic transaction data. Interventions cannot be assumed to yield proportional results without controlled testing.*")

        st.markdown("#### 🎯 Recommended Next Investigation")
        st.success(insight_card["next_investigation"])

# -----------------------------------------------------------------------------
# Footer
# -----------------------------------------------------------------------------
st.markdown("---")
st.markdown(
    """
    <div style="text-align: center; color: #94A3B8; font-size: 0.85rem;">
        DecisionLens © 2026 · Customer Decision Intelligence & Evidence Platform · Built with Streamlit & Plotly
    </div>
    """,
    unsafe_allow_html=True,
)
