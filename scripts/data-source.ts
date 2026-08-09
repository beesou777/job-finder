import "reflect-metadata";
import "dotenv/config";
import { DataSource } from "typeorm";
import path from "node:path";
import { Job } from "../server/db/entities/Job";
import { User } from "../server/db/entities/User";
import { Category } from "../server/db/entities/Category";
import { DailyJobStats } from "../server/db/entities/DailyJobStats";
import { DailySourceStats } from "../server/db/entities/DailySourceStats";
import { CanonicalLocation } from "../server/db/entities/CanonicalLocation";
import { CanonicalCompany } from "../server/db/entities/CanonicalCompany";
import { CompanyEnrichment } from "../server/db/entities/CompanyEnrichment";
import { HiringIntentScoreHistory } from "../server/db/entities/HiringIntentScoreHistory";
import { LinkedInJob } from "../server/db/entities/LinkedInJob";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL environment variable is not set");

export default new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  synchronize: false,
  migrationsRun: false,
  entities: [Job, User, Category, DailyJobStats, DailySourceStats, CanonicalLocation, CanonicalCompany, CompanyEnrichment, HiringIntentScoreHistory, LinkedInJob],
  migrations: [path.resolve(process.cwd(), "migrations/*.{ts,js}")],
});