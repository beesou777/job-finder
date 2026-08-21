"use client";

import { useState, useEffect, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MessageCircle,
  Send,
  Loader2,
  Sparkles,
  ExternalLink,
  MapPin,
  Building2,
  DollarSign,
} from "lucide-react";
import { addUtmParams } from "@/lib/utils";

const SUGGESTIONS = [
  "Frontend developer with React and Node.js",
  "Remote marketing jobs",
  "Internships for students in Kathmandu",
  "Full-time data analyst",
  "LinkedIn jobs in tech",
];

interface JobResult {
  id: string;
  title: string;
  company: string | null;
  location?: string | null;
  applyUrl: string;
  source: string;
  type?: string;
  description?: string | null;
  salaryText?: string;
}

interface ToolInvocationPart {
  type: string;
  toolName?: string;
  state?: string;
  result?: { jobs?: JobResult[] };
  output?: { jobs?: JobResult[] } | JobResult[];
}

interface TextPart {
  type: "text";
  text: string;
}

type MessagePart = TextPart | ToolInvocationPart;

function isToolPart(part: MessagePart): part is ToolInvocationPart {
  return "toolName" in part || (typeof part.type === "string" && part.type.startsWith("tool-"));
}

function getJobsFromPart(part: unknown): JobResult[] {
  const p = part as Record<string, unknown>;
  const output = p?.output ?? p?.result;
  if (
    output &&
    typeof output === "object" &&
    "jobs" in output &&
    Array.isArray((output as { jobs: unknown }).jobs)
  ) {
    const jobs = (output as { jobs: JobResult[] }).jobs;
    return jobs.filter(
      (j): j is JobResult => j && typeof j === "object" && "title" in j && "applyUrl" in j,
    );
  }
  if (Array.isArray(output)) {
    return output.filter(
      (j): j is JobResult => j && typeof j === "object" && "title" in j && "applyUrl" in j,
    );
  }
  return [];
}

