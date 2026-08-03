import { createEntityStore } from "./createEntityStore";
import { ResearchQuestion } from "@/types";
import { questionsSeed } from "@/lib/seedData";

export const useQuestionsStore = createEntityStore<ResearchQuestion>("questions", questionsSeed);
