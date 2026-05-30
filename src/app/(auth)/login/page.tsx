import Link from "next/link";
import { redirect } from "next/navigation";
import { Building2, KeyRound, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <main className="grid min-h-screen bg-muted/40 lg:grid-cols-[0.95fr_1.05fr]">
      <section className="hidden border-r bg-secondary p-10 text-secondary-foreground lg:flex lg:flex-col lg:justify-between">
        <Link href="/" className="flex items-center gap-3 font-semibold">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary">HF</span>
          HOAFlow
        </Link>
        <div>
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-lg bg-white/10">
            <Building2 className="h-7 w-7" />
          </div>
          <h1 className="max-w-xl text-4xl font-semibold">Secure community operations for modern HOA teams.</h1>
          <p className="mt-5 max-w-lg text-secondary-foreground/70">Session handling is backed by Supabase Auth and tenant membership checks in the database.</p>
        </div>
      </section>
      <section className="flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Sign in to HOAFlow</CardTitle>
            {!hasSupabaseConfig ? (
              <p className="text-sm text-muted-foreground">
                Add Supabase environment variables to enable authentication. The product UI remains available for local preview.
              </p>
            ) : null}
            {params.error ? <p className="text-sm text-destructive">{params.error}</p> : null}
            {params.message ? <p className="text-sm text-primary">{params.message}</p> : null}
          </CardHeader>
          <CardContent className="space-y-6">
            <form action={signInWithPassword} className="space-y-4">
              <input type="hidden" name="next" value={params.next ?? "/dashboard"} />
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" autoComplete="email" required placeholder="you@community.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" autoComplete="current-password" required />
              </div>
              <Button type="submit" className="w-full">
                <KeyRound className="h-4 w-4" />
                Sign in
              </Button>
            </form>
            <form action={signInWithMagicLink} className="space-y-3 border-t pt-5">
              <Label htmlFor="magic-email">Magic link</Label>
              <div className="flex gap-2">
                <Input id="magic-email" name="email" type="email" required placeholder="you@community.com" />
                <Button type="submit" variant="outline" aria-label="Send magic link">
                  <Mail className="h-4 w-4" />
                </Button>
              </div>
            </form>
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
              <Link href="/reset-password" className="hover:text-foreground">Reset password</Link>
              <Link href="/invite" className="hover:text-foreground">Accept invite</Link>
              <Link href="/signup" className="hover:text-foreground">Create workspace</Link>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
