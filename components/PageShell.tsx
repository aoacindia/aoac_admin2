import Link from "next/link";

type PageShellProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
  backHref?: string;
};

export default function PageShell({
  title,
  description,
  children,
  backHref = "/dashboard",
}: PageShellProps) {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
      <div className="mb-6">
        <Link
          href={backHref}
          className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
        >
          ← Back to dashboard
        </Link>
        <h2 className="mt-3 text-2xl font-semibold text-zinc-900">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-zinc-500">{description}</p>
        )}
      </div>
      {children}
    </main>
  );
}
