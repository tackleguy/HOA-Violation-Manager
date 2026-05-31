"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { SidebarNav } from "@/components/dashboard/sidebar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

type MobileNavProps = {
  orgName?: string;
  roleLabel?: string;
};

export function MobileNav({ orgName, roleLabel }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation menu">
          <Menu className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[260px] p-0">
        <SheetTitle className="sr-only">Navigation menu</SheetTitle>
        <SidebarNav orgName={orgName} roleLabel={roleLabel} onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}

export function MobileBrand() {
  return (
    <Link href="/dashboard" className="focus-ring truncate text-sm font-medium lg:hidden">
      HOAFlow
    </Link>
  );
}
