import { randomBytes } from "crypto";

export function createEntityId(prefix = "cmn"): string {
  return `${prefix}${Date.now().toString(36)}${randomBytes(6).toString("hex")}`;
}

export function serializeImportedOrder(order: {
  id: string;
  orderDate: Date;
  orderName: string;
  deliveryCharges: { toString(): string };
  orderTotal: { toString(): string };
  createdAt: Date;
  updatedAt: Date;
  items: Array<{
    id: string;
    orderId: string;
    lineIndex: number;
    itemName: string;
    amount: { toString(): string };
  }>;
}) {
  const items = [...order.items].sort((a, b) => a.lineIndex - b.lineIndex);

  return {
    id: order.id,
    order_date: order.orderDate.toISOString(),
    order_name: order.orderName,
    delivery_charges: order.deliveryCharges.toString(),
    order_total: order.orderTotal.toString(),
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    item_count: items.length,
    items: items.map((item) => ({
      id: item.id,
      order_id: item.orderId,
      line_index: item.lineIndex,
      item_name: item.itemName,
      amount: item.amount.toString(),
    })),
  };
}

export function parseDecimal(value: unknown, fieldName: string): string {
  const raw = typeof value === "number" ? value.toString() : String(value ?? "").trim();
  if (!raw || Number.isNaN(Number(raw))) {
    throw new Error(`${fieldName} must be a valid number.`);
  }
  return Number(raw).toFixed(2);
}

export function parseOrderDate(value: unknown): Date {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }

  const raw = String(value ?? "").trim();
  if (!raw) {
    throw new Error("order_date is required.");
  }

  // Accept CSV-style "YYYY-MM-DD HH:mm:ss.SSS" and ISO strings.
  const normalized = raw.includes("T") ? raw : raw.replace(" ", "T");
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) {
    throw new Error("order_date is invalid.");
  }
  return date;
}
