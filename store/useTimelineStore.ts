import { createSupabaseEntityStore } from "./createSupabaseEntityStore";
import { TimelineMilestone } from "@/types";
import { timelineSeed } from "@/lib/seedData";

export const useTimelineStore = createSupabaseEntityStore<TimelineMilestone>(
  "timeline_milestones",
  timelineSeed
);
