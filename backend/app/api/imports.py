from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.api.deps import get_db, require_role
from app.models.models import User
from app.imports.validator import DataImportValidator
from app.imports.importer import DataImporter
from app.schemas.schemas import DataImportSummary, DataImportPreviewRow

router = APIRouter(prefix="/imports", tags=["Data Import"])

@router.post("/preview-csv", response_model=DataImportSummary)
async def preview_csv_import(
    file: UploadFile = File(...),
    current_user: User = Depends(require_role(["admin", "faculty"])),
    db: Session = Depends(get_db)
):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported for import preview.")

    content_bytes = await file.read()
    try:
        content_str = content_bytes.decode("utf-8")
    except UnicodeDecodeError:
        content_str = content_bytes.decode("latin-1")

    preview_rows, summary = DataImportValidator.validate_csv(content_str)

    return DataImportSummary(
        file_name=file.filename,
        total_rows=summary["total_rows"],
        valid_rows=summary["valid_rows"],
        invalid_rows=summary["invalid_rows"],
        preview_sample=preview_rows[:20],  # Return up to 20 rows for preview
        can_import=summary["can_import"]
    )

@router.post("/commit")
def commit_import(
    rows: List[Dict[str, Any]],
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    importer = DataImporter(db)
    imported = importer.commit_imported_marks(rows, current_user.id)
    return {"message": f"Successfully imported {imported} academic records.", "records_imported": imported}
