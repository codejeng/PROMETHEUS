import { Suspense } from "react";
import { LabsPage } from "@/features/labs/LabsPage";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <LabsPage />
    </Suspense>
  );
}
