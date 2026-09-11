"use client";

import React from "react";
import Link from "next/link";
import { MeetingListItem } from "@/types";
import {
  Calendar,
  Clock,
  CheckCircle2,
  ChevronRight,
  MoreVertical,
  Trash2,
  FileText
} from "lucide-react";

interface MeetingCardProps {
  meeting: MeetingListItem;
  onDeleteClick?: (meetingId: number, title: string) => void;
}

export default function MeetingCard({ meeting, onDeleteClick }: MeetingCardProps) {
  const [showMenu, setShowMenu] = React.useState(false);

  // Avatar colors helper
  const getAvatarBg = (index: number) => {
    const colors = [
      "bg-purple-600 text-white",
      "bg-indigo-600 text-white",
      "bg-blue-600 text-white",
      "bg-emerald-600 text-white",
      "bg-amber-600 text-white"
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 hover:border-purple-300 hover:shadow-xl hover:shadow-purple-950/5 transition-all duration-300 flex flex-col justify-between overflow-hidden relative">
      {/* Top Header Section */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <Link href={`/meetings/${meeting.id}`} className="group-hover:text-purple-700 transition-colors">
            <h3 className="text-base font-bold text-slate-900 line-clamp-1 group-hover:text-purple-600 transition-colors">
              {meeting.title}
            </h3>
          </Link>

          {/* Action Menu dropdown */}
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-1 w-40 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-30 text-xs animate-in fade-in zoom-in-95">
                <Link
                  href={`/meetings/${meeting.id}`}
                  className="w-full text-left px-3.5 py-2 text-slate-700 hover:bg-purple-50 hover:text-purple-700 flex items-center gap-2"
                >
                  <FileText className="w-3.5 h-3.5" /> View Transcript
                </Link>
                {onDeleteClick && (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onDeleteClick(meeting.id, meeting.title);
                    }}
                    className="w-full text-left px-3.5 py-2 text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete Meeting
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Date, Time & Duration Badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-4">
          <span className="flex items-center gap-1.5 bg-slate-100/80 px-2.5 py-1 rounded-lg font-medium text-slate-700">
            <Calendar className="w-3.5 h-3.5 text-purple-600" />
            {meeting.date}
          </span>
          <span className="flex items-center gap-1.5 bg-slate-100/80 px-2.5 py-1 rounded-lg font-medium text-slate-700">
            <Clock className="w-3.5 h-3.5 text-indigo-600" />
            {meeting.duration}
          </span>
          {meeting.action_item_count > 0 && (
            <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg font-medium border border-emerald-200/60">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              {meeting.action_item_count} Action Items
            </span>
          )}
        </div>

        {/* Summary Snippet Preview */}
        {meeting.summary_preview && (
          <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 mb-4">
            {meeting.summary_preview}
          </p>
        )}

        {/* Topics preview tags */}
        {meeting.topic_titles && meeting.topic_titles.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {meeting.topic_titles.slice(0, 3).map((topic, i) => (
              <span
                key={i}
                className="text-[10px] bg-purple-50 text-purple-700 font-medium px-2 py-0.5 rounded-md truncate max-w-[150px]"
              >
                {topic}
              </span>
            ))}
            {meeting.topic_titles.length > 3 && (
              <span className="text-[10px] bg-slate-100 text-slate-500 font-medium px-2 py-0.5 rounded-md">
                +{meeting.topic_titles.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Card Footer: Participants & View Workspace Button */}
      <div className="px-6 py-3.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
        {/* Participant Avatars */}
        <div className="flex items-center">
          <div className="flex -space-x-2 overflow-hidden">
            {meeting.participants.slice(0, 4).map((p, idx) => (
              <div
                key={p.id || idx}
                title={`${p.name} (${p.email || 'No email'})`}
                className={`inline-flex items-center justify-center w-7 h-7 rounded-full ring-2 ring-white text-[10px] font-bold ${getAvatarBg(
                  idx
                )}`}
              >
                {p.name.charAt(0).toUpperCase()}
              </div>
            ))}
          </div>
          {meeting.participants.length > 4 && (
            <span className="text-[11px] font-semibold text-slate-500 ml-2">
              +{meeting.participants.length - 4}
            </span>
          )}
          {meeting.participants.length <= 4 && (
            <span className="text-[11px] text-slate-500 ml-2.5 truncate max-w-[120px]">
              {meeting.participants.map((p) => p.name.split(" ")[0]).join(", ")}
            </span>
          )}
        </div>

        {/* View Details Link */}
        <Link
          href={`/meetings/${meeting.id}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-purple-600 hover:text-purple-800 transition-colors"
        >
          Open <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
