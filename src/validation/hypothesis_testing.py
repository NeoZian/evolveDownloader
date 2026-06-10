"""
Validation & Hypothesis Testing Module for Project Evolve
Compares AI-assisted evaluation (multi-faceted) against traditional (student surveys only).
Tests H1: AI provides more comprehensive and reliable measure.
"""

import os
import pandas as pd
import numpy as np
from scipy.stats import pearsonr, ttest_rel, levene, wilcoxon
from sklearn.metrics import mean_squared_error, mean_absolute_error
import matplotlib.pyplot as plt
import seaborn as sns
import json
from datetime import datetime
from sqlalchemy import create_engine
import warnings
warnings.filterwarnings('ignore')

# ============================================
# 4.4 – Parallel-run mode flag (environment variable)
# ============================================
PARALLEL_RUN_MODE = os.getenv("PROJECT_EVOLVE_PARALLEL_MODE", "True").lower() == "true"

def get_traditional_score(row):
    """4.1 – Simulated traditional evaluation: only student feedback rating."""
    return row['student_feedback_rating']

def compare_scores(df):
    """
    4.2 – Compute correlation, RMSE, MAE between traditional and AI scores.
    """
    traditional = df['traditional_score']
    ai = df['final_evaluation_score']
    
    # Pearson correlation
    corr, p_value = pearsonr(traditional, ai)
    rmse = np.sqrt(mean_squared_error(traditional, ai))
    mae = mean_absolute_error(traditional, ai)
    
    return {
        "pearson_correlation": round(corr, 4),
        "p_value": round(p_value, 6),
        "rmse": round(rmse, 4),
        "mae": round(mae, 4)
    }

def flag_disagreements(df, threshold=0.5):
    """
    4.3 – Identify faculty where |AI - traditional| > threshold.
    Returns a DataFrame of flagged faculty and saves to CSV.
    """
    df['difference'] = abs(df['final_evaluation_score'] - df['traditional_score'])
    flagged = df[df['difference'] > threshold].copy()
    flagged = flagged[['faculty_id', 'faculty_name', 'department', 
                       'traditional_score', 'final_evaluation_score', 'difference']]
    flagged = flagged.sort_values('difference', ascending=False)
    return flagged

def statistical_tests(df):
    """
    4.6 – Test H1: AI score is more reliable (lower variance) than traditional.
    Use Levene's test for equality of variances. Also compare variance ratio.
    Additionally, paired t-test (if normally distributed) or Wilcoxon signed-rank.
    """
    traditional = df['traditional_score']
    ai = df['final_evaluation_score']
    
    # Variance comparison (lower variance = more reliable)
    var_trad = np.var(traditional, ddof=1)
    var_ai = np.var(ai, ddof=1)
    variance_ratio = var_trad / var_ai  # >1 means AI has lower variance
    
    # Levene's test for equal variances
    stat_levene, p_levene = levene(traditional, ai)
    
    # Paired t-test (test if means are different; not directly reliability)
    # But we can test if AI scores are systematically different?
    t_stat, p_ttest = ttest_rel(traditional, ai)
    
    # Wilcoxon signed-rank as non-parametric alternative
    w_stat, p_wilcox = wilcoxon(traditional, ai)
    
    return {
        "variance_traditional": round(var_trad, 4),
        "variance_ai": round(var_ai, 4),
        "variance_ratio_traditional_over_ai": round(variance_ratio, 4),
        "levene_statistic": round(stat_levene, 4),
        "levene_p_value": round(p_levene, 6),
        "paired_ttest_statistic": round(t_stat, 4),
        "paired_ttest_p_value": round(p_ttest, 6),
        "wilcoxon_statistic": round(w_stat, 4),
        "wilcoxon_p_value": round(p_wilcox, 6),
        "interpretation": (
            f"AI variance is {variance_ratio:.2f} times smaller than traditional variance. "
            f"Levene's test p={p_levene:.4f} – {'reject' if p_levene < 0.05 else 'fail to reject'} equal variances. "
            f"Thus AI {'is' if var_ai < var_trad else 'is not'} more reliable (lower variance)."
        )
    }

