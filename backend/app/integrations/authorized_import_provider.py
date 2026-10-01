from typing import List, Dict, Any, Optional
from app.integrations.base_provider import AcademicDataProvider

class AuthorizedImportProvider(AcademicDataProvider):
    """
    Adapter reading from institution-approved imported records (CSV/Excel/JSON files
    imported via the Administrative Import Module and stored in the database).
    """

    def __init__(self, db_session=None):
        self.db = db_session

    @property
    def provider_name(self) -> str:
        return "Authorized Import"

    @property
    def is_live_integration(self) -> bool:
        return False

    def get_student_profile(self, roll_no: str) -> Optional[Dict[str, Any]]:
        # Read from database repository
        from app.repositories.academic_repo import AcademicRepository
        if self.db:
            repo = AcademicRepository(self.db)
            student = repo.get_student_by_roll_no(roll_no)
            if student:
                return {
                    "roll_no": student.roll_no,
                    "name": student.user.full_name if student.user else student.roll_no,
                    "department": student.department,
                    "branch": student.branch,
                    "section": student.section,
                    "regulation": student.regulation,
                    "academic_year": student.academic_year,
                    "current_semester": student.current_semester,
                    "enrollment_status": student.enrollment_status,
                    "cgpa": student.cgpa,
                    "total_credits_earned": student.total_credits_earned,
                    "total_credits_required": student.total_credits_required,
                    "overall_attendance_percentage": student.overall_attendance_percentage,
                }
        return None

    def get_faculty_profile(self, faculty_id: str) -> Optional[Dict[str, Any]]:
        from app.repositories.academic_repo import AcademicRepository
        if self.db:
            repo = AcademicRepository(self.db)
            f = repo.get_faculty_by_id(faculty_id)
            if f:
                return {
                    "faculty_id": f.faculty_id,
                    "name": f.name,
                    "department": f.department,
                    "designation": f.designation,
                    "email": f.email,
                }
        return None

    def get_courses(self, department: Optional[str] = None, semester: Optional[int] = None) -> List[Dict[str, Any]]:
        from app.repositories.academic_repo import AcademicRepository
        if self.db:
            repo = AcademicRepository(self.db)
            return repo.get_all_courses(department=department, semester=semester)
        return []

    def get_attendance(self, roll_no: str, semester: Optional[int] = None) -> Dict[str, Any]:
        from app.repositories.academic_repo import AcademicRepository
        if self.db:
            repo = AcademicRepository(self.db)
            return repo.get_attendance_summary(roll_no)
        return {"overall_percentage": 0.0, "total_conducted": 0, "total_attended": 0, "courses": []}

    def get_internal_assessments(self, roll_no: str, semester: Optional[int] = None) -> List[Dict[str, Any]]:
        from app.repositories.academic_repo import AcademicRepository
        if self.db:
            repo = AcademicRepository(self.db)
            return repo.get_theory_assessments(roll_no, semester=semester)
        return []

    def get_laboratory_records(self, roll_no: str, semester: Optional[int] = None) -> List[Dict[str, Any]]:
        from app.repositories.academic_repo import AcademicRepository
        if self.db:
            repo = AcademicRepository(self.db)
            return repo.get_lab_assessments(roll_no, semester=semester)
        return []

    def get_semester_results(self, roll_no: str) -> List[Dict[str, Any]]:
        from app.repositories.academic_repo import AcademicRepository
        if self.db:
            repo = AcademicRepository(self.db)
            return repo.get_semester_history(roll_no)
        return []

    def get_grades_and_credits(self, roll_no: str) -> Dict[str, Any]:
        from app.repositories.academic_repo import AcademicRepository
        if self.db:
            repo = AcademicRepository(self.db)
            return repo.get_credit_summary(roll_no)
        return {"cgpa": 0.0, "earned_credits": 0, "required_credits": 160}

    def get_timetable(self, department: str, semester: int, section: str) -> List[Dict[str, Any]]:
        from app.repositories.academic_repo import AcademicRepository
        if self.db:
            repo = AcademicRepository(self.db)
            return repo.get_timetable(department, semester, section)
        return []

    def get_assignments(self, course_id: Optional[int] = None, student_roll_no: Optional[str] = None) -> List[Dict[str, Any]]:
        from app.repositories.academic_repo import AcademicRepository
        if self.db:
            repo = AcademicRepository(self.db)
            return repo.get_assignments(student_roll_no=student_roll_no)
        return []

    def get_academic_calendar(self) -> List[Dict[str, Any]]:
        from app.repositories.academic_repo import AcademicRepository
        if self.db:
            repo = AcademicRepository(self.db)
            return repo.get_calendar_events()
        return []
