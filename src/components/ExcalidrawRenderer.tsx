import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { Excalidraw, convertToExcalidrawElements } from "@excalidraw/excalidraw";
import { parseMermaidToExcalidraw } from "@excalidraw/mermaid-to-excalidraw";
import "@excalidraw/excalidraw/index.css";

type BinaryFiles = Record<string, any>;

interface ExcalidrawRendererProps {
  mermaid?: string;
  elements?: any[];
  files?: BinaryFiles;
  viewModeEnabled?: boolean;
  zenModeEnabled?: boolean;
  uiOptions?: any;
  mermaidConfig?: any;
  style?: CSSProperties;
  className?: string;
}

export const ExcalidrawRenderer = ({
  mermaid,
  elements,
  files,
  viewModeEnabled = true,
  zenModeEnabled = true,
  uiOptions,
  mermaidConfig,
  style,
  className,
}: ExcalidrawRendererProps) => {
  const [renderElements, setRenderElements] = useState<any[]>(elements || []);
  const [renderFiles, setRenderFiles] = useState<BinaryFiles>(files || {});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const defaultUIOptions = useMemo(
    () => ({
      canvasActions: {
        changeViewBackgroundColor: false,
        clearCanvas: false,
        export: false,
        saveAsImage: false,
        saveToActiveFile: false,
        toggleTheme: null,
        toggleZenMode: false,
        loadScene: false,
      },
      tools: {
        image: false,
      },
    }),
    []
  );

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!mermaid) return;
      setLoading(true);
      setError(null);
      try {
        const { elements: parsedElements, files: parsedFiles } = await parseMermaidToExcalidraw(
          mermaid.trim(),
          mermaidConfig
        );
        if (cancelled) return;
        const excaliElements = convertToExcalidrawElements(parsedElements);
        setRenderElements(excaliElements);
        setRenderFiles(parsedFiles || {});
      } catch (e) {
        if (!cancelled) setError("Failed to render Mermaid diagram");
        // eslint-disable-next-line no-console
        console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [mermaid, mermaidConfig]);

  // If caller provided raw elements/files, prefer them.
  useEffect(() => {
    if (elements && elements.length) setRenderElements(elements);
  }, [elements]);

  useEffect(() => {
    if (files) setRenderFiles(files);
  }, [files]);

  if (loading) {
    return <div style={{ padding: 12 }}>Rendering diagram…</div>;
  }

  if (error) {
    return <div style={{ color: "#b00020", padding: 12 }}>{error}</div>;
  }

  return (
    <div style={style} className={className}>
      <Excalidraw
        initialData={{ elements: renderElements, files: renderFiles }}
        viewModeEnabled={viewModeEnabled}
        zenModeEnabled={zenModeEnabled}
        UIOptions={{ ...defaultUIOptions, ...(uiOptions || {}) }}
        renderTopRightUI={null}
      />
    </div>
  );
};

export default ExcalidrawRenderer;