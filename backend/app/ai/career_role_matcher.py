"""
Career Role Matcher & Domain Suitability Scoring
"""

from typing import List, Dict, Any
from app.ai.recommendation_engine import calculate_skill_match, parse_skill_list

CAREER_ROLES_ARCHETYPES = [
    {
        "role": "Data Analyst",
        "domain": "Data Science",
        "description": "Transforms raw telemetry into meaningful business insights, creates dashboards, and supports decision-making.",
        "required_skills": ["Python", "SQL", "Excel", "Power BI", "Data Analysis"],
        "recommended_learning": "Master DAX calculations in Power BI, data warehousing concepts, and advanced SQL window functions."
    },
    {
        "role": "Python Developer",
        "domain": "Software Development",
        "description": "Develops backend services, RESTful APIs, data automation workflows, and internal tooling with Python.",
        "required_skills": ["Python", "SQL", "Git", "Flask", "REST API"],
        "recommended_learning": "Learn asynchronous programming with asyncio, Docker containerization, and unit testing frameworks like PyTest."
    },
    {
        "role": "Data Scientist",
        "domain": "Data Science",
        "description": "Applies statistical modeling, machine learning algorithms, and deep data analysis to solve complex analytical questions.",
        "required_skills": ["Python", "SQL", "Pandas", "Scikit-learn", "Statistics", "Machine Learning"],
        "recommended_learning": "Deepen experimental hypothesis testing, hyperparameter optimization, and cloud-based model deployments."
    },
    {
        "role": "Machine Learning Engineer",
        "domain": "Artificial Intelligence",
        "description": "Engineers scalable ML pipelines, trains deep learning architectures, and deploys production AI systems.",
        "required_skills": ["Python", "Machine Learning", "Scikit-learn", "NumPy", "TensorFlow", "Statistics"],
        "recommended_learning": "Study transformer architectures, ONNX model optimization, and MLOps tools like MLflow."
    },
    {
        "role": "Full Stack Developer",
        "domain": "Full Stack Development",
        "description": "Builds complete web applications from interactive frontend components to scalable server microservices.",
        "required_skills": ["React", "Node.js", "JavaScript", "HTML", "CSS", "SQL", "Git"],
        "recommended_learning": "Explore Next.js App Router, GraphQL APIs, and CI/CD pipelines with GitHub Actions."
    },
    {
        "role": "Frontend Developer",
        "domain": "Web Development",
        "description": "Focuses on client-side rendering, user experience design, responsive layouts, and modern web application state.",
        "required_skills": ["React", "JavaScript", "HTML", "CSS", "Tailwind CSS", "Git"],
        "recommended_learning": "Master TypeScript typing, state management with Zustand/Redux, and Web Accessibility (WCAG)."
    },
    {
        "role": "Backend Developer",
        "domain": "Software Development",
        "description": "Architects server databases, high-availability microservices, caching layers, and cloud infrastructure.",
        "required_skills": ["Node.js", "Express.js", "SQL", "JavaScript", "Git", "Docker"],
        "recommended_learning": "Learn Redis caching, database indexing, message queues (RabbitMQ/Kafka), and microservices."
    },
    {
        "role": "Cyber Security Analyst",
        "domain": "Cyber Security",
        "description": "Monitors network activity, identifies security gaps, enforces compliance policies, and prevents intrusion.",
        "required_skills": ["Cyber Security", "Network Security", "Python", "Linux", "Cryptography"],
        "recommended_learning": "Pursue hands-on labs on HackTheBox, learn Wireshark packet analysis, and study ISO 27001 standards."
    },
    {
        "role": "Cloud Solutions Engineer",
        "domain": "Cloud Computing",
        "description": "Automates cloud infrastructure, manages Kubernetes clusters, and implements secure hybrid-cloud environments.",
        "required_skills": ["Cloud Computing", "AWS", "Linux", "Python", "Git", "Docker"],
        "recommended_learning": "Study Infrastructure-as-Code with Terraform, Kubernetes administration (CKA), and cloud cost management."
    }
]

CAREER_DOMAINS = [
    {
        "name": "Data Science",
        "core_skills": ["Python", "SQL", "Pandas", "NumPy", "Data Analysis", "Statistics", "Power BI", "Tableau"]
    },
    {
        "name": "Artificial Intelligence",
        "core_skills": ["Python", "Machine Learning", "Scikit-learn", "TensorFlow", "PyTorch", "NLP", "Statistics"]
    },
    {
        "name": "Web Development",
        "core_skills": ["HTML", "CSS", "JavaScript", "React", "Tailwind CSS", "Node.js", "Next.js", "Git"]
    },
    {
        "name": "Software Development",
        "core_skills": ["Python", "Java", "C++", "SQL", "Git", "Docker", "REST API", "Linux"]
    },
    {
        "name": "Cloud Computing",
        "core_skills": ["Cloud Computing", "AWS", "Azure", "Docker", "Kubernetes", "Linux", "Git"]
    },
    {
        "name": "Cyber Security",
        "core_skills": ["Cyber Security", "Network Security", "Ethical Hacking", "Cryptography", "Linux", "Python"]
    },
    {
        "name": "Mobile App Development",
        "core_skills": ["Flutter", "React Native", "Android Studio", "JavaScript", "Dart", "Git"]
    }
]


def match_career_roles(student_skills: List[str], student_interests: List[str]) -> List[Dict[str, Any]]:
    """Evaluates suitability for industry career roles."""
    results = []

    norm_interests = [i.lower().strip() for i in student_interests]

    for role_info in CAREER_ROLES_ARCHETYPES:
        req_skills = role_info["required_skills"]
        skill_pct, matching, missing = calculate_skill_match(student_skills, req_skills)
        
        # Interest multiplier
        interest_boost = 0.0
        role_domain = role_info["domain"].lower()
        role_title = role_info["role"].lower()
        for interest in norm_interests:
            if interest in role_domain or interest in role_title:
                interest_boost = 15.0
                break

        suitability = min(98.0, max(20.0, round((skill_pct * 0.85) + interest_boost, 1)))

        results.append({
            "role": role_info["role"],
            "domain": role_info["domain"],
            "description": role_info["description"],
            "suitability": suitability,
            "match_percentage": suitability,
            "required_skills": req_skills,
            "matching_skills": matching,
            "missing_skills": missing,
            "recommended_learning": role_info["recommended_learning"]
        })

    # Sort descending by suitability
    results.sort(key=lambda x: x["suitability"], reverse=True)
    return results


def calculate_domain_scores(student_skills: List[str], student_interests: List[str]) -> List[Dict[str, Any]]:
    """Calculates proficiency and fit score across major career domains (for charts)."""
    scores = []
    norm_interests = [i.lower().strip() for i in student_interests]

    for dom in CAREER_DOMAINS:
        core = dom["core_skills"]
        skill_pct, matching, _ = calculate_skill_match(student_skills, core)
        
        interest_bonus = 0.0
        dom_name = dom["name"].lower()
        for i in norm_interests:
            if i in dom_name or dom_name in i:
                interest_bonus = 20.0
                break

        total_score = min(98.0, max(15.0, round((skill_pct * 0.80) + interest_bonus, 0)))
        scores.append({
            "domain": dom["name"],
            "score": int(total_score),
            "matched_skills_count": len(matching),
            "total_domain_skills": len(core)
        })

    scores.sort(key=lambda x: x["score"], reverse=True)
    return scores
