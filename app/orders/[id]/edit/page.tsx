import { redirect } from "next/navigation";
import Header from "@/components/Header";
import OrderEditClient from "@/components/OrderEditClient";
import PageShell from "@/components/PageShell";
import SessionExpiryGuard from "@/components/SessionExpiryGuard";
import { getSession } from "@/lib/session";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function OrderEditPage({ params }: PageProps) {
  const session = await getSession();
  if (!session) redirect("/login");
  const { id } = await params;

  return (
    <div className="flex min-h-full flex-col bg-[#F8F9FA]">
      <SessionExpiryGuard expiresAt={session.expiresAt} />
      <Header email={session.email} showLogout />
      <PageShell title="Edit Order" backHref={`/orders/${id}`}>
        <OrderEditClient />
      </PageShell>
    </div>
  );
}
