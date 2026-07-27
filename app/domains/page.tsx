import { redirect } from "next/navigation";
import DomainsClient from "@/components/DomainsClient";
import Header from "@/components/Header";
import PageShell from "@/components/PageShell";
import SessionExpiryGuard from "@/components/SessionExpiryGuard";
import { getSession } from "@/lib/session";

export default async function DomainsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="flex min-h-full flex-col bg-[#F8F9FA]">
      <SessionExpiryGuard expiresAt={session.expiresAt} />
      <Header email={session.email} showLogout />
      <PageShell title="Domains" description="Manage domains">
        <DomainsClient />
      </PageShell>
    </div>
  );
}
