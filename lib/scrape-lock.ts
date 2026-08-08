import { getDataSource } from "@/lib/db";

const LOCK_KEY = 918273;

export async function acquireScrapeLock() {
  const dataSource = await getDataSource();
  const result = await dataSource.query("SELECT pg_try_advisory_lock($1) AS locked", [LOCK_KEY]);
  return { dataSource, locked: Boolean(result[0]?.locked) };
}

export async function releaseScrapeLock(dataSource: Awaited<ReturnType<typeof getDataSource>>) {
  await dataSource.query("SELECT pg_advisory_unlock($1)", [LOCK_KEY]).catch(() => undefined);
}
