# SamvidhaPlus — AI-Powered Academic Performance Analysis, Prediction & Guidance System

> **Tagline:** *"Understand Your Performance. Predict Your Progress. Shape Your Future."*  
> **Institution:** Institute of Aeronautical Engineering (IARE), Hyderabad  
> **Project Type:** Engineering Design Project (EDP) & Production Full-Stack Academic Intelligence Ecosystem

---

## 🌟 Executive Summary & Vision

**SamvidhaPlus** transforms traditional academic record-keeping into a dynamic academic intelligence platform. While traditional college portals simply present historical marks, **SamvidhaPlus** transforms academic records into personalized understanding, predictive foresight, and actionable guidance across three core pillars:

```
                     ┌─────────────────────────────────────────────────────────┐
                     │                      SamvidhaPlus                       │
                     │          AI-Powered Academic Intelligence Portal        │
                     └────────────────────────────┬────────────────────────────┘
                                                  │
         ┌────────────────────────────────────────┼────────────────────────────────────────┐
         │                                        │                                        │
         ▼                                        ▼                                        ▼
  1. UNDERSTAND                            2. PREDICT                               3. IMPROVE
• Continuous Internal Evaluation         • Bounded Bayesian SGPA                  • Actionable Guidance Engine
  (10 + 5 + 5 + 10 + 5 + 5 = 40)           ([0.0, 10.0] Interval)                   (CIE Revision / Attendance Plans)
• 14-Week Laboratory Continuous          • Model: v1.2.0-bayesian-reg             • Smart Study Planner
  (30 day-to-day + 10 exam = 40)         • Metrics: MAE 0.28, RMSE 0.36             (7-Day Rolling Schedules)
• Attendance Compliance Margins          • What-If CGPA Simulator                 • Consistency Streak Tracker
  (<75% condonation, <65% detention)     • Attendance Forecaster                  • Faculty Mentoring Interventions
• Degree Credit Audit & Trajectory       • Transparent Disclaimer                 • Student Privacy & Preferences
```

---

## 🚀 Key Features by EDP Pillar

### 1. Pillar 1: Understand (Academic Standing & CIE Breakdown)
* **Autonomous CIE Marking Breakdown:** Implements the exact Samvidha continuous evaluation structure:
  $$\text{Internal Total (40)} = \text{CIE-I (10)} + \text{AAT-I-I (5)} + \text{AAT-I-II (5)} + \text{CIE-II (10)} + \text{AAT-II-I (5)} + \text{AAT-II-II (5)}$$
* **14-Week Continuous Laboratory Evaluation:** Real-time tracking of day-to-day continuous evaluation ($30\text{ marks}$) and internal exam ($10\text{ marks}$).
* **Attendance Compliance Margins:** Visualizes exact session counts required to achieve $\ge 75\%$ regular cutoff, or condonation buffer lines ($65\% \le \text{Att} < 75\%$).
* **Degree Completion Audit:** Tracks degree requirements across all 9 curriculum categories (Foundation, Core, Professional Electives, Open Electives, Projects, Audit Courses, etc.).

### 2. Pillar 2: Predict (Bayesian Forecasting & Scenario Simulation)
* **Dual-Component Bayesian SGPA Estimation:** Blends active course-level internal extrapolation ($65\%$ weight) with cumulative student historical momentum ($35\%$ weight).
* **Transparent Model Metadata:**
  * **Model Version:** `v1.2.0-bayesian-reg`
  * **Prediction Horizon:** `Semester End Examination (SEE) 2024-2025`
  * **Model Validation Metrics:** $\text{MAE} = 0.28$, $\text{RMSE} = 0.36$, $\text{Baseline MAE} = 0.54$
  * **Bounded Output:** $[0.0, 10.0]$ with explicit uncertainty interval $[\text{SGPA}_{\min}, \text{SGPA}_{\max}]$.
* **Interactive What-If CGPA Simulator:** Drag the interactive SGPA slider to calculate cumulative GPA impact and verify target milestones.
* **Attendance Forecaster:** Interactive scenario simulator projecting future attendance percentages based on upcoming attendance habits.
* **Non-Punitive Academic Disclaimer:** Clearly identifies predictions as self-planning estimates rather than official institutional mark sheets.

### 3. Pillar 3: Improve (Actionable Guidance & Smart Study Planner)
* **Personalized Guidance Engine:** Automatically synthesizes data-grounded recommendations:
  * **Targeted CIE Revision:** Pinpoints specific courses and syllabus units where internal scores are below threshold.
  * **Attendance Recovery Pathways:** Calculates exact consecutive classes needed to cross condonation or detention cutoffs.
  * **Core Credit Hour Allocation:** Recommends weekly study block allocations for high-credit courses.
  * **Interactive Status Toggles:** Students can mark recommendations as *In Progress*, *Done*, or *Dismissed*.
