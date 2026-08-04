import { createSupabaseEntityStore } from "./createSupabaseEntityStore";
import { Lab } from "@/types";
import { labsSeed } from "@/lib/seedData";

export const useLabsStore = createSupabaseEntityStore<Lab>("labs", labsSeed);
