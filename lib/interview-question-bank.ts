export type InterviewQuestionType = "open-ended" | "scenario" | "coding" | "multiple-choice";
export type InterviewQuestion = { role: string; levels: string[]; type: InterviewQuestionType; prompt: string; options?: string[]; correctOption?: number; explanation?: string; topic?: string };

export const INTERVIEW_QUESTION_BANK: InterviewQuestion[] = [
  { role: "frontend", levels: ["fresher", "junior"], type: "multiple-choice", topic: "React performance", prompt: "Which approach can reduce unnecessary React rendering?", options: ["Add more global state", "Use memoization where appropriate", "Remove all component state", "Disable browser caching"], correctOption: 1, explanation: "Memoization can avoid repeated work when its dependencies have not changed." },
  { role: "frontend", levels: ["fresher", "junior"], type: "open-ended", prompt: "Explain how you would make a React page load faster." },
  { role: "frontend", levels: ["junior", "mid", "senior"], type: "scenario", prompt: "A production page has a slow interaction after a user clicks a button. How would you investigate it?" },
  { role: "frontend", levels: ["mid", "senior"], type: "scenario", prompt: "Design a frontend architecture for a large dashboard used by several teams. What trade-offs would you make?" },
  { role: "backend", levels: ["fresher", "junior"], type: "open-ended", prompt: "What is an API, and how would you handle an invalid request?" },
  { role: "backend", levels: ["junior", "mid", "senior"], type: "scenario", prompt: "An API becomes slow as traffic grows. Walk through the checks and changes you would consider." },
  { role: "backend", levels: ["mid", "senior"], type: "scenario", prompt: "Design a reliable service that handles retries, caching, authentication, and observability. Explain your trade-offs." },
  { role: "full stack", levels: ["fresher", "junior"], type: "open-ended", prompt: "Describe a project where a frontend and backend had to work together." },
  { role: "full stack", levels: ["junior", "mid", "senior"], type: "scenario", prompt: "A form sometimes saves duplicate records. How would you diagnose and prevent the issue?" },
  { role: "devops", levels: ["junior", "mid", "senior"], type: "scenario", prompt: "A deployment succeeds but the service is unhealthy. What is your investigation and rollback plan?" },
  { role: "general", levels: ["fresher", "junior", "mid", "senior"], type: "open-ended", prompt: "Tell me about a project or responsibility you handled and a challenge you faced." },
  { role: "general", levels: ["fresher", "junior", "mid", "senior"], type: "multiple-choice", topic: "problem solving", prompt: "What is the best first step when you receive an unclear task?", options: ["Start coding immediately", "Ask clarifying questions and confirm the expected outcome", "Ignore the task", "Wait until the deadline"], correctOption: 1, explanation: "Clarifying the outcome reduces rework and aligns expectations." },
];

export function getBankQuestions(role: string, level: string, count: number) {
  const normalized = role.toLowerCase();
  const matches = INTERVIEW_QUESTION_BANK.filter((item) => (item.role === "general" || normalized.includes(item.role)) && item.levels.includes(level));
  const fallback = INTERVIEW_QUESTION_BANK.filter((item) => item.role === "general" && item.levels.includes(level));
  return [...matches, ...fallback].slice(0, Math.max(0, count));
}
