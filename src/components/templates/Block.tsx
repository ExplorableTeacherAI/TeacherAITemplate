import { type ReactNode, useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/atoms/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/atoms/ui/tooltip";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/atoms/ui/dropdown-menu";
import { GripVertical, Plus, Send, Pencil, Wand2 } from "lucide-react";
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
    const blockRef = useRef<HTMLDivElement>(null);
    const { isPreview: appIsPreview } = useAppMode();

    const paddingClasses = {
        none: "",
        sm: "py-2",
        md: "py-3",
        lg: "py-6"
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

    const handleSendAnnotation = (imageDataUrl: string) => {
        setIsAnnotating(false);

        if (id) {
            // Send message to parent window with annotated image
            window.parent.postMessage({
                type: 'add-annotation-to-chat',
                blockId: id,
                imageDataUrl: imageDataUrl,
            }, '*');

            // Also call the callback if provided
            if (handleEdit) {
                handleEdit(`Annotated Block ${id}: [Image attached]`);
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
                                        if (id) {
                                            // Send message to parent window with block context
                                            window.parent.postMessage({
                                                type: 'add-to-chat',
                                                blockId: id,
                                            }, '*');

                                            // Also call the callback if provided (for backwards compatibility)
                                            if (handleEdit) {
                                                handleEdit(`Context: Block ${id}`);
                                            }
                                        }
                                    }}
                                >
                                    <Send className="mr-2 h-4 w-4" />
                                    Add to chat
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
                </div>
            </div>
        </>
    );
};

export default Block;
