from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.core.security import verify_password, create_access_token
from app.models.models import User, Student, Faculty, AuditLog
from app.schemas.schemas import Token, LoginRequest, UserResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=Token)
def login(login_req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == login_req.username).first()
    if not user or not verify_password(login_req.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Account is inactive. Contact institutional administrator."
        )

    # Never trust user-selected role as proof; verify against actual database role
    if login_req.role_requested and login_req.role_requested != user.role:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"User is not authorized for requested role '{login_req.role_requested}'."
        )

    # Roll No / Faculty ID metadata
    roll_no = None
    faculty_id = None
    if user.role == "student":
        student = db.query(Student).filter(Student.user_id == user.id).first()
        if student:
            roll_no = student.roll_no
    elif user.role == "faculty":
        faculty = db.query(Faculty).filter(Faculty.user_id == user.id).first()
        if faculty:
            faculty_id = faculty.faculty_id

    access_token = create_access_token(subject=user.username, role=user.role)

    # Audit log login event
    log = AuditLog(
        user_id=user.id,
        action="USER_LOGIN",
        resource="auth",
        details=f"User {user.username} logged in successfully with role {user.role}."
    )
    db.add(log)
    db.commit()

    return Token(
        access_token=access_token,
        token_type="bearer",
        role=user.role,
        username=user.username,
        full_name=user.full_name,
        department=user.department,
        roll_no=roll_no,
        faculty_id=faculty_id
    )

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/logout")
def logout(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    log = AuditLog(
        user_id=current_user.id,
        action="USER_LOGOUT",
        resource="auth",
        details=f"User {current_user.username} logged out."
    )
    db.add(log)
    db.commit()
    return {"message": "Session terminated successfully"}

@router.get("/demo-credentials")
def get_demo_credentials():
    """
    Returns public demonstration user profiles for evaluation.
    Only shows synthetic demo usernames, roles, and descriptions.
    """
    return {
        "demo_accounts": [
            {
                "username": "21951A0501",
                "role": "student",
                "name": "K. Venkat Sai",
                "department": "CSE (Semester 7)",
                "description": "High distinction student (CGPA 8.78, 88.5% attendance)",
                "password_hint": "DemoPass@123"
            },
            {
                "username": "22951A6601",
                "role": "student",
                "name": "A. Sneha Reddy",
                "department": "AIML (Semester 5)",
                "description": "Top performer (CGPA 9.15, 92.4% attendance)",
                "password_hint": "DemoPass@123"
            },
            {
                "username": "22951A0542",
                "role": "student",
                "name": "R. Nikhil Kumar",
                "department": "CSE (Semester 5)",
                "description": "Student needing academic support (CGPA 6.84, 69.2% attendance)",
                "password_hint": "DemoPass@123"
            },
            {
                "username": "FAC001",
                "role": "faculty",
                "name": "Dr. K. Srinivas Rao",
                "department": "CSE (Professor & Head)",
                "description": "Assigned courses: Cloud Computing, Design & Analysis of Algorithms",
                "password_hint": "DemoPass@123"
            },
            {
                "username": "FAC002",
                "role": "faculty",
                "name": "Dr. M. Lakshmi",
                "department": "AIML (Associate Professor)",
                "description": "Assigned courses: Full Stack Development, DBMS",
                "password_hint": "DemoPass@123"
            },
            {
                "username": "ADMIN01",
                "role": "admin",
                "name": "Academic Admin Office",
                "department": "Academic Section",
                "description": "Full administrative control, data imports, system logs, configuration",
                "password_hint": "AdminPass@123"
            }
        ]
    }
