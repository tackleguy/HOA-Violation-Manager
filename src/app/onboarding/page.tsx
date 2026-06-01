import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCurrentMemberships } from "@/lib/services/organization-service";
import { hasSupabasePublicEnv } from "@/lib/env";
import { createWorkspace } from "./actions";

export default async function OnboardingPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (!hasSupabasePublicEnv()) {
    redirect("/login?error=Supabase environment variables are required.");
  }

  const memberships = await getCurrentMemberships();
  if (memberships.length > 0) {
    redirect("/dashboard");
  }

  const params = await searchParams;

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
      <Link href="/" className="mb-10 text-sm font-semibold tracking-tight">
        HOAFlow
      </Link>
      <h1 className="text-2xl font-semibold tracking-tight">Create your workspace</h1>
      <p className="mt-2 text-sm text-muted-foreground">Set up an HOA organization to start managing violations, residents, and records.</p>
      {params.error ? <p className="mt-4 text-sm text-destructive">{params.error}</p> : null}
      <form action={createWorkspace} className="mt-8 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="organization_name">HOA / community name</Label>
          <Input id="organization_name" name="organization_name" required placeholder="Evergreen Ridge HOA" />
        </div>
        <Button type="submit" className="w-full">
          Create workspace
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Invited to an existing HOA?{" "}
        <Link href="/invite" className="text-foreground hover:underline">
          Accept invite
        </Link>
      </p>
    </main>
  );
}
