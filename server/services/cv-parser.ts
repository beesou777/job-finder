export interface ParsedCvResult {
  role: string;
  skills: string[];
  experienceLevel: string;
  location: string;
  summary: string;
}

/**
 * Parses CV/Resume document using Google Gemini AI.
 * Supports PDF, TXT, and Images natively.
 */
export async function parseCvWithGemini(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string,
): Promise<ParsedCvResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured in environment variables.");
  }

  const configuredModel = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const modelsToTry = [
    configuredModel,
    "gemini-2.5-flash",
    "gemini-3.5-flash-lite",
    "gemini-1.5-flash",
  ].filter((m, idx, arr) => arr.indexOf(m) === idx);

  const systemPrompt = `You are an expert technical recruiter and resume parsing specialist.
Your task is to analyze the provided CV/Resume and extract structured candidate information to match them with job vacancies.

Rules:
1. "role": Identify the primary professional title or target role (e.g. "Full Stack Developer", "Accountant", "Civil Engineer", "Frontend Developer", "Content Writer", "Graphic Designer").
2. "skills": Extract 6 to 12 of the strongest technical, software, tool, or domain skills (e.g. "React", "Node.js", "PostgreSQL", "Tailwind CSS", "AutoCAD", "Financial Analysis", "SEO"). Do NOT include generic buzzwords like "time management", "punctual", "hard working", "communication".
3. "experienceLevel": One of "Entry", "Mid", "Senior", "Lead".
4. "location": City or country mentioned (e.g. "Kathmandu", "Lalitpur", "Nepal", "Remote") or empty string if not found.
5. "summary": A concise 2-sentence executive summary highlighting their key stack, years of experience, and main strengths.

Respond ONLY with a valid JSON object with these exact keys:
{
  "role": string,
  "skills": string[],
  "experienceLevel": string,
  "location": string,
  "summary": string
}`;

  let contentPart: any;
  const lowerName = fileName.toLowerCase();

  // If text file
  if (
    mimeType === "text/plain" ||
    mimeType === "text/markdown" ||
    lowerName.endsWith(".txt") ||
    lowerName.endsWith(".md")
  ) {
    const text = fileBuffer.toString("utf-8");
    contentPart = { text: `CV CONTENT:\n${text}` };
  } else if (mimeType === "application/pdf" || lowerName.endsWith(".pdf")) {
    // Send native PDF via inlineData
    contentPart = {
      inline_data: {
        mime_type: "application/pdf",
        data: fileBuffer.toString("base64"),
      },
    };
  } else if (
    mimeType.startsWith("image/") ||
    lowerName.endsWith(".png") ||
    lowerName.endsWith(".jpg") ||
    lowerName.endsWith(".jpeg") ||
    lowerName.endsWith(".webp")
  ) {
    const imageMime = mimeType.startsWith("image/")
      ? mimeType
      : lowerName.endsWith(".png")
        ? "image/png"
        : lowerName.endsWith(".webp")
          ? "image/webp"
          : "image/jpeg";
    contentPart = {
      inline_data: {
        mime_type: imageMime,
        data: fileBuffer.toString("base64"),
      },
    };
  } else {
    // Fallback: try converting buffer to readable text / strings
    const rawText = fileBuffer
      .toString("utf-8")
      .replace(/[^\x20-\x7E\t\n\r]/g, " ")
      .trim();
    if (rawText.length > 100) {
      contentPart = { text: `CV CONTENT (Extracted):\n${rawText.slice(0, 10000)}` };
    } else {
      // Default to application/pdf inline data if binary
      contentPart = {
        inline_data: {
          mime_type: "application/pdf",
          data: fileBuffer.toString("base64"),
        },
      };
    }
  }

  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
          model,
        )}:generateContent?key=${encodeURIComponent(apiKey)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents: [
              {
                parts: [
                  contentPart,
                  {
                    text: "Extract candidate role, technical skills, experience level, location, and summary according to the instructions.",
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.1,
              responseMimeType: "application/json",
            },
          }),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`[CV Parser] Gemini (${model}) error ${response.status}: ${errorText}`);
        continue;
      }

      const data = await response.json();
      const rawJson = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawJson) continue;

      const parsed = JSON.parse(rawJson);
      return {
        role: String(parsed.role || "Professional").trim(),
        skills: Array.isArray(parsed.skills)
          ? parsed.skills.map((s: any) => String(s).trim()).filter(Boolean)
          : [],
        experienceLevel: String(parsed.experienceLevel || "Mid").trim(),
        location: String(parsed.location || "").trim(),
        summary: String(parsed.summary || "").trim(),
      };
    } catch (err) {
      lastError = err;
      console.warn(`[CV Parser] Model ${model} attempt failed:`, err);
    }
  }

  throw lastError || new Error("Failed to parse CV with Gemini AI models.");
}
