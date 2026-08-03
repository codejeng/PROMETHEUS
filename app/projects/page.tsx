import { Suspense } from "react";
import { ProjectsPage } from "@/features/projects/ProjectsPage";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ProjectsPage />
    </Suspense>
  );
}
