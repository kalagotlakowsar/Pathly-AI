import sys
import os
import json
import asyncio
from typing import Optional, List, Dict, Any

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from mcp.server.mcpserver import MCPServer
from app.database import SessionLocal, Base, engine
from app.models.models import (
    Roadmap, RoadmapPhase, RoadmapTask, LearningResource, AssessmentAttempt, User
)
from app.services.roadmap_engine import (
    generate_and_save_roadmap, recalculate_roadmap_progress,
    update_task_status, recommend_next_task_logic
)
from app.services.resources_catalog import seed_resources
from app.services.assessment_engine import seed_questions
from app.services.streak_engine import seed_achievements

# Initialize tables & seed data on startup
Base.metadata.create_all(bind=engine)
with SessionLocal() as db:
    user = db.query(User).filter(User.id == 1).first()
    if not user:
        user = User(id=1, name="Pathly Learner", email="learner@pathly.ai")
        db.add(user)
        db.commit()
    seed_resources(db)
    seed_questions(db)
    seed_achievements(db, user_id=1)

# Create MCP server instance
server = MCPServer(
    name="pathly-mcp-server",
    version="1.0.0",
    description="Model Context Protocol (MCP) server for Pathly AI Learning Platform"
)

@server.tool(
    name="generate_learning_roadmap",
    description="Generate and persist a personalized learning roadmap with phases, milestones, and actionable tasks."
)
def generate_learning_roadmap(
    skill: str,
    level: str = "Beginner",
    daily_study_time: int = 45,
    career_goal: str = "Software Engineer",
    duration_weeks: int = 8,
    preferences: Optional[str] = None
) -> Dict[str, Any]:
    with SessionLocal() as db:
        roadmap = generate_and_save_roadmap(
            db=db,
            user_id=1,
            skill=skill,
            level=level,
            career_goal=career_goal,
            daily_study_time=daily_study_time,
            duration_weeks=duration_weeks,
            preferences=preferences
        )

        phases_list = []
        for phase in roadmap.phases:
            tasks_list = []
            for task in phase.tasks:
                tasks_list.append({
                    "id": task.id,
                    "title": task.title,
                    "topic": task.topic,
                    "estimated_minutes": task.estimated_minutes,
                    "difficulty": task.difficulty,
                    "status": task.status,
                    "is_milestone": task.is_milestone,
                    "due_day": task.due_day
                })
            phases_list.append({
                "phase_number": phase.phase_number,
                "title": phase.title,
                "weeks_range": phase.weeks_range,
                "tasks": tasks_list
            })

        return {
            "roadmap_id": roadmap.id,
            "title": roadmap.title,
            "skill": roadmap.skill,
            "level": roadmap.level,
            "career_goal": roadmap.career_goal,
            "total_tasks": roadmap.total_tasks,
            "completion_percentage": roadmap.completion_percentage,
            "phases": phases_list
        }

@server.tool(
    name="get_learning_roadmap",
    description="Retrieve a complete saved learning roadmap and its current completion progress by ID."
)
def get_learning_roadmap(roadmap_id: int) -> Dict[str, Any]:
    with SessionLocal() as db:
        roadmap = db.query(Roadmap).filter(Roadmap.id == roadmap_id).first()
        if not roadmap:
            return {"error": f"Roadmap with ID {roadmap_id} not found"}

        phases_list = []
        for phase in roadmap.phases:
            tasks_list = []
            for task in phase.tasks:
                tasks_list.append({
                    "id": task.id,
                    "title": task.title,
                    "topic": task.topic,
                    "status": task.status,
                    "estimated_minutes": task.estimated_minutes,
                    "is_milestone": task.is_milestone,
                    "completed_at": task.completed_at.isoformat() if task.completed_at else None
                })
            phases_list.append({
                "phase_number": phase.phase_number,
                "title": phase.title,
                "weeks_range": phase.weeks_range,
                "tasks": tasks_list
            })

        return {
            "id": roadmap.id,
            "title": roadmap.title,
            "skill": roadmap.skill,
            "level": roadmap.level,
            "career_goal": roadmap.career_goal,
            "status": roadmap.status,
            "completion_percentage": roadmap.completion_percentage,
            "completed_tasks": roadmap.completed_tasks,
            "total_tasks": roadmap.total_tasks,
            "phases": phases_list
        }

