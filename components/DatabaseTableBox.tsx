type DatabaseTableBoxProps = {
  title: string;
  rows: Record<string, unknown>[];
};

function formatCellValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "—";
  }

  if (value instanceof Date) {
    return value.toLocaleString();
  }

  return String(value);
}

export default function DatabaseTableBox({
  title,
  rows,
}: DatabaseTableBoxProps) {
  const columns =
    rows.length > 0 ? Object.keys(rows[0]) : [];

  return (
    <section className="rounded-xl border border-zinc-200 bg-white shadow-sm">
      <div className="border-b border-zinc-200 px-5 py-4">
        <h3 className="text-lg font-semibold text-zinc-900">{title}</h3>
        <p className="mt-1 text-sm text-zinc-500">
          {rows.length} record{rows.length === 1 ? "" : "s"}
        </p>
      </div>

      {rows.length === 0 ? (
        <p className="px-5 py-8 text-sm text-zinc-500">No records found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-200 text-sm">
            <thead className="bg-zinc-50">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column}
                    className="px-4 py-3 text-left font-medium text-zinc-700"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-zinc-50/80">
                  {columns.map((column) => (
                    <td
                      key={column}
                      className="px-4 py-3 whitespace-nowrap text-zinc-800"
                    >
                      {formatCellValue(row[column])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
