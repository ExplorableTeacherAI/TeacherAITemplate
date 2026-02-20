import React, { useRef, useEffect, useMemo, useCallback, useState } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { cn } from '@/lib/utils';
import { useVariableStore, useSetVar } from '@/stores';
import { useEditing } from '@/contexts/EditingContext';
import { useAppMode } from '@/contexts/AppModeContext';

/**
 * Per-variable configuration for scrubble numbers inside the formula.
 */
interface ScrubVariableConfig {
    /** Minimum value (default: 0) */
    min?: number;
    /** Maximum value (default: 100) */
    max?: number;
    /** Step increment (default: 1) */
    step?: number;
    /** Color for this variable's number (overrides colorMap entry) */
    color?: string;
    /** Format the displayed value */
    formatValue?: (v: number) => string;
}

export interface FormulaBlockProps {
    /**
     * LaTeX formula string.
     *
     * Supports two custom macros:
     * - `\clr{name}{content}` — colors a static term using `colorMap`
     * - `\scrub{varName}` — renders a scrubble (draggable) number bound to a global variable
     *
     * @example
     * "\\clr{force}{F} = \\scrub{mass} \\times \\scrub{acceleration}"
     */
    latex: string;

    /**
     * Term name → hex color mapping for `\clr{name}{content}` syntax.
     * Also used as default color for `\scrub{varName}` if no explicit color is given.
     */
    colorMap?: Record<string, string>;

    /**
     * Per-variable configuration (min, max, step, color, formatValue).
     * Keys should match varNames used in `\scrub{varName}`.
     */
    variables?: Record<string, ScrubVariableConfig>;

    /** Default accent color for the formula wrapper (default: #000000) */
    color?: string;

    /** Optional className on the outer wrapper */
    className?: string;
}

// ─── Defaults ──────────────────────────────────────────────────────────────────
const DEFAULT_MIN = 0;
const DEFAULT_MAX = 100;
const DEFAULT_STEP = 1;
const DEFAULT_SCRUB_COLOR = '#D81B60';
const DRAG_SENSITIVITY = 2; // pixels per step

/**
 * FormulaBlock Component
 *
 * Renders a KaTeX math formula with **draggable scrubble numbers** embedded
 * inside it.  Works like `InlineFormula` for static colored terms (`\clr{}{}`)
 * and adds `\scrub{varName}` syntax to place interactive numbers that read from
 * and write to the global variable store.
 *
 * @example
 * ```tsx
 * <FormulaBlock
 *   latex="\clr{force}{F} = \scrub{mass} \times \scrub{acceleration}"
 *   colorMap={{ force: '#ef4444' }}
 *   variables={{
 *     mass: { min: 0.1, max: 50, step: 0.1, color: '#3b82f6' },
 *     acceleration: { min: 0, max: 20, step: 0.5, color: '#10b981' },
 *   }}
 * />
 * ```
 */
