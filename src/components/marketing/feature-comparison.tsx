import { Check, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

type FeatureRow = {
  feature: string;
  starter: boolean | string;
  professional: boolean | string;
  enterprise: boolean | string;
};

const rows: FeatureRow[] = [
  { feature: "Violation workflow", starter: true, professional: true, enterprise: true },
  { feature: "Resident & property records", starter: true, professional: true, enterprise: true },
  { feature: "Inspections & photo evidence", starter: false, professional: true, enterprise: true },
  { feature: "Document versioning", starter: false, professional: true, enterprise: true },
  { feature: "Architectural review", starter: false, professional: true, enterprise: true },
  { feature: "Audit activity log", starter: "30 days", professional: "1 year", enterprise: "Unlimited" },
  { feature: "Multi-community portfolio", starter: false, professional: false, enterprise: true },
  { feature: "SSO & advanced roles", starter: false, professional: false, enterprise: true }
];

function CellValue({ value }: { value: boolean | string }) {
  if (typeof value === "string") return <span className="text-sm font-medium">{value}</span>;
  return value ? <Check className="mx-auto h-4 w-4 text-primary" /> : <Minus className="mx-auto h-4 w-4 text-muted-foreground" />;
}

export function FeatureComparison() {
  return (
    <div className="overflow-x-auto rounded-md border bg-card">
      <table className="w-full min-w-[720px] text-sm">
        <thead>
          <tr className="border-b bg-muted/40">
            <th className="px-4 py-3 text-left font-medium">Feature</th>
            <th className="px-4 py-3 text-center font-medium">Starter</th>
            <th className="px-4 py-3 text-center font-medium">Professional</th>
            <th className="px-4 py-3 text-center font-medium">Enterprise</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.feature} className={cn("border-b last:border-0", index % 2 === 1 && "bg-muted/20")}>
              <td className="px-4 py-3 font-medium">{row.feature}</td>
              <td className="px-4 py-3 text-center"><CellValue value={row.starter} /></td>
              <td className="px-4 py-3 text-center"><CellValue value={row.professional} /></td>
              <td className="px-4 py-3 text-center"><CellValue value={row.enterprise} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
