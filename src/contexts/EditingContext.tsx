import { createContext, useContext, useState, useCallback, useMemo, useRef, useEffect, type ReactNode } from 'react';
import { useAppMode } from './AppModeContext';

// Edit types
export interface TextEdit {
    id: string;
    type: 'text';
    sectionId: string;
    elementPath: string;
    originalText: string;
    newText: string;
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

export type PendingEdit = TextEdit | EquationEdit;

interface EditingContextType {
    // State
    isEditing: boolean;
    pendingEdits: PendingEdit[];
    editingEquation: { latex: string; colorMap?: Record<string, string>; sectionId: string; elementPath: string } | null;

    // Actions
    enableEditing: () => void;
    disableEditing: () => void;
    addTextEdit: (edit: Omit<TextEdit, 'id' | 'type' | 'timestamp'>) => void;
    addEquationEdit: (edit: Omit<EquationEdit, 'id' | 'type' | 'timestamp'>) => void;
    removeEdit: (id: string) => void;
    clearAllEdits: () => void;
    openEquationEditor: (latex: string, colorMap: Record<string, string> | undefined, sectionId: string, elementPath: string) => void;
    closeEquationEditor: () => void;
    saveEquationEdit: (newLatex: string, newColorMap?: Record<string, string>) => void;
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
        if (isEditor) {
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
            // Check if there's already an edit for the same element
            const existingIndex = prev.findIndex(
                e => e.type === 'text' &&
                    e.sectionId === edit.sectionId &&
                    e.elementPath === edit.elementPath
            );

            if (existingIndex !== -1) {
                // Update existing edit
                const updated = [...prev];
                const existing = updated[existingIndex] as TextEdit;

                // If new text matches original, remove the edit
                if (edit.newText === existing.originalText) {
                    updated.splice(existingIndex, 1);
                    return updated;
                }

                // Otherwise update the new text
                updated[existingIndex] = {
                    ...existing,
                    newText: edit.newText,
                    timestamp: Date.now(),
                };
                return updated;
            }

            // Add new edit
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
        enableEditing,
        disableEditing,
        addTextEdit,
        addEquationEdit,
        removeEdit,
        clearAllEdits,
        openEquationEditor,
        closeEquationEditor,
        saveEquationEdit,
    }), [
        isEditing,
        pendingEdits,
        editingEquation,
        enableEditing,
        disableEditing,
        addTextEdit,
        addEquationEdit,
        removeEdit,
        clearAllEdits,
        openEquationEditor,
        closeEquationEditor,
        saveEquationEdit,
    ]);

    // Check if running standalone (not in iframe)
    const isStandalone = typeof window !== 'undefined' && window.self === window.top;

    return (
        <EditingContext.Provider value={value}>
            {children}

            {/* Debug toggle button for standalone testing */}
            {isEditor && isStandalone && (
                <button
                    onClick={() => isEditing ? disableEditing() : enableEditing()}
                    className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg transition-all duration-200"
                    style={{
                        backgroundColor: isEditing ? '#22c55e' : '#3b82f6',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 500,
                    }}
                >
                    <span>{isEditing ? '✏️ Editing ON' : '✏️ Enable Editing'}</span>
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
