import React, { useState, useEffect, useCallback } from 'react';
import { Play, RefreshCw, Zap } from 'lucide-react';
import { useEditing } from '@/contexts/EditingContext';

const parseValue = (raw: string): string | number | boolean => {
    if (raw === 'true') return true;
    if (raw === 'false') return false;
    const num = Number(raw);
    if (!isNaN(num) && raw.trim() !== '') return num;
    return raw;
};

export const TriggerEditorModal: React.FC = () => {
    const { editingTrigger, closeTriggerEditor, saveTriggerEdit } = useEditing();

    const [text, setText] = useState('');
    const [varName, setVarName] = useState('');
    const [valueStr, setValueStr] = useState('');
    const [iconType, setIconType] = useState('none');
    const [color, setColor] = useState('#10B981');
    const [bgColor, setBgColor] = useState('rgba(16, 185, 129, 0.15)');

    const COLOR_PRESETS = [
        '#10B981', // Emerald (default)
        '#3B82F6', // Blue
        '#D946EF', // Fuchsia
        '#F59E0B', // Amber
        '#EF4444', // Red
        '#8B5CF6', // Violet
        '#06B6D4', // Cyan
        '#F97316', // Orange
        '#EC4899', // Pink
        '#6366F1', // Indigo
    ];

    const BG_COLOR_PRESETS = [
        'rgba(16, 185, 129, 0.15)',   // Emerald (default)
        'rgba(59, 130, 246, 0.15)',   // Blue
        'rgba(217, 70, 239, 0.15)',   // Fuchsia
        'rgba(245, 158, 11, 0.15)',   // Amber
        'rgba(239, 68, 68, 0.15)',    // Red
        'rgba(139, 92, 246, 0.15)',   // Violet
        'rgba(6, 182, 212, 0.15)',    // Cyan
        'rgba(249, 115, 22, 0.15)',   // Orange
        'rgba(236, 72, 153, 0.15)',   // Pink
        'rgba(99, 102, 241, 0.15)',   // Indigo
    ];

    // Initialize state when modal opens
    useEffect(() => {
        if (editingTrigger) {
            setText(editingTrigger.text || '');
            setVarName(editingTrigger.varName || '');
            setValueStr(editingTrigger.value !== undefined ? String(editingTrigger.value) : '');
            setIconType(editingTrigger.icon || 'none');
            setColor(editingTrigger.color || '#10B981');
            setBgColor(editingTrigger.bgColor || 'rgba(16, 185, 129, 0.15)');
        }
    }, [editingTrigger]);

    const handleSave = useCallback(() => {
        saveTriggerEdit({
            text: text || undefined,
            varName: varName || undefined,
            value: valueStr ? parseValue(valueStr) : undefined,
            color,
            bgColor: bgColor || undefined,
            icon: iconType !== 'none' ? iconType : undefined,
        });
    }, [text, varName, valueStr, iconType, color, bgColor, saveTriggerEdit]);

    const handleCancel = useCallback(() => {
        closeTriggerEditor();
    }, [closeTriggerEditor]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            handleCancel();
        }
    }, [handleCancel]);

    if (!editingTrigger) return null;

    const IconComponent = iconType === 'play' ? Play : iconType === 'refresh' ? RefreshCw : iconType === 'zap' ? Zap : null;

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onKeyDown={handleKeyDown}
        >
            <div className="bg-background border rounded-xl shadow-2xl w-[90vw] max-w-md max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Zap className="w-5 h-5" style={{ color: '#10B981' }} />
                        Edit Trigger
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
                            Trigger Text
                        </label>
                        <input
                            type="text"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            className="w-full px-3 py-2 text-sm bg-muted/30 border rounded-lg focus:outline-none focus:ring-2"
                            style={{ '--tw-ring-color': color } as React.CSSProperties}
                            placeholder="e.g., reset speed, max it out"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            The clickable label text
                        </p>
                    </div>

                    {/* Variable Name */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Variable Name
                        </label>
                        <input
                            type="text"
                            value={varName}
                            onChange={(e) => setVarName(e.target.value)}
                            className="w-full px-3 py-2 text-sm bg-muted/30 border rounded-lg focus:outline-none focus:ring-2 font-mono"
                            style={{ '--tw-ring-color': color } as React.CSSProperties}
                            placeholder="e.g., animationSpeed"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            Which global variable to set on click
                        </p>
                    </div>

                    {/* Value */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Value
                        </label>
                        <input
                            type="text"
                            value={valueStr}
                            onChange={(e) => setValueStr(e.target.value)}
                            className="w-full px-3 py-2 text-sm bg-muted/30 border rounded-lg focus:outline-none focus:ring-2 font-mono"
                            style={{ '--tw-ring-color': color } as React.CSSProperties}
                            placeholder="e.g., 0, true, fast"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            Value to set (numbers, true/false, or strings)
                        </p>
                    </div>

                    {/* Icon */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Icon</label>
                        <select
                            value={iconType}
                            onChange={(e) => setIconType(e.target.value)}
                            className="w-full px-3 py-2 text-sm bg-muted/30 border rounded-lg focus:outline-none focus:ring-2"
                            style={{ '--tw-ring-color': color } as React.CSSProperties}
                        >
                            <option value="none">None</option>
                            <option value="play">Play</option>
                            <option value="refresh">Refresh</option>
                            <option value="zap">Zap</option>
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
                                placeholder="#10B981"
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
                            placeholder="rgba(16, 185, 129, 0.15)"
                        />
                    </div>

                    {/* Preview */}
                    <div>
                        <label className="text-sm font-medium mb-2 block">Preview</label>
                        <div className="p-4 bg-muted/20 rounded-lg">
                            <span className="text-lg">
                                Click{" "}
                                <span
                                    className="font-medium cursor-pointer"
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        color: color,
                                        borderBottom: `2px solid ${color}`,
                                        paddingBottom: '1px',
                                    }}
                                >
                                    {text || 'trigger'}
                                    {IconComponent && (
                                        <span style={{ display: 'inline-flex', opacity: 0.6 }}>
                                            <IconComponent size={14} />
                                        </span>
                                    )}
                                </span>
                                {" "}to set {varName || 'variable'} = {valueStr || '?'}
                            </span>
                        </div>
                    </div>
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

export default TriggerEditorModal;
