import Link from "next/link";
import { redirect } from "next/navigation";
import { Building2, KeyRound, Mail } from "lucide-react";
import { FormStatus } from "@/components/a11y/form-status";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { hasSupabasePublicEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { signInWithMagicLink, signInWithPassword } from "./actions";

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string; message?: string; next?: string }>;
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
    <main id="main-content" tabIndex={-1} className="grid min-h-screen bg-muted/40 outline-none lg:grid-cols-[0.95fr_1.05fr]">
      <section className="hidden border-r bg-[hsl(240_6%_10%)] p-10 text-white lg:flex lg:flex-col lg:justify-between" aria-label="Product overview">
        <div className="flex items-center gap-3 font-semibold">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-white text-[hsl(240_6%_10%)]" aria-hidden>
            HF
          </span>
          HOAFlow
        </div>
        <div>
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-lg bg-white/10">
            <Building2 className="h-7 w-7" aria-hidden />
          </div>
          <p className="max-w-xl text-3xl font-semibold tracking-tight">Secure community operations for modern HOA teams.</p>
          <p className="mt-5 max-w-lg text-white/80">Session handling is backed by Supabase Auth and tenant membership checks in the database.</p>
        </div>
      </section>
      <section className="flex items-center justify-center px-4 py-12" aria-labelledby="login-heading">
        <Card className="w-full max-w-md">
          <CardHeader>
            <h1 id="login-heading" className="text-lg font-semibold tracking-tight">
              Sign in to HOAFlow
            </h1>
            {!hasSupabaseConfig ? (
              <p className="text-sm text-muted-foreground">
                Add Supabase environment variables to enable authentication. The product UI remains available for local preview.
              </p>
            ) : null}
            <FormStatus error={params.error} message={params.message} />
          </CardHeader>
          <CardContent className="space-y-6">
            <form action={signInWithPassword} className="space-y-4" aria-describedby={params.error ? "form-error" : undefined}>
              <input type="hidden" name="next" value={params.next ?? "/dashboard"} />
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="you@community.com"
                  aria-invalid={params.error ? true : undefined}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" autoComplete="current-password" required />
              </div>
              <Button type="submit" className="w-full">
                <KeyRound className="h-4 w-4" aria-hidden />
                Sign in
              </Button>
            </form>
            <form action={signInWithMagicLink} className="space-y-3 border-t pt-5">
              <Label htmlFor="magic-email">Email for magic link</Label>
              <div className="flex gap-2">
                <Input id="magic-email" name="email" type="email" required placeholder="you@community.com" autoComplete="email" />
                <Button type="submit" variant="outline" aria-label="Send magic link" size="icon">
                  <Mail className="h-4 w-4" aria-hidden />
                </Button>
              </div>
            </form>
            <nav aria-label="Account links" className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
              <Link href="/reset-password" className="link-quiet">
                Reset password
              </Link>
              <Link href="/invite" className="link-quiet">
                Accept invite
              </Link>
              <Link href="/signup" className="link-quiet">
                Create workspace
              </Link>
            </nav>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
