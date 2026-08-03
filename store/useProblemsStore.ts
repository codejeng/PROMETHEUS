import { createEntityStore } from "./createEntityStore";
import { Problem } from "@/types";
import { problemsSeed } from "@/lib/seedData";

export const useProblemsStore = createEntityStore<Problem>("problems", problemsSeed);
