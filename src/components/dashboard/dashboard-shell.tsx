import Link from "next/link";
import { signOut } from "@/app/(auth)/auth-actions";
import { markAllNotificationsRead, markNotificationRead } from "@/app/dashboard/actions";
import { NotificationBell } from "@/components/dashboard/notification-bell";
import { OrgSwitcher } from "@/components/dashboard/org-switcher";
import { Sidebar } from "@/components/dashboard/sidebar";
import { UserMenu } from "@/components/dashboard/user-menu";
import { CommandMenu } from "@/components/command-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
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
    <div className="grid min-h-screen bg-muted/30 lg:grid-cols-[260px_1fr]">
      <Sidebar />
      <div>
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/70 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            {organizations.length > 1 ? (
              <OrgSwitcher
                organizations={organizations}
                currentOrganizationId={orgContext?.organizationId ?? organizations[0]?.id ?? ""}
                switchOrganizationAction={switchOrganization}
              />
            ) : (
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">{orgName}</div>
                <div className="text-xs text-muted-foreground">{roleLabel}</div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <CommandMenu />
            <NotificationBell
              notifications={notifications}
              unreadCount={unreadCount}
              markReadAction={markNotificationRead}
              markAllReadAction={markAllNotificationsRead}
            />
            <Button variant="outline" size="sm" asChild className="hidden sm:inline-flex">
              <Link href="/dashboard/settings">Invite</Link>
            </Button>
            <ThemeToggle />
            <UserMenu user={profile} signOutAction={signOut} />
          </div>
        </header>
        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
