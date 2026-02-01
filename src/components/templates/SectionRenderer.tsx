import { useEffect, useMemo, useRef, cloneElement, isValidElement, Children, Fragment, type CSSProperties, type ReactElement, type ReactNode } from "react";

export interface SectionRendererProps {
  initialSections?: ReactElement[];
  isPreview?: boolean;
  onEditSection?: (instruction: string) => void;
  onAddSection?: (sectionId: string) => void;
}

/**
 * Recursively clone React elements and inject props into all children.
 * This ensures layout components and nested sections all receive isPreview and onEditSection.
 * 
 * MODIFIED: Only inject props into custom components, not host components (DOM elements) or Fragments,
 * to avoid "React does not recognize the prop..." warnings.
 */
import { Reorder, useDragControls } from "framer-motion";
import { SectionContext } from "@/contexts/SectionContext";

export interface SectionRendererProps {
  initialSections?: ReactElement[];
  isPreview?: boolean;
  onEditSection?: (instruction: string) => void;
  onAddSection?: (sectionId: string) => void;
  onReorder?: (newSections: ReactElement[]) => void;
  onDeleteSection?: (sectionId: string) => void;
}

/**
 * Recursively clone React elements and inject props into all children.
 */
const deepCloneWithProps = (element: ReactNode, props: { isPreview?: boolean; onEditSection?: (instruction: string) => void; onAddSection?: (sectionId: string) => void }): ReactNode => {
  if (!isValidElement(element)) {
    return element;
  }

  // Determine if we should pass props to this element
  const isHostComponent = typeof element.type === 'string';
  const isFragment = element.type === Fragment;
  const shouldInjectProps = !isHostComponent && !isFragment;

  // Clone the current element, possibly with injected props
  const clonedElement = cloneElement(
    element as ReactElement,
    shouldInjectProps ? { ...props } : {},
    // Recursively process children
    element.props.children
      ? Children.map(element.props.children, (child) => deepCloneWithProps(child, props))
      : undefined
  );

  return clonedElement;
};

// Wrapper for individual draggable sections to isolate hooks
const DraggableSection = ({
  section,
  isPreview,
  onEditSection,
  onAddSection,
  onDeleteSection
}: {
  section: ReactElement;
  isPreview?: boolean;
  onEditSection?: (instruction: string) => void;
  onAddSection?: (sectionId: string) => void;
  onDeleteSection?: (sectionId: string) => void;
}) => {
  const dragControls = useDragControls();
  // Extract ID safely from props or child props if wrapped
  const sectionId = section.props.id ||
    (section.props.children && isValidElement(section.props.children) ? section.props.children.props.id : undefined);

  const handleDelete = () => {
    if (sectionId && onDeleteSection) {
      onDeleteSection(sectionId);
    }
  };

  return (
    <Reorder.Item
      value={section}
      dragListener={false}
      dragControls={dragControls}
      className="w-full relative"
      style={{ position: "relative" }}
    >
      <SectionContext.Provider value={{ dragControls, onDelete: handleDelete, id: sectionId }}>
        {deepCloneWithProps(section, { isPreview, onEditSection, onAddSection })}
      </SectionContext.Provider>
    </Reorder.Item>
  );
};

export const SectionRenderer = ({
  initialSections = [],
  isPreview = false,
  onEditSection,
  onAddSection,
  onReorder,
  onDeleteSection
}: SectionRendererProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const stackRef = useRef<HTMLDivElement | null>(null);

  // Typeset MathJax
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

  // Handle reorder from framer motion
  const handleReorder = (newOrder: ReactElement[]) => {
    if (onReorder) {
      onReorder(newOrder);
    }
  };

  return (
    <div ref={containerRef} style={containerStyles} className="pointer-events-auto">
      <div
        ref={stackRef}
        className="min-h-full z-30 flex flex-col gap-6 pt-8 pb-16 px-8 md:px-16 lg:px-24"
        aria-label="Sections Stack"
      >
        <div className="max-w-5xl mx-auto w-full">
          {onReorder ? (
            <Reorder.Group
              axis="y"
              values={initialSections}
              onReorder={handleReorder}
              className="space-y-8"
            >
              {initialSections.map((section, index) => (
                <DraggableSection
                  key={section.key || section.props.id || `section-${index}`}
                  section={section}
                  isPreview={isPreview}
                  onEditSection={onEditSection}
                  onAddSection={onAddSection}
                  onDeleteSection={onDeleteSection}
                />
              ))}
            </Reorder.Group>
          ) : (
            <div className="space-y-8">
              {initialSections.map((section, index) => (
                <div key={section.key || `section-${index}`} className="w-full">
                  {deepCloneWithProps(section, { isPreview, onEditSection, onAddSection })}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SectionRenderer;