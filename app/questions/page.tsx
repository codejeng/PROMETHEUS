import { Suspense } from "react";
import { QuestionsPage } from "@/features/questions/QuestionsPage";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <QuestionsPage />
    </Suspense>
  );
}
