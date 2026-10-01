from typing import Dict, Any, List, Optional
from app.core.config import settings

class PerformanceIndexEngine:
    """
    Centralized academic analytics service calculating the Academic Performance Index (API).
    Formula:
      Academic Performance (40%): normalized CGPA or published marks (CGPA / 10.0 * 100)
      Attendance (20%): overall attended classes / conducted classes * 100
      Internal Assessment (20%): average score across active CIE & AAT components normalized to 100 (Internal Total / 40.0 * 100)
      Semester Trend (10%): delta between latest published SGPA and previous SGPA, normalized (base 75 + delta * 15, clamped 0-100)
      Credit Completion (10%): earned credits / required credits * 100

    Missing Data Policy:
      - If a component has no records, it is flagged as 'Missing' or 'Partial'.
      - Weights of available components are re-normalized to sum to 1.0.
      - Never silently substitutes zero to avoid artificial penalties.
    """

    def __init__(self, weights: Optional[Dict[str, float]] = None):
        self.weights = weights or settings.PERFORMANCE_INDEX_WEIGHTS

    def calculate(
        self,
        cgpa: float,
        attendance_pct: float,
        theory_assessments: List[Dict[str, Any]],
        lab_assessments: List[Dict[str, Any]],
        semesters_history: List[Dict[str, Any]],
        earned_credits: float,
        required_credits: float = 160.0
    ) -> Dict[str, Any]:
        components = []
        available_weights_sum = 0.0
        weighted_score_accum = 0.0
        insights = []

        # 1. Academic Performance (40%)
        if cgpa > 0:
            acad_score = min(100.0, max(0.0, (cgpa / 10.0) * 100.0))
            w = self.weights.get("academic", 0.40)
            components.append({
                "name": "Academic Performance (CGPA)",
                "weight": w,
                "score": round(acad_score, 1),
                "max_score": 100.0,
                "status": "Available",
                "description": f"Computed from cumulative grade point average ({cgpa:.2f}/10.0)."
            })
            available_weights_sum += w
            weighted_score_accum += acad_score * w
            if cgpa >= 8.5:
                insights.append({
                    "type": "strength",
                    "title": "Strong Cumulative Standing",
                    "observation": f"Current CGPA is {cgpa:.2f}, placing performance in the high distinction tier.",
                    "supporting_data": f"CGPA: {cgpa:.2f}",
                    "significance": "Demonstrates consistent mastery across completed semesters.",
                    "recommended_action": "Maintain project depth and aim for top honors in final semester electives."
                })
            elif cgpa < 7.0:
                insights.append({
                    "type": "warning",
                    "title": "Cumulative Improvement Needed",
                    "observation": f"Current CGPA is {cgpa:.2f}, below first-class threshold (7.0).",
                    "supporting_data": f"CGPA: {cgpa:.2f}",
                    "significance": "Eligibility for premier campus placements generally requires CGPA >= 7.0.",
                    "recommended_action": "Focus on high-credit core theory subjects to maximize SGPA in upcoming exams."
                })
        else:
            components.append({
                "name": "Academic Performance (CGPA)",
                "weight": self.weights.get("academic", 0.40),
                "score": 0.0,
                "max_score": 100.0,
                "status": "Missing",
                "description": "No published semester grade records available yet."
            })

        # 2. Attendance (20%)
        if attendance_pct > 0:
            att_score = min(100.0, max(0.0, attendance_pct))
            w = self.weights.get("attendance", 0.20)
            components.append({
                "name": "Class Attendance",
                "weight": w,
                "score": round(att_score, 1),
                "max_score": 100.0,
                "status": "Available",
                "description": f"Aggregate classroom presence ({attendance_pct:.1f}%)."
            })
            available_weights_sum += w
            weighted_score_accum += att_score * w

            if attendance_pct >= 85.0:
                insights.append({
                    "type": "strength",
                    "title": "Excellent Attendance Consistency",
                    "observation": f"Overall attendance stands at {attendance_pct:.1f}%, comfortably above the 75% requirement.",
                    "supporting_data": f"Overall Attendance: {attendance_pct:.1f}%",
                    "significance": "High attendance directly correlates with superior internal test scores.",
                    "recommended_action": "Continue regular attendance; you have a safe buffer for unforeseen absences."
                })
            elif attendance_pct < 75.0:
                insights.append({
                    "type": "warning",
                    "title": "Attendance Shortage Alert",
                    "observation": f"Overall attendance is {attendance_pct:.1f}%, falling below the university mandatory 75% threshold.",
                    "supporting_data": f"Current Attendance: {attendance_pct:.1f}% (Minimum: 75%)",
                    "significance": "Risk of detention from semester-end theory and practical examinations unless condonation is granted.",
                    "recommended_action": "Attend all upcoming lectures consecutively without fail to restore compliance."
                })
        else:
            components.append({
                "name": "Class Attendance",
                "weight": self.weights.get("attendance", 0.20),
                "score": 0.0,
                "max_score": 100.0,
                "status": "Missing",
                "description": "No attendance records recorded for the current term."
            })

        # 3. Internal Assessment (20%)
        all_internals = []
        for t in theory_assessments:
            score = t.get("internal_total", 0.0)
            # max is 40 in Samvidha scheme
            all_internals.append((score / 40.0) * 100.0)
        for l in lab_assessments:
            score = l.get("internal_total", 0.0)
            all_internals.append((score / 40.0) * 100.0)

        if all_internals:
            avg_internal = sum(all_internals) / len(all_internals)
            int_score = min(100.0, max(0.0, avg_internal))
            w = self.weights.get("internal", 0.20)
            components.append({
                "name": "Internal Assessments (CIE & AAT)",
                "weight": w,
                "score": round(int_score, 1),
                "max_score": 100.0,
                "status": "Available",
                "description": f"Average across {len(all_internals)} active courses normalized to 100 scale."
            })
            available_weights_sum += w
            weighted_score_accum += int_score * w

            if avg_internal >= 80.0:
                insights.append({
                    "type": "strength",
                    "title": "Strong Internal Assessment Marks",
                    "observation": f"Internal continuous evaluation average is {avg_internal:.1f}%.",
                    "supporting_data": f"Assessed across {len(all_internals)} theory and laboratory courses.",
                    "significance": "Builds a high scoring baseline before end-semester examinations.",
                    "recommended_action": "Maintain revision cadence to translate high internals into S and A+ grades."
                })
            elif avg_internal < 60.0:
                insights.append({
                    "type": "warning",
                    "title": "Continuous Evaluation Needs Focus",
                    "observation": f"Internal average is {avg_internal:.1f}%, indicating vulnerability in CIE-I/II or AAT tasks.",
                    "supporting_data": f"Internal Average: {avg_internal:.1f}%",
                    "significance": "Lower internal marks reduce overall grade potential in final semester grading.",
                    "recommended_action": "Consult course faculty for remedial assignments or re-tests where permitted."
                })
        else:
            components.append({
                "name": "Internal Assessments (CIE & AAT)",
                "weight": self.weights.get("internal", 0.20),
                "score": 0.0,
                "max_score": 100.0,
                "status": "Missing",
                "description": "No continuous internal evaluation marks recorded yet."
            })

        # 4. Semester Trend (10%)
        published_semesters = [s for s in semesters_history if s.get("published") and s.get("sgpa") is not None]
        if len(published_semesters) >= 2:
            latest = published_semesters[-1]["sgpa"]
            prev = published_semesters[-2]["sgpa"]
            delta = latest - prev
            # Base 75 points, delta * 20 scaled between 0 and 100
            trend_score = min(100.0, max(0.0, 75.0 + (delta * 20.0)))
            w = self.weights.get("trend", 0.10)
            components.append({
                "name": "Semester Progression Trend",
                "weight": w,
                "score": round(trend_score, 1),
                "max_score": 100.0,
                "status": "Available",
                "description": f"Evaluated from SGPA trajectory: Sem {published_semesters[-2]['semester']} ({prev:.2f}) -> Sem {published_semesters[-1]['semester']} ({latest:.2f})."
            })
            available_weights_sum += w
            weighted_score_accum += trend_score * w

            if delta > 0.3:
                insights.append({
                    "type": "trend",
                    "title": "Positive Academic Momentum",
                    "observation": f"SGPA improved by +{delta:.2f} points in the latest published semester.",
                    "supporting_data": f"From {prev:.2f} to {latest:.2f}",
                    "significance": "Shows progressive academic adaptation and effective study adjustments.",
                    "recommended_action": "Carry forward identical study planning techniques into the current semester."
                })
            elif delta < -0.3:
                insights.append({
                    "type": "warning",
                    "title": "Semester Dip Detected",
                    "observation": f"SGPA decreased by {abs(delta):.2f} points between Sem {published_semesters[-2]['semester']} and Sem {published_semesters[-1]['semester']}.",
                    "supporting_data": f"From {prev:.2f} down to {latest:.2f}",
                    "significance": "Indicates increased curriculum difficulty or insufficient exam preparation time.",
                    "recommended_action": "Identify specific courses where grades dropped to allocate more study hours."
                })
        elif len(published_semesters) == 1:
            w = self.weights.get("trend", 0.10)
            components.append({
                "name": "Semester Progression Trend",
                "weight": w,
                "score": 75.0, # Neutral baseline
                "max_score": 100.0,
                "status": "Partial",
                "description": "Baseline assigned; requires at least 2 completed semesters for longitudinal trend."
            })
            available_weights_sum += w
            weighted_score_accum += 75.0 * w
        else:
            components.append({
                "name": "Semester Progression Trend",
                "weight": self.weights.get("trend", 0.10),
                "score": 0.0,
                "max_score": 100.0,
                "status": "Missing",
                "description": "Insufficient published semesters for trajectory computation."
            })

        # 5. Credit Completion (10%)
        if required_credits > 0:
            cred_score = min(100.0, max(0.0, (earned_credits / required_credits) * 100.0))
            w = self.weights.get("credits", 0.10)
            components.append({
                "name": "Degree Credit Progress",
                "weight": w,
                "score": round(cred_score, 1),
                "max_score": 100.0,
                "status": "Available",
                "description": f"{earned_credits:.1f} credits earned out of {required_credits:.1f} degree total."
            })
            available_weights_sum += w
            weighted_score_accum += cred_score * w
        else:
            components.append({
                "name": "Degree Credit Progress",
                "weight": self.weights.get("credits", 0.10),
                "score": 0.0,
                "max_score": 100.0,
                "status": "Missing",
                "description": "Degree credit requirements not configured."
            })

        # Normalize total score based on available weights to prevent artificial penalization
        is_partial = available_weights_sum < 0.99
        data_completeness_pct = round(available_weights_sum * 100.0, 1)

        if available_weights_sum > 0:
            final_index = round(weighted_score_accum / available_weights_sum, 1)
        else:
            final_index = 0.0

        # Qualitative Rating
        if final_index >= 88.0:
            rating = "Exemplary"
        elif final_index >= 75.0:
            rating = "Superior"
        elif final_index >= 60.0:
            rating = "Proficient"
        else:
            rating = "Needs Academic Support"

        return {
            "index_score": final_index,
            "rating": rating,
            "is_partial": is_partial,
            "data_completeness_pct": data_completeness_pct,
            "components": components,
            "insights": insights
        }
