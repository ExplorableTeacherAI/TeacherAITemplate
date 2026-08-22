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
    manualSaveOnly?: boolean;
    timestamp: number;
}

export type PendingEdit = BlockContentEdit | TextEdit | HyperlinkComponentEdit | StructureEdit;

interface EditingContextType {
    // State
    isEditing: boolean;
    pendingEdits: PendingEdit[];
    editingHyperlink: (HyperlinkComponentProps & { blockId: string; elementPath: string }) | null;

    // Actions
    enableEditing: () => void;
    disableEditing: () => void;
    addTextEdit: (edit: Omit<TextEdit, 'id' | 'type' | 'timestamp'>) => void;
    addStructureEdit: (edit: Omit<StructureEdit, 'id' | 'type' | 'timestamp'>) => void;
    removeEdit: (id: string) => void;
    clearAllEdits: () => void;
    addHyperlinkEdit: (edit: Omit<HyperlinkComponentEdit, 'id' | 'type' | 'timestamp'>) => void;
    openHyperlinkEditor: (props: HyperlinkComponentProps, blockId: string, elementPath: string) => void;
    closeHyperlinkEditor: () => void;
    saveHyperlinkEdit: (newProps: HyperlinkComponentProps) => void;
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
    const [editingHyperlink, setEditingHyperlink] = useState<(HyperlinkComponentProps & {
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
            editingHyperlink
        );
        openComponentEditorRef.current = open;
        // The parent owns auto-save. Tell it that inline configuration is a
        // transaction in progress so it does not snapshot the provisional
        // marker before the teacher validates and applies the panel.
        window.parent.postMessage({ type: 'component-editor-state', open }, '*');
    }, [
        editingHyperlink,
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

    // Filter out inline component edits whose block already has a structure 'add' edit
    // (including 'modify-content' edits for inline component insertion into existing paragraphs).
    // Before filtering, merge inline edit props into the structure edit's content markers
    // so deterministic block creation writes the user's edited props (not defaults).
    const _INLINE_EDIT_TYPES = new Set([
        'hyperlink',
    ]);

    // Map edit type → marker component type used in content markers
    const _EDIT_TO_MARKER: Record<string, string> = {
        hyperlink: 'inlineHyperlink',
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
        // the stable marker id when available so editing the second hyperlink
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

        // Merge inline edit props into the structure edit's content markers
        // so the structure agent creates the component with the correct props.
        const updatedEdits = edits.map(e => {
            if (e.type !== 'structure' || (e as StructureEdit).action !== 'add') return e;
            const se = e as StructureEdit;

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
            }
        };

        window.addEventListener('inline-editor-open-request', handleEditorOpenRequest);
        return () => window.removeEventListener('inline-editor-open-request', handleEditorOpenRequest);
    }, [
        openHyperlinkEditor,
    ]);

    const value = useMemo(() => ({
        isEditing,
        pendingEdits,
        editingHyperlink,
        enableEditing,
        disableEditing,
        addTextEdit,
        addHyperlinkEdit,
        addStructureEdit,
        removeEdit,
        clearAllEdits,
        openHyperlinkEditor,
        closeHyperlinkEditor,
        saveHyperlinkEdit,
    }), [
        isEditing,
        pendingEdits,
        editingHyperlink,
        enableEditing,
        disableEditing,
        addTextEdit,
        addHyperlinkEdit,
        addStructureEdit,
        removeEdit,
        clearAllEdits,
        openHyperlinkEditor,
        closeHyperlinkEditor,
        saveHyperlinkEdit,
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
                                                        edit.type === 'structure' ? '#34d399' :
                                                            edit.type === 'hyperlink' ? '#10B981' :
                                                                '#fbbf24'
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
