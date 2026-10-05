from flask import Blueprint, request, jsonify
from app.database.connection import query_db, execute_db, get_db
from app.utils.auth import token_required

student_bp = Blueprint("student", __name__)

@student_bp.route("/profile", methods=["GET"])
@token_required
def get_profile():
    u_id = request.current_user["id"]

    # 1. Fetch user record
    user_row = query_db(
        "SELECT id, name, email, department, year, college, qualification, role FROM users WHERE id = %s",
        (u_id,),
        one=True
    )
    user = dict(user_row) if user_row else request.current_user

    # 2. Fetch profile
    profile = query_db(
        "SELECT * FROM student_profiles WHERE user_id = %s",
        (u_id,),
        one=True
    )
    if not profile:
        execute_db(
            "INSERT INTO student_profiles (user_id, cgpa, interests, preferred_domain, preferred_location, opportunity_type, work_mode, college, qualification) VALUES (%s, 0.00, '', '', '', 'Both', 'Any', %s, %s)",
            (u_id, user.get("college", ""), user.get("qualification", ""))
        )
        profile = query_db("SELECT * FROM student_profiles WHERE user_id = %s", (u_id,), one=True) or {}

    # 3. Fetch skills
    skills_rows = query_db(
        "SELECT skill_name, proficiency FROM student_skills WHERE student_id = %s ORDER BY id ASC",
        (u_id,)
    )
    skills = [r["skill_name"] for r in skills_rows]
    skills_detailed = skills_rows

    # 4. Fetch projects
    projects = query_db(
        "SELECT id, project_name, description, technologies FROM projects WHERE student_id = %s ORDER BY id ASC",
        (u_id,)
    )

    # 5. Fetch certifications
    certifications = query_db(
        "SELECT id, certification_name, organization FROM certifications WHERE student_id = %s ORDER BY id ASC",
        (u_id,)
    )

    college = user.get("college") or profile.get("college") or "Rathinam Group of Institutions"
    qualification = user.get("qualification") or profile.get("qualification") or "B.E. Computer Science and Engineering"
    dept = user.get("department") or "Computer Science & Engineering"
    year = user.get("year") or "3rd Year"

    user["college"] = college
    user["qualification"] = qualification
    user["department"] = dept
    user["year"] = year
    user["year_of_study"] = year

    return jsonify({
        "user": user,
        "profile": {
            "name": user.get("name", ""),
            "email": user.get("email", ""),
            "college": college,
            "department": dept,
            "year": year,
            "qualification": qualification,
            "cgpa": float(profile.get("cgpa", 0.0) or 0.0),
            "interests": profile.get("interests", "") or "",
            "preferred_domain": profile.get("preferred_domain", "") or "",
            "preferred_location": profile.get("preferred_location", "") or "",
            "opportunity_type": profile.get("opportunity_type", "Both") or "Both",
            "work_mode": profile.get("work_mode", "Any") or "Any"
        },
        "skills": skills,
        "skills_detailed": skills_detailed,
        "projects": projects,
        "certifications": certifications
    }), 200


@student_bp.route("/profile", methods=["PUT"])
@token_required
def update_profile():
    u_id = request.current_user["id"]
    current_email = request.current_user.get("email", "")
    data = request.get_json() or {}

    # Update user identity & academic info (name, college, department, year, qualification)
    name = (data.get("name") or request.current_user.get("name", "")).strip()
    college = (data.get("college") or request.current_user.get("college", "Rathinam Group of Institutions")).strip()
    dept = (data.get("department") or request.current_user.get("department", "Computer Science & Engineering")).strip()
    year = (data.get("year") or request.current_user.get("year", "3rd Year")).strip()
    qualification = (data.get("qualification") or request.current_user.get("qualification", "B.E. Computer Science and Engineering")).strip()

    execute_db(
        "UPDATE users SET name = %s, college = %s, department = %s, year = %s, qualification = %s WHERE id = %s",
        (name, college, dept, year, qualification, u_id)
    )
    execute_db(
        "UPDATE students SET name = %s, college = %s, department = %s, year = %s, qualification = %s WHERE id = %s OR email = %s",
        (name, college, dept, year, qualification, u_id, current_email)
    )

    # Update student_profiles
    cgpa = float(data.get("cgpa", 0.0) or 0.0)
    interests = data.get("interests", "")
    if isinstance(interests, list):
        interests = ",".join(interests)
    pref_domain = data.get("preferred_domain", "")
    pref_loc = data.get("preferred_location", "")
    opp_type = data.get("opportunity_type", "Both")
    work_mode = data.get("work_mode", "Any")

    with get_db() as db:
        cur = db.cursor()
        cur.execute("""
            INSERT OR REPLACE INTO student_profiles (user_id, cgpa, interests, preferred_domain, preferred_location, opportunity_type, work_mode, college, qualification)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """ if db.is_sqlite else """
            INSERT INTO student_profiles (user_id, cgpa, interests, preferred_domain, preferred_location, opportunity_type, work_mode, college, qualification)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE
                cgpa = VALUES(cgpa),
                interests = VALUES(interests),
                preferred_domain = VALUES(preferred_domain),
                preferred_location = VALUES(preferred_location),
                opportunity_type = VALUES(opportunity_type),
                work_mode = VALUES(work_mode),
                college = VALUES(college),
                qualification = VALUES(qualification)
        """, (u_id, cgpa, interests, pref_domain, pref_loc, opp_type, work_mode, college, qualification))

        # Replace skills
        cur.execute("DELETE FROM student_skills WHERE student_id = %s", (u_id,))
        new_skills = data.get("skills", [])
        for item in new_skills:
            if isinstance(item, dict):
                s_name = (item.get("skill_name") or item.get("name") or "").strip()
                s_prof = item.get("proficiency") or "Intermediate"
            else:
                s_name = str(item).strip()
                s_prof = "Intermediate"
            if s_name:
                cur.execute(
                    "INSERT INTO student_skills (student_id, skill_name, proficiency) VALUES (%s, %s, %s)",
                    (u_id, s_name, s_prof)
                )

        # Replace projects
        cur.execute("DELETE FROM projects WHERE student_id = %s", (u_id,))
        for p in data.get("projects", []):
            p_name = (p.get("project_name") or "").strip()
            p_desc = (p.get("description") or "").strip()
            p_tech = (p.get("technologies") or "").strip()
            if p_name:
                cur.execute(
                    "INSERT INTO projects (student_id, project_name, description, technologies) VALUES (%s, %s, %s, %s)",
                    (u_id, p_name, p_desc, p_tech)
                )

        # Replace certifications
        cur.execute("DELETE FROM certifications WHERE student_id = %s", (u_id,))
        for c in data.get("certifications", []):
            c_name = (c.get("certification_name") or c.get("name") or "").strip()
            c_org = (c.get("organization") or "").strip()
            if c_name:
                cur.execute(
                    "INSERT INTO certifications (student_id, certification_name, organization) VALUES (%s, %s, %s)",
                    (u_id, c_name, c_org)
                )

        db.commit()

    fresh_user = query_db(
        "SELECT id, name, email, department, year, college, qualification, role FROM users WHERE id = %s",
        (u_id,),
        one=True
    )
    user_resp = dict(fresh_user) if fresh_user else dict(request.current_user)
    user_resp["year_of_study"] = user_resp.get("year", "")

    return jsonify({
        "message": "Student profile updated successfully.",
        "user": user_resp
    }), 200


