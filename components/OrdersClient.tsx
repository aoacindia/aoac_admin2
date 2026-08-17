"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import Modal from "@/components/Modal";

export type ImportedOrderItem = {
  id: string;
  order_id: string;
  line_index: number;
  item_name: string;
  amount: string;
};

export type ImportedOrder = {
  id: string;
  order_date: string;
  order_name: string;
  delivery_charges: string;
  order_total: string;
  createdAt: string;
  updatedAt: string;
  item_count: number;
  items: ImportedOrderItem[];
};

type Pagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function toDateInputValue(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

type OrdersClientProps = {
  canDownloadPdf?: boolean;
};

export default function OrdersClient({
  canDownloadPdf = false,
}: OrdersClientProps) {
  const [orders, setOrders] = useState<ImportedOrder[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [q, setQ] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [minTotal, setMinTotal] = useState("");
  const [maxTotal, setMaxTotal] = useState("");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<ImportedOrder | null>(null);
  const [busy, setBusy] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("pageSize", "20");
      if (q.trim()) params.set("q", q.trim());
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);
      if (minTotal) params.set("minTotal", minTotal);
      if (maxTotal) params.set("maxTotal", maxTotal);

      const response = await fetch(`/api/orders?${params.toString()}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to load orders.");
      }
      setOrders(data.orders ?? []);
      setPagination(
        data.pagination ?? {
          page: 1,
          pageSize: 20,
          total: 0,
          totalPages: 1,
        },
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load orders.");
    } finally {
      setLoading(false);
    }
  }, [page, q, dateFrom, dateTo, minTotal, maxTotal]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  function handleSearch(event: FormEvent) {
    event.preventDefault();
    setPage(1);
    // loadOrders will run via state updates for page; if page already 1, force reload
    if (page === 1) {
      void loadOrders();
    }
  }

  function clearFilters() {
    setQ("");
    setDateFrom("");
    setDateTo("");
    setMinTotal("");
    setMaxTotal("");
    setPage(1);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/orders/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to delete order.");
      }
      setMessage(`Deleted ${deleteTarget.order_name}`);
      setDeleteTarget(null);
      await loadOrders();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDownloadPdf() {
    if (!canDownloadPdf || orders.length === 0) return;
    setDownloading(true);
    setError("");
    try {
      const response = await fetch("/api/orders/export-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderIds: orders.map((order) => order.id),
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to download PDF.");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `orders-${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      setMessage(
        `Downloaded PDF for ${orders.length} order${orders.length === 1 ? "" : "s"} shown on this page.`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "PDF download failed.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <>
      <form
        onSubmit={handleSearch}
        className="mb-5 space-y-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
      >
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500">
              Search (name, date, item)
            </label>
            <input
              value={q}
              onChange={(event) => setQ(event.target.value)}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              placeholder="ORD-0001 or lemon juice"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500">
              Date From
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(event) => setDateFrom(event.target.value)}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500">
              Date To
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(event) => setDateTo(event.target.value)}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500">
              Min Order Total
            </label>
            <input
              type="number"
              step="0.01"
              value={minTotal}
              onChange={(event) => setMinTotal(event.target.value)}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500">
              Max Order Total
            </label>
            <input
              type="number"
              step="0.01"
              value={maxTotal}
              onChange={(event) => setMaxTotal(event.target.value)}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Apply Filters
          </button>
          <button
            type="button"
            onClick={clearFilters}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
          >
            Clear
          </button>
          {canDownloadPdf && (
            <button
              type="button"
              disabled={downloading || loading || orders.length === 0}
              onClick={handleDownloadPdf}
              className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {downloading ? "Preparing PDF..." : "Download PDF"}
            </button>
          )}
        </div>
      </form>

      {message && (
        <p className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {message}
        </p>
      )}

      {loading ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-10 text-center text-zinc-500 shadow-sm">
          Loading orders...
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 shadow-sm">
          {error}
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-10 text-center text-zinc-500 shadow-sm">
          No orders found
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-zinc-200 text-sm">
              <thead className="bg-zinc-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-zinc-700">
                    Order Name
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-zinc-700">
                    Order Date
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-zinc-700">
                    Delivery Charges
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-zinc-700">
                    Order Total
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-zinc-700">
                    Number of Items
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-zinc-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-zinc-50/70">
                    <td className="px-4 py-3 font-medium text-zinc-900">
                      {order.order_name}
                    </td>
                    <td className="px-4 py-3 text-zinc-700">
                      {formatDate(order.order_date)}
                    </td>
                    <td className="px-4 py-3 text-zinc-700">
                      {order.delivery_charges}
                    </td>
                    <td className="px-4 py-3 text-zinc-700">
                      {order.order_total}
                    </td>
                    <td className="px-4 py-3 text-zinc-700">
                      {order.item_count}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`/orders/${order.id}`}
                          className="rounded-md border border-zinc-300 px-2.5 py-1 text-xs font-medium text-zinc-800 hover:bg-zinc-50"
                        >
                          View
                        </Link>
                        <Link
                          href={`/orders/${order.id}/edit`}
                          className="rounded-md border border-zinc-300 px-2.5 py-1 text-xs font-medium text-zinc-800 hover:bg-zinc-50"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(order)}
                          className="rounded-md border border-red-200 px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-zinc-600">
            <p>
              Showing page {pagination.page} of {pagination.totalPages} (
              {pagination.total} orders)
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                className="rounded-lg border border-zinc-300 px-3 py-1.5 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((current) => current + 1)}
                className="rounded-lg border border-zinc-300 px-3 py-1.5 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      <Modal
        open={Boolean(deleteTarget)}
        title="Delete Order"
        onClose={() => {
          if (!busy) setDeleteTarget(null);
        }}
      >
        <div className="space-y-4">
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-800">
            Are you sure you want to delete{" "}
            <span className="font-medium">{deleteTarget?.order_name}</span>?
            This will also permanently delete all related order items.
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              disabled={busy}
              onClick={() => setDeleteTarget(null)}
              className="flex-1 rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={handleDelete}
              className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
            >
              {busy ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export { toDateInputValue, formatDate };
