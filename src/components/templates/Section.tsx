import { type ReactNode } from "react";
import { Button } from "@/components/atoms/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/atoms/ui/tooltip";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/atoms/ui/dropdown-menu";
import { GripVertical, Plus, Send } from "lucide-react";

export interface SectionProps {
    /** Unique identifier for the section */
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
    onEditSection?: (instruction: string) => void;
}

/**
 * Section component wraps content and provides consistent layout.
 * This is the container for all content blocks in the canvas.
 */
export const Section = ({
    id,
    children,
    className = "",
    padding = "md",
    isPreview = false,
    onEditSection
}: SectionProps) => {
    const paddingClasses = {
        none: "",
        sm: "py-2",
        md: "py-3",
        lg: "py-6"
    };

    return (
        <section
            id={id}
            className={`w-full group flex gap-3 pr-3 ${paddingClasses[padding]} ${className} ${!isPreview ? 'hover:ring-1 hover:ring-primary/20 rounded-lg transition-all' : ''}`}
            data-section-id={id}
        >
            {/* Hover controls - hidden in preview mode */}
            {!isPreview && (
                <div className="flex items-center gap-px opacity-0 group-hover:opacity-100 transition-opacity pt-1">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => {
                                    console.log("Add section clicked (not implemented in code mode)");
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
                                        className="h-7 w-7 cursor-grab active:cursor-grabbing"
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
                                        // Send message to parent window with section context
                                        window.parent.postMessage({
                                            type: 'add-to-chat',
                                            sectionId: id,
                                        }, '*');

                                        // Also call the callback if provided (for backwards compatibility)
                                        if (onEditSection) {
                                            onEditSection(`Context: Section ${id}`);
                                        }
                                    }
                                }}
                            >
                                <Send className="mr-2 h-4 w-4" />
                                Add to chat
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => {
                                    console.log("Delete section clicked (not implemented in code mode)");
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
        </section>
    );
};
