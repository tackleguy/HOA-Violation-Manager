import Link from "next/link";
import { Button } from "@/components/ui/button";

export function WorkspaceSetupBanner() {
  return (
    <div className="mb-8 border-b border-border/80 pb-8">
      <h2 className="text-lg font-medium">Finish workspace setup</h2>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        You are signed in, but no HOA workspace is linked to this account yet. Create a workspace or accept an invite to
        load live data.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button asChild size="sm">
          <Link href="/onboarding">Create workspace</Link>
        </Button>
        <Button asChild size="sm" variant="outline">
          <Link href="/invite">Accept invite</Link>
        </Button>
      </div>
    </div>
  );
}
