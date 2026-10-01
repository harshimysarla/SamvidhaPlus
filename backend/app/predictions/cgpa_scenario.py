from typing import Dict, Any, List, Optional

class CGPAScenarioCalculator:
    """
    Hypothetical What-If CGPA Simulator.
    Allows students to project cumulative grade impact based on prospective semester SGPA,
    or calculate required SGPA to attain a target CGPA milestone (e.g. 8.0, 8.5, 9.0).
    """

    @staticmethod
    def simulate(
        current_cgpa: float,
        earned_credits: float,
        next_credits: float,
        hypothetical_sgpa: float,
        target_cgpa: Optional[float] = None
    ) -> Dict[str, Any]:
        total_future_credits = earned_credits + next_credits
        projected_cgpa = (
            (current_cgpa * earned_credits) + (hypothetical_sgpa * next_credits)
        ) / total_future_credits if total_future_credits > 0 else current_cgpa

        cgpa_diff = projected_cgpa - current_cgpa

        required_sgpa = None
        is_achievable = None

        if target_cgpa is not None and next_credits > 0:
            # target_cgpa = (current_cgpa * earned_credits + required_sgpa * next_credits) / total_future_credits
            # required_sgpa * next_credits = target_cgpa * total_future_credits - current_cgpa * earned_credits
            needed = ((target_cgpa * total_future_credits) - (current_cgpa * earned_credits)) / next_credits
            required_sgpa = round(needed, 2)
            is_achievable = 0.0 <= needed <= 10.0

        # Build trajectory comparison steps across various hypothetical SGPAs (6.0 to 10.0)
        trajectory = []
        for step_sgpa in [6.0, 7.0, 7.5, 8.0, 8.5, 9.0, 9.5, 10.0]:
            p_cgpa = (
                (current_cgpa * earned_credits) + (step_sgpa * next_credits)
            ) / total_future_credits
            trajectory.append({
                "hypothetical_sgpa": step_sgpa,
                "projected_cgpa": round(p_cgpa, 2),
                "delta": round(p_cgpa - current_cgpa, 2)
            })

        return {
            "current_cgpa": round(current_cgpa, 2),
            "current_earned_credits": round(earned_credits, 1),
            "next_semester_credits": round(next_credits, 1),
            "projected_cgpa": round(projected_cgpa, 2),
            "cgpa_difference": round(cgpa_diff, 2),
            "required_sgpa_for_target": required_sgpa,
            "is_target_achievable": is_achievable,
            "scenario_trajectory": trajectory
        }
