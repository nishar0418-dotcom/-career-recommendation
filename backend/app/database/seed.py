from werkzeug.security import generate_password_hash

DEFAULT_SKILLS = [
    ('Python', 'Programming Languages'),
    ('Java', 'Programming Languages'),
    ('C', 'Programming Languages'),
    ('C++', 'Programming Languages'),
    ('JavaScript', 'Programming Languages'),
    ('TypeScript', 'Programming Languages'),
    ('SQL', 'Programming Languages'),
    ('HTML', 'Web Development'),
    ('CSS', 'Web Development'),
    ('React', 'Web Development'),
    ('Node.js', 'Web Development'),
    ('Express.js', 'Web Development'),
    ('Next.js', 'Web Development'),
    ('Tailwind CSS', 'Web Development'),
    ('Bootstrap', 'Web Development'),
    ('Machine Learning', 'Data & AI'),
    ('Data Science', 'Data & AI'),
    ('Pandas', 'Data & AI'),
    ('NumPy', 'Data & AI'),
    ('Scikit-learn', 'Data & AI'),
    ('TensorFlow', 'Data & AI'),
    ('PyTorch', 'Data & AI'),
    ('Power BI', 'Data & AI'),
    ('Tableau', 'Data & AI'),
    ('Statistics', 'Data & AI'),
    ('Data Analysis', 'Data & AI'),
    ('NLP', 'Data & AI'),
    ('Cloud Computing', 'Cloud & DevOps'),
    ('AWS', 'Cloud & DevOps'),
    ('Azure', 'Cloud & DevOps'),
    ('Docker', 'Cloud & DevOps'),
    ('Kubernetes', 'Cloud & DevOps'),
    ('Git', 'Cloud & DevOps'),
    ('Cyber Security', 'Cyber Security'),
    ('Network Security', 'Cyber Security'),
    ('Ethical Hacking', 'Cyber Security'),
    ('Cryptography', 'Cyber Security'),
    ('Penetration Testing', 'Cyber Security'),
    ('Flutter', 'Mobile Development'),
    ('React Native', 'Mobile Development'),
    ('Android Studio', 'Mobile Development')
]

