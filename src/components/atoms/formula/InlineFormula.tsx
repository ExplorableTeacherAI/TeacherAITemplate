import React, { useRef, useEffect, useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { encodeMarkerJson } from '@/lib/inlineMarkers';

interface InlineFormulaProps {
    /** Unique identifier for this formula instance */
    id?: string;
    /** LaTeX formula string (required). ASCII LaTeX commands only — use a single backslash (`\frac`, `\pi`). */
    latex: string;
    /** Fallback display text */
    children?: React.ReactNode;
}

/**
 * InlineFormula Component
 *
 * Renders a static KaTeX math formula inline within paragraph text.
 *
 * @example
 * ```tsx
 * <EditableParagraph id="para-example" blockId="block-example">
 *     The area of a circle is{" "}
 *     <InlineFormula latex="A = \pi r^2" />{" "}
 *     where r is the radius.
 * </EditableParagraph>
 * ```
 */
export const InlineFormula: React.FC<InlineFormulaProps> = ({ id, latex }) => {
    const katexRef = useRef<HTMLSpanElement>(null);
    const containerRef = useRef<HTMLSpanElement>(null);
    const inlineIdRef = useRef(id || `inlineFormula-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`);

    // Serialized props so a paragraph text edit round-trips the formula unchanged.
    const componentProps = useMemo(() => {
        try { return encodeMarkerJson(JSON.stringify({ latex })); } catch { return ''; }
    }, [latex]);

    const processedLatex = useMemo(
        // Repair doubled backslashes before command names (`\\frac` → `\frac`) —
        // JSX attributes pass `\\` through literally and generated formulas
        // sometimes double-escape, which KaTeX renders as raw red source text.
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

        // Remove KaTeX output orphaned by the browser's contentEditable
        // serialization of the parent paragraph (it can strip the katexRef
        // wrapper and leave stale output beside the fresh render).
        if (containerRef.current && katexRef.current) {
            containerRef.current.querySelectorAll('.katex').forEach(el => {
                if (!katexRef.current!.contains(el)) el.remove();
            });
        }
    }, [processedLatex, latex]);

    return (
        <span
            ref={containerRef}
            data-inline-component="inlineFormula"
            data-component-id={inlineIdRef.current}
            data-component-props={componentProps}
            contentEditable={false}
            style={{ display: 'inline' }}
        >
            <span ref={katexRef} style={{ display: 'inline' }} />
        </span>
    );
};

export default InlineFormula;
