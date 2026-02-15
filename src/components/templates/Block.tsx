import { type ReactNode, useState, useRef, useEffect } from "react";
import { Button } from "@/components/atoms/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/atoms/ui/tooltip";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/atoms/ui/dropdown-menu";
import { GripVertical, Plus, Send, Pencil } from "lucide-react";
import { AnnotationOverlay } from "@/components/utility/AnnotationOverlay";
import { useBlockContext } from "@/contexts/BlockContext";

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
    onEditBlock,
    onAddBlock,
}: BlockProps) => {
    const handleEdit = onEditBlock;
    const handleAdd = onAddBlock;
    const { dragControls, onDelete: blockContextDelete } = useBlockContext();
    const [isAnnotating, setIsAnnotating] = useState(false);
    const blockRef = useRef<HTMLDivElement>(null);

    const paddingClasses = {
        none: "",
        sm: "py-2",
        md: "py-3",
        lg: "py-6"
    };

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
                className={`w-full group flex gap-3 pr-3 ${paddingClasses[padding]} ${className} ${!isPreview ? 'hover:ring-1 rounded-lg transition-all' : ''}`}
                style={!isPreview ? { '--tw-ring-color': '#D4EDE5' } as React.CSSProperties : undefined}
                onClick={handleBlockClick}
            >
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
