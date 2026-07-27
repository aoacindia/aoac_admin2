import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const forwards = await prisma.emailForward.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        fromAccount: {
          select: { emailAddress: true },
        },
      },
    });

    return NextResponse.json({
      forwards: forwards.map((forward) => ({
        id: forward.id,
        fromAddress: forward.fromAccount.emailAddress,
        toAddress: forward.toAddress,
        isActive: forward.isActive,
        createdAt: forward.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Forwards fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch forwards." },
      { status: 500 },
    );
  }
}
