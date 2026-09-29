"""
Automated Test Suite: AI Recommendation Engine Benchmark Edge Cases
====================================================================
Tests the 10 benchmark edge cases specified in project requirements:
  Case 1  - Complete Profile
  Case 2  - No Projects (Sparse Data Re-normalization)
  Case 3  - Only One Skill
  Case 4  - No Skills
  Case 5  - No Interests (Neutral Baseline)
  Case 6  - No Projects + No Certifications (Extremely Sparse)
  Case 7  - Exact Skill Match
  Case 8  - Zero Skill Match
  Case 9  - CGPA Below Requirement
  Case 10 - Location Mismatch
"""

import sys
import os
import unittest
from typing import Dict, Any, List

# Ensure backend directory is in python path
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.abspath(os.path.join(current_dir, "..", "backend"))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.ai.recommendation_engine import (
    rank_opportunities,
    calculate_skill_match,
    calculate_interest_match,
    calculate_qualification_cgpa_match,
    calculate_project_match,
    calculate_preference_match
)


def get_benchmark_opportunity() -> Dict[str, Any]:
    """Returns standard Opportunity 201 (Data Analyst Intern at ABC Technologies)."""
    return {
        "id": 201,
        "company_name": "ABC Technologies",
        "title": "Data Analyst Intern",
        "description": "Analyze business datasets, design reporting pipelines, and build executive dashboards using SQL, Python, Pandas, and Power BI.",
        "domain": "Data Science",
        "qualification": "B.Tech in CS/IT or Statistics",
        "minimum_cgpa": 7.00,
        "location": "Coimbatore",
        "opportunity_type": "Internship",
        "work_mode": "Hybrid",
        "required_skills": "Python, SQL, Pandas, Power BI",
        "preferred_skills": "Excel, Statistics"
    }


