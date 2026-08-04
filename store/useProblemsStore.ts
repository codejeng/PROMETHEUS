import { createSupabaseEntityStore } from "./createSupabaseEntityStore";
import { Problem } from "@/types";
import { problemsSeed } from "@/lib/seedData";

export const useProblemsStore = createSupabaseEntityStore<Problem>("problems", problemsSeed);
