import { LessonView } from "@/components/templates";

const Index = () => {
  const handleEditBlock = (instruction: string) => {
    console.log("Edit block instruction:", instruction);
  };

  return (
    <div className="h-screen">
      <LessonView onEditBlock={handleEditBlock} />
    </div>
  );
};

export default Index;
