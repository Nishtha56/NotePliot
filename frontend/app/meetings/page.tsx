"use client";

import React, { useState, useEffect, useCallback } from "react";
import Topbar from "@/components/Topbar";
import FilterBar from "@/components/FilterBar";
import MeetingCard from "@/components/MeetingCard";
import CreateMeetingModal from "@/components/CreateMeetingModal";
import { MeetingListItem } from "@/types";
import { getMeetings, deleteMeeting } from "@/lib/api";
import { useToast } from "@/components/Toast";
import { Video, Plus, AlertTriangle } from "lucide-react";

export default function MeetingsPage() {
  const { showToast } = useToast();
  const [meetings, setMeetings] = useState<MeetingListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter States
  const [search, setSearch] = useState("");
  const [participant, setParticipant] = useState("All Participants");
  const [dateFilter, setDateFilter] = useState("all");
  const [sort, setSort] = useState("recent");

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch meetings from FastAPI backend
  const fetchMeetingsData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getMeetings({
        search: search.trim() || undefined,
        participant: participant !== "All Participants" ? participant : undefined,
        date_filter: dateFilter !== "all" ? dateFilter : undefined,
        sort,
      });
      setMeetings(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load meetings library";
      setError(message);
      showToast("Unable to fetch meetings", message, "error");
    } finally {
      setIsLoading(false);
    }
  }, [search, participant, dateFilter, sort, showToast]);

  useEffect(() => {
    fetchMeetingsData();
  }, [fetchMeetingsData]);

  // Unique participant names options extracted from meetings
  const allParticipantNames = Array.from(
    new Set(meetings.flatMap((m) => m.participants.map((p) => p.name)))
  );

  const handleResetFilters = () => {
    setSearch("");
    setParticipant("All Participants");
    setDateFilter("all");
    setSort("recent");
  };

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

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-100/60">
      {/* Top Bar Navigation */}
      <Topbar
        title="My Meetings Library"
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        searchValue={search}
        onSearchChange={setSearch}
      />

      <div className="p-6 max-w-7xl mx-auto w-full flex-1">
        {/* Header Title Section */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">All Transcripts & Notes</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Filter, search, and manage your processed meeting recordings.
            </p>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white text-xs font-semibold rounded-xl shadow-md shadow-purple-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Meeting</span>
          </button>
        </div>

        {/* Filter and Search Bar */}
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          participant={participant}
          onParticipantChange={setParticipant}
          dateFilter={dateFilter}
          onDateFilterChange={setDateFilter}
          sort={sort}
          onSortChange={setSort}
          participantOptions={allParticipantNames}
          onReset={handleResetFilters}
        />

        {/* Meetings Grid List */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
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
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center max-w-lg mx-auto my-8">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-3">
              <Video className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">No meetings found</h3>
            <p className="text-xs text-slate-500 mb-6">
              {search || participant !== "All Participants" || dateFilter !== "all"
                ? "Try clearing filters or adjusting your search term."
                : "Get started by creating or uploading your first meeting transcript."}
            </p>

            {search || participant !== "All Participants" || dateFilter !== "all" ? (
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Reset Filters
              </button>
            ) : (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-lg shadow-purple-600/30"
              >
                <Plus className="w-4 h-4" /> Create New Meeting
              </button>
            )}
          </div>
        )}
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
