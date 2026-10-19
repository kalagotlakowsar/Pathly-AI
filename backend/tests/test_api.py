import os
import sys
import pytest
from fastapi.testclient import TestClient

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.main import app
from app.database import SessionLocal, Base, engine
from app.models.models import Roadmap, RoadmapTask, User

client = TestClient(app)

def setup_module():
    Base.metadata.create_all(bind=engine)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "Pathly API"

def test_verify_auth_session():
    # Ensure user 1 exists
    db = SessionLocal()
    user = db.query(User).filter(User.id == 1).first()
    if not user:
        user = User(id=1, name="Pathly Learner", email="learner@pathly.ai")
        db.add(user)
        db.commit()
    db.close()

    res = client.get("/api/auth/verify")
    assert res.status_code == 200
    data = res.json()
    assert data["authenticated"] is True
    assert "user" in data
    assert data["user"]["email"] == "learner@pathly.ai"

def test_auth_login_and_validation():
    # Valid login
    login_res = client.post("/api/auth/login", json={"email": "learner@pathly.ai", "password": "securepassword123"})
    assert login_res.status_code == 200
    login_data = login_res.json()
    assert login_data["authenticated"] is True
    assert "token" in login_data
    assert login_data["user"]["email"] == "learner@pathly.ai"

    # Invalid email format
    bad_email_res = client.post("/api/auth/login", json={"email": "invalidemail", "password": "pass"})
    assert bad_email_res.status_code == 422

    # Non-existent user
    unknown_res = client.post("/api/auth/login", json={"email": "nobody_nonexistent@example.com", "password": "pass"})
    assert unknown_res.status_code == 401

def test_auth_register_and_validation():
    # Valid registration
    reg_payload = {
        "name": "Jane Developer",
        "email": "jane.dev@example.com",
        "password": "strongpassword123",
        "target_career": "Cloud Architect",
        "current_level": "Intermediate"
    }
    reg_res = client.post("/api/auth/register", json=reg_payload)
    assert reg_res.status_code == 200
    reg_data = reg_res.json()
    assert reg_data["authenticated"] is True
    assert reg_data["user"]["name"] == "Jane Developer"

    # Password too short (< 6 chars)
    short_pw_res = client.post("/api/auth/register", json={
        "name": "Jane",
        "email": "jane@example.com",
        "password": "123"
    })
    assert short_pw_res.status_code == 422

def test_google_oauth_config():
    res = client.get("/api/auth/google/config")
    assert res.status_code == 200
    data = res.json()
    assert "configured" in data
    assert "message" in data

def test_create_and_list_roadmaps():
    # Test valid roadmap creation
    payload = {
        "skill": "Python",
        "level": "Beginner",
        "career_goal": "Python Developer",
        "daily_study_time": 45,
        "duration_weeks": 8,
        "preferences": "Project-based learning"
    }
    create_res = client.post("/api/roadmaps", json=payload)
    assert create_res.status_code == 200
    rm = create_res.json()
    assert rm["skill"] == "Python"
    assert rm["completion_percentage"] == 0.0
    assert len(rm["phases"]) > 0
    roadmap_id = rm["id"]

    # Test list roadmaps
    list_res = client.get("/api/roadmaps")
    assert list_res.status_code == 200
    all_rm = list_res.json()
    assert any(r["id"] == roadmap_id for r in all_rm)

    # Test get roadmap details
    get_res = client.get(f"/api/roadmaps/{roadmap_id}")
    assert get_res.status_code == 200
    assert get_res.json()["id"] == roadmap_id

def test_invalid_roadmap_inputs():
    # Test invalid study time (below min 15)
    bad_payload = {
        "skill": "Python",
        "level": "Beginner",
        "daily_study_time": 5 # min is 15
    }
    res = client.post("/api/roadmaps", json=bad_payload)
    assert res.status_code == 422

def test_task_status_updates_and_progress_recalculation():
    # Create roadmap
    rm = client.post("/api/roadmaps", json={
        "skill": "Web Development",
        "level": "Beginner",
        "daily_study_time": 30,
        "duration_weeks": 4
    }).json()
    roadmap_id = rm["id"]
    first_task = rm["phases"][0]["tasks"][0]
    task_id = first_task["id"]

    # Update to in_progress
    patch_res1 = client.patch(f"/api/roadmaps/{roadmap_id}/tasks/{task_id}", json={"status": "in_progress"})
    assert patch_res1.status_code == 200
    assert patch_res1.json()["status"] == "in_progress"

    # Update to completed
    patch_res2 = client.patch(f"/api/roadmaps/{roadmap_id}/tasks/{task_id}", json={"status": "completed"})
    assert patch_res2.status_code == 200
    assert patch_res2.json()["status"] == "completed"

    # Verify roadmap progress increased
    get_rm = client.get(f"/api/roadmaps/{roadmap_id}").json()
    assert get_rm["completed_tasks"] == 1
    assert get_rm["completion_percentage"] > 0.0

