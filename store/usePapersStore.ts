import { createSupabaseEntityStore } from "./createSupabaseEntityStore";
import { Paper } from "@/types";
import { papersSeed } from "@/lib/seedData";

export const usePapersStore = createSupabaseEntityStore<Paper>("papers", papersSeed);
