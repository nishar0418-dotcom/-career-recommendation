"""
Skill Gap Analysis Blueprint
Computes missing skills matrix and personalized learning roadmaps.
"""

from flask import Blueprint, request, jsonify
from app.database.connection import query_db
from app.utils.auth import token_required
from app.ai.skill_gap_analyzer import analyze_skill_gaps

skill_gap_bp = Blueprint("skill_gap", __name__)

@skill_gap_bp.route("/skill-gaps", methods=["GET"])
@token_required
def get_skill_gaps():
    user = request.current_user
    u_id = user["id"]

    # 1. Fetch student's current skills
    skills_rows = query_db("SELECT skill_name FROM student_skills WHERE student_id = %s", (u_id,))
    student_skills = [r["skill_name"] for r in skills_rows]

    # 2. Fetch opportunities (optionally filtered by student's domain preference)
    profile = query_db("SELECT preferred_domain FROM student_profiles WHERE user_id = %s", (u_id,), one=True) or {}
    domain = profile.get("preferred_domain")

    if domain:
        opportunities = query_db("SELECT * FROM opportunities WHERE domain LIKE %s", (f"%{domain}%",))
    else:
        opportunities = []

    # If domain specific list is small, use all opportunities for market-wide analysis
    if len(opportunities) < 3:
        opportunities = query_db("SELECT * FROM opportunities")

    # 3. Analyze skill gaps
    analysis_result = analyze_skill_gaps(student_skills, opportunities)

    return jsonify({
        "summary": analysis_result["summary"],
        "gaps_table": analysis_result["gaps_table"],
        "learning_recommendations": analysis_result["learning_recommendations"],
        "student_skills_count": len(student_skills)
    }), 200
