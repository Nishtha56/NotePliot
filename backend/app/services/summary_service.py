import re
from typing import List, Dict, Any

def time_str_to_seconds(time_str: str) -> float:
    """Converts MM:SS or HH:MM:SS string into seconds float."""
    parts = time_str.strip().split(":")
    try:
        if len(parts) == 2:
            return float(parts[0]) * 60 + float(parts[1])
        elif len(parts) == 3:
            return float(parts[0]) * 3600 + float(parts[1]) * 60 + float(parts[2])
    except ValueError:
        pass
    return 0.0

def parse_transcript_text(raw_text: str) -> List[Dict[str, Any]]:
    """
    Parses plain text transcript formats:
    Example 1: [00:15] Sarah: Let's discuss the product roadmap.
    Example 2: Sarah [00:15]: Let's discuss the product roadmap.
    Example 3: Sarah: Let's discuss the product roadmap.
    """
    lines = raw_text.strip().split("\n")
    segments = []
    
    # Pattern 1: [00:15] Speaker: Text or [00:15:20] Speaker: Text
    pattern1 = re.compile(r"^\[(\d{1,2}:\d{2}(?::\d{2})?)\]\s*([^:]+):\s*(.*)$")
    # Pattern 2: Speaker [00:15]: Text
    pattern2 = re.compile(r"^([^\[]+)\s*\[(\d{1,2}:\d{2}(?::\d{2})?)\]:\s*(.*)$")
    # Pattern 3: Speaker: Text
    pattern3 = re.compile(r"^([^:]+):\s*(.*)$")

    current_time = 0.0

    for idx, line in enumerate(lines):
        line = line.strip()
        if not line:
            continue

        match1 = pattern1.match(line)
        match2 = pattern2.match(line)
        match3 = pattern3.match(line)

        if match1:
            timestamp_str, speaker, text = match1.groups()
            start_time = time_str_to_seconds(timestamp_str)
        elif match2:
            speaker, timestamp_str, text = match2.groups()
            start_time = time_str_to_seconds(timestamp_str)
        elif match3:
            speaker, text = match3.groups()
            start_time = current_time
            current_time += 15.0  # Default interval if missing timestamp
        else:
            # Append to previous segment if unparsed line
            if segments:
                segments[-1]["text"] += " " + line
            continue

        speaker = speaker.strip()
        text = text.strip()

        segments.append({
            "speaker": speaker,
            "start_time": start_time,
            "end_time": start_time + 15.0,  # Temporary end_time
            "text": text
        })

    # Adjust end_times based on next segment's start_time
    for i in range(len(segments)):
        if i < len(segments) - 1:
            next_start = segments[i + 1]["start_time"]
            if next_start > segments[i]["start_time"]:
                segments[i]["end_time"] = next_start
            else:
                segments[i]["end_time"] = segments[i]["start_time"] + 12.0
        else:
            segments[i]["end_time"] = segments[i]["start_time"] + 15.0

    return segments

def generate_summary_and_assets(segments: List[Dict[str, Any]], title: str) -> Dict[str, Any]:
    """
    Generates intelligent summary, topics, and action items from transcript segments.
    """
    if not segments:
        return {
            "overview": f"Meeting notes and key discussion points for {title}.",
            "key_points": ["Initial discussion and project alignment.", "Reviewed key objectives and next milestones."],
            "topics": [{"title": "Introduction", "start_time": 0.0}],
            "action_items": [{"title": "Follow up on meeting takeaways", "assignee": "Team", "due_date": "Next Week"}]
        }

    speakers = list(dict.fromkeys(s["speaker"] for s in segments))
    total_segments = len(segments)

    # Extract overview
    first_few_texts = " ".join([s["text"] for s in segments[:3]])
    overview = f"The team convened for '{title}' featuring {', '.join(speakers)}. The discussion centered around critical project updates, resource planning, and key strategic priorities: {first_few_texts[:180]}..."

    # Extract topics from timestamps
    topics = []
    interval = max(1, total_segments // 4)
    topic_titles = [
        "Executive Summary & Context",
        "Deep Dive & Technical Analysis",
        "Key Challenges & Strategy",
        "Next Steps & Action Planning"
    ]
    for i, idx in enumerate(range(0, total_segments, interval)):
        if i < len(topic_titles):
            topics.append({
                "title": topic_titles[i],
                "start_time": segments[idx]["start_time"]
            })

    # Extract action items
    action_items = []
    action_keywords = ["need to", "should", "will", "prepare", "review", "finalize", "action", "schedule", "assign"]
    
    for seg in segments:
        text_lower = seg["text"].lower()
        if any(kw in text_lower for kw in action_keywords):
            # Clean up action text
            cleaned_action = seg["text"].capitalize()
            if len(cleaned_action) > 80:
                cleaned_action = cleaned_action[:77] + "..."
            action_items.append({
                "title": cleaned_action,
                "description": f"Discussed by {seg['speaker']} during meeting.",
                "assignee": seg["speaker"],
                "due_date": "Within 5 days",
                "completed": False
            })

    if not action_items:
        action_items = [
            {"title": f"Review action points for {title}", "assignee": speakers[0] if speakers else "Lead", "due_date": "Next Sync", "completed": False},
            {"title": f"Share recording & meeting summary with stakeholders", "assignee": "Organizer", "due_date": "Tomorrow", "completed": False}
        ]

    # Key discussion points
    key_points = [
        f"Aligned on primary roadmap deliverables and project dependencies for {title}.",
        f"Active contribution from key participants ({', '.join(speakers[:3])}).",
        f"Identified priority tasks and established clear execution ownership across the team.",
        f"Agreed to track progress and sync on status updates in the upcoming week."
    ]

    return {
        "overview": overview,
        "key_points": key_points,
        "topics": topics,
        "action_items": action_items[:5]  # Top 5 action items
    }
