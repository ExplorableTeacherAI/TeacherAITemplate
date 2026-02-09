import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useVar, useSetVar } from '@/stores/variableStore';
import { cn } from '@/lib/utils';
import { useEditing } from '@/contexts/EditingContext';
import { useAppMode } from '@/contexts/AppModeContext';

interface InlineScrubbleNumberProps {
    /** Variable name in the shared store */
    varName?: string;
    /** Default value (used when varName is not set or as initial value) */
    defaultValue?: number;
    /** Controlled value (if provided, overrides varName and defaultValue) */
    value?: number;
    /** Minimum value (default: 0) */
    min?: number;
    /** Maximum value (default: 100) */
    max?: number;
    /** Step amount (default: 1) */
    step?: number;
    /** Optional color for the number (default: red) */
    color?: string;
    /** Optional callback when value changes */
    onChange?: (value: number) => void;
    /** Format the displayed value (e.g., to show decimals) */
    formatValue?: (value: number) => string;
}

/**
 * InlineScrubbleNumber Component
 * 
 * An interactive number that can be embedded inline within paragraphs.
 * The number is displayed with an underline and red highlight by default.
 * 
 * Features:
 * - Variable store integration via `varName` prop
 * - Click and drag on the number to change value (scrub)
 * - Hover to see progress bar
 * - Use arrow keys when focused
 * - Supports both controlled and uncontrolled modes
 * - In editing mode, click to open editor modal
 * 
 * Modes:
 * - Variable store mode: Pass `varName` to sync with global state
 * - Controlled: Pass `value` and `onChange` props (overrides varName)
 * - Uncontrolled: Pass `defaultValue` prop (no varName)
 * 
 * @example Variable store mode
 * ```tsx
 * <p>
 *   If we increase the number to{" "}
 *   <InlineScrubbleNumber 
 *     varName="wedgeCount"
 *     defaultValue={10}
 *     min={1}
 *     max={20}
 *   />{" "}
 *   this shape gets closer to a circle.
 * </p>
 * ```
 * 
 * @example Controlled mode
 * ```tsx
 * const [value, setValue] = useState(2);
 * <p>
 *   The amplitude is{" "}
 *   <InlineScrubbleNumber 
 *     value={value}
 *     onChange={setValue}
 *     min={0.1}
 *     max={4}
 *     step={0.1}
 *     formatValue={(v) => v.toFixed(2)}
 *   />.
 * </p>
 * ```
 */
