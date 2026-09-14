import os
from pathlib import Path
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

BASE_DIR = Path(__file__).resolve().parents[1]
load_dotenv(BASE_DIR / ".env", override=False)
load_dotenv(BASE_DIR.parent / ".env", override=False)

DEFAULT_DB_PATH = (BASE_DIR / "meetings.db").as_posix()

db_url = os.getenv("DATABASE_URL", "").strip()
if not db_url or db_url in ("sqlite:///./meetings.db", "sqlite:///meetings.db"):
    DATABASE_URL = f"sqlite:///{DEFAULT_DB_PATH}"
else:
    DATABASE_URL = db_url

# For SQLite, check_same_thread=False allows FastAPI multithreaded requests to share the connection session cleanly
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
