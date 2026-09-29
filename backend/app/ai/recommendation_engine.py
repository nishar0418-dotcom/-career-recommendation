"""
AI Recommendation Engine for CareerMatch AI
============================================
Implements an explainable multi-criteria weighted recommendation algorithm combined
with dynamic weight re-normalization for sparse profiles, TF-IDF vectorization,
and skill gap analysis.

Formula:
  Standard Profile:
    Final Score = (0.50 * Skill Match)
                + (0.20 * Interest Match)
                + (0.10 * Qualification / CGPA Match)
                + (0.10 * Project Relevance Match)
                + (0.10 * Preference Match)

  Sparse Profile (No Projects):
    Dynamic Weight Re-normalization:
    Final Score = (0.50 * Skill Match + 0.20 * Interest Match + 0.10 * Qualification + 0.10 * Preference) / 0.90
    (Weights scaled proportionally: Skill 55.6%, Interest 22.2%, Qual 11.1%, Preference 11.1%)
"""

import re
from typing import List, Dict, Any, Tuple, Optional

try:
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.metrics.pairwise import cosine_similarity
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False


def normalize_skill(skill: str) -> str:
    """Normalizes skill strings for robust case-insensitive comparison."""
    if not skill:
        return ""
    cleaned = skill.strip().lower()
    # Normalize common abbreviations and aliases
    aliases = {
        "react.js": "react",
        "reactjs": "react",
        "node.js": "node.js",
        "nodejs": "node.js",
        "vue.js": "vue",
        "vuejs": "vue",
        "scikit-learn": "scikit-learn",
        "sklearn": "scikit-learn",
        "ai / machine learning": "machine learning",
        "ai/ml": "machine learning",
        "ml": "machine learning",
        "nlp": "natural language processing"
    }
    return aliases.get(cleaned, cleaned)


def parse_skill_list(raw_skills: Any) -> List[str]:
    """Extracts a clean list of skill name strings from varied input types."""
    if not raw_skills:
        return []
    if isinstance(raw_skills, list):
        extracted = []
        for item in raw_skills:
            if isinstance(item, dict):
                name = item.get("name") or item.get("skill_name") or ""
                if name:
                    extracted.append(str(name).strip())
            elif item is not None:
                extracted.append(str(item).strip())
        return [s for s in extracted if s]

    # Split by comma, pipe, semicolon, or newline
    parts = re.split(r'[,|;\n/]+', str(raw_skills))
    return [p.strip() for p in parts if p.strip()]


def parse_student_skills_structured(raw_skills: Any) -> Dict[str, Dict[str, Any]]:
    """
    Parses student skills into a lookup dictionary keyed by normalized name.
    Preserves proficiency (beginner, intermediate, advanced, expert).
    """
    structured: Dict[str, Dict[str, Any]] = {}
    if not raw_skills:
        return structured

    if isinstance(raw_skills, list):
        for item in raw_skills:
            if isinstance(item, dict):
                name = item.get("name") or item.get("skill_name") or ""
                prof = str(item.get("proficiency", "intermediate")).lower().strip()
                norm = normalize_skill(name)
                if norm:
                    structured[norm] = {"name": name.strip(), "proficiency": prof}
            elif item:
                norm = normalize_skill(str(item))
                if norm:
                    structured[norm] = {"name": str(item).strip(), "proficiency": "intermediate"}
    elif isinstance(raw_skills, str):
        for item in parse_skill_list(raw_skills):
            norm = normalize_skill(item)
            if norm:
                structured[norm] = {"name": item, "proficiency": "intermediate"}

    return structured


