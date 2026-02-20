import { type KeyboardEvent, useRef, useEffect, useState, useCallback } from "react";
import ReactDOM from "react-dom";
import { cn } from "@/lib/utils";
import { SlashCommandMenu, type SlashCommandType, isInlineCommand, type BlockCommandType } from "./SlashCommandMenu";
import { getInlineComponentHTML, extractContentWithMarkers } from "@/hooks/useInlineSlashCommands";

interface BlockInputProps {
    id: string;
    onCommit: (id: string, value: string, blockType?: SlashCommandType) => void;
    placeholder?: string;
}

export const BlockInput = ({ id, onCommit, placeholder = "Type '/' for commands" }: BlockInputProps) => {
    const contentRef = useRef<HTMLParagraphElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [showSlashMenu, setShowSlashMenu] = useState(false);
    const [slashQuery, setSlashQuery] = useState("");
    const [selectedBlockType, setSelectedBlockType] = useState<BlockCommandType | null>(null);
    const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
    // Track the position in the text where the slash was typed
    const slashPositionRef = useRef<number>(-1);

    useEffect(() => {
        if (contentRef.current) {
            contentRef.current.focus();
        }
    }, []);

    // Compute menu position from caret, with container fallback
    const computeMenuPosition = useCallback(() => {
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
            const range = sel.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            if (rect.width || rect.height) {
                return { top: rect.bottom + 4, left: rect.left };
            }
        }
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            return { top: rect.bottom + 4, left: rect.left };
        }
        return { top: 0, left: 0 };
    }, []);

    const handleInput = useCallback(() => {
        let text = contentRef.current?.innerText || "";
        // Trim trailing newlines which browsers might add
        text = text.replace(/[\n\r]+$/, "");

        // If text is effectively empty, reset state
        if (!text) {
            setShowSlashMenu(false);
            setSlashQuery("");
            slashPositionRef.current = -1;
            if (selectedBlockType) {
                setSelectedBlockType(null);
                if (contentRef.current) {
                    contentRef.current.dataset.placeholder = placeholder;
                }
            }
            return;
        }

        // Find the last "/" in the text to trigger slash menu
        const lastSlashIndex = text.lastIndexOf("/");

        if (lastSlashIndex !== -1) {
            // Get the text after the last "/"
            const queryAfterSlash = text.substring(lastSlashIndex + 1);

            // Only show the menu if there's no space after the slash
            // (once user types space, they're done with the command)
            if (!queryAfterSlash.includes(" ")) {
                // Compute position in the same batch as showing the menu
                // so the first render already has the correct position
                setMenuPosition(computeMenuPosition());
                setShowSlashMenu(true);
                setSlashQuery(queryAfterSlash);
                slashPositionRef.current = lastSlashIndex;
            } else {
                setShowSlashMenu(false);
                setSlashQuery("");
                slashPositionRef.current = -1;
            }
        } else {
            setShowSlashMenu(false);
            setSlashQuery("");
            slashPositionRef.current = -1;
        }
    }, [selectedBlockType, placeholder, computeMenuPosition]);

    const handleKeyDown = (e: KeyboardEvent<HTMLParagraphElement>) => {
        // Don't interfere if slash menu is handling navigation
        if (showSlashMenu && ["ArrowDown", "ArrowUp", "Escape"].includes(e.key)) {
            e.preventDefault();
            return;
        }

        // Handle Enter for slash menu selection or commit
        if (e.key === "Enter" && !e.shiftKey) {
            if (showSlashMenu) {
                // Let the slash menu handle this
                e.preventDefault();
                return;
            }

            e.preventDefault();
            if (contentRef.current) {
                // Extract content with inline component markers
                const content = extractContentWithMarkers(contentRef.current);
                if (content.trim()) {
                    onCommit(id, content, selectedBlockType || undefined);
                }
            }
        }

        // Close menu on Escape
        if (e.key === "Escape") {
            setShowSlashMenu(false);
            setSlashQuery("");
            slashPositionRef.current = -1;
        }

        // Handle Backspace to potentially close menu or reset block type
        if (e.key === "Backspace") {
            let text = contentRef.current?.innerText || "";
            text = text.replace(/[\n\r]+$/, "");

            if (text === "/" || !text) {
                setShowSlashMenu(false);
                setSlashQuery("");
                slashPositionRef.current = -1;

                // If backspace on empty field, reset block type
                if (!text && selectedBlockType) {
                    setSelectedBlockType(null);
                    if (contentRef.current) {
                        contentRef.current.dataset.placeholder = placeholder;
                    }
                }
            }
        }
    };

    const handleSlashCommandSelect = useCallback((commandType: SlashCommandType) => {
        setShowSlashMenu(false);
        setSlashQuery("");

        if (!contentRef.current) return;

        const currentText = contentRef.current.innerText || "";
        const lastSlashIndex = currentText.lastIndexOf("/");

        // Check if this is an inline component command
        if (isInlineCommand(commandType)) {
            const uniqueId = `${commandType}-${Date.now()}`;
            const componentHTML = getInlineComponentHTML(commandType, uniqueId);

            // Restore focus (may have moved to the menu)
            contentRef.current.focus();

            // Surgically remove only the "/query" text from the DOM using
            // TreeWalker + Range API so existing inline components are preserved.
            const treeWalker = document.createTreeWalker(
                contentRef.current,
                NodeFilter.SHOW_TEXT,
                {
                    acceptNode: (node) => {
                        if (node.parentElement?.closest('[data-inline-component]')) {
                            return NodeFilter.FILTER_REJECT;
                        }
                        return NodeFilter.FILTER_ACCEPT;
                    },
                },
            );

            let targetNode: Text | null = null;
            let slashOffset = -1;

            while (treeWalker.nextNode()) {
                const textNode = treeWalker.currentNode as Text;
                const text = textNode.textContent || '';
                const idx = text.lastIndexOf('/');
                if (idx !== -1) {
                    targetNode = textNode;
                    slashOffset = idx;
                }
            }

            if (targetNode && slashOffset !== -1) {
                const text = targetNode.textContent || '';
                const sel = window.getSelection();
                const deleteRange = document.createRange();
                deleteRange.setStart(targetNode, slashOffset);
                deleteRange.setEnd(targetNode, text.length);

                sel?.removeAllRanges();
                sel?.addRange(deleteRange);
                document.execCommand('delete', false);
                document.execCommand('insertHTML', false, componentHTML);
                document.execCommand('insertText', false, ' ');
            }

            slashPositionRef.current = -1;
            return;
        }

        // For block-level commands, keep the existing behavior
        setSelectedBlockType(commandType as BlockCommandType);

        // Keep text before the slash
        const textBeforeSlash = lastSlashIndex > 0 ? currentText.substring(0, lastSlashIndex) : "";
        contentRef.current.innerText = textBeforeSlash;
        contentRef.current.focus();

        // Move cursor to end
        const range = document.createRange();
        const sel = window.getSelection();
        if (contentRef.current.childNodes.length > 0) {
            range.selectNodeContents(contentRef.current);
            range.collapse(false);
        } else {
            range.setStart(contentRef.current, 0);
            range.collapse(true);
        }
        sel?.removeAllRanges();
        sel?.addRange(range);

        slashPositionRef.current = -1;

        // Update the placeholder based on selected type
        const placeholders: Record<BlockCommandType, string> = {
            h1: "Heading 1",
            h2: "Heading 2",
            h3: "Heading 3",
            paragraph: "Start writing...",
            quote: "Enter your quote...",
            divider: "",
            formulaBlock: "Enter LaTeX formula...",
        };

        // If it's a divider, commit immediately
        if (commandType === "divider") {
            onCommit(id, "---", commandType);
            return;
        }

        // If it's a formulaBlock, commit immediately (opens editor modal)
        if (commandType === "formulaBlock") {
            onCommit(id, "", commandType);
            return;
        }

        // Update placeholder (only shows when empty)
        if (contentRef.current) {
            contentRef.current.setAttribute("data-placeholder", placeholders[commandType as BlockCommandType]);
        }
    }, [id, onCommit]);

    const handleCloseSlashMenu = useCallback(() => {
        setShowSlashMenu(false);
        setSlashQuery("");
    }, []);

    // Get the appropriate styling based on selected block type
    const getBlockTypeStyles = (): string => {
        switch (selectedBlockType) {
            case "h1":
                return "text-4xl font-bold text-gray-900";
            case "h2":
                return "text-3xl font-semibold text-gray-900";
            case "h3":
                return "text-2xl font-semibold text-gray-900";
            case "quote":
                return "text-lg italic text-gray-600 border-l-4 border-gray-300 pl-4";
            default:
                return "text-lg text-gray-800";
        }
    };

    return (
        <div ref={containerRef} className="w-full relative">
            <p
                ref={contentRef}
                contentEditable
                onKeyDown={handleKeyDown}
                onInput={handleInput}
                className={cn(
                    "w-full outline-none leading-relaxed cursor-text min-h-[1.5em]",
                    "empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/50",
                    getBlockTypeStyles()
                )}
                data-placeholder={placeholder}
            />

            {ReactDOM.createPortal(
                <SlashCommandMenu
                    isOpen={showSlashMenu}
                    searchQuery={slashQuery}
                    onSelect={handleSlashCommandSelect}
                    onClose={handleCloseSlashMenu}
                    position={menuPosition}
                />,
                document.body
            )}
        </div>
    );
};
