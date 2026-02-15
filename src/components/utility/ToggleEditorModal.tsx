import React, { useState, useEffect, useCallback } from 'react';
import { useEditing } from '@/contexts/EditingContext';

export const ToggleEditorModal: React.FC = () => {
    const { editingToggle, closeToggleEditor, saveToggleEdit } = useEditing();

    const [varName, setVarName] = useState('');
    const [options, setOptions] = useState<string[]>(['Option 1', 'Option 2']);
    const [color, setColor] = useState('#D946EF');
    const [bgColor, setBgColor] = useState('rgba(217, 70, 239, 0.15)');
    const [error, setError] = useState<string | null>(null);

    const COLOR_PRESETS = [
        '#D946EF', // Fuchsia (default)
        '#3B82F6', // Blue
        '#D81B60', // Pink/Red
        '#E53935', // Red
        '#F57C00', // Orange
        '#FDD835', // Yellow
        '#43A047', // Green
        '#00897B', // Teal
        '#5E35B1', // Purple
        '#546E7A', // Blue Grey
    ];

    const BG_COLOR_PRESETS = [
        'rgba(217, 70, 239, 0.15)',   // Fuchsia (default)
        'rgba(59, 130, 246, 0.15)',   // Blue
        'rgba(216, 27, 96, 0.15)',    // Pink/Red
        'rgba(229, 57, 53, 0.15)',    // Red
        'rgba(245, 124, 0, 0.15)',    // Orange
        'rgba(253, 216, 53, 0.15)',   // Yellow
        'rgba(67, 160, 71, 0.15)',    // Green
        'rgba(0, 137, 123, 0.15)',    // Teal
        'rgba(94, 53, 177, 0.15)',    // Purple
        'rgba(84, 110, 122, 0.15)',   // Blue Grey
    ];

    // Initialize state when modal opens
    useEffect(() => {
        if (editingToggle) {
            setVarName(editingToggle.varName || '');
            setOptions(editingToggle.options || ['Option 1', 'Option 2']);
            setColor(editingToggle.color || '#D946EF');
            setBgColor(editingToggle.bgColor || 'rgba(217, 70, 239, 0.15)');
            setError(null);
        }
    }, [editingToggle]);

    const validate = useCallback(() => {
        if (options.length < 2) {
            setError('At least 2 options are required');
            return false;
        }
        if (options.some(o => o.trim() === '')) {
            setError('All options must have text');
            return false;
        }
        setError(null);
        return true;
    }, [options]);

    const handleSave = useCallback(() => {
        if (!validate()) return;

        saveToggleEdit({
            varName: varName || undefined,
            options: options.filter(o => o.trim() !== ''),
            color,
            bgColor: bgColor || undefined,
        });
    }, [varName, options, color, bgColor, validate, saveToggleEdit]);

    const handleCancel = useCallback(() => {
        closeToggleEditor();
    }, [closeToggleEditor]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            handleCancel();
        }
    }, [handleCancel]);

    const handleAddOption = useCallback(() => {
        setOptions(prev => [...prev, '']);
    }, []);

    const handleRemoveOption = useCallback((index: number) => {
        setOptions(prev => prev.filter((_, i) => i !== index));
    }, []);

    const handleOptionChange = useCallback((index: number, value: string) => {
        setOptions(prev => {
            const updated = [...prev];
            updated[index] = value;
            return updated;
        });
    }, []);

    if (!editingToggle) return null;

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
                        Edit Toggle
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
                            style={{ '--tw-ring-color': color } as React.CSSProperties}
                            placeholder="e.g., currentShape"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            If set, the current selection will be synced with global state
                        </p>
                    </div>

                    {/* Options */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Options <span className="text-destructive">*</span>
                        </label>
                        <div className="space-y-2">
                            {options.map((option, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground w-5 text-right">{index + 1}.</span>
                                    <input
                                        type="text"
                                        value={option}
                                        onChange={(e) => handleOptionChange(index, e.target.value)}
                                        className="flex-1 px-3 py-1.5 text-sm bg-muted/30 border rounded-lg focus:outline-none focus:ring-2"
                                        style={{ '--tw-ring-color': color } as React.CSSProperties}
                                        placeholder={`Option ${index + 1}`}
                                    />
                                    {options.length > 2 && (
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveOption(index)}
                                            className="text-muted-foreground hover:text-destructive transition-colors"
                                            title="Remove option"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        <button
                            type="button"
                            onClick={handleAddOption}
                            className="mt-2 text-sm font-medium transition-colors hover:opacity-80"
                            style={{ color }}
                        >
                            + Add Option
                        </button>
                        <p className="text-xs text-muted-foreground mt-1">
                            Click cycles through options in order, then wraps around
                        </p>
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
                                style={{ '--tw-ring-color': color } as React.CSSProperties}
                                placeholder="#D946EF"
                                maxLength={7}
                            />
                        </div>
                    </div>

                    {/* Background Color */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Background Color</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {BG_COLOR_PRESETS.map((preset, i) => (
                                <button
                                    key={preset}
                                    type="button"
                                    onClick={() => setBgColor(preset)}
                                    className="w-7 h-7 rounded-full border-2 transition-all duration-150 hover:scale-110"
                                    style={{
                                        backgroundColor: preset,
                                        borderColor: bgColor === preset ? COLOR_PRESETS[i] : 'transparent',
                                        boxShadow: bgColor === preset ? `0 0 0 2px ${COLOR_PRESETS[i]}40` : 'none',
                                    }}
                                    title={preset}
                                />
                            ))}
                        </div>
                        <input
                            type="text"
                            value={bgColor}
                            onChange={(e) => setBgColor(e.target.value)}
                            className="w-full px-3 py-1.5 text-sm bg-muted/30 border rounded-lg focus:outline-none focus:ring-2 font-mono"
                            style={{ '--tw-ring-color': color } as React.CSSProperties}
                            placeholder="rgba(217, 70, 239, 0.15)"
                        />
                    </div>

                    {/* Preview */}
                    <div>
                        <label className="text-sm font-medium mb-2 block">Preview</label>
                        <div className="p-4 bg-muted/20 rounded-lg flex items-center justify-center">
                            <span className="inline-flex items-center gap-1 text-lg">
                                The shape is a{" "}
                                <span
                                    className="font-medium cursor-pointer"
                                    style={{
                                        color: color,
                                        borderBottom: `2px dashed ${color}`,
                                        paddingBottom: '2px',
                                        background: bgColor,
                                        borderRadius: '3px 3px 0 0',
                                    }}
                                >
                                    {options[0] || 'option'}
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
                        className="px-4 py-2 text-sm font-medium bg-[#3cc499] text-white rounded-lg hover:bg-[#3cc499]/90 transition-colors"
                    >
                        Apply Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ToggleEditorModal;
