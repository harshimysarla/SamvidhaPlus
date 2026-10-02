from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.models.models import User, Student, StudentPreference
from app.schemas.schemas import StudentPreferenceResponse, StudentPreferenceUpdate

router = APIRouter(prefix="/preferences", tags=["Student Preferences"])

@router.get("/me", response_model=StudentPreferenceResponse)
def get_my_preferences(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Preferences are only configured for student profiles."
        )

    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    pref = db.query(StudentPreference).filter(StudentPreference.student_id == student.id).first()
    if not pref:
        pref = StudentPreference(
            student_id=student.id,
            email_alerts_enabled=True,
            attendance_warning_threshold=75.0,
            mentoring_visibility_consent=True,
            ai_guidance_enabled=True,
            dark_mode=False
        )
        db.add(pref)
        db.commit()
        db.refresh(pref)

    return pref

@router.patch("/me", response_model=StudentPreferenceResponse)
def update_my_preferences(
    pref_update: StudentPreferenceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Preferences are only configured for student profiles."
        )

    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    pref = db.query(StudentPreference).filter(StudentPreference.student_id == student.id).first()
    if not pref:
        pref = StudentPreference(student_id=student.id)
        db.add(pref)

    if pref_update.email_alerts_enabled is not None:
        pref.email_alerts_enabled = pref_update.email_alerts_enabled
    if pref_update.attendance_warning_threshold is not None:
        pref.attendance_warning_threshold = pref_update.attendance_warning_threshold
    if pref_update.mentoring_visibility_consent is not None:
        pref.mentoring_visibility_consent = pref_update.mentoring_visibility_consent
    if pref_update.ai_guidance_enabled is not None:
        pref.ai_guidance_enabled = pref_update.ai_guidance_enabled
    if pref_update.dark_mode is not None:
        pref.dark_mode = pref_update.dark_mode

    db.commit()
    db.refresh(pref)
    return pref
