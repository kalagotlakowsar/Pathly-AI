import datetime
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.models.models import Roadmap, RoadmapPhase, RoadmapTask, DailyActivity
from app.services.streak_engine import record_task_completion

BLUEPRINTS: Dict[str, Dict[str, Any]] = {
    "Python": {
        "Beginner": [
            {
                "phase_title": "Phase 1: Foundations & Control Flow",
                "weeks": "Weeks 1-2",
                "description": "Master core syntax, primitive types, operators, and decision making.",
                "tasks": [
                    {"title": "Set up Python & VS Code Environment", "topic": "Environment", "desc": "Install Python 3.12+, configure virtual environments, and install VS Code extensions.", "minutes": 45, "milestone": False},
                    {"title": "Variables, Primitive Types & Expressions", "topic": "Variables & Types", "desc": "Understand integers, floats, strings, booleans, and type casting with type().", "minutes": 30, "milestone": False},
                    {"title": "Conditional Logic & Truthiness", "topic": "Control Flow", "desc": "Master if/elif/else statements, boolean operators (and/or/not), and truthy/falsy values.", "minutes": 40, "milestone": False},
                    {"title": "Loops and Iterations (for & while)", "topic": "Control Flow", "desc": "Use range(), break, continue, and iterate through sequence collections.", "minutes": 45, "milestone": False},
                    {"title": "Mini Project: Interactive CLI Guessing Game", "topic": "Projects", "desc": "Build a command-line number guessing game with replay loops and score tracking.", "minutes": 60, "milestone": True}
                ]
            },
            {
                "phase_title": "Phase 2: Collections & Modular Functions",
                "weeks": "Weeks 3-4",
                "description": "Organize data in lists, dicts, tuples, and encapsulate logic into reusable functions.",
                "tasks": [
                    {"title": "Working with Lists & List Slicing", "topic": "Data Structures", "desc": "Explore indexing, slicing, append/pop, sorting, and list comprehensions.", "minutes": 40, "milestone": False},
                    {"title": "Dictionaries, Tuples & Sets", "topic": "Data Structures", "desc": "Fast key-value lookups, hashable tuples, and set union/intersection operations.", "minutes": 45, "milestone": False},
                    {"title": "Defining Functions, *args & **kwargs", "topic": "Functions", "desc": "Function signatures, default parameters, variable-length arguments, and return statements.", "minutes": 45, "milestone": False},
                    {"title": "Scope, Namespaces & Modules", "topic": "Modular Python", "desc": "Learn local vs global scope, importing standard libraries, and structuring package directories.", "minutes": 35, "milestone": False},
                    {"title": "Mini Project: Personal Expense Tracker CLI", "topic": "Projects", "desc": "Create a command line expense tracker storing categories and totals.", "minutes": 75, "milestone": True}
                ]
            },
            {
                "phase_title": "Phase 3: File I/O & Exception Handling",
                "weeks": "Weeks 5-6",
                "description": "Persist data to text and JSON files safely using robust error handling.",
                "tasks": [
                    {"title": "Reading and Writing Text & CSV Files", "topic": "File Handling", "desc": "Use open() with context managers (`with open`) and parse CSV rows.", "minutes": 45, "milestone": False},
                    {"title": "JSON Serialization and Parsing", "topic": "File Handling", "desc": "Serialize Python objects to JSON and parse incoming structured JSON payloads.", "minutes": 40, "milestone": False},
                    {"title": "Defensive Programming & Try/Except", "topic": "Error Handling", "desc": "Catch specific exceptions (ValueError, FileNotFoundError) and use finally blocks.", "minutes": 40, "milestone": False},
                    {"title": "Mini Project: Flashcard Quiz Loader with File Persistence", "topic": "Projects", "desc": "Build a CLI study tool that loads quiz decks from JSON files and records user mastery.", "minutes": 80, "milestone": True}
                ]
            },
            {
                "phase_title": "Phase 4: OOP Basics & Capstone Portfolio",
                "weeks": "Weeks 7-8",
                "description": "Construct object-oriented classes and deliver a polished capstone project.",
                "tasks": [
                    {"title": "Classes, Attributes & __init__", "topic": "OOP", "desc": "Define classes, instantiate objects, and encapsulate state with methods.", "minutes": 50, "milestone": False},
                    {"title": "Inheritance & Method Overriding", "topic": "OOP", "desc": "Build class hierarchies, call super(), and model domain entities cleanly.", "minutes": 45, "milestone": False},
                    {"title": "Capstone Project: Modular Task & Habit Management System", "topic": "Capstone", "desc": "Architect an end-to-end Python application with persistent data storage, CLI menus, and analytics.", "minutes": 120, "milestone": True}
                ]
            }
        ],
        "Intermediate": [
            {
                "phase_title": "Phase 1: Advanced Pythonic Idioms",
                "weeks": "Weeks 1-2",
                "description": "Master generators, decorators, magic methods, and context managers.",
                "tasks": [
                    {"title": "Generators & Memory Optimization", "topic": "Generators", "desc": "Implement lazy streaming data pipelines using yield and generator expressions.", "minutes": 50, "milestone": False},
                    {"title": "Custom Decorators & Closures", "topic": "Decorators", "desc": "Create parameterized decorators for execution timing, caching, and authentication checks.", "minutes": 60, "milestone": False},
                    {"title": "Dunder / Magic Methods & Operator Overloading", "topic": "OOP", "desc": "Implement __repr__, __str__, __eq__, __len__, and __getitem__ for custom objects.", "minutes": 50, "milestone": False},
                    {"title": "Custom Context Managers", "topic": "Context Managers", "desc": "Construct context managers with contextlib and class-based __enter__/__exit__ protocols.", "minutes": 45, "milestone": True}
                ]
            },
            {
                "phase_title": "Phase 2: Modern Web APIs with FastAPI",
                "weeks": "Weeks 3-4",
                "description": "Build high-performance REST APIs with async Python, Pydantic, and SQLAlchemy.",
                "tasks": [
                    {"title": "Asyncio Event Loop & Coroutines", "topic": "Async Programming", "desc": "Understand async/await, tasks, gather, and non-blocking I/O.", "minutes": 60, "milestone": False},
                    {"title": "FastAPI Routing & Pydantic Validation", "topic": "Web Frameworks", "desc": "Create typed request/response schemas and auto-generated Swagger documentation.", "minutes": 60, "milestone": False},
                    {"title": "Database Integration with SQLAlchemy 2.0", "topic": "Databases", "desc": "Model relational schemas, manage sessions, and execute queries via ORM.", "minutes": 70, "milestone": True}
                ]
            },
            {
                "phase_title": "Phase 3: Testing, Packaging & Deployment",
                "weeks": "Weeks 5-8",
                "description": "Write automated test suites with Pytest and containerize applications with Docker.",
                "tasks": [
                    {"title": "Unit & Integration Testing with Pytest", "topic": "Testing", "desc": "Write test fixtures, parameterized tests, and mock external API dependencies.", "minutes": 60, "milestone": False},
                    {"title": "Dockerizing a Python Service", "topic": "DevOps", "desc": "Write multi-stage Dockerfiles and run containerized services locally.", "minutes": 60, "milestone": False},
                    {"title": "Capstone Project: Production REST API Service with Test Suite", "topic": "Capstone", "desc": "Develop and deploy a complete authenticated API service with full test coverage.", "minutes": 150, "milestone": True}
                ]
            }
        ]
    },

    "JavaScript": {
        "Beginner": [
            {
                "phase_title": "Phase 1: JavaScript Fundamentals & Syntax",
                "weeks": "Weeks 1-2",
                "description": "Master ES6 variables, primitives, conditionals, and functions.",
                "tasks": [
                    {"title": "JS Runtime, Variables (let, const) & Data Types", "topic": "Variables & Scope", "desc": "Learn primitive vs reference types, typeof, and block scoping.", "minutes": 35, "milestone": False},
                    {"title": "Operators, Conditionals & Strict Equality", "topic": "Equality Operators", "desc": "Compare values with === vs ==, handle truthy/falsy, and write switch statements.", "minutes": 40, "milestone": False},
                    {"title": "Arrow Functions & Parameter Handling", "topic": "Functions", "desc": "Understand function expressions, concise arrow syntax, and default values.", "minutes": 40, "milestone": False},
                    {"title": "Mini Project: Tip & Split Calculator", "topic": "Projects", "desc": "Build an interactive CLI or browser calculator calculating percentages and splits.", "minutes": 50, "milestone": True}
                ]
            },
            {
                "phase_title": "Phase 2: Arrays, Objects & DOM Manipulation",
                "weeks": "Weeks 3-4",
                "description": "Manipulate structured data and dynamically update webpage interfaces.",
                "tasks": [
                    {"title": "Array Iteration: map, filter, reduce", "topic": "Arrays & Methods", "desc": "Transform, filter, and aggregate arrays without mutative side effects.", "minutes": 50, "milestone": False},
                    {"title": "Object Destructuring & Spread Operator", "topic": "Objects", "desc": "Destructure nested objects and clone arrays/objects with spread syntax.", "minutes": 40, "milestone": False},
                    {"title": "DOM Selection & Event Listeners", "topic": "DOM Manipulation", "desc": "Select nodes with querySelector and listen to click, change, and submit events.", "minutes": 55, "milestone": False},
                    {"title": "Mini Project: Dynamic Interactive To-Do Board", "topic": "Projects", "desc": "Build a responsive task list with live add, delete, and completion toggles.", "minutes": 80, "milestone": True}
                ]
            },
            {
                "phase_title": "Phase 3: Asynchronous JavaScript & APIs",
                "weeks": "Weeks 5-6",
                "description": "Fetch remote data and master modern asynchronous workflows.",
                "tasks": [
                    {"title": "Promises & The Fetch API", "topic": "Asynchronous JavaScript", "desc": "Resolve and reject Promises and consume public REST APIs with fetch().", "minutes": 50, "milestone": False},
                    {"title": "Async / Await and Try/Catch", "topic": "Asynchronous JavaScript", "desc": "Write readable asynchronous code handling network failures gracefully.", "minutes": 45, "milestone": False},
                    {"title": "Browser Storage (localStorage / sessionStorage)", "topic": "Web Storage", "desc": "Persist state and user preferences across page reloads using JSON parsing.", "minutes": 40, "milestone": False},
                    {"title": "Mini Project: Live Weather & Forecast Dashboard", "topic": "Projects", "desc": "Fetch live weather data from an API and render an interactive hourly forecast card.", "minutes": 90, "milestone": True}
                ]
            },
            {
                "phase_title": "Phase 4: Modular Code & Capstone",
                "weeks": "Weeks 7-8",
                "description": "Adopt ES Modules and assemble a portfolio project.",
                "tasks": [
                    {"title": "ES Modules (import / export) & Bundlers", "topic": "Modular Architecture", "desc": "Organize code into clean modular files and understand modern bundler workflows.", "minutes": 45, "milestone": False},
                    {"title": "Closures & Scope Mastery", "topic": "Closures", "desc": "Understand lexical scope, private variables, and factory functions.", "minutes": 50, "milestone": False},
                    {"title": "Capstone Project: Single-Page Recipe & Grocery Manager", "topic": "Capstone", "desc": "Architect an end-to-end SPA with API data, custom filtering, and persistent cart.", "minutes": 130, "milestone": True}
                ]
            }
        ]
    },

    "Web Development": {
        "Beginner": [
            {
                "phase_title": "Phase 1: Semantic HTML5 & Modern CSS",
                "weeks": "Weeks 1-2",
                "description": "Establish proper semantic page architecture and responsive styling principles.",
                "tasks": [
                    {"title": "Semantic HTML5 Elements & Accessibility", "topic": "Semantic HTML", "desc": "Construct accessible web structures using header, nav, main, article, and section.", "minutes": 40, "milestone": False},
                    {"title": "CSS Box Model, Typography & Color Systems", "topic": "CSS Box Model", "desc": "Control margins, padding, border-box sizing, and accessible contrast ratios.", "minutes": 45, "milestone": False},
                    {"title": "Flexbox Layout Fundamentals", "topic": "Responsive Design", "desc": "Master flex containers, justify-content, align-items, flex-grow, and flex-wrap.", "minutes": 50, "milestone": False},
                    {"title": "CSS Grid Essentials", "topic": "Modern CSS", "desc": "Build two-dimensional magazine and dashboard layouts with grid-template-columns and gaps.", "minutes": 50, "milestone": False},
                    {"title": "Mini Project: Responsive Product Showcase Landing Page", "topic": "Projects", "desc": "Build a responsive, modern product landing page across mobile and desktop breakpoints.", "minutes": 90, "milestone": True}
                ]
            },
            {
                "phase_title": "Phase 2: Interactive Web & Component Thinking",
                "weeks": "Weeks 3-4",
                "description": "Add dynamic interactions and start building with modern component libraries.",
                "tasks": [
                    {"title": "Responsive Navigation, Drawers & Modals", "topic": "Responsive UI", "desc": "Build accessible hamburger menus, modal dialogs, and slide-in panels.", "minutes": 50, "milestone": False},
                    {"title": "CSS Variables, Transitions & Theme Switching", "topic": "UI Styling", "desc": "Implement dark/light themes and pleasant micro-interactions using custom CSS properties.", "minutes": 45, "milestone": False},
                    {"title": "Form Validation & User Feedback", "topic": "Forms", "desc": "Enforce HTML5 validation constraints and provide clear inline error messages.", "minutes": 40, "milestone": False},
                    {"title": "Mini Project: Interactive Multi-Step Quiz Application", "topic": "Projects", "desc": "Build a multi-question interactive web quiz with instant feedback and score summary.", "minutes": 85, "milestone": True}
                ]
            },
            {
                "phase_title": "Phase 3: React Fundamentals & State Management",
                "weeks": "Weeks 5-6",
                "description": "Transition to React components, props, hooks, and virtual DOM rendering.",
                "tasks": [
                    {"title": "Vite Setup & JSX Component Architecture", "topic": "React", "desc": "Scaffold a Vite React app and compose declarative UI components.", "minutes": 45, "milestone": False},
                    {"title": "State Management with useState", "topic": "React State", "desc": "Manage component state, handle event handlers, and update arrays/objects immutably.", "minutes": 50, "milestone": False},
                    {"title": "Side Effects & Data Fetching with useEffect", "topic": "React Effects", "desc": "Synchronize with external systems, fetch data on mount, and handle cleanup functions.", "minutes": 55, "milestone": False},
                    {"title": "Mini Project: React Learning Resource Bookmark Vault", "topic": "Projects", "desc": "Create a React app with category tabs, search filtering, and bookmark toggles.", "minutes": 95, "milestone": True}
                ]
            },
            {
                "phase_title": "Phase 4: Client Routing & Capstone Web App",
                "weeks": "Weeks 7-8",
                "description": "Implement multi-page client routing and assemble a complete web application.",
                "tasks": [
                    {"title": "Client-Side Routing with React Router", "topic": "Routing", "desc": "Configure BrowserRouter, Routes, Route, NavLink, and URL parameter hooks.", "minutes": 50, "milestone": False},
                    {"title": "Global State & Context API", "topic": "State Management", "desc": "Avoid prop drilling by creating custom Context providers for user and theme settings.", "minutes": 55, "milestone": False},
                    {"title": "Capstone Project: Modern Developer Portfolio & Project Showcase", "topic": "Capstone", "desc": "Deliver a fully responsive, multi-page web application featuring projects, contact forms, and theme modes.", "minutes": 150, "milestone": True}
                ]
            }
        ]
    },

    "DSA": {
        "Beginner": [
            {
                "phase_title": "Phase 1: Complexity Analysis & Linear Data Structures",
                "weeks": "Weeks 1-2",
                "description": "Master Big-O time/space complexity, arrays, strings, and hash maps.",
                "tasks": [
                    {"title": "Big-O Asymptotic Analysis & Space Complexity", "topic": "Big-O Notation", "desc": "Analyze loop counts, recursion call stacks, and identify O(1), O(n), O(n^2), and O(log n).", "minutes": 45, "milestone": False},
                    {"title": "Array Manipulation & Two-Pointer Technique", "topic": "Problem Solving Patterns", "desc": "Solve problems using two-pointers (e.g., Two Sum II, Valid Palindrome, Reverse Array).", "minutes": 60, "milestone": False},
                    {"title": "Sliding Window Pattern", "topic": "Problem Solving Patterns", "desc": "Solve maximum subarray, longest substring without repeating characters, and minimum window problems.", "minutes": 60, "milestone": False},
                    {"title": "Hash Tables & Frequency Counting", "topic": "Data Structures", "desc": "Utilize hash maps for O(1) lookups to solve group anagrams and majority element problems.", "minutes": 50, "milestone": True}
                ]
            },
            {
                "phase_title": "Phase 2: Linked Lists, Stacks & Queues",
                "weeks": "Weeks 3-4",
                "description": "Implement node-based data structures and solve classic pointer problems.",
                "tasks": [
                    {"title": "Singly & Doubly Linked Lists", "topic": "Data Structures", "desc": "Implement insert, delete, reverse linked list, and detect cycles with Floyd's algorithm.", "minutes": 60, "milestone": False},
                    {"title": "Stack Principles & Monotonic Stacks", "topic": "Stacks & Queues", "desc": "Implement valid parentheses, daily temperatures, and evaluate reverse polish notation.", "minutes": 60, "milestone": False},
                    {"title": "Queues & Deques Implementation", "topic": "Stacks & Queues", "desc": "Implement BFS queue buffers and sliding window maximum with double-ended queues.", "minutes": 50, "milestone": True}
                ]
            },
            {
                "phase_title": "Phase 3: Trees & Binary Search",
                "weeks": "Weeks 5-6",
                "description": "Master divide-and-conquer binary search and hierarchical tree traversals.",
                "tasks": [
                    {"title": "Binary Search on Sorted & Rotated Arrays", "topic": "Binary Search", "desc": "Master boundary conditions, search in rotated sorted array, and search a 2D matrix.", "minutes": 60, "milestone": False},
                    {"title": "Binary Tree Traversals (Inorder, Preorder, Postorder)", "topic": "Trees & Graphs", "desc": "Implement recursive and iterative tree traversals and calculate maximum depth.", "minutes": 60, "milestone": False},
                    {"title": "Binary Search Trees (BST) & Validation", "topic": "Trees & Graphs", "desc": "Validate BST properties, search, insert, and find lowest common ancestor.", "minutes": 60, "milestone": True}
                ]
            },
            {
                "phase_title": "Phase 4: Graphs & Dynamic Programming Foundations",
                "weeks": "Weeks 7-8",
                "description": "Explore graph representations (BFS/DFS) and 1D memoization/tabulation.",
                "tasks": [
                    {"title": "Graph Representations: Adjacency Lists & BFS/DFS", "topic": "Trees & Graphs", "desc": "Traverse graphs, count connected components, and find shortest paths in unweighted graphs.", "minutes": 70, "milestone": False},
                    {"title": "Introduction to Dynamic Programming (1D Memoization)", "topic": "Algorithm Analysis", "desc": "Solve climbing stairs, coin change, and house robber via recurrence relations.", "minutes": 70, "milestone": False},
                    {"title": "Capstone Assessment: 5-Problem Mock Technical Interview", "topic": "Capstone", "desc": "Solve 5 curated mixed-topic interview problems under timed conditions.", "minutes": 120, "milestone": True}
                ]
            }
        ]
    },

    "SQL": {
        "Beginner": [
            {
                "phase_title": "Phase 1: Relational Concepts & Fundamental Queries",
                "weeks": "Weeks 1-2",
                "description": "Master table structures, SELECT statements, filtering, and ordering.",
                "tasks": [
                    {"title": "Relational Tables, Data Types & Primary Keys", "topic": "Relational Modeling", "desc": "Understand rows, columns, data types, primary keys, and foreign key relations.", "minutes": 40, "milestone": False},
                    {"title": "SELECT, WHERE Filtering & Pattern Matching", "topic": "Basic Queries", "desc": "Filter with AND/OR, IN, BETWEEN, LIKE, and handle NULL values with IS NULL.", "minutes": 45, "milestone": False},
                    {"title": "Sorting & Limiting Results (ORDER BY, LIMIT, OFFSET)", "topic": "Basic Queries", "desc": "Sort ascending/descending and paginate large result sets.", "minutes": 35, "milestone": True}
                ]
            },
            {
                "phase_title": "Phase 2: Multi-Table Joins & Aggregations",
                "weeks": "Weeks 3-4",
                "description": "Combine data across multiple normalized tables and aggregate business metrics.",
                "tasks": [
                    {"title": "INNER, LEFT, and RIGHT JOINs", "topic": "Joins", "desc": "Combine tables on foreign key keys and understand NULL handling in outer joins.", "minutes": 55, "milestone": False},
                    {"title": "Aggregate Functions (COUNT, SUM, AVG, MIN, MAX)", "topic": "Aggregations", "desc": "Calculate summary metrics across table rows.", "minutes": 40, "milestone": False},
                    {"title": "GROUP BY and HAVING Clauses", "topic": "Aggregations", "desc": "Group data by category and filter aggregated groups using HAVING.", "minutes": 50, "milestone": True}
                ]
            },
            {
                "phase_title": "Phase 3: Subqueries & Intermediate Modeling",
                "weeks": "Weeks 5-6",
                "description": "Write subqueries, CTEs, and schema DDL definitions.",
                "tasks": [
                    {"title": "Subqueries in WHERE and FROM clauses", "topic": "Subqueries", "desc": "Execute correlated subqueries and scalar subqueries.", "minutes": 50, "milestone": False},
                    {"title": "Common Table Expressions (WITH CTEs)", "topic": "Subqueries", "desc": "Structure complex multi-stage analytical queries cleanly using CTEs.", "minutes": 50, "milestone": False},
                    {"title": "DDL: CREATE TABLE, Constraints & ALTER", "topic": "Relational Modeling", "desc": "Create tables with unique constraints, check constraints, and default values.", "minutes": 45, "milestone": True}
                ]
            },
            {
                "phase_title": "Phase 4: Window Functions & Analytical Capstone",
                "weeks": "Weeks 7-8",
                "description": "Compute running totals, rankings, and deliver an analytics dashboard query suite.",
                "tasks": [
                    {"title": "Window Functions (ROW_NUMBER, RANK, DENSE_RANK)", "topic": "Analytics & Aggregations", "desc": "Partition and order window calculations without collapsing rows.", "minutes": 60, "milestone": False},
                    {"title": "Running Totals & Moving Averages (OVER, PARTITION BY)", "topic": "Analytics & Aggregations", "desc": "Compute financial trends, month-over-month growth, and cumulative sums.", "minutes": 55, "milestone": False},
                    {"title": "Capstone Project: E-Commerce Business Intelligence Query Suite", "topic": "Capstone", "desc": "Write a complete set of operational and analytical SQL reports for customer retention and revenue.", "minutes": 110, "milestone": True}
                ]
            }
        ]
    }
}

