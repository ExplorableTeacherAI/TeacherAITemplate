import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Play, RefreshCw, Zap } from 'lucide-react';
import { useSetVar } from '@/stores/variableStore';
import { cn } from '@/lib/utils';
import { useEditing } from '@/contexts/EditingContext';
import { useAppMode } from '@/contexts/AppModeContext';
import { useBlockContext } from '@/contexts/BlockContext';

interface InlineTriggerProps {
    /** Clickable text content */
    children: React.ReactNode;
    /** Variable to set on click */
    varName?: string;
    /** Value to set the variable to */
    value?: string | number | boolean;
    /** Optional color for the text (default: emerald #10B981) */
    color?: string;
    /** Optional background color on hover */
    bgColor?: string;
    /** Icon to show: 'play' | 'refresh' | 'zap' | 'none' */
    icon?: string;
    /** Optional callback on trigger */
    onTrigger?: () => void;
}

const getIconComponent = (icon: string | undefined) => {
    switch (icon) {
        case 'play': return Play;
        case 'refresh': return RefreshCw;
        case 'zap': return Zap;
        case 'none': return null;
        default: return null;
    }
};

/**
 * InlineTrigger Component
 *
 * Clickable inline text that sets a global variable to a specific value on click.
 * Belongs to the connective category (emerald #10B981).
 *
 * @example
 * ```tsx
 * <p>
 *   The amplitude is <InlineScrubbleNumber varName="amplitude" ... />.
 *   You can{" "}
 *   <InlineTrigger varName="amplitude" value={1}>reset it to 1</InlineTrigger>{" "}
 *   or{" "}
 *   <InlineTrigger varName="amplitude" value={5} icon="zap">max it out</InlineTrigger>.
 * </p>
 * ```
 */
export const InlineTrigger: React.FC<InlineTriggerProps> = ({
    children,
    varName,
    value,
    color = '#10B981',
    bgColor = 'rgba(16, 185, 129, 0.15)',
    icon,
    onTrigger,
}) => {
    const containerRef = useRef<HTMLSpanElement>(null);

    // Editing support
    const { isEditor } = useAppMode();
    const { isEditing, openTriggerEditor, pendingEdits } = useEditing();
    const { id: blockIdFromContext } = useBlockContext();

    const isStandalone = typeof window !== 'undefined' && window.self === window.top;
    const canEdit = isEditor || isStandalone;

    // Variable store
    const setVar = useSetVar();

    // Hover state
    const [isHovered, setIsHovered] = useState(false);

    // Extract text from children for identity
    const childText = typeof children === 'string' ? children : undefined;

    // Element identity for matching pending edits
    const [editIdentity, setEditIdentity] = useState<{ blockId: string; elementPath: string } | null>(null);

    // Build a suffix that uniquely identifies this trigger within a block.
    // varName alone is NOT enough — multiple triggers can target the same variable
    // with different values (e.g. "reset to 1" vs "max it out" both set animationSpeed).
    const identitySuffix = childText
        ? `${varName ?? 'novar'}-${childText}`
        : `${varName ?? 'novar'}-${value !== undefined ? String(value) : 'trigger'}`;

    useEffect(() => {
        if (blockIdFromContext) {
            const elementPath = `trigger-${blockIdFromContext}-${identitySuffix}`;
            setEditIdentity({ blockId: blockIdFromContext, elementPath });
            return;
        }
        if (!containerRef.current) return;

        const block = containerRef.current.closest('[data-block-id]');
        const blockId = block?.getAttribute('data-block-id') || '';
        const elementPath = `trigger-${blockId}-${identitySuffix}`;
        setEditIdentity({ blockId, elementPath });
    }, [blockIdFromContext, identitySuffix]);

    // Check for pending edits
    const pendingEdit = useMemo(() => {
        if (!editIdentity || (!isEditing && !canEdit)) return null;

        const { blockId, elementPath } = editIdentity;

        const edit = [...pendingEdits].reverse().find(e =>
            e.type === 'trigger' &&
            (e as any).blockId === blockId &&
            (e as any).elementPath === elementPath
        );

        return edit as { newProps: { text?: string; varName?: string; value?: string | number | boolean; color?: string; bgColor?: string; icon?: string } } | null;
    }, [isEditing, canEdit, pendingEdits, editIdentity]);

    // Effective prop values (pending edits override originals)
    const effectiveText = pendingEdit?.newProps.text ?? childText;
    const effectiveVarName = pendingEdit?.newProps.varName ?? varName;
    const effectiveValue = pendingEdit?.newProps.value ?? value;
    const effectiveColor = pendingEdit?.newProps.color ?? color;
    const effectiveBgColor = pendingEdit?.newProps.bgColor ?? bgColor;
    const effectiveIcon = pendingEdit?.newProps.icon ?? icon;

    // Stable ID and serialized props for round-trip extraction
    const inlineIdRef = useRef(`trigger-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`);
    const componentProps = useMemo(() => JSON.stringify({
        text: effectiveText,
        varName: effectiveVarName,
        value: effectiveValue,
        color: effectiveColor,
        bgColor: effectiveBgColor,
        icon: effectiveIcon,
    }), [effectiveText, effectiveVarName, effectiveValue, effectiveColor, effectiveBgColor, effectiveIcon]);

    const handleEditClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();

        let blockId = editIdentity?.blockId ?? blockIdFromContext ?? '';
        let elementPath = editIdentity?.elementPath ?? '';

        if (!elementPath) {
            const block = containerRef.current?.closest('[data-block-id]');
            blockId = blockId || block?.getAttribute('data-block-id') || '';
            elementPath = `trigger-${blockId}-${identitySuffix}`;
        }

        openTriggerEditor(
            {
                text: effectiveText,
                varName: effectiveVarName,
                value: effectiveValue,
                color: effectiveColor,
                bgColor: effectiveBgColor,
                icon: effectiveIcon,
            },
            blockId,
            elementPath
        );
    }, [editIdentity, blockIdFromContext, effectiveText, effectiveVarName, effectiveValue, effectiveColor, effectiveBgColor, effectiveIcon, openTriggerEditor, identitySuffix]);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (canEdit && isEditing) {
            handleEditClick(e);
            return;
        }
    };

    const handleClick = () => {
        if (canEdit && isEditing) return;
        if (effectiveVarName && effectiveValue !== undefined) {
            setVar(effectiveVarName, effectiveValue);
        }
        onTrigger?.();
    };

    // Wrapper props for round-trip extraction
    const wrapperProps = {
        'data-inline-component': 'inlineTrigger' as const,
        'data-component-id': inlineIdRef.current,
        'data-component-props': componentProps,
        contentEditable: false as const,
    };

    const IconComponent = getIconComponent(effectiveIcon);

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
                    {IconComponent && (
                        <span style={{ display: 'inline-flex', marginLeft: '4px', opacity: 0.6 }}>
                            <IconComponent size={14} />
                        </span>
                    )}
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
                        title="Edit trigger"
                    >
                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                    </button>
                )}
            </span>
        );
    }

    // Preview mode: clickable trigger
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
                {IconComponent && (
                    <motion.span
                        animate={{ opacity: isHovered ? 0.8 : 0.5 }}
                        style={{ display: 'inline-flex' }}
                    >
                        <IconComponent size={14} />
                    </motion.span>
                )}
            </motion.span>
        </span>
    );
};

export default InlineTrigger;
