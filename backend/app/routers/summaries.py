import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Meeting, Summary
from app.schemas import SummaryResponse, SummaryUpdate

router = APIRouter(tags=["Summaries"])

@router.get("/api/meetings/{meeting_id}/summary", response_model=SummaryResponse)
def get_summary(meeting_id: int, db: Session = Depends(get_db)):
    summary = db.query(Summary).filter(Summary.meeting_id == meeting_id).first()
    if not summary:
        raise HTTPException(status_code=404, detail="Summary not found")
    
    kp_list = json.loads(summary.key_points) if summary.key_points else []
    return SummaryResponse(
        id=summary.id,
        meeting_id=summary.meeting_id,
        overview=summary.overview,
        key_points=kp_list,
        created_at=summary.created_at,
        updated_at=summary.updated_at
    )

@router.put("/api/meetings/{meeting_id}/summary", response_model=SummaryResponse)
def update_summary(meeting_id: int, sum_in: SummaryUpdate, db: Session = Depends(get_db)):
    summary = db.query(Summary).filter(Summary.meeting_id == meeting_id).first()
    if not summary:
        raise HTTPException(status_code=404, detail="Summary not found")

    if sum_in.overview is not None:
        summary.overview = sum_in.overview
    if sum_in.key_points is not None:
        summary.key_points = json.dumps(sum_in.key_points)

    db.commit()
    db.refresh(summary)

    kp_list = json.loads(summary.key_points) if summary.key_points else []
    return SummaryResponse(
        id=summary.id,
        meeting_id=summary.meeting_id,
        overview=summary.overview,
        key_points=kp_list,
        created_at=summary.created_at,
        updated_at=summary.updated_at
    )
