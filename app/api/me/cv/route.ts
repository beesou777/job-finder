import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/services/auth";
import { getDataSource } from "@/lib/db";
import { User } from "@/server/db/entities/User";
import { uploadCvToR2, deleteCvFromR2 } from "@/server/services/r2";
import { parseCvWithGemini } from "@/server/services/cv-parser";

export const dynamic = "force-dynamic";

const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB maximum size

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "text/plain",
  "text/markdown",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
];

const ALLOWED_EXTENSIONS = [
  ".pdf",
  ".docx",
  ".doc",
  ".txt",
  ".md",
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
];

function isValidFileType(fileName: string, mimeType: string): boolean {
  const lowerName = fileName.toLowerCase();
  const hasValidExt = ALLOWED_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
  const hasValidMime = ALLOWED_MIME_TYPES.includes(mimeType) || !mimeType;
  return hasValidExt || hasValidMime;
}

/**
 * GET /api/me/cv
 * Returns current user's CV data and parsed extraction.
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dataSource = await getDataSource();
  const userRepo = dataSource.getRepository(User);
  const user = await userRepo.findOne({
    select: [
      "id",
      "cvUrl",
      "cvFilename",
      "cvUploadedAt",
      "cvRole",
      "cvSkills",
      "cvSummary",
      "cvExperienceLevel",
    ],
    where: { id: Number(session.user.id) },
  });

  if (!user || !user.cvUrl) {
    return NextResponse.json({ hasCv: false, cv: null });
  }

  return NextResponse.json({
    hasCv: true,
    cv: {
      url: user.cvUrl,
      filename: user.cvFilename,
      uploadedAt: user.cvUploadedAt,
      role: user.cvRole,
      skills: user.cvSkills || [],
      summary: user.cvSummary,
      experienceLevel: user.cvExperienceLevel,
    },
  });
}

/**
 * POST /api/me/cv
 * Uploads CV to Cloudflare R2, parses with Gemini AI, and saves extracted profile.
 */
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds 4MB limit. Please upload a file smaller than 4MB." },
        { status: 400 },
      );
    }

    if (!isValidFileType(file.name, file.type)) {
      return NextResponse.json(
        {
          error: "Invalid file format. Please upload a PDF, DOCX, TXT, or Image resume under 4MB.",
        },
        { status: 400 },
      );
    }

    const dataSource = await getDataSource();
    const userRepo = dataSource.getRepository(User);
    const user = await userRepo.findOne({
      where: { id: Number(session.user.id) },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // If user already had a previous CV stored, delete it from R2
    if (user.cvKey) {
      try {
        await deleteCvFromR2(user.cvKey);
      } catch (delErr) {
        console.warn("[CV Upload] Failed to clean up old CV from R2:", delErr);
      }
    }

    // 1. Upload to Cloudflare R2
    const uploadResult = await uploadCvToR2(
      user.id,
      buffer,
      file.name,
      file.type || "application/pdf",
    );

    // 2. Parse with Google Gemini AI
    let parsed: {
      role: string;
      skills: string[];
      experienceLevel: string;
      location: string;
      summary: string;
    };

    try {
      parsed = await parseCvWithGemini(buffer, file.name, file.type);
    } catch (parseError: any) {
      console.error("[CV Upload] Gemini parse error:", parseError);
      // If parsing fails, still save file URL and use default empty parsed data
      parsed = {
        role: "Professional",
        skills: [],
        experienceLevel: "Mid",
        location: "",
        summary: "CV uploaded successfully.",
      };
    }

    // 3. Update User in DB
    user.cvUrl = uploadResult.url;
    user.cvKey = uploadResult.key;
    user.cvFilename = file.name;
    user.cvUploadedAt = new Date();
    user.cvRole = parsed.role;
    user.cvSkills = parsed.skills;
    user.cvSummary = parsed.summary;
    user.cvExperienceLevel = parsed.experienceLevel;

    // Automatically synchronize preferences with parsed CV for seamless job matching
    if (!user.preferredRole || user.preferredRole.trim().length === 0) {
      user.preferredRole = parsed.role;
    }

    const mergedKeywords = Array.from(
      new Set([...(user.preferredKeywords || []), ...parsed.skills]),
    );
    user.preferredKeywords = mergedKeywords;

    if (parsed.location) {
      const locTerms = parsed.location
        .split(/[,/|;]+/)
        .map((t) => t.trim())
        .filter((t) => {
          const lower = t.toLowerCase();
          return lower && lower !== "nepal" && lower !== "np";
        });
      const cleanLoc = locTerms[0] || "";
      if (
        cleanLoc &&
        (!user.preferredLocation ||
          user.preferredLocation.trim().length === 0 ||
          user.preferredLocation.toLowerCase().includes("nepal"))
      ) {
        user.preferredLocation = cleanLoc;
      }
    }

    await userRepo.save(user);

    return NextResponse.json({
      success: true,
      message: "CV uploaded and analyzed successfully!",
      cv: {
        url: user.cvUrl,
        filename: user.cvFilename,
        uploadedAt: user.cvUploadedAt,
        role: user.cvRole,
        skills: user.cvSkills,
        summary: user.cvSummary,
        experienceLevel: user.cvExperienceLevel,
      },
    });
  } catch (error: any) {
    console.error("[CV Upload API Error]:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to upload and process CV." },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/me/cv
 * Removes user's CV from Cloudflare R2 and clears database fields.
 */
export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const dataSource = await getDataSource();
    const userRepo = dataSource.getRepository(User);
    const user = await userRepo.findOne({
      where: { id: Number(session.user.id) },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.cvKey) {
      await deleteCvFromR2(user.cvKey);
    }

    user.cvUrl = null;
    user.cvKey = null;
    user.cvFilename = null;
    user.cvUploadedAt = null;
    user.cvRole = null;
    user.cvSkills = [];
    user.cvSummary = null;
    user.cvExperienceLevel = null;

    await userRepo.save(user);

    return NextResponse.json({ success: true, message: "CV deleted successfully." });
  } catch (error: any) {
    console.error("[CV Delete API Error]:", error);
    return NextResponse.json({ error: error?.message || "Failed to delete CV." }, { status: 500 });
  }
}
