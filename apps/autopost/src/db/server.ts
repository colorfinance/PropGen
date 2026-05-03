import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { env } from "@/lib/env";
import { fromPromise, type Result } from "@/lib/result";

import type { Database } from "@/db/types";

type ServerClient = SupabaseClient<Database>;

let cached: ServerClient | null = null;

export function getServiceClient(): ServerClient {
  if (cached) return cached;
  cached = createClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { "x-client-info": "autopost-server" } },
    },
  );
  return cached;
}

interface PostgrestLike<T> {
  data: T | null;
  error: { message: string; code?: string } | null;
}

/**
 * Wrap a Supabase query (which returns { data, error }) into our Result union.
 * Pass a thunk so the query is constructed lazily and lives inside the try.
 */
export async function dbQuery<T>(
  build: (client: ServerClient) => PromiseLike<PostgrestLike<T>>,
): Promise<Result<T, Error>> {
  const wrapped = fromPromise(Promise.resolve(build(getServiceClient())));
  const settled = await wrapped;
  if (!settled.ok) return settled;
  const { data, error } = settled.data;
  if (error) {
    return { ok: false, error: new Error(error.message) };
  }
  if (data === null) {
    return { ok: false, error: new Error("Query returned no data") };
  }
  return { ok: true, data };
}