DEFAULT_OPPORTUNITIES = [
    {
        "company": "ABC Technologies",
        "title": "Data Analyst Intern",
        "description": "Analyze real-world business datasets, design reporting pipelines, and build interactive executive dashboards to power data-driven decisions.",
        "domain": "Data Science",
        "required_skills": "Python, SQL, Pandas, Excel, Power BI",
        "preferred_skills": "Statistics, Tableau, Data Visualization",
        "qualification": "B.Tech / B.E / B.Sc in CS, IT, or Statistics",
        "minimum_cgpa": 7.00,
        "location": "Bangalore",
        "opportunity_type": "Internship",
        "work_mode": "Hybrid",
        "stipend_or_salary": "₹25,000 / month",
        "application_link": "https://example.com/apply/data-analyst-intern"
    },
    {
        "company": "NexTech Solutions",
        "title": "Python Developer Intern",
        "description": "Build scalable backend services, automate analytical pipelines, integrate RESTful APIs, and contribute to internal automation frameworks.",
        "domain": "Software Development",
        "required_skills": "Python, SQL, Git, Flask, REST API",
        "preferred_skills": "Docker, Linux, PostgreSQL, PyTest",
        "qualification": "B.Tech in Computer Science or related degree",
        "minimum_cgpa": 7.00,
        "location": "Remote",
        "opportunity_type": "Internship",
        "work_mode": "Remote",
        "stipend_or_salary": "₹22,000 / month",
        "application_link": "https://example.com/apply/python-dev-intern"
    },
    {
        "company": "DataPulse Labs",
        "title": "Data Science Intern",
        "description": "Work closely with senior data scientists to clean enterprise data, train predictive models, conduct hypothesis testing, and evaluate machine learning algorithms.",
        "domain": "Data Science",
        "required_skills": "Python, SQL, Pandas, NumPy, Scikit-learn, Statistics",
        "preferred_skills": "Machine Learning, Power BI, Tableau, TensorFlow",
        "qualification": "Pursuing B.Tech / M.Tech in CS or AI/Data Science",
        "minimum_cgpa": 7.50,
        "location": "Hyderabad",
        "opportunity_type": "Internship",
        "work_mode": "Hybrid",
        "stipend_or_salary": "₹30,000 / month",
        "application_link": "https://example.com/apply/data-science-intern"
    },
    {
        "company": "DeepMind Innovations",
        "title": "Machine Learning Intern",
        "description": "Design, evaluate, and benchmark machine learning models for computer vision and NLP. Clean training data and implement feature pipelines.",
        "domain": "Artificial Intelligence",
        "required_skills": "Python, Machine Learning, Scikit-learn, Pandas, NumPy, Statistics",
        "preferred_skills": "PyTorch, TensorFlow, Deep Learning, OpenCV",
        "qualification": "B.Tech / M.S. in Computer Science or AI/ML",
        "minimum_cgpa": 8.00,
        "location": "Bangalore",
        "opportunity_type": "Internship",
        "work_mode": "On-site",
        "stipend_or_salary": "₹35,000 / month",
        "application_link": "https://example.com/apply/ml-intern"
    },
    {
        "company": "CodeCraft Innovations",
        "title": "Web Developer Intern",
        "description": "Develop responsive user interfaces, craft interactive web components, and integrate backend REST APIs using modern web technologies.",
        "domain": "Web Development",
        "required_skills": "HTML, CSS, JavaScript, React, Git",
        "preferred_skills": "Tailwind CSS, Node.js, Bootstrap, TypeScript",
        "qualification": "B.Tech / B.C.A / M.C.A in CS or IT",
        "minimum_cgpa": 6.50,
        "location": "Pune",
        "opportunity_type": "Internship",
        "work_mode": "Hybrid",
        "stipend_or_salary": "₹20,000 / month",
        "application_link": "https://example.com/apply/web-dev-intern"
    },
    {
        "company": "PixelWave Studios",
        "title": "Frontend Developer Intern",
        "description": "Craft pixel-perfect, accessible, and high-performance user interfaces for modern web applications using React and modern CSS component systems.",
        "domain": "Web Development",
        "required_skills": "React, JavaScript, HTML, CSS, Tailwind CSS",
        "preferred_skills": "Next.js, TypeScript, Redux, UI/UX",
        "qualification": "Undergraduate in Computer Science / Web Design",
        "minimum_cgpa": 6.50,
        "location": "Remote",
        "opportunity_type": "Internship",
        "work_mode": "Remote",
        "stipend_or_salary": "₹24,000 / month",
        "application_link": "https://example.com/apply/frontend-intern"
    },
    {
        "company": "CloudScale Systems",
        "title": "Backend Developer Intern",
        "description": "Design and maintain high-throughput backend services, implement database schemas, optimize database queries, and author microservice APIs.",
        "domain": "Software Development",
        "required_skills": "Node.js, Express.js, SQL, JavaScript, Git",
        "preferred_skills": "Docker, AWS, MongoDB, Redis",
        "qualification": "B.Tech in CS / IT or relevant software discipline",
        "minimum_cgpa": 7.00,
        "location": "Chennai",
        "opportunity_type": "Internship",
        "work_mode": "Hybrid",
        "stipend_or_salary": "₹25,000 / month",
        "application_link": "https://example.com/apply/backend-intern"
    },
    {
        "company": "OmniStack Enterprise",
        "title": "Full Stack Developer Intern",
        "description": "Build end-to-end features from intuitive React frontends to robust Node.js/Python backend architectures and relational database storage.",
        "domain": "Full Stack Development",
        "required_skills": "React, Node.js, JavaScript, HTML, CSS, SQL, Git",
        "preferred_skills": "Python, Express.js, MongoDB, Docker",
        "qualification": "B.Tech / B.E in CS/IT",
        "minimum_cgpa": 7.50,
        "location": "Coimbatore",
        "opportunity_type": "Internship",
        "work_mode": "On-site",
        "stipend_or_salary": "₹28,000 / month",
        "application_link": "https://example.com/apply/fullstack-intern"
    },
    {
        "company": "SecureNet Defense",
        "title": "Cyber Security Intern",
        "description": "Perform vulnerability assessments, assist in penetration testing routines, inspect firewall logs, and implement foundational defense measures.",
        "domain": "Cyber Security",
        "required_skills": "Cyber Security, Network Security, Python, Linux, Cryptography",
        "preferred_skills": "Ethical Hacking, Wireshark, Penetration Testing",
        "qualification": "B.Tech in Information Security / CS",
        "minimum_cgpa": 7.00,
        "location": "Bangalore",
        "opportunity_type": "Internship",
        "work_mode": "Hybrid",
        "stipend_or_salary": "₹26,000 / month",
        "application_link": "https://example.com/apply/cybersecurity-intern"
    },
    {
        "company": "SkyHigh Cloud Services",
        "title": "Cloud Computing Intern",
        "description": "Automate cloud provisioning, manage containerized deployments, monitor infrastructure metrics, and support cloud migration tasks.",
        "domain": "Cloud Computing",
        "required_skills": "Cloud Computing, AWS, Linux, Python, Git",
        "preferred_skills": "Docker, Kubernetes, Terraform, Azure",
        "qualification": "B.Tech in CS, Cloud Computing, or IT",
        "minimum_cgpa": 7.00,
        "location": "Hyderabad",
        "opportunity_type": "Internship",
        "work_mode": "Hybrid",
        "stipend_or_salary": "₹28,000 / month",
        "application_link": "https://example.com/apply/cloud-intern"
    },
    {
        "company": "AppVenture Studio",
        "title": "Mobile App Developer Intern",
        "description": "Design and build cross-platform mobile apps, integrate native camera/storage APIs, and connect mobile frontends with cloud APIs.",
        "domain": "Mobile App Development",
        "required_skills": "Flutter, Dart, Mobile Development, Git",
        "preferred_skills": "React Native, Android Studio, Firebase",
        "qualification": "B.Tech / B.C.A in CS or Software Engineering",
        "minimum_cgpa": 6.50,
        "location": "Kochi",
        "opportunity_type": "Internship",
        "work_mode": "Remote",
        "stipend_or_salary": "₹22,000 / month",
        "application_link": "https://example.com/apply/mobile-intern"
    },
    {
        "company": "CognitiveAI Labs",
        "title": "AI Research Associate",
        "description": "Engage in experimental research across transformer architectures, multi-agent frameworks, and generative AI systems with empirical benchmarks.",
        "domain": "Artificial Intelligence",
        "required_skills": "Python, Machine Learning, PyTorch, Scikit-learn, NLP, Statistics",
        "preferred_skills": "LangChain, Transformers, HuggingFace, CUDA",
        "qualification": "B.Tech / M.Tech in Computer Science / AI",
        "minimum_cgpa": 8.20,
        "location": "Bangalore",
        "opportunity_type": "Job",
        "work_mode": "Hybrid",
        "stipend_or_salary": "₹9,00,000 - 12,00,000 / year",
        "application_link": "https://example.com/apply/ai-researcher"
    }
]

