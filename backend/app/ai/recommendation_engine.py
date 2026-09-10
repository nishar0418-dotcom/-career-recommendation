"""
AI Recommendation Engine for CareerMatch AI
============================================
Implements a multi-criteria weighted recommendation algorithm combined with
TF-IDF vectorization and Cosine Similarity (Scikit-Learn).

Formula:
  Final Score = (Skill Match * 50%)
              + (Interest Match * 20%)
              + (Qualification / CGPA Match * 10%)
              + (Project Relevance via TF-IDF Cosine Similarity * 10%)
              + (Preference / Work Mode Match * 10%)
"""

import re
from typing import List, Dict, Any

try:
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.metrics.pairwise import cosine_similarity
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False


def normalize_skill(skill: str) -> str:
    """Normalizes skill strings for case-insensitive matching."""
    if not skill:
        return ""
    # Remove special punctuation except . and + (e.g. C++, Node.js, .NET)
    cleaned = skill.strip().lower()
    return cleaned


def parse_skill_list(raw_skills: Any) -> List[str]:
    """Extracts a clean list of individual skill names from string or list."""
    if not raw_skills:
        return []
    if isinstance(raw_skills, list):
        return [s.strip() for s in raw_skills if s and s.strip()]
    
    # Split by comma, pipe, slash, or newline
    parts = re.split(r'[,|\n/]+', str(raw_skills))
    return [p.strip() for p in parts if p.strip()]


def calculate_skill_match(student_skills: List[str], required_skills: List[str]):
    """
    Compares student skills against required opportunity skills.
    Returns:
      - match_percentage (0.0 to 100.0)
      - matching_skills (List[str])
      - missing_skills (List[str])
    """
    if not required_skills:
        return 100.0, student_skills, []

    # Map normalized skill back to original case
    norm_student_map = {normalize_skill(s): s for s in student_skills}
    
    matching = []
    missing = []

    for req in required_skills:
        norm_req = normalize_skill(req)
        # Check direct or substring match (e.g. "react" in "react.js")
        matched = False
        for s_norm, s_orig in norm_student_map.items():
            if norm_req == s_norm or (len(norm_req) > 3 and norm_req in s_norm) or (len(s_norm) > 3 and s_norm in norm_req):
                matching.append(req)
                matched = True
                break
        if not matched:
            missing.append(req)

    match_pct = round((len(matching) / len(required_skills)) * 100.0, 1)
    return match_pct, matching, missing


def calculate_interest_match(student_interests: List[str], opp_domain: str, opp_title: str) -> float:
    """
    Calculates 0-100% match based on alignment of student interests with opportunity domain.
    """
    if not student_interests:
        return 50.0  # Neutral baseline if unselected

    norm_domain = opp_domain.lower() if opp_domain else ""
    norm_title = opp_title.lower() if opp_title else ""
    
    for interest in student_interests:
        norm_int = interest.lower().strip()
        if norm_int in norm_domain or norm_domain in norm_int:
            return 100.0
        if norm_int in norm_title:
            return 90.0

    # Domain keyword clusters
    clusters = {
        "data": ["data science", "data analysis", "data analyst", "analytics", "statistics"],
        "ai": ["ai/ml", "artificial intelligence", "machine learning", "deep learning", "nlp"],
        "web": ["web development", "full stack", "frontend", "backend", "react", "node"],
        "cloud": ["cloud computing", "cloud", "aws", "azure", "devops"],
        "security": ["cyber security", "network security", "information security"]
    }

    for key, group in clusters.items():
        int_match = any(any(g in i.lower() for g in group) for i in student_interests)
        opp_match = any(g in norm_domain or g in norm_title for g in group)
        if int_match and opp_match:
            return 80.0

    return 30.0


def calculate_qualification_cgpa_match(student_cgpa: float, min_cgpa: float) -> float:
    """Calculates qualification & CGPA score (0-100)."""
    if min_cgpa <= 0:
        return 100.0
    if student_cgpa >= min_cgpa:
        return 100.0
    # Mild penalty if within 0.5 CGPA, heavier penalty if further
    diff = min_cgpa - student_cgpa
    if diff <= 0.5:
        return 80.0
    elif diff <= 1.0:
        return 50.0
    return 20.0


