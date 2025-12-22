import { useEffect, useState, type ReactElement } from "react";
import { WelcomeScreen } from "./WelcomeScreen";
import { Card } from "@/components/atoms/ui/card";
import SectionRenderer from "./SectionRenderer";
import { loadSections, createSectionsWatcher } from "@/lib/section-loader";
import sectionLoaderConfig from "@/config/sections-loader.config";
import { useAppMode } from "@/contexts/AppModeContext";
import { LoadingScreen } from "@/components/atoms/LoadingScreen";

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

  // Show loading screen at top level
  if (loadingSections) {
    return <LoadingScreen />;
  }

  return (
    <div className="flex flex-col h-full glass">
      <Card className="flex-1 overflow-hidden bg-white no-border relative">
        {initialSections.length > 0 ? (
          <div className="relative w-full h-full">
            <SectionRenderer initialSections={initialSections} isPreview={isPreview} onEditSection={onEditSection} />
          </div>
        ) : (
          <WelcomeScreen />
        )}
      </Card>
    </div>
  );
};