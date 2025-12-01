import React from "react";
import DOMPurify from "dompurify";
import { ExcalidrawRenderer } from "./ExcalidrawRenderer";
import { DesmosRenderer } from "./DesmosRenderer";
import { MermaidRenderer } from "./MermaidRenderer";
import { GeogebraRenderer } from "./GeogebraRenderer";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GripVertical, Plus, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DiagramEditorDialog } from "./DiagramEditorDialog";

export type Section = {
  id: string;
  type?: "html" | "mermaid" | "excalidraw" | "desmos" | "geogebra";
  title?: string;
  description?: string;
  content?: string;
  mermaid?: string;
  elements?: any[];
  files?: Record<string, any>;
};

interface SectionBoxProps {
  section: Section;
  onAddAbove: (id: string) => void;
  onAddBelow: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onRename?: (id: string) => void;
  onBeginDrag: (id: string, e: React.PointerEvent) => void;
  onUpdateTitle: (id: string, title: string) => void;
  onUpdateContent: (id: string, content: string) => void;
  onUpdateDiagram: (id: string, elements: any[], files: Record<string, any>) => void;
  onSendAI: (id: string, prompt: string) => void;
  autoFocus?: boolean;
  isPreview?: boolean;
}

export const SectionBlock: React.FC<SectionBoxProps> = ({
  section,
  onAddAbove,
  onAddBelow,
  onDelete,
  onBeginDrag,
  onUpdateTitle,
  onUpdateContent,
  onUpdateDiagram,
  onSendAI,
  autoFocus,
  isPreview = false,
}) => {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const contentRef = React.useRef<HTMLDivElement | null>(null);
  const [glow, setGlow] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const sanitizedContent = React.useMemo(() => {
    const raw = section.content || "";
    return raw ? DOMPurify.sanitize(raw, { USE_PROFILES: { html: true } }) : "";
  }, [section.content]);

  const mermaidSource = React.useMemo(() => {
    if (section.type === "mermaid") {
      const s = section.mermaid ?? section.content;
      return typeof s === "string" ? s : "";
    }
    return typeof section.mermaid === "string" ? section.mermaid : "";
  }, [section.type, section.mermaid, section.content]);

  const elementsFromContent = React.useMemo(() => {
    if (section.type === "excalidraw") {
      const c: any = section.content;
      if (Array.isArray(c)) return c;
      if (typeof c === "string") {
        try {
          const obj = JSON.parse(c);
          return Array.isArray(obj?.elements) ? obj.elements : null;
        } catch { }
      } else if (c && typeof c === "object" && Array.isArray((c as any).elements)) {
        return (c as any).elements;
      }
    }
    return null;
  }, [section.type, section.content]);

  const filesFromContent = React.useMemo(() => {
    if (section.type === "excalidraw") {
      const c: any = section.content;
      if (typeof c === "string") {
        try {
          const obj = JSON.parse(c);
          return obj?.files && typeof obj.files === "object" ? obj.files : undefined;
        } catch { }
      } else if (c && typeof c === "object") {
        return (c as any).files && typeof (c as any).files === "object" ? (c as any).files : undefined;
      }
    }
    return undefined;
  }, [section.type, section.content]);

  const hasMermaid = React.useMemo(() => !!(mermaidSource && mermaidSource.trim().length > 0), [mermaidSource]);
  const elementsToRender = React.useMemo(() => section.elements ?? elementsFromContent ?? [], [section.elements, elementsFromContent]);
  const filesToRender = React.useMemo(() => section.files ?? filesFromContent ?? {}, [section.files, filesFromContent]);
  const hasDiagramData = React.useMemo(() => Array.isArray(elementsToRender) && elementsToRender.length > 0, [elementsToRender]);
  const isMermaid = (section.type === "mermaid") || hasMermaid;
  const isExcalidraw = (section.type === "excalidraw") || hasDiagramData;
  const desmosParsed = React.useMemo(() => {
    if (section.type !== "desmos") return null;
    const c: any = section.content;
    if (typeof c === "string") {
      const trimmed = c.trim();
      try {
        const obj = JSON.parse(trimmed);
        if (obj && typeof obj === "object") {
          const state = obj.state && typeof obj.state === "object" ? obj.state : undefined;
          const expressions = Array.isArray(obj.expressions) ? obj.expressions : undefined;
          const options = obj.options && typeof obj.options === "object" ? obj.options : undefined;
          return { state, expressions, options };
        }
      } catch { }
      // Fallback: treat as single LaTeX expression
      if (trimmed.length > 0) return { latex: trimmed };
    }
    return null;
  }, [section.type, section.content]);
  const isDesmos = section.type === "desmos";

  const geogebraParsed = React.useMemo(() => {
    if (section.type !== "geogebra") return null;
    const c: any = section.content;
    if (typeof c === "string") {
      const trimmed = c.trim();
      try {
        const obj = JSON.parse(trimmed);
        if (obj && typeof obj === "object") return obj;
      } catch { }
      if (trimmed.length > 0) return { materialId: trimmed };
    }
    return null;
  }, [section.type, section.content]);
  const isGeogebra = section.type === "geogebra";

  // Diagram editor dialog state now handled by DiagramEditorDialog component
  React.useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
      // place caret at end
      const len = inputRef.current.value.length;
      try {
        inputRef.current.setSelectionRange(len, len);
      } catch { }
    }
  }, [autoFocus]);
  return (
    <div
      className={
        `group flex gap-3 px-0 py-0 ` +
        ((hasMermaid || sanitizedContent) ? `items-start` : `items-center`) + ` ` +
        (glow ? `rounded-md ring-2 ring-primary ring-offset-2 ring-offset-background transition duration-300` : ``)
      }
      data-id={section.id}
    >
      {/* Hover controls - hidden in preview mode */}
      {!isPreview && (
        <div className="flex items-center gap-px opacity-0 group-hover:opacity-100 transition-opacity">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={(e) => (e.altKey ? onAddAbove(section.id) : onAddBelow(section.id))}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <div>
                <span className="font-semibold">Click</span> to add below
                <br />
                <span className="font-semibold">Option-click</span> to add above
              </div>
            </TooltipContent>
          </Tooltip>

          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 cursor-grab active:cursor-grabbing"
                    onPointerDown={(e) => onBeginDrag(section.id, e)}
                  >
                    <GripVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <div>
                  <span className="font-semibold">Drag</span> to move
                  <br />
                  <span className="font-semibold">Click</span> to open menu
                </div>
              </TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="start">
              {isExcalidraw && (
                <DropdownMenuItem className="text" onClick={() => setEditOpen(true)}>
                  Edit diagram
                </DropdownMenuItem>
              )}
              <DropdownMenuItem className="text">
                Add to chat
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive" onClick={() => onDelete(section.id)}>
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Right content area: show input OR rendered content */}
      <div className="flex-1 px-0 w-full">
        {isMermaid ? (
          <div className="w-full m-0 p-0 overflow-hidden">
            <MermaidRenderer
              definition={mermaidSource}
              className="w-full"
              style={{ margin: 0, padding: 0 }}
            />
          </div>
        ) : isExcalidraw ? (
          <div className="w-full m-0 p-0 overflow-hidden">
            <ExcalidrawRenderer
              elements={elementsToRender}
              files={filesToRender}
              viewModeEnabled
              zenModeEnabled
              className="w-full"
              style={{ margin: 0, padding: 0 }}
            />
          </div>
        ) : isDesmos ? (
          <div className="w-full m-0 p-0 overflow-hidden">
            <DesmosRenderer
              latex={(desmosParsed as any)?.latex}
              expressions={(desmosParsed as any)?.expressions}
              state={(desmosParsed as any)?.state}
              options={(desmosParsed as any)?.options}
              className="w-full"
              style={{ margin: 0, padding: 0 }}
            />
          </div>
        ) : isGeogebra ? (
          <div className="w-full m-0 p-0 overflow-hidden">
            <GeogebraRenderer
              app={(geogebraParsed as any)?.app}
              materialId={(geogebraParsed as any)?.materialId}
              params={(geogebraParsed as any)?.params}
              mode={(geogebraParsed as any)?.mode}
              commands={(geogebraParsed as any)?.commands}
              ggbBase64={(geogebraParsed as any)?.ggbBase64}
              width="100%"
              height={(geogebraParsed as any)?.height ?? 360}
              className="w-full"
              style={{ margin: 0, padding: 0 }}
            />
          </div>
        ) : sanitizedContent ? (
          <div
            ref={contentRef}
            className="prose prose-sm dark:prose-invert max-w-none outline-none no-mathjax"
            style={{ marginBottom: 12 }}
            contentEditable={!isPreview}
            suppressContentEditableWarning
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
            onPaste={(e) => {
              if (isPreview) return;
              e.preventDefault();
              const html = e.clipboardData.getData('text/html') || e.clipboardData.getData('text/plain');
              const safe = DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
              // insert sanitized HTML at caret position
              document.execCommand('insertHTML', false, safe);
            }}
            onBlur={() => {
              if (isPreview) return;
              const current = contentRef.current?.innerHTML ?? '';
              const safe = current ? DOMPurify.sanitize(current, { USE_PROFILES: { html: true } }) : '';
              onUpdateContent(section.id, safe);
            }}
          />
        ) : (
          <div className="h-8 flex items-center">
            <Input
              type="text"
              value={section.title || ""}
              onChange={(e) => !isPreview && onUpdateTitle(section.id, e.target.value)}
              placeholder={isPreview ? "" : "Press 'space' for AI, write"}
              readOnly={isPreview}
              className={
                `h-7 bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 px-0 text-sm ` +
                `${(section.title ?? '') === '' ? 'text-transparent' : 'text-foreground'} ` +
                `placeholder:text-transparent focus:placeholder:text-muted-foreground`
              }
              style={{ caretColor: 'hsl(var(--foreground))' }}
              ref={inputRef}
              onBlur={() => !isPreview && setGlow(false)}
              onKeyDown={(e) => {
                if (isPreview) return;
                const isEmpty = (section.title ?? "").trim() === "";
                if (e.key === "Backspace" && isEmpty) {
                  e.preventDefault();
                  onDelete(section.id);
                } else if (e.key === "Enter" && e.shiftKey && glow) {
                  e.preventDefault();
                  onSendAI(section.id, section.title ?? "");
                } else if (e.key === "Enter") {
                  e.preventDefault();
                  onAddBelow(section.id);
                } else if (isEmpty && (e.key === " " || e.code === "Space")) {
                  // Activate a persistent glow when pressing Space on an empty section (clears on blur)
                  e.preventDefault();
                  setGlow(true);
                }
              }}
            />
            {glow && !isPreview && (
              <Button
                variant="default"
                size="icon"
                className="h-7 w-7 ml-2"
                onClick={() => onSendAI(section.id, section.title ?? "")}
                title="Send to AI (Shift+Enter)"
              >
                <Send className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Edit Diagram Dialog (reusable component) */}
      {isExcalidraw && (
        <DiagramEditorDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          elements={elementsToRender}
          files={filesToRender}
          onSave={(els, files) => {
            onUpdateDiagram(section.id, els, files);
          }}
        />
      )}
    </div>
  );
};

export default SectionBlock;