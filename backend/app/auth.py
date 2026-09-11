import os
from datetime import datetime
from pathlib import Path
from typing import Optional

import bcrypt
from dotenv import load_dotenv
from fastapi import Cookie, Header, Depends, HTTPException
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, Session as DBSession


backend_dir = Path(__file__).resolve().parents[1]
load_dotenv(backend_dir / ".env", override=False)
load_dotenv(backend_dir.parent / ".env", override=False)

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")


def hash_password(password: str) -> str:
    """Hash a plaintext password securely using bcrypt."""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plaintext password against a stored bcrypt hash."""
    if not hashed_password:
        return False
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8")
        )
    except Exception:
        return False


def verify_google_token(token: str) -> dict[str, str | None]:
    """Verify a Google ID token and return the claims needed by the app."""
    if not GOOGLE_CLIENT_ID:
        raise ValueError("Google sign-in is not configured on the backend. Set GOOGLE_CLIENT_ID.")

    try:
        claims = id_token.verify_oauth2_token(
            token,
            google_requests.Request(),
            GOOGLE_CLIENT_ID,
        )
    except ValueError as exc:
        raise ValueError(f"Google token verification failed: {exc}") from exc

    google_id = claims.get("sub")
    email = claims.get("email")
    name = claims.get("name") or email
    if not google_id or not email or not name or not claims.get("email_verified"):
        raise ValueError("Google account information is incomplete")

    return {
        "google_id": google_id,
        "email": email,
        "name": name,
        "picture": claims.get("picture"),
    }


def get_current_user(
    session_token: Optional[str] = Cookie(default=None),
    authorization: Optional[str] = Header(default=None),
    db: Session = Depends(get_db)
):
    # 1. Determine session token from Cookie or Authorization header
    token = session_token
    if not token and authorization:
        if authorization.startswith("Bearer "):
            token = authorization[7:].strip()
        else:
            token = authorization.strip()

    if not token:
        raise HTTPException(
            status_code=401,
            detail="Not authenticated"
        )

    # 2. Find the session in database
    user_session = db.query(DBSession).filter(
        DBSession.session_token == token
    ).first()

    # 3. Session doesn't exist
    if not user_session:
        raise HTTPException(
            status_code=401,
            detail="Invalid session"
        )

    # 4. Check if session has expired
    if user_session.expires_at < datetime.utcnow():
        db.delete(user_session)
        db.commit()

        raise HTTPException(
            status_code=401,
            detail="Session expired"
        )

    # 5. Find the user associated with the session
    user = db.query(User).filter(
        User.id == user_session.user_id
    ).first()

    # 6. User doesn't exist
    if not user:
        raise HTTPException(
            status_code=401,
            detail="User not found"
        )

    # 7. Return logged-in user
    return user


def get_optional_current_user(
    session_token: Optional[str] = Cookie(default=None),
    authorization: Optional[str] = Header(default=None),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """Return the logged-in User if valid session token present, else None."""
    token = session_token
    if not token and authorization:
        if authorization.startswith("Bearer "):
            token = authorization[7:].strip()
        else:
            token = authorization.strip()

    if not token:
        return None

    user_session = db.query(DBSession).filter(
        DBSession.session_token == token
    ).first()

    if not user_session:
        return None

    if user_session.expires_at < datetime.utcnow():
        return None

    return db.query(User).filter(User.id == user_session.user_id).first()
