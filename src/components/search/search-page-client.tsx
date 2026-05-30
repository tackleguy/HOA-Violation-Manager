"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { SearchFilters } from "@/components/search/search-filters";
import { SearchResults } from "@/components/search/search-results";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { useLocalStorage } from "@/hooks/use-local-storage";
import type { SearchEntityType, SearchResponse } from "@/lib/services/search-service";

export function SearchPageClient() {
  const [query, setQuery] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<SearchEntityType[]>([]);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<SearchResponse>({ query: "", total: 0, results: [], facets: [] });
  const debouncedQuery = useDebounce(query, 300);
  const { value: recentQueries, setValue: setRecentQueries } = useLocalStorage<string[]>("hoaflow-recent-searches", []);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResponse({ query: "", total: 0, results: [], facets: [] });
      return;
    }

    const controller = new AbortController();
    setLoading(true);

    const params = new URLSearchParams({ q: debouncedQuery });
    if (selectedTypes.length) params.set("types", selectedTypes.join(","));
    if (selectedStatus !== "all") params.set("status", selectedStatus);

    fetch(`/api/search?${params.toString()}`, { signal: controller.signal })
      .then((res) => res.json())
      .then((payload: SearchResponse) => {
        setResponse(payload);
        if (payload.query && payload.total > 0) {
          setRecentQueries((current) => {
            const next = [payload.query, ...current.filter((item) => item !== payload.query)].slice(0, 5);
            return next;
          });
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setResponse({ query: debouncedQuery, total: 0, results: [], facets: [] });
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [debouncedQuery, selectedTypes, selectedStatus, setRecentQueries]);

  return (
    <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
      <SearchFilters
        selectedTypes={selectedTypes}
        selectedStatus={selectedStatus}
        onTypesChange={setSelectedTypes}
        onStatusChange={setSelectedStatus}
        facets={response.facets}
      />
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search residents, properties, violations, documents..."
            className="pl-9"
          />
        </div>
        {recentQueries.length ? (
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            Recent:
            {recentQueries.map((item) => (
              <button key={item} type="button" className="rounded-md border px-2 py-1 hover:bg-muted" onClick={() => setQuery(item)}>
                {item}
              </button>
            ))}
          </div>
        ) : null}
        <SearchResults results={response.results} query={response.query} loading={loading} />
      </div>
    </div>
  );
}
