import { Suspense } from "react";
import { TimelinePage } from "@/features/timeline/TimelinePage";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <TimelinePage />
    </Suspense>
  );
}
