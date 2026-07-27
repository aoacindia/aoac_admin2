import { cookies } from "next/headers";

export const SESSION_COOKIE = "aoac_session";
export const SESSION_MAX_AGE_SECONDS = 24 * 60 * 60;

export type SessionPayload = {
  email: string;
  expiresAt: number;
};

function encodeSession(payload: SessionPayload): string {
  // Use base64url so emails with @ / . never break parsing or get double-encoded.
  const json = JSON.stringify({
    e: payload.email,
    x: payload.expiresAt,
  });
  return Buffer.from(json, "utf8").toString("base64url");
}

export function parseSessionCookie(
  value: string | undefined,
): SessionPayload | null {
  if (!value) return null;

  // New format: base64url JSON
  try {
    const json = Buffer.from(value, "base64url").toString("utf8");
    const data = JSON.parse(json) as { e?: string; x?: number };
    if (typeof data.e === "string" && typeof data.x === "number") {
      if (!data.e || Date.now() > data.x) return null;
      return { email: data.e, expiresAt: data.x };
    }
  } catch {
    // Fall through to legacy format.
  }

  // Legacy format: expiresAt.email
  const separatorIndex = value.indexOf(".");
  if (separatorIndex === -1) return null;

  const expiresAt = Number(value.slice(0, separatorIndex));
  let email = value.slice(separatorIndex + 1);
  try {
    email = decodeURIComponent(email);
  } catch {
    return null;
  }

  if (!email || Number.isNaN(expiresAt)) return null;
  if (Date.now() > expiresAt) return null;

  return { email, expiresAt };
}

export async function setSession(
  email: string,
  maxAgeSeconds: number = SESSION_MAX_AGE_SECONDS,
) {
  const expiresAt = Date.now() + maxAgeSeconds * 1000;
  const value = encodeSession({ email, expiresAt });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: maxAgeSeconds,
    path: "/",
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  return parseSessionCookie(cookieStore.get(SESSION_COOKIE)?.value);
}

export async function requireSession(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}
