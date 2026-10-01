# SMART ACADEMIC INTELLIGENCE PORTAL (SAIP)
### Production-Grade Academic Portal with Multi-Factor Analytics & Predictive Intelligence
**Inspired by the Academic Engineering Design & Autonomous Workflows of IARE's Samvidha Portal (`samvidha.iare.ac.in`)**

---

## 1. Summary of Implemented Functionality

The **Smart Academic Intelligence Portal (SAIP)** is a complete, full-stack, enterprise-grade college academic management and performance intelligence system built from scratch. It is organized into three major layers:

### Layer 1 — Samvidha-Inspired Academic Portal
* **Student Academic Records**: Continuous Internal Evaluation (CIE) with exact autonomous marking schemes (CIE-I: 10, AAT-I-I: 5, AAT-I-II: 5, CIE-II: 10, AAT-II-I: 5, AAT-II-II: 5, Total: 40 marks).
* **Laboratory Practical Evaluations**: Continuous 14-week day-to-day evaluations (30 marks) and internal examination (10 marks).
* **Semester Progression Ledger**: Published & in-progress semester histories with SGPA, CGPA, and earned credits.
* **Degree Completion Audit**: Tracking mandatory curriculum requirements across 9 autonomous categories (Foundation, Core, Professional Elective, Open Elective, Project Work, Audit, Value Added, Field Project/Internship, DIP Courses).
* **Attendance Management**: Lecture-wise conducted vs. attended counts, percentage compliance, margin classes required to reach 75%, and safe missable classes buffer.
* **Timetable & Academic Calendar**: Daily/weekly schedule slots with classroom allocations, examination dates, symposia, and vacation schedules.
* **Continuous Coursework (AAT)**: Faculty assignment publishing and student submission tracking.
* **Personal Study Planner**: Student-managed revision milestones, target dates, and progress tracking kept strictly isolated from official academic records.
* **Academic Reports & Transcripts**: One-click generation of unofficial student academic portfolio summaries with instant CSV and print/PDF export.

### Layer 2 — Academic Performance Intelligence
* **Academic Performance Index (API)**: Weighted 0–100 academic health score computed on the backend.
* **Dynamic Reweighting for Missing Data**: Never injects false zeroes or misleading penalties when semester trends or internal marks are pending; calculates partial indices and publishes data completeness percentages.
* **Subject Comparative Analysis**: Strengths and areas needing attention across theory and lab courses.
* **Explainable Insights**: Each generated recommendation explains the observation, supporting records, educational significance, and recommended next steps.

### Layer 3 — Predictive Academic Intelligence
* **Bayesian SGPA Estimation**: Statistically bounded projection $[\text{SGPA}_{\min}, \text{SGPA}_{\max}]$ blending current continuous internal evaluations with historical student variance. Explicitly discloses assumptions, methodology, and limitations.
* **Interactive What-If CGPA Simulator**: Real-time slider recalculating projected cumulative grade points and verifying target milestone feasibility across hypothetical semester outcomes.
* **Attendance Forecaster**: Scenario simulator projecting future attendance percentages under varying upcoming attendance habits.
* **Academic Support Indicators**: Early warning flags identifying students needing mentoring support based on attendance (<75% or <65%) or assessment declines.

---

## 2. Architecture & Technology Stack

```
c:/wse/EduPulse/
├── backend/                  # FastAPI REST API & Analytics Engine
│   ├── app/
│   │   ├── analytics/        # Performance Index calculation engine
│   │   ├── api/              # REST API v1 endpoints
│   │   ├── core/             # Configuration, Database engine, Security
│   │   ├── imports/          # CSV validation & schema import
│   │   ├── integrations/     # Adapter-based AcademicDataProvider layer
│   │   ├── models/           # SQLAlchemy relational models
│   │   ├── predictions/      # SGPA estimation, what-if simulator, risk detector
│   │   ├── repositories/     # Database queries and audit logging
│   │   ├── schemas/          # Pydantic request/response schemas
│   │   └── main.py           # FastAPI entrypoint
│   ├── tests/                # Pytest automated test suite
│   ├── requirements.txt      # Python dependencies
│   └── seed_database.py      # Database seeder
├── frontend/                 # Next.js 14 App Router with TypeScript & Tailwind CSS
│   ├── app/                  # Pages: Student, Faculty, Admin, Records, Analytics, etc.
│   ├── components/           # Reusable UI, Navbars, Sidebar, Recharts charts
│   ├── lib/                  # Strongly-typed API client, utils, TypeScript types
│   └── package.json          # Node dependencies
├── demo-data/                # Structured synthetic Samvidha dataset (JSON)
├── docs/                     # System architecture & Samvidha live integration guide
└── deployment/               # Dockerfile, docker-compose, Vercel, and Render configs
```

