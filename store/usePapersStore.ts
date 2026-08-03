import { createEntityStore } from "./createEntityStore";
import { Paper } from "@/types";
import { papersSeed } from "@/lib/seedData";

export const usePapersStore = createEntityStore<Paper>("papers", papersSeed);
