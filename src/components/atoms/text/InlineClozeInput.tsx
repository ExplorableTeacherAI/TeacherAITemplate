import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { X } from 'lucide-react';
import { useVar, useSetVar } from '@/stores/variableStore';
import { cn } from '@/lib/utils';
import { useEditing } from '@/contexts/EditingContext';
import { useAppMode } from '@/contexts/AppModeContext';
import { useBlockContext } from '@/contexts/BlockContext';

interface InlineClozeInputProps {
    /** Unique identifier for this component instance */
    id?: string;
    /** Variable name in the shared store (stores student's typed answer) */
    varName?: string;
    /** The correct answer */
    correctAnswer: string;
    /** Optional placeholder text (default: "???") */
    placeholder?: string;
    /** Optional color for the input and text (default: blue) */
    color?: string;
    /** Optional background color (supports RGBA for transparency) */
    bgColor?: string;
    /** Optional case sensitive checking (default: false) */
    caseSensitive?: boolean;
    /** Optional callback when answer is validated */
    onChange?: (value: string, isCorrect: boolean) => void;
    /** When true, skip editor-mode rendering (used inside FormulaBlock portals) */
    disableEditing?: boolean;
}

/**
 * InlineClozeInput Component
 *
 * An interactive fill-in-the-blank (cloze) input with variable store integration
 * and full editing support. Mirrors the InlineScrubbleNumber architecture.
 *
 * Features:
 * - Variable store integration via `varName` prop (stores student's typed text)
 * - Editor modal for configuring correct answer, placeholder, colors, etc.
 * - Pending edits support for teacher workflow
 * - Slash command insertion via /cloze
 * - Auto-validates as student types
 *
 * @example Variable store mode
 * ```tsx
 * <p>
 *   A quarter circle is{" "}
 *   <InlineClozeInput
 *     varName="quarterCircleAngle"
 *     correctAnswer="90"
 *     {...clozePropsFromDefinition(getVariableInfo('quarterCircleAngle'))}
 *   />{" "}
 *   degrees.
 * </p>
 * ```
 */
