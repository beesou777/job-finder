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
      synchronize: true, // Set to false in production
      logging: false,
      entities: [Job, User, Category],
      migrations: [],
      subscribers: [],
    });
  } catch (error) {
    // Fallback to using URL directly if parsing fails
    return new DataSource({
      type: "postgres",
      url: dbUrl,
      synchronize: true,
      logging: false,
      entities: [Job, User, Category],
      migrations: [],
      subscribers: [],
    });
  }
}

export async function getDataSource() {
  if (!appDataSource) {
    appDataSource = createDataSource();
    await appDataSource.initialize();
    console.log("✅ Database connection initialized");
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

