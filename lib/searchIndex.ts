import { useProblemsStore } from "@/store/useProblemsStore";
import { useQuestionsStore } from "@/store/useQuestionsStore";
import { usePapersStore } from "@/store/usePapersStore";
import { useProjectsStore } from "@/store/useProjectsStore";
import { useLabsStore } from "@/store/useLabsStore";
import { useScholarshipsStore } from "@/store/useScholarshipsStore";
import { useJournalStore } from "@/store/useJournalStore";
import { useTimelineStore } from "@/store/useTimelineStore";
import { SearchResult } from "@/types";
import { formatDate } from "@/utils/date";

export function useSearchIndex(): SearchResult[] {
  const problems = useProblemsStore((s) => s.items);
  const questions = useQuestionsStore((s) => s.items);
  const papers = usePapersStore((s) => s.items);
  const projects = useProjectsStore((s) => s.items);
  const labs = useLabsStore((s) => s.items);
  const scholarships = useScholarshipsStore((s) => s.items);
  const journal = useJournalStore((s) => s.items);
  const timeline = useTimelineStore((s) => s.items);

  const results: SearchResult[] = [
    ...problems.map((p) => ({
      kind: "problem" as const,
      id: p.id,
      title: p.title,
      subtitle: p.domain,
      href: `/problems?id=${p.id}`,
    })),
    ...questions.map((q) => ({
      kind: "question" as const,
      id: q.id,
      title: q.question,
      subtitle: q.difficulty,
      href: `/questions?id=${q.id}`,
    })),
    ...papers.map((p) => ({
      kind: "paper" as const,
      id: p.id,
      title: p.title,
      subtitle: p.authors.join(", "),
      href: `/reading?id=${p.id}`,
    })),
    ...projects.map((p) => ({
      kind: "project" as const,
      id: p.id,
      title: p.title,
      subtitle: p.stage,
      href: `/projects?id=${p.id}`,
    })),
    ...labs.map((l) => ({
      kind: "lab" as const,
      id: l.id,
      title: `${l.professor} — ${l.university}`,
      subtitle: l.researchArea,
      href: `/labs?id=${l.id}`,
    })),
    ...scholarships.map((s) => ({
      kind: "scholarship" as const,
      id: s.id,
      title: s.name,
      subtitle: s.university,
      href: `/scholarships?id=${s.id}`,
    })),
    ...journal.map((j) => ({
      kind: "journal" as const,
      id: j.id,
      title: `Journal — ${formatDate(j.date)}`,
      subtitle: j.todaysLearning.slice(0, 60),
      href: `/journal?id=${j.id}`,
    })),
    ...timeline.map((t) => ({
      kind: "milestone" as const,
      id: t.id,
      title: t.title,
      subtitle: formatDate(t.date),
      href: `/timeline?id=${t.id}`,
    })),
  ];

  return results;
}
