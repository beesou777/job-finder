import { createUIMessageStream, createUIMessageStreamResponse, type UIMessage } from "ai";
import { searchAllJobs, searchSimilarJobs, getJobSearchSchema } from "@/server/services/job-search";
import { parseJobQuery } from "@/server/services/parse-query";
import { checkRateLimit, getClientIP, RATE_LIMIT_RETRY_AFTER } from "@/server/services/rate-limit";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const VALID_JOB_TYPES = ["full-time", "part-time", "contract", "remote", "hybrid", "onsite"];
const VALID_TYPES = ["job", "internship", "all"];

interface GeminiParsedResult {
  isJobSearch: boolean;
  search: string;
  location?: string;
  jobType?: string;
  type: string;
  assistantMessage: string;
}

/**
 * Call Gemini model directly using the official Google Generative Language REST API.
 */
async function queryGemini(
  messages: UIMessage[],
  schemaInfo: { categories: string[]; schema: string },
): Promise<GeminiParsedResult | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("[AI Chat] GEMINI_API_KEY is not configured.");
    return null;
  }

  const configuredModel = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  const systemInstruction = `You are a helpful and intelligent AI job search assistant for KamKhoj (Nepal's job aggregator).
You help users find jobs, internships in Nepal (across JobsNepal, KumariJob, LinkedIn, etc.), or answer general career, interview, and resume questions.

## DATABASE CATEGORIES AVAILABLE:
${schemaInfo.categories.slice(0, 30).join(", ")}

## OUTPUT FORMAT:
You MUST respond with a single JSON object (no markdown code blocks, no other text):
{
  "isJobSearch": boolean, // true if user is asking to find, view, or search jobs/internships/vacancies/roles. false for greetings, career advice, interview questions, resume tips, or general conversation.
  "search": string, // Role or skill keywords (e.g. "React developer", "Civil Engineer", "Marketing"). Do NOT include words like "job", "jobs", "vacancy", "hire", "looking for", "need", "in", "for". If not a job search, set to "".
  "location": string, // City or region (e.g. "Kathmandu", "Pokhara", "Lalitpur", "Remote") or empty string if not specified.
  "jobType": string, // "remote" | "full-time" | "part-time" | "hybrid" | "contract" or empty string if not specified.
  "type": "job" | "internship" | "all", // "internship" if user asked specifically for internships, "job" for regular jobs, "all" by default.
  "assistantMessage": string // Friendly message for the user. If isJobSearch is true, provide a brief 1-sentence intro (e.g. "Here are the React developer roles I found in Kathmandu:"). If isJobSearch is false, provide a comprehensive, direct, and helpful answer to their question.
}`;

  // Convert conversation to Gemini contents format
  const contents = messages
    .map((m) => {
      const text =
        m.parts
          ?.filter((p) => p.type === "text")
          .map((p) => (p as { text?: string }).text)
          .join(" ") ||
        (m as unknown as { content?: string }).content ||
        "";
      return {
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: text.trim() }],
      };
    })
    .filter((c) => c.parts[0].text.length > 0);

  if (contents.length === 0) return null;

  // Gemini requires the first message to be from 'user'
  while (contents.length > 0 && contents[0].role !== "user") {
    contents.shift();
  }
  if (contents.length === 0) return null;

  const modelsToTry = [
    configuredModel,
    "gemini-2.5-flash",
    "gemini-3.5-flash-lite",
    "gemini-1.5-flash",
  ].filter((m, idx, arr) => arr.indexOf(m) === idx);

  for (const model of modelsToTry) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemInstruction }] },
            contents,
            generationConfig: {
              temperature: 0.2,
              responseMimeType: "application/json",
            },
          }),
        },
      );

      if (!res.ok) {
        console.warn(`[AI Chat] Gemini (${model}) returned status:`, res.status);
        continue;
      }

      const data = await res.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) continue;

      const parsed = JSON.parse(rawText);
      const isJobSearch = Boolean(parsed.isJobSearch);
      const search = String(parsed.search || "").trim();
      const location = parsed.location ? String(parsed.location).trim() : undefined;
      const jobType = VALID_JOB_TYPES.includes(String(parsed.jobType || ""))
        ? String(parsed.jobType)
        : undefined;
      const type = VALID_TYPES.includes(String(parsed.type || "")) ? String(parsed.type) : "all";
      const assistantMessage = String(parsed.assistantMessage || "").trim();

      return {
        isJobSearch,
        search,
        location,
        jobType,
        type,
        assistantMessage,
      };
    } catch (err) {
      console.error(`[AI Chat] Error calling Gemini (${model}):`, err);
    }
  }

  return null;
}

