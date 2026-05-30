"use client";

import { useState, useTransition } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ExportEntity } from "@/lib/services/export-service";

type ExportButtonProps = {
  entity: ExportEntity;
  label?: string;
  href?: string;
};

export function ExportButton({ entity, label, href = `/api/export/${entity}` }: ExportButtonProps) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleExport() {
    startTransition(async () => {
      setError(null);
      try {
        const response = await fetch(href);
        if (!response.ok) {
          const payload = await response.json().catch(() => null);
          throw new Error(payload?.error ?? "Export failed.");
        }
        const blob = await response.blob();
        const disposition = response.headers.get("Content-Disposition") ?? "";
        const match = disposition.match(/filename="(.+)"/);
        const filename = match?.[1] ?? `${entity}.csv`;
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = filename;
        anchor.click();
        URL.revokeObjectURL(url);
      } catch (exportError) {
        setError(exportError instanceof Error ? exportError.message : "Export failed.");
      }
    });
  }

  return (
    <div className="space-y-1">
      <Button variant="outline" size="sm" onClick={handleExport} disabled={pending}>
        <Download className="h-4 w-4" />
        {pending ? "Exporting..." : (label ?? "Export CSV")}
      </Button>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
