"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type HeaderProps = {
  email?: string;
  showLogout?: boolean;
};

export default function Header({ email, showLogout = false }: HeaderProps) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-6">
        <h1 className="text-lg font-semibold tracking-tight text-zinc-900">
          AOAC Admin Panel
        </h1>
        <div className="flex items-center gap-3">
          {email && (
            <span className="hidden text-sm text-zinc-500 sm:inline">
              {email}
            </span>
          )}
          {showLogout && (
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-800 shadow-sm transition hover:bg-zinc-50 disabled:opacity-60"
            >
              {loggingOut ? "Logging out..." : "Logout"}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
