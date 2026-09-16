# NotePilot - Meeting Notes & Transcription Platform 

A full-stack, production-quality meeting intelligence platform. Built for SDE evaluation, this platform features an interactive meeting library dashboard, timestamp-synchronized transcripts, AI-generated summaries, chapter outlines, action item task management, and modern SaaS workspace UX.

![NotePilot App Workspace](https://img.shields.io/badge/NotePilot-Platform-purple.svg)
![Tech Stack](https://img.shields.io/badge/Next.js-FastAPI-blue.svg)
![Database](https://img.shields.io/badge/SQLite-SQLAlchemy-emerald.svg)

---

## 🌟 Key Features

1. **Meetings Dashboard & Library**:
   - Live list of past meetings with titles, dates, durations, and participant chips.
   - Real-time search across titles, participant names, and summary text.
   - Filtering by participant and date ranges (Today, Last 7 Days, Last 30 Days).
   - Multi-field sorting (Most Recent, Oldest, Duration Longest, Duration Shortest).

2. **Interactive Transcript & Audio Player Synchronization**:
   - Custom HTML5 Audio Player with Play/Pause, timeline scrubber, playback speed (0.75x–2x), volume controls, and time display.
   - **Bidirectional Sync**:
     - Clicking any transcript segment seeks audio playback to that exact timestamp.
     - Live audio playback automatically highlights the active speaking segment and scrolls it smoothly into view.
   - **Transcript Search**: Instant search inside transcripts with yellow term highlighting and match count indicators.

3. **AI Summary & Workspace Intelligence**:
   - **Executive Overview**: Automated synthesis of meeting takeaways.
   - **Key Discussion Points**: Bulleted takeaways and decisions.
   - **Interactive Outline & Chapters**: Clickable chapter markers that jump audio playback to specific discussion topics.
   - **Exports**: Download summary and notes as `.txt` or `.md` Markdown files.

4. **Action Item Task Management (CRUD)**:
   - Interactive task checklist with instant state toggles.
   - Create, Edit, Complete/Uncomplete, and Delete action items.
   - Assignee badges and due dates.
   - Persistent database updates.

5. **Meeting Management (CRUD)**:
   - Create meetings by pasting timestamped dialogue or raw transcripts.
   - Edit meeting metadata (title, date, time, duration, description).
   - Delete meetings with cascading cleanup of transcripts, summaries, and action items.

---

## 🛠️ Technical Stack

- **Frontend**: Next.js 14 (App Router, TypeScript, React 18, Tailwind CSS, Lucide Icons)
- **Backend**: Python 3.11, FastAPI, SQLAlchemy ORM, Pydantic v2, Uvicorn
- **Database**: SQLite (`meetings.db`) with Foreign Key constraints and cascading deletions

---

## 🏗️ Architecture Overview

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        Next.js Frontend (React)                        │
│                                                                        │
│   Dashboard (/)  │  Workspace (/meetings/[id])  │  Settings (/settings)│
│                                                                        │
│   components: AudioPlayer | Transcript | Summary | ActionItems        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ REST API (JSON)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                         FastAPI Python Backend                         │
│                                                                        │
│   routers: /api/meetings | /api/transcripts | /api/actions | /api/summary│
│   services: summary_service.py (Auto Parser & Mock AI Synthesizer)     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ SQLAlchemy ORM
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                          SQLite Database                               │
│                           (meetings.db)                                │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 📊 Database Schema & ER Diagram

```text
                    ┌──────────────┐
                    │   meetings   │
                    └──────┬───────┘
                           │
       ┌───────────────────┼──────────────────┐
       │                   │                  │
       ▼                   ▼                  ▼
  participants     transcript_segments      topics
       │
       │
       ▼
    summary

                    meetings
                       │
                       ▼
                  action_items
```

### Tables Description

- **`meetings`**: Core meeting records (`id`, `title`, `date`, `time`, `duration`, `description`, `created_at`, `updated_at`).
- **`participants`**: Attending team members (`id`, `meeting_id`, `name`, `email`).
- **`transcript_segments`**: Timed dialogue lines (`id`, `meeting_id`, `speaker`, `start_time`, `end_time`, `text`).
- **`summaries`**: AI generated overview & key points (`id`, `meeting_id`, `overview`, `key_points`).
- **`action_items`**: Extracted task checklist (`id`, `meeting_id`, `title`, `description`, `assignee`, `due_date`, `completed`).
- **`topics`**: Chapter breakdown markers (`id`, `meeting_id`, `title`, `start_time`).

---

## 🔌 API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/meetings` | List meetings with search, participant filter, date filter, sort |
| `GET` | `/api/meetings/{id}` | Get complete meeting details with transcript, summary, actions, topics |
| `POST` | `/api/meetings` | Create meeting (parses transcript text into segments, summary, actions) |
| `PUT` | `/api/meetings/{id}` | Update meeting metadata (title, date, duration) |
| `DELETE` | `/api/meetings/{id}` | Delete meeting and all associated child entities |
| `GET` | `/api/meetings/{id}/transcript` | Get transcript segments for a meeting |
| `PUT` | `/api/transcript/{segment_id}` | Edit an individual transcript segment |
| `GET` | `/api/meetings/{id}/summary` | Get meeting AI summary |
| `PUT` | `/api/meetings/{id}/summary` | Update summary overview or key points |
| `GET` | `/api/meetings/{id}/actions` | Get action items for a meeting |
| `POST` | `/api/meetings/{id}/actions` | Create a new action item task |
| `PATCH` | `/api/actions/{action_id}/complete` | Toggle completion status of an action item |
| `PUT` | `/api/actions/{action_id}` | Edit action item task details |
| `DELETE` | `/api/actions/{action_id}` | Delete an action item task |
| `GET` | `/api/meetings/{id}/topics` | Get chapter topics list |

---

## 🚀 Local Setup Instructions

### 1. Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create virtual environment (optional)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Seed SQLite database with sample meetings
python -m app.seed

# Start FastAPI server on port 8000
python -m uvicorn app.main:app --port 8000 --reload
```

Backend will be running at `http://localhost:8000` (API Docs at `http://localhost:8000/docs`).

### 3. Frontend Setup
```bash
# Open new terminal and navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Next.js development server on port 3000
npm run dev -- -p 3000
```

Open `http://localhost:3000` in your web browser.

---

## 📝 Demo Walkthrough Checklist

1. **Browse Meetings Dashboard**: View 5 seeded meetings with titles, dates, durations, and participant chips.
2. **Search & Filter**: Type `"product"` into search bar -> verify instant filtering.
3. **Open Workspace**: Click on `"Product Strategy & Q4 Roadmap Sync"`.
4. **Interactive Audio-Transcript Sync**:
   - Click transcript segment at `01:20` -> audio seeks to `01:20` and highlights active speaker line.
   - Scrub audio timeline bar -> active transcript line updates automatically.
5. **Transcript Search**: Type `"Stripe"` in transcript search -> view yellow text highlight and match count.
6. **Task Management**: Check off action items, edit due dates, or add new tasks.
7. **Create Meeting**: Click `+ New Meeting`, paste timestamped dialogue -> verify auto-parsing into database.
8. **Persistence**: Refresh browser page -> verify all edits and completed tasks persist in SQLite.
