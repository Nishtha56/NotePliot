import {
  MeetingListItem,
  MeetingDetail,
  CreateMeetingPayload,
  UpdateMeetingPayload,
  ActionItem,
  CreateActionItemPayload,
  UpdateActionItemPayload,
  Summary,
  TranscriptSegment,
  Topic,
} from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("session_token") : null;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((options?.headers as Record<string, string>) || {}),
  };

  let res: Response;
  try {
    res = await fetch(url, {
      ...options,
      credentials: "include",
      headers,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Network request failed";
    console.error(`[NotePilot API Error] Failed to connect to ${url}:`, err);
    throw new Error(
      `Cannot connect to backend server at ${API_BASE_URL}. Please ensure the FastAPI backend is running on port 8000. (${errorMsg})`
    );
  }

  if (!res.ok) {
    let errorMsg = `HTTP Error ${res.status}: ${res.statusText}`;
    try {
      const errData = await res.json();
      if (errData.detail) {
        errorMsg = typeof errData.detail === "string" ? errData.detail : JSON.stringify(errData.detail);
      }
    } catch {}
    throw new Error(errorMsg);
  }

  if (res.status === 204) {
    return {} as T;
  }

  return res.json();
}

// Health Check API
export async function checkBackendHealth(): Promise<{ status: string; service: string }> {
  return fetchJSON<{ status: string; service: string }>(`${API_BASE_URL}/api/health`);
}

// Meetings API
export async function getMeetings(params?: {
  search?: string;
  participant?: string;
  date_filter?: string;
  sort?: string;
}): Promise<MeetingListItem[]> {
  const query = new URLSearchParams();
  if (params?.search) query.append("search", params.search);
  if (params?.participant) query.append("participant", params.participant);
  if (params?.date_filter) query.append("date_filter", params.date_filter);
  if (params?.sort) query.append("sort", params.sort);

  const queryString = query.toString();
  const url = `${API_BASE_URL}/api/meetings${queryString ? `?${queryString}` : ""}`;
  return fetchJSON<MeetingListItem[]>(url);
}

export async function getMeeting(id: number): Promise<MeetingDetail> {
  return fetchJSON<MeetingDetail>(`${API_BASE_URL}/api/meetings/${id}`);
}

export async function createMeeting(data: CreateMeetingPayload): Promise<MeetingDetail> {
  return fetchJSON<MeetingDetail>(`${API_BASE_URL}/api/meetings`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateMeeting(id: number, data: UpdateMeetingPayload): Promise<MeetingDetail> {
  return fetchJSON<MeetingDetail>(`${API_BASE_URL}/api/meetings/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteMeeting(id: number): Promise<void> {
  return fetchJSON<void>(`${API_BASE_URL}/api/meetings/${id}`, {
    method: "DELETE",
  });
}

// Transcript Segments API
export async function getTranscript(meetingId: number): Promise<TranscriptSegment[]> {
  return fetchJSON<TranscriptSegment[]>(`${API_BASE_URL}/api/meetings/${meetingId}/transcript`);
}

export async function addTranscriptSegment(
  meetingId: number,
  data: { speaker: string; start_time: number; end_time: number; text: string }
): Promise<TranscriptSegment> {
  return fetchJSON<TranscriptSegment>(`${API_BASE_URL}/api/meetings/${meetingId}/transcript`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateTranscriptSegment(
  segmentId: number,
  data: Partial<{ speaker: string; start_time: number; end_time: number; text: string }>
): Promise<TranscriptSegment> {
  return fetchJSON<TranscriptSegment>(`${API_BASE_URL}/api/transcript/${segmentId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteTranscriptSegment(segmentId: number): Promise<void> {
  return fetchJSON<void>(`${API_BASE_URL}/api/transcript/${segmentId}`, {
    method: "DELETE",
  });
}

// Topics API
export async function getTopics(meetingId: number): Promise<Topic[]> {
  return fetchJSON<Topic[]>(`${API_BASE_URL}/api/meetings/${meetingId}/topics`);
}

// Action Items API
export async function createActionItem(meetingId: number, data: CreateActionItemPayload): Promise<ActionItem> {
  return fetchJSON<ActionItem>(`${API_BASE_URL}/api/meetings/${meetingId}/actions`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateActionItem(actionId: number, data: UpdateActionItemPayload): Promise<ActionItem> {
  return fetchJSON<ActionItem>(`${API_BASE_URL}/api/actions/${actionId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function toggleActionItem(actionId: number): Promise<ActionItem> {
  return fetchJSON<ActionItem>(`${API_BASE_URL}/api/actions/${actionId}/complete`, {
    method: "PATCH",
  });
}

export async function deleteActionItem(actionId: number): Promise<void> {
  return fetchJSON<void>(`${API_BASE_URL}/api/actions/${actionId}`, {
    method: "DELETE",
  });
}

// Summary API
export async function updateSummary(meetingId: number, data: { overview?: string; key_points?: string[] }): Promise<Summary> {
  return fetchJSON<Summary>(`${API_BASE_URL}/api/meetings/${meetingId}/summary`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

