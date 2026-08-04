# CONTEXT.md — for agents working on this codebase

This file is written for the next AI agent (or human) picking up work on PROMETHEUS. It covers what exists, why it's shaped the way it is, and the traps that have already cost debugging time once. Read this before making structural changes.

## What this is

PROMETHEUS is a personal "research operating system" — a Next.js 15 app for organizing research vision, problems, questions, papers, projects, labs, scholarships, a knowledge graph, a life timeline, an SOP builder, a journal, and an agentic paper-search engine with optional AI summarization. It is **not** a generic CRUD demo; every entity type has its own store, dialog, and page, following one repeated pattern (see below).

Everything persists to **Supabase (hosted Postgres)** via `@supabase/supabase-js`, called directly from client-side Zustand stores (no server-side ORM layer). This is a **single-user app with no auth** — see "Database (Supabase)" below for the RLS approach and why it's shaped the way it is. (An earlier version of this app used browser localStorage only; that has been fully replaced — if you see a stray reference to `createEntityStore.ts` or `persist` middleware for entity data, it's stale.)

## Stack

- **Next.js** (App Router, TypeScript strict, React 19) — currently on a 16.x release; the app was originally built against 15 and nothing here depends on 15-specific behavior
- **MUI v7** (note: v7's `Grid` uses `size={{ xs, sm, md }}` props, not the old `item xs={}` API — don't mix the two)
- **Zustand** for all client state — entity stores call Supabase directly (see "Database (Supabase)"); no `persist` middleware is used for entity data anymore (theme/locale UI-prefs may still use it — check the individual store)
- **@supabase/supabase-js** — the single client lives at `lib/supabase/client.ts`
- **Framer Motion** for page transitions
- **TanStack Table** (Reading page table view), **React Flow** (Knowledge Graph), **Recharts** (Dashboard)
- **openai SDK** for AI calls — see "AI integration" below; this is intentionally *not* the Anthropic SDK
- No test suite exists yet. Verification is `tsc --noEmit` + `eslint` + `next build` + manual browser check (see "How to verify changes").

## Repo layout

```
app/                  Next.js routes — thin, each page.tsx just renders a feature component
features/<name>/      One folder per feature: <Name>Page.tsx, <Name>Dialog.tsx (if CRUD), sub-components
components/common/    Shared UI: PageHeader, EmptyState, StatCard, AutosaveField
components/layout/    AppShell, Sidebar, PageTransition
store/                One Zustand store per entity, plus a few singleton stores (theme, locale, sync, AI)
types/index.ts        Every domain type lives here — single source of truth
lib/                  Seed data, i18n dictionary, AI model catalog, dashboard stat helpers, research pipeline
lib/supabase/client.ts  The one Supabase client instance — imported by every store
utils/caseConvert.ts  toRow()/fromRow() — camelCase (TS) <-> snake_case (Postgres) field mapping
supabase/schema.sql   Full DB schema — run this once in the Supabase SQL Editor before starting the app
hooks/                useT (i18n), useDebouncedCallback
app/api/              Three server routes: research/search, ai/summarize, ai/test-connection
```

## Database (Supabase)

`supabase/schema.sql` is the single source of truth for the DB — 13 tables, `text` primary keys (client-generated nanoid IDs via `utils/id.ts`, no DB-side ID defaults), JSONB for array/object-shaped fields, snake_case columns. Run it once in the Supabase SQL Editor (or `supabase db push`) before starting the app; it's idempotent (`create table if not exists`, `on conflict do nothing` seeds).

**Single-user, no auth, but RLS stays enabled.** This is a deliberate choice, not an oversight: rather than `alter table ... disable row level security`, every table has RLS **enabled** plus one permissive policy (`for all to anon, authenticated using (true) with check (true)`). In practice this behaves like "no auth" for this deployment, but it's the officially-supported Supabase pattern and fails safe if the project is ever pointed at from a public/multi-user context. **Do not reuse this schema for a real multi-user deployment without replacing those policies with per-user ones first.**

`vision` and `sop_document` are singleton tables (`id boolean primary key default true check (id)`) — always exactly one row, seeded once by the schema, only ever `UPDATE`d, never inserted into by the app.

## The repeated CRUD pattern

Almost every feature (Problems, Questions, Labs, Scholarships, Projects, Papers, Timeline milestones, Journal) follows this exact shape. If you add a new entity type, copy this pattern rather than inventing a new one:

1. **Type** in `types/index.ts` extending `BaseEntity` (`id`, `createdAt`, `updatedAt`).
2. **Table** added to `supabase/schema.sql` (snake_case columns, JSONB for arrays/objects) plus the table name added to the GRANT list and the RLS policy loop at the bottom of that file.
3. **Store** in `store/use<Name>Store.ts` — a one-line call to `createSupabaseEntityStore<T>("table_name", seedArray)` from `store/createSupabaseEntityStore.ts`, which gives you `items`, `loading`, `hydrated`, `error`, `fetchAll`, `add`, `update`, `remove`, `getById`. Writes are **optimistic**: local state updates synchronously, then the Supabase call fires in the background and rolls the local state back on error (with a toast). `fetchAll` seeds the table from `seed` on first call if it comes back empty, and is guarded (`if (get().hydrated || get().loading) return`) against React dev-mode double-invocation races.
4. **Seed data** added to `lib/seedData.ts`.
5. **`<Name>Dialog.tsx`** — a single dialog used for both create and edit (pass `item={null}` to create). Local `useState` form mirrors the entity shape; `useEffect` resets the form when `item` or `open` changes.
6. **`<Name>Card.tsx`** (if card-grid UI) or table columns (Reading page).
7. **`<Name>Page.tsx`** — reads `items`/`hydrated` from the store, renders `LoadingState` while `!hydrated`, reads `?id=` from `useSearchParams()` to support deep-linking from global search, renders `PageHeader` + `EmptyState` (when empty and hydrated) + grid/table + the dialog.
8. **`app/<name>/page.tsx`** — wraps the feature component in `<Suspense>` **only if it calls `useSearchParams()`** (Next.js requirement); otherwise a plain re-export.

Every store's `fetch`/`fetchAll` is fired once on mount by `components/layout/DataBootstrap.tsx` (rendered inside `AppShell`, no UI of its own) — new stores must be wired in there or they'll never hydrate.

Non-CRUD stores (Vision, Graph, SOP) are hand-written (not `createSupabaseEntityStore`) since they're singletons or have non-trivial multi-table fetches, but follow the same optimistic-update + `hydrated`/`loading` guard shape. Theme, Locale, AI, and Sync stores are pure client-side UI state — they never touch Supabase.

## i18n system

`lib/i18n/dictionary.ts` holds `{ en: {...}, th: {...} }`, one namespace per feature (e.g. `dictionary.en.problems`). `hooks/useT.ts` gives `const t = useT("problems")` → `t("emptyTitle")`, with `{placeholder}` interpolation and English fallback if a Thai key is missing.

**Hard rule: only UI chrome is translated** — nav labels, page headers, buttons, empty states. **User-authored content (papers, notes, journal entries, project text) is never routed through the dictionary** and must never be. If you add a new page, translate its `PageHeader` (eyebrow/title/subtitle), primary action button, and `EmptyState`, at minimum — that's the bar the rest of the app is held to. Deep dialog field labels (e.g. every `TextField` label inside a create/edit dialog) are **not** currently translated; that's a known, accepted gap, not an oversight to silently "complete" without being asked.

Locale is stored in `useLocaleStore` (`prometheus-locale` in localStorage), toggled from the sidebar footer and Settings.

## AI integration — provider-agnostic by design

`store/useAIStore.ts` holds `apiKey`, `baseURL`, `model` — **not** hardcoded to any provider. It uses the `openai` npm package pointed at whatever OpenAI-compatible Chat Completions endpoint the user configures (OpenAI itself, a university/enterprise gateway, OpenRouter, self-hosted vLLM, etc.). This was a deliberate pivot: an earlier version hardcoded the Anthropic SDK against `api.anthropic.com`, which broke for any user on a different provider or gateway. **Do not re-hardcode a single provider's SDK here** unless explicitly asked to.

Two server routes:
- `app/api/ai/test-connection/route.ts` — validates the connection with a **real 1-token chat completion**, not a `models.list()` call. This matters: some gateways leave `GET /models` open with lax or no auth, so a successful model listing is not proof the key actually works for completions. Learned this the hard way — don't regress it back to trusting `/models`.
- `app/api/ai/summarize/route.ts` — used by the Research Engine's "Summarize" button. Requests `response_format: json_object`, falls back to a plain prompt + lenient JSON extraction (`extractJSON()`) if the gateway rejects that param.

Both routes are called with `{ apiKey, baseURL, model, ... }` in the POST body — the key is never persisted server-side, only forwarded per-request.

## Research Engine (`features/research/`)

Real functionality, not a mockup: `app/api/research/search/route.ts` fans a query out in parallel to **arXiv, Semantic Scholar, OpenAlex, and Crossref** (`lib/research/sources.ts`), all open/ToS-compliant REST or Atom APIs — no scraping. Results are deduped by normalized title and scored by a deterministic keyword-overlap heuristic (`lib/research/relevance.ts`) — not an LLM call, so it works with zero AI configuration.