def test_assessment_flow_scoring_and_weak_topics():
    # 1. Fetch questions for Python Beginner
    q_res = client.get("/api/assessments/questions?skill=Python&difficulty=Beginner")
    assert q_res.status_code == 200
    questions = q_res.json()
    assert len(questions) > 0

    # 2. Submit answers: 1st correct, others intentionally wrong to test weak topics
    first_q = questions[0]
    second_q = questions[1] if len(questions) > 1 else questions[0]

    submission = {
        "skill": "Python",
        "difficulty": "Beginner",
        "answers": [
            {"question_id": first_q["id"], "selected_option_index": 1}, # check index
            {"question_id": second_q["id"], "selected_option_index": 99} # wrong index
        ]
    }
    sub_res = client.post("/api/assessments/submit", json=submission)
    assert sub_res.status_code == 200
    res_data = sub_res.json()
    assert "score" in res_data
    assert "percentage" in res_data
    assert "weak_topics" in res_data
    assert "breakdowns" in res_data
    assert len(res_data["breakdowns"]) == 2

    # Verify weak topics endpoint
    weak_res = client.get("/api/assessments/weak-topics?skill=Python")
    assert weak_res.status_code == 200
    assert isinstance(weak_res.json()["weak_topics"], list)

def test_learning_resources_filtering_and_completion():
    # List all resources
    res = client.get("/api/resources?skill=Python")
    assert res.status_code == 200
    items = res.json()
    assert len(items) > 0
    first_item = items[0]

    # Toggle completion
    toggle_res = client.patch(f"/api/resources/{first_item['id']}/toggle", json={"is_completed": True})
    assert toggle_res.status_code == 200
    assert toggle_res.json()["is_completed"] is True

def test_streaks_and_goals():
    # Check streak status
    streak_res = client.get("/api/streaks")
    assert streak_res.status_code == 200
    data = streak_res.json()
    assert "current_streak" in data
    assert "daily_goal_minutes" in data

    # Update daily goal
    goal_res = client.put("/api/streaks/daily-goal", json={"daily_goal_minutes": 60})
    assert goal_res.status_code == 200
    assert goal_res.json()["daily_goal_minutes"] == 60

    # Log manual study session
    log_res = client.post("/api/streaks/log-activity", json={"minutes_spent": 30, "tasks_completed": 1})
    assert log_res.status_code == 200
    assert log_res.json()["today_minutes"] >= 30

    # List achievements
    ach_res = client.get("/api/streaks/achievements")
    assert ach_res.status_code == 200
    assert len(ach_res.json()) >= 8

def test_adaptive_roadmap():
    # Create roadmap
    rm = client.post("/api/roadmaps", json={
        "skill": "Python",
        "level": "Beginner",
        "daily_study_time": 45,
        "duration_weeks": 6
    }).json()
    roadmap_id = rm["id"]

    # Preview adaptation
    prev_res = client.post(f"/api/roadmaps/{roadmap_id}/adapt/preview")
    assert prev_res.status_code == 200
    preview = prev_res.json()
    assert "explanation" in preview
    assert "changes" in preview

    # Apply adaptation
    apply_res = client.post(f"/api/roadmaps/{roadmap_id}/adapt/apply", json={
        "include_weak_topics": True,
        "recalculate_schedule": True
    })
    assert apply_res.status_code == 200
    assert apply_res.json()["status"] == "success"

def test_ai_assistant_rule_fallback_badge():
    chat_res = client.post("/api/assistant/chat", json={
        "message": "What is a closure in JavaScript?",
        "session_id": "test_session"
    })
    assert chat_res.status_code == 200
    chat_data = chat_res.json()
    assert "reply" in chat_data
    assert "is_ai_generated" in chat_data
    assert "provider_note" in chat_data
    assert len(chat_data["reply"]) > 20

def test_career_pathways():
    careers_res = client.get("/api/careers")
    assert careers_res.status_code == 200
    careers_data = careers_res.json()
    assert len(careers_data["careers"]) >= 7
    assert "disclaimer" in careers_data

    # Generate career roadmap
    gen_res = client.post("/api/careers/frontend-developer/generate?level=Beginner")
    assert gen_res.status_code == 200
    assert gen_res.json()["career_goal"] == "Frontend Developer"

