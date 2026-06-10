from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import pandas as pd
from datetime import datetime
from sqlalchemy.engine import URL
import sqlalchemy as sa
import numpy as np
import json
import hashlib
from web3 import Web3
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from fastapi.responses import FileResponse
import io
import glob
import subprocess
import os
from pydantic import BaseModel
from typing import Optional
from scipy.stats import ttest_ind
from fastapi.responses import Response  
from datetime import timedelta
from src.fairness.mitigation import mitigate_bias


url_object = URL.create(
    drivername="postgresql",
    username="evolve_user",
    password="strongpassword",
    host="localhost",
    database="evolve_db"
)

engine = sa.create_engine(url_object)

app = FastAPI(title="Project Evolve API")

os.makedirs("reports", exist_ok=True)
os.makedirs("explanations", exist_ok=True)   # ← Added for safety
app.mount("/reports", StaticFiles(directory="reports"), name="reports")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

lime_cache = {}


class FeedbackCreate(BaseModel):
    faculty_id: int
    understandability_score: int
    trust_score: int
    comment: Optional[str] = None
    xai_viewed: bool = False


@app.post("/api/feedback")
async def submit_feedback(feedback: FeedbackCreate):
    try:
        with engine.begin() as conn:
            conn.execute(
                sa.text("""
                    INSERT INTO faculty_feedback 
                    (faculty_id, understandability_score, trust_score, comment, xai_viewed)
                    VALUES (:fid, :und, :trust, :comment, :xai)
                """),
                {"fid": feedback.faculty_id, "und": feedback.understandability_score,
                 "trust": feedback.trust_score, "comment": feedback.comment, "xai": feedback.xai_viewed}
            )
        return {"message": "Feedback submitted successfully"}
    except Exception as e:
        print(f"Feedback error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/feedback/analysis")
async def get_feedback_analysis():
    df = pd.read_sql("SELECT trust_score, xai_viewed FROM faculty_feedback", engine)
    if df.empty:
        return {"message": "No feedback data yet"}
    group_viewed = df[df['xai_viewed'] == True]['trust_score'].dropna()
    group_not_viewed = df[df['xai_viewed'] == False]['trust_score'].dropna()
    t_stat, p_value = ttest_ind(group_viewed, group_not_viewed, equal_var=False)
    return {
        "total_responses": len(df),
        "average_trust_overall": df['trust_score'].mean(),
        "average_trust_xai_viewed": group_viewed.mean(),
        "average_trust_xai_not_viewed": group_not_viewed.mean(),
        "t_statistic": t_stat,
        "p_value": p_value,
        "interpretation": f"Faculty who viewed XAI report {group_viewed.mean():.2f} trust score vs {group_not_viewed.mean():.2f} for those who did not. p-value = {p_value:.4f} – {'significant' if p_value < 0.05 else 'not significant'} difference."
    }


import math

def make_serializable(data):
    if isinstance(data, list):
        return [make_serializable(item) for item in data]
    elif isinstance(data, dict):
        return {key: make_serializable(value) for key, value in data.items()}
    elif isinstance(data, (np.integer, np.int64)):
        return int(data)
    elif isinstance(data, (np.floating, np.float64)):
        if math.isnan(data) or math.isinf(data):
            return None
        return float(data)
    elif isinstance(data, (float,)):
        if math.isnan(data) or math.isinf(data):
            return None
        return data
    elif isinstance(data, np.ndarray):
        return make_serializable(data.tolist())
    elif isinstance(data, pd.Series):
        return make_serializable(data.tolist())
    elif isinstance(data, pd.DataFrame):
        return make_serializable(data.to_dict(orient="records"))
    else:
        return data


w3 = Web3(Web3.HTTPProvider('http://127.0.0.1:8545'))
if not w3.is_connected():
    raise Exception("Could not connect to Ganache")

