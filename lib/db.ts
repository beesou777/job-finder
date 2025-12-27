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
      synchronize: process.env.NODE_ENV !== "production", // Disable in production
      logging: false,
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
      synchronize: process.env.NODE_ENV !== "production",
      logging: false,
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
      }
    } catch (error) {
      console.error("❌ Database connection failed:", error);
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

