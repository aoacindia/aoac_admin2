import { redirect } from "next/navigation";
import Header from "@/components/Header";
import PageShell from "@/components/PageShell";
import SessionExpiryGuard from "@/components/SessionExpiryGuard";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export default async function FeedbackPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const feedback = await prisma.feedback.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex min-h-full flex-col bg-zinc-50">
      <SessionExpiryGuard expiresAt={session.expiresAt} />
      <Header email={session.email} showLogout />
      <PageShell title="Feedback" description="Customer feedback">
        {feedback.length === 0 ? (
          <div className="rounded-xl border border-zinc-200 bg-white p-10 text-center text-zinc-500 shadow-sm">
            No feedback
          </div>
        ) : (
          <div className="space-y-3">
            {feedback.map((item) => (
              <article
                key={item.id}
                className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm"
              >
                <p className="text-sm font-medium text-zinc-900">
                  {item.name || "Anonymous"}
                  {item.email ? ` · ${item.email}` : ""}
                </p>
                <p className="mt-2 text-sm text-zinc-700">{item.message}</p>
              </article>
            ))}
          </div>
        )}
      </PageShell>
    </div>
  );
}
