import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const orders = await prisma.order.findMany({
      orderBy: { orderDate: "desc" },
      include: {
        items: {
          orderBy: { id: "asc" },
        },
      },
    });

    const serialized = orders.map((order) => ({
      id: order.id,
      orderBy: order.orderBy,
      orderDate: order.orderDate.toISOString(),
      deliveryCharges: order.deliveryCharges.toString(),
      totalAmount: order.totalAmount.toString(),
      items: order.items.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price.toString(),
      })),
    }));

    return NextResponse.json({ orders: serialized });
  } catch (error) {
    console.error("Orders fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders." },
      { status: 500 },
    );
  }
}
