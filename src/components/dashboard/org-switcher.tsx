"use client";

import { Building2, Check, ChevronsUpDown } from "lucide-react";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export type OrganizationOption = {
  id: string;
  name: string;
  slug?: string;
  plan?: string;
};

type OrgSwitcherProps = {
  organizations: OrganizationOption[];
  currentOrganizationId: string;
  switchOrganizationAction: (formData: FormData) => Promise<void>;
  className?: string;
};

export function OrgSwitcher({ organizations, currentOrganizationId, switchOrganizationAction, className }: OrgSwitcherProps) {
  const [isPending, startTransition] = useTransition();
  const current = organizations.find((organization) => organization.id === currentOrganizationId) ?? organizations[0];

  function handleSwitch(organizationId: string) {
    if (organizationId === currentOrganizationId) return;
    startTransition(async () => {
      const formData = new FormData();
      formData.set("organization_id", organizationId);
      formData.set("return_to", "/dashboard");
      await switchOrganizationAction(formData);
    });
  }

  if (!current) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={cn("h-auto min-w-[200px] justify-between px-3 py-2", className)} disabled={isPending}>
          <span className="flex min-w-0 items-center gap-2 text-left">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Building2 className="h-4 w-4" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium">{current.name}</span>
              {current.plan ? <span className="block truncate text-xs text-muted-foreground">{current.plan}</span> : null}
            </span>
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[240px]">
        <DropdownMenuLabel>Switch organization</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {organizations.map((organization) => (
          <DropdownMenuItem key={organization.id} onClick={() => handleSwitch(organization.id)} className="gap-2">
            <Check className={cn("h-4 w-4", organization.id === currentOrganizationId ? "opacity-100" : "opacity-0")} />
            <span className="min-w-0 flex-1 truncate">{organization.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
