"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Modal from "@/components/Modal";
import type {
  AdminAccountRole,
  AdminAccountStatus,
  DemoAdminAccount,
} from "@/lib/admin-accounts";

type AdminAccountsClientProps = {
  canDelete: boolean;
};

function RoleBadge({ role }: { role: AdminAccountRole }) {
  const styles: Record<AdminAccountRole, string> = {
    OWNER: "bg-purple-50 text-purple-800 border-purple-200",
    ADMIN: "bg-blue-50 text-blue-800 border-blue-200",
    USER: "bg-zinc-100 text-zinc-700 border-zinc-200",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles[role]}`}
    >
      {role}
    </span>
  );
}

function StatusBadge({ status }: { status: AdminAccountStatus }) {
  const styles =
    status === "Active"
      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
      : "bg-red-50 text-red-700 border-red-200";

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles}`}
    >
      {status}
    </span>
  );
}

export default function AdminAccountsClient({
  canDelete,
}: AdminAccountsClientProps) {
  const [accounts, setAccounts] = useState<DemoAdminAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [reportTarget, setReportTarget] = useState<DemoAdminAccount | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<DemoAdminAccount | null>(
    null,
  );
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState("");
  const menuRef = useRef<HTMLDivElement | null>(null);

  async function loadAccounts() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin-accounts");
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to load admin accounts.");
      }
      setAccounts(data.accounts ?? []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load admin accounts.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAccounts();
  }, []);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (
        menuRef.current &&
        event.target instanceof Node &&
        !menuRef.current.contains(event.target)
      ) {
        setOpenMenuId(null);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function handleDelete() {
    if (!deleteTarget || !confirmDelete || !canDelete) return;
    setBusy(true);
    setFormError("");
    try {
      const response = await fetch(`/api/admin-accounts/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to delete user.");
      }
      setMessage(`Deleted ${deleteTarget.name}`);
      setDeleteTarget(null);
      setConfirmDelete(false);
      await loadAccounts();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Delete failed.");
    } finally {
      setBusy(false);
    }
  }

  function handleReportConfirm() {
    setMessage("User has been reported.");
    setReportTarget(null);
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-10 text-center text-zinc-500 shadow-sm">
        Loading admin accounts...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700 shadow-sm">
        {error}
      </div>
    );
  }

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-zinc-500">
          {accounts.length} account{accounts.length === 1 ? "" : "s"}
        </p>
        <Link
          href="/admin-accounts/create"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800"
        >
          Create User
        </Link>
      </div>

      {message && (
        <p className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {message}
        </p>
      )}

      {accounts.length === 0 ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-10 text-center text-zinc-500 shadow-sm">
          No admin accounts found
        </div>
      ) : (
        <div className="space-y-3" ref={menuRef}>
          {accounts.map((account) => (
            <div
              key={account.id}
              className="relative rounded-xl border border-zinc-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 space-y-2">
                  <p className="font-medium text-zinc-900">{account.name}</p>
                  <p className="truncate text-sm text-zinc-500">
                    {account.email}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <RoleBadge role={account.role} />
                    <StatusBadge status={account.status} />
                  </div>
                </div>

                <div className="relative">
                  <button
                    type="button"
                    aria-label="Account actions"
                    onClick={() =>
                      setOpenMenuId(
                        openMenuId === account.id ? null : account.id,
                      )
                    }
                    className="rounded-md px-2 py-1 text-lg leading-none text-zinc-600 hover:bg-zinc-100"
                  >
                    ⋮
                  </button>
                  {openMenuId === account.id && (
                    <div className="absolute right-0 z-20 mt-1 w-40 rounded-lg border border-zinc-200 bg-white py-1 shadow-lg">
                      <button
                        type="button"
                        className="block w-full px-3 py-2 text-left text-sm text-zinc-800 hover:bg-zinc-50"
                        onClick={() => {
                          setOpenMenuId(null);
                          setReportTarget(account);
                        }}
                      >
                        Report User
                      </button>
                      {canDelete && (
                        <button
                          type="button"
                          className="block w-full px-3 py-2 text-left text-sm text-red-700 hover:bg-red-50"
                          onClick={() => {
                            setOpenMenuId(null);
                            setConfirmDelete(false);
                            setFormError("");
                            setDeleteTarget(account);
                          }}
                        >
                          Delete User
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={Boolean(reportTarget)}
        title="Report User"
        onClose={() => setReportTarget(null)}
      >
        <div className="space-y-4">
          <p className="text-sm text-zinc-700">
            Report{" "}
            <span className="font-medium text-zinc-900">
              {reportTarget?.name}
            </span>{" "}
            ({reportTarget?.email})?
          </p>
          <button
            type="button"
            onClick={handleReportConfirm}
            className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Confirm Report
          </button>
        </div>
      </Modal>

      <Modal
        open={Boolean(deleteTarget)}
        title="Delete User"
        onClose={() => {
          if (!busy) {
            setDeleteTarget(null);
            setConfirmDelete(false);
            setFormError("");
          }
        }}
      >
        <div className="space-y-4">
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-800">
            Are you sure you want to permanently delete this user?
            <br />
            This action cannot be undone.
          </p>
          <label className="flex items-start gap-2 text-sm text-zinc-700">
            <input
              type="checkbox"
              checked={confirmDelete}
              onChange={(event) => setConfirmDelete(event.target.checked)}
              className="mt-0.5"
            />
            <span>I understand this action cannot be undone.</span>
          </label>
          {formError && <p className="text-sm text-red-700">{formError}</p>}
          <button
            type="button"
            disabled={!confirmDelete || busy}
            onClick={handleDelete}
            className="w-full rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? "Deleting..." : "Delete"}
          </button>
        </div>
      </Modal>
    </>
  );
}
