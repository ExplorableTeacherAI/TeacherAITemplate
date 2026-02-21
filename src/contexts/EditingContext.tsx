import { createContext, useContext, useState, useCallback, useMemo, useRef, useEffect, type ReactNode } from 'react';
import { useAppMode } from './AppModeContext';

// Edit types
export interface TextEdit {
    id: string;
    type: 'text';
    blockId: string;
    elementPath: string;
    originalText: string;
    originalHtml?: string;
    newText: string;
    newHtml?: string;
    timestamp: number;
}

export interface ScrubbleNumberEdit {
    id: string;
    type: 'scrubbleNumber';
    blockId: string;
    elementPath: string;
    originalProps: ScrubbleNumberProps;
    newProps: ScrubbleNumberProps;
    timestamp: number;
}

export interface ScrubbleNumberProps {
    varName?: string;
    defaultValue?: number;
    min?: number;
    max?: number;
    step?: number;
    color?: string;
}

export interface ClozeInputEdit {
    id: string;
    type: 'clozeInput';
    blockId: string;
    elementPath: string;
    originalProps: ClozeInputProps;
    newProps: ClozeInputProps;
    timestamp: number;
}

export interface ClozeInputProps {
    varName?: string;
    correctAnswer?: string;
    placeholder?: string;
    color?: string;
    bgColor?: string;
    caseSensitive?: boolean;
}

export interface ClozeChoiceEdit {
    id: string;
    type: 'clozeChoice';
    blockId: string;
    elementPath: string;
    originalProps: ClozeChoiceProps;
    newProps: ClozeChoiceProps;
    timestamp: number;
}

export interface ClozeChoiceProps {
    varName?: string;
    correctAnswer?: string;
    options?: string[];
    placeholder?: string;
    color?: string;
    bgColor?: string;
}

export interface ToggleEdit {
    id: string;
    type: 'toggle';
    blockId: string;
    elementPath: string;
    originalProps: ToggleProps;
    newProps: ToggleProps;
    timestamp: number;
}

export interface ToggleProps {
    varName?: string;
    options?: string[];
    color?: string;
    bgColor?: string;
}

export interface TooltipProps {
    text?: string;       // The trigger text (children content)
    tooltip?: string;    // The tooltip/definition content
    color?: string;
    bgColor?: string;
    position?: string;   // 'top' | 'bottom' | 'auto'
    maxWidth?: number;
}

export interface TooltipEdit {
    id: string;
    type: 'tooltip';
    blockId: string;
    elementPath: string;
    originalProps: TooltipProps;
    newProps: TooltipProps;
    timestamp: number;
}

export interface TriggerComponentProps {
    text?: string;
    varName?: string;
    value?: string | number | boolean;
    color?: string;
    bgColor?: string;
    icon?: string;
}

export interface TriggerComponentEdit {
    id: string;
    type: 'trigger';
    blockId: string;
    elementPath: string;
    originalProps: TriggerComponentProps;
    newProps: TriggerComponentProps;
    timestamp: number;
}

export interface HyperlinkComponentProps {
    text?: string;
    href?: string;
    targetBlockId?: string;
    color?: string;
    bgColor?: string;
}

export interface HyperlinkComponentEdit {
    id: string;
    type: 'hyperlink';
    blockId: string;
    elementPath: string;
    originalProps: HyperlinkComponentProps;
    newProps: HyperlinkComponentProps;
    timestamp: number;
}

export interface InlineFormulaProps {
    latex?: string;
    colorMap?: Record<string, string>;
    color?: string;       // wrapper text color (default: #000000 black)
}

export interface InlineFormulaEdit {
    id: string;
    type: 'inlineFormula';
    blockId: string;
    elementPath: string;
    originalProps: InlineFormulaProps;
    newProps: InlineFormulaProps;
    timestamp: number;
}

export interface SpotColorComponentProps {
    varName?: string;
    text?: string;
    color?: string;
}

export interface SpotColorEdit {
    id: string;
    type: 'spotColor';
    blockId: string;
    elementPath: string;
    originalProps: SpotColorComponentProps;
    newProps: SpotColorComponentProps;
    timestamp: number;
}

export interface LinkedHighlightComponentProps {
    varName?: string;
    highlightId?: string;
    text?: string;
    color?: string;
    bgColor?: string;
}

export interface LinkedHighlightEdit {
    id: string;
    type: 'linkedHighlight';
    blockId: string;
    elementPath: string;
    originalProps: LinkedHighlightComponentProps;
    newProps: LinkedHighlightComponentProps;
    timestamp: number;
}

export interface FormulaBlockComponentProps {
    latex?: string;
    colorMap?: Record<string, string>;
    variables?: Record<string, { min: number; max: number; step: number; color: string }>;
    clozeInputs?: Record<string, { correctAnswer: string; placeholder?: string; color?: string; bgColor?: string; caseSensitive?: boolean }>;
    clozeChoices?: Record<string, { correctAnswer: string; options: string[]; placeholder?: string; color?: string; bgColor?: string }>;
    linkedHighlights?: Record<string, { varName: string; color?: string; bgColor?: string }>;
    color?: string;
    isNew?: boolean;
}

export interface FormulaBlockEdit {
    id: string;
    type: 'formulaBlock';
    blockId: string;
    elementPath: string;
    originalProps: FormulaBlockComponentProps;
    newProps: FormulaBlockComponentProps;
    timestamp: number;
}

export interface StructureEdit {
    id: string;
    type: 'structure';
    action: 'reorder' | 'delete' | 'add';
    blockId?: string;
    blockIds?: string[];
    content?: string;
    blockType?: string;
    afterBlockId?: string;
    timestamp: number;
}

export type PendingEdit = TextEdit | ScrubbleNumberEdit | ClozeInputEdit | ClozeChoiceEdit | ToggleEdit | TooltipEdit | TriggerComponentEdit | HyperlinkComponentEdit | InlineFormulaEdit | SpotColorEdit | LinkedHighlightEdit | FormulaBlockEdit | StructureEdit;

interface EditingContextType {
    // State
    isEditing: boolean;
    pendingEdits: PendingEdit[];
    editingScrubbleNumber: (ScrubbleNumberProps & { blockId: string; elementPath: string }) | null;
    editingClozeInput: (ClozeInputProps & { blockId: string; elementPath: string }) | null;
    editingClozeChoice: (ClozeChoiceProps & { blockId: string; elementPath: string }) | null;
    editingToggle: (ToggleProps & { blockId: string; elementPath: string }) | null;
    editingTooltip: (TooltipProps & { blockId: string; elementPath: string }) | null;
    editingTrigger: (TriggerComponentProps & { blockId: string; elementPath: string }) | null;
    editingHyperlink: (HyperlinkComponentProps & { blockId: string; elementPath: string }) | null;
    editingInlineFormula: (InlineFormulaProps & { blockId: string; elementPath: string }) | null;
    editingSpotColor: (SpotColorComponentProps & { blockId: string; elementPath: string }) | null;
    editingLinkedHighlight: (LinkedHighlightComponentProps & { blockId: string; elementPath: string }) | null;
    editingFormulaBlock: (FormulaBlockComponentProps & { blockId: string; elementPath: string }) | null;

