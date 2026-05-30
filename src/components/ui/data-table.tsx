"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Pagination } from "@/components/ui/pagination";
import {
  SortDirection,
  SortableTableHead,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

export type DataTableColumn<T> = {
  id: string;
  header: React.ReactNode;
  accessor?: (row: T) => React.ReactNode;
  sortable?: boolean;
  sortValue?: (row: T) => string | number;
  className?: string;
  headerClassName?: string;
};

export type DataTableProps<T> = {
  data: T[];
  columns: DataTableColumn<T>[];
  getRowId: (row: T) => string;
  caption?: string;
  emptyMessage?: string;
  className?: string;
  pageSize?: number;
  paginate?: boolean;
  defaultSort?: { columnId: string; direction: Exclude<SortDirection, null> };
  onRowClick?: (row: T) => void;
  selectedIds?: Set<string>;
  onSelectionChange?: (ids: Set<string>) => void;
};

function compareValues(a: string | number, b: string | number) {
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: "base" });
}

export function DataTable<T>({
  data,
  columns,
  getRowId,
  caption,
  emptyMessage = "No records found.",
  className,
  pageSize = 10,
  paginate = true,
  defaultSort,
  onRowClick,
  selectedIds,
  onSelectionChange
}: DataTableProps<T>) {
  const [page, setPage] = React.useState(1);
  const [sort, setSort] = React.useState<{ columnId: string; direction: Exclude<SortDirection, null> } | null>(
    defaultSort ?? null
  );

  const sortedData = React.useMemo(() => {
    if (!sort) return data;
    const column = columns.find((item) => item.id === sort.columnId);
    if (!column?.sortValue) return data;
    return [...data].sort((left, right) => {
      const result = compareValues(column.sortValue!(left), column.sortValue!(right));
      return sort.direction === "asc" ? result : -result;
    });
  }, [columns, data, sort]);

  const total = sortedData.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageData = paginate ? sortedData.slice((safePage - 1) * pageSize, safePage * pageSize) : sortedData;

  React.useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  function toggleSort(columnId: string, sortable?: boolean, sortValue?: (row: T) => string | number) {
    if (!sortable || !sortValue) return;
    setSort((current) => {
      if (current?.columnId !== columnId) return { columnId, direction: "asc" };
      if (current.direction === "asc") return { columnId, direction: "desc" };
      return null;
    });
    setPage(1);
  }

  function toggleRowSelection(rowId: string) {
    if (!onSelectionChange || !selectedIds) return;
    const next = new Set(selectedIds);
    if (next.has(rowId)) next.delete(rowId);
    else next.add(rowId);
    onSelectionChange(next);
  }

  return (
    <div className={cn("space-y-4", className)}>
      <Table>
        {caption ? <TableCaption>{caption}</TableCaption> : null}
        <TableHeader>
          <TableRow>
            {onSelectionChange ? <TableHead className="w-10" /> : null}
            {columns.map((column) =>
              column.sortable ? (
                <SortableTableHead
                  key={column.id}
                  className={column.headerClassName}
                  sorted={sort?.columnId === column.id ? sort.direction : null}
                  onSort={() => toggleSort(column.id, column.sortable, column.sortValue)}
                >
                  {column.header}
                </SortableTableHead>
              ) : (
                <TableHead key={column.id} className={column.headerClassName}>
                  {column.header}
                </TableHead>
              )
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {pageData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length + (onSelectionChange ? 1 : 0)} className="h-24 text-center text-muted-foreground">
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            pageData.map((row) => {
              const rowId = getRowId(row);
              const selected = selectedIds?.has(rowId) ?? false;
              return (
                <TableRow
                  key={rowId}
                  data-state={selected ? "selected" : undefined}
                  className={cn(onRowClick && "cursor-pointer")}
                  onClick={() => onRowClick?.(row)}
                >
                  {onSelectionChange ? (
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selected}
                        aria-label={`Select row ${rowId}`}
                        onClick={(event) => event.stopPropagation()}
                        onChange={() => toggleRowSelection(rowId)}
                        className="focus-ring h-4 w-4 rounded border-input"
                      />
                    </TableCell>
                  ) : null}
                  {columns.map((column) => (
                    <TableCell key={column.id} className={column.className}>
                      {column.accessor ? column.accessor(row) : null}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
      {paginate && total > pageSize ? (
        <Pagination page={safePage} pageSize={pageSize} total={total} onPageChange={setPage} />
      ) : null}
    </div>
  );
}
