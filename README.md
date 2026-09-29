# AI-Based Student Career, Skill Gap and Internship Recommendation System (CareerMatch AI)

![Platform](https://img.shields.io/badge/Platform-Full--Stack%20Web%20App-blue)
![Backend](https://img.shields.io/badge/Backend-Python%20Flask%20%7C%20REST%20API-success)
![Frontend](https://img.shields.io/badge/Frontend-React%2018%20%7C%20Vite-61dafb)
![AI/ML](https://img.shields.io/badge/AI%2FML-Scikit--Learn%20%7C%20TF--IDF%20%7C%20Cosine%20Similarity-orange)
![Database](https://img.shields.io/badge/Database-Normalized%20Relational%20Schema%20(MySQL%20%2F%20SQLite)-blueviolet)
![Tests](https://img.shields.io/badge/Tests-10%2F10%20Benchmark%20Edge%20Cases%20Passing-brightgreen)

An end-to-end intelligent full-stack career advisory, skill gap analysis, and internship recommendation system engineered with a normalized relational schema, explainable AI recommendation engine, dynamic weight re-normalization for sparse profiles, and a modern, professional user interface.

---

## 📌 Table of Contents
1. [Project Overview](#-project-overview)
2. [Normalized Relational Database Schema](#-normalized-relational-database-schema)
3. [Structured Skill Taxonomy](#-structured-skill-taxonomy)
4. [AI Recommendation Algorithm & Weighted Scoring](#-ai-recommendation-algorithm--weighted-scoring)
5. [Sparse Profile Strategy: Dynamic Weight Re-Normalization](#-sparse-profile-strategy-dynamic-weight-re-normalization)
6. [Recommendation API (`POST /api/recommendations`)](#-recommendation-api-post-apirecommendations)
7. [Benchmark Test Suite & Results](#-benchmark-test-suite--results)
8. [Documentation Links](#-documentation-links)
9. [Installation & Setup Guide](#-installation--setup-guide)
10. [Demo Credentials](#-demo-credentials)

---

## 🌟 Project Overview

Traditional campus recruitment systems rely on static keyword lookups that fail students:
* Keywords ignore the depth of practical academic projects and technical repositories.
* Students receive generic rejections without understanding their specific competency gaps.
* Sparse profiles (e.g. students with no projects) are unfairly penalized by arbitrary zero-point deductions.

**CareerMatch AI** provides a closed-loop intelligence system:
1. **Normalized Relational Architecture**: 8 normalized tables with foreign keys, unique constraints, and indexes.
2. **5-Factor Explainable Recommendation Algorithm**: Skill Match (50%), Interest Match (20%), Qualification Match (10%), Project Relevance (10%), and Preference Match (10%).
3. **Dynamic Weight Re-Normalization**: Fair evaluation of sparse student profiles without punitive deductions for missing project portfolios.
4. **Actionable Skill Gap Analysis**: Identifies exact missing required skills, computes market demand, and presents targeted learning roadmaps.

---

## 🗄 Normalized Relational Database Schema

The database schema is fully defined in [`database/schema.sql`](database/schema.sql) and seeded with 57+ skills and 22+ opportunities in [`database/sample_data.sql`](database/sample_data.sql).

### Relational Tables Overview
1. **`students`**: Primary student identity, academic credentials (CGPA, department, year), and career preferences.
2. **`skills`**: Standardized skill master taxonomy categorized across 9 domains.
3. **`student_skills`**: Normalized many-to-many relationship linking `students` to `skills` with proficiency levels.
4. **`opportunities`**: Internship and job postings with domain, location, work mode, and CGPA requirements.
5. **`opportunity_skills`**: Normalized many-to-many mapping connecting `opportunities` to `skills` with `is_required` flags and `importance_weight`.
6. **`projects`**: Student portfolio projects capturing real-world technical implementations and tech stacks.
7. **`certifications`**: Professional certifications earned by students.
8. **`recommendations`**: Audit and caching table persisting calculated component scores, final scores, matching skills, and skill gaps.

```sql
-- Recreate the database from scratch:
sqlite3 career_match.db < database/schema.sql
sqlite3 career_match.db < database/sample_data.sql
```

---

## 🏷 Structured Skill Taxonomy

Skills are organized into 9 standardized categories:

* **Programming**: Python, Java, C++, C#, JavaScript, TypeScript, Go, Rust
* **Data Science**: Pandas, NumPy, Data Analysis, Statistics, Power BI, Tableau, Excel
* **AI / Machine Learning**: Scikit-learn, TensorFlow, PyTorch, Machine Learning, Deep Learning, Natural Language Processing, Computer Vision
* **Web Development**: React, Node.js, Express.js, HTML5, CSS3, FastAPI, Flask, Django, Next.js
* **Database**: SQL, MySQL, PostgreSQL, MongoDB, Redis
* **Cloud**: AWS, Microsoft Azure, Google Cloud Platform, Docker, Kubernetes
* **Cyber Security**: Network Security, Ethical Hacking, Cryptography, Penetration Testing
* **Tools**: Git, GitHub, VS Code, Postman, Jira
* **Soft Skills**: Problem Solving, Communication, Teamwork

---

## 🧠 AI Recommendation Algorithm & Weighted Scoring

Recommendations are generated using an explainable, 5-factor multi-criteria weighted scoring algorithm:

$$\text{Final Score} = (0.50 \times \text{Skill}) + (0.20 \times \text{Interest}) + (0.10 \times \text{Qualification}) + (0.10 \times \text{Project}) + (0.10 \times \text{Preference})$$

### Score Components
* **Skill Match (50%)**: Direct and alias comparison between student skills and opportunity required skills from `opportunity_skills`, calibrated by student proficiency and relevant certifications.
* **Interest Match (20%)**: Semantic alignment between student domain interests and opportunity domain/title (exact domain: 100%, title: 95%, cluster: 85%, unselected: 50% neutral baseline).
* **Qualification Match (10%)**: Evaluates student CGPA against minimum cutoff (meets cutoff: 100%, within 0.5: 75%, within 1.0: 45%).
* **Project Relevance (10%)**: Technology overlap and TF-IDF Cosine Similarity between student project descriptions and employer job descriptions.
* **Preference Match (10%)**: Location alignment (50 pts), Opportunity Type alignment (30 pts), and Work Mode alignment (20 pts).

---

## ⚖ Sparse Profile Strategy: Dynamic Weight Re-Normalization

To prevent early-stage university students without project portfolios from being unfairly penalized:
* If a student provides no projects (`projects: []`), assigning 0/100 would artificially strip 10% from their score.
* **Dynamic Proportional Weight Re-normalization** removes the project dimension and scales the remaining demonstrated criteria over the active 90% weight:

$$\text{Final Score (Sparse)} = \frac{0.50 \times \text{Skill} + 0.20 \times \text{Interest} + 0.10 \times \text{Qualification} + 0.10 \times \text{Preference}}{0.90}$$

* **Unstated Interests**: Handled using a documented neutral baseline of **50.0%** rather than a punitive 0%.
* **Unstated Locations/Modes**: Default to open/flexible full eligibility (**100.0%**).

---

## 📡 Recommendation API (`POST /api/recommendations`)

### Request Example
```bash
curl -X POST http://localhost:5000/api/recommendations \
  -H "Content-Type: application/json" \
  -d '{
    "student_id": 101,
    "skills": [
      {"name": "Python", "proficiency": "intermediate"},
      {"name": "SQL", "proficiency": "beginner"},
      {"name": "Pandas", "proficiency": "beginner"}
    ],
    "interests": ["Data Science", "Data Analytics"],
    "cgpa": 8.5,
    "department": "CSE",
    "year": 2,
    "projects": [
      {
        "name": "Student Performance Analysis",
        "technologies": ["Python", "Pandas", "SQL"]
      }
    ],
    "certifications": ["Python for Data Science"],
    "preferred_location": "Coimbatore",
    "opportunity_type": "Internship"
  }'
```

### Response Example
```json
{
  "student_id": 101,
  "count": 22,
  "recommendations": [
    {
      "opportunity_id": 201,
      "title": "Data Analyst Intern",
      "company": "ABC Technologies",
      "final_score": 84.8,
      "matching_skills": ["Python", "SQL", "Pandas"],
      "missing_skills": ["Power BI"],
      "skill_gap_count": 1,
      "explanation": "Strong skill and interest match with a minor Power BI skill gap.",
      "score_breakdown": {
        "skill_match": 77.0,
        "interest_match": 100.0,
        "qualification_match": 100.0,
        "project_match": 63.2,
        "preference_match": 100.0,
        "final_score": 84.8
      }
    }
  ]
}
```

---

## 📊 Benchmark Test Suite & Results

The automated benchmark suite in [`tests/test_recommendation_engine.py`](tests/test_recommendation_engine.py) evaluates 10 edge cases against Opportunity 201:

| Case | Skills | Projects | Interests | Expected Behaviour | Actual Score | Result |
| :--- | :--- | :--- | :--- | :--- | ---: | :---: |
| **Case 1: Complete Profile** | Many (3) | Yes (1) | Yes | Normal 5-factor scoring | **86.2** | `PASS` |
| **Case 2: No Projects** | Many (3) | No | Yes | Dynamic re-normalization (no penalty) | **86.1** | `PASS` |
| **Case 3: Only One Skill** | 1 | No | Yes | Low-confidence result, clear skill gaps | **58.3** | `PASS` |
| **Case 4: No Skills** | 0 | No | No | Safe fallback, no misleading high score | **33.3** | `PASS` |
| **Case 5: No Interests** | 3 | No | No | Neutral baseline (50% interest match) | **75.0** | `PASS` |
| **Case 6: No Projects + No Certs** | 2 | No | Yes | Safe sparse execution, skill gaps shown | **72.2** | `PASS` |
| **Case 7: Exact Skill Match** | Full (4) | Yes | Yes | High score | **99.4** | `PASS` |
| **Case 8: Zero Skill Match** | Disjoint | Yes | No | Zero skill match, full skill gaps flagged | **28.0** | `PASS` |
| **Case 9: CGPA Below Cutoff** | 3 | No | Yes | Proportional qualification penalty | **80.0** | `PASS` |
| **Case 10: Location Mismatch** | 3 | No | Yes | Location preference reduction (15 vs 50) | **82.2** | `PASS` |

### Benchmark Summary Statistics
- **Passed**: 10 / 10 (100%)
- **Average Score**: **70.1**
- **Min Score**: **28.0** | **Max Score**: **99.4**
- **Test Command**: `python tests/test_recommendation_engine.py`

---

## 📚 Documentation Links
- [Recommendation API Specification](docs/recommendation-api.md)
- [Recommendation Benchmark Report](docs/recommendation-benchmark.md)
- [Sparse Profile Strategy & Proof](docs/sparse-profile-strategy.md)
- [Implementation Evidence & DB Structures](docs/implementation-evidence.md)

---

## 💻 Installation & Setup Guide

### 1. Clone Repository & Setup Backend
```bash
cd career-recommendation-system/backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

### 2. Setup Frontend
```bash
cd career-recommendation-system/frontend
npm install
npm run dev
```

### 3. Run Benchmark Tests
```bash
cd career-recommendation-system
python tests/test_recommendation_engine.py
```

---

## 🔑 Demo Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Student (Alex Johnson)** | `student@careermatch.ai` | `Student@123` |
| **Student (Arun Kumar)** | `arun.kumar@example.com` | `password123` |
| **Administrator** | `admin@careermatch.ai` | `Admin@123` |
| **Student (Alternative)** | `alex.johnson@example.com` | `password123` |
