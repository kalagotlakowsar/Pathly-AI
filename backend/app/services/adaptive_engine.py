import json
import datetime
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.models.models import Roadmap, RoadmapPhase, RoadmapTask, AssessmentAttempt
from app.services.roadmap_engine import recalculate_roadmap_progress

def analyze_roadmap_adaptation(
    db: Session,
    roadmap_id: int,
    user_id: int = 1
) -> Dict[str, Any]:
    roadmap = db.query(Roadmap).filter(Roadmap.id == roadmap_id).first()
    if not roadmap:
        raise ValueError(f"Roadmap with id {roadmap_id} not found")

    tasks = db.query(RoadmapTask).filter(RoadmapTask.roadmap_id == roadmap_id).order_by(RoadmapTask.order_index).all()

    # Find completed vs pending tasks
    completed_tasks = [t for t in tasks if t.status == "completed"]
    pending_tasks = [t for t in tasks if t.status != "completed"]

    # 1. Detect weak topics from assessments
    attempts = db.query(AssessmentAttempt).filter(
        AssessmentAttempt.user_id == user_id,
        AssessmentAttempt.skill.ilike(f"%{roadmap.skill}%")
    ).order_by(AssessmentAttempt.created_at.desc()).all()

    weak_topics_set = set()
    for att in attempts:
        for topic in att.get_weak_topics():
            weak_topics_set.add(topic)

    weak_topics = list(weak_topics_set)

    # 2. Check for overdue / stalled tasks
    # If completed count is low compared to expected due days
    max_completed_day = max([t.due_day for t in completed_tasks], default=0)
    overdue_tasks = [t for t in pending_tasks if t.due_day <= max_completed_day]

    explanation_points = []
    if weak_topics:
        explanation_points.append(f"Identified {len(weak_topics)} weak topic(s) from your recent skill assessments: {', '.join(weak_topics[:3])}.")
    if overdue_tasks:
        explanation_points.append(f"Detected {len(overdue_tasks)} earlier task(s) currently pending that may need schedule re-alignment.")
    if not explanation_points:
        explanation_points.append("Your learning pace is steady. Adding structured practice reinforcements to solidify core competencies.")

    changes = []
    for wt in weak_topics[:3]:
        changes.append(f"Add targeted revision task: 'Reinforcement & Practice: {wt}'")
    if overdue_tasks:
        changes.append(f"Recalculate due days for {len(pending_tasks)} upcoming tasks based on your {roadmap.daily_study_time} mins/day pace.")

    return {
        "roadmap_id": roadmap.id,
        "weak_topics_detected": weak_topics,
        "overdue_tasks_count": len(overdue_tasks),
        "revision_tasks_added": min(3, len(weak_topics)),
        "explanation": " ".join(explanation_points),
        "changes": changes
    }

def apply_roadmap_adaptation(
    db: Session,
    roadmap_id: int,
    user_id: int = 1,
    include_weak_topics: bool = True,
    recalculate_schedule: bool = True
) -> Dict[str, Any]:
    roadmap = db.query(Roadmap).filter(Roadmap.id == roadmap_id).first()
    if not roadmap:
        raise ValueError(f"Roadmap with id {roadmap_id} not found")

    tasks = db.query(RoadmapTask).filter(RoadmapTask.roadmap_id == roadmap_id).order_by(RoadmapTask.order_index).all()
    first_phase = db.query(RoadmapPhase).filter(RoadmapPhase.roadmap_id == roadmap_id).order_by(RoadmapPhase.phase_number).first()

    analysis = analyze_roadmap_adaptation(db, roadmap_id, user_id)
    weak_topics = analysis["weak_topics_detected"] if include_weak_topics else []

    # Existing task titles to prevent duplicate revision tasks
    existing_titles = {t.title for t in tasks}

    added_revision_tasks = []
    current_max_order = max([t.order_index for t in tasks], default=0)

    # Insert revision tasks for weak topics if not already existing
    for wt in weak_topics[:3]:
        rev_title = f"Reinforcement & Deep Practice: {wt}"
        if rev_title not in existing_titles and first_phase:
            current_max_order += 1
            rev_task = RoadmapTask(
                phase_id=first_phase.id,
                roadmap_id=roadmap.id,
                title=rev_title,
                description=f"Focused hands-on exercises and conceptual review to eliminate misunderstandings in {wt}.",
                topic=wt,
                estimated_minutes=roadmap.daily_study_time,
                difficulty=roadmap.level,
                status="not_started",
                is_milestone=False,
                is_revision=True,
                order_index=current_max_order,
                due_day=1
            )
            db.add(rev_task)
            added_revision_tasks.append(rev_title)

    db.flush()

    # Recalculate schedule & due days if requested, preserving all completed tasks
    if recalculate_schedule:
        all_tasks = db.query(RoadmapTask).filter(RoadmapTask.roadmap_id == roadmap_id).order_by(RoadmapTask.order_index).all()
        day = 1
        for t in all_tasks:
            if t.status == "completed":
                continue # leave completed days as is
            t.due_day = day
            day += 1

    db.commit()
    recalculate_roadmap_progress(db, roadmap.id)

    return {
        "status": "success",
        "roadmap_id": roadmap.id,
        "explanation": analysis["explanation"],
        "revision_tasks_added": added_revision_tasks,
        "message": f"Successfully adapted roadmap: added {len(added_revision_tasks)} revision modules and rescheduled future milestones."
    }
