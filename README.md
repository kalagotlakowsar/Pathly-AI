# Pathly — Your Personal Learning Journey 🧭✨
### MCP-Powered Intelligent Learning Path Generator & Study Platform

**Pathly** is a complete, full-stack, personal learning web platform that empowers students and developers to diagnose skill levels, generate structured roadmaps, discover verified learning resources, practice high-yield concepts, track real study progress, and dynamically adapt study schedules.

It includes a native **Model Context Protocol (MCP)** server built with the official Python MCP SDK, exposing real tools that can be discovered and invoked by any MCP-compatible AI client.

---

## 🌐 Live Demo

🚀 **Try Pathly:** https://pathly-ai-navy.vercel.app/

💻 **Source Code:** https://github.com/kalagotlakowsar/Pathly-AI

## 🌟 Highlights & Key Features

### 1. Personalized Roadmap Generator
- **Multi-Phase Curriculums:** Structured by phases, week ranges, daily study allocations, and milestone projects.
- **Skill Coverage:** Deep, curated templates for **Python**, **JavaScript**, **Web Development**, **DSA**, **SQL**, **Java**, **Machine Learning**, and **Cybersecurity**, plus dynamic synthesis for any custom technology (Go, Rust, Flutter, Docker, etc.).
- **Full CRUD Persistence:** Create multiple roadmaps, edit task progress, delete plans, and recalculate progress percentages in SQLite.

### 2. Smart Skill Assessment
- **Objective Multi-Choice Diagnostics:** 1 question at a time with option selection, previous/next controls, and instant submission.
- **Empirical Scoring:** Calculates real percentages based on actual answers (never hardcoded mock scores).
- **Weak Topic Extraction:** Automatically identifies weak topics from incorrect answers.
- **Level Recommendation:** Recommends starting level (Beginner, Intermediate, Advanced) and offers 1-click tailored roadmap generation.

### 3. Curated Learning Catalog
- **Verified Resources:** Links to official documentation (MDN, Python.org, Oracle, PostgreSQL, OWASP) and reputable tutorials/videos.
- **Filtering & Search:** Filter by skill, topic, and resource type (Documentation, Tutorial, Video, Practice).
- **Persistent Progress:** Checkboxes persist completed resources to the database.

### 4. Adaptive Roadmap Engine
- **Schedule Recalibration:** Analyzes historical assessment attempts to find weak areas and missed tasks.
- **Revision Injections:** Adds reinforcement tasks for weak topics without erasing completed work.
- **Interactive Confirmation:** Explains the reasons for the schedule change before applying.

### 5. Genuine Goals, Streaks & Badges
- **Real Streak Calculation:** Calculated strictly from logged study sessions and completed tasks using calendar dates.
- **Daily Target Slider:** Set and update daily study minute goals.
- **9 Achievement Badges:** Earn badges (`First Step`, `Pathfinder`, `Skill Tester`, `Quiz Master`, `Consistency Spark`, `Habit Builder`, `Halfway Hero`, `Roadmap Graduate`, `Resource Explorer`) with unlocked timestamps.

### 6. Career-Based Roadmaps
- **7 Pre-Configured Pathways:** Frontend Developer, Backend Developer, Full-Stack Developer, Python Developer, Java Developer, Data Analyst, and ML Engineer.
- **Prerequisite Ordering & Milestones:** Explains ordered skills and realistic expectations with an honest career guidance disclaimer.
- **1-Click Generation:** Converts any career pathway into a personal roadmap.

### 7. AI Learning Assistant with Transparent Fallback
- **Conversational Tutor:** Explains programming concepts, reviews quiz mistakes, recommends next roadmap tasks, and finds resources.
- **Optional Gemini API:** Connects to Google Gemini 2.5 Flash if `GEMINI_API_KEY` is present in `.env`.
- **Honest Attribution:** Transparently tags responses with `"Powered by Google Gemini 2.5 Flash"` or `"Pathly Rule-based Engine (No API key required)"`.

### 8. Official Model Context Protocol (MCP) Server
- **Official Python MCP SDK (`mcp`):** Implemented in `backend/mcp_server.py`.
- **6 Real MCP Tools:**
  1. `generate_learning_roadmap`: Synthesizes and saves a new roadmap.
  2. `get_learning_roadmap`: Retrieves saved roadmap details and progress.
  3. `search_learning_resources`: Queries verified resources catalog.
  4. `update_task_progress`: Modifies task status and recalculates progress.
  5. `get_weak_topics`: Extracts weak areas from past assessments.
  6. `recommend_next_task`: Identifies the next logical incomplete task.
- **Standalone MCP Client Test:** Verified with `python tests/test_mcp_client.py`.

### 9. Personal Completion Report
- **Authentic Summary:** Compiles created roadmaps, completed tasks, assessment history, milestones, and total hours studied.
- **Print & PDF Support:** Clean print layout with personal disclaimer clarifying it is a personal progress summary.

---

## 🎨 Pastel Design System

