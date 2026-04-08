import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ChevronDown } from 'lucide-react';
import { useEditing } from '@/contexts/EditingContext';
import { useVariableStore } from '@/stores';
import { useShallow } from 'zustand/react/shallow';
import { COLOR_PRESETS_EXTENDED, DEFAULT_BG_OPACITY, BRAND_GREEN } from './editorColors';
import { BgColorPicker } from './BgColorPicker';

/**
 * Scan the DOM for all InlineLinkedHighlight instances and extract their
 * highlight IDs, optionally filtering to those that use a specific varName.
 */
function discoverHighlightIds(filterVarName?: string): string[] {
    const ids = new Set<string>();
    try {
        const elements = document.querySelectorAll('[data-inline-component="inlineLinkedHighlight"]');
        elements.forEach((el) => {
            const encoded = el.getAttribute('data-component-props');
            if (!encoded) return;
            try {
                const json = atob(encoded);
                const props = JSON.parse(json) as { varName?: string; highlightId?: string };
                // If we have a filter, only include IDs from the same group
                if (filterVarName && props.varName !== filterVarName) return;
                if (props.highlightId) {
                    ids.add(props.highlightId);
                }
            } catch {
                // ignore decode/parse errors
            }
        });
    } catch {
        // ignore DOM access errors (e.g. SSR)
    }
    return [...ids].sort();
}

