import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVar, useSetVar } from '@/stores/variableStore';
import { cn } from '@/lib/utils';
import { useEditing } from '@/contexts/EditingContext';
import { useAppMode } from '@/contexts/AppModeContext';
import { useBlockContext } from '@/contexts/BlockContext';

interface InlineToggleProps {
    /** Unique identifier for this component instance */
    id?: string;
    /** Variable name in the shared store (stores the current selected option) */
    varName?: string;
    /** Array of options to cycle through on click */
    options: string[];
    /** Optional color for the text (default: fuchsia/mutable) */
    color?: string;
    /** Optional background color on hover */
    bgColor?: string;
    /** Optional callback when value changes */
    onChange?: (value: string, index: number) => void;
}

/**
 * InlineToggle Component
 *
 * An interactive inline text that cycles through options on click,
 * with variable store integration and full editing support.
 *
 * Features:
 * - Variable store integration via `varName` prop (stores current selection)
 * - Editor modal for configuring options, colors
 * - Pending edits support for teacher workflow
 * - Slash command insertion via /toggle
 * - Click to cycle through options with animation
 *
 * @example Variable store mode
 * ```tsx
 * <p>
 *   The current shape is a{" "}
 *   <InlineToggle
 *     varName="currentShape"
 *     options={["triangle", "square", "pentagon", "hexagon"]}
 *     {...togglePropsFromDefinition(getVariableInfo('currentShape'))}
 *   />{" "}
 *   with equal sides.
 * </p>
 * ```
 */
export const InlineToggle: React.FC<InlineToggleProps> = ({
    id,
    varName,
    options,
    color = '#D946EF',
    bgColor = 'rgba(217, 70, 239, 0.15)',
    onChange,
}) => {
    const containerRef = useRef<HTMLSpanElement>(null);

    // Editing support
    const { isEditor } = useAppMode();
    const { isEditing, openToggleEditor, pendingEdits } = useEditing();
    const { id: blockIdFromContext } = useBlockContext();

    const isStandalone = typeof window !== 'undefined' && window.self === window.top;
    const canEdit = isEditor || isStandalone;

    // Element identity for matching pending edits
    const [editIdentity, setEditIdentity] = useState<{ blockId: string; elementPath: string } | null>(null);

    useEffect(() => {
        if (blockIdFromContext) {
            const elementPath = `toggle-${blockIdFromContext}-${varName ?? options.join(',')}`;
            setEditIdentity({ blockId: blockIdFromContext, elementPath });
            return;
        }
        if (!containerRef.current) return;

        const block = containerRef.current.closest('[data-block-id]');
        const blockId = block?.getAttribute('data-block-id') || '';
        const elementPath = `toggle-${blockId}-${varName ?? options.join(',')}`;
        setEditIdentity({ blockId, elementPath });
    }, [blockIdFromContext, varName, options]);

    // Check for pending edits
    const pendingEdit = useMemo(() => {
        if (!editIdentity || (!isEditing && !canEdit)) return null;

        const { blockId, elementPath } = editIdentity;

        const edit = [...pendingEdits].reverse().find(e =>
            e.type === 'toggle' &&
            (e as any).blockId === blockId &&
            (e as any).elementPath === elementPath
        );

        return edit as { newProps: { varName?: string; options?: string[]; color?: string; bgColor?: string } } | null;
    }, [isEditing, canEdit, pendingEdits, editIdentity]);

    // Effective prop values (pending edits override)
    const effectiveVarName = pendingEdit ? pendingEdit.newProps.varName : varName;
    const effectiveOptions = pendingEdit?.newProps.options ?? options;
    const effectiveColor = pendingEdit?.newProps.color ?? color;
    const effectiveBgColor = pendingEdit?.newProps.bgColor ?? bgColor;

    // Variable store: stores the currently selected option string
    const storeValue = useVar(effectiveVarName || '', effectiveOptions[0] || '');
    const setVar = useSetVar();

    // Local state for component without varName
    const [localValue, setLocalValue] = useState(effectiveOptions[0] || '');
    const [isHovered, setIsHovered] = useState(false);

    // Determine which value to use
    const usesVarStore = effectiveVarName !== undefined;
    const currentValue = usesVarStore ? (storeValue as string || effectiveOptions[0] || '') : localValue;

    const currentIndex = effectiveOptions.indexOf(currentValue);

    const setCurrentValue = useCallback((val: string) => {
        if (usesVarStore && effectiveVarName) {
            setVar(effectiveVarName, val);
        } else {
            setLocalValue(val);
        }
    }, [usesVarStore, effectiveVarName, setVar]);

    // Stable ID and serialized props for round-trip extraction (base64 for HTML attribute safety)
    const inlineIdRef = useRef(id || varName || `toggle-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`);
    const componentProps = useMemo(() => {
        const json = JSON.stringify({
            varName: effectiveVarName,
            options: effectiveOptions,
            color: effectiveColor,
            bgColor: effectiveBgColor,
        });
        try { return btoa(json); } catch { return ''; }
    }, [effectiveVarName, effectiveOptions, effectiveColor, effectiveBgColor]);

    const handleEditClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();

        let blockId = editIdentity?.blockId ?? blockIdFromContext ?? '';
        let elementPath = editIdentity?.elementPath ?? '';

        if (!elementPath) {
            const block = containerRef.current?.closest('[data-block-id]');
            blockId = blockId || block?.getAttribute('data-block-id') || '';
            elementPath = `toggle-${blockId}-${varName ?? options.join(',')}`;
        }

        openToggleEditor(
            {
                varName: effectiveVarName,
                options: effectiveOptions,
                color: effectiveColor,
                bgColor: effectiveBgColor,
            },
            blockId,
            elementPath
        );
    }, [editIdentity, blockIdFromContext, effectiveVarName, effectiveOptions, effectiveColor, effectiveBgColor, openToggleEditor, varName, options]);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (canEdit && isEditing) {
            handleEditClick(e);
            return;
        }
    };

    const handleClick = () => {
        if (canEdit && isEditing) return;
        const nextIndex = (currentIndex + 1) % effectiveOptions.length;
        const nextValue = effectiveOptions[nextIndex];
        setCurrentValue(nextValue);
        onChange?.(nextValue, nextIndex);
    };

    // Wrapper props for round-trip extraction
    const wrapperProps = {
        'data-inline-component': 'inlineToggle' as const,
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
                        borderBottom: `2px dashed ${effectiveColor}`,
                        paddingBottom: '2px',
                    }}
                >
                    {effectiveOptions[0] || 'option'}
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
                        title="Edit toggle"
                    >
                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                    </button>
                )}
            </span>
        );
    }

    // Preview mode: clickable toggle
    return (
        <span ref={containerRef} {...wrapperProps}>
            <span
                onClick={handleClick}
                onMouseDown={handleMouseDown}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="font-medium cursor-pointer select-none"
                style={{
                    color: effectiveColor,
                    borderBottom: `2px dashed ${effectiveColor}`,
                    paddingBottom: '2px',
                    background: isHovered ? effectiveBgColor : 'transparent',
                    borderRadius: isHovered ? '3px 3px 0 0' : '0',
                    transition: 'all 0.2s ease',
                }}
                tabIndex={0}
                role="button"
            >
                <AnimatePresence mode="wait">
                    <motion.span
                        key={currentIndex}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.15 }}
                    >
                        {currentValue}
                    </motion.span>
                </AnimatePresence>
            </span>
        </span>
    );
};

export default InlineToggle;
