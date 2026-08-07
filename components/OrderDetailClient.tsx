"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { ImportedOrder } from "@/components/OrdersClient";
import { formatDate } from "@/components/OrdersClient";
import Modal from "@/components/Modal";

export default function OrderDetailClient() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<ImportedOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`/api/orders/${params.id}`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Failed to load order.");
        }
        if (!cancelled) setOrder(data.order);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load order.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  async function handleDelete() {
    if (!order) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/orders/${order.id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to delete order.");
      }
      router.push("/orders");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed.");
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-10 text-center text-zinc-500 shadow-sm">
        Loading order...
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 shadow-sm">
        {error || "Order not found."}
      </div>
    );
  }

  return (
    <>
      <div className="mb-5 flex flex-wrap gap-2">
        <Link
          href={`/orders/${order.id}/edit`}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Edit
        </Link>
        <button
          type="button"
          onClick={() => setConfirmDelete(true)}
          className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
        >
          Delete
        </button>
      </div>

      <div className="mb-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
              Order Name
            </p>
            <p className="mt-1 text-lg font-semibold text-zinc-900">
              {order.order_name}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
              Order Date
            </p>
            <p className="mt-1 text-sm text-zinc-800">
              {formatDate(order.order_date)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
              Delivery Charges
            </p>
            <p className="mt-1 text-sm text-zinc-800">{order.delivery_charges}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
              Order Total
            </p>
            <p className="mt-1 text-sm text-zinc-800">{order.order_total}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
              Last Edited
            </p>
            <p className="mt-1 text-sm text-zinc-800">
              {formatDate(order.updatedAt)}
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-zinc-200 text-sm">
          <thead className="bg-zinc-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-zinc-700">
                Line No.
              </th>
              <th className="px-4 py-3 text-left font-medium text-zinc-700">
                Item Name
              </th>
              <th className="px-4 py-3 text-left font-medium text-zinc-700">
                Amount
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {order.items.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3 text-zinc-700">{item.line_index}</td>
                <td className="px-4 py-3 text-zinc-900">{item.item_name}</td>
                <td className="px-4 py-3 text-zinc-700">{item.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        open={confirmDelete}
        title="Delete Order"
        onClose={() => {
          if (!busy) setConfirmDelete(false);
        }}
      >
        <div className="space-y-4">
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-800">
            Are you sure you want to delete this order and all of its items?
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              disabled={busy}
              onClick={() => setConfirmDelete(false)}
              className="flex-1 rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={handleDelete}
              className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white"
            >
              {busy ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
