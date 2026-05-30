import * as React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type PaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  className?: string;
  siblingCount?: number;
};

function range(start: number, end: number) {
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

function getPageNumbers(page: number, totalPages: number, siblingCount: number) {
  if (totalPages <= 1) return [1];
  const left = Math.max(1, page - siblingCount);
  const right = Math.min(totalPages, page + siblingCount);
  const pages: (number | "ellipsis")[] = [];

  if (left > 1) {
    pages.push(1);
    if (left > 2) pages.push("ellipsis");
  }

  pages.push(...range(left, right));

  if (right < totalPages) {
    if (right < totalPages - 1) pages.push("ellipsis");
    pages.push(totalPages);
  }

  return pages;
}

export function Pagination({ page, pageSize, total, onPageChange, className, siblingCount = 1 }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const start = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const end = Math.min(safePage * pageSize, total);
  const pages = getPageNumbers(safePage, totalPages, siblingCount);

  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", className)}>
      <p className="text-sm text-muted-foreground">
        Showing {start}–{end} of {total}
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          aria-label="Previous page"
          disabled={safePage <= 1}
          onClick={() => onPageChange(safePage - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        {pages.map((item, index) =>
          item === "ellipsis" ? (
            <span key={`ellipsis-${index}`} className="flex h-10 w-10 items-center justify-center">
              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
            </span>
          ) : (
            <Button
              key={item}
              variant={item === safePage ? "default" : "outline"}
              size="icon"
              aria-label={`Page ${item}`}
              aria-current={item === safePage ? "page" : undefined}
              onClick={() => onPageChange(item)}
            >
              {item}
            </Button>
          )
        )}
        <Button
          variant="outline"
          size="icon"
          aria-label="Next page"
          disabled={safePage >= totalPages}
          onClick={() => onPageChange(safePage + 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
