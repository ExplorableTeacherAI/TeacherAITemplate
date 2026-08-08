import { LessonView } from "@/components/templates";
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
    <div className="h-screen">
      <LessonView onEditBlock={handleEditBlock} />
    </div>
  );
};

export default Index;