    // Actions
    enableEditing: () => void;
    disableEditing: () => void;
    addTextEdit: (edit: Omit<TextEdit, 'id' | 'type' | 'timestamp'>) => void;
    addScrubbleNumberEdit: (edit: Omit<ScrubbleNumberEdit, 'id' | 'type' | 'timestamp'>) => void;
    addClozeInputEdit: (edit: Omit<ClozeInputEdit, 'id' | 'type' | 'timestamp'>) => void;
    addClozeChoiceEdit: (edit: Omit<ClozeChoiceEdit, 'id' | 'type' | 'timestamp'>) => void;
    addToggleEdit: (edit: Omit<ToggleEdit, 'id' | 'type' | 'timestamp'>) => void;
    addTooltipEdit: (edit: Omit<TooltipEdit, 'id' | 'type' | 'timestamp'>) => void;
    addTriggerEdit: (edit: Omit<TriggerComponentEdit, 'id' | 'type' | 'timestamp'>) => void;
    addStructureEdit: (edit: Omit<StructureEdit, 'id' | 'type' | 'timestamp'>) => void;
    removeEdit: (id: string) => void;
    clearAllEdits: () => void;
    openScrubbleNumberEditor: (props: ScrubbleNumberProps, blockId: string, elementPath: string) => void;
    closeScrubbleNumberEditor: () => void;
    saveScrubbleNumberEdit: (newProps: ScrubbleNumberProps) => void;
    openClozeInputEditor: (props: ClozeInputProps, blockId: string, elementPath: string) => void;
    closeClozeInputEditor: () => void;
    saveClozeInputEdit: (newProps: ClozeInputProps) => void;
    openClozeChoiceEditor: (props: ClozeChoiceProps, blockId: string, elementPath: string) => void;
    closeClozeChoiceEditor: () => void;
    saveClozeChoiceEdit: (newProps: ClozeChoiceProps) => void;
    openToggleEditor: (props: ToggleProps, blockId: string, elementPath: string) => void;
    closeToggleEditor: () => void;
    saveToggleEdit: (newProps: ToggleProps) => void;
    openTooltipEditor: (props: TooltipProps, blockId: string, elementPath: string) => void;
    closeTooltipEditor: () => void;
    saveTooltipEdit: (newProps: TooltipProps) => void;
    openTriggerEditor: (props: TriggerComponentProps, blockId: string, elementPath: string) => void;
    closeTriggerEditor: () => void;
    saveTriggerEdit: (newProps: TriggerComponentProps) => void;
    addHyperlinkEdit: (edit: Omit<HyperlinkComponentEdit, 'id' | 'type' | 'timestamp'>) => void;
    openHyperlinkEditor: (props: HyperlinkComponentProps, blockId: string, elementPath: string) => void;
    closeHyperlinkEditor: () => void;
    saveHyperlinkEdit: (newProps: HyperlinkComponentProps) => void;
    addInlineFormulaEdit: (edit: Omit<InlineFormulaEdit, 'id' | 'type' | 'timestamp'>) => void;
    openInlineFormulaEditor: (props: InlineFormulaProps, blockId: string, elementPath: string) => void;
    closeInlineFormulaEditor: () => void;
    saveInlineFormulaEdit: (newProps: InlineFormulaProps) => void;
    addSpotColorEdit: (edit: Omit<SpotColorEdit, 'id' | 'type' | 'timestamp'>) => void;
    openSpotColorEditor: (props: SpotColorComponentProps, blockId: string, elementPath: string) => void;
    closeSpotColorEditor: () => void;
    saveSpotColorEdit: (newProps: SpotColorComponentProps) => void;
    addLinkedHighlightEdit: (edit: Omit<LinkedHighlightEdit, 'id' | 'type' | 'timestamp'>) => void;
    openLinkedHighlightEditor: (props: LinkedHighlightComponentProps, blockId: string, elementPath: string) => void;
    closeLinkedHighlightEditor: () => void;
    saveLinkedHighlightEdit: (newProps: LinkedHighlightComponentProps) => void;
    addFormulaBlockEdit: (edit: Omit<FormulaBlockEdit, 'id' | 'type' | 'timestamp'>) => void;
    openFormulaBlockEditor: (props: FormulaBlockComponentProps, blockId: string, elementPath: string) => void;
    closeFormulaBlockEditor: () => void;
    saveFormulaBlockEdit: (newProps: FormulaBlockComponentProps) => void;
}

const EditingContext = createContext<EditingContextType | undefined>(undefined);

interface EditingProviderProps {
    children: ReactNode;
}

