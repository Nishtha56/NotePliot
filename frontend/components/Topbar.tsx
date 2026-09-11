"use client";

import React from "react";
import Link from "next/link";
import { Plus, Bell, Search, Sparkles, User } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

interface TopbarProps {
  title?: string;
  onOpenCreateModal?: () => void;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
}

export default function Topbar({
  title = "Meetings Workspace",
  onOpenCreateModal,
  searchValue,
  onSearchChange,
}: TopbarProps) {
  const { user } = useAuth();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Title & Page Header */}
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h1>
        <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200/60">
          <Sparkles className="w-3 h-3 text-purple-600" /> AI-Powered
        </span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Search input (optional header search) */}
        {onSearchChange !== undefined && (
          <div className="relative hidden lg:block w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search meetings..."
              value={searchValue || ""}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-slate-100/80 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:bg-white transition-all text-slate-800 placeholder:text-slate-400"
            />
          </div>
        )}

        {/* Notifications Icon */}
        <button
          className="w-9 h-9 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 flex items-center justify-center relative transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-purple-600 rounded-full ring-2 ring-white" />
        </button>

        {/* New Meeting Button */}
        {onOpenCreateModal ? (
          <button
            onClick={onOpenCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white text-xs font-semibold rounded-xl shadow-md shadow-purple-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Meeting</span>
          </button>
        ) : (
          <Link
            href="/create"
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white text-xs font-semibold rounded-xl shadow-md shadow-purple-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Meeting</span>
          </Link>
        )}

        {/* Interactive Authentication Button (Man Icon) */}
        {user ? (
          <Link
            href="/settings"
            title={`Signed in as ${user.name} (${user.email})`}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 font-semibold text-xs transition-all shadow-sm group ml-1"
          >
            <div className="w-6 h-6 rounded-lg bg-purple-600 text-white font-bold text-[10px] flex items-center justify-center shadow-inner">
              {getInitials(user.name)}
            </div>
            <span className="hidden sm:inline max-w-[100px] truncate">{user.name}</span>
          </Link>
        ) : (
          <Link
            href="/auth"
            title="Sign In or Create Account"
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 hover:bg-purple-600 hover:text-white border border-slate-200 hover:border-purple-600 text-slate-700 font-semibold text-xs transition-all shadow-sm ml-1 group"
          >
            <User className="w-4 h-4 text-purple-600 group-hover:text-white transition-colors" />
            <span className="hidden sm:inline">Sign In</span>
          </Link>
        )}
      </div>
    </header>
  );
}
