import Link from "next/link";
import { KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updatePassword } from "./actions";

export default async function UpdatePasswordPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Choose a new password</CardTitle>
          <p className="text-sm text-muted-foreground">Set a new password after completing the secure recovery email flow.</p>
          {params.error ? <p className="text-sm text-destructive">{params.error}</p> : null}
        </CardHeader>
        <CardContent>
          <form action={updatePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New password</Label>
              <Input id="password" name="password" type="password" minLength={8} required autoComplete="new-password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm_password">Confirm password</Label>
              <Input id="confirm_password" name="confirm_password" type="password" minLength={8} required autoComplete="new-password" />
            </div>
            <Button className="w-full" type="submit">
              <KeyRound className="h-4 w-4" />
              Update password
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
