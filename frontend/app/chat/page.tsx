"use client";
import React from "react";
import Chat from "@/components/Chat";

export default function ChatPage() {
  return (
    <div className="h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-auto">
        {/* <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-800">Chat with Assistant</h1>
          <p className="text-sm text-zinc-600 mt-1">Get tailored help with job searches, resumes, and applications.</p>
        </div> */}

        <div className="h-[60vh]">
          <Chat />
        </div>
      </div>
    </div>
  );
}
