import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { canDeleteEmailAccounts } from "@/lib/permissions";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!canDeleteEmailAccounts(session.email)) {
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
    const existing = await prisma.emailAccount.findUnique({
      where: { id: emailId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Email account not found." },
        { status: 404 },
      );
    }

    await prisma.emailAccount.delete({ where: { id: emailId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete email error:", error);
    return NextResponse.json(
      { error: "Failed to delete email account." },
      { status: 500 },
    );
  }
}
