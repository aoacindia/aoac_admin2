import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../app/generated/prisma/client";
import bcrypt from "bcryptjs";

function createClient() {
  if (
    process.env.DATABASE_HOST &&
    process.env.DATABASE_USER &&
    process.env.DATABASE_PASSWORD &&
    process.env.DATABASE_NAME
  ) {
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

  throw new Error("Set DATABASE_HOST/USER/PASSWORD/NAME before seeding.");
}

const USERS = [
  {
    email: "majormchandra@gmail.com",
    password: "Aoac@Mscne@2025",
  },
  {
    email: "admin@aoac.in",
    password: "admin",
  },
] as const;

const DEMO_EMAILS = [
  {
    emailAddress: "mchandra@aoac.in",
    password: "demo-pass",
    storageUsed: "234 MB",
  },
  {
    emailAddress: "teruomiura@aoac.in",
    password: "demo-pass",
    storageUsed: "198 MB",
  },
  {
    emailAddress: "aoac@aoac.in",
    password: "demo-pass",
    storageUsed: "128 MB",
  },
] as const;

type SeedOrderItem = {
  id: string;
  itemName: string;
  amount: string;
};

type SeedOrder = {
  id: string;
  orderName: string;
  date: string;
  deliveryCharges: string;
  items: SeedOrderItem[];
};

const HISTORICAL_ORDERS: SeedOrder[] = [
  {
    id: "cmnseedord20260501aoac01",
    orderName: "ORD-0501",
    date: "2026-05-01",
    deliveryCharges: "80.00",
    items: [
      {
        id: "cmnseeditm20260501aoac01",
        itemName: "Brown Rice 2kg",
        amount: "450.00",
      },
      {
        id: "cmnseeditm20260501aoac02",
        itemName: "Brown Rice 1kg",
        amount: "240.00",
      },
      {
        id: "cmnseeditm20260501aoac03",
        itemName: "Soy Sauce",
        amount: "180.00",
      },
    ],
  },
  {
    id: "cmnseedord20260508aoac02",
    orderName: "ORD-0508",
    date: "2026-05-08",
    deliveryCharges: "120.00",
    items: [
      {
        id: "cmnseeditm20260508aoac01",
        itemName: "Japanese Sushi Rice",
        amount: "520.00",
      },
      {
        id: "cmnseeditm20260508aoac02",
        itemName: "Miso Paste",
        amount: "350.00",
      },
      {
        id: "cmnseeditm20260508aoac03",
        itemName: "Soy Sauce",
        amount: "180.00",
      },
      {
        id: "cmnseeditm20260508aoac04",
        itemName: "Lemon Squash",
        amount: "220.00",
      },
    ],
  },
  {
    id: "cmnseedord20260513aoac03",
    orderName: "ORD-0513",
    date: "2026-05-13",
    deliveryCharges: "100.00",
    items: [
      {
        id: "cmnseeditm20260513aoac01",
        itemName: "Brown Rice 2kg",
        amount: "450.00",
      },
      {
        id: "cmnseeditm20260513aoac02",
        itemName: "Japanese Sushi Rice",
        amount: "520.00",
      },
      {
        id: "cmnseeditm20260513aoac03",
        itemName: "Moringa Powder",
        amount: "680.00",
      },
      {
        id: "cmnseeditm20260513aoac04",
        itemName: "Lemon Squash",
        amount: "220.00",
      },
    ],
  },
];

function sumAmounts(items: SeedOrderItem[], deliveryCharges: string): string {
  const total =
    items.reduce((sum, item) => sum + Number(item.amount), 0) +
    Number(deliveryCharges);
  return total.toFixed(2);
}

async function seedHistoricalImportedOrders(prisma: PrismaClient) {
  for (const order of HISTORICAL_ORDERS) {
    const timestamp = new Date(`${order.date}T18:30:00.000Z`);
    const orderTotal = sumAmounts(order.items, order.deliveryCharges);

    await prisma.importedOrder.upsert({
      where: { id: order.id },
      create: {
        id: order.id,
        orderName: order.orderName,
        orderDate: timestamp,
        deliveryCharges: order.deliveryCharges,
        orderTotal,
        createdAt: timestamp,
        updatedAt: timestamp,
        items: {
          create: order.items.map((item, index) => ({
            id: item.id,
            lineIndex: index,
            itemName: item.itemName,
            amount: item.amount,
          })),
        },
      },
      update: {
        orderName: order.orderName,
        orderDate: timestamp,
        deliveryCharges: order.deliveryCharges,
        orderTotal,
        createdAt: timestamp,
        updatedAt: timestamp,
        items: {
          deleteMany: {},
          create: order.items.map((item, index) => ({
            id: item.id,
            lineIndex: index,
            itemName: item.itemName,
            amount: item.amount,
          })),
        },
      },
    });

    console.log(
      `Upserted historical order ${order.orderName} (${order.date}) total=${orderTotal}`,
    );
  }
}

async function main() {
  const prisma = createClient();

  for (const user of USERS) {
    const passwordHash = await bcrypt.hash(user.password, 12);
    await prisma.user.upsert({
      where: { email: user.email },
      create: { email: user.email, passwordHash },
      update: { passwordHash },
    });
    console.log(`Upserted user ${user.email}`);
  }

  for (const account of DEMO_EMAILS) {
    const passwordHash = await bcrypt.hash(account.password, 12);
    await prisma.emailAccount.upsert({
      where: { emailAddress: account.emailAddress },
      create: {
        emailAddress: account.emailAddress,
        passwordHash,
        storageUsed: account.storageUsed,
        status: "active",
        isSuspended: false,
      },
      update: {
        storageUsed: account.storageUsed,
      },
    });
    console.log(`Upserted email ${account.emailAddress}`);
  }

  await seedHistoricalImportedOrders(prisma);

  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error(error);
  process.exit(1);
});
