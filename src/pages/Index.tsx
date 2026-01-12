import { LessonView } from "@/components/templates";
// import { ModeIndicator } from "@/components/atoms";

const Index = () => {
  const handleEditSection = (instruction: string) => {
    console.log("Edit section instruction:", instruction);
  };

  return (
    <div className="h-screen">
      {/* <ModeIndicator /> */}
      <LessonView onEditSection={handleEditSection} />
    </div>
  );
};

export default Index;
