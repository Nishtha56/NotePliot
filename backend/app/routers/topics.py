from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Meeting, Topic
from app.schemas import TopicResponse

router = APIRouter(tags=["Topics"])

@router.get("/api/meetings/{meeting_id}/topics", response_model=List[TopicResponse])
def get_topics(meeting_id: int, db: Session = Depends(get_db)):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return db.query(Topic).filter(Topic.meeting_id == meeting_id).order_by(Topic.start_time).all()
