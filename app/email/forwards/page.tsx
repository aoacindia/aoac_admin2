import { redirect } from "next/navigation";
import ForwardsClient from "@/components/ForwardsClient";
import Header from "@/components/Header";
import PageShell from "@/components/PageShell";
import SessionExpiryGuard from "@/components/SessionExpiryGuard";
import { getSession } from "@/lib/session";

export default async function ForwardsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="flex min-h-full flex-col bg-zinc-50">
      <SessionExpiryGuard expiresAt={session.expiresAt} />
      <Header email={session.email} showLogout />
      <PageShell title="Email Forwards" backHref="/email">
        <ForwardsClient />
      </PageShell>
    </div>
  );
}
