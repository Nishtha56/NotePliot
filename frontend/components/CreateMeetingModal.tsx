"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Sparkles } from "lucide-react";
import { createMeeting } from "@/lib/api";
import { useToast } from "./Toast";

interface CreateMeetingModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CreateMeetingModal({ onClose, onSuccess }: CreateMeetingModalProps) {
  const router = useRouter();
  const { showToast } = useToast();

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("Aug 14, 2026");
  const [time, setTime] = useState("10:00 AM");
  const [duration, setDuration] = useState("45m");
  const [participantsText, setParticipantsText] = useState("John Carter, Sarah Jenkins, Mike Rivera");
  const [transcriptText, setTranscriptText] = useState(
    `[00:00] John Carter: Welcome everyone to today's product alignment meeting.
[00:15] Sarah Jenkins: Thanks John. Let's discuss our Q4 onboarding conversion goals.
[00:35] Mike Rivera: I reviewed the telemetry data. We need to streamline workspace permissions.
[00:55] John Carter: Agreed. Sarah, please draft simplified onboarding wireframes by next Tuesday.`
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);

    try {
      // Parse participants
      const participants = participantsText
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean)
        .map((name) => ({
          name,
          email: `${name.toLowerCase().replace(/\s+/g, ".")}@acme.io`,
        }));

      const newMeeting = await createMeeting({
        title: title.trim(),
        date: date.trim(),
        time: time.trim(),
        duration: duration.trim(),
        participants,
        transcript_text: transcriptText.trim() || undefined,
      });

      showToast("Meeting created & transcript processed!", title, "success");
      if (onSuccess) onSuccess();
      onClose();
      router.push(`/meetings/${newMeeting.id}`);
    } catch (err: unknown) {
      showToast("Failed to create meeting", err instanceof Error ? err.message : "Unexpected create error", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-8 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-600/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Create New Meeting</h3>
              <p className="text-[11px] text-slate-400">Upload or paste transcript to generate AI notes</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Meeting Title *</label>
            <input
              type="text"
              placeholder="e.g. Q4 Growth & Revenue Strategy Sync"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-300"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Time</label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Duration</label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Participants (comma-separated)</label>
            <input
              type="text"
              placeholder="John Carter, Sarah Jenkins, Mike Rivera"
              value={participantsText}
              onChange={(e) => setParticipantsText(e.target.value)}
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs text-slate-900"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Pasted Transcript Dialogue
              </label>
              <span className="text-[10px] text-purple-600 font-medium">Format: [MM:SS] Speaker: Text</span>
            </div>
            <textarea
              rows={5}
              placeholder="[00:00] Speaker Name: Dialogue text line..."
              value={transcriptText}
              onChange={(e) => setTranscriptText(e.target.value)}
              className="w-full p-3 font-mono border border-slate-200 rounded-xl text-xs text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-lg shadow-purple-600/30 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              {isSubmitting ? "Generating AI Notes..." : "Create & Process Meeting"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
