export interface Participant {
  id: number;
  meeting_id: number;
  name: string;
  email?: string | null;
}

export interface TranscriptSegment {
  id: number;
  meeting_id: number;
  speaker: string;
  start_time: number;
  end_time: number;
  text: string;
}

export interface Summary {
  id: number;
  meeting_id: number;
  overview: string;
  key_points: string[];
  created_at: string;
  updated_at: string;
}

export interface ActionItem {
  id: number;
  meeting_id: number;
  title: string;
  description?: string | null;
  assignee?: string | null;
  due_date?: string | null;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Topic {
  id: number;
  meeting_id: number;
  title: string;
  start_time: number;
}

export interface MeetingListItem {
  id: number;
  title: string;
  date: string;
  time: string;
  duration: string;
  description?: string | null;
  created_at: string;
  updated_at: string;
  participants: Participant[];
  summary_preview?: string | null;
  action_item_count: number;
  topic_titles: string[];
}

export interface MeetingDetail {
  id: number;
  title: string;
  date: string;
  time: string;
  duration: string;
  description?: string | null;
  created_at: string;
  updated_at: string;
  participants: Participant[];
  transcript_segments: TranscriptSegment[];
  summary?: Summary | null;
  action_items: ActionItem[];
  topics: Topic[];
}

export interface CreateMeetingPayload {
  title: string;
  date: string;
  time: string;
  duration: string;
  description?: string;
  participants: { name: string; email?: string }[];
  transcript_text?: string;
}

export interface UpdateMeetingPayload {
  title?: string;
  date?: string;
  time?: string;
  duration?: string;
  description?: string;
}

export interface CreateActionItemPayload {
  title: string;
  description?: string;
  assignee?: string;
  due_date?: string;
  completed?: boolean;
}

export interface UpdateActionItemPayload {
  title?: string;
  description?: string;
  assignee?: string;
  due_date?: string;
  completed?: boolean;
}

export interface User {
  id: number;
  name: string;
  email: string;
  picture?: string | null;
}

export interface AuthResponse {
  message: string;
  user: User;
  session_token?: string;
}

