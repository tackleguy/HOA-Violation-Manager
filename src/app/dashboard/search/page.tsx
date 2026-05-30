import { Search } from "lucide-react";
import { SearchPageClient } from "@/components/search/search-page-client";
import { Badge } from "@/components/ui/badge";

export default async function SearchPage({
  searchParams
}: {
  searchParams: Promise<{ message?: string; error?: string; q?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="space-y-6">
      <div>
        <Badge variant="outline" className="mb-3">
          <Search className="mr-1 h-3.5 w-3.5" />
          HOAFlow module
        </Badge>
        <h1 className="text-3xl font-semibold tracking-normal">Global search</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Search across residents, properties, violations, documents, meetings, and work orders with filters and recent query history.
        </p>
        {params.message ? <p className="mt-3 text-sm text-primary">{params.message}</p> : null}
        {params.error ? <p className="mt-3 text-sm text-destructive">{params.error}</p> : null}
      </div>
      <SearchPageClient />
    </div>
  );
}
