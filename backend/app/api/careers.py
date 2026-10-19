from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.schemas import RoadmapOut
from app.services.roadmap_engine import generate_and_save_roadmap
from app.services.streak_engine import unlock_achievement

router = APIRouter(prefix="/careers", tags=["Career Pathways"])

CAREER_PATHS = [
    {
        "slug": "frontend-developer",
        "title": "Frontend Developer",
        "primary_skill": "Web Development",
        "description": "Craft intuitive, accessible, and high-performance user interfaces and responsive web applications.",
        "typical_salary": "$75,000 - $130,000",
        "required_skills": ["HTML5 & Semantic Markup", "Modern CSS & Flexbox/Grid", "JavaScript (ES6+)", "React & Hooks", "Git & GitHub", "Web Performance"],
        "recommended_order": [
            "1. Semantic HTML & Accessible Document Structures",
            "2. Responsive CSS, Flexbox, Grid, and Design Tokens",
            "3. JavaScript Core, DOM Manipulation, and Async Fetch",
            "4. React Component Architecture and State Management",
            "5. Build Tools (Vite), Testing, and CI/CD Deployment"
        ],
        "project_milestones": [
            "Responsive Brand Landing Page",
            "Interactive Data Dashboard with Charts",
            "Production-Grade Single Page Application (SPA)"
        ]
    },
    {
        "slug": "backend-developer",
        "title": "Backend Developer",
        "primary_skill": "Python",
        "description": "Architect scalable REST/GraphQL APIs, manage database transactions, and implement secure business logic.",
        "typical_salary": "$85,000 - $145,000",
        "required_skills": ["Python or Java", "RESTful API Design", "Relational Databases (PostgreSQL)", "SQLAlchemy / ORMs", "Authentication & JWT", "Docker"],
        "recommended_order": [
            "1. Backend Language Mastery (Python/Java)",
            "2. Relational Database Modeling and SQL Queries",
            "3. High-Performance API Frameworks (FastAPI / Spring)",
            "4. Authentication, Authorization, and Rate Limiting",
            "5. Microservices, Caching (Redis), and Containerization"
        ],
        "project_milestones": [
            "Secure Auth & User Management Microservice",
            "Transactional E-Commerce REST API",
            "Distributed Event-Driven Processing Worker"
        ]
    },
    {
        "slug": "fullstack-developer",
        "title": "Full-Stack Developer",
        "primary_skill": "Web Development",
        "description": "Bridge client-side experiences and server architectures to deliver complete end-to-end web products.",
        "typical_salary": "$90,000 - $155,000",
        "required_skills": ["JavaScript / TypeScript", "React", "Python or Node.js Backend", "PostgreSQL / SQLite", "API Integration", "Cloud Deployment"],
        "recommended_order": [
            "1. Client Fundamentals (HTML, CSS, Modern JS)",
            "2. Frontend Frameworks (React, Vite)",
            "3. Server Development & REST Endpoints",
            "4. Relational Database Design and Migrations",
            "5. Full-Stack Integration, Testing, and Cloud Hosting"
        ],
        "project_milestones": [
            "Full-Stack Collaborative Workspace App",
            "Real-Time Social / Feed Platform with Database",
            "SaaS Boilerplate with Billing and Dashboard"
        ]
    },
    {
        "slug": "python-developer",
        "title": "Python Developer",
        "primary_skill": "Python",
        "description": "Build high-throughput backends, automation scripts, and data engineering pipelines with Python.",
        "typical_salary": "$85,000 - $140,000",
        "required_skills": ["Python Core & OOP", "FastAPI / Flask", "Data Structures & Algorithms", "SQL & Database Access", "Automated Testing with Pytest"],
        "recommended_order": [
            "1. Pythonic Syntax, Collections, and Generators",
            "2. Object-Oriented Modeling and Design Patterns",
            "3. Asynchronous Programming (asyncio)",
            "4. REST API Engineering with FastAPI",
            "5. Pytest Suites, Packaging, and Docker"
        ],
        "project_milestones": [
            "Automated Web Scraping and Ingestion Engine",
            "High-Throughput Analytics REST API",
            "CLI Developer Tooling Suite"
        ]
    },
    {
        "slug": "java-developer",
        "title": "Java Developer",
        "primary_skill": "Java",
        "description": "Engineer enterprise systems, robust Spring microservices, and mission-critical high-concurrency applications.",
        "typical_salary": "$85,000 - $145,000",
        "required_skills": ["Core Java (JDK 21+)", "Spring Boot", "Hibernate / JPA", "Relational SQL Databases", "JUnit & Mockito", "Maven / Gradle"],
        "recommended_order": [
            "1. Java Syntax, Generics, and Collections Framework",
            "2. Concurrency, Streams, and Modern Functional Idioms",
            "3. Spring Boot MVC & Dependency Injection",
            "4. Persistence with Spring Data JPA and PostgreSQL",
            "5. Unit & Integration Testing with Mockito and Testcontainers"
        ],
        "project_milestones": [
            "Banking / Transactional Simulation Engine",
            "Spring Boot Multi-Module REST Microservice",
            "Event-Driven Inventory Management Service"
        ]
    },
    {
        "slug": "data-analyst",
        "title": "Data Analyst",
        "primary_skill": "SQL",
        "description": "Transform raw datasets into actionable executive insights, dashboards, and strategic business decisions.",
        "typical_salary": "$70,000 - $115,000",
        "required_skills": ["Advanced SQL & Window Functions", "Data Modeling", "Python (Pandas / NumPy)", "Business Intelligence (Tableau / PowerBI)", "Statistics"],
        "recommended_order": [
            "1. Advanced SQL Queries, Aggregations, and Joins",
            "2. Window Functions, CTEs, and Data Wrangling",
            "3. Python for Exploratory Data Analysis (Pandas)",
            "4. Statistical Hypothesis Testing and Metrics Design",
            "5. Interactive BI Dashboards and Executive Reporting"
        ],
        "project_milestones": [
            "Customer Cohort Retention & Churn Analysis",
            "Executive Revenue Trends & KPI Dashboard",
            "Market Basket Analysis & Product Recommendations"
        ]
    },
    {
        "slug": "ml-engineer",
        "title": "Machine Learning Engineer",
        "primary_skill": "Machine Learning",
        "description": "Train predictive algorithms, deploy neural models, and build automated ML evaluation pipelines.",
        "typical_salary": "$105,000 - $175,000",
        "required_skills": ["Python", "Scikit-Learn", "Deep Learning (PyTorch / TensorFlow)", "Feature Engineering", "Model Serving & MLOps", "Linear Algebra"],
        "recommended_order": [
            "1. Python & Numerical Libraries (NumPy, Pandas)",
            "2. Supervised & Unsupervised Learning Algorithms",
            "3. Feature Selection, Validation, and Metric Tuning",
            "4. Neural Networks and Deep Learning Frameworks",
            "5. Model Serving via APIs and Continuous Monitoring"
        ],
        "project_milestones": [
            "End-to-End Supervised Prediction Pipeline",
            "Computer Vision / NLP Classification Service",
            "Real-Time Production Model Inference API"
        ]
    }
]

@router.get("")
def list_career_paths():
    return {
        "careers": CAREER_PATHS,
        "disclaimer": "Career roadmaps, skill trees, and salary figures reflect industry guidance and market averages rather than an explicit guarantee of employment."
    }

@router.post("/{career_slug}/generate", response_model=RoadmapOut)
def generate_career_roadmap(career_slug: str, level: str = "Beginner", db: Session = Depends(get_db)):
    career = next((c for c in CAREER_PATHS if c["slug"] == career_slug), None)
    if not career:
        raise HTTPException(status_code=404, detail="Career path not found")

    roadmap = generate_and_save_roadmap(
        db=db,
        user_id=1,
        skill=career["primary_skill"],
        level=level,
        career_goal=career["title"],
        daily_study_time=45,
        duration_weeks=8,
        preferences=f"Specialized pathway targeted toward {career['title']} role."
    )
    unlock_achievement(db, 1, "ROADMAP_CREATOR")
    return roadmap
