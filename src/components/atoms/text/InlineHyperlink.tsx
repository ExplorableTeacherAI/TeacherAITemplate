import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useEditing } from '@/contexts/EditingContext';
import { useAppMode } from '@/contexts/AppModeContext';
import { useBlockContext } from '@/contexts/BlockContext';

interface InlineHyperlinkProps {
    /** Unique identifier for this component instance */
    id?: string;
    /** Link text content */
    children: React.ReactNode;
    /** External URL (opens new tab) */
    href?: string;
    /** Block ID to scroll to on page */
    targetBlockId?: string;
    /** Optional color for the text (default: emerald #10B981) */
    color?: string;
    /** Optional background color on hover */
    bgColor?: string;
}

/**
 * InlineHyperlink Component
 *
 * Clickable inline text that navigates to an external URL or scrolls to a block on page.
 * Belongs to the connective category (emerald #10B981).
 *
 * @example
 * ```tsx
 * <p>
 *   Read the{" "}
 *   <InlineHyperlink href="https://en.wikipedia.org/wiki/Circle">
 *     Wikipedia article on circles
 *   </InlineHyperlink>{" "}
 *   or{" "}
 *   <InlineHyperlink targetBlockId="block-intro">
 *     jump to the intro
 *   </InlineHyperlink>.
 * </p>
 * ```
 */
export const InlineHyperlink: React.FC<InlineHyperlinkProps> = ({
    id,
    children,
    href,
    targetBlockId,
    color = '#10B981',
    bgColor = 'rgba(16, 185, 129, 0.15)',
}) => {
    const containerRef = useRef<HTMLSpanElement>(null);

    // Editing support
    const { isEditor } = useAppMode();
    const { isEditing, openHyperlinkEditor, pendingEdits } = useEditing();
    const { id: blockIdFromContext } = useBlockContext();

    const isStandalone = typeof window !== 'undefined' && window.self === window.top;
    const canEdit = isEditor || isStandalone;

    // Hover state
    const [isHovered, setIsHovered] = useState(false);

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

    const identitySuffix = childText ?? href ?? targetBlockId ?? 'link';

    useEffect(() => {
        if (blockIdFromContext) {
            const elementPath = `hyperlink-${blockIdFromContext}-${identitySuffix}`;
            setEditIdentity({ blockId: blockIdFromContext, elementPath });
            return;
        }
        if (!containerRef.current) return;

        const block = containerRef.current.closest('[data-block-id]');
        const blockId = block?.getAttribute('data-block-id') || '';
        const elementPath = `hyperlink-${blockId}-${identitySuffix}`;
        setEditIdentity({ blockId, elementPath });
    }, [blockIdFromContext, identitySuffix]);

    // Check for pending edits
    const pendingEdit = useMemo(() => {
        if (!editIdentity || (!isEditing && !canEdit)) return null;

        const { blockId, elementPath } = editIdentity;

        const edit = [...pendingEdits].reverse().find(e =>
            e.type === 'hyperlink' &&
            (e as any).blockId === blockId &&
            (e as any).elementPath === elementPath
        );

        return edit as { newProps: { text?: string; href?: string; targetBlockId?: string; color?: string; bgColor?: string } } | null;
    }, [isEditing, canEdit, pendingEdits, editIdentity]);

    // Effective prop values (pending edits override originals)
    const effectiveText = pendingEdit?.newProps.text ?? childText;
    const effectiveHref = pendingEdit?.newProps.href ?? href;
    const effectiveTargetBlockId = pendingEdit?.newProps.targetBlockId ?? targetBlockId;
    const effectiveColor = pendingEdit?.newProps.color ?? color;
    const effectiveBgColor = pendingEdit?.newProps.bgColor ?? bgColor;

    // DOM text fallback — captured after mount for when childText extraction fails
    const domTextRef = useRef<string | undefined>(undefined);
    useEffect(() => {
        if (containerRef.current) {
            const text = containerRef.current.textContent?.trim();
            if (text) domTextRef.current = text;
        }
    });

    // Stable ID and serialized props for round-trip extraction (base64 for HTML attribute safety)
    const inlineIdRef = useRef(id || `hyperlink-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`);
    const componentProps = useMemo(() => {
        const textForProps = effectiveText ?? domTextRef.current;
        const json = JSON.stringify({
            text: textForProps,
            href: effectiveHref,
            targetBlockId: effectiveTargetBlockId,
            color: effectiveColor,
            bgColor: effectiveBgColor,
        });
        try { return btoa(json); } catch { return ''; }
    }, [effectiveText, effectiveHref, effectiveTargetBlockId, effectiveColor, effectiveBgColor]);

    const handleEditClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();

        let blockId = editIdentity?.blockId ?? blockIdFromContext ?? '';
        let elementPath = editIdentity?.elementPath ?? '';

        if (!elementPath) {
            const block = containerRef.current?.closest('[data-block-id]');
            blockId = blockId || block?.getAttribute('data-block-id') || '';
            elementPath = `hyperlink-${blockId}-${identitySuffix}`;
        }

        const text = effectiveText ?? containerRef.current?.textContent?.trim();

        openHyperlinkEditor(
            {
                text,
                href: effectiveHref,
                targetBlockId: effectiveTargetBlockId,
                color: effectiveColor,
                bgColor: effectiveBgColor,
            },
            blockId,
            elementPath
        );
    }, [editIdentity, blockIdFromContext, effectiveText, effectiveHref, effectiveTargetBlockId, effectiveColor, effectiveBgColor, openHyperlinkEditor, identitySuffix]);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (canEdit && isEditing) {
            handleEditClick(e);
            return;
        }
    };

    const handleClick = () => {
        if (canEdit && isEditing) return;
        if (effectiveHref) {
            window.open(effectiveHref, '_blank', 'noopener,noreferrer');
        } else if (effectiveTargetBlockId) {
            document.querySelector(`[data-block-id="${effectiveTargetBlockId}"]`)
                ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    // Wrapper props for round-trip extraction
    const wrapperProps = {
        'data-inline-component': 'inlineHyperlink' as const,
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
                    className="font-medium cursor-pointer"
                    style={{
                        color: effectiveColor,
                        borderBottom: `2px solid ${effectiveColor}`,
                        paddingBottom: '2px',
                    }}
                >
                    {effectiveText ?? children}
                </span>

                {/* Edit button on hover */}
                {isHovered && (
                    <button
                        onClick={handleEditClick}
                        className="absolute -top-2 -right-4 w-5 h-5 rounded-full shadow-lg flex items-center justify-center text-xs hover:opacity-90 transition-all duration-150 z-10"
                        style={{
                            backgroundColor: effectiveColor,
                            color: 'white',
                        }}
                        title="Edit hyperlink"
                    >
                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                    </button>
                )}
            </span>
        );
    }

    // Preview mode: clickable link
    return (
        <span ref={containerRef} {...wrapperProps}>
            <motion.span
                onClick={handleClick}
                onMouseDown={handleMouseDown}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="font-medium cursor-pointer select-none"
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: effectiveColor,
                    borderBottom: `2px solid ${effectiveColor}`,
                    paddingBottom: '1px',
                    background: isHovered ? effectiveBgColor : 'transparent',
                    borderRadius: isHovered ? '3px 3px 0 0' : '0',
                    transition: 'all 0.2s ease',
                }}
                whileTap={{ scale: 0.97 }}
                tabIndex={0}
                role="button"
            >
                {effectiveText ?? children}
            </motion.span>
        </span>
    );
};

export default InlineHyperlink;