def generate_custom_blueprint(skill: str, level: str, career_goal: str) -> List[Dict[str, Any]]:
    """Synthesizes a structured 4-phase curriculum for custom or specialized skills."""
    return [
        {
            "phase_title": f"Phase 1: {skill} Fundamentals & Environment Setup",
            "weeks": "Weeks 1-2",
            "description": f"Master the core syntax, environment configuration, and foundational principles of {skill}.",
            "tasks": [
                {"title": f"Install & Configure {skill} Toolchain", "topic": "Environment", "desc": f"Set up the necessary compilers, package managers, and runtime tools for {skill}.", "minutes": 45, "milestone": False},
                {"title": f"{skill} Core Syntax & Primitives", "topic": f"{skill} Basics", "desc": f"Learn variables, primitive types, operators, and control flow conventions in {skill}.", "minutes": 40, "milestone": False},
                {"title": f"Control Structures & Functions in {skill}", "topic": f"{skill} Basics", "desc": f"Write idiomatic functions, error handling routines, and loops in {skill}.", "minutes": 45, "milestone": False},
                {"title": f"Mini Project: Starter CLI Application in {skill}", "topic": "Projects", "desc": f"Build a functional command-line utility implementing core {skill} logic.", "minutes": 70, "milestone": True}
            ]
        },
        {
            "phase_title": f"Phase 2: Data Modeling & Architecture in {skill}",
            "weeks": "Weeks 3-4",
            "description": f"Organize complex data, modular codebases, and domain abstractions in {skill}.",
            "tasks": [
                {"title": f"Data Structures & Collections in {skill}", "topic": "Data Modeling", "desc": f"Explore built-in collections, memory layout, and idiomatic data representations.", "minutes": 50, "milestone": False},
                {"title": f"Modular Architecture & Packages in {skill}", "topic": "Architecture", "desc": f"Deconstruct logic into reusable modules, libraries, and public APIs.", "minutes": 45, "milestone": False},
                {"title": f"Defensive Coding & Error Recovery in {skill}", "topic": "Error Handling", "desc": f"Implement robust error checking, logging, and graceful degradation.", "minutes": 45, "milestone": True}
            ]
        },
        {
            "phase_title": f"Phase 3: Applied Real-World Patterns & Workflows",
            "weeks": "Weeks 5-6",
            "description": f"Apply {skill} to real-world scenarios tailored toward becoming a {career_goal}.",
            "tasks": [
                {"title": f"Networking, APIs & I/O in {skill}", "topic": "I/O & APIs", "desc": f"Connect to remote services, read data streams, and persist state safely.", "minutes": 55, "milestone": False},
                {"title": f"Performance Tuning & Asynchronous Execution in {skill}", "topic": "Optimization", "desc": f"Identify performance bottlenecks and optimize throughput or latency.", "minutes": 55, "milestone": False},
                {"title": f"Mini Project: Service Integration & Data Processing Pipeline", "topic": "Projects", "desc": f"Construct an end-to-end data pipeline or service with {skill}.", "minutes": 85, "milestone": True}
            ]
        },
        {
            "phase_title": f"Phase 4: Testing, Production Readiness & Capstone Portfolio",
            "weeks": "Weeks 7-8",
            "description": f"Write comprehensive tests, document architecture, and complete a showcase capstone for {career_goal}.",
            "tasks": [
                {"title": f"Automated Testing & CI/CD for {skill}", "topic": "Testing", "desc": f"Write automated test suites and verify edge cases.", "minutes": 50, "milestone": False},
                {"title": f"Capstone Project: Full-Featured {skill} Portfolio Application", "topic": "Capstone", "desc": f"Deliver a complete, production-grade project demonstrating mastery in {skill}.", "minutes": 130, "milestone": True}
            ]
        }
    ]

