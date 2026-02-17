import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useVar, useSetVar } from '@/stores/variableStore';
import { cn } from '@/lib/utils';
import { useEditing } from '@/contexts/EditingContext';
import { useAppMode } from '@/contexts/AppModeContext';
import { useBlockContext } from '@/contexts/BlockContext';

interface InlineClozeChoiceProps {
    /** Unique identifier for this component instance */
    id?: string;
    /** Variable name in the shared store (stores student's selected answer) */
    varName?: string;
    /** The correct answer */
    correctAnswer: string;
    /** Array of options to choose from */
    options: string[];
    /** Optional placeholder text (default: "???") */
    placeholder?: string;
    /** Optional color for the button and dropdown (default: blue) */
    color?: string;
    /** Optional background color (supports RGBA for transparency) */
    bgColor?: string;
    /** Optional callback when selection changes */
    onChange?: (value: string, isCorrect: boolean) => void;
}

/**
 * InlineClozeChoice Component
 *
 * An interactive dropdown choice (cloze) with variable store integration
 * and full editing support. Mirrors the InlineClozeInput architecture
 * but uses a dropdown instead of a text input.
 *
 * Features:
 * - Variable store integration via `varName` prop (stores student's selected option)
 * - Editor modal for configuring correct answer, options, placeholder, colors
 * - Pending edits support for teacher workflow
 * - Slash command insertion via /choice
 * - Validates selection against correct answer
 *
 * @example Variable store mode
 * ```tsx
 * <p>
 *   The shape is a{" "}
 *   <InlineClozeChoice
 *     varName="shapeAnswer"
 *     correctAnswer="circle"
 *     options={["cube", "circle", "square"]}
 *     {...choicePropsFromDefinition(getVariableInfo('shapeAnswer'))}
 *   />{" "}
 *   in 2D.
 * </p>
 * ```
 */
