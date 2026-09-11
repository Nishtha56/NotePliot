"use client";

import React, { useState } from "react";
import Link from "next/link";
import Topbar from "@/components/Topbar";
import {
  User as UserIcon,
  Bell,
  Zap,
  Bot,
  Video,
  Calendar,
  Sparkles,
  LogOut
} from "lucide-react";
import { useToast } from "@/components/Toast";
import { useAuth } from "@/lib/auth-context";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const [summariesNotify, setSummariesNotify] = useState(true);
  const [actionsNotify, setActionsNotify] = useState(true);

  const handleSaveSettings = () => {
    showToast("Settings saved successfully", "Your preferences have been updated.", "success");
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-100/60">
      <Topbar title="Workspace Settings" />

      <div className="p-6 max-w-4xl mx-auto w-full space-y-6 flex-1">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm">
                {user ? user.name.substring(0, 2).toUpperCase() : <UserIcon className="w-5 h-5" />}
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">User Profile & Account</h2>
                <p className="text-xs text-slate-500">Manage your workspace account identity</p>
              </div>
            </div>
            {user ? (
              <button
                onClick={() => logout()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" /> Log Out
              </button>
            ) : (
              <Link
                href="/auth"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={user?.name || "Guest / Unauthenticated User"}
                disabled
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={user?.email || "Not signed in"}
                disabled
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Preferences & Notifications */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Preferences & Notifications</h2>
              <p className="text-xs text-slate-500">Configure email and workspace notifications</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <p className="text-xs font-semibold text-slate-900">Meeting Summary Notifications</p>
                <p className="text-[11px] text-slate-500">Receive instant AI summary reports after meetings end</p>
              </div>
              <input
                type="checkbox"
                checked={summariesNotify}
                onChange={(e) => setSummariesNotify(e.target.checked)}
                className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <p className="text-xs font-semibold text-slate-900">Action Item Reminders</p>
                <p className="text-[11px] text-slate-500">Receive task assignment and due date reminders</p>
              </div>
              <input
                type="checkbox"
                checked={actionsNotify}
                onChange={(e) => setActionsNotify(e.target.checked)}
                className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={handleSaveSettings}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-purple-600/20"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>

        {/* Integration Placeholders (Coming Soon) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Workspace Integrations</h2>
                <p className="text-xs text-slate-500">Connect Fireflies assistant to your calendar & platforms</p>
              </div>
            </div>
            <span className="text-xs bg-purple-100 text-purple-700 font-semibold px-2.5 py-1 rounded-full">
              Enterprise Suite
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { title: "Live Meeting Bot", desc: "Auto-join Zoom & Google Meet calls", icon: Bot },
              { title: "Zoom Integration", desc: "Sync meeting recordings automatically", icon: Video },
              { title: "Google Calendar", desc: "Auto-detect scheduled meetings", icon: Calendar },
              { title: "CRM Sync (HubSpot / Salesforce)", desc: "Push notes to CRM contacts", icon: Sparkles },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-600 flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900">{item.title}</p>
                      <p className="text-[10px] text-slate-500">{item.desc}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold bg-slate-200 text-slate-600 px-2 py-0.5 rounded">
                    Coming Soon
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
