"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";

const ranges = { easy: [7, 10], medium: [10, 15], hard: [20, 30] } as const;
type Question = {
  type: string;
  prompt: string;
  options?: string[];
  correctOption?: number;
  explanation?: string;
};
export default function InterviewPracticePage() {
  const { status } = useSession();
  const router = useRouter();
  if (status === "unauthenticated")
    router.replace("/login?callbackUrl=/dashboard/interview-practice");
  if (status !== "authenticated")
    return <main className="min-h-[70vh] p-10 text-zinc-400">Checking your account…</main>;
  const [role, setRole] = useState("");
  const [position, setPosition] = useState("");
  const [experience, setExperience] = useState("fresher");
  const [difficulty, setDifficulty] = useState<keyof typeof ranges>("easy");
  const [count, setCount] = useState(7);
  const [mode, setMode] = useState("practice");
  const [stage, setStage] = useState("setup");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [answers, setAnswers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<any>(null);
  const current = questions[index];
  function setLevel(value: keyof typeof ranges) {
    setDifficulty(value);
    setCount(ranges[value][0]);
  }
  async function start() {
    setLoading(true);
    const response = await fetch("/api/interview/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        role,
        position,
        experience,
        difficulty,
        questionCount: count,
        mode,
      }),
    });
    const data: any = await response.json();
    if (!response.ok) setError(data.error || "Could not prepare interview.");
    else {
      setQuestions(data.questions || []);
      setIndex(0);
      setAnswers([]);
      setStage("question");
    }
    setLoading(false);
  }
  async function next() {
    const all = [...answers, answer];
    if (index + 1 < questions.length) {
      setAnswers(all);
      setAnswer("");
      setIndex(index + 1);
      return;
    }
    setLoading(true);
    const response = await fetch("/api/interview/evaluate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        role,
        question: questions.map((q) => q.prompt).join("\n"),
        answer: questions
          .map((q, i) => `Question: ${q.prompt}\nAnswer: ${all[i] || "No answer"}`)
          .join("\n\n"),
        mode,
      }),
    });
    const data: any = await response.json();
    if (!response.ok) setError(data.error || "Could not evaluate interview.");
    else {
      setResult(data);
      setStage("result");
    }
    setLoading(false);
  }
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-5xl px-4 py-10 md:py-16">
        <h1 className="mt-12 text-4xl font-black md:text-6xl">Prepare for the role you want.</h1>
        {stage === "setup" && (
          <section className="mt-10 max-w-3xl rounded-2xl border border-white/10 bg-[#18181a] p-6">
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Role or field">
                <input
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Frontend Developer"
                />
              </Field>
              <Field label="Position context">
                <input
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="e.g. Junior React Developer"
                />
              </Field>
              <Field label="Experience">
                <select value={experience} onChange={(e) => setExperience(e.target.value)}>
                  <option value="fresher">Fresher (0–1 year)</option>
                  <option value="junior">Junior (1–3 years)</option>
                  <option value="mid">Mid-level (3–5 years)</option>
                  <option value="senior">Senior (5+ years)</option>
                </select>
              </Field>
              <Field label="Difficulty">
                <select
                  value={difficulty}
                  onChange={(e) => setLevel(e.target.value as keyof typeof ranges)}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </Field>
              <Field
                label={`Questions (${ranges[difficulty][0]}–${ranges[difficulty][1]}, cap 15)`}
              >
                <input
                  type="number"
                  min={ranges[difficulty][0]}
                  max={Math.min(15, ranges[difficulty][1])}
                  value={count}
                  onChange={(e) =>
                    setCount(
                      Math.min(
                        15,
                        Math.max(
                          ranges[difficulty][0],
                          Number(e.target.value) || ranges[difficulty][0],
                        ),
                      ),
                    )
                  }
                />
              </Field>
            </div>
            <button
              onClick={start}
              disabled={loading || !role || !position}
              className="mt-6 inline-flex gap-2 rounded-full bg-primary px-6 py-3 font-black text-zinc-950"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Sparkles />} Start interview
            </button>
            {error && <p className="mt-4 text-red-300">{error}</p>}
          </section>
        )}
        {stage === "question" && current && (
          <section className="mt-10 max-w-3xl rounded-2xl border border-white/10 bg-[#18181a] p-6">
            <p className="text-sm text-zinc-500">
              Question {index + 1} of {questions.length}
            </p>
            <h2 className="mt-6 text-2xl font-black leading-9">{current.prompt}</h2>
            {current.type === "multiple-choice" && current.options ? (
              <div className="mt-6 grid gap-3">
                {current.options.map((option, optionIndex) => (
                  <button
                    key={option}
                    onClick={() => setAnswer(String(optionIndex))}
                    className={`rounded-lg border p-4 text-left font-bold ${answer === String(optionIndex) ? "border-primary bg-primary/10 text-primary" : "border-white/10 text-zinc-300 hover:border-primary/60"}`}
                  >
                    {String.fromCharCode(65 + optionIndex)}. {option}
                  </button>
                ))}
              </div>
            ) : (
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="mt-6 min-h-56 w-full rounded-lg border border-white/10 bg-zinc-950 p-4 text-white outline-none focus:border-primary"
                placeholder="Write your answer here..."
              />
            )}
            <button
              onClick={next}
              disabled={loading || !answer}
              className="mt-5 rounded-full bg-primary px-6 py-3 font-black text-zinc-950 disabled:opacity-40"
            >
              {index + 1 === questions.length ? "Finish interview" : "Next question"}
            </button>
          </section>
        )}
        {stage === "result" && result && (
          <section className="mt-10 max-w-3xl rounded-2xl border border-primary/30 bg-primary/5 p-8">
            <p className="text-6xl font-black text-primary">
              {Number(result.overallScore || 0).toFixed(1)}/10
            </p>
            <p className="mt-4 text-zinc-300">Your interview evaluation is ready.</p>
          </section>
        )}
      </div>
    </main>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm font-bold text-zinc-300">
      {label}
      <div className="mt-2 [&_input]:h-12 [&_input]:w-full [&_input]:rounded-lg [&_input]:border [&_input]:border-white/10 [&_input]:bg-zinc-950 [&_input]:px-4 [&_input]:text-white [&_select]:h-12 [&_select]:w-full [&_select]:rounded-lg [&_select]:border [&_select]:border-white/10 [&_select]:bg-zinc-950 [&_select]:px-4 [&_select]:text-white">
        {children}
      </div>
    </label>
  );
}
