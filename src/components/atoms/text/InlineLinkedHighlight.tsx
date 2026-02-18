import React, { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useEditing } from '@/contexts/EditingContext';
import { useAppMode } from '@/contexts/AppModeContext';
import { useBlockContext } from '@/contexts/BlockContext';
import { useVar, useSetVar, useVarColor, useVariableStore } from '@/stores';

interface InlineLinkedHighlightProps {
    /** Unique identifier for this component instance */
    id?: string;
    /**
     * Variable name in the global store that holds the currently active highlight ID.
     * Multiple InlineLinkedHighlight components sharing the same varName form a group.
     */
    varName: string;
    /**
     * The specific ID this instance writes to the store on hover.
     * When hovered, `varName` is set to this value; when unhovered, cleared to ''.
     */
    highlightId: string;
    /** Accent color for the underline and highlight (default: #3b82f6 blue) */
    color?: string;
    /** Background color when this instance is the active highlight */
    bgColor?: string;
    /** The display text */
    children: React.ReactNode;
}

/**
 * InlineLinkedHighlight Component
 *
 * Renders inline text with a colored underline. On hover, it writes a
 * `highlightId` into a global variable (`varName`), enabling any other
 * component on the page to react — e.g. highlighting a part of a diagram,
 * an equation term, or another text passage.
 *
 * Multiple instances sharing the same `varName` form a coordination group:
 * hovering one dims the others and activates the hovered term.
 *
 * Uses the global variable store (Zustand) so visual components can read
 * the active highlight with `useVar(varName, '')` and respond accordingly.
 *
 * Supports editing mode: click to open editor modal, slash-command insertion.
 */
