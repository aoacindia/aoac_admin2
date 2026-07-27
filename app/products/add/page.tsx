import { redirect } from "next/navigation";
import Header from "@/components/Header";
import PageShell from "@/components/PageShell";
import SessionExpiryGuard from "@/components/SessionExpiryGuard";
import { getSession } from "@/lib/session";

export default async function AddProductPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="flex min-h-full flex-col bg-zinc-50">
      <SessionExpiryGuard expiresAt={session.expiresAt} />
      <Header email={session.email} showLogout />
      <PageShell
        title="Add Product"
        description="Product creation form will be connected to the Products API."
        backHref="/products"
      >
        <div className="rounded-xl border border-zinc-200 bg-white p-8 shadow-sm">
          <p className="text-sm text-zinc-600">
            Add Product page is ready. Connect create-product fields to the
            database when product intake is enabled.
          </p>
        </div>
      </PageShell>
    </div>
  );
}