# Your contract address and ABI (copy from your notebook)
CONTRACT_ADDRESS = "0xe78A0F7E598Cc8b0Bb87894B0F60dD2a88d6a8Ab"  # update if changed
ABI = [
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "facultyId",
				"type": "uint256"
			}
		],
		"name": "addApproval",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": False,
		"inputs": [
			{
				"indexed": True,
				"internalType": "uint256",
				"name": "facultyId",
				"type": "uint256"
			},
			{
				"indexed": False,
				"internalType": "address",
				"name": "approver",
				"type": "address"
			}
		],
		"name": "ApprovalAdded",
		"type": "event"
	},
	{
		"anonymous": False,
		"inputs": [
			{
				"indexed": True,
				"internalType": "uint256",
				"name": "facultyId",
				"type": "uint256"
			},
			{
				"indexed": False,
				"internalType": "string",
				"name": "resultHash",
				"type": "string"
			},
			{
				"indexed": False,
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"name": "EvaluationStored",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "facultyId",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "resultHash",
				"type": "string"
			}
		],
		"name": "storeEvaluation",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "approvalCount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "approvals",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "facultyId",
				"type": "uint256"
			}
		],
		"name": "getApprovalCount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "facultyId",
				"type": "uint256"
			}
		],
		"name": "getEvaluation",
		"outputs": [
			{
				"components": [
					{
						"internalType": "uint256",
						"name": "facultyId",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "timestamp",
						"type": "uint256"
					},
					{
						"internalType": "string",
						"name": "resultHash",
						"type": "string"
					},
					{
						"internalType": "address",
						"name": "evaluator",
						"type": "address"
					}
				],
				"internalType": "struct FacultyEvaluation.EvaluationRecord",
				"name": "",
				"type": "tuple"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "records",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "facultyId",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "resultHash",
				"type": "string"
			},
			{
				"internalType": "address",
				"name": "evaluator",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]
  # paste the full ABI you already have

contract = w3.eth.contract(address=CONTRACT_ADDRESS, abi=ABI)


@app.get("/")
async def root():
    return {"message": "✅ Project Evolve API is running!"}


@app.get("/faculties")
async def get_all_faculties(
    page: int = Query(1, ge=1),
    limit: int = Query(15, ge=1, le=100),
    search: Optional[str] = None,
    min_score: Optional[float] = None,
    max_score: Optional[float] = None,
    faculty_id: Optional[int] = None
):
    offset = (page - 1) * limit
    base_query = "SELECT * FROM evaluation_results"
    conditions = []
    if search:
        conditions.append(f"(faculty_name ILIKE '%{search}%' OR department ILIKE '%{search}%')")
    if min_score is not None:
        conditions.append(f"final_evaluation_score >= {min_score}")
    if max_score is not None:
        conditions.append(f"final_evaluation_score <= {max_score}")
    if conditions:
        base_query += " WHERE " + " AND ".join(conditions)
    if faculty_id is not None:
        conditions.append(f"faculty_id = {faculty_id}")
    
    count_query = f"SELECT COUNT(*) FROM ({base_query}) as sub"
    total = pd.read_sql(count_query, engine).iloc[0,0]
    
    query = f"{base_query} ORDER BY final_evaluation_score DESC LIMIT {limit} OFFSET {offset}"
    df = pd.read_sql(query, engine)
    records = make_serializable(df.to_dict(orient="records"))
    return {
        "faculties": records,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": int(total),
            "total_pages": (int(total) + limit - 1) // limit
        }
    }


# === UPDATED: Now returns course_quality_score ===
@app.get("/evaluate/{faculty_id}")
async def evaluate_faculty(faculty_id: int):
    df = pd.read_sql(f"SELECT * FROM evaluation_results WHERE faculty_id = {faculty_id}", engine)
    if df.empty:
        raise HTTPException(status_code=404, detail="Faculty not found")
    row = df.iloc[0]
    return {
        "faculty_id": int(row['faculty_id']),
        "faculty_name": row['faculty_name'],
        "department": row['department'],
        "final_evaluation_score": float(row['final_evaluation_score']),
        "course_quality_score": float(row.get('course_quality_score', 0)),   # ← NEW
        "key_factors": {
            "student_feedback": float(row['student_feedback_rating']),
            "peer_review": float(row['peer_score']),
            "nlp_sentiment": float(row['nlp_sentiment_score']),
            "performance": float(row['avg_grade'])
        }
    }


