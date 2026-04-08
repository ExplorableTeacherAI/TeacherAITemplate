import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { cn } from '@/lib/utils';
import { useEditing } from '@/contexts/EditingContext';
import { useAppMode } from '@/contexts/AppModeContext';
import { useBlockContext } from '@/contexts/BlockContext';
import { useEditableTextContext } from '../text/EditableText';
import { useVariableStore } from '@/stores';

interface InlineFormulaProps {
    /** Unique identifier for this formula instance */
    id?: string;
    /** LaTeX formula string (required) */
    latex: string;
    /** Term name -> hex color mapping for \clr{}{} syntax */
    colorMap?: Record<string, string>;
    /** Wrapper accent color (default: #000000 black) */
    color?: string;
    /** Fallback display text (used in editor placeholder) */
    children?: React.ReactNode;
}

/**
 * InlineFormula Component
 *
 * Renders a KaTeX math formula inline within paragraph text,
 * with optional colored variables using `\clr{name}{content}` syntax.
 * It does NOT use the variable store — purely display, like InlineTooltip.
 *
 * @example
 * ```tsx
 * <EditableParagraph id="para-example" blockId="block-example">
 *     The area of a circle is{" "}
 *     <InlineFormula
 *         latex="\clr{area}{A} = \clr{pi}{\pi} \clr{radius}{r}^2"
 *         colorMap={{ area: '#ef4444', pi: '#3b82f6', radius: '#3cc499' }}
 *     />{" "}
 *     where r is the radius.
 * </EditableParagraph>
 * ```
 */
