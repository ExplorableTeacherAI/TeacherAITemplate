import { type ReactNode, useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/atoms/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/atoms/ui/tooltip";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/atoms/ui/dropdown-menu";
import { GripVertical, Plus, Send, Pencil, Wand2, X, Sparkles } from "lucide-react";
import { AnnotationOverlay } from "@/components/utility/AnnotationOverlay";
import { useBlockContext } from "@/contexts/BlockContext";
import { useAppMode } from "@/contexts/AppModeContext";


export interface BlockProps {
    /** Unique identifier for the block */
    id?: string;
    /** Children content to render */
    children: ReactNode;
    /** Optional className for custom styling */
    className?: string;
    /** Optional padding override */
    padding?: "none" | "sm" | "md" | "lg";
    /** Whether in preview mode */
    isPreview?: boolean;
    /**
     * Whether this block contains a visualization component.
     * When true, a magic wand icon appears on hover, allowing
     * the teacher to request AI-generated alternative visualizations.
     * The AI agent should set this to true when creating blocks
     * that contain visual components (Cartesian2D, DataVisualization,
     * SimulationPanel, FlowDiagram, GeometricDiagram, etc.).
     */
    hasVisualization?: boolean;
    /** Callback to send instruction to AI */
    onEditBlock?: (instruction: string) => void;
    /** Callback to add a new block */
    onAddBlock?: (blockId: string) => void;
}

/**
 * Block component wraps individual content elements.
 *
 * A Block is the unit of content that can be:
 * - Dragged and reordered
 * - Edited individually
 * - Annotated
 * - Deleted
 *
 * Each content element (heading, paragraph, image, etc.) should be wrapped in a Block.
 * Blocks can be used directly inside layouts.
 *
 * @example
 * ```tsx
 * <Block id="intro-title">
 *   <EditableH1>Welcome</EditableH1>
 * </Block>
 * <Block id="intro-text">
 *   <EditableParagraph>This is the intro...</EditableParagraph>
 * </Block>
 * ```
 */
export const Block = ({
    id,
    children,
    className = "",
    padding = "md",
    isPreview = false,
    hasVisualization = false,
    onEditBlock,
    onAddBlock,
}: BlockProps) => {
    const handleEdit = onEditBlock;
    const handleAdd = onAddBlock;
    const { dragControls, onDelete: blockContextDelete } = useBlockContext();
    const [isAnnotating, setIsAnnotating] = useState(false);
    const [isAsking, setIsAsking] = useState(false);
    const [askText, setAskText] = useState("");
    const blockRef = useRef<HTMLDivElement>(null);
    const askTextareaRef = useRef<HTMLTextAreaElement>(null);
    const { isPreview: appIsPreview } = useAppMode();

    const paddingClasses = {
        none: "",
        sm: "py-2",
        md: "py-3",
        lg: "py-6"
    };

    // Auto-focus textarea when Ask panel opens
    useEffect(() => {
        if (isAsking) {
            setTimeout(() => askTextareaRef.current?.focus(), 60);
        }
    }, [isAsking]);

    // Auto-resize textarea to fit content (capped)
    useEffect(() => {
        const el = askTextareaRef.current;
        if (!el) return;
        el.style.height = 'auto';
        el.style.height = `${Math.min(el.scrollHeight, 80)}px`;
    }, [askText]);

    // Close ask panel when Escape is pressed — works even if textarea is empty/unfocused
    useEffect(() => {
        if (!isAsking) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                setIsAsking(false);
                setAskText('');
            }
        };
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [isAsking]);

    // Close ask panel when the user clicks anywhere outside this block
    useEffect(() => {
        if (!isAsking) return;
        const onMouseDown = (e: MouseEvent) => {
            if (blockRef.current && !blockRef.current.contains(e.target as Node)) {
                setIsAsking(false);
                setAskText('');
            }
        };
        // Use capture so we run before any stopPropagation in children
        document.addEventListener('mousedown', onMouseDown, true);
        return () => document.removeEventListener('mousedown', onMouseDown, true);
    }, [isAsking]);

    // Close ask panel when another block broadcasts it opened its own ask panel
    useEffect(() => {
        const onOtherBlockAsk = (e: CustomEvent) => {
            if (e.detail.blockId !== id) {
                setIsAsking(false);
                setAskText('');
            }
        };
        window.addEventListener('block-ask-opened' as any, onOtherBlockAsk);
        return () => window.removeEventListener('block-ask-opened' as any, onOtherBlockAsk);
    }, [id]);

    const handleOpenAsk = () => {
        // Notify other blocks to close their ask panels
        window.dispatchEvent(new CustomEvent('block-ask-opened', { detail: { blockId: id } }));
        setIsAsking(true);
        setAskText('');
    };

    const handleCloseAsk = () => {
        setIsAsking(false);
        setAskText('');
    };

    const handleSendAsk = () => {
        const message = askText.trim();
        if (!message || !id) return;

        // Post to parent with both blockId and the user's message text
        window.parent.postMessage({
            type: 'add-to-chat',
            blockId: id,
            message,
        }, '*');

        setIsAsking(false);
        setAskText('');
    };

    // Textarea keydown: Enter sends, Esc is handled by the doc-level listener
    const handleAskKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendAsk();
        }
        // Escape: let the document-level listener handle it (preventDefault is there)
    };

    // Handle magic wand click — send request to parent for AI alternatives
    const handleMagicClick = useCallback(() => {
        if (!id || !hasVisualization) return;

        window.parent.postMessage({
            type: 'block-magic-replace',
            blockId: id,
        }, '*');
    }, [id, hasVisualization]);

    // Listen for events to close this overlay when another one opens
    useEffect(() => {
        const handleCloseAnnotation = (e: CustomEvent) => {
            // Close if another block opened an annotation overlay
            if (e.detail.blockId !== id && isAnnotating) {
                setIsAnnotating(false);
            }
        };

        window.addEventListener('annotation-overlay-opened' as any, handleCloseAnnotation);
        return () => {
            window.removeEventListener('annotation-overlay-opened' as any, handleCloseAnnotation);
        };
    }, [id, isAnnotating]);

    const handleStartAnnotation = () => {
        // Dispatch event to close any other open annotation overlays
        window.dispatchEvent(new CustomEvent('annotation-overlay-opened', {
            detail: { blockId: id }
        }));
        setIsAnnotating(true);
    };

    const handleCancelAnnotation = () => {
        setIsAnnotating(false);
    };

    const handleSendAnnotation = (imageDataUrl: string, message?: string) => {
        setIsAnnotating(false);

        if (id) {
            // Send message to parent window with annotated image and optional text
            window.parent.postMessage({
                type: 'add-annotation-to-chat',
                blockId: id,
                imageDataUrl: imageDataUrl,
                message: message,
            }, '*');

            // Also call the callback if provided
            if (handleEdit) {
                handleEdit(`Annotated Block ${id}: [Image attached]${message ? ` - ${message}` : ''}`);
            }
        }
    };

    const handleBlockClick = (e: React.MouseEvent<HTMLDivElement>) => {
        // Only handle clicks in editor mode and if there's an ID
        if (!isPreview && id) {
            // Don't interfere with button clicks
            if ((e.target as HTMLElement).closest('button')) {
                return;
            }

            // Clicking on a block body closes any other block's ask panel
            window.dispatchEvent(new CustomEvent('block-ask-opened', { detail: { blockId: id } }));

            // Send message to parent window to highlight in hierarchy
            window.parent.postMessage({
                type: 'block-selected',
                blockId: id,
            }, '*');
        }
    };

    return (
        <>
            {/* Annotation Overlay */}
            {isAnnotating && blockRef.current && (
                <AnnotationOverlay
                    targetElement={blockRef.current}
                    onSend={handleSendAnnotation}
                    onCancel={handleCancelAnnotation}
                    blockId={id}
                />
            )}

            <div
                ref={blockRef}
                data-block-id={id}
                className={`w-full group flex gap-3 pr-3 relative ${paddingClasses[padding]} ${className} ${!isPreview ? 'hover:ring-1 rounded-lg transition-all' : ''}`}
                style={!isPreview ? { '--tw-ring-color': '#D4EDE5' } as React.CSSProperties : undefined}
                onClick={handleBlockClick}
            >
                {/* Magic wand icon - shown on visualization blocks in editor mode */}
                {!isPreview && !appIsPreview && hasVisualization && (
                    <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-all duration-200">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-full bg-[#D4EDE5] hover:bg-[#0D7377] text-[#0D7377] hover:text-white shadow-md hover:shadow-lg hover:scale-110 transition-all duration-200 border border-[#0D7377]/20"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleMagicClick();
                                    }}
                                >
                                    <Wand2 className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="left">
                                <p className="font-medium">✨ AI Alternatives</p>
                                <p className="text-xs text-muted-foreground">Click to explore different visualization options</p>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                )}

                {/* Hover controls - hidden in preview mode */}
                {!isPreview && (
                    <div className="relative z-10 flex items-center gap-px opacity-0 group-hover:opacity-100 transition-opacity pt-1">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 hover:bg-[#D4EDE5] hover:text-[#0D7377]"
                                    onClick={() => {
                                        if (id && handleAdd) {
                                            handleAdd(id);
                                        } else {
                                            console.log("Add block clicked (not implemented in code mode)");
                                        }
                                    }}
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">
                                <div>
                                    <span className="font-semibold">Click</span> to add below
                                </div>
                            </TooltipContent>
                        </Tooltip>

                        <DropdownMenu>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 cursor-grab active:cursor-grabbing hover:bg-[#D4EDE5] hover:text-[#0D7377]"
                                            onPointerDown={(e) => {
                                                // Pass the event to DragControls
                                                if (dragControls) {
                                                    dragControls.start(e);
                                                }
                                            }}
                                        >
                                            <GripVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                </TooltipTrigger>
                                <TooltipContent side="bottom">
                                    <div>
                                        <span className="font-semibold">Drag</span> to move
                                        <br />
                                        <span className="font-semibold">Click</span> to open menu
                                    </div>
                                </TooltipContent>
                            </Tooltip>
                            <DropdownMenuContent align="start">
                                <DropdownMenuItem
                                    className="text"
                                    onClick={() => {
                                        handleOpenAsk();
                                    }}
                                >
                                    <Sparkles className="mr-2 h-4 w-4" />
                                    AI Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={handleStartAnnotation}
                                >
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Annotate
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => {
                                        if (blockContextDelete) {
                                            blockContextDelete();
                                        } else {
                                            console.log("Delete not available");
                                        }
                                    }}
                                >
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                )}

                <div className="flex-1 min-w-0">
                    {children}

                    {/* ── Inline Ask AI panel ── slides open below the block content */}
                    {isAsking && !isPreview && (
                        <div
                            className="mt-3 rounded-lg border-2 border-[#D4EDE5] bg-[#D4EDE5]/20 px-3 py-2"
                            style={{ animation: 'slideDown 0.18s ease-out' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header row */}
                            <div className="flex items-center gap-1.5 mb-1">
                                <Sparkles className="h-3.5 w-3.5 text-[#0D7377]" />
                                <span className="text-xs font-medium text-[#0D7377]">MathVibe Assistant</span>
                                <span className="text-xs text-[#0D7377]/50 ml-auto">Press Enter to send</span>
                                <button
                                    className="h-4 w-4 rounded flex items-center justify-center text-[#0D7377]/50 hover:text-[#0D7377] hover:bg-[#0D7377]/10 transition-colors ml-1"
                                    onClick={handleCloseAsk}
                                    aria-label="Dismiss"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </div>

                            {/* Input + Send button row */}
                            <div className="flex items-center gap-2">
                                <textarea
                                    ref={askTextareaRef}
                                    value={askText}
                                    onChange={(e) => setAskText(e.target.value)}
                                    onKeyDown={handleAskKeyDown}
                                    placeholder="Tell what you want to change"
                                    rows={1}
                                    className="flex-1 resize-none overflow-y-auto bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none leading-relaxed min-h-[1.5em] max-h-[80px]"
                                />
                                <button
                                    className="flex-shrink-0 p-1.5 rounded-md bg-[#0D7377] hover:bg-[#0a5c5f] text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                    onClick={handleSendAsk}
                                    disabled={!askText.trim()}
                                    title="Send to AI"
                                >
                                    <Send className="h-3.5 w-3.5" />
                                </button>
                            </div>

                            {/* Esc hint */}
                            <div className="mt-1.5">
                                <span className="text-[10px] text-gray-400">
                                    <kbd className="px-1 py-0.5 rounded bg-white border border-gray-200 font-mono text-[10px]">Esc</kbd> to dismiss
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Slide-down animation */}
            <style>{`
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-6px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </>
    );
};

export default Block;
