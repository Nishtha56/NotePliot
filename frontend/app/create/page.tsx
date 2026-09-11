"use client";

import React from "react";
import Topbar from "@/components/Topbar";
import CreateMeetingModal from "@/components/CreateMeetingModal";
import { useRouter } from "next/navigation";

export default function CreatePage() {
  const router = useRouter();

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-100/60">
      <Topbar title="Create New Meeting" />

      <div className="flex-1 flex items-center justify-center p-6">
        <CreateMeetingModal
          onClose={() => router.push("/")}
          onSuccess={() => router.push("/")}
        />
      </div>
    </div>
  );
}