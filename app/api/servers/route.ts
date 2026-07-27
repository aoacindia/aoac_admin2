import { NextResponse } from "next/server";
import { DEMO_SERVERS, type ServerStatus } from "@/lib/servers";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const states = await prisma.demoServerState.findMany();
    const stateMap = new Map(states.map((row) => [row.serverId, row.status]));

    const servers = DEMO_SERVERS.map((server) => ({
      ...server,
      status: (stateMap.get(server.id) as ServerStatus | undefined) ?? server.status,
    }));

    return NextResponse.json({ servers });
  } catch (error) {
    console.error("Servers list error:", error);
    return NextResponse.json(
      { error: "Failed to load servers." },
      { status: 500 },
    );
  }
}
