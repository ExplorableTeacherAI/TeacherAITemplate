import React, { useState, useEffect, useCallback } from 'react';
import { useEditing } from '@/contexts/EditingContext';

interface ScrubbleNumberEditorModalProps {
    // Props are managed via EditingContext
}

export const ScrubbleNumberEditorModal: React.FC<ScrubbleNumberEditorModalProps> = () => {
    const { editingScrubbleNumber, closeScrubbleNumberEditor, saveScrubbleNumberEdit } = useEditing();

    const [varName, setVarName] = useState('');
    const [defaultValue, setDefaultValue] = useState(10);
    const [min, setMin] = useState(0);
    const [max, setMax] = useState(100);
    const [step, setStep] = useState(1);
    const [error, setError] = useState<string | null>(null);

    // Initialize state when modal opens
    useEffect(() => {
        if (editingScrubbleNumber) {
            setVarName(editingScrubbleNumber.varName || '');
            setDefaultValue(editingScrubbleNumber.defaultValue ?? 10);
            setMin(editingScrubbleNumber.min ?? 0);
            setMax(editingScrubbleNumber.max ?? 100);
            setStep(editingScrubbleNumber.step ?? 1);
            setError(null);
        }
    }, [editingScrubbleNumber]);

    // Validate inputs
    const validate = useCallback(() => {
        if (min >= max) {
            setError('Min must be less than max');
            return false;
        }
        if (step <= 0) {
            setError('Step must be greater than 0');
            return false;
        }
        if (defaultValue < min || defaultValue > max) {
            setError('Default value must be between min and max');
            return false;
        }
        setError(null);
        return true;
    }, [min, max, step, defaultValue]);

    // Handle save
    const handleSave = useCallback(() => {
        if (!validate()) return;

        saveScrubbleNumberEdit({
            varName: varName || undefined,
            defaultValue,
            min,
            max,
            step,
        });
    }, [varName, defaultValue, min, max, step, validate, saveScrubbleNumberEdit]);

    // Handle cancel
    const handleCancel = useCallback(() => {
        closeScrubbleNumberEditor();
    }, [closeScrubbleNumberEditor]);

    // Handle key press
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSave();
        } else if (e.key === 'Escape') {
            handleCancel();
        }
    }, [handleSave, handleCancel]);

    if (!editingScrubbleNumber) return null;

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onKeyDown={handleKeyDown}
        >
            <div className="bg-background border rounded-xl shadow-2xl w-[90vw] max-w-md max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        Edit Scrubbable Number
                    </h2>
                    <button
                        onClick={handleCancel}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-4 space-y-4">
                    {/* Variable Name */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Variable Name <span className="text-muted-foreground">(optional)</span>
                        </label>
                        <input
                            type="text"
                            value={varName}
                            onChange={(e) => setVarName(e.target.value)}
                            className="w-full px-3 py-2 text-sm bg-muted/30 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D81B60]"
                            placeholder="e.g., wedgeCount"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            If set, this variable will be synced with global state
                        </p>
                    </div>

                    {/* Default Value */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Default Value</label>
                        <input
                            type="number"
                            value={defaultValue}
                            onChange={(e) => setDefaultValue(parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 text-sm bg-muted/30 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D81B60]"
                        />
                    </div>

                    {/* Min / Max Row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Min</label>
                            <input
                                type="number"
                                value={min}
                                onChange={(e) => setMin(parseFloat(e.target.value) || 0)}
                                className="w-full px-3 py-2 text-sm bg-muted/30 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D81B60]"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Max</label>
                            <input
                                type="number"
                                value={max}
                                onChange={(e) => setMax(parseFloat(e.target.value) || 0)}
                                className="w-full px-3 py-2 text-sm bg-muted/30 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D81B60]"
                            />
                        </div>
                    </div>

                    {/* Step */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Step</label>
                        <input
                            type="number"
                            value={step}
                            onChange={(e) => setStep(parseFloat(e.target.value) || 1)}
                            className="w-full px-3 py-2 text-sm bg-muted/30 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D81B60]"
                            min={0.001}
                            step={0.1}
                        />
                    </div>

                    {/* Preview */}
                    <div>
                        <label className="text-sm font-medium mb-2 block">Preview</label>
                        <div className="p-4 bg-muted/20 rounded-lg flex items-center justify-center">
                            <span className="inline-flex items-center gap-1 text-lg">
                                The value is{" "}
                                <span
                                    className="font-medium cursor-ew-resize"
                                    style={{
                                        color: '#D81B60',
                                        borderBottom: '2px solid #D81B60',
                                        paddingBottom: '1px',
                                    }}
                                >
                                    {defaultValue}
                                </span>
                            </span>
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <p className="text-sm text-destructive">{error}</p>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-2 px-4 py-3 border-t bg-muted/30">
                    <button
                        onClick={handleCancel}
                        className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors"
                        style={{ backgroundColor: '#D81B60' }}
                    >
                        Apply Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ScrubbleNumberEditorModal;
