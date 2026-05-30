import Link from "next/link";
import { navigation } from "@/lib/constants";

export function Sidebar() {
  return (
    <aside className="hidden min-h-screen border-r bg-card lg:block">
      <div className="sticky top-0 p-4">
        <Link href="/dashboard" className="mb-8 flex items-center gap-2 font-semibold">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">HF</span>
          HOAFlow
        </Link>
        <nav className="space-y-1">
          {navigation.map((item) => (
            <Link key={item.name} href={item.href} className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}
