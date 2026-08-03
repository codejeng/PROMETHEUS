# CONTEXT.md — for agents working on this codebase

This file is written for the next AI agent (or human) picking up work on PROMETHEUS. It covers what exists, why it's shaped the way it is, and the traps that have already cost debugging time once. Read this before making structural changes.

## What this is

PROMETHEUS is a personal "research operating system" — a Next.js 15 app for organizing research vision, problems, questions, papers, projects, labs, scholarships, a knowledge graph, a life timeline, an SOP builder, a journal, and an agentic paper-search engine with optional AI summarization. It is **not** a generic CRUD demo; every entity type has its own store, dialog, and page, following one repeated pattern (see below).

Everything persists to **browser localStorage only** — there is no backend database. The architecture is deliberately shaped so that swapping localStorage for Supabase/Postgres/Prisma later is a data-layer change, not a rewrite (see `store/createEntityStore.ts`).

## Stack

- **Next.js 15** App Router, TypeScript strict, React 19
- **MUI v7** (note: v7's `Grid` uses `size={{ xs, sm, md }}` props, not the old `item xs={}` API — don't mix the two)
- **Zustand** with `persist` middleware for all client state
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
hooks/                useT (i18n), useDebouncedCallback
app/api/              Three server routes: research/search, ai/summarize, ai/test-connection
```

## The repeated CRUD pattern

Almost every feature (Problems, Questions, Labs, Scholarships, Projects, Papers, Timeline milestones, Journal) follows this exact shape. If you add a new entity type, copy this pattern rather than inventing a new one:

1. **Type** in `types/index.ts` extending `BaseEntity` (`id`, `createdAt`, `updatedAt`).
2. **Store** in `store/use<Name>Store.ts` — a one-line call to `createEntityStore<T>("name", seedArray)` from `store/createEntityStore.ts`, which gives you `items`, `add`, `update`, `remove`, `getById` for free, persisted under `prometheus-<name>` in localStorage.
3. **Seed data** added to `lib/seedData.ts`.
4. **`<Name>Dialog.tsx`** — a single dialog used for both create and edit (pass `item={null}` to create). Local `useState` form mirrors the entity shape; `useEffect` resets the form when `item` or `open` changes.
5. **`<Name>Card.tsx`** (if card-grid UI) or table columns (Reading page).
6. **`<Name>Page.tsx`** — reads `items` from the store, reads `?id=` from `useSearchParams()` to support deep-linking from global search, renders `PageHeader` + `EmptyState` (when empty) + grid/table + the dialog.
7. **`app/<name>/page.tsx`** — wraps the feature component in `<Suspense>` **only if it calls `useSearchParams()`** (Next.js requirement); otherwise a plain re-export.

Non-CRUD stores (Vision, Graph, SOP, Theme, Locale, AI, Sync) don't use `createEntityStore` — they're hand-written since they're singletons, not collections.

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
