"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Video,
  Settings,
  Flame,
  Bot,
  Zap,
  LogOut,
  UserCheck,
  Sparkles
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  if (pathname === "/auth") {
    return null;
  }

  const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "My Meetings", href: "/meetings", icon: Video },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const handleLogout = async () => {
    await logout();
    router.push("/auth");
  };

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col justify-between h-screen sticky top-0 flex-shrink-0">
      {/* Brand Header */}
      <div>
        <div className="p-5 flex items-center justify-between border-b border-slate-800/80">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform">
              <Flame className="w-5 h-5 fill-white text-white" />
            </div>
            <div>
              <span className="font-bold text-lg text-white tracking-tight flex items-center gap-1">
                NotePilot<span className="text-purple-400 font-extrabold">.ai</span>
              </span>
              <span className="text-[10px] text-purple-300/80 font-medium tracking-wider uppercase block -mt-1">
                Workspace Enterprise
              </span>
            </div>
          </Link>
        </div>

        {/* Live Bot Assistant Badge */}
        <div className="mx-4 mt-5 p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-slate-900 animate-pulse" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Fred Bot</p>
              <p className="text-[10px] text-slate-400">Ready to join calls</p>
            </div>
          </div>
          <span className="text-[10px] font-medium text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
            Active
          </span>
        </div>

        {/* Primary Navigation */}
        <nav className="p-4 space-y-1.5 mt-2">
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Navigation
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-purple-600 text-white shadow-md shadow-purple-900/30"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Integrations & Placeholders */}
        <div className="px-4 pt-4 border-t border-slate-800/80 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Integrations
          </div>
          <div className="px-3.5 py-2 rounded-xl text-xs text-slate-400 flex items-center justify-between hover:bg-slate-800/40 cursor-not-allowed">
            <span className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-slate-400" /> Zoom & Meet
            </span>
            <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">Soon</span>
          </div>
          <div className="px-3.5 py-2 rounded-xl text-xs text-slate-400 flex items-center justify-between hover:bg-slate-800/40 cursor-not-allowed">
            <span className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-slate-400" /> CRM Sync
            </span>
            <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">Soon</span>
          </div>
        </div>
      </div>

      {/* User Profile Footer */}
      <div className="p-4 border-t border-slate-800/80">
        {user ? (
          <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-800/40 border border-slate-800">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-inner shrink-0">
              {getInitials(user.name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user.name}</p>
              <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1 text-slate-400 hover:text-red-400 transition-colors rounded-lg hover:bg-slate-800"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <Link
            href="/auth"
            className="flex items-center justify-center gap-2 w-full py-2.5 px-3 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-purple-900/40 transition-all"
          >
            <UserCheck className="w-4 h-4" />
            Sign In / Register
          </Link>
        )}
      </div>
    </aside>
  );
}
