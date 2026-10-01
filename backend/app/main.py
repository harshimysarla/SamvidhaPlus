from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base
from app.api import (
    auth, students, faculty, academic_records,
    attendance, analytics, predictions, calendar_timetable,
    assignments, announcements, notifications, reports, imports, admin
)

# Initialize database schema tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Smart Academic Intelligence Portal (SAIP) - Samvidha-inspired college academic portal with performance analytics and predictive intelligence."
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins in development and preview
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API v1 Routers
api_v1_prefix = settings.API_V1_STR
app.include_router(auth.router, prefix=api_v1_prefix)
app.include_router(students.router, prefix=api_v1_prefix)
app.include_router(faculty.router, prefix=api_v1_prefix)
app.include_router(academic_records.router, prefix=api_v1_prefix)
app.include_router(attendance.router, prefix=api_v1_prefix)
app.include_router(analytics.router, prefix=api_v1_prefix)
app.include_router(predictions.router, prefix=api_v1_prefix)
app.include_router(calendar_timetable.router, prefix=api_v1_prefix)
app.include_router(assignments.router, prefix=api_v1_prefix)
app.include_router(announcements.router, prefix=api_v1_prefix)
app.include_router(notifications.router, prefix=api_v1_prefix)
app.include_router(reports.router, prefix=api_v1_prefix)
app.include_router(imports.router, prefix=api_v1_prefix)
app.include_router(admin.router, prefix=api_v1_prefix)

@app.get("/")
def root():
    return {
        "portal": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "institution": settings.INSTITUTION_NAME,
        "active_provider": settings.ACTIVE_DATA_PROVIDER,
        "docs_url": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "SAIP Backend API"}
