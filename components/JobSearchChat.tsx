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
  jobType?: string | null;
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
  return (
    "toolName" in part ||
    (typeof part.type === "string" &&
      (part.type.startsWith("tool-") || part.type === "dynamic-tool"))
  );
}

function getJobsFromPart(part: unknown): JobResult[] {
  if (!part || typeof part !== "object") return [];
  const p = part as Record<string, unknown>;

  const candidates = [
    p.output,
    p.result,
    (p.toolInvocation as Record<string, unknown>)?.output,
    (p.toolInvocation as Record<string, unknown>)?.result,
    p.data,
    p.jobs,
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;
    if (Array.isArray(candidate)) {
      const valid = candidate.filter((j): j is JobResult =>
        Boolean(j && typeof j === "object" && "title" in j),
      );
      if (valid.length > 0) return valid;
    }
    if (
      typeof candidate === "object" &&
      "jobs" in candidate &&
      Array.isArray((candidate as { jobs: unknown[] }).jobs)
    ) {
      const valid = (candidate as { jobs: unknown[] }).jobs.filter((j): j is JobResult =>
        Boolean(j && typeof j === "object" && "title" in j),
      );
      if (valid.length > 0) return valid;
    }
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
          .join("") ||
          (lastUserMessage as unknown as { content?: string })?.content ||
          "",
      )
    : "";

  useEffect(() => {
    if (
      allJobs.length > 0 ||
      !userQuery.trim() ||
      userQuery.trim().length < 2 ||
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
  }, [message.id, allJobs.length, userQuery]);

  const jobsToShow = allJobs.length > 0 ? allJobs : (fallbackJobs ?? []);

  return (
    <div className="space-y-3">
      {textParts.map((text, i) => (
        <div key={i} className="whitespace-pre-wrap leading-relaxed">
          {text}
        </div>
      ))}
      {jobsToShow.length > 0 && (
        <div className="space-y-3 w-full max-w-full mt-2 min-w-0">
          <p className="text-xs font-semibold text-zinc-400">
            {jobsToShow.length} job{jobsToShow.length !== 1 ? "s" : ""} found
          </p>
          <div className="space-y-2.5 w-full max-w-full min-w-0">
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
  const applyUrl = job.applyUrl ? addUtmParams(job.applyUrl, job.source, job.id) : "#";
  const descSnippet = job.description
    ? job.description.replace(/\s+/g, " ").slice(0, 150) + (job.description.length > 150 ? "…" : "")
    : null;

  return (
    <a
      href={applyUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-3.5 sm:p-4 rounded-xl border border-white/10 bg-[#1b1b1d] hover:border-primary/60 hover:bg-[#202024] transition-all text-left group w-full max-w-full box-border"
    >
      <div className="flex items-start justify-between gap-2.5 min-w-0">
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-zinc-100 group-hover:text-primary line-clamp-2 leading-snug break-words">
            {job.title}
          </p>
          {job.company && (
            <p className="flex items-center gap-1.5 mt-1.5 text-sm text-zinc-400 min-w-0">
              <Building2 className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
              <span className="truncate">{job.company}</span>
            </p>
          )}
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            {job.location && (
              <span className="inline-flex items-center gap-1 text-xs text-zinc-400 max-w-full min-w-0">
                <MapPin className="h-3 w-3 shrink-0 text-zinc-500" />
                <span className="truncate">{job.location}</span>
              </span>
            )}
            {job.jobType && (
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-white/5 text-zinc-300 border border-white/10 capitalize shrink-0">
                {job.jobType}
              </span>
            )}
            {job.type === "internship" && (
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-primary/15 text-primary border border-primary/25 font-medium shrink-0">
                Internship
              </span>
            )}
            {job.salaryText && (
              <span className="inline-flex items-center gap-0.5 text-xs text-primary font-medium shrink-0">
                <DollarSign className="h-3 w-3 shrink-0" />
                <span>{job.salaryText}</span>
              </span>
            )}
          </div>
          {descSnippet && (
            <p className="mt-2 text-xs text-zinc-500 line-clamp-2 leading-relaxed break-words">
              {descSnippet}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-zinc-400 border border-white/10 shrink-0">
            {job.source}
          </span>
          <span className="flex items-center gap-1 text-xs font-bold text-primary group-hover:underline shrink-0">
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  const isLoading = status !== "ready";

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    if (!input) {
      textarea.style.height = "44px";
      return;
    }
    textarea.style.height = "auto";
    const nextHeight = Math.min(Math.max(textarea.scrollHeight, 44), 140);
    textarea.style.height = `${nextHeight}px`;
  }, [input]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (input.trim() && !isLoading) {
      sendMessage({ text: input.trim() });
      setInput("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "44px";
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const content = (
    <>
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-3.5 sm:p-4 space-y-4 min-h-0 [scrollbar-width:thin]">
        {messages.length === 0 && (
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <MessageCircle className="h-4 w-4 text-primary" />
              </div>
              <div className="rounded-2xl rounded-tl-none bg-white/5 px-4 py-3 text-sm text-zinc-300">
                Hi! I search across <strong>Nepal jobs</strong>, <strong>internships</strong>, and{" "}
                <strong>LinkedIn</strong> using Gemini AI. Tell me what role, skills, location, or
                job type you are looking for!
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
            className={`flex gap-3 max-w-full ${message.role === "user" ? "flex-row-reverse" : ""}`}
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
              className={`rounded-2xl px-4 py-3 text-sm min-w-0 ${
                message.role === "user"
                  ? "max-w-[85%] rounded-tr-none bg-primary text-zinc-950 break-words"
                  : "flex-1 rounded-tl-none bg-white/5 text-zinc-300"
              }`}
            >
              {message.role === "user" ? (
                <div className="whitespace-pre-wrap break-words">
                  {(message.parts ?? [])
                    .filter((p) => p.type === "text")
                    .map((p) => (p as TextPart).text)
                    .join("") ||
                    (message as unknown as { content?: string })?.content ||
                    ""}
                </div>
              ) : (
                <div className="space-y-3 min-w-0">
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
      <form onSubmit={handleSubmit} className="p-3 border-t border-white/10 shrink-0 bg-[#141416]">
        <div className="flex items-end gap-2">
          <div className="relative flex-1">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search jobs, skills, or ask questions..."
              disabled={isLoading}
              rows={1}
              className="w-full resize-none rounded-xl border border-white/10 bg-black/60 px-3.5 py-[11px] text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-primary/60 focus:outline-none disabled:opacity-50 transition-[border-color] leading-5 min-h-[44px] max-h-[140px] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            />
          </div>
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="h-[44px] w-[44px] p-0 flex items-center justify-center rounded-xl bg-primary text-zinc-950 hover:bg-white transition-all disabled:opacity-40 shrink-0 self-end"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-[11px] text-zinc-500 mt-1.5 pl-1">
          Press{" "}
          <kbd className="px-1 py-0.5 rounded bg-white/10 text-zinc-400 text-[10px]">Enter</kbd> to
          search,{" "}
          <kbd className="px-1 py-0.5 rounded bg-white/10 text-zinc-400 text-[10px]">
            Shift + Enter
          </kbd>{" "}
          for new line
        </p>
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
