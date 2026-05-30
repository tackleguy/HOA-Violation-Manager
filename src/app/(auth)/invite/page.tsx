import Link from "next/link";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function InvitePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Accept invitation</CardTitle>
          <p className="text-sm text-muted-foreground">Use the email address and invite code from your HOAFlow invitation.</p>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Invite code</Label>
              <Input id="code" />
            </div>
            <Button type="button" className="w-full">
              <UserPlus className="h-4 w-4" />
              Continue
            </Button>
          </form>
          <Link href="/login" className="mt-5 block text-sm text-muted-foreground hover:text-foreground">
            Already have access?
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
