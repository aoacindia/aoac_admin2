"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { ImportedOrder, ImportedOrderItem } from "@/components/OrdersClient";
import { formatDate, toDateInputValue } from "@/components/OrdersClient";

type EditableItem = {
  key: string;
  id?: string;
  item_name: string;
  amount: string;
};

export default function OrderEditClient() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [updatedAt, setUpdatedAt] = useState("");
  const [orderName, setOrderName] = useState("");
  const [orderDate, setOrderDate] = useState("");
  const [deliveryCharges, setDeliveryCharges] = useState("");
  const [orderTotal, setOrderTotal] = useState("");
  const [items, setItems] = useState<EditableItem[]>([]);

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
        const order = data.order as ImportedOrder;
        if (cancelled) return;
        setOrderName(order.order_name);
        setOrderDate(toDateInputValue(order.order_date));
        setDeliveryCharges(order.delivery_charges);
        setOrderTotal(order.order_total);
        setUpdatedAt(order.updatedAt);
        setItems(
          order.items.map((item: ImportedOrderItem) => ({
            key: item.id,
            id: item.id,
            item_name: item.item_name,
            amount: item.amount,
          })),
        );
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

  function updateItem(key: string, patch: Partial<EditableItem>) {
    setItems((current) =>
      current.map((item) => (item.key === key ? { ...item, ...patch } : item)),
    );
  }

  function addItem() {
    setItems((current) => [
      ...current,
      {
        key: `new-${Date.now()}-${current.length}`,
        item_name: "",
        amount: "0.00",
      },
    ]);
  }

  function removeItem(key: string) {
    setItems((current) => current.filter((item) => item.key !== key));
  }

  function moveItem(key: string, direction: -1 | 1) {
    setItems((current) => {
      const index = current.findIndex((item) => item.key === key);
      if (index < 0) return current;
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= current.length) return current;
      const copy = [...current];
      const [item] = copy.splice(index, 1);
      copy.splice(nextIndex, 0, item);
      return copy;
    });
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const response = await fetch(`/api/orders/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_name: orderName,
          order_date: orderDate ? `${orderDate}T00:00:00.000Z` : undefined,
          delivery_charges: deliveryCharges,
          order_total: orderTotal,
          items: items.map((item, index) => ({
            id: item.id,
            line_index: index,
            item_name: item.item_name,
            amount: item.amount,
          })),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to save order.");
      }
      router.push(`/orders/${params.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save order.");
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-10 text-center text-zinc-500 shadow-sm">
        Loading order...
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {updatedAt && (
        <p className="text-sm text-zinc-500">
          Last Edited: {formatDate(updatedAt)}
        </p>
      )}

      <div className="grid gap-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700">
            Order Name
          </label>
          <input
            required
            value={orderName}
            onChange={(event) => setOrderName(event.target.value)}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700">
            Order Date
          </label>
          <input
            type="date"
            required
            value={orderDate}
            onChange={(event) => setOrderDate(event.target.value)}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700">
            Delivery Charges
          </label>
          <input
            required
            value={deliveryCharges}
            onChange={(event) => setDeliveryCharges(event.target.value)}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700">
            Order Total
          </label>
          <input
            required
            value={orderTotal}
            onChange={(event) => setOrderTotal(event.target.value)}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-zinc-900">Items</h3>
          <button
            type="button"
            onClick={addItem}
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
          >
            Add Item
          </button>
        </div>

        <div className="space-y-3">
          {items.length === 0 && (
            <p className="text-sm text-zinc-500">No items. Add one to continue.</p>
          )}
          {items.map((item, index) => (
            <div
              key={item.key}
              className="grid gap-3 rounded-xl border border-zinc-200 p-4 sm:grid-cols-[1fr_140px_auto]"
            >
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-500">
                  Item Name (Line {index})
                </label>
                <input
                  required
                  value={item.item_name}
                  onChange={(event) =>
                    updateItem(item.key, { item_name: event.target.value })
                  }
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-500">
                  Amount
                </label>
                <input
                  required
                  value={item.amount}
                  onChange={(event) =>
                    updateItem(item.key, { amount: event.target.value })
                  }
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div className="flex items-end gap-2">
                <button
                  type="button"
                  onClick={() => moveItem(item.key, -1)}
                  className="rounded-md border border-zinc-300 px-2 py-2 text-xs"
                  aria-label="Move up"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => moveItem(item.key, 1)}
                  className="rounded-md border border-zinc-300 px-2 py-2 text-xs"
                  aria-label="Move down"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => removeItem(item.key)}
                  className="rounded-md border border-red-200 px-2 py-2 text-xs text-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={() => router.push(`/orders/${params.id}`)}
          className="rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
