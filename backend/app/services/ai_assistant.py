import os
import json
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.config import settings
from app.models.models import ChatMessage, Roadmap, RoadmapTask, AssessmentAttempt, LearningResource
from app.services.roadmap_engine import recommend_next_task_logic

KNOWLEDGE_BASE = {
    "python": "Python is a high-level, interpreted programming language renowned for its clean syntax and readability. Key concepts include dynamic typing, list comprehensions, decorators, generators, and a massive ecosystem of libraries spanning web development (FastAPI/Django) and data science (Pandas/PyTorch).",
    "closure": "A closure in JavaScript is an inner function that preserves access to its outer lexical scope variables, even after the parent function has finished executing. Closures enable private variables, currying, and memoization patterns.",
    "sql join": "In SQL, JOIN clauses combine rows from two or more tables based on a related column. INNER JOIN returns matching rows only; LEFT JOIN preserves all rows from the left table and fills unmatched right rows with NULL; FULL OUTER JOIN retains all records from both sides.",
    "big o": "Big-O notation describes the limiting behavior of an algorithm's time or space complexity as input size (n) grows asymptotically. Common complexities from fastest to slowest: O(1) constant, O(log n) logarithmic, O(n) linear, O(n log n) linearithmic, and O(n^2) quadratic.",
    "react hooks": "React Hooks (introduced in React 16.8) allow function components to utilize state and lifecycle features. Essential hooks include `useState` for state variables, `useEffect` for synchronization and data fetching, `useContext` for global theme or auth context, and `useMemo`/`useCallback` for performance optimization.",
    "rest api": "REST (Representational State Transfer) is an architectural style for networked web services. It utilizes standard HTTP methods: GET (read), POST (create), PUT/PATCH (update), and DELETE (remove), communicating stateless payloads typically encoded in JSON."
}

def generate_rule_based_response(db: Session, message: str, roadmap_id: Optional[int] = None, user_id: int = 1) -> str:
    msg_lower = message.lower()

    # 1. Ask about what to learn next / next task
    if any(k in msg_lower for k in ["next task", "what should i learn", "what next", "continue learning", "next step"]):
        target_roadmap = None
        if roadmap_id:
            target_roadmap = db.query(Roadmap).filter(Roadmap.id == roadmap_id).first()
        if not target_roadmap:
            target_roadmap = db.query(Roadmap).filter(Roadmap.user_id == user_id, Roadmap.status == "in_progress").first()

        if target_roadmap:
            next_task = recommend_next_task_logic(db, target_roadmap.id)
            if next_task:
                return (
                    f"**Recommended Next Step:**\n\n"
                    f"For your **{target_roadmap.title}**, your next recommended task is:\n"
                    f"- **Task:** {next_task.title}\n"
                    f"- **Topic:** `{next_task.topic}`\n"
                    f"- **Estimated Time:** {next_task.estimated_minutes} minutes\n"
                    f"- **Description:** {next_task.description}\n\n"
                    f"Current roadmap progress: **{target_roadmap.completion_percentage}%** ({target_roadmap.completed_tasks}/{target_roadmap.total_tasks} tasks completed)."
                )
            else:
                return f"Congratulations! You have completed all tasks in your **{target_roadmap.title}**! You can review or create a new roadmap."
        else:
            return "You don't have an active roadmap yet. Head over to **Create Roadmap** to get a personalized curriculum tailored to your goals!"

    # 2. Ask about quiz mistakes or weak topics
    if any(k in msg_lower for k in ["weak topic", "quiz mistake", "assessment", "why did i fail", "my weaknesses"]):
        latest_att = db.query(AssessmentAttempt).filter(
            AssessmentAttempt.user_id == user_id
        ).order_by(AssessmentAttempt.created_at.desc()).first()

        if latest_att:
            weaks = latest_att.get_weak_topics()
            if weaks:
                return (
                    f"**Analysis of Your Recent Assessment ({latest_att.skill} - {latest_att.difficulty}):**\n\n"
                    f"- **Score:** {latest_att.score}/{latest_att.total_questions} ({latest_att.percentage}%)\n"
                    f"- **Identified Weak Areas:** {', '.join(weaks)}\n"
                    f"- **Recommendation:** We advise focusing extra revision on `{', '.join(weaks)}`. You can use the **Adaptive Roadmap** tool to automatically add reinforcement tasks to your schedule."
                )
            else:
                return f"Great news! In your latest assessment for **{latest_att.skill}**, you scored {latest_att.score}/{latest_att.total_questions} ({latest_att.percentage}%) with no detected weak areas. You are ready for the next difficulty level!"
        else:
            return "You haven't completed any skill assessments yet. Take a quick quiz under **Skill Assessment** to diagnose your starting level and pinpoint any gaps."

    # 3. Concepts from knowledge base
    for topic_key, explanation in KNOWLEDGE_BASE.items():
        if topic_key in msg_lower:
            return f"### Conceptual Overview: {topic_key.title()}\n\n{explanation}\n\n*Tip: Check the **Learning Resources** section for official documentation and interactive exercises.*"

    # 4. Resource recommendations
    if any(k in msg_lower for k in ["resource", "docs", "where can i read", "tutorial", "video"]):
        resources = db.query(LearningResource).limit(3).all()
        res_list = "\n".join([f"- [{r.title}]({r.url}) ({r.resource_type} for {r.skill})" for r in resources])
        return (
            f"Here are top curated learning resources from our verified catalog:\n\n{res_list}\n\n"
            f"You can explore the full catalog with skill filters under **Learning Resources**."
        )

    # 5. General intelligent learning mentor guidance
    return (
        f"I'm **Pathly AI Assistant**, your personal learning companion. I can help you with:\n\n"
        f"1. **Explaining concepts:** Ask me about Python, JavaScript, React, SQL, Big-O, Closures, or OOP.\n"
        f"2. **Next Task Guidance:** Ask *'What should I learn next?'* to find your highest priority roadmap task.\n"
        f"3. **Assessment Breakdown:** Ask *'What are my weak topics?'* to review your quiz performance.\n"
        f"4. **Resources:** Ask *'Recommend resources for SQL'* to get direct verified tutorials.\n\n"
        f"How can I assist your study session right now?"
    )