export const InlineClozeInput: React.FC<InlineClozeInputProps> = ({
    id,
    varName,
    correctAnswer,
    placeholder = "???",
    color = "#3B82F6",
    bgColor = "rgba(59, 130, 246, 0.35)",
    caseSensitive = false,
    onChange,
    disableEditing = false,
}) => {
    const containerRef = useRef<HTMLSpanElement>(null);

    // Editing support
    const { isEditor } = useAppMode();
    const { isEditing, openClozeInputEditor, pendingEdits } = useEditing();
    const { id: blockIdFromContext } = useBlockContext();

    const isStandalone = typeof window !== 'undefined' && window.self === window.top;
    const canEdit = isEditor || isStandalone;

    // Element identity for matching pending edits
    const [editIdentity, setEditIdentity] = useState<{ blockId: string; elementPath: string } | null>(null);

    useEffect(() => {
        if (blockIdFromContext) {
            const elementPath = `cloze-${blockIdFromContext}-${varName ?? correctAnswer}`;
            setEditIdentity({ blockId: blockIdFromContext, elementPath });
            return;
        }
        if (!containerRef.current) return;

        const block = containerRef.current.closest('[data-block-id]');
        const blockId = block?.getAttribute('data-block-id') || '';
        const elementPath = `cloze-${blockId}-${varName ?? correctAnswer}`;
        setEditIdentity({ blockId, elementPath });
    }, [blockIdFromContext, varName, correctAnswer]);

    // Check for pending edits
    const pendingEdit = useMemo(() => {
        if (!editIdentity || (!isEditing && !canEdit)) return null;

        const { blockId, elementPath } = editIdentity;

        const edit = [...pendingEdits].reverse().find(e =>
            e.type === 'clozeInput' &&
            (e as any).blockId === blockId &&
            (e as any).elementPath === elementPath
        );

        return edit as { newProps: { varName?: string; correctAnswer?: string; placeholder?: string; color?: string; bgColor?: string; caseSensitive?: boolean } } | null;
    }, [isEditing, canEdit, pendingEdits, editIdentity]);

    // Effective prop values (pending edits override)
    const effectiveVarName = pendingEdit ? pendingEdit.newProps.varName : varName;
    const effectiveCorrectAnswer = pendingEdit?.newProps.correctAnswer ?? correctAnswer;
    const effectivePlaceholder = pendingEdit?.newProps.placeholder ?? placeholder;
    const effectiveColor = pendingEdit?.newProps.color ?? color;
    const effectiveBgColor = pendingEdit?.newProps.bgColor ?? bgColor;
    const effectiveCaseSensitive = pendingEdit?.newProps.caseSensitive ?? caseSensitive;

    // Variable store: stores the student's typed answer
    const storeValue = useVar(effectiveVarName || '', '');
    const setVar = useSetVar();

    // Local state for component without varName
    const [localValue, setLocalValue] = useState('');
    const [isInputting, setIsInputting] = useState(false);
    const [isChecked, setIsChecked] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Determine which value to use
    const usesVarStore = effectiveVarName !== undefined;
    const inputValue = usesVarStore ? (storeValue as string) : localValue;

    const setInputValue = useCallback((val: string) => {
        if (usesVarStore && effectiveVarName) {
            setVar(effectiveVarName, val);
        } else {
            setLocalValue(val);
        }
    }, [usesVarStore, effectiveVarName, setVar]);

    // Focus input when entering edit mode
    useEffect(() => {
        if (isInputting && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isInputting]);

    // Stable ID and serialized props for round-trip extraction (base64 for HTML attribute safety)
    const inlineIdRef = useRef(id || varName || `cloze-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`);
    const componentProps = useMemo(() => {
        const json = JSON.stringify({
            varName: effectiveVarName,
            correctAnswer: effectiveCorrectAnswer,
            placeholder: effectivePlaceholder,
            color: effectiveColor,
            bgColor: effectiveBgColor,
            caseSensitive: effectiveCaseSensitive,
        });
        try { return btoa(json); } catch { return ''; }
    }, [effectiveVarName, effectiveCorrectAnswer, effectivePlaceholder, effectiveColor, effectiveBgColor, effectiveCaseSensitive]);

    const handleEditClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();

        let blockId = editIdentity?.blockId ?? blockIdFromContext ?? '';
        let elementPath = editIdentity?.elementPath ?? '';

        if (!elementPath) {
            const block = containerRef.current?.closest('[data-block-id]');
            blockId = blockId || block?.getAttribute('data-block-id') || '';
            elementPath = `cloze-${blockId}-${varName ?? correctAnswer}`;
        }

        openClozeInputEditor(
            {
                varName: effectiveVarName,
                correctAnswer: effectiveCorrectAnswer,
                placeholder: effectivePlaceholder,
                color: effectiveColor,
                bgColor: effectiveBgColor,
                caseSensitive: effectiveCaseSensitive,
            },
            blockId,
            elementPath
        );
    }, [editIdentity, blockIdFromContext, effectiveVarName, effectiveCorrectAnswer, effectivePlaceholder, effectiveColor, effectiveBgColor, effectiveCaseSensitive, openClozeInputEditor, varName, correctAnswer]);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (canEdit && isEditing && !disableEditing) {
            handleEditClick(e);
            return;
        }
    };

    const handleClick = () => {
        if (canEdit && isEditing && !disableEditing) return;
        if (!isCorrect && !isChecked) {
            setIsInputting(true);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInputValue(value);

        // Auto-check the answer as user types
        const userAnswer = effectiveCaseSensitive ? value : value.toLowerCase();
        const correctAns = effectiveCaseSensitive ? effectiveCorrectAnswer : effectiveCorrectAnswer.toLowerCase();

        if (userAnswer.trim() === correctAns.trim()) {
            setIsCorrect(true);
            setIsChecked(true);
            setIsInputting(false);
            onChange?.(value, true);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            checkAnswer();
        } else if (e.key === 'Escape') {
            setIsInputting(false);
            if (!isChecked) {
                setInputValue('');
            }
        }
    };

    const checkAnswer = () => {
        const userAnswer = effectiveCaseSensitive ? inputValue : inputValue.toLowerCase();
        const correctAns = effectiveCaseSensitive ? effectiveCorrectAnswer : effectiveCorrectAnswer.toLowerCase();

        const correct = userAnswer.trim() === correctAns.trim();
        setIsCorrect(correct);
        setIsChecked(true);
        setIsInputting(false);
        onChange?.(inputValue, correct);
    };

    const handleClear = () => {
        setInputValue('');
        setIsChecked(false);
        setIsCorrect(false);
        setIsInputting(false);
    };

    const handleBlur = () => {
        if (inputValue.trim() === '') {
            setIsInputting(false);
        }
    };

    // Wrapper props for round-trip extraction
    const wrapperProps = {
        'data-inline-component': 'inlineClozeInput' as const,
        'data-component-id': inlineIdRef.current,
        'data-component-props': componentProps,
        contentEditable: false as const,
    };

    // Editor mode rendering
    if (canEdit && isEditing && !disableEditing) {
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
                    className={cn(
                        "select-none font-medium transition-all duration-150",
                        "cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20 rounded px-0.5 -mx-0.5"
                    )}
                    style={{
                        color: effectiveColor,
                        borderBottom: `2px dotted ${effectiveColor}`,
                        paddingBottom: '1px',
                    }}
                >
                    {effectivePlaceholder}
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
                        title="Edit cloze input"
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
    if (isCorrect && inputValue) {
        return (
            <span ref={containerRef} {...wrapperProps}>
                <span
                    className="font-medium"
                    style={{
                        color: effectiveColor,
                        borderBottom: `2px solid ${effectiveColor}`,
                        paddingBottom: '1px',
                    }}
                >
                    {inputValue}
                </span>
            </span>
        );
    }

    // Preview mode: incorrect answer with clear button
    if (isChecked && !isCorrect && inputValue) {
        return (
            <span ref={containerRef} {...wrapperProps}>
                <span
                    className="inline-flex items-center font-medium"
                    style={{
                        color: effectiveColor,
                        borderBottom: `2px solid #EF4444`,
                        paddingBottom: '1px',
                    }}
                >
                    <span style={{ color: effectiveColor }}>
                        {inputValue}
                    </span>
                    <button
                        onClick={handleClear}
                        className="inline-flex items-center justify-center ml-0.5 transition-colors duration-150 hover:opacity-80"
                        style={{ color: '#EF4444' }}
                        aria-label="Clear input"
                    >
                        <X className="w-3 h-3" />
                    </button>
                </span>
            </span>
        );
    }

    // Preview mode: input field active
    if (isInputting) {
        return (
            <span ref={containerRef} {...wrapperProps}>
                <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    onBlur={handleBlur}
                    className="font-medium outline-none"
                    style={{
                        color: effectiveColor,
                        background: 'transparent',
                        border: 'none',
                        borderBottomStyle: 'solid',
                        borderBottomWidth: '2px',
                        borderBottomColor: effectiveColor,
                        font: 'inherit',
                        fontSize: 'inherit',
                        lineHeight: 'inherit',
                        padding: 0,
                        paddingBottom: '1px',
                        minWidth: '2.5em',
                        width: `${Math.max(2.5, (inputValue.length + 1) * 0.6)}em`,
                    }}
                    placeholder={effectivePlaceholder}
                />
            </span>
        );
    }

    // Preview mode: initial button state
    return (
        <span
            ref={containerRef}
            {...wrapperProps}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <span
                onClick={handleClick}
                onMouseDown={handleMouseDown}
                className="select-none font-medium cursor-pointer transition-all duration-150"
                style={{
                    color: effectiveColor,
                    borderBottom: `2px dotted ${effectiveColor}`,
                    paddingBottom: '1px',
                    background: isHovered ? effectiveBgColor : 'transparent',
                    borderRadius: isHovered ? '3px 3px 0 0' : '0',
                }}
                tabIndex={0}
                role="button"
            >
                {effectivePlaceholder}
            </span>
        </span>
    );
};

export default InlineClozeInput;
