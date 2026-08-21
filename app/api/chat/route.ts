import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import {
  generateText,
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  type UIMessage,
} from "ai";
import { searchAllJobs, searchSimilarJobs, getJobSearchSchema } from "@/server/services/job-search";
import { parseJobQuery } from "@/server/services/parse-query";
import { checkRateLimit, getClientIP, RATE_LIMIT_RETRY_AFTER } from "@/server/services/rate-limit";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const VALID_JOB_TYPES = ["full-time", "part-time", "contract", "remote", "hybrid", "onsite"];
const VALID_TYPES = ["job", "internship", "all"];

/** Extract search params from AI JSON response. Falls back to parseJobQuery if invalid. */
function extractSearchParams(
  aiText: string,
  userQuery: string,
): { search: string; location?: string; jobType?: string; type: string } {
  const start = aiText.indexOf("{");
  const end = aiText.lastIndexOf("}");
  if (start >= 0 && end > start) {
    try {
      const parsed = JSON.parse(aiText.slice(start, end + 1)) as Record<string, unknown>;
      const search = String(parsed.search ?? "").trim();
      if (search) {
        return {
          search,
          location: parsed.location ? String(parsed.location).trim() || undefined : undefined,
          jobType: VALID_JOB_TYPES.includes(String(parsed.jobType || ""))
            ? String(parsed.jobType)
            : undefined,
          type: VALID_TYPES.includes(String(parsed.type || "")) ? String(parsed.type) : "all",
        };
      }
    } catch {
      /* fall through */
    }
  }
  const fallback = parseJobQuery(userQuery);
  return {
    search: fallback.search || "jobs",
    location: fallback.location,
    jobType: fallback.jobType,
    type: fallback.type || "all",
  };
}

function buildSystemPrompt(schemaInfo: { categories: string[]; schema: string }) {
  return `You convert natural language job search requests into a JSON object for database query.

## DATABASE SCHEMA:
${schemaInfo.schema}

## AVAILABLE CATEGORIES: ${schemaInfo.categories.slice(0, 40).join(", ")}${schemaInfo.categories.length > 40 ? "..." : ""}

## OUTPUT FORMAT - Respond with ONLY valid JSON, no other text:
{"search":"keywords here","location":"optional city","jobType":"optional: full-time|part-time|remote|hybrid|onsite","type":"job|internship|all"}

## RULES:
- search: Extract role/skill/framework. "job in angular" → "angular developer". "I am a designer" → "designer". When user mentions Angular/React/Vue/Node, MUST include it.
- location: Kathmandu, Pokhara, etc. Omit if not mentioned.
- jobType: Only if user says remote, full-time, etc.
- type: "all" unless user wants only internships or only jobs.

Examples:
- "frontend dev in angular" → {"search":"angular developer","type":"all"}
- "remote marketing jobs" → {"search":"marketing","jobType":"remote","type":"all"}
- "designer Kathmandu" → {"search":"designer","location":"Kathmandu","type":"all"}`;
}

function getModel() {
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  if (!openRouterKey) return null;
  const openrouter = createOpenRouter({ apiKey: openRouterKey });
  // Default: DeepSeek R1 Chimera (free, supports tools). Fallbacks: llama-3.2-3b, gemma-2-9b
  const modelId = process.env.OPENROUTER_MODEL || "tngtech/deepseek-r1t-chimera:free";
  return openrouter(modelId);
}

export async function POST(req: Request) {
  const ip = getClientIP(req);
  const { allowed, remaining } = checkRateLimit(ip);
  if (!allowed) {
    return new Response(
      JSON.stringify({
        error: "Limit reached: 5 searches per day. Try again tomorrow.",
        retryAfter: RATE_LIMIT_RETRY_AFTER,
      }),
      { status: 429, headers: { "Content-Type": "application/json" } },
    );
  }

  const { messages }: { messages: UIMessage[] } = await req.json();

  const model = getModel();
  const useDefaultModeFromStart = !model;
  if (useDefaultModeFromStart) {
    console.log("[AI Chat] No API key, using default search mode");
  }

  const schemaInfo = await getJobSearchSchema();
  const systemPrompt = buildSystemPrompt(schemaInfo);

  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  const userQuery =
    (lastUser?.parts?.find((p: { type?: string }) => p.type === "text") as { text?: string })
      ?.text ?? "";

  let result;
  let useDefaultMode = useDefaultModeFromStart;
  if (model) {
    try {
      result = await generateText({
        model,
        system: systemPrompt,
        messages: await convertToModelMessages(messages),
      });
    } catch (err) {
      console.error("[AI Chat] generateText error, falling back to default search:", err);
      useDefaultMode = true;
    }
  }

  let params: { search: string; location?: string; jobType?: string; type: string };
  if (useDefaultMode) {
    params = extractSearchParams("", userQuery);
    console.log("[AI Chat] Default mode (no AI):", params);
  } else {
    const aiText = result!.text?.trim() ?? "";
    params = extractSearchParams(aiText, userQuery);
    console.log("[AI Chat] AI raw:", aiText.slice(0, 200));
    console.log("[AI Chat] Parsed params:", params);
  }

  let jobs = await searchAllJobs({
    search: params.search || undefined,
    location: params.location,
    jobType: params.jobType,
    type: params.type as "job" | "internship" | "all",
    limit: 8,
  });

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
  console.log("[AI Chat] DB result:", {
    found: output.found,
    similar: isSimilar,
    defaultMode: useDefaultMode,
    titles: output.jobs.map((j) => j.title),
  });

  return aiStreamResponse(params, output, remaining, isSimilar, useDefaultMode);
}

/** Stream response with intro + job cards for useChat compatibility */
function aiStreamResponse(
  params: { search: string; location?: string; jobType?: string; type: string },
  output: {
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
  },
  remaining: number,
  isSimilar = false,
  defaultMode = false,
): Response {
  const msgId = `msg-${Date.now()}`;
  const toolCallId = `call-${Date.now()}`;
  let intro: string;
  if (output.found > 0) {
    intro = isSimilar
      ? "No exact matches. Here are similar jobs:"
      : defaultMode
        ? "Here are the jobs I found (search mode):"
        : "Here are the jobs I found:";
  } else {
    intro = "No jobs found. Try different keywords.";
  }

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      writer.write({ type: "start" });
      writer.write({ type: "text-start", id: msgId });
      writer.write({ type: "text-delta", id: msgId, delta: intro });
      writer.write({ type: "text-end", id: msgId });
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
      writer.write({ type: "finish" });
    },
  });

  const response = createUIMessageStreamResponse({ stream });
  response.headers.set("X-RateLimit-Remaining", String(remaining));
  return response;
}
