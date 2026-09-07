import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/services/auth";
import { getDataSource } from "@/lib/db";
import { User } from "@/server/db/entities/User";
export const dynamic = "force-dynamic";
export const revalidate = 0;
async function current() {
  const s = await getServerSession(authOptions);
  if (!s?.user?.id) return null;
  return (await getDataSource()).getRepository(User).findOne({
    select: ["id", "savedJobIds"],
    where: { id: Number(s.user.id) },
  });
}
export async function GET() {
  const u = await current();
  if (!u) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ jobs: u.savedJobIds || [] });
}
export async function POST(r: NextRequest) {
  const u = await current();
  if (!u) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await r.json();
  const id = body.id ?? body.jobId;
  if (!id) return NextResponse.json({ error: "Job id required" }, { status: 400 });
  const value = body.job ? { ...body.job, id: String(id) } : String(id);
  u.savedJobIds = Array.from(
    new Map(
      [...(u.savedJobIds || []), value].map((x) => [typeof x === "string" ? x : x.id, x]),
    ).values(),
  );
  await (await getDataSource()).getRepository(User).save(u);
  return NextResponse.json({ success: true, savedJobIds: u.savedJobIds });
}
export async function DELETE(r: NextRequest) {
  const u = await current();
  if (!u) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await r.json();
  const id = body.id ?? body.jobId;
  u.savedJobIds = (u.savedJobIds || []).filter(
    (x) => String(typeof x === "string" ? x : (x as any).id) !== String(id),
  );
  await (await getDataSource()).getRepository(User).save(u);
  return NextResponse.json({ success: true, savedJobIds: u.savedJobIds });
}