def generate_and_save_roadmap(
    db: Session,
    user_id: int,
    skill: str,
    level: str = "Beginner",
    career_goal: str = "Software Engineer",
    daily_study_time: int = 45,
    duration_weeks: int = 8,
    preferences: Optional[str] = None
) -> Roadmap:
    # Match skill in predefined blueprints or create dynamic one
    matched_key = None
    for k in BLUEPRINTS.keys():
        if k.lower() in skill.lower() or skill.lower() in k.lower():
            matched_key = k
            break

    if matched_key:
        level_key = level if level in BLUEPRINTS[matched_key] else "Beginner"
        phases_data = BLUEPRINTS[matched_key].get(level_key, BLUEPRINTS[matched_key].get("Beginner"))
    else:
        phases_data = generate_custom_blueprint(skill, level, career_goal)

    title = f"{skill} Mastery Roadmap ({level})"
    description = f"A personalized {duration_weeks}-week curriculum targeting {daily_study_time} mins/day to become a confident {career_goal}."
    if preferences:
        description += f" Preference: {preferences}"

    roadmap = Roadmap(
        user_id=user_id,
        title=title,
        skill=skill,
        level=level,
        career_goal=career_goal,
        daily_study_time=daily_study_time,
        duration_weeks=duration_weeks,
        description=description,
        status="in_progress",
        completion_percentage=0.0,
        total_tasks=0,
        completed_tasks=0
    )
    db.add(roadmap)
    db.flush()

    total_tasks_count = 0
    day_counter = 1

    for idx, p_info in enumerate(phases_data, start=1):
        phase = RoadmapPhase(
            roadmap_id=roadmap.id,
            title=p_info["phase_title"],
            phase_number=idx,
            description=p_info.get("description", ""),
            weeks_range=p_info.get("weeks", f"Phase {idx}")
        )
        db.add(phase)
        db.flush()

        for t_idx, t_info in enumerate(p_info["tasks"], start=1):
            total_tasks_count += 1
            # Adjust estimated minutes proportionally based on user daily study time
            raw_min = t_info.get("minutes", daily_study_time)
            adjusted_min = max(20, min(180, int((raw_min / 45.0) * daily_study_time)))

            task = RoadmapTask(
                phase_id=phase.id,
                roadmap_id=roadmap.id,
                title=t_info["title"],
                description=t_info.get("desc", ""),
                topic=t_info.get("topic", skill),
                estimated_minutes=adjusted_min,
                difficulty=level,
                status="not_started",
                is_milestone=t_info.get("milestone", False),
                is_revision=False,
                order_index=total_tasks_count,
                due_day=day_counter
            )
            db.add(task)
            # Advance day counter every 1-2 tasks depending on daily study time
            day_counter += 1 if adjusted_min >= daily_study_time else 1

    roadmap.total_tasks = total_tasks_count
    roadmap.completed_tasks = 0
    roadmap.completion_percentage = 0.0

    db.commit()
    db.refresh(roadmap)
    return roadmap

