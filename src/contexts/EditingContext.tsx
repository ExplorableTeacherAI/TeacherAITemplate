import { createContext, useContext, useState, useCallback, useMemo, useRef, useEffect, type ReactNode } from 'react';
import { useAppMode } from './AppModeContext';

// Edit types
export interface TextEdit {
    id: string;
    type: 'text';
    sectionId: string;
    elementPath: string;
    originalText: string;
    originalHtml?: string;
    newText: string;
    newHtml?: string;
    timestamp: number;
}

export interface EquationEdit {
    id: string;
    type: 'equation';
    sectionId: string;
    componentType: 'Equation' | 'InteractiveEquation' | 'ColoredEquation';
    originalLatex: string;
    newLatex: string;
    colorMap?: Record<string, string>;
    timestamp: number;
}

export interface ScrubbleNumberEdit {
    id: string;
    type: 'scrubbleNumber';
    sectionId: string;
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
}

export interface StructureEdit {
    id: string;
    type: 'structure';
    action: 'reorder' | 'delete' | 'add';
    sectionId?: string;
    sectionIds?: string[];
    content?: string;
    blockType?: string;
    timestamp: number;
}

export type PendingEdit = TextEdit | EquationEdit | ScrubbleNumberEdit | StructureEdit;

interface EditingContextType {
    // State
    isEditing: boolean;
    pendingEdits: PendingEdit[];
    editingEquation: { latex: string; colorMap?: Record<string, string>; sectionId: string; elementPath: string } | null;
    editingScrubbleNumber: (ScrubbleNumberProps & { sectionId: string; elementPath: string }) | null;

    // Actions
    enableEditing: () => void;
    disableEditing: () => void;
    addTextEdit: (edit: Omit<TextEdit, 'id' | 'type' | 'timestamp'>) => void;
    addEquationEdit: (edit: Omit<EquationEdit, 'id' | 'type' | 'timestamp'>) => void;
    addScrubbleNumberEdit: (edit: Omit<ScrubbleNumberEdit, 'id' | 'type' | 'timestamp'>) => void;
    addStructureEdit: (edit: Omit<StructureEdit, 'id' | 'type' | 'timestamp'>) => void;
    removeEdit: (id: string) => void;
    clearAllEdits: () => void;
    openEquationEditor: (latex: string, colorMap: Record<string, string> | undefined, sectionId: string, elementPath: string) => void;
    closeEquationEditor: () => void;
    saveEquationEdit: (newLatex: string, newColorMap?: Record<string, string>) => void;
    openScrubbleNumberEditor: (props: ScrubbleNumberProps, sectionId: string, elementPath: string) => void;
    closeScrubbleNumberEditor: () => void;
    saveScrubbleNumberEdit: (newProps: ScrubbleNumberProps) => void;
}

const EditingContext = createContext<EditingContextType | undefined>(undefined);

interface EditingProviderProps {
    children: ReactNode;
}