export const InlineLinkedHighlight: React.FC<InlineLinkedHighlightProps> = ({
    id,
    varName,
    highlightId,
    color = '#3b82f6',
    bgColor,
    children,
}) => {
    const containerRef = useRef<HTMLSpanElement>(null);
    const [isHovered, setIsHovered] = useState(false);

    const { isEditor } = useAppMode();
    const { isEditing, openLinkedHighlightEditor, pendingEdits } = useEditing();
    const { id: blockIdFromContext } = useBlockContext();

    const isStandalone = typeof window !== 'undefined' && window.self === window.top;
    const canEdit = isEditor || isStandalone;

    // Variable store: read the current active highlight ID for this group
    const activeHighlightId = useVar(varName || '', '') as string;
    const setVar = useSetVar();

    // Color from store keyed by highlightId (per-instance, not per-group).
    // Seeded from the JSX prop on mount so it survives pending-edit round-trips.
    const storeColor = useVarColor(highlightId, color);
    const setStoreColor = useVariableStore(s => s.setColor);
    useEffect(() => {
        if (highlightId) {
            setStoreColor(highlightId, color);
        }
    }, [highlightId, color, setStoreColor]);

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

    const identitySuffix = childText
        ? `${varName}-${highlightId}-${childText}`
        : `${varName}-${highlightId}`;

    useEffect(() => {
        if (blockIdFromContext) {
            const elementPath = `linkedHighlight-${blockIdFromContext}-${identitySuffix}`;
            setEditIdentity({ blockId: blockIdFromContext, elementPath });
            return;
        }
        if (!containerRef.current) return;

        const block = containerRef.current.closest('[data-block-id]');
        const blockId = block?.getAttribute('data-block-id') || '';
        const elementPath = `linkedHighlight-${blockId}-${identitySuffix}`;
        setEditIdentity({ blockId, elementPath });
    }, [blockIdFromContext, identitySuffix]);

    // Check for pending edits
    const pendingEdit = useMemo(() => {
        if (!editIdentity || (!isEditing && !canEdit)) return null;

        const { blockId, elementPath } = editIdentity;

        const edit = [...pendingEdits].reverse().find(e =>
            e.type === 'linkedHighlight' &&
            (e as any).blockId === blockId &&
            (e as any).elementPath === elementPath
        );

        return edit as { newProps: { varName?: string; highlightId?: string; text?: string; color?: string; bgColor?: string } } | null;
    }, [isEditing, canEdit, pendingEdits, editIdentity]);

    // Effective values from pending edits
    const effectiveVarName = pendingEdit?.newProps.varName ?? varName;
    const effectiveHighlightId = pendingEdit?.newProps.highlightId ?? highlightId;
    const effectiveColor = pendingEdit?.newProps.color ?? storeColor;
    const effectiveBgColor = pendingEdit?.newProps.bgColor ?? bgColor;
    const effectiveText = pendingEdit?.newProps.text;

    // Whether THIS instance is the active one in the group
    const isActive = activeHighlightId === effectiveHighlightId && activeHighlightId !== '';
    // Whether ANY highlight in the group is active
    const hasAnyActive = activeHighlightId !== '';

    // DOM text fallback
    const domTextRef = useRef<string | undefined>(undefined);
    useEffect(() => {
        if (containerRef.current) {
            const text = containerRef.current.textContent?.trim();
            if (text) domTextRef.current = text;
        }
    });

    // Hover handlers: set/clear the store variable
    const handleMouseEnter = useCallback(() => {
        setIsHovered(true);
        if (!(canEdit && isEditing) && effectiveVarName && effectiveHighlightId) {
            setVar(effectiveVarName, effectiveHighlightId);
        }
    }, [canEdit, isEditing, effectiveVarName, effectiveHighlightId, setVar]);

    const handleMouseLeave = useCallback(() => {
        setIsHovered(false);
        if (!(canEdit && isEditing) && effectiveVarName) {
            setVar(effectiveVarName, '');
        }
    }, [canEdit, isEditing, effectiveVarName, setVar]);

    // Edit click handler
    const handleEditClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();

        let blockId = editIdentity?.blockId ?? blockIdFromContext ?? '';
        let elementPath = editIdentity?.elementPath ?? '';

        if (!elementPath) {
            const block = containerRef.current?.closest('[data-block-id]');
            blockId = blockId || block?.getAttribute('data-block-id') || '';
            elementPath = `linkedHighlight-${blockId}-${identitySuffix}`;
        }

        const text = effectiveText ?? domTextRef.current ?? containerRef.current?.textContent?.trim() ?? '';

        openLinkedHighlightEditor(
            {
                varName: effectiveVarName,
                highlightId: effectiveHighlightId,
                text,
                color: effectiveColor,
                bgColor: effectiveBgColor,
            },
            blockId,
            elementPath
        );
    }, [editIdentity, blockIdFromContext, effectiveVarName, effectiveHighlightId, effectiveText, effectiveColor, effectiveBgColor, openLinkedHighlightEditor, identitySuffix]);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (canEdit && isEditing) {
            handleEditClick(e);
            return;
        }
    };

    // Stable ID & serialized props for round-trip extraction
    const inlineIdRef = useRef(
        id || `linkedHighlight-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
    );

    const componentProps = useMemo(() => {
        const textForProps = effectiveText ?? childText ?? domTextRef.current;
        const json = JSON.stringify({
            varName: effectiveVarName,
            highlightId: effectiveHighlightId,
            color: effectiveColor,
            ...(effectiveBgColor ? { bgColor: effectiveBgColor } : {}),
            ...(textForProps ? { text: textForProps } : {}),
        });
        try {
            return btoa(json);
        } catch {
            return '';
        }
    }, [effectiveVarName, effectiveHighlightId, effectiveColor, effectiveBgColor, effectiveText, childText]);

    const wrapperProps = {
        'data-inline-component': 'inlineLinkedHighlight' as const,
        'data-component-id': inlineIdRef.current,
        'data-component-props': componentProps,
        contentEditable: false as const,
    };

    // Compute highlight background (active state)
    const activeBg = effectiveBgColor || `${effectiveColor}22`;
    // Dim non-active siblings when another in the group is hovered
    const opacity = hasAnyActive ? (isActive ? 1 : 0.4) : 1;

    return (
        <span
            ref={containerRef}
            {...wrapperProps}
            className={cn(
                'inline-flex items-center relative',
                'font-medium',
                'transition-all duration-200',
                'leading-tight',
                canEdit && isEditing && 'group cursor-pointer',
                !(canEdit && isEditing) && 'cursor-default',
            )}
            style={{
                color: effectiveColor,
                opacity,
                textDecoration: 'underline',
                textDecorationStyle: 'dotted',
                textDecorationColor: effectiveColor,
                backgroundColor: isActive ? activeBg : 'transparent',
                padding: '1px 4px',
                borderRadius: 4,
                transition: 'all 0.2s ease',
            }}
            onMouseDown={handleMouseDown}
            onClick={canEdit && isEditing ? (e) => { e.stopPropagation(); e.preventDefault(); } : undefined}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {effectiveText || children}

            {/* Edit button - appears on hover in edit mode */}
            {canEdit && isEditing && isHovered && (
                <button
                    onClick={handleEditClick}
                    className="absolute -top-2 -right-4 w-5 h-5 rounded-full shadow-lg flex items-center justify-center text-xs hover:opacity-90 transition-all duration-150 z-10"
                    style={{
                        backgroundColor: effectiveColor,
                        color: 'white',
                    }}
                    title="Edit linked highlight"
                >
                    <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                </button>
            )}
        </span>
    );
};

export default InlineLinkedHighlight;