export const InlineClozeChoice: React.FC<InlineClozeChoiceProps> = ({
    id,
    varName,
    correctAnswer,
    options,
    placeholder = "???",
    color = "#3B82F6",
    bgColor = "rgba(59, 130, 246, 0.35)",
    onChange,
}) => {
    const containerRef = useRef<HTMLSpanElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Editing support
    const { isEditor } = useAppMode();
    const { isEditing, openClozeChoiceEditor, pendingEdits } = useEditing();
    const { id: blockIdFromContext } = useBlockContext();

    const isStandalone = typeof window !== 'undefined' && window.self === window.top;
    const canEdit = isEditor || isStandalone;

    // Element identity for matching pending edits
    const [editIdentity, setEditIdentity] = useState<{ blockId: string; elementPath: string } | null>(null);

    useEffect(() => {
        if (blockIdFromContext) {
            const elementPath = `choice-${blockIdFromContext}-${varName ?? correctAnswer}`;
            setEditIdentity({ blockId: blockIdFromContext, elementPath });
            return;
        }
        if (!containerRef.current) return;

        const block = containerRef.current.closest('[data-block-id]');
        const blockId = block?.getAttribute('data-block-id') || '';
        const elementPath = `choice-${blockId}-${varName ?? correctAnswer}`;
        setEditIdentity({ blockId, elementPath });
    }, [blockIdFromContext, varName, correctAnswer]);

    // Check for pending edits
    const pendingEdit = useMemo(() => {
        if (!editIdentity || (!isEditing && !canEdit)) return null;

        const { blockId, elementPath } = editIdentity;

        const edit = [...pendingEdits].reverse().find(e =>
            e.type === 'clozeChoice' &&
            (e as any).blockId === blockId &&
            (e as any).elementPath === elementPath
        );

        return edit as { newProps: { varName?: string; correctAnswer?: string; options?: string[]; placeholder?: string; color?: string; bgColor?: string } } | null;
    }, [isEditing, canEdit, pendingEdits, editIdentity]);

    // Effective prop values (pending edits override)
    const effectiveVarName = pendingEdit ? pendingEdit.newProps.varName : varName;
    const effectiveCorrectAnswer = pendingEdit?.newProps.correctAnswer ?? correctAnswer;
    const effectiveOptions = pendingEdit?.newProps.options ?? options;
    const effectivePlaceholder = pendingEdit?.newProps.placeholder ?? placeholder;
    const effectiveColor = pendingEdit?.newProps.color ?? color;
    const effectiveBgColor = pendingEdit?.newProps.bgColor ?? bgColor;

    // Variable store: stores the student's selected answer
    const storeValue = useVar(effectiveVarName || '', '');
    const setVar = useSetVar();

    // Local state for component without varName
    const [localValue, setLocalValue] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    // Determine which value to use
    const usesVarStore = effectiveVarName !== undefined;
    const selectedValue = usesVarStore ? (storeValue as string || null) : localValue;

    const setSelectedValue = useCallback((val: string | null) => {
        if (usesVarStore && effectiveVarName) {
            setVar(effectiveVarName, val ?? '');
        } else {
            setLocalValue(val);
        }
    }, [usesVarStore, effectiveVarName, setVar]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    // Stable ID and serialized props for round-trip extraction (base64 for HTML attribute safety)
    const inlineIdRef = useRef(id || varName || `choice-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`);
    const componentProps = useMemo(() => {
        const json = JSON.stringify({
            varName: effectiveVarName,
            correctAnswer: effectiveCorrectAnswer,
            options: effectiveOptions,
            placeholder: effectivePlaceholder,
            color: effectiveColor,
            bgColor: effectiveBgColor,
        });
        try { return btoa(json); } catch { return ''; }
    }, [effectiveVarName, effectiveCorrectAnswer, effectiveOptions, effectivePlaceholder, effectiveColor, effectiveBgColor]);

    const handleEditClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();

        let blockId = editIdentity?.blockId ?? blockIdFromContext ?? '';
        let elementPath = editIdentity?.elementPath ?? '';

        if (!elementPath) {
            const block = containerRef.current?.closest('[data-block-id]');
            blockId = blockId || block?.getAttribute('data-block-id') || '';
            elementPath = `choice-${blockId}-${varName ?? correctAnswer}`;
        }

        openClozeChoiceEditor(
            {
                varName: effectiveVarName,
                correctAnswer: effectiveCorrectAnswer,
                options: effectiveOptions,
                placeholder: effectivePlaceholder,
                color: effectiveColor,
                bgColor: effectiveBgColor,
            },
            blockId,
            elementPath
        );
    }, [editIdentity, blockIdFromContext, effectiveVarName, effectiveCorrectAnswer, effectiveOptions, effectivePlaceholder, effectiveColor, effectiveBgColor, openClozeChoiceEditor, varName, correctAnswer]);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (canEdit && isEditing) {
            handleEditClick(e);
            return;
        }
    };

    const handleSelect = (option: string) => {
        const correct = option === effectiveCorrectAnswer;
        setSelectedValue(option);
        setIsCorrect(correct);
        setIsOpen(false);
        onChange?.(option, correct);
    };

    const handleClear = () => {
        setSelectedValue(null);
        setIsCorrect(false);
    };

    // Wrapper props for round-trip extraction
    const wrapperProps = {
        'data-inline-component': 'inlineClozeChoice' as const,
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
                    className="px-1 rounded font-medium cursor-pointer hover:opacity-80"
                    style={{
                        backgroundColor: effectiveBgColor,
                        color: effectiveColor,
                    }}
                >
                    {effectivePlaceholder} &#x25BE;
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
                        title="Edit cloze choice"
                    >
                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                    </button>
                )}
            </span>
        );
    }

    // Preview mode: correct answer shown
    if (isCorrect && selectedValue) {
        return (
            <span ref={containerRef} {...wrapperProps}>
                <span
                    className="font-medium px-0.5 rounded"
                    style={{ color: effectiveColor }}
                >
                    {selectedValue}
                </span>
            </span>
        );
    }

    // Preview mode: incorrect answer with clear button
    if (selectedValue && !isCorrect) {
        return (
            <span ref={containerRef} {...wrapperProps}>
                <span
                    className="inline-flex items-center rounded font-medium"
                    style={{ backgroundColor: effectiveBgColor }}
                >
                    <span className="px-1" style={{ color: effectiveColor }}>
                        {selectedValue}
                    </span>
                    <button
                        onClick={handleClear}
                        className="inline-flex items-center justify-center px-0.5 transition-all hover:scale-110"
                        style={{ color: '#EF4444' }}
                        aria-label="Clear selection"
                    >
                        <X className="w-3 h-3" />
                    </button>
                </span>
            </span>
        );
    }

    // Preview mode: initial dropdown state
    return (
        <span ref={containerRef} {...wrapperProps}>
            <span className="inline-block relative" ref={dropdownRef}>
                <button
                    onClick={() => !isEditing && setIsOpen(!isOpen)}
                    onMouseDown={handleMouseDown}
                    className="px-1 rounded font-medium transition-all hover:opacity-80 backdrop-blur-sm"
                    style={{
                        backgroundColor: effectiveBgColor,
                        color: effectiveColor,
                    }}
                >
                    {effectivePlaceholder} &#x25BE;
                </button>

                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -8, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -8, scale: 0.95 }}
                            transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
                            className="absolute top-full left-0 mt-1 rounded-lg shadow-lg overflow-hidden z-50 min-w-[140px] backdrop-blur-sm"
                            style={{
                                backgroundColor: effectiveBgColor.replace(/[\d.]+\)/, '0.75)'),
                            }}
                        >
                            {effectiveOptions.map((option, index) => (
                                <button
                                    key={option}
                                    onClick={() => handleSelect(option)}
                                    className="w-full text-left px-2 py-1 transition-all text-sm font-medium"
                                    style={{
                                        color: 'white',
                                        borderBottom: index !== effectiveOptions.length - 1 ? '1px solid rgba(255, 255, 255, 0.2)' : 'none',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                    }}
                                >
                                    {option}
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </span>
        </span>
    );
};

export default InlineClozeChoice;
