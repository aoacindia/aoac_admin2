import { NextResponse } from "next/server";
import { DEMO_DOMAINS } from "@/lib/domains";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const hidden = await prisma.hiddenDomain.findMany({
      select: { domainId: true },
    });
    const hiddenSet = new Set(hidden.map((row) => row.domainId));

    const domains = DEMO_DOMAINS.filter((domain) => !hiddenSet.has(domain.id));

    return NextResponse.json({ domains });
  } catch (error) {
    console.error("Domains list error:", error);
    return NextResponse.json(
      { error: "Failed to load domains." },
      { status: 500 },
    );
  }
}
