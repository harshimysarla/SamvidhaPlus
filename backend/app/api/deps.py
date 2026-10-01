from typing import Generator, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
import jwt
from app.core.config import settings
from app.core.database import SessionLocal
from app.core.security import decode_access_token
from app.models.models import User, Student, Faculty

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login", auto_error=False)

def get_db() -> Generator:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(token: Optional[str] = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials or session expired",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        raise credentials_exception

    payload = decode_access_token(token)
    if not payload:
        raise credentials_exception

    username: str = payload.get("sub")
    if not username:
        raise credentials_exception

    user = db.query(User).filter(User.username == username).first()
    if not user or not user.is_active:
        raise credentials_exception

    return user

def require_role(allowed_roles: list[str]):
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access forbidden: requires one of roles {allowed_roles}"
            )
        return current_user
    return role_checker

def verify_student_access(roll_no: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Strict Student Data Isolation Rule:
    - If user is a Student, they can ONLY access their own roll_no.
    - If user is Faculty or Admin, they may access student records within authorized scope.
    """
    if current_user.role == "student":
        student = db.query(Student).filter(Student.user_id == current_user.id).first()
        if not student or student.roll_no != roll_no:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: Students are strictly restricted to their own academic records."
            )
    return current_user
