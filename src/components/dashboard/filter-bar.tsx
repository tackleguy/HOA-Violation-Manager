"use client";

import * as React from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type FilterOption = {
  label: string;
  value: string;
};

export type FilterConfig = {
  id: string;
  label: string;
  options: FilterOption[];
  value?: string;
};

export type FilterBarProps = {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  filters?: FilterConfig[];
  onFilterChange?: (filterId: string, value: string) => void;
  onClear?: () => void;
  className?: string;
  actions?: React.ReactNode;
};

export function FilterBar({
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Search records…",
  filters = [],
  onFilterChange,
  onClear,
  className,
  actions
}: FilterBarProps) {
  const hasActiveFilters = searchValue.trim().length > 0 || filters.some((filter) => filter.value && filter.value !== "all");

  return (
    <div className={cn("flex flex-col gap-3 rounded-md border bg-card p-4 lg:flex-row lg:items-center lg:justify-between", className)}>
      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchValue}
            onChange={(event) => onSearchChange?.(event.target.value)}
            placeholder={searchPlaceholder}
            className="pl-9"
          />
        </div>
        {filters.map((filter) => (
          <Select
            key={filter.id}
            value={filter.value ?? "all"}
            onValueChange={(value) => onFilterChange?.(filter.id, value)}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SlidersHorizontal className="mr-2 h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder={filter.label} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All {filter.label}</SelectItem>
              {filter.options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}
        {hasActiveFilters && onClear ? (
          <Button variant="ghost" size="sm" onClick={onClear}>
            <X className="h-4 w-4" />
            Clear
          </Button>
        ) : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}