def calculate_skill_match(
    student_skills_raw: Any,
    required_skills: List[str],
    preferred_skills: Optional[List[str]] = None,
    certifications: Optional[List[str]] = None
) -> Tuple[float, List[str], List[str]]:
    """
    Calculates skill match percentage, matching skills, and missing skills (skill gaps).
    Takes into account required skills, proficiency levels, and preferred skills.
    
    Returns:
      (skill_match_percentage, matching_skills_list, missing_skills_list)
    """
    student_skills_map = parse_student_skills_structured(student_skills_raw)
    
    # If student has no skills whatsoever
    if not student_skills_map:
        req_clean = [r.strip() for r in (required_skills or []) if r.strip()]
        return 0.0, [], req_clean

    # If opportunity lists no required skills, default to full match
    if not required_skills:
        return 100.0, [v["name"] for v in student_skills_map.values()], []

    matching: List[str] = []
    missing: List[str] = []
    proficiency_bonus_sum = 0.0

    for req in required_skills:
        norm_req = normalize_skill(req)
        matched = False

        for s_norm, s_data in student_skills_map.items():
            # Exact or substring match (e.g. "sql" in "postgresql" or "react" in "react.js")
            if s_norm == norm_req or (len(norm_req) >= 3 and (norm_req in s_norm or s_norm in norm_req)):
                matching.append(req)
                matched = True
                
                # Proficiency impact
                prof = s_data.get("proficiency", "intermediate")
                if prof in ("advanced", "expert"):
                    proficiency_bonus_sum += 3.0
                elif prof == "beginner":
                    proficiency_bonus_sum -= 1.0
                break

        if not matched:
            missing.append(req)

    # Base match: proportion of required skills satisfied
    base_match = (len(matching) / len(required_skills)) * 100.0

    # Preferred skills bonus (up to 10% bonus if student has optional preferred skills)
    pref_bonus = 0.0
    if preferred_skills:
        pref_matched_count = 0
        for pref in preferred_skills:
            norm_pref = normalize_skill(pref)
            for s_norm in student_skills_map:
                if s_norm == norm_pref or (len(norm_pref) >= 3 and norm_pref in s_norm):
                    pref_matched_count += 1
                    break
        pref_bonus = (pref_matched_count / len(preferred_skills)) * 8.0

    # Certification bonus (up to 5% bonus for relevant certifications)
    cert_bonus = 0.0
    if certifications:
        cert_text = " ".join(certifications).lower()
        for req in required_skills:
            if normalize_skill(req) in cert_text:
                cert_bonus += 2.5
        cert_bonus = min(5.0, cert_bonus)

    # Final skill match score calculation
    if len(matching) == 0:
        score = 0.0
    elif len(missing) == 0:
        score = 100.0
    else:
        score = base_match + (proficiency_bonus_sum / len(required_skills)) + pref_bonus + cert_bonus

    score = round(min(100.0, max(0.0, score)), 1)
    return score, matching, missing


def calculate_interest_match(student_interests: List[str], opp_domain: str, opp_title: str) -> float:
    """
    Calculates interest alignment (0 - 100%).
    Handles sparse profiles by returning a neutral baseline of 50.0% when no interests are entered.
    """
    if not student_interests:
        return 50.0  # Documented neutral baseline for unselected interests

    norm_domain = (opp_domain or "").lower().strip()
    norm_title = (opp_title or "").lower().strip()

    for interest in student_interests:
        norm_int = interest.lower().strip()
        if not norm_int:
            continue
        # Direct domain match
        if norm_int == norm_domain or norm_int in norm_domain or norm_domain in norm_int:
            return 100.0
        # Title match
        if norm_int in norm_title or norm_title in norm_int:
            return 95.0

    # Domain keyword semantic clusters
    clusters = {
        "data": ["data science", "data analytics", "data analyst", "analytics", "statistics", "business intelligence", "bi"],
        "ai": ["ai / machine learning", "ai", "machine learning", "deep learning", "nlp", "computer vision", "neural networks"],
        "software": ["software development", "software engineering", "programming", "python developer", "full stack"],
        "web": ["web development", "full stack", "frontend", "backend", "react", "node.js"],
        "cloud": ["cloud computing", "cloud", "aws", "azure", "devops", "kubernetes"],
        "security": ["cyber security", "network security", "information security", "ethical hacking"]
    }

    for key, group in clusters.items():
        int_match = any(any(g in i.lower() for g in group) for i in student_interests)
        opp_match = any(g in norm_domain or g in norm_title for g in group)
        if int_match and opp_match:
            return 85.0

    return 25.0


