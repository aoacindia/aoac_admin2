import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@/app/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function parseDatabaseUrl(databaseUrl: string) {
  // Prefer discrete env vars so passwords with @ / : never break URL parsing.
  if (
    process.env.DATABASE_HOST &&
    process.env.DATABASE_USER &&
    process.env.DATABASE_PASSWORD &&
    process.env.DATABASE_NAME
  ) {
    return {
      host: process.env.DATABASE_HOST,
      port: Number(process.env.DATABASE_PORT || 3306),
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      connectionLimit: 5,
      connectTimeout: 20000,
      acquireTimeout: 20000,
    };
  }

  // Recover passwords that contain unencoded "@" by taking everything
  // between the first ":" after the scheme and the last "@" before the host.
  const match = databaseUrl.match(
    /^(?:mysql|mariadb):\/\/([^:]+):(.+)@([^:/]+)(?::(\d+))?\/([^?]+)/i,
  );

  if (!match) {
    throw new Error(
      "Invalid DATABASE_URL. Use mysql://user:password@host:port/db or set DATABASE_HOST/USER/PASSWORD/NAME.",
    );
  }

  const [, user, password, host, port, database] = match;

  return {
    host,
    port: Number(port || 3306),
    user: decodeURIComponent(user),
    password: decodeURIComponent(password),
    database: decodeURIComponent(database),
    connectionLimit: 5,
    connectTimeout: 20000,
    acquireTimeout: 20000,
  };
}

function createPrismaClient() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl && !process.env.DATABASE_HOST) {
    throw new Error("DATABASE_URL is not set");
  }

  const config = parseDatabaseUrl(databaseUrl || "");
  const adapter = new PrismaMariaDb(config);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
