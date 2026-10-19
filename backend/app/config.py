import os
from pathlib import Path
from dotenv import load_dotenv

# Define directory anchors relative to this configuration module
# config.py location: <project_root>/backend/app/config.py
CONFIG_FILE_PATH = Path(__file__).resolve()
BACKEND_DIR = CONFIG_FILE_PATH.parent.parent
PROJECT_ROOT = BACKEND_DIR.parent

# Detect and resolve .env file:
# Checks project root first (canonical location), then backend directory
ENV_ROOT = PROJECT_ROOT / ".env"
ENV_BACKEND = BACKEND_DIR / ".env"

def load_env_files() -> Path:
    """
    Loads environment variables from canonical locations with override=True
    so newly added or edited keys take precedence:
    1. Project root .env (canonical)
    2. Backend directory .env (fallback/companion)
    """
    loaded = ENV_ROOT
    if ENV_ROOT.exists():
        load_dotenv(dotenv_path=ENV_ROOT, override=True)
        loaded = ENV_ROOT
    if ENV_BACKEND.exists():
        load_dotenv(dotenv_path=ENV_BACKEND, override=True)
        if not ENV_ROOT.exists():
            loaded = ENV_BACKEND
    if not ENV_ROOT.exists() and not ENV_BACKEND.exists():
        loaded = ENV_ROOT
    return loaded

ENV_PATH = load_env_files()

def resolve_database_url(raw_url: str) -> str:
    """
    Ensures relative SQLite URLs resolve to the persistent database
    containing all existing roadmaps and user progress, and normalizes
    postgres:// to postgresql:// for Render-managed PostgreSQL databases.
    """
    if not raw_url:
        default_db = BACKEND_DIR / "pathly.db"
        return f"sqlite:///{default_db.as_posix()}"

    # Render uses postgres:// prefix; SQLAlchemy 1.4+ requires postgresql://
    if raw_url.startswith("postgres://"):
        return raw_url.replace("postgres://", "postgresql://", 1)

    if raw_url.startswith("sqlite:///"):
        path_part = raw_url[len("sqlite:///"):]
        p = Path(path_part)
        if p.is_absolute():
            return raw_url

        default_db = BACKEND_DIR / "pathly.db"
        normalized = path_part.replace("\\", "/").lstrip("./")
        if normalized in ["pathly.db", ""]:
            return f"sqlite:///{default_db.as_posix()}"
        elif normalized == "backend/pathly.db":
            return f"sqlite:///{(PROJECT_ROOT / 'backend' / 'pathly.db').as_posix()}"
        else:
            if (BACKEND_DIR / normalized).exists():
                return f"sqlite:///{(BACKEND_DIR / normalized).as_posix()}"
            elif (PROJECT_ROOT / normalized).exists():
                return f"sqlite:///{(PROJECT_ROOT / normalized).as_posix()}"
            else:
                return f"sqlite:///{(BACKEND_DIR / normalized).as_posix()}"

    return raw_url

# Alias for backward compatibility
resolve_sqlite_url = resolve_database_url

def parse_cors_origins() -> list:
    origins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ]
    raw = os.getenv("ALLOWED_ORIGINS") or os.getenv("CORS_ORIGINS") or ""
    if raw:
        for item in raw.split(","):
            c = item.strip()
            if c and c not in origins:
                origins.append(c)
    return origins

class Settings:
    PROJECT_NAME: str = "Pathly"
    PROJECT_VERSION: str = "1.0.0"
    APP_ENV: str = os.getenv("APP_ENV", "development")

    # Database URL resolved to persistent SQLite database or PostgreSQL
    RAW_DATABASE_URL: str = os.getenv("DATABASE_URL", "")
    DATABASE_URL: str = resolve_database_url(RAW_DATABASE_URL)

    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GOOGLE_CLIENT_ID: str = os.getenv("GOOGLE_CLIENT_ID", "")
    GOOGLE_CLIENT_SECRET: str = os.getenv("GOOGLE_CLIENT_SECRET", "")
    GOOGLE_REDIRECT_URI: str = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:5173/auth/callback")

    CORS_ORIGINS: list = parse_cors_origins()
    DEFAULT_USER_ID: int = 1

    # Environment file resolution metadata
    LOADED_ENV_PATH: str = str(ENV_PATH)
    ENV_EXISTS: bool = ENV_PATH.exists()

    def reload_env(self):
        """
        Re-reads environment variables from .env files into this Settings instance.
        Ignored during pytest test execution so mocks are not overwritten.
        """
        if os.getenv("PYTEST_CURRENT_TEST"):
            return
        load_env_files()
        self.GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "").strip()
        self.GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "").strip()
        self.GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:5173/auth/callback").strip()
        self.GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
        self.CORS_ORIGINS = parse_cors_origins()
        raw_db = os.getenv("DATABASE_URL", "")
        if raw_db:
            self.DATABASE_URL = resolve_database_url(raw_db)

settings = Settings()
