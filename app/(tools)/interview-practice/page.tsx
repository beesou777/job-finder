"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession, authFetch } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  BrainCircuit,
  Target,
  FileText,
  BadgeCheck,
  TrendingUp,
  Award,
  BookOpen,
  Lightbulb,
  RefreshCw,
  SlidersHorizontal,
  HelpCircle,
  Check,
  Layers,
} from "lucide-react";
import { ReplaceCvModal } from "@/components/ReplaceCvModal";

interface CvData {
  url?: string | null;
  filename?: string | null;
  role?: string | null;
  skills?: string[];
  experienceLevel?: string | null;
  summary?: string | null;
}

interface InterviewQuestionItem {
  id: number;
  question: string;
  prompt?: string;
  type: "technical" | "scenario" | "experience" | "problem-solving" | "behavioral" | string;
  difficulty: string;
  skillTested: string;
  context: string;
  sampleAnswerOutline?: string[];
}

interface SessionMetadata {
  candidateRole: string;
  experienceLevel: string;
  difficulty: string;
  questionCount: number;
  skillsTested: string[];
}

interface AnswerEvaluationResponse {
  overallScore: number;
  scores: {
    relevance: number;
    technicalAccuracy: number;
    specificity: number;
    structure: number;
    clarity: number;
  };
  readiness: "Ready" | "Almost Ready" | "Needs Practice" | string;
  summary: string;
  strengths: string[];
  improvements: string[];
  idealAnswerSample: string;
  betterAnswerOutline?: string[];
}

interface QuestionEvaluationResult {
  question: InterviewQuestionItem;
  candidateAnswer: string;
  evaluation: AnswerEvaluationResponse;
}

const DIFFICULTY_LEVELS = [
  {
    id: "easy",
    label: "Easy",
    desc: "Core definitions, fundamentals & day-to-day workflows",
  },
  {
    id: "medium",
    label: "Medium",
    desc: "Real-world trade-offs, architecture & practical implementations",
  },
  {
    id: "hard",
    label: "Hard",
    desc: "Edge cases, scalability, crisis debugging & system design",
  },
  {
    id: "expert",
    label: "Expert",
    desc: "High-level architecture, executive decisions & organizational dilemmas",
  },
];

const QUESTION_COUNT_OPTIONS = [3, 5, 7, 10];

