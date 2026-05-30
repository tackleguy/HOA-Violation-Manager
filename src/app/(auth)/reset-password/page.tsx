import Link from "next/link";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sendPasswordReset } from "./actions";

export default async function ResetPasswordPage({
  searchParams
}: {
  searchParams: Promise<{ message?: string; error?: string }>;
}) {
  const params = await searchParams;
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Reset password</CardTitle>
          <p className="text-sm text-muted-foreground">Send a secure Supabase recovery link to the account email.</p>
          {params.message ? <p className="text-sm text-primary">{params.message}</p> : null}
          {params.error ? <p className="text-sm text-destructive">{params.error}</p> : null}
        </CardHeader>
        <CardContent>
          <form action={sendPasswordReset} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required placeholder="you@community.com" />
            </div>
            <Button className="w-full" type="submit">
              <Mail className="h-4 w-4" />
              Send recovery link
            </Button>
          </form>
          <Link href="/login" className="mt-5 block text-sm text-muted-foreground hover:text-foreground">
            Back to sign in
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
