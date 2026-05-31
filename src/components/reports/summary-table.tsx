type SummaryTableProps = {
  title: string;
  columns: string[];
  rows: Record<string, string | number>[];
  emptyMessage?: string;
};

export function SummaryTable({ title, columns, rows, emptyMessage = "No data available." }: SummaryTableProps) {
  return (
    <div className="section-stack">
      <h2 className="text-sm font-medium">{title}</h2>
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table-minimal">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column} className="capitalize">
                    {column.replace(/_/g, " ")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={index}>
                  {columns.map((column) => (
                    <td key={column}>{row[column]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
