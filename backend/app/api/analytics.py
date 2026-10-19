import datetime
from typing import Dict, Any, List
from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.schemas import AnalyticsOverview, CompletionReport
from app.models.models import (
    Roadmap, RoadmapTask, AssessmentAttempt, DailyActivity, User
)
from app.services.streak_engine import get_streak_status

router = APIRouter(prefix="/analytics", tags=["Analytics & Reports"])

@router.get("/overview", response_model=AnalyticsOverview)
def get_analytics_overview(db: Session = Depends(get_db)):
    total_roadmaps = db.query(func.count(Roadmap.id)).filter(Roadmap.user_id == 1).scalar() or 0
    completed_roadmaps = db.query(func.count(Roadmap.id)).filter(Roadmap.user_id == 1, Roadmap.status == "completed").scalar() or 0

    total_tasks = db.query(func.count(RoadmapTask.id)).join(Roadmap).filter(Roadmap.user_id == 1).scalar() or 0
    completed_tasks = db.query(func.count(RoadmapTask.id)).join(Roadmap).filter(Roadmap.user_id == 1, RoadmapTask.status == "completed").scalar() or 0

    overall_progress = round((completed_tasks / total_tasks * 100), 1) if total_tasks > 0 else 0.0

    attempts = db.query(AssessmentAttempt).filter(AssessmentAttempt.user_id == 1).all()
    total_quizzes = len(attempts)
    avg_score = round(sum(a.percentage for a in attempts) / total_quizzes, 1) if total_quizzes > 0 else 0.0

    streak_data = get_streak_status(db, user_id=1)

    # Calculate total hours spent across all logged activities in SQL
    total_minutes = db.query(func.coalesce(func.sum(DailyActivity.minutes_spent), 0)).filter(DailyActivity.user_id == 1).scalar() or 0
    total_hours = round(total_minutes / 60.0, 1)

    # Gather weak topics from all attempts
    weak_topics_set = set()
    for a in attempts:
        for wt in a.get_weak_topics():
            weak_topics_set.add(wt)

    # Fetch only the latest 7 activities
    activities = (
        db.query(DailyActivity)
        .filter(DailyActivity.user_id == 1)
        .order_by(DailyActivity.date.desc())
        .limit(7)
        .all()
    )

    recent_acts = [
        {
            "date": act.date,
            "minutes_spent": act.minutes_spent,
            "tasks_completed": act.tasks_completed,
            "quizzes_taken": act.quizzes_taken,
        }
        for act in activities
    ]

    return AnalyticsOverview(
        total_roadmaps=total_roadmaps,
        completed_roadmaps=completed_roadmaps,
        total_tasks=total_tasks,
        completed_tasks=completed_tasks,
        overall_progress_percentage=overall_progress,
        total_quizzes_taken=total_quizzes,
        average_quiz_score=avg_score,
        current_streak=streak_data["current_streak"],
        longest_streak=streak_data["longest_streak"],
        total_hours_learned=total_hours,
        recent_activities=recent_acts,
        weak_topics_summary=list(weak_topics_set)
    )

@router.get("/report", response_model=CompletionReport)
def get_completion_report(db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == 1).first()
    learner_name = user.name if user else "Pathly Learner"

    roadmaps = db.query(Roadmap).filter(Roadmap.user_id == 1).all()
    roadmaps_summary = []
    skills_practiced_set = set()

    for r in roadmaps:
        skills_practiced_set.add(r.skill)
        roadmaps_summary.append({
            "title": r.title,
            "skill": r.skill,
            "level": r.level,
            "progress": f"{r.completion_percentage}%",
            "completed_tasks": r.completed_tasks,
            "total_tasks": r.total_tasks,
            "status": r.status
        })

    attempts = db.query(AssessmentAttempt).filter(AssessmentAttempt.user_id == 1).all()
    assessments_summary = []
    for a in attempts:
        skills_practiced_set.add(a.skill)
        assessments_summary.append({
            "skill": a.skill,
            "difficulty": a.difficulty,
            "score": f"{a.score}/{a.total_questions}",
            "percentage": f"{a.percentage}%",
            "date": a.created_at.strftime("%Y-%m-%d")
        })

    completed_milestones = db.query(RoadmapTask).join(Roadmap).filter(
        Roadmap.user_id == 1,
        RoadmapTask.is_milestone == True,
        RoadmapTask.status == "completed"
    ).all()
    milestone_titles = [m.title for m in completed_milestones]

    completed_tasks_count = db.query(RoadmapTask).join(Roadmap).filter(
        Roadmap.user_id == 1,
        RoadmapTask.status == "completed"
    ).count()

    activities = db.query(DailyActivity).filter(DailyActivity.user_id == 1).all()
    total_hours = round(sum(act.minutes_spent for act in activities) / 60.0, 1)

    return CompletionReport(
        learner_name=learner_name,
        generated_at=datetime.datetime.utcnow().strftime("%B %d, %Y at %H:%M UTC"),
        roadmaps_summary=roadmaps_summary,
        assessments_summary=assessments_summary,
        total_tasks_completed=completed_tasks_count,
        total_hours_spent=total_hours,
        milestones_achieved=milestone_titles,
        skills_practiced=list(skills_practiced_set),
        disclaimer="This document is an authentic summary of self-paced learning activities tracked inside Pathly. It reflects personal study progress and project milestones, and is not an accredited university diploma or institutional certification."
    )
