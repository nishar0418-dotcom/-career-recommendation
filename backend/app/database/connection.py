import os
import sqlite3
import pymysql
from pymysql.cursors import DictCursor

DB_TYPE = os.getenv("DB_TYPE", "auto").lower()
MYSQL_HOST = os.getenv("MYSQL_HOST", "localhost")
MYSQL_PORT = int(os.getenv("MYSQL_PORT", 3306))
MYSQL_USER = os.getenv("MYSQL_USER", "root")
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "")
MYSQL_DB = os.getenv("MYSQL_DB", "careermatch_db")

SQLITE_PATH = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "career_match.db")
)

_active_backend = None

def test_mysql_connection():
    try:
        conn = pymysql.connect(
            host=MYSQL_HOST,
            port=MYSQL_PORT,
            user=MYSQL_USER,
            password=MYSQL_PASSWORD,
            charset='utf8mb4',
            cursorclass=DictCursor,
            connect_timeout=2
        )
        with conn.cursor() as cursor:
            cursor.execute(f"CREATE DATABASE IF NOT EXISTS {MYSQL_DB}")
            cursor.execute(f"USE {MYSQL_DB}")
        conn.select_db(MYSQL_DB)
        conn.close()
        return True
    except Exception as e:
        print(f"[DB] MySQL unavailable ({e}). Defaulting to SQLite fallback for instant zero-config launch.")
        return False

def get_active_backend():
    global _active_backend
    if _active_backend is None:
        if DB_TYPE == "mysql":
            _active_backend = "mysql"
        elif DB_TYPE == "sqlite":
            _active_backend = "sqlite"
        else:
            # auto detect
            _active_backend = "mysql" if test_mysql_connection() else "sqlite"
    return _active_backend

class UnifiedCursor:
    """Wrapper that normalizes row access for both MySQL and SQLite."""
    def __init__(self, cursor, is_sqlite=False):
        self.cursor = cursor
        self.is_sqlite = is_sqlite

    def execute(self, sql, params=()):
        if params is None:
            params = ()
        # Convert %s placeholders to ? if using SQLite
        if self.is_sqlite:
            sql = sql.replace("%s", "?")
            # SQLite does not support ON DUPLICATE KEY UPDATE syntax directly,
            # but standard INSERT OR REPLACE or INSERT OR IGNORE works.
        return self.cursor.execute(sql, params)

    def executemany(self, sql, params_seq=()):
        if params_seq is None:
            params_seq = ()
        if self.is_sqlite:
            sql = sql.replace("%s", "?")
        return self.cursor.executemany(sql, params_seq)

    def fetchone(self):
        row = self.cursor.fetchone()
        if row is None:
            return None
        if self.is_sqlite and isinstance(row, sqlite3.Row):
            return dict(row)
        return row

    def fetchall(self):
        rows = self.cursor.fetchall()
        if self.is_sqlite:
            return [dict(r) if isinstance(r, sqlite3.Row) else r for r in rows]
        return rows

    @property
    def lastrowid(self):
        return self.cursor.lastrowid

class UnifiedConnection:
    def __init__(self, raw_conn, is_sqlite=False):
        self.raw_conn = raw_conn
        self.is_sqlite = is_sqlite

    def cursor(self):
        if self.is_sqlite:
            return UnifiedCursor(self.raw_conn.cursor(), is_sqlite=True)
        return UnifiedCursor(self.raw_conn.cursor(DictCursor), is_sqlite=False)

    def commit(self):
        return self.raw_conn.commit()

    def rollback(self):
        return self.raw_conn.rollback()

    def close(self):
        return self.raw_conn.close()

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type is not None:
            self.rollback()
        else:
            self.commit()
        self.close()

def get_db():
    backend = get_active_backend()
    if backend == "mysql":
        raw = pymysql.connect(
            host=MYSQL_HOST,
            port=MYSQL_PORT,
            user=MYSQL_USER,
            password=MYSQL_PASSWORD,
            database=MYSQL_DB,
            charset='utf8mb4',
            cursorclass=DictCursor,
            autocommit=False
        )
        return UnifiedConnection(raw, is_sqlite=False)
    else:
        raw = sqlite3.connect(SQLITE_PATH)
        raw.row_factory = sqlite3.Row
        return UnifiedConnection(raw, is_sqlite=True)

def query_db(query, args=(), one=False):
    with get_db() as db:
        cur = db.cursor()
        cur.execute(query, args)
        rv = cur.fetchall()
        return (rv[0] if rv else None) if one else rv

def execute_db(query, args=()):
    with get_db() as db:
        cur = db.cursor()
        cur.execute(query, args)
        db.commit()
        return cur.lastrowid

