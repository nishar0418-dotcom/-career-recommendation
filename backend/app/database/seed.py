"""
CareerMatch AI: Master Seed Data
Populates normalized relational tables:
- skills (Structured 9-Category Taxonomy)
- students & users (Student 101 Arun Kumar, Student 102 Alex Johnson, Admin)
- student_skills (Normalized skill_id references)
- opportunities (with company_name and application_url)
- opportunity_skills (Normalized M:N references with weights)
- projects & certifications
"""

from werkzeug.security import generate_password_hash

SKILL_TAXONOMY = [
    # 1. Programming
    ('Python', 'Programming', 'General-purpose high-level programming language widely used in AI, Data Science, and backend development.'),
    ('Java', 'Programming', 'Class-based object-oriented language for enterprise backends and Android development.'),
    ('C', 'Programming', 'Procedural system programming language for embedded hardware and OS kernels.'),
    ('C++', 'Programming', 'High-performance systems programming language with OOP and manual memory control.'),
    ('JavaScript', 'Programming', 'Ubiquitous web scripting language for browser clients and asynchronous node runtimes.'),
    ('TypeScript', 'Programming', 'Typed superset of JavaScript bringing compile-time safety to large web codebases.'),
    ('Go', 'Programming', 'Compiled, concurrent systems language engineered by Google for scalable microservices.'),
    ('Rust', 'Programming', 'Memory-safe systems programming language without garbage collection overhead.'),

    # 2. Data Science
    ('Pandas', 'Data Science', 'Data manipulation and tabular dataframe analysis library in Python.'),
    ('NumPy', 'Data Science', 'Fundamental package for scientific computing with N-dimensional array processing.'),
    ('Data Analysis', 'Data Science', 'Exploratory data inspection, statistical cleansing, and business metric derivation.'),
    ('Statistics', 'Data Science', 'Mathematical probability distributions, hypothesis testing, and variance analysis.'),
    ('Tableau', 'Data Science', 'Enterprise visual analytics platform for building operational dashboards.'),
    ('Power BI', 'Data Science', 'Microsoft business intelligence service for interactive visualizations and reporting.'),
    ('Excel', 'Data Science', 'Spreadsheet calculations, pivot tables, and formula-based tabular modeling.'),
    ('Data Visualization', 'Data Science', 'Graphic charting and dashboard representation using Matplotlib, Seaborn, and D3.'),

    # 3. AI / Machine Learning
    ('Machine Learning', 'AI / Machine Learning', 'Supervised and unsupervised algorithmic model training from historical datasets.'),
    ('Scikit-learn', 'AI / Machine Learning', 'Python library for classification, regression, clustering, and model evaluation.'),
    ('TensorFlow', 'AI / Machine Learning', 'End-to-end open source platform for machine learning and neural networks.'),
    ('PyTorch', 'AI / Machine Learning', 'Dynamic deep learning tensor framework favored in academic and production AI research.'),
    ('Deep Learning', 'AI / Machine Learning', 'Multi-layer artificial neural networks including CNNs, RNNs, and transformer heads.'),
    ('NLP', 'AI / Machine Learning', 'Natural Language Processing for text tokenization, embeddings, and semantic parsing.'),
    ('Computer Vision', 'AI / Machine Learning', 'Visual object detection, segmentation, and image classification algorithms.'),

    # 4. Web Development
    ('HTML', 'Web Development', 'Semantic standard markup language for creating structured web document layouts.'),
    ('CSS', 'Web Development', 'Style sheet language for responsive typography, grid layouts, and visual formatting.'),
    ('React', 'Web Development', 'Component-driven declarative frontend user interface library created by Meta.'),
    ('Node.js', 'Web Development', 'V8 JavaScript runtime engine for executing scalable backend server applications.'),
    ('Express.js', 'Web Development', 'Minimalist HTTP web framework for designing RESTful web APIs on Node.js.'),
    ('Next.js', 'Web Development', 'Production React framework featuring server-side rendering and static page generation.'),
    ('Tailwind CSS', 'Web Development', 'Utility-first modern CSS framework for rapid responsive interface prototyping.'),
    ('Bootstrap', 'Web Development', 'Pre-styled mobile-friendly responsive CSS component and grid framework.'),

    # 5. Database
    ('SQL', 'Database', 'Standardized declarative structured query language for relational database systems.'),
    ('MySQL', 'Database', 'Widely adopted open-source relational database management system with ACID compliance.'),
    ('PostgreSQL', 'Database', 'Advanced enterprise-grade object-relational database with JSONB indexing.'),
    ('MongoDB', 'Database', 'Document-oriented NoSQL database storing JSON-like documents with flexible schemas.'),
    ('Redis', 'Database', 'In-memory key-value data structure store used for caching and low-latency queuing.'),
    ('SQLite', 'Database', 'Self-contained, serverless, zero-configuration SQL database engine.'),

    # 6. Cloud
    ('Cloud Computing', 'Cloud', 'On-demand delivery of compute power, database storage, and cloud infrastructure.'),
    ('AWS', 'Cloud', 'Amazon Web Services comprehensive cloud computing suite including EC2, S3, and RDS.'),
    ('Azure', 'Cloud', 'Microsoft cloud enterprise platform for deploying enterprise hybrid services.'),
    ('Google Cloud', 'Cloud', 'Google cloud infrastructure offering BigQuery, Kubernetes Engine, and Vertex AI.'),
    ('Docker', 'Cloud', 'Containerization platform to package applications with dependencies into images.'),
    ('Kubernetes', 'Cloud', 'Automated container orchestration system for deploying and scaling microservices.'),
    ('Linux', 'Cloud', 'Unix-like operating system kernel powering web servers and cloud virtual machines.'),

    # 7. Cyber Security
    ('Cyber Security', 'Cyber Security', 'Practice of protecting networks, devices, and data from malicious digital attacks.'),
    ('Network Security', 'Cyber Security', 'Firewall policies, packet inspection, VPN tunneling, and network defense measures.'),
    ('Ethical Hacking', 'Cyber Security', 'Authorized penetration testing to uncover security vulnerabilities before attackers.'),
    ('Cryptography', 'Cyber Security', 'Mathematical ciphers, hashing, and public-key infrastructure for confidentiality.'),
    ('Penetration Testing', 'Cyber Security', 'Systematic simulated cyberattacks against system vulnerabilities using Kali tools.'),

    # 8. Tools
    ('Git', 'Tools', 'Distributed source code revision control and collaborative team workflow system.'),
    ('GitHub', 'Tools', 'Cloud platform hosting Git repositories with CI/CD pull request reviews.'),
    ('VS Code', 'Tools', 'Extensible source code editor developed by Microsoft with rich language servers.'),
    ('Postman', 'Tools', 'API development platform for constructing HTTP requests and automated testing.'),
    ('Jira', 'Tools', 'Agile project tracking and issue management workspace for software sprints.'),

    # 9. Soft Skills
    ('Problem Solving', 'Soft Skills', 'Methodical root-cause analytical thinking and architectural debugging acumen.'),
    ('Communication', 'Soft Skills', 'Clear articulation of complex technical trade-offs to cross-functional stakeholders.'),
    ('Teamwork', 'Soft Skills', 'Effective collaboration in agile pairs and distributed engineering teams.')
]

