import json
import os
import sys
from datetime import datetime, timezone, timedelta

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal, engine, Base
from app.core.security import get_password_hash
from app.models.models import (
    User, Department, Student, Faculty, Course, TheoryAssessment,
    LaboratoryAssessment, SemesterResult, PendingCourse, TimetableEntry,
    Assignment, AssignmentSubmission, Announcement, CalendarEvent,
    Notification, IntegrationConfig, StudyTask, AcademicRecommendation,
    FacultyIntervention, StudentPreference
)

DEMO_DATA_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "demo-data", "samvidha_demo_dataset.json")

def seed():
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if already seeded
        if db.query(User).count() > 0:
            print("Database already contains user records. Re-synchronizing demo data...")

        with open(DEMO_DATA_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)

        # 1. Departments
        print("Seeding departments...")
        for d in data.get("departments", []):
            existing = db.query(Department).filter(Department.code == d["code"]).first()
            if not existing:
                dept = Department(code=d["code"], name=d["name"], hod_name=d.get("hod"))
                db.add(dept)
        db.commit()

        # 2. Users
        print("Seeding users...")
        for u in data.get("users", []):
            existing = db.query(User).filter(User.username == u["username"]).first()
            raw_pass = u.get("raw_password_hint", "DemoPass@123")
            hashed = get_password_hash(raw_pass)
            if not existing:
                user = User(
                    username=u["username"],
                    email=u["email"],
                    hashed_password=hashed,
                    role=u["role"],
                    full_name=u["name"],
                    department=u.get("department"),
                    is_active=True
                )
                db.add(user)
            else:
                existing.hashed_password = hashed
                existing.full_name = u["name"]
        db.commit()

        # 3. Faculty Profiles
        print("Seeding faculty profiles...")
        for u in data.get("users", []):
            if u["role"] == "faculty":
                user_obj = db.query(User).filter(User.username == u["username"]).first()
                existing_fac = db.query(Faculty).filter(Faculty.faculty_id == u["username"]).first()
                if not existing_fac and user_obj:
                    fac = Faculty(
                        user_id=user_obj.id,
                        faculty_id=u["username"],
                        name=u["name"],
                        department=u.get("department", "CSE"),
                        designation=u.get("designation", "Faculty"),
                        email=u["email"],
                        phone="+91 9440012345",
                        office_location="Academic Block-IV, Room 204"
                    )
                    db.add(fac)
        db.commit()

        # 4. Student Profiles
        print("Seeding student profiles...")
        for s in data.get("students", []):
            user_obj = db.query(User).filter(User.username == s["roll_no"]).first()
            existing_st = db.query(Student).filter(Student.roll_no == s["roll_no"]).first()
            if not existing_st and user_obj:
                st = Student(
                    user_id=user_obj.id,
                    roll_no=s["roll_no"],
                    department=s["department"],
                    branch=s["branch"],
                    section=s.get("section", "A"),
                    regulation=s.get("regulation", "R20"),
                    academic_year=s.get("academic_year", "2024-2025"),
                    current_semester=s.get("current_semester", 7),
                    enrollment_status=s.get("enrollment_status", "Active Regular"),
                    admission_year=s.get("admission_year", 2021),
                    mentor_name=s.get("mentor_name"),
                    mentor_email=s.get("mentor_email"),
                    blood_group=s.get("blood_group"),
                    phone=s.get("phone"),
                    address=s.get("address"),
                    parent_name=s.get("parent_name"),
                    parent_phone=s.get("parent_phone"),
                    cgpa=s.get("cgpa", 0.0),
                    total_credits_earned=s.get("total_credits_earned", 0.0),
                    total_credits_required=s.get("total_credits_required", 160.0),
                    overall_attendance_percentage=s.get("overall_attendance_percentage", 0.0)
                )
                db.add(st)
        db.commit()

        # 5. Courses & Assessments
        print("Seeding courses and assessments...")
        for detail in data.get("current_courses_detail", []):
            roll_no = detail["roll_no"]
            sem = detail["semester"]
            student_obj = db.query(Student).filter(Student.roll_no == roll_no).first()
            if not student_obj:
                continue

            for c in detail.get("courses", []):
                course_code = c["course_code"]
                course_obj = db.query(Course).filter(Course.code == course_code).first()
                if not course_obj:
                    course_obj = Course(
                        code=course_code,
                        name=c["course_name"],
                        department=student_obj.department,
                        semester=sem,
                        regulation=student_obj.regulation,
                        category=c.get("category", "Core"),
                        course_type=c.get("type", "Theory"),
                        credits=c.get("credits", 3.0),
                        faculty_id=1
                    )
                    db.add(course_obj)
                    db.commit()
                    db.refresh(course_obj)

                if c.get("type") in ["Theory", "Project"]:
                    existing_ta = db.query(TheoryAssessment).filter(
                        TheoryAssessment.student_id == student_obj.id,
                        TheoryAssessment.course_id == course_obj.id
                    ).first()
                    if not existing_ta:
                        ta = TheoryAssessment(
                            student_id=student_obj.id,
                            course_id=course_obj.id,
                            semester=sem,
                            cie1=c.get("cie1", 0.0),
                            aat1_1=c.get("aat1_1", 0.0),
                            aat1_2=c.get("aat1_2", 0.0),
                            cie2=c.get("cie2", 0.0),
                            aat2_1=c.get("aat2_1", 0.0),
                            aat2_2=c.get("aat2_2", 0.0),
                            internal_total=c.get("internal_total", 0.0),
                            grade=c.get("expected_grade", "A"),
                            grade_point=c.get("grade_point", 8.0),
                            status="In Progress",
                            classes_conducted=c.get("classes_conducted", 40),
                            classes_attended=c.get("classes_attended", 35),
                            attendance_pct=c.get("attendance_pct", 87.5)
                        )
                        db.add(ta)
                else: # Laboratory
                    existing_la = db.query(LaboratoryAssessment).filter(
                        LaboratoryAssessment.student_id == student_obj.id,
                        LaboratoryAssessment.course_id == course_obj.id
                    ).first()
                    if not existing_la:
                        la = LaboratoryAssessment(
                            student_id=student_obj.id,
                            course_id=course_obj.id,
                            semester=sem,
                            week_marks_json=c.get("week_marks", [3.0] * 14),
                            day_to_day_marks=c.get("day_to_day_marks", 28.0),
                            internal_exam_marks=c.get("internal_exam_marks", 9.5),
                            internal_total=c.get("internal_total", 37.5),
                            grade=c.get("expected_grade", "S"),
                            grade_point=c.get("grade_point", 10.0),
                            status="In Progress",
                            classes_conducted=c.get("classes_conducted", 14),
                            classes_attended=c.get("classes_attended", 14),
                            attendance_pct=c.get("attendance_pct", 100.0)
                        )
                        db.add(la)
        db.commit()

        # 6. Semester History
        print("Seeding semester history...")
        for sh in data.get("semesters_history", []):
            roll_no = sh["roll_no"]
            student_obj = db.query(Student).filter(Student.roll_no == roll_no).first()
            if not student_obj:
                continue

            for sem_data in sh.get("semesters", []):
                existing_res = db.query(SemesterResult).filter(
                    SemesterResult.student_id == student_obj.id,
                    SemesterResult.semester == sem_data["semester"]
                ).first()
                if not existing_res:
                    sr = SemesterResult(
                        student_id=student_obj.id,
                        semester=sem_data["semester"],
                        academic_year=sem_data["academic_year"],
                        sgpa=sem_data.get("sgpa"),
                        cgpa=sem_data.get("cgpa"),
                        credits_registered=sem_data.get("credits_registered", 20.0),
                        credits_earned=sem_data.get("credits_earned", 20.0),
                        published=sem_data.get("published", True),
                        status=sem_data.get("status", "PASSED"),
                        published_date=datetime.now(timezone.utc)
                    )
                    db.add(sr)
        db.commit()

        # 7. Pending Courses
        print("Seeding pending courses requirements...")
        for pc_data in data.get("pending_courses_data", []):
            roll_no = pc_data["roll_no"]
            student_obj = db.query(Student).filter(Student.roll_no == roll_no).first()
            if not student_obj:
                continue

            for cat in pc_data.get("categories", []):
                existing_pc = db.query(PendingCourse).filter(
                    PendingCourse.student_id == student_obj.id,
                    PendingCourse.category == cat["category"]
                ).first()
                if not existing_pc:
                    pc = PendingCourse(
                        student_id=student_obj.id,
                        category=cat["category"],
                        required_count=cat["required"],
                        registered_count=cat["registered"],
                        pending_count=cat["pending"],
                        status=cat["status"]
                    )
                    db.add(pc)
        db.commit()

        # 8. Timetable
        print("Seeding timetable entries...")
        for tt in data.get("timetable_entries", []):
            dept = tt["department"]
            sem = tt["semester"]
            sec = tt["section"]
            for slot in tt.get("schedule", []):
                existing_slot = db.query(TimetableEntry).filter(
                    TimetableEntry.department == dept,
                    TimetableEntry.semester == sem,
                    TimetableEntry.section == sec,
                    TimetableEntry.day == slot["day"],
                    TimetableEntry.start_time == slot["start_time"]
                ).first()
                if not existing_slot:
                    entry = TimetableEntry(
                        department=dept,
                        semester=sem,
                        section=sec,
                        day=slot["day"],
                        start_time=slot["start_time"],
                        end_time=slot["end_time"],
                        course_code=slot["course_code"],
                        course_name=slot["course_name"],
                        faculty_name=slot["faculty"],
                        room=slot["room"]
                    )
                    db.add(entry)
        db.commit()

        # 9. Assignments
        print("Seeding assignments...")
        for asg in data.get("assignments", []):
            course_code = asg["course_code"]
            course_obj = db.query(Course).filter(Course.code == course_code).first()
            if not course_obj:
                continue
            existing_asg = db.query(Assignment).filter(Assignment.id == asg["id"]).first()
            if not existing_asg:
                due = datetime.fromisoformat(asg["due_date"].replace("Z", "+00:00"))
                asg_obj = Assignment(
                    id=asg["id"],
                    course_id=course_obj.id,
                    title=asg["title"],
                    description=asg["description"],
                    due_date=due,
                    max_marks=asg.get("max_marks", 10.0),
                    faculty_id=1
                )
                db.add(asg_obj)
                db.commit()

                for sub in asg.get("submissions", []):
                    st = db.query(Student).filter(Student.roll_no == sub["roll_no"]).first()
                    if st:
                        sub_obj = AssignmentSubmission(
                            assignment_id=asg["id"],
                            student_id=st.id,
                            status=sub.get("status", "Submitted"),
                            score=sub.get("score"),
                            feedback=sub.get("feedback")
                        )
                        db.add(sub_obj)
        db.commit()

        # 10. Announcements
        print("Seeding announcements...")
        for ann in data.get("announcements", []):
            existing_ann = db.query(Announcement).filter(Announcement.id == ann["id"]).first()
            if not existing_ann:
                a_obj = Announcement(
                    id=ann["id"],
                    title=ann["title"],
                    category=ann["category"],
                    scope=ann["scope"],
                    department=ann.get("department"),
                    content=ann["content"],
                    author=ann["author"]
                )
                db.add(a_obj)
        db.commit()

        # 11. Calendar Events
        print("Seeding calendar events...")
        for cal in data.get("calendar_events", []):
            existing_cal = db.query(CalendarEvent).filter(CalendarEvent.id == cal["id"]).first()
            if not existing_cal:
                ce_obj = CalendarEvent(
                    id=cal["id"],
                    title=cal["title"],
                    event_date=cal["date"],
                    end_date=cal.get("end_date"),
                    event_type=cal.get("type", "event"),
                    description=f"{cal['title']} scheduled in academic calendar."
                )
                db.add(ce_obj)
        db.commit()

        # 12. Notifications
        print("Seeding welcome notifications...")
        all_users = db.query(User).all()
        for u in all_users:
            if not db.query(Notification).filter(Notification.user_id == u.id).first():
                n1 = Notification(
                    user_id=u.id,
                    title="Welcome to Smart Academic Intelligence Portal",
                    message="Your academic profile is synchronized with autonomous curriculum regulations.",
                    category="info"
                )
                n2 = Notification(
                    user_id=u.id,
                    title="CIE-II Exam Timetable Released",
                    message="CIE-II examinations commence from October 24th. Review your course syllabus and attendance buffer.",
                    category="grade"
                )
                db.add(n1)
                db.add(n2)
        db.commit()

        # 13. Integration Configuration
        print("Seeding integration configurations...")
        for p in ["Demo Data", "Authorized Import", "Official API"]:
            existing_cfg = db.query(IntegrationConfig).filter(IntegrationConfig.provider_name == p).first()
            if not existing_cfg:
                cfg = IntegrationConfig(
                    provider_name=p,
                    is_active=(p == "Demo Data"),
                    api_base_url="https://samvidha.iare.ac.in/api/v1" if p == "Official API" else None,
                    sync_status="Configured"
                )
                db.add(cfg)
        db.commit()

        # 14. Student Preferences
        print("Seeding student preferences...")
        all_students = db.query(Student).all()
        for s in all_students:
            if not db.query(StudentPreference).filter(StudentPreference.student_id == s.id).first():
                pref = StudentPreference(
                    student_id=s.id,
                    email_alerts_enabled=True,
                    attendance_warning_threshold=75.0,
                    mentoring_visibility_consent=True,
                    ai_guidance_enabled=True,
                    dark_mode=False
                )
                db.add(pref)
        db.commit()

        # 15. Actionable Academic Recommendations
        print("Seeding academic recommendations...")
        s1 = db.query(Student).filter(Student.roll_no == "21951A0501").first()
        if s1:
            recs_s1 = [
                AcademicRecommendation(
                    id="REC-ATT-CS603",
                    student_id=s1.id,
                    category="ATTENDANCE",
                    title="Attendance Recovery Plan: Cloud Computing",
                    observation="Current attendance in CS603 is 71.4% (25/35 attended), in the condonation danger zone (65%–75%).",
                    why_it_matters="Attending end-semester examination requires regular attendance >= 75.0% to avoid institutional condonation penalties.",
                    supporting_data="71.4% current attendance (25/35 sessions)",
                    recommended_action="Attend the next 6 scheduled lecture and lab sessions consecutively without absence.",
                    suggested_timeframe="Next 2 Weeks",
                    priority="High",
                    status="Active"
                ),
                AcademicRecommendation(
                    id="REC-REV-CS601",
                    student_id=s1.id,
                    category="REVISION",
                    title="Targeted Internal Boost: Distributed Operating Systems",
                    observation="Cumulative internal mark stands at 27.5/40. CIE-1 score was 6.8/10.",
                    why_it_matters="CIE marks carry 40% aggregate weight towards the final letter grade.",
                    supporting_data="Internal Score: 27.5/40 (CIE-1: 6.8/10)",
                    recommended_action="Focus on Lamport logical clocks and distributed deadlock detection before CIE-2 exam.",
                    suggested_timeframe="Before CIE-II Exam",
                    priority="Medium",
                    status="Active"
                ),
                AcademicRecommendation(
                    id="REC-TIME-01",
                    student_id=s1.id,
                    category="TIME_ALLOCATION",
                    title="Study Block Allocation: Compiler Design",
                    observation="Compiler Design (CS602) carries 4.0 autonomous credits and requires rigorous parsing algorithm practice.",
                    why_it_matters="High-credit courses exert a disproportionate impact on semester SGPA variance.",
                    supporting_data="Course Weight: 4.0 Credits",
                    recommended_action="Schedule at least 4.5 dedicated study hours this week divided into 45-minute focused blocks.",
                    suggested_timeframe="This Week",
                    priority="Medium",
                    status="Active"
                ),
                AcademicRecommendation(
                    id="REC-GOAL-01",
                    student_id=s1.id,
                    category="GOAL_SETTING",
                    title="Target CGPA Milestone: Elevate to 8.85+",
                    observation="Current cumulative CGPA is 8.52. An SGPA of >= 8.90 this semester will advance standing to 8.85+.",
                    why_it_matters="Crosses the threshold for institutional academic honors and tier-1 campus placement shortlists.",
                    supporting_data="Current CGPA: 8.52 → Target CGPA: 8.85",
                    recommended_action="Use What-If Simulator to calibrate course-level target grades and track daily study tasks.",
                    suggested_timeframe="Semester Duration",
                    priority="Low",
                    status="Active"
                )
            ]
            for r in recs_s1:
                if not db.query(AcademicRecommendation).filter(AcademicRecommendation.id == r.id).first():
                    db.add(r)

        s2 = db.query(Student).filter(Student.roll_no == "21951A0502").first()
        if s2:
            recs_s2 = [
                AcademicRecommendation(
                    id="REC-ATT-A0502",
                    student_id=s2.id,
                    category="ATTENDANCE",
                    title="Critical Detention Warning: Compiler Design",
                    observation="Attendance in Compiler Design is currently 62.5% (20/32 attended), below the mandatory 65% autonomous cutoff.",
                    why_it_matters="Under university autonomous regulations, students below 65% are detained without condonation.",
                    supporting_data="62.5% attendance in CS602",
                    recommended_action="Attend every upcoming class without exception. Contact faculty advisor immediately.",
                    suggested_timeframe="Immediate (Next 48 Hours)",
                    priority="High",
                    status="Active"
                )
            ]
            for r in recs_s2:
                if not db.query(AcademicRecommendation).filter(AcademicRecommendation.id == r.id).first():
                    db.add(r)
        db.commit()

        # 16. Smart Study Planner Tasks
        print("Seeding smart study planner tasks...")
        if s1 and db.query(StudyTask).filter(StudyTask.student_id == s1.id).count() == 0:
            today_str = datetime.now().strftime("%Y-%m-%d")
            tomorrow_str = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
            day2_str = (datetime.now() + timedelta(days=2)).strftime("%Y-%m-%d")
            day3_str = (datetime.now() + timedelta(days=3)).strftime("%Y-%m-%d")
            day4_str = (datetime.now() + timedelta(days=4)).strftime("%Y-%m-%d")

            tasks_s1 = [
                StudyTask(
                    student_id=s1.id,
                    title="Revise Distributed Systems: Lamport timestamps & vector clocks",
                    course_code="CS601",
                    scheduled_date=today_str,
                    allocated_hours=2.0,
                    priority="High",
                    is_completed=True,
                    rescheduled_count=0
                ),
                StudyTask(
                    student_id=s1.id,
                    title="Compiler Design: Practice LR(1) and LALR parser tables",
                    course_code="CS602",
                    scheduled_date=tomorrow_str,
                    allocated_hours=2.5,
                    priority="High",
                    is_completed=False,
                    rescheduled_count=0
                ),
                StudyTask(
                    student_id=s1.id,
                    title="Cloud Computing Lab: Dockerize Flask microservice and write report",
                    course_code="CS605",
                    scheduled_date=day2_str,
                    allocated_hours=1.5,
                    priority="Medium",
                    is_completed=False,
                    rescheduled_count=0
                ),
                StudyTask(
                    student_id=s1.id,
                    title="Software Engineering AAT-2: Agile sprint backlog case study",
                    course_code="CS604",
                    scheduled_date=day3_str,
                    allocated_hours=1.5,
                    priority="Medium",
                    is_completed=False,
                    rescheduled_count=0
                ),
                StudyTask(
                    student_id=s1.id,
                    title="Data Structures review: B-trees and Red-Black tree rebalancing",
                    course_code="CS601",
                    scheduled_date=day4_str,
                    allocated_hours=2.0,
                    priority="Low",
                    is_completed=False,
                    rescheduled_count=0
                )
            ]
            for t in tasks_s1:
                db.add(t)
            db.commit()

        # 17. Faculty Interventions
        print("Seeding faculty interventions...")
        f1 = db.query(Faculty).filter(Faculty.faculty_id == "FAC001").first()
        c_cs602 = db.query(Course).filter(Course.code == "CS602").first()
        if f1 and s2 and c_cs602 and db.query(FacultyIntervention).count() == 0:
            interv = FacultyIntervention(
                faculty_id=f1.id,
                student_id=s2.id,
                course_id=c_cs602.id,
                action_type="Attendance Counseling & Remedial Plan",
                notes="Met student regarding 62.5% attendance in Compiler Design. Assigned remedial problem set covering LR parsing and scheduled follow-up check.",
                follow_up_date=(datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d"),
                status="Follow-up Pending"
            )
            db.add(interv)
            db.commit()

        print("Database seeded successfully with SamvidhaPlus academic records!")

    finally:
        db.close()

if __name__ == "__main__":
    seed()
