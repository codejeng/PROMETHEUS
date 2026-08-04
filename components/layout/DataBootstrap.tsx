"use client";

import { useEffect } from "react";
import { useProblemsStore } from "@/store/useProblemsStore";
import { useQuestionsStore } from "@/store/useQuestionsStore";
import { usePapersStore } from "@/store/usePapersStore";
import { useProjectsStore } from "@/store/useProjectsStore";
import { useLabsStore } from "@/store/useLabsStore";
import { useScholarshipsStore } from "@/store/useScholarshipsStore";
import { useTimelineStore } from "@/store/useTimelineStore";
import { useJournalStore } from "@/store/useJournalStore";
import { useVisionStore } from "@/store/useVisionStore";
import { useSOPStore } from "@/store/useSOPStore";
import { useGraphStore } from "@/store/useGraphStore";
import { useProfileStore } from "@/store/useProfileStore";
import { useBriefingInterestsStore } from "@/store/useBriefingInterestsStore";

/**
 * Fires every store's initial Supabase fetch once, on first mount.
 * Renders nothing — mounted once in AppShell alongside the rest of the
 * chrome so every page has data available regardless of which route
 * loaded first.
 */
export function DataBootstrap() {
  const fetchProblems = useProblemsStore((s) => s.fetchAll);
  const fetchQuestions = useQuestionsStore((s) => s.fetchAll);
  const fetchPapers = usePapersStore((s) => s.fetchAll);
  const fetchProjects = useProjectsStore((s) => s.fetchAll);
  const fetchLabs = useLabsStore((s) => s.fetchAll);
  const fetchScholarships = useScholarshipsStore((s) => s.fetchAll);
  const fetchTimeline = useTimelineStore((s) => s.fetchAll);
  const fetchJournal = useJournalStore((s) => s.fetchAll);
  const fetchVision = useVisionStore((s) => s.fetch);
  const fetchSOP = useSOPStore((s) => s.fetch);
  const fetchGraph = useGraphStore((s) => s.fetch);
  const fetchProfile = useProfileStore((s) => s.fetch);
  const fetchBriefingInterests = useBriefingInterestsStore((s) => s.fetch);

  useEffect(() => {
    fetchProblems();
    fetchQuestions();
    fetchPapers();
    fetchProjects();
    fetchLabs();
    fetchScholarships();
    fetchTimeline();
    fetchJournal();
    fetchVision();
    fetchSOP();
    fetchGraph();
    fetchProfile();
    fetchBriefingInterests();
  }, [
    fetchProblems,
    fetchQuestions,
    fetchPapers,
    fetchProjects,
    fetchLabs,
    fetchScholarships,
    fetchTimeline,
    fetchJournal,
    fetchVision,
    fetchSOP,
    fetchGraph,
    fetchProfile,
    fetchBriefingInterests,
  ]);

  return null;
}