export const LinkedHighlightEditorModal: React.FC = () => {
    const { editingLinkedHighlight, closeLinkedHighlightEditor, saveLinkedHighlightEdit } = useEditing();

    // Get all existing variable names from the store
    const variableNames = useVariableStore(useShallow((state) => Object.keys(state.variables)));
    const sortedVarNames = useMemo(() => [...variableNames].sort(), [variableNames]);

    const [varName, setVarName] = useState('');
    const [isCustomVar, setIsCustomVar] = useState(false);
    const [highlightId, setHighlightId] = useState('');
    const [isCustomHighlightId, setIsCustomHighlightId] = useState(false);
    const [text, setText] = useState('');
    const [color, setColor] = useState('#3b82f6');
    const [bgColor, setBgColor] = useState('');

    const COLOR_PRESETS = COLOR_PRESETS_EXTENDED;

    // Discover existing highlight IDs on the page for the selected varName
    const existingHighlightIds = useMemo(() => {
        if (!editingLinkedHighlight) return [];
        return discoverHighlightIds(varName || undefined);
    }, [editingLinkedHighlight, varName]);

    useEffect(() => {
        if (editingLinkedHighlight) {
            const incoming = editingLinkedHighlight.varName || '';
            setVarName(incoming);
            setIsCustomVar(incoming !== '' && !variableNames.includes(incoming));
            const incomingId = editingLinkedHighlight.highlightId || '';
            setHighlightId(incomingId);
            // Check if the incoming ID is a known one or should be treated as custom
            // We'll defer the custom check until after existingHighlightIds updates
            setIsCustomHighlightId(false);
            setText(editingLinkedHighlight.text || '');
            setColor(editingLinkedHighlight.color || '#3b82f6');
            setBgColor(editingLinkedHighlight.bgColor || '');
        }
    }, [editingLinkedHighlight]);

    // Once we know the existing IDs, decide if the current ID is custom
    useEffect(() => {
        if (highlightId && existingHighlightIds.length > 0 && !existingHighlightIds.includes(highlightId)) {
            setIsCustomHighlightId(true);
        }
    }, [existingHighlightIds, highlightId]);

    const handleVarSelect = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        const selected = e.target.value;
        if (selected === '__custom__') {
            setIsCustomVar(true);
            setVarName('');
        } else {
            setIsCustomVar(false);
            setVarName(selected);
        }
    }, []);

    const handleHighlightIdSelect = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        const selected = e.target.value;
        if (selected === '__custom__') {
            setIsCustomHighlightId(true);
            setHighlightId('');
        } else {
            setIsCustomHighlightId(false);
            setHighlightId(selected);
        }
    }, []);

    const handleSave = useCallback(() => {
        saveLinkedHighlightEdit({
            varName: varName || undefined,
            highlightId: highlightId || undefined,
            text: text || undefined,
            color,
            bgColor: bgColor || undefined,
        });
    }, [varName, highlightId, text, color, bgColor, saveLinkedHighlightEdit]);

    const handleCancel = useCallback(() => {
        closeLinkedHighlightEditor();
    }, [closeLinkedHighlightEditor]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSave();
        } else if (e.key === 'Escape') {
            handleCancel();
        }
    }, [handleSave, handleCancel]);

    if (!editingLinkedHighlight) return null;

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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        Edit Linked Highlight
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
                    {/* Variable Name (group) — dropdown */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Group Variable <span className="text-muted-foreground">(required)</span>
                        </label>
                        <div className="relative">
                            <select
                                value={isCustomVar ? '__custom__' : varName}
                                onChange={handleVarSelect}
                                className="w-full px-3 py-2 text-sm bg-muted/30 border rounded-lg focus:outline-none focus:ring-2 font-mono appearance-none cursor-pointer pr-8"
                                style={{ '--tw-ring-color': BRAND_GREEN } as React.CSSProperties}
                            >
                                <option value="">— Select a variable —</option>
                                {sortedVarNames.map((name) => (
                                    <option key={name} value={name}>
                                        {name}
                                    </option>
                                ))}
                                <option value="__custom__">✏️ Custom...</option>
                            </select>
                            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-muted-foreground" />
                        </div>
                        {isCustomVar && (
                            <input
                                type="text"
                                value={varName}
                                onChange={(e) => setVarName(e.target.value)}
                                className="w-full mt-2 px-3 py-2 text-sm bg-muted/30 border rounded-lg focus:outline-none focus:ring-2 font-mono"
                                style={{ '--tw-ring-color': BRAND_GREEN } as React.CSSProperties}
                                placeholder="Enter custom variable name"
                                autoFocus
                            />
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                            Shared variable name for the highlight group. All highlights with the same name coordinate together.
                        </p>
                    </div>

                    {/* Highlight ID — dropdown with existing IDs + custom option */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Highlight ID <span className="text-muted-foreground">(required)</span>
                        </label>
                        {existingHighlightIds.length > 0 ? (
                            <>
                                <div className="relative">
                                    <select
                                        value={isCustomHighlightId ? '__custom__' : highlightId}
                                        onChange={handleHighlightIdSelect}
                                        className="w-full px-3 py-2 text-sm bg-muted/30 border rounded-lg focus:outline-none focus:ring-2 font-mono appearance-none cursor-pointer pr-8"
                                        style={{ '--tw-ring-color': BRAND_GREEN } as React.CSSProperties}
                                    >
                                        <option value="">— Select a highlight ID —</option>
                                        {existingHighlightIds.map((id) => (
                                            <option key={id} value={id}>
                                                {id}
                                            </option>
                                        ))}
                                        <option value="__custom__">✏️ New custom ID...</option>
                                    </select>
                                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-muted-foreground" />
                                </div>
                                {isCustomHighlightId && (
                                    <input
                                        type="text"
                                        value={highlightId}
                                        onChange={(e) => setHighlightId(e.target.value)}
                                        className="w-full mt-2 px-3 py-2 text-sm bg-muted/30 border rounded-lg focus:outline-none focus:ring-2 font-mono"
                                        style={{ '--tw-ring-color': BRAND_GREEN } as React.CSSProperties}
                                        placeholder="Enter a new highlight ID"
                                        autoFocus
                                    />
                                )}
                            </>
                        ) : (
                            <input
                                type="text"
                                value={highlightId}
                                onChange={(e) => setHighlightId(e.target.value)}
                                className="w-full px-3 py-2 text-sm bg-muted/30 border rounded-lg focus:outline-none focus:ring-2 font-mono"
                                style={{ '--tw-ring-color': BRAND_GREEN } as React.CSSProperties}
                                placeholder="e.g., radius"
                            />
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                            Unique ID written to the store on hover. Other components read this to highlight matching parts.
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
                                placeholder="#3b82f6"
                                maxLength={7}
                            />
                        </div>
                    </div>

                    {/* Background Color */}
                    <BgColorPicker
                        bgColor={bgColor}
                        onChange={setBgColor}
                        presets={COLOR_PRESETS}
                        defaultOpacity={DEFAULT_BG_OPACITY}
                        label="Active Background (optional)"
                    />

                    {/* Preview */}
                    <div>
                        <label className="text-sm font-medium mb-2 block">Preview</label>
                        <div className="p-4 bg-muted/20 rounded-lg">
                            <span className="text-base">
                                Hover over the{" "}
                                <span
                                    style={{
                                        color,
                                        textDecoration: 'underline',
                                        textDecorationStyle: 'dotted',
                                        textDecorationColor: color,
                                        backgroundColor: bgColor || `${color}22`,
                                        padding: '1px 4px',
                                        borderRadius: 4,
                                        fontWeight: 500,
                                    }}
                                >
                                    {text || highlightId || 'term'}
                                </span>
                                {" "}to highlight linked parts of the visual.
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
                        className="px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 transition-colors"
                        style={{ backgroundColor: BRAND_GREEN }}
                    >
                        Apply Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LinkedHighlightEditorModal;