def calculate_qualification_cgpa_match(student_cgpa: float, min_cgpa: float) -> float:
    """
    Calculates qualification & CGPA eligibility score (0 - 100%).
    Exceeding or meeting requirement earns 100.0.
    Being slightly below incurs a proportionate penalty rather than an abrupt cutoff.
    """
    if min_cgpa <= 0.0:
        return 100.0
    if student_cgpa >= min_cgpa:
        return 100.0

    diff = round(min_cgpa - student_cgpa, 2)
    if diff <= 0.5:
        # Near cutoff: 75%
        return 75.0
    elif diff <= 1.0:
        # Moderate shortfall: 45%
        return 45.0
    else:
        # Significant shortfall: 20%
        return 20.0


def calculate_project_match(
    student_projects: List[Dict[str, Any]],
    opp_text: str,
    opp_skills: List[str]
) -> Tuple[Optional[float], bool]:
    """
    Calculates project relevance score (0 - 100%) using technology overlap and TF-IDF Cosine Similarity.
    
    Returns:
      (score, has_projects_bool)
      If no projects exist, returns (None, False) to trigger dynamic weight re-normalization.
    """
    if not student_projects:
        return None, False

    project_texts = []
    tech_tokens = []
    
    for p in student_projects:
        name = p.get("name") or p.get("project_name") or ""
        desc = p.get("description", "")
        techs = p.get("technologies", [])
        if isinstance(techs, list):
            tech_str = " ".join([str(t) for t in techs])
            tech_tokens.extend([str(t).lower() for t in techs])
        else:
            tech_str = str(techs)
            tech_tokens.extend(parse_skill_list(techs))
        project_texts.append(f"{name} {desc} {tech_str}".strip())

    combined_student_text = " ".join(project_texts).strip()
    if not combined_student_text:
        return None, False

    # 1. Technology overlap match (50% of project score)
    overlap_score = 40.0
    if opp_skills:
        matched_tech = 0
        norm_techs = [normalize_skill(t) for t in tech_tokens]
        for skill in opp_skills:
            if normalize_skill(skill) in norm_techs:
                matched_tech += 1
        overlap_score = min(100.0, 30.0 + ((matched_tech / max(1, len(opp_skills))) * 70.0))

    # 2. Textual Cosine Similarity (50% of project score)
    tfidf_score = 50.0
    if SKLEARN_AVAILABLE and opp_text.strip():
        try:
            vectorizer = TfidfVectorizer(stop_words='english', max_features=150)
            corpus = [combined_student_text, opp_text]
            tfidf_matrix = vectorizer.fit_transform(corpus)
            similarity = float(cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0])
            tfidf_score = min(100.0, max(20.0, 30.0 + (similarity * 100.0)))
        except Exception:
            tfidf_score = 50.0
    else:
        # Fallback word overlap
        p_words = set(re.findall(r'\w{3,}', combined_student_text.lower()))
        o_words = set(re.findall(r'\w{3,}', opp_text.lower()))
        if o_words:
            overlap = len(p_words.intersection(o_words))
            tfidf_score = min(100.0, 30.0 + (overlap * 5.0))

    final_project_score = round((overlap_score * 0.50) + (tfidf_score * 0.50), 1)
    return final_project_score, True


