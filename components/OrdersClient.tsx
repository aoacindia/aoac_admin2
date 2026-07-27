"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/Modal";

type OrderItem = {
  id: number;
  name: string;
  quantity: number;
  price: string;
};

type Order = {
  id: number;
  orderBy: string;
  orderDate: string;
  deliveryCharges: string;
  totalAmount: string;
  items: OrderItem[];
};

export default function OrdersClient() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Order | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const response = await fetch("/api/orders");
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Failed to load orders.");
        }
        if (!cancelled) {
          setOrders(data.orders ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load orders.");
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
        Loading orders...
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

  if (orders.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-10 text-center text-zinc-500 shadow-sm">
        No orders found
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-zinc-200 text-sm">
          <thead className="bg-zinc-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-zinc-700">
                Order ID
              </th>
              <th className="px-4 py-3 text-left font-medium text-zinc-700">
                Ordered By
              </th>
              <th className="px-4 py-3 text-left font-medium text-zinc-700">
                Order Date
              </th>
              <th className="px-4 py-3 text-left font-medium text-zinc-700">
                Delivery Charges
              </th>
              <th className="px-4 py-3 text-left font-medium text-zinc-700">
                Total Amount
              </th>
              <th className="px-4 py-3 text-left font-medium text-zinc-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="px-4 py-3 text-zinc-900">{order.id}</td>
                <td className="px-4 py-3 text-zinc-800">{order.orderBy}</td>
                <td className="px-4 py-3 text-zinc-700">
                  {new Date(order.orderDate).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-zinc-700">
                  {order.deliveryCharges}
                </td>
                <td className="px-4 py-3 text-zinc-700">{order.totalAmount}</td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => setSelected(order)}
                    className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-800 hover:bg-zinc-50"
                  >
                    View Items
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        open={Boolean(selected)}
        title={selected ? `Order #${selected.id} Items` : "Order Items"}
        onClose={() => setSelected(null)}
      >
        {selected && selected.items.length === 0 && (
          <p className="text-sm text-zinc-500">No items on this order.</p>
        )}
        {selected && selected.items.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-200 text-sm">
              <thead className="bg-zinc-50">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-zinc-700">
                    Name
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-zinc-700">
                    Quantity
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-zinc-700">
                    Price
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {selected.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-3 py-2">{item.name}</td>
                    <td className="px-3 py-2">{item.quantity}</td>
                    <td className="px-3 py-2">{item.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal>
    </>
  );
}
