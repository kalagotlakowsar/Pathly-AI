from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db, Base, engine
from app.schemas.schemas import UserOut, UserUpdate
from app.models.models import (
    User, Roadmap, AssessmentAttempt, DailyActivity, Achievement, StreakInfo, ChatMessage
)
from app.services.streak_engine import seed_achievements
from app.services.resources_catalog import seed_resources
from app.services.assessment_engine import seed_questions
from app.api.auth import get_current_user

router = APIRouter(prefix="/settings", tags=["Settings & Profile"])

@router.get("/profile", response_model=UserOut)
def get_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/profile", response_model=UserOut)
def update_profile(
    payload: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user = current_user

    if payload.name is not None:
        clean_name = payload.name.strip()
        if not clean_name:
            raise HTTPException(status_code=422, detail="Full Name cannot be empty.")
        user.name = clean_name
    if payload.email is not None:
        clean_email = payload.email.strip()
        if not clean_email or "@" not in clean_email:
            raise HTTPException(status_code=422, detail="Please provide a valid email address.")
        user.email = clean_email
    if payload.avatar is not None:
        user.avatar = payload.avatar
    if payload.current_level is not None:
        user.current_level = payload.current_level
    if payload.target_career is not None:
        user.target_career = payload.target_career.strip()
    if payload.daily_goal_minutes is not None:
        if payload.daily_goal_minutes < 5 or payload.daily_goal_minutes > 720:
            raise HTTPException(status_code=422, detail="Daily study goal must be between 5 and 720 minutes.")
        user.daily_goal_minutes = payload.daily_goal_minutes

    db.commit()
    db.refresh(user)
    return user

@router.post("/reset")
def reset_database(db: Session = Depends(get_db)):
    # Clear mutable user data while preserving catalog
    db.query(ChatMessage).delete()
    db.query(AssessmentAttempt).delete()
    db.query(DailyActivity).delete()
    db.query(Roadmap).delete()
    db.query(StreakInfo).delete()
    db.query(Achievement).delete()

    # Re-seed achievements and default streak
    seed_achievements(db, user_id=1)
    db.commit()

    return {"status": "success", "message": "Demo data reset successfully."}