def handle_chat_query(
    db: Session,
    message: str,
    session_id: str = "default",
    roadmap_id: Optional[int] = None,
    user_id: int = 1
) -> Dict[str, Any]:
    api_key = settings.GEMINI_API_KEY.strip()
    is_ai = False
    provider_note = "Pathly Rule Engine (Deterministic Fallback)"
    reply_text = ""

    # Check if Gemini API is available and configured
    if api_key:
        try:
            from google import genai
            client = genai.Client(api_key=api_key)

            # Build context prompt
            context = "You are Pathly AI, an encouraging and expert technical tutor."
            if roadmap_id:
                rm = db.query(Roadmap).filter(Roadmap.id == roadmap_id).first()
                if rm:
                    context += f" The student is currently following the '{rm.title}' roadmap at {rm.completion_percentage}% completion."

            prompt = f"{context}\n\nStudent question: {message}\n\nProvide a concise, encouraging, and clear technical answer with code examples where relevant."
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt
            )
            if response and response.text:
                reply_text = response.text
                is_ai = True
                provider_note = "Powered by Google Gemini 2.5 Flash"
        except Exception as e:
            # Graceful fallback to rule engine on network/API failure
            reply_text = generate_rule_based_response(db, message, roadmap_id, user_id)
            provider_note = f"Pathly Rule Engine (Fallback: API error or missing quota)"
    else:
        # Transparent rule engine fallback
        reply_text = generate_rule_based_response(db, message, roadmap_id, user_id)
        provider_note = "Pathly Rule-based Engine (No API key configured)"

    # Persist message history
    user_msg = ChatMessage(
        user_id=user_id,
        session_id=session_id,
        role="user",
        content=message,
        is_ai_generated=False,
        provider_note="User"
    )
    db.add(user_msg)

    assistant_msg = ChatMessage(
        user_id=user_id,
        session_id=session_id,
        role="assistant",
        content=reply_text,
        is_ai_generated=is_ai,
        provider_note=provider_note
    )
    db.add(assistant_msg)
    db.commit()

    return {
        "reply": reply_text,
        "is_ai_generated": is_ai,
        "provider_note": provider_note,
        "tool_invocations": None
    }
