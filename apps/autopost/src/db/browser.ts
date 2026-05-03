import { createBrowserClient, type CookieOptionsWithName } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/db/types";

type BrowserClient = SupabaseClient<Database>;

let cached: BrowserClient | null = null;

const cookieOptions: CookieOptionsWithName = {
  name: "autopost-sb",
};

export function getBrowserClient(): BrowserClient {
  if (cached) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set",
    );
  }
  cached = createBrowserClient<Database>(url, anonKey, {
    cookieOptions,
  });
  return cached;
}
