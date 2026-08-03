import { Suspense } from "react";
import { JournalPage } from "@/features/journal/JournalPage";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <JournalPage />
    </Suspense>
  );
}
