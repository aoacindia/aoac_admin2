type EmptyStateProps = {
  title: string;
  description?: string;
};

export default function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-zinc-200 bg-white px-6 py-16 text-center shadow-sm">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100 text-zinc-400">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="h-7 w-7"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 9.75h16.5m-16.5 4.5h16.5M6 4.5h12A2.25 2.25 0 0 1 20.25 6.75v10.5A2.25 2.25 0 0 1 18 19.5H6a2.25 2.25 0 0 1-2.25-2.25V6.75A2.25 2.25 0 0 1 6 4.5Z"
          />
        </svg>
      </div>
      <p className="text-base font-medium text-zinc-800">{title}</p>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-zinc-500">{description}</p>
      )}
    </div>
  );
}
