import json
import os
import sys
from datetime import datetime, timezone

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal, engine, Base
from app.core.security import get_password_hash
from app.models.models import (
    User, Department, Student, Faculty, Course, TheoryAssessment,
    LaboratoryAssessment, SemesterResult, PendingCourse, TimetableEntry,
    Assignment, AssignmentSubmission, Announcement, CalendarEvent,
    Notification, IntegrationConfig
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

        print("Database seeded successfully with Samvidha academic demonstration records!")

    finally:
        db.close()

if __name__ == "__main__":
    seed()
