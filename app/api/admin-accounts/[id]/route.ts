import { NextResponse } from "next/server";
import { DEMO_ADMIN_ACCOUNTS } from "@/lib/admin-accounts";
import {
  canDeleteAdminAccounts,
  normalizeEmail,
} from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!canDeleteAdminAccounts(session.email)) {
    return NextResponse.json(
      { error: "You are not authorized to delete admin accounts." },
      { status: 403 },
    );
  }

  const { id } = await context.params;
  const account = DEMO_ADMIN_ACCOUNTS.find((item) => item.id === id);

  if (!account) {
    return NextResponse.json(
      { error: "Admin account not found." },
      { status: 404 },
    );
  }

  try {
    await prisma.hiddenAdminAccount.upsert({
      where: { email: normalizeEmail(account.email) },
      create: {
        email: normalizeEmail(account.email),
        hiddenBy: normalizeEmail(session.email),
      },
      update: {
        hiddenBy: normalizeEmail(session.email),
        hiddenAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Hide admin account error:", error);
    return NextResponse.json(
      { error: "Failed to delete admin account." },
      { status: 500 },
    );
  }
}
