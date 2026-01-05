import "reflect-metadata";
import { DataSource } from "typeorm";
import { Job } from "@/entities/Job";
import { User } from "@/entities/User";
import { Category } from "@/entities/Category";
import { DailyJobStats } from "@/entities/DailyJobStats";
import { DailySourceStats } from "@/entities/DailySourceStats";
import { CanonicalLocation } from "@/entities/CanonicalLocation";
import { CanonicalCompany } from "@/entities/CanonicalCompany";
import { CompanyEnrichment } from "@/entities/CompanyEnrichment";
import { HiringIntentScoreHistory } from "@/entities/HiringIntentScoreHistory";

let appDataSource: DataSource | null = null;
let initializationPromise: Promise<DataSource> | null = null;

const ALL_ENTITIES = [
  Job,
  User,
  Category,
  DailyJobStats,
  DailySourceStats,
  CanonicalLocation,
  CanonicalCompany,
  CompanyEnrichment,
  HiringIntentScoreHistory
];

function createDataSource(): DataSource {
  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  // Allow temporary sync override for initial setup (use with caution!)
  const shouldSynchronize =
    process.env.DATABASE_SYNC === "true" ||
    (process.env.NODE_ENV !== "production" && process.env.DATABASE_SYNC !== "false");

  // Try to parse the URL into individual components for better password handling
  try {
    const url = new URL(dbUrl);
    return new DataSource({
      type: "postgres",
      host: url.hostname,
      port: parseInt(url.port) || 5432,
      username: url.username,
      password: url.password || "", // Ensure it's a string
      database: url.pathname.slice(1), // Remove leading slash
      synchronize: false,
      logging: process.env.NODE_ENV === "development",
      migrationsRun: false,
      entities: ALL_ENTITIES,
      migrations: [],
      subscribers: [],
      extra: {
        // Connection pool settings for serverless
        max: 1, // Limit connections for serverless
        connectionTimeoutMillis: 10000,
        idleTimeoutMillis: 30000,
      },
    });
  } catch (error) {
    // Fallback to using URL directly if parsing fails
    return new DataSource({
      type: "postgres",
      url: dbUrl,
      synchronize: shouldSynchronize,
      logging: process.env.NODE_ENV === "development",
      entities: ALL_ENTITIES,
      migrations: [],
      subscribers: [],
      extra: {
        // Connection pool settings for serverless
        max: 1, // Limit connections for serverless
        connectionTimeoutMillis: 10000,
        idleTimeoutMillis: 30000,
      },
    });
  }
}

export async function getDataSource() {
  if (appDataSource?.isInitialized) {
    return appDataSource;
  }

  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = (async () => {
    try {
      if (!appDataSource) {
        appDataSource = createDataSource();
      }

      if (!appDataSource.isInitialized) {
        await appDataSource.initialize();
        console.log("✅ Database connection initialized");

        // In production, check if tables exist
        if (process.env.NODE_ENV === "production" && !process.env.NEXT_PHASE) {
          try {
            const queryRunner = appDataSource.createQueryRunner();
            const tableNames = await queryRunner.query(`
              SELECT table_name 
              FROM information_schema.tables 
              WHERE table_schema = 'public' 
              AND table_type = 'BASE TABLE'
            `);
            const tables = tableNames.map((row: any) => row.table_name);
            console.log(`📊 Database has ${tables.length} tables`);

            // Check if required tables exist (updated to match actual entity names)
            const requiredTables = ['jobs', 'users', 'categories'];
            const existingTableNames = tables.map((t: string) => t.toLowerCase());
            const missingTables = requiredTables.filter(
              req => !existingTableNames.includes(req)
            );

            if (missingTables.length > 0) {
              console.warn(`⚠️  Missing tables: ${missingTables.join(', ')}`);
            }
            await queryRunner.release();
          } catch (checkError) {
            // Silently ignore schema check errors
          }
        }
      }
      return appDataSource;
    } catch (error: any) {
      console.error("❌ Database connection failed:", error?.message || error);
      initializationPromise = null; // Allow retry
      appDataSource = null;
      throw error;
    }
  })();

  return initializationPromise;
}

// Export for compatibility (lazy initialization)
export const AppDataSource = {
  get initialized() {
    return appDataSource?.isInitialized || false;
  },
  async initialize() {
    return getDataSource();
  }
} as any;

