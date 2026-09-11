from datetime import datetime

from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Float,
    Boolean,
    DateTime,
    ForeignKey,
)
from sqlalchemy.orm import relationship

from app.database import Base


# =========================================================
# Meeting
# =========================================================

class Meeting(Base):
    __tablename__ = "meetings"

    id = Column(Integer, primary_key=True, index=True)

    # NULL = demo meeting
    # user_id = logged-in user's ID for personal meetings
    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True,
        index=True,
    )

    title = Column(String, nullable=False, index=True)
    date = Column(String, nullable=False)
    time = Column(String, nullable=False)
    duration = Column(String, nullable=False)
    description = Column(Text, nullable=True)

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    # Relationships
    user = relationship(
        "User",
        back_populates="meetings",
    )

    participants = relationship(
        "Participant",
        back_populates="meeting",
        cascade="all, delete-orphan",
    )

    transcript_segments = relationship(
        "TranscriptSegment",
        back_populates="meeting",
        cascade="all, delete-orphan",
        order_by="TranscriptSegment.start_time",
    )

    summary = relationship(
        "Summary",
        back_populates="meeting",
        uselist=False,
        cascade="all, delete-orphan",
    )

    action_items = relationship(
        "ActionItem",
        back_populates="meeting",
        cascade="all, delete-orphan",
    )

    topics = relationship(
        "Topic",
        back_populates="meeting",
        cascade="all, delete-orphan",
        order_by="Topic.start_time",
    )


# =========================================================
# Participant
# =========================================================

class Participant(Base):
    __tablename__ = "participants"

    id = Column(Integer, primary_key=True, index=True)

    meeting_id = Column(
        Integer,
        ForeignKey("meetings.id", ondelete="CASCADE"),
        nullable=False,
    )

    name = Column(String, nullable=False, index=True)
    email = Column(String, nullable=True)

    meeting = relationship(
        "Meeting",
        back_populates="participants",
    )


# =========================================================
# Transcript Segment
# =========================================================

class TranscriptSegment(Base):
    __tablename__ = "transcript_segments"

    id = Column(Integer, primary_key=True, index=True)

    meeting_id = Column(
        Integer,
        ForeignKey("meetings.id", ondelete="CASCADE"),
        nullable=False,
    )

    speaker = Column(String, nullable=False)
    start_time = Column(Float, nullable=False)
    end_time = Column(Float, nullable=False)
    text = Column(Text, nullable=False)

    meeting = relationship(
        "Meeting",
        back_populates="transcript_segments",
    )


# =========================================================
# Summary
# =========================================================

class Summary(Base):
    __tablename__ = "summaries"

    id = Column(Integer, primary_key=True, index=True)

    meeting_id = Column(
        Integer,
        ForeignKey("meetings.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
    )

    overview = Column(Text, nullable=False)

    # JSON-encoded list of key points
    key_points = Column(Text, nullable=False)

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    meeting = relationship(
        "Meeting",
        back_populates="summary",
    )


# =========================================================
# Action Item
# =========================================================

class ActionItem(Base):
    __tablename__ = "action_items"

    id = Column(Integer, primary_key=True, index=True)

    meeting_id = Column(
        Integer,
        ForeignKey("meetings.id", ondelete="CASCADE"),
        nullable=False,
    )

    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    assignee = Column(String, nullable=True)
    due_date = Column(String, nullable=True)

    completed = Column(
        Boolean,
        default=False,
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    meeting = relationship(
        "Meeting",
        back_populates="action_items",
    )


# =========================================================
# Topic
# =========================================================

class Topic(Base):
    __tablename__ = "topics"

    id = Column(Integer, primary_key=True, index=True)

    meeting_id = Column(
        Integer,
        ForeignKey("meetings.id", ondelete="CASCADE"),
        nullable=False,
    )

    title = Column(String, nullable=False)
    start_time = Column(Float, nullable=False)

    meeting = relationship(
        "Meeting",
        back_populates="topics",
    )


# =========================================================
# User
# =========================================================

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    # Google account identifier (optional if registered via email/password)
    google_id = Column(
        String,
        unique=True,
        nullable=True,
        index=True,
    )

    # Password hash (optional if logged in via Google OAuth)
    hashed_password = Column(
        String,
        nullable=True,
    )

    email = Column(
        String,
        unique=True,
        nullable=False,
    )

    name = Column(
        String,
        nullable=False,
    )

    picture = Column(
        String,
        nullable=True,
    )

    # One user → many meetings
    meetings = relationship(
        "Meeting",
        back_populates="user",
    )

    # One user → many sessions
    sessions = relationship(
        "Session",
        back_populates="user",
        cascade="all, delete-orphan",
    )


# =========================================================
# Session
# =========================================================

class Session(Base):
    __tablename__ = "sessions"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    # Which user owns this session
    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    # Random value stored for the user's login session
    session_token = Column(
        String,
        unique=True,
        nullable=False,
        index=True,
    )

    # When the session expires
    expires_at = Column(
        DateTime,
        nullable=False,
    )

    # Session → User
    user = relationship(
        "User",
        back_populates="sessions",
    )