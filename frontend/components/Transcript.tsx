"use client";

import React, { useState, useEffect, useRef } from "react";
import { TranscriptSegment } from "@/types";
import TranscriptLine from "./TranscriptLine";
import { Search, MessageSquare, X } from "lucide-react";

interface TranscriptProps {
  segments: TranscriptSegment[];
  currentTime: number;
  onSegmentClick: (startTime: number) => void;
}

export default function Transcript({ segments, currentTime, onSegmentClick }: TranscriptProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Find active segment based on current audio timestamp
  const activeSegment = segments.find(
    (seg) => seg.start_time <= currentTime && currentTime <= seg.end_time
  ) || segments[0];

  // Auto-scroll active transcript line into view smoothly
  useEffect(() => {
    if (activeSegment && containerRef.current) {
      const activeElement = document.getElementById(`transcript-segment-${activeSegment.id}`);
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  }, [activeSegment]);

  // Filtered segments matching search query
  const filteredSegments = segments.filter(
    (seg) =>
      seg.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      seg.speaker.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Total matching count
  const matchCount = searchQuery.trim()
    ? segments.reduce((acc, seg) => {
        const matches = (
          seg.text.toLowerCase().match(new RegExp(searchQuery.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []
        ).length;
        return acc + matches;
      }, 0)
    : 0;

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl flex flex-col h-full overflow-hidden shadow-sm">
      {/* Transcript Header with Search */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-purple-600" />
          <h3 className="text-sm font-bold text-slate-900">Interactive Transcript</h3>
          <span className="text-xs text-slate-400 font-medium ml-1">({segments.length} lines)</span>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search transcript..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-7 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-300 transition-all"
          />
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : null}
        </div>
      </div>

      {/* Match indicator count badge */}
      {searchQuery.trim() !== "" && (
        <div className="px-4 py-2 bg-amber-50 border-b border-amber-100 text-amber-800 text-xs flex items-center justify-between font-medium">
          <span>Found {matchCount} match{matchCount === 1 ? "" : "es"} for &quot;{searchQuery}&quot;</span>
          <button onClick={() => setSearchQuery("")} className="text-amber-700 underline text-[11px]">
            Clear
          </button>
        </div>
      )}

      {/* Transcript Scrollable Segment List */}
      <div ref={containerRef} className="flex-1 p-3 overflow-y-auto space-y-2 max-h-[600px]">
        {filteredSegments.length > 0 ? (
          filteredSegments.map((segment) => (
            <TranscriptLine
              key={segment.id}
              segment={segment}
              isActive={activeSegment?.id === segment.id}
              searchQuery={searchQuery}
              onSegmentClick={onSegmentClick}
            />
          ))
        ) : (
          <div className="text-center py-12 px-4">
            <p className="text-sm font-semibold text-slate-700">No transcript matches found</p>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your search query term</p>
          </div>
        )}
      </div>
    </div>
  );
}
