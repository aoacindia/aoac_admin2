import { NextResponse } from "next/server";
import {
  serializeImportedOrder,
} from "@/lib/imported-orders";
import { buildOrdersPdf } from "@/lib/orders-pdf";
import { canDownloadOrdersPdf } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!canDownloadOrdersPdf(session.email)) {
    return NextResponse.json(
      { error: "You are not authorized to download orders." },
      { status: 403 },
    );
  }

  try {
    const body = (await request.json()) as { orderIds?: unknown };
    const rawIds = Array.isArray(body.orderIds) ? body.orderIds : [];
    const orderIds: string[] = [];
    for (const value of rawIds) {
      if (typeof value === "string" && value.trim().length > 0) {
        orderIds.push(value.trim());
      }
    }

    if (orderIds.length === 0) {
      return NextResponse.json(
        { error: "No orders selected for download." },
        { status: 400 },
      );
    }

    // Only export the IDs currently shown on screen (one-time snapshot).
    const orders = await prisma.importedOrder.findMany({
      where: { id: { in: orderIds } },
      include: {
        items: { orderBy: { lineIndex: "asc" } },
      },
      orderBy: { orderDate: "desc" },
    });

    const serialized = [];
    for (const id of orderIds) {
      const match = orders.find((entry) => entry.id === id);
      if (match) {
        serialized.push(serializeImportedOrder(match));
      }
    }

    const pdfBytes = buildOrdersPdf(serialized);
    const filename = `orders-${new Date().toISOString().slice(0, 10)}.pdf`;

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Orders PDF export error:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF." },
      { status: 500 },
    );
  }
}
