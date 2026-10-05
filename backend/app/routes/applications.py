"""
Applications Route Blueprint
============================
Provides RESTful APIs for students to directly apply to recommended internships/jobs,
track application status, and view application receipts.
"""

from flask import Blueprint, request, jsonify
from app.database.connection import query_db, execute_db
from app.utils.auth import decode_token

applications_bp = Blueprint("applications", __name__)


def _get_current_student():
    """Helper to extract authenticated student from JWT token or request body."""
    auth_header = request.headers.get("Authorization")
    if auth_header and "Bearer " in auth_header:
        token = auth_header.split(" ")[1]
        payload = decode_token(token)
        if payload and "user_id" in payload:
            user = query_db("SELECT id, name, email, department, year FROM users WHERE id = %s", (payload["user_id"],), one=True)
            if user:
                return dict(user)
    return None


@applications_bp.route("/applications", methods=["POST"])
def submit_application():
    """
    POST /api/applications
    Submits a direct job application to an opportunity.
    """
    data = request.get_json(silent=True) or {}
    opportunity_id = data.get("opportunity_id")
    if not opportunity_id:
        return jsonify({"error": "Missing field", "message": "opportunity_id is required."}), 400

    opp = query_db("SELECT * FROM opportunities WHERE id = %s", (opportunity_id,), one=True)
    if not opp:
        return jsonify({"error": "Opportunity not found", "message": "The selected opportunity does not exist."}), 404

    current_student = _get_current_student()
    student_id = (current_student and current_student.get("id")) or data.get("student_id") or 1
    student_name = data.get("student_name") or (current_student and current_student.get("name")) or "Student Applicant"
    student_email = data.get("student_email") or (current_student and current_student.get("email")) or "applicant@example.com"
    contact_phone = data.get("contact_phone", "").strip()
    portfolio_url = data.get("portfolio_url", "").strip()
    cover_note = data.get("cover_note", "").strip()

    # Prevent duplicate applications
    existing = query_db(
        "SELECT id, status, created_at FROM applications WHERE student_id = %s AND opportunity_id = %s",
        (student_id, opportunity_id),
        one=True
    )
    if existing:
        ref_no = f"APP-2026-{existing['id']:04d}"
        return jsonify({
            "success": True,
            "already_applied": True,
            "message": f"You have already applied for this role at {opp.get('company_name') or opp.get('company')}.",
            "application": {
                "id": existing["id"],
                "reference_number": ref_no,
                "opportunity_id": opportunity_id,
                "company_name": opp.get("company_name") or opp.get("company"),
                "title": opp.get("title"),
                "status": existing.get("status", "Under Review"),
                "created_at": existing.get("created_at")
            }
        }), 200

    # Insert into applications
    app_id = execute_db("""
        INSERT INTO applications (
            student_id, opportunity_id, student_name, student_email,
            contact_phone, portfolio_url, cover_note, status
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    """, (
        student_id,
        opportunity_id,
        student_name,
        student_email,
        contact_phone,
        portfolio_url,
        cover_note,
        "Under Review"
    ))

    # Fallback to last insert id if execute_db did not return id
    if not app_id or app_id <= 0:
        row = query_db("SELECT id FROM applications WHERE student_id = %s AND opportunity_id = %s ORDER BY id DESC LIMIT 1", (student_id, opportunity_id), one=True)
        app_id = row["id"] if row else 1

    ref_no = f"APP-2026-{app_id:04d}"
    company_name = opp.get("company_name") or opp.get("company") or "the hiring company"

    return jsonify({
        "success": True,
        "message": f"Application submitted successfully to {company_name}!",
        "application": {
            "id": app_id,
            "reference_number": ref_no,
            "opportunity_id": opportunity_id,
            "company_name": company_name,
            "title": opp.get("title"),
            "status": "Under Review",
            "applied_at": datetime.now(timezone.utc).isoformat()
        }
    }), 201


@applications_bp.route("/applications", methods=["GET"])
def get_student_applications():
    """
    GET /api/applications
    Returns all submitted applications for the authenticated student.
    """
    current_student = _get_current_student()
    student_id = (current_student and current_student.get("id")) or request.args.get("student_id", type=int) or 1

    rows = query_db("""
        SELECT a.id, a.opportunity_id, a.student_id, a.student_name, a.student_email,
               a.contact_phone, a.portfolio_url, a.cover_note, a.status, a.created_at,
               o.title,
               COALESCE(o.company_name, o.company, 'Company') AS company_name,
               COALESCE(o.company, o.company_name, 'Company') AS company,
               o.location, o.opportunity_type, o.domain, o.stipend_or_salary
        FROM applications a
        JOIN opportunities o ON a.opportunity_id = o.id
        WHERE a.student_id = %s
        ORDER BY a.id DESC
    """, (student_id,)) or []

    results = []
    for r in rows:
        item = dict(r)
        item["reference_number"] = f"APP-2026-{r['id']:04d}"
        results.append(item)

    return jsonify({
        "student_id": student_id,
        "applications": results,
        "count": len(results)
    }), 200


@applications_bp.route("/applications/check/<int:opp_id>", methods=["GET"])
def check_application_status(opp_id):
    """GET /api/applications/check/<id> - Checks if student has already applied."""
    current_student = _get_current_student()
    student_id = (current_student and current_student.get("id")) or request.args.get("student_id", type=int) or 1

    row = query_db(
        "SELECT id, status, created_at FROM applications WHERE student_id = %s AND opportunity_id = %s",
        (student_id, opp_id),
        one=True
    )
    if row:
        return jsonify({
            "applied": True,
            "application_id": row["id"],
            "reference_number": f"APP-2026-{row['id']:04d}",
            "status": row.get("status", "Under Review"),
            "applied_at": row.get("created_at")
        }), 200

    return jsonify({"applied": False}), 200
