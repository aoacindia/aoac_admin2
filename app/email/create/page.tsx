import { redirect } from "next/navigation";
import CreateEmailForm from "@/components/CreateEmailForm";
import Header from "@/components/Header";
import PageShell from "@/components/PageShell";
import SessionExpiryGuard from "@/components/SessionExpiryGuard";
import { canCreateEmailAccounts } from "@/lib/permissions";
import { getSession } from "@/lib/session";

export default async function CreateEmailPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const authorized = canCreateEmailAccounts(session.email);

  return (
    <div className="flex min-h-full flex-col bg-zinc-50">
      <SessionExpiryGuard expiresAt={session.expiresAt} />
      <Header email={session.email} showLogout />
      <PageShell title="Create Email" backHref="/email">
        {authorized ? (
          <CreateEmailForm />
        ) : (
          <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-red-800 shadow-sm">
            You are not authorized to open this page.
          </div>
        )}
      </PageShell>
    </div>
  );
}