### Technology Matrix
* **Frontend**: Next.js 14.2 (App Router), React 18, TypeScript 5, Tailwind CSS, Lucide React, Recharts, Framer Motion.
* **Backend**: Python 3.13, FastAPI, Pydantic v2, SQLAlchemy 2.0, Uvicorn, Pandas, NumPy, Scikit-learn.
* **Database**: SQLite (default local development with zero external dependencies) & PostgreSQL 16 (production).
* **Authentication**: Password hashing with Argon2id / bcrypt, JWT token signing, and role-based access control.

---

## 3. Database Schema Overview

```
                               ┌───────────────┐
                               │     users     │
                               └───────┬───────┘
                                       │ 1:1
                 ┌─────────────────────┴─────────────────────┐
                 ▼                                           ▼
          ┌─────────────┐                             ┌─────────────┐
          │  students   │                             │   faculty   │
          └──────┬──────┘                             └──────┬──────┘
                 │ 1:N                                       │ 1:N
     ┌───────────┼──────────────────────┐                    ▼
     ▼           ▼                      ▼             ┌─────────────┐
┌──────────┐┌──────────┐         ┌──────────────┐     │   courses   │
│  theory  ││   lab    │         │  semesters   │     └──────┬──────┘
│assessments││assessments        │   history    │            │ 1:N
└──────────┘└──────────┘         └──────────────┘            ▼
     │           │                      │             ┌─────────────┐
     └───────────┼──────────────────────┘             │ assignments │
                 ▼                                    └─────────────┘
          ┌──────────────┐                                   │ 1:N
          │pending_course│                                   ▼
          │requirements  │                            ┌─────────────┐
          └──────────────┘                            │ submissions │
                                                      └─────────────┘
```

* **Core Entities**: `User`, `Department`, `Student`, `Faculty`, `Course`, `TheoryAssessment` (CIE-I, CIE-II, AAT-I/II, Total), `LaboratoryAssessment` (14-week scores, day-to-day, exam), `SemesterResult`, `PendingCourse`, `TimetableEntry`, `Assignment`, `AssignmentSubmission`, `Announcement`, `CalendarEvent`, `Notification`, `PersonalStudyGoal`, `AuditLog`, `IntegrationConfig`.

---

## 4. Authentication & Authorization Design

1. **Cryptographic Password Hashing**: Passwords stored using **Argon2id** (memory-hard, resistant to GPU attacks).
2. **Signed JWT Tokens**: Tokens carry subject username, verified role, issuance time, and expiration timestamp.
3. **Client Role Distrust**: User-selected roles on the login screen are never trusted as proof of authorization; backend validates requested roles against database records before token issuance.
4. **Strict Student Data Isolation Rule**:
   * If an authenticated user has the `student` role, the backend dependency `verify_student_access` strictly forbids accessing records for any roll number other than their own (HTTP 403 Forbidden).
   * Verified by automated test: `test_student_isolation_forbidden_cross_access`.
5. **Faculty Scoping**: Faculty endpoints restrict class roster queries to assigned courses and departments.

---

## 5. Analytics & Prediction Methodology

### Academic Performance Index (API):
$$\text{API} = \frac{\sum_{i \in \text{Available}} w_i \cdot S_i}{\sum_{i \in \text{Available}} w_i}$$
* Academic Standing (CGPA): 40%
* Class Attendance: 20%
* Continuous Internal Evaluations: 20%
* Semester Progression Trend: 10%
* Degree Credit Progress: 10%
* If a metric is unavailable, its weight is eliminated and remaining weights are re-normalized to 100%.

