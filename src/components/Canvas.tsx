import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import ExcalidrawRenderer from "./ExcalidrawRenderer";
import SectionCanvas from "./SectionCanvas";
import type { Section } from "./SectionBlock";
import { loadSections, createSectionsWatcher } from "@/lib/section-loader";
import sectionLoaderConfig from "@/config/sections-loader.config";
import "@excalidraw/excalidraw/index.css";

interface CanvasProps {
  content: string;
  onEditSection?: (instruction: string) => void;
}

export const Canvas = ({ content, onEditSection }: CanvasProps) => {
  const [initialSections, setInitialSections] = useState<Section[]>([]);
  const [loadingSections, setLoadingSections] = useState(true);

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


  const isMermaid = useMemo(() => {
    if (!content) return false;
    const text = content.trim();
    const mermaidStarts = [
      "flowchart",
      "graph",
      "sequenceDiagram",
      "classDiagram",
      "stateDiagram",
      "erDiagram",
      "gantt",
      "journey",
    ];
    const looksLikeHtml = /<\w+[\s\S]*>/i.test(text);
    return !looksLikeHtml && mermaidStarts.some((kw) => text.startsWith(kw));
  }, [content]);

  return (
    <div className="flex flex-col h-full glass  ">
      <Card className="flex-1 overflow-hidden bg-white no-border">
        {(!loadingSections && initialSections.length > 0) ? (
          <div className="relative w-full h-full">
            <SectionCanvas initialSections={initialSections} />
          </div>
        ) : isMermaid ? (
          <div className="w-full h-full">
            <ExcalidrawRenderer mermaid={content.trim()} className="w-full h-full" />
          </div>
        ) : content ? (
          <iframe
            srcDoc={content}
            className="w-full h-full "
            title="Preview"
            sandbox="allow-scripts allow-same-origin"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-foreground">
            <div className="text-center">
              <p className="text-lg mb-2">🎨 Canvas is empty</p>
              <p className="text-sm">Start by describing what you want to create</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};