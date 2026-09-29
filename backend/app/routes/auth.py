from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from app.database.connection import query_db, execute_db
from app.utils.auth import generate_token, token_required

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    confirm_password = data.get("confirm_password") or ""
    department = (data.get("department") or "").strip()
    year = (data.get("year") or data.get("year_of_study") or "").strip()

    if not name or not email or not password:
        return jsonify({"error": "Full Name, Email, and Password are required."}), 400

    if confirm_password and password != confirm_password:
        return jsonify({"error": "Passwords do not match."}), 400

    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters long."}), 400

    existing_user = query_db("SELECT id FROM users WHERE email = %s", (email,), one=True)
    if existing_user:
        return jsonify({"error": "An account with this email address already exists."}), 409

    hashed_pw = generate_password_hash(password)
    user_id = execute_db(
        "INSERT INTO users (name, email, password, department, year, role) VALUES (%s, %s, %s, %s, %s, 'student')",
        (name, email, hashed_pw, department, year)
    )

    # Automatically create blank student profile
    execute_db(
        "INSERT INTO student_profiles (user_id, cgpa, interests, preferred_domain, preferred_location, opportunity_type, work_mode) VALUES (%s, 0.00, '', '', '', 'Both', 'Any')",
        (user_id,)
    )

    token = generate_token(user_id, email, role="student")
    return jsonify({
        "message": "Account created successfully.",
        "token": token,
        "user": {
            "id": user_id,
            "name": name,
            "email": email,
            "department": department,
            "year": year,
            "year_of_study": year,
            "role": "student"
        }
    }), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return jsonify({"error": "Email and Password are required."}), 400

    user = query_db("SELECT * FROM users WHERE email = %s", (email,), one=True)
    if not user or not check_password_hash(user["password"], password):
        return jsonify({"error": "Invalid email or password."}), 401

    token = generate_token(user["id"], user["email"], role=user.get("role", "student"))
    user_year = user.get("year", "")
    return jsonify({
        "message": "Login successful.",
        "token": token,
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "department": user.get("department", ""),
            "year": user_year,
            "year_of_study": user_year,
            "role": user.get("role", "student")
        }
    }), 200


@auth_bp.route("/me", methods=["GET"])
@token_required
def get_current_user_profile():
    return jsonify({"user": request.current_user}), 200


@auth_bp.route("/google-login", methods=["POST"])
def google_login():
    data = request.get_json() or {}
    email = (data.get("email") or "alex.google@gmail.com").strip().lower()
    name = (data.get("name") or "Alex (Google User)").strip()
    department = (data.get("department") or "Computer Science & Engineering").strip()
    year = (data.get("year") or data.get("year_of_study") or "3rd Year").strip()

    user = query_db("SELECT * FROM users WHERE email = %s", (email,), one=True)
    if not user:
        # Auto create user for Google Sign-In
        import uuid
        dummy_pass = generate_password_hash(str(uuid.uuid4()))
        user_id = execute_db(
            "INSERT INTO users (name, email, password, department, year, role) VALUES (%s, %s, %s, %s, %s, 'student')",
            (name, email, dummy_pass, department, year)
        )
        execute_db(
            "INSERT INTO student_profiles (user_id, cgpa, interests, preferred_domain, preferred_location, opportunity_type, work_mode) VALUES (%s, 8.00, 'Web Development,AI/ML', 'General Tech', 'Remote', 'Both', 'Any')",
            (user_id,)
        )
        user = query_db("SELECT * FROM users WHERE id = %s", (user_id,), one=True)

    token = generate_token(user["id"], user["email"], role=user.get("role", "student"))
    user_year = user.get("year", "")
    return jsonify({
        "message": "Google authentication successful.",
        "token": token,
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "department": user.get("department", ""),
            "year": user_year,
            "year_of_study": user_year,
            "role": user.get("role", "student")
        }
    }), 200