@server.tool(
    name="search_learning_resources",
    description="Search verified, curated learning resources by skill, topic, and optional resource type."
)
def search_learning_resources(
    skill: str,
    topic: Optional[str] = None,
    resource_type: Optional[str] = None
) -> List[Dict[str, Any]]:
    with SessionLocal() as db:
        query = db.query(LearningResource)
        if skill and skill.lower() != "all":
            query = query.filter(LearningResource.skill.ilike(f"%{skill}%"))
        if topic and topic.lower() != "all":
            query = query.filter(LearningResource.topic.ilike(f"%{topic}%"))
        if resource_type and resource_type.lower() != "all":
            query = query.filter(LearningResource.resource_type == resource_type)

        resources = query.limit(10).all()
        return [
            {
                "id": r.id,
                "title": r.title,
                "resource_type": r.resource_type,
                "skill": r.skill,
                "topic": r.topic,
                "url": r.url,
                "is_completed": r.is_completed,
                "description": r.description
            }
            for r in resources
        ]

@server.tool(
    name="update_task_progress",
    description="Update the completion status of a roadmap task (not_started, in_progress, completed) and recalculate roadmap progress."
)
def update_task_progress(
    roadmap_id: int,
    task_id: int,
    new_status: str
) -> Dict[str, Any]:
    if new_status not in ["not_started", "in_progress", "completed"]:
        return {"error": "Invalid status. Must be one of: not_started, in_progress, completed"}

    with SessionLocal() as db:
        task = update_task_status(db, task_id, new_status, user_id=1)
        if not task:
            return {"error": f"Task with ID {task_id} not found"}

        roadmap = db.query(Roadmap).filter(Roadmap.id == roadmap_id).first()
        return {
            "task_id": task.id,
            "title": task.title,
            "new_status": task.status,
            "roadmap_id": roadmap_id,
            "completion_percentage": roadmap.completion_percentage if roadmap else 0.0,
            "completed_tasks": roadmap.completed_tasks if roadmap else 0,
            "total_tasks": roadmap.total_tasks if roadmap else 0
        }

@server.tool(
    name="get_weak_topics",
    description="Retrieve weak topics identified from historical skill assessments for a given user and skill."
)
def get_weak_topics(
    user_id: int = 1,
    skill: Optional[str] = None
) -> Dict[str, Any]:
    with SessionLocal() as db:
        query = db.query(AssessmentAttempt).filter(AssessmentAttempt.user_id == user_id)
        if skill and skill.lower() != "all":
            query = query.filter(AssessmentAttempt.skill.ilike(f"%{skill}%"))

        attempts = query.order_by(AssessmentAttempt.created_at.desc()).all()
        weak_set = set()
        for att in attempts:
            for t in att.get_weak_topics():
                weak_set.add(t)

        return {
            "user_id": user_id,
            "skill": skill or "all",
            "weak_topics": list(weak_set),
            "total_assessments_analyzed": len(attempts)
        }

@server.tool(
    name="recommend_next_task",
    description="Determine the next logical incomplete task in a learning roadmap based on sequence and prerequisites."
)
def recommend_next_task(roadmap_id: int) -> Dict[str, Any]:
    with SessionLocal() as db:
        roadmap = db.query(Roadmap).filter(Roadmap.id == roadmap_id).first()
        if not roadmap:
            return {"error": f"Roadmap with ID {roadmap_id} not found"}

        task = recommend_next_task_logic(db, roadmap_id)
        if not task:
            return {
                "roadmap_id": roadmap_id,
                "message": "All tasks in this roadmap are completed!",
                "next_task": None
            }

        return {
            "roadmap_id": roadmap_id,
            "next_task": {
                "id": task.id,
                "title": task.title,
                "topic": task.topic,
                "estimated_minutes": task.estimated_minutes,
                "difficulty": task.difficulty,
                "status": task.status,
                "is_milestone": task.is_milestone,
                "description": task.description
            }
        }

if __name__ == "__main__":
    import asyncio
    print("Starting Pathly MCP Server on stdio transport...")
    asyncio.run(server.run_stdio_async())
