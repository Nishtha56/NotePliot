from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Meeting, TranscriptSegment
from app.schemas import TranscriptSegmentCreate, TranscriptSegmentUpdate, TranscriptSegmentResponse

router = APIRouter(tags=["Transcripts"])

@router.get("/api/meetings/{meeting_id}/transcript", response_model=List[TranscriptSegmentResponse])
def get_transcript(meeting_id: int, db: Session = Depends(get_db)):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return db.query(TranscriptSegment).filter(TranscriptSegment.meeting_id == meeting_id).order_by(TranscriptSegment.start_time).all()

@router.post("/api/meetings/{meeting_id}/transcript", response_model=TranscriptSegmentResponse, status_code=status.HTTP_201_CREATED)
def add_transcript_segment(meeting_id: int, seg_in: TranscriptSegmentCreate, db: Session = Depends(get_db)):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    segment = TranscriptSegment(
        meeting_id=meeting_id,
        speaker=seg_in.speaker,
        start_time=seg_in.start_time,
        end_time=seg_in.end_time,
        text=seg_in.text
    )
    db.add(segment)
    db.commit()
    db.refresh(segment)
    return segment

@router.put("/api/transcript/{segment_id}", response_model=TranscriptSegmentResponse)
def update_transcript_segment(segment_id: int, seg_in: TranscriptSegmentUpdate, db: Session = Depends(get_db)):
    segment = db.query(TranscriptSegment).filter(TranscriptSegment.id == segment_id).first()
    if not segment:
        raise HTTPException(status_code=404, detail="Transcript segment not found")

    if seg_in.speaker is not None:
        segment.speaker = seg_in.speaker
    if seg_in.start_time is not None:
        segment.start_time = seg_in.start_time
    if seg_in.end_time is not None:
        segment.end_time = seg_in.end_time
    if seg_in.text is not None:
        segment.text = seg_in.text

    db.commit()
    db.refresh(segment)
    return segment

@router.delete("/api/transcript/{segment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_transcript_segment(segment_id: int, db: Session = Depends(get_db)):
    segment = db.query(TranscriptSegment).filter(TranscriptSegment.id == segment_id).first()
    if not segment:
        raise HTTPException(status_code=404, detail="Transcript segment not found")

    db.delete(segment)
    db.commit()
    return None
