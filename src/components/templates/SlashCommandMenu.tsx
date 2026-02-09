import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
    Heading1,
    Heading2,
    Heading3,
    Type,
    Quote,
    Minus,
    Hash,
    ChevronDown,
    TextCursor,
} from "lucide-react";

// Block-level command types (replace the entire block)
export type BlockCommandType =
    | "h1"
    | "h2"
    | "h3"
    | "paragraph"
    | "quote"
    | "divider";

// Inline component command types (insert within text)
export type InlineCommandType =
    | "inlineScrubbleNumber"
    | "inlineDropdown"
    | "inlineTextInput";

// Combined type for all slash commands
export type SlashCommandType = BlockCommandType | InlineCommandType;

// Helper to check if a command is inline
export const isInlineCommand = (type: SlashCommandType): type is InlineCommandType => {
    return ["inlineScrubbleNumber", "inlineDropdown", "inlineTextInput"].includes(type);
};

interface SlashCommand {
    id: SlashCommandType;
    label: string;
    description: string;
    icon: React.ReactNode;
    keywords: string[];
    category: "block" | "inline";
}

const slashCommands: SlashCommand[] = [
    // Block-level commands
    {
        id: "h1",
        label: "Heading 1",
        description: "Large section heading",
        icon: <Heading1 className="h-4 w-4" />,
        keywords: ["h1", "heading", "title", "large"],
        category: "block",
    },
    {
        id: "h2",
        label: "Heading 2",
        description: "Medium section heading",
        icon: <Heading2 className="h-4 w-4" />,
        keywords: ["h2", "heading", "subtitle", "medium"],
        category: "block",
    },
    {
        id: "h3",
        label: "Heading 3",
        description: "Small section heading",
        icon: <Heading3 className="h-4 w-4" />,
        keywords: ["h3", "heading", "small"],
        category: "block",
    },
    {
        id: "paragraph",
        label: "Paragraph",
        description: "Plain text paragraph",
        icon: <Type className="h-4 w-4" />,
        keywords: ["p", "paragraph", "text", "plain"],
        category: "block",
    },
    {
        id: "quote",
        label: "Quote",
        description: "Capture a quote",
        icon: <Quote className="h-4 w-4" />,
        keywords: ["quote", "blockquote", "citation"],
        category: "block",
    },
    {
        id: "divider",
        label: "Divider",
        description: "Visual separator",
        icon: <Minus className="h-4 w-4" />,
        keywords: ["divider", "separator", "hr", "line"],
        category: "block",
    },
    // Inline component commands
    {
        id: "inlineScrubbleNumber",
        label: "Scrubble Number",
        description: "Interactive number with drag/click controls",
        icon: <Hash className="h-4 w-4" />,
        keywords: ["number", "scrubble", "stepper", "slider", "inline", "variable"],
        category: "inline",
    },
    {
        id: "inlineDropdown",
        label: "Dropdown",
        description: "Inline dropdown selector",
        icon: <ChevronDown className="h-4 w-4" />,
        keywords: ["dropdown", "select", "choice", "inline", "options"],
        category: "inline",
    },
    {
        id: "inlineTextInput",
        label: "Text Input",
        description: "Inline text input field",
        icon: <TextCursor className="h-4 w-4" />,
        keywords: ["input", "text", "inline", "field", "type"],
        category: "inline",
    },
];

interface SlashCommandMenuProps {
    isOpen: boolean;
    searchQuery: string;
    onSelect: (command: SlashCommandType) => void;
    onClose: () => void;
    position?: { top: number; left: number };
    anchorRef?: React.RefObject<HTMLElement>;
}

