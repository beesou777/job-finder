import { NextRequest, NextResponse } from "next/server";
import { getBankQuestions } from "@/lib/interview-question-bank";

export async function POST(request: NextRequest) {
  const key = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";
  if (!key) return NextResponse.json({ error: "Interview coach is not configured." }, { status: 503 });
  const body: any = await request.json().catch(() => null);
  if (!body?.role || !body?.position) return NextResponse.json({ error: "Role and position are required." }, { status: 400 });
  body.experience = body.experience || "fresher";
  body.difficulty = body.difficulty || "easy";
  const limits: Record<string, [number, number]> = { easy: [7, 10], medium: [10, 15], hard: [20, 30] };
  const [minimum, maximum] = limits[body.difficulty] || limits.medium;
  const count = Math.min(15, Math.max(minimum, Number(body.questionCount) || minimum));
  const bank = getBankQuestions(String(body.role), String(body.experience), count);
  if (!key && bank.length > 0) return NextResponse.json({ questions: bank.slice(0, count), limit: { minimum, maximum, enforcedMaximum: 15 } });
  const prompt = `Create only the missing questions for a practical interview session. Nepal job seeker. Role: ${String(body.role).slice(0,300)}. Position: ${String(body.position).slice(0,500)}. Experience: ${body.experience}. Difficulty: ${body.difficulty}. Need ${Math.max(0, count - bank.length)} additional questions. Existing bank questions are already included, so avoid duplicates. Return JSON only: {"questions":[string]}. Include role-appropriate technical, scenario, and coding questions. Senior questions must focus on architecture, trade-offs, scalability, debugging, and observability. Do not ask about protected characteristics.`;
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.4, responseMimeType: "application/json" } }) });
  if (!response.ok) return NextResponse.json({ error: "Could not prepare the interview questions." }, { status: 502 });
  const data: any = await response.json();
  try { const parsed = JSON.parse(data.candidates?.[0]?.content?.parts?.[0]?.text || "{}"); const generated = (Array.isArray(parsed.questions) ? parsed.questions : []).map((prompt: string) => ({ type: "open-ended", prompt })); return NextResponse.json({ questions: [...bank, ...generated].slice(0, count), limit: { minimum, maximum, enforcedMaximum: 15 } }); } catch { return NextResponse.json({ error: "Gemini returned invalid questions." }, { status: 502 }); }
}
