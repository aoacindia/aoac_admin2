import { redirect } from "next/navigation";
import Header from "@/components/Header";
import SessionExpiryGuard from "@/components/SessionExpiryGuard";
import { getSession } from "@/lib/session";

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-full flex-col bg-zinc-50">
      <SessionExpiryGuard expiresAt={session.expiresAt} />
      <Header />
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
        <div className="rounded-xl border border-zinc-200 bg-white p-8 shadow-sm">
          <h2 className="mb-2 text-xl font-semibold text-zinc-900">Dashboard</h2>
          <p className="mb-6 text-sm text-zinc-500">
            Signed in as {session.email}
          </p>

          <div
            role="alert"
            className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-4 text-amber-900"
          >
            <p className="font-medium">Database Error</p>
            <p className="mt-1 text-sm">
              There is a error in the fetching the data from database please try
              again
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
