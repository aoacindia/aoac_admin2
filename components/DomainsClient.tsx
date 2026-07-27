"use client";

import { useEffect, useRef, useState } from "react";
import EmptyState from "@/components/EmptyState";
import Modal from "@/components/Modal";
import type { DemoDomain } from "@/lib/domains";

export default function DomainsClient() {
  const [domains, setDomains] = useState<DemoDomain[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [removeTarget, setRemoveTarget] = useState<DemoDomain | null>(null);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState("");
  const menuRef = useRef<HTMLDivElement | null>(null);

  async function loadDomains() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/domains");
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to load domains.");
      }
      setDomains(data.domains ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load domains.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDomains();
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

  async function handleRemove() {
    if (!removeTarget || !confirmRemove) return;
    setBusy(true);
    setFormError("");
    try {
      const response = await fetch(`/api/domains/${removeTarget.id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to remove domain.");
      }
      setMessage("Domain removed successfully.");
      setRemoveTarget(null);
      setConfirmRemove(false);
      await loadDomains();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Remove failed.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-10 text-center text-zinc-500 shadow-sm">
        Loading domains...
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

      {domains.length === 0 ? (
        <EmptyState title="No domains found." />
      ) : (
        <div className="space-y-4" ref={menuRef}>
          {domains.map((domain) => (
            <div
              key={domain.id}
              className="relative rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 space-y-3">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                      Domain
                    </p>
                    <p className="mt-1 text-lg font-semibold text-zinc-900">
                      {domain.name}
                    </p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                        Status
                      </p>
                      <span className="mt-1 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
                        {domain.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                        Valid Until
                      </p>
                      <p className="mt-1 text-sm text-zinc-800">
                        {domain.validUntil}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <button
                    type="button"
                    aria-label="Domain actions"
                    onClick={() =>
                      setOpenMenuId(
                        openMenuId === domain.id ? null : domain.id,
                      )
                    }
                    className="rounded-md px-2 py-1 text-lg leading-none text-zinc-600 hover:bg-zinc-100"
                  >
                    ⋮
                  </button>
                  {openMenuId === domain.id && (
                    <div className="absolute right-0 z-20 mt-1 w-44 rounded-lg border border-zinc-200 bg-white py-1 shadow-lg">
                      <button
                        type="button"
                        className="block w-full px-3 py-2 text-left text-sm text-red-700 hover:bg-red-50"
                        onClick={() => {
                          setOpenMenuId(null);
                          setConfirmRemove(false);
                          setFormError("");
                          setRemoveTarget(domain);
                        }}
                      >
                        Remove Domain
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
        open={Boolean(removeTarget)}
        title="Remove Domain"
        onClose={() => {
          if (!busy) {
            setRemoveTarget(null);
            setConfirmRemove(false);
            setFormError("");
          }
        }}
      >
        <div className="space-y-4">
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-800">
            Are you sure you want to remove this domain?
            <br />
            This action cannot be undone.
          </p>
          <label className="flex items-start gap-2 text-sm text-zinc-700">
            <input
              type="checkbox"
              checked={confirmRemove}
              onChange={(event) => setConfirmRemove(event.target.checked)}
              className="mt-0.5"
            />
            <span>I understand this action cannot be undone.</span>
          </label>
          {formError && <p className="text-sm text-red-700">{formError}</p>}
          <button
            type="button"
            disabled={!confirmRemove || busy}
            onClick={handleRemove}
            className="w-full rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? "Removing..." : "Remove"}
          </button>
        </div>
      </Modal>
    </>
  );
}
