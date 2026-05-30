import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type SummaryTableProps = {
  title: string;
  columns: string[];
  rows: Record<string, string | number>[];
  emptyMessage?: string;
};

export function SummaryTable({ title, columns, rows, emptyMessage = "No data available." }: SummaryTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  {columns.map((column) => (
                    <th key={column} className="px-3 py-2 font-medium capitalize">
                      {column.replace(/_/g, " ")}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={index} className="border-b last:border-0">
                    {columns.map((column) => (
                      <td key={column} className="px-3 py-2">
                        {row[column]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
