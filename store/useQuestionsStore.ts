import { createSupabaseEntityStore } from "./createSupabaseEntityStore";
import { ResearchQuestion } from "@/types";
import { questionsSeed } from "@/lib/seedData";

export const useQuestionsStore = createSupabaseEntityStore<ResearchQuestion>(
  "research_questions",
  questionsSeed
);
