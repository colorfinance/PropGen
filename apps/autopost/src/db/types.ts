/**
 * Generated Supabase types live here.
 *
 * Regenerate with `npm run db:types` after applying migrations. The script
 * requires the SUPABASE_PROJECT_ID env var (or pass --project-id).
 *
 * Until the first generation, we export a minimal shape that matches the
 * @supabase/supabase-js generic so feature code can compile.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