### SGPA Estimation:
* Combines internal assessment scores normalized to the external examination scale with historical student performance stability ($\sigma$).
* Discloses assumptions, statistical limitations, and an explicit disclaimer that projections are unofficial planning estimates.

### Attendance Forecaster:
* Determines exact lecture margin needed to achieve compliance:
  $$x_{\text{needed}} = \max\left(0, \left\lceil \frac{0.75 \cdot C_{\text{conducted}} - C_{\text{attended}}}{0.25} \right\rceil\right)$$

---

## 6. Demonstration Accounts

The application includes synthetic demonstration accounts covering multiple branches, academic standing tiers, and roles:

| Username / Roll No | Role | Password | Description |
| :--- | :--- | :--- | :--- |
| **`21951A0501`** | Student | `DemoPass@123` | High Performer (B.Tech CSE, Sem 7, CGPA 8.78, 88.5% Attendance) |
| **`22951A0542`** | Student | `DemoPass@123` | Student Needing Support (B.Tech CSE, Sem 5, CGPA 6.84, 69.2% Attendance) |
| **`22951A6601`** | Student | `DemoPass@123` | Top Performer (B.Tech AIML, Sem 5, CGPA 9.15, 92.4% Attendance) |
| **`FAC001`** | Faculty | `DemoPass@123` | Dr. K. Srinivas Rao (Professor & HOD, CSE) |
| **`FAC002`** | Faculty | `DemoPass@123` | Dr. M. Lakshmi (Associate Professor, AIML) |
| **`ADMIN01`** | Admin | `AdminPass@123` | Academic Administration Office (Data imports & audit logs) |

*The login page also provides one-click demo credentials buttons for instant evaluation.*

---

## 7. Environment Variables Required

See `.env.example` at the repository root:

```env
# Backend
PROJECT_NAME="Smart Academic Intelligence Portal (SAIP)"
VERSION="1.0.0"
API_V1_STR="/api/v1"
SECRET_KEY="your-random-cryptographic-secret-key"
DATABASE_URL="sqlite:///./saip_database.db"
ACTIVE_DATA_PROVIDER="Demo Data"

# Frontend
NEXT_PUBLIC_API_URL="http://127.0.0.1:8000/api/v1"
```

---

## 8. Exact Steps to Run Frontend & Backend Locally

### Prerequisites
* Python 3.10+ (Tested on Python 3.13)
* Node.js 18+ (Tested on Node v24)
* npm 9+

### Step 1: Start the Backend (FastAPI)
```bash
# In directory: backend
cd backend

# Create & activate virtual environment (if not already created)
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Seed the database with demonstration records
python seed_database.py

# Run the FastAPI server
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
*Backend Interactive Swagger API Docs will be available at: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)*

### Step 2: Start the Frontend (Next.js)
```bash
# In directory: frontend
cd frontend

# Install dependencies (if not already installed)
npm install

