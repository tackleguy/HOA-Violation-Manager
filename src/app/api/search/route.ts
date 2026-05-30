import { NextResponse } from "next/server";
import { z } from "zod";
import { apiError, requireTenantApiContext } from "@/lib/api/tenant-api";
import { globalSearch, type SearchEntityType } from "@/lib/services/search-service";

const querySchema = z.object({
  q: z.string().trim().min(1),
  types: z.string().optional(),
  status: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional()
});

const VALID_TYPES = new Set<SearchEntityType>(["resident", "property", "violation", "document", "meeting", "work_order"]);

export async function GET(request: Request) {
  const context = await requireTenantApiContext();
  if (context instanceof NextResponse) return context;

  const url = new URL(request.url);
  const parsed = querySchema.safeParse({
    q: url.searchParams.get("q") ?? "",
    types: url.searchParams.get("types") ?? undefined,
    status: url.searchParams.get("status") ?? undefined,
    limit: url.searchParams.get("limit") ?? undefined
  });

  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message ?? "Invalid search query.", 422);
  }

  const types = parsed.data.types
    ? parsed.data.types
        .split(",")
        .map((value) => value.trim())
        .filter((value): value is SearchEntityType => VALID_TYPES.has(value as SearchEntityType))
    : undefined;

  const response = await globalSearch(
    parsed.data.q,
    {
      types,
      status: parsed.data.status && parsed.data.status !== "all" ? parsed.data.status : undefined
    },
    parsed.data.limit ?? 50
  );

  return NextResponse.json(response);
}
