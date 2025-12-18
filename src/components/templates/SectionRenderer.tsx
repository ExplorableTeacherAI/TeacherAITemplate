import { useEffect, useMemo, useRef, cloneElement, isValidElement, Children, Fragment, type CSSProperties, type ReactElement, type ReactNode } from "react";

export interface SectionRendererProps {
  initialSections?: ReactElement[];
  isPreview?: boolean;
  onEditSection?: (instruction: string) => void;
}

/**
 * Recursively clone React elements and inject props into all children.
 * This ensures layout components and nested sections all receive isPreview and onEditSection.
 * 
 * MODIFIED: Only inject props into custom components, not host components (DOM elements) or Fragments,
 * to avoid "React does not recognize the prop..." warnings.
 */
const deepCloneWithProps = (element: ReactNode, props: { isPreview?: boolean; onEditSection?: (instruction: string) => void }): ReactNode => {
  if (!isValidElement(element)) {
    return element;
  }

  // Determine if we should pass props to this element
  // Only pass to custom components (functions/objects), not strings (DOM elements) or Fragments
  const isHostComponent = typeof element.type === 'string';
  const isFragment = element.type === Fragment;
  const shouldInjectProps = !isHostComponent && !isFragment;

  // Clone the current element, possibly with injected props
  const clonedElement = cloneElement(
    element as ReactElement,
    shouldInjectProps ? { ...props } : {},
    // Recursively process children ensuring we go deep into the tree
    element.props.children
      ? Children.map(element.props.children, (child) => deepCloneWithProps(child, props))
      : undefined
  );

  return clonedElement;
};

/**
 * SectionRenderer component renders an array of React elements as sections.
 * This is the new component-based architecture that renders React components
 * instead of parsing JSON section definitions.
 * 
 * Now supports layout components that wrap sections, recursively passing
 * isPreview and onEditSection props to all nested components.
 */
export const SectionRenderer = ({ initialSections = [], isPreview = false, onEditSection }: SectionRendererProps) => {
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
        className="min-h-full z-30 flex flex-col gap-6 pt-8 pb-16 px-8 md:px-16 lg:px-24"
        aria-label="Sections Stack"
      >
        <div className="max-w-5xl mx-auto w-full space-y-8">
          {initialSections.map((section, index) => (
            <div key={section.key || `section-${index}`} className="w-full">
              {deepCloneWithProps(section, { isPreview, onEditSection })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SectionRenderer;