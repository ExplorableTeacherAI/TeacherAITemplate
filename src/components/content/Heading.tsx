import { useEffect, useRef, type ReactNode } from "react";
import DOMPurify from "dompurify";

export interface HeadingProps {
    children: ReactNode;
    level?: 1 | 2 | 3 | 4 | 5 | 6;
    className?: string;
    enableMath?: boolean;
}

/**
 * Heading component for section titles.
 * Supports h1-h6 with optional MathJax rendering.
 */
export const Heading = ({
    children,
    level = 1,
    className = "",
    enableMath = true
}: HeadingProps) => {
    const contentRef = useRef<HTMLElement>(null);

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

    // Default heading styles based on level
    const levelStyles = {
        1: "text-4xl font-bold mb-4",
        2: "text-3xl font-bold mb-3",
        3: "text-2xl font-semibold mb-3",
        4: "text-xl font-semibold mb-2",
        5: "text-lg font-semibold mb-2",
        6: "text-base font-semibold mb-2"
    };

    const classes = `${levelStyles[level]} ${enableMath ? "mathjax-process" : ""} ${className}`.trim();

    // If children is a string, sanitize it
    if (typeof children === "string") {
        const sanitized = DOMPurify.sanitize(children, { USE_PROFILES: { html: true } });

        switch (level) {
            case 1:
                return <h1 ref={contentRef as any} className={classes} dangerouslySetInnerHTML={{ __html: sanitized }} />;
            case 2:
                return <h2 ref={contentRef as any} className={classes} dangerouslySetInnerHTML={{ __html: sanitized }} />;
            case 3:
                return <h3 ref={contentRef as any} className={classes} dangerouslySetInnerHTML={{ __html: sanitized }} />;
            case 4:
                return <h4 ref={contentRef as any} className={classes} dangerouslySetInnerHTML={{ __html: sanitized }} />;
            case 5:
                return <h5 ref={contentRef as any} className={classes} dangerouslySetInnerHTML={{ __html: sanitized }} />;
            case 6:
                return <h6 ref={contentRef as any} className={classes} dangerouslySetInnerHTML={{ __html: sanitized }} />;
            default:
                return <h1 ref={contentRef as any} className={classes} dangerouslySetInnerHTML={{ __html: sanitized }} />;
        }
    }

    // For React nodes
    switch (level) {
        case 1:
            return <h1 ref={contentRef as any} className={classes}>{children}</h1>;
        case 2:
            return <h2 ref={contentRef as any} className={classes}>{children}</h2>;
        case 3:
            return <h3 ref={contentRef as any} className={classes}>{children}</h3>;
        case 4:
            return <h4 ref={contentRef as any} className={classes}>{children}</h4>;
        case 5:
            return <h5 ref={contentRef as any} className={classes}>{children}</h5>;
        case 6:
            return <h6 ref={contentRef as any} className={classes}>{children}</h6>;
        default:
            return <h1 ref={contentRef as any} className={classes}>{children}</h1>;
    }
};
