import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/services/auth";
import { getDataSource } from "@/lib/db";
import { User } from "@/server/db/entities/User";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await (
    await getDataSource()
  )
    .getRepository(User)
    .findOneBy({ id: Number(session.user.id) });
  return NextResponse.json({
    preferences: user
      ? {
          preferredRole: user.preferredRole,
          preferredKeywords: user.preferredKeywords || [],
          preferredLocation: user.preferredLocation,
          preferredJobType: user.preferredJobType,
          preferredWorkMode: user.preferredWorkMode,
          emailAlerts: user.emailAlerts,
        }
      : null,
  });
}

export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const repo = (await getDataSource()).getRepository(User);
  const user = await repo.findOneBy({ id: Number(session.user.id) });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  Object.assign(user, {
    preferredRole: body.preferredRole?.trim() || null,
    preferredKeywords: Array.isArray(body.preferredKeywords)
      ? body.preferredKeywords
          .map((x: string) => x.trim())
          .filter(Boolean)
          .slice(0, 20)
      : [],
    preferredLocation: body.preferredLocation?.trim() || null,
    preferredJobType:
      body.preferredJobType && body.preferredJobType !== "Any" ? body.preferredJobType : null,
    preferredWorkMode:
      body.preferredWorkMode && body.preferredWorkMode !== "Any" ? body.preferredWorkMode : null,
    emailAlerts: body.emailAlerts !== false,
  });
  await repo.save(user);
  return NextResponse.json({ success: true });
}
