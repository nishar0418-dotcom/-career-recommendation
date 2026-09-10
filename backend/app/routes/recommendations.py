"""
Recommendations Route Blueprint
Computes personalized ranked opportunities (Jobs/Internships) and Career Role matches.
"""

from flask import Blueprint, request, jsonify
from app.database.connection import query_db, execute_db
from app.utils.auth import token_required
from app.ai.recommendation_engine import rank_opportunities, parse_skill_list
from app.ai.career_role_matcher import match_career_roles

recommendations_bp = Blueprint("recommendations", __name__)


def _get_student_full_profile(student_id: int):
    """Helper to assemble student profile dict for AI engine."""
    profile = query_db("SELECT * FROM student_profiles WHERE user_id = %s", (student_id,), one=True) or {}
    skills_rows = query_db("SELECT skill_name FROM student_skills WHERE student_id = %s", (student_id,))
    skills = [r["skill_name"] for r in skills_rows]
    projects = query_db("SELECT project_name, description, technologies FROM projects WHERE student_id = %s", (student_id,))
    
    return {
        "skills": skills,
        "interests": profile.get("interests", "") or "",
        "cgpa": float(profile.get("cgpa", 0.0) or 0.0),
        "projects": projects,
        "opportunity_type": profile.get("opportunity_type", "Both") or "Both",
        "work_mode": profile.get("work_mode", "Any") or "Any",
        "preferred_location": profile.get("preferred_location", "") or "",
        "preferred_domain": profile.get("preferred_domain", "") or ""
    }


@recommendations_bp.route("/recommendations", methods=["GET"])
@token_required
def get_recommendations():
    user = request.current_user
    u_id = user["id"]

    student_data = _get_student_full_profile(u_id)

    # Optional query filters
    domain_filter = request.args.get("domain")
    work_mode_filter = request.args.get("work_mode")
    type_filter = request.args.get("type")
    min_match = request.args.get("min_match", type=float)

    # Fetch opportunities from DB
    opportunities = query_db("SELECT * FROM opportunities ORDER BY id ASC")
    if not opportunities:
        return jsonify({"recommendations": [], "count": 0}), 200

    # Execute AI ranking algorithm
    ranked = rank_opportunities(student_data, opportunities)

    # Apply optional filters
    filtered_results = []
    for item in ranked:
        if domain_filter and domain_filter.lower() not in item.get("domain", "").lower():
            continue
        if work_mode_filter and work_mode_filter.lower() != "all" and work_mode_filter.lower() not in item.get("work_mode", "").lower():
            continue
        if type_filter and type_filter.lower() != "all" and type_filter.lower() not in item.get("opportunity_type", "").lower():
            continue
        if min_match is not None and item.get("match_percentage", 0.0) < min_match:
            continue
        filtered_results.append(item)

    # Cache top recommendations in background/table for history
    try:
        execute_db("DELETE FROM recommendations WHERE student_id = %s", (u_id,))
        for top_rec in filtered_results[:10]:
            execute_db(
                """
                INSERT INTO recommendations (student_id, opportunity_id, match_percentage, matching_skills, missing_skills)
                VALUES (%s, %s, %s, %s, %s)
                """,
                (
                    u_id,
                    top_rec["id"],
                    top_rec["match_percentage"],
                    ", ".join(top_rec["matching_skills"]),
                    ", ".join(top_rec["missing_skills"])
                )
            )
    except Exception:
        pass  # Non-fatal if table is busy

    return jsonify({
        "recommendations": filtered_results,
        "count": len(filtered_results),
        "student_skills": student_data["skills"]
    }), 200


@recommendations_bp.route("/recommendations/<int:opp_id>", methods=["GET"])
@token_required
def get_single_recommendation(opp_id):
    user = request.current_user
    u_id = user["id"]

    opp = query_db("SELECT * FROM opportunities WHERE id = %s", (opp_id,), one=True)
    if not opp:
        return jsonify({"error": "Opportunity not found"}), 404

    student_data = _get_student_full_profile(u_id)
    ranked = rank_opportunities(student_data, [opp])
    item = ranked[0] if ranked else opp

    return jsonify({"opportunity": item}), 200


@recommendations_bp.route("/career-roles", methods=["GET"])
@token_required
def get_career_roles():
    user = request.current_user
    u_id = user["id"]

    student_data = _get_student_full_profile(u_id)
    interests = parse_skill_list(student_data["interests"])

    roles = match_career_roles(student_data["skills"], interests)
    return jsonify({
        "career_roles": roles,
        "student_skills": student_data["skills"]
    }), 200
