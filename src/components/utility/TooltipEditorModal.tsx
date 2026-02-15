import React, { useState, useEffect, useCallback } from 'react';
import { useEditing } from '@/contexts/EditingContext';

export const TooltipEditorModal: React.FC = () => {
    const { editingTooltip, closeTooltipEditor, saveTooltipEdit } = useEditing();

    const [text, setText] = useState('');
    const [tooltip, setTooltip] = useState('');
    const [position, setPosition] = useState('auto');
    const [color, setColor] = useState('#F59E0B');
    const [bgColor, setBgColor] = useState('rgba(245, 158, 11, 0.15)');
    const [maxWidth, setMaxWidth] = useState(400);
    const [error, setError] = useState<string | null>(null);

    const COLOR_PRESETS = [
        '#F59E0B', // Amber (default)
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
        'rgba(245, 158, 11, 0.15)',   // Amber (default)
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
        if (editingTooltip) {
            setText(editingTooltip.text || '');
            setTooltip(editingTooltip.tooltip || '');
            setPosition(editingTooltip.position || 'auto');
            setColor(editingTooltip.color || '#F59E0B');
            setBgColor(editingTooltip.bgColor || 'rgba(245, 158, 11, 0.15)');
            setMaxWidth(editingTooltip.maxWidth || 400);
            setError(null);
        }
    }, [editingTooltip]);

    const validate = useCallback(() => {
        if (!tooltip.trim()) {
            setError('Tooltip content is required');
            return false;
        }
        setError(null);
        return true;
    }, [tooltip]);

    const handleSave = useCallback(() => {
        if (!validate()) return;

        saveTooltipEdit({
            text: text || undefined,
            tooltip: tooltip.trim(),
            color,
            bgColor: bgColor || undefined,
            position,
            maxWidth,
        });
    }, [text, tooltip, color, bgColor, position, maxWidth, validate, saveTooltipEdit]);

    const handleCancel = useCallback(() => {
        closeTooltipEditor();
    }, [closeTooltipEditor]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            handleCancel();
        }
    }, [handleCancel]);

    if (!editingTooltip) return null;

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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Edit Tooltip
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
                    {/* Trigger Text */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Trigger Text <span className="text-muted-foreground">(optional)</span>
                        </label>
                        <input
                            type="text"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            className="w-full px-3 py-2 text-sm bg-muted/30 border rounded-lg focus:outline-none focus:ring-2"
                            style={{ '--tw-ring-color': color } as React.CSSProperties}
                            placeholder="e.g., circle, radius"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            The word or phrase that users hover over
                        </p>
                    </div>

                    {/* Tooltip Content */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Tooltip Content <span className="text-destructive">*</span>
                        </label>
                        <textarea
                            value={tooltip}
                            onChange={(e) => setTooltip(e.target.value)}
                            className="w-full px-3 py-2 text-sm bg-muted/30 border rounded-lg focus:outline-none focus:ring-2 resize-y min-h-[80px]"
                            style={{ '--tw-ring-color': color } as React.CSSProperties}
                            placeholder="Definition or explanation shown on hover..."
                            rows={3}
                        />
                    </div>

                    {/* Position */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Position</label>
                        <select
                            value={position}
                            onChange={(e) => setPosition(e.target.value)}
                            className="w-full px-3 py-2 text-sm bg-muted/30 border rounded-lg focus:outline-none focus:ring-2"
                            style={{ '--tw-ring-color': color } as React.CSSProperties}
                        >
                            <option value="auto">Auto (smart positioning)</option>
                            <option value="top">Top</option>
                            <option value="bottom">Bottom</option>
                        </select>
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
                                placeholder="#F59E0B"
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
                            placeholder="rgba(245, 158, 11, 0.15)"
                        />
                    </div>

                    {/* Preview */}
                    <div>
                        <label className="text-sm font-medium mb-2 block">Preview</label>
                        <div className="p-4 bg-muted/20 rounded-lg">
                            <span className="text-lg">
                                Hover over the{" "}
                                <span
                                    className="font-medium"
                                    style={{
                                        color: color,
                                        background: bgColor,
                                        borderRadius: '2px',
                                        padding: '0 2px',
                                        cursor: 'help',
                                    }}
                                >
                                    {text || 'term'}
                                </span>
                                {" "}to see a tooltip
                            </span>
                            {tooltip && (
                                <div
                                    className="mt-3 rounded-lg text-white text-sm"
                                    style={{
                                        background: color,
                                        padding: '10px 14px',
                                        maxWidth: `${maxWidth}px`,
                                        lineHeight: 1.5,
                                    }}
                                >
                                    {tooltip}
                                </div>
                            )}
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

export default TooltipEditorModal;
