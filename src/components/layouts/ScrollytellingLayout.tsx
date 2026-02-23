import { type ReactNode, useEffect, useRef, useCallback, Children, isValidElement } from "react";
import { useSetVar } from "@/stores";

// ─── Sub-components ───────────────────────────────────────────────────────────

export interface ScrollStepProps {
    children: ReactNode;
    className?: string;
}

/**
 * ScrollStep - A single text step in a scrollytelling layout.
 * Each step occupies ~60vh so it scrolls through the viewport naturally.
 * Wrap one Block (or several blocks in a div) per step.
 */
export const ScrollStep = ({ children, className = "" }: ScrollStepProps) => {
    return (
        <div className={`scroll-step flex items-center min-h-[60vh] py-12 ${className}`}>
            <div className="w-full">{children}</div>
        </div>
    );
};

export interface ScrollVisualProps {
    children: ReactNode;
    className?: string;
}

/**
 * ScrollVisual - The sticky visualization panel in a scrollytelling layout.
 * Place exactly one ScrollVisual inside ScrollytellingLayout.
 * Read the active step with: const step = useVar('yourVarName', 0) as number;
 */
export const ScrollVisual = ({ children, className = "" }: ScrollVisualProps) => {
    return <div className={className}>{children}</div>;
};

// ─── Main Layout ──────────────────────────────────────────────────────────────

export interface ScrollytellingLayoutProps {
    /**
     * Children — mix of <ScrollStep> and <ScrollVisual> elements.
     * Order in JSX does not matter; layout is controlled by visualPosition.
     */
    children: ReactNode;
    /** Optional className for the outer container */
    className?: string;
    /**
     * Name of the global variable (defined in variables.ts) that will receive
     * the 0-based index of the currently active scroll step.
     * Read it in your visual component with useVar(varName, 0).
     */
    varName?: string;
    /** Which side the sticky visual panel appears on */
    visualPosition?: "left" | "right";
    /** Width of the sticky visual panel */
    visualWidth?: "narrow" | "medium" | "wide";
    /** Gap between the text column and visual column */
    gap?: "none" | "sm" | "md" | "lg" | "xl";
    /**
     * IntersectionObserver threshold — fraction of a step that must be
     * visible before it is considered "active". Default 0.5.
     */
    threshold?: number;
    /** Optional callback fired whenever the active step changes */
    onStepChange?: (stepIndex: number) => void;
}

/**
 * ScrollytellingLayout
 *
 * A layout where prose steps scroll on one side while a visualization
 * stays sticky on the other side and reacts to each step.
 *
 * Usage:
 * ```tsx
 * // 1. Define a variable in variables.ts:
 * //    scrollStep: { defaultValue: 0, type: 'number', min: 0, max: 4, step: 1 }
 *
 * // 2. Build a reactive visual that reads the variable:
 * function ReactiveViz() {
 *   const step = useVar('scrollStep', 0) as number;
 *   return <MyVisualization step={step} />;
 * }
 *
 * // 3. Assemble the layout:
 * <ScrollytellingLayout varName="scrollStep" visualPosition="right">
 *   <ScrollStep>
 *     <Block id="block-step-0" padding="sm">
 *       <EditableParagraph id="para-step-0" blockId="block-step-0">
 *         Step 0 — introduce the concept.
 *       </EditableParagraph>
 *     </Block>
 *   </ScrollStep>
 *
 *   <ScrollStep>
 *     <Block id="block-step-1" padding="sm">
 *       <EditableParagraph id="para-step-1" blockId="block-step-1">
 *         Step 1 — deepen understanding.
 *       </EditableParagraph>
 *     </Block>
 *   </ScrollStep>
 *
 *   <ScrollVisual>
 *     <Block id="block-viz" padding="sm">
 *       <ReactiveViz />
 *     </Block>
 *   </ScrollVisual>
 * </ScrollytellingLayout>
 * ```
 */
export const ScrollytellingLayout = ({
    children,
    className = "",
    varName,
    visualPosition = "right",
    visualWidth = "medium",
    gap = "lg",
    threshold = 0.5,
    onStepChange,
}: ScrollytellingLayoutProps) => {
    const setVar = useSetVar();
    const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
    const activeStepRef = useRef<number>(-1);

    // ── Separate ScrollStep children from ScrollVisual children ────────────
    const stepChildren: ReactNode[] = [];
    const visualChildren: ReactNode[] = [];

    Children.forEach(children, (child) => {
        if (isValidElement(child)) {
            if (child.type === ScrollStep) stepChildren.push(child);
            else if (child.type === ScrollVisual) visualChildren.push(child);
        }
    });

    // ── Step change handler ────────────────────────────────────────────────
    const handleStepChange = useCallback(
        (stepIndex: number) => {
            if (stepIndex !== activeStepRef.current) {
                activeStepRef.current = stepIndex;
                if (varName) setVar(varName, stepIndex);
                onStepChange?.(stepIndex);
            }
        },
        [varName, setVar, onStepChange]
    );

    // ── IntersectionObserver for each step ────────────────────────────────
    useEffect(() => {
        const observers: IntersectionObserver[] = [];

        stepRefs.current.forEach((el, index) => {
            if (!el) return;
            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) handleStepChange(index);
                    });
                },
                {
                    threshold,
                    // Trigger when a step occupies the middle 40% of the viewport
                    rootMargin: "-30% 0px -30% 0px",
                }
            );
            observer.observe(el);
            observers.push(observer);
        });

        return () => observers.forEach((o) => o.disconnect());
    }, [stepChildren.length, threshold, handleStepChange]);

    // ── Width classes ──────────────────────────────────────────────────────
    const visualWidthClasses = {
        narrow: "md:w-5/12",
        medium: "md:w-1/2",
        wide: "md:w-7/12",
    };

    const gapClasses = {
        none: "gap-0",
        sm: "gap-3",
        md: "gap-6",
        lg: "gap-8",
        xl: "gap-12",
    };

    // ── Panels ─────────────────────────────────────────────────────────────
    const textPanel = (
        <div className="flex-1 min-w-0">
            {stepChildren.map((child, index) => (
                <div
                    key={index}
                    ref={(el) => {
                        stepRefs.current[index] = el;
                    }}
                >
                    {child}
                </div>
            ))}
            {/* Bottom spacer so the last step can scroll to the viewport centre */}
            <div className="h-[40vh]" aria-hidden="true" />
        </div>
    );

    const visualPanel = (
        <div
            className={`w-full ${visualWidthClasses[visualWidth]} flex-shrink-0 md:sticky md:top-8 md:self-start md:max-h-[calc(100vh-4rem)] md:overflow-hidden`}
        >
            {visualChildren}
        </div>
    );

    return (
        <div
            className={`flex flex-col md:flex-row ${gapClasses[gap]} ${className}`}
            data-layout-type="scrollytelling"
            data-visual-position={visualPosition}
        >
            {visualPosition === "right" ? (
                <>
                    {textPanel}
                    {visualPanel}
                </>
            ) : (
                <>
                    {visualPanel}
                    {textPanel}
                </>
            )}
        </div>
    );
};
