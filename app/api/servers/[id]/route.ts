import { NextResponse } from "next/server";
import { DEMO_SERVERS, type ServerStatus } from "@/lib/servers";
import { normalizeEmail } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const server = DEMO_SERVERS.find((item) => item.id === id);

  if (!server) {
    return NextResponse.json({ error: "Server not found." }, { status: 404 });
  }

  try {
    const body = await request.json();
    const status = body.status as ServerStatus;

    if (status !== "Running" && status !== "Stopped") {
      return NextResponse.json(
        { error: "Status must be Running or Stopped." },
        { status: 400 },
      );
    }

    await prisma.demoServerState.upsert({
      where: { serverId: id },
      create: {
        serverId: id,
        status,
        updatedBy: normalizeEmail(session.email),
      },
      update: {
        status,
        updatedBy: normalizeEmail(session.email),
      },
    });

    return NextResponse.json({
      server: {
        ...server,
        status,
      },
    });
  } catch (error) {
    console.error("Server status update error:", error);
    return NextResponse.json(
      { error: "Failed to update server status." },
      { status: 500 },
    );
  }
}
