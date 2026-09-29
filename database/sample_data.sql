-- ============================================================================
-- CareerMatch AI: Normalized Sample Data & Skill Taxonomy Seeding
-- ============================================================================

-- 1. Skills Taxonomy
INSERT OR REPLACE INTO skills (id, skill_name, category, description) VALUES
-- Programming
(1, 'Python', 'Programming', 'General-purpose high-level programming language widely used in AI, Data Science, and backend development.'),
(2, 'Java', 'Programming', 'Class-based object-oriented language for enterprise backends and Android development.'),
(3, 'C', 'Programming', 'Procedural system programming language for embedded hardware and OS kernels.'),
(4, 'C++', 'Programming', 'High-performance systems programming language with OOP and manual memory control.'),
(5, 'JavaScript', 'Programming', 'Ubiquitous web scripting language for browser clients and asynchronous node runtimes.'),
(6, 'TypeScript', 'Programming', 'Typed superset of JavaScript bringing compile-time safety to large web codebases.'),
(7, 'Go', 'Programming', 'Compiled, concurrent systems language engineered by Google for scalable microservices.'),
(8, 'Rust', 'Programming', 'Memory-safe systems programming language without garbage collection overhead.'),

-- Data Science
(9, 'Pandas', 'Data Science', 'Data manipulation and tabular dataframe analysis library in Python.'),
(10, 'NumPy', 'Data Science', 'Fundamental package for scientific computing with N-dimensional array processing.'),
(11, 'Data Analysis', 'Data Science', 'Exploratory data inspection, statistical cleansing, and business metric derivation.'),
(12, 'Statistics', 'Data Science', 'Mathematical probability distributions, hypothesis testing, and variance analysis.'),
(13, 'Tableau', 'Data Science', 'Enterprise visual analytics platform for building operational dashboards.'),
(14, 'Power BI', 'Data Science', 'Microsoft business intelligence service for interactive visualizations and reporting.'),
(15, 'Excel', 'Data Science', 'Spreadsheet calculations, pivot tables, and formula-based tabular modeling.'),
(16, 'Data Visualization', 'Data Science', 'Graphic charting and dashboard representation using Matplotlib, Seaborn, and D3.'),

-- AI / Machine Learning
(17, 'Machine Learning', 'AI / Machine Learning', 'Supervised and unsupervised algorithmic model training from historical datasets.'),
(18, 'Scikit-learn', 'AI / Machine Learning', 'Python library for classification, regression, clustering, and model evaluation.'),
(19, 'TensorFlow', 'AI / Machine Learning', 'End-to-end open source platform for machine learning and neural networks.'),
(20, 'PyTorch', 'AI / Machine Learning', 'Dynamic deep learning tensor framework favored in academic and production AI research.'),
(21, 'Deep Learning', 'AI / Machine Learning', 'Multi-layer artificial neural networks including CNNs, RNNs, and transformer heads.'),
(22, 'NLP', 'AI / Machine Learning', 'Natural Language Processing for text tokenization, embeddings, and semantic parsing.'),
(23, 'Computer Vision', 'AI / Machine Learning', 'Visual object detection, segmentation, and image classification algorithms.'),

-- Web Development
(24, 'HTML', 'Web Development', 'Semantic standard markup language for creating structured web document layouts.'),
(25, 'CSS', 'Web Development', 'Style sheet language for responsive typography, grid layouts, and visual formatting.'),
(26, 'React', 'Web Development', 'Component-driven declarative frontend user interface library created by Meta.'),
(27, 'Node.js', 'Web Development', 'V8 JavaScript runtime engine for executing scalable backend server applications.'),
(28, 'Express.js', 'Web Development', 'Minimalist HTTP web framework for designing RESTful web APIs on Node.js.'),
(29, 'Next.js', 'Web Development', 'Production React framework featuring server-side rendering and static page generation.'),
(30, 'Tailwind CSS', 'Web Development', 'Utility-first modern CSS framework for rapid responsive interface prototyping.'),
(31, 'Bootstrap', 'Web Development', 'Pre-styled mobile-friendly responsive CSS component and grid framework.'),

-- Database
(32, 'SQL', 'Database', 'Standardized declarative structured query language for relational database systems.'),
(33, 'MySQL', 'Database', 'Widely adopted open-source relational database management system with ACID compliance.'),
(34, 'PostgreSQL', 'Database', 'Advanced enterprise-grade object-relational database with JSONB indexing.'),
(35, 'MongoDB', 'Database', 'Document-oriented NoSQL database storing JSON-like documents with flexible schemas.'),
(36, 'Redis', 'Database', 'In-memory key-value data structure store used for caching and low-latency queuing.'),
(37, 'SQLite', 'Database', 'Self-contained, serverless, zero-configuration SQL database engine.'),

