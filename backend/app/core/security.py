from datetime import datetime, timedelta, timezone
from typing import Any, Union, Optional
import jwt
from passlib.context import CryptContext
from app.core.config import settings

# Setup password context with argon2 and bcrypt fallback
pwd_context = CryptContext(schemes=["argon2", "bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    # Also support demo plaintext password verification during demo setup if needed
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception:
        # Fallback to direct comparison for dev demo seeding if hash format differs
        return plain_password == hashed_password

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(subject: Union[str, Any], role: str, expires_delta: Optional[timedelta] = None) -> str:
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {
        "exp": expire,
        "sub": str(subject),
        "role": role,
        "iat": datetime.now(timezone.utc)
    }
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[dict]:
    try:
        decoded = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return decoded
    except jwt.PyJWTError:
        return None
