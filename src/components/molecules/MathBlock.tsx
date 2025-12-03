import { useEffect, useRef } from "react";

export interface MathBlockProps {
    /** LaTeX equation string */
    equation: string;
    /** Optional equation number to display on the right */
    numbered?: string | number;
    /** Display mode: 'block' (centered) or 'inline' */
    mode?: "block" | "inline";
    className?: string;
}

/**
 * MathBlock component for rendering mathematical equations.
 * Uses MathJax for rendering LaTeX.
 */
export const MathBlock = ({
    equation,
    numbered,
    mode = "block",
    className = ""
}: MathBlockProps) => {
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
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
    }, [equation]);

    const formattedEquation = equation.startsWith("$$") || equation.startsWith("\\[")
        ? equation
        : `$$${equation}$$`;

    if (mode === "inline") {
        return (
            <span
                ref={contentRef}
                className={`mathjax-process ${className}`}
                dangerouslySetInnerHTML={{ __html: `$${equation}$` }}
            />
        );
    }

    return (
        <div className={`relative my-2 ${className}`}>
            <div
                ref={contentRef}
                className="text-center text-lg mathjax-process"
                dangerouslySetInnerHTML={{ __html: formattedEquation }}
            />
            {numbered && (
                <span className="absolute right-0 top-1/2 -translate-y-1/2">
                    ({numbered})
                </span>
            )}
        </div>
    );
};
