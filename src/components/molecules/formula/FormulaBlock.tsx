import React, { useRef, useEffect, useMemo, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { cn } from '@/lib/utils';
import { useVariableStore, useSetVar } from '@/stores';
import { useEditing } from '@/contexts/EditingContext';
import { useAppMode } from '@/contexts/AppModeContext';
import { useBlockContext } from '@/contexts/BlockContext';
import { InlineClozeInput, InlineClozeChoice } from '@/components/atoms';

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

/**
 * Configuration for a cloze (fill-in-the-blank) input inside the formula.
 */
export interface ClozeInputConfig {
    /** The correct answer string */
    correctAnswer: string;
    /** Placeholder text shown before student types (default: "???") */
    placeholder?: string;
    /** Text/border color (default: #3B82F6 blue) */
    color?: string;
    /** Background color (default: rgba(59,130,246,0.35)) */
    bgColor?: string;
    /** Whether matching is case sensitive (default: false) */
    caseSensitive?: boolean;
}

/**
 * Configuration for a cloze choice (dropdown) inside the formula.
 */
export interface ClozeChoiceConfig {
    /** The correct answer (must be one of the options) */
    correctAnswer: string;
    /** Array of options to display in the dropdown */
    options: string[];
    /** Placeholder text before selection (default: "???") */
    placeholder?: string;
    /** Text/border color (default: #3B82F6 blue) */
    color?: string;
    /** Background color (default: rgba(59,130,246,0.35)) */
    bgColor?: string;
}

/**
 * Configuration for a linked-highlight term inside the formula.
 */
export interface LinkedHighlightConfig {
    /** The shared variable name for the highlight group */
    varName: string;
    /** Accent color (default: #3b82f6) */
    color?: string;
    /** Background color when active */
    bgColor?: string;
}

export interface FormulaBlockProps {
    /**
     * LaTeX formula string.
     *
     * Supports custom macros:
     * - `\clr{name}{content}` — colors a static term using `colorMap`
     * - `\scrub{varName}` — renders a scrubble (draggable) number bound to a global variable
     * - `\cloze{varName}` — renders a fill-in-the-blank input (configured via `clozeInputs`)
     * - `\choice{varName}` — renders a dropdown choice (configured via `clozeChoices`)
     * - `\highlight{highlightId}{content}` — renders a linked-highlight term (configured via `linkedHighlights`)
     *
     * @example
     * "\\clr{force}{F} = \\scrub{mass} \\times \\scrub{acceleration}"
     * "\\pi = \\frac{4}{1} - \\frac{4}{\\cloze{denom1}}"
     * "\\text{angle} = \\frac{\\choice{numerator}}{\\choice{denominator}}"
     * "d = \\sin(\\highlight{angle}{151°})"
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

    /**
     * Per-variable configuration for cloze inputs.
     * Keys should match varNames used in `\cloze{varName}`.
     */
    clozeInputs?: Record<string, ClozeInputConfig>;

    /**
     * Per-variable configuration for cloze choices.
     * Keys should match varNames used in `\choice{varName}`.
     */
    clozeChoices?: Record<string, ClozeChoiceConfig>;

    /**
     * Per-highlightId configuration for linked highlights.
     * Keys should match highlightIds used in `\highlight{highlightId}{content}`.
     */
    linkedHighlights?: Record<string, LinkedHighlightConfig>;

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
    clozeInputs = {},
    clozeChoices = {},
    linkedHighlights = {},
    color = '#000000',
    className,
}) => {
    const containerRef = useRef<HTMLSpanElement>(null);
    const katexRef = useRef<HTMLSpanElement>(null);

    // ── Editing support ─────────────────────────────────────────────────────
    const { isEditor } = useAppMode();
    const { isEditing, openFormulaBlockEditor, pendingEdits } = useEditing();
    const [isHovered, setIsHovered] = useState(false);
    const { id: blockIdFromContext } = useBlockContext();

    // Allow editing in editor mode OR standalone mode for testing
    const isStandalone = typeof window !== 'undefined' && window.self === window.top;
    const canEdit = isEditor || isStandalone;

    // Stable identity for matching pending edits (same pattern as InlineScrubbleNumber)
    const [editIdentity, setEditIdentity] = useState<{ blockId: string; elementPath: string } | null>(null);

    useEffect(() => {
        if (blockIdFromContext) {
            const elementPath = `formulaBlock-${blockIdFromContext}`;
            setEditIdentity({ blockId: blockIdFromContext, elementPath });
            return;
        }
        if (!containerRef.current) return;
        const block = containerRef.current.closest('[data-block-id]');
        const blockId = block?.getAttribute('data-block-id') || '';
        const elementPath = `formulaBlock-${blockId}`;
        setEditIdentity({ blockId, elementPath });
    }, [blockIdFromContext]);

    // Check for pending edits using the stored identity
    const pendingEdit = useMemo(() => {
        if (!editIdentity || (!isEditing && !canEdit)) return null;

        const { blockId, elementPath } = editIdentity;

        const edit = [...pendingEdits].reverse().find(e =>
            e.type === 'formulaBlock' &&
            (e as any).blockId === blockId &&
            (e as any).elementPath === elementPath
        );
        return edit as { newProps: { latex?: string; colorMap?: Record<string, string>; variables?: Record<string, any>; clozeInputs?: Record<string, any>; clozeChoices?: Record<string, any>; linkedHighlights?: Record<string, any>; color?: string } } | null;
    }, [isEditing, canEdit, pendingEdits, editIdentity]);

    // Use edited values if available
    const displayLatex = pendingEdit?.newProps?.latex ?? latex;
    const displayColorMap = pendingEdit?.newProps?.colorMap ?? colorMap;
    const displayVariables = pendingEdit?.newProps?.variables ?? variables;
    const displayClozeInputs: Record<string, ClozeInputConfig> = pendingEdit?.newProps?.clozeInputs ?? clozeInputs;
    const displayClozeChoices: Record<string, ClozeChoiceConfig> = pendingEdit?.newProps?.clozeChoices ?? clozeChoices;
    const displayLinkedHighlights: Record<string, LinkedHighlightConfig> = pendingEdit?.newProps?.linkedHighlights ?? linkedHighlights;

    const handleEditClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        if (!editIdentity) return;
        openFormulaBlockEditor(
            { latex: displayLatex, colorMap: displayColorMap, variables: displayVariables as any, clozeInputs: displayClozeInputs as any, clozeChoices: displayClozeChoices as any, linkedHighlights: displayLinkedHighlights as any },
            editIdentity.blockId,
            editIdentity.elementPath
        );
    }, [displayLatex, displayColorMap, displayVariables, displayClozeInputs, displayClozeChoices, displayLinkedHighlights, openFormulaBlockEditor, editIdentity]);

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

    // ── Parse \cloze{varName} markers ───────────────────────────────────────
    const clozeInputNames = useMemo(() => {
        const matches = displayLatex.matchAll(/\\cloze\{([^}]+)\}/g);
        return [...new Set([...matches].map((m) => m[1]))];
    }, [displayLatex]);

    // ── Parse \choice{varName} markers ──────────────────────────────────────
    const clozeChoiceNames = useMemo(() => {
        const matches = displayLatex.matchAll(/\\choice\{([^}]+)\}/g);
        return [...new Set([...matches].map((m) => m[1]))];
    }, [displayLatex]);

    // ── Parse \highlight{highlightId}{content} markers ──────────────────────
    const highlightIds = useMemo(() => {
        const matches = displayLatex.matchAll(/\\highlight\{([^}]+)\}\{([^}]+)\}/g);
        return [...new Set([...matches].map((m) => m[1]))];
    }, [displayLatex]);

    // ── Portal targets for cloze/choice React components ──────────────────
    const [clozePortalTargets, setClozePortalTargets] = useState<Map<string, HTMLElement>>(new Map());
    const [choicePortalTargets, setChoicePortalTargets] = useState<Map<string, HTMLElement>>(new Map());

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
                return `\\htmlClass{scrub-${varName}}{\\textcolor{${col}}{${display}}}`;
            },
        );

        // 2. Replace \cloze{varName} — portal target shell for InlineClozeInput
        result = result.replace(
            /\\cloze\{([^}]+)\}/g,
            (_, varName: string) => {
                const config = displayClozeInputs[varName];
                const placeholder = config?.placeholder || '???';
                return `\\htmlClass{cloze-portal-${varName}}{\\text{${placeholder}}}`;
            },
        );

        // 3. Replace \choice{varName} — portal target shell for InlineClozeChoice
        result = result.replace(
            /\\choice\{([^}]+)\}/g,
            (_, varName: string) => {
                const config = displayClozeChoices[varName];
                const placeholder = config?.placeholder || '???';
                return `\\htmlClass{choice-portal-${varName}}{\\text{${placeholder}}}`;
            },
        );

        // 4. Replace \highlight{highlightId}{content} with colored, class-tagged text
        result = result.replace(
            /\\highlight\{([^}]+)\}\{([^}]+)\}/g,
            (_, highlightId: string, content: string) => {
                const config = displayLinkedHighlights[highlightId];
                const col = config?.color || '#3b82f6';
                return `\\htmlClass{highlight-${highlightId}}{\\textcolor{${col}}{${content}}}`;
            },
        );

        // 5. Replace \clr{name}{content} with \textcolor{color}{content}
        result = result.replace(
            /\\clr\{([^}]+)\}\{([^}]+)\}/g,
            (_, termName: string, content: string) => {
                const c = effectiveColorMap[termName];
                return c ? `\\textcolor{${c}}{${content}}` : content;
            },
        );

        return result;
    }, [displayLatex, allVars, resolvedColors, formatValue, effectiveColorMap, displayClozeInputs, displayClozeChoices, displayLinkedHighlights]);

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

    // ── Post-render: collect portal targets for cloze/choice React components ─
    useEffect(() => {
        if (!katexRef.current) return;

        const newClozeTargets = new Map<string, HTMLElement>();
        const newChoiceTargets = new Map<string, HTMLElement>();

        for (const varName of clozeInputNames) {
            const el = katexRef.current.querySelector<HTMLElement>(`.cloze-portal-${varName}`);
            if (el) {
                el.innerHTML = '';
                el.style.display = 'inline-flex';
                el.style.alignItems = 'baseline';
                el.style.verticalAlign = 'baseline';
                newClozeTargets.set(varName, el);
            }
        }

        for (const varName of clozeChoiceNames) {
            const el = katexRef.current.querySelector<HTMLElement>(`.choice-portal-${varName}`);
            if (el) {
                el.innerHTML = '';
                el.style.display = 'inline-flex';
                el.style.alignItems = 'baseline';
                el.style.verticalAlign = 'baseline';
                newChoiceTargets.set(varName, el);
            }
        }

        setClozePortalTargets(newClozeTargets);
        setChoicePortalTargets(newChoiceTargets);
    }, [processedLatex, clozeInputNames, clozeChoiceNames]);

    // ── Post-render: style & attach linked highlight elements ───────────────
    useEffect(() => {
        if (!katexRef.current) return;
        const abortController = new AbortController();

        for (const highlightId of highlightIds) {
            const els = katexRef.current.querySelectorAll<HTMLElement>(`.highlight-${highlightId}`);

            els.forEach((el) => {
                const config = displayLinkedHighlights[highlightId];
                const groupVarName = config?.varName;
                const col = config?.color || '#3b82f6';
                const activeBg = config?.bgColor || `${col}22`;

                el.style.cursor = 'pointer';
                el.style.textDecoration = 'underline';
                el.style.textDecorationStyle = 'dotted';
                el.style.textDecorationColor = col;
                el.style.padding = '1px 4px';
                el.style.borderRadius = '4px';
                el.style.transition = 'background-color 0.2s ease, opacity 0.2s ease';

                // Check if this highlight is currently active or if any sibling is active
                if (groupVarName) {
                    const currentHighlight = allVars[groupVarName] as string;
                    const hasAnyActive = currentHighlight !== '' && currentHighlight !== undefined;
                    const isActive = currentHighlight === highlightId;

                    if (isActive) {
                        el.style.backgroundColor = activeBg;
                        el.style.opacity = '1';
                    } else if (hasAnyActive) {
                        el.style.backgroundColor = '';
                        el.style.opacity = '0.4';
                    } else {
                        el.style.backgroundColor = '';
                        el.style.opacity = '1';
                    }
                }

                el.addEventListener('mouseenter', () => {
                    el.style.backgroundColor = activeBg;
                    el.style.opacity = '1';
                    if (groupVarName) setVar(groupVarName, highlightId);
                }, { signal: abortController.signal });

                el.addEventListener('mouseleave', () => {
                    el.style.backgroundColor = '';
                    el.style.opacity = '1';
                    if (groupVarName) setVar(groupVarName, '');
                }, { signal: abortController.signal });
            });
        }

        return () => {
            abortController.abort();
        };
    }, [processedLatex, highlightIds, displayLinkedHighlights, allVars, setVar]);

    // ── Render ──────────────────────────────────────────────────────────────
    return (
        <div
            ref={containerRef}
            className={cn(
                'formula-block w-full flex justify-center items-center py-4',
                isEditor && isEditing && 'group',
                className,
            )}
            style={{ color }}
            contentEditable={false}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <span className="relative inline-block">
                <span
                    ref={katexRef}
                    className={cn(
                        'inline-block text-2xl',
                        isEditor && isEditing && 'cursor-pointer hover:outline hover:outline-2 hover:outline-dashed hover:outline-offset-2 hover:outline-[#3cc499] rounded transition-all duration-150',
                    )}
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

            {/* ── Portaled InlineClozeInput components ────────────────── */}
            {[...clozePortalTargets.entries()].map(([varName, el]) => {
                const config = displayClozeInputs[varName];
                return createPortal(
                    <InlineClozeInput
                        key={`cloze-${varName}`}
                        varName={varName}
                        correctAnswer={config?.correctAnswer || ''}
                        placeholder={config?.placeholder}
                        color={config?.color}
                        bgColor={config?.bgColor}
                        caseSensitive={config?.caseSensitive}
                        disableEditing
                    />,
                    el,
                );
            })}

            {/* ── Portaled InlineClozeChoice components ───────────────── */}
            {[...choicePortalTargets.entries()].map(([varName, el]) => {
                const config = displayClozeChoices[varName];
                return createPortal(
                    <InlineClozeChoice
                        key={`choice-${varName}`}
                        varName={varName}
                        correctAnswer={config?.correctAnswer || ''}
                        options={config?.options || []}
                        placeholder={config?.placeholder}
                        color={config?.color}
                        bgColor={config?.bgColor}
                        disableEditing
                    />,
                    el,
                );
            })}
        </div>
    );
};

export default FormulaBlock;
