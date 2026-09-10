-- CareerMatch AI Sample Seed Data
-- For MySQL Database

USE careermatch_db;

-- 1. Insert Default Skills
INSERT INTO skills (skill_name, category) VALUES
-- Programming Languages
('Python', 'Programming Languages'),
('Java', 'Programming Languages'),
('C', 'Programming Languages'),
('C++', 'Programming Languages'),
('JavaScript', 'Programming Languages'),
('TypeScript', 'Programming Languages'),
('SQL', 'Programming Languages'),
-- Web Development
('HTML', 'Web Development'),
('CSS', 'Web Development'),
('React', 'Web Development'),
('Node.js', 'Web Development'),
('Express.js', 'Web Development'),
('Next.js', 'Web Development'),
('Tailwind CSS', 'Web Development'),
('Bootstrap', 'Web Development'),
-- Data & AI
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
-- Cloud & DevOps
('Cloud Computing', 'Cloud & DevOps'),
('AWS', 'Cloud & DevOps'),
('Azure', 'Cloud & DevOps'),
('Docker', 'Cloud & DevOps'),
('Kubernetes', 'Cloud & DevOps'),
('Git', 'Cloud & DevOps'),
-- Cyber Security
('Cyber Security', 'Cyber Security'),
('Network Security', 'Cyber Security'),
('Ethical Hacking', 'Cyber Security'),
('Cryptography', 'Cyber Security'),
('Penetration Testing', 'Cyber Security'),
-- Mobile Development
('Flutter', 'Mobile Development'),
('React Native', 'Mobile Development'),
('Android Studio', 'Mobile Development')
ON DUPLICATE KEY UPDATE category=VALUES(category);

-- 2. Insert Users (Admin & Students)
-- Admin: Admin@123
-- Student: Student@123
INSERT INTO users (id, name, email, password, department, year, role) VALUES
(1, 'System Administrator', 'admin@careermatch.ai', 'scrypt:32768:8:1$WTJiPstgmOQ9bBdY$ca2ea6f0b882974007631e7fc49a4b467a2bdc4d2bcb43e8ffa5076ad124afd564ed2a90230d99a9166d647e91a9c7d6e48cf93d1c936271031195f2602a954d', 'Computer Science & Engineering', 'Faculty / Admin', 'admin'),
(2, 'Alex Johnson', 'student@careermatch.ai', 'scrypt:32768:8:1$aoEtCCOiF8cSdnL4$94dc0744ca94ba8ded97cff0da2342e61a79595da59e1c8ce09ed098a35b008ceb9fe28e10ab44856bb68a21fc155cca54b51dce8bf87c964910c3a2d1653ab5', 'Information Technology', '3rd Year', 'student')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 3. Insert Student Profile for Alex Johnson (User 2)
INSERT INTO student_profiles (id, user_id, cgpa, interests, preferred_domain, preferred_location, opportunity_type, work_mode) VALUES
(1, 2, 8.45, 'Data Science,AI/ML,Web Development', 'Data Analytics', 'Bangalore', 'Internship', 'Hybrid')
ON DUPLICATE KEY UPDATE cgpa=VALUES(cgpa);

-- 4. Insert Student Skills for Alex Johnson
INSERT INTO student_skills (student_id, skill_name, proficiency) VALUES
(2, 'Python', 'Advanced'),
(2, 'SQL', 'Intermediate'),
(2, 'Pandas', 'Intermediate'),
(2, 'NumPy', 'Intermediate'),
(2, 'Data Analysis', 'Advanced'),
(2, 'HTML', 'Intermediate'),
(2, 'CSS', 'Intermediate'),
(2, 'JavaScript', 'Beginner'),
(2, 'Git', 'Intermediate')
ON DUPLICATE KEY UPDATE proficiency=VALUES(proficiency);

-- 5. Insert Projects for Alex Johnson
INSERT INTO projects (student_id, project_name, description, technologies) VALUES
(2, 'Customer Churn Predictor', 'Developed a machine learning model to predict telecommunication customer churn using customer usage telemetry and demographics.', 'Python, Pandas, Scikit-learn, Matplotlib, Flask'),
(2, 'Sales Performance Interactive Dashboard', 'Aggregated and cleaned quarterly sales data, visualizing revenue pipelines and regional conversion rates.', 'Python, SQL, Excel, Streamlit')
ON DUPLICATE KEY UPDATE description=VALUES(description);

-- 6. Insert Certifications for Alex Johnson
INSERT INTO certifications (student_id, certification_name, organization) VALUES
(2, 'Google Data Analytics Professional Certificate', 'Coursera / Google'),
(2, 'Python for Everybody Specialization', 'University of Michigan')
ON DUPLICATE KEY UPDATE organization=VALUES(organization);

-- 7. Insert Opportunities (Jobs & Internships across Domains)
INSERT INTO opportunities (id, company, title, description, domain, required_skills, preferred_skills, qualification, minimum_cgpa, location, opportunity_type, work_mode, stipend_or_salary, application_link) VALUES
(1, 'ABC Technologies', 'Data Analyst Intern', 'Analyze real-world business datasets, design reporting pipelines, and build interactive executive dashboards to power data-driven decisions.', 'Data Science', 'Python, SQL, Pandas, Excel, Power BI', 'Statistics, Tableau, Data Visualization', 'B.Tech / B.E / B.Sc in CS, IT, or Statistics', 7.00, 'Bangalore', 'Internship', 'Hybrid', 'Rs 25,000 / month', 'https://example.com/apply/data-analyst-intern'),

