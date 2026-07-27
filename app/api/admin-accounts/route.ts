import { NextResponse } from "next/server";
import { DEMO_ADMIN_ACCOUNTS } from "@/lib/admin-accounts";
import { normalizeEmail } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const hidden = await prisma.hiddenAdminAccount.findMany({
      select: { email: true },
    });
    const hiddenSet = new Set(
      hidden.map((row) => normalizeEmail(row.email)),
    );

    const accounts = DEMO_ADMIN_ACCOUNTS.filter(
      (account) => !hiddenSet.has(normalizeEmail(account.email)),
    );

    return NextResponse.json({ accounts });
  } catch (error) {
    console.error("Admin accounts list error:", error);
    return NextResponse.json(
      { error: "Failed to load admin accounts." },
      { status: 500 },
    );
  }
}
