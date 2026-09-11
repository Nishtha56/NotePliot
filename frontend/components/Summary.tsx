"use client";

import React from "react";
import { Summary as SummaryType, Topic } from "@/types";
import { Sparkles, FileText, CheckCircle2, Bookmark, Download } from "lucide-react";

interface SummaryProps {
  summary?: SummaryType | null;
  topics?: Topic[];
  onTopicClick: (startTime: number) => void;
  meetingTitle: string;
}

export default function Summary({ summary, topics = [], onTopicClick, meetingTitle }: SummaryProps) {
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleExportText = () => {
    if (!summary) return;
    const content = `MEETING SUMMARY: ${meetingTitle}\n\nOVERVIEW:\n${summary.overview}\n\nKEY POINTS:\n${summary.key_points.map(kp => `- ${kp}`).join("\n")}`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${meetingTitle.replace(/[^a-zA-Z0-9]/g, "_")}_summary.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportMarkdown = () => {
    if (!summary) return;
    const content = `# Summary: ${meetingTitle}\n\n## Overview\n${summary.overview}\n\n## Key Discussion Points\n${summary.key_points.map(kp => `* ${kp}`).join("\n")}\n\n## Topics Outline\n${topics.map(t => `* **[${formatTime(t.start_time)}]** ${t.title}`).join("\n")}`;
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${meetingTitle.replace(/[^a-zA-Z0-9]/g, "_")}_summary.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Executive Overview Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">AI Executive Overview</h3>
              <p className="text-[11px] text-slate-400">Automated synthesis of key discussion takeaways</p>
            </div>
          </div>

          {/* Export Dropdown */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportText}
              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Export TXT"
            >
              <Download className="w-3.5 h-3.5" /> TXT
            </button>
            <button
              onClick={handleExportMarkdown}
              className="px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Export Markdown"
            >
              <FileText className="w-3.5 h-3.5" /> Markdown
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/70 p-4 rounded-xl border border-slate-100">
          {summary?.overview || "No summary available for this meeting yet."}
        </p>
      </div>

      {/* Key Discussion Points */}
      {summary?.key_points && summary.key_points.length > 0 && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">Key Discussion Points</h3>
          </div>

          <ul className="space-y-2.5">
            {summary.key_points.map((point, i) => (
              <li key={i} className="flex items-start gap-3 text-xs text-slate-700 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-2 flex-shrink-0" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Interactive Topics / Outline */}
      {topics.length > 0 && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Bookmark className="w-4 h-4 text-purple-600" />
            <h3 className="text-sm font-bold text-slate-900">Meeting Outline & Chapters</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {topics.map((topic) => (
              <button
                key={topic.id}
                onClick={() => onTopicClick(topic.start_time)}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-purple-50 hover:border-purple-200 border border-slate-100 text-left transition-all group"
              >
                <span className="text-xs font-semibold text-slate-800 group-hover:text-purple-900 truncate">
                  {topic.title}
                </span>
                <span className="text-[11px] font-mono font-medium text-slate-400 group-hover:text-purple-600 bg-white px-2 py-0.5 rounded-md border border-slate-200 flex-shrink-0 ml-2">
                  {formatTime(topic.start_time)}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
