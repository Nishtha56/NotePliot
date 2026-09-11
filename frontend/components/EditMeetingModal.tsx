"use client";

import React, { useState } from "react";
import { MeetingDetail } from "@/types";
import { X, Save } from "lucide-react";
import { updateMeeting } from "@/lib/api";
import { useToast } from "./Toast";

interface EditMeetingModalProps {
  meeting: MeetingDetail;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditMeetingModal({ meeting, onClose, onSuccess }: EditMeetingModalProps) {
  const { showToast } = useToast();
  const [title, setTitle] = useState(meeting.title);
  const [date, setDate] = useState(meeting.date);
  const [time, setTime] = useState(meeting.time);
  const [duration, setDuration] = useState(meeting.duration);
  const [description, setDescription] = useState(meeting.description || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      await updateMeeting(meeting.id, {
        title: title.trim(),
        date: date.trim(),
        time: time.trim(),
        duration: duration.trim(),
        description: description.trim() || undefined,
      });
      showToast("Meeting updated successfully", title, "success");
      onSuccess();
    } catch (err: unknown) {
      showToast("Failed to update meeting", err instanceof Error ? err.message : "Unexpected update error", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">Edit Meeting Metadata</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Meeting Title</label>
            <input
              type="text"
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
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Time</label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Duration</label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description / Notes</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
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
              className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-purple-600/20 disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
