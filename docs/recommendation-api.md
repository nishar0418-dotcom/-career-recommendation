# CareerMatch AI - Recommendation API Specification

## 1. Overview
The Recommendation API (`POST /api/recommendations`) generates personalized, explainable job and internship recommendations for students. It utilizes a 5-factor multi-criteria weighted scoring algorithm, integrates dynamic weight re-normalization for sparse profiles, performs skill gap analysis, and provides human-readable explanations.

---

## 2. Endpoint Details
- **Endpoint**: `/api/recommendations`
- **HTTP Method**: `POST`
- **Content-Type**: `application/json`
- **Authentication**: Optional (supports unauthenticated evaluations via payload, and authenticated requests with JWT Bearer token)

---

## 3. Request Schema

### Schema Definition
| Field | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `student_id` | Integer | No | Unique student identifier (e.g. 101) |
| `skills` | Array of Objects or Strings | Yes | Student technical skills with optional proficiency level |
| `skills[].name` | String | Yes | Name of skill (e.g. "Python", "SQL") |
| `skills[].proficiency` | String | No | Level: `"beginner"`, `"intermediate"`, `"advanced"`, `"expert"` |
| `interests` | Array of Strings | No | Domain interests (e.g. `["Data Science", "Data Analytics"]`) |
| `cgpa` | Float | No | Student CGPA on 10.0 scale (0.0 to 10.0) |
| `department` | String | No | Academic department (e.g. "CSE", "IT") |
| `year` | Integer / String | No | Current academic year (e.g. 2 or "2nd Year") |
| `projects` | Array of Objects | No | Academic or personal projects |
| `projects[].name` | String | Yes | Title of project |
| `projects[].description`| String | No | Project overview / summary |
| `projects[].technologies` | Array of Strings / String | No | Technologies used (e.g. `["Python", "Pandas", "SQL"]`) |
| `certifications` | Array of Strings | No | Certifications earned |
| `preferred_location` | String | No | Desired location (e.g. "Coimbatore", "Bangalore", or empty for Any) |
| `opportunity_type` | String | No | `"Internship"`, `"Job"`, or `"Both"` (Default: `"Both"`) |
| `work_mode` | String | No | `"Remote"`, `"Hybrid"`, `"On-site"`, or `"Any"` (Default: `"Any"`) |

### Example Request
```json
{
  "student_id": 101,
  "skills": [
    {
      "name": "Python",
      "proficiency": "intermediate"
    },
    {
      "name": "SQL",
      "proficiency": "beginner"
    },
    {
      "name": "Pandas",
      "proficiency": "beginner"
    }
  ],
  "interests": [
    "Data Science",
    "Data Analytics"
  ],
  "cgpa": 8.5,
  "department": "CSE",
  "year": 2,
  "projects": [
    {
      "name": "Student Performance Analysis",
      "technologies": ["Python", "Pandas", "SQL"]
    }
  ],
  "certifications": [
    "Python for Data Science"
  ],
  "preferred_location": "Coimbatore",
  "opportunity_type": "Internship"
}
```

---

## 4. Response Schema

### Schema Definition
| Field | Type | Description |
| :--- | :--- | :--- |
| `student_id` | Integer | Student identifier provided in request |
| `count` | Integer | Total count of recommended opportunities |
| `recommendations` | Array of Objects | Ranked opportunities ordered descending by `final_score` |
| `recommendations[].opportunity_id` | Integer | Unique identifier of the opportunity |
| `recommendations[].title` | String | Role title |
| `recommendations[].company` | String | Employer / hiring organization |
| `recommendations[].domain` | String | Primary domain (e.g. "Data Science") |
| `recommendations[].location` | String | Opportunity location |
| `recommendations[].opportunity_type` | String | "Internship" or "Job" |
| `recommendations[].work_mode` | String | "Remote", "Hybrid", or "On-site" |
| `recommendations[].final_score` | Float | Calculated match score between 0.0 and 100.0 |
| `recommendations[].matching_skills` | Array of Strings | Opportunity required skills possessed by the student |
| `recommendations[].missing_skills` | Array of Strings | Critical skills required by opportunity but missing from student profile |
| `recommendations[].skill_gap_count` | Integer | Total number of missing skills |
| `recommendations[].explanation` | String | Natural language recommendation summary |
| `recommendations[].explanation_details` | Array of Strings | Detailed checklist of match drivers and gaps |
| `recommendations[].score_breakdown` | Object | Individual 5-factor component scores |
| `recommendations[].sparse_data_renormalized` | Boolean | True if dynamic weight re-normalization was applied |
| `recommendations[].application_url` | String | Direct external application portal link |

