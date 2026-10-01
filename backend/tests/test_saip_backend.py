import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.security import create_access_token, verify_password, get_password_hash
from app.analytics.performance_index import PerformanceIndexEngine
from app.predictions.sgpa_estimator import SGPAEstimator
from app.predictions.cgpa_scenario import CGPAScenarioCalculator
from app.predictions.attendance_forecaster import AttendanceForecaster
from app.predictions.risk_detector import AcademicRiskDetector
from app.imports.validator import DataImportValidator
from app.integrations.official_api_provider import OfficialApiProvider

client = TestClient(app)

# 1. System Health & Info
def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    assert "Smart Academic Intelligence Portal" in response.json()["portal"]

# 2. Authentication Tests
def test_login_success_student():
    response = client.post("/api/v1/auth/login", json={
        "username": "21951A0501",
        "password": "DemoPass@123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["role"] == "student"
    assert data["username"] == "21951A0501"

def test_login_success_faculty():
    response = client.post("/api/v1/auth/login", json={
        "username": "FAC001",
        "password": "DemoPass@123"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["role"] == "faculty"

def test_login_success_admin():
    response = client.post("/api/v1/auth/login", json={
        "username": "ADMIN01",
        "password": "AdminPass@123"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["role"] == "admin"

def test_login_invalid_password():
    response = client.post("/api/v1/auth/login", json={
        "username": "21951A0501",
        "password": "WrongPassword!999"
    })
    assert response.status_code == 401

def test_login_fake_role_elevation_prevented():
    # Attempting to claim 'admin' role while supplying student credentials
    response = client.post("/api/v1/auth/login", json={
        "username": "21951A0501",
        "password": "DemoPass@123",
        "role_requested": "admin"
    })
    assert response.status_code == 403

# 3. Student Data Isolation Rule
def test_student_isolation_forbidden_cross_access():
    # Login as Student A (21951A0501)
    login_resp = client.post("/api/v1/auth/login", json={
        "username": "21951A0501",
        "password": "DemoPass@123"
    })
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Attempt to access Student B (22951A0542) private records
    cross_resp = client.get("/api/v1/students/22951A0542", headers=headers)
    assert cross_resp.status_code == 403
    assert "strictly restricted" in cross_resp.json()["detail"]

    # Student accessing own profile succeeds
    own_resp = client.get("/api/v1/students/21951A0501", headers=headers)
    assert own_resp.status_code == 200
    assert own_resp.json()["roll_no"] == "21951A0501"

# 4. Academic Calculations & Performance Index
def test_performance_index_calculation():
    engine = PerformanceIndexEngine()
    result = engine.calculate(
        cgpa=8.78,
        attendance_pct=88.5,
        theory_assessments=[{"internal_total": 38.0, "attendance_pct": 90.0}],
        lab_assessments=[{"internal_total": 39.0, "attendance_pct": 95.0}],
        semesters_history=[
            {"semester": 5, "sgpa": 8.70, "published": True},
            {"semester": 6, "sgpa": 8.90, "published": True}
        ],
        earned_credits=136.0,
        required_credits=160.0
    )
    assert result["index_score"] >= 80.0
    assert result["rating"] in ["Superior", "Exemplary"]
    assert len(result["components"]) == 5
    assert not result["is_partial"]

def test_performance_index_missing_data_reweighting():
    engine = PerformanceIndexEngine()
    # No semester history (missing trend component)
    result = engine.calculate(
        cgpa=8.5,
        attendance_pct=85.0,
        theory_assessments=[{"internal_total": 35.0, "attendance_pct": 85.0}],
        lab_assessments=[],
        semesters_history=[],
        earned_credits=20.0,
        required_credits=160.0
    )
    assert result["data_completeness_pct"] < 100.0
    # Missing trend does not break the calculation or silently inject zero penalty
    assert result["index_score"] > 70.0

# 5. Predictive Intelligence Tests
def test_sgpa_estimation_bounds():
    semesters = [
        {"semester": 1, "sgpa": 8.5, "published": True},
        {"semester": 2, "sgpa": 8.8, "published": True}
    ]
    courses = [
        {"credits": 3.0, "internal_total": 36.0},
        {"credits": 3.0, "internal_total": 38.0}
    ]
    est = SGPAEstimator.estimate(semesters, courses)
    assert 0.0 <= est["estimated_sgpa_min"] <= est["most_likely_sgpa"] <= est["estimated_sgpa_max"] <= 10.0
    assert "disclaimer" in est

def test_cgpa_scenario_simulator():
    res = CGPAScenarioCalculator.simulate(
        current_cgpa=8.5,
        earned_credits=100.0,
        next_credits=20.0,
        hypothetical_sgpa=9.5,
        target_cgpa=8.7
    )
    assert res["projected_cgpa"] > 8.5
    assert res["is_target_achievable"] is True
    assert len(res["scenario_trajectory"]) == 8

def test_attendance_forecaster_compliance():
    # Student currently at 60/90 (66.7% - below 75%)
    forecast = AttendanceForecaster.forecast(
        total_conducted=90,
        total_attended=60,
        upcoming_attend=10,
        upcoming_total=10
    )
    assert forecast["classes_needed_for_75"] > 0
    assert forecast["projected_percentage"] == 70.0 # 70/100 = 70.0%

# 6. Early Warning Academic Risk Detector
def test_risk_detector_flags_detention_risk():
    res = AcademicRiskDetector.evaluate(
        overall_attendance=62.5,  # Below 65%
        course_attendances=[{"course_name": "Operating Systems", "attendance_pct": 58.0}],
        theory_assessments=[{"course_name": "OS", "cie1": 9.0, "cie2": 4.0, "internal_total": 18.0}],
        pending_assignments_count=2
    )
    assert res["overall_risk_level"] == "AT_RISK"
    assert any(i["severity"] == "HIGH" for i in res["indicators"])

# 7. Data Import Validation
def test_data_import_validator_csv():
    csv_valid = (
        "roll_no,name,course_code,marks,attendance_pct\n"
        "21951A0501,K. Venkat Sai,ACSC31,88,92.5\n"
        "22951A6601,A. Sneha Reddy,ACSE14,94,96.0\n"
    )
    rows, summary = DataImportValidator.validate_csv(csv_valid)
    assert summary["total_rows"] == 2
    assert summary["valid_rows"] == 2
    assert summary["invalid_rows"] == 0
    assert summary["can_import"] is True

def test_data_import_validator_invalid_and_duplicates():
    csv_invalid = (
        "roll_no,name,course_code,marks,attendance_pct\n"
        ",No Roll No,ACSC31,88,92.5\n"
        "21951A0501,K. Venkat Sai,ACSC31,150,92.5\n" # Out of range marks
        "21951A0501,K. Venkat Sai,ACSC31,88,92.5\n" # Duplicate course
    )
    rows, summary = DataImportValidator.validate_csv(csv_invalid)
    assert summary["invalid_rows"] > 0
    assert summary["can_import"] is False

# 8. Integration Security Checks
def test_official_api_security_enforcement():
    # Official API without credentials must refuse to claim live status
    provider = OfficialApiProvider(base_url="", client_id="", api_secret="")
    assert provider.is_live_integration is False
    with pytest.raises(NotImplementedError):
        provider.get_student_profile("21951A0501")