def calculate_preference_match(student_pref: Dict[str, Any], opp: Dict[str, Any]) -> float:
    """
    Evaluates student preferences:
      - Preferred Location (50 pts)
      - Opportunity Type (Internship vs Job) (30 pts)
      - Work Mode (Remote / Hybrid / On-site) (20 pts)
    Missing preferences are treated with flexible maximum eligibility.
    """
    score = 0.0

    # 1. Location Match (50 points)
    pref_loc = (student_pref.get("preferred_location") or "").strip().lower()
    opp_loc = (opp.get("location") or "").strip().lower()
    opp_mode = (opp.get("work_mode") or "").strip().lower()

    if not pref_loc or pref_loc == "any" or opp_mode == "remote":
        score += 50.0  # Flexible or remote opportunity
    elif pref_loc in opp_loc or opp_loc in pref_loc:
        score += 50.0  # Location match
    else:
        # Location mismatch penalty
        score += 15.0

    # 2. Opportunity Type Match (30 points)
    pref_type = (student_pref.get("opportunity_type") or "Both").strip().lower()
    opp_type = (opp.get("opportunity_type") or "Internship").strip().lower()

    if pref_type in ("both", "any", "") or pref_type in opp_type or opp_type in pref_type:
        score += 30.0
    else:
        score += 10.0

    # 3. Work Mode Match (20 points)
    pref_mode = (student_pref.get("work_mode") or "Any").strip().lower()

    if pref_mode in ("any", "") or pref_mode in opp_mode or opp_mode in pref_mode:
        score += 20.0
    elif "hybrid" in opp_mode or "hybrid" in pref_mode:
        score += 15.0
    else:
        score += 5.0

    return round(score, 1)


def generate_recommendation_explanation(
    matching_skills: List[str],
    missing_skills: List[str],
    skill_pct: float,
    interest_score: float,
    qual_score: float,
    project_score: Optional[float],
    pref_score: float,
    opp_title: str
) -> Tuple[str, List[str]]:
    """
    Generates natural, human-readable justification and bulleted breakdown.
    
    Returns:
      (concise_summary_sentence, list_of_bulleted_reasons)
    """
    reasons = []

    # Skill reasoning
    if matching_skills:
        if len(matching_skills) >= 2:
            reasons.append(f"✓ Strong {matching_skills[0]} and {matching_skills[1]} match")
        else:
            reasons.append(f"✓ {matching_skills[0]} requirement satisfied")
    
    # Interest reasoning
    if interest_score >= 80.0:
        reasons.append("✓ Domain interest directly aligns with role")
    elif interest_score >= 50.0:
        reasons.append("✓ Acceptable domain relevance")

    # Qualification reasoning
    if qual_score >= 90.0:
        reasons.append("✓ CGPA requirement satisfied")
    elif qual_score >= 70.0:
        reasons.append("⚠ Near CGPA requirement")

    # Project reasoning
    if project_score is not None and project_score >= 70.0:
        reasons.append("✓ Hands-on project experience in relevant stack")

    # Preference reasoning
    if pref_score >= 80.0:
        reasons.append("✓ Location and work preferences satisfied")

    # Skill gaps
    for m in missing_skills[:2]:
        reasons.append(f"✗ Missing {m} requirement")

    # Concise summary sentence
    if not matching_skills and not missing_skills:
        summary = "General role recommendation based on academic profile."
    elif not matching_skills:
        summary = f"Identified entry-level opening; significant skill development recommended in {', '.join(missing_skills[:2])}."
    elif not missing_skills:
        summary = f"Exceptional 100% skill match for {opp_title} with strong alignment."
    elif len(missing_skills) == 1:
        summary = f"Strong skill and interest match with a minor {missing_skills[0]} skill gap."
    else:
        summary = f"Solid foundation matching {len(matching_skills)} skills with {len(missing_skills)} skill gaps to address."

    return summary, reasons


