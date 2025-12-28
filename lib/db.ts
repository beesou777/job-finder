import "reflect-metadata";
import { DataSource } from "typeorm";
import { Job } from "@/entities/Job";
import { User } from "@/entities/User";
import { Category } from "@/entities/Category";

let appDataSource: DataSource | null = null;

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
      synchronize: true,
      logging: true,
      entities: [Job, User, Category],
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
      entities: [Job, User, Category],
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
  if (!appDataSource) {
    appDataSource = createDataSource();
    try {
      if (!appDataSource.isInitialized) {
        await appDataSource.initialize();
        console.log("✅ Database connection initialized");
        
        // In production, check if tables exist and log warning if synchronize is disabled
        if (process.env.NODE_ENV === "production") {
          try {
            const queryRunner = appDataSource.createQueryRunner();
            const tables = await queryRunner.getTables();
            console.log(`📊 Database has ${tables.length} tables`);
            
            // Check if required tables exist
            const requiredTables = ['jobs', 'user', 'category'];
            const existingTableNames = tables.map(t => t.name.toLowerCase());
            const missingTables = requiredTables.filter(
              req => !existingTableNames.includes(req)
            );
            
            if (missingTables.length > 0) {
              console.warn(`⚠️  Missing tables: ${missingTables.join(', ')}`);
              console.warn(`⚠️  Database schema may not be initialized. Consider running migrations or enabling synchronize temporarily.`);
            }
            await queryRunner.release();
          } catch (checkError) {
            console.warn("⚠️  Could not check database schema:", checkError);
          }
        }
      }
    } catch (error: any) {
      console.error("❌ Database connection failed:", error?.message || error);
      console.error("Full error:", error);
      // Reset datasource on error to allow retry
      appDataSource = null;
      throw error;
    }
  }
  return appDataSource;
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

