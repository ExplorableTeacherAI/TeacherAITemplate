import { useEffect, useLayoutEffect, useRef, useState } from "react";
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
    Info,
    Zap,
    Link,
    Sigma,
    Palette,
    Highlighter,
} from "lucide-react";

// Block-level command types (replace the entire block)
export type BlockCommandType =
    | "h1"
    | "h2"
    | "h3"
    | "paragraph"
    | "quote"
    | "divider"
    | "formulaBlock";

// Inline component command types (insert within text)
export type InlineCommandType =
    | "inlineScrubbleNumber"
    | "inlineClozeInput"
    | "inlineClozeChoice"
    | "inlineToggle"
    | "inlineTooltip"
    | "inlineTrigger"
    | "inlineHyperlink"
    | "inlineFormula"
    | "inlineSpotColor"
    | "inlineLinkedHighlight";

// Combined type for all slash commands
export type SlashCommandType = BlockCommandType | InlineCommandType;

// Helper to check if a command is inline
export const isInlineCommand = (type: SlashCommandType): type is InlineCommandType => {
    return ["inlineScrubbleNumber", "inlineClozeInput", "inlineClozeChoice", "inlineToggle", "inlineTooltip", "inlineTrigger", "inlineHyperlink", "inlineFormula", "inlineSpotColor", "inlineLinkedHighlight"].includes(type);
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
    {
        id: "formulaBlock",
        label: "Formula Block",
        description: "Interactive math formula with draggable numbers",
        icon: <Sigma className="h-4 w-4" />,
        keywords: ["formula", "math", "equation", "interactive", "scrub", "katex", "latex", "block"],
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
        id: "inlineClozeInput",
        label: "Cloze Input",
        description: "Fill-in-the-blank input with answer validation",
        icon: <TextCursor className="h-4 w-4" />,
        keywords: ["cloze", "fill", "blank", "answer", "input", "text"],
        category: "inline",
    },
    {
        id: "inlineClozeChoice",
        label: "Cloze Choice",
        description: "Dropdown choice with answer validation",
        icon: <ChevronDown className="h-4 w-4" />,
        keywords: ["cloze", "choice", "dropdown", "select", "options", "multiple"],
        category: "inline",
    },
    {
        id: "inlineToggle",
        label: "Toggle",
        description: "Click to cycle through options",
        icon: <Type className="h-4 w-4" />,
        keywords: ["toggle", "cycle", "switch", "options", "click", "mutable"],
        category: "inline",
    },
    {
        id: "inlineTooltip",
        label: "Tooltip",
        description: "Show a tooltip/definition on hover",
        icon: <Info className="h-4 w-4" />,
        keywords: ["tooltip", "hover", "definition", "glossary", "info", "explain", "hoverable"],
        category: "inline",
    },
    {
        id: "inlineTrigger",
        label: "Trigger",
        description: "Click to set a variable value",
        icon: <Zap className="h-4 w-4" />,
        keywords: ["trigger", "click", "action", "event", "activate", "run", "fire"],
        category: "inline",
    },
    {
        id: "inlineHyperlink",
        label: "Hyperlink",
        description: "Link to URL or scroll to block",
        icon: <Link className="h-4 w-4" />,
        keywords: ["link", "hyperlink", "url", "href", "anchor", "navigate", "scroll", "goto"],
        category: "inline",
    },
    {
        id: "inlineFormula",
        label: "Formula",
        description: "Inline math formula with colored variables",
        icon: <Sigma className="h-4 w-4" />,
        keywords: ["formula", "math", "equation", "latex", "katex", "inline", "expression"],
        category: "inline",
    },
    {
        id: "inlineSpotColor",
        label: "Spot Color",
        description: "Colored pill highlighting a variable name",
        icon: <Palette className="h-4 w-4" />,
        keywords: ["spot", "color", "highlight", "variable", "pill", "tag", "label"],
        category: "inline",
    },
    {
        id: "inlineLinkedHighlight",
        label: "Linked Highlight",
        description: "Hover to highlight linked parts of a visual",
        icon: <Highlighter className="h-4 w-4" />,
        keywords: ["linked", "highlight", "hover", "connect", "visual", "link", "interactive", "coordinate"],
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
    /** Filter commands by category. When omitted, all commands are shown. */
    categories?: ('block' | 'inline')[];
}

export const SlashCommandMenu = ({
    isOpen,
    searchQuery,
    onSelect,
    onClose,
    position,
    anchorRef,
    categories,
}: SlashCommandMenuProps) => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const menuRef = useRef<HTMLDivElement>(null);

    // Pre-filter by category, then by search query
    const categoryFiltered = categories
        ? slashCommands.filter((cmd) => categories.includes(cmd.category))
        : slashCommands;

    const filteredCommands = categoryFiltered.filter((cmd) => {
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

    // Calculate base position from anchor element or explicit position
    const basePosition = position || { top: 0, left: 0 };
    if (anchorRef?.current && !position) {
        const rect = anchorRef.current.getBoundingClientRect();
        basePosition.top = rect.bottom + 4;
        basePosition.left = rect.left;
    }

    // Viewport-aware adjustment: flip above if overflowing bottom
    const [adjustedPosition, setAdjustedPosition] = useState<{ top: number; left: number } | null>(null);

    useLayoutEffect(() => {
        if (!isOpen || !menuRef.current) {
            setAdjustedPosition(null);
            return;
        }

        const menuRect = menuRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        const gap = 4;
        const margin = 8;

        let newTop = basePosition.top;
        let newLeft = basePosition.left;

        // If menu overflows the viewport bottom, flip above the anchor
        if (menuRect.bottom > viewportHeight - margin) {
            // basePosition.top was set to anchorBottom + gap, so anchorBottom = top - gap
            const anchorBottom = basePosition.top - gap;
            // Place menu above: anchorTop (≈ anchorBottom - one line) minus menu height minus gap
            newTop = anchorBottom - menuRect.height - gap - 20;

            // If flipping above also overflows, clamp to top of viewport
            if (newTop < margin) {
                newTop = margin;
            }
        }

        // Prevent horizontal overflow
        if (newLeft + menuRect.width > viewportWidth - margin) {
            newLeft = viewportWidth - menuRect.width - margin;
        }
        if (newLeft < margin) {
            newLeft = margin;
        }

        if (newTop !== basePosition.top || newLeft !== basePosition.left) {
            setAdjustedPosition({ top: newTop, left: newLeft });
        } else {
            setAdjustedPosition(null);
        }
    }, [isOpen, basePosition.top, basePosition.left]);

    if (!isOpen) return null;

    const finalPosition = adjustedPosition || basePosition;

    return (
        <div
            ref={menuRef}
            className={cn(
                "fixed z-50 min-w-[280px] max-h-[320px] overflow-y-auto",
                "rounded-lg border border-border bg-white shadow-lg"
            )}
            style={{
                top: finalPosition.top,
                left: finalPosition.left,
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
