import { Suspense } from "react";
import { ReadingPage } from "@/features/reading/ReadingPage";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ReadingPage />
    </Suspense>
  );
}
