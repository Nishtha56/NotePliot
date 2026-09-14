"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Topbar from "@/components/Topbar";
import MeetingCard from "@/components/MeetingCard";
import CreateMeetingModal from "@/components/CreateMeetingModal";
import { MeetingListItem } from "@/types";
import { getMeetings, deleteMeeting } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/Toast";
import {
  Video,
  Sparkles,
  Plus,
  ArrowRight,
  Bot,
  ListTodo,
  FileText,
  AlertTriangle
} from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [meetings, setMeetings] = useState<MeetingListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch recent meetings
  const fetchMeetingsData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getMeetings({ sort: "recent" });
      setMeetings(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load dashboard data";
      setError(message);
      showToast("Unable to fetch dashboard metrics", message, "error");
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchMeetingsData();
  }, [fetchMeetingsData]);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteMeeting(deleteTarget.id);
      showToast("Meeting deleted successfully", deleteTarget.title, "info");
      setDeleteTarget(null);
      fetchMeetingsData();
    } catch (err: unknown) {
      showToast("Error deleting meeting", err instanceof Error ? err.message : "Unexpected delete error", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  // Metrics calculation
  const totalMeetings = meetings.length;
  const totalActionItems = meetings.reduce((acc, m) => acc + m.action_item_count, 0);

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-100/60">
      {/* Top Bar Navigation */}
      <Topbar
        title="Workspace Dashboard"
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
      />

      <div className="p-6 max-w-7xl mx-auto w-full flex-1 space-y-6">
        {/* Welcome Banner Section */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 border border-slate-800 relative overflow-hidden">
          {/* Subtle Background Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30 mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Workspace Meeting Intelligence
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Welcome back{user ? `, ${user.name}` : " to NotePilot"}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
              Your central hub for transcript processing, executive summaries, and action item automation.
            </p>
          </div>

          {/* Quick Metrics Cards */}
          <div className="relative z-10 flex items-center gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800/80 backdrop-blur-sm self-stretch lg:self-auto justify-around">
            <div className="text-center px-4 border-r border-slate-800">
              <span className="block text-2xl font-black text-white">{totalMeetings}</span>
              <span className="text-xs text-slate-400 font-medium">Total Meetings</span>
            </div>
            <div className="text-center px-4">
              <span className="block text-2xl font-black text-emerald-400">{totalActionItems}</span>
              <span className="text-xs text-slate-400 font-medium">Action Items</span>
            </div>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Fred AI Assistant</h3>
              <p className="text-xs text-slate-500 mt-0.5">Auto-transcribes calls with speaker identification</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">AI Summaries</h3>
              <p className="text-xs text-slate-500 mt-0.5">Key takeaways and executive bullet points</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <ListTodo className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Action Items Sync</h3>
              <p className="text-xs text-slate-500 mt-0.5">Assign tasks and track completion status</p>
            </div>
          </div>
        </div>

        {/* Recent Meetings Section */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Recent Meetings</h2>
              <p className="text-xs text-slate-500">Your latest processed meetings and notes</p>
            </div>

            <Link
              href="/meetings"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 hover:text-purple-700 transition-colors"
            >
              <span>View All Meetings</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200 animate-pulse h-64 flex flex-col justify-between">
                  <div>
                    <div className="h-5 bg-slate-200 rounded w-3/4 mb-3" />
                    <div className="h-4 bg-slate-100 rounded w-1/2 mb-4" />
                    <div className="h-12 bg-slate-100 rounded w-full" />
                  </div>
                  <div className="h-8 bg-slate-200 rounded w-full" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="bg-white rounded-2xl border border-red-200 p-8 text-center max-w-lg mx-auto">
              <p className="text-sm font-semibold text-red-600 mb-2">{error}</p>
              <button
                onClick={fetchMeetingsData}
                className="px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-semibold hover:bg-purple-700"
              >
                Try Again
              </button>
            </div>
          ) : meetings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {meetings.map((meeting) => (
                <MeetingCard
                  key={meeting.id}
                  meeting={meeting}
                  onDeleteClick={(id, title) => setDeleteTarget({ id, title })}
                />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center max-w-lg mx-auto my-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-3">
                <Video className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">No meetings yet</h3>
              <p className="text-xs text-slate-500 mb-6">
                Get started by creating or uploading your first meeting transcript.
              </p>

              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-lg shadow-purple-600/30"
              >
                <Plus className="w-4 h-4" /> Create New Meeting
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Create Meeting Modal */}
      {isCreateModalOpen && (
        <CreateMeetingModal
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={fetchMeetingsData}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Delete Meeting?</h3>
            </div>
            <p className="text-xs text-slate-600 mb-6">
              Are you sure you want to delete &quot;<span className="font-semibold text-slate-900">{deleteTarget.title}</span>&quot;?
              This action will remove all transcripts and action items permanently.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-red-600/20 disabled:opacity-50"
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
