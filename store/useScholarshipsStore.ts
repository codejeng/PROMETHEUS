import { createEntityStore } from "./createEntityStore";
import { Scholarship } from "@/types";
import { scholarshipsSeed } from "@/lib/seedData";

export const useScholarshipsStore = createEntityStore<Scholarship>("scholarships", scholarshipsSeed);
