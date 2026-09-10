"""
Admin Dashboard & Analytics Blueprint
Provides administration management metrics, student overviews, and system analytics.
"""

from flask import Blueprint, request, jsonify
from app.database.connection import query_db
from app.utils.auth import admin_required

admin_bp = Blueprint("admin", __name__)


@admin_bp.route("/admin/stats", methods=["GET"])
@admin_required
def get_admin_stats():
    # 1. Counts
    student_count_row = query_db("SELECT COUNT(*) as count FROM users WHERE role = 'student'", one=True)
    students_count = student_count_row["count"] if student_count_row else 0

    opp_count_row = query_db("SELECT COUNT(*) as count FROM opportunities", one=True)
    opp_count = opp_count_row["count"] if opp_count_row else 0

    rec_count_row = query_db("SELECT COUNT(*) as count FROM recommendations", one=True)
    rec_count = rec_count_row["count"] if rec_count_row else 0

    skills_count_row = query_db("SELECT COUNT(*) as count FROM skills", one=True)
    skills_count = skills_count_row["count"] if skills_count_row else 0

    # 2. Opportunities by Domain
    domain_rows = query_db("SELECT domain, COUNT(*) as count FROM opportunities GROUP BY domain ORDER BY count DESC")

    # 3. Top student skills
    popular_skills = query_db(
        "SELECT skill_name, COUNT(*) as count FROM student_skills GROUP BY skill_name ORDER BY count DESC LIMIT 8"
    )

    # 4. Work Mode distribution
    work_modes = query_db("SELECT work_mode, COUNT(*) as count FROM opportunities GROUP BY work_mode")

    return jsonify({
        "stats": {
            "total_students": students_count,
            "total_opportunities": opp_count,
            "total_recommendations": rec_count,
            "total_skills_catalog": skills_count
        },
        "domain_distribution": domain_rows,
        "popular_skills": popular_skills,
        "work_mode_distribution": work_modes
    }), 200


@admin_bp.route("/admin/students", methods=["GET"])
@admin_required
def get_admin_students():
    sql = """
    SELECT 
        u.id, u.name, u.email, u.department, u.year_of_study, u.created_at,
        p.cgpa, p.preferred_domain, p.opportunity_type, p.work_mode,
        COUNT(DISTINCT s.id) as skills_count,
        COUNT(DISTINCT pr.id) as projects_count,
        COUNT(DISTINCT c.id) as certs_count
    FROM users u
    LEFT JOIN student_profiles p ON u.id = p.user_id
    LEFT JOIN student_skills s ON u.id = s.student_id
    LEFT JOIN projects pr ON u.id = pr.student_id
    LEFT JOIN certifications c ON u.id = c.student_id
    WHERE u.role = 'student'
    GROUP BY u.id
    ORDER BY u.id DESC
    """
    students = query_db(sql)

    # Calculate completion percentage for each
    student_list = []
    for s in students:
        completion = 0
        if s.get("department"): completion += 15
        if s.get("cgpa") and float(s.get("cgpa") or 0) > 0: completion += 20
        if s.get("skills_count", 0) > 0: completion += 25
        if s.get("projects_count", 0) > 0: completion += 25
        if s.get("certs_count", 0) > 0: completion += 15
        completion = min(100, completion)

        item = dict(s)
        item["profile_completion"] = completion
        student_list.append(item)

    return jsonify({"students": student_list, "count": len(student_list)}), 200