def rank_opportunities(
    student_profile: Dict[str, Any],
    opportunities: List[Dict[str, Any]]
) -> List[Dict[str, Any]]:
    """
    Ranks opportunities using the 5-factor explainable algorithm with dynamic weight
    re-normalization for sparse student profiles.
    
    Standard Weights:
      Skill Match: 50%
      Interest Match: 20%
      Qualification: 10%
      Project Relevance: 10%
      Preference Match: 10%
    """
    student_skills = student_profile.get("skills", [])
    raw_interests = student_profile.get("interests", [])
    interests = parse_skill_list(raw_interests)
    student_cgpa = float(student_profile.get("cgpa", 0.0) or 0.0)
    projects = student_profile.get("projects", [])
    certifications = parse_skill_list(student_profile.get("certifications", []))
    
    preferences = {
        "opportunity_type": student_profile.get("opportunity_type", "Both"),
        "work_mode": student_profile.get("work_mode", "Any"),
        "preferred_location": student_profile.get("preferred_location", "")
    }

    results = []

    for opp in opportunities:
        req_skills = parse_skill_list(opp.get("required_skills", ""))
        pref_skills = parse_skill_list(opp.get("preferred_skills", ""))
        
        # 1. Skill Match Score (50%)
        skill_score, matching, missing = calculate_skill_match(
            student_skills,
            req_skills,
            pref_skills,
            certifications
        )

        # 2. Interest Match Score (20%)
        interest_score = calculate_interest_match(
            interests,
            opp.get("domain", ""),
            opp.get("title", "")
        )

        # 3. Qualification Match Score (10%)
        min_cgpa = float(opp.get("minimum_cgpa", 0.0) or 0.0)
        qual_score = calculate_qualification_cgpa_match(student_cgpa, min_cgpa)

        # 4. Project Match Score (10%)
        opp_text = f"{opp.get('title', '')} {opp.get('description', '')} {' '.join(req_skills)}"
        project_score, has_projects = calculate_project_match(projects, opp_text, req_skills)

        # 5. Preference Match Score (10%)
        pref_score = calculate_preference_match(preferences, opp)

        # Calculate Final Score using Dynamic Weight Re-normalization for sparse data
        if has_projects and project_score is not None:
            # Full 5-factor standard weighted formula
            final_score = (
                (skill_score * 0.50) +
                (interest_score * 0.20) +
                (qual_score * 0.10) +
                (project_score * 0.10) +
                (pref_score * 0.10)
            )
            report_project_score = project_score
        else:
            # Sparse Profile Strategy: Dynamic Proportional Weight Re-normalization
            # Available weights: 0.50 (skill) + 0.20 (interest) + 0.10 (qual) + 0.10 (pref) = 0.90 sum
            # Re-normalized weights: Skill 55.6%, Interest 22.2%, Qual 11.1%, Pref 11.1%
            available_weighted_sum = (
                (skill_score * 0.50) +
                (interest_score * 0.20) +
                (qual_score * 0.10) +
                (pref_score * 0.10)
            )
            final_score = available_weighted_sum / 0.90
            report_project_score = 0.0  # Reported as 0.0 with re-normalized weighting applied

        final_score = round(min(100.0, max(0.0, final_score)), 1)

        # Explanation generation
        explanation_summary, explanation_reasons = generate_recommendation_explanation(
            matching,
            missing,
            skill_score,
            interest_score,
            qual_score,
            project_score,
            pref_score,
            opp.get("title", "Opportunity")
        )

        result_item = dict(opp)
        result_item["opportunity_id"] = opp.get("id")
        result_item["company"] = opp.get("company_name") or opp.get("company", "")
        result_item["final_score"] = final_score
        result_item["match_percentage"] = final_score  # Backward compatibility
        result_item["skill_match_percentage"] = skill_score
        result_item["matching_skills"] = matching
        result_item["missing_skills"] = missing
        result_item["skill_gap_count"] = len(missing)
        result_item["explanation"] = explanation_summary
        result_item["explanation_details"] = explanation_reasons
        result_item["sparse_data_renormalized"] = not has_projects
        result_item["score_breakdown"] = {
            "skill_match": round(skill_score, 1),
            "interest_match": round(interest_score, 1),
            "qualification_match": round(qual_score, 1),
            "project_match": round(report_project_score, 1),
            "preference_match": round(pref_score, 1),
            "final_score": final_score
        }

        results.append(result_item)

    # Sort opportunities descending by final score
    results.sort(key=lambda x: x["final_score"], reverse=True)
    return results
