"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

type SessionExpiryGuardProps = {
  expiresAt: number;
};

export default function SessionExpiryGuard({
  expiresAt,
}: SessionExpiryGuardProps) {
  const router = useRouter();

  useEffect(() => {
    const remainingMs = expiresAt - Date.now();

    if (remainingMs <= 0) {
      router.replace("/login");
      return;
    }

    const timeoutId = window.setTimeout(() => {
      router.replace("/login");
      router.refresh();
    }, remainingMs);

    return () => window.clearTimeout(timeoutId);
  }, [expiresAt, router]);

  return null;
}
