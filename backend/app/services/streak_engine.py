import datetime
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.models import DailyActivity, StreakInfo, Achievement, User

DEFAULT_ACHIEVEMENTS = [
    {
        "badge_code": "FIRST_STEP",
        "title": "First Step",
        "description": "Completed your first roadmap learning task.",
        "icon": "footprints",
        "category": "milestone"
    },
    {
        "badge_code": "ROADMAP_CREATOR",
        "title": "Pathfinder",
        "description": "Generated your very first personalized learning roadmap.",
        "icon": "map",
        "category": "planning"
    },
    {
        "badge_code": "QUIZ_APPRENTICE",
        "title": "Skill Tester",
        "description": "Completed your first skill assessment.",
        "icon": "clipboard-check",
        "category": "assessment"
    },
    {
        "badge_code": "PERFECT_SCORE",
        "title": "Quiz Master",
        "description": "Scored 100% on a technical skill assessment.",
        "icon": "crown",
        "category": "assessment"
    },
    {
        "badge_code": "STREAK_3",
        "title": "Consistency Spark",
        "description": "Maintained a 3-day active learning streak.",
        "icon": "flame",
        "category": "streak"
    },
    {
        "badge_code": "STREAK_7",
        "title": "Habit Builder",
        "description": "Achieved a full 7-day learning streak.",
        "icon": "zap",
        "category": "streak"
    },
    {
        "badge_code": "HALFWAY_HERO",
        "title": "Halfway Hero",
        "description": "Reached 50% completion on any learning roadmap.",
        "icon": "trending-up",
        "category": "milestone"
    },
    {
        "badge_code": "MASTER_GRADUATE",
        "title": "Roadmap Graduate",
        "description": "Achieved 100% completion on a full learning roadmap.",
        "icon": "award",
        "category": "milestone"
    },
    {
        "badge_code": "RESOURCE_HUNTER",
        "title": "Resource Explorer",
        "description": "Completed 5 curated learning resources.",
        "icon": "book-open",
        "category": "learning"
    }
]

def seed_achievements(db: Session, user_id: int = 1):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        user = User(id=user_id, name="Pathly Learner", email="learner@pathly.ai")
        db.add(user)
        db.commit()

    existing = {a.badge_code for a in db.query(Achievement).filter(Achievement.user_id == user_id).all()}
    for ach in DEFAULT_ACHIEVEMENTS:
        if ach["badge_code"] not in existing:
            item = Achievement(
                user_id=user_id,
                badge_code=ach["badge_code"],
                title=ach["title"],
                description=ach["description"],
                icon=ach["icon"],
                category=ach["category"],
                unlocked_at=None
            )
            db.add(item)
    db.commit()

def unlock_achievement(db: Session, user_id: int, badge_code: str) -> bool:
    ach = db.query(Achievement).filter(
        Achievement.user_id == user_id,
        Achievement.badge_code == badge_code
    ).first()
    if ach and ach.unlocked_at is None:
        ach.unlocked_at = datetime.datetime.utcnow()
        db.commit()
        return True
    return False

def get_or_create_streak_info(db: Session, user_id: int = 1) -> StreakInfo:
    streak = db.query(StreakInfo).filter(StreakInfo.user_id == user_id).first()
    if not streak:
        streak = StreakInfo(
            user_id=user_id,
            current_streak=0,
            longest_streak=0,
            last_activity_date=None
        )
        db.add(streak)
        db.commit()
        db.refresh(streak)
    return streak

def record_activity(db: Session, user_id: int, minutes: int, tasks_delta: int = 0, quiz_delta: int = 0):
    today_str = datetime.date.today().isoformat()
    yesterday_str = (datetime.date.today() - datetime.timedelta(days=1)).isoformat()

    activity = db.query(DailyActivity).filter(
        DailyActivity.user_id == user_id,
        DailyActivity.date == today_str
    ).first()

    if not activity:
        activity = DailyActivity(
            user_id=user_id,
            date=today_str,
            minutes_spent=minutes,
            tasks_completed=tasks_delta,
            quizzes_taken=quiz_delta,
            streak_counted=False
        )
        db.add(activity)
    else:
        activity.minutes_spent += minutes
        activity.tasks_completed += tasks_delta
        activity.quizzes_taken += quiz_delta

    streak = get_or_create_streak_info(db, user_id)

    # Check streak update rule: activity qualifies when at least 1 task is completed or 15 minutes studied
    qualifies = (activity.minutes_spent >= 15 or activity.tasks_completed >= 1 or activity.quizzes_taken >= 1)

    if qualifies and not activity.streak_counted:
        activity.streak_counted = True
        if streak.last_activity_date == yesterday_str:
            streak.current_streak += 1
        elif streak.last_activity_date == today_str:
            pass # already counted for today
        else:
            streak.current_streak = 1 # start fresh streak

        if streak.current_streak > streak.longest_streak:
            streak.longest_streak = streak.current_streak

        streak.last_activity_date = today_str

        # Check streak achievements
        if streak.current_streak >= 3:
            unlock_achievement(db, user_id, "STREAK_3")
        if streak.current_streak >= 7:
            unlock_achievement(db, user_id, "STREAK_7")

    db.commit()

def record_task_completion(db: Session, user_id: int, task_minutes: int):
    record_activity(db, user_id, minutes=task_minutes, tasks_delta=1)
    unlock_achievement(db, user_id, "FIRST_STEP")

def get_streak_status(db: Session, user_id: int = 1) -> Dict[str, Any]:
    today_str = datetime.date.today().isoformat()
    streak = get_or_create_streak_info(db, user_id)
    user = db.query(User).filter(User.id == user_id).first()
    daily_goal = user.daily_goal_minutes if user else 45

    activity = db.query(DailyActivity).filter(
        DailyActivity.user_id == user_id,
        DailyActivity.date == today_str
    ).first()

    today_min = activity.minutes_spent if activity else 0
    today_tasks = activity.tasks_completed if activity else 0

    return {
        "current_streak": streak.current_streak,
        "longest_streak": streak.longest_streak,
        "last_activity_date": streak.last_activity_date,
        "today_minutes": today_min,
        "daily_goal_minutes": daily_goal,
        "today_tasks": today_tasks,
        "goal_completed_today": today_min >= daily_goal
    }