-- Cloud
(38, 'Cloud Computing', 'Cloud', 'On-demand delivery of compute power, database storage, and cloud infrastructure.'),
(39, 'AWS', 'Cloud', 'Amazon Web Services comprehensive cloud computing suite including EC2, S3, and RDS.'),
(40, 'Azure', 'Cloud', 'Microsoft cloud enterprise platform for deploying enterprise hybrid services.'),
(41, 'Google Cloud', 'Cloud', 'Google cloud infrastructure offering BigQuery, Kubernetes Engine, and Vertex AI.'),
(42, 'Docker', 'Cloud', 'Containerization platform to package applications with dependencies into images.'),
(43, 'Kubernetes', 'Cloud', 'Automated container orchestration system for deploying and scaling microservices.'),
(44, 'Linux', 'Cloud', 'Unix-like operating system kernel powering web servers and cloud virtual machines.'),

-- Cyber Security
(45, 'Cyber Security', 'Cyber Security', 'Practice of protecting networks, devices, and data from malicious digital attacks.'),
(46, 'Network Security', 'Cyber Security', 'Firewall policies, packet inspection, VPN tunneling, and network defense measures.'),
(47, 'Ethical Hacking', 'Cyber Security', 'Authorized penetration testing to uncover security vulnerabilities before attackers.'),
(48, 'Cryptography', 'Cyber Security', 'Mathematical ciphers, hashing, and public-key infrastructure for confidentiality.'),
(49, 'Penetration Testing', 'Cyber Security', 'Systematic simulated cyberattacks against system vulnerabilities using Kali tools.'),

-- Tools
(50, 'Git', 'Tools', 'Distributed source code revision control and collaborative team workflow system.'),
(51, 'GitHub', 'Tools', 'Cloud platform hosting Git repositories with CI/CD pull request reviews.'),
(52, 'VS Code', 'Tools', 'Extensible source code editor developed by Microsoft with rich language servers.'),
(53, 'Postman', 'Tools', 'API development platform for constructing HTTP requests and automated testing.'),
(54, 'Jira', 'Tools', 'Agile project tracking and issue management workspace for software sprints.'),

-- Soft Skills
(55, 'Problem Solving', 'Soft Skills', 'Methodical root-cause analytical thinking and architectural debugging acumen.'),
(56, 'Communication', 'Soft Skills', 'Clear articulation of complex technical trade-offs to cross-functional stakeholders.'),
(57, 'Teamwork', 'Soft Skills', 'Effective collaboration in agile pairs and distributed engineering teams.');


-- 2. Students Sample Data
INSERT OR REPLACE INTO students (id, name, email, password, role, department, year, cgpa, preferred_domain, preferred_location, opportunity_type) VALUES
(101, 'Arun Kumar', 'arun.kumar@careermatch.ai', 'scrypt:32768:8:1$aoEtCCOiF8cSdnL4$94dc0744ca94ba8ded97cff0da2342e61a79595da59e1c8ce09ed098a35b008ceb9fe28e10ab44856bb68a21fc155cca54b51dce8bf87c964910c3a2d1653ab5', 'student', 'CSE', '2nd Year', 8.50, 'Data Science', 'Coimbatore', 'Internship'),
(102, 'Alex Johnson', 'student@careermatch.ai', 'scrypt:32768:8:1$aoEtCCOiF8cSdnL4$94dc0744ca94ba8ded97cff0da2342e61a79595da59e1c8ce09ed098a35b008ceb9fe28e10ab44856bb68a21fc155cca54b51dce8bf87c964910c3a2d1653ab5', 'student', 'Information Technology', '3rd Year', 8.45, 'Data Analytics', 'Bangalore', 'Internship'),
(103, 'Priya Sharma', 'priya.sharma@careermatch.ai', 'scrypt:32768:8:1$aoEtCCOiF8cSdnL4$94dc0744ca94ba8ded97cff0da2342e61a79595da59e1c8ce09ed098a35b008ceb9fe28e10ab44856bb68a21fc155cca54b51dce8bf87c964910c3a2d1653ab5', 'student', 'Computer Science & Engineering', 'Final Year', 7.80, 'Web Development', 'Coimbatore', 'Job');


-- 3. Student Skills (Normalized References)
-- Student 101: Python (1), SQL (32), Pandas (9)
INSERT OR REPLACE INTO student_skills (id, student_id, skill_id, proficiency) VALUES
(1, 101, 1, 'Intermediate'),
(2, 101, 32, 'Beginner'),
(3, 101, 9, 'Beginner'),

