import { redirect } from "next/navigation";
import AdminAccountsClient from "@/components/AdminAccountsClient";
import Header from "@/components/Header";
import PageShell from "@/components/PageShell";
import SessionExpiryGuard from "@/components/SessionExpiryGuard";
import { canDeleteAdminAccounts } from "@/lib/permissions";
import { getSession } from "@/lib/session";

export default async function AdminAccountsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="flex min-h-full flex-col bg-[#F8F9FA]">
      <SessionExpiryGuard expiresAt={session.expiresAt} />
      <Header email={session.email} showLogout />
      <PageShell
        title="Admin Accounts"
        description="Admin and user account directory"
      >
        <AdminAccountsClient canDelete={canDeleteAdminAccounts(session.email)} />
      </PageShell>
    </div>
  );
}
