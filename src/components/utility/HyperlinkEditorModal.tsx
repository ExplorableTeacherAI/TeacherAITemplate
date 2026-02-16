import React, { useState, useEffect, useCallback } from 'react';
import { ExternalLink, Link } from 'lucide-react';
import { useEditing } from '@/contexts/EditingContext';

type LinkType = 'external' | 'block';

export const HyperlinkEditorModal: React.FC = () => {
    const { editingHyperlink, closeHyperlinkEditor, saveHyperlinkEdit } = useEditing();

    const [text, setText] = useState('');
    const [linkType, setLinkType] = useState<LinkType>('external');
    const [href, setHref] = useState('');
    const [targetBlockId, setTargetBlockId] = useState('');
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
        if (editingHyperlink) {
            setText(editingHyperlink.text || '');
            setHref(editingHyperlink.href || '');
            setTargetBlockId(editingHyperlink.targetBlockId || '');
            setLinkType(editingHyperlink.href ? 'external' : 'block');
            setColor(editingHyperlink.color || '#10B981');
            setBgColor(editingHyperlink.bgColor || 'rgba(16, 185, 129, 0.15)');
        }
    }, [editingHyperlink]);

    const handleSave = useCallback(() => {
        saveHyperlinkEdit({
            text: text || undefined,
            href: linkType === 'external' ? (href || undefined) : undefined,
            targetBlockId: linkType === 'block' ? (targetBlockId || undefined) : undefined,
            color,
            bgColor: bgColor || undefined,
        });
    }, [text, linkType, href, targetBlockId, color, bgColor, saveHyperlinkEdit]);

    const handleCancel = useCallback(() => {
        closeHyperlinkEditor();
    }, [closeHyperlinkEditor]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            handleCancel();
        }
    }, [handleCancel]);

    if (!editingHyperlink) return null;

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onKeyDown={handleKeyDown}
        >
            <div className="bg-background border rounded-xl shadow-2xl w-[90vw] max-w-md max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Link className="w-5 h-5" style={{ color: '#10B981' }} />
                        Edit Hyperlink
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
                    {/* Link Text */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Link Text
                        </label>
                        <input
                            type="text"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            className="w-full px-3 py-2 text-sm bg-muted/30 border rounded-lg focus:outline-none focus:ring-2"
                            style={{ '--tw-ring-color': color } as React.CSSProperties}
                            placeholder="e.g., Wikipedia article, jump to section"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            The clickable label text
                        </p>
                    </div>

                    {/* Link Type */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Link Type</label>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setLinkType('external')}
                                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border-2 transition-all duration-150"
                                style={{
                                    borderColor: linkType === 'external' ? color : 'transparent',
                                    backgroundColor: linkType === 'external' ? `${color}15` : 'var(--muted)',
                                    color: linkType === 'external' ? color : 'inherit',
                                }}
                            >
                                <ExternalLink size={14} />
                                External URL
                            </button>
                            <button
                                type="button"
                                onClick={() => setLinkType('block')}
                                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border-2 transition-all duration-150"
                                style={{
                                    borderColor: linkType === 'block' ? color : 'transparent',
                                    backgroundColor: linkType === 'block' ? `${color}15` : 'var(--muted)',
                                    color: linkType === 'block' ? color : 'inherit',
                                }}
                            >
                                <Link size={14} />
                                Block on Page
                            </button>
                        </div>
                    </div>

                    {/* URL (shown for external) */}
                    {linkType === 'external' && (
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                URL
                            </label>
                            <input
                                type="text"
                                value={href}
                                onChange={(e) => setHref(e.target.value)}
                                className="w-full px-3 py-2 text-sm bg-muted/30 border rounded-lg focus:outline-none focus:ring-2 font-mono"
                                style={{ '--tw-ring-color': color } as React.CSSProperties}
                                placeholder="https://example.com"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                Opens in a new tab
                            </p>
                        </div>
                    )}

                    {/* Target Block ID (shown for block) */}
                    {linkType === 'block' && (
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Target Block ID
                            </label>
                            <input
                                type="text"
                                value={targetBlockId}
                                onChange={(e) => setTargetBlockId(e.target.value)}
                                className="w-full px-3 py-2 text-sm bg-muted/30 border rounded-lg focus:outline-none focus:ring-2 font-mono"
                                style={{ '--tw-ring-color': color } as React.CSSProperties}
                                placeholder="block-intro"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                Smooth scrolls to the block with this ID
                            </p>
                        </div>
                    )}

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
                                    {text || 'link'}
                                </span>
                                {" "}to {linkType === 'external' ? `open ${href || 'URL'}` : `scroll to ${targetBlockId || 'block'}`}
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

export default HyperlinkEditorModal;