def test_analytics_and_completion_report():
    # Overview
    overview_res = client.get("/api/analytics/overview")
    assert overview_res.status_code == 200
    overview = overview_res.json()
    assert overview["total_roadmaps"] > 0
    assert overview["total_tasks"] > 0

    # Completion report
    report_res = client.get("/api/analytics/report")
    assert report_res.status_code == 200
    report = report_res.json()
    assert "learner_name" in report
    assert "roadmaps_summary" in report
    assert "disclaimer" in report

def test_profile_settings_persistence():
    # 1. Fetch current profile
    get_res = client.get("/api/settings/profile")
    assert get_res.status_code == 200
    original = get_res.json()
    assert "name" in original
    assert "email" in original
    assert "daily_goal_minutes" in original

    # 2. Update profile with new name and daily goal
    update_payload = {
        "name": "Anu Updated",
        "email": "anu.updated@pathly.ai",
        "target_career": "Cloud Solutions Architect",
        "current_level": "Intermediate",
        "daily_goal_minutes": 75,
        "avatar": "sparkles"
    }
    put_res = client.put("/api/settings/profile", json=update_payload)
    assert put_res.status_code == 200
    updated_data = put_res.json()
    assert updated_data["name"] == "Anu Updated"
    assert updated_data["email"] == "anu.updated@pathly.ai"
    assert updated_data["target_career"] == "Cloud Solutions Architect"
    assert updated_data["current_level"] == "Intermediate"
    assert updated_data["daily_goal_minutes"] == 75
    assert updated_data["avatar"] == "sparkles"

    # 3. Verify persistence with a fresh GET
    verify_res = client.get("/api/settings/profile")
    assert verify_res.status_code == 200
    persisted = verify_res.json()
    assert persisted["name"] == "Anu Updated"
    assert persisted["daily_goal_minutes"] == 75
    assert persisted["email"] == "anu.updated@pathly.ai"

    # 4. Verify streaks reflect updated daily goal
    streak_res = client.get("/api/streaks")
    assert streak_res.status_code == 200
    assert streak_res.json()["daily_goal_minutes"] == 75

    # 5. Validation failure tests
    # Empty name
    bad_res_name = client.put("/api/settings/profile", json={"name": "   "})
    assert bad_res_name.status_code == 422

    # Invalid email
    bad_res_email = client.put("/api/settings/profile", json={"email": "invalid-email"})
    assert bad_res_email.status_code == 422

    # Out-of-range daily goal
    bad_res_goal = client.put("/api/settings/profile", json={"daily_goal_minutes": 2})
    assert bad_res_goal.status_code == 422

    # 6. Restore original profile
    restore_res = client.put("/api/settings/profile", json={
        "name": original["name"],
        "email": original["email"],
        "target_career": original.get("target_career", "Full-Stack Developer"),
        "current_level": original.get("current_level", "Beginner"),
        "daily_goal_minutes": original.get("daily_goal_minutes", 60),
        "avatar": original.get("avatar", "smile")
    })
    assert restore_res.status_code == 200
    assert restore_res.json()["name"] == original["name"]
    assert restore_res.json()["daily_goal_minutes"] == original["daily_goal_minutes"]

