import { redirect } from "next/navigation";
import Header from "@/components/Header";
import OrderDetailClient from "@/components/OrderDetailClient";
import PageShell from "@/components/PageShell";
import SessionExpiryGuard from "@/components/SessionExpiryGuard";
import { getSession } from "@/lib/session";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function OrderDetailPage({ params }: PageProps) {
  const session = await getSession();
  if (!session) redirect("/login");
  await params;

  return (
    <div className="flex min-h-full flex-col bg-[#F8F9FA]">
      <SessionExpiryGuard expiresAt={session.expiresAt} />
      <Header email={session.email} showLogout />
      <PageShell title="Order Details" backHref="/orders">
        <OrderDetailClient />
      </PageShell>
    </div>
  );
}
