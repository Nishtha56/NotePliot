import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import meetings, transcripts, summaries, actions, topics, auth


Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Fireflies.ai Clone - Meeting Intelligence API",
    description="Backend service providing meeting notes, transcript synchronization, summaries, and action item workflows.",
    version="1.0.0"
)


origins = [
    origin.strip()
    for origin in os.getenv(
        "FRONTEND_URLS",
        "http://localhost:3000,http://127.0.0.1:3000",
    ).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
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

@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "Fireflies.ai Backend API"}
