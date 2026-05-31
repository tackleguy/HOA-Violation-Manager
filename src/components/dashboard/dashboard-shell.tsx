import Link from "next/link";
import { signOut } from "@/app/(auth)/auth-actions";
import { markAllNotificationsRead, markNotificationRead } from "@/app/dashboard/actions";
import { MobileBrand, MobileNav } from "@/components/dashboard/mobile-nav";
import { NotificationBell } from "@/components/dashboard/notification-bell";
import { OrgSwitcher } from "@/components/dashboard/org-switcher";
import { Sidebar } from "@/components/dashboard/sidebar";
import { UserMenu } from "@/components/dashboard/user-menu";
import { CommandMenu } from "@/components/command-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getRoleLabel } from "@/lib/permissions";
import { hasSupabasePublicEnv } from "@/lib/env";
import { getNotificationRows, getUnreadNotificationCount } from "@/lib/services/notification-service";
import { switchOrganization } from "@/app/dashboard/actions";
import { getCurrentMemberships, getOrganizationContext } from "@/lib/services/organization-service";
import { createClient } from "@/lib/supabase/server";

export async function DashboardShell({ children }: { children: React.ReactNode }) {
  const orgContext = await getOrganizationContext();
  const memberships = await getCurrentMemberships();
  const notifications = await getNotificationRows();
  const unreadCount = await getUnreadNotificationCount();

  let profile = { name: "Demo User", email: "demo@hoaflow.app", avatarUrl: null as string | null };
  if (orgContext) {
    const { data } = await orgContext.supabase.from("profiles").select("full_name, email, avatar_url").eq("id", orgContext.userId).maybeSingle();
    profile = {
      name: data?.full_name ?? data?.email ?? "HOAFlow User",
      email: data?.email ?? "",
      avatarUrl: data?.avatar_url ?? null
    };
  } else if (hasSupabasePublicEnv()) {
    const supabase = await createClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (user) {
      profile = {
        name: user.user_metadata?.full_name ?? user.email ?? "HOAFlow User",
        email: user.email ?? "",
        avatarUrl: user.user_metadata?.avatar_url ?? null
      };
    }
  }

  const organizations = memberships.map((membership) => ({
    id: membership.organization_id,
    name: membership.organizations?.name ?? "HOA Workspace",
    plan: membership.organizations?.plan ?? "professional"
  }));

  const orgName = orgContext?.organization.name ?? "Demo HOA Workspace";
  const roleLabel = orgContext ? getRoleLabel(orgContext.role) : "Preview mode";

  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-[var(--sidebar-width)_1fr]">
      <Sidebar />
      <div className="flex min-h-screen min-w-0 flex-col">
        <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-14 items-center gap-3 px-4 sm:px-5 lg:px-6">
            <MobileNav />
            <MobileBrand />
            <Separator orientation="vertical" className="hidden h-5 lg:block" />
            <div className="hidden min-w-0 flex-1 lg:block">
              {organizations.length > 1 ? (
                <OrgSwitcher
                  organizations={organizations}
                  currentOrganizationId={orgContext?.organizationId ?? organizations[0]?.id ?? ""}
                  switchOrganizationAction={switchOrganization}
                />
              ) : (
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium tracking-tight">{orgName}</div>
                  <div className="text-2xs text-muted-foreground">{roleLabel}</div>
                </div>
              )}
            </div>
            <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
              <CommandMenu />
              <NotificationBell
                notifications={notifications}
                unreadCount={unreadCount}
                markReadAction={markNotificationRead}
                markAllReadAction={markAllNotificationsRead}
              />
              <Button variant="outline" size="sm" asChild className="hidden h-8 sm:inline-flex">
                <Link href="/dashboard/settings">Invite</Link>
              </Button>
              <ThemeToggle />
              <UserMenu user={profile} signOutAction={signOut} />
            </div>
          </div>
        </header>
        <main className="flex-1 px-4 py-5 sm:px-5 lg:px-6">
          <div className="page-container animate-in">{children}</div>
        </main>
      </div>
    </div>
  );
}