class RecommendationEngineBenchmarkTests(unittest.TestCase):
    """Benchmark test cases for CareerMatch AI Recommendation Engine."""

    # Storage for benchmark reporting
    benchmark_records: List[Dict[str, Any]] = []

    @classmethod
    def record_result(cls, case_name: str, skills_desc: str, projects_desc: str,
                      interests_desc: str, expected: str, actual_score: float, passed: bool):
        cls.benchmark_records.append({
            "case": case_name,
            "skills": skills_desc,
            "projects": projects_desc,
            "interests": interests_desc,
            "expected": expected,
            "score": actual_score,
            "result": "PASS" if passed else "FAIL"
        })

    def test_case_01_complete_profile(self):
        """Case 1 — Complete Profile: normal weighted scoring across all 5 dimensions."""
        student = {
            "student_id": 101,
            "skills": [
                {"name": "Python", "proficiency": "intermediate"},
                {"name": "SQL", "proficiency": "intermediate"},
                {"name": "Pandas", "proficiency": "intermediate"}
            ],
            "interests": ["Data Science", "Data Analytics"],
            "cgpa": 8.5,
            "projects": [
                {
                    "name": "Student Performance Analysis",
                    "description": "Analyzed performance datasets with Python, Pandas, and SQL dashboards.",
                    "technologies": ["Python", "Pandas", "SQL"]
                }
            ],
            "certifications": ["Python for Data Science"],
            "preferred_location": "Coimbatore",
            "opportunity_type": "Internship",
            "work_mode": "Hybrid"
        }
        opp = get_benchmark_opportunity()
        results = rank_opportunities(student, [opp])
        top = results[0]

        score = top["final_score"]
        breakdown = top["score_breakdown"]

        # Assertions
        self.assertGreaterEqual(score, 75.0)
        self.assertLessEqual(score, 100.0)
        self.assertEqual(len(top["matching_skills"]), 3)
        self.assertIn("Power BI", top["missing_skills"])
        self.assertEqual(top["skill_gap_count"], 1)
        self.assertEqual(breakdown["interest_match"], 100.0)
        self.assertEqual(breakdown["qualification_match"], 100.0)
        self.assertGreater(breakdown["project_match"], 50.0)
        self.assertEqual(breakdown["preference_match"], 100.0)

        # Verify mathematical consistency
        expected_math = round(
            (breakdown["skill_match"] * 0.50) +
            (breakdown["interest_match"] * 0.20) +
            (breakdown["qualification_match"] * 0.10) +
            (breakdown["project_match"] * 0.10) +
            (breakdown["preference_match"] * 0.10),
            1
        )
        self.assertAlmostEqual(score, expected_math, places=1)

        self.record_result("Complete Profile", "Many (3)", "Yes (1)", "Yes", "Normal scoring", score, True)

    def test_case_02_no_projects(self):
        """Case 2 — No Projects: sparse data re-normalization prevents severe penalty."""
        student = {
            "student_id": 102,
            "skills": [
                {"name": "Python", "proficiency": "intermediate"},
                {"name": "SQL", "proficiency": "intermediate"},
                {"name": "Pandas", "proficiency": "intermediate"}
            ],
            "interests": ["Data Science"],
            "cgpa": 8.5,
            "projects": [],  # Empty projects
            "preferred_location": "Coimbatore",
            "opportunity_type": "Internship"
        }
        opp = get_benchmark_opportunity()
        results = rank_opportunities(student, [opp])
        top = results[0]

        score = top["final_score"]
        self.assertTrue(top["sparse_data_renormalized"])
        # Score should not be dragged down to zero for projects; must stay high (> 80)
        self.assertGreaterEqual(score, 80.0)
        
        # Verify re-normalized formula: (0.50*skill + 0.20*int + 0.10*qual + 0.10*pref) / 0.90
        breakdown = top["score_breakdown"]
        unscaled = (
            (breakdown["skill_match"] * 0.50) +
            (breakdown["interest_match"] * 0.20) +
            (breakdown["qualification_match"] * 0.10) +
            (breakdown["preference_match"] * 0.10)
        )
        expected_renorm = round(unscaled / 0.90, 1)
        self.assertAlmostEqual(score, expected_renorm, places=1)

        self.record_result("No Projects", "Many (3)", "No", "Yes", "No severe penalty", score, True)

    def test_case_03_only_one_skill(self):
        """Case 3 — Only One Skill: no crash, recommendations generated, clear skill gaps."""
        student = {
            "student_id": 103,
            "skills": [{"name": "Python", "proficiency": "intermediate"}],
            "interests": ["Data Science"],
            "cgpa": 7.5,
            "projects": [],
            "preferred_location": "Coimbatore"
        }
        opp = get_benchmark_opportunity()
        results = rank_opportunities(student, [opp])
        top = results[0]

        score = top["final_score"]
        self.assertIn("Python", top["matching_skills"])
        self.assertEqual(len(top["matching_skills"]), 1)
        self.assertEqual(len(top["missing_skills"]), 3)
        self.assertIn("SQL", top["missing_skills"])
        self.assertIn("Pandas", top["missing_skills"])
        self.assertIn("Power BI", top["missing_skills"])
        self.assertGreater(score, 30.0)
        self.assertLess(score, 75.0)

        self.record_result("One Skill", "1", "No", "Yes", "Low-confidence result", score, True)

    def test_case_04_no_skills(self):
        """Case 4 — No Skills: no crash, skill match is 0.0, no misleading high score."""
        student = {
            "student_id": 104,
            "skills": [],
            "interests": [],
            "cgpa": 7.0,
            "projects": []
        }
        opp = get_benchmark_opportunity()
        results = rank_opportunities(student, [opp])
        top = results[0]

        score = top["final_score"]
        breakdown = top["score_breakdown"]

        self.assertEqual(breakdown["skill_match"], 0.0)
        self.assertEqual(len(top["matching_skills"]), 0)
        self.assertEqual(len(top["missing_skills"]), 4)
        self.assertLessEqual(score, 40.0)

        self.record_result("No Skills", "0", "No", "No", "No misleading recommendation", score, True)

    def test_case_05_no_interests(self):
        """Case 5 — No Interests: system applies neutral baseline (50%), not harsh 0%."""
        student = {
            "student_id": 105,
            "skills": ["Python", "SQL", "Pandas"],
            "interests": [],  # Missing interests
            "cgpa": 8.0,
            "projects": []
        }
        opp = get_benchmark_opportunity()
        results = rank_opportunities(student, [opp])
        top = results[0]

        breakdown = top["score_breakdown"]
        self.assertEqual(breakdown["interest_match"], 50.0)
        self.assertGreaterEqual(top["final_score"], 70.0)

        self.record_result("No Interests", "3", "No", "No", "Neutral baseline (50%)", top["final_score"], True)

    def test_case_06_no_projects_no_certifications(self):
        """Case 6 — No Projects + No Certifications: extremely sparse profile works safely."""
        student = {
            "student_id": 106,
            "skills": ["Python", "SQL"],
            "interests": ["Data Science"],
            "cgpa": 7.8,
            "projects": [],
            "certifications": []
        }
        opp = get_benchmark_opportunity()
        results = rank_opportunities(student, [opp])
        top = results[0]

        self.assertIsNotNone(top["final_score"])
        self.assertTrue(top["sparse_data_renormalized"])
        self.assertEqual(len(top["matching_skills"]), 2)
        self.assertEqual(len(top["missing_skills"]), 2)

        self.record_result("No Projects/Certs", "2", "No", "Yes", "Safe sparse execution", top["final_score"], True)

    def test_case_07_exact_skill_match(self):
        """Case 7 — Exact Skill Match: all required skills matched, high final score >= 95%."""
        student = {
            "student_id": 107,
            "skills": [
                {"name": "Python", "proficiency": "advanced"},
                {"name": "SQL", "proficiency": "advanced"},
                {"name": "Pandas", "proficiency": "advanced"},
                {"name": "Power BI", "proficiency": "advanced"}
            ],
            "interests": ["Data Science"],
            "cgpa": 9.0,
            "projects": [
                {
                    "name": "End-to-End Analytics Platform",
                    "description": "Comprehensive pipeline using Python, SQL, Pandas and interactive Power BI executive reporting dashboards.",
                    "technologies": ["Python", "SQL", "Pandas", "Power BI"]
                }
            ],
            "certifications": ["Power BI Certified Data Analyst", "Python for Data Science"],
            "preferred_location": "Coimbatore",
            "opportunity_type": "Internship"
        }
        opp = get_benchmark_opportunity()
        results = rank_opportunities(student, [opp])
        top = results[0]

        score = top["final_score"]
        self.assertEqual(top["score_breakdown"]["skill_match"], 100.0)
        self.assertEqual(len(top["missing_skills"]), 0)
        self.assertEqual(top["skill_gap_count"], 0)
        self.assertGreaterEqual(score, 95.0)

        self.record_result("Exact Match", "Full (4)", "Yes", "Yes", "High score", score, True)

    def test_case_08_zero_skill_match(self):
        """Case 8 — Zero Skill Match: student has completely unrelated skills."""
        student = {
            "student_id": 108,
            "skills": ["Photoshop", "Illustrator", "Figma", "UI Design"],
            "interests": ["UI/UX Design"],
            "cgpa": 8.0,
            "projects": [
                {
                    "name": "Mobile App UI Redesign",
                    "description": "Figma mockups and wireframes.",
                    "technologies": ["Figma", "Photoshop"]
                }
            ],
            "preferred_location": "Coimbatore"
        }
        opp = get_benchmark_opportunity()
        results = rank_opportunities(student, [opp])
        top = results[0]

        score = top["final_score"]
        breakdown = top["score_breakdown"]

        self.assertEqual(breakdown["skill_match"], 0.0)
        self.assertEqual(len(top["matching_skills"]), 0)
        self.assertEqual(len(top["missing_skills"]), 4)
        self.assertLess(score, 45.0)

        self.record_result("Zero Skill Match", "Disjoint", "Yes", "No", "Low score & full gaps", score, True)

    def test_case_09_cgpa_below_requirement(self):
        """Case 9 — CGPA Below Requirement: non-abrupt qualification score penalty."""
        student = {
            "student_id": 109,
            "skills": ["Python", "SQL", "Pandas"],
            "interests": ["Data Science"],
            "cgpa": 6.2,  # Shortfall: 7.0 - 6.2 = 0.8
            "projects": [],
            "preferred_location": "Coimbatore"
        }
        opp = get_benchmark_opportunity()  # Minimum CGPA is 7.00
        results = rank_opportunities(student, [opp])
        top = results[0]

        breakdown = top["score_breakdown"]
        # With 0.8 shortfall, qualification score should be penalized (45.0)
        self.assertEqual(breakdown["qualification_match"], 45.0)
        self.assertGreater(top["final_score"], 60.0)

        self.record_result("CGPA Below Cutoff", "3", "No", "Yes", "Proportional penalty", top["final_score"], True)

    def test_case_10_location_mismatch(self):
        """Case 10 — Location Mismatch: evaluates preference reduction when location differs."""
        student = {
            "student_id": 110,
            "skills": ["Python", "SQL", "Pandas"],
            "interests": ["Data Science"],
            "cgpa": 8.5,
            "projects": [],
            "preferred_location": "Coimbatore"  # Preferred Coimbatore
        }
        # Opportunity located in Mumbai On-site
        opp = get_benchmark_opportunity()
        opp["location"] = "Mumbai"
        opp["work_mode"] = "On-site"

        results = rank_opportunities(student, [opp])
        top = results[0]

        breakdown = top["score_breakdown"]
        # Location mismatch drops location contribution from 50 to 15 (preference_match becomes 65.0 vs 100.0)
        self.assertEqual(breakdown["preference_match"], 65.0)
        self.assertLess(top["final_score"], 86.0)

        self.record_result("Location Mismatch", "3", "No", "Yes", "Reduced preference score", top["final_score"], True)