Pathly uses a pleasant, modern educational aesthetic:
- **Palette:** Soft lavender (`#E8E5F8`), blush pink (`#FCE7F0`), pastel blue (`#E0F2FE`), mint green (`#DCFCE7`), warm amber (`#FEF3C7`), and clean cream surfaces.
- **Typography:** High-legibility *Plus Jakarta Sans* and *JetBrains Mono*.
- **Pastel Dark Mode:** Soft deep indigo background with luminous pastel accents, toggled via Navbar or Settings.

---

## 📁 Project Structure

```text
Pathly/
├── backend/
│   ├── app/
│   │   ├── api/                  # FastAPI REST routes (roadmaps, assessments, resources, etc.)
│   │   ├── models/               # SQLAlchemy SQLite database models
│   │   ├── schemas/              # Pydantic v2 validation schemas
│   │   ├── services/             # Core business logic (curriculum, streaks, adaptive, AI)
│   │   ├── config.py             # Settings & environment variables
│   │   ├── database.py           # Engine & SessionLocal setup
│   │   └── main.py               # FastAPI application entrypoint & lifespan seeder
│   ├── tests/
│   │   ├── test_api.py           # Pytest suite for all REST endpoints
│   │   ├── test_mcp_server.py    # Pytest suite for MCP server tools
│   │   └── test_mcp_client.py    # Standalone interactive MCP client verification runner
│   ├── mcp_server.py             # Dedicated Model Context Protocol server
│   ├── run_server.py             # Local Uvicorn backend launcher
│   └── requirements.txt          # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/           # Navbar, Sidebar, ProgressBar, Modal
│   │   ├── pages/                # 12 fully functional pages
│   │   ├── services/api.js       # Centralized API client
│   │   ├── styles/index.css      # Pastel design tokens & CSS rules
│   │   ├── App.jsx               # React Router configuration
│   │   └── main.jsx              # React DOM entrypoint
│   ├── index.html                # HTML template with Google Fonts
│   ├── vite.config.js            # Vite config with backend proxy
│   └── package.json              # Frontend npm dependencies
├── .env.example                  # Environment template
├── .gitignore                    # Git ignore file
└── README.md                     # Complete project documentation
```

---

## 🚀 Getting Started

### Prerequisites
- **Python 3.10+** (Tested on Python 3.14)
- **Node.js 18+** and **npm**

---

### Step 1: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create and activate Python virtual environment
python -m venv venv

# Windows
.\venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# (Optional) Configure Gemini API Key
# Copy .env.example to .env in root or set environment variable:
# set GEMINI_API_KEY=your_key_here

# Run automated tests to verify backend & MCP
pytest -v

# Run the standalone MCP client verification
python tests/test_mcp_client.py

# Launch the FastAPI server (Runs on http://127.0.0.1:8000)
python run_server.py
```

FastAPI interactive documentation will be available at **`http://127.0.0.1:8000/docs`**.

---

### Step 2: Frontend Setup

In a new terminal window:

```bash
# Navigate to frontend directory
cd frontend

# Install npm dependencies
npm install

# Start Vite development server (Runs on http://localhost:5173)
npm run dev
```

Open **`http://localhost:5173`** in your browser to explore Pathly!

---

### Step 3: Running the Dedicated MCP Server

The MCP server runs over standard I/O (stdio) and can be connected to any MCP client (Claude Desktop, Cursor, MCP Inspector, etc.):

```bash
cd backend
python mcp_server.py
```

#### MCP Client Configuration Example (`claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "pathly": {
      "command": "python",
      "args": ["C:/Users/kalag/OneDrive/Desktop/Pathly/backend/mcp_server.py"]
    }
  }
}
```

---

## 🧪 Testing Verification Summary

Pathly includes 16 automated tests covering the entire software stack:
- **API Tests (`test_api.py`):**
  - Health check & database seeding
  - Roadmap generation & invalid input validation (422)
  - Task status transitions & progress recalculation
  - Assessment question fetching & real scoring
  - Weak-topic extraction & adaptive schedule preview/application
  - Resource filtering & completion toggles
  - Daily goals, activity logging, and streak calculations
  - AI Assistant fallback attribution
  - Career pathways & Completion report generation
- **MCP Server Tests (`test_mcp_server.py` & `test_mcp_client.py`):**
  - Tool discovery for all 6 tools
  - Direct execution of `generate_learning_roadmap`, `get_learning_roadmap`, `search_learning_resources`, `update_task_progress`, `get_weak_topics`, and `recommend_next_task`
  - Direct verification of persisted mutations in SQLite (`pathly.db`).

Run all tests anytime with:
```bash
pytest backend/tests/ -v
```

---

## 🔒 Security & Data Integrity

- **Safe Defaults:** Works fully offline with local SQLite without requiring any paid API.
- **Environment Separation:** API keys are never stored in client bundles or committed to source control.
- **No Dynamic Code Execution:** All roadmap generations, adaptive calculations, and diagnostic scoring use safe, deterministic algorithms.

---

## 📄 License
MIT License. Built with ❤️ for lifelong learners.
