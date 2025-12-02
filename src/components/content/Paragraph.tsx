import { useEffect, useRef, type ReactNode } from "react";
import DOMPurify from "dompurify";

export interface ParagraphProps {
    children: ReactNode;
    className?: string;
    enableMath?: boolean;
}

/**
 * Paragraph component for text content.
 * Supports inline HTML and optional MathJax rendering.
 */
export const Paragraph = ({
    children,
    className = "",
    enableMath = true
}: ParagraphProps) => {
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

    // If children is a string, sanitize it
    if (typeof children === "string") {
        const sanitized = DOMPurify.sanitize(children, { USE_PROFILES: { html: true } });
        return (
            <p
                ref={contentRef}
                className={`text-base ${enableMath ? "mathjax-process" : ""} ${className}`}
                dangerouslySetInnerHTML={{ __html: sanitized }}
            />
        );
    }

    return (
        <p
            ref={contentRef}
            className={`text-base ${enableMath ? "mathjax-process" : ""} ${className}`}
        >
            {children}
        </p>
    );
};
