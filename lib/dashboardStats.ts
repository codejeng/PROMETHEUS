import dayjs from "dayjs";
import { JournalEntry, Paper, Project, Scholarship } from "@/types";

export function computeJournalStreak(entries: JournalEntry[]): number {
  if (entries.length === 0) return 0;
  const dates = new Set(entries.map((e) => dayjs(e.date).format("YYYY-MM-DD")));
  let streak = 0;
  let cursor = dayjs();
  // allow today to be "not yet written" without breaking the streak
  if (!dates.has(cursor.format("YYYY-MM-DD"))) {
    cursor = cursor.subtract(1, "day");
  }
  while (dates.has(cursor.format("YYYY-MM-DD"))) {
    streak += 1;
    cursor = cursor.subtract(1, "day");
  }
  return streak;
}

export function weeklyReadingHours(papers: Paper[]): { day: string; hours: number }[] {
  const days = Array.from({ length: 7 }).map((_, i) => dayjs().subtract(6 - i, "day"));
  return days.map((d) => {
    const label = d.format("ddd");
    const hours = papers
      .filter((p) => dayjs(p.updatedAt).isSame(d, "day"))
      .reduce((sum, p) => sum + p.hoursRead, 0);
    return { day: label, hours: Math.round(hours * 10) / 10 };
  });
}

export function knowledgeGrowthSeries(
  papers: Paper[],
  projects: Project[]
): { week: string; papers: number; projects: number }[] {
  const weeks = Array.from({ length: 6 }).map((_, i) => dayjs().subtract((5 - i) * 7, "day"));
  return weeks.map((w, i) => {
    const cutoff = w.endOf("day");
    return {
      week: i === 5 ? "Now" : `-${(5 - i) * 7}d`,
      papers: papers.filter((p) => dayjs(p.createdAt).isBefore(cutoff)).length,
      projects: projects.filter((p) => dayjs(p.createdAt).isBefore(cutoff)).length,
    };
  });
}

export function nearestScholarshipDeadline(scholarships: Scholarship[]): Scholarship | null {
  const upcoming = scholarships
    .filter((s) => dayjs(s.deadline).isAfter(dayjs()) && s.status !== "Rejected")
    .sort((a, b) => dayjs(a.deadline).valueOf() - dayjs(b.deadline).valueOf());
  return upcoming[0] ?? null;
}

export function projectStageCounts(projects: Project[]) {
  const stages: Project["stage"][] = ["Ideas", "Planning", "Research", "Building", "Completed"];
  return stages.map((stage) => ({
    stage,
    count: projects.filter((p) => p.stage === stage).length,
  }));
}
