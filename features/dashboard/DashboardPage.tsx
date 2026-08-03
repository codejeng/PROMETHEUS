"use client";

import { Box, Grid, Card, Typography, Stack, Chip, LinearProgress } from "@mui/material";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RTooltip,
  CartesianGrid,
} from "recharts";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import LocalFireDepartmentOutlinedIcon from "@mui/icons-material/LocalFireDepartmentOutlined";
import ViewKanbanOutlinedIcon from "@mui/icons-material/ViewKanbanOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import AutoGraphOutlinedIcon from "@mui/icons-material/AutoGraphOutlined";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { useProblemsStore } from "@/store/useProblemsStore";
import { useQuestionsStore } from "@/store/useQuestionsStore";
import { usePapersStore } from "@/store/usePapersStore";
import { useProjectsStore } from "@/store/useProjectsStore";
import { useScholarshipsStore } from "@/store/useScholarshipsStore";
import { useJournalStore } from "@/store/useJournalStore";
import { useVisionStore } from "@/store/useVisionStore";
import {
  computeJournalStreak,
  weeklyReadingHours,
  knowledgeGrowthSeries,
  nearestScholarshipDeadline,
  projectStageCounts,
} from "@/lib/dashboardStats";
import { daysUntil, formatDate } from "@/utils/date";
import { useT } from "@/hooks/useT";

export function DashboardPage() {
  const t = useT("dashboard");
  const problems = useProblemsStore((s) => s.items);
  const questions = useQuestionsStore((s) => s.items);
  const papers = usePapersStore((s) => s.items);
  const projects = useProjectsStore((s) => s.items);
  const scholarships = useScholarshipsStore((s) => s.items);
  const journal = useJournalStore((s) => s.items);
  const vision = useVisionStore((s) => s.vision);

  const streak = computeJournalStreak(journal);
  const readingSeries = weeklyReadingHours(papers);
  const growthSeries = knowledgeGrowthSeries(papers, projects);
  const nearestScholarship = nearestScholarshipDeadline(scholarships);
  const stageCounts = projectStageCounts(projects);

  const readPapers = papers.filter((p) => p.status === "Read").length;
  const readingProgress = papers.length ? Math.round((readPapers / papers.length) * 100) : 0;

  const activeProject = projects
    .filter((p) => p.stage === "Research" || p.stage === "Building")
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))[0];

  const latestJournal = [...journal].sort((a, b) => (a.date < b.date ? 1 : -1))[0];

  const totalChecklist = scholarships.flatMap((s) => s.checklist);
  const doneChecklist = totalChecklist.filter((c) => c.done).length;
  const applicationProgress = totalChecklist.length
    ? Math.round((doneChecklist / totalChecklist.length) * 100)
    : 0;

  return (
    <Box>
      <PageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        subtitle={vision.mission ? vision.mission.slice(0, 140) : t("subtitleEmpty")}
      />

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            label={t("todaysMission")}
            value={activeProject ? activeProject.title.slice(0, 22) : t("pickFocus")}
            hint={activeProject ? `${activeProject.stage} · ${activeProject.progress}%` : t("noActiveProject")}
            icon={FlagOutlinedIcon}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            label={t("currentResearchFocus")}
            value={questions.length ? questions[0].question.slice(0, 22) + "…" : t("noQuestionsYet")}
            hint={questions.length ? questions[0].difficulty : t("addOneOnQuestions")}
            icon={ScienceOutlinedIcon}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            label={t("readingProgress")}
            value={`${readingProgress}%`}
            hint={t("papersRead", { done: readPapers, total: papers.length })}
            icon={MenuBookOutlinedIcon}
          >
            <LinearProgress variant="determinate" value={readingProgress} sx={{ height: 6, borderRadius: 3 }} />
          </StatCard>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            label={t("journalStreak")}
            value={`${streak} ${streak === 1 ? "day" : "days"}`}
            hint={latestJournal ? t("lastEntry", { date: formatDate(latestJournal.date) }) : t("startJournaling")}
            icon={LocalFireDepartmentOutlinedIcon}
            accent="warning"
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ p: 3, height: "100%" }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {t("projectsByStage")}
              </Typography>
              <ViewKanbanOutlinedIcon sx={{ fontSize: 18, color: "text.secondary" }} />
            </Stack>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stageCounts} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="stage" tick={{ fontSize: 11 }} stroke="rgba(255,255,255,0.3)" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="rgba(255,255,255,0.3)" />
                <RTooltip
                  contentStyle={{ background: "#202020", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, fontSize: 12 }}
                />
                <Bar dataKey="count" fill="#D9C9A3" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ p: 3, height: "100%" }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {t("readingHours")}
              </Typography>
              <MenuBookOutlinedIcon sx={{ fontSize: 18, color: "text.secondary" }} />
            </Stack>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={readingSeries} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="rgba(255,255,255,0.3)" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="rgba(255,255,255,0.3)" />
                <RTooltip
                  contentStyle={{ background: "#202020", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, fontSize: 12 }}
                />
                <Bar dataKey="hours" fill="#8FB2C9" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard
            label={t("scholarshipCountdown")}
            value={
              nearestScholarship ? `${daysUntil(nearestScholarship.deadline)}d` : t("noneUpcoming")
            }
            hint={nearestScholarship ? nearestScholarship.name : t("addScholarship")}
            icon={SchoolOutlinedIcon}
            accent="danger"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard
            label={t("applicationProgress")}
            value={`${applicationProgress}%`}
            hint={t("checklistDone", { done: doneChecklist, total: totalChecklist.length })}
            icon={AssignmentTurnedInOutlinedIcon}
          >
            <LinearProgress variant="determinate" value={applicationProgress} sx={{ height: 6, borderRadius: 3 }} />
          </StatCard>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard
            label={t("problemsTracked")}
            value={`${problems.length}`}
            hint={problems.map((p) => p.domain).slice(0, 3).join(", ") || t("noneYet")}
            icon={AutoGraphOutlinedIcon}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <Card sx={{ p: 3, height: "100%" }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {t("knowledgeGrowth")}
              </Typography>
              <AutoGraphOutlinedIcon sx={{ fontSize: 18, color: "text.secondary" }} />
            </Stack>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={growthSeries} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="week" tick={{ fontSize: 11 }} stroke="rgba(255,255,255,0.3)" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="rgba(255,255,255,0.3)" />
                <RTooltip
                  contentStyle={{ background: "#202020", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, fontSize: 12 }}
                />
                <Line type="monotone" dataKey="papers" stroke="#D9C9A3" strokeWidth={2} dot={false} name="Papers" />
                <Line type="monotone" dataKey="projects" stroke="#7FB77E" strokeWidth={2} dot={false} name="Projects" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ p: 3, height: "100%" }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1.5 }}>
              {t("weeklyReflection")}
            </Typography>
            {latestJournal ? (
              <Stack spacing={1.25}>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  {formatDate(latestJournal.date)}
                </Typography>
                <Typography variant="body2">{latestJournal.insights || latestJournal.todaysLearning}</Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Chip size="small" label={`Mood: ${latestJournal.mood}`} />
                  <Chip size="small" label={`Energy: ${latestJournal.energy}/5`} />
                  <Chip size="small" label={`${latestJournal.deepWorkHours}h deep work`} />
                </Stack>
              </Stack>
            ) : (
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                {t("noJournalYet")}
              </Typography>
            )}
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
