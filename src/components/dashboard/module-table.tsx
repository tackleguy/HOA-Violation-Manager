import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ModuleTableProps = {
  title: string;
  columns: string[];
  rows: Array<Record<string, string | number>>;
};

export function ModuleTable({ title, columns, rows }: ModuleTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-muted-foreground">
              <tr>
                {columns.map((column) => (
                  <th key={column} className="border-b py-3 pr-4 font-medium">{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={index} className="border-b last:border-0">
                  {columns.map((column, cellIndex) => {
                    const value = row[column];
                    return (
                      <td key={column} className="py-3 pr-4">
                        {cellIndex === columns.length - 1 ? <Badge variant="outline">{value}</Badge> : value}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
