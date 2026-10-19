import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.schemas import (
    QuestionOut, AssessmentSubmit, AssessmentResultOut
)
from app.models.models import AssessmentQuestion, AssessmentAttempt
from app.services.assessment_engine import (
    get_questions_for_skill, evaluate_assessment
)
from app.services.streak_engine import record_activity, unlock_achievement

router = APIRouter(prefix="/assessments", tags=["Assessments"])

@router.get("/questions", response_model=List[QuestionOut])
def get_assessment_questions(
    skill: str = Query(..., min_length=1),
    difficulty: str = Query("Beginner"),
    db: Session = Depends(get_db)
):
    questions = get_questions_for_skill(db, skill, difficulty)
    results = []
    for q in questions:
        results.append(QuestionOut(
            id=q.id,
            skill=q.skill,
            difficulty=q.difficulty,
            topic=q.topic,
            question=q.question,
            options=q.get_options()
        ))
    return results

@router.post("/submit", response_model=AssessmentResultOut)
def submit_assessment(payload: AssessmentSubmit, db: Session = Depends(get_db)):
    answers_dicts = [
        {"question_id": a.question_id, "selected_option_index": a.selected_option_index}
        for a in payload.answers
    ]
    result = evaluate_assessment(
        db=db,
        user_id=1,
        skill=payload.skill,
        difficulty=payload.difficulty,
        answers=answers_dicts
    )

    # Record streak activity and achievements
    record_activity(db, user_id=1, minutes=15, quiz_delta=1)
    unlock_achievement(db, 1, "QUIZ_APPRENTICE")
    if result["score"] == result["total_questions"] and result["total_questions"] > 0:
        unlock_achievement(db, 1, "PERFECT_SCORE")

    return result

@router.get("/attempts")
def list_attempts(db: Session = Depends(get_db)):
    attempts = db.query(AssessmentAttempt).filter(AssessmentAttempt.user_id == 1).order_by(AssessmentAttempt.created_at.desc()).all()
    results = []
    for a in attempts:
        results.append({
            "id": a.id,
            "skill": a.skill,
            "difficulty": a.difficulty,
            "score": a.score,
            "total_questions": a.total_questions,
            "percentage": a.percentage,
            "weak_topics": a.get_weak_topics(),
            "recommended_level": a.recommended_level,
            "created_at": a.created_at.isoformat()
        })
    return results

@router.get("/weak-topics")
def get_user_weak_topics(skill: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(AssessmentAttempt).filter(AssessmentAttempt.user_id == 1)
    if skill:
        query = query.filter(AssessmentAttempt.skill.ilike(f"%{skill}%"))

    attempts = query.order_by(AssessmentAttempt.created_at.desc()).all()
    weak_set = set()
    for a in attempts:
        for t in a.get_weak_topics():
            weak_set.add(t)
    return {"weak_topics": list(weak_set)}
