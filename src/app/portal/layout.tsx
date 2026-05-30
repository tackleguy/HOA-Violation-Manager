import Link from "next/link";
import { signOut } from "@/app/(auth)/auth-actions";
import { PortalNav } from "@/components/portal/portal-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/dashboard/user-menu";
import { getRoleLabel } from "@/lib/permissions";
import { getOrganizationContext } from "@/lib/services/organization-service";
import { createClient } from "@/lib/supabase/server";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const orgContext = await getOrganizationContext();

  let profile = { name: "Resident", email: "resident@hoaflow.app", avatarUrl: null as string | null };
  if (orgContext) {
    const { data } = await orgContext.supabase.from("profiles").select("full_name, email, avatar_url").eq("id", orgContext.userId).maybeSingle();
    profile = {
      name: data?.full_name ?? data?.email ?? "Resident",
      email: data?.email ?? "",
      avatarUrl: data?.avatar_url ?? null
    };
  } else {
    const supabase = await createClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (user) {
      profile = {
        name: user.user_metadata?.full_name ?? user.email ?? "Resident",
        email: user.email ?? "",
        avatarUrl: user.user_metadata?.avatar_url ?? null
      };
    }
  }

  const orgName = orgContext?.organization.name ?? "Demo HOA Workspace";
  const roleLabel = orgContext ? getRoleLabel(orgContext.role) : "Preview mode";

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="min-w-0">
            <Link href="/portal" className="font-semibold">
              HOAFlow Resident Portal
            </Link>
            <div className="truncate text-xs text-muted-foreground">
              {orgName} · {roleLabel}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <UserMenu user={profile} signOutAction={signOut} />
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <PortalNav />
          <Button variant="outline" size="sm" asChild className="w-fit">
            <Link href="/dashboard/search">Search community records</Link>
          </Button>
        </div>
        <main>{children}</main>
      </div>
    </div>
  );
}
