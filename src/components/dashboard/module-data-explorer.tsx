"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowDownAZ, ArrowUpAZ, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
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

const PAGE_SIZE = 12;

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
    return <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />;
  }

  return (
    <div className="section-stack">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            className="h-8 border-transparent bg-muted/40 pl-9 shadow-none focus-visible:bg-background"
            placeholder={`Search ${title.toLowerCase()}…`}
            value={query}
            onChange={(event) => updateQuery(event.target.value)}
            aria-label={`Search ${title}`}
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <select
            className="h-8 rounded-md bg-transparent px-2 outline-none hover:bg-muted/40"
            value={statusFilter}
            onChange={(event) => updateFilter(event.target.value)}
            aria-label={`Filter ${title}`}
          >
            {filterOptions.map((option) => (
              <option key={option} value={option}>
                {option === "all" ? "All" : option}
              </option>
            ))}
          </select>
          <select
            className="h-8 rounded-md bg-transparent px-2 outline-none hover:bg-muted/40"
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
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            aria-label={`Sort ${sortDirection === "asc" ? "descending" : "ascending"}`}
            onClick={() => setSortDirection((direction) => (direction === "asc" ? "desc" : "asc"))}
          >
            {sortDirection === "asc" ? <ArrowDownAZ className="h-4 w-4" /> : <ArrowUpAZ className="h-4 w-4" />}
          </Button>
          <span className="hidden text-xs tabular-nums sm:inline">
            {filteredRows.length} records
          </span>
        </div>
      </div>

      {pageRows.length ? (
        <div className="table-shell">
          <table className="table-minimal">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column} scope="col">
                    {formatColumnLabel(column)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageRows.map((row, index) => (
                <tr key={`${safePage}-${index}-${columns.map((column) => row[column]).join("-")}`} className="interactive-row">
                  {columns.map((column, cellIndex) => {
                    const value = row[column];
                    const href = row._href;

                    return (
                      <td key={column}>
                        {cellIndex === 0 && href ? (
                          <Link href={String(href)} className="font-medium text-foreground hover:underline">
                            {value}
                          </Link>
                        ) : (
                          <span className={cn(cellIndex === columns.length - 1 ? "text-muted-foreground" : "text-foreground")}>{value}</span>
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
        <EmptyState title="No matching records" description="Adjust search or filters." />
      )}

      <div className="flex items-center justify-between gap-3 pt-2 text-xs text-muted-foreground">
        <span className="tabular-nums">
          Page {safePage} of {pageCount}
        </span>
        <div className="flex gap-1">
          <Button type="button" variant="ghost" size="sm" disabled={safePage === 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button type="button" variant="ghost" size="sm" disabled={safePage === pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))}>
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
