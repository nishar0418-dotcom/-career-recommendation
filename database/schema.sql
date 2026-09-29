-- ============================================================================
-- CareerMatch AI: Normalized Relational Database Schema
-- Compatible with MySQL 8.0+ and SQLite 3+
-- ============================================================================

-- 1. Students Table (Normalized primary student entity)
CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for student lookup and filtering
CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);
CREATE INDEX IF NOT EXISTS idx_students_domain ON students(preferred_domain);

-- 2. Skills Master Taxonomy Table
CREATE TABLE IF NOT EXISTS skills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    skill_name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(100) NOT NULL,
    description TEXT
);

-- Indexes for skill taxonomy retrieval
CREATE INDEX IF NOT EXISTS idx_skills_name ON skills(skill_name);
CREATE INDEX IF NOT EXISTS idx_skills_category ON skills(category);

-- 3. Student Skills Mapping Table (Normalized M:N Student <-> Skill)
CREATE TABLE IF NOT EXISTS student_skills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    skill_id INTEGER NOT NULL,
    proficiency VARCHAR(50) DEFAULT 'Intermediate',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
    UNIQUE(student_id, skill_id)
);

CREATE INDEX IF NOT EXISTS idx_student_skills_student ON student_skills(student_id);
CREATE INDEX IF NOT EXISTS idx_student_skills_skill ON student_skills(skill_id);

-- 4. Opportunities Table (Internships and Jobs)
CREATE TABLE IF NOT EXISTS opportunities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_name VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    domain VARCHAR(100) NOT NULL,
    qualification VARCHAR(255),
    minimum_cgpa DECIMAL(4,2) DEFAULT 0.00,
    location VARCHAR(255),
    opportunity_type VARCHAR(50) DEFAULT 'Internship',
    work_mode VARCHAR(50) DEFAULT 'Hybrid',
    stipend_or_salary VARCHAR(100) DEFAULT 'Competitive',
    application_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for opportunity filtering
CREATE INDEX IF NOT EXISTS idx_opportunities_domain ON opportunities(domain);
CREATE INDEX IF NOT EXISTS idx_opportunities_type ON opportunities(opportunity_type);
CREATE INDEX IF NOT EXISTS idx_opportunities_location ON opportunities(location);

-- 5. Opportunity Skills Mapping Table (Normalized M:N Opportunity <-> Skill)
CREATE TABLE IF NOT EXISTS opportunity_skills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    opportunity_id INTEGER NOT NULL,
    skill_id INTEGER NOT NULL,
    is_required INTEGER DEFAULT 1,
    importance_weight DECIMAL(3,2) DEFAULT 1.00,
    FOREIGN KEY (opportunity_id) REFERENCES opportunities(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
    UNIQUE(opportunity_id, skill_id)
);

CREATE INDEX IF NOT EXISTS idx_opp_skills_opp ON opportunity_skills(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_opp_skills_skill ON opportunity_skills(skill_id);

-- 6. Student Projects Table
CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    project_name VARCHAR(255) NOT NULL,
    description TEXT,
    technologies TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_projects_student ON projects(student_id);

-- 7. Student Certifications Table
CREATE TABLE IF NOT EXISTS certifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    organization VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_certifications_student ON certifications(student_id);

-- 8. Recommendations Cache & Audit Table
CREATE TABLE IF NOT EXISTS recommendations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    opportunity_id INTEGER NOT NULL,
    skill_match_score DECIMAL(5,2) NOT NULL,
    interest_match_score DECIMAL(5,2) NOT NULL,
    qualification_score DECIMAL(5,2) NOT NULL,
    project_match_score DECIMAL(5,2) NOT NULL,
    preference_score DECIMAL(5,2) NOT NULL,
    final_score DECIMAL(5,2) NOT NULL,
    matching_skills TEXT,
    missing_skills TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (opportunity_id) REFERENCES opportunities(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_recommendations_student ON recommendations(student_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_opp ON recommendations(opportunity_id);

-- 9. Users Table (Maintained for authentication backward compatibility)
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    department VARCHAR(255),
    year VARCHAR(50),
    role VARCHAR(50) DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
