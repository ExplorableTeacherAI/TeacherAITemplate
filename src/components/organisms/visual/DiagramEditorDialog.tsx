import { useEffect, useMemo, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/atoms/ui/dialog";
import { Button } from "@/components/atoms/ui/button";
import { Excalidraw } from "@excalidraw/excalidraw";
import { parseMermaidToExcalidraw } from "@excalidraw/mermaid-to-excalidraw";
import { convertToExcalidrawElements } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";

type BinaryFiles = Record<string, any>;

export interface DiagramEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mermaid?: string;
  elements?: any[];
  files?: BinaryFiles;
  title?: string;
  onSave: (elements: any[], files: BinaryFiles) => void;
}

export const DiagramEditorDialog = ({
  open,
  onOpenChange,
  mermaid,
  elements,
  files,
  title = "Edit Diagram",
  onSave,
}: DiagramEditorDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [editElements, setEditElements] = useState<any[] | null>(null);
  const [editFiles, setEditFiles] = useState<BinaryFiles | null>(null);
  const [editAppState, setEditAppState] = useState<any | null>(null);
  const editorContainerRef = useRef<HTMLDivElement | null>(null);

  const hasMermaid = useMemo(() => !!(mermaid && mermaid.trim().length > 0), [mermaid]);
  const hasDiagramData = useMemo(() => Array.isArray(elements) && (elements?.length || 0) > 0, [elements]);

  // Prepare editor initial data when dialog opens
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!open) return;
      setLoading(true);
      try {
        if (hasDiagramData) {
          setEditElements(elements || []);
          setEditFiles(files || {});
        } else if (hasMermaid && mermaid) {
          const { elements: parsedElements, files: parsedFiles } = await parseMermaidToExcalidraw(mermaid.trim());
          const excaliElements = convertToExcalidrawElements(parsedElements);
          if (!cancelled) {
            setEditElements(excaliElements);
            setEditFiles(parsedFiles || {});
          }
        } else {
          setEditElements([]);
          setEditFiles({});
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error("Failed to prepare Excalidraw editor", e);
        if (!cancelled) {
          setEditElements(elements || []);
          setEditFiles(files || {});
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [open, hasDiagramData, hasMermaid, elements, files, mermaid]);

  // Compute appState to center diagram when editor opens
  useEffect(() => {
    if (!open || loading) return;
    const container = editorContainerRef.current;
    const els = editElements || [];
    if (!container || !els || els.length === 0) return;
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    for (const el of els) {
      if (!el || el.isDeleted) continue;
      const x = Number(el.x || 0);
      const y = Number(el.y || 0);
      const w = Number(el.width || 0);
      const h = Number(el.height || 0);
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + w);
      maxY = Math.max(maxY, y + h);
    }
    if (!isFinite(minX) || !isFinite(minY) || !isFinite(maxX) || !isFinite(maxY)) return;
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    const rect = container.getBoundingClientRect();
    const targetX = rect.width / 2;
    const targetY = rect.height / 2;
    setEditAppState({ scrollX: targetX - cx, scrollY: targetY - cy });
  }, [open, loading, editElements]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[1100px] w-[85vw] h-[72vh] p-3 sm:p-4 overflow-hidden">
        <div className="flex h-full flex-col">
          <DialogHeader className="shrink-0">
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <div ref={editorContainerRef} className="excal-editor flex-1 min-h-0">
            {loading ? (
              <div className="p-4 text-sm">Loading editor…</div>
            ) : (
              <Excalidraw
                initialData={{
                  elements: editElements || [],
                  files: editFiles || {},
                  appState: editAppState || {},
                }}
                viewModeEnabled={false}
                zenModeEnabled={false}
                UIOptions={{
                  canvasActions: {
                    changeViewBackgroundColor: true,
                    clearCanvas: true,
                    export: false,
                    saveAsImage: true,
                    saveToActiveFile: false,
                    toggleTheme: true,
                    loadScene: true,
                  },
                }}
                onChange={(els, _app, f) => {
                  setEditElements(els as any[]);
                  setEditFiles((f as BinaryFiles) || {});
                }}
              />
            )}
          </div>
          <DialogFooter className="shrink-0 pt-2">
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                variant="default"
                onClick={() => {
                  const els = editElements || [];
                  const f = editFiles || {};
                  onSave(els, f);
                  onOpenChange(false);
                }}
              >
                Save
              </Button>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DiagramEditorDialog;