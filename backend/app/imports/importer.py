from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.models import Student, Course, TheoryAssessment, AuditLog

class DataImporter:
    """
    Safely commits validated rows to the database within an atomic transaction.
    """

    def __init__(self, db: Session):
        self.db = db

    def commit_imported_marks(self, valid_rows: List[Dict[str, Any]], user_id: int) -> int:
        imported_count = 0
        try:
            for r in valid_rows:
                if not r.get("is_valid"):
                    continue

                roll_no = r["roll_no"]
                course_code = r["course_code"]
                marks = r.get("marks", 0.0) or 0.0
                att_pct = r.get("attendance_pct", 85.0) or 85.0

                student = self.db.query(Student).filter(Student.roll_no == roll_no).first()
                if not student:
                    continue

                course = self.db.query(Course).filter(Course.code == course_code).first()
                if not course:
                    continue

                # Find or create TheoryAssessment
                assessment = self.db.query(TheoryAssessment).filter(
                    TheoryAssessment.student_id == student.id,
                    TheoryAssessment.course_id == course.id
                ).first()

                if not assessment:
                    assessment = TheoryAssessment(
                        student_id=student.id,
                        course_id=course.id,
                        semester=course.semester,
                        cie1=min(10.0, marks * 0.25),
                        aat1_1=5.0,
                        aat1_2=4.5,
                        cie2=min(10.0, marks * 0.25),
                        aat2_1=4.5,
                        aat2_2=5.0,
                        internal_total=min(40.0, marks * 0.4),
                        attendance_pct=att_pct,
                        classes_conducted=40,
                        classes_attended=int(40 * (att_pct / 100.0)),
                        status="Imported"
                    )
                    self.db.add(assessment)
                else:
                    assessment.internal_total = min(40.0, marks * 0.4)
                    assessment.attendance_pct = att_pct
                    assessment.status = "Imported"

                imported_count += 1

            # Log to audit trail
            log = AuditLog(
                user_id=user_id,
                action="DATA_IMPORT",
                resource="assessments",
                details=f"Successfully imported {imported_count} academic assessment records."
            )
            self.db.add(log)
            self.db.commit()
            return imported_count
        except Exception as e:
            self.db.rollback()
            raise e