def human_expert_simulation(n_faculty=20):
    """
    4.5 – Simulate human expert scores for demonstration.
    In reality, you would collect real human evaluations. Here we generate
    synthetic experts with random noise around the AI score.
    Returns a DataFrame with human scores and computes inter-rater reliability.
    """
    np.random.seed(42)
    # Load faculty data
    engine = create_engine("postgresql://evolve_user:strongpassword@localhost/evolve_db")
    df = pd.read_sql("SELECT faculty_id, faculty_name, final_evaluation_score FROM evaluation_results", engine)
    df = df.sample(n=min(n_faculty, len(df)), random_state=42).copy()
    
    # Simulate 3-5 human experts
    n_experts = np.random.randint(3, 6)
    expert_scores = {}
    for e in range(n_experts):
        # Each expert has a bias and random noise
        bias = np.random.normal(0, 0.2)
        noise = np.random.normal(0, 0.3, size=len(df))
        expert_scores[f'expert_{e+1}'] = np.clip(df['final_evaluation_score'] + bias + noise, 1, 5)
    
    # Add to dataframe
    for col, scores in expert_scores.items():
        df[col] = scores
    
    # Compute inter-rater reliability (Fleiss' Kappa requires categories; use ICC for continuous)
    # Simplified: average pairwise correlation
    expert_cols = [f'expert_{i+1}' for i in range(n_experts)]
    corr_matrix = df[expert_cols].corr()
    avg_corr = corr_matrix.values[np.triu_indices_from(corr_matrix, k=1)].mean()
    
    # Correlation between average human score and AI score
    df['avg_human'] = df[expert_cols].mean(axis=1)
    ai_corr, _ = pearsonr(df['avg_human'], df['final_evaluation_score'])
    
    return {
        "n_experts": n_experts,
        "n_faculty": len(df),
        "average_inter_rater_correlation": round(avg_corr, 4),
        "correlation_avg_human_vs_ai": round(ai_corr, 4),
        "simulated_data": df[['faculty_id', 'faculty_name', 'final_evaluation_score'] + expert_cols].head().to_dict(orient='records')
    }

