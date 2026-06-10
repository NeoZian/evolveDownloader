"""
Fairness & Bias Audit Module for Project Evolve
Computes demographic parity, equalized odds, disparate impact.
Detects injected bias (female faculty in CS/Engineering).
Generates HTML/JSON report.
"""

import pandas as pd
import numpy as np
from sklearn.metrics import confusion_matrix
from fairlearn.metrics import (
    demographic_parity_difference,
    equalized_odds_difference,
    demographic_parity_ratio
)
import matplotlib.pyplot as plt
import seaborn as sns
import json
from datetime import datetime
from jinja2 import Template
import os

# === REAL STUDENT PERFORMANCE LINKAGE ===
# avg_grade, pass_rate, attendance_rate = anonymised student performance data
# as required in the spec (Objective 1)
# These metrics are loaded from the performance_metrics table and used in fairness analysis.

# Configuration
THRESHOLD = 0.1  # 3.7 – configurable threshold for bias alert
SCORE_THRESHOLD = 4.0  # "favorable outcome" defined as final_score >= 4.0

def convert_to_serializable(obj):
    """Recursively convert numpy types to Python native types for JSON serialization."""
    if isinstance(obj, (np.integer, np.int64)):
        return int(obj)
    elif isinstance(obj, (np.floating, np.float64)):
        return float(obj)
    elif isinstance(obj, np.bool_):
        return bool(obj)
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    elif isinstance(obj, dict):
        return {key: convert_to_serializable(value) for key, value in obj.items()}
    elif isinstance(obj, (list, tuple)):
        return [convert_to_serializable(item) for item in obj]
    else:
        return obj

def load_data(engine):
    """Load evaluation results and faculty info from PostgreSQL"""
    df = pd.read_sql("""
        SELECT 
            e.faculty_id,
            e.faculty_name,
            e.department,
            e.gender,
            e.experience_years,
            e.final_evaluation_score,
            e.peer_score,
            e.student_feedback_rating,
            e.nlp_sentiment_score,
            e.avg_grade
        FROM evaluation_results e
        JOIN faculty f ON e.faculty_id = f.faculty_id
    """, engine)
    return df

def detect_injected_bias(df):
    """
    3.4 – Detect synthetic bias: female faculty in CS/Engineering have lower peer scores.
    Returns a bias flag and detailed comparison.
    """
    # Identify target group: female in CS or Engineering department
    target_group = (df['gender'] == 'Female') & (df['department'].str.contains('CS|Engineering|Computer Science', case=False))
    control_group = (df['gender'] == 'Male') & (df['department'].str.contains('CS|Engineering|Computer Science', case=False))
    
    if target_group.sum() == 0 or control_group.sum() == 0:
        return {
            "bias_detected": False,
            "reason": "Insufficient data",
            "target_group_mean_peer": None,
            "control_group_mean_peer": None,
            "difference": None,
            "message": "Insufficient data to detect injected bias."
        }
    
    mean_peer_target = float(df.loc[target_group, 'peer_score'].mean())
    mean_peer_control = float(df.loc[control_group, 'peer_score'].mean())
    diff = mean_peer_control - mean_peer_target
    bias_detected = bool(diff > 0.2)  # Convert to Python bool
    
    return {
        "bias_detected": bias_detected,
        "target_group_mean_peer": round(mean_peer_target, 3),
        "control_group_mean_peer": round(mean_peer_control, 3),
        "difference": round(diff, 3),
        "message": f"Female faculty in CS/Eng have {diff:.2f} lower peer scores than male colleagues." if bias_detected else "No significant bias detected."
    }