export async function POST(req: Request) {
  const ip = getClientIP(req);
  const { allowed, remaining } = checkRateLimit(ip);
  if (!allowed) {
    return new Response(
      JSON.stringify({
        error: "Search limit reached. Try again later.",
        retryAfter: RATE_LIMIT_RETRY_AFTER,
      }),
      { status: 429, headers: { "Content-Type": "application/json" } },
    );
  }

  const { messages }: { messages: UIMessage[] } = await req.json();

  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  const userQuery =
    (lastUser?.parts?.find((p: { type?: string }) => p.type === "text") as { text?: string })
      ?.text ??
    (lastUser as unknown as { content?: string })?.content ??
    "";

  const schemaInfo = await getJobSearchSchema();
  const geminiResult = await queryGemini(messages, schemaInfo);

  // If user is just asking career advice, interview questions, or greetings
  if (geminiResult && !geminiResult.isJobSearch) {
    return aiStreamResponse({
      text: geminiResult.assistantMessage || "How can I help you with your job search today?",
      remaining,
    });
  }

  // Determine search params (from Gemini or fallback to parseJobQuery)
  let params: { search: string; location?: string; jobType?: string; type: string };
  let assistantIntro = "";

  if (geminiResult && geminiResult.search) {
    params = {
      search: geminiResult.search,
      location: geminiResult.location,
      jobType: geminiResult.jobType,
      type: geminiResult.type,
    };
    assistantIntro = geminiResult.assistantMessage;
  } else {
    const fallback = parseJobQuery(userQuery);
    params = {
      search: fallback.search || userQuery || "jobs",
      location: fallback.location,
      jobType: fallback.jobType,
      type: fallback.type || "all",
    };
    assistantIntro = geminiResult?.assistantMessage || "";
  }

  console.log("[AI Chat] Executing search with params:", params);

  // 1. Exact search
  let jobs = await searchAllJobs({
    search: params.search || undefined,
    location: params.location,
    jobType: params.jobType,
    type: params.type as "job" | "internship" | "all",
    limit: 8,
  });

  // 2. Similar jobs fallback if 0 matches
  let isSimilar = false;
  if (jobs.length === 0 && params.search) {
    jobs = await searchSimilarJobs({
      search: params.search,
      location: params.location,
      jobType: params.jobType,
      type: params.type as "job" | "internship" | "all",
      limit: 8,
    });
    isSimilar = jobs.length > 0;
  }

  // 3. Match any terms fallback if still 0 matches and multiple words
  if (jobs.length === 0 && params.search && params.search.includes(" ")) {
    jobs = await searchAllJobs({
      search: params.search,
      location: params.location,
      jobType: params.jobType,
      type: params.type as "job" | "internship" | "all",
      limit: 8,
      matchAny: true,
    });
    isSimilar = jobs.length > 0;
  }

  const output = {
    found: jobs.length,
    jobs: jobs.map((j) => ({
      id: j.id,
      title: j.title,
      company: j.company,
      location: j.location,
      jobType: j.jobType,
      salaryText: j.salaryText,
      source: j.source,
      category: j.category ?? null,
      description: j.description ? j.description.slice(0, 300) : null,
      applyUrl: j.applyUrl,
    })),
  };

  // Determine final text response
  let finalMessage: string;
  if (output.found > 0) {
    if (isSimilar) {
      finalMessage =
        "I didn't find exact matches for that title, but here are the closest matching opportunities:";
    } else if (assistantIntro) {
      finalMessage = assistantIntro;
    } else {
      finalMessage = `Here are ${output.found} relevant jobs I found for you:`;
    }
  } else {
    finalMessage =
      "I couldn't find active jobs matching those criteria. Try searching with broader keywords, different skills, or removing location filters.";
  }

  return aiStreamResponse({
    text: finalMessage,
    params,
    output,
    remaining,
  });
}

/** Stream response with text + tool output for useChat compatibility */
function aiStreamResponse({
  text,
  params,
  output,
  remaining,
}: {
  text: string;
  params?: { search: string; location?: string; jobType?: string; type: string };
  output?: {
    found: number;
    jobs: Array<{
      id: string;
      title: string;
      company: string | null;
      location: string | null;
      jobType: string | null;
      salaryText?: string;
      source: string;
      category: string | null;
      description: string | null;
      applyUrl: string;
    }>;
  };
  remaining: number;
}): Response {
  const msgId = `msg-${Date.now()}`;
  const toolCallId = `call-${Date.now()}`;

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      writer.write({ type: "start" });
      writer.write({ type: "text-start", id: msgId });
      writer.write({ type: "text-delta", id: msgId, delta: text });
      writer.write({ type: "text-end", id: msgId });

      if (output && output.jobs.length > 0 && params) {
        writer.write({
          type: "tool-input-available",
          toolCallId,
          toolName: "execute_db_query",
          input: params,
        });
        writer.write({
          type: "tool-output-available",
          toolCallId,
          output,
        });
      }

      writer.write({ type: "finish" });
    },
  });

  const response = createUIMessageStreamResponse({ stream });
  response.headers.set("X-RateLimit-Remaining", String(remaining));
  return response;
}
