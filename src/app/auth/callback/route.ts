import { NextResponse, type NextRequest } from "next/server";
import { hasSupabasePublicEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = sanitizeNextPath(requestUrl.searchParams.get("next"));
  const redirectUrl = request.nextUrl.clone();

  if (!hasSupabasePublicEnv()) {
    redirectUrl.pathname = "/login";
    redirectUrl.search = `?error=${encodeURIComponent("Supabase environment variables are required before authentication.")}`;
    return NextResponse.redirect(redirectUrl);
  }

  if (!code) {
    redirectUrl.pathname = "/login";
    redirectUrl.search = `?error=${encodeURIComponent("Missing authentication code.")}`;
    return NextResponse.redirect(redirectUrl);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    redirectUrl.pathname = "/login";
    redirectUrl.search = `?error=${encodeURIComponent(error.message)}`;
    return NextResponse.redirect(redirectUrl);
  }

  redirectUrl.pathname = next;
  redirectUrl.search = "";
  return NextResponse.redirect(redirectUrl);
}

function sanitizeNextPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/dashboard";
  }

  return value;
}
