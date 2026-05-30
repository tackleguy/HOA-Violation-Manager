import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type PortalCardProps = {
  title: string;
  description: string;
  value?: string | number;
  icon: LucideIcon;
  footer?: string;
};

export function PortalCard({ title, description, value, icon: Icon, footer }: PortalCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle className="text-base">{title}</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="rounded-md bg-primary/10 p-2 text-primary">
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      {value !== undefined ? (
        <CardContent>
          <div className="text-3xl font-semibold">{value}</div>
          {footer ? <p className="mt-1 text-xs text-muted-foreground">{footer}</p> : null}
        </CardContent>
      ) : null}
    </Card>
  );
}