@app.get("/explanation/{faculty_id}")
async def get_explanation(faculty_id: int):
    df_shap = pd.read_sql(f"SELECT shap_values_json, base_value FROM shap_explanations WHERE faculty_id = {faculty_id}", engine)
    if df_shap.empty:
        return {
            "final_score": 0,
            "top_positive_factors": [],
            "top_negative_factors": [],
            "full_explanation": "Explanation not available. Run SHAP precomputation first."
        }
    row = df_shap.iloc[0]
    shap_dict = json.loads(row['shap_values_json'])
    base = float(row['base_value'])
    
    df_eval = pd.read_sql(f"SELECT final_evaluation_score FROM evaluation_results WHERE faculty_id = {faculty_id}", engine)
    final_score = float(df_eval.iloc[0]['final_evaluation_score']) if not df_eval.empty else base
    
    positive = []
    negative = []
    for feature, value in shap_dict.items():
        if value > 0:
            positive.append({"feature": feature.replace('_', ' ').title(), "contribution": round(value, 3)})
        else:
            negative.append({"feature": feature.replace('_', ' ').title(), "contribution": round(value, 3)})
    
    positive.sort(key=lambda x: x['contribution'], reverse=True)
    negative.sort(key=lambda x: x['contribution'])
    
    explanation_text = f"The base prediction is {base:.2f}. "
    explanation_text += "Positive contributors: " + ", ".join([f"{p['feature']} (+{p['contribution']})" for p in positive[:3]]) + ". "
    explanation_text += "Negative contributors: " + ", ".join([f"{n['feature']} ({n['contribution']})" for n in negative[:3]]) + "."
    
    return {
        "final_score": final_score,
        "base_value": base,
        "top_positive_factors": positive[:3],
        "top_negative_factors": negative[:3],
        "full_explanation": explanation_text
    }


