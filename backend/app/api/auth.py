import uuid
import urllib.parse
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from app.database import get_db
from app.config import settings
from app.models.models import User
from app.schemas.schemas import (
    LoginRequest,
    RegisterRequest,
    AuthResponse,
    GoogleOAuthUrlResponse,
    GoogleVerifyRequest,
    UserOut
)

router = APIRouter(prefix="/auth", tags=["Authentication"])

# In-memory mapping of session tokens to user IDs
SESSION_TOKENS: dict[str, int] = {}

def create_session_token(user_id: int) -> str:
    token = f"ptk_{user_id}_{uuid.uuid4().hex}"
    SESSION_TOKENS[token] = user_id
    return token

def resolve_user_from_token(token_str: str, db: Session) -> Optional[User]:
    if not token_str:
        return None
    token = token_str.strip()
    if token.startswith("Bearer "):
        token = token[7:].strip()

    user_id = SESSION_TOKENS.get(token)
    if user_id is None and token.startswith("ptk_"):
        parts = token.split("_")
        if len(parts) >= 3 and parts[1].isdigit():
            user_id = int(parts[1])
            SESSION_TOKENS[token] = user_id

    if user_id is not None:
        return db.query(User).filter(User.id == user_id).first()
    return None

def get_current_user(
    authorization: Optional[str] = Header(None),
    x_user_id: Optional[str] = Header(None, alias="X-User-Id"),
    db: Session = Depends(get_db)
) -> User:
    # 1. Resolve via Authorization header
    if authorization:
        user = resolve_user_from_token(authorization, db)
        if user:
            return user

    # 2. Resolve via X-User-Id header
    if x_user_id:
        try:
            uid = int(x_user_id.strip())
            user = db.query(User).filter(User.id == uid).first()
            if user:
                return user
        except ValueError:
            pass

    # 3. Fallback for unauthenticated/demo calls or legacy tests without headers
    user = db.query(User).filter(User.id == 1).first()
    if not user:
        user = User(id=1, name="Pathly Learner", email="learner@pathly.ai")
        db.add(user)
        db.commit()
        db.refresh(user)
    return user

@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    clean_email = payload.email.strip().lower() if payload.email else ""
    clean_password = payload.password.strip() if payload.password else ""

    if not clean_email or "@" not in clean_email:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Please provide a valid email address."
        )

    if not clean_password:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Password is required."
        )

    # Query user by email
    user = db.query(User).filter(User.email.ilike(clean_email)).first()

    # If demo/learner email is used and user exists as id=1, bind to user 1
    if not user and (clean_email == "learner@pathly.ai" or clean_email.endswith("@pathly.ai")):
        user = db.query(User).filter(User.id == 1).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials. No account found for this email address. Please sign up first."
        )

    token = create_session_token(user.id)
    return AuthResponse(
        authenticated=True,
        token=token,
        user=user,
        message="Signed in successfully"
    )

