/**
 * Keyword extraction from natural language for direct search (no LLM).
 * Extracts job-relevant terms, filters filler words, handles common typos.
 */

export interface ParsedQuery {
  search: string;
  location?: string;
  jobType?: "full-time" | "part-time" | "contract" | "remote" | "hybrid" | "onsite";
  type?: "job" | "internship" | "all";
}

const LOCATIONS = ["kathmandu", "pokhara", "lalitpur", "bhaktapur", "biratnagar", "birgunj", "bharatpur", "hetauda", "butwal", "nepalgunj", "dharan", "janakpur"];
const JOB_TYPES: Record<string, ParsedQuery["jobType"]> = {
  remote: "remote",
  "full-time": "full-time",
  "full time": "full-time",
  fulltime: "full-time",
  "part-time": "part-time",
  "part time": "part-time",
  parttime: "part-time",
  contract: "contract",
  hybrid: "hybrid",
  onsite: "onsite",
  "on-site": "onsite",
};
const JOB_ONLY_KEYWORDS = ["full job", "permanent job", "not intern"];

/** Frameworks/tech - when user says "job in angular", ensure it's in search and first */
const FRAMEWORK_TERMS = ["angular", "react", "vue", "next", "node", "nodejs", "python", "java", "php", "laravel", "django", "flutter"];

/** Words to ignore - filler, greetings, common non-job terms */
const STOP_WORDS = new Set([
  "hey", "hi", "hello", "i", "am", "is", "are", "was", "were", "be", "been", "being",
  "have", "has", "had", "do", "does", "did", "will", "would", "could", "should", "may", "might",
  "the", "a", "an", "for", "of", "with", "to", "from", "in", "on", "at", "by", "about",
  "there", "any", "some", "me", "my", "we", "our", "you", "your", "it", "its",
  "what", "which", "who", "whom", "this", "that", "these", "those",
  "please", "kind", "looking", "find", "want", "need", "suitable", "suits", "job", "jobs",
  "over", "years", "yrs", "year", "experiance", "experience", "experienced",
]);

function extractSearchKeywords(raw: string): string[] {
  const text = raw.toLowerCase().trim();
  const words = text.split(/\s+/).filter(Boolean);
  const kept: string[] = [];
  for (let i = 0; i < words.length; i++) {
    const w = words[i].replace(/[^a-z0-9+]/g, "");
    if (!w || w.length < 2) continue;
    if (STOP_WORDS.has(w)) continue;
    if (/^\d+$/.test(w) && w.length > 2) continue;
    if (i > 0 && words[i - 1] === "full" && w === "stack") {
      kept.pop();
      kept.push("full stack");
      continue;
    }
    if (i > 0 && words[i - 1] === "front" && w === "end") {
      kept.pop();
      kept.push("frontend");
      continue;
    }
    if (i > 0 && words[i - 1] === "back" && w === "end") {
      kept.pop();
      kept.push("backend");
      continue;
    }
    kept.push(w);
  }
  return kept;
}

export function parseJobQuery(raw: string): ParsedQuery {
  const lower = raw.toLowerCase().trim();
  const words = lower.split(/\s+/).filter(Boolean);

  let location: string | undefined;
  let jobType: ParsedQuery["jobType"];
  let type: ParsedQuery["type"] = "all";

  const searchTerms: string[] = [];

  for (const word of words) {
    const w = word.replace(/[^a-z0-9-]/g, "");
    if (!w) continue;

    const matchedLoc = LOCATIONS.find((loc) => w.includes(loc) || loc.includes(w));
    if (matchedLoc) {
      location = matchedLoc.charAt(0).toUpperCase() + matchedLoc.slice(1);
      continue;
    }

    const matchedJobType = Object.entries(JOB_TYPES).find(([key]) => w.includes(key) || key.includes(w));
    if (matchedJobType) {
      jobType = matchedJobType[1];
      continue;
    }

    if (["intern", "internship", "internships"].includes(w)) {
      type = "internship";
      continue;
    }
    if (JOB_ONLY_KEYWORDS.some((k) => lower.includes(k))) {
      type = "job";
      continue;
    }

    if (!STOP_WORDS.has(w) && w.length >= 2) {
      searchTerms.push(word);
    }
  }

  let search: string;
  if (searchTerms.length > 0) {
    const keywords = extractSearchKeywords(searchTerms.join(" "));
    const base = keywords.length > 0 ? keywords.slice(0, 8).join(" ") : searchTerms.slice(0, 6).join(" ");
    const fw = FRAMEWORK_TERMS.find((t) => lower.includes(t));
    search = fw ? `${fw} ${base.replace(new RegExp(fw, "gi"), "").trim()}`.trim() || fw : base;
  } else {
    const keywords = extractSearchKeywords(raw);
    const base = keywords.length > 0 ? keywords.slice(0, 8).join(" ") : "developer";
    const fw = FRAMEWORK_TERMS.find((t) => lower.includes(t));
    search = fw ? `${fw} ${base.replace(new RegExp(fw, "gi"), "").trim()}`.trim() || fw : base;
  }
  if (!search.trim()) search = "jobs";
  return { search, location, jobType, type };
}
