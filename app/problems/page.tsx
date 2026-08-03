import { Suspense } from "react";
import { ProblemsPage } from "@/features/problems/ProblemsPage";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ProblemsPage />
    </Suspense>
  );
}
