"""
Recommendations Route Blueprint
===============================
Provides RESTful APIs for personalized recommendations, explainable match scores,
skill gap identification, and relational career role suggestions.

Endpoints:
  POST /api/recommendations      -> Accepts structured student profile payload and returns ranked opportunities
  GET  /api/recommendations      -> Returns ranked recommendations for the authenticated student
  GET  /api/recommendations/<id> -> Detailed breakdown for a single opportunity
  GET  /api/career-roles         -> Career role matches with skill gaps
"""

from flask import Blueprint, request, jsonify
from app.database.connection import query_db, execute_db
from app.utils.auth import token_required
from app.ai.recommendation_engine import (
    rank_opportunities,
    parse_skill_list
)
from app.ai.career_role_matcher import match_career_roles

recommendations_bp = Blueprint("recommendations", __name__)


def _fetch_all_opportunities_with_skills():
    """
    Fetches all opportunities and enriches them with relational skills from
    the normalized opportunity_skills and skills tables.
    """
    opps = query_db("SELECT * FROM opportunities ORDER BY id ASC")
    if not opps:
        return []

    # Fetch normalized opportunity-skill mappings
    opp_skills_rows = query_db("""
        SELECT os.opportunity_id, s.skill_name, os.is_required, os.importance_weight
        FROM opportunity_skills os
        JOIN skills s ON os.skill_id = s.id
        ORDER BY os.is_required DESC, os.importance_weight DESC
    """) or []

    skills_by_opp = {}
    for row in opp_skills_rows:
        o_id = row["opportunity_id"]
        if o_id not in skills_by_opp:
            skills_by_opp[o_id] = {"required": [], "preferred": []}
        if row.get("is_required", 1) == 1:
            skills_by_opp[o_id]["required"].append(row["skill_name"])
        else:
            skills_by_opp[o_id]["preferred"].append(row["skill_name"])

    enriched = []
    for opp in opps:
        item = dict(opp)
        o_id = opp["id"]
        rel = skills_by_opp.get(o_id, {})
        req = rel.get("required", [])
        pref = rel.get("preferred", [])

        # Relational skills take precedence; fallback to column strings if present
        if req:
            item["required_skills"] = ", ".join(req)
        elif "required_skills" not in item:
            item["required_skills"] = ""

        if pref:
            item["preferred_skills"] = ", ".join(pref)
        elif "preferred_skills" not in item:
            item["preferred_skills"] = ""

        # Normalize company naming
        if "company_name" in item and "company" not in item:
            item["company"] = item["company_name"]

        enriched.append(item)

    return enriched


def _get_student_full_profile(student_id: int):
    """Assembles a full student profile dict from normalized database tables."""
    student = query_db("SELECT * FROM students WHERE id = %s", (student_id,), one=True)
    if not student:
        # Fallback to users table
        student = query_db("SELECT * FROM users WHERE id = %s", (student_id,), one=True) or {}

    # Query normalized student skills
    skills_rows = query_db("""
        SELECT s.skill_name, ss.proficiency
        FROM student_skills ss
        JOIN skills s ON ss.skill_id = s.id
        WHERE ss.student_id = %s
    """, (student_id,)) or []

    skills = [{"name": r["skill_name"], "proficiency": r.get("proficiency", "Intermediate")} for r in skills_rows]
    if not skills:
        # Check if student_skills has skill_name directly
        raw_rows = query_db("SELECT skill_name, proficiency FROM student_skills WHERE student_id = %s", (student_id,)) or []
        skills = [{"name": r["skill_name"], "proficiency": r.get("proficiency", "Intermediate")} for r in raw_rows]

    # Query projects
    projects = query_db("SELECT project_name, description, technologies FROM projects WHERE student_id = %s", (student_id,)) or []

    # Query certifications
    certs_rows = query_db("SELECT name FROM certifications WHERE student_id = %s", (student_id,)) or []
    certifications = [r["name"] for r in certs_rows]

    return {
        "student_id": student_id,
        "name": student.get("name", ""),
        "email": student.get("email", ""),
        "department": student.get("department", ""),
        "year": student.get("year", ""),
        "cgpa": float(student.get("cgpa", 0.0) or 0.0),
        "preferred_domain": student.get("preferred_domain", "") or "",
        "preferred_location": student.get("preferred_location", "") or "",
        "opportunity_type": student.get("opportunity_type", "Both") or "Both",
        "work_mode": student.get("work_mode", "Any") or "Any",
        "skills": skills,
        "interests": parse_skill_list(student.get("preferred_domain", "")),
        "projects": projects,
        "certifications": certifications
    }


