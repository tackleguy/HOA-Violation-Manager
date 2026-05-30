"use client";

import Link from "next/link";
import { Building2, Calendar, FileText, Home, Search, ShieldAlert, Users, Wrench } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatLabel } from "@/lib/format";
import { usePagination } from "@/hooks/use-pagination";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { SearchResult } from "@/lib/services/search-service";

type SearchResultsProps = {
  results: SearchResult[];
  query: string;
  loading?: boolean;
};

const iconByType = {
  resident: Users,
  property: Home,
  violation: ShieldAlert,
  document: FileText,
  meeting: Calendar,
  work_order: Wrench
} as const;

export function SearchResults({ results, query, loading }: SearchResultsProps) {
  const { paginate, page, totalPages, hasPrevious, hasNext, previousPage, nextPage, totalItems } = usePagination({
    totalItems: results.length,
    pageSize: 8
  });
  const pageResults = paginate(results);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-4 w-4 text-primary" />
          Search results
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {loading ? "Searching..." : query ? `${totalItems} matches for "${query}"` : "Enter a query to search across your workspace."}
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {!query ? (
          <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
            Search residents, properties, violations, documents, meetings, and work orders from one place.
          </div>
        ) : pageResults.length === 0 && !loading ? (
          <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">No results found.</div>
        ) : (
          pageResults.map((result) => {
            const Icon = iconByType[result.type] ?? Building2;
            return (
              <Link
                key={`${result.type}-${result.id}`}
                href={result.href}
                className="flex items-start justify-between gap-3 rounded-md border bg-background p-3 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-md bg-primary/10 p-2 text-primary">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">{result.title}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{result.subtitle}</div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge variant="outline">{formatLabel(result.type)}</Badge>
                  {result.status ? <span className="text-xs text-muted-foreground">{result.status}</span> : null}
                </div>
              </Link>
            );
          })
        )}

        {totalPages > 1 ? (
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" onClick={previousPage} disabled={!hasPrevious} aria-label="Previous page">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={nextPage} disabled={!hasNext} aria-label="Next page">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