export const InlineFormula: React.FC<InlineFormulaProps> = ({
    id,
    latex,
    colorMap = {},
    color = '#000000',
    children,
}) => {
    const katexRef = useRef<HTMLSpanElement>(null);
    const containerRef = useRef<HTMLSpanElement>(null);

    // Editing support
    const { isEditor } = useAppMode();
    const { isEditing, openInlineFormulaEditor, pendingEdits } = useEditing();
    const { id: blockIdFromContext } = useBlockContext();

    const isStandalone = typeof window !== 'undefined' && window.self === window.top;
    const canEdit = isEditor || isStandalone;

    // Get parent EditableText context (to suppress blur when opening editor)
    const editableTextCtx = useEditableTextContext();

    // Hover state for edit button
    const [isHovered, setIsHovered] = useState(false);

    // Element identity for matching pending edits
    const [editIdentity, setEditIdentity] = useState<{ blockId: string; elementPath: string } | null>(null);

    useEffect(() => {
        if (blockIdFromContext) {
            const elementPath = `inlineFormula-${blockIdFromContext}-${latex?.substring(0, 30)}`;
            setEditIdentity({ blockId: blockIdFromContext, elementPath });
            return;
        }
        if (!containerRef.current) return;

        const block = containerRef.current.closest('[data-block-id]');
        const blockId = block?.getAttribute('data-block-id') || '';
        const elementPath = `inlineFormula-${blockId}-${latex?.substring(0, 30)}`;
        setEditIdentity({ blockId, elementPath });
    }, [blockIdFromContext, latex]);

    // Check for pending edits
    const pendingEdit = useMemo(() => {
        if (!editIdentity || (!isEditing && !canEdit)) return null;

        const { blockId, elementPath } = editIdentity;

        const edit = [...pendingEdits].reverse().find(e =>
            e.type === 'inlineFormula' &&
            (e as any).blockId === blockId &&
            (e as any).elementPath === elementPath
        );

        return edit as { newProps: { latex?: string; colorMap?: Record<string, string>; color?: string } } | null;
    }, [isEditing, canEdit, pendingEdits, editIdentity]);

    // Read the central variable color store to override colorMap entries.
    // When a SpotColor changes a variable's color, formulas using that variable update reactively.
    const allVarColors = useVariableStore(s => s.colors);

    // Effective prop values (pending edits override)
    const effectiveLatex = pendingEdit?.newProps.latex ?? latex;
    const baseColorMap = pendingEdit?.newProps.colorMap ?? colorMap;
    const effectiveColorMap = useMemo(() => {
        const keys = Object.keys(baseColorMap);
        if (keys.length === 0) return baseColorMap;
        const merged = { ...baseColorMap };
        let changed = false;
        for (const key of keys) {
            const storeColor = allVarColors[key];
            if (storeColor && storeColor !== merged[key]) {
                merged[key] = storeColor;
                changed = true;
            }
        }
        return changed ? merged : baseColorMap;
    }, [baseColorMap, allVarColors]);
    const effectiveColor = pendingEdit?.newProps.color ?? color;

    // Stable ID and serialized props for round-trip extraction (base64 for HTML attribute safety)
    const inlineIdRef = useRef(id || `inlineFormula-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`);
    const componentProps = useMemo(() => {
        const json = JSON.stringify({
            latex: effectiveLatex,
            colorMap: effectiveColorMap,
            color: effectiveColor,
        });
        try { return btoa(json); } catch { return ''; }
    }, [effectiveLatex, effectiveColorMap, effectiveColor]);

    // Process \clr{name}{content} -> \textcolor{color}{content}
    const processedLatex = useMemo(() => {
        let result = effectiveLatex;
        const clrPattern = /\\clr\{([^}]+)\}\{([^}]+)\}/g;
        result = result.replace(clrPattern, (_, termName, content) => {
            const c = effectiveColorMap[termName];
            return c ? `\\textcolor{${c}}{${content}}` : content;
        });
        return result;
    }, [effectiveLatex, effectiveColorMap]);

    // Render KaTeX
    useEffect(() => {
        if (!katexRef.current) return;
        try {
            katex.render(processedLatex, katexRef.current, {
                throwOnError: false,
                trust: true,
                output: 'html',
            });
        } catch {
            // Fallback: show raw LaTeX text
            if (katexRef.current) {
                katexRef.current.textContent = effectiveLatex;
            }
        }

        // Clean up stale KaTeX content that may have been orphaned by the browser's
        // contentEditable serialization.  When the parent EditableText toggles
        // contentEditable off, the browser can strip the katexRef wrapper span and
        // leave the old KaTeX output as direct children of the InlineFormula container.
        // React then creates a new katexRef span alongside the stale content, causing
        // both old and new formulas to appear.  Remove any .katex elements that aren't
        // descendants of our katexRef.
        if (containerRef.current && katexRef.current) {
            const allKatex = containerRef.current.querySelectorAll('.katex');
            allKatex.forEach(el => {
                if (!katexRef.current!.contains(el)) {
                    // This is an orphaned KaTeX node — remove its closest container
                    // (which is typically the browser-corrupted cursor-pointer span or
                    // a stale display:inline span).
                    el.remove();
                }
            });
        }
    }, [processedLatex, effectiveLatex]);

    const handleEditClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();

        // Tell the parent EditableText to skip its handleBlur processing.
        // The formula editor has its own edit pipeline — we don't want a spurious
        // text edit to be created when the EditableText loses focus to the modal.
        editableTextCtx.skipBlurRef.current = true;

        let blockId = editIdentity?.blockId ?? blockIdFromContext ?? '';
        let elementPath = editIdentity?.elementPath ?? '';

        if (!elementPath) {
            const block = containerRef.current?.closest('[data-block-id]');
            blockId = blockId || block?.getAttribute('data-block-id') || '';
            elementPath = `inlineFormula-${blockId}-${latex?.substring(0, 30)}`;
        }

        openInlineFormulaEditor(
            {
                latex: effectiveLatex,
                colorMap: effectiveColorMap,
                color: effectiveColor,
            },
            blockId,
            elementPath
        );
    }, [editIdentity, blockIdFromContext, effectiveLatex, effectiveColorMap, effectiveColor, openInlineFormulaEditor, latex, editableTextCtx]);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (canEdit && isEditing) {
            handleEditClick(e);
            return;
        }
    };

    // Wrapper props for round-trip extraction
    const wrapperProps = {
        'data-inline-component': 'inlineFormula' as const,
        'data-component-id': inlineIdRef.current,
        'data-component-props': componentProps,
        contentEditable: false as const,
    };

    // Editor mode rendering
    if (canEdit && isEditing) {
        return (
            <span
                ref={containerRef}
                {...wrapperProps}
                className={cn("inline-flex items-center relative group")}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <span
                    onMouseDown={handleMouseDown}
                    onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}
                    className="cursor-pointer"
                    style={{
                        color: effectiveColor,
                        borderBottom: `2px dotted ${effectiveColor}`,
                        paddingBottom: '2px',
                    }}
                >
                    <span ref={katexRef} style={{ display: 'inline' }} />
                </span>

                {/* Edit button on hover */}
                {isHovered && (
                    <button
                        onMouseDown={handleEditClick}
                        className="absolute -top-2 -right-4 w-5 h-5 rounded-full shadow-lg flex items-center justify-center text-xs hover:opacity-90 transition-all duration-150 z-10"
                        style={{
                            backgroundColor: effectiveColor,
                            color: 'white',
                        }}
                        title="Edit formula"
                    >
                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                    </button>
                )}
            </span>
        );
    }

    // Preview mode: inline KaTeX render
    return (
        <span
            ref={containerRef}
            {...wrapperProps}
            style={{
                display: 'inline',
                color: effectiveColor,
            }}
        >
            <span ref={katexRef} style={{ display: 'inline' }} />
        </span>
    );
};

export default InlineFormula;