function AssistantMessageContent({
  message,
  messages,
  msgIdx,
  JobCard,
}: {
  message: { id: string; role: string; parts?: unknown[] };
  messages: Array<{ id: string; role: string; parts?: unknown[] }>;
  msgIdx: number;
  JobCard: React.FC<{ job: JobResult }>;
}) {
  const [fallbackJobs, setFallbackJobs] = useState<JobResult[] | null>(null);
  const fetchedFor = useRef<Set<string>>(new Set());

  const parts = message.parts ?? [];
  let allJobs: JobResult[] = [];
  const textParts: string[] = [];

  for (const part of parts) {
    const p = part as MessagePart;
    if (p.type === "text") {
      textParts.push((p as TextPart).text);
    } else {
      const jobs = getJobsFromPart(part);
      if (jobs.length > 0) allJobs = [...allJobs, ...jobs];
    }
  }

  const prevMsg = msgIdx > 0 ? messages[msgIdx - 1] : null;
  const lastUserMessage = prevMsg?.role === "user" ? prevMsg : null;
  const userQuery = lastUserMessage
    ? String(
        (lastUserMessage.parts ?? [])
          .filter((x: unknown) => (x as { type?: string }).type === "text")
          .map((x: unknown) => (x as { text?: string }).text)
          .join("") || "",
      )
    : "";

  const text = textParts.join(" ");
  const hasJobPhrase =
    /here are|i found|found \d+ job|these (jobs|matches)|jobs (i )?found|matches for you|no jobs found|didn't find|try (different|broadening)/i.test(
      text,
    );
  const userSearchedJobs =
    /job|developer|engineer|analyst|intern|marketing|designer|manager|remote|full.?time|part.?time|kathmandu|react|node/i.test(
      userQuery,
    );
  const seemsLikeJobReply =
    hasJobPhrase || (text.length < 120 && userSearchedJobs && allJobs.length === 0);

  useEffect(() => {
    if (
      allJobs.length > 0 ||
      !userQuery.trim() ||
      userQuery.trim().length < 2 ||
      !seemsLikeJobReply ||
      fetchedFor.current.has(message.id)
    )
      return;
    fetchedFor.current.add(message.id);
    fetch(`/api/chat/search?q=${encodeURIComponent(userQuery)}`)
      .then((r) => r.json())
      .then((data: any) => {
        if (data.jobs?.length) setFallbackJobs(data.jobs);
      })
      .catch(() => {});
  }, [message.id, allJobs.length, userQuery, seemsLikeJobReply]);

  const jobsToShow = allJobs.length > 0 ? allJobs : (fallbackJobs ?? []);

  return (
    <div className="space-y-3">
      {textParts.map((text, i) => (
        <div key={i} className="whitespace-pre-wrap leading-relaxed">
          {text}
        </div>
      ))}
      {jobsToShow.length > 0 && (
        <div className="space-y-3 w-full mt-2">
          <p className="text-xs font-medium text-zinc-500">
            {jobsToShow.length} job{jobsToShow.length !== 1 ? "s" : ""} found
          </p>
          <div className="space-y-2.5">
            {jobsToShow.slice(0, 8).map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function JobCard({ job }: { job: JobResult }) {
  if (!job.applyUrl) return null;
  const applyUrl = addUtmParams(job.applyUrl, job.source, job.id);
  const descSnippet = job.description
    ? job.description.replace(/\s+/g, " ").slice(0, 150) + (job.description.length > 150 ? "…" : "")
    : null;

  return (
    <a
      href={applyUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-4 rounded-xl border border-white/10 bg-[#1b1b1d] hover:border-primary/60 transition-all text-left group"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-zinc-50 group-hover:text-primary line-clamp-2">
            {job.title}
          </p>
          {job.company && (
            <p className="flex items-center gap-1.5 mt-1 text-sm text-zinc-400">
              <Building2 className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{job.company}</span>
            </p>
          )}
          {job.location && (
            <p className="flex items-center gap-1.5 mt-0.5 text-xs text-zinc-500">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{job.location}</span>
            </p>
          )}
          {job.salaryText && (
            <p className="flex items-center gap-1.5 mt-0.5 text-xs text-primary">
              <DollarSign className="h-3 w-3 shrink-0" />
              <span>{job.salaryText}</span>
            </p>
          )}
          {descSnippet && <p className="mt-2 text-xs text-zinc-500 line-clamp-2">{descSnippet}</p>}
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-zinc-400 border border-white/10">
            {job.source}
          </span>
          <span className="flex items-center gap-1 text-xs font-bold text-primary group-hover:underline">
            Apply
            <ExternalLink className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </a>
  );
}

interface JobSearchChatProps {
  embedded?: boolean;
}

export function JobSearchChat({ embedded = false }: JobSearchChatProps) {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  const isLoading = status !== "ready";

  useEffect(() => {
    const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
    if (lastAssistant?.parts?.length) {
      console.log("[AI Chat] Assistant response:", {
        parts: lastAssistant.parts.map((p: unknown) => {
          const x = p as {
            type?: string;
            text?: string;
            toolName?: string;
            output?: unknown;
            result?: unknown;
          };
          if (x.type === "text") return { type: "text", text: x.text?.slice(0, 150) };
          const jobs = getJobsFromPart(p);
          return {
            type: "tool",
            toolName: x.toolName,
            jobCount: jobs.length,
            titles: jobs.map((j) => j.title),
          };
        }),
      });
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      sendMessage({ text: input.trim() });
      setInput("");
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  const content = (
    <>
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {messages.length === 0 && (
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <MessageCircle className="h-4 w-4 text-primary" />
              </div>
              <div className="rounded-2xl rounded-tl-none bg-white/5 px-4 py-3 text-sm text-zinc-300">
                Hi! I search across <strong>Nepal jobs</strong>, <strong>internships</strong>, and{" "}
                <strong>LinkedIn</strong>. Tell me what you want role, skills, location, job type.
              </div>
            </div>
            <p className="text-xs text-zinc-500 font-medium pl-11">Try:</p>
            <div className="flex flex-wrap gap-2 pl-11">
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="text-left text-sm px-3 py-2 rounded-full border border-white/10 hover:border-primary/60 hover:bg-primary/10 text-zinc-300 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
        {error && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-200">
            {error.message}
          </div>
        )}
        {messages.map((message, msgIdx) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
          >
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                message.role === "user" ? "bg-primary text-zinc-950" : "bg-white/10"
              }`}
            >
              {message.role === "user" ? (
                <span className="text-xs font-semibold">U</span>
              ) : (
                <Sparkles className="h-4 w-4 text-primary" />
              )}
            </div>
            <div
              className={`rounded-2xl px-4 py-3 text-sm max-w-[95%] w-full ${
                message.role === "user"
                  ? "rounded-tr-none bg-primary text-zinc-950"
                  : "rounded-tl-none bg-white/5 text-zinc-300"
              }`}
            >
              {message.role === "user" ? (
                <div className="whitespace-pre-wrap">
                  {(message.parts ?? [])
                    .filter((p) => p.type === "text")
                    .map((p) => (p as TextPart).text)
                    .join("") || ""}
                </div>
              ) : (
                <div className="space-y-3">
                  <AssistantMessageContent
                    message={message}
                    messages={messages}
                    msgIdx={msgIdx}
                    JobCard={JobCard}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10">
              <Loader2 className="h-4 w-4 text-primary animate-spin" />
            </div>
            <div className="rounded-2xl rounded-tl-none bg-white/5 px-4 py-3">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            </div>
          </div>
        )}
      </div>
      <form onSubmit={handleSubmit} className="p-4 border-t border-white/10 shrink-0">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="E.g., Frontend dev with React, remote..."
            className="flex-1 border-white/10 bg-black text-zinc-100 placeholder:text-zinc-600"
            disabled={isLoading}
          />
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-primary text-zinc-950 hover:bg-white"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>
    </>
  );

  if (embedded) {
    return <div className="flex flex-col h-full min-h-0">{content}</div>;
  }

  return (
    <div className="border border-white/10 bg-[#111113] shadow-2xl rounded-2xl overflow-hidden flex flex-col h-[500px] md:h-[560px]">
      <div className="py-4 px-5 border-b border-white/10 bg-primary/5 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-zinc-950">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-black text-zinc-50">AI Job Search</h3>
            <p className="text-sm text-zinc-500">Jobs, internships & LinkedIn</p>
          </div>
        </div>
      </div>
      <div className="flex-1 flex flex-col min-h-0">{content}</div>
    </div>
  );
}
