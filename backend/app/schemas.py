from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict

# Participant Schemas
class ParticipantBase(BaseModel):
    name: str
    email: Optional[str] = None

class ParticipantCreate(ParticipantBase):
    pass

class ParticipantResponse(ParticipantBase):
    id: int
    meeting_id: int
    model_config = ConfigDict(from_attributes=True)


# Transcript Segment Schemas
class TranscriptSegmentBase(BaseModel):
    speaker: str
    start_time: float
    end_time: float
    text: str

class TranscriptSegmentCreate(TranscriptSegmentBase):
    pass

class TranscriptSegmentUpdate(BaseModel):
    speaker: Optional[str] = None
    start_time: Optional[float] = None
    end_time: Optional[float] = None
    text: Optional[str] = None

class TranscriptSegmentResponse(TranscriptSegmentBase):
    id: int
    meeting_id: int
    model_config = ConfigDict(from_attributes=True)


# Summary Schemas
class SummaryBase(BaseModel):
    overview: str
    key_points: List[str]

class SummaryCreate(SummaryBase):
    pass

class SummaryUpdate(BaseModel):
    overview: Optional[str] = None
    key_points: Optional[List[str]] = None

class SummaryResponse(BaseModel):
    id: int
    meeting_id: int
    overview: str
    key_points: List[str]
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


# Action Item Schemas
class ActionItemBase(BaseModel):
    title: str
    description: Optional[str] = None
    assignee: Optional[str] = None
    due_date: Optional[str] = None
    completed: bool = False

class ActionItemCreate(ActionItemBase):
    pass

class ActionItemUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    assignee: Optional[str] = None
    due_date: Optional[str] = None
    completed: Optional[bool] = None

class ActionItemResponse(ActionItemBase):
    id: int
    meeting_id: int
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


# Topic Schemas
class TopicBase(BaseModel):
    title: str
    start_time: float

class TopicCreate(TopicBase):
    pass

class TopicResponse(TopicBase):
    id: int
    meeting_id: int
    model_config = ConfigDict(from_attributes=True)


# Meeting Schemas
class MeetingBase(BaseModel):
    title: str
    date: str
    time: str
    duration: str
    description: Optional[str] = None

class MeetingCreate(MeetingBase):
    participants: List[ParticipantCreate] = []
    transcript_text: Optional[str] = None
    raw_transcripts: Optional[List[TranscriptSegmentCreate]] = None

class MeetingUpdate(BaseModel):
    title: Optional[str] = None
    date: Optional[str] = None
    time: Optional[str] = None
    duration: Optional[str] = None
    description: Optional[str] = None

class MeetingListItemResponse(MeetingBase):
    id: int
    created_at: datetime
    updated_at: datetime
    participants: List[ParticipantResponse] = []
    summary_preview: Optional[str] = None
    action_item_count: int = 0
    topic_titles: List[str] = []
    model_config = ConfigDict(from_attributes=True)

class MeetingDetailResponse(MeetingBase):
    id: int
    created_at: datetime
    updated_at: datetime
    participants: List[ParticipantResponse] = []
    transcript_segments: List[TranscriptSegmentResponse] = []
    summary: Optional[SummaryResponse] = None
    action_items: List[ActionItemResponse] = []
    topics: List[TopicResponse] = []
    model_config = ConfigDict(from_attributes=True)
