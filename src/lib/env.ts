import { z } from "zod";

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000")
});

const serverEnvSchema = publicEnvSchema.extend({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional()
});

export const env = serverEnvSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || undefined,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || undefined,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || undefined,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || undefined
});

export function hasSupabasePublicEnv() {
  return Boolean(env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
}

export function requireSupabasePublicEnv() {
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY are required.");
  }

  return {
    url: env.NEXT_PUBLIC_SUPABASE_URL,
    publishableKey: env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  };
}

export function requireSupabaseAdminEnv() {
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");
  }

  return {
    url: env.NEXT_PUBLIC_SUPABASE_URL,
    serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY
  };
}
