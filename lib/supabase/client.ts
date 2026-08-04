import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Supabase renamed the client-side "anon" JWT key to a "publishable" key
// (sb_publishable_...) on newer projects. Accept either name so this works
// whichever the project dashboard shows under Project Settings -> API.
const key =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. " +
      "Copy .env.local.example to .env.local and fill in your Supabase project's " +
      "URL and publishable (or anon) key (Project Settings → API)."
  );
}

export const supabase = createClient(url, key);
