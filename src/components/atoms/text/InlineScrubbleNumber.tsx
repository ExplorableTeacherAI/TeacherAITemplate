import React, { useState, useRef, useEffect, useCallback, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Anchor as PopoverAnchor } from '@radix-ui/react-popover';
import { Popover, PopoverContent } from '@/components/atoms/ui/popover';
import { useVar, useSetVar } from '@/stores/variableStore';
import { useVarColor } from '@/stores';
import { cn } from '@/lib/utils';
import { encodeMarkerJson } from '@/lib/inlineMarkers';
import { useEditing } from '@/contexts/EditingContext';
import { useAppMode } from '@/contexts/AppModeContext';
import { useBlockContext } from '@/contexts/BlockContext';
import { useComponentHint, HintIcon } from './InlineInteractionHint';

interface InlineScrubbleNumberProps {
    /** Unique identifier for this component instance */
    id?: string;
    /** Variable name in the shared store */
    varName?: string;
    /** Default value (used when varName is not set or as initial value) */
    defaultValue?: number;
    /** Controlled value (if provided, overrides varName and defaultValue) */
    value?: number;
    /** Minimum value (default: 0) */
    min?: number;
    /** Whether to show interaction hint for first occurrence (default: true) */
    showHint?: boolean;
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
    id,
    varName,
    defaultValue = 10,
    value: controlledValue,
    min = 0,
    max = 100,
    step = 1,
    color = "#D81B60", // Default red/pink
    onChange,
    formatValue,
    showHint = true,
}) => {

    const [isDragging, setIsDragging] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [numberEditorOpen, setNumberEditorOpen] = useState(false);
    const [numberDraft, setNumberDraft] = useState('');
    const numberAnchorRef = useRef<HTMLSpanElement>(null);
    const restoreNumberFocus = useRef(true);
    const touchGesture = useRef<{ id: number; x: number; y: number; value: number; axis: 'pending' | 'horizontal' | 'vertical' } | null>(null);
    const suppressMouseUntil = useRef(0);
    const touchTapPending = useRef(false);

    // ── Interaction Hint System ──
    const { hintVisible, dismissHint } = useComponentHint('scrubble-number', { enabled: showHint });

    const dragStartX = useRef(0);
    const dragStartValue = useRef(0);
    const containerRef = useRef<HTMLSpanElement>(null);
    // The persisted id is the authoritative identity. The generated fallback
    // still keeps two otherwise-identical components distinct in one render.
    const inlineIdRef = useRef(id || `scrubble-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`);

    // Editing support
    const { isEditor } = useAppMode();
    const { isEditing, openScrubbleNumberEditor, pendingEdits } = useEditing();
    const { id: blockIdFromContext } = useBlockContext();

    // Allow editing in editor mode OR standalone mode for testing
    const isStandalone = typeof window !== 'undefined' && window.self === window.top;
    const canEdit = isEditor || isStandalone;

    // Element identity for matching pending edits: prefer BlockContext id (reliable when using global vars), fallback to DOM lookup
    const [editIdentity, setEditIdentity] = useState<{ blockId: string; elementPath: string } | null>(null);

    // Update identity when context blockId or props change (context is authoritative when present)
    useEffect(() => {
        if (blockIdFromContext) {
            const elementPath = `scrubble-${blockIdFromContext}-${inlineIdRef.current}`;
            setEditIdentity({ blockId: blockIdFromContext, elementPath });
            return;
        }
        if (!containerRef.current) return;

        const block = containerRef.current.closest('[data-block-id]');
        const blockId = block?.getAttribute('data-block-id') || '';
        const elementPath = `scrubble-${blockId}-${inlineIdRef.current}`;
        setEditIdentity({ blockId, elementPath });
    }, [blockIdFromContext, varName, defaultValue]);

    // Check for pending edits using the stored identity
    const pendingEdit = React.useMemo(() => {
        if (!editIdentity || (!isEditing && !canEdit)) return null;

        const { blockId, elementPath } = editIdentity;

        // Find the most recent edit for this scrubble number
        const edit = [...pendingEdits].reverse().find(e =>
            e.type === 'scrubbleNumber' &&
            (e as any).blockId === blockId &&
            ((e as any).componentId
                ? (e as any).componentId === inlineIdRef.current
                : (e as any).elementPath === elementPath)
        );

        return edit as { newProps: { varName?: string; min?: number; max?: number; step?: number; defaultValue?: number; color?: string } } | null;
    }, [isEditing, canEdit, pendingEdits, editIdentity]);

    // Use edited values if available
    // Note: checking pendingEdit explicitly to allow clearing varName (setting to undefined)
    const effectiveVarName = pendingEdit ? pendingEdit.newProps.varName : varName;
    const effectiveDefaultValue = pendingEdit?.newProps.defaultValue ?? defaultValue;
    const displayMin = pendingEdit?.newProps.min ?? min;
    const displayMax = pendingEdit?.newProps.max ?? max;
    const displayStep = pendingEdit?.newProps.step ?? step;

    // Color: pending scrubble edit > central variable color store > prop default
    const storeColor = useVarColor(effectiveVarName, color);
    const effectiveColor = pendingEdit?.newProps.color ?? storeColor;

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

    // When a pending edit changes defaultValue or min/max, sync the store value
    // so the change is immediately visible (defaultValue only affects initial/fallback,
    // but the user expects the displayed number to update when editing).
    const lastAppliedEditId = useRef<string | null>(null);
    useEffect(() => {
        if (!pendingEdit || isControlled) return;
        const editId = (pendingEdit as any).id;
        if (editId === lastAppliedEditId.current) return;
        lastAppliedEditId.current = editId;

        const newDefault = pendingEdit.newProps.defaultValue;
        const newMin = pendingEdit.newProps.min ?? min;
        const newMax = pendingEdit.newProps.max ?? max;

        if (usesVarStore && effectiveVarName) {
            // Set store value to the new default, clamped to new range
            if (newDefault !== undefined) {
                const clamped = Math.max(newMin, Math.min(newMax, newDefault));
                setVar(effectiveVarName, clamped);
            } else {
                // No new default, but range may have changed — clamp current value
                const clamped = Math.max(newMin, Math.min(newMax, storeValue));
                if (clamped !== storeValue) {
                    setVar(effectiveVarName, clamped);
                }
            }
        } else if (!isControlled) {
            // Local mode — update local value
            if (newDefault !== undefined) {
                setLocalValue(Math.max(newMin, Math.min(newMax, newDefault)));
            }
        }
    }, [pendingEdit, isControlled, usesVarStore, effectiveVarName, min, max, storeValue, setVar]);

    const updateValue = useCallback((newValue: number) => {
        // Round to step precision to avoid floating-point drift (e.g. 10.700000000000001)
        const [coefficient, exponent = '0'] = String(displayStep).split('e');
        const decimals = Math.min(100, Math.max(0, (coefficient.split('.')[1]?.length ?? 0) - Number(exponent)));
        const rounded = Number(newValue.toFixed(decimals));
        const clampedValue = Math.max(displayMin, Math.min(displayMax, rounded));

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
    }, [displayMin, displayMax, displayStep, isControlled, usesVarStore, effectiveVarName, setVar, onChange]);

    // Keep a ref so the drag handler always calls the latest updateValue
    const updateValueRef = useRef(updateValue);
    updateValueRef.current = updateValue;

    const increment = () => {
        const [coefficient, exponent = '0'] = String(displayStep).split('e');
        const decimals = Math.min(100, Math.max(0, (coefficient.split('.')[1]?.length ?? 0) - Number(exponent)));
        updateValue(Number((value + displayStep).toFixed(decimals)));
    };

    const decrement = () => {
        const [coefficient, exponent = '0'] = String(displayStep).split('e');
        const decimals = Math.min(100, Math.max(0, (coefficient.split('.')[1]?.length ?? 0) - Number(exponent)));
        updateValue(Number((value - displayStep).toFixed(decimals)));
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (canEdit && isEditing) {
            // In editing mode, trigger the editor on mousedown.
            // Using mousedown instead of click is more reliable when the parent
            // EditableParagraph is contentEditable — browsers can intercept click
            // events on contentEditable={false} children for selection handling.
            handleEditClick(e);
            return;
        }
        if (Date.now() < suppressMouseUntil.current) return;

        dismissHint(); // Dismiss interaction hint on first drag
        setIsDragging(true);
        dragStartX.current = e.clientX;
        dragStartValue.current = value;
        e.preventDefault();
    };

    const openNumberEditor = () => {
        dismissHint();
        restoreNumberFocus.current = true;
        setNumberDraft(String(value));
        setNumberEditorOpen(true);
    };
    useEffect(() => {
        if (numberEditorOpen) setNumberDraft(String(value));
    }, [value, numberEditorOpen]);

    // Let the browser keep vertical scrolling. Only a deliberate horizontal
    // gesture changes the number; a tap opens precise, accessible controls.
    const handlePointerDown = (e: React.PointerEvent<HTMLSpanElement>) => {
        if (e.pointerType === 'mouse' || (canEdit && isEditing)) return;
        suppressMouseUntil.current = Date.now() + 800;
        touchTapPending.current = false;
        if (!e.isPrimary) { touchGesture.current = null; return; }
        touchGesture.current = { id: e.pointerId, x: e.clientX, y: e.clientY, value, axis: 'pending' };
        e.currentTarget.setPointerCapture(e.pointerId);
    };
    const handlePointerMove = (e: React.PointerEvent<HTMLSpanElement>) => {
        const gesture = touchGesture.current;
        if (!gesture || gesture.id !== e.pointerId) return;
        const dx = e.clientX - gesture.x;
        const dy = e.clientY - gesture.y;
        if (gesture.axis === 'pending') {
            if (Math.max(Math.abs(dx), Math.abs(dy)) < 8) return;
            gesture.axis = Math.abs(dx) > Math.abs(dy) ? 'horizontal' : 'vertical';
        }
        if (gesture.axis !== 'horizontal') return;
        dismissHint();
        e.preventDefault();
        updateValueRef.current(gesture.value + Math.round(dx / 8) * displayStep);
    };
    const handlePointerUp = (e: React.PointerEvent<HTMLSpanElement>) => {
        if (e.pointerType === 'mouse' || (canEdit && isEditing)) return;
        const gesture = touchGesture.current;
        touchGesture.current = null;
        suppressMouseUntil.current = Date.now() + 800;
        touchTapPending.current = gesture?.id === e.pointerId && gesture.axis === 'pending';
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (canEdit && isEditing) return;

        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openNumberEditor();
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
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

        // Use editIdentity (from context or DOM) so we open the editor with the same identity we use for pending edits
        let blockId = editIdentity?.blockId ?? blockIdFromContext ?? '';
        let elementPath = editIdentity?.elementPath ?? '';

        if (!elementPath) {
            const block = containerRef.current?.closest('[data-block-id]');
            blockId = blockId || block?.getAttribute('data-block-id') || '';
            elementPath = `scrubble-${blockId}-${inlineIdRef.current}`;
        }

        openScrubbleNumberEditor(
            {
                varName: effectiveVarName,
                defaultValue: effectiveDefaultValue,
                min: displayMin,
                max: displayMax,
                step: displayStep,
                color: effectiveColor,
                componentId: inlineIdRef.current,
            },
            blockId,
            elementPath
        );
    }, [editIdentity, blockIdFromContext, effectiveVarName, effectiveDefaultValue, displayMin, displayMax, displayStep, effectiveColor, openScrubbleNumberEditor, varName, defaultValue]);

    // Preserve desktop mouse dragging; touch gestures use pointer events above.
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging) return;

            const deltaX = e.clientX - dragStartX.current;
            const sensitivity = 2; // pixels per step
            const deltaValue = Math.round(deltaX / sensitivity) * displayStep;
            updateValueRef.current(dragStartValue.current + deltaValue);
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

    // Serialize essential props as a base64-encoded data attribute so extractContentWithMarkers
    // can preserve them during round-trip re-rendering (base64 is HTML-attribute-safe)
    const componentProps = (() => {
        const json = JSON.stringify({
            varName: effectiveVarName,
            defaultValue: effectiveDefaultValue,
            min: displayMin,
            max: displayMax,
            step: displayStep,
            color: effectiveColor,
        });
        try { return encodeMarkerJson(json); } catch { return ''; }
    })();

    return (
        <span
            ref={containerRef}
            contentEditable={false}
            data-inline-component="inlineScrubbleNumber"
            data-component-id={inlineIdRef.current}
            data-component-props={componentProps}
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
                        backgroundColor: `${effectiveColor}20`,
                    }}
                >
                    <div
                        className="h-full rounded-full transition-all duration-200"
                        style={{
                            width: `${progress}%`,
                            backgroundColor: effectiveColor,
                        }}
                    />
                </motion.div>
            )}

            {/* The anchor stays inline; the controls live in a portal. */}
            <Popover open={numberEditorOpen} onOpenChange={setNumberEditorOpen}>
            <PopoverAnchor asChild>
            <span
                ref={numberAnchorRef}
                onMouseDown={handleMouseDown}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={() => { touchGesture.current = null; touchTapPending.current = false; }}
                onLostPointerCapture={() => { touchGesture.current = null; }}
                role="spinbutton"
                aria-label={effectiveVarName || 'Adjust number'}
                aria-valuenow={value}
                aria-valuemin={displayMin}
                aria-valuemax={displayMax}
                onClick={e => {
                    if (canEdit && isEditing) { e.stopPropagation(); e.preventDefault(); return; }
                    // Open after the touch's compatibility click, so focus on
                    // the anchor cannot immediately dismiss the new popover.
                    if (touchTapPending.current) {
                        touchTapPending.current = false;
                        openNumberEditor();
                    }
                }}
                onKeyDown={handleKeyDown}
                tabIndex={0}
                className={cn(
                    "select-none font-medium transition-all duration-150 [@media(pointer:coarse)]:inline-flex [@media(pointer:coarse)]:min-h-8 [@media(pointer:coarse)]:min-w-8 [@media(pointer:coarse)]:items-center [@media(pointer:coarse)]:justify-center",
                    !(canEdit && isEditing) && "cursor-ew-resize",
                    canEdit && isEditing && "cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20 rounded px-0.5 -mx-0.5"
                )}
                style={{
                    color: effectiveColor,
                    textDecoration: 'underline',
                    textDecorationColor: effectiveColor,
                    textDecorationThickness: '2px',
                    textUnderlineOffset: '2px',
                    touchAction: 'pan-y pinch-zoom', // Keep native scrolling and zooming.
                }}
            >
                {formatValue ? formatValue(value) : Number(value.toFixed(2))}
            </span>

            </PopoverAnchor>
            <PopoverContent role="dialog" aria-label="Adjust number" className="w-64 max-w-[calc(100vw-24px)] p-3"
                onOpenAutoFocus={e => e.preventDefault()}
                onInteractOutside={() => { restoreNumberFocus.current = false; }}
                onCloseAutoFocus={e => {
                    // This inline control uses Anchor rather than Trigger, so
                    // Radix has no trigger ref to restore after Done or Escape.
                    // Outside interactions must keep their chosen focus target.
                    e.preventDefault();
                    if (restoreNumberFocus.current) numberAnchorRef.current?.focus({ preventScroll: true });
                }}>
                <form onSubmit={e => {
                    e.preventDefault();
                    const next = Number(numberDraft);
                    if (numberDraft.trim() && Number.isFinite(next)) {
                        updateValue(next);
                        setNumberEditorOpen(false);
                    }
                }}>
                    <label className="mb-2 block text-sm">Number value
                        <input aria-label="Number value" type="number" inputMode={displayMin < 0 ? 'text' : 'decimal'} required min={displayMin} max={displayMax} step={displayStep} value={numberDraft} onChange={e => setNumberDraft(e.target.value)} className="mt-1 h-11 w-full rounded border bg-background px-2 text-base" />
                    </label>
                    <div className="flex gap-2">
                        <button type="button" aria-label="Decrease number" disabled={value <= displayMin} onClick={decrement} className="h-11 flex-1 rounded border disabled:opacity-40">−</button>
                        <button type="button" aria-label="Increase number" disabled={value >= displayMax} onClick={increment} className="h-11 flex-1 rounded border disabled:opacity-40">+</button>
                        <button type="submit" className="h-11 flex-1 rounded bg-primary text-primary-foreground">Done</button>
                    </div>
                </form>
            </PopoverContent>
            </Popover>

            {/* Edit button - appears on hover in edit mode */}
            {canEdit && isEditing && isHovered && (
                <button
                    onClick={handleEditClick}
                    className="absolute -top-2 -right-4 w-5 h-5 rounded-full shadow-lg flex items-center justify-center text-xs hover:opacity-90 transition-all duration-150 z-10"
                    style={{
                        backgroundColor: effectiveColor,
                        color: 'white',
                    }}
                    title="Edit scrubbable number"
                >
                    <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                </button>
            )}

            {/* Interaction Hint - shows for first instance only */}
            <HintIcon type="scrubble-number" visible={hintVisible} isEditing={isEditing} />
        </span>
    );
};

export default InlineScrubbleNumber;
