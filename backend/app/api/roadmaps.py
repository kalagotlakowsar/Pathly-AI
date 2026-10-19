from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, selectinload
from app.database import get_db
from app.schemas.schemas import (
    RoadmapCreate, RoadmapOut, TaskStatusUpdate, TaskOut,
    RoadmapAdaptRequest, RoadmapAdaptPreview
)
from app.models.models import Roadmap, RoadmapTask, RoadmapPhase
from app.services.roadmap_engine import (
    generate_and_save_roadmap, recalculate_roadmap_progress,
    update_task_status, recommend_next_task_logic
)
from app.services.adaptive_engine import (
    analyze_roadmap_adaptation, apply_roadmap_adaptation
)
from app.services.streak_engine import unlock_achievement

router = APIRouter(prefix="/roadmaps", tags=["Roadmaps"])

@router.post("", response_model=RoadmapOut)
def create_roadmap(payload: RoadmapCreate, db: Session = Depends(get_db)):
    roadmap = generate_and_save_roadmap(
        db=db,
        user_id=1,
        skill=payload.skill,
        level=payload.level,
        career_goal=payload.career_goal or "Software Engineer",
        daily_study_time=payload.daily_study_time,
        duration_weeks=payload.duration_weeks or 8,
        preferences=payload.preferences
    )
    unlock_achievement(db, 1, "ROADMAP_CREATOR")
    return roadmap

@router.get("", response_model=List[RoadmapOut])
def list_roadmaps(db: Session = Depends(get_db)):
    roadmaps = (
        db.query(Roadmap)
        .options(selectinload(Roadmap.phases).selectinload(RoadmapPhase.tasks))
        .filter(Roadmap.user_id == 1)
        .order_by(Roadmap.created_at.desc())
        .all()
    )
    return roadmaps

@router.get("/{roadmap_id}", response_model=RoadmapOut)
def get_roadmap(roadmap_id: int, db: Session = Depends(get_db)):
    roadmap = (
        db.query(Roadmap)
        .options(selectinload(Roadmap.phases).selectinload(RoadmapPhase.tasks))
        .filter(Roadmap.id == roadmap_id, Roadmap.user_id == 1)
        .first()
    )
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")
    return roadmap

@router.delete("/{roadmap_id}")
def delete_roadmap(roadmap_id: int, db: Session = Depends(get_db)):
    roadmap = db.query(Roadmap).filter(Roadmap.id == roadmap_id, Roadmap.user_id == 1).first()
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")
    db.delete(roadmap)
    db.commit()
    return {"status": "success", "message": f"Roadmap {roadmap_id} deleted successfully"}

@router.patch("/{roadmap_id}/tasks/{task_id}", response_model=TaskOut)
def update_task(roadmap_id: int, task_id: int, payload: TaskStatusUpdate, db: Session = Depends(get_db)):
    task = update_task_status(db, task_id, payload.status, user_id=1)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # Check for halfway or full completion achievements
    roadmap = db.query(Roadmap).filter(Roadmap.id == roadmap_id).first()
    if roadmap:
        if roadmap.completion_percentage >= 50.0:
            unlock_achievement(db, 1, "HALFWAY_HERO")
        if roadmap.completion_percentage >= 100.0:
            unlock_achievement(db, 1, "MASTER_GRADUATE")

    return task

@router.get("/{roadmap_id}/next-task", response_model=Optional[TaskOut])
def get_next_task(roadmap_id: int, db: Session = Depends(get_db)):
    roadmap = db.query(Roadmap).filter(Roadmap.id == roadmap_id).first()
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")
    task = recommend_next_task_logic(db, roadmap_id)
    return task

@router.post("/{roadmap_id}/adapt/preview", response_model=RoadmapAdaptPreview)
def preview_adaptation(roadmap_id: int, db: Session = Depends(get_db)):
    try:
        preview = analyze_roadmap_adaptation(db, roadmap_id, user_id=1)
        return preview
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/{roadmap_id}/adapt/apply")
def apply_adaptation(roadmap_id: int, payload: RoadmapAdaptRequest, db: Session = Depends(get_db)):
    try:
        res = apply_roadmap_adaptation(
            db,
            roadmap_id,
            user_id=1,
            include_weak_topics=payload.include_weak_topics,
            recalculate_schedule=payload.recalculate_schedule
        )
        return res
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
