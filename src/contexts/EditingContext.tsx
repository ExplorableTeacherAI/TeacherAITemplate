import { createContext, useContext, useState, useCallback, useMemo, useRef, useEffect, type ReactNode } from 'react';
import { useAppMode } from './AppModeContext';
import { extractContentWithMarkers } from '@/hooks/useInlineSlashCommands';
import { encodeMarkerProps, updateProvisionalInlinePlaceholder } from '@/lib/inlineMarkers';
import type { BlockLayoutManifest } from '@/lib/block-tree';

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
    fullContent?: string;
    timestamp: number;
}

/** Canonical save unit for text mixed with any number of inline components. */
export interface BlockContentEdit {
    id: string;
    type: 'blockContent';
    blockId: string;
    elementId?: string;
    newContent: string;
    /** Local editor metadata; stripped before the backend request. */
    manualSaveOnly?: boolean;
    timestamp: number;
}

interface InlineComponentIdentity {
    /** Stable marker identity, required to disambiguate repeated component types. */
    componentId?: string;
    /** New inline additions wait for the teacher's explicit Save action. */
    manualSaveOnly?: boolean;
}

export interface ScrubbleNumberEdit extends InlineComponentIdentity {
    id: string;
    type: 'scrubbleNumber';
    blockId: string;
    elementPath: string;
    originalProps: ScrubbleNumberProps;
    newProps: ScrubbleNumberProps;
    timestamp: number;
}

export interface ScrubbleNumberProps extends InlineComponentIdentity {
    varName?: string;
    defaultValue?: number;
    min?: number;
    max?: number;
    step?: number;
    color?: string;
    /** True when creating a new component via slash command (editor shows "Add" instead of "Apply") */
    isNew?: boolean;
}

export interface ClozeInputEdit extends InlineComponentIdentity {
    id: string;
    type: 'clozeInput';
    blockId: string;
    elementPath: string;
    originalProps: ClozeInputProps;
    newProps: ClozeInputProps;
    timestamp: number;
}

export interface ClozeInputProps extends InlineComponentIdentity {
    varName?: string;
    correctAnswer?: string;
    placeholder?: string;
    color?: string;
    bgColor?: string;
    caseSensitive?: boolean;
    isNew?: boolean;
}

export interface ClozeChoiceEdit extends InlineComponentIdentity {
    id: string;
    type: 'clozeChoice';
    blockId: string;
    elementPath: string;
    originalProps: ClozeChoiceProps;
    newProps: ClozeChoiceProps;
    timestamp: number;
}

export interface ClozeChoiceProps extends InlineComponentIdentity {
    varName?: string;
    correctAnswer?: string;
    options?: string[];
    placeholder?: string;
    color?: string;
    bgColor?: string;
    isNew?: boolean;
}

export interface ToggleEdit extends InlineComponentIdentity {
    id: string;
    type: 'toggle';
    blockId: string;
    elementPath: string;
    originalProps: ToggleProps;
    newProps: ToggleProps;
    timestamp: number;
}

export interface ToggleProps extends InlineComponentIdentity {
    varName?: string;
    options?: string[];
    color?: string;
    bgColor?: string;
    isNew?: boolean;
}

export interface TooltipProps extends InlineComponentIdentity {
    text?: string;       // The trigger text (children content)
    tooltip?: string;    // The tooltip/definition content
    color?: string;
    bgColor?: string;
    position?: string;   // 'top' | 'bottom' | 'auto'
    maxWidth?: number;
    isNew?: boolean;
}

export interface TooltipEdit extends InlineComponentIdentity {
    id: string;
    type: 'tooltip';
    blockId: string;
    elementPath: string;
    originalProps: TooltipProps;
    newProps: TooltipProps;
    timestamp: number;
}

export interface TriggerComponentProps extends InlineComponentIdentity {
    text?: string;
    varName?: string;
    value?: string | number | boolean;
    color?: string;
    bgColor?: string;
    icon?: string;
    isNew?: boolean;
}

export interface TriggerComponentEdit extends InlineComponentIdentity {
    id: string;
    type: 'trigger';
    blockId: string;
    elementPath: string;
    originalProps: TriggerComponentProps;
    newProps: TriggerComponentProps;
    timestamp: number;
}

export interface HyperlinkComponentProps extends InlineComponentIdentity {
    text?: string;
    href?: string;
    targetBlockId?: string;
    color?: string;
    bgColor?: string;
    isNew?: boolean;
}

export interface HyperlinkComponentEdit extends InlineComponentIdentity {
    id: string;
    type: 'hyperlink';
    blockId: string;
    elementPath: string;
    originalProps: HyperlinkComponentProps;
    newProps: HyperlinkComponentProps;
    timestamp: number;
}

export interface InlineFormulaProps extends InlineComponentIdentity {
    latex?: string;
    colorMap?: Record<string, string>;
    color?: string;       // wrapper text color (default: #000000 black)
    isNew?: boolean;
}

export interface InlineFormulaEdit extends InlineComponentIdentity {
    id: string;
    type: 'inlineFormula';
    blockId: string;
    elementPath: string;
    originalProps: InlineFormulaProps;
    newProps: InlineFormulaProps;
    timestamp: number;
}

export interface SpotColorComponentProps extends InlineComponentIdentity {
    varName?: string;
    text?: string;
    color?: string;
    isNew?: boolean;
}

export interface SpotColorEdit extends InlineComponentIdentity {
    id: string;
    type: 'spotColor';
    blockId: string;
    elementPath: string;
    originalProps: SpotColorComponentProps;
    newProps: SpotColorComponentProps;
    timestamp: number;
}

