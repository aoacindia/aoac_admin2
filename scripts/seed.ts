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
  { emailAddress: "mchandra@aoac.in", password: "demo-pass", storageUsed: "234 MB" },
  { emailAddress: "teruomiura@aoac.in", password: "demo-pass", storageUsed: "198 MB" },
  { emailAddress: "aoac@aoac.in", password: "demo-pass", storageUsed: "128 MB" },
] as const;

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

  const orderCount = await prisma.order.count();
  if (orderCount === 0) {
    await prisma.order.create({
      data: {
        orderBy: "AOAC Demo Customer",
        orderDate: new Date("2026-07-01T10:00:00.000Z"),
        deliveryCharges: "50.00",
        totalAmount: "350.00",
        items: {
          create: [
            { name: "AOAC Training Kit", quantity: 1, price: "200.00" },
            { name: "Lab Manual", quantity: 2, price: "50.00" },
          ],
        },
      },
    });
    console.log("Created sample order");
  }

  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error(error);
  process.exit(1);
});
