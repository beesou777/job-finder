import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// Validate configuration - log warning but don't throw to allow app to start
if (!process.env.NEXTAUTH_SECRET) {
  console.error(
    "❌ NEXTAUTH_SECRET is not set. Please add it to your environment variables."
  );
}

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