export const SlashCommandMenu = ({
    isOpen,
    searchQuery,
    onSelect,
    onClose,
    position,
    anchorRef,
}: SlashCommandMenuProps) => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const menuRef = useRef<HTMLDivElement>(null);

    // Filter commands based on search query
    const filteredCommands = slashCommands.filter((cmd) => {
        const query = searchQuery.toLowerCase();
        return (
            cmd.label.toLowerCase().includes(query) ||
            cmd.description.toLowerCase().includes(query) ||
            cmd.keywords.some((kw) => kw.includes(query))
        );
    });

    // Reset selection when filtered results change
    useEffect(() => {
        setSelectedIndex(0);
    }, [searchQuery]);

    // Handle keyboard navigation
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowDown") {
                e.preventDefault();
                setSelectedIndex((prev) =>
                    prev < filteredCommands.length - 1 ? prev + 1 : prev
                );
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
            } else if (e.key === "Enter") {
                e.preventDefault();
                if (filteredCommands[selectedIndex]) {
                    onSelect(filteredCommands[selectedIndex].id);
                }
            } else if (e.key === "Escape") {
                e.preventDefault();
                onClose();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, selectedIndex, filteredCommands, onSelect, onClose]);

    // Scroll selected item into view
    useEffect(() => {
        if (menuRef.current) {
            const selectedElement = menuRef.current.querySelector(
                `[data-index="${selectedIndex}"]`
            );
            if (selectedElement) {
                selectedElement.scrollIntoView({ block: "nearest" });
            }
        }
    }, [selectedIndex]);

    // Calculate position based on anchor element
    const menuPosition = position || { top: 0, left: 0 };
    if (anchorRef?.current && !position) {
        const rect = anchorRef.current.getBoundingClientRect();
        menuPosition.top = rect.bottom + 4;
        menuPosition.left = rect.left;
    }

    if (!isOpen) return null;

    return (
        <div
            ref={menuRef}
            className={cn(
                "fixed z-50 min-w-[280px] max-h-[320px] overflow-y-auto",
                "rounded-lg border border-border bg-white shadow-lg"
            )}
            style={{
                top: menuPosition.top,
                left: menuPosition.left,
            }}
        >
            <div className="p-1">
                {filteredCommands.length === 0 ? (
                    <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                        No commands found
                    </div>
                ) : (
                    <>
                        {/* Block-level commands section */}
                        {filteredCommands.some(cmd => cmd.category === "block") && (
                            <>
                                <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Blocks
                                </div>
                                {filteredCommands
                                    .filter(cmd => cmd.category === "block")
                                    .map((cmd) => {
                                        const globalIndex = filteredCommands.findIndex(c => c.id === cmd.id);
                                        return (
                                            <button
                                                key={cmd.id}
                                                data-index={globalIndex}
                                                onClick={() => onSelect(cmd.id)}
                                                className={cn(
                                                    "w-full flex items-center gap-3 px-3 py-2 rounded-md text-left",
                                                    "transition-colors duration-150",
                                                    "hover:bg-[#D4EDE5] hover:text-[#0D7377]",
                                                    globalIndex === selectedIndex && "bg-[#D4EDE5] text-[#0D7377]"
                                                )}
                                            >
                                                <div className="flex items-center justify-center w-8 h-8 rounded-md bg-gray-100">
                                                    {cmd.icon}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm font-medium">{cmd.label}</div>
                                                    <div className="text-xs text-muted-foreground truncate">
                                                        {cmd.description}
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                            </>
                        )}

                        {/* Inline components section */}
                        {filteredCommands.some(cmd => cmd.category === "inline") && (
                            <>
                                <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-2">
                                    Inline Components
                                </div>
                                {filteredCommands
                                    .filter(cmd => cmd.category === "inline")
                                    .map((cmd) => {
                                        const globalIndex = filteredCommands.findIndex(c => c.id === cmd.id);
                                        return (
                                            <button
                                                key={cmd.id}
                                                data-index={globalIndex}
                                                onClick={() => onSelect(cmd.id)}
                                                className={cn(
                                                    "w-full flex items-center gap-3 px-3 py-2 rounded-md text-left",
                                                    "transition-colors duration-150",
                                                    "hover:bg-[#E8D5F0] hover:text-[#7B2D8E]",
                                                    globalIndex === selectedIndex && "bg-[#E8D5F0] text-[#7B2D8E]"
                                                )}
                                            >
                                                <div className="flex items-center justify-center w-8 h-8 rounded-md bg-purple-100">
                                                    {cmd.icon}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm font-medium">{cmd.label}</div>
                                                    <div className="text-xs text-muted-foreground truncate">
                                                        {cmd.description}
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default SlashCommandMenu;