### Example Response
```json
{
  "student_id": 101,
  "count": 22,
  "recommendations": [
    {
      "opportunity_id": 201,
      "title": "Data Analyst Intern",
      "company": "ABC Technologies",
      "domain": "Data Science",
      "location": "Coimbatore",
      "opportunity_type": "Internship",
      "work_mode": "Hybrid",
      "final_score": 84.8,
      "match_percentage": 84.8,
      "matching_skills": [
        "Python",
        "SQL",
        "Pandas"
      ],
      "missing_skills": [
        "Power BI"
      ],
      "skill_gap_count": 1,
      "explanation": "Strong skill and interest match with a minor Power BI skill gap.",
      "explanation_details": [
        "✓ Strong Python and SQL match",
        "✓ Domain interest directly aligns with role",
        "✓ CGPA requirement satisfied",
        "✓ Location and work preferences satisfied",
        "✗ Missing Power BI requirement"
      ],
      "score_breakdown": {
        "skill_match": 77.0,
        "interest_match": 100.0,
        "qualification_match": 100.0,
        "project_match": 63.2,
        "preference_match": 100.0,
        "final_score": 84.8
      },
      "sparse_data_renormalized": false,
      "application_url": "https://example.com/apply/data-analyst-intern"
    }
  ]
}
```

---

## 5. Match-Score Heuristic & Calculation

The recommendation engine calculates an explainable match score using 5 distinct criteria:

$$\text{Final Score} = (0.50 \times \text{Skill}) + (0.20 \times \text{Interest}) + (0.10 \times \text{Qual}) + (0.10 \times \text{Project}) + (0.10 \times \text{Preference})$$

### 1. Skill Match (50% Weight)
- Evaluates overlap between student skills and opportunity required skills from the relational `opportunity_skills` table.
- Accounts for self-reported proficiency (`beginner`: -1.0%, `intermediate`: baseline, `advanced`/`expert`: +3.0%).
- Awards bonus points for possession of preferred optional skills and relevant certifications.

### 2. Interest Match (20% Weight)
- Semantic matching between student interest tags and opportunity domain/title.
- Exact domain match: 100.0%. Title match: 95.0%. Related cluster match: 85.0%.
- Unspecified interests (sparse profile): Defaults to a neutral baseline of 50.0%.

### 3. Qualification Match (10% Weight)
- Evaluates student CGPA against opportunity `minimum_cgpa`.
- Student CGPA $\ge$ Minimum: 100.0%.
- Shortfall $\le 0.5$: 75.0% (eligible with review).
- Shortfall $\le 1.0$: 45.0%.
- Shortfall $> 1.0$: 20.0%.

### 4. Project Relevance Match (10% Weight)
- Computes technology overlap between student project tech stacks and opportunity skills.
- Applies TF-IDF Vectorization and Cosine Similarity between student project descriptions and opportunity job descriptions.

### 5. Preference Match (10% Weight)
- Location Match (50 pts): Match or Remote opportunity earns 50.0; location mismatch scores 15.0.
- Opportunity Type Match (30 pts): "Both" or exact match earns 30.0; mismatch scores 10.0.
- Work Mode Match (20 pts): "Any" or exact match earns 20.0; mismatch scores 5.0.

---

## 6. Dynamic Weight Re-Normalization for Sparse Profiles

When a student has **no project information** (`projects: []`), assigning 0/100 would unfairly penalize early-stage students by docking 10 full percentage points.

Instead, the system implements **Dynamic Proportional Weight Re-normalization**:
- Active weights: Skill (0.50) + Interest (0.20) + Qualification (0.10) + Preference (0.10) = 0.90 sum.
- Normalized weights:
  $$\text{Skill Weight} = \frac{0.50}{0.90} \approx 55.56\%$$
  $$\text{Interest Weight} = \frac{0.20}{0.90} \approx 22.22\%$$
  $$\text{Qualification Weight} = \frac{0.10}{0.90} \approx 11.11\%$$
  $$\text{Preference Weight} = \frac{0.10}{0.90} \approx 11.11\%$$

$$\text{Final Score (Sparse)} = \frac{0.50 \times \text{Skill} + 0.20 \times \text{Interest} + 0.10 \times \text{Qual} + 0.10 \times \text{Pref}}{0.90}$$

---

## 7. Error Responses

### 400 Bad Request — Empty / Non-JSON Body
```json
{
  "error": "Invalid request payload",
  "message": "A JSON object containing student profile data is required."
}
```

### 400 Bad Request — Invalid CGPA Range
```json
{
  "error": "Invalid CGPA",
  "message": "CGPA must be between 0.0 and 10.0."
}
```

### 404 Not Found — Resource Does Not Exist
```json
{
  "error": "Resource not found"
}
```
