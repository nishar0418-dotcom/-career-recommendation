# CareerMatch AI Backend Package
import os
from flask import Flask, jsonify
from flask_cors import CORS

from app.database.connection import get_active_backend
from app.routes.auth import auth_bp
from app.routes.student import student_bp
from app.routes.ai import ai_bp
from app.routes.recommendations import recommendations_bp
from app.routes.skill_gap import skill_gap_bp
from app.routes.opportunities import opportunities_bp
from app.routes.admin import admin_bp

def create_app():
    app = Flask(__name__)

    # Configure CORS for all REST API endpoints
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Register Blueprints
    app.register_blueprint(auth_bp, url_prefix="/api")
    app.register_blueprint(student_bp, url_prefix="/api/student")
    app.register_blueprint(ai_bp, url_prefix="/api")
    app.register_blueprint(recommendations_bp, url_prefix="/api")
    app.register_blueprint(skill_gap_bp, url_prefix="/api")
    app.register_blueprint(opportunities_bp, url_prefix="/api")
    app.register_blueprint(admin_bp, url_prefix="/api")

    @app.route("/", methods=["GET"])
    def root():
        return jsonify({
            "name": "AI-Based Student Career, Skill Gap & Internship Recommendation System API",
            "version": "1.0.0",
            "status": "online",
            "database_engine": get_active_backend(),
            "endpoints": {
                "auth": ["POST /api/register", "POST /api/login", "GET /api/me"],
                "student": ["GET /api/student/profile", "PUT /api/student/profile", "GET /api/student/skills"],
                "ai": ["POST /api/analyze-profile", "GET /api/domain-scores"],
                "recommendations": ["GET /api/recommendations", "GET /api/career-roles"],
                "skill_gap": ["GET /api/skill-gaps"],
                "opportunities": ["GET /api/opportunities", "POST /api/opportunities"],
                "admin": ["GET /api/admin/stats", "GET /api/admin/students"]
            }
        }), 200

    @app.route("/api/health", methods=["GET"])
    def health():
        return jsonify({
            "status": "healthy",
            "database": get_active_backend()
        }), 200

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Resource not found"}), 404

    @app.errorhandler(500)
    def internal_error(e):
        return jsonify({"error": "Internal server error occurred"}), 500

    return app
