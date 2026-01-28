import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useEditing } from '@/contexts/EditingContext';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { cn } from '@/lib/utils';

// Color presets for equation terms
const COLOR_PRESETS = [
    { name: 'Red', value: '#ef4444' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Green', value: '#22c55e' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Purple', value: '#a855f7' },
    { name: 'Cyan', value: '#06b6d4' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Yellow', value: '#eab308' },
];

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

    return (
        <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-md">
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

            {/* Color picker */}
            <div className="relative">
                <button
                    className="w-6 h-6 rounded border-2 border-white shadow-sm"
                    style={{ backgroundColor: color }}
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    title="Change color"
                />

                {showColorPicker && (
                    <div className="absolute right-0 top-8 z-50 bg-background border rounded-lg shadow-lg p-2 grid grid-cols-4 gap-1">
                        {COLOR_PRESETS.map((preset) => (
                            <button
                                key={preset.value}
                                className={cn(
                                    "w-6 h-6 rounded border-2 transition-transform hover:scale-110",
                                    color === preset.value ? "border-foreground" : "border-transparent"
                                )}
                                style={{ backgroundColor: preset.value }}
                                onClick={() => {
                                    onUpdate(termName, localContent, preset.value);
                                    setShowColorPicker(false);
                                }}
                                title={preset.name}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Remove button */}
            <button
                onClick={() => onRemove(termName)}
                className="text-muted-foreground hover:text-destructive transition-colors"
                title="Remove term"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
};

export const EquationEditorModal: React.FC = () => {
    const { editingEquation, closeEquationEditor, saveEquationEdit } = useEditing();

    const [latex, setLatex] = useState('');
    const [colorMap, setColorMap] = useState<Record<string, string>>({});
    const [terms, setTerms] = useState<{ name: string; content: string; color: string }[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'latex' | 'terms'>('latex');

    const previewRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Initialize state when equation opens
    useEffect(() => {
        if (editingEquation) {
            setLatex(editingEquation.latex);
            setColorMap(editingEquation.colorMap || {});
            parseTermsFromLatex(editingEquation.latex, editingEquation.colorMap || {});
        }
    }, [editingEquation]);

    // Parse \clr{term}{content} from LaTeX
    const parseTermsFromLatex = useCallback((latexStr: string, colors: Record<string, string>) => {
        const pattern = /\\clr\{([^}]+)\}\{([^}]+)\}/g;
        const foundTerms: { name: string; content: string; color: string }[] = [];
        let match;

        while ((match = pattern.exec(latexStr)) !== null) {
            const [, termName, content] = match;
            foundTerms.push({
                name: termName,
                content: content,
                color: colors[termName] || COLOR_PRESETS[foundTerms.length % COLOR_PRESETS.length].value,
            });
        }

        setTerms(foundTerms);
    }, []);

    // Render preview
    useEffect(() => {
        if (!previewRef.current || !latex) return;

        try {
            // Process \clr{}{} syntax for preview
            let processedLatex = latex;
            const clrPattern = /\\clr\{([^}]+)\}\{([^}]+)\}/g;

            processedLatex = processedLatex.replace(clrPattern, (_, termName, content) => {
                const color = colorMap[termName] || '#888888';
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
    }, [latex, colorMap]);

    // Update term in LaTeX
    const handleUpdateTerm = useCallback((termName: string, newContent: string, newColor: string) => {
        // Update colorMap
        setColorMap(prev => ({ ...prev, [termName]: newColor }));

        // Update LaTeX content
        setLatex(prev => {
            const pattern = new RegExp(`\\\\clr\\{${termName}\\}\\{[^}]+\\}`, 'g');
            return prev.replace(pattern, `\\clr{${termName}}{${newContent}}`);
        });

        // Update terms list
        setTerms(prev =>
            prev.map(t =>
                t.name === termName
                    ? { ...t, content: newContent, color: newColor }
                    : t
            )
        );
    }, []);

    // Remove term from LaTeX (convert to plain content)
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

    // Add new colored term
    const handleAddTerm = useCallback(() => {
        const newTermName = `term${terms.length + 1}`;
        const newColor = COLOR_PRESETS[terms.length % COLOR_PRESETS.length].value;

        // Get selected text or insert at cursor
        const textarea = textareaRef.current;
        if (textarea) {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const selectedText = latex.substring(start, end) || 'text';

            const newLatex =
                latex.substring(0, start) +
                `\\clr{${newTermName}}{${selectedText}}` +
                latex.substring(end);

            setLatex(newLatex);
            setColorMap(prev => ({ ...prev, [newTermName]: newColor }));
            setTerms(prev => [...prev, { name: newTermName, content: selectedText, color: newColor }]);
        }
    }, [latex, terms.length]);

    // Handle save
    const handleSave = useCallback(() => {
        saveEquationEdit(latex, colorMap);
    }, [latex, colorMap, saveEquationEdit]);

    // Handle cancel
    const handleCancel = useCallback(() => {
        closeEquationEditor();
    }, [closeEquationEditor]);

    if (!editingEquation) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-background border rounded-xl shadow-2xl w-[90vw] max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        Edit Equation
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
                                ? "border-b-2 border-primary text-primary"
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
                                ? "border-b-2 border-primary text-primary"
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
                                    className="w-full h-32 px-3 py-2 font-mono text-sm bg-muted/30 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="Enter LaTeX equation..."
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
                                        Select text in the LaTeX tab and click "Add Colored Term" to create one.
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

                            <button
                                onClick={handleAddTerm}
                                className="w-full py-2 border-2 border-dashed border-muted-foreground/30 rounded-lg text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                            >
                                + Add Colored Term
                            </button>
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
                        className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                    >
                        Apply Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EquationEditorModal;
