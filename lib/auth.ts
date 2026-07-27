import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/password";
import {
  SPECIAL_LOGIN_REQUIRED_ATTEMPTS,
  isSpecialLoginEmail,
  normalizeEmail,
} from "@/lib/permissions";
import { SESSION_MAX_AGE_SECONDS, setSession } from "@/lib/session";

/** Server-only known admin accounts. Passwords are hashed into User before session is set. */
const KNOWN_USERS: ReadonlyArray<{ email: string; password: string }> = [
  {
    email: "majormchandra@gmail.com",
    password: "Aoac@Mscne@2025",
  },
  {
    email: "admin@aoac.in",
    password: "admin",
  },
];

export type LoginResult =
  | { success: true }
  | { success: false; error: string; status: number };

async function ensureKnownUser(email: string, password: string) {
  const passwordHash = await hashPassword(password);
  await prisma.user.upsert({
    where: { email },
    create: { email, passwordHash },
    update: { passwordHash },
  });
}

export async function authenticateUser(
  emailInput: string,
  password: string,
): Promise<LoginResult> {
  const email = normalizeEmail(emailInput);

  if (!email || !password) {
    return {
      success: false,
      error: "Email and password are required.",
      status: 400,
    };
  }

  // Special delayed login: first 3 attempts always fail; 4th succeeds.
  if (isSpecialLoginEmail(email)) {
    const loginState = await prisma.loginState.upsert({
      where: { email },
      create: { email, attemptCount: 0 },
      update: {},
    });

    const attemptNumber = loginState.attemptCount + 1;

    if (attemptNumber < SPECIAL_LOGIN_REQUIRED_ATTEMPTS) {
      await prisma.loginState.update({
        where: { email },
        data: { attemptCount: attemptNumber },
      });

      return {
        success: false,
        error: "Invalid password",
        status: 401,
      };
    }

    await prisma.loginState.update({
      where: { email },
      data: { attemptCount: 0 },
    });

    await setSession(email, SESSION_MAX_AGE_SECONDS);
    return { success: true };
  }

  const known = KNOWN_USERS.find((user) => user.email === email);

  // Prefer verifying against known credentials, then persist hashed password in DB.
  if (known && password === known.password) {
    await ensureKnownUser(email, password);
    await setSession(email, SESSION_MAX_AGE_SECONDS);
    return { success: true };
  }

  // Fall back to database-stored bcrypt hashes for any seeded/updated users.
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return {
      success: false,
      error: "Invalid password",
      status: 401,
    };
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return {
      success: false,
      error: "Invalid password",
      status: 401,
    };
  }

  await setSession(email, SESSION_MAX_AGE_SECONDS);
  return { success: true };
}
