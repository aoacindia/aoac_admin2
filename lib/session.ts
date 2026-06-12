import { cookies } from "next/headers";

export const SESSION_COOKIE = "aoac_session";
export const SESSION_MAX_AGE_SECONDS = 2 * 60;

export type SessionPayload = {
  email: string;
  expiresAt: number;
};

function encodeSession(payload: SessionPayload): string {
  return `${payload.expiresAt}.${encodeURIComponent(payload.email)}`;
}

export function parseSessionCookie(
  value: string | undefined,
): SessionPayload | null {
  if (!value) return null;

  const separatorIndex = value.indexOf(".");
  if (separatorIndex === -1) return null;

  const expiresAt = Number(value.slice(0, separatorIndex));
  const email = decodeURIComponent(value.slice(separatorIndex + 1));

  if (!email || Number.isNaN(expiresAt)) return null;
  if (Date.now() > expiresAt) return null;

  return { email, expiresAt };
}

export async function setSession(email: string) {
  const expiresAt = Date.now() + SESSION_MAX_AGE_SECONDS * 1000;
  const value = encodeSession({ email, expiresAt });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE_SECONDS,
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