def calculate_project_tfidf_score(student_projects: List[Dict[str, Any]], opp_text: str) -> float:
    """
    Uses TF-IDF + Cosine Similarity to compare student projects with opportunity description.
    """
    if not student_projects:
        return 40.0  # Base score if no projects listed

    project_texts = []
    for p in student_projects:
        name = p.get("project_name", "")
        desc = p.get("description", "")
        tech = p.get("technologies", "")
        project_texts.append(f"{name} {desc} {tech}")

    combined_student_text = " ".join(project_texts).strip()
    if not combined_student_text or not opp_text.strip():
        return 50.0

    if SKLEARN_AVAILABLE:
        try:
            vectorizer = TfidfVectorizer(stop_words='english', max_features=100)
            corpus = [combined_student_text, opp_text]
            tfidf_matrix = vectorizer.fit_transform(corpus)
            similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
            # Rescale 0.0 - 0.7 typical cosine sim range to 30.0 - 100.0
            scaled_score = min(100.0, max(20.0, 30.0 + (similarity * 100.0)))
            return round(scaled_score, 1)
        except Exception:
            pass

    # Fallback keyword overlap heuristic if scikit-learn is unavailable
    p_words = set(re.findall(r'\w{3,}', combined_student_text.lower()))
    o_words = set(re.findall(r'\w{3,}', opp_text.lower()))
    if not o_words:
        return 50.0
    overlap = len(p_words.intersection(o_words))
    score = min(100.0, 30.0 + (overlap * 7.0))
    return round(score, 1)


def calculate_preference_match(student_pref: Dict[str, Any], opp: Dict[str, Any]) -> float:
    """Compares work mode (Remote/Hybrid/On-site) and opportunity type (Internship/Job)."""
    score = 0.0
    
    # 1. Opportunity Type (50 pts)
    pref_type = (student_pref.get("opportunity_type") or "Both").lower()
    opp_type = (opp.get("opportunity_type") or "Internship").lower()
    if pref_type == "both" or pref_type in opp_type or opp_type in pref_type:
        score += 50.0
    else:
        score += 20.0

    # 2. Work Mode (50 pts)
    pref_mode = (student_pref.get("work_mode") or "Any").lower()
    opp_mode = (opp.get("work_mode") or "Hybrid").lower()
    if pref_mode == "any" or pref_mode in opp_mode or opp_mode in pref_mode:
        score += 50.0
    elif "hybrid" in opp_mode or "hybrid" in pref_mode:
        score += 35.0
    else:
        score += 15.0

    return score


def rank_opportunities(student_profile: Dict[str, Any], opportunities: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Ranks opportunities using the 5-factor weighted algorithm.
    """
    student_skills = student_profile.get("skills", [])
    raw_interests = student_profile.get("interests", "")
    interests = parse_skill_list(raw_interests)
    student_cgpa = float(student_profile.get("cgpa", 0.0) or 0.0)
    projects = student_profile.get("projects", [])
    preferences = {
        "opportunity_type": student_profile.get("opportunity_type", "Both"),
        "work_mode": student_profile.get("work_mode", "Any"),
        "preferred_location": student_profile.get("preferred_location", "")
    }

    results = []

    for opp in opportunities:
        req_skills = parse_skill_list(opp.get("required_skills", ""))
        pref_skills = parse_skill_list(opp.get("preferred_skills", ""))
        all_target_skills = list(dict.fromkeys(req_skills + pref_skills))
        
        # 1. Skill Match Score (50%)
        skill_pct, matching, missing = calculate_skill_match(student_skills, all_target_skills if all_target_skills else req_skills)
        
        # 2. Interest Match Score (20%)
        interest_score = calculate_interest_match(interests, opp.get("domain", ""), opp.get("title", ""))
        
        # 3. Qualification Match (10%)
        min_cgpa = float(opp.get("minimum_cgpa", 0.0) or 0.0)
        qual_score = calculate_qualification_cgpa_match(student_cgpa, min_cgpa)
        
        # 4. Project TF-IDF Match (10%)
        opp_text = f"{opp.get('title', '')} {opp.get('description', '')} {opp.get('required_skills', '')}"
        project_score = calculate_project_tfidf_score(projects, opp_text)
        
        # 5. Preference Match (10%)
        pref_score = calculate_preference_match(preferences, opp)

        # Weighted Final Score Calculation
        final_score = (
            (skill_pct * 0.50) +
            (interest_score * 0.20) +
            (qual_score * 0.10) +
            (project_score * 0.10) +
            (pref_score * 0.10)
        )
        final_score = round(min(99.0, max(15.0, final_score)), 1)

        result_item = dict(opp)
        result_item["match_percentage"] = final_score
        result_item["skill_match_percentage"] = skill_pct
        result_item["matching_skills"] = matching
        result_item["missing_skills"] = missing
        result_item["score_breakdown"] = {
            "skill_match": skill_pct,
            "interest_match": round(interest_score, 1),
            "qualification_match": round(qual_score, 1),
            "project_tfidf_match": round(project_score, 1),
            "preference_match": round(pref_score, 1)
        }
        results.append(result_item)

    # Sort opportunities from highest match percentage to lowest
    results.sort(key=lambda x: x["match_percentage"], reverse=True)
    return results