def _cache_recommendations(student_id: int, ranked_items: list):
    """Saves top generated recommendations in the database audit/cache table."""
    try:
        execute_db("DELETE FROM recommendations WHERE student_id = %s", (student_id,))
        for rec in ranked_items[:15]:
            opp_id = rec.get("opportunity_id") or rec.get("id")
            breakdown = rec.get("score_breakdown", {})
            execute_db("""
                INSERT INTO recommendations (
                    student_id, opportunity_id,
                    skill_match_score, interest_match_score, qualification_score,
                    project_match_score, preference_score, final_score,
                    matching_skills, missing_skills
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                student_id,
                opp_id,
                float(breakdown.get("skill_match", 0.0)),
                float(breakdown.get("interest_match", 0.0)),
                float(breakdown.get("qualification_match", 0.0)),
                float(breakdown.get("project_match", 0.0)),
                float(breakdown.get("preference_match", 0.0)),
                float(rec.get("final_score", 0.0)),
                ", ".join(rec.get("matching_skills", [])),
                ", ".join(rec.get("missing_skills", []))
            ))
    except Exception as e:
        # Logging or non-fatal cache save
        pass


@recommendations_bp.route("/recommendations", methods=["POST"])
def post_recommendations():
    """
    POST /api/recommendations
    Computes explainable recommendations based on a structured student profile.
    Accepts full student profile JSON and returns ranked opportunities with
    matching skills, skill gaps, and component score breakdown.
    """
    data = request.get_json(silent=True)
    if not data or not isinstance(data, dict):
        return jsonify({
            "error": "Invalid request payload",
            "message": "A JSON object containing student profile data is required."
        }), 400

    student_id = data.get("student_id", 0)

    # Validate CGPA if supplied
    cgpa = data.get("cgpa", 0.0)
    try:
        cgpa = float(cgpa)
        if cgpa < 0.0 or cgpa > 10.0:
            return jsonify({"error": "Invalid CGPA", "message": "CGPA must be between 0.0 and 10.0."}), 400
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid CGPA", "message": "CGPA must be a valid numeric value."}), 400

    # Assemble student profile payload
    student_profile = {
        "student_id": student_id,
        "skills": data.get("skills", []),
        "interests": data.get("interests", []),
        "cgpa": cgpa,
        "department": data.get("department", ""),
        "year": data.get("year", ""),
        "projects": data.get("projects", []),
        "certifications": data.get("certifications", []),
        "preferred_location": data.get("preferred_location", ""),
        "opportunity_type": data.get("opportunity_type", "Both"),
        "work_mode": data.get("work_mode", "Any")
    }

    # Fetch opportunities from database
    opportunities = _fetch_all_opportunities_with_skills()
    if not opportunities:
        return jsonify({
            "student_id": student_id,
            "recommendations": [],
            "count": 0,
            "message": "No opportunities found in database."
        }), 200

    # Rank opportunities using the 5-factor weighted algorithm
    ranked = rank_opportunities(student_profile, opportunities)

    # Cache top results if student_id > 0
    if student_id > 0:
        _cache_recommendations(student_id, ranked)

    # Format structured response
    formatted_recs = []
    for item in ranked:
        formatted_recs.append({
            "opportunity_id": item.get("id") or item.get("opportunity_id"),
            "title": item.get("title", ""),
            "company": item.get("company_name") or item.get("company", ""),
            "domain": item.get("domain", ""),
            "location": item.get("location", ""),
            "opportunity_type": item.get("opportunity_type", ""),
            "work_mode": item.get("work_mode", ""),
            "final_score": item.get("final_score", 0.0),
            "match_percentage": item.get("final_score", 0.0),
            "matching_skills": item.get("matching_skills", []),
            "missing_skills": item.get("missing_skills", []),
            "skill_gap_count": item.get("skill_gap_count", len(item.get("missing_skills", []))),
            "explanation": item.get("explanation", ""),
            "explanation_details": item.get("explanation_details", []),
            "score_breakdown": item.get("score_breakdown", {}),
            "sparse_data_renormalized": item.get("sparse_data_renormalized", False),
            "application_url": item.get("application_url", "")
        })

    return jsonify({
        "student_id": student_id,
        "recommendations": formatted_recs,
        "count": len(formatted_recs)
    }), 200


@recommendations_bp.route("/recommendations", methods=["GET"])
@token_required
def get_recommendations():
    """
    GET /api/recommendations
    Returns ranked opportunities for the logged-in student.
    Maintains backward compatibility with the frontend dashboard and supports query filters.
    """
    user = request.current_user
    u_id = user["id"]

    student_data = _get_student_full_profile(u_id)

    # Optional query filters
    domain_filter = request.args.get("domain")
    work_mode_filter = request.args.get("work_mode")
    type_filter = request.args.get("type")
    min_match = request.args.get("min_match", type=float)

    opportunities = _fetch_all_opportunities_with_skills()
    if not opportunities:
        return jsonify({"recommendations": [], "count": 0}), 200

    ranked = rank_opportunities(student_data, opportunities)

    # Filter results
    filtered_results = []
    for item in ranked:
        if domain_filter and domain_filter.lower() not in item.get("domain", "").lower():
            continue
        if work_mode_filter and work_mode_filter.lower() != "all" and work_mode_filter.lower() not in item.get("work_mode", "").lower():
            continue
        if type_filter and type_filter.lower() != "all" and type_filter.lower() not in item.get("opportunity_type", "").lower():
            continue
        if min_match is not None and item.get("final_score", 0.0) < min_match:
            continue

        formatted_item = dict(item)
        formatted_item["opportunity_id"] = item.get("id") or item.get("opportunity_id")
        formatted_item["company"] = item.get("company_name") or item.get("company", "")
        filtered_results.append(formatted_item)

    # Cache top recommendations
    _cache_recommendations(u_id, filtered_results)

    return jsonify({
        "student_id": u_id,
        "recommendations": filtered_results,
        "count": len(filtered_results),
        "student_skills": [s["name"] if isinstance(s, dict) else s for s in student_data["skills"]]
    }), 200


@recommendations_bp.route("/recommendations/<int:opp_id>", methods=["GET"])
@token_required
def get_single_recommendation(opp_id):
    """GET /api/recommendations/<id> - Single opportunity match details."""
    user = request.current_user
    u_id = user["id"]

    opportunities = _fetch_all_opportunities_with_skills()
    target_opp = next((o for o in opportunities if o["id"] == opp_id), None)
    if not target_opp:
        return jsonify({"error": "Opportunity not found"}), 404

    student_data = _get_student_full_profile(u_id)
    ranked = rank_opportunities(student_data, [target_opp])
    item = ranked[0] if ranked else target_opp

    return jsonify({"opportunity": item}), 200


@recommendations_bp.route("/career-roles", methods=["GET"])
@token_required
def get_career_roles():
    """GET /api/career-roles - Career roles matched against student skill set."""
    user = request.current_user
    u_id = user["id"]

    student_data = _get_student_full_profile(u_id)
    student_skill_names = [s["name"] if isinstance(s, dict) else str(s) for s in student_data["skills"]]
    interests = student_data["interests"]

    roles = match_career_roles(student_skill_names, interests)
    return jsonify({
        "career_roles": roles,
        "student_skills": student_skill_names
    }), 200
