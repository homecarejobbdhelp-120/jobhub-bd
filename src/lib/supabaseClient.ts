import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

// Prefer publishable key, but gracefully fall back to anon key for environments
// where only VITE_SUPABASE_ANON_KEY is configured (e.g., manual Vercel setup)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;
const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY as string | undefined;

const SUPABASE_KEY = SUPABASE_PUBLISHABLE_KEY || SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  // Surface a clear diagnostic for misconfigured deployments
  console.error(
    "Supabase configuration missing. Ensure VITE_SUPABASE_URL and either VITE_SUPABASE_PUBLISHABLE_KEY or VITE_SUPABASE_ANON_KEY are set."
  );
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_KEY!, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});
