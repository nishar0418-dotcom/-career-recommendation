"""
Skill Gap Analysis Blueprint
=============================
Computes missing skills matrix, demand frequencies, and personalized learning roadmaps
leveraging the normalized relational skills taxonomy and opportunities.
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

    # 1. Fetch student's current skills from normalized tables
    skills_rows = query_db("""
        SELECT s.skill_name, ss.proficiency
        FROM student_skills ss
        JOIN skills s ON ss.skill_id = s.id
        WHERE ss.student_id = %s
    """, (u_id,))

    student_skills = [r["skill_name"] for r in (skills_rows or [])]
    if not student_skills:
        # Fallback query in case student_skills has skill_name column
        raw_rows = query_db("SELECT skill_name FROM student_skills WHERE student_id = %s", (u_id,)) or []
        student_skills = [r["skill_name"] for r in raw_rows if r.get("skill_name")]

    # 2. Fetch student domain preference from normalized students table
    student = query_db("SELECT preferred_domain FROM students WHERE id = %s", (u_id,), one=True)
    if not student:
        student = query_db("SELECT preferred_domain FROM student_profiles WHERE user_id = %s", (u_id,), one=True) or {}
    domain = student.get("preferred_domain")

    if domain:
        opportunities = query_db("SELECT * FROM opportunities WHERE domain LIKE %s", (f"%{domain}%",))
    else:
        opportunities = []

    # If domain-specific list is small, use all opportunities for market-wide analysis
    if not opportunities or len(opportunities) < 3:
        opportunities = query_db("SELECT * FROM opportunities")

    # Enrich opportunities with relational required and preferred skills
    opp_skills_rows = query_db("""
        SELECT os.opportunity_id, s.skill_name, os.is_required
        FROM opportunity_skills os
        JOIN skills s ON os.skill_id = s.id
    """) or []

    skills_by_opp = {}
    for row in opp_skills_rows:
        o_id = row["opportunity_id"]
        if o_id not in skills_by_opp:
            skills_by_opp[o_id] = []
        skills_by_opp[o_id].append(row["skill_name"])

    enriched_opps = []
    for opp in (opportunities or []):
        item = dict(opp)
        rel_skills = skills_by_opp.get(opp["id"], [])
        if rel_skills:
            item["required_skills"] = ", ".join(rel_skills)
        enriched_opps.append(item)

    # 3. Analyze skill gaps
    analysis_result = analyze_skill_gaps(student_skills, enriched_opps)

    return jsonify({
        "summary": analysis_result["summary"],
        "gaps_table": analysis_result["gaps_table"],
        "learning_recommendations": analysis_result["learning_recommendations"],
        "student_skills_count": len(student_skills)
    }), 200