def generate_validation_report(df, comparison, flagged, stats, human_sim, output_dir="reports"):
    """Generate JSON and HTML report for validation."""
    os.makedirs(output_dir, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    # Create plots
    plt.figure(figsize=(14, 5))
    
    # Plot 1: Scatter plot AI vs Traditional
    plt.subplot(1, 3, 1)
    sns.scatterplot(data=df, x='traditional_score', y='final_evaluation_score', alpha=0.6)
    plt.plot([1,5], [1,5], 'r--', label='Perfect agreement')
    plt.xlabel('Traditional Score (student surveys)')
    plt.ylabel('AI Score (multi-faceted)')
    plt.title('AI vs Traditional Evaluation')
    plt.legend()
    
    # Plot 2: Difference distribution
    plt.subplot(1, 3, 2)
    df['difference'] = df['final_evaluation_score'] - df['traditional_score']
    sns.histplot(df['difference'], bins=30, kde=True)
    plt.axvline(0, color='r', linestyle='--')
    plt.xlabel('Difference (AI - Traditional)')
    plt.title('Distribution of Differences')
    
    # Plot 3: Variance comparison boxplot
    plt.subplot(1, 3, 3)
    df_melt = pd.melt(df, id_vars=['faculty_id'], value_vars=['traditional_score', 'final_evaluation_score'],
                      var_name='method', value_name='score')
    sns.boxplot(data=df_melt, x='method', y='score', palette='Set2')
    plt.title('Score Variance Comparison')
    plt.ylabel('Evaluation Score')
    
    plt.tight_layout()
    plot_path = os.path.join(output_dir, f"validation_plots_{timestamp}.png")
    plt.savefig(plot_path)
    plt.close()
    
    # Prepare report data (convert numpy types)
    def convert(obj):
        if isinstance(obj, (np.integer, np.int64)): return int(obj)
        elif isinstance(obj, (np.floating, np.float64)): return float(obj)
        elif isinstance(obj, np.bool_): return bool(obj)
        elif isinstance(obj, dict): return {k: convert(v) for k,v in obj.items()}
        elif isinstance(obj, (list, tuple)): return [convert(i) for i in obj]
        else: return obj
    
    report = {
        "timestamp": timestamp,
        "parallel_run_mode": PARALLEL_RUN_MODE,
        "comparison_metrics": convert(comparison),
        "statistical_tests": convert(stats),
        "human_expert_simulation": convert(human_sim),
        "flagged_faculty_count": len(flagged),
        "flagged_faculty_sample": convert(flagged.head(10).to_dict(orient='records')),
        "plot_path": plot_path
    }
    
    # Save JSON
    json_path = os.path.join(output_dir, f"validation_report_{timestamp}.json")
    with open(json_path, 'w') as f:
        json.dump(report, f, indent=2)
    
    # HTML report (simplified)
    html_content = f"""
    <html>
    <head><title>Validation Report - Project Evolve</title>
    <style>
        body {{ font-family: Arial; margin: 40px; }}
        .alert {{ background: #ffcccc; padding: 15px; border-left: 5px solid red; }}
        table {{ border-collapse: collapse; width: 100%; margin: 20px 0; }}
        th, td {{ border: 1px solid #ddd; padding: 8px; text-align: center; }}
        th {{ background: #f2f2f2; }}
    </style>
    </head>
    <body>
    <h1>📊 Validation & Hypothesis Testing Report</h1>
    <p>Generated: {timestamp}</p>
    <p><strong>Parallel Run Mode:</strong> {'ACTIVE (AI scores not used for real decisions)' if PARALLEL_RUN_MODE else 'INACTIVE'}</p>
    
    <h2>Comparison Metrics</h2>
    <table>
        <tr><th>Metric</th><th>Value</th></tr>
        <tr><td>Pearson Correlation</td><td>{comparison['pearson_correlation']}</td></tr>
        <tr><td>RMSE</td><td>{comparison['rmse']}</td></tr>
        <tr><td>MAE</td><td>{comparison['mae']}</td></tr>
    </table>
    
    <h2>Statistical Tests (H1: AI more reliable)</h2>
    <table>
        <tr><th>Test</th><th>Statistic</th><th>p-value</th></tr>
        <tr><td>Levene's (variance equality)</td><td>{stats['levene_statistic']}</td><td>{stats['levene_p_value']}</td></tr>
        <tr><td>Paired t-test (mean difference)</td><td>{stats['paired_ttest_statistic']}</td><td>{stats['paired_ttest_p_value']}</td></tr>
    </table>
    <p><strong>Interpretation:</strong> {stats['interpretation']}</p>
    
    <h2>Flagged Faculty (Difference > 0.5)</h2>
    <p>{len(flagged)} faculty flagged for human review.</p>
    {flagged.head(10).to_html() if not flagged.empty else '<p>No flagged faculty.</p>'}
    
    <h2>Human Expert Simulation</h2>
    <p>Simulated {human_sim['n_experts']} experts on {human_sim['n_faculty']} faculty.</p>
    <p>Average inter-rater correlation: {human_sim['average_inter_rater_correlation']}</p>
    <p>Correlation (avg human vs AI): {human_sim['correlation_avg_human_vs_ai']}</p>
    
    <h2>Visualizations</h2>
    <img src="{plot_path}" style="max-width:100%">
    </body>
    </html>
    """
    html_path = os.path.join(output_dir, f"validation_report_{timestamp}.html")
    with open(html_path, 'w') as f:
        f.write(html_content)
    
    print(f"✅ Validation report saved to {html_path}")
    return report, html_path

def main():
    # Connect to database
    engine = create_engine("postgresql://evolve_user:strongpassword@localhost/evolve_db")
    df = pd.read_sql("""
        SELECT faculty_id, faculty_name, department, 
               student_feedback_rating, final_evaluation_score
        FROM evaluation_results
    """, engine)
    
    # 4.1 – Traditional baseline
    df['traditional_score'] = df.apply(get_traditional_score, axis=1)
    
    # 4.2 – Comparison
    comparison = compare_scores(df)
    
    # 4.3 – Disagreements
    flagged = flag_disagreements(df, threshold=0.5)
    
    # 4.6 – Statistical tests
    stats = statistical_tests(df)
    
    # 4.5 – Human expert simulation (mock)
    human_sim = human_expert_simulation(n_faculty=20)
    
    # Generate report
    report, html_path = generate_validation_report(df, comparison, flagged, stats, human_sim)
    
    # Print summary
    print("\n" + "="*60)
    print(f"Parallel Run Mode: {PARALLEL_RUN_MODE}")
    print(f"Pearson correlation AI vs Traditional: {comparison['pearson_correlation']}")
    print(f"RMSE: {comparison['rmse']}, MAE: {comparison['mae']}")
    print(f"Flagged {len(flagged)} faculty (difference > 0.5)")
    print(stats['interpretation'])
    print("="*60)
    
    if PARALLEL_RUN_MODE:
        print("⚠️ PARALLEL_RUN_MODE is ON: AI scores are for validation only, not used for real decisions.")
    else:
        print("🚀 PARALLEL_RUN_MODE is OFF: AI scores could be used for real decisions (not recommended for production).")

if __name__ == "__main__":
    main()
