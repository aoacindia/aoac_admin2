import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { canManageEmailAccounts } from "@/lib/permissions";

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
    const suspend = Boolean(body.suspend);

    const existing = await prisma.emailAccount.findUnique({
      where: { id: emailId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Email account not found." },
        { status: 404 },
      );
    }

    const account = await prisma.emailAccount.update({
      where: { id: emailId },
      data: {
        isSuspended: suspend,
        status: suspend ? "suspended" : "active",
      },
      select: {
        id: true,
        emailAddress: true,
        status: true,
        isSuspended: true,
        storageUsed: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      email: {
        ...account,
        createdAt: account.createdAt.toISOString(),
        updatedAt: account.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Suspend email error:", error);
    return NextResponse.json(
      { error: "Failed to update email account status." },
      { status: 500 },
    );
  }
}
