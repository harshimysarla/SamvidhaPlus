from typing import List, Dict, Any

class AcademicRiskDetector:
    """
    Transparent, non-judgmental early warning indicators for academic support.
    Focuses on institutional compliance thresholds and continuous evaluation trends.
    """

    @staticmethod
    def evaluate(
        overall_attendance: float,
        course_attendances: List[Dict[str, Any]],
        theory_assessments: List[Dict[str, Any]],
        pending_assignments_count: int = 0
    ) -> Dict[str, Any]:
        indicators = []
        highest_severity = "SAFE"

        # 1. Overall Attendance Check
        if overall_attendance < 65.0:
            highest_severity = "HIGH"
            indicators.append({
                "severity": "HIGH",
                "category": "ATTENDANCE",
                "title": "Critical Detention Risk",
                "details": f"Aggregate attendance is {overall_attendance:.1f}%, which is below the condonation threshold of 65%.",
                "threshold_breached": "Attendance < 65%",
                "action_suggested": "Immediate intervention required. Consult Faculty Advisor / HOD regarding official condonation procedures."
            })
        elif overall_attendance < 75.0:
            if highest_severity != "HIGH":
                highest_severity = "MEDIUM"
            indicators.append({
                "severity": "MEDIUM",
                "category": "ATTENDANCE",
                "title": "Condonation Bracket Alert",
                "details": f"Aggregate attendance is {overall_attendance:.1f}%, which is in the condonation bracket (65% - 74.9%).",
                "threshold_breached": "Attendance between 65% and 75%",
                "action_suggested": "Submit medical certificate or official duty leave documentation if applicable to qualify for condonation."
            })

        # 2. Subject-Specific Attendance Outliers
        for ca in course_attendances:
            pct = ca.get("attendance_pct", 0.0)
            c_name = ca.get("course_name", "Subject")
            if pct < 65.0:
                indicators.append({
                    "severity": "HIGH",
                    "category": "ATTENDANCE",
                    "title": f"Low Subject Attendance: {c_name}",
                    "details": f"Current attendance is {pct:.1f}% in {c_name}.",
                    "threshold_breached": "Course Attendance < 65%",
                    "action_suggested": f"Attend next {ca.get('margin_classes_to_75', 3)} consecutive classes in this subject."
                })

        # 3. Assessment Performance Checks
        for ta in theory_assessments:
            cie1 = ta.get("cie1", 0.0)
            cie2 = ta.get("cie2", 0.0)
            internal = ta.get("internal_total", 0.0)
            c_name = ta.get("course_name", "Course")
            # If CIE-II dropped significantly compared to CIE-I
            if cie1 > 0 and cie2 > 0 and (cie1 - cie2) >= 3.0:
                if highest_severity == "SAFE":
                    highest_severity = "MEDIUM"
                indicators.append({
                    "severity": "MEDIUM",
                    "category": "INTERNAL_MARKS",
                    "title": f"Assessment Decline: {c_name}",
                    "details": f"CIE-II ({cie2:.1f}/10) dropped significantly compared to CIE-I ({cie1:.1f}/10).",
                    "threshold_breached": "CIE Score Delta >= 3.0 marks",
                    "action_suggested": "Review specific units evaluated in CIE-II and request clarification from faculty."
                })
            # Low internal total (less than 20 out of 40)
            if internal > 0 and internal < 20.0:
                if highest_severity != "HIGH":
                    highest_severity = "MEDIUM"
                indicators.append({
                    "severity": "MEDIUM",
                    "category": "INTERNAL_MARKS",
                    "title": f"Low Internal Aggregate: {c_name}",
                    "details": f"Total internal marks are {internal:.1f}/40, below 50% threshold.",
                    "threshold_breached": "Internal Total < 20/40",
                    "action_suggested": "Complete all Alternative Assessment Tasks (AAT) with maximum diligence to recoup points."
                })

        # 4. Incomplete Assignments
        if pending_assignments_count > 0:
            indicators.append({
                "severity": "LOW",
                "category": "ASSIGNMENTS",
                "title": f"{pending_assignments_count} Pending Assignment(s)",
                "details": f"You have {pending_assignments_count} active course assignments approaching deadlines.",
                "threshold_breached": "Unsubmitted coursework",
                "action_suggested": "Submit pending assignments before due dates to secure internal AAT marks."
            })

        overall_level = "SAFE"
        if any(i["severity"] == "HIGH" for i in indicators):
            overall_level = "AT_RISK"
        elif any(i["severity"] == "MEDIUM" for i in indicators):
            overall_level = "MONITOR"

        return {
            "overall_risk_level": overall_level,
            "indicators": indicators,
            "disclaimer": "Academic support indicators are non-punitive notifications designed solely to assist students and mentors with timely guidance."
        }
