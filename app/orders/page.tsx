import { redirect } from "next/navigation";
import Header from "@/components/Header";
import OrdersClient from "@/components/OrdersClient";
import PageShell from "@/components/PageShell";
import SessionExpiryGuard from "@/components/SessionExpiryGuard";
import { getSession } from "@/lib/session";

export default async function OrdersPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="flex min-h-full flex-col bg-zinc-50">
      <SessionExpiryGuard expiresAt={session.expiresAt} />
      <Header email={session.email} showLogout />
      <PageShell title="Orders" description="Orders loaded from the database">
        <OrdersClient />
      </PageShell>
    </div>
  );
}
