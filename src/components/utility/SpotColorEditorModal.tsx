import React, { useState, useEffect, useCallback } from 'react';
import { useEditing } from '@/contexts/EditingContext';
import { useVariableStore } from '@/stores';
import { COLOR_PRESETS_EXTENDED, BRAND_GREEN } from './editorColors';

interface SpotColorEditorModalProps {
    // Props are managed via EditingContext
}

export const SpotColorEditorModal: React.FC<SpotColorEditorModalProps> = () => {
    const { editingSpotColor, closeSpotColorEditor, saveSpotColorEdit } = useEditing();

    const [varName, setVarName] = useState('');
    const [text, setText] = useState('');
    const [color, setColor] = useState(BRAND_GREEN);

    const COLOR_PRESETS = COLOR_PRESETS_EXTENDED;

    // Compute contrast text color for preview
    const getTextColor = useCallback((bgColor: string) => {
        const hex = bgColor.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16) / 255;
        const g = parseInt(hex.substring(2, 4), 16) / 255;
        const b = parseInt(hex.substring(4, 6), 16) / 255;
        const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        return lum > 0.45 ? '#1a1a2e' : '#ffffff';
    }, []);

    // Initialize state when modal opens
    useEffect(() => {
        if (editingSpotColor) {
            setVarName(editingSpotColor.varName || '');
            setText(editingSpotColor.text || '');
            setColor(editingSpotColor.color || BRAND_GREEN);
        }
    }, [editingSpotColor]);

    // Central color store — update when saving a color change
    const setVarColor = useVariableStore(s => s.setColor);

    // Handle save
    const handleSave = useCallback(() => {
        // Update the central variable color store so all components pick up the change
        if (varName) {
            setVarColor(varName, color);
        }

        saveSpotColorEdit({
            varName: varName || undefined,
            text: text || undefined,
            color,
        });
    }, [varName, text, color, saveSpotColorEdit, setVarColor]);

    // Handle cancel
    const handleCancel = useCallback(() => {
        closeSpotColorEditor();
    }, [closeSpotColorEditor]);

    // Handle key press
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSave();
        } else if (e.key === 'Escape') {
            handleCancel();
        }
    }, [handleSave, handleCancel]);

    if (!editingSpotColor) return null;

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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                        </svg>
                        Edit Spot Color
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
                            Variable Name <span className="text-muted-foreground">(required)</span>
                        </label>
                        <input
                            type="text"
                            value={varName}
                            onChange={(e) => setVarName(e.target.value)}
                            className="w-full px-3 py-2 text-sm bg-muted/30 border rounded-lg focus:outline-none focus:ring-2"
                            style={{ '--tw-ring-color': BRAND_GREEN } as React.CSSProperties}
                            placeholder="e.g., radius"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            Unique name to identify this color (used in formulas with \clr&#123;name&#125;&#123;...&#125;)
                        </p>
                    </div>

                    {/* Display Text */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Display Text <span className="text-muted-foreground">(optional)</span>
                        </label>
                        <input
                            type="text"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            className="w-full px-3 py-2 text-sm bg-muted/30 border rounded-lg focus:outline-none focus:ring-2"
                            style={{ '--tw-ring-color': BRAND_GREEN } as React.CSSProperties}
                            placeholder="e.g., radius"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            The text shown inside the colored pill
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
                                style={{ '--tw-ring-color': BRAND_GREEN } as React.CSSProperties}
                                placeholder={BRAND_GREEN}
                                maxLength={7}
                            />
                        </div>
                    </div>

                    {/* Preview */}
                    <div>
                        <label className="text-sm font-medium mb-2 block">Preview</label>
                        <div className="p-4 bg-muted/20 rounded-lg flex items-center justify-center">
                            <span className="inline-flex items-center gap-1 text-lg">
                                The{" "}
                                <span
                                    className="inline-flex items-center rounded-md font-semibold"
                                    style={{
                                        backgroundColor: color,
                                        color: getTextColor(color),
                                        padding: '1px 6px',
                                        fontSize: '0.92em',
                                        letterSpacing: '0.01em',
                                        boxShadow: `0 1px 3px ${color}44`,
                                    }}
                                >
                                    {text || varName || 'variable'}
                                </span>
                                {" "}is important.
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
                        className={`px-4 py-2 text-sm font-medium bg-[${BRAND_GREEN}] text-white rounded-lg hover:bg-[${BRAND_GREEN}]/90 transition-colors`}
                    >
                        Apply Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SpotColorEditorModal;
