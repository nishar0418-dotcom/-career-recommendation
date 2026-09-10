from flask import Blueprint, request, jsonify
from app.database.connection import query_db, execute_db, get_db
from app.utils.auth import token_required

student_bp = Blueprint("student", __name__)

@student_bp.route("/profile", methods=["GET"])
@token_required
def get_profile():
    user = request.current_user
    u_id = user["id"]

    # 1. Fetch profile
    profile = query_db(
        "SELECT * FROM student_profiles WHERE user_id = %s",
        (u_id,),
        one=True
    )
    if not profile:
        execute_db(
            "INSERT INTO student_profiles (user_id, cgpa, interests, preferred_domain, preferred_location, opportunity_type, work_mode) VALUES (%s, 0.00, '', '', '', 'Both', 'Any')",
            (u_id,)
        )
        profile = query_db("SELECT * FROM student_profiles WHERE user_id = %s", (u_id,), one=True)

    # 2. Fetch skills
    skills_rows = query_db(
        "SELECT skill_name, proficiency FROM student_skills WHERE student_id = %s ORDER BY id ASC",
        (u_id,)
    )
    skills = [r["skill_name"] for r in skills_rows]
    skills_detailed = skills_rows

    # 3. Fetch projects
    projects = query_db(
        "SELECT id, project_name, description, technologies FROM projects WHERE student_id = %s ORDER BY id ASC",
        (u_id,)
    )

    # 4. Fetch certifications
    certifications = query_db(
        "SELECT id, certification_name, organization FROM certifications WHERE student_id = %s ORDER BY id ASC",
        (u_id,)
    )

    return jsonify({
        "user": user,
        "profile": {
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
    user = request.current_user
    u_id = user["id"]
    data = request.get_json() or {}

    # Update user basic info (name, department, year)
    name = data.get("name", user["name"])
    dept = data.get("department", user.get("department", ""))
    year = data.get("year", user.get("year", ""))
    execute_db(
        "UPDATE users SET name = %s, department = %s, year = %s WHERE id = %s",
        (name, dept, year, u_id)
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
            INSERT OR REPLACE INTO student_profiles (user_id, cgpa, interests, preferred_domain, preferred_location, opportunity_type, work_mode)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """ if db.is_sqlite else """
            INSERT INTO student_profiles (user_id, cgpa, interests, preferred_domain, preferred_location, opportunity_type, work_mode)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE
                cgpa = VALUES(cgpa),
                interests = VALUES(interests),
                preferred_domain = VALUES(preferred_domain),
                preferred_location = VALUES(preferred_location),
                opportunity_type = VALUES(opportunity_type),
                work_mode = VALUES(work_mode)
        """, (u_id, cgpa, interests, pref_domain, pref_loc, opp_type, work_mode))

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
            c_name = (c.get("certification_name") or "").strip()
            c_org = (c.get("organization") or "").strip()
            if c_name:
                cur.execute(
                    "INSERT INTO certifications (student_id, certification_name, organization) VALUES (%s, %s, %s)",
                    (u_id, c_name, c_org)
                )

        db.commit()

    return jsonify({"message": "Student profile updated successfully."}), 200


@student_bp.route("/skills-catalog", methods=["GET"])
def get_skills_catalog():
    rows = query_db("SELECT skill_name, category FROM skills ORDER BY category, skill_name ASC")
    return jsonify({"skills": rows}), 200
