import React, { useState, useEffect, useCallback } from 'react';
import { useEditing } from '@/contexts/EditingContext';
import { COLOR_PRESETS_STANDARD, CLOZE_BG_OPACITY, BRAND_GREEN } from './editorColors';
import { BgColorPicker } from './BgColorPicker';

export const ClozeInputEditorModal: React.FC = () => {
    const { editingClozeInput, closeClozeInputEditor, saveClozeInputEdit } = useEditing();

    const [varName, setVarName] = useState('');
    const [correctAnswer, setCorrectAnswer] = useState('');
    const [placeholder, setPlaceholder] = useState('???');
    const [caseSensitive, setCaseSensitive] = useState(false);
    const [color, setColor] = useState('#3B82F6');
    const [bgColor, setBgColor] = useState('rgba(59, 130, 246, 0.35)');
    const [error, setError] = useState<string | null>(null);

    const COLOR_PRESETS = COLOR_PRESETS_STANDARD;

    // Initialize state when modal opens
    useEffect(() => {
        if (editingClozeInput) {
            setVarName(editingClozeInput.varName || '');
            setCorrectAnswer(editingClozeInput.correctAnswer || '');
            setPlaceholder(editingClozeInput.placeholder || '???');
            setCaseSensitive(editingClozeInput.caseSensitive ?? false);
            setColor(editingClozeInput.color || BRAND_GREEN);
            setBgColor(editingClozeInput.bgColor || 'rgba(59, 130, 246, 0.35)');
            setError(null);
        }
    }, [editingClozeInput]);

    const validate = useCallback(() => {
        if (!correctAnswer.trim()) {
            setError('Correct answer is required');
            return false;
        }
        setError(null);
        return true;
    }, [correctAnswer]);

    const handleSave = useCallback(() => {
        if (!validate()) return;

        saveClozeInputEdit({
            varName: varName || undefined,
            correctAnswer,
            placeholder: placeholder || undefined,
            color,
            bgColor: bgColor || undefined,
            caseSensitive,
        });
    }, [varName, correctAnswer, placeholder, caseSensitive, color, bgColor, validate, saveClozeInputEdit]);

    const handleCancel = useCallback(() => {
        closeClozeInputEditor();
    }, [closeClozeInputEditor]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSave();
        } else if (e.key === 'Escape') {
            handleCancel();
        }
    }, [handleSave, handleCancel]);

    if (!editingClozeInput) return null;

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
                        Edit Cloze Input
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
                            className="w-full px-3 py-2 text-sm bg-muted/30 border rounded-lg focus:outline-none focus:ring-2"
                            style={{ '--tw-ring-color': BRAND_GREEN } as React.CSSProperties}
                            placeholder="e.g., quarterCircleAngle"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            If set, the student's answer will be synced with global state
                        </p>
                    </div>

                    {/* Correct Answer */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Correct Answer <span className="text-destructive">*</span>
                        </label>
                        <input
                            type="text"
                            value={correctAnswer}
                            onChange={(e) => setCorrectAnswer(e.target.value)}
                            className="w-full px-3 py-2 text-sm bg-muted/30 border rounded-lg focus:outline-none focus:ring-2"
                            style={{ '--tw-ring-color': BRAND_GREEN } as React.CSSProperties}
                            placeholder="e.g., 90"
                        />
                    </div>

                    {/* Placeholder */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Placeholder</label>
                        <input
                            type="text"
                            value={placeholder}
                            onChange={(e) => setPlaceholder(e.target.value)}
                            className="w-full px-3 py-2 text-sm bg-muted/30 border rounded-lg focus:outline-none focus:ring-2"
                            style={{ '--tw-ring-color': BRAND_GREEN } as React.CSSProperties}
                            placeholder="???"
                        />
                    </div>

                    {/* Case Sensitive */}
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="caseSensitive"
                            checked={caseSensitive}
                            onChange={(e) => setCaseSensitive(e.target.checked)}
                            className="w-4 h-4 rounded border-gray-300"
                        />
                        <label htmlFor="caseSensitive" className="text-sm font-medium">
                            Case Sensitive
                        </label>
                    </div>

                    {/* Color */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Color</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {COLOR_PRESETS.map((preset) => (
                                <button
                                    key={preset}
                                    type="button"
                                    onClick={() => setColor(preset)}
                                    className="w-7 h-7 rounded-full border-2 transition-all duration-150 hover:scale-110"
                                    style={{
                                        backgroundColor: preset,
                                        borderColor: color === preset ? 'currentColor' : 'transparent',
                                        boxShadow: color === preset ? `0 0 0 2px ${preset}40` : 'none',
                                    }}
                                    title={preset}
                                />
                            ))}
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                                className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                            />
                            <input
                                type="text"
                                value={color}
                                onChange={(e) => {
                                    const v = e.target.value;
                                    if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) setColor(v);
                                }}
                                className="flex-1 px-3 py-1.5 text-sm bg-muted/30 border rounded-lg focus:outline-none focus:ring-2 font-mono"
                                style={{ '--tw-ring-color': BRAND_GREEN } as React.CSSProperties}
                                placeholder="#3B82F6"
                                maxLength={7}
                            />
                        </div>
                    </div>

                    {/* Background Color */}
                    <BgColorPicker
                        bgColor={bgColor}
                        onChange={setBgColor}
                        presets={COLOR_PRESETS}
                        defaultOpacity={CLOZE_BG_OPACITY}
                    />

                    {/* Preview */}
                    <div>
                        <label className="text-sm font-medium mb-2 block">Preview</label>
                        <div className="p-4 bg-muted/20 rounded-lg flex items-center justify-center">
                            <span className="inline-flex items-center gap-1 text-lg">
                                The answer is{" "}
                                <span
                                    className="px-1 rounded font-medium"
                                    style={{
                                        backgroundColor: bgColor,
                                        color: color,
                                    }}
                                >
                                    {placeholder || '???'}
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
                        className={`px-4 py-2 text-sm font-medium bg-[${BRAND_GREEN}] text-white rounded-lg hover:bg-[${BRAND_GREEN}]/90 transition-colors`}
                    >
                        Apply Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ClozeInputEditorModal;
