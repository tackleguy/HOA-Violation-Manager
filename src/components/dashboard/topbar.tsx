import { Bell, UserPlus } from "lucide-react";
import { CommandMenu } from "@/components/command-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

export function Topbar() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/70 sm:px-6">
      <div>
        <div className="text-sm font-medium">Evergreen Ridge HOA</div>
        <div className="text-xs text-muted-foreground">Production tenant workspace</div>
      </div>
      <div className="flex items-center gap-2">
        <CommandMenu />
        <Button variant="outline" size="icon" aria-label="Notifications">
          <Bell className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" aria-label="Invite user">
          <UserPlus className="h-4 w-4" />
        </Button>
        <ThemeToggle />
      </div>
    </header>
  );
}