* **Smart Study Planner (`/student/planner`):**
  * **Rolling 7-Day Schedule:** Daily task allocation badges and hourly breakdown.
  * **Consistency Streak:** Active study streak tracker ($\text{Days Active}$).
  * **Assessment-Grounded Allocations:** Recommended weekly study time per course based on CIE evaluation scores.
* **Faculty Mentoring & Support Actions (`/faculty`):**
  * Proactive alerts for at-risk students ($\text{Att} < 75\%$ or $\text{CIE} < 20/40$).
  * Modal interface to prescribe remedial assignments, schedule counseling sessions, and track follow-ups.
* **Student Privacy & Preferences:** Custom attendance warning thresholds ($75\%, 80\%, 85\%$), email alert toggles, and mentoring visibility consent.

---

## 🛠️ Technology Stack & Architecture

```
c:/wse/EduPulse/
├── backend/                      # FastAPI REST API & Analytics Engine (Python 3.13)
│   ├── app/
│   │   ├── analytics/            # GuidanceEngine, PerformanceIndexEngine
│   │   ├── api/                  # REST API v1 Routers (auth, students, faculty, guidance, planner, preferences)
│   │   ├── core/                 # Config, Database engine, Argon2 Security, Tokens
│   │   ├── models/               # SQLAlchemy Models (StudyTask, AcademicRecommendation, FacultyIntervention, StudentPreference)
│   │   ├── predictions/          # SGPAEstimator (v1.2.0-bayesian-reg), RiskDetector, What-If Simulator
│   │   ├── schemas/              # Pydantic Schemas with validation & model metadata
│   │   └── main.py               # FastAPI Entrypoint & Router Registry
│   ├── tests/                    # Pytest Suite (22 Unit & Integration Tests, 100% Pass)
│   ├── seed_database.py          # Database Seeder with autonomous demo dataset
│   └── requirements.txt          # Python dependencies
├── frontend/                     # Next.js 14 App Router with TypeScript & Tailwind CSS
│   ├── app/                      # Pages: Student Dashboard, Study Planner, Records, Analytics, Faculty, Admin
│   ├── components/               # Reusable UI, Navbars, Sidebar, Recharts, Preferences Modal
│   ├── lib/                      # Strongly-typed API client, TypeScript interfaces, utils
│   └── package.json              # Node.js dependencies
└── demo-data/                    # Structured synthetic Samvidha dataset (JSON)
```

---

## ⚡ Quickstart Guide

### Prerequisites
* **Python:** 3.11+
* **Node.js:** 18+ / npm 9+
* **Git**

### 1. Backend Setup
```bash
cd backend

# Create & activate virtual environment
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Seed the database
python seed_database.py

# Run test suite
pytest tests/

# Start FastAPI server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation will be available at: `http://127.0.0.1:8000/docs`

### 2. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Build production bundle
npm run build

# Start frontend server
npm start
# Or for live hot-reloading development:
npm run dev
```
Frontend will be available at: `http://localhost:3000`

---

## 🔑 Demo Login Credentials

The application includes interactive one-click login buttons on the login screen, or you can log in with:

| Role | Username / Roll No | Password | Persona & Context |
| :--- | :--- | :--- | :--- |
| **Student (High Standing)** | `21951A0501` | `DemoPass@123` | B.Tech CSE Sem 7 • CGPA: 8.52 • Attendance: 91.5% • High performer |
| **Student (Support Needed)** | `22951A0542` | `DemoPass@123` | B.Tech CSE Sem 5 • Attendance: 68.2% (Condonation) • Mentoring alerts |
| **Student (Pre-Final Year)** | `22951A6601` | `DemoPass@123` | B.Tech AIML Sem 5 • CGPA: 8.80 • Attendance: 94.2% |
| **Faculty Member** | `FAC001` | `DemoPass@123` | Dr. K. Srinivas (Professor, CSE) • Course In-charge for Compiler Design |
| **Administrator** | `ADMIN01` | `AdminPass@123` | Controller of Examinations & Institutional Administrator |

---

## 🔒 Security, Data Privacy & Institutional Boundary

* **Student Data Isolation:** Server-side RBAC strictly isolates student records. A student attempting to access another student's planner, recommendations, or academic ledger receives an HTTP 403 Forbidden.
* **Password Security:** Password hashing using Argon2 with zero plaintext credential persistence.
* **Official Institution Boundary:** SamvidhaPlus is an independent engineering design system. It does not automate logins, scrape protected student portals, or fabricate unofficial endpoints. Integration with institutional systems is handled via an explicit adapter (`AcademicDataProvider`) requiring verified institution authorization.

---

## 🧪 Testing & Validation

```bash
# Backend Automated Tests
pytest backend/tests/
# ======================= 22 passed in 2.8s =======================

# Frontend Type-Checking & Production Build
npm run build
# ✓ Compiled successfully (15/15 pages generated with zero errors)
```

---

## 📄 License
Academic Engineering Design Project (EDP) developed for the Institute of Aeronautical Engineering (IARE), Hyderabad.