-- Student 102: Python (1), SQL (32), Pandas (9), NumPy (10), Data Analysis (11), HTML (24), CSS (25), JavaScript (5), Git (50)
(4, 102, 1, 'Advanced'),
(5, 102, 32, 'Intermediate'),
(6, 102, 9, 'Intermediate'),
(7, 102, 10, 'Intermediate'),
(8, 102, 11, 'Advanced'),
(9, 102, 24, 'Intermediate'),
(10, 102, 25, 'Intermediate'),
(11, 102, 5, 'Beginner'),
(12, 102, 50, 'Intermediate'),

-- Student 103: React (26), JavaScript (5), HTML (24), CSS (25), Git (50), Node.js (27)
(13, 103, 26, 'Advanced'),
(14, 103, 5, 'Advanced'),
(15, 103, 24, 'Advanced'),
(16, 103, 25, 'Advanced'),
(17, 103, 50, 'Intermediate'),
(18, 103, 27, 'Intermediate');


-- 4. Student Projects
INSERT OR REPLACE INTO projects (id, student_id, project_name, description, technologies) VALUES
(1, 101, 'Student Performance Analysis', 'Statistical performance predictive analytics dashboard evaluating semester scores across engineering departments.', 'Python, Pandas, SQL'),
(2, 102, 'Customer Churn Predictor', 'Developed a machine learning model to predict telecommunication customer churn using usage telemetry.', 'Python, Pandas, Scikit-learn, Flask'),
(3, 102, 'Sales Performance Interactive Dashboard', 'Aggregated and cleaned quarterly sales data, visualizing revenue pipelines and conversion rates.', 'Python, SQL, Excel, Streamlit'),
(4, 103, 'E-Commerce Marketplace Frontend', 'Interactive shopping platform with shopping cart, filterable product catalog, and secure checkout state.', 'React, JavaScript, Tailwind CSS, Redux');


-- 5. Student Certifications
INSERT OR REPLACE INTO certifications (id, student_id, name, organization) VALUES
(1, 101, 'Python for Data Science', 'IBM / Coursera'),
(2, 102, 'Google Data Analytics Professional Certificate', 'Coursera / Google'),
(3, 102, 'Python for Everybody Specialization', 'University of Michigan'),
(4, 103, 'Meta Frontend Developer Professional Certificate', 'Coursera / Meta');


-- 6. Opportunities
INSERT OR REPLACE INTO opportunities (id, company_name, title, description, domain, qualification, minimum_cgpa, location, opportunity_type, work_mode, stipend_or_salary, application_url) VALUES
(201, 'ABC Technologies', 'Data Analyst Intern', 'Analyze real-world business datasets, design reporting pipelines, and build interactive executive dashboards to power data-driven decisions.', 'Data Science', 'B.Tech / B.E / B.Sc in CS, IT, or Statistics', 7.00, 'Coimbatore', 'Internship', 'Hybrid', 'Rs 25,000 / month', 'https://example.com/apply/data-analyst-intern'),
(202, 'NexTech Solutions', 'Python Developer Intern', 'Build scalable backend services, automate analytical pipelines, integrate RESTful APIs, and contribute to internal automation frameworks.', 'Software Development', 'B.Tech in Computer Science or related degree', 7.00, 'Remote', 'Internship', 'Remote', 'Rs 22,000 / month', 'https://example.com/apply/python-dev-intern'),
(203, 'DataPulse Labs', 'Data Science Intern', 'Work closely with senior data scientists to clean enterprise data, train predictive models, conduct hypothesis testing, and evaluate machine learning algorithms.', 'Data Science', 'Pursuing B.Tech / M.Tech in CS or AI/Data Science', 7.50, 'Hyderabad', 'Internship', 'Hybrid', 'Rs 30,000 / month', 'https://example.com/apply/data-science-intern'),
(204, 'DeepMind Innovations', 'Machine Learning Intern', 'Design, evaluate, and benchmark machine learning models for computer vision and NLP. Clean training data and implement feature pipelines.', 'AI / Machine Learning', 'B.Tech / M.S. in Computer Science or AI/ML', 8.00, 'Bangalore', 'Internship', 'On-site', 'Rs 35,000 / month', 'https://example.com/apply/ml-intern'),
(205, 'CodeCraft Innovations', 'Web Developer Intern', 'Develop responsive user interfaces, craft interactive web components, and integrate backend REST APIs using modern web technologies.', 'Web Development', 'B.Tech / B.C.A / M.C.A in CS or IT', 6.50, 'Coimbatore', 'Internship', 'Hybrid', 'Rs 20,000 / month', 'https://example.com/apply/web-dev-intern'),
(206, 'PixelWave Studios', 'Frontend Developer Intern', 'Craft pixel-perfect, accessible, and high-performance user interfaces for modern web applications using React and CSS component systems.', 'Web Development', 'Undergraduate in Computer Science / Web Design', 6.50, 'Remote', 'Internship', 'Remote', 'Rs 24,000 / month', 'https://example.com/apply/frontend-intern'),
(207, 'CloudScale Systems', 'Backend Developer Intern', 'Design and maintain high-throughput backend services, implement database schemas, optimize database queries, and author microservice APIs.', 'Software Development', 'B.Tech in CS / IT or relevant software discipline', 7.00, 'Chennai', 'Internship', 'Hybrid', 'Rs 25,000 / month', 'https://example.com/apply/backend-intern'),
(208, 'OmniStack Enterprise', 'Full Stack Developer Intern', 'Build end-to-end features from intuitive React frontends to robust Node.js/Python backend architectures and relational database storage.', 'Web Development', 'B.Tech / B.E in CS/IT', 7.50, 'Coimbatore', 'Internship', 'On-site', 'Rs 28,000 / month', 'https://example.com/apply/fullstack-intern'),
(209, 'SecureNet Defense', 'Cyber Security Intern', 'Perform vulnerability assessments, assist in penetration testing routines, inspect firewall logs, and implement foundational defense measures.', 'Cyber Security', 'B.Tech in Information Security / CS', 7.00, 'Bangalore', 'Internship', 'Hybrid', 'Rs 26,000 / month', 'https://example.com/apply/cybersecurity-intern'),
(210, 'SkyHigh Cloud Services', 'Cloud Computing Intern', 'Automate cloud provisioning, manage containerized deployments, monitor infrastructure metrics, and support cloud migration tasks.', 'Cloud', 'B.Tech in CS, Cloud Computing, or IT', 7.00, 'Hyderabad', 'Internship', 'Hybrid', 'Rs 28,000 / month', 'https://example.com/apply/cloud-intern');


