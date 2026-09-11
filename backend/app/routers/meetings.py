import json
from typing import List, Optional
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc

from app.database import get_db
from app.models import Meeting, Participant, TranscriptSegment, Summary, ActionItem, Topic, User
from app.auth import get_optional_current_user
from app.schemas import (
    MeetingCreate, MeetingUpdate, MeetingListItemResponse, MeetingDetailResponse,
    SummaryResponse, ActionItemResponse, TopicResponse, ParticipantResponse, TranscriptSegmentResponse
)
from app.services.summary_service import parse_transcript_text, generate_summary_and_assets

router = APIRouter(prefix="/api/meetings", tags=["Meetings"])

@router.get("", response_model=List[MeetingListItemResponse])
def get_meetings(
    search: Optional[str] = Query(None, description="Search term for title, participant, or summary"),
    participant: Optional[str] = Query(None, description="Filter by participant name"),
    date_filter: Optional[str] = Query(None, description="Filter by date range: all, today, 7days, 30days"),
    sort: Optional[str] = Query("recent", description="Sort order: recent, oldest, duration_long, duration_short"),
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Meeting)

    # User isolation: logged in users see only their meetings; unauthenticated users see demo meetings (user_id IS NULL)
    if current_user:
        query = query.filter(Meeting.user_id == current_user.id)
    else:
        query = query.filter(Meeting.user_id.is_(None))

    # Participant filter
    if participant and participant != "All Participants":
        query = query.join(Meeting.participants).filter(Participant.name.ilike(f"%{participant}%"))

    # Search filter (matches title, participant name, or overview text)
    if search:
        search_pattern = f"%{search}%"
        query = query.outerjoin(Meeting.participants).outerjoin(Meeting.summary).filter(
            or_(
                Meeting.title.ilike(search_pattern),
                Participant.name.ilike(search_pattern),
                Summary.overview.ilike(search_pattern),
                Meeting.description.ilike(search_pattern)
            )
        ).distinct()

    # Date filter
    if date_filter and date_filter != "all":
        today = datetime.utcnow().date()
        if date_filter == "today":
            query = query.filter(Meeting.created_at >= datetime.combine(today, datetime.min.time()))
        elif date_filter == "7days":
            cutoff = today - timedelta(days=7)
            query = query.filter(Meeting.created_at >= datetime.combine(cutoff, datetime.min.time()))
        elif date_filter == "30days":
            cutoff = today - timedelta(days=30)
            query = query.filter(Meeting.created_at >= datetime.combine(cutoff, datetime.min.time()))

    # Sorting
    if sort == "recent":
        query = query.order_by(desc(Meeting.created_at))
    elif sort == "oldest":
        query = query.order_by(asc(Meeting.created_at))
    elif sort == "duration_long":
        query = query.order_by(desc(Meeting.duration))
    elif sort == "duration_short":
        query = query.order_by(asc(Meeting.duration))
    else:
        query = query.order_by(desc(Meeting.created_at))

    meetings = query.all()

    # Map responses
    result = []
    for m in meetings:
        summary_preview = m.summary.overview[:140] + "..." if m.summary and m.summary.overview else (m.description or "")
        kp_list = json.loads(m.summary.key_points) if m.summary and m.summary.key_points else []
        action_count = len(m.action_items)
        topics_list = [t.title for t in m.topics]

        result.append(
            MeetingListItemResponse(
                id=m.id,
                title=m.title,
                date=m.date,
                time=m.time,
                duration=m.duration,
                description=m.description,
                created_at=m.created_at,
                updated_at=m.updated_at,
                participants=[ParticipantResponse.model_validate(p) for p in m.participants],
                summary_preview=summary_preview,
                action_item_count=action_count,
                topic_titles=topics_list
            )
        )

    return result


