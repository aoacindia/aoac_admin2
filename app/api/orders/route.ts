import { NextResponse } from "next/server";
import { Prisma } from "@/app/generated/prisma/client";
import {
  createEntityId,
  parseDecimal,
  parseOrderDate,
  serializeImportedOrder,
} from "@/lib/imported-orders";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const DEFAULT_PAGE_SIZE = 20;

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") || "").trim();
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const minTotal = searchParams.get("minTotal");
    const maxTotal = searchParams.get("maxTotal");
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const pageSize = Math.min(
      100,
      Math.max(1, Number(searchParams.get("pageSize") || DEFAULT_PAGE_SIZE)),
    );

    const where: Prisma.ImportedOrderWhereInput = {};

    if (q) {
      const asDate = new Date(q);
      const dateFilter =
        !Number.isNaN(asDate.getTime()) && q.length >= 8
          ? [{ orderDate: asDate }]
          : [];

      where.OR = [
        { orderName: { contains: q } },
        { items: { some: { itemName: { contains: q } } } },
        ...dateFilter,
      ];
    }

    if (dateFrom || dateTo) {
      where.orderDate = {};
      if (dateFrom) {
        const from = new Date(dateFrom);
        if (!Number.isNaN(from.getTime())) where.orderDate.gte = from;
      }
      if (dateTo) {
        const to = new Date(dateTo);
        if (!Number.isNaN(to.getTime())) {
          // Include the full end day if only a date was provided.
          if (/^\d{4}-\d{2}-\d{2}$/.test(dateTo)) {
            to.setHours(23, 59, 59, 999);
          }
          where.orderDate.lte = to;
        }
      }
    }

    if (minTotal || maxTotal) {
      where.orderTotal = {};
      if (minTotal) where.orderTotal.gte = minTotal;
      if (maxTotal) where.orderTotal.lte = maxTotal;
    }

    const [total, orders] = await Promise.all([
      prisma.importedOrder.count({ where }),
      prisma.importedOrder.findMany({
        where,
        include: {
          items: {
            orderBy: { lineIndex: "asc" },
          },
        },
        orderBy: { orderDate: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return NextResponse.json({
      orders: orders.map(serializeImportedOrder),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      },
    });
  } catch (error) {
    console.error("Imported orders list error:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const orderName =
      typeof body.order_name === "string" ? body.order_name.trim() : "";
    if (!orderName) {
      return NextResponse.json(
        { error: "order_name is required." },
        { status: 400 },
      );
    }

    const orderDate = parseOrderDate(body.order_date ?? new Date());
    const deliveryCharges = parseDecimal(
      body.delivery_charges ?? "0",
      "delivery_charges",
    );
    const orderTotal = parseDecimal(body.order_total ?? "0", "order_total");
    const itemsInput = Array.isArray(body.items) ? body.items : [];

    const orderId =
      typeof body.id === "string" && body.id.trim()
        ? body.id.trim()
        : createEntityId();

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
          lineIndex:
            typeof item.line_index === "number" ? item.line_index : index,
          itemName,
          amount: parseDecimal(item.amount ?? "0", "amount"),
        };
      },
    );

    const order = await prisma.importedOrder.create({
      data: {
        id: orderId,
        orderName,
        orderDate,
        deliveryCharges,
        orderTotal,
        items: {
          create: items,
        },
      },
      include: {
        items: { orderBy: { lineIndex: "asc" } },
      },
    });

    return NextResponse.json(
      { order: serializeImportedOrder(order) },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create imported order error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create order.",
      },
      { status: 400 },
    );
  }
}
