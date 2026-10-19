import os
import sys
import asyncio
import json

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from mcp_server import server
from app.database import SessionLocal
from app.models.models import Roadmap, RoadmapTask, LearningResource

async def main():
    print("=" * 60)
    print("   Pathly MCP Client Integration & Tool Verification")
    print("=" * 60)

    # 1. Discover Tools
    print("\n[Step 1] Discovering registered MCP tools...")
    tools = await server.list_tools()
    print(f"-> Discovered {len(tools)} MCP tools:")
    for t in tools:
        print(f"   • {t.name}: {t.description}")

    assert len(tools) >= 6, "Expected at least 6 MCP tools!"

    # 2. Invoke generate_learning_roadmap
    print("\n[Step 2] Invoking 'generate_learning_roadmap' (Skill: Python, Level: Beginner)...")
    gen_result = await server.call_tool("generate_learning_roadmap", {
        "skill": "Python",
        "level": "Beginner",
        "daily_study_time": 45,
        "career_goal": "Python Developer",
        "duration_weeks": 8
    })
    gen_data = gen_result.structured_content["result"]
    roadmap_id = gen_data["roadmap_id"]
    print(f"-> Successfully generated roadmap ID {roadmap_id}: '{gen_data['title']}' with {gen_data['total_tasks']} tasks.")

    # 3. Invoke get_learning_roadmap
    print(f"\n[Step 3] Invoking 'get_learning_roadmap' for ID {roadmap_id}...")
    get_result = await server.call_tool("get_learning_roadmap", {"roadmap_id": roadmap_id})
    get_data = get_result.structured_content["result"]
    print(f"-> Retrieved roadmap: {get_data['title']} (Progress: {get_data['completion_percentage']}%)")

    # 4. Invoke search_learning_resources
    print("\n[Step 4] Invoking 'search_learning_resources' (Skill: Python, Topic: Data Structures)...")
    res_result = await server.call_tool("search_learning_resources", {
        "skill": "Python",
        "topic": "Data Structures"
    })
    resources = res_result.structured_content["result"]
    print(f"-> Found {len(resources)} resources:")
    for r in resources[:2]:
        print(f"   • [{r['resource_type']}] {r['title']} -> {r['url']}")

    # 5. Invoke recommend_next_task
    print(f"\n[Step 5] Invoking 'recommend_next_task' for roadmap ID {roadmap_id}...")
    next_res = await server.call_tool("recommend_next_task", {"roadmap_id": roadmap_id})
    next_task = next_res.structured_content["result"]["next_task"]
    print(f"-> Recommended Next Task: '{next_task['title']}' (Difficulty: {next_task['difficulty']}, {next_task['estimated_minutes']} mins)")

    # 6. Invoke update_task_progress (Mutating persistent state)
    task_id = next_task["id"]
    print(f"\n[Step 6] Invoking 'update_task_progress' to complete task ID {task_id}...")
    up_result = await server.call_tool("update_task_progress", {
        "roadmap_id": roadmap_id,
        "task_id": task_id,
        "new_status": "completed"
    })
    up_data = up_result.structured_content["result"]
    print(f"-> Task '{up_data['title']}' updated to '{up_data['new_status']}'.")
    print(f"-> New Roadmap Completion: {up_data['completion_percentage']}% ({up_data['completed_tasks']}/{up_data['total_tasks']} tasks)")

    # 7. Invoke get_weak_topics
    print("\n[Step 7] Invoking 'get_weak_topics' for User 1...")
    weak_res = await server.call_tool("get_weak_topics", {"user_id": 1, "skill": "all"})
    weak_data = weak_res.structured_content["result"]
    print(f"-> Historical weak topics count: {len(weak_data['weak_topics'])} from {weak_data['total_assessments_analyzed']} assessments analyzed.")

    # 8. Verify SQLite Persistence Directly
    print("\n[Step 8] Directly verifying SQLite persistence in pathly.db...")
    with SessionLocal() as db:
        persisted_task = db.query(RoadmapTask).filter(RoadmapTask.id == task_id).first()
        assert persisted_task.status == "completed", "Task status did not persist to SQLite!"
        persisted_rm = db.query(Roadmap).filter(Roadmap.id == roadmap_id).first()
        assert persisted_rm.completed_tasks >= 1, "Roadmap completed tasks count did not persist!"
        print(f"-> VERIFIED: Task ID {persisted_task.id} status in SQLite is '{persisted_task.status}'.")
        print(f"-> VERIFIED: Roadmap ID {persisted_rm.id} progress in SQLite is {persisted_rm.completion_percentage}%.")

    print("\n" + "=" * 60)
    print("   ALL MCP TOOLS VERIFIED AND RUNNING SUCCESSFULLY!")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(main())
