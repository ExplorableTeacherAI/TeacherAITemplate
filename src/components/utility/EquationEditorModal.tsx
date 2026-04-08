import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useEditing } from '@/contexts/EditingContext';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { cn } from '@/lib/utils';
import { useVariableStore } from '@/stores';
import { COLOR_PRESETS_NAMED, BRAND_GREEN, ACCENT_VIOLET } from './editorColors';

import { createPortal } from 'react-dom';

interface TermEditorProps {
    termName: string;
    content: string;
    color: string;
    onUpdate: (termName: string, content: string, color: string) => void;
    onRemove: (termName: string) => void;
}

const TermEditor: React.FC<TermEditorProps> = ({
    termName,
    content,
    color,
    onUpdate,
    onRemove,
}) => {
    const [localContent, setLocalContent] = useState(content);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [pickerPosition, setPickerPosition] = useState({ top: 0, left: 0 });

    // Update position when picker opens
    useEffect(() => {
        if (showColorPicker && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            // Position below the button, slightly offset to left to align with edge if close to screen edge
            setPickerPosition({
                top: rect.bottom + 8 + window.scrollY,
                left: rect.left + window.scrollX - 100, // Shift left to keep in viewport usually
            });
        }
    }, [showColorPicker]);

    // Close picker when clicking outside
    useEffect(() => {
        if (!showColorPicker) return;

        const handleClickOutside = (e: MouseEvent) => {
            if (buttonRef.current && !buttonRef.current.contains(e.target as Node)) {
                // Check if click is inside the portal (we can't easily check ref inside portal here without more state)
                // A simple trick is to check if the target has a specific class or check closest
                const target = e.target as HTMLElement;
                if (!target.closest('.color-picker-portal')) {
                    setShowColorPicker(false);
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showColorPicker]);

    return (
        <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-md relative">
            {/* Term name */}
            <span className="text-xs font-mono text-muted-foreground min-w-[60px]">
                {termName}
            </span>

            {/* Content input */}
            <input
                type="text"
                value={localContent}
                onChange={(e) => setLocalContent(e.target.value)}
                onBlur={() => onUpdate(termName, localContent, color)}
                className="flex-1 px-2 py-1 text-sm bg-background border rounded"
                placeholder="Content"
            />

            {/* Color picker trigger */}
            <button
                ref={buttonRef}
                className="w-6 h-6 rounded border-2 border-white shadow-sm flex-shrink-0"
                style={{ backgroundColor: color }}
                onClick={() => setShowColorPicker(!showColorPicker)}
                title="Change color"
            />

            {/* Color picker portal */}
            {showColorPicker && createPortal(
                <div
                    className="color-picker-portal fixed z-[10000] bg-popover text-popover-foreground border rounded-lg shadow-xl p-3 grid grid-cols-5 gap-2 animate-in fade-in zoom-in-95 duration-100"
                    style={{
                        top: pickerPosition.top,
                        left: Math.max(10, Math.min(window.innerWidth - 180, pickerPosition.left)),
                        width: '180px'
                    }}
                >
                    {COLOR_PRESETS_NAMED.map((preset) => (
                        <button
                            key={preset.value}
                            className={cn(
                                "w-6 h-6 rounded-full border-2 transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                                color.toLowerCase() === preset.value.toLowerCase() ? "border-foreground ring-2 ring-offset-1 ring-foreground/20" : "border-transparent"
                            )}
                            style={{ backgroundColor: preset.value }}
                            onClick={() => {
                                onUpdate(termName, localContent, preset.value);
                                setShowColorPicker(false);
                            }}
                            title={preset.name}
                        />
                    ))}
                    {/* Input for custom hex */}
                    <div className="col-span-5 pt-2 mt-1 border-t flex items-center gap-1">
                        <span className="text-xs text-muted-foreground">#</span>
                        <input
                            type="text"
                            className="w-full text-xs bg-muted/50 rounded px-1 py-0.5 border-none focus:ring-1 focus:ring-primary"
                            value={color.replace('#', '')}
                            onChange={(e) => {
                                const val = e.target.value;
                                if (/^[0-9a-fA-F]{0,6}$/.test(val)) {
                                    onUpdate(termName, localContent, '#' + val);
                                }
                            }}
                        />
                    </div>
                </div>,
                document.body
            )}

            {/* Remove button */}
            <button
                onClick={() => onRemove(termName)}
                className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                title="Remove term"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
};

export const InlineFormulaEditorModal: React.FC = () => {
    const { editingInlineFormula, closeInlineFormulaEditor, saveInlineFormulaEdit } = useEditing();

    const [latex, setLatex] = useState('');
    const [colorMap, setColorMap] = useState<Record<string, string>>({});
    const [terms, setTerms] = useState<{ name: string; content: string; color: string }[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'latex' | 'terms'>('latex');

    const previewRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Initialize state when formula opens for editing
    useEffect(() => {
        if (editingInlineFormula) {
            setLatex(editingInlineFormula.latex || '');
            setColorMap(editingInlineFormula.colorMap || {});
            setActiveTab('latex');
            parseTermsFromLatex(editingInlineFormula.latex || '', editingInlineFormula.colorMap || {});
        }
    }, [editingInlineFormula]);

    // Parse \clr{term}{content} from LaTeX (deduplicated by term name)
    const parseTermsFromLatex = useCallback((latexStr: string, currentColors: Record<string, string>) => {
        const pattern = /\\clr\s*\{\s*([^}]+)\s*\}\s*\{\s*([^}]+)\s*\}/g;
        const foundTerms: { name: string; content: string; color: string }[] = [];
        const seenNames = new Set<string>();
        let match;

        const updatedColors = { ...currentColors };
        let hasNewColors = false;

        while ((match = pattern.exec(latexStr)) !== null) {
            const [, termName, content] = match;
            const cleanName = termName.trim();

            if (seenNames.has(cleanName)) continue;
            seenNames.add(cleanName);

            if (!updatedColors[cleanName]) {
                const defaultColor = COLOR_PRESETS_NAMED[foundTerms.length % COLOR_PRESETS_NAMED.length].value;
                updatedColors[cleanName] = defaultColor;
                hasNewColors = true;
            }

            foundTerms.push({
                name: cleanName,
                content: content.trim(),
                color: updatedColors[cleanName],
            });
        }

        setTerms(foundTerms);
        if (hasNewColors) {
            setColorMap(updatedColors);
        }
    }, []);

    // Render preview
    useEffect(() => {
        if (!previewRef.current || !latex) return;

        try {
            let processedLatex = latex;
            const clrPattern = /\\clr\s*\{\s*([^}]+)\s*\}\s*\{\s*([^}]+)\s*\}/g;

            processedLatex = processedLatex.replace(clrPattern, (_, termName, content) => {
                const cleanName = termName.trim();
                const color = colorMap[cleanName] || '#888888';
                return `\\textcolor{${color}}{${content}}`;
            });

            katex.render(processedLatex, previewRef.current, {
                throwOnError: false,
                trust: true,
                output: 'html',
            });
            setError(null);
        } catch (err) {
            setError((err as Error).message);
        }
    }, [latex, colorMap, activeTab]);

    const handleUpdateTerm = useCallback((termName: string, newContent: string, newColor: string) => {
        setColorMap(prev => ({ ...prev, [termName]: newColor }));
        setLatex(prev => {
            const pattern = new RegExp(`\\\\clr\\{${termName}\\}\\{[^}]+\\}`, 'g');
            return prev.replace(pattern, `\\clr{${termName}}{${newContent}}`);
        });
        setTerms(prev =>
            prev.map(t =>
                t.name === termName
                    ? { ...t, content: newContent, color: newColor }
                    : t
            )
        );
    }, []);

    const handleRemoveTerm = useCallback((termName: string) => {
        setLatex(prev => {
            const pattern = new RegExp(`\\\\clr\\{${termName}\\}\\{([^}]+)\\}`, 'g');
            return prev.replace(pattern, '$1');
        });
        setColorMap(prev => {
            const next = { ...prev };
            delete next[termName];
            return next;
        });
        setTerms(prev => prev.filter(t => t.name !== termName));
    }, []);

    const handleSave = useCallback(() => {
        // Sync changed colors to the central variable color store
        const setColor = useVariableStore.getState().setColor;
        for (const [varName, hexColor] of Object.entries(colorMap)) {
            setColor(varName, hexColor);
        }
        // Include color from the original props to avoid spurious diffs
        // (originalProps has {latex, colorMap, color} but we were only sending {latex, colorMap}).
        const color = editingInlineFormula?.color;
        saveInlineFormulaEdit({ latex, colorMap, ...(color ? { color } : {}) });
    }, [latex, colorMap, saveInlineFormulaEdit, editingInlineFormula]);

    const handleCancel = useCallback(() => {
        closeInlineFormulaEditor();
    }, [closeInlineFormulaEditor]);

    if (!editingInlineFormula) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-background border rounded-xl shadow-2xl w-[90vw] max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        Edit Inline Formula
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

                {/* Tabs */}
                <div className="flex border-b">
                    <button
                        className={cn(
                            "px-4 py-2 text-sm font-medium transition-colors",
                            activeTab === 'latex'
                                ? `border-b-2 border-[${BRAND_GREEN}] text-[${BRAND_GREEN}]`
                                : "text-muted-foreground hover:text-foreground"
                        )}
                        onClick={() => setActiveTab('latex')}
                    >
                        LaTeX Source
                    </button>
                    <button
                        className={cn(
                            "px-4 py-2 text-sm font-medium transition-colors",
                            activeTab === 'terms'
                                ? `border-b-2 border-[${BRAND_GREEN}] text-[${BRAND_GREEN}]`
                                : "text-muted-foreground hover:text-foreground"
                        )}
                        onClick={() => setActiveTab('terms')}
                    >
                        Colored Terms ({terms.length})
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-4">
                    {activeTab === 'latex' ? (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">LaTeX Code</label>
                                <textarea
                                    ref={textareaRef}
                                    value={latex}
                                    onChange={(e) => {
                                        setLatex(e.target.value);
                                        parseTermsFromLatex(e.target.value, colorMap);
                                    }}
                                    className={`w-full h-32 px-3 py-2 font-mono text-sm bg-muted/30 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[${ACCENT_VIOLET}]`}
                                    placeholder="Enter LaTeX formula..."
                                    spellCheck={false}
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    Use <code className="bg-muted px-1 rounded">\clr{'{'}name{'}'}{'{'}content{'}'}</code> for colored terms
                                </p>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-medium">Live Preview</label>
                                </div>
                                <div
                                    ref={previewRef}
                                    className={cn(
                                        "min-h-[60px] p-4 bg-muted/20 rounded-lg flex items-center justify-center text-xl",
                                        error && "border-2 border-destructive"
                                    )}
                                />
                                {error && (
                                    <p className="text-xs text-destructive mt-1">{error}</p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {terms.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <p>No colored terms found.</p>
                                    <p className="text-sm mt-1">
                                        Use the <code className="bg-muted px-1 rounded">\clr{'{'}name{'}'}{'{'}content{'}'}</code> syntax in the LaTeX Source tab to add colored terms.
                                    </p>
                                </div>
                            ) : (
                                terms.map((term) => (
                                    <TermEditor
                                        key={term.name}
                                        termName={term.name}
                                        content={term.content}
                                        color={term.color}
                                        onUpdate={handleUpdateTerm}
                                        onRemove={handleRemoveTerm}
                                    />
                                ))
                            )}
                        </div>
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

export default InlineFormulaEditorModal;
