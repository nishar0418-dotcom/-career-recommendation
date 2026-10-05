"""
Opportunities CRUD and Search Blueprint
"""

from flask import Blueprint, request, jsonify
from app.database.connection import query_db, execute_db
from app.utils.auth import admin_required

opportunities_bp = Blueprint("opportunities", __name__)


def _normalize_opp(opp):
    """Ensure both 'company' and 'company_name' keys exist for frontend compatibility."""
    if not opp:
        return opp
    d = dict(opp)
    if "company" in d and "company_name" not in d:
        d["company_name"] = d["company"]
    elif "company_name" in d and "company" not in d:
        d["company"] = d["company_name"]
    return d


@opportunities_bp.route("/opportunities", methods=["GET"])
def get_opportunities():
    """Public/Authenticated search and filter endpoint for opportunities."""
    keyword = request.args.get("search", "").strip()
    domain = request.args.get("domain", "").strip()
    work_mode = request.args.get("work_mode", "").strip()
    opp_type = request.args.get("opportunity_type", "").strip()
    location = request.args.get("location", "").strip()

    sql = "SELECT * FROM opportunities WHERE 1=1"
    params = []

    if keyword:
        sql += " AND (title LIKE %s OR company LIKE %s OR required_skills LIKE %s OR description LIKE %s)"
        pattern = f"%{keyword}%"
        params.extend([pattern, pattern, pattern, pattern])

    if domain and domain.lower() != "all":
        sql += " AND domain LIKE %s"
        params.append(f"%{domain}%")

    if work_mode and work_mode.lower() != "all":
        sql += " AND work_mode LIKE %s"
        params.append(f"%{work_mode}%")

    if opp_type and opp_type.lower() != "all":
        sql += " AND opportunity_type LIKE %s"
        params.append(f"%{opp_type}%")

    if location and location.lower() != "all":
        sql += " AND location LIKE %s"
        params.append(f"%{location}%")

    sql += " ORDER BY id DESC"

    opportunities = query_db(sql, tuple(params) if params else None)
    normalized = [_normalize_opp(o) for o in opportunities]
    return jsonify({
        "opportunities": normalized,
        "count": len(normalized)
    }), 200


@opportunities_bp.route("/opportunities/<int:opp_id>", methods=["GET"])
def get_opportunity(opp_id):
    opp = query_db("SELECT * FROM opportunities WHERE id = %s", (opp_id,), one=True)
    if not opp:
        return jsonify({"error": "Opportunity not found"}), 404
    return jsonify({"opportunity": _normalize_opp(opp)}), 200


@opportunities_bp.route("/opportunities", methods=["POST"])
@admin_required
def create_opportunity():
    data = request.get_json() or {}
    title = data.get("title", "").strip()
    company = (data.get("company") or data.get("company_name") or "").strip()

    if not title or not company:
        return jsonify({"error": "Title and Company Name are required"}), 400

    sql = """
    INSERT INTO opportunities (
        company, title, description, domain, required_skills, preferred_skills,
        qualification, minimum_cgpa, location, opportunity_type, work_mode,
        stipend_or_salary, application_link
    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """
    params = (
        company,
        title,
        data.get("description", "").strip(),
        data.get("domain", "General Tech").strip(),
        data.get("required_skills", "").strip(),
        data.get("preferred_skills", "").strip(),
        data.get("qualification", "Bachelor's Degree").strip(),
        float(data.get("minimum_cgpa", 0.0) or 0.0),
        data.get("location", "Remote").strip(),
        data.get("opportunity_type", "Internship").strip(),
        data.get("work_mode", "Remote").strip(),
        data.get("stipend_or_salary", "Competitive").strip(),
        data.get("application_link", "https://linkedin.com").strip()
    )
    new_id = execute_db(sql, params)
    created = query_db("SELECT * FROM opportunities WHERE id = %s", (new_id,), one=True)

    return jsonify({"message": "Opportunity created successfully", "opportunity": _normalize_opp(created)}), 201


@opportunities_bp.route("/opportunities/<int:opp_id>", methods=["PUT"])
@admin_required
def update_opportunity(opp_id):
    existing = query_db("SELECT * FROM opportunities WHERE id = %s", (opp_id,), one=True)
    if not existing:
        return jsonify({"error": "Opportunity not found"}), 404

    data = request.get_json() or {}
    company = data.get("company") or data.get("company_name") or existing.get("company")

    sql = """
    UPDATE opportunities SET
        company = %s, title = %s, domain = %s, description = %s,
        required_skills = %s, preferred_skills = %s, qualification = %s,
        minimum_cgpa = %s, location = %s, opportunity_type = %s,
        work_mode = %s, stipend_or_salary = %s, application_link = %s
    WHERE id = %s
    """
    params = (
        company,
        data.get("title", existing["title"]),
        data.get("domain", existing["domain"]),
        data.get("description", existing["description"]),
        data.get("required_skills", existing["required_skills"]),
        data.get("preferred_skills", existing["preferred_skills"]),
        data.get("qualification", existing.get("qualification", "Bachelor's Degree")),
        float(data.get("minimum_cgpa", existing["minimum_cgpa"]) or 0.0),
        data.get("location", existing["location"]),
        data.get("opportunity_type", existing["opportunity_type"]),
        data.get("work_mode", existing["work_mode"]),
        data.get("stipend_or_salary", existing["stipend_or_salary"]),
        data.get("application_link", existing["application_link"]),
        opp_id
    )
    execute_db(sql, params)
    updated = query_db("SELECT * FROM opportunities WHERE id = %s", (opp_id,), one=True)
    return jsonify({"message": "Opportunity updated successfully", "opportunity": _normalize_opp(updated)}), 200


@opportunities_bp.route("/opportunities/<int:opp_id>", methods=["DELETE"])
@admin_required
def delete_opportunity(opp_id):
    existing = query_db("SELECT * FROM opportunities WHERE id = %s", (opp_id,), one=True)
    if not existing:
        return jsonify({"error": "Opportunity not found"}), 404

    execute_db("DELETE FROM opportunities WHERE id = %s", (opp_id,))
    return jsonify({"message": "Opportunity deleted successfully"}), 200
