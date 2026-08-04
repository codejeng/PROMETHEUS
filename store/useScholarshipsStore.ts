import { createSupabaseEntityStore } from "./createSupabaseEntityStore";
import { Scholarship } from "@/types";
import { scholarshipsSeed } from "@/lib/seedData";

export const useScholarshipsStore = createSupabaseEntityStore<Scholarship>(
  "scholarships",
  scholarshipsSeed
);