# Run the development server
npm run dev
```
*Frontend Portal will be accessible at: [http://localhost:3000](http://localhost:3000)*

---

## 9. Deployment Procedure

### Option A: Full-Stack Docker Compose (Recommended for Local/Server Deployment)
```bash
docker-compose -f deployment/docker-compose.yml up --build -d
```
* Automatically starts PostgreSQL, runs migrations & seeding, launches the FastAPI API on port `8000`, and launches the Next.js frontend on port `3000`.

### Option B: Cloud Production Deployment
1. **Frontend on Vercel**:
   * Deploy `frontend/` directory to Vercel.
   * Configure environment variable `NEXT_PUBLIC_API_URL` to point to your live backend endpoint.
   * Uses `deployment/vercel.json` for proxy rewrites.
2. **Backend on Render / Railway / AWS ECS**:
   * Deploy `backend/` using `deployment/render.yaml` or `deployment/Dockerfile`.
   * Provision a managed PostgreSQL instance and set `DATABASE_URL`.
   * Set `SECRET_KEY` and run `python seed_database.py`.

---

## 10. Live Samvidha Authorization Requirements

The application uses an adapter pattern (`AcademicDataProvider`). Live synchronization with `samvidha.iare.ac.in` cannot operate until the institution grants official authorization:

### Prohibited Actions:
* No automated scraping of authenticated Samvidha pages.
* No headless browser password entry or CAPTCHA bypassing.
* No harvesting or storage of student/faculty university passwords.
* No fabrication of live API responses.

### Institutional Provisioning Required for Live Access:
1. Written approval from the Office of the Principal and Controller of Examinations (CoE).
2. Provisioning of a dedicated campus REST API gateway by College Systems Administration.
3. Issuance of mutual TLS client credentials and API keys (`OFFICIAL_API_CLIENT_ID`, `OFFICIAL_API_SECRET`).
*Detailed implementation instructions are documented in [`docs/SAMVIDHA_INTEGRATION_GUIDE.md`](docs/SAMVIDHA_INTEGRATION_GUIDE.md).*

---

## 11. Automated Tests Executed & Results

Automated backend unit and integration tests were executed using `pytest`:

```
backend/venv/Scripts/pytest backend/tests
```

### Test Results Summary:
* **Total Tests Executed**: 17
* **Passed**: 17
* **Failed**: 0
* **Execution Time**: 2.32 seconds

### Test Coverage Breakdown:
1. `test_health_check`: Backend health endpoint returns status 200.
2. `test_root_endpoint`: Root info endpoint returns correct portal name and version.
3. `test_login_success_student`: Verifies student authentication and JWT issuance.
4. `test_login_success_faculty`: Verifies faculty authentication and role resolution.
5. `test_login_success_admin`: Verifies admin authentication.
6. `test_login_invalid_password`: Confirms 401 Unauthorized on invalid passwords.
7. `test_login_fake_role_elevation_prevented`: Verifies that unauthorized role requests are rejected (403 Forbidden).
8. `test_student_isolation_forbidden_cross_access`: **Strict Student Data Isolation Rule** — verifies that Student A cannot query Student B's academic profile (403 Forbidden).
9. `test_performance_index_calculation`: Validates multi-factor Performance Index scoring and qualitative ratings.
10. `test_performance_index_missing_data_reweighting`: Validates that missing semester trends do not penalize the index with artificial zero substitution.
11. `test_sgpa_estimation_bounds`: Verifies bounded SGPA predictions $[0.0, 10.0]$ and methodology disclosures.
12. `test_cgpa_scenario_simulator`: Verifies What-If CGPA recalculation and target feasibility validation.
13. `test_attendance_forecaster_compliance`: Verifies attendance forecast calculations and compliance margin projections.
14. `test_risk_detector_flags_detention_risk`: Confirms detention risk flags when attendance is $<65\%$.
15. `test_data_import_validator_csv`: Tests valid CSV ingestion schema verification.
16. `test_data_import_validator_invalid_and_duplicates`: Validates rejection of out-of-bounds marks and duplicate entries.
17. `test_official_api_security_enforcement`: Confirms that `OfficialApiProvider` refuses live status without college credentials.

### Frontend Production Build:
* `npm run build` executed successfully without errors or type warnings, generating all 15 static and dynamic routes.

---

## 12. Remaining Limitations & Incomplete Features

1. **Live College Integration Pending Formal Authorization**: Real-time synchronization with `samvidha.iare.ac.in` requires official college API credentials. The application safely operates on structured synthetic demonstration data and authorized CSV imports.
2. **File Storage Backend for Assignment Uploads**: Student assignment uploads currently record submission metadata and filenames in the database; storage for large binary files in production should be connected to AWS S3, Cloudflare R2, or institutional MinIO object storage.
3. **Advanced Time-Series Deep Learning Models**: Predictions currently use Bayesian-adjusted regression and analytical What-If simulations. Complex neural forecasting (LSTM/Transformer) will require multi-year institutional student cohort data once approved by the university.
