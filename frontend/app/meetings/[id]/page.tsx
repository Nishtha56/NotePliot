"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Topbar from "@/components/Topbar";
import MeetingHeader from "@/components/MeetingHeader";
import AudioPlayer from "@/components/AudioPlayer";
import Transcript from "@/components/Transcript";
import Summary from "@/components/Summary";
import ActionItems from "@/components/ActionItems";
import { MeetingDetail } from "@/types";
import { getMeeting } from "@/lib/api";
import { useToast } from "@/components/Toast";
import { Sparkles, CheckCircle2, MessageSquare } from "lucide-react";

export default function MeetingDetailPage() {
  const params = useParams();
  const meetingId = parseInt(params.id as string, 10);
  const { showToast } = useToast();

  const [meeting, setMeeting] = useState<MeetingDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Audio Playback & Sync State
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // View Tab Toggle for responsive / desktop views (Summary vs Transcript vs Action Items)
  const [activeTab, setActiveTab] = useState<"all" | "summary" | "transcript" | "actions">("all");

  const loadMeetingData = useCallback(async () => {
    if (isNaN(meetingId)) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await getMeeting(meetingId);
      setMeeting(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load meeting details";
      setError(message);
      showToast("Unable to load meeting workspace", message, "error");
    } finally {
      setIsLoading(false);
    }
  }, [meetingId, showToast]);

  useEffect(() => {
    loadMeetingData();
  }, [loadMeetingData]);

  // Audio Seek Trigger from Transcript Line Click or Topic Click
  const handleSeek = (time: number) => {
    setCurrentTime(time);
    setIsPlaying(true);
  };

  const handlePlayPauseToggle = () => {
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col min-h-screen bg-slate-100/60">
        <Topbar title="Loading Meeting Workspace..." />
        <div className="p-6 max-w-7xl mx-auto w-full animate-pulse space-y-6">
          <div className="h-20 bg-white rounded-2xl border border-slate-200" />
          <div className="h-24 bg-slate-900 rounded-2xl" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-96 bg-white rounded-2xl border border-slate-200" />
            <div className="h-96 bg-white rounded-2xl border border-slate-200" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div className="flex-1 flex flex-col min-h-screen bg-slate-100/60">
        <Topbar title="Meeting Intelligence" />
        <div className="p-12 text-center max-w-md mx-auto my-12 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-base font-bold text-slate-900 mb-2">Meeting Not Found</p>
          <p className="text-xs text-slate-500 mb-6">{error || "The requested meeting does not exist."}</p>
          <a
            href="/"
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold"
          >
            Return to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-100/60">
      {/* Top Navigation */}
      <Topbar title={meeting.title} />

      {/* Meeting Header Bar */}
      <MeetingHeader meeting={meeting} onMeetingUpdated={loadMeetingData} />

      {/* Main Workspace Layout */}
      <div className="p-6 max-w-7xl mx-auto w-full flex-1 space-y-6">
        {/* Sticky Audio Player */}
        <div className="sticky top-36 z-20 shadow-xl">
          {(() => {
            const activeSegment = meeting.transcript_segments.find(
              (seg) => seg.start_time <= currentTime && currentTime <= seg.end_time
            ) || meeting.transcript_segments[0];

            return (
              <AudioPlayer
                audioUrl="/audio/sample-meeting.wav"
                currentTime={currentTime}
                isPlaying={isPlaying}
                activeSegmentText={activeSegment?.text}
                activeSpeaker={activeSegment?.speaker}
                onPlayPauseToggle={handlePlayPauseToggle}
                onSeek={handleSeek}
                onTimeUpdate={handleTimeUpdate}
              />
            );
          })()}
        </div>

        {/* Tab Toggle Bar (For easy navigation on small/medium screens) */}
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-slate-200/80 w-fit">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "all" ? "bg-purple-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Split View
          </button>
          <button
            onClick={() => setActiveTab("summary")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === "summary" ? "bg-purple-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" /> Summary
          </button>
          <button
            onClick={() => setActiveTab("transcript")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === "transcript" ? "bg-purple-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" /> Transcript
          </button>
          <button
            onClick={() => setActiveTab("actions")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === "actions" ? "bg-purple-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Action Items ({meeting.action_items.length})
          </button>
        </div>

        {/* Workspace Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: AI Summary & Action Items */}
          {(activeTab === "all" || activeTab === "summary" || activeTab === "actions") && (
            <div
              className={`space-y-6 ${
                activeTab === "all" ? "lg:col-span-6" : "lg:col-span-12"
              }`}
            >
              {(activeTab === "all" || activeTab === "summary") && (
                <Summary
                  summary={meeting.summary}
                  topics={meeting.topics}
                  onTopicClick={handleSeek}
                  meetingTitle={meeting.title}
                />
              )}

              {(activeTab === "all" || activeTab === "actions") && (
                <ActionItems
                  meetingId={meeting.id}
                  actionItems={meeting.action_items}
                  onItemsChange={loadMeetingData}
                />
              )}
            </div>
          )}

          {/* Right Column: Interactive Transcript */}
          {(activeTab === "all" || activeTab === "transcript") && (
            <div
              className={`${
                activeTab === "all" ? "lg:col-span-6" : "lg:col-span-12"
              } h-full`}
            >
              <Transcript
                segments={meeting.transcript_segments}
                currentTime={currentTime}
                onSegmentClick={handleSeek}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
