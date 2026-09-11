from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Meeting, ActionItem
from app.schemas import ActionItemCreate, ActionItemUpdate, ActionItemResponse

router = APIRouter(tags=["Action Items"])

@router.get("/api/meetings/{meeting_id}/actions", response_model=List[ActionItemResponse])
def get_action_items(meeting_id: int, db: Session = Depends(get_db)):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return db.query(ActionItem).filter(ActionItem.meeting_id == meeting_id).all()

@router.post("/api/meetings/{meeting_id}/actions", response_model=ActionItemResponse, status_code=status.HTTP_201_CREATED)
def create_action_item(meeting_id: int, action_in: ActionItemCreate, db: Session = Depends(get_db)):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    action = ActionItem(
        meeting_id=meeting_id,
        title=action_in.title,
        description=action_in.description,
        assignee=action_in.assignee,
        due_date=action_in.due_date,
        completed=action_in.completed
    )
    db.add(action)
    db.commit()
    db.refresh(action)
    return action

@router.put("/api/actions/{action_id}", response_model=ActionItemResponse)
def update_action_item(action_id: int, action_in: ActionItemUpdate, db: Session = Depends(get_db)):
    action = db.query(ActionItem).filter(ActionItem.id == action_id).first()
    if not action:
        raise HTTPException(status_code=404, detail="Action item not found")

    if action_in.title is not None:
        action.title = action_in.title
    if action_in.description is not None:
        action.description = action_in.description
    if action_in.assignee is not None:
        action.assignee = action_in.assignee
    if action_in.due_date is not None:
        action.due_date = action_in.due_date
    if action_in.completed is not None:
        action.completed = action_in.completed

    action.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(action)
    return action

@router.patch("/api/actions/{action_id}/complete", response_model=ActionItemResponse)
def toggle_complete_action_item(action_id: int, db: Session = Depends(get_db)):
    action = db.query(ActionItem).filter(ActionItem.id == action_id).first()
    if not action:
        raise HTTPException(status_code=404, detail="Action item not found")

    action.completed = not action.completed
    action.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(action)
    return action

@router.delete("/api/actions/{action_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_action_item(action_id: int, db: Session = Depends(get_db)):
    action = db.query(ActionItem).filter(ActionItem.id == action_id).first()
    if not action:
        raise HTTPException(status_code=404, detail="Action item not found")

    db.delete(action)
    db.commit()
    return None