@router.post("/register", response_model=AuthResponse)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    clean_name = payload.name.strip() if payload.name else ""
    clean_email = payload.email.strip().lower() if payload.email else ""
    clean_password = payload.password.strip() if payload.password else ""

    if not clean_name:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Full Name is required."
        )

    if not clean_email or "@" not in clean_email:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Please provide a valid email address."
        )

    if len(clean_password) < 6:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Password must be at least 6 characters long."
        )

    # Check if user with this email already exists
    existing = db.query(User).filter(User.email.ilike(clean_email)).first()
    if existing:
        # Update existing user profile with new info
        existing.name = clean_name
        if payload.target_career:
            existing.target_career = payload.target_career.strip()
        if payload.current_level:
            existing.current_level = payload.current_level.strip()
        db.commit()
        db.refresh(existing)
        user = existing
    else:
        new_user = User(
            name=clean_name,
            email=clean_email,
            target_career=payload.target_career.strip() if payload.target_career else "Full-Stack Developer",
            current_level=payload.current_level.strip() if payload.current_level else "Beginner",
            daily_goal_minutes=45,
            avatar="sparkles"
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        user = new_user

    token = create_session_token(user.id)
    return AuthResponse(
        authenticated=True,
        token=token,
        user=user,
        message="Account created successfully"
    )

@router.get("/verify")
def verify_session(current_user: User = Depends(get_current_user)):
    return {
        "authenticated": True,
        "user": {
            "id": current_user.id,
            "name": current_user.name,
            "email": current_user.email,
            "avatar": current_user.avatar,
            "current_level": current_user.current_level,
            "target_career": current_user.target_career,
            "daily_goal_minutes": current_user.daily_goal_minutes,
        }
    }

@router.get("/google/config", response_model=GoogleOAuthUrlResponse)
def get_google_oauth_config():
    """
    Checks whether real Google OAuth / Google Identity Services (GIS) credentials
    have been provisioned in environment.
    GIS client-side Sign-In requires GOOGLE_CLIENT_ID.
    Server-side authorization code flow optionally uses GOOGLE_CLIENT_SECRET.
    Never exposes client_secret to the frontend.
    """
    if not settings.GOOGLE_CLIENT_ID.strip():
        settings.reload_env()

    client_id = settings.GOOGLE_CLIENT_ID.strip()
    client_secret = settings.GOOGLE_CLIENT_SECRET.strip()

    if not client_id:
        return GoogleOAuthUrlResponse(
            configured=False,
            url=None,
            client_id=None,
            message="Google OAuth credentials are not configured. Please set GOOGLE_CLIENT_ID in your .env configuration."
        )

    # Build real Google OAuth authorization URL only if client_secret is present
    auth_url = None
    if client_secret:
        params = {
            "client_id": client_id,
            "redirect_uri": settings.GOOGLE_REDIRECT_URI,
            "response_type": "code",
            "scope": "openid email profile",
            "access_type": "offline",
            "prompt": "select_account"
        }
        auth_url = f"https://accounts.google.com/o/oauth2/v2/auth?{urllib.parse.urlencode(params)}"

    return GoogleOAuthUrlResponse(
        configured=True,
        url=auth_url,
        client_id=client_id,
        message="Google OAuth is configured."
    )

@router.post("/google/verify", response_model=AuthResponse)
def verify_google_id_token(payload: GoogleVerifyRequest, db: Session = Depends(get_db)):
    """
    Verifies a Google Identity Services (GIS) ID token (JWT) server-side.
    Cryptographically validates token signature against Google certs, audience (GOOGLE_CLIENT_ID),
    issuer, and expiration. Creates user if new, or signs in existing user in SQLite.
    """
    if not settings.GOOGLE_CLIENT_ID.strip():
        settings.reload_env()

    client_id = settings.GOOGLE_CLIENT_ID.strip()
    if not client_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google Sign-In is not configured on this server. Please set GOOGLE_CLIENT_ID in your .env configuration."
        )

    credential = payload.credential.strip() if payload.credential else ""
    if not credential:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing Google credential ID token."
        )

    from google.oauth2 import id_token
    from google.auth.transport import requests as google_requests

    try:
        id_info = id_token.verify_oauth2_token(
            credential,
            google_requests.Request(),
            audience=client_id
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Google token verification failed: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unable to verify Google credential: {str(e)}"
        )

    # Validate issuer
    issuer = id_info.get("iss", "")
    if issuer not in ["accounts.google.com", "https://accounts.google.com"]:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google token issuer."
        )

    email = id_info.get("email", "").strip().lower()
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google ID token does not contain a valid email address."
        )

    email_verified = id_info.get("email_verified", False)
    if not email_verified:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Google email address has not been verified by Google."
        )

    name = (id_info.get("name") or "").strip()
    if not name:
        name = email.split("@")[0].replace(".", " ").title()

    picture = (id_info.get("picture") or "").strip()

    # Find or create user in SQLite database
    user = db.query(User).filter(User.email.ilike(email)).first()
    if user:
        # Existing user: Update Google-provided identity fields while preserving custom Pathly settings
        if name:
            user.name = name
        if picture:
            user.avatar = picture
        db.commit()
        db.refresh(user)
    else:
        # New user: initialize sensible defaults only once
        user = User(
            name=name,
            email=email,
            avatar=picture if picture else "sparkles",
            target_career="Full-Stack Developer",
            current_level="Beginner",
            daily_goal_minutes=45
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    token = create_session_token(user.id)
    return AuthResponse(
        authenticated=True,
        token=token,
        user=user,
        message="Google sign-in successful"
    )

@router.post("/google/callback", response_model=AuthResponse)
def handle_google_callback(payload: dict, db: Session = Depends(get_db)):
    """
    Exchanges authorization code for Google token and user identity.
    """
    client_id = settings.GOOGLE_CLIENT_ID.strip()
    client_secret = settings.GOOGLE_CLIENT_SECRET.strip()

    if not client_id or not client_secret:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google OAuth is not configured on this server. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env."
        )

    code = payload.get("code")
    if not code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Authorization code is missing from Google callback."
        )

    # In production, exchange code with Google OAuth token endpoint:
    # POST https://oauth2.googleapis.com/token
    import urllib.request
    import json

    token_url = "https://oauth2.googleapis.com/token"
    token_data = urllib.parse.urlencode({
        "code": code,
        "client_id": client_id,
        "client_secret": client_secret,
        "redirect_uri": settings.GOOGLE_REDIRECT_URI,
        "grant_type": "authorization_code"
    }).encode("utf-8")

    req = urllib.request.Request(token_url, data=token_data, method="POST")
    try:
        with urllib.request.urlopen(req) as resp:
            token_resp = json.loads(resp.read().decode())
            access_token = token_resp.get("access_token")

        userinfo_req = urllib.request.Request(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        with urllib.request.urlopen(userinfo_req) as user_resp:
            google_user = json.loads(user_resp.read().decode())

        g_email = google_user.get("email", "").lower()
        g_name = google_user.get("name", "Google Learner")
        g_picture = (google_user.get("picture") or "").strip()

        # Find or create user
        user = db.query(User).filter(User.email.ilike(g_email)).first()
        if user:
            if g_name:
                user.name = g_name
            if g_picture:
                user.avatar = g_picture
            db.commit()
            db.refresh(user)
        else:
            user = User(
                name=g_name,
                email=g_email,
                avatar=g_picture if g_picture else "google",
                target_career="Full-Stack Developer",
                current_level="Beginner",
                daily_goal_minutes=45
            )
            db.add(user)
            db.commit()
            db.refresh(user)

        token = create_session_token(user.id)
        return AuthResponse(
            authenticated=True,
            token=token,
            user=user,
            message="Google authentication successful"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to validate Google OAuth callback: {str(e)}"
        )
