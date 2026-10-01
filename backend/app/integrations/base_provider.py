from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional

class AcademicDataProvider(ABC):
    """
    Abstract Base Class for Academic Data Providers.
    Allows seamlessly switching data sources between:
    1. DemoDataProvider (Structured synthetic local dataset)
    2. AuthorizedImportProvider (User-uploaded institutional CSV/Excel/JSON imports)
    3. OfficialApiProvider (Future live Samvidha integration using official college credentials)
    """

    @property
    @abstractmethod
    def provider_name(self) -> str:
        """Name of the data provider (e.g. 'Demo Data', 'Authorized Import', 'Official API')"""
        pass

    @property
    @abstractmethod
    def is_live_integration(self) -> bool:
        """True only if an authorized official college API connection is verified and functioning"""
        pass

    @abstractmethod
    def get_student_profile(self, roll_no: str) -> Optional[Dict[str, Any]]:
        pass

    @abstractmethod
    def get_faculty_profile(self, faculty_id: str) -> Optional[Dict[str, Any]]:
        pass

    @abstractmethod
    def get_courses(self, department: Optional[str] = None, semester: Optional[int] = None) -> List[Dict[str, Any]]:
        pass

    @abstractmethod
    def get_attendance(self, roll_no: str, semester: Optional[int] = None) -> Dict[str, Any]:
        pass

    @abstractmethod
    def get_internal_assessments(self, roll_no: str, semester: Optional[int] = None) -> List[Dict[str, Any]]:
        pass

    @abstractmethod
    def get_laboratory_records(self, roll_no: str, semester: Optional[int] = None) -> List[Dict[str, Any]]:
        pass

    @abstractmethod
    def get_semester_results(self, roll_no: str) -> List[Dict[str, Any]]:
        pass

    @abstractmethod
    def get_grades_and_credits(self, roll_no: str) -> Dict[str, Any]:
        pass

    @abstractmethod
    def get_timetable(self, department: str, semester: int, section: str) -> List[Dict[str, Any]]:
        pass

    @abstractmethod
    def get_assignments(self, course_id: Optional[int] = None, student_roll_no: Optional[str] = None) -> List[Dict[str, Any]]:
        pass

    @abstractmethod
    def get_academic_calendar(self) -> List[Dict[str, Any]]:
        pass
