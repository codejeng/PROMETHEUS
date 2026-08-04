import { createClient } from "@supabase/supabase-js";

// .trim() guards against a trailing newline/whitespace on the env var value
// — an easy mistake when pasting a key into Vercel's dashboard (or a file
// with a trailing newline via `vercel env add`), and one that doesn't throw
// the "missing" error below since the value is still truthy. Left
// untrimmed, supabase-js passes it straight into a `Headers.set(...)` call,
// which throws "Failed to execute 'set' on 'Headers': Invalid value" on
// every single request — a confusing failure mode for what's actually just
// whitespace in one env var.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
// Supabase renamed the client-side "anon" JWT key to a "publishable" key
// (sb_publishable_...) on newer projects. Accept either name so this works
// whichever the project dashboard shows under Project Settings -> API.
const key = (
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)?.trim();

if (!url || !key) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. " +
      "Copy .env.local.example to .env.local and fill in your Supabase project's " +
      "URL and publishable (or anon) key (Project Settings → API)."
  );
}

export const supabase = createClient(url, key);
