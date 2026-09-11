# Authentication endpoints

import secrets
from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Cookie, Depends, Header, HTTPException, Response
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, Session as DBSession
from app.auth import (
    verify_google_token,
    hash_password,
    verify_password,
    get_current_user,
)


router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"]
)


class GoogleTokenRequest(BaseModel):
    token: str


class SignupRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6, description="Password must be at least 6 characters")
    name: str = Field(..., min_length=1, description="Full name is required")


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


def create_user_session(user: User, db: Session, response: Response) -> str:
    """Helper to create a session in DB and attach session_token cookie to response."""
    session_token = secrets.token_urlsafe(32)
    expires_at = datetime.utcnow() + timedelta(days=7)

    new_session = DBSession(
        user_id=user.id,
        session_token=session_token,
        expires_at=expires_at
    )
    db.add(new_session)
    db.commit()

    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        samesite="lax",
        secure=False,
        max_age=7 * 24 * 60 * 60
    )
    return session_token


def serialize_user(user: User) -> dict:
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "picture": user.picture,
    }


@router.post("/signup")
def signup(
    request: SignupRequest,
    response: Response,
    db: Session = Depends(get_db)
):
    # 1. Check if email already exists
    existing_user = db.query(User).filter(User.email == request.email.lower()).first()
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="An account with this email address already exists. Please sign in."
        )

    # 2. Hash password
    hashed_pwd = hash_password(request.password)

    # 3. Create new user
    user = User(
        email=request.email.lower(),
        name=request.name.strip(),
        hashed_password=hashed_pwd,
        picture=None,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # 4. Create session and cookie
    session_token = create_user_session(user, db, response)

    return {
        "message": "Registration successful",
        "user": serialize_user(user),
        "session_token": session_token,
    }


@router.post("/login")
def login(
    request: LoginRequest,
    response: Response,
    db: Session = Depends(get_db)
):
    # 1. Find user by email
    user = db.query(User).filter(User.email == request.email.lower()).first()
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    # 2. Check password
    if not user.hashed_password or not verify_password(request.password, user.hashed_password):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    # 3. Create session and cookie
    session_token = create_user_session(user, db, response)

    return {
        "message": "Login successful",
        "user": serialize_user(user),
        "session_token": session_token,
    }


@router.post("/google")
def google_login(
    request: GoogleTokenRequest,
    response: Response,
    db: Session = Depends(get_db)
):
    # 1. Verify Google token
    try:
        user_info = verify_google_token(request.token)
    except ValueError as e:
        raise HTTPException(
            status_code=401,
            detail=str(e)
        )

    google_id = user_info["google_id"]
    email = user_info["email"].lower()
    name = user_info["name"]
    picture = user_info.get("picture")

    # 2. Find user by google_id or email
    user = db.query(User).filter(User.google_id == google_id).first()
    if not user:
        user = db.query(User).filter(User.email == email).first()

    # 3. Create or update user
    if not user:
        user = User(
            google_id=google_id,
            email=email,
            name=name,
            picture=picture,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        # Link google_id and update picture if missing
        updated = False
        if not user.google_id:
            user.google_id = google_id
            updated = True
        if picture and not user.picture:
            user.picture = picture
            updated = True
        if updated:
            db.commit()

    # 4. Create session and cookie
    session_token = create_user_session(user, db, response)

    return {
        "message": "Login successful",
        "user": serialize_user(user),
        "session_token": session_token,
    }


@router.get("/me")
def get_me(
    current_user: User = Depends(get_current_user)
):
    return {
        "user": serialize_user(current_user)
    }


@router.post("/logout")
def logout(
    response: Response,
    session_token: Optional[str] = Cookie(default=None),
    authorization: Optional[str] = Header(default=None),
    db: Session = Depends(get_db)
):
    token = session_token
    if not token and authorization:
        if authorization.startswith("Bearer "):
            token = authorization[7:].strip()
        else:
            token = authorization.strip()

    if token:
        db.query(DBSession).filter(DBSession.session_token == token).delete()
        db.commit()

    response.delete_cookie("session_token")
    return {"message": "Logged out successfully"}