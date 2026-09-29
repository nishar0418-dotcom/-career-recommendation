# CareerMatch AI - Recommendation Engine Benchmark Report

## 1. Executive Summary
This report presents the real benchmark test results for the **CareerMatch AI Recommendation Engine**. The engine was evaluated across 10 deterministic edge-case scenarios covering complete profiles, sparse profiles, extreme single-skill and zero-skill profiles, qualification shortfalls, and geographic preferences.

All tests were executed against Opportunity 201 (*Data Analyst Intern at ABC Technologies*) using the automated test suite in [`tests/test_recommendation_engine.py`](../tests/test_recommendation_engine.py).

---

## 2. Benchmark Execution Results Table

The following table reflects the **actual numeric scores** produced by the live implementation:

| Case | Skills | Projects | Interests | Expected Behaviour | Actual Score | Result |
| :--- | :--- | :--- | :--- | :--- | ---: | :---: |
| **Case 1: Complete Profile** | Many (3) | Yes (1) | Yes | Normal 5-factor weighted scoring | **86.2** | `PASS` |
| **Case 2: No Projects** | Many (3) | No | Yes | Dynamic re-normalization (no penalty) | **86.1** | `PASS` |
| **Case 3: Only One Skill** | 1 | No | Yes | Low-confidence result, clear skill gaps | **58.3** | `PASS` |
| **Case 4: No Skills** | 0 | No | No | Safe fallback, no misleading high score | **33.3** | `PASS` |
| **Case 5: No Interests** | 3 | No | No | Neutral baseline (50% interest match) | **75.0** | `PASS` |
| **Case 6: No Projects + No Certs** | 2 | No | Yes | Safe sparse execution, skill gaps shown | **72.2** | `PASS` |
| **Case 7: Exact Skill Match** | Full (4) | Yes | Yes | Maximum high score | **99.4** | `PASS` |
| **Case 8: Zero Skill Match** | Disjoint | Yes | No | Zero skill match, full skill gaps flagged | **28.0** | `PASS` |
| **Case 9: CGPA Below Cutoff** | 3 | No | Yes | Proportional qualification penalty | **80.0** | `PASS` |
| **Case 10: Location Mismatch** | 3 | No | Yes | Location preference reduction (15 vs 50) | **82.2** | `PASS` |

---

## 3. Aggregate Performance Statistics

- **Total Test Cases Executed**: 10
- **Passed Test Cases**: 10
- **Failed Test Cases**: 0
- **Success Rate**: 100.0%
- **Average Match Score**: **70.1**
- **Minimum Match Score**: **28.0** (Case 8: Zero Skill Match)
- **Maximum Match Score**: **99.4** (Case 7: Exact Skill Match)
- **Execution Runtime**: 0.017 seconds

---

## 4. Sparse Data Behavior Comparison (Profiles A, B, and C)

To rigorously verify that the recommendation engine does not unfairly penalize students who lack project data or have incomplete profiles, we compared three standardized student profiles against Opportunity 201 (*Data Analyst Intern*, requiring: `Python`, `SQL`, `Pandas`, `Power BI`):

### Profile Comparison Matrix

| Attribute | Profile A (Complete) | Profile B (No Projects) | Profile C (Sparse: 1 Skill, No Projects/Interests) |
| :--- | :--- | :--- | :--- |
| **Skills** | Python, SQL, Pandas | Python, SQL, Pandas | Python |
| **Projects** | Student Performance Analysis | *None* | *None* |
| **Interests** | Data Science | Data Science | *None* |
| **CGPA** | 8.0 / 10.0 | 8.0 / 10.0 | 8.0 / 10.0 |
| **Preferred Location** | Coimbatore | Coimbatore | Coimbatore |
| **Final Score** | **85.0** | **86.1** | **47.2** |
| **Sparse Re-normalization** | False | **True** | **True** |
| **Skill Match** | 75.0% | 75.0% | 25.0% |
| **Interest Match** | 100.0% | 100.0% | 50.0% (Neutral baseline) |
| **Qualification Match** | 100.0% | 100.0% | 100.0% |
| **Project Match** | 74.7% | 0.0% (Omitted from weight) | 0.0% (Omitted from weight) |
| **Preference Match** | 100.0% | 100.0% | 100.0% |
| **Matching Skills** | Python, SQL, Pandas | Python, SQL, Pandas | Python |
| **Skill Gaps Detected** | Power BI | Power BI | SQL, Pandas, Power BI |
| **Skill Gap Count** | 1 | 1 | 3 |

---

### In-Depth Analysis of Score Variations

#### 1. How Scores Changed between Profile A and Profile B
- **Profile A Score**: **85.0**
- **Profile B Score**: **86.1**
- **Observation**: Profile B scored 1.1 points higher than Profile A despite having no project listed.
- **Why Did This Occur?**
  In Profile A, the student's project had a moderate relevance score of 74.7% (which contributes $74.7 \times 0.10 = 7.47$ points to the total score).
  In Profile B, because project data was missing, the engine activated **Dynamic Weight Re-normalization**:
  $$\text{Final Score}_B = \frac{(75.0 \times 0.50) + (100.0 \times 0.20) + (100.0 \times 0.10) + (100.0 \times 0.10)}{0.90} = \frac{77.5}{0.90} = 86.11 \approx 86.1$$
  The student's strong demonstrated skills (75%), domain interest (100%), CGPA (100%), and location alignment (100%) were scaled over the active 90% weight.
- **Fairness Proof**: Profile B was **not penalized** for omitting project data. If the engine had naively assigned 0/100 to the project dimension without re-normalization, Profile B's score would have collapsed to **77.5**, stripping 8.6 points unfairly.

#### 2. How Scores Changed for Profile C (Extreme Sparse Profile)
- **Profile C Score**: **47.2**
- **Score Drop**: Dropped by 38.9 points compared to Profile B.
- **Component Breakdown**:
  - **Skill Match**: Dropped from 75.0% to 25.0% because the student only possessed 1 out of 4 required skills (`Python`).
  - **Interest Match**: Defaulted to the neutral baseline of 50.0% (rather than 0%), acknowledging that unstated interests should not be treated as a negative mismatch.
  - **Qualification Match**: Maintained at 100.0% (CGPA 8.0 meets requirement).
  - **Preference Match**: Maintained at 100.0% (Coimbatore matches location).
  $$\text{Final Score}_C = \frac{(25.0 \times 0.50) + (50.0 \times 0.20) + (100.0 \times 0.10) + (100.0 \times 0.10)}{0.90} = \frac{12.5 + 10.0 + 10.0 + 10.0}{0.90} = \frac{42.5}{0.90} = 47.22 \approx 47.2$$
- **Skill Gaps Flagged**: Accurately flagged all 3 missing core skills: `SQL`, `Pandas`, `Power BI`.
- **Verdict**: The score of 47.2 accurately reflects that the candidate lacks 75% of the mandatory skills, without crashing or showing an inflated, misleading recommendation.

---

## 5. Verification Commands
To reproduce these exact benchmark results at any time:

```bash
# Run the benchmark test suite from repository root
python tests/test_recommendation_engine.py

# Or via standard unittest discovery
python -m unittest discover tests
```
