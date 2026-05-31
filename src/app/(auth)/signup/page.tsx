import Link from "next/link";
import { redirect } from "next/navigation";
import { Building2, Sparkles, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { hasSupabasePublicEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { signUpWithOrganization } from "./actions";

export default async function SignupPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const hasSupabaseConfig = hasSupabasePublicEnv();
  if (hasSupabaseConfig) {
    const supabase = await createClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (user) redirect("/dashboard");
  }

  const params = await searchParams;

  return (
    <main className="grid min-h-screen bg-muted/40 lg:grid-cols-[0.95fr_1.05fr]">
      <section className="hidden border-r bg-[hsl(240_6%_10%)] p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <Link href="/" className="flex items-center gap-3 font-semibold">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-white text-[hsl(240_6%_10%)]">HF</span>
          HOAFlow
        </Link>
        <div>
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-lg bg-white/10">
            <Building2 className="h-7 w-7" />
          </div>
          <h1 className="max-w-xl text-3xl font-semibold tracking-tight">Launch a secure HOA workspace in minutes.</h1>
          <p className="mt-5 max-w-lg text-white/70">
            Create your organization, invite board members, and start managing violations, inspections, and community records from one place.
          </p>
        </div>
      </section>
      <section className="flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Create your HOAFlow workspace</CardTitle>
            {!hasSupabaseConfig ? (
              <p className="text-sm text-muted-foreground">
                Add Supabase environment variables to enable account creation. The product UI remains available for local preview.
              </p>
            ) : null}
            {params.error ? <p className="text-sm text-destructive">{params.error}</p> : null}
            {params.message ? <p className="text-sm text-primary">{params.message}</p> : null}
          </CardHeader>
          <CardContent className="space-y-6">
            <form action={signUpWithOrganization} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full name</Label>
                <Input id="full_name" name="full_name" autoComplete="name" required placeholder="Jordan Lee" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Work email</Label>
                <Input id="email" name="email" type="email" autoComplete="email" required placeholder="you@community.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="organization_name">HOA / community name</Label>
                <Input id="organization_name" name="organization_name" required placeholder="Evergreen Ridge HOA" />
              </div>
              <Button type="submit" className="w-full">
                <Sparkles className="h-4 w-4" />
                Create workspace
              </Button>
            </form>
            <div className="border-t pt-5 text-center text-xs text-muted-foreground">
              By creating a workspace, you agree to our{" "}
              <Link href="/terms" className="text-foreground hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-foreground hover:underline">
                Privacy Policy
              </Link>
              .
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Already have access?</span>
              <Link href="/login" className="inline-flex items-center gap-1 hover:text-foreground">
                <UserPlus className="h-4 w-4" />
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