DEFAULT_OPPORTUNITIES = [
    {
        "id": 201,
        "company_name": "ABC Technologies",
        "title": "Data Analyst Intern",
        "description": "Analyze real-world business datasets, design reporting pipelines, and build interactive executive dashboards to power data-driven decisions.",
        "domain": "Data Science",
        "qualification": "B.Tech / B.E / B.Sc in CS, IT, or Statistics",
        "minimum_cgpa": 7.00,
        "location": "Coimbatore",
        "opportunity_type": "Internship",
        "work_mode": "Hybrid",
        "stipend_or_salary": "₹25,000 / month",
        "application_url": "https://example.com/apply/data-analyst-intern",
        "required_skills": ["Python", "SQL", "Pandas", "Power BI"],
        "preferred_skills": ["Excel", "Data Analysis", "Statistics"]
    },
    {
        "id": 202,
        "company_name": "NexTech Solutions",
        "title": "Python Developer Intern",
        "description": "Build scalable backend services, automate analytical pipelines, integrate RESTful APIs, and contribute to internal automation frameworks.",
        "domain": "Software Development",
        "qualification": "B.Tech in Computer Science or related degree",
        "minimum_cgpa": 7.00,
        "location": "Remote",
        "opportunity_type": "Internship",
        "work_mode": "Remote",
        "stipend_or_salary": "₹22,000 / month",
        "application_url": "https://example.com/apply/python-dev-intern",
        "required_skills": ["Python", "SQL", "Git"],
        "preferred_skills": ["Docker", "Linux", "Express.js"]
    },
    {
        "id": 203,
        "company_name": "DataPulse Labs",
        "title": "Data Science Intern",
        "description": "Work closely with senior data scientists to clean enterprise data, train predictive models, conduct hypothesis testing, and evaluate machine learning algorithms.",
        "domain": "Data Science",
        "qualification": "Pursuing B.Tech / M.Tech in CS or AI/Data Science",
        "minimum_cgpa": 7.50,
        "location": "Hyderabad",
        "opportunity_type": "Internship",
        "work_mode": "Hybrid",
        "stipend_or_salary": "₹30,000 / month",
        "application_url": "https://example.com/apply/data-science-intern",
        "required_skills": ["Python", "SQL", "Pandas", "NumPy", "Scikit-learn"],
        "preferred_skills": ["Machine Learning", "Statistics", "Power BI"]
    },
    {
        "id": 204,
        "company_name": "DeepMind Innovations",
        "title": "Machine Learning Intern",
        "description": "Design, evaluate, and benchmark machine learning models for computer vision and NLP. Clean training data and implement feature pipelines.",
        "domain": "AI / Machine Learning",
        "qualification": "B.Tech / M.S. in Computer Science or AI/ML",
        "minimum_cgpa": 8.00,
        "location": "Bangalore",
        "opportunity_type": "Internship",
        "work_mode": "On-site",
        "stipend_or_salary": "₹35,000 / month",
        "application_url": "https://example.com/apply/ml-intern",
        "required_skills": ["Python", "Machine Learning", "Scikit-learn", "Pandas", "NumPy"],
        "preferred_skills": ["PyTorch", "TensorFlow", "Deep Learning"]
    },
    {
        "id": 205,
        "company_name": "CodeCraft Innovations",
        "title": "Web Developer Intern",
        "description": "Develop responsive user interfaces, craft interactive web components, and integrate backend REST APIs using modern web technologies.",
        "domain": "Web Development",
        "qualification": "B.Tech / B.C.A / M.C.A in CS or IT",
        "minimum_cgpa": 6.50,
        "location": "Coimbatore",
        "opportunity_type": "Internship",
        "work_mode": "Hybrid",
        "stipend_or_salary": "₹20,000 / month",
        "application_url": "https://example.com/apply/web-dev-intern",
        "required_skills": ["HTML", "CSS", "JavaScript", "React"],
        "preferred_skills": ["Tailwind CSS", "Node.js", "Git"]
    },
    {
        "id": 206,
        "company_name": "PixelWave Studios",
        "title": "Frontend Developer Intern",
        "description": "Craft pixel-perfect, accessible, and high-performance user interfaces for modern web applications using React and CSS component systems.",
        "domain": "Web Development",
        "qualification": "Undergraduate in Computer Science / Web Design",
        "minimum_cgpa": 6.50,
        "location": "Remote",
        "opportunity_type": "Internship",
        "work_mode": "Remote",
        "stipend_or_salary": "₹24,000 / month",
        "application_url": "https://example.com/apply/frontend-intern",
        "required_skills": ["React", "JavaScript", "HTML", "CSS"],
        "preferred_skills": ["Tailwind CSS", "Next.js", "TypeScript"]
    },
    {
        "id": 207,
        "company_name": "CloudScale Systems",
        "title": "Backend Developer Intern",
        "description": "Design and maintain high-throughput backend services, implement database schemas, optimize database queries, and author microservice APIs.",
        "domain": "Software Development",
        "qualification": "B.Tech in CS / IT or relevant software discipline",
        "minimum_cgpa": 7.00,
        "location": "Chennai",
        "opportunity_type": "Internship",
        "work_mode": "Hybrid",
        "stipend_or_salary": "₹25,000 / month",
        "application_url": "https://example.com/apply/backend-intern",
        "required_skills": ["Node.js", "Express.js", "SQL", "JavaScript"],
        "preferred_skills": ["Docker", "AWS", "Git"]
    },
    {
        "id": 208,
        "company_name": "OmniStack Enterprise",
        "title": "Full Stack Developer Intern",
        "description": "Build end-to-end features from intuitive React frontends to robust Node.js/Python backend architectures and relational database storage.",
        "domain": "Web Development",
        "qualification": "B.Tech / B.E in CS/IT",
        "minimum_cgpa": 7.50,
        "location": "Coimbatore",
        "opportunity_type": "Internship",
        "work_mode": "On-site",
        "stipend_or_salary": "₹28,000 / month",
        "application_url": "https://example.com/apply/fullstack-intern",
        "required_skills": ["React", "Node.js", "JavaScript", "SQL"],
        "preferred_skills": ["Python", "Docker", "Git"]
    },
    {
        "id": 209,
        "company_name": "SecureNet Defense",
        "title": "Cyber Security Intern",
        "description": "Perform vulnerability assessments, assist in penetration testing routines, inspect firewall logs, and implement foundational defense measures.",
        "domain": "Cyber Security",
        "qualification": "B.Tech in Information Security / CS",
        "minimum_cgpa": 7.00,
        "location": "Bangalore",
        "opportunity_type": "Internship",
        "work_mode": "Hybrid",
        "stipend_or_salary": "₹26,000 / month",
        "application_url": "https://example.com/apply/cybersecurity-intern",
        "required_skills": ["Cyber Security", "Network Security", "Cryptography"],
        "preferred_skills": ["Python", "Linux", "Ethical Hacking"]
    },
    {
        "id": 210,
        "company_name": "SkyHigh Cloud Services",
        "title": "Cloud Computing Intern",
        "description": "Automate cloud provisioning, manage containerized deployments, monitor infrastructure metrics, and support cloud migration tasks.",
        "domain": "Cloud",
        "qualification": "B.Tech in CS, Cloud Computing, or IT",
        "minimum_cgpa": 7.00,
        "location": "Hyderabad",
        "opportunity_type": "Internship",
        "work_mode": "Hybrid",
        "stipend_or_salary": "₹28,000 / month",
        "application_url": "https://example.com/apply/cloud-intern",
        "required_skills": ["Cloud Computing", "AWS", "Linux"],
        "preferred_skills": ["Docker", "Kubernetes", "Git"]
    }
]

