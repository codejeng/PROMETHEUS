import { Suspense } from "react";
import { ScholarshipsPage } from "@/features/scholarships/ScholarshipsPage";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ScholarshipsPage />
    </Suspense>
  );
}
