# AI-Based Student Career, Skill Gap and Internship Recommendation System (CareerMatch AI)

![Platform](https://img.shields.io/badge/Platform-Full--Stack%20Web%20App-blue)
![Backend](https://img.shields.io/badge/Backend-Python%20Flask%20%7C%20REST%20API-success)
![Frontend](https://img.shields.io/badge/Frontend-React%2018%20%7C%20Vite-61dafb)
![AI/ML](https://img.shields.io/badge/AI%2FML-Scikit--Learn%20%7C%20TF--IDF%20%7C%20Cosine%20Similarity-orange)
![Database](https://img.shields.io/badge/Database-MySQL%20%7C%20Zero--Config%20SQLite%20Fallback-blueviolet)

An end-to-end intelligent full-stack career advisory, skill gap analysis, and internship recommendation system engineered with a clean, modern, professional white-background user interface (`#ffffff`).

---

## 📌 Table of Contents
1. [Project Overview](#project-overview)
2. [Key Features](#key-features)
3. [System Architecture](#system-architecture)
4. [AI Recommendation Algorithm & Mathematical Formulation](#ai-recommendation-algorithm--mathematical-formulation)
5. [Database Design](#database-design)
6. [Tech Stack](#tech-stack)
7. [Installation & Setup Guide](#installation--setup-guide)
8. [Demo Credentials](#demo-credentials)
9. [REST API Documentation](#rest-api-documentation)
10. [Application Screenshots & Pages](#application-screenshots--pages)

---

## 🌟 Project Overview

Traditional campus recruitment and career job boards rely on static keyword searching that frequently fails students:
* Keywords ignore the depth of practical academic projects and technical repositories.
* Students receive generic rejection emails without understanding which specific skills disqualified them.
* No actionable guidance or personalized syllabus is provided to bridge detected competency gaps.

**CareerMatch AI** solves this problem by providing a closed-loop intelligence system:
1. **Profile Synthesis**: Evaluates technical competencies, proficiency levels, academic projects, CGPA, certifications, and work preferences.
2. **5-Factor Weighted Machine Learning**: Computes personalized compatibility scores for every active internship and tech opportunity.
3. **TF-IDF Semantic Matching**: Uses natural language processing (`TfidfVectorizer` + Cosine Similarity) to analyze semantic alignment between project descriptions and employer expectations.
4. **Skill Gap Matrix**: Isolates missing competencies, computes their market demand frequency, and delivers actionable learning roadmaps with core concepts and practical portfolio projects.
5. **Interactive Analytics**: Features domain fit meters, career archetype suitability rankings, and a dedicated admin portal.

---

## 🚀 Key Features

* **Clean Modern White Background Aesthetic**: Strict adherence to `#ffffff` and `#f8fafc` surfaces, high-contrast typography (`Inter` & `Plus Jakarta Sans`), subtle shadows, and crisp blue/emerald accents.
* **Explainable Match Scoring**: Transparency into why an opportunity was recommended with exact breakdown pills (Skills 50%, Interest 20%, Projects 10%, CGPA 10%, Work Mode 10%).
* **Live AI Diagnostic Scanner**: Profile strength gauge (0–100%), strong areas identification, and optimization recommendations.
* **Curated Upskilling Roadmaps**: Detailed topic-by-topic curriculum and recommended capstone projects for every missing skill.
* **Career Archetype Explorer**: Benchmarking against standard industry roles (Data Analyst, Python Developer, ML Engineer, Full Stack, Cyber Security Analyst, Cloud Engineer).
* **Search & Multidimensional Filters**: Filter by domain, work mode (Remote/Hybrid/On-site), opportunity type (Internship/Job), and minimum match score slider.
* **Administrator Portal**: Real-time platform metrics, student talent monitoring, and opportunity CRUD management.
* **Dual Database Architecture**: Zero-config automatic SQLite fallback for instant evaluation, 100% compliant with MySQL (`schema.sql` and `sample_data.sql`).

---

## 🏛 System Architecture

```
+-----------------------------------------------------------------------------------+
|                                 REACT FRONTEND                                    |
|             (React 18 + Vite + Pure CSS Modern Design System + Axios)             |
+-----------------------------------------------------------------------------------+
|  • Landing Page (Hero, 4-Stage Infographic, Problem vs Solution, Features)        |
|  • Auth (Register, Login, JWT storage, 1-Click Demo Pre-fill)                     |
|  • Student Profile Page (Categorized library, custom tags, projects, certs)       |
|  • AI Diagnostic Page (Live analyzer, strength gauge, domain suitability)        |
|  • Student Dashboard (Overview metrics, domain fit meter, quick matches)         |
|  • Recommendations Hub (Ranked matches, breakdown %, matching vs missing tags)    |
|  • Skill Gap Matrix (Searchable table + actionable curriculum roadmaps)           |
|  • Career Archetypes (Benchmarked industry roles & suitability scoring)           |
|  • Opportunity Search & Filters (Keyword, domain, work mode, min match %)        |
|  • Opportunity Details Modal (Full requirements & Direct Apply action)            |
|  • Admin Dashboard (Stats, student tracking, opportunity CRUD)                    |
+-----------------------------------------------------------------------------------+
                                         │ REST API (JSON / Bearer JWT)
                                         ▼
+-----------------------------------------------------------------------------------+
|                                 PYTHON FLASK BACKEND                              |
+-----------------------------------------------------------------------------------+
|  • routes/auth.py            -> /api/register, /api/login, /api/me                |
|  • routes/student.py         -> /api/student/profile, /api/student/skills         |
|  • routes/ai.py              -> /api/analyze-profile, /api/domain-scores          |
|  • routes/recommendations.py -> /api/recommendations, /api/career-roles          |
|  • routes/skill_gap.py       -> /api/skill-gaps                                   |
|  • routes/opportunities.py   -> /api/opportunities (CRUD & filters)               |
|  • routes/admin.py           -> /api/admin/stats, /api/admin/students             |
+-----------------------------------------------------------------------------------+
                                         │
                    ┌────────────────────┴────────────────────┐
                    ▼                                         ▼
+------------------------------------+      +------------------------------------+
|       AI RECOMMENDATION ENGINE     |      |          DATABASE LAYER            |
|  (Scikit-Learn + TF-IDF + Pandas)  |      |   (MySQL + Auto SQLite Fallback)   |
+------------------------------------+      +------------------------------------+
| • Skill Match (50% weight)         |      | • users (students & admin)         |
| • Interest Alignment (20% weight)  |      | • student_profiles                 |
| • Qualification / CGPA (10% weight)|      | • skills & student_skills          |
| • Projects TF-IDF Cosine Sim (10%) |      | • projects & certifications        |
| • Work Mode & Preferences (10%)    |      | • opportunities (jobs/internships) |
| • Skill Gap Frequency Identifier   |      | • recommendations log              |
| • Curated Learning Curriculum      |      |                                    |
+------------------------------------+      +------------------------------------+
```

---

## 🧮 AI Recommendation Algorithm & Mathematical Formulation

The matching engine computes a holistic, multi-factor compatibility percentage $S_{\text{total}}$ for every opportunity:

$$S_{\text{total}} = (S_{\text{skill}} \times 0.50) + (S_{\text{interest}} \times 0.20) + (S_{\text{qual}} \times 0.10) + (S_{\text{project}} \times 0.10) + (S_{\text{pref}} \times 0.10)$$

### 1. Skill Match Score ($S_{\text{skill}}$ — 50% Weight)
Compares student skills $K_{\text{student}}$ against required opportunity skills $K_{\text{required}}$ with case-insensitive normalization:
$$S_{\text{skill}} = \frac{|K_{\text{student}} \cap K_{\text{required}}|}{|K_{\text{required}}|} \times 100$$

### 2. Interest Alignment ($S_{\text{interest}}$ — 20% Weight)
Evaluates domain keyword overlap and cluster proximity between student preferences and the opportunity domain:
* Direct domain match: $100\%$
* Title match: $90\%$
* Related cluster affinity: $80\%$
* Unrelated domain: $30\%$

### 3. Qualification & CGPA Match ($S_{\text{qual}}$ — 10% Weight)
Compares student's cumulative grade point average against the vacancy's minimum cutoff:
$$S_{\text{qual}} = \begin{cases} 100\% & \text{if } \text{CGPA} \ge \text{Min CGPA} \\ 80\% & \text{if } \text{Min CGPA} - \text{CGPA} \le 0.5 \\ 50\% & \text{if } \text{Min CGPA} - \text{CGPA} \le 1.0 \\ 20\% & \text{otherwise} \end{cases}$$

### 4. Project TF-IDF Cosine Similarity ($S_{\text{project}}$ — 10% Weight)
Uses Scikit-Learn's `TfidfVectorizer` to extract feature term vectors from student project portfolios and opportunity job descriptions:
$$\text{Cosine Similarity} = \frac{\mathbf{v}_{\text{student}} \cdot \mathbf{v}_{\text{job}}}{\|\mathbf{v}_{\text{student}}\| \|\mathbf{v}_{\text{job}}\|}$$
$$S_{\text{project}} = \min\left(100, \max\left(20, 30.0 + (\text{Cosine Similarity} \times 100)\right)\right)$$

### 5. Preference & Work Mode Match ($S_{\text{pref}}$ — 10% Weight)
Evaluates alignment on opportunity type (Internship vs Job) and work mode (Remote, Hybrid, On-site):
* Opportunity type match: up to $50$ points
* Work mode match: up to $50$ points

---

## 🗄 Database Design

The database schema is structured into 8 relational tables:

1. **`users`**: Authentication credentials, roles (`student`, `admin`), name, department, year of study.
2. **`student_profiles`**: CGPA, interests, preferred domain, location, opportunity type, and work mode.
3. **`skills`**: Master taxonomy of industry skills categorized by technical domain.
4. **`student_skills`**: Student-associated skills with proficiency ratings (Beginner, Intermediate, Advanced).
5. **`projects`**: Student project titles, problem descriptions, and technology stacks (used for TF-IDF).
6. **`certifications`**: Student credentials and issuing organizations.
7. **`opportunities`**: Vacancies with company, title, domain, description, required & preferred skills, CGPA cutoff, work mode, stipend/salary, and application link.
8. **`recommendations`**: Historical audit log of calculated matches, matching skills, and missing skills.

---

## 💻 Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, React Router Dom v6, Axios, Lucide React, Google Fonts (Inter & Plus Jakarta Sans) |
| **Styling** | Vanilla CSS3 Modern Design System, Pure White Theme (`#ffffff`), Responsive Grid & Flexbox |
| **Backend** | Python 3.10+, Flask, Flask-CORS, PyJWT, Werkzeug Security |
| **Machine Learning** | Scikit-Learn (`TfidfVectorizer`, `cosine_similarity`), Pandas, NumPy |
| **Database** | MySQL (production), SQLite (zero-config local fallback via PyMySQL) |

---

## ⚙️ Installation & Setup Guide

### Prerequisites
* **Python 3.10+**
* **Node.js 18+ & npm**
* *(Optional)* MySQL Server (if running local MySQL; otherwise, SQLite auto-fallback initializes automatically)

---

### 1. Backend Setup

```bash
# Navigate to backend directory
cd career-recommendation-system/backend

# (Optional) Create and activate a virtual environment
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the Flask Backend Server (Port 5000)
python app.py
```

> **Note**: The backend automatically initializes all tables and seeds default users, skills, and 15+ industry opportunities upon initial startup!

---

### 2. Frontend Setup

```bash
# In a separate terminal, navigate to frontend directory
cd career-recommendation-system/frontend

# Install node dependencies
npm install

# Start the Vite React Development Server (Port 5173)
npm run dev
```

Visit **`http://localhost:5173`** in your browser.

---

## 🔑 Demo Credentials

For instant testing and evaluation, pre-configured demo accounts are seeded with rich profile data:

| Role | Email | Password | Pre-seeded Features |
| :--- | :--- | :--- | :--- |
| **Student** | `student@careermatch.ai` | `Student@123` | 8.45 CGPA, 9 skills, 2 ML/Dashboard projects, 2 Certifications |
| **Admin** | `admin@careermatch.ai` | `Admin@123` | Platform analytics, student oversight, opportunity CRUD |

> **Tip**: The login screen features 1-click **Student Demo** and **Admin Demo** pre-fill buttons for instant access.

---

## 📡 REST API Documentation

### Authentication (`/api`)
* `POST /api/register` — Register a new student user
* `POST /api/login` — Authenticate and receive JWT Bearer token
* `GET /api/me` — Retrieve current authenticated user profile

### Student Profile (`/api/student`)
* `GET /api/student/profile` — Fetch complete student profile (skills, projects, certs, preferences)
* `PUT /api/student/profile` — Update student profile, skills, projects, and preferences
* `GET /api/student/skills` — Fetch categorized master skills library

### AI & Diagnostics (`/api`)
* `POST /api/analyze-profile` — Generate profile strength score, dominant domains, and suggestions
* `GET /api/domain-scores` — Get domain suitability fit scores (Data Science, Web, Cloud, AI, Security)

### Recommendations & Skill Gaps (`/api`)
* `GET /api/recommendations` — Fetch personalized opportunities ranked by AI match percentage
* `GET /api/recommendations/<id>` — Fetch detailed opportunity evaluation with score breakdown
* `GET /api/career-roles` — Fetch industry career archetypes ranked by suitability
* `GET /api/skill-gaps` — Retrieve skill gap matrix and curated learning roadmaps

### Opportunities (`/api`)
* `GET /api/opportunities` — Search and filter opportunities (keyword, domain, mode, type)
* `POST /api/opportunities` — Create new opportunity (*Admin only*)
* `PUT /api/opportunities/<id>` — Update existing opportunity (*Admin only*)
* `DELETE /api/opportunities/<id>` — Delete opportunity (*Admin only*)

### Admin Portal (`/api/admin`)
* `GET /api/admin/stats` — Platform counts, domain distribution, and top skills
* `GET /api/admin/students` — List registered students with profile completion metrics

---

## 📄 License & Academic Attribution
Developed as an advanced academic internship project for student career empowerment. Free to use and extend for educational purposes.
