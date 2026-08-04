-- PROMETHEUS — Supabase schema
-- Single-user app, no auth: RLS is enabled with one permissive "allow
-- everything" policy per table (see the bottom of this file) rather than
-- disabled outright. Do not point this project's key at a publicly-shared
-- /multi-user deployment without replacing those policies with real
-- per-user ones first (see CONTEXT.md).
--
-- Run this once in the Supabase SQL Editor (or `supabase db push` if you
-- use the CLI) before starting the app. IDs are generated client-side
-- (nanoid, see utils/id.ts) to match the app's existing id shape, so no
-- column defaults are used for `id`.

-- ---------- Problems Worth Solving ----------
create table if not exists problems (
  id text primary key,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  title text not null,
  domain text not null,
  description text not null default '',
  importance text not null default '',
  current_progress text not null default '',
  existing_companies jsonb not null default '[]',
  research_labs jsonb not null default '[]',
  ideas jsonb not null default '[]',
  related_project_ids jsonb not null default '[]'
);

-- ---------- Research Questions ----------
create table if not exists research_questions (
  id text primary key,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  question text not null,
  motivation text not null default '',
  importance text not null default '',
  related_fields jsonb not null default '[]',
  difficulty text not null default 'Moderate',
  open_problems text not null default '',
  possible_experiments text not null default '',
  "references" jsonb not null default '[]',
  personal_notes text not null default ''
);

-- ---------- Papers (Reading) ----------
create table if not exists papers (
  id text primary key,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  title text not null,
  authors jsonb not null default '[]',
  pdf_link text,
  arxiv_id text,
  doi text,
  category text not null default '',
  difficulty text not null default 'Moderate',
  status text not null default 'To Read',
  summary text not null default '',
  key_insight text not null default '',
  questions text not null default '',
  critique text not null default '',
  ideas_generated text not null default '',
  related_project_ids jsonb not null default '[]',
  knowledge_tags jsonb not null default '[]',
  hours_read numeric not null default 0
);

-- ---------- Projects ----------
create table if not exists projects (
  id text primary key,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  title text not null,
  stage text not null default 'Ideas',
  overview text not null default '',
  github_url text,
  demo_url text,
  progress numeric not null default 0,
  notes text not null default '',
  impact text not null default '',
  milestones jsonb not null default '[]',
  tasks jsonb not null default '[]',
  related_paper_ids jsonb not null default '[]',
  related_problem_ids jsonb not null default '[]'
);

-- ---------- Labs ----------
create table if not exists labs (
  id text primary key,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  professor text not null,
  university text not null,
  research_area text not null default '',
  country text not null default '',
  funding text not null default '',
  website text,
  email text,
  application_deadline timestamptz,
  current_projects text not null default '',
  interesting_papers text not null default '',
  personal_notes text not null default '',
  status text not null default 'Dream'
);

-- ---------- Scholarships ----------
create table if not exists scholarships (
  id text primary key,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text not null,
  university text not null default '',
  country text not null default '',
  funding text not null default '',
  requirements text not null default '',
  deadline timestamptz not null,
  status text not null default 'Researching',
  documents jsonb not null default '[]',
  checklist jsonb not null default '[]',
  reminder timestamptz
);

-- ---------- Timeline ----------
create table if not exists timeline_milestones (
  id text primary key,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  title text not null,
  date timestamptz not null,
  description text not null default '',
  category text not null default 'Milestone',
  done boolean not null default false
);

-- ---------- Journal ----------
create table if not exists journal_entries (
  id text primary key,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  date timestamptz not null,
  todays_learning text not null default '',
  questions text not null default '',
  ideas text not null default '',
  mistakes text not null default '',
  insights text not null default '',
  mood text not null default 'good',
  energy numeric not null default 3,
  deep_work_hours numeric not null default 0,
  wins text not null default '',
  gratitude text not null default '',
  tags jsonb not null default '[]'
);

-- ---------- Vision (single row, singleton) ----------
create table if not exists vision (
  id boolean primary key default true check (id),
  updated_at timestamptz not null default now(),
  mission text not null default '',
  core_beliefs text not null default '',
  ten_year_vision text not null default '',
  twenty_year_vision text not null default '',
  humanity_impact text not null default '',
  dream_labs text not null default '',
  dream_mentors text not null default ''
);

-- ---------- SOP Builder ----------
create table if not exists sop_document (
  id boolean primary key default true check (id),
  updated_at timestamptz not null default now(),
  personal_story text not null default '',
  motivation text not null default '',
  research_experience text not null default '',
  future_goals text not null default '',
  why_this_lab text not null default '',
  why_this_university text not null default '',
  why_me text not null default ''
);

create table if not exists sop_versions (
  id text primary key,
  saved_at timestamptz not null default now(),
  label text not null,
  content jsonb not null
);

-- ---------- Knowledge Graph ----------
create table if not exists graph_nodes (
  id text primary key,
  type text not null,
  label text not null,
  ref_id text,
  x numeric,
  y numeric
);

create table if not exists graph_edges (
  id text primary key,
  source text not null,
  target text not null,
  type text not null
);

-- Singleton seed rows for vision/sop_document so an UPDATE always has a
-- row to target (the app never INSERTs into these two tables).
insert into vision (id) values (true) on conflict (id) do nothing;
insert into sop_document (id) values (true) on conflict (id) do nothing;

-- Tables created via the Table Editor UI are auto-granted to `anon` and
-- `authenticated`; tables created via raw SQL (like this file) are not —
-- only the table owner can touch them until granted explicitly.
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on
  problems, research_questions, papers, projects, labs, scholarships,
  timeline_milestones, journal_entries, vision, sop_document, sop_versions,
  graph_nodes, graph_edges
  to anon, authenticated;

-- Single-user app, no auth: rather than disabling RLS outright (which
-- newer Supabase projects can override/re-enforce), use the officially
-- supported "public access" pattern — RLS enabled, with one permissive
-- policy per table granting full access to anon/authenticated. Do not
-- reuse this schema for a publicly-shared/multi-user deployment without
-- replacing these policies with real per-user ones (see CONTEXT.md).
do $$
declare
  t text;
begin
  foreach t in array array[
    'problems', 'research_questions', 'papers', 'projects', 'labs',
    'scholarships', 'timeline_milestones', 'journal_entries', 'vision',
    'sop_document', 'sop_versions', 'graph_nodes', 'graph_edges'
  ]
  loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists "public_full_access" on %I', t);
    execute format(
      'create policy "public_full_access" on %I for all to anon, authenticated using (true) with check (true)',
      t
    );
  end loop;
end $$;