-- 7. Opportunity Skills Mapping (Normalized Relational M:N)
-- Opportunity 201 (Data Analyst Intern at ABC Technologies):
-- Requires: Python (1), SQL (32), Pandas (9), Power BI (14)
-- Preferred: Excel (15), Data Analysis (11)
INSERT OR REPLACE INTO opportunity_skills (id, opportunity_id, skill_id, is_required, importance_weight) VALUES
(1, 201, 1, 1, 1.00),   -- Python (Required)
(2, 201, 32, 1, 1.00),  -- SQL (Required)
(3, 201, 9, 1, 1.00),   -- Pandas (Required)
(4, 201, 14, 1, 1.00),  -- Power BI (Required)
(5, 201, 15, 0, 0.50),  -- Excel (Preferred)
(6, 201, 11, 0, 0.50),  -- Data Analysis (Preferred)

-- Opportunity 202 (Python Developer Intern):
(7, 202, 1, 1, 1.00),   -- Python (Required)
(8, 202, 32, 1, 1.00),  -- SQL (Required)
(9, 202, 50, 1, 1.00),  -- Git (Required)
(10, 202, 28, 0, 0.50), -- Express/API (Preferred)

-- Opportunity 203 (Data Science Intern):
(11, 203, 1, 1, 1.00),   -- Python (Required)
(12, 203, 32, 1, 1.00),  -- SQL (Required)
(13, 203, 9, 1, 1.00),   -- Pandas (Required)
(14, 203, 10, 1, 1.00),  -- NumPy (Required)
(15, 203, 18, 1, 1.00),  -- Scikit-learn (Required)
(16, 203, 12, 0, 0.50),  -- Statistics (Preferred)

-- Opportunity 205 (Web Developer Intern):
(17, 205, 24, 1, 1.00),  -- HTML (Required)
(18, 205, 25, 1, 1.00),  -- CSS (Required)
(19, 205, 5, 1, 1.00),   -- JavaScript (Required)
(20, 205, 26, 1, 1.00),  -- React (Required)
(21, 205, 50, 0, 0.50),  -- Git (Preferred)

-- Opportunity 208 (Full Stack Developer Intern):
(22, 208, 26, 1, 1.00),  -- React (Required)
(23, 208, 27, 1, 1.00),  -- Node.js (Required)
(24, 208, 5, 1, 1.00),   -- JavaScript (Required)
(25, 208, 32, 1, 1.00),  -- SQL (Required)
(26, 208, 50, 0, 0.50),  -- Git (Preferred)

-- Opportunity 209 (Cyber Security Intern):
(27, 209, 45, 1, 1.00),  -- Cyber Security (Required)
(28, 209, 46, 1, 1.00),  -- Network Security (Required)
(29, 209, 1, 0, 0.50),   -- Python (Preferred)
(30, 209, 44, 0, 0.50);  -- Linux (Preferred)
