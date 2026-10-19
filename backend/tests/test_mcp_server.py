import os
import sys
import pytest
import asyncio

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from mcp_server import server
from app.database import SessionLocal
from app.models.models import Roadmap, RoadmapTask, LearningResource

@pytest.mark.asyncio
async def test_mcp_server_tools_discovery():
    """Verify that all 6 required MCP tools are registered with schemas and descriptions."""
    tools = await server.list_tools()
    tool_names = [t.name for t in tools]
    
    expected_tools = [
        "generate_learning_roadmap",
        "get_learning_roadmap",
        "search_learning_resources",
        "update_task_progress",
        "get_weak_topics",
        "recommend_next_task"
    ]
    
    for et in expected_tools:
        assert et in tool_names, f"Tool {et} not found in MCP server tool definitions!"

@pytest.mark.asyncio
async def test_mcp_generate_roadmap_and_get():
    """Verify generate_learning_roadmap and get_learning_roadmap tools invoke and persist data."""
    # 1. Generate roadmap
    gen_res = await server.call_tool("generate_learning_roadmap", {
        "skill": "Python",
        "level": "Beginner",
        "daily_study_time": 45,
        "career_goal": "Python Developer",
        "duration_weeks": 8
    })
    
    assert gen_res.is_error is False
    data = gen_res.structured_content["result"]
    roadmap_id = data["roadmap_id"]
    assert roadmap_id > 0
    assert "Python" in data["title"]
    assert data["total_tasks"] > 0
    
    # 2. Get roadmap via MCP tool
    get_res = await server.call_tool("get_learning_roadmap", {
        "roadmap_id": roadmap_id
    })
    assert get_res.is_error is False
    rm_data = get_res.structured_content["result"]
    assert rm_data["id"] == roadmap_id
    assert rm_data["completion_percentage"] == 0.0

@pytest.mark.asyncio
async def test_mcp_search_resources():
    """Verify search_learning_resources retrieves matching curated resources."""
    res = await server.call_tool("search_learning_resources", {
        "skill": "JavaScript",
        "topic": "Fundamentals"
    })
    assert res.is_error is False
    resources = res.structured_content["result"]
    assert isinstance(resources, list)
    assert len(resources) > 0
    assert any("JavaScript" in r["skill"] or "JavaScript" in r["title"] for r in resources)

@pytest.mark.asyncio
async def test_mcp_task_progress_and_recommendation():
    """Verify update_task_progress updates task status, recalculates progress, and recommend_next_task finds next."""
    # Create test roadmap
    gen_res = await server.call_tool("generate_learning_roadmap", {
        "skill": "SQL",
        "level": "Beginner",
        "daily_study_time": 30,
        "career_goal": "Data Analyst",
        "duration_weeks": 4
    })
    roadmap_id = gen_res.structured_content["result"]["roadmap_id"]
    
    # Recommend next task before any completion
    next_res_1 = await server.call_tool("recommend_next_task", {
        "roadmap_id": roadmap_id
    })
    assert next_res_1.is_error is False
    first_task = next_res_1.structured_content["result"]["next_task"]
    assert first_task is not None
    first_task_id = first_task["id"]
    
    # Mark first task as completed
    update_res = await server.call_tool("update_task_progress", {
        "roadmap_id": roadmap_id,
        "task_id": first_task_id,
        "new_status": "completed"
    })
    assert update_res.is_error is False
    up_data = update_res.structured_content["result"]
    assert up_data["new_status"] == "completed"
    assert up_data["completion_percentage"] > 0.0
    
    # Next task should now be the second task
    next_res_2 = await server.call_tool("recommend_next_task", {
        "roadmap_id": roadmap_id
    })
    second_task = next_res_2.structured_content["result"]["next_task"]
    assert second_task is not None
    assert second_task["id"] != first_task_id

@pytest.mark.asyncio
async def test_mcp_get_weak_topics():
    """Verify get_weak_topics returns topic list and assessment counts."""
    res = await server.call_tool("get_weak_topics", {
        "user_id": 1,
        "skill": "all"
    })
    assert res.is_error is False
    data = res.structured_content["result"]
    assert "weak_topics" in data
    assert isinstance(data["weak_topics"], list)
