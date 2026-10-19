import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from app.config import settings
from app.database import engine, Base, SessionLocal, get_db
from app.models.models import User
from app.services.resources_catalog import seed_resources
from app.services.assessment_engine import seed_questions
from app.services.streak_engine import seed_achievements

# Import Routers
from app.api.roadmaps import router as roadmaps_router
from app.api.assessments import router as assessments_router
from app.api.resources import router as resources_router
from app.api.streaks import router as streaks_router
from app.api.careers import router as careers_router
from app.api.assistant import router as assistant_router
from app.api.analytics import router as analytics_router
from app.api.settings import router as settings_router
from app.api.auth import router as auth_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB tables
    Base.metadata.create_all(bind=engine)

    # Ensure database indexes exist
    try:
        with engine.connect() as conn:
            from sqlalchemy import text
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_user_email ON users(email)"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_roadmaps_user_id ON roadmaps(user_id)"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_roadmaps_status ON roadmaps(status)"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_phases_roadmap_id ON roadmap_phases(roadmap_id)"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_tasks_roadmap_id ON roadmap_tasks(roadmap_id)"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_tasks_phase_id ON roadmap_tasks(phase_id)"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_tasks_status ON roadmap_tasks(status)"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_resources_skill ON learning_resources(skill)"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_resources_topic ON learning_resources(topic)"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_resources_completed ON learning_resources(is_completed)"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_activity_user_date ON daily_activities(user_id, date)"))
            conn.commit()
    except Exception:
        pass

    # Seed catalog & default learner
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == 1).first()
        if not user:
            user = User(
                id=1,
                name="Pathly Learner",
                email="learner@pathly.ai",
                current_level="Beginner",
                target_career="Full-Stack Developer",
                daily_goal_minutes=45
            )
            db.add(user)
            db.commit()

        seed_resources(db)
        seed_questions(db)
        seed_achievements(db, user_id=1)
    finally:
        db.close()

    yield

app = FastAPI(
    title="Pathly API",
    description="High-performance REST API powering Pathly — Your Personal Learning Journey",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS + ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(roadmaps_router, prefix="/api")
app.include_router(assessments_router, prefix="/api")
app.include_router(resources_router, prefix="/api")
app.include_router(streaks_router, prefix="/api")
app.include_router(careers_router, prefix="/api")
app.include_router(assistant_router, prefix="/api")
app.include_router(analytics_router, prefix="/api")
app.include_router(settings_router, prefix="/api")
app.include_router(auth_router, prefix="/api")

@app.get("/api/health")
def health_check():
    db_dialect = "sqlite" if "sqlite" in settings.DATABASE_URL else "postgresql"
    return {
        "status": "healthy",
        "service": "Pathly API",
        "version": "1.0.0",
        "database": db_dialect,
        "ai_enabled": bool(settings.GEMINI_API_KEY)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
