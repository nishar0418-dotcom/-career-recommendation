"""
AI Analysis Routes: Profile strength, domain suitability, and AI recommendations
"""

from flask import Blueprint, request, jsonify
from app.database.connection import query_db, execute_db
from app.utils.auth import token_required
from app.ai.recommendation_engine import parse_skill_list
from app.ai.career_role_matcher import calculate_domain_scores, match_career_roles

ai_bp = Blueprint("ai", __name__)

@ai_bp.route("/analyze-profile", methods=["POST", "GET"])
@token_required
def analyze_profile():
    user = request.current_user
    u_id = user["id"]

    # 1. Fetch student data
    profile = query_db("SELECT * FROM student_profiles WHERE user_id = %s", (u_id,), one=True)
    if not profile:
        profile = {}

    skills_rows = query_db("SELECT skill_name FROM student_skills WHERE student_id = %s", (u_id,))
    skills = [r["skill_name"] for r in skills_rows]

    projects = query_db("SELECT id, project_name, description, technologies FROM projects WHERE student_id = %s", (u_id,))
    certifications = query_db("SELECT id, certification_name, organization FROM certifications WHERE student_id = %s", (u_id,))

    raw_interests = profile.get("interests", "") or ""
    interests = parse_skill_list(raw_interests)
    cgpa = float(profile.get("cgpa", 0.0) or 0.0)

    # 2. Profile Strength Calculation (0 - 100)
    strength = 0.0
    strength += min(35.0, len(skills) * 5.0)
    strength += min(25.0, len(projects) * 12.5)
    if cgpa >= 7.5:
        strength += 15.0
    elif cgpa >= 6.0:
        strength += 10.0
    elif cgpa > 0:
        strength += 5.0
    strength += min(15.0, len(certifications) * 7.5)
    if interests:
        strength += 5.0
    if profile.get("preferred_domain"):
        strength += 5.0
    strength = round(min(100.0, max(15.0, strength)), 0)

    # 3. Domain suitability scores & Best Career Roles
    domain_scores = calculate_domain_scores(skills, interests)
    matched_roles = match_career_roles(skills, interests)

    suggested_domain = domain_scores[0]["domain"] if domain_scores else "Data Science"
    top_role = matched_roles[0]["role"] if matched_roles else "Software Developer"

    # 4. Actionable suggestions for the student
    suggestions = []
    if len(skills) < 5:
        suggestions.append("Add more technical skills to your profile to increase opportunity match rates.")
    if len(projects) < 2:
        suggestions.append("Showcase at least 2 hands-on projects highlighting your code and architecture.")
    if not certifications:
        suggestions.append("Add industry certifications (e.g. AWS, Oracle, Coursera) to validate domain proficiency.")
    if cgpa == 0:
        suggestions.append("Update your current CGPA so companies with academic thresholds can qualify your profile.")
    if not suggestions:
        suggestions.append("Your profile is well-rounded! Review your personalized opportunity matches below.")

    # 5. Strong areas identification
    strong_areas = []
    for d in domain_scores[:3]:
        if d["score"] >= 50:
            strong_areas.append(d["domain"])
    if not strong_areas and domain_scores:
        strong_areas.append(domain_scores[0]["domain"])

    return jsonify({
        "profile_strength": int(strength),
        "strong_areas": strong_areas,
        "primary_interest": interests[0] if interests else (profile.get("preferred_domain") or "General Tech"),
        "suggested_career_domain": suggested_domain,
        "top_career_role": top_role,
        "domain_scores": domain_scores,
        "matched_roles": matched_roles[:3],
        "suggestions": suggestions,
        "summary": {
            "skills_count": len(skills),
            "projects_count": len(projects),
            "certifications_count": len(certifications),
            "cgpa": cgpa
        }
    }), 200


@ai_bp.route("/domain-scores", methods=["GET"])
@token_required
def get_domain_scores():
    user = request.current_user
    u_id = user["id"]

    skills_rows = query_db("SELECT skill_name FROM student_skills WHERE student_id = %s", (u_id,))
    skills = [r["skill_name"] for r in skills_rows]

    profile = query_db("SELECT interests FROM student_profiles WHERE user_id = %s", (u_id,), one=True) or {}
    interests = parse_skill_list(profile.get("interests", ""))

    domain_scores = calculate_domain_scores(skills, interests)
    return jsonify({"domain_scores": domain_scores}), 200
