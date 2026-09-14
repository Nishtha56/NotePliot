import os
from pathlib import Path
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Load environment variables before anything else
backend_dir = Path(__file__).resolve().parents[1]
load_dotenv(backend_dir / ".env", override=False)
load_dotenv(backend_dir.parent / ".env", override=False)

from app.database import engine, Base
from app.routers import meetings, transcripts, summaries, actions, topics, auth

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="NotePilot - Meeting Intelligence API",
    description="Backend service providing meeting notes, transcript synchronization, summaries, and action item workflows.",
    version="1.0.0"
)

# Configure CORS for local development and production origins
env_origins = os.getenv("FRONTEND_URLS", "")
legacy_origin = os.getenv("FRONTEND_URL", "")
raw_origins = []
if env_origins:
    raw_origins.extend(part.strip() for part in env_origins.split(",") if part.strip())
if legacy_origin:
    raw_origins.append(legacy_origin.strip())
raw_origins.extend([
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    "http://localhost:3002",
    "http://127.0.0.1:3002",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
])
origins = list(dict.fromkeys(raw_origins))

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(meetings.router)
app.include_router(transcripts.router)
app.include_router(summaries.router)
app.include_router(actions.router)
app.include_router(topics.router)
app.include_router(auth.router)

@app.get("/")
def root():
    return {
        "status": "ok",
        "service": "NotePilot Backend API",
        "docs": "/docs",
        "health": "/api/health"
    }

@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "NotePilot Backend API"}

