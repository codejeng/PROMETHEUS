import { createEntityStore } from "./createEntityStore";
import { Project } from "@/types";
import { projectsSeed } from "@/lib/seedData";

export const useProjectsStore = createEntityStore<Project>("projects", projectsSeed);
