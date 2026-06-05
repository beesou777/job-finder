"use client";

import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { JobSearchChat } from "./JobSearchChat";

export function GlobalChatWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating chat button */}
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Open AI job search"
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#0A66C2] text-white shadow-lg hover:bg-[#004182] transition-all hover:scale-105 active:scale-95"
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      {/* Overlay panel - keep mounted when closed so chat history persists until refresh */}
      <div className={isOpen ? "contents" : "hidden"}>
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
        <div className="fixed inset-0 z-50 flex flex-col border border-white/10 bg-[#111113] shadow-2xl animate-in slide-in-from-right duration-300 md:inset-auto md:left-auto md:right-4 md:top-4 md:bottom-4 md:w-[420px] md:max-w-[95vw] md:h-[calc(100dvh-2rem)] md:min-h-[600px] md:rounded-2xl">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 bg-[#111113] shrink-0">
            <h2 className="font-black text-zinc-50">AI Job Search</h2>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
              className="rounded-full p-2 text-zinc-500 hover:bg-white/10 hover:text-zinc-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 min-h-0 overflow-hidden">
            <JobSearchChat embedded />
          </div>
        </div>
      </div>
    </>
  );
}
