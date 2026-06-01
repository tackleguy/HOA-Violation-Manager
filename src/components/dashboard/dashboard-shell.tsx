import { signOut } from "@/app/(auth)/auth-actions";
import { markAllNotificationsRead, markNotificationRead } from "@/app/dashboard/actions";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { NotificationBell } from "@/components/dashboard/notification-bell";
import { Sidebar } from "@/components/dashboard/sidebar";
import { UserMenu } from "@/components/dashboard/user-menu";
import { CommandMenu } from "@/components/command-menu";
import { WorkspaceSetupBanner } from "@/components/dashboard/workspace-setup-banner";
import { getRoleLabel } from "@/lib/permissions";
import { hasSupabasePublicEnv } from "@/lib/env";
import { getNotificationRows, getUnreadNotificationCount } from "@/lib/services/notification-service";
import { getOrganizationContext } from "@/lib/services/organization-service";
import { createClient } from "@/lib/supabase/server";

export async function DashboardShell({ children }: { children: React.ReactNode }) {
  const orgContext = await getOrganizationContext();
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

  const hasLiveAuth = hasSupabasePublicEnv() && profile.email !== "demo@hoaflow.app";
  const needsWorkspace = hasLiveAuth && !orgContext;
  const orgName = orgContext?.organization.name ?? (needsWorkspace ? "No workspace" : "Demo HOA Workspace");
  const roleLabel = orgContext ? getRoleLabel(orgContext.role) : needsWorkspace ? "Setup required" : "Preview mode";

  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-[var(--sidebar-width)_1fr]">
      <Sidebar orgName={orgName} roleLabel={roleLabel} />
      <div className="flex min-h-screen min-w-0 flex-col">
        <header className="sticky top-0 z-30 border-b border-border/80 bg-background">
          <div className="flex h-12 items-center gap-3 px-4 lg:px-6">
            <MobileNav orgName={orgName} roleLabel={roleLabel} />
            <div className="flex flex-1 items-center justify-end gap-1">
              <CommandMenu />
              <NotificationBell
                notifications={notifications}
                unreadCount={unreadCount}
                markReadAction={markNotificationRead}
                markAllReadAction={markAllNotificationsRead}
              />
              <UserMenu user={profile} signOutAction={signOut} />
            </div>
          </div>
        </header>
        <main className="flex-1 px-4 py-8 lg:px-8">
          <div className="page-container">
            {needsWorkspace ? <WorkspaceSetupBanner /> : null}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