export const EditingProvider = ({ children }: EditingProviderProps) => {
    const { isEditor } = useAppMode();

    const [isEditing, setIsEditing] = useState(false);
    const [pendingEdits, setPendingEdits] = useState<PendingEdit[]>([]);
    const [editingEquation, setEditingEquation] = useState<{
        latex: string;
        colorMap?: Record<string, string>;
        sectionId: string;
        elementPath: string;
    } | null>(null);
    const [editingScrubbleNumber, setEditingScrubbleNumber] = useState<(ScrubbleNumberProps & {
        sectionId: string;
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
            // 1. Check if there is a pending STRUCTURE edit with action 'add' for this section
            // If so, we just update the content of that add structure edit
            const structureAddIndex = prev.findIndex(
                e => e.type === 'structure' &&
                    e.action === 'add' &&
                    e.sectionId === edit.sectionId
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
                    e.sectionId === edit.sectionId &&
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

    const addEquationEdit = useCallback((edit: Omit<EquationEdit, 'id' | 'type' | 'timestamp'>) => {
        const newEdit: EquationEdit = {
            ...edit,
            id: generateId(),
            type: 'equation',
            timestamp: Date.now(),
        };

        setPendingEdits(prev => {
            // Check if there's already an edit for the same equation
            const existingIndex = prev.findIndex(
                e => e.type === 'equation' &&
                    e.sectionId === edit.sectionId &&
                    (e as EquationEdit).originalLatex === edit.originalLatex
            );

            if (existingIndex !== -1) {
                // Update existing edit
                const updated = [...prev];
                const existing = updated[existingIndex] as EquationEdit;

                // If new latex matches original, remove the edit
                if (edit.newLatex === existing.originalLatex) {
                    updated.splice(existingIndex, 1);
                    return updated;
                }

                // Otherwise update
                updated[existingIndex] = {
                    ...existing,
                    newLatex: edit.newLatex,
                    colorMap: edit.colorMap,
                    timestamp: Date.now(),
                };
                return updated;
            }

            return [...prev, newEdit];
        });
    }, [generateId]);

    const addStructureEdit = useCallback((edit: Omit<StructureEdit, 'id' | 'type' | 'timestamp'>) => {
        setPendingEdits(prev => {
            // Check if there's already an 'add' structure edit for this sectionId
            // This handles the case where we add a placeholder and then commit content to it
            if (edit.action === 'add') {
                const existingAddIndex = prev.findIndex(
                    e => e.type === 'structure' &&
                        e.action === 'add' &&
                        e.sectionId === edit.sectionId
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

    const openEquationEditor = useCallback((
        latex: string,
        colorMap: Record<string, string> | undefined,
        sectionId: string,
        elementPath: string
    ) => {
        setEditingEquation({ latex, colorMap, sectionId, elementPath });
    }, []);

    const closeEquationEditor = useCallback(() => {
        setEditingEquation(null);
    }, []);

    const saveEquationEdit = useCallback((newLatex: string, newColorMap?: Record<string, string>) => {
        if (!editingEquation) return;

        // Check if latex or color map changed
        const latexChanged = newLatex !== editingEquation.latex;
        const colorMapChanged = newColorMap && JSON.stringify(newColorMap) !== JSON.stringify(editingEquation.colorMap);

        if (latexChanged || colorMapChanged) {
            addEquationEdit({
                sectionId: editingEquation.sectionId,
                componentType: 'Equation', // Will need to detect actual type
                originalLatex: editingEquation.latex,
                newLatex,
                colorMap: newColorMap || editingEquation.colorMap,
            });
        }

        setEditingEquation(null);
    }, [editingEquation, addEquationEdit]);

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
                    e.sectionId === edit.sectionId &&
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
        sectionId: string,
        elementPath: string
    ) => {
        setEditingScrubbleNumber({ ...props, sectionId, elementPath });
    }, []);

    const closeScrubbleNumberEditor = useCallback(() => {
        setEditingScrubbleNumber(null);
    }, []);

    const saveScrubbleNumberEdit = useCallback((newProps: ScrubbleNumberProps) => {
        if (!editingScrubbleNumber) return;

        const { sectionId, elementPath, ...originalProps } = editingScrubbleNumber;

        // Check if any property changed
        const propsChanged = JSON.stringify(newProps) !== JSON.stringify(originalProps);

        if (propsChanged) {
            addScrubbleNumberEdit({
                sectionId,
                elementPath,
                originalProps,
                newProps,
            });
        }

        setEditingScrubbleNumber(null);
    }, [editingScrubbleNumber, addScrubbleNumberEdit]);

    // Notify parent whenever edits change
    useEffect(() => {
        window.parent.postMessage({
            type: 'edits-changed',
            edits: pendingEdits,
            count: pendingEdits.length,
        }, '*');
    }, [pendingEdits]);

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
                window.parent.postMessage({
                    type: 'edits-response',
                    edits: pendingEditsRef.current,
                    count: pendingEditsRef.current.length,
                }, '*');
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [enableEditing, disableEditing, clearAllEdits]);

    const value = useMemo(() => ({
        isEditing,
        pendingEdits,
        editingEquation,
        editingScrubbleNumber,
        enableEditing,
        disableEditing,
        addTextEdit,
        addEquationEdit,
        addScrubbleNumberEdit,
        addStructureEdit,
        removeEdit,
        clearAllEdits,
        openEquationEditor,
        closeEquationEditor,
        saveEquationEdit,
        openScrubbleNumberEditor,
        closeScrubbleNumberEditor,
        saveScrubbleNumberEdit,
    }), [
        isEditing,
        pendingEdits,
        editingEquation,
        editingScrubbleNumber,
        enableEditing,
        disableEditing,
        addTextEdit,
        addEquationEdit,
        addScrubbleNumberEdit,
        addStructureEdit,
        removeEdit,
        clearAllEdits,
        openEquationEditor,
        closeEquationEditor,
        saveEquationEdit,
        openScrubbleNumberEditor,
        closeScrubbleNumberEditor,
        saveScrubbleNumberEdit,
    ]);

    // Check if running standalone (not in iframe)
    const isStandalone = typeof window !== 'undefined' && window.self === window.top;

    // State for debug panel visibility
    const [showDebugPanel, setShowDebugPanel] = useState(false);

    return (
        <EditingContext.Provider value={value}>
            {children}

            {/* Debug panel for standalone testing */}
            {isStandalone && (
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
                                                            edit.type === 'structure' ? '#34d399' : '#fbbf24'
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
                                                        <div>📍 {(edit as any).sectionId}</div>
                                                        <div style={{ color: '#9ca3af' }}>
                                                            "{(edit as any).originalText}" →
                                                            "{(edit as any).newText}"
                                                        </div>
                                                    </>
                                                )}
                                                {edit.type === 'equation' && (
                                                    <>
                                                        <div>📍 {(edit as any).sectionId}</div>
                                                        <div style={{ fontFamily: 'monospace', color: '#9ca3af' }}>
                                                            {(edit as any).newLatex}
                                                        </div>
                                                    </>
                                                )}
                                                {edit.type === 'structure' && (
                                                    <>
                                                        {(edit as any).action === 'reorder' && (
                                                            <div>
                                                                📋 Order: [{(edit as any).sectionIds?.join(', ')}]
                                                            </div>
                                                        )}
                                                        {(edit as any).action === 'delete' && (
                                                            <div>🗑️ Block: {(edit as any).sectionId}</div>
                                                        )}
                                                        {(edit as any).action === 'add' && (
                                                            <div>
                                                                ➕ {(edit as any).blockType || 'paragraph'}: {(edit as any).content}
                                                            </div>
                                                        )}
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
