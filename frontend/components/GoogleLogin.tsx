"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, LogIn, ShieldCheck, HelpCircle, AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
            itp_support?: boolean;
            use_fedcm_for_prompt?: boolean;
          }) => void;
          renderButton: (
            element: HTMLElement,
            options: Record<string, string | number | boolean>
          ) => void;
          prompt?: () => void;
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
  const [message, setMessage] = useState("Preparing Google sign-in...");
  const [showConfigHelp, setShowConfigHelp] = useState(false);

  const handleCredentialResponse = useCallback(
    async (response: { credential: string }) => {
      const googleToken = response.credential;
      setStatus("loading");
      setMessage("Verifying your Google account with backend...");

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const result = await fetch(`${apiUrl}/api/auth/google`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            token: googleToken,
          }),
        });

        const data = await result.json();
        if (!result.ok) {
          throw new Error(data.detail || "Google sign-in verification failed on backend");
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
    },
    [router, setUser]
  );

  useEffect(() => {
    let isMounted = true;

    const renderGoogleBtn = () => {
      if (!isMounted || !buttonRef.current) return;
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim();

      if (!clientId || clientId === "your_google_client_id_here") {
        setStatus("ready");
        setMessage("Google Client ID not configured in .env");
        return;
      }

      if (!window.google?.accounts?.id) {
        setStatus("ready");
        setMessage("Google Identity Services script loading...");
        return;
      }

      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
          itp_support: true,
          use_fedcm_for_prompt: false,
        });

        if (buttonRef.current) {
          buttonRef.current.innerHTML = "";
          window.google.accounts.id.renderButton(buttonRef.current, {
            theme: "filled_blue",
            size: "large",
            text: "signin_with",
            shape: "rectangular",
            width: 280,
          });
        }
        setStatus("ready");
        setMessage("Sign in with Google account");
      } catch (err) {
        console.error("Google button initialization error:", err);
        setStatus("error");
        setMessage("Unable to render Google sign-in button.");
      }
    };

    // Load Google Identity Services dynamically if not already loaded
    if (typeof window !== "undefined") {
      if (window.google?.accounts?.id) {
        renderGoogleBtn();
      } else {
        const existingScript = document.getElementById("google-gsi-client");
        if (!existingScript) {
          const script = document.createElement("script");
          script.id = "google-gsi-client";
          script.src = "https://accounts.google.com/gsi/client";
          script.async = true;
          script.defer = true;
          script.onload = () => {
            renderGoogleBtn();
          };
          script.onerror = () => {
            if (isMounted) {
              setStatus("error");
              setMessage("Failed to load Google Identity Services library");
            }
          };
          document.head.appendChild(script);
        } else {
          existingScript.addEventListener("load", renderGoogleBtn);
        }

        // Check intermittently
        const timer = setTimeout(renderGoogleBtn, 400);
        return () => {
          isMounted = false;
          clearTimeout(timer);
        };
      }
    }

    return () => {
      isMounted = false;
    };
  }, [handleCredentialResponse]);

  return (
    <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-950/90 p-4 shadow-xl text-slate-200">
      <div className="mb-3 flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
          {status === "success" ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          ) : status === "error" ? (
            <AlertCircle className="h-5 w-5 text-red-400" />
          ) : (
            <LogIn className="h-5 w-5" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-white">Google OAuth Sign-In</p>
            <button
              type="button"
              onClick={() => setShowConfigHelp(!showConfigHelp)}
              title="OAuth setup guidance"
              className="text-slate-400 hover:text-purple-400 transition-colors"
            >
              <HelpCircle className="h-3.5 w-3.5" />
            </button>
          </div>
          <p
            className={`mt-0.5 text-[11px] truncate ${
              status === "error" ? "text-red-400" : "text-slate-400"
            }`}
          >
            {message}
          </p>
        </div>
      </div>

      {status === "loading" && (
        <div className="flex items-center justify-center py-2">
          <Loader2 className="h-5 w-5 animate-spin text-purple-400" />
        </div>
      )}

      {status !== "success" && (
        <div ref={buttonRef} className="flex min-h-[40px] items-center justify-center py-1" />
      )}

      {status === "success" && (
        <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 text-xs font-medium text-emerald-400">
          <ShieldCheck className="h-4 w-4" /> Secure Session Active
        </div>
      )}

      {showConfigHelp && (
        <div className="mt-3 p-3 rounded-xl bg-purple-950/30 border border-purple-800/40 text-[11px] text-slate-300 space-y-1.5 animate-in fade-in duration-150">
          <p className="font-semibold text-purple-300">Google OAuth Setup Guide:</p>
          <ul className="list-disc list-inside space-y-1 text-slate-400 text-[10px]">
            <li>Open Google Cloud Console &rarr; APIs & Services &rarr; Credentials</li>
            <li>In OAuth 2.0 Client IDs, add Authorized JavaScript Origins:</li>
            <li className="font-mono text-purple-200">http://localhost:3000 and http://localhost</li>
            <li>Make sure NEXT_PUBLIC_GOOGLE_CLIENT_ID matches in .env and .env.local</li>
          </ul>
        </div>
      )}
    </div>
  );
}