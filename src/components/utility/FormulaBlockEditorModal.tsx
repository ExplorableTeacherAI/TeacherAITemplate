import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useEditing } from '@/contexts/EditingContext';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { cn } from '@/lib/utils';
import { useVariableStore } from '@/stores';
import { COLOR_PRESETS_NAMED, BRAND_GREEN, ACCENT_VIOLET } from './editorColors';
import { createPortal } from 'react-dom';

// ─── Variable row editor ───────────────────────────────────────────────────────

interface VarRowProps {
    varName: string;
    config: { min: number; max: number; step: number; color: string };
    onUpdate: (varName: string, config: { min: number; max: number; step: number; color: string }) => void;
    onRemove: (varName: string) => void;
}

const VarRow: React.FC<VarRowProps> = ({ varName, config, onUpdate, onRemove }) => {
    const [showColorPicker, setShowColorPicker] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [pickerPos, setPickerPos] = useState({ top: 0, left: 0 });

    useEffect(() => {
        if (showColorPicker && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setPickerPos({ top: rect.bottom + 8 + window.scrollY, left: rect.left + window.scrollX - 100 });
        }
    }, [showColorPicker]);

    useEffect(() => {
        if (!showColorPicker) return;
        const handler = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!buttonRef.current?.contains(target) && !target.closest('.color-picker-portal')) {
                setShowColorPicker(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [showColorPicker]);

    return (
        <div className="p-3 bg-muted/30 rounded-md space-y-2">
            <div className="flex items-center justify-between">
                <span className="text-sm font-mono font-medium">{varName}</span>
                <div className="flex items-center gap-2">
                    <button
                        ref={buttonRef}
                        className="w-6 h-6 rounded border-2 border-white shadow-sm flex-shrink-0"
                        style={{ backgroundColor: config.color }}
                        onClick={() => setShowColorPicker(!showColorPicker)}
                        title="Change color"
                    />
                    {showColorPicker && createPortal(
                        <div
                            className="color-picker-portal fixed z-[10000] bg-popover text-popover-foreground border rounded-lg shadow-xl p-3 grid grid-cols-5 gap-2 animate-in fade-in zoom-in-95 duration-100"
                            style={{ top: pickerPos.top, left: Math.max(10, Math.min(window.innerWidth - 180, pickerPos.left)), width: '180px' }}
                        >
                            {COLOR_PRESETS_NAMED.map((preset) => (
                                <button
                                    key={preset.value}
                                    className={cn(
                                        "w-6 h-6 rounded-full border-2 transition-all hover:scale-110",
                                        config.color.toLowerCase() === preset.value.toLowerCase() ? "border-foreground ring-2 ring-offset-1 ring-foreground/20" : "border-transparent"
                                    )}
                                    style={{ backgroundColor: preset.value }}
                                    onClick={() => { onUpdate(varName, { ...config, color: preset.value }); setShowColorPicker(false); }}
                                    title={preset.name}
                                />
                            ))}
                        </div>,
                        document.body
                    )}
                    <button
                        onClick={() => onRemove(varName)}
                        className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                        title="Remove variable"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
                <div>
                    <label className="block text-xs text-muted-foreground mb-1">Min</label>
                    <input
                        type="number"
                        value={config.min}
                        onChange={(e) => onUpdate(varName, { ...config, min: parseFloat(e.target.value) || 0 })}
                        className="w-full px-2 py-1 text-sm bg-background border rounded"
                    />
                </div>
                <div>
                    <label className="block text-xs text-muted-foreground mb-1">Max</label>
                    <input
                        type="number"
                        value={config.max}
                        onChange={(e) => onUpdate(varName, { ...config, max: parseFloat(e.target.value) || 100 })}
                        className="w-full px-2 py-1 text-sm bg-background border rounded"
                    />
                </div>
                <div>
                    <label className="block text-xs text-muted-foreground mb-1">Step</label>
                    <input
                        type="number"
                        value={config.step}
                        onChange={(e) => onUpdate(varName, { ...config, step: parseFloat(e.target.value) || 1 })}
                        className="w-full px-2 py-1 text-sm bg-background border rounded"
                        min={0.001}
                        step={0.1}
                    />
                </div>
            </div>
        </div>
    );
};

// ─── Colored term row editor ──────────────

interface TermRowProps {
    termName: string;
    content: string;
    color: string;
    onUpdate: (termName: string, content: string, color: string) => void;
    onRemove: (termName: string) => void;
}

const TermRow: React.FC<TermRowProps> = ({ termName, content, color, onUpdate, onRemove }) => {
    const [localContent, setLocalContent] = useState(content);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [pickerPos, setPickerPos] = useState({ top: 0, left: 0 });

    useEffect(() => {
        if (showColorPicker && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setPickerPos({ top: rect.bottom + 8 + window.scrollY, left: rect.left + window.scrollX - 100 });
        }
    }, [showColorPicker]);

    useEffect(() => {
        if (!showColorPicker) return;
        const handler = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!buttonRef.current?.contains(target) && !target.closest('.color-picker-portal')) {
                setShowColorPicker(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [showColorPicker]);

    return (
        <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-md">
            <span className="text-xs font-mono text-muted-foreground min-w-[60px]">{termName}</span>
            <input
                type="text"
                value={localContent}
                onChange={(e) => setLocalContent(e.target.value)}
                onBlur={() => onUpdate(termName, localContent, color)}
                className="flex-1 px-2 py-1 text-sm bg-background border rounded"
                placeholder="Content"
            />
            <button
                ref={buttonRef}
                className="w-6 h-6 rounded border-2 border-white shadow-sm flex-shrink-0"
                style={{ backgroundColor: color }}
                onClick={() => setShowColorPicker(!showColorPicker)}
                title="Change color"
            />
            {showColorPicker && createPortal(
                <div
                    className="color-picker-portal fixed z-[10000] bg-popover text-popover-foreground border rounded-lg shadow-xl p-3 grid grid-cols-5 gap-2 animate-in fade-in zoom-in-95 duration-100"
                    style={{ top: pickerPos.top, left: Math.max(10, Math.min(window.innerWidth - 180, pickerPos.left)), width: '180px' }}
                >
                    {COLOR_PRESETS_NAMED.map((preset) => (
                        <button
                            key={preset.value}
                            className={cn(
                                "w-6 h-6 rounded-full border-2 transition-all hover:scale-110",
                                color.toLowerCase() === preset.value.toLowerCase() ? "border-foreground ring-2 ring-offset-1 ring-foreground/20" : "border-transparent"
                            )}
                            style={{ backgroundColor: preset.value }}
                            onClick={() => { onUpdate(termName, localContent, preset.value); setShowColorPicker(false); }}
                            title={preset.name}
                        />
                    ))}
                </div>,
                document.body
            )}
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

// ─── Main modal ─────────────────────────────────────────────────────────────────

export const FormulaBlockEditorModal: React.FC = () => {
    const { editingFormulaBlock, closeFormulaBlockEditor, saveFormulaBlockEdit } = useEditing();

    const [latex, setLatex] = useState('');
    const [colorMap, setColorMap] = useState<Record<string, string>>({});
    const [variables, setVariables] = useState<Record<string, { min: number; max: number; step: number; color: string }>>({});
    const [colorTerms, setColorTerms] = useState<{ name: string; content: string; color: string }[]>([]);
    const [clozeInputs, setClozeInputs] = useState<Record<string, { correctAnswer: string; placeholder: string; color: string; caseSensitive: boolean }>>({});
    const [clozeChoices, setClozeChoices] = useState<Record<string, { correctAnswer: string; options: string[]; placeholder: string; color: string }>>({});
    const [linkedHighlights, setLinkedHighlights] = useState<Record<string, { varName: string; color: string }>>({});
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'latex' | 'variables' | 'terms' | 'cloze' | 'choices' | 'highlights'>('latex');

    const previewRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Initialize state when modal opens
    useEffect(() => {
        if (editingFormulaBlock) {
            const props = editingFormulaBlock;
            setLatex(props.latex || '');
            setColorMap(props.colorMap || {});
            setActiveTab('latex');

            // Parse variables from \scrub{varName} in latex
            const vars = { ...(props.variables || {}) };
            const scrubMatches = (props.latex || '').matchAll(/\\scrub\{([^}]+)\}/g);
            for (const m of scrubMatches) {
                if (!vars[m[1]]) {
                    vars[m[1]] = { min: 0, max: 100, step: 1, color: '#D81B60' };
                }
            }
            setVariables(vars);

            // Parse colored terms from \clr{name}{content}
            parseTermsFromLatex(props.latex || '', props.colorMap || {});

            // Parse cloze inputs from \cloze{varName} in latex
            const cloze = { ...(props.clozeInputs || {}) } as Record<string, { correctAnswer: string; placeholder: string; color: string; caseSensitive: boolean }>;
            const clozeMatches = (props.latex || '').matchAll(/\\cloze\{([^}]+)\}/g);
            for (const m of clozeMatches) {
                if (!cloze[m[1]]) {
                    cloze[m[1]] = { correctAnswer: '', placeholder: '???', color: '#3B82F6', caseSensitive: false };
                }
            }
            setClozeInputs(cloze);

            // Parse cloze choices from \choice{varName} in latex
            const choices = { ...(props.clozeChoices || {}) } as Record<string, { correctAnswer: string; options: string[]; placeholder: string; color: string }>;
            const choiceMatches = (props.latex || '').matchAll(/\\choice\{([^}]+)\}/g);
            for (const m of choiceMatches) {
                if (!choices[m[1]]) {
                    choices[m[1]] = { correctAnswer: '', options: [], placeholder: '???', color: '#3B82F6' };
                }
            }
            setClozeChoices(choices);

            // Parse linked highlights from \highlight{highlightId}{content} in latex
            const highlights = { ...(props.linkedHighlights || {}) } as Record<string, { varName: string; color: string }>;
            const highlightMatches = (props.latex || '').matchAll(/\\highlight\{([^}]+)\}\{([^}]+)\}/g);
            for (const m of highlightMatches) {
                if (!highlights[m[1]]) {
                    highlights[m[1]] = { varName: '', color: '#3b82f6' };
                }
            }
            setLinkedHighlights(highlights);
        }
    }, [editingFormulaBlock]);

    // Parse \clr{term}{content}
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

            foundTerms.push({ name: cleanName, content: content.trim(), color: updatedColors[cleanName] });
        }

        setColorTerms(foundTerms);
        if (hasNewColors) setColorMap(updatedColors);
    }, []);

    // Re-parse scrub variables when latex changes
    const reparseVariables = useCallback((latexStr: string) => {
        const scrubMatches = latexStr.matchAll(/\\scrub\{([^}]+)\}/g);
        const foundVarNames = new Set<string>();
        for (const m of scrubMatches) foundVarNames.add(m[1]);

        setVariables(prev => {
            const next = { ...prev };
            // Add new variables
            for (const name of foundVarNames) {
                if (!next[name]) {
                    next[name] = { min: 0, max: 100, step: 1, color: '#D81B60' };
                }
            }
            // Remove variables no longer in latex
            for (const name of Object.keys(next)) {
                if (!foundVarNames.has(name)) {
                    delete next[name];
                }
            }
            return next;
        });
    }, []);

    // Re-parse cloze inputs when latex changes
    const reparseClozeInputs = useCallback((latexStr: string) => {
        const matches = latexStr.matchAll(/\\cloze\{([^}]+)\}/g);
        const foundNames = new Set<string>();
        for (const m of matches) foundNames.add(m[1]);

        setClozeInputs(prev => {
            const next = { ...prev };
            for (const name of foundNames) {
                if (!next[name]) {
                    next[name] = { correctAnswer: '', placeholder: '???', color: '#3B82F6', caseSensitive: false };
                }
            }
            for (const name of Object.keys(next)) {
                if (!foundNames.has(name)) delete next[name];
            }
            return next;
        });
    }, []);

    // Re-parse cloze choices when latex changes
    const reparseClozeChoices = useCallback((latexStr: string) => {
        const matches = latexStr.matchAll(/\\choice\{([^}]+)\}/g);
        const foundNames = new Set<string>();
        for (const m of matches) foundNames.add(m[1]);

        setClozeChoices(prev => {
            const next = { ...prev };
            for (const name of foundNames) {
                if (!next[name]) {
                    next[name] = { correctAnswer: '', options: [], placeholder: '???', color: '#3B82F6' };
                }
            }
            for (const name of Object.keys(next)) {
                if (!foundNames.has(name)) delete next[name];
            }
            return next;
        });
    }, []);

    // Re-parse linked highlights when latex changes
    const reparseHighlights = useCallback((latexStr: string) => {
        const matches = latexStr.matchAll(/\\highlight\{([^}]+)\}\{([^}]+)\}/g);
        const foundIds = new Set<string>();
        for (const m of matches) foundIds.add(m[1]);

        setLinkedHighlights(prev => {
            const next = { ...prev };
            for (const id of foundIds) {
                if (!next[id]) {
                    next[id] = { varName: '', color: '#3b82f6' };
                }
            }
            for (const id of Object.keys(next)) {
                if (!foundIds.has(id)) delete next[id];
            }
            return next;
        });
    }, []);

    // Render preview
    useEffect(() => {
        if (!previewRef.current || !latex) {
            if (previewRef.current && !latex) previewRef.current.textContent = '';
            return;
        }

        try {
            let processedLatex = latex;

            // Replace \scrub{varName} with placeholder numbers for preview
            const allVars = useVariableStore.getState().variables;
            processedLatex = processedLatex.replace(
                /\\scrub\{([^}]+)\}/g,
                (_, varName: string) => {
                    const val = (allVars[varName] as number) ?? 0;
                    const col = variables[varName]?.color || '#D81B60';
                    const step = variables[varName]?.step ?? 1;
                    const decimals = step < 1 ? Math.max(0, -Math.floor(Math.log10(step))) : 0;
                    const display = decimals > 0 ? val.toFixed(decimals) : String(val);
                    return `\\textcolor{${col}}{\\underline{${display}}}`;
                },
            );

            // Replace \cloze{varName} with styled placeholder for preview
            processedLatex = processedLatex.replace(
                /\\cloze\{([^}]+)\}/g,
                (_, varName: string) => {
                    const config = clozeInputs[varName];
                    const col = config?.color || '#3B82F6';
                    const placeholder = config?.placeholder || '???';
                    return `\\textcolor{${col}}{\\boxed{${placeholder}}}`;
                },
            );

            // Replace \choice{varName} with styled placeholder for preview
            processedLatex = processedLatex.replace(
                /\\choice\{([^}]+)\}/g,
                (_, varName: string) => {
                    const config = clozeChoices[varName];
                    const col = config?.color || '#3B82F6';
                    const placeholder = config?.placeholder || '???';
                    return `\\textcolor{${col}}{\\boxed{${placeholder}\\downarrow}}`;
                },
            );

            // Replace \highlight{highlightId}{content} with colored text for preview
            processedLatex = processedLatex.replace(
                /\\highlight\{([^}]+)\}\{([^}]+)\}/g,
                (_, highlightId: string, content: string) => {
                    const config = linkedHighlights[highlightId];
                    const col = config?.color || '#3b82f6';
                    return `\\textcolor{${col}}{\\underline{${content}}}`;
                },
            );

            // Replace \clr{name}{content}
            processedLatex = processedLatex.replace(
                /\\clr\s*\{\s*([^}]+)\s*\}\s*\{\s*([^}]+)\s*\}/g,
                (_, termName: string, content: string) => {
                    const color = colorMap[termName.trim()] || '#888888';
                    return `\\textcolor{${color}}{${content}}`;
                },
            );

            katex.render(processedLatex, previewRef.current, {
                throwOnError: false,
                trust: true,
                output: 'html',
                displayMode: true,
            });
            setError(null);
        } catch (err) {
            setError((err as Error).message);
        }
    }, [latex, colorMap, variables, clozeInputs, clozeChoices, linkedHighlights, activeTab]);

    // Term handlers
    const handleUpdateTerm = useCallback((termName: string, newContent: string, newColor: string) => {
        setColorMap(prev => ({ ...prev, [termName]: newColor }));
        setLatex(prev => {
            const pattern = new RegExp(`\\\\clr\\{${termName}\\}\\{[^}]+\\}`, 'g');
            return prev.replace(pattern, `\\clr{${termName}}{${newContent}}`);
        });
        setColorTerms(prev => prev.map(t => t.name === termName ? { ...t, content: newContent, color: newColor } : t));
    }, []);

    const handleRemoveTerm = useCallback((termName: string) => {
        setLatex(prev => {
            const pattern = new RegExp(`\\\\clr\\{${termName}\\}\\{([^}]+)\\}`, 'g');
            return prev.replace(pattern, '$1');
        });
        setColorMap(prev => { const next = { ...prev }; delete next[termName]; return next; });
        setColorTerms(prev => prev.filter(t => t.name !== termName));
    }, []);

    // Variable handlers
    const handleUpdateVar = useCallback((varName: string, config: { min: number; max: number; step: number; color: string }) => {
        setVariables(prev => ({ ...prev, [varName]: config }));
    }, []);

    const handleRemoveVar = useCallback((varName: string) => {
        // Remove \scrub{varName} from latex and the variable config
        setLatex(prev => prev.replace(new RegExp(`\\\\scrub\\{${varName}\\}`, 'g'), varName));
        setVariables(prev => { const next = { ...prev }; delete next[varName]; return next; });
    }, []);

    // Save
    const handleSave = useCallback(() => {
        saveFormulaBlockEdit({
            latex,
            colorMap,
            variables,
            clozeInputs: Object.keys(clozeInputs).length > 0 ? clozeInputs : undefined,
            clozeChoices: Object.keys(clozeChoices).length > 0 ? clozeChoices : undefined,
            linkedHighlights: Object.keys(linkedHighlights).length > 0 ? linkedHighlights : undefined,
        });
    }, [latex, colorMap, variables, clozeInputs, clozeChoices, linkedHighlights, saveFormulaBlockEdit]);

    const handleCancel = useCallback(() => {
        closeFormulaBlockEditor();
    }, [closeFormulaBlockEditor]);

    if (!editingFormulaBlock) return null;

    const scrubVarNames = Object.keys(variables);
    const hasScrubVars = scrubVarNames.length > 0;
    const hasColorTerms = colorTerms.length > 0;
    const clozeInputNames = Object.keys(clozeInputs);
    const hasClozeInputs = clozeInputNames.length > 0;
    const clozeChoiceNames = Object.keys(clozeChoices);
    const hasClozeChoices = clozeChoiceNames.length > 0;
    const highlightIdNames = Object.keys(linkedHighlights);
    const hasHighlights = highlightIdNames.length > 0;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-background border rounded-xl shadow-2xl w-[90vw] max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        {editingFormulaBlock.isNew ? 'New Formula Block' : 'Edit Formula Block'}
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
                <div className="flex border-b overflow-x-auto">
                    <button
                        className={cn(
                            "px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap",
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
                            "px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap",
                            activeTab === 'variables'
                                ? `border-b-2 border-[${BRAND_GREEN}] text-[${BRAND_GREEN}]`
                                : "text-muted-foreground hover:text-foreground"
                        )}
                        onClick={() => setActiveTab('variables')}
                    >
                        Scrub ({scrubVarNames.length})
                    </button>
                    <button
                        className={cn(
                            "px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap",
                            activeTab === 'terms'
                                ? `border-b-2 border-[${BRAND_GREEN}] text-[${BRAND_GREEN}]`
                                : "text-muted-foreground hover:text-foreground"
                        )}
                        onClick={() => setActiveTab('terms')}
                    >
                        Colors ({colorTerms.length})
                    </button>
                    <button
                        className={cn(
                            "px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap",
                            activeTab === 'cloze'
                                ? `border-b-2 border-[${BRAND_GREEN}] text-[${BRAND_GREEN}]`
                                : "text-muted-foreground hover:text-foreground"
                        )}
                        onClick={() => setActiveTab('cloze')}
                    >
                        Cloze ({clozeInputNames.length})
                    </button>
                    <button
                        className={cn(
                            "px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap",
                            activeTab === 'choices'
                                ? `border-b-2 border-[${BRAND_GREEN}] text-[${BRAND_GREEN}]`
                                : "text-muted-foreground hover:text-foreground"
                        )}
                        onClick={() => setActiveTab('choices')}
                    >
                        Choices ({clozeChoiceNames.length})
                    </button>
                    <button
                        className={cn(
                            "px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap",
                            activeTab === 'highlights'
                                ? `border-b-2 border-[${BRAND_GREEN}] text-[${BRAND_GREEN}]`
                                : "text-muted-foreground hover:text-foreground"
                        )}
                        onClick={() => setActiveTab('highlights')}
                    >
                        Highlights ({highlightIdNames.length})
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
                                        reparseVariables(e.target.value);
                                        reparseClozeInputs(e.target.value);
                                        reparseClozeChoices(e.target.value);
                                        reparseHighlights(e.target.value);
                                    }}
                                    className={`w-full h-32 px-3 py-2 font-mono text-sm bg-muted/30 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[${ACCENT_VIOLET}]`}
                                    placeholder="Enter LaTeX formula..."
                                    spellCheck={false}
                                />
                                <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                                    <p>
                                        <code className="bg-muted px-1 rounded">\scrub{'{'}varName{'}'}</code> — draggable number
                                    </p>
                                    <p>
                                        <code className="bg-muted px-1 rounded">\clr{'{'}name{'}'}{'{'}content{'}'}</code> — colored term
                                    </p>
                                    <p>
                                        <code className="bg-muted px-1 rounded">\cloze{'{'}varName{'}'}</code> — fill-in-the-blank input
                                    </p>
                                    <p>
                                        <code className="bg-muted px-1 rounded">\choice{'{'}varName{'}'}</code> — dropdown choice
                                    </p>
                                    <p>
                                        <code className="bg-muted px-1 rounded">\highlight{'{'}id{'}'}{'{'}content{'}'}</code> — linked highlight
                                    </p>
                                </div>
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
                    ) : activeTab === 'variables' ? (
                        <div className="space-y-3">
                            {!hasScrubVars ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <p>No scrub variables found.</p>
                                    <p className="text-sm mt-1">
                                        Use <code className="bg-muted px-1 rounded">\scrub{'{'}varName{'}'}</code> in the LaTeX Source tab to add interactive draggable numbers.
                                    </p>
                                </div>
                            ) : (
                                scrubVarNames.map((name) => (
                                    <VarRow
                                        key={name}
                                        varName={name}
                                        config={variables[name]}
                                        onUpdate={handleUpdateVar}
                                        onRemove={handleRemoveVar}
                                    />
                                ))
                            )}
                        </div>
                    ) : activeTab === 'terms' ? (
                        <div className="space-y-3">
                            {!hasColorTerms ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <p>No colored terms found.</p>
                                    <p className="text-sm mt-1">
                                        Use <code className="bg-muted px-1 rounded">\clr{'{'}name{'}'}{'{'}content{'}'}</code> in the LaTeX Source tab to add colored terms.
                                    </p>
                                </div>
                            ) : (
                                colorTerms.map((term) => (
                                    <TermRow
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
                    ) : activeTab === 'cloze' ? (
                        <div className="space-y-3">
                            {!hasClozeInputs ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <p>No cloze inputs found.</p>
                                    <p className="text-sm mt-1">
                                        Use <code className="bg-muted px-1 rounded">\cloze{'{'}varName{'}'}</code> in the LaTeX Source tab to add fill-in-the-blank inputs.
                                    </p>
                                </div>
                            ) : (
                                clozeInputNames.map((name) => {
                                    const config = clozeInputs[name];
                                    return (
                                        <div key={name} className="p-3 bg-muted/30 rounded-md space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-mono font-medium">{name}</span>
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="w-4 h-4 rounded border"
                                                        style={{ backgroundColor: config.color }}
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <label className="block text-xs text-muted-foreground mb-1">Correct Answer</label>
                                                    <input
                                                        type="text"
                                                        value={config.correctAnswer}
                                                        onChange={(e) => setClozeInputs(prev => ({
                                                            ...prev,
                                                            [name]: { ...prev[name], correctAnswer: e.target.value }
                                                        }))}
                                                        className="w-full px-2 py-1 text-sm bg-background border rounded"
                                                        placeholder="Expected answer"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-muted-foreground mb-1">Placeholder</label>
                                                    <input
                                                        type="text"
                                                        value={config.placeholder}
                                                        onChange={(e) => setClozeInputs(prev => ({
                                                            ...prev,
                                                            [name]: { ...prev[name], placeholder: e.target.value }
                                                        }))}
                                                        className="w-full px-2 py-1 text-sm bg-background border rounded"
                                                        placeholder="???"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <input
                                                        type="checkbox"
                                                        checked={config.caseSensitive}
                                                        onChange={(e) => setClozeInputs(prev => ({
                                                            ...prev,
                                                            [name]: { ...prev[name], caseSensitive: e.target.checked }
                                                        }))}
                                                        className="rounded"
                                                    />
                                                    Case sensitive
                                                </label>
                                                <div className="flex items-center gap-1">
                                                    <label className="text-xs text-muted-foreground">Color:</label>
                                                    <div className="flex gap-1">
                                                        {['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#D81B60'].map(c => (
                                                            <button
                                                                key={c}
                                                                className={cn("w-5 h-5 rounded-full border-2", config.color === c ? "border-foreground" : "border-transparent")}
                                                                style={{ backgroundColor: c }}
                                                                onClick={() => setClozeInputs(prev => ({
                                                                    ...prev,
                                                                    [name]: { ...prev[name], color: c }
                                                                }))}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    ) : activeTab === 'choices' ? (
                        <div className="space-y-3">
                            {!hasClozeChoices ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <p>No cloze choices found.</p>
                                    <p className="text-sm mt-1">
                                        Use <code className="bg-muted px-1 rounded">\choice{'{'}varName{'}'}</code> in the LaTeX Source tab to add dropdown choices.
                                    </p>
                                </div>
                            ) : (
                                clozeChoiceNames.map((name) => {
                                    const config = clozeChoices[name];
                                    return (
                                        <div key={name} className="p-3 bg-muted/30 rounded-md space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-mono font-medium">{name}</span>
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="w-4 h-4 rounded border"
                                                        style={{ backgroundColor: config.color }}
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <label className="block text-xs text-muted-foreground mb-1">Correct Answer</label>
                                                    <input
                                                        type="text"
                                                        value={config.correctAnswer}
                                                        onChange={(e) => setClozeChoices(prev => ({
                                                            ...prev,
                                                            [name]: { ...prev[name], correctAnswer: e.target.value }
                                                        }))}
                                                        className="w-full px-2 py-1 text-sm bg-background border rounded"
                                                        placeholder="Expected answer"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-muted-foreground mb-1">Placeholder</label>
                                                    <input
                                                        type="text"
                                                        value={config.placeholder}
                                                        onChange={(e) => setClozeChoices(prev => ({
                                                            ...prev,
                                                            [name]: { ...prev[name], placeholder: e.target.value }
                                                        }))}
                                                        className="w-full px-2 py-1 text-sm bg-background border rounded"
                                                        placeholder="???"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs text-muted-foreground mb-1">Options (comma-separated)</label>
                                                <input
                                                    type="text"
                                                    value={config.options.join(', ')}
                                                    onChange={(e) => setClozeChoices(prev => ({
                                                        ...prev,
                                                        [name]: { ...prev[name], options: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }
                                                    }))}
                                                    className="w-full px-2 py-1 text-sm bg-background border rounded"
                                                    placeholder="option1, option2, option3"
                                                />
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <label className="text-xs text-muted-foreground">Color:</label>
                                                <div className="flex gap-1">
                                                    {['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#D81B60'].map(c => (
                                                        <button
                                                            key={c}
                                                            className={cn("w-5 h-5 rounded-full border-2", config.color === c ? "border-foreground" : "border-transparent")}
                                                            style={{ backgroundColor: c }}
                                                            onClick={() => setClozeChoices(prev => ({
                                                                ...prev,
                                                                [name]: { ...prev[name], color: c }
                                                            }))}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    ) : activeTab === 'highlights' ? (
                        <div className="space-y-3">
                            {!hasHighlights ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <p>No linked highlights found.</p>
                                    <p className="text-sm mt-1">
                                        Use <code className="bg-muted px-1 rounded">\highlight{'{'}id{'}'}{'{'}content{'}'}</code> in the LaTeX Source tab to add interactive hover highlights.
                                    </p>
                                </div>
                            ) : (
                                highlightIdNames.map((id) => {
                                    const config = linkedHighlights[id];
                                    return (
                                        <div key={id} className="p-3 bg-muted/30 rounded-md space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-mono font-medium">{id}</span>
                                                <div
                                                    className="w-4 h-4 rounded border"
                                                    style={{ backgroundColor: config.color }}
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <label className="block text-xs text-muted-foreground mb-1">Group Variable Name</label>
                                                    <input
                                                        type="text"
                                                        value={config.varName}
                                                        onChange={(e) => setLinkedHighlights(prev => ({
                                                            ...prev,
                                                            [id]: { ...prev[id], varName: e.target.value }
                                                        }))}
                                                        className="w-full px-2 py-1 text-sm bg-background border rounded"
                                                        placeholder="sharedHighlightVar"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-muted-foreground mb-1">Color</label>
                                                    <div className="flex gap-1 mt-1">
                                                        {['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#D81B60'].map(c => (
                                                            <button
                                                                key={c}
                                                                className={cn("w-5 h-5 rounded-full border-2", config.color === c ? "border-foreground" : "border-transparent")}
                                                                style={{ backgroundColor: c }}
                                                                onClick={() => setLinkedHighlights(prev => ({
                                                                    ...prev,
                                                                    [id]: { ...prev[id], color: c }
                                                                }))}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    ) : null}
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
                        disabled={!latex.trim()}
                        className={cn(
                            `px-4 py-2 text-sm font-medium bg-[${BRAND_GREEN}] text-white rounded-lg hover:bg-[${BRAND_GREEN}]/90 transition-colors`,
                            !latex.trim() && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        {editingFormulaBlock.isNew ? 'Insert Formula' : 'Apply Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FormulaBlockEditorModal;
