"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Modal from "@/components/Modal";

export type EmailAccountRow = {
  id: number;
  emailAddress: string;
  status: string;
  isSuspended: boolean;
  storageUsed: string;
};

type EmailsClientProps = {
  canManage: boolean;
};

export default function EmailsClient({ canManage }: EmailsClientProps) {
  const [emails, setEmails] = useState<EmailAccountRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<EmailAccountRow | null>(null);
  const [passwordTarget, setPasswordTarget] = useState<EmailAccountRow | null>(
    null,
  );
  const [suspendTarget, setSuspendTarget] = useState<EmailAccountRow | null>(
    null,
  );
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState("");
  const menuRef = useRef<HTMLDivElement | null>(null);

  async function loadEmails() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/emails");
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to load emails.");
      }
      setEmails(data.emails ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load emails.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEmails();
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
    if (!deleteTarget || !confirmDelete) return;
    setBusy(true);
    setFormError("");
    try {
      const response = await fetch(`/api/emails/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to delete email.");
      }
      setMessage(`Deleted ${deleteTarget.emailAddress}`);
      setDeleteTarget(null);
      setConfirmDelete(false);
      await loadEmails();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Delete failed.");
    } finally {
      setBusy(false);
    }
  }

  async function handlePasswordChange(event: FormEvent) {
    event.preventDefault();
    if (!passwordTarget) return;
    setBusy(true);
    setFormError("");
    try {
      const response = await fetch(
        `/api/emails/${passwordTarget.id}/password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password, confirmPassword }),
        },
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to change password.");
      }
      setMessage(`Password updated for ${passwordTarget.emailAddress}`);
      setPasswordTarget(null);
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Password change failed.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleSuspendConfirm() {
    if (!suspendTarget) return;
    setBusy(true);
    setFormError("");
    try {
      const response = await fetch(`/api/emails/${suspendTarget.id}/suspend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ suspend: !suspendTarget.isSuspended }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to update status.");
      }
      setMessage(
        suspendTarget.isSuspended
          ? `Unsuspended ${suspendTarget.emailAddress}`
          : `Suspended ${suspendTarget.emailAddress}`,
      );
      setSuspendTarget(null);
      await loadEmails();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Update failed.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-10 text-center text-zinc-500 shadow-sm">
        Loading emails...
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

  if (emails.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-10 text-center text-zinc-500 shadow-sm">
        No email accounts found
      </div>
    );
  }

  return (
    <>
      {message && (
        <p className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {message}
        </p>
      )}

      <div className="space-y-3" ref={menuRef}>
        {emails.map((email) => (
          <div
            key={email.id}
            className="relative rounded-xl border border-zinc-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium text-zinc-900">{email.emailAddress}</p>
                <p className="mt-1 text-sm text-zinc-500">
                  Storage used: {email.storageUsed}
                </p>
                <p className="mt-1 text-sm">
                  Status:{" "}
                  <span
                    className={
                      email.isSuspended
                        ? "font-medium text-amber-700"
                        : "font-medium text-emerald-700"
                    }
                  >
                    {email.isSuspended ? "Suspended" : email.status}
                  </span>
                </p>
              </div>

              {canManage && (
                <div className="relative">
                  <button
                    type="button"
                    aria-label="Email actions"
                    onClick={() =>
                      setOpenMenuId(openMenuId === email.id ? null : email.id)
                    }
                    className="rounded-md px-2 py-1 text-lg leading-none text-zinc-600 hover:bg-zinc-100"
                  >
                    ⋮
                  </button>
                  {openMenuId === email.id && (
                    <div className="absolute right-0 z-20 mt-1 w-44 rounded-lg border border-zinc-200 bg-white py-1 shadow-lg">
                      <button
                        type="button"
                        className="block w-full px-3 py-2 text-left text-sm text-red-700 hover:bg-red-50"
                        onClick={() => {
                          setOpenMenuId(null);
                          setConfirmDelete(false);
                          setFormError("");
                          setDeleteTarget(email);
                        }}
                      >
                        Delete Email
                      </button>
                      <button
                        type="button"
                        className="block w-full px-3 py-2 text-left text-sm text-zinc-800 hover:bg-zinc-50"
                        onClick={() => {
                          setOpenMenuId(null);
                          setPassword("");
                          setConfirmPassword("");
                          setFormError("");
                          setPasswordTarget(email);
                        }}
                      >
                        Change Password
                      </button>
                      <button
                        type="button"
                        className="block w-full px-3 py-2 text-left text-sm text-zinc-800 hover:bg-zinc-50"
                        onClick={() => {
                          setOpenMenuId(null);
                          setFormError("");
                          setSuspendTarget(email);
                        }}
                      >
                        {email.isSuspended
                          ? "Unsuspend Email"
                          : "Suspend Email"}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <Modal
        open={Boolean(deleteTarget)}
        title="Delete Email Account"
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
            Warning: Deleting this email account will permanently delete the
            email account and its associated email data. This action cannot be
            undone.
          </p>
          <label className="flex items-start gap-2 text-sm text-zinc-700">
            <input
              type="checkbox"
              checked={confirmDelete}
              onChange={(event) => setConfirmDelete(event.target.checked)}
              className="mt-0.5"
            />
            <span>
              I understand that all email data will be permanently deleted and
              cannot be recovered.
            </span>
          </label>
          {formError && (
            <p className="text-sm text-red-700">{formError}</p>
          )}
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

      <Modal
        open={Boolean(passwordTarget)}
        title="Change Password"
        onClose={() => {
          if (!busy) {
            setPasswordTarget(null);
            setFormError("");
          }
        }}
      >
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <p className="text-sm text-zinc-600">
            Updating password for{" "}
            <span className="font-medium text-zinc-900">
              {passwordTarget?.emailAddress}
            </span>
          </p>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700">
              New Password
            </label>
            <input
              type="password"
              required
              minLength={4}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-zinc-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700">
              Confirm Password
            </label>
            <input
              type="password"
              required
              minLength={4}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-zinc-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          {formError && (
            <p className="text-sm text-red-700">{formError}</p>
          )}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
          >
            {busy ? "Saving..." : "Update Password"}
          </button>
        </form>
      </Modal>

      <Modal
        open={Boolean(suspendTarget)}
        title={
          suspendTarget?.isSuspended ? "Unsuspend Email" : "Suspend Email"
        }
        onClose={() => {
          if (!busy) {
            setSuspendTarget(null);
            setFormError("");
          }
        }}
      >
        <div className="space-y-4">
          <p className="text-sm text-zinc-700">
            {suspendTarget?.isSuspended
              ? "This will restore the email account and make it available again."
              : "Warning: Suspending this email account will make it unavailable/inactive until it is unsuspended."}
          </p>
          {formError && (
            <p className="text-sm text-red-700">{formError}</p>
          )}
          <button
            type="button"
            disabled={busy}
            onClick={handleSuspendConfirm}
            className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
          >
            {busy
              ? "Updating..."
              : suspendTarget?.isSuspended
                ? "Confirm Unsuspend"
                : "Confirm Suspend"}
          </button>
        </div>
      </Modal>
    </>
  );
}
