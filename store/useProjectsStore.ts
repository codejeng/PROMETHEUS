import { createSupabaseEntityStore } from "./createSupabaseEntityStore";
import { Project } from "@/types";
import { projectsSeed } from "@/lib/seedData";

export const useProjectsStore = createSupabaseEntityStore<Project>("projects", projectsSeed);
