"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardError({ reset }: { reset: () => void }) {
  return (
    <div className="flex min-h-96 flex-col items-center justify-center rounded-lg border bg-card p-8 text-center">
      <AlertTriangle className="mb-4 h-8 w-8 text-destructive" />
      <h2 className="text-lg font-semibold">Dashboard failed to load</h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">Retry the request. Persistent failures should be visible in Vercel and Supabase logs.</p>
      <Button onClick={reset} className="mt-5">Retry</Button>
    </div>
  );
}
