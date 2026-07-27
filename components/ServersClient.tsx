"use client";

import { useEffect, useRef, useState } from "react";
import EmptyState from "@/components/EmptyState";
import Modal from "@/components/Modal";
import type { DemoServer, ServerStatus } from "@/lib/servers";

function StatusBadge({ status }: { status: ServerStatus }) {
  const styles =
    status === "Running"
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

export default function ServersClient() {
  const [servers, setServers] = useState<DemoServer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [actionTarget, setActionTarget] = useState<DemoServer | null>(null);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState("");
  const menuRef = useRef<HTMLDivElement | null>(null);

  async function loadServers() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/servers");
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to load servers.");
      }
      setServers(data.servers ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load servers.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadServers();
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

  async function confirmStatusChange() {
    if (!actionTarget) return;
    const nextStatus: ServerStatus =
      actionTarget.status === "Running" ? "Stopped" : "Running";

    setBusy(true);
    setFormError("");
    try {
      const response = await fetch(`/api/servers/${actionTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to update server.");
      }

      setMessage(
        nextStatus === "Stopped"
          ? `Server ${actionTarget.name} stopped.`
          : `Server ${actionTarget.name} started.`,
      );
      setActionTarget(null);
      await loadServers();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Update failed.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-10 text-center text-zinc-500 shadow-sm">
        Loading servers...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 shadow-sm">
        {error}
      </div>
    );
  }

  return (
    <>
      {message && (
        <p className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {message}
        </p>
      )}

      {servers.length === 0 ? (
        <EmptyState title="No servers found." />
      ) : (
        <div className="space-y-4" ref={menuRef}>
          {servers.map((server) => (
            <div
              key={server.id}
              className="relative rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 space-y-3">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                      Server Name
                    </p>
                    <p className="mt-1 text-lg font-semibold text-zinc-900">
                      {server.name}
                    </p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                        IP Address
                      </p>
                      <p className="mt-1 text-sm text-zinc-800">
                        {server.ipAddress}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                        Status
                      </p>
                      <div className="mt-1">
                        <StatusBadge status={server.status} />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                        Valid Until
                      </p>
                      <p className="mt-1 text-sm text-zinc-800">
                        {server.validUntil}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <button
                    type="button"
                    aria-label="Server actions"
                    onClick={() =>
                      setOpenMenuId(
                        openMenuId === server.id ? null : server.id,
                      )
                    }
                    className="rounded-md px-2 py-1 text-lg leading-none text-zinc-600 hover:bg-zinc-100"
                  >
                    ⋮
                  </button>
                  {openMenuId === server.id && (
                    <div className="absolute right-0 z-20 mt-1 w-40 rounded-lg border border-zinc-200 bg-white py-1 shadow-lg">
                      <button
                        type="button"
                        className="block w-full px-3 py-2 text-left text-sm text-zinc-800 hover:bg-zinc-50"
                        onClick={() => {
                          setOpenMenuId(null);
                          setFormError("");
                          setActionTarget(server);
                        }}
                      >
                        {server.status === "Running"
                          ? "Stop Server"
                          : "Start Server"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={Boolean(actionTarget)}
        title={
          actionTarget?.status === "Running" ? "Stop Server" : "Start Server"
        }
        onClose={() => {
          if (!busy) {
            setActionTarget(null);
            setFormError("");
          }
        }}
      >
        <div className="space-y-4">
          {actionTarget?.status === "Running" ? (
            <p className="text-sm text-zinc-700">
              Are you sure you want to stop this server?
              <br />
              <br />
              Stopping the server will make all hosted services temporarily
              unavailable.
            </p>
          ) : (
            <p className="text-sm text-zinc-700">
              Are you sure you want to start this server?
            </p>
          )}
          {formError && <p className="text-sm text-red-700">{formError}</p>}
          <div className="flex gap-3">
            <button
              type="button"
              disabled={busy}
              onClick={() => setActionTarget(null)}
              className="flex-1 rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-800 hover:bg-zinc-50 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={confirmStatusChange}
              className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60 ${
                actionTarget?.status === "Running"
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-zinc-900 hover:bg-zinc-800"
              }`}
            >
              {busy
                ? "Updating..."
                : actionTarget?.status === "Running"
                  ? "Stop Server"
                  : "Start Server"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
