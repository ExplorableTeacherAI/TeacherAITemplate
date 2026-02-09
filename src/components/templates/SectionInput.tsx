import { type KeyboardEvent, useRef, useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { SlashCommandMenu, type SlashCommandType, isInlineCommand, type BlockCommandType } from "./SlashCommandMenu";

/**
 * Extract content from contentEditable element, converting inline component elements to markers
 */
const extractContentWithMarkers = (element: HTMLElement): string => {
    let result = '';

    const processNode = (node: Node) => {
        if (node.nodeType === Node.TEXT_NODE) {
            result += node.textContent || '';
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            const el = node as HTMLElement;
            const componentType = el.getAttribute('data-inline-component');
            const componentId = el.getAttribute('data-component-id');

            if (componentType && componentId) {
                // This is an inline component - convert to marker format
                result += `{{${componentType}:${componentId}}}`;
            } else {
                // Regular element - process children
                node.childNodes.forEach(processNode);
            }
        }
    };

    element.childNodes.forEach(processNode);
    return result.trim();
};

interface SectionInputProps {
    id: string;
    onCommit: (id: string, value: string, blockType?: SlashCommandType) => void;
    placeholder?: string;
}

export const SectionInput = ({ id, onCommit, placeholder = "Type '/' for commands" }: SectionInputProps) => {
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

    // Update menu position when showing
    useEffect(() => {
        if (showSlashMenu && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            setMenuPosition({
                top: rect.bottom + 4,
                left: rect.left,
            });
        }
    }, [showSlashMenu]);

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
    }, [selectedBlockType, placeholder]);

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
            // For inline components, insert an actual HTML element that represents the component
            const uniqueId = `${commandType}-${Date.now()}`;

            // Get text before the slash command
            const textBeforeSlash = lastSlashIndex > 0 ? currentText.substring(0, lastSlashIndex) : "";

            // First, update the text to remove the slash command
            contentRef.current.innerHTML = textBeforeSlash;

            // Now insert the component HTML at the end using Selection API
            const selection = window.getSelection();
            const range = document.createRange();

            // Move to end of current content
            if (contentRef.current.childNodes.length > 0) {
                range.selectNodeContents(contentRef.current);
                range.collapse(false);
            } else {
                range.setStart(contentRef.current, 0);
                range.collapse(true);
            }
            selection?.removeAllRanges();
            selection?.addRange(range);

            // Create the inline component placeholder HTML
            let componentHTML = '';
            switch (commandType) {
                case 'inlineScrubbleNumber':
                    componentHTML = `<span 
                        contenteditable="false" 
                        data-inline-component="${commandType}" 
                        data-component-id="${uniqueId}"
                        style="display: inline-flex; align-items: center; background: rgba(216, 27, 96, 0.9); color: white; border-radius: 4px; padding: 0 2px; font-weight: 500; margin: 0 2px; user-select: none; cursor: default;"
                    ><span style="padding: 0 2px;">◀</span><span style="min-width: 20px; text-align: center;">10</span><span style="padding: 0 2px;">▶</span></span>`;
                    break;
                case 'inlineDropdown':
                    componentHTML = `<span 
                        contenteditable="false" 
                        data-inline-component="${commandType}" 
                        data-component-id="${uniqueId}"
                        style="display: inline-flex; align-items: center; background: rgba(59, 130, 246, 0.35); color: #3B82F6; border-radius: 4px; padding: 0 6px; font-weight: 500; margin: 0 2px; user-select: none; cursor: pointer;"
                    >??? ▾</span>`;
                    break;
                case 'inlineTextInput':
                    componentHTML = `<span 
                        contenteditable="false" 
                        data-inline-component="${commandType}" 
                        data-component-id="${uniqueId}"
                        style="display: inline-flex; align-items: center; background: rgba(59, 130, 246, 0.35); color: #3B82F6; border-radius: 4px; padding: 0 6px; font-weight: 500; margin: 0 2px; user-select: none; cursor: text;"
                    >???</span>`;
                    break;
            }

            // Insert the HTML
            document.execCommand('insertHTML', false, componentHTML);

            // Add a space after the component for easier typing
            document.execCommand('insertText', false, ' ');

            slashPositionRef.current = -1;
            contentRef.current.focus();
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
        };

        // If it's a divider, commit immediately
        if (commandType === "divider") {
            onCommit(id, "---", commandType);
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

            <SlashCommandMenu
                isOpen={showSlashMenu}
                searchQuery={slashQuery}
                onSelect={handleSlashCommandSelect}
                onClose={handleCloseSlashMenu}
                position={menuPosition}
            />
        </div>
    );
};
