"""
CareerMatch AI - Flask Backend Server
"""

import os
import sys

# Ensure backend root directory is on sys.path
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from flask import Flask, jsonify
from flask_cors import CORS

from app import create_app
from app.database.connection import init_db, get_active_backend


if __name__ == "__main__":
    # Initialize database tables and initial sample data on startup
    print("=" * 60)
    print("Initializing CareerMatch AI Database...")
    init_db()
    active_db = get_active_backend()
    print(f"Active Database Engine: {active_db.upper()}")
    print("=" * 60)

    app = create_app()
    port = int(os.getenv("PORT", 5000))
    print(f"CareerMatch AI Backend running on http://127.0.0.1:{port}")
    app.run(host="0.0.0.0", port=port, debug=False)
