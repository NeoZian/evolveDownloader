import sys
import pandas as pd
import numpy as np
from lime.lime_tabular import LimeTabularExplainer
from sqlalchemy import create_engine

faculty_id = int(sys.argv[1])
engine = create_engine("postgresql://evolve_user:strongpassword@localhost/evolve_db")

# Load data for all faculty (including course_quality_score, gender, department)
df_all = pd.read_sql("""
    SELECT 
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

# Feature columns (5 features now)
feature_cols = ['student_feedback_rating', 'peer_score', 'avg_grade', 
                'nlp_sentiment_score', 'course_quality_score']
X = df_all[feature_cols].values
y = df_all['final_evaluation_score'].values

# Store gender and department for bias correction (aligned with X rows)
genders = df_all['gender'].values
departments = df_all['department'].values

# Define prediction function with new weights and bias mitigation
def weighted_score_prediction(x):
    """
    x: 2D array with 5 columns in order:
        student_feedback_rating, peer_score, avg_grade, nlp_sentiment_score, course_quality_score
    Returns predicted final score (1-5)
    """
    scores = []
    for i, row in enumerate(x):
        student_fb = row[0]
        peer = row[1]
        avg_grade = row[2]
        nlp_sent = row[3]
        course_qual = row[4]
        
        # Normalize performance
        perf_score = (avg_grade / 4.0) * 5.0
        perf_score = np.clip(perf_score, 1, 5)
        
        # New weights (matches AI layer)
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
        
        # Active bias mitigation (use the aligned gender/department for this row)
        # Note: we need to map row index i back to the correct gender/department
        # Since X is from df_all, the row order matches the original dataframe
        gender = genders[i]
        department = departments[i]
        if gender == 'Female' and department in ["CS", "Engineering", "Computer Science"]:
            score += 0.12
        
        scores.append(np.clip(score, 1, 5))
    return np.array(scores)

# Create LIME explainer with 5 feature names
feature_names = ['Student Feedback', 'Peer Review', 'Avg Grade', 'NLP Sentiment', 'Course Quality']
explainer = LimeTabularExplainer(X, feature_names=feature_names, mode='regression', training_labels=y)

# Get the specific faculty instance (now includes course_quality_score)
df_single = pd.read_sql(f"""
    SELECT 
        student_feedback_rating, 
        peer_score, 
        avg_grade, 
        nlp_sentiment_score,
        course_quality_score
    FROM evaluation_results 
    WHERE faculty_id = {faculty_id}
""", engine)
instance = df_single.values[0]

# Generate explanation (now with 5 features)
exp = explainer.explain_instance(instance, weighted_score_prediction, num_features=5)
exp.save_to_file(f"explanations/lime_{faculty_id}.html")
print("OK")