def init_db():
    """Initializes tables and seeds baseline data if empty."""
    backend = get_active_backend()
    print(f"[DB] Initializing database using backend: {backend.upper()}")
    
    with get_db() as db:
        cur = db.cursor()
        
        # Create users table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL,
                department TEXT,
                year TEXT,
                role TEXT DEFAULT 'student',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """ if backend == "sqlite" else """
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                department VARCHAR(255),
                year VARCHAR(50),
                role VARCHAR(50) DEFAULT 'student',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Create student_profiles table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS student_profiles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL UNIQUE,
                cgpa REAL DEFAULT 0.00,
                interests TEXT,
                preferred_domain TEXT,
                preferred_location TEXT,
                opportunity_type TEXT DEFAULT 'Both',
                work_mode TEXT DEFAULT 'Any',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        """ if backend == "sqlite" else """
            CREATE TABLE IF NOT EXISTS student_profiles (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL UNIQUE,
                cgpa DECIMAL(4,2) DEFAULT 0.00,
                interests TEXT,
                preferred_domain VARCHAR(255),
                preferred_location VARCHAR(255),
                opportunity_type VARCHAR(50) DEFAULT 'Both',
                work_mode VARCHAR(50) DEFAULT 'Any',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        """)

        # Create skills table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS skills (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                skill_name TEXT NOT NULL UNIQUE,
                category TEXT NOT NULL
            )
        """ if backend == "sqlite" else """
            CREATE TABLE IF NOT EXISTS skills (
                id INT AUTO_INCREMENT PRIMARY KEY,
                skill_name VARCHAR(100) NOT NULL UNIQUE,
                category VARCHAR(100) NOT NULL
            )
        """)

        # Create student_skills table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS student_skills (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id INTEGER NOT NULL,
                skill_name TEXT NOT NULL,
                proficiency TEXT DEFAULT 'Intermediate',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
            )
        """ if backend == "sqlite" else """
            CREATE TABLE IF NOT EXISTS student_skills (
                id INT AUTO_INCREMENT PRIMARY KEY,
                student_id INT NOT NULL,
                skill_name VARCHAR(100) NOT NULL,
                proficiency VARCHAR(50) DEFAULT 'Intermediate',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
            )
        """)

        # Create projects table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS projects (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id INTEGER NOT NULL,
                project_name TEXT NOT NULL,
                description TEXT,
                technologies TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
            )
        """ if backend == "sqlite" else """
            CREATE TABLE IF NOT EXISTS projects (
                id INT AUTO_INCREMENT PRIMARY KEY,
                student_id INT NOT NULL,
                project_name VARCHAR(255) NOT NULL,
                description TEXT,
                technologies TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
            )
        """)

        # Create certifications table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS certifications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id INTEGER NOT NULL,
                certification_name TEXT NOT NULL,
                organization TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
            )
        """ if backend == "sqlite" else """
            CREATE TABLE IF NOT EXISTS certifications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                student_id INT NOT NULL,
                certification_name VARCHAR(255) NOT NULL,
                organization VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
            )
        """)

        # Create opportunities table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS opportunities (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                company TEXT NOT NULL,
                title TEXT NOT NULL,
                description TEXT,
                domain TEXT NOT NULL,
                required_skills TEXT NOT NULL,
                preferred_skills TEXT,
                qualification TEXT,
                minimum_cgpa REAL DEFAULT 0.00,
                location TEXT,
                opportunity_type TEXT DEFAULT 'Internship',
                work_mode TEXT DEFAULT 'Hybrid',
                stipend_or_salary TEXT DEFAULT 'Competitive',
                application_link TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """ if backend == "sqlite" else """
            CREATE TABLE IF NOT EXISTS opportunities (
                id INT AUTO_INCREMENT PRIMARY KEY,
                company VARCHAR(255) NOT NULL,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                domain VARCHAR(100) NOT NULL,
                required_skills TEXT NOT NULL,
                preferred_skills TEXT,
                qualification VARCHAR(255),
                minimum_cgpa DECIMAL(4,2) DEFAULT 0.00,
                location VARCHAR(255),
                opportunity_type VARCHAR(50) DEFAULT 'Internship',
                work_mode VARCHAR(50) DEFAULT 'Hybrid',
                stipend_or_salary VARCHAR(100) DEFAULT 'Competitive',
                application_link VARCHAR(500),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Create recommendations table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS recommendations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id INTEGER NOT NULL,
                opportunity_id INTEGER NOT NULL,
                match_percentage REAL NOT NULL,
                matching_skills TEXT,
                missing_skills TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (opportunity_id) REFERENCES opportunities(id) ON DELETE CASCADE
            )
        """ if backend == "sqlite" else """
            CREATE TABLE IF NOT EXISTS recommendations (
                id INT AUTO_INCREMENT PRIMARY KEY,
                student_id INT NOT NULL,
                opportunity_id INT NOT NULL,
                match_percentage DECIMAL(5,2) NOT NULL,
                matching_skills TEXT,
                missing_skills TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (opportunity_id) REFERENCES opportunities(id) ON DELETE CASCADE
            )
        """)
        
        db.commit()

    # Seed baseline items if opportunities is empty
    seed_defaults()

def seed_defaults():
    from app.database.seed import seed_initial_data
    seed_initial_data()