def test_google_oauth_config_and_token_verification():
    from unittest.mock import patch

    # 1. Unconfigured state: GOOGLE_CLIENT_ID is empty
    with patch("app.api.auth.settings.GOOGLE_CLIENT_ID", ""):
        config_res = client.get("/api/auth/google/config")
        assert config_res.status_code == 200
        unconf_data = config_res.json()
        assert unconf_data["configured"] is False
        assert unconf_data["client_id"] is None
        assert unconf_data["url"] is None
        assert "not configured" in unconf_data["message"].lower()

        # Attempt verify when unconfigured -> 400 Bad Request
        verify_res = client.post("/api/auth/google/verify", json={"credential": "some.token"})
        assert verify_res.status_code == 400
        assert "not configured" in verify_res.json()["detail"].lower()

    # 2. Configured state with GOOGLE_CLIENT_ID only (standard Google Identity Services Web Client ID)
    mock_id = "mock-client-id.apps.googleusercontent.com"
    with patch("app.api.auth.settings.GOOGLE_CLIENT_ID", mock_id), \
         patch("app.api.auth.settings.GOOGLE_CLIENT_SECRET", ""):
        config_res = client.get("/api/auth/google/config")
        assert config_res.status_code == 200
        conf_data = config_res.json()
        assert conf_data["configured"] is True
        assert conf_data["client_id"] == mock_id
        assert conf_data["url"] is None
        # Secret must never be in payload
        assert "secret" not in conf_data

    # 3. Configured state with both GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET
    with patch("app.api.auth.settings.GOOGLE_CLIENT_ID", mock_id), \
         patch("app.api.auth.settings.GOOGLE_CLIENT_SECRET", "super-secret-key"):
        config_res_full = client.get("/api/auth/google/config")
        assert config_res_full.status_code == 200
        full_data = config_res_full.json()
        assert full_data["configured"] is True
        assert full_data["client_id"] == mock_id
        assert full_data["url"] is not None
        assert "accounts.google.com" in full_data["url"]
        assert mock_id in full_data["url"]
        # Secret must never be leaked or present in the response
        assert "super-secret-key" not in str(full_data)
        assert "secret" not in full_data

    # 4. Token verification: empty credential -> 400 Bad Request
    with patch("app.api.auth.settings.GOOGLE_CLIENT_ID", mock_id):
        empty_res = client.post("/api/auth/google/verify", json={"credential": "   "})
        assert empty_res.status_code == 400

        # Tampered / invalid token rejected by cryptographic verification -> 401 Unauthorized
        invalid_res = client.post("/api/auth/google/verify", json={"credential": "invalid.jwt.token"})
        assert invalid_res.status_code == 401

        # 5. Valid cryptographic verification with new user
        mock_google_payload = {
            "iss": "https://accounts.google.com",
            "aud": mock_id,
            "sub": "google-user-998877",
            "email": "new.google.user@example.com",
            "email_verified": True,
            "name": "Alex GoogleUser",
            "picture": "https://lh3.googleusercontent.com/photo.jpg"
        }
        with patch("google.oauth2.id_token.verify_oauth2_token", return_value=mock_google_payload):
            success_res = client.post("/api/auth/google/verify", json={"credential": "valid.google.id.token"})
            assert success_res.status_code == 200
            data = success_res.json()
            assert data["authenticated"] is True
            assert "token" in data
            assert data["user"]["email"] == "new.google.user@example.com"
            assert data["user"]["name"] == "Alex GoogleUser"

            # 6. Same user signs in again -> should authenticate existing user
            success_res_2 = client.post("/api/auth/google/verify", json={"credential": "valid.google.id.token"})
            assert success_res_2.status_code == 200
            data_2 = success_res_2.json()
            assert data_2["authenticated"] is True
            assert data_2["user"]["id"] == data["user"]["id"]

def test_google_login_profile_sync_preserves_custom_settings():
    import uuid
    from unittest.mock import patch
    mock_id = "mock-client-id.apps.googleusercontent.com"
    email = f"sync.test.{uuid.uuid4().hex[:8]}@example.com"

    # Step 1: First-time Google login creates user with sensible defaults and Google avatar
    payload_1 = {
        "iss": "https://accounts.google.com",
        "aud": mock_id,
        "sub": f"google-user-{uuid.uuid4().hex[:8]}",
        "email": email,
        "email_verified": True,
        "name": "Original Google Name",
        "picture": "https://lh3.googleusercontent.com/avatar_original.jpg"
    }

    with patch("app.api.auth.settings.GOOGLE_CLIENT_ID", mock_id):
        with patch("google.oauth2.id_token.verify_oauth2_token", return_value=payload_1):
            login_1 = client.post("/api/auth/google/verify", json={"credential": "mock_id_token_1"})
            assert login_1.status_code == 200
            user_data_1 = login_1.json()["user"]
            token_1 = login_1.json()["token"]

            assert user_data_1["name"] == "Original Google Name"
            assert user_data_1["email"] == email
            assert user_data_1["avatar"] == "https://lh3.googleusercontent.com/avatar_original.jpg"
            assert user_data_1["target_career"] == "Full-Stack Developer"
            assert user_data_1["current_level"] == "Beginner"
            assert user_data_1["daily_goal_minutes"] == 45

    # Step 2: User customizes their profile in Settings
    headers_1 = {"Authorization": f"Bearer {token_1}"}
    update_payload = {
        "name": "Customized Name",
        "email": email,
        "target_career": "Lead AI Architect",
        "current_level": "Advanced",
        "daily_goal_minutes": 90,
        "avatar": "rocket"
    }
    update_res = client.put("/api/settings/profile", json=update_payload, headers=headers_1)
    assert update_res.status_code == 200
    updated_user = update_res.json()
    assert updated_user["target_career"] == "Lead AI Architect"
    assert updated_user["current_level"] == "Advanced"
    assert updated_user["daily_goal_minutes"] == 90

    # Step 3: User logs in again via Google with an updated name and photo from Google
    payload_2 = {
        "iss": "https://accounts.google.com",
        "aud": mock_id,
        "sub": f"google-user-{uuid.uuid4().hex[:8]}",
        "email": email,
        "email_verified": True,
        "name": "Updated Google Name",
        "picture": "https://lh3.googleusercontent.com/avatar_updated.jpg"
    }

    with patch("app.api.auth.settings.GOOGLE_CLIENT_ID", mock_id):
        with patch("google.oauth2.id_token.verify_oauth2_token", return_value=payload_2):
            login_2 = client.post("/api/auth/google/verify", json={"credential": "mock_id_token_2"})
            assert login_2.status_code == 200
            user_data_2 = login_2.json()["user"]
            token_2 = login_2.json()["token"]

            # Google identity fields are synchronized
            assert user_data_2["name"] == "Updated Google Name"
            assert user_data_2["avatar"] == "https://lh3.googleusercontent.com/avatar_updated.jpg"

            # Custom settings MUST BE PRESERVED and not overwritten with defaults
            assert user_data_2["target_career"] == "Lead AI Architect"
            assert user_data_2["current_level"] == "Advanced"
            assert user_data_2["daily_goal_minutes"] == 90

    # Step 4: GET /api/settings/profile with new token returns the preserved settings
    headers_2 = {"Authorization": f"Bearer {token_2}"}
    get_profile_res = client.get("/api/settings/profile", headers=headers_2)
    assert get_profile_res.status_code == 200
    profile_data = get_profile_res.json()
    assert profile_data["name"] == "Updated Google Name"
    assert profile_data["target_career"] == "Lead AI Architect"
    assert profile_data["current_level"] == "Advanced"
    assert profile_data["daily_goal_minutes"] == 90

