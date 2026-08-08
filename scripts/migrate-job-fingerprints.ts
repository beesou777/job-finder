import "reflect-metadata";
import "dotenv/config";
import { createHash } from "crypto";
import { getDataSource } from "../lib/db";

function normalizeUrl(value: string) {
  try {
    const url = new URL(value);
    url.search = "";
    url.hash = "";
    url.pathname = url.pathname.replace(/\/$/, "");
    return url.toString().toLowerCase();
  } catch {
    return value.toLowerCase().split("?")[0].split("#")[0].replace(/\/$/, "");
  }
}

function fingerprint(source: string, url: string) {
  return createHash("sha256").update(`${source.trim().toLowerCase()}|${normalizeUrl(url)}`).digest("hex");
}

async function migrate() {
  const dataSource = await getDataSource();
  await dataSource.query(`ALTER TABLE jobs ADD COLUMN IF NOT EXISTS "fingerprint" varchar(64)`);
  await dataSource.query(`ALTER TABLE jobs ADD COLUMN IF NOT EXISTS "contentHash" varchar(64)`);
  const rows = await dataSource.query(`SELECT id, source, "applyUrl", title, company, location, deadline, description FROM jobs WHERE "fingerprint" IS NULL`);
  for (const row of rows) {
    const value = fingerprint(row.source || "unknown", row.applyUrl || String(row.id));
    const content = createHash("sha256").update([row.title, row.company, row.location, row.deadline, row.description].map((v) => v || "").join("|"), "utf8").digest("hex");
    await dataSource.query(`UPDATE jobs SET "fingerprint" = $1, "contentHash" = $2 WHERE id = $3 AND "fingerprint" IS NULL`, [value, content, row.id]);
  }
  await dataSource.query(`UPDATE jobs SET "fingerprint" = NULL WHERE id IN (SELECT id FROM (SELECT id, ROW_NUMBER() OVER (PARTITION BY "fingerprint" ORDER BY "lastSeenAt" DESC NULLS LAST, "createdAt" DESC NULLS LAST) AS duplicate_rank FROM jobs WHERE "fingerprint" IS NOT NULL) ranked WHERE duplicate_rank > 1)`);
  await dataSource.query(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_jobs_fingerprint_unique" ON jobs ("fingerprint") WHERE "fingerprint" IS NOT NULL`);
  await dataSource.query(`CREATE INDEX IF NOT EXISTS "IDX_jobs_source_active_seen" ON jobs (source, "isActive", "lastSeenAt")`);
  console.log(`Fingerprint migration complete. Backfilled ${rows.length} jobs.`);
  await dataSource.destroy();
}

migrate().catch((error) => { console.error("Fingerprint migration failed:", error); process.exitCode = 1; });
