from typing import List, Dict
import os
from pydantic_settings import BaseSettings

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
DEFAULT_DB_FILE = os.path.join(ROOT_DIR, "saip_database.db").replace("\\", "/")

class Settings(BaseSettings):
    PROJECT_NAME: str = "SamvidhaPlus – AI-Powered Academic Intelligence Platform"
    TAGLINE: str = "Understand Your Performance. Predict Your Progress. Shape Your Future."
    VERSION: str = "2.0.0"
    API_V1_STR: str = "/api/v1"
    MODEL_VERSION: str = "v1.2.0-bayesian-reg"
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "smart-academic-intelligence-portal-dev-secret-key-super-secure-change-in-prod-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{DEFAULT_DB_FILE}")
    
    # Institution & College Info
    INSTITUTION_NAME: str = "Institute of Aeronautical Engineering (Autonomous)"
    INSTITUTION_SHORT_NAME: str = "IARE"
    SAMVIDHA_PORTAL_URL: str = "https://samvidha.iare.ac.in"
    
    # Integration Configuration
    ACTIVE_DATA_PROVIDER: str = os.getenv("ACTIVE_DATA_PROVIDER", "Demo Data")  # "Demo Data", "Authorized Import", "Official API"
    OFFICIAL_API_BASE_URL: str = os.getenv("OFFICIAL_API_BASE_URL", "")
    OFFICIAL_API_CLIENT_ID: str = os.getenv("OFFICIAL_API_CLIENT_ID", "")
    OFFICIAL_API_SECRET: str = os.getenv("OFFICIAL_API_SECRET", "")
    
    # Academic Rules & Thresholds
    ATTENDANCE_REGULAR_THRESHOLD: float = 75.0
    ATTENDANCE_CONDONATION_THRESHOLD: float = 65.0
    
    # Performance Index Weights (Sum = 1.0)
    PERFORMANCE_INDEX_WEIGHTS: Dict[str, float] = {
        "academic": 0.40,
        "attendance": 0.20,
        "internal": 0.20,
        "trend": 0.10,
        "credits": 0.10
    }
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000"
    ]

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
