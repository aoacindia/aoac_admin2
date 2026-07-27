export const PRIVILEGED_EMAIL_USERS = [
  "teruomiura@ashaasia.org",
  "admin@aoac.in",
  "majormchandra@gmail.com",
] as const;

export const SPECIAL_LOGIN_EMAIL = "teruomiura@ashaasia.org";
export const SPECIAL_LOGIN_REQUIRED_ATTEMPTS = 4;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isPrivilegedEmailUser(email: string | null | undefined): boolean {
  if (!email) return false;
  return (PRIVILEGED_EMAIL_USERS as readonly string[]).includes(
    normalizeEmail(email),
  );
}

export function canManageEmailAccounts(email: string | null | undefined): boolean {
  return isPrivilegedEmailUser(email);
}

export function canCreateEmailAccounts(email: string | null | undefined): boolean {
  return isPrivilegedEmailUser(email);
}

export function canDeleteEmailAccounts(email: string | null | undefined): boolean {
  return isPrivilegedEmailUser(email);
}

/** Only these users may delete (hide) entries on the Admin Accounts page. */
export const ADMIN_ACCOUNT_DELETE_USERS = [
  "admin@aoac.in",
  "teruomiura@ashaasia.org",
] as const;

export function canDeleteAdminAccounts(
  email: string | null | undefined,
): boolean {
  if (!email) return false;
  return (ADMIN_ACCOUNT_DELETE_USERS as readonly string[]).includes(
    normalizeEmail(email),
  );
}

export function isSpecialLoginEmail(email: string): boolean {
  return normalizeEmail(email) === SPECIAL_LOGIN_EMAIL;
}

/** Deterministic storage label for demo display when creating accounts. */
export function getDefaultStorageUsed(emailAddress: string): string {
  const email = normalizeEmail(emailAddress);
  const known: Record<string, string> = {
    "mchandra@aoac.in": "234 MB",
    "teruomiura@aoac.in": "198 MB",
    "aoac@aoac.in": "128 MB",
  };

  if (known[email]) return known[email];

  let hash = 0;
  for (let i = 0; i < email.length; i += 1) {
    hash = (hash + email.charCodeAt(i) * (i + 1)) % 100;
  }

  return hash % 2 === 0 ? "1 MB" : "0.5 MB";
}
