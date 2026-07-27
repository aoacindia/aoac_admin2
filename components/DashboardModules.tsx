"use client";

import Link from "next/link";
import { useState } from "react";
import Modal from "@/components/Modal";

type DashboardModulesProps = {
  canCreateEmail: boolean;
};

const modules = [
  {
    key: "products",
    title: "Products",
    description: "Browse catalog and add new products.",
  },
  {
    key: "orders",
    title: "Orders",
    description: "View customer orders and order items.",
  },
  {
    key: "customers",
    title: "Customers",
    description: "Manage customer records.",
  },
  {
    key: "feedback",
    title: "Feedback",
    description: "Review customer feedback.",
  },
  {
    key: "email",
    title: "Email",
    description: "Manage email accounts and forwards.",
  },
  {
    key: "admin-accounts",
    title: "Admin Accounts",
    description: "View admin and user account listings.",
  },
  {
    key: "servers",
    title: "Servers",
    description: "Monitor and control hosted servers.",
  },
  {
    key: "domains",
    title: "Domains",
    description: "Manage domain registrations.",
  },
] as const;

const cardClassName =
  "rounded-2xl border border-zinc-200 bg-white p-6 text-left shadow-sm transition hover:border-zinc-300 hover:shadow-md";

export default function DashboardModules({
  canCreateEmail,
}: DashboardModulesProps) {
  const [productsOpen, setProductsOpen] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);

  function handleModuleClick(key: (typeof modules)[number]["key"]) {
    if (key === "products") {
      setProductsOpen(true);
      return;
    }
    if (key === "email") {
      setEmailOpen(true);
      return;
    }
  }

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((module) => {
          const isModal = module.key === "products" || module.key === "email";
          const href =
            module.key === "orders"
              ? "/orders"
              : module.key === "customers"
                ? "/customers"
                : module.key === "feedback"
                  ? "/feedback"
                  : module.key === "admin-accounts"
                    ? "/admin-accounts"
                    : module.key === "servers"
                      ? "/servers"
                      : module.key === "domains"
                        ? "/domains"
                        : undefined;

          if (isModal) {
            return (
              <button
                key={module.key}
                type="button"
                onClick={() => handleModuleClick(module.key)}
                className={cardClassName}
              >
                <h3 className="text-lg font-semibold text-zinc-900">
                  {module.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-zinc-500">
                  {module.description}
                </p>
              </button>
            );
          }

          return (
            <Link key={module.key} href={href!} className={cardClassName}>
              <h3 className="text-lg font-semibold text-zinc-900">
                {module.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-zinc-500">
                {module.description}
              </p>
            </Link>
          );
        })}
      </div>

      <Modal
        open={productsOpen}
        title="Products"
        onClose={() => setProductsOpen(false)}
      >
        <div className="space-y-3">
          <Link
            href="/products"
            className="block rounded-xl border border-zinc-200 px-4 py-3 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
          >
            All Products
          </Link>
          <Link
            href="/products/add"
            className="block rounded-xl border border-zinc-200 px-4 py-3 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
          >
            Add Product
          </Link>
        </div>
      </Modal>

      <Modal open={emailOpen} title="Email" onClose={() => setEmailOpen(false)}>
        <div className="space-y-3">
          <Link
            href="/email"
            className="block rounded-xl border border-zinc-200 px-4 py-3 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
          >
            All Emails
          </Link>
          {canCreateEmail ? (
            <Link
              href="/email/create"
              className="block rounded-xl border border-zinc-200 px-4 py-3 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
            >
              Create Email
            </Link>
          ) : (
            <p className="rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-3 text-sm text-zinc-500">
              Create Email (restricted)
            </p>
          )}
          <Link
            href="/email/forwards"
            className="block rounded-xl border border-zinc-200 px-4 py-3 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
          >
            Forwards
          </Link>
        </div>
      </Modal>
    </>
  );
}
