import { lazy, Suspense } from "react";
const LessonView = lazy(() => import("@/components/templates/LessonView").then(m => ({ default: m.LessonView })));
import ExplorableView from "./ExplorableView";

const Index = () => {
  const handleEditBlock = (instruction: string) => {
    console.log("Edit block instruction:", instruction);
  };

  // Tutor mode: ?explorable=<id> renders a single registered explorable
  // (see src/pages/ExplorableView.tsx). Without the param, behavior is
  // unchanged.
  if (new URLSearchParams(window.location.search).has("explorable")) {
    return <ExplorableView />;
  }

  return (
    <div className="h-dvh">
      <Suspense fallback={<p role="status">Loading lesson…</p>}><LessonView onEditBlock={handleEditBlock} /></Suspense>
    </div>
  );
};

export default Index;