def seed_initial_data():
    from app.database.connection import get_db, query_db
    
    # Check if opportunities exist
    existing_ops = query_db("SELECT COUNT(*) as count FROM opportunities", one=True)
    count = existing_ops.get("count", 0) if existing_ops else 0
    if count > 0:
        return

    print("[DB SEED] Seeding master skills, users, profile, and opportunities...")
    with get_db() as db:
        cur = db.cursor()
        
        # 1. Skills
        for skill_name, category in DEFAULT_SKILLS:
            try:
                cur.execute(
                    "INSERT OR IGNORE INTO skills (skill_name, category) VALUES (%s, %s)" if db.is_sqlite else
                    "INSERT IGNORE INTO skills (skill_name, category) VALUES (%s, %s)",
                    (skill_name, category)
                )
            except Exception:
                pass
        
        # 2. Admin User (Admin@123)
        admin_pass = generate_password_hash("Admin@123")
        cur.execute(
            "INSERT OR IGNORE INTO users (name, email, password, department, year, role) VALUES (%s, %s, %s, %s, %s, %s)" if db.is_sqlite else
            "INSERT IGNORE INTO users (name, email, password, department, year, role) VALUES (%s, %s, %s, %s, %s, %s)",
            ("System Administrator", "admin@careermatch.ai", admin_pass, "Computer Science & Engineering", "Faculty / Admin", "admin")
        )

        # 3. Student User (Student@123)
        student_pass = generate_password_hash("Student@123")
        cur.execute(
            "INSERT OR IGNORE INTO users (name, email, password, department, year, role) VALUES (%s, %s, %s, %s, %s, %s)" if db.is_sqlite else
            "INSERT IGNORE INTO users (name, email, password, department, year, role) VALUES (%s, %s, %s, %s, %s, %s)",
            ("Alex Johnson", "student@careermatch.ai", student_pass, "Information Technology", "3rd Year", "student")
        )

        # Find student id
        cur.execute("SELECT id FROM users WHERE email = %s", ("student@careermatch.ai",))
        student_user = cur.fetchone()
        if student_user:
            s_id = student_user["id"]
            
            # Profile
            cur.execute(
                "INSERT OR REPLACE INTO student_profiles (user_id, cgpa, interests, preferred_domain, preferred_location, opportunity_type, work_mode) VALUES (%s, %s, %s, %s, %s, %s, %s)",
                (s_id, 8.45, "Data Science,AI/ML,Web Development", "Data Analytics", "Bangalore", "Internship", "Hybrid")
            )
            
            # Skills
            sample_student_skills = [
                ("Python", "Advanced"),
                ("SQL", "Intermediate"),
                ("Pandas", "Intermediate"),
                ("NumPy", "Intermediate"),
                ("Data Analysis", "Advanced"),
                ("HTML", "Intermediate"),
                ("CSS", "Intermediate"),
                ("JavaScript", "Beginner"),
                ("Git", "Intermediate")
            ]
            for sk, prof in sample_student_skills:
                cur.execute(
                    "INSERT INTO student_skills (student_id, skill_name, proficiency) VALUES (%s, %s, %s)",
                    (s_id, sk, prof)
                )

            # Projects
            cur.execute(
                "INSERT INTO projects (student_id, project_name, description, technologies) VALUES (%s, %s, %s, %s)",
                (s_id, "Customer Churn Predictor", "Developed a machine learning model to predict telecommunication customer churn using customer usage telemetry and demographics.", "Python, Pandas, Scikit-learn, Matplotlib, Flask")
            )
            cur.execute(
                "INSERT INTO projects (student_id, project_name, description, technologies) VALUES (%s, %s, %s, %s)",
                (s_id, "Sales Performance Interactive Dashboard", "Aggregated and cleaned quarterly sales data, visualizing revenue pipelines and regional conversion rates.", "Python, SQL, Excel, Streamlit")
            )

            # Certifications
            cur.execute(
                "INSERT INTO certifications (student_id, certification_name, organization) VALUES (%s, %s, %s)",
                (s_id, "Google Data Analytics Professional Certificate", "Coursera / Google")
            )
            cur.execute(
                "INSERT INTO certifications (student_id, certification_name, organization) VALUES (%s, %s, %s)",
                (s_id, "Python for Everybody Specialization", "University of Michigan")
            )

        # 4. Opportunities
        for op in DEFAULT_OPPORTUNITIES:
            cur.execute("""
                INSERT INTO opportunities (
                    company, title, description, domain, required_skills,
                    preferred_skills, qualification, minimum_cgpa, location,
                    opportunity_type, work_mode, stipend_or_salary, application_link
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                op["company"], op["title"], op["description"], op["domain"],
                op["required_skills"], op["preferred_skills"], op["qualification"],
                op["minimum_cgpa"], op["location"], op["opportunity_type"],
                op["work_mode"], op["stipend_or_salary"], op["application_link"]
            ))

        db.commit()
        print("[DB SEED] Successfully seeded default database records.")
