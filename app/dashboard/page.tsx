import { redirect } from "next/navigation";
import DashboardModules from "@/components/DashboardModules";
import Header from "@/components/Header";
import SessionExpiryGuard from "@/components/SessionExpiryGuard";
import { canCreateEmailAccounts } from "@/lib/permissions";
import { getSession } from "@/lib/session";

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-full flex-col bg-[#F8F9FA]">
      <SessionExpiryGuard expiresAt={session.expiresAt} />
      <Header email={session.email} showLogout />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">
            Dashboard
          </h2>
          <p className="mt-2 text-sm text-zinc-500">
            Choose a module to manage AOAC admin data.
          </p>
        </div>
        <DashboardModules canCreateEmail={canCreateEmailAccounts(session.email)} />
      </main>
    </div>
  );
}
