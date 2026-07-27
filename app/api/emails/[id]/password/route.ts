import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { canManageEmailAccounts } from "@/lib/permissions";
import { hashPassword } from "@/lib/password";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!canManageEmailAccounts(session.email)) {
    return NextResponse.json(
      { error: "You are not authorized to open this page." },
      { status: 403 },
    );
  }

  const { id } = await context.params;
  const emailId = Number(id);

  if (!Number.isInteger(emailId) || emailId <= 0) {
    return NextResponse.json({ error: "Invalid email id." }, { status: 400 });
  }

  try {
    const body = await request.json();
    const password =
      typeof body.password === "string" ? body.password : "";
    const confirmPassword =
      typeof body.confirmPassword === "string" ? body.confirmPassword : "";

    if (!password || password.length < 4) {
      return NextResponse.json(
        { error: "Password must be at least 4 characters." },
        { status: 400 },
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match." },
        { status: 400 },
      );
    }

    const existing = await prisma.emailAccount.findUnique({
      where: { id: emailId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Email account not found." },
        { status: 404 },
      );
    }

    const passwordHash = await hashPassword(password);
    await prisma.emailAccount.update({
      where: { id: emailId },
      data: { passwordHash },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json(
      { error: "Failed to change password." },
      { status: 500 },
    );
  }
}
