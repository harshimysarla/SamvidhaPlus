from typing import Dict, Any, List

class AttendanceForecaster:
    """
    Forecasting and scenario simulator for classroom attendance.
    Computes exact compliance margins according to university rules (75% minimum).
    """

    @staticmethod
    def forecast(
        total_conducted: int,
        total_attended: int,
        upcoming_attend: int,
        upcoming_total: int
    ) -> Dict[str, Any]:
        current_pct = (total_attended / total_conducted * 100.0) if total_conducted > 0 else 0.0

        projected_conducted = total_conducted + upcoming_total
        projected_attended = total_attended + upcoming_attend
        projected_pct = (projected_attended / projected_conducted * 100.0) if projected_conducted > 0 else current_pct

        # How many consecutive future classes needed to hit 75%?
        # (total_attended + x) / (total_conducted + x) >= 0.75
        # 4*(total_attended + x) >= 3*(total_conducted + x)
        # x >= 3*total_conducted - 4*total_attended
        needed_75 = 0
        if current_pct < 75.0 and total_conducted > 0:
            req = (0.75 * total_conducted - total_attended) / 0.25
            needed_75 = max(0, int(req + 0.999))

        # How many consecutive classes to hit 85%?
        needed_85 = 0
        if current_pct < 85.0 and total_conducted > 0:
            req85 = (0.85 * total_conducted - total_attended) / 0.15
            needed_85 = max(0, int(req85 + 0.999))

        # How many classes can student miss while keeping >= 75%?
        # total_attended / (total_conducted + y) >= 0.75
        # y <= (total_attended / 0.75) - total_conducted
        can_miss = 0
        if current_pct >= 75.0 and total_conducted > 0:
            can_miss = max(0, int((total_attended - 0.75 * total_conducted) / 0.75))

        # Build trajectory steps (e.g. attending next 1..10 classes)
        trajectory = []
        for i in range(1, 11):
            t_cond = total_conducted + i
            t_att_all = total_attended + i
            t_att_none = total_attended
            trajectory.append({
                "additional_classes": i,
                "pct_if_attend_all": round(t_att_all / t_cond * 100.0, 1),
                "pct_if_miss_all": round(t_att_none / t_cond * 100.0, 1)
            })

        return {
            "current_percentage": round(current_pct, 1),
            "projected_percentage": round(projected_pct, 1),
            "classes_needed_for_75": needed_75,
            "classes_needed_for_85": needed_85,
            "max_classes_can_miss_safe": can_miss,
            "forecast_trajectory": trajectory
        }
