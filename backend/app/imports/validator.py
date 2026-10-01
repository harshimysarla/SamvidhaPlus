import re
import csv
import io
import json
from typing import List, Dict, Any, Tuple

class DataImportValidator:
    """
    Validates institutional CSV or JSON datasets prior to database ingestion.
    Checks student roll numbers, course codes, marks ranges, and duplicate records.
    """

    ROLL_NO_PATTERN = re.compile(r"^[0-9]{2}[0-9A-Z]{3}[0-9A-Z]{5}$", re.IGNORECASE)
    COURSE_CODE_PATTERN = re.compile(r"^[A-Z]{3,4}[0-9]{2,3}$", re.IGNORECASE)

    @classmethod
    def validate_csv(cls, file_content: str) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
        reader = csv.DictReader(io.StringIO(file_content))
        rows = list(reader)
        
        preview_rows = []
        valid_count = 0
        invalid_count = 0
        seen_keys = set()

        for idx, row in enumerate(rows, start=1):
            roll_no = row.get("roll_no") or row.get("Roll Number") or row.get("Student ID") or ""
            name = row.get("name") or row.get("Name") or row.get("Student Name") or "Unknown"
            course_code = row.get("course_code") or row.get("Course") or row.get("Subject") or ""
            
            marks_raw = row.get("marks") or row.get("Total Marks") or row.get("Internal Marks") or None
            att_raw = row.get("attendance_pct") or row.get("Attendance") or None

            error_msgs = []
            
            # Roll number validation
            roll_no = roll_no.strip()
            if not roll_no:
                error_msgs.append("Missing Roll Number")
            
            # Course code validation
            course_code = course_code.strip()
            if not course_code:
                error_msgs.append("Missing Course Code")

            # Duplicate check within file
            key = (roll_no.upper(), course_code.upper())
            if key in seen_keys:
                error_msgs.append(f"Duplicate entry for {roll_no} in course {course_code}")
            else:
                seen_keys.add(key)

            # Marks range check
            marks = None
            if marks_raw is not None and marks_raw != "":
                try:
                    marks = float(marks_raw)
                    if marks < 0 or marks > 100:
                        error_msgs.append(f"Marks {marks} out of range [0-100]")
                except ValueError:
                    error_msgs.append(f"Invalid numeric value for marks: {marks_raw}")

            # Attendance percentage check
            att_pct = None
            if att_raw is not None and att_raw != "":
                try:
                    att_pct = float(att_raw)
                    if att_pct < 0 or att_pct > 100:
                        error_msgs.append(f"Attendance {att_pct}% out of range [0-100]")
                except ValueError:
                    error_msgs.append(f"Invalid numeric value for attendance: {att_raw}")

            is_valid = len(error_msgs) == 0
            if is_valid:
                valid_count += 1
            else:
                invalid_count += 1

            preview_rows.append({
                "row_number": idx,
                "roll_no": roll_no,
                "name": name,
                "course_code": course_code,
                "marks": marks,
                "attendance_pct": att_pct,
                "is_valid": is_valid,
                "validation_error": "; ".join(error_msgs) if error_msgs else None
            })

        summary = {
            "total_rows": len(rows),
            "valid_rows": valid_count,
            "invalid_rows": invalid_count,
            "can_import": invalid_count == 0 and valid_count > 0
        }

        return preview_rows, summary
