import React, { useRef, useEffect, useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { cn } from '@/lib/utils';

export interface FormulaBlockProps {
    /**
     * LaTeX formula string. ASCII LaTeX commands only, single backslash
     * (`\frac`, `\times`, `\pi`).
     *
     * @example
     * "F = m \\times a"
     */
    latex: string;

    /** Optional className on the outer wrapper */
    className?: string;
}

/**
 * FormulaBlock Component
 *
 * Renders a static, centred, display-size KaTeX formula.
 *
 * @example
 * ```tsx
 * <FormulaBlock latex="A = \pi r^2" />
 * ```
 */
export const FormulaBlock: React.FC<FormulaBlockProps> = ({ latex, className }) => {
    const katexRef = useRef<HTMLSpanElement>(null);

    const processedLatex = useMemo(
        // Repair doubled backslashes before command names (`\\frac` → `\frac`).
        // A `\\` before a letter is never a legitimate row break, so this is safe.
        () => latex.replace(/\\\\(?=[A-Za-z])/g, '\\'),
        [latex],
    );

    useEffect(() => {
        if (!katexRef.current) return;
        try {
            katex.render(processedLatex, katexRef.current, {
                throwOnError: false,
                trust: true,
                output: 'html',
            });
        } catch {
            if (katexRef.current) {
                katexRef.current.textContent = latex;
            }
        }
    }, [processedLatex, latex]);

    return (
        <div
            className={cn('formula-block w-full flex justify-center items-center py-4', className)}
            contentEditable={false}
        >
            <span ref={katexRef} className="inline-block text-2xl" />
        </div>
    );
};

export default FormulaBlock;