@router.get("/{meeting_id}", response_model=MeetingDetailResponse)
def get_meeting(meeting_id: int, db: Session = Depends(get_db)):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail=f"Meeting with ID {meeting_id} not found")

    # Format Summary
    summary_resp = None
    if meeting.summary:
        kp_list = json.loads(meeting.summary.key_points) if meeting.summary.key_points else []
        summary_resp = SummaryResponse(
            id=meeting.summary.id,
            meeting_id=meeting.summary.meeting_id,
            overview=meeting.summary.overview,
            key_points=kp_list,
            created_at=meeting.summary.created_at,
            updated_at=meeting.summary.updated_at
        )

    return MeetingDetailResponse(
        id=meeting.id,
        title=meeting.title,
        date=meeting.date,
        time=meeting.time,
        duration=meeting.duration,
        description=meeting.description,
        created_at=meeting.created_at,
        updated_at=meeting.updated_at,
        participants=[ParticipantResponse.model_validate(p) for p in meeting.participants],
        transcript_segments=[TranscriptSegmentResponse.model_validate(s) for s in meeting.transcript_segments],
        summary=summary_resp,
        action_items=[ActionItemResponse.model_validate(a) for a in meeting.action_items],
        topics=[TopicResponse.model_validate(t) for t in meeting.topics]
    )


@router.post("", response_model=MeetingDetailResponse, status_code=status.HTTP_201_CREATED)
def create_meeting(
    meeting_in: MeetingCreate,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    # Create Meeting
    db_meeting = Meeting(
        title=meeting_in.title,
        date=meeting_in.date,
        time=meeting_in.time,
        duration=meeting_in.duration,
        description=meeting_in.description,
        user_id=current_user.id if current_user else None
    )
    db.add(db_meeting)
    db.flush()

    # Add Participants
    participants_list = []
    for p in meeting_in.participants:
        db_p = Participant(meeting_id=db_meeting.id, name=p.name, email=p.email)
        db.add(db_p)
        participants_list.append(db_p)

    # Process Transcripts
    segments_data = []
    if meeting_in.raw_transcripts:
        for seg in meeting_in.raw_transcripts:
            db_seg = TranscriptSegment(
                meeting_id=db_meeting.id,
                speaker=seg.speaker,
                start_time=seg.start_time,
                end_time=seg.end_time,
                text=seg.text
            )
            db.add(db_seg)
            segments_data.append({"speaker": seg.speaker, "start_time": seg.start_time, "end_time": seg.end_time, "text": seg.text})
    elif meeting_in.transcript_text:
        parsed = parse_transcript_text(meeting_in.transcript_text)
        for seg in parsed:
            db_seg = TranscriptSegment(
                meeting_id=db_meeting.id,
                speaker=seg["speaker"],
                start_time=seg["start_time"],
                end_time=seg["end_time"],
                text=seg["text"]
            )
            db.add(db_seg)
            segments_data.append(seg)

    # Generate Summary & Action items automatically if not present
    generated = generate_summary_and_assets(segments_data, db_meeting.title)

    # Add Summary
    db_summary = Summary(
        meeting_id=db_meeting.id,
        overview=generated["overview"],
        key_points=json.dumps(generated["key_points"])
    )
    db.add(db_summary)

    # Add Topics
    for top in generated["topics"]:
        db_topic = Topic(
            meeting_id=db_meeting.id,
            title=top["title"],
            start_time=top["start_time"]
        )
        db.add(db_topic)

    # Add Action Items
    for act in generated["action_items"]:
        db_act = ActionItem(
            meeting_id=db_meeting.id,
            title=act["title"],
            description=act.get("description"),
            assignee=act.get("assignee"),
            due_date=act.get("due_date"),
            completed=act.get("completed", False)
        )
        db.add(db_act)

    db.commit()
    db.refresh(db_meeting)

    return get_meeting(db_meeting.id, db=db)


@router.put("/{meeting_id}", response_model=MeetingDetailResponse)
def update_meeting(meeting_id: int, meeting_in: MeetingUpdate, db: Session = Depends(get_db)):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail=f"Meeting with ID {meeting_id} not found")

    if meeting_in.title is not None:
        meeting.title = meeting_in.title
    if meeting_in.date is not None:
        meeting.date = meeting_in.date
    if meeting_in.time is not None:
        meeting.time = meeting_in.time
    if meeting_in.duration is not None:
        meeting.duration = meeting_in.duration
    if meeting_in.description is not None:
        meeting.description = meeting_in.description

    meeting.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(meeting)

    return get_meeting(meeting_id, db=db)


@router.delete("/{meeting_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_meeting(meeting_id: int, db: Session = Depends(get_db)):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail=f"Meeting with ID {meeting_id} not found")

    db.delete(meeting)
    db.commit()
    return None
