import { redirect } from "next/navigation";
import Header from "@/components/Header";
import PageShell from "@/components/PageShell";
import ServersClient from "@/components/ServersClient";
import SessionExpiryGuard from "@/components/SessionExpiryGuard";
import { getSession } from "@/lib/session";

export default async function ServersPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="flex min-h-full flex-col bg-[#F8F9FA]">
      <SessionExpiryGuard expiresAt={session.expiresAt} />
      <Header email={session.email} showLogout />
      <PageShell title="Servers" description="Manage hosted servers">
        <ServersClient />
      </PageShell>
    </div>
  );
}
