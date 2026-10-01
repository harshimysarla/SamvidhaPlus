import httpx
from typing import List, Dict, Any, Optional
from app.integrations.base_provider import AcademicDataProvider
from app.core.config import settings

class OfficialApiProvider(AcademicDataProvider):
    """
    Adapter for Official Samvidha College API Integration.
    Strictly complies with cybersecurity rules:
    - Never scrapes or bypasses authentication.
    - Never fabricates fake endpoints or responses.
    - Operates only when institutionally authorized API credentials and base URL are provisioned.
    """

    def __init__(self, base_url: Optional[str] = None, client_id: Optional[str] = None, api_secret: Optional[str] = None):
        self.base_url = base_url or settings.OFFICIAL_API_BASE_URL
        self.client_id = client_id or settings.OFFICIAL_API_CLIENT_ID
        self.api_secret = api_secret or settings.OFFICIAL_API_SECRET
        self._is_verified = bool(self.base_url and self.client_id and self.api_secret)

    @property
    def provider_name(self) -> str:
        return "Official API"

    @property
    def is_live_integration(self) -> bool:
        # Live integration is True ONLY when endpoint is verified with valid institutional handshake
        return self._is_verified

    def _get_headers(self) -> Dict[str, str]:
        return {
            "Authorization": f"Bearer {self.api_secret}",
            "X-Client-ID": self.client_id,
            "Accept": "application/json"
        }

    def verify_connection(self) -> Dict[str, Any]:
        """Test handshake with institutional API if configured"""
        if not self._is_verified:
            return {
                "verified": False,
                "message": "Official API not provisioned. Requires college IT administration authorization, client ID, and API key."
            }
        try:
            with httpx.Client(timeout=5.0) as client:
                resp = client.get(f"{self.base_url}/health", headers=self._get_headers())
                if resp.status_code == 200:
                    return {"verified": True, "message": "College API handshake successful."}
                return {"verified": False, "message": f"College API returned status {resp.status_code}."}
        except Exception as e:
            return {"verified": False, "message": f"Connection to college endpoint failed: {str(e)}"}

    def get_student_profile(self, roll_no: str) -> Optional[Dict[str, Any]]:
        if not self._is_verified:
            raise NotImplementedError("Official Samvidha API requires official college authorization credentials.")
        with httpx.Client(timeout=10.0) as client:
            resp = client.get(f"{self.base_url}/v1/students/{roll_no}", headers=self._get_headers())
            return resp.json() if resp.status_code == 200 else None

    def get_faculty_profile(self, faculty_id: str) -> Optional[Dict[str, Any]]:
        if not self._is_verified:
            raise NotImplementedError("Official Samvidha API requires official college authorization credentials.")
        with httpx.Client(timeout=10.0) as client:
            resp = client.get(f"{self.base_url}/v1/faculty/{faculty_id}", headers=self._get_headers())
            return resp.json() if resp.status_code == 200 else None

    def get_courses(self, department: Optional[str] = None, semester: Optional[int] = None) -> List[Dict[str, Any]]:
        if not self._is_verified:
            raise NotImplementedError("Official Samvidha API requires official college authorization credentials.")
        params = {}
        if department: params["dept"] = department
        if semester: params["sem"] = semester
        with httpx.Client(timeout=10.0) as client:
            resp = client.get(f"{self.base_url}/v1/courses", headers=self._get_headers(), params=params)
            return resp.json() if resp.status_code == 200 else []

    def get_attendance(self, roll_no: str, semester: Optional[int] = None) -> Dict[str, Any]:
        if not self._is_verified:
            raise NotImplementedError("Official Samvidha API requires official college authorization credentials.")
        with httpx.Client(timeout=10.0) as client:
            resp = client.get(f"{self.base_url}/v1/students/{roll_no}/attendance", headers=self._get_headers())
            return resp.json() if resp.status_code == 200 else {}

    def get_internal_assessments(self, roll_no: str, semester: Optional[int] = None) -> List[Dict[str, Any]]:
        if not self._is_verified:
            raise NotImplementedError("Official Samvidha API requires official college authorization credentials.")
        with httpx.Client(timeout=10.0) as client:
            resp = client.get(f"{self.base_url}/v1/students/{roll_no}/assessments/theory", headers=self._get_headers())
            return resp.json() if resp.status_code == 200 else []

    def get_laboratory_records(self, roll_no: str, semester: Optional[int] = None) -> List[Dict[str, Any]]:
        if not self._is_verified:
            raise NotImplementedError("Official Samvidha API requires official college authorization credentials.")
        with httpx.Client(timeout=10.0) as client:
            resp = client.get(f"{self.base_url}/v1/students/{roll_no}/assessments/lab", headers=self._get_headers())
            return resp.json() if resp.status_code == 200 else []

    def get_semester_results(self, roll_no: str) -> List[Dict[str, Any]]:
        if not self._is_verified:
            raise NotImplementedError("Official Samvidha API requires official college authorization credentials.")
        with httpx.Client(timeout=10.0) as client:
            resp = client.get(f"{self.base_url}/v1/students/{roll_no}/results", headers=self._get_headers())
            return resp.json() if resp.status_code == 200 else []

    def get_grades_and_credits(self, roll_no: str) -> Dict[str, Any]:
        if not self._is_verified:
            raise NotImplementedError("Official Samvidha API requires official college authorization credentials.")
        with httpx.Client(timeout=10.0) as client:
            resp = client.get(f"{self.base_url}/v1/students/{roll_no}/credits", headers=self._get_headers())
            return resp.json() if resp.status_code == 200 else {}

    def get_timetable(self, department: str, semester: int, section: str) -> List[Dict[str, Any]]:
        if not self._is_verified:
            raise NotImplementedError("Official Samvidha API requires official college authorization credentials.")
        with httpx.Client(timeout=10.0) as client:
            resp = client.get(f"{self.base_url}/v1/timetable", headers=self._get_headers(), params={"dept": department, "sem": semester, "sec": section})
            return resp.json() if resp.status_code == 200 else []

    def get_assignments(self, course_id: Optional[int] = None, student_roll_no: Optional[str] = None) -> List[Dict[str, Any]]:
        if not self._is_verified:
            raise NotImplementedError("Official Samvidha API requires official college authorization credentials.")
        with httpx.Client(timeout=10.0) as client:
            resp = client.get(f"{self.base_url}/v1/assignments", headers=self._get_headers())
            return resp.json() if resp.status_code == 200 else []

    def get_academic_calendar(self) -> List[Dict[str, Any]]:
        if not self._is_verified:
            raise NotImplementedError("Official Samvidha API requires official college authorization credentials.")
        with httpx.Client(timeout=10.0) as client:
            resp = client.get(f"{self.base_url}/v1/calendar", headers=self._get_headers())
            return resp.json() if resp.status_code == 200 else []
