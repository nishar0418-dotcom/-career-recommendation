"""
Skill Gap Analysis and Personalized Learning Roadmap Generator
"""

from typing import List, Dict, Any
from app.ai.recommendation_engine import normalize_skill, parse_skill_list

# Curated catalog of industry learning recommendations
SKILL_LEARNING_CATALOG = {
    "power bi": {
        "importance": "High",
        "why_learn": "Power BI is the industry standard for enterprise business intelligence, interactive reporting, and executive data storytelling.",
        "topics": [
            "Power BI Desktop Interface & Data Ingestion",
            "Data Modeling & Relationships (Star Schema)",
            "DAX Measures, Calculated Columns & Time Intelligence",
            "Interactive Dashboard Creation & Bookmarks"
        ],
        "project": "End-to-End Student Academic Performance & Placement Intelligence Dashboard"
    },
    "statistics": {
        "importance": "High",
        "why_learn": "Fundamental for understanding distributions, hypothesis testing, A/B testing, and validating machine learning models.",
        "topics": [
            "Descriptive Statistics, Variance & Standard Deviation",
            "Probability Distributions (Normal, Binomial, Poisson)",
            "Hypothesis Testing (t-test, ANOVA, Chi-Square)",
            "Correlation, Regression & Confidence Intervals"
        ],
        "project": "Statistical Analysis of E-Commerce Conversion Rates & A/B Test Validation"
    },
    "tableau": {
        "importance": "Medium",
        "why_learn": "Widely adopted visualization platform for exploratory data analysis and presentation-ready dashboards.",
        "topics": [
            "Connecting Heterogeneous Data Sources",
            "Calculated Fields & Parameters",
            "LOD (Level of Detail) Expressions",
            "Interactive Storyboarding"
        ],
        "project": "Global Climate Change & Carbon Footprint Trends Explorer"
    },
    "scikit-learn": {
        "importance": "High",
        "why_learn": "The premier Python library for classical machine learning algorithms, preprocessing, and model evaluation.",
        "topics": [
            "Data Preprocessing, Imputation & Feature Scaling",
            "Supervised Learning (Linear, Decision Trees, Random Forests, XGBoost)",
            "Model Cross-Validation & Hyperparameter Tuning (GridSearchCV)",
            "Evaluation Metrics (ROC-AUC, Precision, Recall, F1-Score)"
        ],
        "project": "Credit Card Fraud Detection Pipeline with Imbalanced Data Handling"
    },
    "docker": {
        "importance": "High",
        "why_learn": "Essential for packaging applications, guaranteeing reproducible runtime environments, and deploying microservices.",
        "topics": [
            "Containers vs Virtual Machines & Core Architecture",
            "Writing Optimized Dockerfiles & Multi-Stage Builds",
            "Docker Networking, Storage Volumes & Port Mapping",
            "Multi-Container Orchestration with Docker Compose"
        ],
        "project": "Containerizing a Multi-Tier Full Stack Application with PostgreSQL & Redis"
    },
    "aws": {
        "importance": "High",
        "why_learn": "Leading cloud provider hosting mission-critical applications globally. Required for modern cloud engineers.",
        "topics": [
            "EC2 Compute & IAM Security Roles",
            "S3 Object Storage & Lifecycle Policies",
            "Serverless Functions with AWS Lambda & API Gateway",
            "Relational Database Service (RDS) & CloudWatch Monitoring"
        ],
        "project": "Serverless Automated Image Resizing and Metadata Extraction Pipeline"
    },
    "react": {
        "importance": "High",
        "why_learn": "The most popular frontend library for creating dynamic, modular, and performant user interfaces.",
        "topics": [
            "JSX, Functional Components & Props",
            "State Management with Hooks (useState, useEffect, useMemo)",
            "Context API & Redux Toolkit",
            "Component Lifecycle & Performance Optimization"
        ],
        "project": "Real-Time Collaborative Kanban Task Management Web App"
    },
    "node.js": {
        "importance": "High",
        "why_learn": "Powers high-throughput asynchronous backend APIs and microservices using JavaScript across the full stack.",
        "topics": [
            "Event Loop, Asynchronous I/O & Streams",
            "RESTful API Design with Express.js Framework",
            "Authentication & Security (JWT, bcrypt, CORS, Rate Limiting)",
            "Database Integration with ORMs (Prisma, Mongoose, Sequelize)"
        ],
        "project": "Secure Multi-Tenant E-Commerce REST API with Role-Based Access Control"
    },
    "cyber security": {
        "importance": "High",
        "why_learn": "Critical for safeguarding corporate networks, digital assets, and customer confidentiality against evolving threats.",
        "topics": [
            "OWASP Top 10 Web Application Vulnerabilities",
            "Network Protocols, Handshakes & Packet Sniffing",
            "Cryptography, Public Key Infrastructure (PKI) & TLS",
            "Threat Modeling & Vulnerability Management"
        ],
        "project": "Automated Security Audit & Penetration Testing Vulnerability Scanner"
    },
    "machine learning": {
        "importance": "High",
        "why_learn": "Core driver of modern technological innovation, automation, and predictive software capabilities.",
        "topics": [
            "Linear & Logistic Regression Foundations",
            "Ensemble Methods (Random Forests, Gradient Boosting)",
            "Feature Engineering & Dimensionality Reduction (PCA)",
            "Model Deployment using FastAPI & Docker"
        ],
        "project": "Predictive Real Estate Price Valuation Engine with Feature Importance Explanations"
    },
    "flutter": {
        "importance": "Medium",
        "why_learn": "Google's UI toolkit for building natively compiled, multi-platform applications from a single codebase.",
        "topics": [
            "Dart Syntax & Reactive UI Paradigm",
            "Stateful vs Stateless Widgets & Layout Composition",
            "State Management with Bloc / Provider",
            "REST API Consumption & Local SQLite Caching"
        ],
        "project": "Personal Finance & Expense Tracker Mobile App with Analytics Charts"
    }
}


