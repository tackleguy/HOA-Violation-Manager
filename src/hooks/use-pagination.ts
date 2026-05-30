"use client";

import { useMemo, useState } from "react";

type UsePaginationOptions = {
  totalItems: number;
  pageSize?: number;
  initialPage?: number;
};

export function usePagination({ totalItems, pageSize = 10, initialPage = 1 }: UsePaginationOptions) {
  const [page, setPage] = useState(initialPage);

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  const pagination = useMemo(
    () => ({
      page: safePage,
      pageSize,
      totalPages,
      totalItems,
      startIndex,
      endIndex,
      hasPrevious: safePage > 1,
      hasNext: safePage < totalPages
    }),
    [safePage, pageSize, totalPages, totalItems, startIndex, endIndex]
  );

  function goToPage(nextPage: number) {
    setPage(Math.min(Math.max(nextPage, 1), totalPages));
  }

  function nextPage() {
    goToPage(safePage + 1);
  }

  function previousPage() {
    goToPage(safePage - 1);
  }

  function resetPage() {
    setPage(1);
  }

  function paginate<T>(items: T[]) {
    return items.slice(startIndex, endIndex);
  }

  return {
    ...pagination,
    setPage: goToPage,
    nextPage,
    previousPage,
    resetPage,
    paginate
  };
}