**Deliberately excluded**: Google Scholar (no public API, disallows automated querying) and paywalled publisher crawling (Nature, lab sites). This is surfaced honestly in the UI (`excludedTitle`/`excludedDesc` in the research dictionary) rather than faked. Don't add scraping for these without being explicitly asked — it's a policy line, not a missing feature.

## Known gotchas (already debugged once — don't re-discover)

- **Zustand `persist` hydrates asynchronously on the client.** A component's `useState(storeValue)` only captures the value at first render, which may be *before* hydration completes. If a component needs to reflect a persisted value after mount (e.g. Settings' draft fields), sync it explicitly: `useEffect(() => setDraft(storeValue), [storeValue])`. Settings page has this pattern for `apiKey`/`baseURL`/`model` — copy it for new persisted-value editors.
- **`<Chip>` (renders `<div>`) inside `<Typography variant="body2">` (renders `<p>`) is invalid HTML** and throws a repeated hydration-error console warning. Put the Chip as a sibling in a `Stack`, never as a child of `Typography`.
- **MUI v7 Grid**: always `<Grid size={{ xs: 12, sm: 6 }}>`, never the v5/v6 `<Grid item xs={12}>` shape.
- **Automated/synthetic typing that pastes many characters near-instantly can silently drop a character.** This isn't a code bug, but if a "valid-looking" API key or long string mysteriously fails auth after being typed via automation, check the actual stored length against the expected length before assuming the backend is broken.
- Port 3000 is often occupied by another process on this machine; `next dev` falls back to 3001 automatically — check the terminal output for the actual port rather than assuming 3000.
- `node_modules/.bin/tsc` and `.bin/eslint` symlinks can be broken in this environment; run `node node_modules/typescript/bin/tsc --noEmit` and `node node_modules/eslint/bin/eslint.js .` directly instead of `npx tsc` / `npx eslint`.
- **After running/changing `supabase/schema.sql`, PostgREST's schema cache can go stale** and every query returns `PGRST205 "Could not find the table in the schema cache"` even though the table exists. `NOTIFY pgrst, 'reload schema';` doesn't reliably fix this in practice — use the Supabase Dashboard's explicit "Reload schema" button (Settings → API) if you hit PGRST205 after a schema change.
- **If inserts/updates fail with `42501 "new row violates row-level security policy"` even though RLS looks disabled** (`pg_class.relrowsecurity = false`), don't keep chasing "disable RLS" — some Supabase project configs don't honor it reliably. Switch to the enabled-RLS-plus-permissive-policy pattern already in `schema.sql` instead of re-debugging this from scratch. Also check GRANTs: tables created via the SQL Editor are **not** auto-granted to `anon`/`authenticated` the way Table Editor UI tables are — you need the explicit `grant select, insert, update, delete on ... to anon, authenticated;` block.
- **Any hand-written store that fetches on mount (not using `createSupabaseEntityStore`) needs its own `loading` guard**, not just `hydrated`: `if (get().hydrated || get().loading) return;` before setting `loading: true`. Without it, React dev-mode's double-invocation of effects can fire two concurrent fetches, and if that fetch also seeds empty tables, you get a duplicate-key insert race. This bit `useGraphStore` once — `useVisionStore`/`useSOPStore` got the same guard defensively even though their fetches are read-only.
- `utils/caseConvert.ts`'s `toRow`/`fromRow` assume a flat camelCase<->snake_case mapping — fields that are arrays/objects are stored as JSONB as-is (no per-key conversion inside nested structures), so nested object keys inside JSONB columns stay however they were written. Don't add per-field special-casing here unless a new column actually needs it.

## How to verify changes

There is no test suite. The verification loop used throughout this project is:

```sh
node node_modules/typescript/bin/tsc --noEmit
node node_modules/eslint/bin/eslint.js . --max-warnings=0
rm -rf .next && npm run build
```

All three must be clean. For anything touching interactive UI (dialogs, forms, the graph, the research engine), also start `npm run dev` and click through the actual flow in a browser — type-checking does not catch layout bugs, invalid HTML nesting, or hydration timing issues (see gotchas above).

## Scope boundaries already established with the user

- Full Thai UI translation was requested but explicitly scoped to **UI chrome only**, not deep form-field labels or user data — don't "complete" that gap unprompted.
- The Research Engine explicitly does **not** scrape Google Scholar or paywalled publisher sites — this was a deliberate policy decision, not a TODO.
- AI provider must stay configurable (base URL + model + key), not locked to one vendor's SDK.