def test_authenticated_settings_profile_isolation():
    import uuid
    uid = uuid.uuid4().hex[:8]
    email_a = f"alpha.{uid}@example.com"
    email_b = f"beta.{uid}@example.com"

    # Register User A
    res_a = client.post("/api/auth/register", json={
        "name": "User Alpha",
        "email": email_a,
        "password": "passwordAlpha123",
        "target_career": "Frontend Engineer",
        "current_level": "Beginner"
    })
    assert res_a.status_code == 200
    token_a = res_a.json()["token"]
    user_a_id = res_a.json()["user"]["id"]

    # Register User B
    res_b = client.post("/api/auth/register", json={
        "name": "User Beta",
        "email": email_b,
        "password": "passwordBeta123",
        "target_career": "Backend Engineer",
        "current_level": "Intermediate"
    })
    assert res_b.status_code == 200
    token_b = res_b.json()["token"]
    user_b_id = res_b.json()["user"]["id"]

    # Verify GET /api/settings/profile returns respective profiles
    profile_a = client.get("/api/settings/profile", headers={"Authorization": f"Bearer {token_a}"}).json()
    assert profile_a["id"] == user_a_id
    assert profile_a["name"] == "User Alpha"
    assert profile_a["target_career"] == "Frontend Engineer"

    profile_b = client.get("/api/settings/profile", headers={"Authorization": f"Bearer {token_b}"}).json()
    assert profile_b["id"] == user_b_id
    assert profile_b["name"] == "User Beta"
    assert profile_b["target_career"] == "Backend Engineer"

    # User A updates profile
    update_res_a = client.put("/api/settings/profile", json={
        "name": "Alpha Senior",
        "email": "alpha@example.com",
        "target_career": "Staff Frontend Engineer",
        "current_level": "Advanced",
        "daily_goal_minutes": 120
    }, headers={"Authorization": f"Bearer {token_a}"})
    assert update_res_a.status_code == 200
    assert update_res_a.json()["target_career"] == "Staff Frontend Engineer"

    # User B's profile must remain unchanged
    profile_b_after = client.get("/api/settings/profile", headers={"Authorization": f"Bearer {token_b}"}).json()
    assert profile_b_after["name"] == "User Beta"
    assert profile_b_after["target_career"] == "Backend Engineer"

    # Verify session for User A
    verify_a = client.get("/api/auth/verify", headers={"Authorization": f"Bearer {token_a}"}).json()
    assert verify_a["authenticated"] is True
    assert verify_a["user"]["name"] == "Alpha Senior"
    assert verify_a["user"]["target_career"] == "Staff Frontend Engineer"