@student_bp.route("/skills", methods=["GET"])
@student_bp.route("/skills-catalog", methods=["GET"])
def get_skills_catalog():
    rows = query_db("SELECT skill_name, category FROM skills ORDER BY category, skill_name ASC") or []
    categories = {}
    for r in rows:
        cat = r.get("category") or "General"
        if cat not in categories:
            categories[cat] = []
        categories[cat].append(r.get("skill_name"))

    return jsonify({
        "skills": rows,
        "categories": categories
    }), 200


@student_bp.route("/skills", methods=["POST"])
@token_required
def add_student_skill():
    u_id = request.current_user["id"]
    data = request.get_json() or {}
    skill_name = (data.get("skill_name") or data.get("name") or "").strip()
    proficiency = data.get("proficiency") or "Intermediate"

    if not skill_name:
        return jsonify({"error": "Skill name is required"}), 400

    execute_db(
        "INSERT INTO student_skills (student_id, skill_name, proficiency) VALUES (%s, %s, %s)",
        (u_id, skill_name, proficiency)
    )
    return jsonify({"message": f"Skill '{skill_name}' added successfully."}), 201


@student_bp.route("/skills/<int:skill_id>", methods=["DELETE"])
@token_required
def delete_student_skill(skill_id):
    u_id = request.current_user["id"]
    execute_db("DELETE FROM student_skills WHERE id = %s AND student_id = %s", (skill_id, u_id))
    return jsonify({"message": "Skill deleted successfully."}), 200


@student_bp.route("/projects", methods=["POST"])
@token_required
def add_student_project():
    u_id = request.current_user["id"]
    data = request.get_json() or {}
    name = (data.get("project_name") or "").strip()
    desc = (data.get("description") or "").strip()
    tech = (data.get("technologies") or "").strip()

    if not name:
        return jsonify({"error": "Project name is required"}), 400

    new_id = execute_db(
        "INSERT INTO projects (student_id, project_name, description, technologies) VALUES (%s, %s, %s, %s)",
        (u_id, name, desc, tech)
    )
    return jsonify({"message": "Project added successfully.", "id": new_id}), 201


@student_bp.route("/projects/<int:project_id>", methods=["DELETE"])
@token_required
def delete_student_project(project_id):
    u_id = request.current_user["id"]
    execute_db("DELETE FROM projects WHERE id = %s AND student_id = %s", (project_id, u_id))
    return jsonify({"message": "Project deleted successfully."}), 200


@student_bp.route("/certifications", methods=["POST"])
@token_required
def add_student_cert():
    u_id = request.current_user["id"]
    data = request.get_json() or {}
    name = (data.get("certification_name") or "").strip()
    org = (data.get("organization") or "").strip()

    if not name:
        return jsonify({"error": "Certification name is required"}), 400

    new_id = execute_db(
        "INSERT INTO certifications (student_id, certification_name, organization) VALUES (%s, %s, %s)",
        (u_id, name, org)
    )
    return jsonify({"message": "Certification added successfully.", "id": new_id}), 201


@student_bp.route("/certifications/<int:cert_id>", methods=["DELETE"])
@token_required
def delete_student_cert(cert_id):
    u_id = request.current_user["id"]
    execute_db("DELETE FROM certifications WHERE id = %s AND student_id = %s", (cert_id, u_id))
    return jsonify({"message": "Certification deleted successfully."}), 200

