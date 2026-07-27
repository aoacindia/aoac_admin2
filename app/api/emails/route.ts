import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import {
  canCreateEmailAccounts,
  getDefaultStorageUsed,
  normalizeEmail,
} from "@/lib/permissions";
import { hashPassword } from "@/lib/password";

function toPublicEmail(account: {
  id: number;
  emailAddress: string;
  status: string;
  isSuspended: boolean;
  storageUsed: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: account.id,
    emailAddress: account.emailAddress,
    status: account.status,
    isSuspended: account.isSuspended,
    storageUsed: account.storageUsed,
    createdAt: account.createdAt.toISOString(),
    updatedAt: account.updatedAt.toISOString(),
  };
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const accounts = await prisma.emailAccount.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        emailAddress: true,
        status: true,
        isSuspended: true,
        storageUsed: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ emails: accounts.map(toPublicEmail) });
  } catch (error) {
    console.error("Email list error:", error);
    return NextResponse.json(
      { error: "Failed to fetch emails." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!canCreateEmailAccounts(session.email)) {
    return NextResponse.json(
      { error: "You are not authorized to open this page." },
      { status: 403 },
    );
  }

  try {
    const body = await request.json();
    const emailAddress =
      typeof body.emailAddress === "string"
        ? normalizeEmail(body.emailAddress)
        : "";
    const password =
      typeof body.password === "string" ? body.password : "";

    if (!emailAddress || !emailAddress.includes("@")) {
      return NextResponse.json(
        { error: "A valid email address is required." },
        { status: 400 },
      );
    }

    if (!password || password.length < 4) {
      return NextResponse.json(
        { error: "Password must be at least 4 characters." },
        { status: 400 },
      );
    }

    const existing = await prisma.emailAccount.findUnique({
      where: { emailAddress },
    });

    if (existing) {
      return NextResponse.json(
        { error: "An email account with this address already exists." },
        { status: 409 },
      );
    }

    const passwordHash = await hashPassword(password);
    const account = await prisma.emailAccount.create({
      data: {
        emailAddress,
        passwordHash,
        status: "active",
        isSuspended: false,
        storageUsed: getDefaultStorageUsed(emailAddress),
      },
      select: {
        id: true,
        emailAddress: true,
        status: true,
        isSuspended: true,
        storageUsed: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(
      { email: toPublicEmail(account) },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create email error:", error);
    return NextResponse.json(
      { error: "Failed to create email account." },
      { status: 500 },
    );
  }
}
