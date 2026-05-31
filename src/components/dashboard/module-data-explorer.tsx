"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowDownAZ, ArrowUpAZ, ChevronLeft, ChevronRight, Search, SlidersHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type ModuleRow = Record<string, string | number> & {
  _id?: string;
  _href?: string;
};

type ModuleDataExplorerProps = {
  title: string;
  emptyTitle: string;
  emptyDescription: string;
  emptyAction: string;
  columns: string[];
  rows: ModuleRow[];
};

const PAGE_SIZE = 10;

function formatColumnLabel(column: string) {
  return column.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function ModuleDataExplorer({
  title,
  emptyTitle,
  emptyDescription,
  emptyAction,
  columns,
  rows
}: ModuleDataExplorerProps) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortColumn, setSortColumn] = useState(columns[0] ?? "");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);

  const filterColumn = useMemo(() => {
    return columns.find((column) => ["status", "severity", "access", "completion"].includes(column)) ?? columns.at(-1) ?? "";
  }, [columns]);

  const filterOptions = useMemo(() => {
    const values = new Set(rows.map((row) => String(row[filterColumn] ?? "")).filter(Boolean));
    return ["all", ...Array.from(values).sort((a, b) => a.localeCompare(b))];
  }, [filterColumn, rows]);

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return rows
      .filter((row) => {
        const matchesQuery =
          normalizedQuery.length === 0 ||
          columns.some((column) => String(row[column] ?? "").toLowerCase().includes(normalizedQuery));
        const matchesFilter = statusFilter === "all" || String(row[filterColumn] ?? "") === statusFilter;

        return matchesQuery && matchesFilter;
      })
      .sort((a, b) => {
        const left = String(a[sortColumn] ?? "");
        const right = String(b[sortColumn] ?? "");
        const comparison = left.localeCompare(right, undefined, { numeric: true, sensitivity: "base" });

        return sortDirection === "asc" ? comparison : comparison * -1;
      });
  }, [columns, filterColumn, query, rows, sortColumn, sortDirection, statusFilter]);

  const pageCount = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageRows = filteredRows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function updateQuery(value: string) {
    setQuery(value);
    setPage(1);
  }

  function updateFilter(value: string) {
    setStatusFilter(value);
    setPage(1);
  }

  if (rows.length === 0) {
    return <EmptyState icon={Search} title={emptyTitle} description={emptyDescription} action={emptyAction} />;
  }

  return (
    <div className="space-y-3">
      <Card>
        <CardContent className="grid gap-2 pt-1 sm:grid-cols-2 lg:grid-cols-[minmax(220px,1fr)_160px_160px_auto]">
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input
              className="pl-9"
              placeholder={`Search ${title.toLowerCase()}…`}
              value={query}
              onChange={(event) => updateQuery(event.target.value)}
              aria-label={`Search ${title}`}
            />
          </div>
          <label className="flex h-9 items-center gap-2 rounded-md border border-border/80 bg-background px-3 text-sm shadow-subtle">
            <SlidersHorizontal className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
            <select
              className="min-w-0 flex-1 bg-transparent text-sm outline-none"
              value={statusFilter}
              onChange={(event) => updateFilter(event.target.value)}
              aria-label={`Filter ${title}`}
            >
              {filterOptions.map((option) => (
                <option key={option} value={option}>
                  {option === "all" ? "All records" : option}
                </option>
              ))}
            </select>
          </label>
          <label className="flex h-9 items-center gap-2 rounded-md border border-border/80 bg-background px-3 text-sm shadow-subtle">
            <span className="shrink-0 text-muted-foreground">Sort</span>
            <select
              className="min-w-0 flex-1 bg-transparent text-sm outline-none"
              value={sortColumn}
              onChange={(event) => setSortColumn(event.target.value)}
              aria-label={`Sort ${title}`}
            >
              {columns.map((column) => (
                <option key={column} value={column}>
                  {formatColumnLabel(column)}
                </option>
              ))}
            </select>
          </label>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label={`Sort ${sortDirection === "asc" ? "descending" : "ascending"}`}
            onClick={() => setSortDirection((direction) => (direction === "asc" ? "desc" : "asc"))}
          >
            {sortDirection === "asc" ? <ArrowDownAZ className="h-4 w-4" /> : <ArrowUpAZ className="h-4 w-4" />}
          </Button>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 border-b bg-muted/20 py-3">
          <CardTitle>{title}</CardTitle>
          <Badge variant="outline" className="font-normal tabular-nums">
            {filteredRows.length} of {rows.length}
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          {pageRows.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="sticky top-0 z-10 bg-card text-xs text-muted-foreground">
                  <tr className="border-b">
                    {columns.map((column) => (
                      <th key={column} scope="col" className="px-4 py-2.5 font-medium">
                        {formatColumnLabel(column)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((row, index) => (
                    <tr
                      key={`${safePage}-${index}-${columns.map((column) => row[column]).join("-")}`}
                      className="interactive-row border-b last:border-0"
                    >
                      {columns.map((column, cellIndex) => {
                        const value = row[column];
                        const href = row._href;
                        const isStatusColumn = cellIndex === columns.length - 1;

                        return (
                          <td key={column} className="px-4 py-3 align-middle">
                            {cellIndex === 0 && href ? (
                              <Link href={String(href)} className="font-medium text-foreground hover:underline">
                                {value}
                              </Link>
                            ) : isStatusColumn ? (
                              <Badge variant="outline" className="font-normal">
                                {value}
                              </Badge>
                            ) : (
                              <span className={cn(isStatusColumn ? "" : "text-foreground/90")}>{value}</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6">
              <EmptyState icon={Search} title="No matching records" description="Try adjusting your search or filter criteria." />
            </div>
          )}
          <div className="flex flex-col gap-3 border-t bg-muted/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground tabular-nums">
              Page {safePage} of {pageCount}
            </p>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" disabled={safePage === 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button type="button" variant="outline" size="sm" disabled={safePage === pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))}>
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