def seed_initial_data():
    from app.database.connection import get_db, query_db
    
    print("[DB SEED] Ensuring normalized skill taxonomy, students, and opportunities are seeded...")
    with get_db() as db:
        cur = db.cursor()
        
        # 1. Skills Taxonomy
        skill_id_map = {}
        for s_name, s_cat, s_desc in SKILL_TAXONOMY:
            cur.execute("""
                INSERT OR REPLACE INTO skills (skill_name, category, description)
                VALUES (%s, %s, %s)
            """ if db.is_sqlite else """
                INSERT INTO skills (skill_name, category, description)
                VALUES (%s, %s, %s)
                ON DUPLICATE KEY UPDATE category=VALUES(category), description=VALUES(description)
            """, (s_name, s_cat, s_desc))

        # Build skill map
        cur.execute("SELECT id, skill_name FROM skills")
        for row in cur.fetchall():
            skill_id_map[row["skill_name"].lower()] = row["id"]

        # 2. Seed Admin User
        admin_pass = generate_password_hash("Admin@123")
        cur.execute("""
            INSERT OR IGNORE INTO users (id, name, email, password, department, year, role)
            VALUES (1, 'System Administrator', 'admin@careermatch.ai', %s, 'Computer Science', 'Faculty / Admin', 'admin')
        """ if db.is_sqlite else """
            INSERT IGNORE INTO users (id, name, email, password, department, year, role)
            VALUES (1, 'System Administrator', 'admin@careermatch.ai', %s, 'Computer Science', 'Faculty / Admin', 'admin')
        """, (admin_pass,))

        # 3. Seed Students (Arun Kumar 101, Alex Johnson 102, Priya Sharma 103)
        student_pass = generate_password_hash("Student@123")
        
        # Student 101: Arun Kumar (CSE, 2nd Year, CGPA 8.5, Coimbatore, Data Science)
        cur.execute("""
            INSERT OR REPLACE INTO students (id, name, email, password, role, department, year, cgpa, preferred_domain, preferred_location, opportunity_type)
            VALUES (101, 'Arun Kumar', 'arun.kumar@careermatch.ai', %s, 'student', 'CSE', '2nd Year', 8.50, 'Data Science', 'Coimbatore', 'Internship')
        """, (student_pass,))
        cur.execute("""
            INSERT OR IGNORE INTO users (id, name, email, password, department, year, role)
            VALUES (101, 'Arun Kumar', 'arun.kumar@careermatch.ai', %s, 'CSE', '2nd Year', 'student')
        """, (student_pass,))
        cur.execute("""
            INSERT OR REPLACE INTO student_profiles (id, user_id, cgpa, interests, preferred_domain, preferred_location, opportunity_type, work_mode)
            VALUES (101, 101, 8.50, 'Data Science, Data Analytics', 'Data Science', 'Coimbatore', 'Internship', 'Hybrid')
        """)

        # Student 102: Alex Johnson (IT, 3rd Year, CGPA 8.45, Bangalore, Data Analytics)
        cur.execute("""
            INSERT OR REPLACE INTO students (id, name, email, password, role, department, year, cgpa, preferred_domain, preferred_location, opportunity_type)
            VALUES (102, 'Alex Johnson', 'student@careermatch.ai', %s, 'student', 'Information Technology', '3rd Year', 8.45, 'Data Analytics', 'Bangalore', 'Internship')
        """, (student_pass,))
        cur.execute("""
            INSERT OR IGNORE INTO users (id, name, email, password, department, year, role)
            VALUES (2, 'Alex Johnson', 'student@careermatch.ai', %s, 'Information Technology', '3rd Year', 'student')
        """, (student_pass,))
        cur.execute("""
            INSERT OR REPLACE INTO student_profiles (id, user_id, cgpa, interests, preferred_domain, preferred_location, opportunity_type, work_mode)
            VALUES (2, 2, 8.45, 'Data Science,AI/ML,Web Development', 'Data Analytics', 'Bangalore', 'Internship', 'Hybrid')
        """)

        # 4. Student Skills (Normalized mapping)
        # Student 101: Python, SQL, Pandas
        s101_skills = [("Python", "Intermediate"), ("SQL", "Beginner"), ("Pandas", "Beginner")]
        cur.execute("DELETE FROM student_skills WHERE student_id = 101")
        for sk_name, prof in s101_skills:
            sk_id = skill_id_map.get(sk_name.lower())
            cur.execute("""
                INSERT INTO student_skills (student_id, skill_id, skill_name, proficiency)
                VALUES (%s, %s, %s, %s)
            """, (101, sk_id, sk_name, prof))

        # Student 102 skills
        s102_skills = [
            ("Python", "Advanced"), ("SQL", "Intermediate"), ("Pandas", "Intermediate"),
            ("NumPy", "Intermediate"), ("Data Analysis", "Advanced"), ("HTML", "Intermediate"),
            ("CSS", "Intermediate"), ("JavaScript", "Beginner"), ("Git", "Intermediate")
        ]
        cur.execute("DELETE FROM student_skills WHERE student_id = 2")
        for sk_name, prof in s102_skills:
            sk_id = skill_id_map.get(sk_name.lower())
            cur.execute("""
                INSERT INTO student_skills (student_id, skill_id, skill_name, proficiency)
                VALUES (%s, %s, %s, %s)
            """, (2, sk_id, sk_name, prof))

        # 5. Projects
        cur.execute("DELETE FROM projects WHERE student_id IN (101, 2)")
        cur.execute("""
            INSERT INTO projects (student_id, project_name, description, technologies)
            VALUES (101, 'Student Performance Analysis', 'Statistical performance predictive analytics dashboard evaluating semester scores.', 'Python, Pandas, SQL')
        """)
        cur.execute("""
            INSERT INTO projects (student_id, project_name, description, technologies)
            VALUES (2, 'Customer Churn Predictor', 'Developed an ML model to predict customer churn using usage telemetry.', 'Python, Pandas, Scikit-learn, Flask')
        """)

        # 6. Certifications
        cur.execute("DELETE FROM certifications WHERE student_id IN (101, 2)")
        cur.execute("""
            INSERT INTO certifications (student_id, name, certification_name, organization)
            VALUES (101, 'Python for Data Science', 'Python for Data Science', 'IBM / Coursera')
        """)
        cur.execute("""
            INSERT INTO certifications (student_id, name, certification_name, organization)
            VALUES (2, 'Google Data Analytics Professional Certificate', 'Google Data Analytics Professional Certificate', 'Coursera / Google')
        """)

        # 7. Opportunities & Opportunity Skills
        for op in DEFAULT_OPPORTUNITIES:
            req_str = ", ".join(op["required_skills"])
            pref_str = ", ".join(op["preferred_skills"])
            cur.execute("""
                INSERT OR REPLACE INTO opportunities (
                    id, company_name, company, title, description, domain,
                    required_skills, preferred_skills, qualification, minimum_cgpa,
                    location, opportunity_type, work_mode, stipend_or_salary,
                    application_url, application_link
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                op["id"], op["company_name"], op["company_name"], op["title"], op["description"],
                op["domain"], req_str, pref_str, op["qualification"], op["minimum_cgpa"],
                op["location"], op["opportunity_type"], op["work_mode"], op["stipend_or_salary"],
                op["application_url"], op["application_url"]
            ))

            # Delete old mappings for this opportunity
            cur.execute("DELETE FROM opportunity_skills WHERE opportunity_id = %s", (op["id"],))

            # Insert required skills (weight 1.0)
            for req_skill in op["required_skills"]:
                sk_id = skill_id_map.get(req_skill.lower())
                if sk_id:
                    cur.execute("""
                        INSERT OR REPLACE INTO opportunity_skills (opportunity_id, skill_id, is_required, importance_weight)
                        VALUES (%s, %s, 1, 1.00)
                    """, (op["id"], sk_id))

            # Insert preferred skills (weight 0.5)
            for pref_skill in op["preferred_skills"]:
                sk_id = skill_id_map.get(pref_skill.lower())
                if sk_id:
                    cur.execute("""
                        INSERT OR REPLACE INTO opportunity_skills (opportunity_id, skill_id, is_required, importance_weight)
                        VALUES (%s, %s, 0, 0.50)
                    """, (op["id"], sk_id))

        db.commit()
        print("[DB SEED] Successfully verified and seeded normalized database records.")
