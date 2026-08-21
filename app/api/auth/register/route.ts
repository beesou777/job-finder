import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { getDataSource } from "@/lib/db";
import { User } from "@/server/db/entities/User";
import nodemailer from "nodemailer";

export async function POST(request: NextRequest) {
  try {
    const { email, password }: any = await request.json();

    if (!email || !password || password.length < 8) {
      return NextResponse.json(
        { success: false, error: "Email and password required" },
        { status: 400 },
      );
    }

    const dataSource = await getDataSource();
    const userRepository = dataSource.getRepository(User);

    // Check if user exists
    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await userRepository.findOne({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json({ success: false, error: "User already exists" }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await hash(password, 10);

    // Create user
    const user = userRepository.create({
      email: normalizedEmail,
      password: hashedPassword,
      role: "user",
    });

    await userRepository.save(user);

    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT || 587),
          secure: process.env.SMTP_SECURE === "true",
          auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
        });
        await transporter.sendMail({
          from: process.env.SMTP_FROM || process.env.SMTP_USER,
          to: user.email,
          subject: "Welcome to KamKhoj",
          text: "Your KamKhoj account is ready. Set your preferences to get better job matches.",
        });
      } catch (emailError) {
        console.error("Welcome email could not be sent:", emailError);
      }
    }

    return NextResponse.json({
      success: true,
      message: "User created successfully",
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          process.env.NODE_ENV === "development" && error instanceof Error
            ? error.message
            : "Failed to register user",
      },
      { status: 500 },
    );
  }
}
