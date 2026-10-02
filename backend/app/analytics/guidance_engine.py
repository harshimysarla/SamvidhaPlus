from typing import List, Dict, Any, Optional
import uuid

class GuidanceEngine:
    """
    Actionable Academic Guidance Engine for SamvidhaPlus.
    Analyzes internal assessments, attendance compliance margins, and historical trends
    to generate grounded, personalized, non-punitive recommendations for students.
    """

    @staticmethod
    def generate_recommendations(
        student_roll: str,
        student_name: str,
        current_cgpa: float,
        attendance_overall: float,
        course_attendance: List[Dict[str, Any]],
        theory_assessments: List[Dict[str, Any]],
        lab_assessments: List[Dict[str, Any]],
        semester_history: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        recommendations = []

        # 1. Attendance Analysis & Recovery Plans
        for att in course_attendance:
            course_code = att.get("course_code", "Course")
            course_name = att.get("course_name", course_code)
            pct = float(att.get("percentage", 100.0))
            attended = int(att.get("classes_attended", 0))
            total = int(att.get("classes_conducted", 0))

            if pct < 65.0:
                # Severe detention risk
                needed_for_75 = max(0, int((0.75 * total - attended) / 0.25) + 1) if total > 0 else 5
                recommendations.append({
                    "id": f"REC-ATT-{course_code}",
                    "category": "ATTENDANCE",
                    "title": f"Critical Attendance Alert: {course_name}",
                    "observation": f"Current attendance is {pct:.1f}% ({attended}/{total} classes attended), which is below the 65% autonomous detention threshold.",
                    "why_it_matters": "Students with attendance below 65% are not eligible for semester-end examinations (SEE) and face course detention without condonation.",
                    "supporting_data": f"{pct:.1f}% attendance ({attended}/{total} attended)",
                    "recommended_action": f"Attend all remaining lectures consecutively. Minimum {needed_for_75} consecutive sessions needed. Submit formal medical/participation leaves to HOD immediately.",
                    "suggested_timeframe": "Immediate (Next 7 Days)",
                    "priority": "High",
                    "status": "Active"
                })
            elif 65.0 <= pct < 75.0:
                # Condonation danger zone
                needed_for_75 = max(0, int((0.75 * total - attended) / 0.25) + 1) if total > 0 else 3
                recommendations.append({
                    "id": f"REC-ATT-{course_code}",
                    "category": "ATTENDANCE",
                    "title": f"Attendance Recovery Plan: {course_name}",
                    "observation": f"Current attendance is {pct:.1f}%, situated in the condonation bracket (65%–75%).",
                    "why_it_matters": "Requires institutional condonation fee and approval to sit for end-semester exams if not raised above 75%.",
                    "supporting_data": f"{pct:.1f}% attendance ({attended}/{total} sessions)",
                    "recommended_action": f"Attend the next {needed_for_75} consecutive scheduled classes to safely reach 75.0% without incurring condonation requirements.",
                    "suggested_timeframe": "Next 2 Weeks",
                    "priority": "Medium",
                    "status": "Active"
                })

        # 2. Internal Assessment & Focus Areas (CIE / AAT / Labs)
        for t in theory_assessments:
            course_code = t.get("course_code", "Course")
            course_name = t.get("course_name", course_code)
            internal_total = float(t.get("internal_total", 40.0)) # Out of 40
            cie1 = float(t.get("cie1_marks", 10.0)) # Out of 10
            aat1 = float(t.get("aat1_marks", 5.0)) # Out of 5
            aat2 = float(t.get("aat2_marks", 5.0)) # Out of 5

            if internal_total < 28.0: # Less than 70% in internals
                recommendations.append({
                    "id": f"REC-REV-{course_code}",
                    "category": "REVISION",
                    "title": f"Targeted Internal Boost: {course_name}",
                    "observation": f"Cumulative internal marks are {internal_total:.1f}/40 ({round(internal_total/40.0*100, 1)}%). CIE-1 scored {cie1:.1f}/10.",
                    "why_it_matters": "Internal evaluations constitute 40% of the aggregate grade. High internals provide a safety buffer for external examinations.",
                    "supporting_data": f"Internal Score: {internal_total:.1f}/40 (CIE-1: {cie1:.1f}/10)",
                    "recommended_action": f"Focus on high-weightage Unit 3 & Unit 4 concepts for upcoming CIE-2. Consult subject faculty {t.get('faculty_name', '')} during tutorial hours.",
                    "suggested_timeframe": "Before CIE-II Exam",
                    "priority": "High" if internal_total < 24.0 else "Medium",
                    "status": "Active"
                })

            if aat1 < 3.5 or aat2 < 3.5:
                recommendations.append({
                    "id": f"REC-AAT-{course_code}",
                    "category": "REVISION",
                    "title": f"AAT/ACT Assignment Submission: {course_name}",
                    "observation": f"Alternative Assessment Tool (AAT) components have incomplete or low scores ({min(aat1, aat2):.1f}/5.0).",
                    "why_it_matters": "Continuous evaluation marks directly affect internal eligibility and cannot be retaken after term closure.",
                    "supporting_data": f"AAT-1: {aat1:.1f}/5, AAT-2: {aat2:.1f}/5",
                    "recommended_action": "Complete and upload pending tech talk / assignment rubrics on Samvidha portal before the deadline.",
                    "suggested_timeframe": "Next 5 Days",
                    "priority": "Medium",
                    "status": "Active"
                })

        # 3. Lab Practical Continuous Evaluation
        for lab in lab_assessments:
            course_code = lab.get("course_code", "Lab")
            course_name = lab.get("course_name", course_code)
            day_to_day = float(lab.get("day_to_day_marks", 30.0))
            internal_lab = float(lab.get("internal_exam_marks", 10.0))
            total_lab = day_to_day + internal_lab

            if total_lab < 30.0: # Out of 40
                recommendations.append({
                    "id": f"REC-LAB-{course_code}",
                    "category": "REVISION",
                    "title": f"Laboratory Continuous Evaluation Check: {course_name}",
                    "observation": f"Day-to-day continuous evaluation score is {day_to_day:.1f}/30.",
                    "why_it_matters": "Practical assessments test hands-on implementation and require complete record book sign-offs.",
                    "supporting_data": f"Continuous Eval: {day_to_day:.1f}/30, Total: {total_lab:.1f}/40",
                    "recommended_action": "Complete pending code executions and ensure observation notebooks are signed off by lab in-charge.",
                    "suggested_timeframe": "Before Next Practical Session",
                    "priority": "Medium",
                    "status": "Active"
                })

        # 4. Weekly Time Allocation Guidance
        # Identify highest credit course or lowest scoring subject
        if theory_assessments:
            sorted_by_marks = sorted(theory_assessments, key=lambda x: float(x.get("internal_total", 40.0)))
            lowest = sorted_by_marks[0]
            recommendations.append({
                "id": "REC-TIME-ALLOC-01",
                "category": "TIME_ALLOCATION",
                "title": f"Study Block Optimization: {lowest.get('course_name')}",
                "observation": f"Lowest current evaluation performance is in {lowest.get('course_name')} ({lowest.get('internal_total')}/40).",
                "why_it_matters": "Balancing study time between strong and challenging courses maximizes aggregate SGPA across all credits.",
                "supporting_data": f"Internal Score: {lowest.get('internal_total')}/40",
                "recommended_action": f"Allocate at least 4.5 dedicated study hours this week to {lowest.get('course_name')}. Break into 45-minute focused blocks.",
                "suggested_timeframe": "This Week",
                "priority": "Medium",
                "status": "Active"
            })

        # 5. Goal Setting & Milestone Guidance
        if current_cgpa > 0:
            target_bump = min(10.0, round(current_cgpa + 0.35, 2))
            recommendations.append({
                "id": "REC-GOAL-01",
                "category": "GOAL_SETTING",
                "title": f"Target CGPA Milestone: Reach {target_bump:.2f}",
                "observation": f"Cumulative CGPA currently stands at {current_cgpa:.2f}.",
                "why_it_matters": "Consistent increments of 0.3–0.4 in semester SGPA elevate cumulative standing into the next honors bracket.",
                "supporting_data": f"Current CGPA: {current_cgpa:.2f} → Target: {target_bump:.2f}",
                "recommended_action": f"Set a semester SGPA target of at least {min(10.0, round(current_cgpa + 0.5, 2)):.2f} in the What-If Simulator and plan weekly tasks accordingly.",
                "suggested_timeframe": "Semester Planning",
                "priority": "Low",
                "status": "Active"
            })

        # Ensure we always return structured recommendations
        return recommendations
