import React, { useEffect, useRef, useMemo, useCallback } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { cn } from '@/lib/utils';

interface EquationProps {
    latex: string;
    colorMap?: Record<string, string>; // term -> color hex
    activeTerm?: string | null;
    onTermHover?: (term: string | null) => void;
    onTermClick?: (term: string) => void;
    className?: string;
}

/**
 * Equation component that supports colored terms with bidirectional hover.
 * 
 * Use the syntax: \clr{termName}{content} where termName matches a key in colorMap.
 * 
 * Features:
 * - No layout shifts: uses only opacity changes
 * - Bidirectional hover: controlled via activeTerm prop
 * - Smooth transitions
 * 
 * Example usage:
 * <Equation 
 *   latex="\clr{force}{F} = \clr{mass}{m} \clr{accel}{a}"
 *   colorMap={{ force: '#ff0000', mass: '#0000ff', accel: '#00ff00' }}
 *   activeTerm={hoveredTerm}
 *   onTermHover={setHoveredTerm}
 * />
 */
export const Equation: React.FC<EquationProps> = ({
    latex,
    colorMap = {},
    activeTerm,
    onTermHover,
    onTermClick,
    className = '',
}) => {
    const containerRef = useRef<HTMLSpanElement>(null);

    // Pre-process the latex to replace \clr{term}{content} with colored spans
    const processedLatex = useMemo(() => {
        let result = latex;

        // Replace \clr{termName}{content} with \htmlClass{term-termName}{\textcolor{color}{content}}
        const clrPattern = /\\clr\{([^}]+)\}\{([^}]+)\}/g;

        result = result.replace(clrPattern, (_, termName, content) => {
            const color = colorMap[termName];
            if (color) {
                return `\\htmlClass{term-${termName}}{\\textcolor{${color}}{${content}}}`;
            }
            return content;
        });

        return result;
    }, [latex, colorMap]);

    // Helper to get term from element
    const getTermFromElement = useCallback((el: Element | null): string | null => {
        if (!el) return null;
        const classes = Array.from(el.classList);
        const termClass = classes.find(c => c.startsWith('term-'));
        return termClass ? termClass.replace('term-', '') : null;
    }, []);

    // Find closest term element from event target
    const findTermElement = useCallback((target: EventTarget | null): HTMLElement | null => {
        if (!target || !(target instanceof Element)) return null;

        // Check if target itself is a term element
        if (target.className && target.className.includes && target.className.includes('term-')) {
            return target as HTMLElement;
        }

        // Check ancestors
        const termEl = target.closest('[class*="term-"]');
        return termEl as HTMLElement | null;
    }, []);

    // Render the equation using KaTeX
    useEffect(() => {
        if (!containerRef.current) return;

        try {
            katex.render(processedLatex, containerRef.current, {
                throwOnError: false,
                trust: true,
                output: 'html',
            });
        } catch (error) {
            console.error("KaTeX rendering error:", error);
            containerRef.current.textContent = latex;
        }
    }, [processedLatex, latex]);

    // Apply styles based on activeTerm (no DOM manipulation)
    useEffect(() => {
        if (!containerRef.current) return;
        const container = containerRef.current;

        const termElements = container.querySelectorAll('[class*="term-"]');

        termElements.forEach((node) => {
            const el = node as HTMLElement;
            const term = getTermFromElement(el);

            if (!term) return;

            const isActive = activeTerm === term;
            const hasActiveTerm = activeTerm !== null && activeTerm !== undefined;

            // NO LAYOUT SHIFTS: Only use opacity, no transforms or size changes
            el.style.transition = 'opacity 0.15s ease';
            el.style.cursor = (onTermHover || onTermClick) ? 'pointer' : 'default';

            // When a term is active, dim others but don't change sizes
            if (hasActiveTerm) {
                el.style.opacity = isActive ? '1' : '0.35';
            } else {
                el.style.opacity = '1';
            }
        });

    }, [processedLatex, activeTerm, onTermHover, onTermClick, getTermFromElement]);

    // Event delegation for mouse events - no DOM cloning needed
    const handleMouseOver = useCallback((e: React.MouseEvent) => {
        if (!onTermHover) return;
        const termEl = findTermElement(e.target);
        if (termEl) {
            const term = getTermFromElement(termEl);
            if (term) onTermHover(term);
        }
    }, [onTermHover, findTermElement, getTermFromElement]);

    const handleMouseOut = useCallback((e: React.MouseEvent) => {
        if (!onTermHover) return;
        const termEl = findTermElement(e.target);
        const relatedTermEl = findTermElement(e.relatedTarget as Element);

        // Only trigger leave if we're actually leaving a term element
        // and not entering another one
        if (termEl && !relatedTermEl) {
            onTermHover(null);
        }
    }, [onTermHover, findTermElement]);

    const handleClick = useCallback((e: React.MouseEvent) => {
        if (!onTermClick) return;
        const termEl = findTermElement(e.target);
        if (termEl) {
            const term = getTermFromElement(termEl);
            if (term) {
                e.stopPropagation();
                onTermClick(term);
            }
        }
    }, [onTermClick, findTermElement, getTermFromElement]);

    return (
        <span
            ref={containerRef}
            className={cn("equation-display inline-block", className)}
            onMouseOver={handleMouseOver}
            onMouseOut={handleMouseOut}
            onClick={handleClick}
        />
    );
};
