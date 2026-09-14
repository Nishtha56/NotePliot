"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Flame,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Bot,
  Zap,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import GoogleLogin from "@/components/GoogleLogin";
import { useToast } from "@/components/Toast";

export default function AuthPage() {
  const router = useRouter();
  const { user, login, signup } = useAuth();
  const { showToast } = useToast();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  
  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // Status states
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const tabParam = new URLSearchParams(window.location.search).get("tab");
    if (tabParam === "signup") {
      setMode("signup");
    }
  }, []);

  // If already logged in, redirect to dashboard immediately
  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Basic Client Validations
    if (!email || !email.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    if (!password || password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }
    if (mode === "signup" && !name.trim()) {
      setErrorMsg("Please enter your full name.");
      return;
    }

    setSubmitting(true);
    try {
      if (mode === "signin") {
        await login(email, password);
        showToast("Signed in successfully!", "Redirecting to your workspace...", "success");
      } else {
        await signup(email, password, name);
        showToast("Account created successfully!", "Redirecting to your workspace...", "success");
      }
      router.push("/");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred.";
      setErrorMsg(message);
      showToast("Authentication failed", message || "Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoLogin = async () => {
    setSubmitting(true);
    setErrorMsg(null);
    try {
      // Demo user credentials
      try {
        await login("demo@notepilot.ai", "demo123456");
      } catch {
        // If demo user doesn't exist yet, sign up automatically
        await signup("demo@notepilot.ai", "demo123456", "Demo Workspace User");
      }
      showToast("Signed in as Demo User", "Redirecting to workspace...", "success");
      router.push("/");
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-950 text-slate-100">
      {/* Brand Navigation Header */}
      <header className="p-6 flex items-center justify-between z-20 border-b border-slate-900">
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

        <Link
          href="/"
          className="text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          ← Back to Workspace
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
        {/* Background Decorative Glow Blobs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-72 h-72 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          
          {/* Left Column: Brand Hero & Features */}
          <div className="lg:col-span-5 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Next-Gen Meeting Intelligence</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Unlock AI meeting notes & transcripts
            </h1>

            <p className="text-sm text-slate-400 leading-relaxed">
              Sign in to your NotePilot workspace to transcribe calls, generate summaries, and assign action items automatically.
            </p>

            <div className="space-y-3 pt-2">
              {[
                { title: "Real-time Transcription", desc: "Live multi-speaker diarization", icon: Zap },
                { title: "AI Executive Summaries", desc: "Key topics & action items extracted", icon: Bot },
                { title: "Enterprise Grade Privacy", desc: "Encrypted data & session protection", icon: ShieldCheck },
              ].map((feat, idx) => {
                const Icon = feat.icon;
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm"
                  >
                    <div className="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-white">{feat.title}</h4>
                      <p className="text-[11px] text-slate-400">{feat.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Interactive Card Form */}
          <div className="lg:col-span-7">
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-purple-950/20 backdrop-blur-xl">
              
              {/* Tab Switcher */}
              <div className="flex p-1 bg-slate-950/80 rounded-2xl border border-slate-800/80 mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setMode("signin");
                    setErrorMsg(null);
                  }}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
                    mode === "signin"
                      ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("signup");
                    setErrorMsg(null);
                  }}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
                    mode === "signup"
                      ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* Logged in state banner if user already authenticated */}
              {user && (
                <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-emerald-200">
                        Signed in as {user.name}
                      </p>
                      <p className="text-[10px] text-emerald-400/80">{user.email}</p>
                    </div>
                  </div>
                  <Link
                    href="/"
                    className="px-3 py-1.5 bg-emerald-500 text-slate-950 text-xs font-bold rounded-xl hover:bg-emerald-400 transition-colors"
                  >
                    Go to Dashboard
                  </Link>
                </div>
              )}

              {/* Error Message Box */}
              {errorMsg && (
                <div className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-2.5 text-red-400 animate-in fade-in slide-in-from-top-1 duration-200">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p className="text-xs font-medium leading-tight">{errorMsg}</p>
                </div>
              )}

              {/* Auth Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name field (Sign Up only) */}
                {mode === "signup" && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                      <input
                        type="text"
                        required
                        placeholder="Alex Morgan"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                      />
                    </div>
                  </div>
                )}

                {/* Email field */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Work Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                    <input
                      type="email"
                      required
                      placeholder="alex@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                    />
                  </div>
                </div>

                {/* Password field */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-300">Password</label>
                    {mode === "signin" && (
                      <span className="text-[11px] text-purple-400 hover:text-purple-300 cursor-pointer">
                        Forgot password?
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full mt-2 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{mode === "signin" ? "Signing In..." : "Creating Account..."}</span>
                    </>
                  ) : (
                    <>
                      <span>{mode === "signin" ? "Sign In to Workspace" : "Create Account"}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-800" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-semibold tracking-wider text-slate-500 bg-slate-900 px-3">
                  Or continue with
                </div>
              </div>

              {/* Social Login Options */}
              <div className="space-y-3 flex flex-col items-center">
                <GoogleLogin />

                <button
                  type="button"
                  onClick={handleDemoLogin}
                  disabled={submitting}
                  className="w-full max-w-sm py-2 px-3 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>Quick Demo Login</span>
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