export const InlineScrubbleNumber: React.FC<InlineScrubbleNumberProps> = ({
    varName,
    defaultValue = 10,
    value: controlledValue,
    min = 0,
    max = 100,
    step = 1,
    color = "#D81B60", // Default red/pink
    onChange,
    formatValue,
}) => {

    const [isDragging, setIsDragging] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const dragStartX = useRef(0);
    const dragStartValue = useRef(0);
    const containerRef = useRef<HTMLSpanElement>(null);

    // Editing support
    const { isEditor } = useAppMode();
    const { isEditing, openScrubbleNumberEditor, pendingEdits } = useEditing();

    // Allow editing in editor mode OR standalone mode for testing
    const isStandalone = typeof window !== 'undefined' && window.self === window.top;
    const canEdit = isEditor || isStandalone;

    // State to store the element identity (sectionId and path) since it depends on DOM
    const [editIdentity, setEditIdentity] = useState<{ sectionId: string; elementPath: string } | null>(null);

    // Update identity when ref is available or props change
    useEffect(() => {
        if (!containerRef.current) return;

        const section = containerRef.current.closest('[data-section-id]');
        const sectionId = section?.getAttribute('data-section-id') || '';
        const elementPath = `scrubble-${sectionId}-${varName || defaultValue}`;

        setEditIdentity({ sectionId, elementPath });
    }, [varName, defaultValue]);

    // Check for pending edits using the stored identity
    const pendingEdit = React.useMemo(() => {
        if (!editIdentity || (!isEditing && !canEdit)) return null;

        const { sectionId, elementPath } = editIdentity;

        // Find the most recent edit for this scrubble number
        const edit = [...pendingEdits].reverse().find(e =>
            e.type === 'scrubbleNumber' &&
            e.sectionId === sectionId &&
            (e as any).elementPath === elementPath
        );

        return edit as { newProps: { varName?: string; min?: number; max?: number; step?: number; defaultValue?: number } } | null;
    }, [isEditing, canEdit, pendingEdits, editIdentity]);

    // Use edited values if available
    const effectiveVarName = pendingEdit?.newProps.varName ?? varName;
    const effectiveDefaultValue = pendingEdit?.newProps.defaultValue ?? defaultValue;
    const displayMin = pendingEdit?.newProps.min ?? min;
    const displayMax = pendingEdit?.newProps.max ?? max;
    const displayStep = pendingEdit?.newProps.step ?? step;

    // Get value from variable store if varName is provided (using effective name)
    const storeValue = useVar(effectiveVarName || '', effectiveDefaultValue);
    const setVar = useSetVar();

    // Local state for uncontrolled mode without varName
    const [localValue, setLocalValue] = useState(defaultValue);

    // Update local value if default value changes via edit
    useEffect(() => {
        if (effectiveDefaultValue !== undefined && effectiveDefaultValue !== defaultValue) {
            setLocalValue(effectiveDefaultValue);
        }
    }, [effectiveDefaultValue, defaultValue]);

    // Determine which value to use
    // Priority: controlledValue > storeValue (if varName) > localValue
    const isControlled = controlledValue !== undefined;
    const usesVarStore = effectiveVarName !== undefined && !isControlled;

    const value = isControlled
        ? controlledValue
        : usesVarStore
            ? storeValue
            : localValue;

    const updateValue = (newValue: number) => {
        const clampedValue = Math.max(displayMin, Math.min(displayMax, newValue));

        // Update based on mode
        if (isControlled) {
            // Controlled mode - just call onChange
            onChange?.(clampedValue);
        } else if (usesVarStore) {
            // Variable store mode
            setVar(effectiveVarName!, clampedValue);
            onChange?.(clampedValue);
        } else {
            // Uncontrolled local mode
            setLocalValue(clampedValue);
            onChange?.(clampedValue);
        }
    };

    const increment = () => {
        updateValue(value + displayStep);
    };

    const decrement = () => {
        updateValue(value - displayStep);
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        // Don't start dragging in edit mode - let click through
        if (canEdit && isEditing) return;

        setIsDragging(true);
        dragStartX.current = e.clientX;
        dragStartValue.current = value;
        e.preventDefault();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (canEdit && isEditing) return;

        if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
            e.preventDefault();
            increment();
        } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
            e.preventDefault();
            decrement();
        }
    };

    // Handle edit button click
    const handleEditClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();

        // Use stored identity if available, otherwise try to find it
        const sectionId = editIdentity?.sectionId || containerRef.current?.closest('[data-section-id]')?.getAttribute('data-section-id') || '';
        const elementPath = editIdentity?.elementPath || `scrubble-${sectionId}-${varName || defaultValue}`;

        openScrubbleNumberEditor(
            {
                varName: effectiveVarName,
                defaultValue: effectiveDefaultValue,
                min: displayMin,
                max: displayMax,
                step: displayStep
            },
            sectionId,
            elementPath
        );
    }, [editIdentity, effectiveVarName, effectiveDefaultValue, displayMin, displayMax, displayStep, openScrubbleNumberEditor, varName, defaultValue]);

    // Handle dragging with useEffect
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging) return;

            const deltaX = e.clientX - dragStartX.current;
            const sensitivity = 2; // pixels per step
            const deltaValue = Math.round(deltaX / sensitivity) * displayStep;
            updateValue(dragStartValue.current + deltaValue);
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, displayStep]);

    // Calculate progress percentage
    const progress = ((value - displayMin) / (displayMax - displayMin)) * 100;

    return (
        <span
            ref={containerRef}
            className={cn(
                "inline-flex items-center relative",
                canEdit && isEditing && "group"
            )}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Progress bar on hover */}
            {isHovered && !isEditing && (
                <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    transition={{ duration: 0.15 }}
                    className="absolute -top-3 left-0 right-0 h-1.5 rounded-full overflow-hidden"
                    style={{
                        backgroundColor: `${color}20`,
                    }}
                >
                    <div
                        className="h-full rounded-full transition-all duration-200"
                        style={{
                            width: `${progress}%`,
                            backgroundColor: color,
                        }}
                    />
                </motion.div>
            )}

            {/* Number display with underline */}
            <span
                onMouseDown={handleMouseDown}
                onClick={canEdit && isEditing ? handleEditClick : undefined}
                onKeyDown={handleKeyDown}
                tabIndex={0}
                className={cn(
                    "select-none font-medium transition-all duration-150",
                    !(canEdit && isEditing) && "cursor-ew-resize",
                    canEdit && isEditing && "cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20 rounded px-0.5 -mx-0.5"
                )}
                style={{
                    color: color,
                    borderBottom: `2px solid ${color}`,
                    paddingBottom: '1px',
                }}
            >
                {formatValue ? formatValue(value) : value}
            </span>

            {/* Edit button - appears on hover in edit mode */}
            {canEdit && isEditing && isHovered && (
                <button
                    onClick={handleEditClick}
                    className="absolute -top-2 -right-4 w-5 h-5 rounded-full shadow-lg flex items-center justify-center text-xs hover:opacity-90 transition-all duration-150 z-10"
                    style={{
                        backgroundColor: color,
                        color: 'white',
                    }}
                    title="Edit scrubbable number"
                >
                    <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                </button>
            )}
        </span>
    );
};

export default InlineScrubbleNumber;
