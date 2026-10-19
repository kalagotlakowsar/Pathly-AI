import json
from typing import List, Dict, Any, Tuple
from sqlalchemy.orm import Session
from app.models.models import AssessmentQuestion, AssessmentAttempt, AssessmentAnswer

QUESTIONS_DATA: List[Dict[str, Any]] = [
    # Python - Beginner
    {
        "skill": "Python",
        "difficulty": "Beginner",
        "topic": "Variables & Types",
        "question": "What is the output of type([1, 2, 'hello']) in Python?",
        "options": ["<class 'tuple'>", "<class 'list'>", "<class 'array'>", "<class 'set'>"],
        "correct_option_index": 1,
        "explanation": "Square brackets `[...]` in Python define a `list`. Tuples use parentheses `(...)` and sets use curly braces `{...}`."
    },
    {
        "skill": "Python",
        "difficulty": "Beginner",
        "topic": "Control Flow",
        "question": "What does the 'break' keyword do inside a loop in Python?",
        "options": [
            "Skips the current iteration and continues with the next",
            "Terminates the loop immediately and transfers control outside",
            "Restarts the loop from the beginning",
            "Pauses loop execution for 1 second"
        ],
        "correct_option_index": 1,
        "explanation": "`break` terminates the nearest enclosing loop immediately. `continue` skips to the next iteration."
    },
    {
        "skill": "Python",
        "difficulty": "Beginner",
        "topic": "Functions",
        "question": "Which keyword is used to define a function in Python?",
        "options": ["function", "func", "def", "lambda"],
        "correct_option_index": 2,
        "explanation": "In Python, regular named functions are defined using the `def` keyword, while anonymous inline functions use `lambda`."
    },
    {
        "skill": "Python",
        "difficulty": "Beginner",
        "topic": "Data Structures",
        "question": "Which of the following data structures in Python is immutable?",
        "options": ["List", "Dictionary", "Tuple", "Set"],
        "correct_option_index": 2,
        "explanation": "Tuples cannot be modified after creation (immutable). Lists, dictionaries, and sets are mutable."
    },
    {
        "skill": "Python",
        "difficulty": "Beginner",
        "topic": "Strings",
        "question": "What will `\"python\".upper()` return?",
        "options": ["\"PYTHON\"", "\"Python\"", "\"pYTHON\"", "Error"],
        "correct_option_index": 0,
        "explanation": "The `.upper()` string method converts all lowercase characters to uppercase, returning 'PYTHON'."
    },

    # Python - Intermediate
    {
        "skill": "Python",
        "difficulty": "Intermediate",
        "topic": "Decorators",
        "question": "What is a Python decorator primarily used for?",
        "options": [
            "Styling the terminal console output",
            "Modifying or extending the behavior of a function without modifying its source code",
            "Encrypting source code strings",
            "Managing garbage collection cycles"
        ],
        "correct_option_index": 1,
        "explanation": "Decorators take a function as an argument, wrap or enhance its behavior, and return the wrapped function."
    },
    {
        "skill": "Python",
        "difficulty": "Intermediate",
        "topic": "Generators",
        "question": "What makes a generator different from a normal function in Python?",
        "options": [
            "Generators cannot take arguments",
            "Generators yield values one at a time using 'yield' and maintain state lazily",
            "Generators always execute faster on GPU",
            "Generators automatically catch all exceptions"
        ],
        "correct_option_index": 1,
        "explanation": "Generators use `yield` to return an iterator that produces values lazily on demand, saving memory."
    },
    {
        "skill": "Python",
        "difficulty": "Intermediate",
        "topic": "OOP & Magic Methods",
        "question": "Which magic method is called when an object is initialized in Python?",
        "options": ["__new__", "__init__", "__start__", "__construct__"],
        "correct_option_index": 1,
        "explanation": "`__init__` is the initializer method called to set up attributes after `__new__` creates the instance."
    },
    {
        "skill": "Python",
        "difficulty": "Intermediate",
        "topic": "Context Managers",
        "question": "Which statement handles resources and ensures cleanup using context managers?",
        "options": ["try/catch", "with", "using", "defer"],
        "correct_option_index": 1,
        "explanation": "The `with` statement utilizes `__enter__` and `__exit__` methods to guarantee resource cleanup (e.g. closing files)."
    },

    # JavaScript - Beginner
    {
        "skill": "JavaScript",
        "difficulty": "Beginner",
        "topic": "Variables & Scope",
        "question": "Which keyword declares a block-scoped variable that cannot be reassigned?",
        "options": ["var", "let", "const", "static"],
        "correct_option_index": 2,
        "explanation": "`const` declares a block-scoped identifier that cannot be reassigned. `let` is reassignable, and `var` is function-scoped."
    },
    {
        "skill": "JavaScript",
        "difficulty": "Beginner",
        "topic": "Equality Operators",
        "question": "What is the difference between '==' and '===' in JavaScript?",
        "options": [
            "'==' performs type coercion before comparison, whereas '===' strictly checks both value and type",
            "'===' is only for numbers while '==' is for strings",
            "There is no difference in modern ES6",
            "'==' is strict and '===' is loose"
        ],
        "correct_option_index": 0,
        "explanation": "`==` allows implicit type conversion (e.g. '5' == 5 is true), while `===` checks both type and value ('5' === 5 is false)."
    },
    {
        "skill": "JavaScript",
        "difficulty": "Beginner",
        "topic": "Arrays & Methods",
        "question": "Which array method creates a new array populated with the results of calling a provided function on every element?",
        "options": ["forEach()", "map()", "filter()", "reduce()"],
        "correct_option_index": 1,
        "explanation": "`map()` returns a new array with transformed elements. `forEach()` iterates for side effects without returning a new array."
    },
    {
        "skill": "JavaScript",
        "difficulty": "Beginner",
        "topic": "DOM Manipulation",
        "question": "How do you select an element by its ID 'app' in modern DOM API?",
        "options": [
            "document.query('#app')",
            "document.getElementById('app')",
            "document.find('#app')",
            "document.selectElement('app')"
        ],
        "correct_option_index": 1,
        "explanation": "`document.getElementById('app')` or `document.querySelector('#app')` correctly retrieves the element."
    },

    # JavaScript - Intermediate
    {
        "skill": "JavaScript",
        "difficulty": "Intermediate",
        "topic": "Closures",
        "question": "What is a closure in JavaScript?",
        "options": [
            "A function that executes automatically on window load",
            "A function bundled with references to its surrounding lexical environment",
            "A syntax error caused by unclosed parentheses",
            "A method to close network sockets"
        ],
        "correct_option_index": 1,
        "explanation": "A closure gives an inner function access to its outer function's scope, even after the outer function has finished execution."
    },
    {
        "skill": "JavaScript",
        "difficulty": "Intermediate",
        "topic": "Asynchronous JavaScript",
        "question": "What happens when an async function is called in JavaScript?",
        "options": [
            "It runs synchronously on a background thread",
            "It always returns a Promise that resolves with the function's return value",
            "It blocks the main UI thread until finished",
            "It converts all variables to globals"
        ],
        "correct_option_index": 1,
        "explanation": "`async` functions always return a Promise, resolving to whatever value is returned or rejecting on error."
    },
    {
        "skill": "JavaScript",
        "difficulty": "Intermediate",
        "topic": "Event Loop",
        "question": "Which task queue has higher priority in the JavaScript event loop?",
        "options": [
            "Macrotask queue (setTimeout, setInterval)",
            "Microtask queue (Promise callbacks, queueMicrotask)",
            "Both have identical FIFO priority",
            "Disk I/O queue"
        ],
        "correct_option_index": 1,
        "explanation": "Microtasks (such as Promise `.then` handlers) are executed immediately after the currently running script and before the next macrotask."
    },

    # Web Development - Beginner
    {
        "skill": "Web Development",
        "difficulty": "Beginner",
        "topic": "Semantic HTML",
        "question": "Why is semantic HTML (like <nav>, <article>, <main>) important?",
        "options": [
            "It compiles faster in Chrome",
            "It improves accessibility for screen readers and assists search engine indexing (SEO)",
            "It automatically adds modern CSS styles",
            "It prevents SQL injection"
        ],
        "correct_option_index": 1,
        "explanation": "Semantic tags convey structural meaning to assistive technologies (screen readers) and search engines."
    },
    {
        "skill": "Web Development",
        "difficulty": "Beginner",
        "topic": "CSS Box Model",
        "question": "What are the components of the CSS Box Model from inside out?",
        "options": [
            "Content, Padding, Border, Margin",
            "Content, Margin, Border, Padding",
            "Margin, Border, Content, Padding",
            "Padding, Content, Margin, Border"
        ],
        "correct_option_index": 0,
        "explanation": "The CSS box model consists of: Content (innermost) -> Padding -> Border -> Margin (outermost)."
    },
    {
        "skill": "Web Development",
        "difficulty": "Beginner",
        "topic": "Responsive Design",
        "question": "Which CSS unit is relative to the font-size of the root element (<html>)?",
        "options": ["em", "rem", "vh", "%"],
        "correct_option_index": 1,
        "explanation": "`rem` stands for 'root em' and scales relative to the root element's font-size, making consistent responsive sizing straightforward."
    },

    # DSA - Beginner
    {
        "skill": "DSA",
        "difficulty": "Beginner",
        "topic": "Big-O Notation",
        "question": "What is the time complexity of accessing an element in an array by its index?",
        "options": ["O(1)", "O(n)", "O(log n)", "O(n^2)"],
        "correct_option_index": 0,
        "explanation": "Array elements occupy contiguous memory slots; calculation via base_address + (index * element_size) takes O(1) constant time."
    },
    {
        "skill": "DSA",
        "difficulty": "Beginner",
        "topic": "Stacks & Queues",
        "question": "Which principle does a Queue data structure follow?",
        "options": ["LIFO (Last In First Out)", "FIFO (First In First Out)", "Priority First", "Random Access"],
        "correct_option_index": 1,
        "explanation": "A queue follows FIFO (First-In, First-Out), like a line at a ticket counter. A stack follows LIFO."
    },
    {
        "skill": "DSA",
        "difficulty": "Beginner",
        "topic": "Binary Search",
        "question": "What is a mandatory prerequisite for performing Binary Search on an array?",
        "options": [
            "The array must contain only positive integers",
            "The array elements must be sorted",
            "The array size must be a power of 2",
            "The array must be stored as a linked list"
        ],
        "correct_option_index": 1,
        "explanation": "Binary search divides the search space in half at each step, which requires the elements to be in sorted order."
    },
    {
        "skill": "DSA",
        "difficulty": "Intermediate",
        "topic": "Trees & Graphs",
        "question": "What is the worst-case time complexity of searching in an unbalanced Binary Search Tree (BST)?",
        "options": ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
        "correct_option_index": 2,
        "explanation": "If a BST degenerates into a linear chain (like a linked list), searching every node requires O(n) time."
    },

    # SQL - Beginner
    {
        "skill": "SQL",
        "difficulty": "Beginner",
        "topic": "Basic Queries",
        "question": "Which SQL clause is used to filter records based on specific conditions?",
        "options": ["ORDER BY", "GROUP BY", "WHERE", "SELECT"],
        "correct_option_index": 2,
        "explanation": "`WHERE` filters rows before grouping or ordering. `HAVING` filters aggregated groups."
    },
    {
        "skill": "SQL",
        "difficulty": "Beginner",
        "topic": "Joins",
        "question": "Which JOIN returns all records from the left table and matched records from the right table?",
        "options": ["INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "FULL OUTER JOIN"],
        "correct_option_index": 1,
        "explanation": "`LEFT JOIN` preserves all rows from the left table, inserting NULLs for unmatched columns from the right table."
    },
    {
        "skill": "SQL",
        "difficulty": "Beginner",
        "topic": "Aggregations",
        "question": "Which clause is used in conjunction with aggregate functions like COUNT() or SUM()?",
        "options": ["GROUP BY", "WHERE ONLY", "DISTINCT ONLY", "ORDER BY"],
        "correct_option_index": 0,
        "explanation": "`GROUP BY` groups rows sharing identical values in summary columns so aggregate functions can calculate per-group metrics."
    },

    # Java - Beginner
    {
        "skill": "Java",
        "difficulty": "Beginner",
        "topic": "Java Fundamentals",
        "question": "What is the difference between JDK and JRE?",
        "options": [
            "JDK is for development (compiler + tools + JRE), while JRE is only for running Java bytecode",
            "JRE contains javac compiler, JDK does not",
            "There is no difference",
            "JDK is open source, JRE is always proprietary"
        ],
        "correct_option_index": 0,
        "explanation": "JDK (Java Development Kit) includes the compiler (javac) and debuggers; JRE (Java Runtime Environment) contains JVM and runtime libraries."
    },
    {
        "skill": "Java",
        "difficulty": "Beginner",
        "topic": "OOP Principles",
        "question": "Which keyword prevents a Java class from being subclassed / inherited?",
        "options": ["abstract", "static", "final", "const"],
        "correct_option_index": 2,
        "explanation": "`final` on a class prevents inheritance. `final` on a method prevents overriding. `final` on a variable makes it a constant."
    },

    # Machine Learning - Beginner
    {
        "skill": "Machine Learning",
        "difficulty": "Beginner",
        "topic": "Supervised Learning",
        "question": "What distinguishes Supervised Learning from Unsupervised Learning?",
        "options": [
            "Supervised learning requires labeled training data with ground-truth targets",
            "Supervised learning requires human supervision while running inference",
            "Supervised learning does not use mathematical loss functions",
            "Supervised learning can only output binary 0 or 1"
        ],
        "correct_option_index": 0,
        "explanation": "Supervised learning algorithms learn a mapping from input features to known target labels provided during training."
    },
    {
        "skill": "Machine Learning",
        "difficulty": "Beginner",
        "topic": "Model Evaluation",
        "question": "What does 'Overfitting' mean in Machine Learning?",
        "options": [
            "The model performs poorly on both training and test data",
            "The model memorizes training noise and fails to generalize to unseen test data",
            "The dataset has too many missing values",
            "The model took too little time to train"
        ],
        "correct_option_index": 1,
        "explanation": "Overfitting happens when a model has high variance, fitting the training set too closely while failing on unseen data."
    },

    # Cybersecurity - Beginner
    {
        "skill": "Cybersecurity",
        "difficulty": "Beginner",
        "topic": "Web Application Security",
        "question": "What is SQL Injection (SQLi)?",
        "options": [
            "A hardware failure in database servers",
            "An attack where malicious SQL statements are inserted into entry fields for execution",
            "A tool to optimize query execution plans",
            "A method to automatically backup database tables"
        ],
        "correct_option_index": 1,
        "explanation": "SQLi occurs when untrusted user input is concatenated directly into SQL queries rather than using parameterized queries."
    },
    {
        "skill": "Cybersecurity",
        "difficulty": "Beginner",
        "topic": "Cryptography",
        "question": "What is the primary difference between Symmetric and Asymmetric encryption?",
        "options": [
            "Symmetric uses one shared key; Asymmetric uses a public-private key pair",
            "Symmetric is only used for emails",
            "Asymmetric encryption does not use mathematical keys",
            "Symmetric encryption is never used in HTTPS"
        ],
        "correct_option_index": 0,
        "explanation": "Symmetric encryption uses the same key for encryption and decryption; Asymmetric uses public and private key pairs."
    }
]

def seed_questions(db: Session):
    count = db.query(AssessmentQuestion).count()
    if count == 0:
        for q in QUESTIONS_DATA:
            item = AssessmentQuestion(
                skill=q["skill"],
                difficulty=q["difficulty"],
                topic=q["topic"],
                question=q["question"],
                options=json.dumps(q["options"]),
                correct_option_index=q["correct_option_index"],
                explanation=q["explanation"]
            )
            db.add(item)
        db.commit()

def get_questions_for_skill(db: Session, skill: str, difficulty: str = "Beginner") -> List[AssessmentQuestion]:
    # Query matching skill & difficulty; if few, fallback to matching skill
    qs = db.query(AssessmentQuestion).filter(
        AssessmentQuestion.skill.ilike(f"%{skill}%"),
        AssessmentQuestion.difficulty.ilike(f"%{difficulty}%")
    ).all()
    if len(qs) < 3:
        qs = db.query(AssessmentQuestion).filter(
            AssessmentQuestion.skill.ilike(f"%{skill}%")
        ).all()
    if not qs:
        # Fallback to general programming questions
        qs = db.query(AssessmentQuestion).limit(5).all()
    return qs

def evaluate_assessment(db: Session, user_id: int, skill: str, difficulty: str, answers: List[Dict[str, int]]) -> Dict[str, Any]:
    score = 0
    total = len(answers)
    weak_topics_set = set()
    breakdowns = []

    for item in answers:
        q_id = item["question_id"]
        selected_idx = item["selected_option_index"]
        question = db.query(AssessmentQuestion).filter(AssessmentQuestion.id == q_id).first()
        if not question:
            continue

        is_correct = (selected_idx == question.correct_option_index)
        if is_correct:
            score += 1
        else:
            weak_topics_set.add(question.topic)

        breakdowns.append({
            "question_id": question.id,
            "question": question.question,
            "topic": question.topic,
            "options": question.get_options(),
            "selected_option_index": selected_idx,
            "correct_option_index": question.correct_option_index,
            "is_correct": is_correct,
            "explanation": question.explanation
        })

    percentage = round((score / total * 100), 1) if total > 0 else 0.0

    if percentage >= 80.0:
        recommended_level = "Advanced"
    elif percentage >= 50.0:
        recommended_level = "Intermediate"
    else:
        recommended_level = "Beginner"

    weak_topics_list = list(weak_topics_set)

    attempt = AssessmentAttempt(
        user_id=user_id,
        skill=skill,
        difficulty=difficulty,
        score=score,
        total_questions=total,
        percentage=percentage,
        weak_topics=json.dumps(weak_topics_list),
        recommended_level=recommended_level
    )
    db.add(attempt)
    db.flush()

    for item in answers:
        q_id = item["question_id"]
        selected_idx = item["selected_option_index"]
        question = db.query(AssessmentQuestion).filter(AssessmentQuestion.id == q_id).first()
        if question:
            ans = AssessmentAnswer(
                attempt_id=attempt.id,
                question_id=question.id,
                selected_option_index=selected_idx,
                is_correct=(selected_idx == question.correct_option_index)
            )
            db.add(ans)

    db.commit()
    db.refresh(attempt)

    return {
        "id": attempt.id,
        "skill": attempt.skill,
        "difficulty": attempt.difficulty,
        "score": attempt.score,
        "total_questions": attempt.total_questions,
        "percentage": attempt.percentage,
        "weak_topics": weak_topics_list,
        "recommended_level": attempt.recommended_level,
        "created_at": attempt.created_at,
        "breakdowns": breakdowns
    }