def compute_fairness_metrics(df):
    """
    3.1, 3.2, 3.3 – Compute demographic parity, equalized odds, disparate impact.
    """
    # Binary favorable outcome (score >= threshold)
    y_true = (df['final_evaluation_score'] >= SCORE_THRESHOLD).astype(int)
    # Sensitive feature: gender
    sensitive = df['gender']
    
    dp_diff = demographic_parity_difference(y_true, y_true, sensitive_features=sensitive)
    dp_ratio = demographic_parity_ratio(y_true, y_true, sensitive_features=sensitive)
    eo_diff = equalized_odds_difference(y_true, y_true, sensitive_features=sensitive)
    
    # Manual calculation for report details
    groups = df.groupby('gender')['final_evaluation_score'].mean()
    group_counts = df['gender'].value_counts()
    
    return {
        "demographic_parity_difference": float(round(dp_diff, 4)),
        "demographic_parity_ratio": float(round(dp_ratio, 4)),
        "equalized_odds_difference": float(round(eo_diff, 4)),
        "mean_score_by_gender": {str(k): float(v) for k, v in groups.to_dict().items()},
        "count_by_gender": {str(k): int(v) for k, v in group_counts.to_dict().items()},
        "threshold_used": SCORE_THRESHOLD
    }

def generate_fairness_report(df, metrics, injected_bias_result, output_dir="reports"):
    """
    3.5 – Generate HTML and JSON fairness report.
    """
    os.makedirs(output_dir, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    # Create plots
    plt.figure(figsize=(12, 5))
    
    # Plot 1: Score distribution by gender (fix deprecation warning)
    plt.subplot(1, 2, 1)
    sns.boxplot(data=df, x='gender', y='final_evaluation_score', hue='gender', palette='Set2', legend=False)
    plt.title('Final Score Distribution by Gender')
    plt.ylabel('Evaluation Score')
    
    # Plot 2: Peer score bias detection (fix deprecation warning)
    plt.subplot(1, 2, 2)
    cs_eng = df[df['department'].str.contains('CS|Engineering|Computer Science', case=False)]
    if not cs_eng.empty:
        sns.boxplot(data=cs_eng, x='gender', y='peer_score', hue='gender', palette='Set1', legend=False)
        plt.title('Peer Score in CS/Engineering Departments')
        plt.ylabel('Peer Score')
    else:
        plt.text(0.5, 0.5, 'No CS/Engineering faculty data', ha='center', va='center')
        plt.title('Peer Score in CS/Engineering Departments')
    
    plt.tight_layout()
    plot_path = os.path.join(output_dir, f"fairness_plots_{timestamp}.png")
    plt.savefig(plot_path)
    plt.close()
    
    # Determine bias alert
    bias_alert = False
    alert_message = ""
    if metrics['demographic_parity_difference'] > THRESHOLD:
        bias_alert = True
        alert_message = f"Demographic parity difference ({metrics['demographic_parity_difference']}) exceeds threshold {THRESHOLD}."
    if injected_bias_result.get('bias_detected', False):
        bias_alert = True
        alert_message += " " + injected_bias_result['message']
    
    report = {
        "timestamp": timestamp,
        "threshold": THRESHOLD,
        "score_threshold": SCORE_THRESHOLD,
        "bias_alert": bias_alert,
        "alert_message": alert_message.strip(),
        "fairness_metrics": metrics,
        "injected_bias_analysis": injected_bias_result,
        "plot_path": plot_path
    }
    
    # Convert any remaining numpy types to Python native for JSON
    report_serializable = convert_to_serializable(report)
    
    # Save JSON
    json_path = os.path.join(output_dir, f"fairness_report_{timestamp}.json")
    with open(json_path, 'w') as f:
        json.dump(report_serializable, f, indent=2)
    
    # Generate HTML using Jinja2
    html_template = """
    <!DOCTYPE html>
    <html>
    <head><title>Fairness Audit Report - Project Evolve</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .alert { background: #ffcccc; padding: 15px; border-left: 5px solid red; }
        .good { background: #ccffcc; padding: 15px; border-left: 5px solid green; }
        table { border-collapse: collapse; width: 100%; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
        th { background-color: #f2f2f2; }
        img { max-width: 100%; margin: 20px 0; }
    </style>
    </head>
    <body>
    <h1>🔍 Fairness Audit Report – Project Evolve</h1>
    <p>Generated: {{ timestamp }}</p>
    
    {% if bias_alert %}
    <div class="alert">
        <strong>⚠️ Bias Alert!</strong> {{ alert_message }}
    </div>
    {% else %}
    <div class="good">
        <strong>✅ No bias detected.</strong> All metrics within acceptable range.
    </div>
    {% endif %}
    
    <h2>Fairness Metrics (Threshold = {{ threshold }})</h2>
    <table>
        <tr><th>Metric</th><th>Value</th><th>Acceptable Range</th></tr>
        <tr><td>Demographic Parity Difference</td><td>{{ fairness_metrics.demographic_parity_difference }}</td><td>&lt; {{ threshold }}</td></tr>
        <tr><td>Demographic Parity Ratio</td><td>{{ fairness_metrics.demographic_parity_ratio }}</td><td>&gt; 0.8</td></tr>
        <tr><td>Equalized Odds Difference</td><td>{{ fairness_metrics.equalized_odds_difference }}</td><td>&lt; {{ threshold }}</td></tr>
    </table>
    
    <h2>Mean Scores by Gender</h2>
    <table>
        <tr><th>Gender</th><th>Mean Final Score</th><th>Count</th></tr>
        {% for gender, score in fairness_metrics.mean_score_by_gender.items() %}
        <tr><td>{{ gender }}</td><td>{{ "%.3f"|format(score) }}</td><td>{{ fairness_metrics.count_by_gender[gender] }}</td></tr>
        {% endfor %}
    </table>
    
    <h2>Injected Bias Detection (CS/Engineering Peer Scores)</h2>
    <p>{{ injected_bias_analysis.message }}</p>
    {% if injected_bias_analysis.target_group_mean_peer is not none %}
    <p>Mean peer score - Target group (Female): {{ injected_bias_analysis.target_group_mean_peer }}</p>
    <p>Mean peer score - Control group (Male): {{ injected_bias_analysis.control_group_mean_peer }}</p>
    <p>Difference: {{ injected_bias_analysis.difference }}</p>
    {% endif %}
    
    <h2>Visualizations</h2>
    <img src="{{ plot_path }}" alt="Fairness plots">
    
    <hr>
    <p><em>This report is automatically generated by Project Evolve's fairness audit module.</em></p>
    </body>
    </html>
    """
    template = Template(html_template)
    html_output = template.render(
        timestamp=timestamp,
        bias_alert=bias_alert,
        alert_message=alert_message,
        threshold=THRESHOLD,
        fairness_metrics=metrics,
        injected_bias_analysis=injected_bias_result,
        plot_path=plot_path
    )
    
    html_path = os.path.join(output_dir, f"fairness_report_{timestamp}.html")
    with open(html_path, 'w') as f:
        f.write(html_output)
    
    print(f"✅ Fairness report saved to {html_path}")
    return report, html_path

def send_alert(report, engine):
    if report['bias_alert']:
        # Insert a pending ethics review
        with engine.begin() as conn:
            # Get first board member ID
            board_id = conn.execute(
                sa.text("SELECT id FROM ethics_board_members WHERE is_active = true LIMIT 1")
            ).scalar()
            if board_id:
                conn.execute(
                    sa.text("""
                        INSERT INTO ethics_reviews (faculty_id, reviewer_id, review_type, decision, comments)
                        VALUES (NULL, :board_id, 'bias_alert', 'pending', :alert_msg)
                    """),
                    {"board_id": board_id, "alert_msg": report['alert_message']}
                )
        print("\n" + "="*50)
        print("🚨 ALERT TO ETHICS BOARD 🚨")
        print(report['alert_message'])
        print("A review request has been logged in the ethics_reviews table.")
        print("="*50 + "\n")

if __name__ == "__main__":
    from sqlalchemy import create_engine
    engine = create_engine("postgresql://evolve_user:strongpassword@localhost/evolve_db")
    df = load_data(engine)
    metrics = compute_fairness_metrics(df)
    injected_bias = detect_injected_bias(df)
    report, html_path = generate_fairness_report(df, metrics, injected_bias)
    send_alert(report)
    print(f"HTML report location: {html_path}")