export interface LinkedHighlightComponentProps extends InlineComponentIdentity {
    varName?: string;
    highlightId?: string;
    text?: string;
    color?: string;
    bgColor?: string;
    isNew?: boolean;
}

export interface LinkedHighlightEdit extends InlineComponentIdentity {
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
    layout?: BlockLayoutManifest;
    content?: string;
    blockType?: string;
    afterBlockId?: string;
    componentProps?: FormulaBlockComponentProps;
    manualSaveOnly?: boolean;
    timestamp: number;
}

export type PendingEdit = BlockContentEdit | TextEdit | ScrubbleNumberEdit | ClozeInputEdit | ClozeChoiceEdit | ToggleEdit | TooltipEdit | TriggerComponentEdit | HyperlinkComponentEdit | InlineFormulaEdit | SpotColorEdit | LinkedHighlightEdit | FormulaBlockEdit | StructureEdit;

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

const isSameInlineTarget = (
    candidate: { blockId: string; elementPath: string; componentId?: string },
    edit: { blockId: string; elementPath: string; componentId?: string },
) => candidate.blockId === edit.blockId && (
    edit.componentId
        ? candidate.componentId === edit.componentId
        : candidate.elementPath === edit.elementPath
);

export const EditingProvider = ({ children }: EditingProviderProps) => {
    const { isEditor } = useAppMode();

    // Editor pages are always editable. Preview mode still starts (and stays)
    // non-editable, so student interactions are never intercepted.
    const [isEditing, setIsEditing] = useState(isEditor);
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
    const pendingRevisionRef = useRef(0);
    const openComponentEditorRef = useRef(false);

    useEffect(() => {
        pendingEditsRef.current = pendingEdits;
        pendingRevisionRef.current += 1;
    }, [pendingEdits]);

    useEffect(() => {
        const open = Boolean(
            editingScrubbleNumber || editingClozeInput || editingClozeChoice ||
            editingToggle || editingTooltip || editingTrigger || editingHyperlink ||
            editingInlineFormula || editingSpotColor || editingLinkedHighlight ||
            editingFormulaBlock
        );
        openComponentEditorRef.current = open;
        // The parent owns auto-save. Tell it that inline configuration is a
        // transaction in progress so it does not snapshot the provisional
        // marker before the teacher validates and applies the panel.
        window.parent.postMessage({ type: 'component-editor-state', open }, '*');
    }, [
        editingScrubbleNumber, editingClozeInput, editingClozeChoice,
        editingToggle, editingTooltip, editingTrigger, editingHyperlink,
        editingInlineFormula, editingSpotColor, editingLinkedHighlight,
        editingFormulaBlock,
    ]);

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

                // Update the content of the structure edit, preserving inline component markers if available
                updated[structureAddIndex] = {
                    ...existingStructure,
                    content: edit.fullContent ?? edit.newText,
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
            // Only the latest complete order matters. Keeping every drag event
            // replays obsolete intermediate positions around adds/deletes.
            if (edit.action === 'reorder') {
                const withoutOlderReorders = prev.filter(
                    candidate => candidate.type !== 'structure' || candidate.action !== 'reorder'
                );
                return [
                    ...withoutOlderReorders,
                    {
                        ...edit,
                        id: generateId(),
                        type: 'structure' as const,
                        timestamp: Date.now(),
                    },
                ];
            }

            // Repeated deletes are idempotent. Retain the newest complete
            // order snapshot rather than sending duplicate operations.
            if (edit.action === 'delete') {
                const existingDeleteIndex = prev.findIndex(
                    candidate => candidate.type === 'structure' &&
                        candidate.action === 'delete' &&
                        candidate.blockId === edit.blockId
                );
                if (existingDeleteIndex !== -1) {
                    const updated = [...prev];
                    updated[existingDeleteIndex] = {
                        ...updated[existingDeleteIndex],
                        ...edit,
                        timestamp: Date.now(),
                    } as StructureEdit;
                    return updated;
                }
            }

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
                    // If the existing edit is a real block creation (not a placeholder) and the new 
                    // edit is an inline insertion ('modify-content'), we keep the original blockType 
                    // so the backend still creates the block.
                    updated[existingAddIndex] = {
                        ...existing,
                        ...edit,
                        blockType: (existing.blockType !== 'placeholder' && edit.blockType === 'modify-content')
                            ? existing.blockType
                            : edit.blockType,
                        manualSaveOnly: existing.manualSaveOnly ||
                            edit.manualSaveOnly || edit.blockType === 'modify-content',
                        timestamp: Date.now(),
                    };
                    return updated;
                }
            }

            const newEdit: StructureEdit = {
                ...edit,
                manualSaveOnly: edit.manualSaveOnly || edit.blockType === 'modify-content',
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
        pendingEditsRef.current = [];
        pendingRevisionRef.current += 1;
        setPendingEdits([]);
    }, []);

    const cancelProvisionalInlineComponent = useCallback((
        editor: (InlineComponentIdentity & { blockId: string; isNew?: boolean }) | null,
        markerType: string,
    ) => {
        if (!editor?.isNew || !editor.componentId) return;

        const { blockId, componentId } = editor;
        const escapedId = componentId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const markerRe = new RegExp(
            `\\{\\{${markerType}:${escapedId}(?:\\|[A-Za-z0-9+/=]*)?\\}\\}\\s?`,
            'g',
        );

        // The paragraph may already have been promoted from a DOM placeholder
        // to a structure edit when focus moved into the panel. Remove the
        // provisional marker before closing the panel so auto-save cannot add
        // a component that the teacher cancelled.
        setPendingEdits(prev => prev.map(edit => {
            if (
                edit.type !== 'structure' || edit.action !== 'add' ||
                edit.blockId !== blockId || !edit.content
            ) return edit;
            const content = edit.content.replace(markerRe, '');
            const stillContainsInlineComponent = /\{\{inline[A-Za-z]+:[^}]+\}\}/.test(content);
            return content === edit.content
                ? edit
                : {
                    ...edit,
                    content,
                    manualSaveOnly: stillContainsInlineComponent || undefined,
                    timestamp: Date.now(),
                };
        }));

        window.dispatchEvent(new CustomEvent('inline-component-cancelled', {
            detail: { blockId, componentId },
        }));
    }, []);

    // Scrubble Number editing methods
    const addScrubbleNumberEdit = useCallback((edit: Omit<ScrubbleNumberEdit, 'id' | 'type' | 'timestamp'>) => {
        updateProvisionalInlinePlaceholder(edit.componentId, 'inlineScrubbleNumber', edit.newProps);
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
                    isSameInlineTarget(e as ScrubbleNumberEdit, edit)
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
        cancelProvisionalInlineComponent(editingScrubbleNumber, 'inlineScrubbleNumber');
        setEditingScrubbleNumber(null);
    }, [editingScrubbleNumber, cancelProvisionalInlineComponent]);

    const saveScrubbleNumberEdit = useCallback((newProps: ScrubbleNumberProps) => {
        if (!editingScrubbleNumber) return;

        const { blockId, elementPath, componentId, isNew, ...originalProps } = editingScrubbleNumber;

        // For new components (via slash command), always save the edit
        const propsChanged = isNew || JSON.stringify(newProps) !== JSON.stringify(originalProps);

        if (propsChanged) {
            addScrubbleNumberEdit({
                blockId,
                elementPath,
                componentId,
                manualSaveOnly: isNew === true,
                originalProps,
                newProps,
            });
        }

        setEditingScrubbleNumber(null);
    }, [editingScrubbleNumber, addScrubbleNumberEdit]);

    // Cloze Input editing methods
    const addClozeInputEdit = useCallback((edit: Omit<ClozeInputEdit, 'id' | 'type' | 'timestamp'>) => {
        updateProvisionalInlinePlaceholder(edit.componentId, 'inlineClozeInput', edit.newProps);
        const newEdit: ClozeInputEdit = {
            ...edit,
            id: generateId(),
            type: 'clozeInput',
            timestamp: Date.now(),
        };

        setPendingEdits(prev => {
            const existingIndex = prev.findIndex(
                e => e.type === 'clozeInput' &&
                    isSameInlineTarget(e as ClozeInputEdit, edit)
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
        cancelProvisionalInlineComponent(editingClozeInput, 'inlineClozeInput');
        setEditingClozeInput(null);
    }, [editingClozeInput, cancelProvisionalInlineComponent]);

    const saveClozeInputEdit = useCallback((newProps: ClozeInputProps) => {
        if (!editingClozeInput) return;

        const { blockId, elementPath, componentId, isNew, ...originalProps } = editingClozeInput;

        const propsChanged = isNew || JSON.stringify(newProps) !== JSON.stringify(originalProps);

        if (propsChanged) {
            addClozeInputEdit({
                blockId,
                elementPath,
                componentId,
                manualSaveOnly: isNew === true,
                originalProps,
                newProps,
            });
        }

        setEditingClozeInput(null);
    }, [editingClozeInput, addClozeInputEdit]);

    // Cloze Choice editing methods
    const addClozeChoiceEdit = useCallback((edit: Omit<ClozeChoiceEdit, 'id' | 'type' | 'timestamp'>) => {
        updateProvisionalInlinePlaceholder(edit.componentId, 'inlineClozeChoice', edit.newProps);
        const newEdit: ClozeChoiceEdit = {
            ...edit,
            id: generateId(),
            type: 'clozeChoice',
            timestamp: Date.now(),
        };

        setPendingEdits(prev => {
            const existingIndex = prev.findIndex(
                e => e.type === 'clozeChoice' &&
                    isSameInlineTarget(e as ClozeChoiceEdit, edit)
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
        cancelProvisionalInlineComponent(editingClozeChoice, 'inlineClozeChoice');
        setEditingClozeChoice(null);
    }, [editingClozeChoice, cancelProvisionalInlineComponent]);

    const saveClozeChoiceEdit = useCallback((newProps: ClozeChoiceProps) => {
        if (!editingClozeChoice) return;

        const { blockId, elementPath, componentId, isNew, ...originalProps } = editingClozeChoice;

        const propsChanged = isNew || JSON.stringify(newProps) !== JSON.stringify(originalProps);

        if (propsChanged) {
            addClozeChoiceEdit({
                blockId,
                elementPath,
                componentId,
                manualSaveOnly: isNew === true,
                originalProps,
                newProps,
            });
        }

        setEditingClozeChoice(null);
    }, [editingClozeChoice, addClozeChoiceEdit]);

    // Toggle editing methods
    const addToggleEdit = useCallback((edit: Omit<ToggleEdit, 'id' | 'type' | 'timestamp'>) => {
        updateProvisionalInlinePlaceholder(edit.componentId, 'inlineToggle', edit.newProps);
        const newEdit: ToggleEdit = {
            ...edit,
            id: generateId(),
            type: 'toggle',
            timestamp: Date.now(),
        };

        setPendingEdits(prev => {
            const existingIndex = prev.findIndex(
                e => e.type === 'toggle' &&
                    isSameInlineTarget(e as ToggleEdit, edit)
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
        cancelProvisionalInlineComponent(editingToggle, 'inlineToggle');
        setEditingToggle(null);
    }, [editingToggle, cancelProvisionalInlineComponent]);

    const saveToggleEdit = useCallback((newProps: ToggleProps) => {
        if (!editingToggle) return;

        const { blockId, elementPath, componentId, isNew, ...originalProps } = editingToggle;

        const propsChanged = isNew || JSON.stringify(newProps) !== JSON.stringify(originalProps);

        if (propsChanged) {
            addToggleEdit({
                blockId,
                elementPath,
                componentId,
                manualSaveOnly: isNew === true,
                originalProps,
                newProps,
            });
        }

        setEditingToggle(null);
    }, [editingToggle, addToggleEdit]);

    // Tooltip editing methods
    const addTooltipEdit = useCallback((edit: Omit<TooltipEdit, 'id' | 'type' | 'timestamp'>) => {
        updateProvisionalInlinePlaceholder(edit.componentId, 'inlineTooltip', edit.newProps);
        const newEdit: TooltipEdit = {
            ...edit,
            id: generateId(),
            type: 'tooltip',
            timestamp: Date.now(),
        };

        setPendingEdits(prev => {
            const existingIndex = prev.findIndex(
                e => e.type === 'tooltip' &&
                    isSameInlineTarget(e as TooltipEdit, edit)
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
        cancelProvisionalInlineComponent(editingTooltip, 'inlineTooltip');
        setEditingTooltip(null);
    }, [editingTooltip, cancelProvisionalInlineComponent]);

    const saveTooltipEdit = useCallback((newProps: TooltipProps) => {
        if (!editingTooltip) return;

        const { blockId, elementPath, componentId, isNew, ...originalProps } = editingTooltip;

        const propsChanged = isNew || JSON.stringify(newProps) !== JSON.stringify(originalProps);

        if (propsChanged) {
            addTooltipEdit({
                blockId,
                elementPath,
                componentId,
                manualSaveOnly: isNew === true,
                originalProps,
                newProps,
            });
        }

        setEditingTooltip(null);
    }, [editingTooltip, addTooltipEdit]);

    // Trigger editing methods
    const addTriggerEdit = useCallback((edit: Omit<TriggerComponentEdit, 'id' | 'type' | 'timestamp'>) => {
        updateProvisionalInlinePlaceholder(edit.componentId, 'inlineTrigger', edit.newProps);
        const newEdit: TriggerComponentEdit = {
            ...edit,
            id: generateId(),
            type: 'trigger',
            timestamp: Date.now(),
        };

        setPendingEdits(prev => {
            const existingIndex = prev.findIndex(
                e => e.type === 'trigger' &&
                    isSameInlineTarget(e as TriggerComponentEdit, edit)
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
        cancelProvisionalInlineComponent(editingTrigger, 'inlineTrigger');
        setEditingTrigger(null);
    }, [editingTrigger, cancelProvisionalInlineComponent]);

    const saveTriggerEdit = useCallback((newProps: TriggerComponentProps) => {
        if (!editingTrigger) {
            console.warn('[TriggerEdit] saveTriggerEdit called but editingTrigger is null');
            return;
        }

        const { blockId, elementPath, componentId, isNew, ...originalProps } = editingTrigger;

        const propsChanged = isNew || JSON.stringify(newProps) !== JSON.stringify(originalProps);

        if (import.meta.env.DEV) {
            console.log('[TriggerEdit] Save:', { blockId, elementPath, propsChanged, originalProps, newProps });
        }

        if (propsChanged) {
            addTriggerEdit({
                blockId,
                elementPath,
                componentId,
                manualSaveOnly: isNew === true,
                originalProps,
                newProps,
            });
        }

        setEditingTrigger(null);
    }, [editingTrigger, addTriggerEdit]);

    // Hyperlink editing methods
    const addHyperlinkEdit = useCallback((edit: Omit<HyperlinkComponentEdit, 'id' | 'type' | 'timestamp'>) => {
        updateProvisionalInlinePlaceholder(edit.componentId, 'inlineHyperlink', edit.newProps);
        const newEdit: HyperlinkComponentEdit = {
            ...edit,
            id: generateId(),
            type: 'hyperlink',
            timestamp: Date.now(),
        };

        setPendingEdits(prev => {
            const existingIndex = prev.findIndex(
                e => e.type === 'hyperlink' &&
                    isSameInlineTarget(e as HyperlinkComponentEdit, edit)
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
        cancelProvisionalInlineComponent(editingHyperlink, 'inlineHyperlink');
        setEditingHyperlink(null);
    }, [editingHyperlink, cancelProvisionalInlineComponent]);

    const saveHyperlinkEdit = useCallback((newProps: HyperlinkComponentProps) => {
        if (!editingHyperlink) return;

        const { blockId, elementPath, componentId, isNew, ...originalProps } = editingHyperlink;

        const propsChanged = isNew || JSON.stringify(newProps) !== JSON.stringify(originalProps);

        if (propsChanged) {
            addHyperlinkEdit({
                blockId,
                elementPath,
                componentId,
                manualSaveOnly: isNew === true,
                originalProps,
                newProps,
            });
        }

        setEditingHyperlink(null);
    }, [editingHyperlink, addHyperlinkEdit]);

    // InlineFormula editing methods
    const addInlineFormulaEdit = useCallback((edit: Omit<InlineFormulaEdit, 'id' | 'type' | 'timestamp'>) => {
        updateProvisionalInlinePlaceholder(edit.componentId, 'inlineFormula', edit.newProps);
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

                // Match the exact new formula when repeated formulas share a block.
                const escapedComponentId = edit.componentId?.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const markerRegex = new RegExp(
                    `\\{\\{inlineFormula:(${escapedComponentId || '[^|}]+'})(?:\\|[A-Za-z0-9+/=]*)?\\}\\}`,
                );
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
                        const newBase64 = encodeMarkerProps(updatedProps);
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
                        isSameInlineTarget(e as InlineFormulaEdit, edit)
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
                    isSameInlineTarget(e as InlineFormulaEdit, edit)
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
        cancelProvisionalInlineComponent(editingInlineFormula, 'inlineFormula');
        setEditingInlineFormula(null);
    }, [editingInlineFormula, cancelProvisionalInlineComponent]);

    const saveInlineFormulaEdit = useCallback((newProps: InlineFormulaProps) => {
        if (!editingInlineFormula) return;

        const { blockId, elementPath, componentId, isNew, ...originalProps } = editingInlineFormula;

        const propsChanged = isNew || JSON.stringify(newProps) !== JSON.stringify(originalProps);

        if (propsChanged) {
            addInlineFormulaEdit({
                blockId,
                elementPath,
                componentId,
                manualSaveOnly: isNew === true,
                originalProps,
                newProps,
            });
        }

        setEditingInlineFormula(null);
    }, [editingInlineFormula, addInlineFormulaEdit]);

    // SpotColor editing methods
    const addSpotColorEdit = useCallback((edit: Omit<SpotColorEdit, 'id' | 'type' | 'timestamp'>) => {
        updateProvisionalInlinePlaceholder(edit.componentId, 'inlineSpotColor', edit.newProps);
        const newEdit: SpotColorEdit = {
            ...edit,
            id: generateId(),
            type: 'spotColor',
            timestamp: Date.now(),
        };

        setPendingEdits(prev => {
            const existingIndex = prev.findIndex(
                e => e.type === 'spotColor' &&
                    isSameInlineTarget(e as SpotColorEdit, edit)
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
        cancelProvisionalInlineComponent(editingSpotColor, 'inlineSpotColor');
        setEditingSpotColor(null);
    }, [editingSpotColor, cancelProvisionalInlineComponent]);

    const saveSpotColorEdit = useCallback((newProps: SpotColorComponentProps) => {
        if (!editingSpotColor) return;

        const { blockId, elementPath, componentId, isNew, ...originalProps } = editingSpotColor;

        const propsChanged = isNew || JSON.stringify(newProps) !== JSON.stringify(originalProps);

        if (propsChanged) {
            addSpotColorEdit({
                blockId,
                elementPath,
                componentId,
                manualSaveOnly: isNew === true,
                originalProps,
                newProps,
            });
        }

        setEditingSpotColor(null);
    }, [editingSpotColor, addSpotColorEdit]);

    // LinkedHighlight editing methods
    const addLinkedHighlightEdit = useCallback((edit: Omit<LinkedHighlightEdit, 'id' | 'type' | 'timestamp'>) => {
        updateProvisionalInlinePlaceholder(edit.componentId, 'inlineLinkedHighlight', edit.newProps);
        const newEdit: LinkedHighlightEdit = {
            ...edit,
            id: generateId(),
            type: 'linkedHighlight',
            timestamp: Date.now(),
        };

        setPendingEdits(prev => {
            const existingIndex = prev.findIndex(
                e => e.type === 'linkedHighlight' &&
                    isSameInlineTarget(e as LinkedHighlightEdit, edit)
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
        cancelProvisionalInlineComponent(editingLinkedHighlight, 'inlineLinkedHighlight');
        setEditingLinkedHighlight(null);
    }, [editingLinkedHighlight, cancelProvisionalInlineComponent]);

    const saveLinkedHighlightEdit = useCallback((newProps: LinkedHighlightComponentProps) => {
        if (!editingLinkedHighlight) return;

        const { blockId, elementPath, componentId, isNew, ...originalProps } = editingLinkedHighlight;

        const propsChanged = isNew || JSON.stringify(newProps) !== JSON.stringify(originalProps);

        if (propsChanged) {
            addLinkedHighlightEdit({
                blockId,
                elementPath,
                componentId,
                manualSaveOnly: isNew === true,
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

    // Filter out inline component edits whose block already has a structure 'add' edit
    // (including 'modify-content' edits for inline component insertion into existing paragraphs).
    // Before filtering, merge inline edit props into the structure edit's content markers
    // so deterministic block creation writes the user's edited props (not defaults).
    const _INLINE_EDIT_TYPES = new Set([
        'inlineFormula', 'tooltip', 'trigger', 'hyperlink',
        'scrubbleNumber', 'clozeInput', 'clozeChoice', 'toggle',
        'spotColor', 'linkedHighlight',
    ]);

    // Map edit type → marker component type used in content markers
    const _EDIT_TO_MARKER: Record<string, string> = {
        scrubbleNumber: 'inlineScrubbleNumber',
        clozeInput: 'inlineClozeInput',
        clozeChoice: 'inlineClozeChoice',
        toggle: 'inlineToggle',
        tooltip: 'inlineTooltip',
        trigger: 'inlineTrigger',
        hyperlink: 'inlineHyperlink',
        inlineFormula: 'inlineFormula',
        spotColor: 'inlineSpotColor',
        linkedHighlight: 'inlineLinkedHighlight',
    };

    /** Replace a marker's base64 props in the content string with updated props. */
    const mergePropsIntoMarker = (
        content: string,
        editType: string,
        newProps: Record<string, unknown>,
        componentId?: string,
    ): string => {
        const markerType = _EDIT_TO_MARKER[editType];
        if (!markerType) return content;

        // New blocks can contain several components of the same type. Match
        // the stable marker id when available so editing the second tooltip
        // cannot accidentally overwrite the first one.
        const markerId = componentId ? componentId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') : '[^|}]+';
        const re = new RegExp(`\\{\\{${markerType}:(${markerId})(?:\\|[A-Za-z0-9+/=]*)?\\}\\}`);
        const m = content.match(re);
        if (!m) return content;

        try {
            const persistedProps = { ...newProps };
            delete persistedProps.componentId;
            const encoded = encodeMarkerProps(persistedProps);
            return content.replace(m[0], `{{${markerType}:${m[1]}|${encoded}}}`);
        } catch {
            return content;
        }
    };

    const filterEditsForBackend = useCallback((
        edits: PendingEdit[],
        persistEmptyBlocks = false,
    ): PendingEdit[] => {
        // Identify blocks with structure 'add' edits
        const structureAddEdits = edits.filter(
            e => e.type === 'structure' && (e as StructureEdit).action === 'add'
        );
        const structureAddBlockIds = new Set(
            structureAddEdits.map(e => (e as StructureEdit).blockId)
        );

        // Collect inline edits that will be filtered out
        const inlineEditsForStructure = edits.filter(
            e => _INLINE_EDIT_TYPES.has(e.type) && structureAddBlockIds.has((e as any).blockId)
        );
        const formulaEditsForStructure = edits.filter(
            e => e.type === 'formulaBlock' && structureAddBlockIds.has((e as FormulaBlockEdit).blockId)
        ) as FormulaBlockEdit[];

        // Merge inline edit props into the structure edit's content markers
        // so the structure agent creates the component with the correct props.
        const updatedEdits = edits.map(e => {
            if (e.type !== 'structure' || (e as StructureEdit).action !== 'add') return e;
            const se = e as StructureEdit;

            if (se.blockType === 'formulaBlock') {
                const formulaEdit = [...formulaEditsForStructure]
                    .reverse()
                    .find(candidate => candidate.blockId === se.blockId);
                if (formulaEdit) {
                    return {
                        ...se,
                        content: formulaEdit.newProps.latex ?? se.content,
                        componentProps: formulaEdit.newProps,
                    } as StructureEdit;
                }
            }
            if (!se.content) return e;

            // Find inline edits targeting this block
            const related = inlineEditsForStructure.filter(
                ie => (ie as any).blockId === se.blockId
            );
            if (related.length === 0) return e;

            let updatedContent = se.content;
            for (const ie of related) {
                updatedContent = mergePropsIntoMarker(
                    updatedContent,
                    ie.type,
                    (ie as any).newProps,
                    (ie as any).componentId,
                );
            }

            const manualSaveOnly = related.some(edit =>
                (edit as InlineComponentIdentity).manualSaveOnly
            );
            if (updatedContent === se.content && !manualSaveOnly) return e;
            return { ...se, content: updatedContent, ...(manualSaveOnly ? { manualSaveOnly: true } : {}) };
        });

        // Keep an untouched add-block as a placeholder during ordinary edit
        // notifications so auto-save knows it is still an active draft. An
        // explicit save/Enter opts into converting it to a real empty paragraph.
        const normalizedEdits = updatedEdits.map(e => {
            if (
                persistEmptyBlocks &&
                e.type === 'structure' && e.action === 'add' &&
                e.blockType === 'placeholder'
            ) {
                return {
                    ...e,
                    blockType: 'paragraph',
                    content: '',
                } as StructureEdit;
            }
            return e;
        });

        // Filter out inline edits (their props are now merged into the structure edit)
        const filtered = normalizedEdits.filter(e => {
            if (_INLINE_EDIT_TYPES.has(e.type) && structureAddBlockIds.has((e as any).blockId)) {
                return false;
            }
            if (e.type === 'formulaBlock' && structureAddBlockIds.has((e as FormulaBlockEdit).blockId)) {
                return false;
            }
            return true;
        });

        // Existing editable text blocks are persisted as one canonical stream:
        // text + every inline component (with current effective props) in DOM
        // order. This makes combinations independent of mutation ordering and
        // disambiguates repeated components of the same type.
        const snapshotBlockIds = new Set(
            filtered
                .filter(e => e.type === 'text' || _INLINE_EDIT_TYPES.has(e.type))
                .map(e => (e as TextEdit).blockId)
                .filter(blockId => blockId && !structureAddBlockIds.has(blockId))
        );
        const snapshots: BlockContentEdit[] = [];
        const snapped = new Set<string>();

        for (const blockId of snapshotBlockIds) {
            const elements = Array.from(
                document.querySelectorAll<HTMLElement>('[data-editable="true"]')
            ).filter(el => el.closest('[data-block-id]')?.getAttribute('data-block-id') === blockId);

            for (const element of elements) {
                // Multiple editable elements in one block require an id so the
                // backend never guesses which JSX element should be replaced.
                if (elements.length > 1 && !element.id) continue;
                const key = `${blockId}:${element.id || 'only'}`;
                if (snapped.has(key)) continue;
                snapped.add(key);
                let snapshotContent = extractContentWithMarkers(element);
                // A freshly inserted slash-command component can still be a
                // plain DOM placeholder while its configuration panel closes.
                // Merge the validated panel values into its marker before the
                // inline edit is replaced by this canonical block snapshot.
                for (const inlineEdit of filtered.filter(
                    candidate => _INLINE_EDIT_TYPES.has(candidate.type) &&
                        (candidate as InlineComponentIdentity & { blockId?: string }).blockId === blockId
                )) {
                    const typedInlineEdit = inlineEdit as PendingEdit & {
                        componentId?: string;
                        newProps?: Record<string, unknown>;
                    };
                    if (!typedInlineEdit.newProps) continue;
                    snapshotContent = mergePropsIntoMarker(
                        snapshotContent,
                        typedInlineEdit.type,
                        typedInlineEdit.newProps,
                        typedInlineEdit.componentId,
                    );
                }
                snapshots.push({
                    id: `block-content:${key}`,
                    type: 'blockContent',
                    blockId,
                    ...(element.id ? { elementId: element.id } : {}),
                    newContent: snapshotContent,
                    manualSaveOnly: filtered.some(edit =>
                        (edit as { manualSaveOnly?: boolean }).manualSaveOnly &&
                        (edit as { blockId?: string }).blockId === blockId
                    ),
                    timestamp: Math.max(
                        ...filtered
                            .filter(e => (e as any).blockId === blockId)
                            .map(e => e.timestamp),
                        Date.now(),
                    ),
                });
            }
        }

        if (snapshots.length === 0) return filtered;
        const snapshottedBlockIds = new Set(snapshots.map(snapshot => snapshot.blockId));
        return [
            ...filtered.filter(e => {
                const blockId = (e as any).blockId as string | undefined;
                return !blockId || !snapshottedBlockIds.has(blockId) ||
                    (e.type !== 'text' && !_INLINE_EDIT_TYPES.has(e.type));
            }),
            ...snapshots,
        ];
    }, []);

    // Notify parent whenever edits change
    useEffect(() => {
        const editsForBackend = filterEditsForBackend(pendingEdits);
        window.parent.postMessage({
            type: 'edits-changed',
            edits: editsForBackend,
            count: editsForBackend.length,
            revision: pendingRevisionRef.current,
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
                    revision: pendingRevisionRef.current,
                }, '*');
            }

            // Clear only the exact revision that the backend saved. If the
            // teacher kept typing during the request, retain everything; the
            // already-saved portion is safe to send again because edits are
            // deterministic and idempotent.
            if (event.data.type === 'ack-saved') {
                const requestId = event.data.requestId;
                const cleared = event.data.revision === pendingRevisionRef.current;
                if (cleared) clearAllEdits();
                const currentEdits = cleared
                    ? []
                    : filterEditsForBackend(pendingEditsRef.current);
                window.parent.postMessage({
                    type: 'save-ack-result',
                    requestId,
                    cleared,
                    edits: currentEdits,
                    revision: pendingRevisionRef.current,
                }, '*');
            }

            // Saving must first flush whichever contentEditable currently has
            // focus. Two animation frames allow React state and effective
            // inline-component props to reach the DOM before it is serialized.
            if (event.data.type === 'prepare-save') {
                const requestId = event.data.requestId;
                if (openComponentEditorRef.current) {
                    window.parent.postMessage({
                        type: 'save-ready',
                        requestId,
                        error: 'Apply or cancel the open component editor before saving.',
                        edits: [],
                        count: 0,
                        revision: pendingRevisionRef.current,
                    }, '*');
                    return;
                }
                window.dispatchEvent(new CustomEvent('editor-flush-request'));
                requestAnimationFrame(() => requestAnimationFrame(() => {
                    const editsForBackend = filterEditsForBackend(
                        pendingEditsRef.current,
                        event.data.persistEmptyBlocks === true,
                    );
                    window.parent.postMessage({
                        type: 'save-ready',
                        requestId,
                        edits: editsForBackend,
                        count: editsForBackend.length,
                        revision: pendingRevisionRef.current,
                    }, '*');
                }));
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [enableEditing, disableEditing, clearAllEdits, filterEditsForBackend]);

    // Listen for inline component editor open requests (from slash command insertion)
    // This opens the appropriate editor modal immediately after an inline component
    // placeholder is inserted, providing the "configure first" workflow.
    useEffect(() => {
        const handleEditorOpenRequest = (e: Event) => {
            const { commandType, uniqueId, blockId } = (e as CustomEvent).detail as {
                commandType: string;
                uniqueId: string;
                blockId: string;
            };

            // Each inline component computes its own elementPath using a specific pattern.
            // When LessonView renders from a marker without encoded props, components that
            // accept varName get `var_${uniqueId}` as default. We must match that identity.
            switch (commandType) {
                case 'inlineScrubbleNumber': {
                    // LessonView default: varName = `var_${uniqueId}`
                    // Component identity: `scrubble-${blockId}-${varName ?? defaultValue}`
                    // Since varName = `var_${uniqueId}`, identity = `scrubble-${blockId}-var_${uniqueId}`
                    const defaultVarName = `var_${uniqueId}`;
                    const elementPath = `scrubble-${blockId}-${defaultVarName}`;
                    openScrubbleNumberEditor(
                        { varName: defaultVarName, defaultValue: 10, min: 0, max: 100, step: 1, color: '#0D7377', isNew: true, componentId: uniqueId },
                        blockId,
                        elementPath,
                    );
                    break;
                }
                case 'inlineClozeInput': {
                    // LessonView default: varName = `var_${uniqueId}`, correctAnswer = 'answer'
                    // Component identity: `cloze-${blockId}-${varName ?? correctAnswer}`
                    const defaultVarName = `var_${uniqueId}`;
                    const elementPath = `cloze-${blockId}-${defaultVarName}`;
                    openClozeInputEditor(
                        { varName: defaultVarName, correctAnswer: 'answer', placeholder: '???', isNew: true, componentId: uniqueId },
                        blockId,
                        elementPath,
                    );
                    break;
                }
                case 'inlineClozeChoice': {
                    // LessonView default: varName = `var_${uniqueId}`, correctAnswer = 'Option 1'
                    // Component identity: `choice-${blockId}-${varName ?? correctAnswer}`
                    const defaultVarName = `var_${uniqueId}`;
                    const elementPath = `choice-${blockId}-${defaultVarName}`;
                    openClozeChoiceEditor(
                        { varName: defaultVarName, correctAnswer: 'Option 1', options: ['Option 1', 'Option 2', 'Option 3'], placeholder: '???', isNew: true, componentId: uniqueId },
                        blockId,
                        elementPath,
                    );
                    break;
                }
                case 'inlineToggle': {
                    // LessonView default: varName = `var_${uniqueId}`, options = ['Option 1', 'Option 2', 'Option 3']
                    // Component identity: `toggle-${blockId}-${varName ?? options.join(',')}`
                    const defaultVarName = `var_${uniqueId}`;
                    const elementPath = `toggle-${blockId}-${defaultVarName}`;
                    openToggleEditor(
                        { varName: defaultVarName, options: ['Option 1', 'Option 2', 'Option 3'], isNew: true, componentId: uniqueId },
                        blockId,
                        elementPath,
                    );
                    break;
                }
                case 'inlineTooltip': {
                    // LessonView renders: <InlineTooltip>term</InlineTooltip>
                    // Component identity: `tooltip-${blockId}-${childText ?? tooltip?.substring(0, 20)}`
                    // childText = 'term' (from children)
                    const elementPath = `tooltip-${blockId}-term`;
                    openTooltipEditor(
                        { text: 'term', tooltip: 'Tooltip content', isNew: true, componentId: uniqueId },
                        blockId,
                        elementPath,
                    );
                    break;
                }
                case 'inlineTrigger': {
                    // LessonView default: varName = `var_${uniqueId}`, children = 'trigger'
                    // Component identity: `trigger-${blockId}-${varName??'novar'}-${childText}`
                    // childText = 'trigger' (from children), varName = `var_${uniqueId}`
                    const defaultVarName = `var_${uniqueId}`;
                    const elementPath = `trigger-${blockId}-${defaultVarName}-trigger`;
                    openTriggerEditor(
                        { text: 'trigger', varName: defaultVarName, value: undefined, isNew: true, componentId: uniqueId },
                        blockId,
                        elementPath,
                    );
                    break;
                }
                case 'inlineHyperlink': {
                    // LessonView renders: <InlineHyperlink>link</InlineHyperlink>
                    // Component identity: `hyperlink-${blockId}-${childText ?? href ?? targetBlockId ?? 'link'}`
                    // childText = 'link' (from children)
                    const elementPath = `hyperlink-${blockId}-link`;
                    openHyperlinkEditor(
                        { text: 'link', href: undefined, targetBlockId: undefined, isNew: true, componentId: uniqueId },
                        blockId,
                        elementPath,
                    );
                    break;
                }
                case 'inlineFormula': {
                    // LessonView default: latex = 'x^2'  
                    // Component identity: `inlineFormula-${blockId}-${latex?.substring(0, 30)}`
                    const elementPath = `inlineFormula-${blockId}-x^2`;
                    openInlineFormulaEditor(
                        { latex: 'x^2', isNew: true, componentId: uniqueId },
                        blockId,
                        elementPath,
                    );
                    break;
                }
                case 'inlineSpotColor': {
                    // LessonView renders: <InlineSpotColor varName={`var_${uniqueId}`}>variable</InlineSpotColor>
                    // Identity suffix: childText ? `${varName}-${childText}` : varName
                    // childText = 'variable', varName = `var_${uniqueId}`
                    // → suffix = `var_${uniqueId}-variable`
                    const defaultVarName = `var_${uniqueId}`;
                    const elementPath = `spotColor-${blockId}-${defaultVarName}-variable`;
                    openSpotColorEditor(
                        { varName: defaultVarName, text: 'variable', color: '#3B82F6', isNew: true, componentId: uniqueId },
                        blockId,
                        elementPath,
                    );
                    break;
                }
                case 'inlineLinkedHighlight': {
                    // LessonView renders: <InlineLinkedHighlight varName={`highlight_${uniqueId}`} highlightId={uniqueId}>highlight</InlineLinkedHighlight>
                    // Identity suffix: childText ? `${varName}-${highlightId}-${childText}` : `${varName}-${highlightId}`
                    // childText = 'highlight', varName = `highlight_${uniqueId}`, highlightId = uniqueId
                    // → suffix = `highlight_${uniqueId}-${uniqueId}-highlight`
                    const defaultVarName = `highlight_${uniqueId}`;
                    const elementPath = `linkedHighlight-${blockId}-${defaultVarName}-${uniqueId}-highlight`;
                    openLinkedHighlightEditor(
                        { varName: defaultVarName, highlightId: uniqueId, text: 'highlight', isNew: true, componentId: uniqueId },
                        blockId,
                        elementPath,
                    );
                    break;
                }
            }
        };

        window.addEventListener('inline-editor-open-request', handleEditorOpenRequest);
        return () => window.removeEventListener('inline-editor-open-request', handleEditorOpenRequest);
    }, [
        openScrubbleNumberEditor, openClozeInputEditor, openClozeChoiceEditor,
        openToggleEditor, openTooltipEditor, openTriggerEditor,
        openHyperlinkEditor, openInlineFormulaEditor, openSpotColorEditor,
        openLinkedHighlightEditor,
    ]);

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
            {false && (
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
                                                        edit.type === 'formulaBlock' ? '#a78bfa' :
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
                                                {edit.type === 'formulaBlock' && (
                                                    <>
                                                        <div>📍 {(edit as any).blockId}</div>
                                                        <div style={{ fontFamily: 'monospace', color: '#9ca3af' }}>
                                                            {(edit as any).newProps?.latex}
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
