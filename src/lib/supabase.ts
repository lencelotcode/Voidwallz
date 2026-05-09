import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Validate environment variables
const isConfigured =
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.length > 0 &&
  supabaseAnonKey.length > 0;

// Create client only if properly configured
export const supabase: SupabaseClient | null = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Debug logging
if (!isConfigured) {
  console.warn(
    "%c⚠️ Supabase not configured%c\n" +
      "Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file\n" +
      "Gallery will use fallback data until credentials are provided.",
    "color: #ff6b6b; font-weight: bold;",
    "color: #888;",
  );
} else {
  console.log(
    "%c✅ Supabase connected%c\nURL: %c" + supabaseUrl,
    "color: #51cf66; font-weight: bold;",
    "color: #888;",
    supabaseUrl,
  );
}
