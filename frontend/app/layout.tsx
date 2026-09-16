import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { ToastProvider } from "@/components/Toast";
import { AuthProvider } from "@/lib/auth-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NotePilot - Meeting Notes & Transcription Workspace",
  description:
    "Automate your meeting notes, transcripts, summaries, and action item workflows.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} bg-slate-100/60 text-slate-900 antialiased min-h-screen flex`}
      >
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="afterInteractive"
        />

        <AuthProvider>
          <ToastProvider>
            {/* Main App Layout Grid */}
            <div className="flex w-full min-h-screen">
              {/* Sidebar Navigation */}
              <Sidebar />

              {/* Main Content Workspace */}
              <main className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
                {children}
              </main>
            </div>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
