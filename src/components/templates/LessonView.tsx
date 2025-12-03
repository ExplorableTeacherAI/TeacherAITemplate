import { useEffect, useState, type ReactElement } from "react";
import { Card } from "@/components/atoms/ui/card";
import SectionRenderer from "./SectionRenderer";
import { loadSections, createSectionsWatcher } from "@/lib/section-loader";
import sectionLoaderConfig from "@/config/sections-loader.config";
import { useAppMode } from "@/contexts/AppModeContext";

interface LessonViewProps {
  onEditSection?: (instruction: string) => void;
}

export const LessonView = ({ onEditSection }: LessonViewProps) => {
  const [initialSections, setInitialSections] = useState<ReactElement[]>([]);
  const [loadingSections, setLoadingSections] = useState(true);
  const { isPreview } = useAppMode();

  useEffect(() => {
    let cancelled = false;
    let cleanup: (() => void) | null = null;

    (async () => {
      // Load sections using the configured strategy
      const secs = await loadSections(sectionLoaderConfig);
      if (cancelled) return;
      setInitialSections(Array.isArray(secs) ? secs : []);
      setLoadingSections(false);

      // Set up watcher for automatic updates in dev mode
      if (import.meta.env.DEV) {
        cleanup = createSectionsWatcher(
          (updatedSections) => {
            if (!cancelled) {
              setInitialSections(updatedSections);
            }
          },
          sectionLoaderConfig
        );
      }
    })();

    return () => {
      cancelled = true;
      if (cleanup) cleanup();
    };
  }, []);

  return (
    <div className="flex flex-col h-full glass">
      <Card className="flex-1 overflow-hidden bg-white no-border">
        {!loadingSections && initialSections.length > 0 ? (
          <div className="relative w-full h-full">
            <SectionRenderer initialSections={initialSections} isPreview={isPreview} onEditSection={onEditSection} />
          </div>
        ) : loadingSections ? (
          <div className="flex items-center justify-center h-full text-foreground">
            <div className="text-center">
              <p className="text-lg mb-2">⏳ Loading sections...</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-foreground">
            <div className="text-center">
              <p className="text-lg mb-2">📚 Lesson View</p>
              <p className="text-sm">Start by editing sections.tsx</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};