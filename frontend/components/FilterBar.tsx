"use client";

import React from "react";
import { Search, ArrowUpDown, UserCheck, CalendarDays, RotateCcw } from "lucide-react";

interface FilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  participant: string;
  onParticipantChange: (val: string) => void;
  dateFilter: string;
  onDateFilterChange: (val: string) => void;
  sort: string;
  onSortChange: (val: string) => void;
  participantOptions: string[];
  onReset: () => void;
}

export default function FilterBar({
  search,
  onSearchChange,
  participant,
  onParticipantChange,
  dateFilter,
  onDateFilterChange,
  sort,
  onSortChange,
  participantOptions,
  onReset,
}: FilterBarProps) {
  const isFiltered = search !== "" || participant !== "All Participants" || dateFilter !== "all" || sort !== "recent";

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 mb-6 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search by title, participant, or summary content..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:bg-white focus:border-purple-300 transition-all"
        />
        {search && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
          >
            ×
          </button>
        )}
      </div>

      {/* Filter Dropdowns Container */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Participant Dropdown */}
        <div className="relative min-w-[150px]">
          <select
            value={participant}
            onChange={(e) => onParticipantChange(e.target.value)}
            className="w-full pl-8 pr-7 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/20 cursor-pointer appearance-none transition-colors"
          >
            <option value="All Participants">All Participants</option>
            {participantOptions.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <UserCheck className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>

        {/* Date Filter Dropdown */}
        <div className="relative min-w-[130px]">
          <select
            value={dateFilter}
            onChange={(e) => onDateFilterChange(e.target.value)}
            className="w-full pl-8 pr-7 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/20 cursor-pointer appearance-none transition-colors"
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
          </select>
          <CalendarDays className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>

        {/* Sort Dropdown */}
        <div className="relative min-w-[140px]">
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value)}
            className="w-full pl-8 pr-7 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/20 cursor-pointer appearance-none transition-colors"
          >
            <option value="recent">Most Recent</option>
            <option value="oldest">Oldest</option>
            <option value="duration_long">Duration (Longest)</option>
            <option value="duration_short">Duration (Shortest)</option>
          </select>
          <ArrowUpDown className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>

        {/* Reset Filters Button */}
        {isFiltered && (
          <button
            onClick={onReset}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors"
            title="Reset Filters"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
        )}
      </div>
    </div>
  );
}
