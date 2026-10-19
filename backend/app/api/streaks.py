from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.schemas import StreakOut, DailyGoalUpdate, LogActivityRequest, AchievementOut
from app.models.models import User, Achievement, DailyActivity
from app.services.streak_engine import (
    get_streak_status, record_activity, get_or_create_streak_info
)
from app.api.auth import get_current_user

router = APIRouter(prefix="/streaks", tags=["Goals & Streaks"])

@router.get("", response_model=StreakOut)
def get_user_streak(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return get_streak_status(db, user_id=current_user.id)

@router.put("/daily-goal")
def update_daily_goal(
    payload: DailyGoalUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user = current_user
    user.daily_goal_minutes = payload.daily_goal_minutes
    db.commit()
    return {"status": "success", "daily_goal_minutes": user.daily_goal_minutes}

@router.post("/log-activity")
def log_manual_activity(
    payload: LogActivityRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    record_activity(
        db,
        user_id=current_user.id,
        minutes=payload.minutes_spent,
        tasks_delta=payload.tasks_completed
    )
    return get_streak_status(db, user_id=current_user.id)

@router.get("/achievements", response_model=List[AchievementOut])
def list_achievements(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    achievements = db.query(Achievement).filter(Achievement.user_id == current_user.id).order_by(Achievement.id).all()
    results = []
    for a in achievements:
        results.append(AchievementOut(
            badge_code=a.badge_code,
            title=a.title,
            description=a.description,
            icon=a.icon,
            category=a.category,
            unlocked_at=a.unlocked_at,
            is_unlocked=(a.unlocked_at is not None)
        ))
    return results