export const EditingProvider = ({ children }: EditingProviderProps) => {
    const { isEditor } = useAppMode();

    const [isEditing, setIsEditing] = useState(false);
    const [pendingEdits, setPendingEdits] = useState<PendingEdit[]>([]);
    const [editingScrubbleNumber, setEditingScrubbleNumber] = useState<(ScrubbleNumberProps & {
        blockId: string;
        elementPath: string;
    }) | null>(null);
    const [editingClozeInput, setEditingClozeInput] = useState<(ClozeInputProps & {
        blockId: string;
        elementPath: string;
    }) | null>(null);
    const [editingClozeChoice, setEditingClozeChoice] = useState<(ClozeChoiceProps & {
        blockId: string;
        elementPath: string;
    }) | null>(null);
    const [editingToggle, setEditingToggle] = useState<(ToggleProps & {
        blockId: string;
        elementPath: string;
    }) | null>(null);
    const [editingTooltip, setEditingTooltip] = useState<(TooltipProps & {
        blockId: string;
        elementPath: string;
    }) | null>(null);
    const [editingTrigger, setEditingTrigger] = useState<(TriggerComponentProps & {
        blockId: string;
        elementPath: string;
    }) | null>(null);
    const [editingHyperlink, setEditingHyperlink] = useState<(HyperlinkComponentProps & {
        blockId: string;
        elementPath: string;
    }) | null>(null);
    const [editingInlineFormula, setEditingInlineFormula] = useState<(InlineFormulaProps & {
        blockId: string;
        elementPath: string;
    }) | null>(null);
    const [editingSpotColor, setEditingSpotColor] = useState<(SpotColorComponentProps & {
        blockId: string;
        elementPath: string;
    }) | null>(null);
    const [editingLinkedHighlight, setEditingLinkedHighlight] = useState<(LinkedHighlightComponentProps & {
        blockId: string;
        elementPath: string;
    }) | null>(null);
    const [editingFormulaBlock, setEditingFormulaBlock] = useState<(FormulaBlockComponentProps & {
        blockId: string;
        elementPath: string;
    }) | null>(null);

    // Keep a ref of pending edits for event listeners to avoid stale closures
    const pendingEditsRef = useRef(pendingEdits);

    useEffect(() => {
        pendingEditsRef.current = pendingEdits;
    }, [pendingEdits]);

    // Generate unique ID for edits
    const generateId = useCallback(() => {
        return `edit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }, []);

    const enableEditing = useCallback(() => {
        // Allow enabling in editor mode OR in standalone mode for testing
        const isStandalone = typeof window !== 'undefined' && window.self === window.top;
        if (isEditor || isStandalone) {
            setIsEditing(true);
            // Notify parent that editing mode is enabled
            window.parent.postMessage({ type: 'editing-mode-changed', isEditing: true }, '*');
        }
    }, [isEditor]);

    const disableEditing = useCallback(() => {
        setIsEditing(false);
        // Notify parent that editing mode is disabled
        window.parent.postMessage({ type: 'editing-mode-changed', isEditing: false }, '*');
    }, []);

    const addTextEdit = useCallback((edit: Omit<TextEdit, 'id' | 'type' | 'timestamp'>) => {
        const newEdit: TextEdit = {
            ...edit,
            id: generateId(),
            type: 'text',
            timestamp: Date.now(),
        };

        setPendingEdits(prev => {
            // 1. Check if there is a pending STRUCTURE edit with action 'add' for this block
            // If so, we just update the content of that add structure edit
            const structureAddIndex = prev.findIndex(
                e => e.type === 'structure' &&
                    e.action === 'add' &&
                    (e as StructureEdit).blockId === edit.blockId
            );

            if (structureAddIndex !== -1) {
                const updated = [...prev];
                const existingStructure = updated[structureAddIndex] as StructureEdit;

                // Update the content of the structure edit
                updated[structureAddIndex] = {
                    ...existingStructure,
                    content: edit.newText,
                    timestamp: Date.now(),
                };
                return updated;
            }

            // 2. Check if there's already a TEXT edit for the same element
            const existingIndex = prev.findIndex(
                e => e.type === 'text' &&
                    (e as TextEdit).blockId === edit.blockId &&
                    e.elementPath === edit.elementPath
            );

            if (existingIndex !== -1) {
                // Update existing edit
                const updated = [...prev];
                const existing = updated[existingIndex] as TextEdit;

                // If new text matches original (and html if available), remove the edit
                const isReverted =
                    edit.newText === existing.originalText &&
                    (!edit.newHtml || !existing.originalHtml || edit.newHtml === existing.originalHtml);

                if (isReverted) {
                    updated.splice(existingIndex, 1);
                    return updated;
                }

                // Otherwise update the new text
                updated[existingIndex] = {
                    ...existing,
                    newText: edit.newText,
                    newHtml: edit.newHtml,
                    timestamp: Date.now(),
                };
                return updated;
            }

            // 3. Add new edit
            return [...prev, newEdit];
        });
    }, [generateId]);

    const addStructureEdit = useCallback((edit: Omit<StructureEdit, 'id' | 'type' | 'timestamp'>) => {
        setPendingEdits(prev => {
            // Check if there's already an 'add' structure edit for this blockId
            // This handles the case where we add a placeholder and then commit content to it
            if (edit.action === 'add') {
                const existingAddIndex = prev.findIndex(
                    e => e.type === 'structure' &&
                        e.action === 'add' &&
                        (e as StructureEdit).blockId === edit.blockId
                );

                if (existingAddIndex !== -1) {
                    const updated = [...prev];
                    const existing = updated[existingAddIndex] as StructureEdit;

                    // Update the existing add edit with new details (e.g. placeholder -> h1)
                    updated[existingAddIndex] = {
                        ...existing,
                        ...edit,
                        timestamp: Date.now(),
                    };
                    return updated;
                }
            }

            const newEdit: StructureEdit = {
                ...edit,
                id: generateId(),
                type: 'structure',
                timestamp: Date.now(),
            };
            return [...prev, newEdit];
        });
    }, [generateId]);

    const removeEdit = useCallback((id: string) => {
        setPendingEdits(prev => prev.filter(e => e.id !== id));
    }, []);

    const clearAllEdits = useCallback(() => {
        setPendingEdits([]);
    }, []);

    // Scrubble Number editing methods
    const addScrubbleNumberEdit = useCallback((edit: Omit<ScrubbleNumberEdit, 'id' | 'type' | 'timestamp'>) => {
        const newEdit: ScrubbleNumberEdit = {
            ...edit,
            id: generateId(),
            type: 'scrubbleNumber',
            timestamp: Date.now(),
        };

        setPendingEdits(prev => {
            // Check if there's already an edit for the same scrubble number
            const existingIndex = prev.findIndex(
                e => e.type === 'scrubbleNumber' &&
                    (e as ScrubbleNumberEdit).blockId === edit.blockId &&
                    (e as ScrubbleNumberEdit).elementPath === edit.elementPath
            );

            if (existingIndex !== -1) {
                // Update existing edit
                const updated = [...prev];
                const existing = updated[existingIndex] as ScrubbleNumberEdit;

                // If props match original, remove the edit
                const propsMatch = JSON.stringify(edit.newProps) === JSON.stringify(existing.originalProps);
                if (propsMatch) {
                    updated.splice(existingIndex, 1);
                    return updated;
                }

                // Otherwise update
                updated[existingIndex] = {
                    ...existing,
                    newProps: edit.newProps,
                    timestamp: Date.now(),
                };
                return updated;
            }

            return [...prev, newEdit];
        });
    }, [generateId]);

    const openScrubbleNumberEditor = useCallback((
        props: ScrubbleNumberProps,
        blockId: string,
        elementPath: string
    ) => {
        setEditingScrubbleNumber({ ...props, blockId, elementPath });
    }, []);

    const closeScrubbleNumberEditor = useCallback(() => {
        setEditingScrubbleNumber(null);
    }, []);

    const saveScrubbleNumberEdit = useCallback((newProps: ScrubbleNumberProps) => {
        if (!editingScrubbleNumber) return;

        const { blockId, elementPath, ...originalProps } = editingScrubbleNumber;

        // Check if any property changed
        const propsChanged = JSON.stringify(newProps) !== JSON.stringify(originalProps);

        if (propsChanged) {
            addScrubbleNumberEdit({
                blockId,
                elementPath,
                originalProps,
                newProps,
            });
        }

        setEditingScrubbleNumber(null);
    }, [editingScrubbleNumber, addScrubbleNumberEdit]);

    // Cloze Input editing methods
    const addClozeInputEdit = useCallback((edit: Omit<ClozeInputEdit, 'id' | 'type' | 'timestamp'>) => {
        const newEdit: ClozeInputEdit = {
            ...edit,
            id: generateId(),
            type: 'clozeInput',
            timestamp: Date.now(),
        };

        setPendingEdits(prev => {
            const existingIndex = prev.findIndex(
                e => e.type === 'clozeInput' &&
                    (e as ClozeInputEdit).blockId === edit.blockId &&
                    (e as ClozeInputEdit).elementPath === edit.elementPath
            );

            if (existingIndex !== -1) {
                const updated = [...prev];
                const existing = updated[existingIndex] as ClozeInputEdit;

                const propsMatch = JSON.stringify(edit.newProps) === JSON.stringify(existing.originalProps);
                if (propsMatch) {
                    updated.splice(existingIndex, 1);
                    return updated;
                }

                updated[existingIndex] = {
                    ...existing,
                    newProps: edit.newProps,
                    timestamp: Date.now(),
                };
                return updated;
            }

            return [...prev, newEdit];
        });
    }, [generateId]);

    const openClozeInputEditor = useCallback((
        props: ClozeInputProps,
        blockId: string,
        elementPath: string
    ) => {
        setEditingClozeInput({ ...props, blockId, elementPath });
    }, []);

    const closeClozeInputEditor = useCallback(() => {
        setEditingClozeInput(null);
    }, []);

    const saveClozeInputEdit = useCallback((newProps: ClozeInputProps) => {
        if (!editingClozeInput) return;

        const { blockId, elementPath, ...originalProps } = editingClozeInput;

        const propsChanged = JSON.stringify(newProps) !== JSON.stringify(originalProps);

        if (propsChanged) {
            addClozeInputEdit({
                blockId,
                elementPath,
                originalProps,
                newProps,
            });
        }

        setEditingClozeInput(null);
    }, [editingClozeInput, addClozeInputEdit]);

    // Cloze Choice editing methods
    const addClozeChoiceEdit = useCallback((edit: Omit<ClozeChoiceEdit, 'id' | 'type' | 'timestamp'>) => {
        const newEdit: ClozeChoiceEdit = {
            ...edit,
            id: generateId(),
            type: 'clozeChoice',
            timestamp: Date.now(),
        };

        setPendingEdits(prev => {
            const existingIndex = prev.findIndex(
                e => e.type === 'clozeChoice' &&
                    (e as ClozeChoiceEdit).blockId === edit.blockId &&
                    (e as ClozeChoiceEdit).elementPath === edit.elementPath
            );

            if (existingIndex !== -1) {
                const updated = [...prev];
                const existing = updated[existingIndex] as ClozeChoiceEdit;

                const propsMatch = JSON.stringify(edit.newProps) === JSON.stringify(existing.originalProps);
                if (propsMatch) {
                    updated.splice(existingIndex, 1);
                    return updated;
                }

                updated[existingIndex] = {
                    ...existing,
                    newProps: edit.newProps,
                    timestamp: Date.now(),
                };
                return updated;
            }

            return [...prev, newEdit];
        });
    }, [generateId]);

    const openClozeChoiceEditor = useCallback((
        props: ClozeChoiceProps,
        blockId: string,
        elementPath: string
    ) => {
        setEditingClozeChoice({ ...props, blockId, elementPath });
    }, []);

    const closeClozeChoiceEditor = useCallback(() => {
        setEditingClozeChoice(null);
    }, []);

    const saveClozeChoiceEdit = useCallback((newProps: ClozeChoiceProps) => {
        if (!editingClozeChoice) return;

        const { blockId, elementPath, ...originalProps } = editingClozeChoice;

        const propsChanged = JSON.stringify(newProps) !== JSON.stringify(originalProps);

        if (propsChanged) {
            addClozeChoiceEdit({
                blockId,
                elementPath,
                originalProps,
                newProps,
            });
        }

        setEditingClozeChoice(null);
    }, [editingClozeChoice, addClozeChoiceEdit]);

    // Toggle editing methods
    const addToggleEdit = useCallback((edit: Omit<ToggleEdit, 'id' | 'type' | 'timestamp'>) => {
        const newEdit: ToggleEdit = {
            ...edit,
            id: generateId(),
            type: 'toggle',
            timestamp: Date.now(),
        };

        setPendingEdits(prev => {
            const existingIndex = prev.findIndex(
                e => e.type === 'toggle' &&
                    (e as ToggleEdit).blockId === edit.blockId &&
                    (e as ToggleEdit).elementPath === edit.elementPath
            );

            if (existingIndex !== -1) {
                const updated = [...prev];
                const existing = updated[existingIndex] as ToggleEdit;

                const propsMatch = JSON.stringify(edit.newProps) === JSON.stringify(existing.originalProps);
                if (propsMatch) {
                    updated.splice(existingIndex, 1);
                    return updated;
                }

                updated[existingIndex] = {
                    ...existing,
                    newProps: edit.newProps,
                    timestamp: Date.now(),
                };
                return updated;
            }

            return [...prev, newEdit];
        });
    }, [generateId]);

    const openToggleEditor = useCallback((
        props: ToggleProps,
        blockId: string,
        elementPath: string
    ) => {
        setEditingToggle({ ...props, blockId, elementPath });
    }, []);

    const closeToggleEditor = useCallback(() => {
        setEditingToggle(null);
    }, []);

    const saveToggleEdit = useCallback((newProps: ToggleProps) => {
        if (!editingToggle) return;

        const { blockId, elementPath, ...originalProps } = editingToggle;

        const propsChanged = JSON.stringify(newProps) !== JSON.stringify(originalProps);

        if (propsChanged) {
            addToggleEdit({
                blockId,
                elementPath,
                originalProps,
                newProps,
            });
        }

        setEditingToggle(null);
    }, [editingToggle, addToggleEdit]);

    // Tooltip editing methods
    const addTooltipEdit = useCallback((edit: Omit<TooltipEdit, 'id' | 'type' | 'timestamp'>) => {
        const newEdit: TooltipEdit = {
            ...edit,
            id: generateId(),
            type: 'tooltip',
            timestamp: Date.now(),
        };

        setPendingEdits(prev => {
            const existingIndex = prev.findIndex(
                e => e.type === 'tooltip' &&
                    (e as TooltipEdit).blockId === edit.blockId &&
                    (e as TooltipEdit).elementPath === edit.elementPath
            );

            if (existingIndex !== -1) {
                const updated = [...prev];
                const existing = updated[existingIndex] as TooltipEdit;

                const propsMatch = JSON.stringify(edit.newProps) === JSON.stringify(existing.originalProps);
                if (propsMatch) {
                    updated.splice(existingIndex, 1);
                    return updated;
                }

                updated[existingIndex] = {
                    ...existing,
                    newProps: edit.newProps,
                    timestamp: Date.now(),
                };
                return updated;
            }

            return [...prev, newEdit];
        });
    }, [generateId]);

    const openTooltipEditor = useCallback((
        props: TooltipProps,
        blockId: string,
        elementPath: string
    ) => {
        setEditingTooltip({ ...props, blockId, elementPath });
    }, []);

    const closeTooltipEditor = useCallback(() => {
        setEditingTooltip(null);
    }, []);

    const saveTooltipEdit = useCallback((newProps: TooltipProps) => {
        if (!editingTooltip) return;

        const { blockId, elementPath, ...originalProps } = editingTooltip;

        const propsChanged = JSON.stringify(newProps) !== JSON.stringify(originalProps);

        if (propsChanged) {
            addTooltipEdit({
                blockId,
                elementPath,
                originalProps,
                newProps,
            });
        }

        setEditingTooltip(null);
    }, [editingTooltip, addTooltipEdit]);

    // Trigger editing methods
    const addTriggerEdit = useCallback((edit: Omit<TriggerComponentEdit, 'id' | 'type' | 'timestamp'>) => {
        const newEdit: TriggerComponentEdit = {
            ...edit,
            id: generateId(),
            type: 'trigger',
            timestamp: Date.now(),
        };

        setPendingEdits(prev => {
            const existingIndex = prev.findIndex(
                e => e.type === 'trigger' &&
                    (e as TriggerComponentEdit).blockId === edit.blockId &&
                    (e as TriggerComponentEdit).elementPath === edit.elementPath
            );

            if (existingIndex !== -1) {
                const updated = [...prev];
                const existing = updated[existingIndex] as TriggerComponentEdit;

                const propsMatch = JSON.stringify(edit.newProps) === JSON.stringify(existing.originalProps);
                if (propsMatch) {
                    updated.splice(existingIndex, 1);
                    return updated;
                }

                updated[existingIndex] = {
                    ...existing,
                    newProps: edit.newProps,
                    timestamp: Date.now(),
                };
                return updated;
            }

            return [...prev, newEdit];
        });
    }, [generateId]);

    const openTriggerEditor = useCallback((
        props: TriggerComponentProps,
        blockId: string,
        elementPath: string
    ) => {
        setEditingTrigger({ ...props, blockId, elementPath });
    }, []);

    const closeTriggerEditor = useCallback(() => {
        setEditingTrigger(null);
    }, []);

    const saveTriggerEdit = useCallback((newProps: TriggerComponentProps) => {
        if (!editingTrigger) {
            console.warn('[TriggerEdit] saveTriggerEdit called but editingTrigger is null');
            return;
        }

        const { blockId, elementPath, ...originalProps } = editingTrigger;

        const propsChanged = JSON.stringify(newProps) !== JSON.stringify(originalProps);

        if (import.meta.env.DEV) {
            console.log('[TriggerEdit] Save:', { blockId, elementPath, propsChanged, originalProps, newProps });
        }

        if (propsChanged) {
            addTriggerEdit({
                blockId,
                elementPath,
                originalProps,
                newProps,
            });
        }

        setEditingTrigger(null);
    }, [editingTrigger, addTriggerEdit]);

    // Hyperlink editing methods
    const addHyperlinkEdit = useCallback((edit: Omit<HyperlinkComponentEdit, 'id' | 'type' | 'timestamp'>) => {
        const newEdit: HyperlinkComponentEdit = {
            ...edit,
            id: generateId(),
            type: 'hyperlink',
            timestamp: Date.now(),
        };

        setPendingEdits(prev => {
            const existingIndex = prev.findIndex(
                e => e.type === 'hyperlink' &&
                    (e as HyperlinkComponentEdit).blockId === edit.blockId &&
                    (e as HyperlinkComponentEdit).elementPath === edit.elementPath
            );

            if (existingIndex !== -1) {
                const updated = [...prev];
                const existing = updated[existingIndex] as HyperlinkComponentEdit;

                const propsMatch = JSON.stringify(edit.newProps) === JSON.stringify(existing.originalProps);
                if (propsMatch) {
                    updated.splice(existingIndex, 1);
                    return updated;
                }

                updated[existingIndex] = {
                    ...existing,
                    newProps: edit.newProps,
                    timestamp: Date.now(),
                };
                return updated;
            }

            return [...prev, newEdit];
        });
    }, [generateId]);

    const openHyperlinkEditor = useCallback((
        props: HyperlinkComponentProps,
        blockId: string,
        elementPath: string
    ) => {
        setEditingHyperlink({ ...props, blockId, elementPath });
    }, []);

    const closeHyperlinkEditor = useCallback(() => {
        setEditingHyperlink(null);
    }, []);

    const saveHyperlinkEdit = useCallback((newProps: HyperlinkComponentProps) => {
        if (!editingHyperlink) return;

        const { blockId, elementPath, ...originalProps } = editingHyperlink;

        const propsChanged = JSON.stringify(newProps) !== JSON.stringify(originalProps);

        if (propsChanged) {
            addHyperlinkEdit({
                blockId,
                elementPath,
                originalProps,
                newProps,
            });
        }

        setEditingHyperlink(null);
    }, [editingHyperlink, addHyperlinkEdit]);

    // InlineFormula editing methods
    const addInlineFormulaEdit = useCallback((edit: Omit<InlineFormulaEdit, 'id' | 'type' | 'timestamp'>) => {
        const newEdit: InlineFormulaEdit = {
            ...edit,
            id: generateId(),
            type: 'inlineFormula',
            timestamp: Date.now(),
        };

        setPendingEdits(prev => {
            // 1. Check if there is a pending STRUCTURE edit with action 'add' for this block.
            //    If so, update the inlineFormula marker props in the structure edit content
            //    so the structure agent creates the formula with the correct (edited) props.
            //    This prevents a stale InlineFormulaEdit from inserting a duplicate formula
            //    when the backend processes text edits before structure edits.
            const structureAddIndex = prev.findIndex(
                e => e.type === 'structure' &&
                    (e as StructureEdit).action === 'add' &&
                    (e as StructureEdit).blockId === edit.blockId
            );

            if (structureAddIndex !== -1) {
                const updated = [...prev];
                const existingStructure = updated[structureAddIndex] as StructureEdit;
                const content = existingStructure.content || '';

                // Update the first inlineFormula marker with the new props
                const markerRegex = /\{\{inlineFormula:([^|}]+)(?:\|[A-Za-z0-9+/=]*)?\}\}/;
                const markerMatch = content.match(markerRegex);

                if (markerMatch) {
                    try {
                        const updatedProps: Record<string, unknown> = {
                            latex: edit.newProps.latex,
                        };
                        if (edit.newProps.colorMap && Object.keys(edit.newProps.colorMap).length > 0) {
                            updatedProps.colorMap = edit.newProps.colorMap;
                        }
                        if (edit.newProps.color && edit.newProps.color !== '#000000') {
                            updatedProps.color = edit.newProps.color;
                        }
                        const newBase64 = btoa(JSON.stringify(updatedProps));
                        const newContent = content.replace(
                            markerRegex,
                            `{{inlineFormula:${markerMatch[1]}|${newBase64}}}`
                        );
                        updated[structureAddIndex] = {
                            ...existingStructure,
                            content: newContent,
                            timestamp: Date.now(),
                        };
                    } catch {
                        // Encoding failed — fall through to add as normal edit
                    }
                }

                // Still add the InlineFormulaEdit for frontend visual feedback
                // (the InlineFormula component reads pending edits for effectiveLatex)
                const existingEditIndex = updated.findIndex(
                    e => e.type === 'inlineFormula' &&
                        (e as InlineFormulaEdit).blockId === edit.blockId &&
                        (e as InlineFormulaEdit).elementPath === edit.elementPath
                );
                if (existingEditIndex !== -1) {
                    updated[existingEditIndex] = {
                        ...(updated[existingEditIndex] as InlineFormulaEdit),
                        newProps: edit.newProps,
                        timestamp: Date.now(),
                    };
                } else {
                    updated.push(newEdit);
                }
                return updated;
            }

            // 2. Normal flow: check for existing formula edit for the same element
            const existingIndex = prev.findIndex(
                e => e.type === 'inlineFormula' &&
                    (e as InlineFormulaEdit).blockId === edit.blockId &&
                    (e as InlineFormulaEdit).elementPath === edit.elementPath
            );

            if (existingIndex !== -1) {
                const updated = [...prev];
                const existing = updated[existingIndex] as InlineFormulaEdit;

                const propsMatch = JSON.stringify(edit.newProps) === JSON.stringify(existing.originalProps);
                if (propsMatch) {
                    updated.splice(existingIndex, 1);
                    return updated;
                }

                updated[existingIndex] = {
                    ...existing,
                    newProps: edit.newProps,
                    timestamp: Date.now(),
                };
                return updated;
            }

            return [...prev, newEdit];
        });
    }, [generateId]);

    const openInlineFormulaEditor = useCallback((
        props: InlineFormulaProps,
        blockId: string,
        elementPath: string
    ) => {
        setEditingInlineFormula({ ...props, blockId, elementPath });
    }, []);

    const closeInlineFormulaEditor = useCallback(() => {
        setEditingInlineFormula(null);
    }, []);

    const saveInlineFormulaEdit = useCallback((newProps: InlineFormulaProps) => {
        if (!editingInlineFormula) return;

        const { blockId, elementPath, ...originalProps } = editingInlineFormula;

        const propsChanged = JSON.stringify(newProps) !== JSON.stringify(originalProps);

        if (propsChanged) {
            addInlineFormulaEdit({
                blockId,
                elementPath,
                originalProps,
                newProps,
            });
        }

        setEditingInlineFormula(null);
    }, [editingInlineFormula, addInlineFormulaEdit]);

    // SpotColor editing methods
    const addSpotColorEdit = useCallback((edit: Omit<SpotColorEdit, 'id' | 'type' | 'timestamp'>) => {
        const newEdit: SpotColorEdit = {
            ...edit,
            id: generateId(),
            type: 'spotColor',
            timestamp: Date.now(),
        };

        setPendingEdits(prev => {
            const existingIndex = prev.findIndex(
                e => e.type === 'spotColor' &&
                    (e as SpotColorEdit).blockId === edit.blockId &&
                    (e as SpotColorEdit).elementPath === edit.elementPath
            );

            if (existingIndex !== -1) {
                const updated = [...prev];
                const existing = updated[existingIndex] as SpotColorEdit;

                const propsMatch = JSON.stringify(edit.newProps) === JSON.stringify(existing.originalProps);
                if (propsMatch) {
                    updated.splice(existingIndex, 1);
                    return updated;
                }

                updated[existingIndex] = {
                    ...existing,
                    newProps: edit.newProps,
                    timestamp: Date.now(),
                };
                return updated;
            }

            return [...prev, newEdit];
        });
    }, [generateId]);

    const openSpotColorEditor = useCallback((
        props: SpotColorComponentProps,
        blockId: string,
        elementPath: string
    ) => {
        setEditingSpotColor({ ...props, blockId, elementPath });
    }, []);

    const closeSpotColorEditor = useCallback(() => {
        setEditingSpotColor(null);
    }, []);

    const saveSpotColorEdit = useCallback((newProps: SpotColorComponentProps) => {
        if (!editingSpotColor) return;

        const { blockId, elementPath, ...originalProps } = editingSpotColor;

        const propsChanged = JSON.stringify(newProps) !== JSON.stringify(originalProps);

        if (propsChanged) {
            addSpotColorEdit({
                blockId,
                elementPath,
                originalProps,
                newProps,
            });
        }

        setEditingSpotColor(null);
    }, [editingSpotColor, addSpotColorEdit]);

    // LinkedHighlight editing methods
    const addLinkedHighlightEdit = useCallback((edit: Omit<LinkedHighlightEdit, 'id' | 'type' | 'timestamp'>) => {
        const newEdit: LinkedHighlightEdit = {
            ...edit,
            id: generateId(),
            type: 'linkedHighlight',
            timestamp: Date.now(),
        };

        setPendingEdits(prev => {
            const existingIndex = prev.findIndex(
                e => e.type === 'linkedHighlight' &&
                    (e as LinkedHighlightEdit).blockId === edit.blockId &&
                    (e as LinkedHighlightEdit).elementPath === edit.elementPath
            );

            if (existingIndex !== -1) {
                const updated = [...prev];
                const existing = updated[existingIndex] as LinkedHighlightEdit;

                const propsMatch = JSON.stringify(edit.newProps) === JSON.stringify(existing.originalProps);
                if (propsMatch) {
                    updated.splice(existingIndex, 1);
                    return updated;
                }

                updated[existingIndex] = {
                    ...existing,
                    newProps: edit.newProps,
                    timestamp: Date.now(),
                };
                return updated;
            }

            return [...prev, newEdit];
        });
    }, [generateId]);

    const openLinkedHighlightEditor = useCallback((
        props: LinkedHighlightComponentProps,
        blockId: string,
        elementPath: string
    ) => {
        setEditingLinkedHighlight({ ...props, blockId, elementPath });
    }, []);

    const closeLinkedHighlightEditor = useCallback(() => {
        setEditingLinkedHighlight(null);
    }, []);

    const saveLinkedHighlightEdit = useCallback((newProps: LinkedHighlightComponentProps) => {
        if (!editingLinkedHighlight) return;

        const { blockId, elementPath, ...originalProps } = editingLinkedHighlight;

        const propsChanged = JSON.stringify(newProps) !== JSON.stringify(originalProps);

        if (propsChanged) {
            addLinkedHighlightEdit({
                blockId,
                elementPath,
                originalProps,
                newProps,
            });
        }

        setEditingLinkedHighlight(null);
    }, [editingLinkedHighlight, addLinkedHighlightEdit]);

    // FormulaBlock editing methods
    const addFormulaBlockEdit = useCallback((edit: Omit<FormulaBlockEdit, 'id' | 'type' | 'timestamp'>) => {
        const newEdit: FormulaBlockEdit = {
            ...edit,
            id: generateId(),
            type: 'formulaBlock',
            timestamp: Date.now(),
        };

        setPendingEdits(prev => {
            const existingIndex = prev.findIndex(
                e => e.type === 'formulaBlock' &&
                    (e as FormulaBlockEdit).blockId === edit.blockId &&
                    (e as FormulaBlockEdit).elementPath === edit.elementPath
            );

            if (existingIndex !== -1) {
                const updated = [...prev];
                const existing = updated[existingIndex] as FormulaBlockEdit;

                const propsMatch = JSON.stringify(edit.newProps) === JSON.stringify(existing.originalProps);
                if (propsMatch) {
                    updated.splice(existingIndex, 1);
                    return updated;
                }

                updated[existingIndex] = {
                    ...existing,
                    newProps: edit.newProps,
                    timestamp: Date.now(),
                };
                return updated;
            }

            return [...prev, newEdit];
        });
    }, [generateId]);

    const openFormulaBlockEditor = useCallback((
        props: FormulaBlockComponentProps,
        blockId: string,
        elementPath: string
    ) => {
        setEditingFormulaBlock({ ...props, blockId, elementPath });
    }, []);

    const closeFormulaBlockEditor = useCallback(() => {
        setEditingFormulaBlock(null);
    }, []);

    const saveFormulaBlockEdit = useCallback((newProps: FormulaBlockComponentProps) => {
        if (!editingFormulaBlock) return;

        const { blockId, elementPath, isNew, ...originalProps } = editingFormulaBlock;

        const propsChanged = JSON.stringify(newProps) !== JSON.stringify(originalProps);

        if (propsChanged) {
            addFormulaBlockEdit({
                blockId,
                elementPath,
                originalProps,
                newProps,
            });
        }

        setEditingFormulaBlock(null);
    }, [editingFormulaBlock, addFormulaBlockEdit]);

    // Filter out inlineFormulaEdits whose block already has a structure 'add' edit
    // with an updated marker.  The structure edit carries the new props in its marker,
    // so processing both would duplicate the formula on the backend.  The inlineFormulaEdit
    // is kept in local state purely for frontend visual feedback (effectiveLatex).
    const filterEditsForBackend = useCallback((edits: PendingEdit[]): PendingEdit[] => {
        const structureAddBlockIds = new Set(
            edits
                .filter(e => e.type === 'structure' && (e as StructureEdit).action === 'add')
                .map(e => (e as StructureEdit).blockId)
        );
        return edits.filter(e => {
            if (e.type === 'inlineFormula' && structureAddBlockIds.has((e as InlineFormulaEdit).blockId)) {
                return false;
            }
            return true;
        });
    }, []);

    // Notify parent whenever edits change
    useEffect(() => {
        const editsForBackend = filterEditsForBackend(pendingEdits);
        window.parent.postMessage({
            type: 'edits-changed',
            edits: editsForBackend,
            count: editsForBackend.length,
        }, '*');
    }, [pendingEdits, filterEditsForBackend]);

    // Listen for messages from parent
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (!event.data) return;

            // Parent requesting to enable/disable editing
            if (event.data.type === 'set-editing-mode') {
                if (event.data.enabled) {
                    enableEditing();
                } else {
                    disableEditing();
                }
            }

            // Parent requesting to clear edits (after save or discard)
            if (event.data.type === 'clear-edits') {
                clearAllEdits();
            }

            // Parent requesting current edits
            if (event.data.type === 'request-edits') {
                const editsForBackend = filterEditsForBackend(pendingEditsRef.current);
                window.parent.postMessage({
                    type: 'edits-response',
                    edits: editsForBackend,
                    count: editsForBackend.length,
                }, '*');
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [enableEditing, disableEditing, clearAllEdits]);

    const value = useMemo(() => ({
        isEditing,
        pendingEdits,
        editingScrubbleNumber,
        editingClozeInput,
        editingClozeChoice,
        editingToggle,
        editingTooltip,
        editingTrigger,
        editingHyperlink,
        editingInlineFormula,
        editingSpotColor,
        editingLinkedHighlight,
        editingFormulaBlock,
        enableEditing,
        disableEditing,
        addTextEdit,
        addScrubbleNumberEdit,
        addClozeInputEdit,
        addClozeChoiceEdit,
        addToggleEdit,
        addTooltipEdit,
        addTriggerEdit,
        addHyperlinkEdit,
        addStructureEdit,
        removeEdit,
        clearAllEdits,
        openScrubbleNumberEditor,
        closeScrubbleNumberEditor,
        saveScrubbleNumberEdit,
        openClozeInputEditor,
        closeClozeInputEditor,
        saveClozeInputEdit,
        openClozeChoiceEditor,
        closeClozeChoiceEditor,
        saveClozeChoiceEdit,
        openToggleEditor,
        closeToggleEditor,
        saveToggleEdit,
        openTooltipEditor,
        closeTooltipEditor,
        saveTooltipEdit,
        openTriggerEditor,
        closeTriggerEditor,
        saveTriggerEdit,
        openHyperlinkEditor,
        closeHyperlinkEditor,
        saveHyperlinkEdit,
        addInlineFormulaEdit,
        openInlineFormulaEditor,
        closeInlineFormulaEditor,
        saveInlineFormulaEdit,
        addSpotColorEdit,
        openSpotColorEditor,
        closeSpotColorEditor,
        saveSpotColorEdit,
        addLinkedHighlightEdit,
        openLinkedHighlightEditor,
        closeLinkedHighlightEditor,
        saveLinkedHighlightEdit,
        addFormulaBlockEdit,
        openFormulaBlockEditor,
        closeFormulaBlockEditor,
        saveFormulaBlockEdit,
    }), [
        isEditing,
        pendingEdits,
        editingScrubbleNumber,
        editingClozeInput,
        editingClozeChoice,
        editingToggle,
        editingTooltip,
        editingTrigger,
        editingHyperlink,
        editingInlineFormula,
        editingSpotColor,
        editingLinkedHighlight,
        editingFormulaBlock,
        enableEditing,
        disableEditing,
        addTextEdit,
        addScrubbleNumberEdit,
        addClozeInputEdit,
        addClozeChoiceEdit,
        addToggleEdit,
        addTooltipEdit,
        addTriggerEdit,
        addHyperlinkEdit,
        addStructureEdit,
        removeEdit,
        clearAllEdits,
        openScrubbleNumberEditor,
        closeScrubbleNumberEditor,
        saveScrubbleNumberEdit,
        openClozeInputEditor,
        closeClozeInputEditor,
        saveClozeInputEdit,
        openClozeChoiceEditor,
        closeClozeChoiceEditor,
        saveClozeChoiceEdit,
        openToggleEditor,
        closeToggleEditor,
        saveToggleEdit,
        openTooltipEditor,
        closeTooltipEditor,
        saveTooltipEdit,
        openTriggerEditor,
        closeTriggerEditor,
        saveTriggerEdit,
        openHyperlinkEditor,
        closeHyperlinkEditor,
        saveHyperlinkEdit,
        addInlineFormulaEdit,
        openInlineFormulaEditor,
        closeInlineFormulaEditor,
        saveInlineFormulaEdit,
        addSpotColorEdit,
        openSpotColorEditor,
        closeSpotColorEditor,
        saveSpotColorEdit,
        addLinkedHighlightEdit,
        openLinkedHighlightEditor,
        closeLinkedHighlightEditor,
        saveLinkedHighlightEdit,
        addFormulaBlockEdit,
        openFormulaBlockEditor,
        closeFormulaBlockEditor,
        saveFormulaBlockEdit,
    ]);

    // Check if running standalone (not in iframe)
    const isStandalone = typeof window !== 'undefined' && window.self === window.top;

    // State for debug panel visibility
    const [showDebugPanel, setShowDebugPanel] = useState(false);

    return (
        <EditingContext.Provider value={value}>
            {children}

            {/* Debug panel - only visible in editor mode */}
            {isEditor && (
                <>
                    {/* Debug toggle button */}
                    <button
                        onClick={() => setShowDebugPanel(!showDebugPanel)}
                        className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg transition-all duration-200"
                        style={{
                            backgroundColor: showDebugPanel ? '#f59e0b' : '#6b7280',
                            color: 'white',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: 500,
                        }}
                    >
                        <span>🐛 {showDebugPanel ? 'Hide Debug' : 'Show Debug'}</span>
                        {pendingEdits.length > 0 && (
                            <span style={{
                                backgroundColor: '#ef4444',
                                padding: '2px 6px',
                                borderRadius: '9999px',
                                fontSize: '12px',
                            }}>
                                {pendingEdits.length}
                            </span>
                        )}
                    </button>

                    {/* Debug panel */}
                    {showDebugPanel && (
                        <div
                            className="fixed bottom-16 right-4 z-50 w-96 max-h-96 overflow-auto rounded-lg shadow-xl"
                            style={{
                                backgroundColor: '#1f2937',
                                color: '#e5e7eb',
                                border: '1px solid #374151',
                            }}
                        >
                            {/* Editing toggle */}
                            <div style={{
                                padding: '12px 16px',
                                borderBottom: '1px solid #374151',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }}>
                                <span style={{ fontWeight: 600 }}>
                                    ✏️ Editing Mode: {isEditing ? 'ON' : 'OFF'}
                                </span>
                                <button
                                    onClick={() => isEditing ? disableEditing() : enableEditing()}
                                    style={{
                                        fontSize: '12px',
                                        padding: '6px 12px',
                                        backgroundColor: isEditing ? '#ef4444' : '#3cc499',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontWeight: 500,
                                    }}
                                >
                                    {isEditing ? 'Disable' : 'Enable'} Editing
                                </button>
                            </div>

                            <div style={{
                                padding: '12px 16px',
                                borderBottom: '1px solid #374151',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }}>
                                <span style={{ fontWeight: 600 }}>📝 Pending Edits ({pendingEdits.length})</span>
                                {pendingEdits.length > 0 && (
                                    <button
                                        onClick={clearAllEdits}
                                        style={{
                                            fontSize: '12px',
                                            padding: '4px 8px',
                                            backgroundColor: '#ef4444',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        Clear All
                                    </button>
                                )}
                            </div>
                            <div style={{ padding: '8px' }}>
                                {pendingEdits.length === 0 ? (
                                    <div style={{ padding: '16px', textAlign: 'center', color: '#9ca3af' }}>
                                        No pending edits
                                    </div>
                                ) : (
                                    pendingEdits.map((edit, index) => (
                                        <div
                                            key={edit.id}
                                            style={{
                                                padding: '8px 12px',
                                                marginBottom: '4px',
                                                backgroundColor: '#374151',
                                                borderRadius: '6px',
                                                fontSize: '12px',
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                <span style={{
                                                    fontWeight: 600,
                                                    color: edit.type === 'text' ? '#60a5fa' :
                                                        edit.type === 'equation' ? '#a78bfa' :
                                                            edit.type === 'structure' ? '#34d399' :
                                                                edit.type === 'clozeInput' ? '#38bdf8' :
                                                                    edit.type === 'clozeChoice' ? '#f472b6' :
                                                                        edit.type === 'toggle' ? '#c084fc' :
                                                                            edit.type === 'tooltip' ? '#f59e0b' :
                                                                                edit.type === 'trigger' ? '#10B981' :
                                                                                    edit.type === 'hyperlink' ? '#10B981' :
                                                                                        edit.type === 'inlineFormula' ? '#8B5CF6' :
                                                                                            edit.type === 'spotColor' ? '#3cc499' :
                                                                                                edit.type === 'linkedHighlight' ? '#3b82f6' : '#fbbf24'
                                                }}>
                                                    {edit.type.toUpperCase()}
                                                    {edit.type === 'structure' && ` (${(edit as any).action})`}
                                                </span>
                                                <span style={{ color: '#9ca3af', fontSize: '10px' }}>
                                                    #{index + 1}
                                                </span>
                                            </div>
                                            <div style={{ color: '#d1d5db', wordBreak: 'break-word' }}>
                                                {edit.type === 'text' && (
                                                    <>
                                                        <div>📍 {(edit as any).blockId}</div>
                                                        <div style={{ color: '#9ca3af' }}>
                                                            "{(edit as any).originalText}" →
                                                            "{(edit as any).newText}"
                                                        </div>
                                                    </>
                                                )}
                                                {edit.type === 'equation' && (
                                                    <>
                                                        <div>📍 {(edit as any).blockId}</div>
                                                        <div style={{ fontFamily: 'monospace', color: '#9ca3af' }}>
                                                            {(edit as any).newLatex}
                                                        </div>
                                                    </>
                                                )}
                                                {edit.type === 'structure' && (
                                                    <>
                                                        {(edit as any).action === 'reorder' && (
                                                            <div>
                                                                📋 Order: [{(edit as any).blockIds?.join(', ')}]
                                                            </div>
                                                        )}
                                                        {(edit as any).action === 'delete' && (
                                                            <div>🗑️ Block: {(edit as any).blockId}</div>
                                                        )}
                                                        {(edit as any).action === 'add' && (
                                                            <div>
                                                                ➕ {(edit as any).blockType || 'paragraph'}: {(edit as any).content}
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                                {edit.type === 'scrubbleNumber' && (
                                                    <>
                                                        <div>📍 {(edit as ScrubbleNumberEdit).blockId}</div>
                                                        <div style={{ color: '#9ca3af' }}>
                                                            🔢 Path: {(edit as ScrubbleNumberEdit).elementPath}
                                                        </div>
                                                        <div style={{ color: '#9ca3af', fontSize: '11px' }}>
                                                            varName: {(edit as ScrubbleNumberEdit).newProps.varName || '(none)'} |
                                                            default: {(edit as ScrubbleNumberEdit).newProps.defaultValue} |
                                                            range: [{(edit as ScrubbleNumberEdit).newProps.min}, {(edit as ScrubbleNumberEdit).newProps.max}] |
                                                            step: {(edit as ScrubbleNumberEdit).newProps.step}
                                                        </div>
                                                    </>
                                                )}
                                                {edit.type === 'clozeInput' && (
                                                    <>
                                                        <div>📍 {(edit as ClozeInputEdit).blockId}</div>
                                                        <div style={{ color: '#9ca3af' }}>
                                                            📝 Path: {(edit as ClozeInputEdit).elementPath}
                                                        </div>
                                                        <div style={{ color: '#9ca3af', fontSize: '11px' }}>
                                                            varName: {(edit as ClozeInputEdit).newProps.varName || '(none)'} |
                                                            answer: {(edit as ClozeInputEdit).newProps.correctAnswer || '(none)'} |
                                                            caseSensitive: {String((edit as ClozeInputEdit).newProps.caseSensitive ?? false)}
                                                        </div>
                                                    </>
                                                )}
                                                {edit.type === 'clozeChoice' && (
                                                    <>
                                                        <div>📍 {(edit as ClozeChoiceEdit).blockId}</div>
                                                        <div style={{ color: '#9ca3af' }}>
                                                            📝 Path: {(edit as ClozeChoiceEdit).elementPath}
                                                        </div>
                                                        <div style={{ color: '#9ca3af', fontSize: '11px' }}>
                                                            varName: {(edit as ClozeChoiceEdit).newProps.varName || '(none)'} |
                                                            answer: {(edit as ClozeChoiceEdit).newProps.correctAnswer || '(none)'} |
                                                            options: [{(edit as ClozeChoiceEdit).newProps.options?.join(', ') || ''}]
                                                        </div>
                                                    </>
                                                )}
                                                {edit.type === 'toggle' && (
                                                    <>
                                                        <div>📍 {(edit as ToggleEdit).blockId}</div>
                                                        <div style={{ color: '#9ca3af' }}>
                                                            🔄 Path: {(edit as ToggleEdit).elementPath}
                                                        </div>
                                                        <div style={{ color: '#9ca3af', fontSize: '11px' }}>
                                                            varName: {(edit as ToggleEdit).newProps.varName || '(none)'} |
                                                            options: [{(edit as ToggleEdit).newProps.options?.join(', ') || ''}]
                                                        </div>
                                                    </>
                                                )}
                                                {edit.type === 'tooltip' && (
                                                    <>
                                                        <div>📍 {(edit as TooltipEdit).blockId}</div>
                                                        <div style={{ color: '#9ca3af' }}>
                                                            💡 Path: {(edit as TooltipEdit).elementPath}
                                                        </div>
                                                        <div style={{ color: '#9ca3af', fontSize: '11px' }}>
                                                            text: {(edit as TooltipEdit).newProps.text || '(none)'} |
                                                            tooltip: {(edit as TooltipEdit).newProps.tooltip?.substring(0, 30) || '(none)'}...
                                                        </div>
                                                    </>
                                                )}
                                                {edit.type === 'trigger' && (
                                                    <>
                                                        <div>📍 {(edit as TriggerComponentEdit).blockId}</div>
                                                        <div style={{ color: '#9ca3af' }}>
                                                            ⚡ Path: {(edit as TriggerComponentEdit).elementPath}
                                                        </div>
                                                        <div style={{ color: '#9ca3af', fontSize: '11px' }}>
                                                            text: {(edit as TriggerComponentEdit).newProps.text || '(none)'} |
                                                            varName: {(edit as TriggerComponentEdit).newProps.varName || '(none)'} |
                                                            value: {String((edit as TriggerComponentEdit).newProps.value ?? '(none)')}
                                                        </div>
                                                    </>
                                                )}
                                                {edit.type === 'hyperlink' && (
                                                    <>
                                                        <div>📍 {(edit as HyperlinkComponentEdit).blockId}</div>
                                                        <div style={{ color: '#9ca3af' }}>
                                                            🔗 Path: {(edit as HyperlinkComponentEdit).elementPath}
                                                        </div>
                                                        <div style={{ color: '#9ca3af', fontSize: '11px' }}>
                                                            text: {(edit as HyperlinkComponentEdit).newProps.text || '(none)'} |
                                                            href: {(edit as HyperlinkComponentEdit).newProps.href || '(none)'} |
                                                            target: {(edit as HyperlinkComponentEdit).newProps.targetBlockId || '(none)'}
                                                        </div>
                                                    </>
                                                )}
                                                {edit.type === 'inlineFormula' && (
                                                    <>
                                                        <div>📍 {(edit as InlineFormulaEdit).blockId}</div>
                                                        <div style={{ color: '#9ca3af' }}>
                                                            📐 Path: {(edit as InlineFormulaEdit).elementPath}
                                                        </div>
                                                        <div style={{ color: '#9ca3af', fontSize: '11px', fontFamily: 'monospace' }}>
                                                            latex: {(edit as InlineFormulaEdit).newProps.latex?.substring(0, 40) || '(none)'}
                                                        </div>
                                                    </>
                                                )}
                                                {edit.type === 'spotColor' && (
                                                    <>
                                                        <div>📍 {(edit as SpotColorEdit).blockId}</div>
                                                        <div style={{ color: '#9ca3af' }}>
                                                            🎨 Path: {(edit as SpotColorEdit).elementPath}
                                                        </div>
                                                        <div style={{ color: '#9ca3af', fontSize: '11px' }}>
                                                            varName: {(edit as SpotColorEdit).newProps.varName || '(none)'} |
                                                            text: {(edit as SpotColorEdit).newProps.text || '(none)'} |
                                                            color: <span style={{ color: (edit as SpotColorEdit).newProps.color }}>{(edit as SpotColorEdit).newProps.color || '(none)'}</span>
                                                        </div>
                                                    </>
                                                )}
                                                {edit.type === 'linkedHighlight' && (
                                                    <>
                                                        <div>📍 {(edit as LinkedHighlightEdit).blockId}</div>
                                                        <div style={{ color: '#9ca3af' }}>
                                                            🔗 Path: {(edit as LinkedHighlightEdit).elementPath}
                                                        </div>
                                                        <div style={{ color: '#9ca3af', fontSize: '11px' }}>
                                                            varName: {(edit as LinkedHighlightEdit).newProps.varName || '(none)'} |
                                                            highlightId: {(edit as LinkedHighlightEdit).newProps.highlightId || '(none)'} |
                                                            text: {(edit as LinkedHighlightEdit).newProps.text || '(none)'}
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </>
            )}
        </EditingContext.Provider>
    );
};

export const useEditing = (): EditingContextType => {
    const context = useContext(EditingContext);
    if (!context) {
        throw new Error('useEditing must be used within EditingProvider');
    }
    return context;
};

/**
 * Optional version of useEditing that returns undefined if not in EditingProvider.
 * Useful for components that optionally support editing.
 */
export const useOptionalEditing = (): EditingContextType | undefined => {
    return useContext(EditingContext);
};
