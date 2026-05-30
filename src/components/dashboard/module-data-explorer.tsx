"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowDownAZ, ArrowUpAZ, ChevronLeft, ChevronRight, Search, SlidersHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";

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

const PAGE_SIZE = 8;

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

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="grid gap-3 pt-5 md:grid-cols-[minmax(220px,1fr)_180px_180px_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder={`Search ${title.toLowerCase()}`}
              value={query}
              onChange={(event) => updateQuery(event.target.value)}
            />
          </div>
          <label className="flex h-10 items-center gap-2 rounded-md border bg-background px-3 text-sm">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            <select
              className="min-w-0 flex-1 bg-transparent outline-none"
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
          <label className="flex h-10 items-center gap-2 rounded-md border bg-background px-3 text-sm">
            <span className="text-muted-foreground">Sort</span>
            <select
              className="min-w-0 flex-1 bg-transparent outline-none"
              value={sortColumn}
              onChange={(event) => setSortColumn(event.target.value)}
              aria-label={`Sort ${title}`}
            >
              {columns.map((column) => (
                <option key={column} value={column}>
                  {column}
                </option>
              ))}
            </select>
          </label>
          <Button
            type="button"
            variant="outline"
            aria-label={`Sort ${sortDirection === "asc" ? "descending" : "ascending"}`}
            onClick={() => setSortDirection((direction) => (direction === "asc" ? "desc" : "asc"))}
          >
            {sortDirection === "asc" ? <ArrowDownAZ className="h-4 w-4" /> : <ArrowUpAZ className="h-4 w-4" />}
          </Button>
        </CardContent>
      </Card>

      {rows.length === 0 ? (
        <EmptyState icon={Search} title={emptyTitle} description={emptyDescription} action={emptyAction} />
      ) : (
        <Card>
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>{title} records</CardTitle>
            <Badge variant="outline">
              {filteredRows.length} of {rows.length}
            </Badge>
          </CardHeader>
          <CardContent>
            {pageRows.length ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className="text-xs uppercase text-muted-foreground">
                    <tr>
                      {columns.map((column) => (
                        <th key={column} className="border-b py-3 pr-4 font-medium">
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pageRows.map((row, index) => (
                      <tr key={`${safePage}-${index}-${columns.map((column) => row[column]).join("-")}`} className="border-b last:border-0">
                        {columns.map((column, cellIndex) => {
                          const value = row[column];
                          const href = row._href;
                          return (
                            <td key={column} className="py-3 pr-4 align-middle">
                              {cellIndex === 0 && href ? (
                                <Link href={String(href)} className="font-medium hover:underline">
                                  {value}
                                </Link>
                              ) : cellIndex === columns.length - 1 ? (
                                <Badge variant="outline">{value}</Badge>
                              ) : (
                                value
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
              <EmptyState icon={Search} title="No matching records" description="Adjust the search or filter to broaden this view." />
            )}
            <div className="mt-4 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Page {safePage} of {pageCount}
              </p>
              <div className="flex gap-2">
                <Button type="button" variant="outline" disabled={safePage === 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button type="button" variant="outline" disabled={safePage === pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))}>
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
