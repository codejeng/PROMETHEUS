import { createEntityStore } from "./createEntityStore";
import { TimelineMilestone } from "@/types";
import { timelineSeed } from "@/lib/seedData";

export const useTimelineStore = createEntityStore<TimelineMilestone>("timeline", timelineSeed);
