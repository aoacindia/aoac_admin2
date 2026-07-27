import { redirect } from "next/navigation";
import EmailsClient from "@/components/EmailsClient";
import Header from "@/components/Header";
import PageShell from "@/components/PageShell";
import SessionExpiryGuard from "@/components/SessionExpiryGuard";
import { canManageEmailAccounts } from "@/lib/permissions";
import { getSession } from "@/lib/session";

export default async function AllEmailsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="flex min-h-full flex-col bg-zinc-50">
      <SessionExpiryGuard expiresAt={session.expiresAt} />
      <Header email={session.email} showLogout />
      <PageShell title="All Emails" description="Email accounts from the database">
        <EmailsClient canManage={canManageEmailAccounts(session.email)} />
      </PageShell>
    </div>
  );
}
