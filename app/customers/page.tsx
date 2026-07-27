import { redirect } from "next/navigation";
import Header from "@/components/Header";
import PageShell from "@/components/PageShell";
import SessionExpiryGuard from "@/components/SessionExpiryGuard";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export default async function CustomersPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex min-h-full flex-col bg-zinc-50">
      <SessionExpiryGuard expiresAt={session.expiresAt} />
      <Header email={session.email} showLogout />
      <PageShell title="Customers" description="Customer directory">
        {customers.length === 0 ? (
          <div className="rounded-xl border border-zinc-200 bg-white p-10 text-center text-zinc-500 shadow-sm">
            No customers listed
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-zinc-200 text-sm">
              <thead className="bg-zinc-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-zinc-700">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-zinc-700">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-zinc-700">
                    Phone
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {customers.map((customer) => (
                  <tr key={customer.id}>
                    <td className="px-4 py-3">{customer.name}</td>
                    <td className="px-4 py-3">{customer.email || "—"}</td>
                    <td className="px-4 py-3">{customer.phone || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </PageShell>
    </div>
  );
}
