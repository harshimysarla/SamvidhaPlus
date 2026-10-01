# SMART ACADEMIC INTELLIGENCE PORTAL (SAIP)
## System Architecture & Technical Specification

Inspired by the academic engineering design and autonomous curriculum of **IARE's Samvidha Portal (`samvidha.iare.ac.in`)**, the Smart Academic Intelligence Portal (SAIP) provides a multi-layer academic platform combining student/faculty portal operations, performance intelligence scoring, and validated predictive estimation.

---

## 1. High-Level Architecture (3-Layer Model)

```
┌────────────────────────────────────────────────────────────────────────┐
│                        LAYER 1: ACADEMIC PORTAL                        │
│  - Student Profiles & Faculty Rosters    - Course Registration (R20/R22)│
│  - Samvidha CIE-I/II & AAT Breakdown    - 14-Week Laboratory Marks      │
│  - Semester SGPA/CGPA Ledger Records    - Degree Audit Pending Courses  │
│  - Attendance Tracking & Compliance     - Timetable & Academic Calendar │
│  - Continuous Coursework Tasks (AAT)    - In-App Notification Center    │
└────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│             LAYER 2: ACADEMIC PERFORMANCE INTELLIGENCE                 │
│  - Multi-factor Academic Performance Index (API: 0–100 scale)          │
│  - Missing-Data Aware Dynamic Reweighting (No False Zero Substitution) │
│  - Subject-Level Strength & Attention Radar / Comparative Analytics   │
│  - Longitudinal Semester Progression Momentum Tracking                 │
│  - Explainable Qualitative Insights with Data Provenance Disclosures   │
└────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│             LAYER 3: PREDICTIVE ACADEMIC INTELLIGENCE                  │
│  - Dual-Component Bayesian SGPA Estimation with Confidence Intervals   │
│  - Interactive What-If CGPA Simulator (Target Milestone Feasibility)   │
│  - Attendance Forecaster & Compliance Buffer Margin Calculator         │
│  - Transparent Academic Support & Detention Risk Indicators            │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Adapter-Based Academic Data Integration Layer

To decouple academic portal operations from concrete data origins, the platform enforces an adapter pattern via the `AcademicDataProvider` interface:

```
                      ┌────────────────────────┐
                      │  AcademicDataProvider  │ (Abstract Interface)
                      └───────────┬────────────┘
                                  │
         ┌────────────────────────┼────────────────────────┐
         ▼                        ▼                        ▼
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│DemoDataProvider │      │AuthorizedImport │      │OfficialApi      │
│(Local Synthetic)│      │(CSV/DB Ingested)│      │(Live Samvidha)  │
└─────────────────┘      └─────────────────┘      └─────────────────┘
```

* **Data Source Indicator Badges**:
  * `Demo Data`: System uses local structured synthetic JSON records.
  * `Authorized Import`: System uses validated CSV/Excel datasets committed via the Admin Module.
  * `Official API`: System connects to verified, authorized college REST endpoints with valid API keys. Live status is displayed **only** when verified with an active handshake.

---

## 3. Performance Index (API) Mathematical Formulation

The Academic Performance Index evaluates overall academic health on a normalized scale of 0 to 100:

$$\text{API} = \frac{\sum_{i \in \text{Available}} w_i \cdot S_i}{\sum_{i \in \text{Available}} w_i}$$

### Initial Prototype Calibration:
1. **Academic Performance ($w_{\text{acad}} = 0.40$)**:
   $$S_{\text{acad}} = \min\left(100, \max\left(0, \frac{\text{CGPA}}{10.0} \times 100\right)\right)$$
2. **Class Attendance ($w_{\text{att}} = 0.20$)**:
   $$S_{\text{att}} = \min\left(100, \max\left(0, \frac{\text{Classes Attended}}{\text{Classes Conducted}} \times 100\right)\right)$$
3. **Internal Assessments ($w_{\text{int}} = 0.20$)**:
   $$S_{\text{int}} = \min\left(100, \max\left(0, \frac{\text{Internal Total}}{40.0} \times 100\right)\right)$$
4. **Semester Progression Trend ($w_{\text{trend}} = 0.10$)**:
   $$S_{\text{trend}} = \min(100, \max(0, 75.0 + (\text{SGPA}_{\text{latest}} - \text{SGPA}_{\text{prev}}) \times 20.0))$$
5. **Degree Credit Progress ($w_{\text{cred}} = 0.10$)**:
   $$S_{\text{cred}} = \min\left(100, \max\left(0, \frac{\text{Earned Credits}}{\text{Required Credits (160)}} \times 100\right)\right)$$

### Missing Data Policy:
If any component $k$ lacks data, $w_k$ is omitted and available weights $\sum w_i$ are re-normalized to 1.0. A completeness percentage ($\sum w_i \times 100\%$) and partial status badge are displayed to prevent artificial penalization.

---

## 4. Predictive Modeling & What-If Simulations

### SGPA Estimation Model:
Combines cumulative historical grade performance with active continuous internal evaluations (CIE-I, CIE-II, AAT):
$$\widehat{\text{SGPA}} = 0.65 \cdot \text{SGPA}_{\text{current\_extrapolated}} + 0.35 \cdot \overline{\text{SGPA}}_{\text{historical}}$$
Confidence intervals $[\text{SGPA}_{\min}, \text{SGPA}_{\max}]$ are computed using historical standard deviation $\sigma$ across published semesters.

### What-If CGPA Simulator:
$$\text{CGPA}_{\text{projected}} = \frac{(\text{CGPA}_{\text{curr}} \cdot C_{\text{earned}}) + (\text{SGPA}_{\text{hypo}} \cdot C_{\text{next}})}{C_{\text{earned}} + C_{\text{next}}}$$

### Attendance Compliance Forecaster:
To achieve university threshold $T = 0.75$:
$$x_{\text{needed}} = \max\left(0, \left\lceil \frac{0.75 \cdot C_{\text{conducted}} - C_{\text{attended}}}{0.25} \right\rceil\right)$$
Safe classes missable while preserving $\ge 75\%$:
$$y_{\text{can\_miss}} = \max\left(0, \left\lfloor \frac{C_{\text{attended}} - 0.75 \cdot C_{\text{conducted}}}{0.75} \right\rfloor\right)$$

---

## 5. Security & Privacy Safeguards
* **Argon2id Password Hashing**: Cryptographically resistant to GPU-based attacks.
* **Strict Student Data Isolation**: Backend enforces token ownership; student accounts are strictly forbidden from retrieving or querying records belonging to other roll numbers (HTTP 403 Forbidden).
* **Faculty Scope Boundaries**: Faculty access is scoped to enrolled sections and assigned courses.
* **Audit Logging**: Sensitive data modifications and authentication events log timestamp, user, action, resource, and IP address.
