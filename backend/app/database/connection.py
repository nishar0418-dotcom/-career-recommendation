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
        return self._normalize_row(row)

    def fetchall(self):
        rows = self.cursor.fetchall()
        return [self._normalize_row(r) for r in rows]

    def _normalize_row(self, row):
        if row is None:
            return None
        d = dict(row)
        # Compatibility aliases for opportunities and certifications
        if "company_name" in d and "company" not in d:
            d["company"] = d["company_name"]
        elif "company" in d and "company_name" not in d:
            d["company_name"] = d["company"]
        if "application_url" in d and "application_link" not in d:
            d["application_link"] = d["application_url"]
        elif "application_link" in d and "application_url" not in d:
            d["application_url"] = d["application_link"]
        if "name" in d and "certification_name" not in d:
            d["certification_name"] = d["name"]
        elif "certification_name" in d and "name" not in d:
            d["name"] = d["certification_name"]
        return d

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
    """Initializes normalized relational tables, constraints, indexes, and seeds baseline data."""
    backend = get_active_backend()
    print(f"[DB] Initializing database using backend: {backend.upper()}")
    
    with get_db() as db:
        cur = db.cursor()
        
        # 1. Students Table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS students (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                password TEXT,
                role TEXT DEFAULT 'student',
                department TEXT,
                year TEXT,
                cgpa REAL DEFAULT 0.00,
                preferred_domain TEXT,
                preferred_location TEXT,
                opportunity_type TEXT DEFAULT 'Both',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """ if backend == "sqlite" else """
            CREATE TABLE IF NOT EXISTS students (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255),
                role VARCHAR(50) DEFAULT 'student',
                department VARCHAR(255),
                year VARCHAR(50),
                cgpa DECIMAL(4,2) DEFAULT 0.00,
                preferred_domain VARCHAR(255),
                preferred_location VARCHAR(255),
                opportunity_type VARCHAR(50) DEFAULT 'Both',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        """)
        
        # 2. Users Table (Maintained for auth integration)
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
        
        # 3. Student Profiles Table
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

        # 4. Skills Taxonomy Table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS skills (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                skill_name TEXT NOT NULL UNIQUE,
                category TEXT NOT NULL,
                description TEXT
            )
        """ if backend == "sqlite" else """
            CREATE TABLE IF NOT EXISTS skills (
                id INT AUTO_INCREMENT PRIMARY KEY,
                skill_name VARCHAR(100) NOT NULL UNIQUE,
                category VARCHAR(100) NOT NULL,
                description TEXT
            )
        """)

        # 5. Student Skills Normalized Relationship Table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS student_skills (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id INTEGER NOT NULL,
                skill_id INTEGER,
                skill_name TEXT NOT NULL,
                proficiency TEXT DEFAULT 'Intermediate',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
                FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
            )
        """ if backend == "sqlite" else """
            CREATE TABLE IF NOT EXISTS student_skills (
                id INT AUTO_INCREMENT PRIMARY KEY,
                student_id INT NOT NULL,
                skill_id INT,
                skill_name VARCHAR(100) NOT NULL,
                proficiency VARCHAR(50) DEFAULT 'Intermediate',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
                FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
            )
        """)

        # 6. Opportunities Table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS opportunities (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                company_name TEXT NOT NULL,
                company TEXT,
                title TEXT NOT NULL,
                description TEXT,
                domain TEXT NOT NULL,
                required_skills TEXT,
                preferred_skills TEXT,
                qualification TEXT,
                minimum_cgpa REAL DEFAULT 0.00,
                location TEXT,
                opportunity_type TEXT DEFAULT 'Internship',
                work_mode TEXT DEFAULT 'Hybrid',
                stipend_or_salary TEXT DEFAULT 'Competitive',
                application_url TEXT,
                application_link TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """ if backend == "sqlite" else """
            CREATE TABLE IF NOT EXISTS opportunities (
                id INT AUTO_INCREMENT PRIMARY KEY,
                company_name VARCHAR(255) NOT NULL,
                company VARCHAR(255),
                title VARCHAR(255) NOT NULL,
                description TEXT,
                domain VARCHAR(100) NOT NULL,
                required_skills TEXT,
                preferred_skills TEXT,
                qualification VARCHAR(255),
                minimum_cgpa DECIMAL(4,2) DEFAULT 0.00,
                location VARCHAR(255),
                opportunity_type VARCHAR(50) DEFAULT 'Internship',
                work_mode VARCHAR(50) DEFAULT 'Hybrid',
                stipend_or_salary VARCHAR(100) DEFAULT 'Competitive',
                application_url VARCHAR(500),
                application_link VARCHAR(500),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # 7. Opportunity Skills Normalized Relationship Table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS opportunity_skills (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                opportunity_id INTEGER NOT NULL,
                skill_id INTEGER NOT NULL,
                is_required INTEGER DEFAULT 1,
                importance_weight REAL DEFAULT 1.00,
                FOREIGN KEY (opportunity_id) REFERENCES opportunities(id) ON DELETE CASCADE,
                FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
                UNIQUE(opportunity_id, skill_id)
            )
        """ if backend == "sqlite" else """
            CREATE TABLE IF NOT EXISTS opportunity_skills (
                id INT AUTO_INCREMENT PRIMARY KEY,
                opportunity_id INT NOT NULL,
                skill_id INT NOT NULL,
                is_required INT DEFAULT 1,
                importance_weight DECIMAL(3,2) DEFAULT 1.00,
                FOREIGN KEY (opportunity_id) REFERENCES opportunities(id) ON DELETE CASCADE,
                FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
                UNIQUE KEY uq_opp_skill (opportunity_id, skill_id)
            )
        """)

        # 8. Projects Table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS projects (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id INTEGER NOT NULL,
                project_name TEXT NOT NULL,
                description TEXT,
                technologies TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
            )
        """ if backend == "sqlite" else """
            CREATE TABLE IF NOT EXISTS projects (
                id INT AUTO_INCREMENT PRIMARY KEY,
                student_id INT NOT NULL,
                project_name VARCHAR(255) NOT NULL,
                description TEXT,
                technologies TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
            )
        """)

        # 9. Certifications Table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS certifications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                certification_name TEXT,
                organization TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
            )
        """ if backend == "sqlite" else """
            CREATE TABLE IF NOT EXISTS certifications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                student_id INT NOT NULL,
                name VARCHAR(255) NOT NULL,
                certification_name VARCHAR(255),
                organization VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
            )
        """)

        # 10. Recommendations Table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS recommendations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id INTEGER NOT NULL,
                opportunity_id INTEGER NOT NULL,
                skill_match_score REAL DEFAULT 0.0,
                interest_match_score REAL DEFAULT 0.0,
                qualification_score REAL DEFAULT 0.0,
                project_match_score REAL DEFAULT 0.0,
                preference_score REAL DEFAULT 0.0,
                final_score REAL NOT NULL,
                match_percentage REAL,
                matching_skills TEXT,
                missing_skills TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
                FOREIGN KEY (opportunity_id) REFERENCES opportunities(id) ON DELETE CASCADE
            )
        """ if backend == "sqlite" else """
            CREATE TABLE IF NOT EXISTS recommendations (
                id INT AUTO_INCREMENT PRIMARY KEY,
                student_id INT NOT NULL,
                opportunity_id INT NOT NULL,
                skill_match_score DECIMAL(5,2) DEFAULT 0.00,
                interest_match_score DECIMAL(5,2) DEFAULT 0.00,
                qualification_score DECIMAL(5,2) DEFAULT 0.00,
                project_match_score DECIMAL(5,2) DEFAULT 0.00,
                preference_score DECIMAL(5,2) DEFAULT 0.00,
                final_score DECIMAL(5,2) NOT NULL,
                match_percentage DECIMAL(5,2),
                matching_skills TEXT,
                missing_skills TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
                FOREIGN KEY (opportunity_id) REFERENCES opportunities(id) ON DELETE CASCADE
            )
        """)

        # Column migrations for existing tables
        alter_statements = [
            "ALTER TABLE skills ADD COLUMN description TEXT",
            "ALTER TABLE opportunities ADD COLUMN application_url TEXT",
            "ALTER TABLE opportunities ADD COLUMN company_name TEXT",
            "ALTER TABLE student_skills ADD COLUMN skill_id INTEGER",
            "ALTER TABLE certifications ADD COLUMN name TEXT",
            "ALTER TABLE recommendations ADD COLUMN skill_match_score REAL DEFAULT 0.0",
            "ALTER TABLE recommendations ADD COLUMN interest_match_score REAL DEFAULT 0.0",
            "ALTER TABLE recommendations ADD COLUMN qualification_score REAL DEFAULT 0.0",
            "ALTER TABLE recommendations ADD COLUMN project_match_score REAL DEFAULT 0.0",
            "ALTER TABLE recommendations ADD COLUMN preference_score REAL DEFAULT 0.0",
            "ALTER TABLE recommendations ADD COLUMN final_score REAL DEFAULT 0.0",
        ]
        for stmt in alter_statements:
            try:
                cur.execute(stmt)
                db.commit()
            except Exception:
                pass

        # Create helpful indexes
        indexes = [
            "CREATE INDEX IF NOT EXISTS idx_students_email ON students(email)",
            "CREATE INDEX IF NOT EXISTS idx_skills_name ON skills(skill_name)",
            "CREATE INDEX IF NOT EXISTS idx_skills_category ON skills(category)",
            "CREATE INDEX IF NOT EXISTS idx_student_skills_student ON student_skills(student_id)",
            "CREATE INDEX IF NOT EXISTS idx_opp_skills_opp ON opportunity_skills(opportunity_id)",
            "CREATE INDEX IF NOT EXISTS idx_recommendations_student ON recommendations(student_id)",
        ]
        for idx_sql in indexes:
            try:
                cur.execute(idx_sql)
            except Exception:
                pass
        
        db.commit()

    # Seed baseline items
    seed_defaults()

def seed_defaults():
    from app.database.seed import seed_initial_data
    seed_initial_data()
