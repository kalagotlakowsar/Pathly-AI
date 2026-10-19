from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field
import datetime

# --- User Schemas ---
class UserBase(BaseModel):
    name: str = "Pathly Learner"
    email: str = "learner@pathly.ai"
    avatar: str = "smile"
    current_level: str = "Beginner"
    target_career: str = "Full-Stack Developer"
    daily_goal_minutes: int = 45

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    avatar: Optional[str] = None
    current_level: Optional[str] = None
    target_career: Optional[str] = None
    daily_goal_minutes: Optional[int] = None

class UserOut(UserBase):
    id: int
    created_at: datetime.datetime

    class Config:
        from_attributes = True

# --- Auth Schemas ---
class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    target_career: Optional[str] = "Full-Stack Developer"
    current_level: Optional[str] = "Beginner"

class AuthResponse(BaseModel):
    authenticated: bool
    token: str
    user: UserOut
    message: str = "Authentication successful"

class GoogleOAuthUrlResponse(BaseModel):
    configured: bool
    url: Optional[str] = None
    client_id: Optional[str] = None
    message: str

class GoogleVerifyRequest(BaseModel):
    credential: str

# --- Roadmap & Task Schemas ---
class TaskOut(BaseModel):
    id: int
    phase_id: int
    roadmap_id: int
    title: str
    description: Optional[str] = None
    topic: str
    estimated_minutes: int = 30
    difficulty: str = "Beginner"
    status: str = "not_started"
    is_milestone: bool = False
    is_revision: bool = False
    order_index: int = 0
    due_day: int = 1
    completed_at: Optional[datetime.datetime] = None

    class Config:
        from_attributes = True

class TaskStatusUpdate(BaseModel):
    status: str = Field(..., pattern="^(not_started|in_progress|completed)$")

class PhaseOut(BaseModel):
    id: int
    roadmap_id: int
    title: str
    phase_number: int
    description: Optional[str] = None
    weeks_range: Optional[str] = None
    tasks: List[TaskOut] = []

    class Config:
        from_attributes = True

class RoadmapCreate(BaseModel):
    skill: str = Field(..., min_length=1, max_length=100)
    level: str = Field("Beginner", pattern="^(Beginner|Intermediate|Advanced)$")
    career_goal: Optional[str] = Field("Software Engineer", max_length=150)
    daily_study_time: int = Field(45, ge=15, le=480) # 15 min to 8 hours
    duration_weeks: Optional[int] = Field(8, ge=2, le=52)
    preferences: Optional[str] = Field(None, max_length=500)

class RoadmapOut(BaseModel):
    id: int
    user_id: int
    title: str
    skill: str
    level: str
    career_goal: Optional[str] = None
    daily_study_time: int
    duration_weeks: int
    description: Optional[str] = None
    status: str
    completion_percentage: float
    total_tasks: int
    completed_tasks: int
    created_at: datetime.datetime
    updated_at: datetime.datetime
    phases: List[PhaseOut] = []

    class Config:
        from_attributes = True

class RoadmapAdaptRequest(BaseModel):
    reason: Optional[str] = "Performance and schedule adjustment"
    include_weak_topics: bool = True
    recalculate_schedule: bool = True

class RoadmapAdaptPreview(BaseModel):
    roadmap_id: int
    weak_topics_detected: List[str]
    overdue_tasks_count: int
    revision_tasks_added: int
    explanation: str
    changes: List[str]

# --- Learning Resources Schemas ---
class ResourceOut(BaseModel):
    id: int
    title: str
    resource_type: str
    description: Optional[str] = None
    skill: str
    topic: str
    url: str
    is_completed: bool
    completed_at: Optional[datetime.datetime] = None

    class Config:
        from_attributes = True

class ResourceToggle(BaseModel):
    is_completed: bool

# --- Assessment Schemas ---
class QuestionOut(BaseModel):
    id: int
    skill: str
    difficulty: str
    topic: str
    question: str
    options: List[str]

    class Config:
        from_attributes = True

class AnswerSubmission(BaseModel):
    question_id: int
    selected_option_index: int

class AssessmentSubmit(BaseModel):
    skill: str
    difficulty: str
    answers: List[AnswerSubmission]

class QuestionBreakdown(BaseModel):
    question_id: int
    question: str
    topic: str
    options: List[str]
    selected_option_index: int
    correct_option_index: int
    is_correct: bool
    explanation: str

class AssessmentResultOut(BaseModel):
    id: int
    skill: str
    difficulty: str
    score: int
    total_questions: int
    percentage: float
    weak_topics: List[str]
    recommended_level: str
    created_at: datetime.datetime
    breakdowns: List[QuestionBreakdown] = []

# --- Goals, Streaks, Achievements ---
class DailyGoalUpdate(BaseModel):
    daily_goal_minutes: int = Field(..., ge=10, le=480)

class LogActivityRequest(BaseModel):
    minutes_spent: int = Field(..., ge=0, le=1440)
    tasks_completed: int = Field(0, ge=0)
    date: Optional[str] = None

class StreakOut(BaseModel):
    current_streak: int
    longest_streak: int
    last_activity_date: Optional[str]
    today_minutes: int
    daily_goal_minutes: int
    today_tasks: int
    goal_completed_today: bool

class AchievementOut(BaseModel):
    badge_code: str
    title: str
    description: str
    icon: str
    category: str
    unlocked_at: Optional[datetime.datetime] = None
    is_unlocked: bool = False

# --- Assistant Schemas ---
class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)
    session_id: Optional[str] = "default"
    roadmap_id: Optional[int] = None

class ChatResponse(BaseModel):
    reply: str
    is_ai_generated: bool
    provider_note: str
    tool_invocations: Optional[List[Dict[str, Any]]] = None

# --- Analytics & Reports ---
class AnalyticsOverview(BaseModel):
    total_roadmaps: int
    completed_roadmaps: int
    total_tasks: int
    completed_tasks: int
    overall_progress_percentage: float
    total_quizzes_taken: int
    average_quiz_score: float
    current_streak: int
    longest_streak: int
    total_hours_learned: float
    recent_activities: List[Dict[str, Any]]
    weak_topics_summary: List[str]

class CompletionReport(BaseModel):
    learner_name: str
    generated_at: str
    roadmaps_summary: List[Dict[str, Any]]
    assessments_summary: List[Dict[str, Any]]
    total_tasks_completed: int
    total_hours_spent: float
    milestones_achieved: List[str]
    skills_practiced: List[str]
    disclaimer: str
