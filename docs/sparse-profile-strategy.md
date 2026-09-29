# CareerMatch AI - Sparse Profile Handling Strategy

## 1. Overview & Problem Definition
In student career and internship recommendation systems, complete student profiles are rare. Early-stage university students frequently lack:
- Formal project portfolios (`projects: []`)
- Industry certifications (`certifications: []`)
- Well-defined domain interests (`interests: []`)
- Specific geographic or work mode preferences

### The Anti-Pattern: Punitive Zero-Assignment
If a recommendation system naively assigns a score of 0 / 100 to missing dimensions, a student with 100% skill match, 100% interest match, 100% qualification match, and 100% preference match loses 10 full percentage points simply because they haven't uploaded a project. Their score collapses from 100% to 90%.

---

## 2. Selected Strategy: Dynamic Proportional Weight Re-Normalization

We evaluated two potential strategies:
1. **Neutral Default Imputation**: Assigning a fixed baseline (e.g. 50% or 60%) to missing dimensions.
2. **Dynamic Proportional Weight Re-normalization**: Removing the absent dimension from the score denominator and scaling all active, demonstrated dimensions proportionally so their weights sum to 100%.

### Why Dynamic Weight Re-normalization Was Chosen
- **Merit-Driven Evaluation**: Students are judged purely on the evidence they have provided (demonstrated technical skills, academic performance, and alignment).
- **Mathematical Integrity**: Avoids artificial score inflation or score dampening caused by arbitrary neutral imputation.
- **Explainability**: Component contributions remain transparent, and the API explicitly sets `"sparse_data_renormalized": true`.

---

## 3. Mathematical Formulation

### Standard 5-Factor Weights (Complete Profile)
$$\text{Final Score} = 0.50 \cdot S + 0.20 \cdot I + 0.10 \cdot Q + 0.10 \cdot P_{\text{proj}} + 0.10 \cdot P_{\text{pref}}$$

$$\sum_{i} W_i = 0.50 + 0.20 + 0.10 + 0.10 + 0.10 = 1.00 \quad (100\%)$$

### Sparse Profile (Missing Projects: $P_{\text{proj}}$ is absent)
Available weight sum:
$$W_{\text{active}} = 0.50 + 0.20 + 0.10 + 0.10 = 0.90$$

Re-normalized proportional weights:
$$W'_{\text{skill}} = \frac{0.50}{0.90} \approx 55.56\%$$
$$W'_{\text{interest}} = \frac{0.20}{0.90} \approx 22.22\%$$
$$W'_{\text{qualification}} = \frac{0.10}{0.90} \approx 11.11\%$$
$$W'_{\text{preference}} = \frac{0.10}{0.90} \approx 11.11\%$$

$$\sum_{i} W'_i = \frac{0.50 + 0.20 + 0.10 + 0.10}{0.90} = \frac{0.90}{0.90} = 1.00 \quad (100\%)$$

$$\text{Final Score}_{\text{sparse}} = \frac{0.50 \cdot S + 0.20 \cdot I + 0.10 \cdot Q + 0.10 \cdot P_{\text{pref}}}{0.90}$$

---

## 4. Sparse Dimension Treatment Matrix

| Dimension | Missing / Sparse State | System Treatment | Rationale |
| :--- | :--- | :--- | :--- |
| **Projects** | `projects: []` or `null` | **Dynamic Weight Re-normalization** (0.90 denominator) | Early-stage students lack formal repos; evaluated on coursework and skills. |
| **Certifications** | `certifications: []` or `null` | Zero bonus without penalty | Certifications are treated as positive enhancements, not mandatory barriers. |
| **Interests** | `interests: []` or `null` | **Neutral Baseline (50.0%)** | Unselected interests should not register as a domain mismatch (25%). |
| **Preferred Location** | `""` or `"Any"` | **Flexible Full Match (50.0 / 50.0 pts)** | A student with no geographic restriction is open to all locations. |
| **Opportunity Type** | `""` or `"Both"` | **Flexible Full Match (30.0 / 30.0 pts)** | Open to both internships and full-time positions. |
| **Work Mode** | `""` or `"Any"` | **Flexible Full Match (20.0 / 20.0 pts)** | Open to remote, hybrid, or on-site arrangements. |
| **Single Skill** | Only 1 skill possessed | Calculated against required count | Avoids crashes, flags remaining skills as gaps, yields explainable score. |
| **No Skills** | `skills: []` | Score reflects 0% skill match (Final $\approx 33\%$) | Avoids misleading high score; prompts student to add technical skills. |

---

## 5. Live Demonstration & Verification

Comparing Profile A (with project) vs Profile B (no project) on Opportunity 201:
- **Profile A (Project: 74.7%)**: Final Score = **85.0**
- **Profile B (No Project, Re-normalized)**: Final Score = **86.1**

Profile B received **86.1** because their 75% skill match, 100% interest match, 100% CGPA, and 100% preference were scaled over 0.90 rather than penalizing them with 0/100 for the project.
