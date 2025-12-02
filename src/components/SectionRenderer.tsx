import { useEffect, useMemo, useRef, type CSSProperties, type ReactElement } from "react";

export interface SectionRendererProps {
  initialSections?: ReactElement[];
}

/**
 * SectionRenderer component renders an array of React elements as sections.
 * This is the new component-based architecture that renders React components
 * instead of parsing JSON section definitions.
 */
export const SectionRenderer = ({ initialSections = [] }: SectionRendererProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const stackRef = useRef<HTMLDivElement | null>(null);

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
  }, [initialSections]);

  const containerStyles = useMemo<CSSProperties>(() => ({
    position: "absolute",
    inset: 0,
    overflowY: "auto",
    overflowX: "hidden",
  }), []);

  return (
    <div ref={containerRef} style={containerStyles} className="pointer-events-auto">
      <div
        ref={stackRef}
        className="absolute top-0 left-0 right-0 z-30 flex flex-col gap-0 pt-8 px-8 md:px-16 lg:px-24"
        aria-label="Sections Stack"
      >
        <div className="max-w-5xl mx-auto w-full">
          {initialSections.map((section, index) => (
            <div key={section.key || `section-${index}`} className="w-full">
              {section}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SectionRenderer;