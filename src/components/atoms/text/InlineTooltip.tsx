import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useEditing } from '@/contexts/EditingContext';
import { useAppMode } from '@/contexts/AppModeContext';
import { useBlockContext } from '@/contexts/BlockContext';

interface InlineTooltipProps {
    /** Unique identifier for this component instance */
    id?: string;
    /** The trigger text content */
    children: React.ReactNode;
    /** The tooltip/definition content shown on hover */
    tooltip: string;
    /** Optional color for the text (default: amber #F59E0B) */
    color?: string;
    /** Optional background color on hover */
    bgColor?: string;
    /** Tooltip position: 'top' | 'bottom' | 'auto' */
    position?: string;
    /** Maximum tooltip width */
    maxWidth?: number;
}

/**
 * InlineTooltip Component
 *
 * An interactive inline text that shows a tooltip on hover,
 * with full editing support. Unlike other inline components,
 * InlineTooltip wraps children text and does NOT use the variable store.
 *
 * @example
 * ```tsx
 * <p>
 *   Every point on a{" "}
 *   <InlineTooltip tooltip="A shape where all points are equidistant from the center.">
 *     circle
 *   </InlineTooltip>{" "}
 *   has the same distance from its center.
 * </p>
 * ```
 */
export const InlineTooltip: React.FC<InlineTooltipProps> = ({
    id,
    children,
    tooltip,
    color = '#F59E0B',
    bgColor = 'rgba(245, 158, 11, 0.15)',
    position = 'auto',
    maxWidth = 400,
}) => {
    const containerRef = useRef<HTMLSpanElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);

    // Editing support
    const { isEditor } = useAppMode();
    const { isEditing, openTooltipEditor, pendingEdits } = useEditing();
    const { id: blockIdFromContext } = useBlockContext();

    const isStandalone = typeof window !== 'undefined' && window.self === window.top;
    const canEdit = isEditor || isStandalone;

    // Hover state
    const [isHovered, setIsHovered] = useState(false);
    const [tooltipPosition, setTooltipPosition] = useState<'top' | 'bottom'>('bottom');
    const [tooltipCoords, setTooltipCoords] = useState({ top: 0, left: 0 });

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

    useEffect(() => {
        if (blockIdFromContext) {
            const elementPath = `tooltip-${blockIdFromContext}-${childText ?? tooltip?.substring(0, 20)}`;
            setEditIdentity({ blockId: blockIdFromContext, elementPath });
            return;
        }
        if (!containerRef.current) return;

        const block = containerRef.current.closest('[data-block-id]');
        const blockId = block?.getAttribute('data-block-id') || '';
        const elementPath = `tooltip-${blockId}-${childText ?? tooltip?.substring(0, 20)}`;
        setEditIdentity({ blockId, elementPath });
    }, [blockIdFromContext, childText, tooltip]);

    // Check for pending edits
    const pendingEdit = useMemo(() => {
        if (!editIdentity || (!isEditing && !canEdit)) return null;

        const { blockId, elementPath } = editIdentity;

        const edit = [...pendingEdits].reverse().find(e =>
            e.type === 'tooltip' &&
            (e as any).blockId === blockId &&
            (e as any).elementPath === elementPath
        );

        return edit as { newProps: { text?: string; tooltip?: string; color?: string; bgColor?: string; position?: string; maxWidth?: number } } | null;
    }, [isEditing, canEdit, pendingEdits, editIdentity]);

    // Effective prop values (pending edits override)
    const effectiveText = pendingEdit?.newProps.text ?? childText;
    const effectiveTooltip = pendingEdit?.newProps.tooltip ?? tooltip;
    const effectiveColor = pendingEdit?.newProps.color ?? color;
    const effectiveBgColor = pendingEdit?.newProps.bgColor ?? bgColor;
    const effectivePosition = pendingEdit?.newProps.position ?? position;
    const effectiveMaxWidth = pendingEdit?.newProps.maxWidth ?? maxWidth;

    // DOM text fallback — captured after mount for when childText extraction fails
    const domTextRef = useRef<string | undefined>(undefined);
    useEffect(() => {
        if (containerRef.current) {
            const text = containerRef.current.textContent?.trim();
            if (text) domTextRef.current = text;
        }
    });

    // Stable ID and serialized props for round-trip extraction (base64 for HTML attribute safety)
    const inlineIdRef = useRef(id || `tooltip-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`);
    const componentProps = useMemo(() => {
        const textForProps = effectiveText ?? domTextRef.current;
        const json = JSON.stringify({
            text: textForProps,
            tooltip: effectiveTooltip,
            color: effectiveColor,
            bgColor: effectiveBgColor,
            position: effectivePosition,
            maxWidth: effectiveMaxWidth,
        });
        try { return btoa(json); } catch { return ''; }
    }, [effectiveText, effectiveTooltip, effectiveColor, effectiveBgColor, effectivePosition, effectiveMaxWidth]);

    // Calculate tooltip position on hover
    useEffect(() => {
        if (!containerRef.current || !isHovered) return;

        const rect = containerRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const spaceBelow = viewportHeight - rect.bottom;
        const spaceAbove = rect.top;
        const tooltipHeight = tooltipRef.current?.offsetHeight || 100;
        const gap = 8;

        let finalPosition: 'top' | 'bottom' = 'bottom';
        if (effectivePosition === 'auto') {
            if (spaceBelow < tooltipHeight + gap && spaceAbove > spaceBelow) {
                finalPosition = 'top';
            }
        } else if (effectivePosition === 'top' || effectivePosition === 'bottom') {
            finalPosition = effectivePosition;
        }

        setTooltipPosition(finalPosition);

        const tooltipTop = finalPosition === 'bottom'
            ? rect.bottom + window.scrollY + gap
            : rect.top + window.scrollY - tooltipHeight - gap;

        const tooltipWidth = Math.min(effectiveMaxWidth, window.innerWidth - 32);
        let tooltipLeft = rect.left + (rect.width / 2) - (tooltipWidth / 2) + window.scrollX;
        tooltipLeft = Math.max(16, Math.min(tooltipLeft, window.innerWidth - tooltipWidth - 16));

        setTooltipCoords({
            top: tooltipTop,
            left: tooltipLeft,
        });
    }, [isHovered, effectivePosition, effectiveMaxWidth]);

    const handleEditClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();

        let blockId = editIdentity?.blockId ?? blockIdFromContext ?? '';
        let elementPath = editIdentity?.elementPath ?? '';

        if (!elementPath) {
            const block = containerRef.current?.closest('[data-block-id]');
            blockId = blockId || block?.getAttribute('data-block-id') || '';
            elementPath = `tooltip-${blockId}-${childText ?? tooltip?.substring(0, 20)}`;
        }

        const text = effectiveText ?? containerRef.current?.textContent?.trim();

        openTooltipEditor(
            {
                text,
                tooltip: effectiveTooltip,
                color: effectiveColor,
                bgColor: effectiveBgColor,
                position: effectivePosition,
                maxWidth: effectiveMaxWidth,
            },
            blockId,
            elementPath
        );
    }, [editIdentity, blockIdFromContext, effectiveText, effectiveTooltip, effectiveColor, effectiveBgColor, effectivePosition, effectiveMaxWidth, openTooltipEditor, childText, tooltip]);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (canEdit && isEditing) {
            handleEditClick(e);
            return;
        }
    };

    // Wrapper props for round-trip extraction
    const wrapperProps = {
        'data-inline-component': 'inlineTooltip' as const,
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
                        borderBottom: `2px dotted ${effectiveColor}`,
                        paddingBottom: '2px',
                    }}
                >
                    {pendingEdit?.newProps.text ?? children}
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
                        title="Edit tooltip"
                    >
                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                    </button>
                )}
            </span>
        );
    }

    // Preview mode: hover to show tooltip
    return (
        <>
            <span
                ref={containerRef}
                {...wrapperProps}
                style={{
                    color: effectiveColor,
                    textShadow: isHovered ? `0 0 8px ${effectiveColor}4D` : 'none',
                    background: isHovered ? effectiveBgColor : 'transparent',
                    borderRadius: '2px',
                    padding: isHovered ? '0 2px' : '0',
                    margin: isHovered ? '0 -2px' : '0',
                    cursor: 'help',
                    fontWeight: 500,
                    transition: 'all 0.2s ease',
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {pendingEdit?.newProps.text ?? children}
            </span>

            {/* Tooltip via Portal */}
            {typeof window !== 'undefined' && createPortal(
                <AnimatePresence>
                    {isHovered && (
                        <motion.div
                            ref={tooltipRef}
                            initial={{ opacity: 0, y: tooltipPosition === 'bottom' ? -8 : 8, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: tooltipPosition === 'bottom' ? -8 : 8, scale: 0.95 }}
                            transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
                            style={{
                                position: 'fixed',
                                top: `${tooltipCoords.top}px`,
                                left: `${tooltipCoords.left}px`,
                                maxWidth: `${effectiveMaxWidth}px`,
                                minWidth: '200px',
                                padding: '12px 16px',
                                borderRadius: '10px',
                                background: effectiveColor,
                                color: 'white',
                                fontSize: '0.9rem',
                                lineHeight: 1.6,
                                boxShadow: `0 4px 20px ${effectiveColor}4D`,
                                pointerEvents: 'none',
                                zIndex: 1000,
                            }}
                        >
                            <p className="m-0">{effectiveTooltip}</p>
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </>
    );
};

export default InlineTooltip;