export const FormulaBlock: React.FC<FormulaBlockProps> = ({
    latex,
    colorMap = {},
    variables = {},
    color = '#000000',
    className,
}) => {
    const containerRef = useRef<HTMLSpanElement>(null);
    const katexRef = useRef<HTMLSpanElement>(null);

    // ── Editing support ─────────────────────────────────────────────────────
    const { isEditor } = useAppMode();
    const { isEditing, openFormulaBlockEditor, pendingEdits } = useEditing();
    const [isHovered, setIsHovered] = useState(false);

    const getElementPath = useCallback(() => {
        if (!containerRef.current) return '';
        const block = containerRef.current.closest('[data-block-id]');
        const blockId = block?.getAttribute('data-block-id') || 'unknown';
        return `formulaBlock-${blockId}-${latex.substring(0, 20)}`;
    }, [latex]);

    // Check for pending edits
    const pendingEdit = useMemo(() => {
        if (!isEditing || !isEditor || !containerRef.current) return null;
        const block = containerRef.current.closest('[data-block-id]');
        const blockId = block?.getAttribute('data-block-id') || '';
        const edit = [...pendingEdits].reverse().find(e =>
            e.type === 'formulaBlock' &&
            (e as any).blockId === blockId &&
            (e as any).originalProps?.latex === latex
        );
        return edit as { newProps: { latex?: string; colorMap?: Record<string, string>; variables?: Record<string, any>; color?: string } } | null;
    }, [isEditing, isEditor, pendingEdits, latex]);

    // Use edited values if available
    const displayLatex = pendingEdit?.newProps?.latex ?? latex;
    const displayColorMap = pendingEdit?.newProps?.colorMap ?? colorMap;
    const displayVariables = pendingEdit?.newProps?.variables ?? variables;

    const handleEditClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        const block = containerRef.current?.closest('[data-block-id]');
        const blockId = block?.getAttribute('data-block-id') || '';
        openFormulaBlockEditor(
            { latex: displayLatex, colorMap: displayColorMap, variables: displayVariables as any },
            blockId,
            getElementPath()
        );
    }, [displayLatex, displayColorMap, displayVariables, openFormulaBlockEditor, getElementPath]);

    // ── Variable store ──────────────────────────────────────────────────────
    const allVars = useVariableStore((s) => s.variables);
    const allVarColors = useVariableStore((s) => s.colors);
    const setVar = useSetVar();

    // ── Drag state (refs to avoid re-renders during drag) ───────────────────
    const isDragging = useRef(false);
    const dragVarName = useRef<string | null>(null);
    const dragStartX = useRef(0);
    const dragStartValue = useRef(0);
    const dragConfig = useRef<ScrubVariableConfig>({});
    const [, forceUpdate] = useState(0); // used to re-render after drag ends

    // ── Parse \scrub{varName} markers ───────────────────────────────────────
    const scrubVarNames = useMemo(() => {
        const matches = displayLatex.matchAll(/\\scrub\{([^}]+)\}/g);
        return [...new Set([...matches].map((m) => m[1]))];
    }, [displayLatex]);

    // ── Resolve effective color for each scrub variable ─────────────────────
    const resolvedColors = useMemo(() => {
        const map: Record<string, string> = {};
        for (const name of scrubVarNames) {
            map[name] =
                displayVariables[name]?.color ??
                allVarColors[name] ??
                displayColorMap[name] ??
                DEFAULT_SCRUB_COLOR;
        }
        return map;
    }, [scrubVarNames, displayVariables, allVarColors, displayColorMap]);

    // ── Merge store colors into colorMap for \clr{} terms ───────────────────
    const effectiveColorMap = useMemo(() => {
        const merged = { ...displayColorMap };
        for (const key of Object.keys(merged)) {
            const storeColor = allVarColors[key];
            if (storeColor) merged[key] = storeColor;
        }
        return merged;
    }, [displayColorMap, allVarColors]);

    // ── Format a variable's value for display ───────────────────────────────
    const formatValue = useCallback(
        (varName: string, value: number): string => {
            const fmt = displayVariables[varName]?.formatValue;
            if (fmt) return fmt(value);
            // Auto-format based on step
            const step = displayVariables[varName]?.step ?? DEFAULT_STEP;
            if (step < 1) {
                const decimals = Math.max(
                    0,
                    -Math.floor(Math.log10(step)),
                );
                return value.toFixed(decimals);
            }
            return String(value);
        },
        [displayVariables],
    );

    // ── Build processed LaTeX string ────────────────────────────────────────
    const processedLatex = useMemo(() => {
        let result = displayLatex;

        // 1. Replace \scrub{varName} with a colored, class-tagged placeholder
        result = result.replace(
            /\\scrub\{([^}]+)\}/g,
            (_, varName: string) => {
                const val = (allVars[varName] as number) ?? 0;
                const col = resolvedColors[varName] ?? DEFAULT_SCRUB_COLOR;
                const display = formatValue(varName, val);
                // \htmlClass lets KaTeX add a CSS class we can query after render
                return `\\htmlClass{scrub-${varName}}{\\textcolor{${col}}{${display}}}`;
            },
        );

        // 2. Replace \clr{name}{content} with \textcolor{color}{content}
        result = result.replace(
            /\\clr\{([^}]+)\}\{([^}]+)\}/g,
            (_, termName: string, content: string) => {
                const c = effectiveColorMap[termName];
                return c ? `\\textcolor{${c}}{${content}}` : content;
            },
        );

        return result;
    }, [displayLatex, allVars, resolvedColors, formatValue, effectiveColorMap]);

    // ── Render KaTeX ────────────────────────────────────────────────────────
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
                katexRef.current.textContent = displayLatex;
            }
        }
    }, [processedLatex, displayLatex]);

    // ── Attach interactive behaviour to scrub elements ──────────────────────
    useEffect(() => {
        if (!katexRef.current) return;

        const elements: { el: HTMLElement; varName: string }[] = [];

        for (const varName of scrubVarNames) {
            const els = katexRef.current.querySelectorAll<HTMLElement>(
                `.scrub-${varName}`,
            );
            els.forEach((el) => elements.push({ el, varName }));
        }

        // Style & attach mousedown handlers
        const abortController = new AbortController();

        for (const { el, varName } of elements) {
            const col = resolvedColors[varName] ?? DEFAULT_SCRUB_COLOR;

            // Visual cue: underline + pointer
            el.style.cursor = 'ew-resize';
            el.style.borderBottom = `2px solid ${col}`;
            el.style.paddingBottom = '1px';
            el.style.userSelect = 'none';
            el.style.transition = 'opacity 0.15s ease';

            // Hover feedback
            el.addEventListener(
                'mouseenter',
                () => {
                    el.style.opacity = '0.8';
                },
                { signal: abortController.signal },
            );
            el.addEventListener(
                'mouseleave',
                () => {
                    el.style.opacity = '1';
                },
                { signal: abortController.signal },
            );

            // Mousedown → start drag
            el.addEventListener(
                'mousedown',
                (e: MouseEvent) => {
                    e.preventDefault();
                    e.stopPropagation();

                    isDragging.current = true;
                    dragVarName.current = varName;
                    dragStartX.current = e.clientX;
                    dragStartValue.current =
                        (allVars[varName] as number) ?? 0;
                    dragConfig.current = displayVariables[varName] ?? {};

                    // Add dragging class to body for global cursor
                    document.body.style.cursor = 'ew-resize';
                },
                { signal: abortController.signal },
            );
        }

        return () => {
            abortController.abort();
            // Reset element styles that we may have set
            for (const { el } of elements) {
                el.style.cursor = '';
                el.style.borderBottom = '';
                el.style.paddingBottom = '';
                el.style.userSelect = '';
            }
        };
        // Re-attach when scrub vars, colors, or allVars change (KaTeX re-renders)
    }, [processedLatex, scrubVarNames, resolvedColors, displayVariables, allVars]);

    // ── Global mousemove / mouseup for dragging ─────────────────────────────
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging.current || !dragVarName.current) return;

            const cfg = dragConfig.current;
            const step = cfg.step ?? DEFAULT_STEP;
            const min = cfg.min ?? DEFAULT_MIN;
            const max = cfg.max ?? DEFAULT_MAX;

            const deltaX = e.clientX - dragStartX.current;
            const deltaSteps = Math.round(deltaX / DRAG_SENSITIVITY);
            const rawValue = dragStartValue.current + deltaSteps * step;
            const clamped = Math.max(min, Math.min(max, rawValue));

            // Round to avoid floating-point drift
            const decimals = step < 1 ? Math.max(0, -Math.floor(Math.log10(step))) : 0;
            const rounded = Number(clamped.toFixed(decimals));

            setVar(dragVarName.current, rounded);
        };

        const handleMouseUp = () => {
            if (!isDragging.current) return;
            isDragging.current = false;
            dragVarName.current = null;
            document.body.style.cursor = '';
            forceUpdate((n) => n + 1);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [setVar]);

    // ── Touch support ───────────────────────────────────────────────────────
    useEffect(() => {
        if (!katexRef.current) return;

        const abortController = new AbortController();

        for (const varName of scrubVarNames) {
            const els = katexRef.current.querySelectorAll<HTMLElement>(
                `.scrub-${varName}`,
            );
            els.forEach((el) => {
                el.addEventListener(
                    'touchstart',
                    (e: TouchEvent) => {
                        e.preventDefault();
                        const touch = e.touches[0];

                        isDragging.current = true;
                        dragVarName.current = varName;
                        dragStartX.current = touch.clientX;
                        dragStartValue.current =
                            (allVars[varName] as number) ?? 0;
                        dragConfig.current = displayVariables[varName] ?? {};
                    },
                    { signal: abortController.signal, passive: false },
                );
            });
        }

        const handleTouchMove = (e: TouchEvent) => {
            if (!isDragging.current || !dragVarName.current) return;
            const touch = e.touches[0];
            const cfg = dragConfig.current;
            const step = cfg.step ?? DEFAULT_STEP;
            const min = cfg.min ?? DEFAULT_MIN;
            const max = cfg.max ?? DEFAULT_MAX;

            const deltaX = touch.clientX - dragStartX.current;
            const deltaSteps = Math.round(deltaX / DRAG_SENSITIVITY);
            const rawValue = dragStartValue.current + deltaSteps * step;
            const clamped = Math.max(min, Math.min(max, rawValue));
            const decimals = step < 1 ? Math.max(0, -Math.floor(Math.log10(step))) : 0;
            const rounded = Number(clamped.toFixed(decimals));

            setVar(dragVarName.current, rounded);
        };

        const handleTouchEnd = () => {
            if (!isDragging.current) return;
            isDragging.current = false;
            dragVarName.current = null;
            forceUpdate((n) => n + 1);
        };

        window.addEventListener('touchmove', handleTouchMove, { passive: false });
        window.addEventListener('touchend', handleTouchEnd);

        return () => {
            abortController.abort();
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
        };
    }, [processedLatex, scrubVarNames, allVars, displayVariables, setVar]);

    // ── Render ──────────────────────────────────────────────────────────────
    return (
        <span
            ref={containerRef}
            className={cn(
                'inline formula-block relative',
                isEditor && isEditing && 'group',
                className,
            )}
            style={{ color }}
            contentEditable={false}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <span
                ref={katexRef}
                className={cn(
                    'inline-block',
                    isEditor && isEditing && 'cursor-pointer hover:outline hover:outline-2 hover:outline-dashed hover:outline-offset-2 hover:outline-[#3cc499] rounded transition-all duration-150',
                )}
                style={{ display: 'inline' }}
                onClick={isEditor && isEditing ? handleEditClick : undefined}
            />
            {/* Edit button — appears on hover in edit mode */}
            {isEditor && isEditing && isHovered && (
                <button
                    onClick={handleEditClick}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-[#3cc499] text-white rounded-full shadow-lg flex items-center justify-center text-xs hover:bg-[#3cc499]/90 transition-all duration-150 z-10"
                    title="Edit formula block"
                >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                </button>
            )}
        </span>
    );
};

export default FormulaBlock;
