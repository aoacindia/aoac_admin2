import { NextResponse } from "next/server";
import { DEMO_DOMAINS } from "@/lib/domains";
import { normalizeEmail } from "@/lib/permissions";
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

  const { id } = await context.params;
  const domain = DEMO_DOMAINS.find((item) => item.id === id);

  if (!domain) {
    return NextResponse.json({ error: "Domain not found." }, { status: 404 });
  }

  try {
    await prisma.hiddenDomain.upsert({
      where: { domainId: id },
      create: {
        domainId: id,
        hiddenBy: normalizeEmail(session.email),
      },
      update: {
        hiddenBy: normalizeEmail(session.email),
        hiddenAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Hide domain error:", error);
    return NextResponse.json(
      { error: "Failed to remove domain." },
      { status: 500 },
    );
  }
}
