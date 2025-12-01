import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Section, SectionBlock } from "./SectionBlock";
import { useAppMode } from "@/contexts/AppModeContext";

const LS_KEY = "canvas:sections";

export interface SectionCanvasProps {
  initialSections?: Section[];
}

export const SectionCanvas: React.FC<SectionCanvasProps> = ({ initialSections }) => {
  const { isPreview } = useAppMode();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const stackRef = useRef<HTMLDivElement | null>(null);
  const isBlank = useCallback((s: Section) => (!s.title || s.title.trim() === "") && (!s.content || s.content.trim() === ""), []);
  const ensureTrailingBlank = useCallback((list: Section[]): Section[] => {
    if (isPreview) return list;
    const copy = [...list];
    if (copy.length === 0 || !isBlank(copy[copy.length - 1])) {
      copy.push({ id: Math.random().toString(36).slice(2), title: "", content: "" });
    }
    return copy;
  }, [isBlank, isPreview]);
  const [sections, setSections] = useState<Section[]>(() => {
    // Prefer JSON-provided initial sections over localStorage to make DSL the source of truth.
    if (initialSections && initialSections.length > 0) {
      return initialSections;
    }
    // In preview mode, don't use localStorage
    if (isPreview) {
      return [{ id: Math.random().toString(36).slice(2), title: "", content: "" }];
    }
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch { }
    // Fallback: start with a single blank section instead of example content.
    return [{ id: Math.random().toString(36).slice(2), title: "", content: "" }];
  });

  useEffect(() => {
    if (initialSections && initialSections.length > 0) {
      setSections(ensureTrailingBlank(initialSections));
    }
  }, [initialSections, ensureTrailingBlank]);

  const [dragId, setDragId] = useState<string | null>(null);
  const [focusId, setFocusId] = useState<string | null>(null);

  useEffect(() => {
    // Don't save to localStorage in preview mode
    if (isPreview) return;
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(sections));
    } catch { }
  }, [sections, isPreview]);

  // Typeset MathJax whenever sections update (processes elements with 'mathjax-process')
  useEffect(() => {
    const el = stackRef.current;
    const mj = window.MathJax;
    if (!el || !mj) return;
    try {
      if (mj.typesetPromise) {
        mj.typesetPromise([el]).catch(() => { });
      } else if (mj.typeset) {
        mj.typeset([el]);
      }
    } catch { }
  }, [sections]);

  useEffect(() => {
    setSections((prev) => ensureTrailingBlank(prev));
  }, []);


  // useEffect(() => {
  //   setSections((prev) => {
  //     const hasMermaid = prev.some((s) => typeof (s as any).mermaid === "string" && ((s as any).mermaid || "").trim().length > 0);
  //     if (hasMermaid) return prev;
  //     const example: Section = {
  //       id: Math.random().toString(36).slice(2),
  //       title: "",
  //       mermaid: `graph TD\n  A[Idea] --> B[Draft]\n  B --> C{Review}\n  C -->|Approve| D[Publish]\n  C -->|Revise| B`,
  //     };
  //     const copy = [...prev];
  //     const firstNonBlankIdx = copy.findIndex((s) => !isBlank(s));
  //     const insertAt = firstNonBlankIdx !== -1 ? firstNonBlankIdx + 1 : copy.length;
  //     copy.splice(insertAt, 0, example);
  //     return ensureTrailingBlank(copy);
  //   });
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  const addAbove = useCallback((id: string) => {
    const idx = sections.findIndex((s) => s.id === id);
    if (idx === -1) return;
    const newItem: Section = { id: Math.random().toString(36).slice(2), title: "", content: "" };
    setSections((prev) => {
      const copy = [...prev];
      copy.splice(idx, 0, newItem);
      return ensureTrailingBlank(copy);
    });
    setFocusId(newItem.id);
  }, [sections, ensureTrailingBlank]);

  const addBelow = useCallback((id: string) => {
    const idx = sections.findIndex((s) => s.id === id);
    if (idx === -1) return;
    const newItem: Section = { id: Math.random().toString(36).slice(2), title: "", content: "" };
    setSections((prev) => {
      const copy = [...prev];
      copy.splice(idx + 1, 0, newItem);
      return ensureTrailingBlank(copy);
    });
    setFocusId(newItem.id);
  }, [sections, ensureTrailingBlank]);

  const duplicate = useCallback((id: string) => {
    const idx = sections.findIndex((s) => s.id === id);
    if (idx === -1) return;
    const src = sections[idx];
    const dup: Section = { id: Math.random().toString(36).slice(2), title: (src.title || "") + " copy", content: src.content };
    setSections((prev) => {
      const copy = [...prev];
      copy.splice(idx + 1, 0, dup);
      return ensureTrailingBlank(copy);
    });
  }, [sections, ensureTrailingBlank]);

  const remove = useCallback((id: string) => {
    const idx = sections.findIndex((s) => s.id === id);
    const neighborId = idx > 0 ? sections[idx - 1]?.id : sections[idx + 1]?.id;
    setSections((prev) => ensureTrailingBlank(prev.filter((s) => s.id !== id)));
    if (neighborId) setFocusId(neighborId);
  }, [sections, ensureTrailingBlank]);

  // Drag to reorder within the stack
  useEffect(() => {
    if (!dragId) return;
    const onMove = (e: PointerEvent) => {
      const stack = stackRef.current;
      if (!stack) return;
      const rect = stack.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const children = Array.from(stack.children) as HTMLElement[];
      const items = children.map((el) => ({
        id: el.dataset.id || "",
        top: el.offsetTop,
        height: el.offsetHeight,
      }));
      const dragIdx = sections.findIndex((s) => s.id === dragId);
      if (dragIdx === -1) return;
      let targetIdx = dragIdx;
      for (let i = 0; i < items.length; i++) {
        const mid = items[i].top + items[i].height / 2;
        if (y < mid) {
          targetIdx = i;
          break;
        }
        targetIdx = i;
      }
      if (targetIdx !== dragIdx) {
        setSections((prev) => {
          const copy = [...prev];
          const [moved] = copy.splice(dragIdx, 1);
          copy.splice(targetIdx, 0, moved);
          return copy;
        });
      }
    };
    const onUp = () => {
      setDragId(null);
      // Ensure the trailing blank section remains at the end
      setSections((prev) => ensureTrailingBlank(prev));
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp, { once: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [dragId, sections]);

  const beginDrag = useCallback((id: string, _e?: React.PointerEvent) => {
    // Do not prevent default/stop propagation so the button can also open the menu on click.
    setDragId(id);
  }, []);

  const updateTitle = useCallback((id: string, title: string) => {
    setSections((prev) => {
      const mapped = prev.map((s) => (s.id === id ? { ...s, title } : s));
      return ensureTrailingBlank(mapped);
    });
  }, [ensureTrailingBlank]);

  const updateContent = useCallback((id: string, content: string) => {
    setSections((prev) => {
      const mapped = prev.map((s) => (s.id === id ? { ...s, content } : s));
      return ensureTrailingBlank(mapped);
    });
  }, [ensureTrailingBlank]);

  const updateDiagram = useCallback((id: string, elements: any[], files: Record<string, any>) => {
    setSections((prev) => {
      const mapped = prev.map((s) => (s.id === id ? { ...s, elements, files } : s));
      return ensureTrailingBlank(mapped);
    });
  }, [ensureTrailingBlank]);

  const sendAI = useCallback((_id: string, _prompt: string) => {
    // intentionally empty
  }, []);

  const containerStyles = useMemo<React.CSSProperties>(() => ({
    position: "absolute",
    inset: 0,
    overflowY: "auto",
    overflowX: "hidden",
  }), []);

  return (
    <div ref={containerRef} style={containerStyles} className="pointer-events-auto">
      <div ref={stackRef} className="absolute top-0 left-0 right-0 z-30 flex flex-col gap-0 pt-8 px-8 md:px-16 lg:px-24" aria-label="Sections Stack">
        <div className="max-w-5xl mx-auto w-full">
          {sections.map((s) => (
            <div key={s.id} data-id={s.id} className="w-full">
              <SectionBlock
                section={s}
                onAddAbove={addAbove}
                onAddBelow={addBelow}
                onDelete={remove}
                onDuplicate={duplicate}
                onBeginDrag={beginDrag}
                onUpdateTitle={updateTitle}
                onUpdateContent={updateContent}
                onUpdateDiagram={updateDiagram}
                onSendAI={sendAI}
                autoFocus={focusId === s.id}
                isPreview={isPreview}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SectionCanvas;