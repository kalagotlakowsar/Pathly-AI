import datetime
import json
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, Float
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), default="Pathly Learner")
    email = Column(String(150), default="learner@pathly.ai", index=True)
    avatar = Column(String(255), default="smile")
    current_level = Column(String(50), default="Beginner")
    target_career = Column(String(100), default="Full-Stack Developer")
    daily_goal_minutes = Column(Integer, default=45)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Roadmap(Base):
    __tablename__ = "roadmaps"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), default=1, index=True)
    title = Column(String(200), nullable=False)
    skill = Column(String(100), nullable=False)
    level = Column(String(50), nullable=False) # Beginner, Intermediate, Advanced
    career_goal = Column(String(150), nullable=True)
    daily_study_time = Column(Integer, default=45) # in minutes
    duration_weeks = Column(Integer, default=8)
    description = Column(Text, nullable=True)
    status = Column(String(50), default="in_progress", index=True) # in_progress, completed, archived
    completion_percentage = Column(Float, default=0.0)
    total_tasks = Column(Integer, default=0)
    completed_tasks = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    phases = relationship("RoadmapPhase", back_populates="roadmap", cascade="all, delete-orphan", order_by="RoadmapPhase.phase_number")
    tasks = relationship("RoadmapTask", back_populates="roadmap", cascade="all, delete-orphan", order_by="RoadmapTask.order_index")

class RoadmapPhase(Base):
    __tablename__ = "roadmap_phases"

    id = Column(Integer, primary_key=True, index=True)
    roadmap_id = Column(Integer, ForeignKey("roadmaps.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    phase_number = Column(Integer, nullable=False)
    description = Column(Text, nullable=True)
    weeks_range = Column(String(50), nullable=True) # e.g. "Weeks 1-2"

    roadmap = relationship("Roadmap", back_populates="phases")
    tasks = relationship("RoadmapTask", back_populates="phase", cascade="all, delete-orphan", order_by="RoadmapTask.order_index")

class RoadmapTask(Base):
    __tablename__ = "roadmap_tasks"

    id = Column(Integer, primary_key=True, index=True)
    phase_id = Column(Integer, ForeignKey("roadmap_phases.id", ondelete="CASCADE"), nullable=False, index=True)
    roadmap_id = Column(Integer, ForeignKey("roadmaps.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    topic = Column(String(100), nullable=False)
    estimated_minutes = Column(Integer, default=30)
    difficulty = Column(String(50), default="Beginner")
    status = Column(String(50), default="not_started", index=True) # not_started, in_progress, completed
    is_milestone = Column(Boolean, default=False)
    is_revision = Column(Boolean, default=False)
    order_index = Column(Integer, default=0)
    due_day = Column(Integer, default=1)
    prerequisite_task_id = Column(Integer, nullable=True)
    completed_at = Column(DateTime, nullable=True)

    roadmap = relationship("Roadmap", back_populates="tasks")
    phase = relationship("RoadmapPhase", back_populates="tasks")

class LearningResource(Base):
    __tablename__ = "learning_resources"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    resource_type = Column(String(50), nullable=False, index=True) # Documentation, Tutorial, Video, Practice
    description = Column(Text, nullable=True)
    skill = Column(String(100), nullable=False, index=True)
    topic = Column(String(100), nullable=False, index=True)
    url = Column(String(500), nullable=False)
    is_completed = Column(Boolean, default=False, index=True)
    completed_at = Column(DateTime, nullable=True)

class AssessmentQuestion(Base):
    __tablename__ = "assessment_questions"

    id = Column(Integer, primary_key=True, index=True)
    skill = Column(String(100), nullable=False, index=True)
    difficulty = Column(String(50), default="Beginner", index=True) # Beginner, Intermediate, Advanced
    topic = Column(String(100), nullable=False)
    question = Column(Text, nullable=False)
    options = Column(Text, nullable=False) # JSON list of strings
    correct_option_index = Column(Integer, nullable=False)
    explanation = Column(Text, nullable=False)

    def get_options(self):
        try:
            return json.loads(self.options)
        except Exception:
            return []

class AssessmentAttempt(Base):
    __tablename__ = "assessment_attempts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), default=1, index=True)
    skill = Column(String(100), nullable=False)
    difficulty = Column(String(50), nullable=False)
    score = Column(Integer, nullable=False)
    total_questions = Column(Integer, nullable=False)
    percentage = Column(Float, nullable=False)
    weak_topics = Column(Text, default="[]") # JSON list of strings
    recommended_level = Column(String(50), default="Beginner")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    answers = relationship("AssessmentAnswer", back_populates="attempt", cascade="all, delete-orphan")

    def get_weak_topics(self):
        try:
            return json.loads(self.weak_topics)
        except Exception:
            return []

class AssessmentAnswer(Base):
    __tablename__ = "assessment_answers"

    id = Column(Integer, primary_key=True, index=True)
    attempt_id = Column(Integer, ForeignKey("assessment_attempts.id", ondelete="CASCADE"), nullable=False, index=True)
    question_id = Column(Integer, ForeignKey("assessment_questions.id"), nullable=False, index=True)
    selected_option_index = Column(Integer, nullable=False)
    is_correct = Column(Boolean, nullable=False)

    attempt = relationship("AssessmentAttempt", back_populates="answers")
    question = relationship("AssessmentQuestion")

class DailyActivity(Base):
    __tablename__ = "daily_activities"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), default=1, index=True)
    date = Column(String(10), nullable=False, index=True) # YYYY-MM-DD
    minutes_spent = Column(Integer, default=0)
    tasks_completed = Column(Integer, default=0)
    quizzes_taken = Column(Integer, default=0)
    streak_counted = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Achievement(Base):
    __tablename__ = "achievements"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), default=1, index=True)
    badge_code = Column(String(50), unique=True, nullable=False, index=True)
    title = Column(String(100), nullable=False)
    description = Column(String(255), nullable=False)
    icon = Column(String(50), default="award") # Lucide icon name
    category = Column(String(50), default="general")
    unlocked_at = Column(DateTime, nullable=True)

class StreakInfo(Base):
    __tablename__ = "streak_info"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), default=1, index=True)
    current_streak = Column(Integer, default=0)
    longest_streak = Column(Integer, default=0)
    last_activity_date = Column(String(10), nullable=True) # YYYY-MM-DD

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), default=1, index=True)
    session_id = Column(String(100), default="default", index=True)
    role = Column(String(20), nullable=False) # 'user' or 'assistant'
    content = Column(Text, nullable=False)
    is_ai_generated = Column(Boolean, default=False)
    provider_note = Column(String(100), default="Rule-based Engine")
    tool_invocations = Column(Text, nullable=True) # JSON details if tools were called
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