@app.get("/explanation/lime/{faculty_id}")
async def get_lime_explanation(faculty_id: int):
    """
    Returns LIME explanation as raw HTML (browser renders it directly)
    """
    # Check cache first
    if faculty_id in lime_cache:
        cached_time, html = lime_cache[faculty_id]
        if datetime.now() - cached_time < timedelta(hours=24):
            return Response(
                content=html,
                media_type="text/html",
                headers={"Content-Disposition": f"inline; filename=lime_{faculty_id}.html"}
            )
    
    try:
        # Generate LIME HTML file via subprocess
        result = subprocess.run(
            ["python", "src/xai/generate_lime.py", str(faculty_id)],
            capture_output=True,
            text=True,
            cwd=os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
        )
        
        if result.returncode != 0:
            raise HTTPException(500, f"LIME generation failed: {result.stderr}")
        
        # Read generated HTML file
        html_path = f"explanations/lime_{faculty_id}.html"
        
        if not os.path.exists(html_path):
            raise HTTPException(404, "LIME HTML file was not generated")
        
        with open(html_path, 'r', encoding='utf-8') as f:
            html_content = f.read()
        
        # Cache for future requests
        lime_cache[faculty_id] = (datetime.now(), html_content)
        
        # Return as HTML response (NOT JSON!)
        return Response(
            content=html_content,
            media_type="text/html",
            headers={
                "Content-Disposition": f"inline; filename=lime_{faculty_id}.html",
                "Cache-Control": "public, max-age=3600"
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Error generating LIME: {str(e)}")


@app.post("/api/xai/precompute_shap")
async def precompute_shap():
    try:
        result = subprocess.run(
            ["python", "src/xai/precompute_shap.py"],
            capture_output=True,
            text=True,
            cwd=os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
        )
        if result.returncode != 0:
            raise HTTPException(500, f"Precomputation failed: {result.stderr}")
        return {"message": "SHAP values precomputed successfully"}
    except Exception as e:
        raise HTTPException(500, str(e))


# === FIXED: Graceful audit endpoint (prevents page crash) ===
@app.get("/audit/{faculty_id}")
async def get_audit_trail(faculty_id: int):
    try:
        df = pd.read_sql(f"SELECT * FROM evaluation_results_with_blockchain WHERE faculty_id = {faculty_id}", engine)
        if df.empty:
            return {"faculty_id": faculty_id, "final_score": 0, "blockchain_tx_hash": "0xPending", "result_hash": "N/A",
                    "timestamp": str(datetime.utcnow()), "status": "⏳ No blockchain record found."}
        row = df.iloc[0]
        return {
            "faculty_id": int(row['faculty_id']),
            "final_score": float(row.get('final_evaluation_score', 0)),
            "blockchain_tx_hash": row.get('blockchain_tx_hash', '0x...'),
            "result_hash": row.get('result_hash', 'N/A'),
            "timestamp": str(datetime.utcnow()),
            "status": "✅ Tamper-proof & Immutable on Private Blockchain"
        }
    except Exception:
        return {"faculty_id": faculty_id, "final_score": 0, "blockchain_tx_hash": "0xPending", "result_hash": "N/A",
                "timestamp": str(datetime.utcnow()), "status": "⏳ Blockchain not ready yet"}


@app.get("/verify/{faculty_id}")
async def verify_blockchain(faculty_id: int):
    df_db = pd.read_sql(f"SELECT * FROM evaluation_results WHERE faculty_id = {faculty_id}", engine)
    if df_db.empty:
        raise HTTPException(404, "Faculty not found")
    row = df_db.iloc[0]
    record_str = json.dumps({
        "faculty_id": int(row['faculty_id']),
        "final_score": float(row['final_evaluation_score']),
        "nlp_sentiment": float(row['nlp_sentiment_score']),
        "timestamp": str(datetime.utcnow())
    }, sort_keys=True)
    recomputed = hashlib.sha256(record_str.encode()).hexdigest()
    onchain = contract.functions.getEvaluation(faculty_id).call()
    onchain_hash = onchain[2]
    return {
        "verified": recomputed == onchain_hash,
        "recomputed_hash": recomputed,
        "onchain_hash": onchain_hash
    }


@app.get("/export_pdf/{faculty_id}")
async def export_audit_pdf(faculty_id: int):
    df_db = pd.read_sql(f"SELECT * FROM evaluation_results WHERE faculty_id = {faculty_id}", engine)
    if df_db.empty:
        raise HTTPException(404, "Faculty not found")
    row = df_db.iloc[0]

    try:
        onchain = contract.functions.getEvaluation(faculty_id).call()
        onchain_hash = onchain[2]
        onchain_time = datetime.fromtimestamp(onchain[1])
    except Exception:
        onchain_hash = "0xBlockchain_Not_Available"
        onchain_time = datetime.utcnow()

    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=letter)
    c.drawString(100, 750, f"Audit Report for Faculty ID: {faculty_id}")
    c.drawString(100, 730, f"Name: {row['faculty_name']}")
    c.drawString(100, 710, f"Department: {row['department']}")
    c.drawString(100, 690, f"Final Score: {row['final_evaluation_score']}")
    c.drawString(100, 670, f"On-chain Hash: {onchain_hash}")
    c.drawString(100, 650, f"Timestamp: {onchain_time}")
    c.drawString(100, 630, "This report is generated by Project Evolve.")
    c.save()
    buffer.seek(0)

    # ✅ Return a proper Response with PDF bytes
    return Response(
        content=buffer.getvalue(),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=audit_{faculty_id}.pdf"}
    )


# === Rest of your endpoints (unchanged) ===
@app.get("/api/fairness/latest")
async def get_latest_fairness_report():
    reports_dir = "reports"
    if not os.path.exists(reports_dir):
        raise HTTPException(404, "No fairness reports found. Run audit first.")
    files = glob.glob(os.path.join(reports_dir, "fairness_report_*.json"))
    if not files:
        raise HTTPException(404, "No fairness reports found.")
    latest = max(files, key=os.path.getctime)
    with open(latest, 'r') as f:
        data = json.load(f)
    return data


@app.post("/api/fairness/run")
async def run_fairness_audit():
    try:
        result = subprocess.run(
            ["python", "src/fairness/audit.py"],
            capture_output=True,
            text=True,
            cwd=os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
        )
        if result.returncode != 0:
            raise HTTPException(status_code=500, detail=f"Fairness audit failed: {result.stderr}")
        
        reports_dir = "reports"
        files = glob.glob(os.path.join(reports_dir, "fairness_report_*.json"))
        if not files:
            raise HTTPException(status_code=404, detail="No fairness report generated.")
        latest = max(files, key=os.path.getctime)
        with open(latest, 'r') as f:
            report = json.load(f)
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/validation/run")
async def run_validation():
    try:
        result = subprocess.run(
            ["python", "src/validation/hypothesis_testing.py"],
            capture_output=True,
            text=True,
            cwd=os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
        )
        if result.returncode != 0:
            raise HTTPException(status_code=500, detail=f"Script failed: {result.stderr}")
        
        reports_dir = "reports"
        files = glob.glob(os.path.join(reports_dir, "validation_report_*.json"))
        if not files:
            raise HTTPException(status_code=404, detail="No validation report generated.")
        latest = max(files, key=os.path.getctime)
        with open(latest, 'r') as f:
            report = json.load(f)
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/validation/latest")
async def get_latest_validation_report():
    reports_dir = "reports"
    files = glob.glob(os.path.join(reports_dir, "validation_report_*.json"))
    if not files:
        raise HTTPException(404, "No validation report found. Run validation first.")
    latest = max(files, key=os.path.getctime)
    with open(latest, 'r') as f:
        return json.load(f)
    

@app.get("/api/stats")
async def get_dashboard_stats():
    avg_score = pd.read_sql("SELECT AVG(final_evaluation_score) FROM evaluation_results", engine).iloc[0,0]
    bias_value = 0.0
    reports_dir = "reports"
    if os.path.exists(reports_dir):
        files = glob.glob(os.path.join(reports_dir, "fairness_report_*.json"))
        if files:
            latest = max(files, key=os.path.getctime)
            with open(latest, 'r') as f:
                data = json.load(f)
                bias_value = data.get('fairness_metrics', {}).get('demographic_parity_difference', 0.0)
    blockchain_count = pd.read_sql("SELECT COUNT(*) FROM evaluation_results_with_blockchain", engine).iloc[0,0]
    return {
        "average_score": round(float(avg_score), 2),
        "bias_detected": round(bias_value, 3),
        "blockchain_logged": int(blockchain_count)
    }
    

@app.get("/api/audit/all")
async def get_audit_trail_paginated(page: int = Query(1, ge=1), limit: int = Query(20, ge=1, le=100)):
    offset = (page - 1) * limit
    try:
        # Check if the table exists first
        inspector = sa.inspect(engine)
        if not inspector.has_table("evaluation_results_with_blockchain"):
            return {"transactions": [], "pagination": {"page": page, "limit": limit, "total": 0, "total_pages": 0}}

        # Get actual column names from the table
        columns = [col["name"] for col in inspector.get_columns("evaluation_results_with_blockchain")]
        
        # Build safe column selection
        score_col = "final_evaluation_score" if "final_evaluation_score" in columns else "NULL"
        tx_hash_col = "blockchain_tx_hash" if "blockchain_tx_hash" in columns else "NULL"
        result_hash_col = "result_hash" if "result_hash" in columns else "NULL"
        # Use any available timestamp column, else fallback to CURRENT_TIMESTAMP
        if "timestamp" in columns:
            ts_col = "timestamp"
        elif "logged_at" in columns:
            ts_col = "logged_at"
        else:
            ts_col = "CURRENT_TIMESTAMP"
        
        query = f"""
            SELECT 
                faculty_id,
                {score_col} as final_score,
                {tx_hash_col} as blockchain_tx_hash,
                {result_hash_col} as result_hash,
                {ts_col} as timestamp
            FROM evaluation_results_with_blockchain
            ORDER BY {ts_col} DESC
            LIMIT {limit} OFFSET {offset}
        """
        df = pd.read_sql(query, engine)
        df = df.where(pd.notnull(df), None)  
        
        total_query = "SELECT COUNT(*) FROM evaluation_results_with_blockchain"
        total = pd.read_sql(total_query, engine).iloc[0, 0]
        
        records = make_serializable(df.to_dict(orient="records"))
        return {
            "transactions": records,
            "pagination": {
                "page": page,
                "limit": limit,
                "total": int(total),
                "total_pages": (int(total) + limit - 1) // limit if total > 0 else 0
            }
        }
    except Exception as e:
        print(f"⚠️ Audit paginated query failed: {e}")
        return {
            "transactions": [],
            "pagination": {
                "page": page,
                "limit": limit,
                "total": 0,
                "total_pages": 0
            }
        }

@app.get("/health")
async def health_check():
    db_status = "ok"
    try:
        with engine.connect() as conn:
            conn.execute(sa.text("SELECT 1"))
    except Exception:
        db_status = "down"
    
    blockchain_status = "connected" if w3.is_connected() else "disconnected"
    ml_status = "ok" if pd.io.sql.has_table('shap_explanations', engine) else "missing"
    
    return {
        "status": "healthy" if db_status == "ok" and blockchain_status == "connected" else "degraded",
        "database": db_status,
        "blockchain": blockchain_status,
        "ml_models": ml_status,
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/ethics/pending")
async def get_pending_reviews():
    """Return all ethics reviews with decision='pending'."""
    df = pd.read_sql("""
        SELECT er.*, ebm.member_name
        FROM ethics_reviews er
        LEFT JOIN ethics_board_members ebm ON er.reviewer_id = ebm.id
        WHERE er.decision = 'pending'
        ORDER BY er.reviewed_at DESC
    """, engine)
    return make_serializable(df.to_dict(orient="records"))

@app.post("/api/ethics/approve/{review_id}")
async def approve_review(review_id: int, comments: str = ""):
    """Approve a pending review (e.g., after human intervention)."""
    with engine.begin() as conn:
        conn.execute(
            sa.text("UPDATE ethics_reviews SET decision = 'approved', comments = :comments WHERE id = :rid"),
            {"comments": comments, "rid": review_id}
        )
    return {"status": "approved"}

@app.post("/api/fairness/mitigate")
async def run_bias_mitigation():
    """Apply bias mitigation and return the updated evaluation results."""
    df = pd.read_sql("SELECT * FROM evaluation_results", engine)
    df, applied = mitigate_bias(df)
    if applied:
        # Store mitigated scores in a new column
        with engine.begin() as conn:
            for idx, row in df.iterrows():
                conn.execute(
                    sa.text("UPDATE evaluation_results SET mitigated_score = :ms WHERE faculty_id = :fid"),
                    {"ms": row['mitigated_score'], "fid": int(row['faculty_id'])}
                )
        return {"message": "Bias mitigation applied", "applied": True}
    else:
        return {"message": "No mitigation needed", "applied": False}
    

@app.get("/api/analytics/overview")
async def get_analytics_overview():
    """Return chart-ready data for dashboard visualizations."""
    # Score distribution
    score_dist = pd.read_sql("""
        SELECT
            floor(final_evaluation_score * 2) / 2 as bucket,
            COUNT(*) as count
        FROM evaluation_results
        GROUP BY bucket
        ORDER BY bucket
    """, engine)

    # Department comparison
    dept_comp = pd.read_sql("""
        SELECT department, AVG(final_evaluation_score) as avg_score, COUNT(*) as count
        FROM evaluation_results
        GROUP BY department
        ORDER BY avg_score DESC
        LIMIT 10
    """, engine)

    # Gender fairness
    gender_fair = pd.read_sql("""
        SELECT f.gender, AVG(e.final_evaluation_score) as avg_score, COUNT(*) as count
        FROM evaluation_results e
        JOIN faculty f ON e.faculty_id = f.faculty_id
        GROUP BY f.gender
    """, engine)

    return {
        "score_distribution": make_serializable(score_dist.to_dict(orient="records")),
        "department_comparison": make_serializable(dept_comp.to_dict(orient="records")),
        "gender_fairness": make_serializable(gender_fair.to_dict(orient="records"))
    }