(2, 'NexTech Solutions', 'Python Developer Intern', 'Build scalable backend services, automate analytical pipelines, integrate RESTful APIs, and contribute to internal automation frameworks.', 'Software Development', 'Python, SQL, Git, Flask, REST API', 'Docker, Linux, PostgreSQL, PyTest', 'B.Tech in Computer Science or related degree', 7.00, 'Remote', 'Internship', 'Remote', 'Rs 22,000 / month', 'https://example.com/apply/python-dev-intern'),

(3, 'DataPulse Labs', 'Data Science Intern', 'Work closely with senior data scientists to clean enterprise data, train predictive models, conduct hypothesis testing, and evaluate machine learning algorithms.', 'Data Science', 'Python, SQL, Pandas, NumPy, Scikit-learn, Statistics', 'Machine Learning, Power BI, Tableau, TensorFlow', 'Pursuing B.Tech / M.Tech in CS or AI/Data Science', 7.50, 'Hyderabad', 'Internship', 'Hybrid', 'Rs 30,000 / month', 'https://example.com/apply/data-science-intern'),

(4, 'DeepMind Innovations', 'Machine Learning Intern', 'Design, evaluate, and benchmark machine learning models for computer vision and NLP. Clean training data and implement feature pipelines.', 'Artificial Intelligence', 'Python, Machine Learning, Scikit-learn, Pandas, NumPy, Statistics', 'PyTorch, TensorFlow, Deep Learning, OpenCV', 'B.Tech / M.S. in Computer Science or AI/ML', 8.00, 'Bangalore', 'Internship', 'On-site', 'Rs 35,000 / month', 'https://example.com/apply/ml-intern'),

(5, 'CodeCraft Innovations', 'Web Developer Intern', 'Develop responsive user interfaces, craft interactive web components, and integrate backend REST APIs using modern web technologies.', 'Web Development', 'HTML, CSS, JavaScript, React, Git', 'Tailwind CSS, Node.js, Bootstrap, TypeScript', 'B.Tech / B.C.A / M.C.A in CS or IT', 6.50, 'Pune', 'Internship', 'Hybrid', 'Rs 20,000 / month', 'https://example.com/apply/web-dev-intern'),

(6, 'PixelWave Studios', 'Frontend Developer Intern', 'Craft pixel-perfect, accessible, and high-performance user interfaces for modern web applications using React and CSS component systems.', 'Web Development', 'React, JavaScript, HTML, CSS, Tailwind CSS', 'Next.js, TypeScript, Redux, UI/UX', 'Undergraduate in Computer Science / Web Design', 6.50, 'Remote', 'Internship', 'Remote', 'Rs 24,000 / month', 'https://example.com/apply/frontend-intern'),

(7, 'CloudScale Systems', 'Backend Developer Intern', 'Design and maintain high-throughput backend services, implement database schemas, optimize database queries, and author microservice APIs.', 'Software Development', 'Node.js, Express.js, SQL, JavaScript, Git', 'Docker, AWS, MongoDB, Redis', 'B.Tech in CS / IT or relevant software discipline', 7.00, 'Chennai', 'Internship', 'Hybrid', 'Rs 25,000 / month', 'https://example.com/apply/backend-intern'),

(8, 'OmniStack Enterprise', 'Full Stack Developer Intern', 'Build end-to-end features from intuitive React frontends to robust Node.js/Python backend architectures and relational database storage.', 'Full Stack Development', 'React, Node.js, JavaScript, HTML, CSS, SQL, Git', 'Python, Express.js, MongoDB, Docker', 'B.Tech / B.E in CS/IT', 7.50, 'Coimbatore', 'Internship', 'On-site', 'Rs 28,000 / month', 'https://example.com/apply/fullstack-intern'),

(9, 'SecureNet Defense', 'Cyber Security Intern', 'Perform vulnerability assessments, assist in penetration testing routines, inspect firewall logs, and implement foundational defense measures.', 'Cyber Security', 'Cyber Security, Network Security, Python, Linux, Cryptography', 'Ethical Hacking, Wireshark, Penetration Testing', 'B.Tech in Information Security / CS', 7.00, 'Bangalore', 'Internship', 'Hybrid', 'Rs 26,000 / month', 'https://example.com/apply/cybersecurity-intern'),

(10, 'SkyHigh Cloud Services', 'Cloud Computing Intern', 'Automate cloud provisioning, manage containerized deployments, monitor infrastructure metrics, and support cloud migration tasks.', 'Cloud Computing', 'Cloud Computing, AWS, Linux, Python, Git', 'Docker, Kubernetes, Terraform, Azure', 'B.Tech in CS, Cloud Computing, or IT', 7.00, 'Hyderabad', 'Internship', 'Hybrid', 'Rs 28,000 / month', 'https://example.com/apply/cloud-intern'),

(11, 'AppVenture Studio', 'Mobile App Developer Intern', 'Design and build cross-platform mobile apps, integrate native camera/storage APIs, and connect mobile frontends with cloud APIs.', 'Mobile App Development', 'Flutter, Dart, Mobile Development, Git', 'React Native, Android Studio, Firebase', 'B.Tech / B.C.A in CS or Software Engineering', 6.50, 'Kochi', 'Internship', 'Remote', 'Rs 22,000 / month', 'https://example.com/apply/mobile-intern'),

(12, 'CognitiveAI Labs', 'AI Research Associate', 'Engage in experimental research across transformer architectures, multi-agent frameworks, and generative AI systems with empirical benchmarks.', 'Artificial Intelligence', 'Python, Machine Learning, PyTorch, Scikit-learn, NLP, Statistics', 'LangChain, Transformers, HuggingFace, CUDA', 'B.Tech / M.Tech in Computer Science / AI', 8.20, 'Bangalore', 'Job', 'Hybrid', 'Rs 9,00,000 - 12,00,000 / annum', 'https://example.com/apply/ai-researcher')
ON DUPLICATE KEY UPDATE company=VALUES(company);
