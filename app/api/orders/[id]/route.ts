import { NextResponse } from "next/server";
import {
  createEntityId,
  parseDecimal,
  parseOrderDate,
  serializeImportedOrder,
} from "@/lib/imported-orders";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const order = await prisma.importedOrder.findUnique({
      where: { id },
      include: {
        items: { orderBy: { lineIndex: "asc" } },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    return NextResponse.json({ order: serializeImportedOrder(order) });
  } catch (error) {
    console.error("Get imported order error:", error);
    return NextResponse.json(
      { error: "Failed to fetch order." },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request, context: RouteContext) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const existing = await prisma.importedOrder.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    const body = await request.json();
    const orderName =
      typeof body.order_name === "string"
        ? body.order_name.trim()
        : existing.orderName;

    if (!orderName) {
      return NextResponse.json(
        { error: "order_name is required." },
        { status: 400 },
      );
    }

    // Only update order_date when the client explicitly provides it.
    // Never overwrite order_date with "now" or updatedAt.
    const orderDate =
      body.order_date !== undefined && body.order_date !== null
        ? parseOrderDate(body.order_date)
        : existing.orderDate;

    const deliveryCharges = parseDecimal(
      body.delivery_charges ?? existing.deliveryCharges.toString(),
      "delivery_charges",
    );
    const orderTotal = parseDecimal(
      body.order_total ?? existing.orderTotal.toString(),
      "order_total",
    );

    const itemsInput = Array.isArray(body.items) ? body.items : null;

    const order = await prisma.$transaction(async (tx) => {
      await tx.importedOrder.update({
        where: { id },
        data: {
          orderName,
          orderDate,
          deliveryCharges,
          orderTotal,
          // updatedAt is handled automatically by Prisma @updatedAt
        },
      });

      if (itemsInput) {
        await tx.importedOrderItem.deleteMany({ where: { orderId: id } });

        const items = itemsInput.map(
          (
            item: {
              id?: string;
              item_name?: string;
              amount?: string | number;
              line_index?: number;
            },
            index: number,
          ) => {
            const itemName =
              typeof item.item_name === "string" ? item.item_name.trim() : "";
            if (!itemName) {
              throw new Error(`Item #${index + 1} is missing item_name.`);
            }
            return {
              id:
                typeof item.id === "string" && item.id.trim()
                  ? item.id.trim()
                  : createEntityId(),
              orderId: id,
              lineIndex:
                typeof item.line_index === "number" ? item.line_index : index,
              itemName,
              amount: parseDecimal(item.amount ?? "0", "amount"),
            };
          },
        );

        if (items.length > 0) {
          await tx.importedOrderItem.createMany({ data: items });
        }
      }

      return tx.importedOrder.findUniqueOrThrow({
        where: { id },
        include: {
          items: { orderBy: { lineIndex: "asc" } },
        },
      });
    });

    return NextResponse.json({ order: serializeImportedOrder(order) });
  } catch (error) {
    console.error("Update imported order error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to update order.",
      },
      { status: 400 },
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const existing = await prisma.importedOrder.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    // Cascades to imported_order_items via FK.
    await prisma.importedOrder.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete imported order error:", error);
    return NextResponse.json(
      { error: "Failed to delete order." },
      { status: 500 },
    );
  }
}
