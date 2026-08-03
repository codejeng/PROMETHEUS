# PROMETHEUS

**Research Operating System for Builders**

A thinking environment for ambitious researchers and engineers — organize your vision, track humanity-scale problems worth solving, manage a paper library, map your knowledge graph, run projects through a kanban, track labs and scholarships, plot your life timeline, draft your SOP, journal daily, and send an agent out to search the open scholarly web.

Not a to-do app. Not a note-taking clone. Everything here is built around long-term research thinking.

## Features

- **Dashboard** — overview stats, reading progress, journal streak, project stages, knowledge growth charts
- **Vision** — mission, core beliefs, 10/20-year vision, dream labs & mentors (autosaving)
- **Problems Worth Solving** — humanity-scale problems (fusion, longevity, space, ...) with state-of-the-art tracking
- **Research Questions** — open questions with motivation, difficulty, and experiment ideas
- **Reading** — paper library with table/card/timeline views, stats, and per-paper synthesis notes
- **Knowledge Graph** — interactive React Flow graph linking papers, projects, ideas, problems, labs, researchers
- **Projects** — kanban board (Ideas → Planning → Research → Building → Completed) with milestones & tasks
- **Labs** — pipeline of professors/labs you're pursuing (Dream → Applying → Contacted → Accepted/Rejected)
- **Scholarships** — deadlines, requirements, and checklists in card or calendar view
- **Timeline** — horizontal life roadmap of past and future milestones
- **SOP Builder** — sectioned statement-of-purpose writer with word count, version history, and PDF export
- **Journal** — daily reflection with mood, energy, deep-work hours, and streak tracking
- **Research Engine** — an agentic search planner that fans a research goal out across **arXiv, Semantic Scholar, OpenAlex, and Crossref**, scores relevance, and (once you connect an AI key) generates real summaries via any OpenAI-compatible endpoint
- **Cmd+K global search** across every entity in the app
- **Dark/light theme**, **English/Thai UI language** (your own notes and data are never auto-translated)

Everything persists to your browser's local storage — there is no backend database, and nothing you write leaves your machine except the two things you explicitly opt into: the open scholarly-API search, and (only if you connect a key) calls to your chosen AI endpoint for summarization.

## Tech stack

Next.js 15 (App Router) · TypeScript · MUI v7 · Zustand · Framer Motion · TanStack Table · React Flow · Recharts · React Markdown · Day.js · `openai` SDK

## Getting started

```sh
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (the dev server will pick the next free port, e.g. 3001, if 3000 is taken).

```sh
npm run build   # production build
npm run start   # run the production build
npm run lint    # eslint
```

No environment variables are required to run the app. Optional AI features (paper summarization) are configured entirely in-app under **Settings → AI Provider Connection** — bring your own API key and base URL for any OpenAI-compatible endpoint (OpenAI, a university/enterprise gateway, OpenRouter, a self-hosted model, etc.). The key is stored only in your browser and sent directly to the endpoint you configure.

## Project structure

```
app/                  Next.js routes (thin — delegate to features/)
features/<name>/      One folder per feature: page, dialogs, sub-components
components/           Shared layout (sidebar, app shell) and common UI (page header, empty state, ...)
store/                Zustand stores, one per entity, persisted to localStorage
types/index.ts        All domain types
lib/                  Seed data, i18n dictionary, research pipeline, AI model catalog
app/api/              Server routes: scholarly search fan-out, AI summarize, AI connection test
```

See [`CONTEXT.md`](./CONTEXT.md) for architectural notes, established conventions, and gotchas — read that first if you're extending this codebase.

## License

Private project — no license granted for reuse.
