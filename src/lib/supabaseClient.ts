import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

// Strict client: ONLY uses VITE_SUPABASE_PUBLISHABLE_KEY as required
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  // Surface a clear diagnostic for misconfigured deployments
  const missing = [
    !SUPABASE_URL ? "VITE_SUPABASE_URL" : null,
    !SUPABASE_PUBLISHABLE_KEY ? "VITE_SUPABASE_PUBLISHABLE_KEY" : null,
  ]
    .filter(Boolean)
    .join(", ");
  console.error(
    `Supabase configuration missing: ${missing}. Ensure these VITE_* env vars are set.`
  );
  throw new Error("Supabase client not configured: missing environment variables");
}

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

