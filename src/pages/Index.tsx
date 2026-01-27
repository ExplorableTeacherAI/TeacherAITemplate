import { LessonView } from "@/components/templates";

const Index = () => {
  const handleEditSection = (instruction: string) => {
    console.log("Edit section instruction:", instruction);
  };

  return (
    <div className="h-screen">
      <LessonView onEditSection={handleEditSection} />
    </div>
  );
};

export default Index;
