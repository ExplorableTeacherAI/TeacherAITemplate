import React, { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useEditing } from '@/contexts/EditingContext';
import { useAppMode } from '@/contexts/AppModeContext';
import { useBlockContext } from '@/contexts/BlockContext';
import { useVariableStore, useVarColor } from '@/stores';

interface InlineSpotColorProps {
    /** Unique identifier for this component instance */
    id?: string;
    /**
     * Variable / term name whose color this component defines.
     * The color comes from the variable definition's `color` field.
     */
    varName: string;
    /** The hex color for this variable (from the variable definition) */
    color: string;
    /** The display text (typically the variable label, e.g. "radius") */
    children: React.ReactNode;
}

/**
 * InlineSpotColor Component
 *
 * Renders inline text with a colored background "pill" that visually
 * identifies a named variable. The color is taken from the variable
 * definition (in variables.ts / exampleVariables.ts), ensuring that
 * every usage of the same variable across the page — in prose,
 * formulas, and equations — shares a consistent color.
 *
 * **Editing support**: In editor mode, clicking the pill opens a
 * SpotColorEditorModal where the user can change the variable name,
 * display text, and color. A small edit button appears on hover.
 *
 * @example
 * ```tsx
 * <EditableParagraph id="para-intro" blockId="block-intro">
 *     The{" "}
 *     <InlineSpotColor
 *         varName="radius"
 *         {...spotColorPropsFromDefinition(getExampleVariableInfo('radius'))}
 *     >
 *         radius
 *     </InlineSpotColor>{" "}
 *     of a circle determines its size.
 * </EditableParagraph>
 * ```
 */
