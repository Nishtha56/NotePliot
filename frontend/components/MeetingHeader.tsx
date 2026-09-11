"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MeetingDetail } from "@/types";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  Edit2,
  Trash2,
  AlertTriangle
} from "lucide-react";
import { deleteMeeting } from "@/lib/api";
import { useToast } from "./Toast";
import EditMeetingModal from "./EditMeetingModal";

interface MeetingHeaderProps {
  meeting: MeetingDetail;
  onMeetingUpdated: () => void;
}

export default function MeetingHeader({ meeting, onMeetingUpdated }: MeetingHeaderProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteMeeting = async () => {
    setIsDeleting(true);
    try {
      await deleteMeeting(meeting.id);
      showToast("Meeting deleted successfully", meeting.title, "info");
      router.push("/");
    } catch (err: unknown) {
      showToast("Failed to delete meeting", err instanceof Error ? err.message : "Unexpected delete error", "error");
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white border-b border-slate-200/80 px-6 py-5 sticky top-16 z-10 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Back Link & Title Info */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-600 hover:text-purple-800 mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>

          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            {meeting.title}
          </h1>

          {/* Metadata Chips */}
          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-lg text-slate-700">
              <Calendar className="w-3.5 h-3.5 text-purple-600" />
              {meeting.date} · {meeting.time}
            </span>
            <span className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-lg text-slate-700">
              <Clock className="w-3.5 h-3.5 text-indigo-600" />
              {meeting.duration}
            </span>
            <span className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-lg text-slate-700">
              <Users className="w-3.5 h-3.5 text-emerald-600" />
              {meeting.participants.map((p) => p.name).join(", ")}
            </span>
          </div>
        </div>

        {/* Edit / Delete Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEditModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5 text-slate-600" /> Edit Meeting
          </button>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-xs font-semibold transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-600" /> Delete
          </button>
        </div>
      </div>

      {/* Edit Meeting Modal */}
      {showEditModal && (
        <EditMeetingModal
          meeting={meeting}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            setShowEditModal(false);
            onMeetingUpdated();
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Delete Meeting?</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-6">
              Are you sure you want to permanently delete &quot;<span className="font-semibold text-slate-900">{meeting.title}</span>&quot;?
              This will remove the meeting metadata, transcript, summary, and action items. This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={handleDeleteMeeting}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-red-600/20 disabled:opacity-50 transition-colors"
              >
                {isDeleting ? "Deleting..." : "Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
