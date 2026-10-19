import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.schemas import ResourceOut, ResourceToggle
from app.models.models import LearningResource
from app.services.streak_engine import unlock_achievement

router = APIRouter(prefix="/resources", tags=["Learning Resources"])

@router.get("", response_model=List[ResourceOut])
def list_resources(
    skill: Optional[str] = None,
    topic: Optional[str] = None,
    resource_type: Optional[str] = None,
    is_completed: Optional[bool] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(LearningResource)

    if skill and skill.lower() != "all":
        query = query.filter(LearningResource.skill.ilike(f"%{skill}%"))
    if topic and topic.lower() != "all":
        query = query.filter(LearningResource.topic.ilike(f"%{topic}%"))
    if resource_type and resource_type.lower() != "all":
        query = query.filter(LearningResource.resource_type == resource_type)
    if is_completed is not None:
        query = query.filter(LearningResource.is_completed == is_completed)
    if search:
        query = query.filter(
            (LearningResource.title.ilike(f"%{search}%")) |
            (LearningResource.description.ilike(f"%{search}%"))
        )

    return query.order_by(LearningResource.skill, LearningResource.id).all()

@router.patch("/{resource_id}/toggle", response_model=ResourceOut)
def toggle_resource(resource_id: int, payload: ResourceToggle, db: Session = Depends(get_db)):
    res = db.query(LearningResource).filter(LearningResource.id == resource_id).first()
    if not res:
        raise HTTPException(status_code=404, detail="Resource not found")

    res.is_completed = payload.is_completed
    res.completed_at = datetime.datetime.utcnow() if payload.is_completed else None
    db.commit()
    db.refresh(res)

    completed_count = db.query(LearningResource).filter(LearningResource.is_completed == True).count()
    if completed_count >= 5:
        unlock_achievement(db, 1, "RESOURCE_HUNTER")

    return res
