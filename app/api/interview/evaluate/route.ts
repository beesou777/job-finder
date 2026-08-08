import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const key = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";
  if (!key) return NextResponse.json({ error: "Interview coach is not configured." }, { status: 503 });
  const body: any = await request.json().catch(() => null);
  if (!body?.question || !body?.answer) return NextResponse.json({ error: "Question and answer are required." }, { status: 400 });
  const prompt = `You are a fair interview coach. Evaluate only the candidate's answer against the question and role. Do not judge age, gender, caste, ethnicity, accent, disability, appearance, or native-level English. Return JSON only with this shape: {"overallScore":number,"scores":{"relevance":number,"structure":number,"specificity":number,"evidence":number,"clarity":number},"strengths":string[],"improvements":string[],"missingElements":string[],"betterAnswerOutline":string[]}. Score each dimension 0-10. Question: ${String(body.question).slice(0,1200)} Role: ${String(body.role || "General").slice(0,200)} Answer: ${String(body.answer).slice(0,6000)}`;
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.2, responseMimeType: "application/json" } }) });
  if (!response.ok) return NextResponse.json({ error: "Gemini could not evaluate this answer." }, { status: 502 });
  const data: any = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  try { return NextResponse.json(JSON.parse(text)); } catch { return NextResponse.json({ error: "The coach returned an invalid evaluation." }, { status: 502 }); }
}
