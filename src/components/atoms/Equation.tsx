import React, { useEffect, useRef, useMemo, useCallback, useState } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { cn } from '@/lib/utils';
import { useEditing } from '@/contexts/EditingContext';
import { useAppMode } from '@/contexts/AppModeContext';

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

    // Editing support
    const { isEditor } = useAppMode();
    const { isEditing, openEquationEditor, pendingEdits } = useEditing();
    const [isHovered, setIsHovered] = useState(false);

    // Generate element path for identifying this equation
    const getElementPath = useCallback(() => {
        if (!containerRef.current) return '';
        const section = containerRef.current.closest('[data-section-id]');
        const sectionId = section?.getAttribute('data-section-id') || 'unknown';
        // Use a more stable ID if possible, otherwise rely on content
        return `equation-${sectionId}-${latex.substring(0, 20)}`;
    }, [latex]);

    // Check for pending edits
    const pendingEdit = useMemo(() => {
        if (!isEditing || !isEditor || !containerRef.current) return null;

        const path = getElementPath();
        const section = containerRef.current.closest('[data-section-id]');
        const sectionId = section?.getAttribute('data-section-id') || '';

        // Find the most recent edit for this equation
        const edit = [...pendingEdits].reverse().find(e =>
            e.type === 'equation' &&
            e.sectionId === sectionId &&
            (e as any).originalLatex === latex // Simple matching for now
            // Ideally we'd match by elementPath if we generated it consistently upstream
        );

        return edit as { newLatex: string, colorMap?: Record<string, string> } | null;
    }, [isEditing, isEditor, pendingEdits, latex, getElementPath]);

    // Use edited values if available
    const displayLatex = pendingEdit ? pendingEdit.newLatex : latex;
    const displayColorMap = pendingEdit && pendingEdit.colorMap ? pendingEdit.colorMap : colorMap;

    // Pre-process the latex to replace \clr{term}{content} with colored spans
    const processedLatex = useMemo(() => {
        let result = displayLatex;

        // Replace \clr{termName}{content} with \htmlClass{term-termName}{\textcolor{color}{content}}
        const clrPattern = /\\clr\{([^}]+)\}\{([^}]+)\}/g;

        result = result.replace(clrPattern, (_, termName, content) => {
            const color = displayColorMap[termName];
            if (color) {
                return `\\htmlClass{term-${termName}}{\\textcolor{${color}}{${content}}}`;
            }
            return content;
        });

        return result;
    }, [displayLatex, displayColorMap]);

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
            containerRef.current.textContent = displayLatex;
        }
    }, [processedLatex, displayLatex]);

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

    // Handle edit button click
    const handleEditClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        const section = containerRef.current?.closest('[data-section-id]');
        const sectionId = section?.getAttribute('data-section-id') || '';
        openEquationEditor(displayLatex, displayColorMap, sectionId, getElementPath());
    }, [displayLatex, displayColorMap, openEquationEditor, getElementPath]);

    return (
        <span
            className={cn(
                "relative inline-block",
                isEditor && isEditing && "group"
            )}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <span
                ref={containerRef}
                className={cn(
                    "equation-display inline-block",
                    className,
                    isEditor && isEditing && "cursor-pointer hover:outline hover:outline-2 hover:outline-dashed hover:outline-offset-2 hover:outline-[#3cc499] rounded transition-all duration-150"
                )}
                onMouseOver={handleMouseOver}
                onMouseOut={handleMouseOut}
                onClick={isEditor && isEditing ? handleEditClick : handleClick}
            />
            {/* Edit button - appears on hover in edit mode */}
            {isEditor && isEditing && isHovered && (
                <button
                    onClick={handleEditClick}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-[#3cc499] text-white rounded-full shadow-lg flex items-center justify-center text-xs hover:bg-[#3cc499]/90 transition-all duration-150 z-10"
                    title="Edit equation"
                >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                </button>
            )}
        </span>
    );
};