export default function InterviewPracticePage() {
  const { status } = useSession();
  const router = useRouter();

  // CV & Profile State
  const [cv, setCv] = useState<CvData | null>(null);
  const [loadingCv, setLoadingCv] = useState(true);
  const [showCvModal, setShowCvModal] = useState(false);

  // Setup Form State
  const [noOfQuestions, setNoOfQuestions] = useState<number>(5);
  const [difficulty, setDifficulty] = useState<string>("medium");
  const [role, setRole] = useState<string>("");
  const [focusArea, setFocusArea] = useState<string>("");

  // Interview Execution State
  const [stage, setStage] = useState<"setup" | "question" | "evaluating" | "result">("setup");
  const [sessionMetadata, setSessionMetadata] = useState<SessionMetadata | null>(null);
  const [questions, setQuestions] = useState<InterviewQuestionItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [currentAnswer, setCurrentAnswer] = useState<string>("");
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showHint, setShowHint] = useState<boolean>(false);

  // Loading & Error States
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Evaluation & Results State
  const [evaluations, setEvaluations] = useState<QuestionEvaluationResult[]>([]);
  const [overallScoreAverage, setOverallScoreAverage] = useState<number>(0);
  const [overallReadiness, setOverallReadiness] = useState<string>("Ready");

  // Auth Protection
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login?callbackUrl=/dashboard/interview-practice");
    }
  }, [router, status]);

  // Fetch candidate's active CV on mount only
  const fetchCvProfile = useCallback(async () => {
    try {
      setLoadingCv(true);
      const res = await authFetch("/api/me/cv", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.hasCv && data.cv) {
          setCv(data.cv);
          if (data.cv.role) {
            setRole((prev) => prev || data.cv.role);
          }
          if (data.cv.skills && data.cv.skills.length > 0) {
            const sampleSkills = data.cv.skills.slice(0, 2).join(" & ");
            setFocusArea((prev) => prev || sampleSkills);
          }
        } else {
          setCv(null);
        }
      }
    } catch (err) {
      console.error("Failed to load CV for interview:", err);
    } finally {
      setLoadingCv(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      fetchCvProfile();
    }
  }, [status, fetchCvProfile]);

  // Start Interview Session
  async function handleStartInterview() {
    setError(null);
    setLoading(true);

    try {
      const payload = {
        noOfQuestions: Number(noOfQuestions) || 5,
        difficulty,
        role: role.trim() || cv?.role || "Full Stack Developer",
        focusArea: focusArea.trim() || undefined,
        mode: difficulty,
      };

      const res = await authFetch("/api/interview/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || "Failed to generate interview session.");
      }

      if (!data.questions || data.questions.length === 0) {
        throw new Error("No questions were generated. Please check your CV profile and try again.");
      }

      setQuestions(data.questions);
      setSessionMetadata(
        data.sessionMetadata || {
          candidateRole: payload.role,
          experienceLevel: cv?.experienceLevel || "Mid",
          difficulty: payload.difficulty,
          questionCount: data.questions.length,
          skillsTested: [],
        },
      );
      setCurrentIndex(0);
      setCurrentAnswer("");
      setAnswers({});
      setShowHint(false);
      setStage("question");
    } catch (err: any) {
      setError(err?.message || "Could not prepare interview session.");
    } finally {
      setLoading(false);
    }
  }

  // Handle Question Navigation & Storing Answers
  function handleNextQuestion() {
    const updatedAnswers = {
      ...answers,
      [currentIndex]: currentAnswer,
    };
    setAnswers(updatedAnswers);

    if (currentIndex + 1 < questions.length) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setCurrentAnswer(updatedAnswers[nextIndex] || "");
      setShowHint(false);
    } else {
      // Final question answered: evaluate session
      handleFinishInterview(updatedAnswers);
    }
  }

  function handlePrevQuestion() {
    const updatedAnswers = {
      ...answers,
      [currentIndex]: currentAnswer,
    };
    setAnswers(updatedAnswers);

    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      setCurrentAnswer(updatedAnswers[prevIndex] || "");
      setShowHint(false);
    }
  }

  // Finish & Evaluate Interview Session
  async function handleFinishInterview(finalAnswers: Record<number, string>) {
    setStage("evaluating");
    setError(null);

    try {
      const evaluatedResults: QuestionEvaluationResult[] = [];

      // Evaluate each answered question with /api/interview/evaluate
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        const ans = finalAnswers[i] || "No answer provided by candidate.";

        const evalRes = await authFetch("/api/interview/evaluate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: q.question || q.prompt,
            answer: ans,
            role: sessionMetadata?.candidateRole || role || cv?.role || "Full Stack Developer",
            difficulty: sessionMetadata?.difficulty || difficulty,
            skillTested: q.skillTested,
            questionId: q.id,
          }),
        });

        if (evalRes.ok) {
          const evalData: AnswerEvaluationResponse = await evalRes.json();
          evaluatedResults.push({
            question: q,
            candidateAnswer: ans,
            evaluation: evalData,
          });
        }
      }

      if (evaluatedResults.length > 0) {
        const avg =
          evaluatedResults.reduce((acc, curr) => acc + (curr.evaluation.overallScore || 0), 0) /
          evaluatedResults.length;
        setOverallScoreAverage(Number(avg.toFixed(1)));

        if (avg >= 7.5) {
          setOverallReadiness("Ready");
        } else if (avg >= 5.5) {
          setOverallReadiness("Almost Ready");
        } else {
          setOverallReadiness("Needs Practice");
        }

        setEvaluations(evaluatedResults);
        setStage("result");
      } else {
        throw new Error("Unable to evaluate answers. Please try again.");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to evaluate interview answers.");
      setStage("question");
    }
  }

  // Quick skill selection helper (local state only, no API calls or reloads)
  function toggleSkillFocus(skill: string) {
    const target = skill.trim();
    setFocusArea((prev) => {
      if (!prev) return target;
      const parts = prev
        .split(/[&,]/)
        .map((s) => s.trim())
        .filter(Boolean);

      const existsIndex = parts.findIndex((p) => p.toLowerCase() === target.toLowerCase());

      if (existsIndex >= 0) {
        parts.splice(existsIndex, 1);
        return parts.join(" & ");
      } else {
        parts.push(target);
        return parts.join(" & ");
      }
    });
  }

  if (status === "loading" || loadingCv) {
    return (
      <main className="mx-auto max-w-7xl p-5 md:p-10">
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-zinc-400">Loading your interview coach & CV profile...</p>
        </div>
      </main>
    );
  }

  const currentQ = questions[currentIndex];
  const progressPercent = questions.length
    ? Math.round(((currentIndex + 1) / questions.length) * 100)
    : 0;

  return (
    <main className="min-h-screen bg-[#0b0b0a] text-white p-4 md:p-8">
      <div className="mx-auto max-w-5xl">
        {/* Top Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 transition hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              AI Interview Coach
            </span>
          </div>
        </div>

        {/* ---------------- STAGE 1: SETUP ---------------- */}
        {stage === "setup" && (
          <div className="space-y-6 animate-in fade-in">
            {/* Header Banner */}
            <div>
              <h1 className="text-3xl font-black text-white md:text-5xl">
                Prepare for the role you want.
              </h1>
              <p className="mt-2 text-sm text-zinc-400 max-w-2xl">
                Simulate high-impact technical & behavioral interviews. Questions are generated
                strictly based on your uploaded CV, actual skills, and real-world scenarios.
              </p>
            </div>

            {/* Candidate Active CV Banner */}
            {cv ? (
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                        Interview Grounded on CV:
                      </span>
                      {cv.role && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                          <BadgeCheck className="h-3.5 w-3.5" />
                          {cv.role}
                        </span>
                      )}
                      {cv.experienceLevel && (
                        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs text-zinc-300">
                          {cv.experienceLevel} Level
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400">
                      File:{" "}
                      <span className="font-mono text-zinc-300">{cv.filename || "Resume.pdf"}</span>
                    </p>

                    {/* Detected CV Skills as Quick Clickers */}
                    {cv.skills && cv.skills.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-2">
                        <span className="text-[11px] font-semibold text-zinc-500">
                          Click skill to focus:
                        </span>
                        {cv.skills.slice(0, 10).map((skill, idx) => {
                          const isSelected = focusArea
                            .split(/[&,]/)
                            .map((s) => s.trim().toLowerCase())
                            .includes(skill.trim().toLowerCase());
                          return (
                            <button
                              type="button"
                              key={idx}
                              onClick={() => toggleSkillFocus(skill)}
                              className={`rounded-md px-2 py-0.5 text-xs font-medium transition ${
                                isSelected
                                  ? "bg-primary text-zinc-950 font-bold shadow-sm"
                                  : "border border-white/10 bg-white/5 text-zinc-300 hover:border-primary/40 hover:text-white"
                              }`}
                            >
                              {skill} {isSelected ? "✓" : "+"}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowCvModal(true)}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-semibold text-zinc-300 transition hover:bg-white/10 hover:text-white"
                  >
                    <FileText className="h-3.5 w-3.5 text-primary" />
                    Change CV
                  </button>
                </div>
              </div>
            ) : (
              /* No CV Uploaded Callout */
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-amber-300">No CV Attached Yet</h3>
                    <p className="text-xs text-zinc-400 max-w-xl">
                      Upload your resume so Gemini AI can tailor the interview questions directly to
                      your real experience, technologies, and career seniority.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCvModal(true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-zinc-950 shadow hover:bg-white transition"
                  >
                    Upload CV First
                  </button>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs font-semibold text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Setup Form Card */}
            <div className="rounded-3xl border border-white/10 bg-[#141412] p-6 md:p-8 space-y-6">
              {/* Field 1: Mode & Difficulty */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Select Mode & Difficulty Level
                </label>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {DIFFICULTY_LEVELS.map((lvl) => {
                    const isSelected = difficulty === lvl.id;
                    return (
                      <button
                        type="button"
                        key={lvl.id}
                        onClick={() => setDifficulty(lvl.id)}
                        className={`flex flex-col text-left rounded-2xl border p-4 transition ${
                          isSelected
                            ? "border-primary bg-primary/10 text-white shadow-md shadow-primary/10 ring-1 ring-primary/40"
                            : "border-white/10 bg-white/[0.02] text-zinc-400 hover:border-white/20 hover:bg-white/[0.04] hover:text-zinc-200"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-sm font-bold ${
                              isSelected ? "text-primary" : "text-white"
                            }`}
                          >
                            {lvl.label}
                          </span>
                          {isSelected && <Check className="h-4 w-4 text-primary" />}
                        </div>
                        <p className="mt-1 text-[11px] leading-relaxed text-zinc-400">{lvl.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Field 2: Number of Questions */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Number of Questions
                  </label>
                  <span className="text-xs text-zinc-500">1 to 15 questions</span>
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                  {QUESTION_COUNT_OPTIONS.map((c) => {
                    const isSelected = noOfQuestions === c;
                    return (
                      <button
                        type="button"
                        key={c}
                        onClick={() => setNoOfQuestions(c)}
                        className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                          isSelected
                            ? "bg-primary text-zinc-950 shadow-sm"
                            : "border border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        {c} Questions
                      </button>
                    );
                  })}
                  <div className="flex items-center gap-1.5 ml-auto">
                    <span className="text-xs text-zinc-500">Custom:</span>
                    <input
                      type="number"
                      min={1}
                      max={15}
                      value={noOfQuestions}
                      onChange={(e) =>
                        setNoOfQuestions(Math.min(15, Math.max(1, Number(e.target.value) || 5)))
                      }
                      className="h-9 w-16 rounded-xl border border-white/10 bg-black/40 px-2 text-center text-xs font-bold text-white focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Field 3 & 4: Role Override & Focus Area */}
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 pt-2 border-t border-white/5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300">
                    Target Role / Profession
                  </label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder={cv?.role || "e.g. Full Stack Developer"}
                    className="h-11 w-full rounded-xl border border-white/10 bg-black/40 px-3.5 text-xs text-white placeholder:text-zinc-600 focus:border-primary focus:outline-none"
                  />
                  <p className="text-[11px] text-zinc-500">
                    Defaults to your CV title ({cv?.role || "Full Stack Developer"})
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300">
                    Focus Topic / Skills (Optional)
                  </label>
                  <input
                    type="text"
                    value={focusArea}
                    onChange={(e) => setFocusArea(e.target.value)}
                    placeholder="e.g. PostgreSQL & React or System Architecture"
                    className="h-11 w-full rounded-xl border border-white/10 bg-black/40 px-3.5 text-xs text-white placeholder:text-zinc-600 focus:border-primary focus:outline-none"
                  />
                  <p className="text-[11px] text-zinc-500">
                    Direct questions toward specific tools or topics from your CV
                  </p>
                </div>
              </div>

              {/* Start Button */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs text-zinc-500">
                  Questions will be generated using Gemini AI grounded on your actual background.
                </p>
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleStartInterview}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-7 py-3 text-sm font-bold text-zinc-950 transition hover:bg-white disabled:opacity-50 shadow-lg shadow-primary/20"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating tailored questions...
                    </>
                  ) : (
                    <>Start Interview Session</>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ---------------- STAGE 2: QUESTION TAKING ---------------- */}
        {stage === "question" && currentQ && (
          <div className="space-y-6 animate-in fade-in">
            {/* Progress Header */}
            <div className="rounded-2xl border border-white/10 bg-[#141412] p-4 md:p-5">
              <div className="flex items-center justify-between text-xs mb-2.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">
                    Question {currentIndex + 1} of {questions.length}
                  </span>
                  <span className="text-zinc-500">·</span>
                  <span className="font-semibold text-primary capitalize">{currentQ.type}</span>
                </div>
                <span className="font-bold text-zinc-400">{progressPercent}% Completed</span>
              </div>
              {/* Progress Bar */}
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Question Card */}
            <div className="rounded-3xl border border-white/10 bg-[#141412] p-6 md:p-8 space-y-6">
              {/* Tags */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-0.5 text-xs font-bold text-primary capitalize">
                  {currentQ.type}
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs text-zinc-300">
                  Skill Tested: <span className="font-bold text-white">{currentQ.skillTested}</span>
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs text-zinc-300 capitalize">
                  Level: {currentQ.difficulty || difficulty}
                </span>
              </div>

              {/* Question Text */}
              <h2 className="text-xl md:text-2xl font-black text-white leading-relaxed">
                {currentQ.question || currentQ.prompt}
              </h2>

              {/* Context / Evaluator Goal */}
              {currentQ.context && (
                <div className="flex items-start gap-2.5 rounded-2xl border border-white/5 bg-black/40 p-4 text-xs text-zinc-400">
                  <Lightbulb className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-zinc-300">Interviewer Intent: </span>
                    {currentQ.context}
                  </div>
                </div>
              )}

              {/* Sample Outline / Hints Toggle */}
              {currentQ.sampleAnswerOutline && currentQ.sampleAnswerOutline.length > 0 && (
                <div>
                  <button
                    type="button"
                    onClick={() => setShowHint(!showHint)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-primary transition"
                  >
                    <HelpCircle className="h-3.5 w-3.5" />
                    {showHint ? "Hide Answer Outline Tips" : "Need a hint? View key points to hit"}
                  </button>

                  {showHint && (
                    <div className="mt-2.5 rounded-xl border border-primary/20 bg-primary/5 p-4 text-xs space-y-1.5 animate-in fade-in">
                      <p className="font-bold text-primary">Top points evaluated in this answer:</p>
                      <ul className="list-disc list-inside space-y-1 text-zinc-300">
                        {currentQ.sampleAnswerOutline.map((pt, idx) => (
                          <li key={idx}>{pt}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Answer Text Area */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-bold text-zinc-300">Your Answer Response</label>
                  <span className="text-zinc-500">
                    {currentAnswer.trim()
                      ? `${currentAnswer.trim().split(/\s+/).length} words`
                      : "0 words"}
                  </span>
                </div>
                <textarea
                  rows={8}
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  placeholder="Type your structured answer here... (Tip: Structure your response using Situation, Task, Action taken, and Results, referencing specific tools and technical choices)"
                  className="w-full rounded-2xl border border-white/10 bg-black/50 p-4 text-sm text-white placeholder:text-zinc-600 focus:border-primary focus:outline-none leading-relaxed"
                />
              </div>

              {/* Navigation Actions */}
              <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  disabled={currentIndex === 0}
                  onClick={handlePrevQuestion}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-zinc-300 hover:bg-white/10 hover:text-white disabled:opacity-30"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous Question
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm("Skip this question and move to the next?")) {
                        handleNextQuestion();
                      }
                    }}
                    className="w-full sm:w-auto px-3.5 py-2 text-xs font-semibold text-zinc-500 hover:text-zinc-300"
                  >
                    Skip
                  </button>

                  <button
                    type="button"
                    onClick={handleNextQuestion}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-xs font-bold text-zinc-950 transition hover:bg-white shadow"
                  >
                    {currentIndex + 1 === questions.length ? (
                      <>
                        <Award className="h-4 w-4" />
                        Finish & Evaluate Interview
                      </>
                    ) : (
                      <>
                        Next Question
                        <ChevronRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ---------------- STAGE 3: EVALUATING ANIMATION ---------------- */}
        {stage === "evaluating" && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-5 animate-in fade-in">
            <div className="relative">
              <div className="h-20 w-20 animate-ping rounded-full bg-primary/20" />
              <Loader2 className="absolute inset-0 m-auto h-10 w-10 animate-spin text-primary" />
            </div>
            <div className="space-y-2 max-w-md">
              <h2 className="text-2xl font-black text-white">Analyzing Your Interview</h2>
              <p className="text-xs text-zinc-400">
                Gemini AI is evaluating your technical accuracy, answer structure (STAR), domain
                specificity, and generating personalized constructive recommendations.
              </p>
            </div>
          </div>
        )}

        {/* ---------------- STAGE 4: RESULTS SCORECARD ---------------- */}
        {stage === "result" && evaluations.length > 0 && (
          <div className="space-y-8 animate-in fade-in">
            {/* Scorecard Hero Banner */}
            <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-[#171715] via-[#141412] to-[#0f0f0e] p-6 md:p-8 shadow-xl">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="space-y-2">
                  <span className="flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-0.5 text-xs font-bold text-primary w-fit">
                    <Award className="h-3.5 w-3.5" />
                    Interview Performance Report
                  </span>
                  <h1 className="text-3xl font-black text-white md:text-4xl">
                    Interview Evaluation Completed
                  </h1>
                  <p className="text-xs text-zinc-400 max-w-xl">
                    Here is how your responses measured up for the{" "}
                    <span className="font-bold text-zinc-200">
                      {sessionMetadata?.candidateRole || role || "Full Stack Developer"}
                    </span>{" "}
                    role ({sessionMetadata?.difficulty || difficulty} level).
                  </p>
                </div>

                {/* Score & Verdict Display */}
                <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-black/40 p-5">
                  <div className="text-center">
                    <p className="text-4xl font-black text-primary">{overallScoreAverage}/10</p>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                      Average Score
                    </p>
                  </div>
                  <div className="h-10 w-[1px] bg-white/10" />
                  <div>
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${
                        overallReadiness === "Ready"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                          : overallReadiness === "Almost Ready"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                            : "bg-red-500/10 text-red-400 border border-red-500/30"
                      }`}
                    >
                      {overallReadiness}
                    </span>
                    <p className="mt-1 text-[11px] text-zinc-400">Hiring Recommendation</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Question Breakdown List */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Detailed Question-by-Question Feedback
              </h2>

              {evaluations.map((item, idx) => {
                const evalData = item.evaluation;
                return (
                  <div
                    key={idx}
                    className="rounded-3xl border border-white/10 bg-[#141412] p-6 md:p-7 space-y-5"
                  >
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-zinc-500">
                            Question {idx + 1} of {evaluations.length}
                          </span>
                          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-zinc-400 capitalize">
                            {item.question.skillTested}
                          </span>
                        </div>
                        <h3 className="mt-1 text-base font-bold text-white">
                          {item.question.question || item.question.prompt}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xl font-black text-primary">
                          {evalData.overallScore}/10
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                            evalData.readiness === "Ready"
                              ? "bg-emerald-500/10 text-emerald-400"
                              : evalData.readiness === "Almost Ready"
                                ? "bg-amber-500/10 text-amber-400"
                                : "bg-red-500/10 text-red-400"
                          }`}
                        >
                          {evalData.readiness}
                        </span>
                      </div>
                    </div>

                    {/* Metric Breakdown Pills */}
                    {evalData.scores && (
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5 text-center text-xs">
                        <div className="rounded-xl border border-white/5 bg-black/40 p-2.5">
                          <p className="text-[10px] text-zinc-500">Relevance</p>
                          <p className="font-bold text-white">{evalData.scores.relevance}/10</p>
                        </div>
                        <div className="rounded-xl border border-white/5 bg-black/40 p-2.5">
                          <p className="text-[10px] text-zinc-500">Technical Accuracy</p>
                          <p className="font-bold text-white">
                            {evalData.scores.technicalAccuracy}/10
                          </p>
                        </div>
                        <div className="rounded-xl border border-white/5 bg-black/40 p-2.5">
                          <p className="text-[10px] text-zinc-500">Specificity</p>
                          <p className="font-bold text-white">{evalData.scores.specificity}/10</p>
                        </div>
                        <div className="rounded-xl border border-white/5 bg-black/40 p-2.5">
                          <p className="text-[10px] text-zinc-500">Structure (STAR)</p>
                          <p className="font-bold text-white">{evalData.scores.structure}/10</p>
                        </div>
                        <div className="rounded-xl border border-white/5 bg-black/40 p-2.5 col-span-2 sm:col-span-1">
                          <p className="text-[10px] text-zinc-500">Clarity</p>
                          <p className="font-bold text-white">{evalData.scores.clarity}/10</p>
                        </div>
                      </div>
                    )}

                    {/* Summary */}
                    {evalData.summary && (
                      <p className="text-xs leading-relaxed text-zinc-300 bg-white/[0.02] border border-white/5 rounded-xl p-3">
                        <span className="font-bold text-white">Evaluator Summary: </span>
                        {evalData.summary}
                      </p>
                    )}

                    {/* Strengths & Improvements */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 text-xs">
                      {evalData.strengths && evalData.strengths.length > 0 && (
                        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-2">
                          <p className="font-bold text-emerald-400 flex items-center gap-1.5">
                            <CheckCircle2 className="h-4 w-4" />
                            Key Strengths
                          </p>
                          <ul className="space-y-1 text-zinc-300">
                            {evalData.strengths.map((str, sIdx) => (
                              <li key={sIdx} className="flex items-start gap-1.5">
                                <span className="text-emerald-400">•</span>
                                <span>{str}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {evalData.improvements && evalData.improvements.length > 0 && (
                        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-2">
                          <p className="font-bold text-amber-400 flex items-center gap-1.5">
                            <TrendingUp className="h-4 w-4" />
                            Actionable Improvements
                          </p>
                          <ul className="space-y-1 text-zinc-300">
                            {evalData.improvements.map((imp, iIdx) => (
                              <li key={iIdx} className="flex items-start gap-1.5">
                                <span className="text-amber-400">•</span>
                                <span>{imp}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Candidate Answer vs Ideal Model Answer */}
                    <div className="space-y-3 pt-2 text-xs">
                      <details className="group rounded-2xl border border-white/10 bg-black/40 p-4">
                        <summary className="font-bold text-zinc-300 cursor-pointer list-none flex items-center justify-between">
                          <span>Your Submitted Response</span>
                          <span className="text-zinc-500 group-open:rotate-180 transition">▼</span>
                        </summary>
                        <p className="mt-3 text-zinc-400 whitespace-pre-wrap leading-relaxed">
                          {item.candidateAnswer || "No answer entered."}
                        </p>
                      </details>

                      {evalData.idealAnswerSample && (
                        <details className="group rounded-2xl border border-primary/20 bg-primary/5 p-4">
                          <summary className="font-bold text-primary cursor-pointer list-none flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                              View Ideal Model Answer (High-Scoring Sample)
                            </span>
                            <span className="text-primary group-open:rotate-180 transition">▼</span>
                          </summary>
                          <div className="mt-3 text-zinc-300 whitespace-pre-wrap leading-relaxed space-y-3">
                            <p>{evalData.idealAnswerSample}</p>
                            {evalData.betterAnswerOutline &&
                              evalData.betterAnswerOutline.length > 0 && (
                                <div className="border-t border-primary/20 pt-2 text-[11px] text-zinc-400">
                                  <p className="font-bold text-primary mb-1">
                                    Key Points Breakdown:
                                  </p>
                                  <ul className="list-disc list-inside space-y-0.5">
                                    {evalData.betterAnswerOutline.map((b, bIdx) => (
                                      <li key={bIdx}>{b}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                          </div>
                        </details>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  setStage("setup");
                  setQuestions([]);
                  setEvaluations([]);
                  setAnswers({});
                }}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-xs font-bold text-zinc-300 hover:bg-white/10 hover:text-white transition"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Configure New Interview Session
              </button>

              <button
                type="button"
                onClick={handleStartInterview}
                className="inline-flex items-center gap-2 rounded-2xl bg-primary px-7 py-3 text-xs font-bold text-zinc-950 hover:bg-white transition shadow-lg shadow-primary/20"
              >
                <RefreshCw className="h-4 w-4" />
                Practice Again with Same Settings
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Replace / Upload CV Modal */}
      <ReplaceCvModal
        isOpen={showCvModal}
        onClose={() => setShowCvModal(false)}
        onSuccess={(updatedCv) => {
          if (updatedCv) {
            setCv(updatedCv);
            if (updatedCv.role) setRole(updatedCv.role);
            if (updatedCv.skills && updatedCv.skills.length > 0) {
              setFocusArea(updatedCv.skills.slice(0, 2).join(" & "));
            }
          }
        }}
        currentCvFilename={cv?.filename}
        currentCvUrl={cv?.url}
        currentRole={cv?.role}
      />
    </main>
  );
}
