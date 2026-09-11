"use client";

import React from "react";
import { TranscriptSegment } from "@/types";
import { Play } from "lucide-react";

interface TranscriptLineProps {
  segment: TranscriptSegment;
  isActive: boolean;
  searchQuery: string;
  onSegmentClick: (startTime: number) => void;
}

export default function TranscriptLine({
  segment,
  isActive,
  searchQuery,
  onSegmentClick,
}: TranscriptLineProps) {
  // Format seconds to MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Avatar bg helper
  const getSpeakerAvatar = (speaker: string) => {
    const char = speaker.charAt(0).toUpperCase();
    const colors = [
      "bg-purple-600 text-white",
      "bg-indigo-600 text-white",
      "bg-blue-600 text-white",
      "bg-emerald-600 text-white",
      "bg-amber-600 text-white"
    ];
    let hash = 0;
    for (let i = 0; i < speaker.length; i++) hash += speaker.charCodeAt(i);
    const colorClass = colors[hash % colors.length];
    return { char, colorClass };
  };

  const { char, colorClass } = getSpeakerAvatar(segment.speaker);

  // Search highlighting helper
  const renderHighlightedText = (text: string, query: string) => {
    if (!query.trim()) return text;
    const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));
    return (
      <span>
        {parts.map((part, index) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <mark key={index} className="bg-amber-200 text-amber-950 font-semibold px-1 rounded">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  return (
    <div
      id={`transcript-segment-${segment.id}`}
      onClick={() => onSegmentClick(segment.start_time)}
      className={`group p-4 rounded-xl transition-all cursor-pointer border ${
        isActive
          ? "bg-purple-50/80 border-purple-300 shadow-sm ring-1 ring-purple-400/50"
          : "bg-white hover:bg-slate-50/80 border-transparent hover:border-slate-200"
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Speaker Avatar */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${colorClass}`}>
          {char}
        </div>

        <div className="flex-1 min-w-0">
          {/* Speaker Header & Timestamp */}
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold ${isActive ? "text-purple-900" : "text-slate-900"}`}>
                {segment.speaker}
              </span>
              {isActive && (
                <span className="text-[10px] font-semibold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-ping" />
                  Speaking
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-slate-400 group-hover:text-purple-600 transition-colors">
              <Play className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="text-xs font-mono font-medium">{formatTime(segment.start_time)}</span>
            </div>
          </div>

          {/* Transcript Text Line */}
          <p className={`text-xs leading-relaxed ${isActive ? "text-slate-900 font-medium" : "text-slate-600"}`}>
            {renderHighlightedText(segment.text, searchQuery)}
          </p>
        </div>
      </div>
    </div>
  );
}