def recalculate_roadmap_progress(db: Session, roadmap_id: int) -> Roadmap:
    roadmap = db.query(Roadmap).filter(Roadmap.id == roadmap_id).first()
    if not roadmap:
        return None

    tasks = db.query(RoadmapTask).filter(RoadmapTask.roadmap_id == roadmap_id).all()
    total = len(tasks)
    completed = sum(1 for t in tasks if t.status == "completed")

    percentage = round((completed / total * 100), 1) if total > 0 else 0.0

    roadmap.total_tasks = total
    roadmap.completed_tasks = completed
    roadmap.completion_percentage = percentage
    if percentage >= 100.0 and total > 0:
        roadmap.status = "completed"
    else:
        roadmap.status = "in_progress"

    db.commit()
    db.refresh(roadmap)
    return roadmap

def update_task_status(db: Session, task_id: int, new_status: str, user_id: int = 1) -> Optional[RoadmapTask]:
    task = db.query(RoadmapTask).filter(RoadmapTask.id == task_id).first()
    if not task:
        return None

    previous_status = task.status
    task.status = new_status

    if new_status == "completed":
        task.completed_at = datetime.datetime.utcnow()
        # Record study minutes and activity
        if previous_status != "completed":
            record_task_completion(db, user_id, task.estimated_minutes)
    else:
        task.completed_at = None

    db.commit()
    db.refresh(task)

    # Recalculate roadmap progress
    recalculate_roadmap_progress(db, task.roadmap_id)
    return task

def recommend_next_task_logic(db: Session, roadmap_id: int) -> Optional[RoadmapTask]:
    """Finds the next unfinished task in logical sequential order."""
    # First check if any task is already in_progress
    in_prog = db.query(RoadmapTask).filter(
        RoadmapTask.roadmap_id == roadmap_id,
        RoadmapTask.status == "in_progress"
    ).order_by(RoadmapTask.order_index).first()

    if in_prog:
        return in_prog

    # Otherwise next not_started task
    next_task = db.query(RoadmapTask).filter(
        RoadmapTask.roadmap_id == roadmap_id,
        RoadmapTask.status == "not_started"
    ).order_by(RoadmapTask.order_index).first()

    return next_task