export const InlineSpotColor: React.FC<InlineSpotColorProps> = ({
    id,
    varName,
    color,
    children,
}) => {
    const containerRef = useRef<HTMLSpanElement>(null);
    const [isHovered, setIsHovered] = useState(false);

    // ---- Editing support ----
    const { isEditor } = useAppMode();
    const { isEditing, openSpotColorEditor, pendingEdits } = useEditing();
    const { id: blockIdFromContext } = useBlockContext();

    const isStandalone = typeof window !== 'undefined' && window.self === window.top;
    const canEdit = isEditor || isStandalone;

    // Extract text from children for identity (handles string, number, arrays)
    const childText = useMemo(() => {
        if (typeof children === 'string') return children;
        if (typeof children === 'number') return String(children);
        if (Array.isArray(children)) {
            const texts = children
                .filter(c => typeof c === 'string' || typeof c === 'number')
                .map(String);
            return texts.length > 0 ? texts.join('') : undefined;
        }
        return undefined;
    }, [children]);

    // Element identity for matching pending edits
    const [editIdentity, setEditIdentity] = useState<{ blockId: string; elementPath: string } | null>(null);

    // Build a suffix that uniquely identifies this spot color within a block.
    // varName alone is NOT enough — multiple spot colors in the same block
    // would collide, causing edits to a new spot color to affect existing ones.
    const identitySuffix = childText
        ? `${varName}-${childText}`
        : varName;

    useEffect(() => {
        if (blockIdFromContext) {
            const elementPath = `spotColor-${blockIdFromContext}-${identitySuffix}`;
            setEditIdentity({ blockId: blockIdFromContext, elementPath });
            return;
        }
        if (!containerRef.current) return;

        const block = containerRef.current.closest('[data-block-id]');
        const blockId = block?.getAttribute('data-block-id') || '';
        const elementPath = `spotColor-${blockId}-${identitySuffix}`;
        setEditIdentity({ blockId, elementPath });
    }, [blockIdFromContext, identitySuffix]);

    // Check for pending edits
    const pendingEdit = useMemo(() => {
        if (!editIdentity || (!isEditing && !canEdit)) return null;

        const { blockId, elementPath } = editIdentity;

        const edit = [...pendingEdits].reverse().find(e =>
            e.type === 'spotColor' &&
            (e as any).blockId === blockId &&
            (e as any).elementPath === elementPath
        );

        return edit as { newProps: { varName?: string; text?: string; color?: string } } | null;
    }, [isEditing, canEdit, pendingEdits, editIdentity]);

    // Use edited values if available
    const effectiveVarName = pendingEdit?.newProps.varName ?? varName;
    // Read the current color from the central store (may have been updated
    // by ScrubbleNumber, Formula, or another editor). Falls back to the prop.
    const storeColor = useVarColor(effectiveVarName, color);
    // Priority: pending edit on THIS component > store color > prop color
    const effectiveColor = pendingEdit?.newProps.color ?? storeColor;
    const effectiveText = pendingEdit?.newProps.text;

    // ---- Sync color to the central variable color store ----
    // SpotColor is the authoritative source for a variable's display color.
    // Writing here makes the color reactively available to InlineScrubbleNumber,
    // InlineFormula, Equation, etc. without them scanning pending edits.
    const setColor = useVariableStore(s => s.setColor);
    useEffect(() => {
        if (effectiveVarName) {
            setColor(effectiveVarName, effectiveColor);
        }
    }, [effectiveVarName, effectiveColor, setColor]);

    // DOM text fallback — captured after mount for when childText extraction fails
    const domTextRef = useRef<string | undefined>(undefined);
    useEffect(() => {
        if (containerRef.current) {
            const text = containerRef.current.textContent?.trim();
            if (text) domTextRef.current = text;
        }
    });

    // ---- Handle edit click ----
    const handleEditClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();

        let blockId = editIdentity?.blockId ?? blockIdFromContext ?? '';
        let elementPath = editIdentity?.elementPath ?? '';

        if (!elementPath) {
            const block = containerRef.current?.closest('[data-block-id]');
            blockId = blockId || block?.getAttribute('data-block-id') || '';
            elementPath = `spotColor-${blockId}-${identitySuffix}`;
        }

        // Use effectiveText, falling back to DOM textContent for robustness
        const text = effectiveText ?? domTextRef.current ?? containerRef.current?.textContent?.trim() ?? '';

        openSpotColorEditor(
            {
                varName: effectiveVarName,
                text,
                color: effectiveColor,
            },
            blockId,
            elementPath
        );
    }, [editIdentity, blockIdFromContext, effectiveVarName, effectiveText, effectiveColor, openSpotColorEditor, identitySuffix]);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (canEdit && isEditing) {
            handleEditClick(e);
            return;
        }
    };

    // ---- Stable ID & serialized props for round-trip extraction ----
    const inlineIdRef = useRef(
        id || `spotColor-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
    );

    const componentProps = useMemo(() => {
        // Always include text to survive round-trip extraction.
        // childText (derived from children prop) is available during render;
        // domTextRef is only set after mount, so it can't be the primary fallback.
        const textForProps = effectiveText ?? childText ?? domTextRef.current;
        const json = JSON.stringify({ varName: effectiveVarName, color: effectiveColor, ...(textForProps ? { text: textForProps } : {}) });
        try {
            return btoa(json);
        } catch {
            return '';
        }
    }, [effectiveVarName, effectiveColor, effectiveText, childText]);

    // ---- Compute contrast (light vs dark text) ----
    const textColor = useMemo(() => {
        const hex = effectiveColor.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16) / 255;
        const g = parseInt(hex.substring(2, 4), 16) / 255;
        const b = parseInt(hex.substring(4, 6), 16) / 255;
        const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        return lum > 0.45 ? '#1a1a2e' : '#ffffff';
    }, [effectiveColor]);

    // ---- Wrapper data-attributes for extraction pipeline ----
    const wrapperProps = {
        'data-inline-component': 'inlineSpotColor' as const,
        'data-component-id': inlineIdRef.current,
        'data-component-props': componentProps,
        contentEditable: false as const,
    };

    // ---- Render ----
    return (
        <span
            ref={containerRef}
            {...wrapperProps}
            className={cn(
                'inline-flex items-center relative',
                'rounded-md',
                'font-semibold',
                'transition-all duration-150',
                'leading-tight',
                canEdit && isEditing && 'group cursor-pointer',
            )}
            style={{
                backgroundColor: effectiveColor,
                color: textColor,
                padding: '1px 6px',
                fontSize: '0.92em',
                letterSpacing: '0.01em',
                boxShadow: `0 1px 3px ${effectiveColor}44`,
            }}
            onMouseDown={handleMouseDown}
            onClick={canEdit && isEditing ? (e) => { e.stopPropagation(); e.preventDefault(); } : undefined}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {effectiveText || children}

            {/* Edit button - appears on hover in edit mode */}
            {canEdit && isEditing && isHovered && (
                <button
                    onClick={handleEditClick}
                    className="absolute -top-2 -right-4 w-5 h-5 rounded-full shadow-lg flex items-center justify-center text-xs hover:opacity-90 transition-all duration-150 z-10"
                    style={{
                        backgroundColor: effectiveColor,
                        color: textColor,
                    }}
                    title="Edit spot color"
                >
                    <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                </button>
            )}
        </span>
    );
};

export default InlineSpotColor;
