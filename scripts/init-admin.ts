/**
 * Script to initialize admin user
 * Run with: npx tsx scripts/init-admin.ts
 */

import "reflect-metadata";
import { config } from "dotenv";
import { hash } from "bcryptjs";
import { getDataSource } from "../lib/db";
import { User } from "../entities/User";

// Load environment variables
config();

async function createAdminUser() {
  try {
    console.log("🔄 Connecting to database...");
    const dataSource = await getDataSource();
    const userRepository = dataSource.getRepository(User);

    const email = "admin@example.com";
    const password = "admin123";

    // Check if admin already exists
    const existingUser = await userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      console.log("⚠️  Admin user already exists!");
      process.exit(0);
    }

    // Create admin user
    const hashedPassword = await hash(password, 10);
    const admin = userRepository.create({
      email,
      password: hashedPassword,
      role: "admin",
    });

    await userRepository.save(admin);

    console.log("✅ Admin user created successfully!");
    console.log("📧 Email:", email);
    console.log("🔑 Password:", password);
    console.log("\n⚠️  Please change these credentials after first login!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating admin user:", error);
    process.exit(1);
  }
}

createAdminUser();

