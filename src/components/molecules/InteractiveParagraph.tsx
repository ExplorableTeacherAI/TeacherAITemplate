import { useEffect, useRef, type ReactNode } from "react";

export interface InteractiveParagraphProps {
    /** The text content with optional interactive elements as children */
    children: ReactNode;
    /** Custom CSS class */
    className?: string;
    /** Enable MathJax processing for the entire paragraph */
    enableMath?: boolean;
}

/**
 * InteractiveParagraph - A paragraph component that can contain interactive terms and equations.
 * Automatically handles MathJax rendering for the entire paragraph.
 * 
 * @example
 * ```tsx
 * <InteractiveParagraph>
 *   You can{' '}
 *   <InteractiveTerm onClick={() => updateGraph('dropX')}>
 *     click here to see that dropping the X axis
 *   </InteractiveTerm>
 *   {' '}isn't much better, but these aren't the only two choices.
 * </InteractiveParagraph>
 * ```
 */
export const InteractiveParagraph = ({
    children,
    className = "",
    enableMath = true
}: InteractiveParagraphProps) => {
    const contentRef = useRef<HTMLParagraphElement>(null);

    // Typeset MathJax if enabled
    useEffect(() => {
        if (!enableMath) return;
        const el = contentRef.current;
        const mj = window.MathJax;
        if (!el || !mj) return;

        try {
            if (mj.typesetPromise) {
                mj.typesetPromise([el]).catch(() => { });
            } else if (mj.typeset) {
                mj.typeset([el]);
            }
        } catch { }
    }, [children, enableMath]);

    return (
        <p
            ref={contentRef}
            className={`text-base leading-relaxed ${enableMath ? "mathjax-process" : ""} ${className}`}
        >
            {children}
        </p>
    );
};