def run_benchmark_and_generate_summary():
    """Runs the suite and outputs the formatted markdown table with actual scores."""
    suite = unittest.TestLoader().loadTestsFromTestCase(RecommendationEngineBenchmarkTests)
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)

    records = RecommendationEngineBenchmarkTests.benchmark_records
    scores = [r["score"] for r in records]

    avg_score = round(sum(scores) / len(scores), 1) if scores else 0.0
    min_score = min(scores) if scores else 0.0
    max_score = max(scores) if scores else 0.0
    passed_count = sum(1 for r in records if r["result"] == "PASS")
    failed_count = sum(1 for r in records if r["result"] == "FAIL")

    print("\n" + "=" * 80)
    print("BENCHMARK EXECUTION SUMMARY TABLE")
    print("=" * 80)
    print("| Case | Skills | Projects | Interests | Expected Behaviour | Actual Score | Result |")
    print("| :--- | :--- | :--- | :--- | :--- | ---: | :---: |")
    for r in records:
        print(f"| {r['case']:<20} | {r['skills']:<8} | {r['projects']:<8} | {r['interests']:<9} | {r['expected']:<28} | {r['score']:>12.1f} | {r['result']:^6} |")

    print("\n" + "-" * 40)
    print(f"Average Score:        {avg_score}")
    print(f"Minimum Score:        {min_score}")
    print(f"Maximum Score:        {max_score}")
    print(f"Passed Tests:         {passed_count} / {len(records)}")
    print(f"Failed Tests:         {failed_count}")
    print("-" * 40)

    return result.wasSuccessful()


if __name__ == "__main__":
    success = run_benchmark_and_generate_summary()
    sys.exit(0 if success else 1)
