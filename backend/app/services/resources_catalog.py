from typing import List, Dict
from sqlalchemy.orm import Session
from app.models.models import LearningResource

CURATED_RESOURCES: List[Dict] = [
    # Python
    {
        "title": "Official Python 3 Documentation & Tutorial",
        "resource_type": "Documentation",
        "description": "The definitive beginner-to-advanced guide and tutorial from the core Python team.",
        "skill": "Python",
        "topic": "Python Fundamentals",
        "url": "https://docs.python.org/3/tutorial/"
    },
    {
        "title": "Real Python: Python Basics & Best Practices",
        "resource_type": "Tutorial",
        "description": "High-quality, hands-on articles explaining Python syntax, data structures, and idioms.",
        "skill": "Python",
        "topic": "Data Structures",
        "url": "https://realpython.com/"
    },
    {
        "title": "freeCodeCamp Python for Beginners (Full Course)",
        "resource_type": "Video",
        "description": "Comprehensive video course covering Python programming from scratch to intermediate projects.",
        "skill": "Python",
        "topic": "Python Fundamentals",
        "url": "https://www.youtube.com/watch?v=rfscVS0vtbw"
    },
    {
        "title": "Python Morsels & Exercism Python Track",
        "resource_type": "Practice",
        "description": "Guided coding exercises with automated test suites to master Pythonic patterns.",
        "skill": "Python",
        "topic": "Object-Oriented Programming",
        "url": "https://exercism.org/tracks/python"
    },
    {
        "title": "FastAPI Official Interactive Tutorial",
        "resource_type": "Documentation",
        "description": "Step-by-step documentation for building robust, modern REST APIs with Python.",
        "skill": "Python",
        "topic": "Web Frameworks",
        "url": "https://fastapi.tiangolo.com/tutorial/"
    },

    # JavaScript
    {
        "title": "MDN Web Docs: JavaScript Guide",
        "resource_type": "Documentation",
        "description": "The gold standard reference for modern JavaScript (ES6+), DOM, and browser APIs.",
        "skill": "JavaScript",
        "topic": "JavaScript Fundamentals",
        "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide"
    },
    {
        "title": "JavaScript.info — The Modern JavaScript Tutorial",
        "resource_type": "Tutorial",
        "description": "In-depth, beautifully explained concepts from closures to async/await and event loops.",
        "skill": "JavaScript",
        "topic": "Asynchronous JavaScript",
        "url": "https://javascript.info/"
    },
    {
        "title": "Namaste JavaScript by Akshay Saini",
        "resource_type": "Video",
        "description": "Deep-dive video series explaining execution context, call stack, closures, and hoisting.",
        "skill": "JavaScript",
        "topic": "Execution Context & Scope",
        "url": "https://www.youtube.com/playlist?list=PLlasXeu85E9cQ32gLCvAvPE9v16ccUC8S"
    },
    {
        "title": "LeetCode JavaScript 30-Day Challenge",
        "resource_type": "Practice",
        "description": "30 curated challenges covering closures, promises, memoization, and transformations.",
        "skill": "JavaScript",
        "topic": "Functional Programming",
        "url": "https://leetcode.com/studyplan/30-days-of-javascript/"
    },

    # Web Development
    {
        "title": "MDN Learn Web Development",
        "resource_type": "Documentation",
        "description": "Structured curriculum covering HTML5 semantic markup, modern CSS layouts (Flexbox/Grid), and responsive design.",
        "skill": "Web Development",
        "topic": "HTML & CSS",
        "url": "https://developer.mozilla.org/en-US/docs/Learn"
    },
    {
        "title": "React Official Documentation (react.dev)",
        "resource_type": "Documentation",
        "description": "Official interactive documentation focusing on modern React components, hooks, and state management.",
        "skill": "Web Development",
        "topic": "React",
        "url": "https://react.dev/learn"
    },
    {
        "title": "CSS Tricks: Complete Guide to Flexbox & Grid",
        "resource_type": "Tutorial",
        "description": "Visual, bookmark-worthy guide to mastering CSS layout modules with clear examples.",
        "skill": "Web Development",
        "topic": "Modern CSS",
        "url": "https://css-tricks.com/snippets/css/a-guide-to-flexbox/"
    },
    {
        "title": "Frontend Mentor Project Challenges",
        "resource_type": "Practice",
        "description": "Real-world UI design specs and assets to practice building accessible, responsive websites.",
        "skill": "Web Development",
        "topic": "Responsive Projects",
        "url": "https://www.frontendmentor.io/challenges"
    },

    # Java
    {
        "title": "Oracle Official Java Tutorials",
        "resource_type": "Documentation",
        "description": "Core Java language concepts, OOP, generics, collections, and concurrency guidelines.",
        "skill": "Java",
        "topic": "Java Fundamentals",
        "url": "https://docs.oracle.com/javase/tutorial/"
    },
    {
        "title": "Baeldung Spring Boot & Java Guides",
        "resource_type": "Tutorial",
        "description": "Industry-standard practical tutorials on modern Java, Spring Boot, and enterprise design patterns.",
        "skill": "Java",
        "topic": "Spring Framework",
        "url": "https://www.baeldung.com/category/java"
    },
    {
        "title": "Java Programming Course by freeCodeCamp",
        "resource_type": "Video",
        "description": "Comprehensive video course covering core Java syntax, classes, inheritance, and standard libraries.",
        "skill": "Java",
        "topic": "Object-Oriented Programming",
        "url": "https://www.youtube.com/watch?v=A74TOX803D0"
    },
    {
        "title": "Hyperskill / JetBrains Academy Java Track",
        "resource_type": "Practice",
        "description": "Project-based curriculum building command line and web applications with Java.",
        "skill": "Java",
        "topic": "Collections & Generics",
        "url": "https://hyperskill.org/tracks/1"
    },

    # DSA (Data Structures & Algorithms)
    {
        "title": "NeetCode 150 & Roadmap",
        "resource_type": "Practice",
        "description": "Carefully selected list of core interview problems organized by pattern and difficulty.",
        "skill": "DSA",
        "topic": "Problem Solving Patterns",
        "url": "https://neetcode.io/roadmap"
    },
    {
        "title": "GeeksforGeeks Data Structures and Algorithms",
        "resource_type": "Documentation",
        "description": "Explanations, time complexity analyses, and code implementations for trees, graphs, and dynamic programming.",
        "skill": "DSA",
        "topic": "Trees & Graphs",
        "url": "https://www.geeksforgeeks.org/data-structures/"
    },
    {
        "title": "Abdul Bari Algorithms Lecture Series",
        "resource_type": "Video",
        "description": "Masterclass videos on divide-and-conquer, greedy method, dynamic programming, and asymptotic notation.",
        "skill": "DSA",
        "topic": "Algorithm Analysis",
        "url": "https://www.youtube.com/playlist?list=PLDN4rrl48XKpZkf03iYFl-O29szjTrs_O"
    },
    {
        "title": "VisuAlgo: Visualizing Data Structures and Algorithms",
        "resource_type": "Tutorial",
        "description": "Interactive animations showing step-by-step executions of sorting, searching, and graph traversals.",
        "skill": "DSA",
        "topic": "Visual Algorithms",
        "url": "https://visualgo.net/en"
    },

    # SQL & Databases
    {
        "title": "PostgreSQL Official Documentation",
        "resource_type": "Documentation",
        "description": "Comprehensive reference on relational schemas, indexes, transactions, and window functions.",
        "skill": "SQL",
        "topic": "Relational Modeling",
        "url": "https://www.postgresql.org/docs/current/"
    },
    {
        "title": "SQLBolt — Interactive SQL Lessons",
        "resource_type": "Practice",
        "description": "Interactive browser-based exercises from simple SELECT queries to complex JOINs and aggregations.",
        "skill": "SQL",
        "topic": "Queries & Joins",
        "url": "https://sqlbolt.com/"
    },
    {
        "title": "Use The Index, Luke! A Guide to Database Performance",
        "resource_type": "Tutorial",
        "description": "Indispensable developer's guide to indexing, B-Trees, execution plans, and query optimization.",
        "skill": "SQL",
        "topic": "Performance & Indexing",
        "url": "https://use-the-index-luke.com/"
    },
    {
        "title": "Alex The Analyst SQL Bootcamp",
        "resource_type": "Video",
        "description": "Practical hands-on walkthroughs of group by, CTEs, subqueries, and window functions.",
        "skill": "SQL",
        "topic": "Analytics & Aggregations",
        "url": "https://www.youtube.com/playlist?list=PLUaB-1hjhk8GZOuYLZMuZ7Uq8kldl2Q4a"
    },

    # Machine Learning
    {
        "title": "Scikit-Learn User Guide & API Reference",
        "resource_type": "Documentation",
        "description": "Standard documentation for classification, regression, clustering, and model validation.",
        "skill": "Machine Learning",
        "topic": "Supervised Learning",
        "url": "https://scikit-learn.org/stable/user_guide.html"
    },
    {
        "title": "Kaggle Learn: Micro-Courses in Data Science & ML",
        "resource_type": "Practice",
        "description": "Hands-on coding notebooks for Pandas, feature engineering, and model evaluation.",
        "skill": "Machine Learning",
        "topic": "Feature Engineering",
        "url": "https://www.kaggle.com/learn"
    },
    {
        "title": "StatQuest with Josh Starmer",
        "resource_type": "Video",
        "description": "Crystal-clear visual explanations of machine learning concepts, neural networks, and statistics.",
        "skill": "Machine Learning",
        "topic": "Model Intuition",
        "url": "https://www.youtube.com/c/joshstarmer"
    },
    {
        "title": "Fast.ai Practical Deep Learning for Coders",
        "resource_type": "Tutorial",
        "description": "Top-down, code-first course for building real computer vision and NLP models.",
        "skill": "Machine Learning",
        "topic": "Deep Learning",
        "url": "https://course.fast.ai/"
    },

    # Cybersecurity
    {
        "title": "OWASP Top Ten Web Application Security Risks",
        "resource_type": "Documentation",
        "description": "Standard security awareness document for developers detailing critical vulnerabilities like Injection and XSS.",
        "skill": "Cybersecurity",
        "topic": "Web Application Security",
        "url": "https://owasp.org/www-project-top-ten/"
    },
    {
        "title": "PortSwigger Web Security Academy",
        "resource_type": "Practice",
        "description": "Free, interactive online security labs created by the makers of Burp Suite.",
        "skill": "Cybersecurity",
        "topic": "Vulnerability Assessment",
        "url": "https://portswigger.net/web-security"
    },
    {
        "title": "Professor Messer's CompTIA Security+ Training Course",
        "resource_type": "Video",
        "description": "Modular video series explaining security fundamentals, encryption, and threat vectors.",
        "skill": "Cybersecurity",
        "topic": "Security Fundamentals",
        "url": "https://www.professormesser.com/security-plus/sy0-701/sy0-701-video/"
    },
    {
        "title": "OverTheWire Wargames: Bandit",
        "resource_type": "Practice",
        "description": "Gamified terminal challenges teaching Linux command line navigation and baseline security.",
        "skill": "Cybersecurity",
        "topic": "Linux Security Basics",
        "url": "https://overthewire.org/wargames/bandit/"
    }
]

def seed_resources(db: Session):
    count = db.query(LearningResource).count()
    if count == 0:
        for res in CURATED_RESOURCES:
            item = LearningResource(
                title=res["title"],
                resource_type=res["resource_type"],
                description=res["description"],
                skill=res["skill"],
                topic=res["topic"],
                url=res["url"],
                is_completed=False
            )
            db.add(item)
        db.commit()
