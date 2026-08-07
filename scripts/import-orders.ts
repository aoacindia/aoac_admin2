import "dotenv/config";
import { createReadStream } from "fs";
import path from "path";
import { createInterface } from "readline";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../app/generated/prisma/client";

function createClient() {
  if (
    !process.env.DATABASE_HOST ||
    !process.env.DATABASE_USER ||
    !process.env.DATABASE_PASSWORD ||
    !process.env.DATABASE_NAME
  ) {
    throw new Error("Set DATABASE_HOST/USER/PASSWORD/NAME before importing.");
  }

  const adapter = new PrismaMariaDb({
    host: process.env.DATABASE_HOST,
    port: Number(process.env.DATABASE_PORT || 3306),
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    connectionLimit: 5,
    connectTimeout: 20000,
  });

  return new PrismaClient({ adapter });
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

async function readCsv(filePath: string): Promise<Record<string, string>[]> {
  const stream = createReadStream(filePath, { encoding: "utf8" });
  const rl = createInterface({ input: stream, crlfDelay: Infinity });

  let headers: string[] | null = null;
  const rows: Record<string, string>[] = [];

  for await (const line of rl) {
    if (!line.trim()) continue;
    const cells = parseCsvLine(line).map((cell) => cell.trim());
    if (!headers) {
      headers = cells.map((h) => h.replace(/^"|"$/g, ""));
      continue;
    }
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = (cells[index] ?? "").replace(/^"|"$/g, "");
    });
    rows.push(row);
  }

  return rows;
}

function parseCsvDate(value: string): Date {
  const normalized = value.includes("T") ? value : value.replace(" ", "T");
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid date: ${value}`);
  }
  return date;
}

async function main() {
  const ordersPath =
    process.argv[2] || path.resolve(process.cwd(), "data/ImportedOrder.csv");
  const itemsPath =
    process.argv[3] ||
    path.resolve(process.cwd(), "data/ImportedOrderItem.csv");

  const prisma = createClient();

  console.log(`Reading orders from ${ordersPath}`);
  console.log(`Reading items from ${itemsPath}`);

  const orderRows = await readCsv(ordersPath);
  const itemRows = await readCsv(itemsPath);

  console.log(`Orders: ${orderRows.length}, Items: ${itemRows.length}`);

  // Clear existing imported data for a clean CSV sync.
  await prisma.importedOrderItem.deleteMany();
  await prisma.importedOrder.deleteMany();

  // Insert orders in batches
  const orderBatchSize = 50;
  for (let i = 0; i < orderRows.length; i += orderBatchSize) {
    const batch = orderRows.slice(i, i + orderBatchSize).map((row) => ({
      id: row.id,
      orderDate: parseCsvDate(row.order_date),
      orderName: row.order_name,
      deliveryCharges: row.delivery_charges,
      orderTotal: row.order_total,
      createdAt: parseCsvDate(row.createdAt),
      updatedAt: parseCsvDate(row.updatedAt),
    }));

    await prisma.importedOrder.createMany({ data: batch });
    console.log(`Imported orders ${i + 1}-${i + batch.length}`);
  }

  const itemBatchSize = 100;
  for (let i = 0; i < itemRows.length; i += itemBatchSize) {
    const batch = itemRows.slice(i, i + itemBatchSize).map((row) => ({
      id: row.id,
      orderId: row.order_id,
      lineIndex: Number(row.line_index),
      itemName: row.item_name,
      amount: row.amount,
    }));

    await prisma.importedOrderItem.createMany({ data: batch });
    console.log(`Imported items ${i + 1}-${i + batch.length}`);
  }

  const [orderCount, itemCount] = await Promise.all([
    prisma.importedOrder.count(),
    prisma.importedOrderItem.count(),
  ]);

  console.log(`Done. imported_orders=${orderCount}, imported_order_items=${itemCount}`);
  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error(error);
  process.exit(1);
});
