"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatLabel } from "@/lib/format";
import type { SearchEntityType } from "@/lib/services/search-service";

type SearchFiltersProps = {
  selectedTypes: SearchEntityType[];
  selectedStatus: string;
  onTypesChange: (types: SearchEntityType[]) => void;
  onStatusChange: (status: string) => void;
  facets?: { type: SearchEntityType; count: number }[];
};

const ALL_TYPES: SearchEntityType[] = ["resident", "property", "violation", "document", "meeting", "work_order"];
const STATUS_OPTIONS = ["all", "open", "under_review", "warning_sent", "fine_pending", "resolved", "closed", "scheduled", "approved"];

export function SearchFilters({ selectedTypes, selectedStatus, onTypesChange, onStatusChange, facets }: SearchFiltersProps) {
  function toggleType(type: SearchEntityType) {
    if (selectedTypes.includes(type)) {
      onTypesChange(selectedTypes.filter((value) => value !== type));
      return;
    }
    onTypesChange([...selectedTypes, type]);
  }

  return (
    <div className="space-y-4 rounded-lg border bg-card p-4">
      <div>
        <div className="mb-2 text-sm font-medium">Entity types</div>
        <div className="flex flex-wrap gap-2">
          {ALL_TYPES.map((type) => {
            const count = facets?.find((facet) => facet.type === type)?.count;
            const active = selectedTypes.length === 0 || selectedTypes.includes(type);
            return (
              <Button
                key={type}
                type="button"
                size="sm"
                variant={active ? "default" : "outline"}
                onClick={() => toggleType(type)}
              >
                {formatLabel(type)}
                {count ? ` (${count})` : ""}
              </Button>
            );
          })}
        </div>
        {selectedTypes.length ? (
          <button type="button" className="mt-2 text-xs text-primary hover:underline" onClick={() => onTypesChange([])}>
            Clear type filters
          </button>
        ) : null}
      </div>

      <div>
        <div className="mb-2 text-sm font-medium">Status</div>
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((status) => (
            <button key={status} type="button" onClick={() => onStatusChange(status)}>
              <Badge variant={selectedStatus === status ? "default" : "outline"}>{formatLabel(status)}</Badge>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
