import json
import os
from typing import List, Dict, Any, Optional
from app.integrations.base_provider import AcademicDataProvider

DEMO_DATA_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "demo-data", "samvidha_demo_dataset.json")

class DemoDataProvider(AcademicDataProvider):
    """
    Adapter reading from local structured synthetic Samvidha demonstration dataset.
    Never fabricates live API responses and clearly identifies itself as Demo Data.
    """

    def __init__(self):
        self._data = {}
        if os.path.exists(DEMO_DATA_PATH):
            with open(DEMO_DATA_PATH, "r", encoding="utf-8") as f:
                self._data = json.load(f)

    @property
    def provider_name(self) -> str:
        return "Demo Data"

    @property
    def is_live_integration(self) -> bool:
        return False

    def get_student_profile(self, roll_no: str) -> Optional[Dict[str, Any]]:
        students = self._data.get("students", [])
        for s in students:
            if s.get("roll_no") == roll_no:
                return s
        return None

    def get_faculty_profile(self, faculty_id: str) -> Optional[Dict[str, Any]]:
        users = self._data.get("users", [])
        for u in users:
            if u.get("role") == "faculty" and u.get("username") == faculty_id:
                return u
        return None

    def get_courses(self, department: Optional[str] = None, semester: Optional[int] = None) -> List[Dict[str, Any]]:
        courses = []
        for s in self._data.get("current_courses_detail", []):
            for c in s.get("courses", []):
                courses.append(c)
        return courses

    def get_attendance(self, roll_no: str, semester: Optional[int] = None) -> Dict[str, Any]:
        student = self.get_student_profile(roll_no)
        courses_list = []
        for s in self._data.get("current_courses_detail", []):
            if s.get("roll_no") == roll_no:
                courses_list = s.get("courses", [])
                break
        
        total_conducted = sum(c.get("classes_conducted", 0) for c in courses_list)
        total_attended = sum(c.get("classes_attended", 0) for c in courses_list)
        pct = (total_attended / total_conducted * 100) if total_conducted > 0 else (student.get("overall_attendance_percentage", 0.0) if student else 0.0)
        
        return {
            "overall_percentage": round(pct, 2),
            "total_conducted": total_conducted,
            "total_attended": total_attended,
            "courses": courses_list
        }

    def get_internal_assessments(self, roll_no: str, semester: Optional[int] = None) -> List[Dict[str, Any]]:
        for s in self._data.get("current_courses_detail", []):
            if s.get("roll_no") == roll_no:
                return [c for c in s.get("courses", []) if c.get("type") in ["Theory", "Project"]]
        return []

    def get_laboratory_records(self, roll_no: str, semester: Optional[int] = None) -> List[Dict[str, Any]]:
        for s in self._data.get("current_courses_detail", []):
            if s.get("roll_no") == roll_no:
                return [c for c in s.get("courses", []) if c.get("type") == "Laboratory"]
        return []

    def get_semester_results(self, roll_no: str) -> List[Dict[str, Any]]:
        for s in self._data.get("semesters_history", []):
            if s.get("roll_no") == roll_no:
                return s.get("semesters", [])
        return []

    def get_grades_and_credits(self, roll_no: str) -> Dict[str, Any]:
        results = self.get_semester_results(roll_no)
        student = self.get_student_profile(roll_no)
        earned = student.get("total_credits_earned", 0) if student else sum(r.get("credits_earned", 0) for r in results if r.get("published"))
        required = student.get("total_credits_required", 160) if student else 160
        cgpa = student.get("cgpa", 0.0) if student else 0.0
        return {
            "cgpa": cgpa,
            "earned_credits": earned,
            "required_credits": required,
            "grade_scale": self._data.get("grade_scale", [])
        }

    def get_timetable(self, department: str, semester: int, section: str) -> List[Dict[str, Any]]:
        for t in self._data.get("timetable_entries", []):
            if t.get("department") == department and t.get("semester") == semester and t.get("section") == section:
                return t.get("schedule", [])
        # Fallback to first available timetable
        entries = self._data.get("timetable_entries", [])
        return entries[0].get("schedule", []) if entries else []

    def get_assignments(self, course_id: Optional[int] = None, student_roll_no: Optional[str] = None) -> List[Dict[str, Any]]:
        return self._data.get("assignments", [])

    def get_academic_calendar(self) -> List[Dict[str, Any]]:
        return self._data.get("calendar_events", [])
