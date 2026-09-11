"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, LogIn, ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (response: { credential: string }) => void }) => void;
          renderButton: (element: HTMLElement, options: Record<string, string | number | boolean>) => void;
        };
      };
    };
  }
}

export default function GoogleLogin() {
  const router = useRouter();
  const { setUser } = useAuth();
  const buttonRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "success" | "error">("loading");
  const [message, setMessage] = useState("Preparing secure sign-in...");

  const handleCredentialResponse = useCallback(async (response: { credential: string }) => {
    const googleToken = response.credential;
    setStatus("loading");
    setMessage("Verifying your Google account...");

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const result = await fetch(
        `${apiUrl}/api/auth/google`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            token: googleToken,
          }),
        }
      );

      const data = await result.json();
      if (!result.ok) {
        throw new Error(data.detail || "Google sign-in failed");
      }
      if (data.session_token) {
        localStorage.setItem("session_token", data.session_token);
      }
      if (setUser) {
        setUser(data.user);
      }
      setStatus("success");
      setMessage(`Signed in as ${data.user.name}`);
      router.push("/");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Google sign-in failed");
    }
  }, [router, setUser]);

  useEffect(() => {
    const initializeGoogleLogin = () => {
      if (!window.google || !buttonRef.current) {
        return;
      }
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

      if (!clientId) {
        console.error("NEXT_PUBLIC_GOOGLE_CLIENT_ID is not configured");
        return;
      }

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
      });

      buttonRef.current.innerHTML = "";

      window.google.accounts.id.renderButton(
        buttonRef.current,
        {
          theme: "outline",
          size: "large",
          text: "signin_with",
          shape: "rectangular",
          width: 280,
        }
      );
      setStatus("ready");
      setMessage("Sign in with your Google account");
    };

    // Google script already loaded
    if (window.google) {
      initializeGoogleLogin();
      return;
    }

    // Wait for Google script to load
    const interval = setInterval(() => {
      if (window.google) {
        clearInterval(interval);
        initializeGoogleLogin();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [handleCredentialResponse]);

  return (
    <section className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm shadow-slate-900/5">
      <div className="mb-3 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
          {status === "success" ? <CheckCircle2 className="h-5 w-5" /> : <LogIn className="h-5 w-5" />}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900">Connect your workspace</p>
          <p className={`mt-0.5 truncate text-xs ${status === "error" ? "text-red-600" : "text-slate-500"}`}>
            {message}
          </p>
        </div>
      </div>
      {status === "loading" && <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin text-violet-600" />}
      {status !== "success" && <div ref={buttonRef} className="flex min-h-10 justify-center" />}
      {status === "success" && (
        <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
          <ShieldCheck className="h-4 w-4" /> Your session is protected
        </div>
      )}
    </section>
  );
}