def analyze_skill_gaps(student_skills: List[str], target_opportunities: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Identifies missing skills across top matching opportunities, ranks their importance,
    and returns actionable learning suggestions.
    """
    student_norm_set = set(normalize_skill(s) for s in student_skills)

    # Frequency analysis of skills across target opportunities
    required_freq = {}
    skill_display_names = {}

    for opp in target_opportunities:
        req_list = parse_skill_list(opp.get("required_skills", ""))
        pref_list = parse_skill_list(opp.get("preferred_skills", ""))
        for s in req_list + pref_list:
            norm = normalize_skill(s)
            if not norm:
                continue
            required_freq[norm] = required_freq.get(norm, 0) + 1
            if norm not in skill_display_names:
                skill_display_names[norm] = s

    # Partition skills into Completed vs Missing
    gaps_table = []
    learning_recommendations = []

    # First add completed skills
    for s in student_skills:
        norm = normalize_skill(s)
        importance = "High" if required_freq.get(norm, 0) >= 2 else "Medium"
        gaps_table.append({
            "skill": s,
            "importance": importance,
            "status": "Completed"
        })

    # Sort missing skills by frequency of occurrence in opportunities
    missing_norms = [norm for norm in required_freq if norm not in student_norm_set]
    missing_norms.sort(key=lambda n: required_freq[n], reverse=True)

    for norm in missing_norms:
        display_name = skill_display_names.get(norm, norm.title())
        freq = required_freq[norm]
        importance = "High" if freq >= 2 else "Medium"
        
        gaps_table.append({
            "skill": display_name,
            "importance": importance,
            "status": "Missing"
        })

        # Enrich with curated learning info
        catalog_info = SKILL_LEARNING_CATALOG.get(norm)
        if catalog_info:
            learning_recommendations.append({
                "skill": display_name,
                "importance": catalog_info["importance"],
                "why_learn": catalog_info["why_learn"],
                "topics": catalog_info["topics"],
                "project": catalog_info["project"]
            })
        else:
            learning_recommendations.append({
                "skill": display_name,
                "importance": importance,
                "why_learn": f"Required by multiple target {display_name} roles and tech stacks in modern industry listings.",
                "topics": [
                    f"{display_name} Fundamentals & Core Architecture",
                    f"Hands-on Syntax, Libraries & Environment Setup",
                    f"Best Practices & Production Integration Patterns"
                ],
                "project": f"Production-Ready Practical Project demonstrating {display_name} integration"
            })

    return {
        "summary": {
            "total_student_skills": len(student_skills),
            "total_missing_skills": len(missing_norms),
            "high_priority_gaps": sum(1 for g in gaps_table if g["status"] == "Missing" and g["importance"] == "High")
        },
        "gaps_table": gaps_table,
        "learning_recommendations": learning_recommendations
    }
