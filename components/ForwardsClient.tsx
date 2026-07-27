"use client";

import { useEffect, useState } from "react";

type ForwardRow = {
  id: number;
  fromAddress: string;
  toAddress: string;
  isActive: boolean;
  createdAt: string;
};

export default function ForwardsClient() {
  const [forwards, setForwards] = useState<ForwardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch("/api/emails/forwards");
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Failed to load forwards.");
        }
        if (!cancelled) setForwards(data.forwards ?? []);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load forwards.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-10 text-center text-zinc-500 shadow-sm">
        Loading forwards...
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

  if (forwards.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-10 text-center text-zinc-500 shadow-sm">
        No email forwards configured
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-zinc-200 text-sm">
        <thead className="bg-zinc-50">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-zinc-700">
              From
            </th>
            <th className="px-4 py-3 text-left font-medium text-zinc-700">To</th>
            <th className="px-4 py-3 text-left font-medium text-zinc-700">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {forwards.map((forward) => (
            <tr key={forward.id}>
              <td className="px-4 py-3">{forward.fromAddress}</td>
              <td className="px-4 py-3">{forward.toAddress}</td>
              <td className="px-4 py-3">
                {forward.isActive ? "Active" : "Inactive"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
