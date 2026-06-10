# src/xai/precompute_shap.py
import pandas as pd
import numpy as np
import shap
import json
from sqlalchemy import create_engine, text

# Configuration
DB_URL = "postgresql://evolve_user:strongpassword@localhost/evolve_db"
engine = create_engine(DB_URL)

# Load evaluation results including course_quality_score and gender/department for bias
df = pd.read_sql("""
    SELECT 
        e.faculty_id,
        e.student_feedback_rating,
        e.peer_score,
        e.avg_grade,
        e.nlp_sentiment_score,
        e.course_quality_score,
        e.final_evaluation_score,
        f.gender,
        f.department
    FROM evaluation_results e
    JOIN faculty f ON e.faculty_id = f.faculty_id
""", engine)

print(f"Loaded {len(df)} records with course_quality_score and demographics")

# Feature columns for SHAP (5 features)
feature_cols = [
    'student_feedback_rating', 
    'peer_score', 
    'avg_grade', 
    'nlp_sentiment_score', 
    'course_quality_score'
]

# Prepare feature matrix X
X = df[feature_cols].values

# Define weighted score function that matches AI layer EXACTLY
def weighted_score_with_bias(student_fb, peer, avg_grade, nlp_sent, course_qual, gender, department):
    perf_score = (avg_grade / 4.0) * 5.0
    perf_score = np.clip(perf_score, 1, 5)
    
    w_student = 0.35
    w_peer = 0.25
    w_perf = 0.20
    w_nlp = 0.10
    w_course = 0.10
    
    score = (student_fb * w_student + 
             peer * w_peer + 
             perf_score * w_perf +
             nlp_sent * w_nlp + 
             course_qual * w_course)
    
    # Active bias mitigation
    if gender == 'Female' and department in ["CS", "Engineering", "Computer Science"]:
        score += 0.12
        
    return np.clip(score, 1, 5)

# Create a wrapper for SHAP that accepts numpy array and uses pre-loaded gender/dept
# Since SHAP expects a function that takes a 2D array, we need to map rows to original gender/department
# We'll store gender and department arrays aligned with X
genders = df['gender'].values
departments = df['department'].values

def model_for_shap(X_array):
    """Predict final score given feature array (5 columns)"""
    scores = []
    for i, row in enumerate(X_array):
        # Get corresponding gender and department for this row
        gender = genders[i]
        department = departments[i]
        s = weighted_score_with_bias(
            row[0], row[1], row[2], row[3], row[4],
            gender, department
        )
        scores.append(s)
    return np.array(scores)

# Use a smaller background for KernelExplainer (speed)
background = X[:100]  # now X is defined
explainer = shap.KernelExplainer(model_for_shap, background)

# Compute SHAP values for all rows (may take a minute)
shap_values = explainer.shap_values(X)

# Store SHAP values per faculty
shap_records = []
for idx, row in df.iterrows():
    contributions = {}
    for i, col in enumerate(feature_cols):
        contributions[col] = float(shap_values[idx][i])
    shap_records.append({
        "faculty_id": int(row['faculty_id']),
        "shap_values_json": json.dumps(contributions),
        "base_value": float(explainer.expected_value)
    })

# Create table and upsert
with engine.connect() as conn:
    conn.execute(text("""
        CREATE TABLE IF NOT EXISTS shap_explanations (
            faculty_id INTEGER PRIMARY KEY,
            shap_values_json TEXT,
            base_value FLOAT,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """))
    conn.commit()

for rec in shap_records:
    with engine.begin() as conn:
        conn.execute(text("""
            INSERT INTO shap_explanations (faculty_id, shap_values_json, base_value)
            VALUES (:fid, :json, :base)
            ON CONFLICT (faculty_id) DO UPDATE SET
                shap_values_json = EXCLUDED.shap_values_json,
                base_value = EXCLUDED.base_value,
                updated_at = CURRENT_TIMESTAMP
        """), {
            "fid": rec['faculty_id'],
            "json": rec['shap_values_json'],
            "base": rec['base_value']
        })

print(f"✅ Precomputed SHAP values for {len(shap_records)} faculty")