import { useState } from "react";
import { LessonView } from "@/components/LessonView";
import { ModeIndicator } from "@/components/ModeIndicator";

const Index = () => {
  const [content] = useState(`flowchart TD
  A[Christmas] -->|Get money| B(Go shopping)
  B --> C{Let me think}
  C -->|One| D[Laptop]
  C -->|Two| E[iPhone]
  C -->|Three| F[Car]`);



  const handleEditSection = (instruction: string) => {
    console.log("Edit section instruction:", instruction);
  };

  return (
    <div className="h-screen">
      <ModeIndicator />
      <LessonView content={content} onEditSection={handleEditSection} />
    </div>
  );
};

export default Index;
