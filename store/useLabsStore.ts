import { createEntityStore } from "./createEntityStore";
import { Lab } from "@/types";
import { labsSeed } from "@/lib/seedData";

export const useLabsStore = createEntityStore<Lab>("labs", labsSeed);
