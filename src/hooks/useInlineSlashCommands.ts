import { useState, useRef, useCallback } from 'react';
import type { SlashCommandType } from '@/components/templates/SlashCommandMenu';
import { isInlineCommand, type InlineCommandType } from '@/components/templates/SlashCommandMenu';
import { createInlineMarkerId, decodeMarkerJson, encodeMarkerJson, encodeMarkerProps } from '@/lib/inlineMarkers';

/**
 * Dispatch a custom event requesting the editor modal to open for a newly
 * inserted inline component. EditingContext listens for this and calls the
 * appropriate `openXxxEditor` method with `isNew: true`.
 */
export const dispatchEditorOpenRequest = (
    commandType: InlineCommandType,
    uniqueId: string,
    blockId: string,
) => {
    window.dispatchEvent(new CustomEvent('inline-editor-open-request', {
        detail: { commandType, uniqueId, blockId },
    }));
};

/**
 * Extract content from a contentEditable element, converting inline component
 * placeholder spans (data-inline-component) into text markers like {{type:id}}.
 * Shared between BlockInput and EditableText.
 */
export const extractContentWithMarkers = (element: HTMLElement): string => {
    const serializeNode = (node: Node): string => {
        if (node.nodeType === Node.TEXT_NODE) {
            return node.textContent || '';
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            const el = node as HTMLElement;
            const componentType = el.getAttribute('data-inline-component');
            const componentId = el.getAttribute('data-component-id');

            if (componentType && componentId) {
                const propsAttr = el.getAttribute('data-component-props');
                // Check for saved props (present on real React-rendered components)
                if (propsAttr) {
                    // Props are stored as base64-encoded JSON on the element.
                    // Validate it's valid base64 by attempting a decode round-trip.
                    try {
                        JSON.parse(decodeMarkerJson(propsAttr)); // validate
                        return `{{${componentType}:${componentId}|${propsAttr}}}`;
                    } catch {
                        // Fallback: attribute might be raw JSON (legacy), try encoding it
                        try {
                            const encoded = encodeMarkerJson(propsAttr);
                            return `{{${componentType}:${componentId}|${encoded}}}`;
                        } catch {
                            return `{{${componentType}:${componentId}}}`;
                        }
                    }
                } else {
                    // No saved props (e.g. newly inserted placeholder via slash command).
                    // Extract visible text from DOM so the round-trip preserves it.
                    const domText = el.textContent?.trim();
                    if (domText) {
                        try {
                            const minimalProps = encodeMarkerProps({ text: domText });
                            return `{{${componentType}:${componentId}|${minimalProps}}}`;
                        } catch {
                            return `{{${componentType}:${componentId}}}`;
                        }
                    } else {
                        return `{{${componentType}:${componentId}}}`;
                    }
                }
            } else {
                return Array.from(node.childNodes).map(serializeNode).join('');
            }
        }
        return '';
    };

    return Array.from(element.childNodes).map(serializeNode).join('').trim();
};

/**
 * Check if an element's DOM tree contains inline component placeholder spans.
 */
export const hasInlineComponentSpans = (element: HTMLElement): boolean => {
    return element.querySelector('[data-inline-component]') !== null;
};

/**
 * Returns the placeholder HTML for a given inline component type.
 * Shared between BlockInput and EditableText.
 */
export const getInlineComponentHTML = (commandType: SlashCommandType, uniqueId: string): string => {
    switch (commandType) {
        case 'inlineHyperlink':
            return `<span
                contenteditable="false"
                data-inline-component="${commandType}"
                data-component-id="${uniqueId}"
                style="display: inline-flex; align-items: center; color: #10B981; border-bottom: 2px solid #10B981; padding-bottom: 2px; font-weight: 500; margin: 0 2px; user-select: none; cursor: pointer;"
            >link</span>`;
        default:
            return '';
    }
};

interface UseInlineSlashCommandsOptions {
    /** When false, the hook is inert (safe for unconditional calls). */
    enabled: boolean;
    /** Ref to the contentEditable element. */
    containerRef: React.RefObject<HTMLElement | null>;
}

interface UseInlineSlashCommandsReturn {
    showSlashMenu: boolean;
    slashQuery: string;
    menuPosition: { top: number; left: number };
    handleSlashInput: () => void;
    /** Returns true if the key event was consumed by the slash menu. */
    handleSlashKeyDown: (e: React.KeyboardEvent) => boolean;
    handleSlashCommandSelect: (commandType: SlashCommandType) => void;
    handleCloseSlashMenu: () => void;
}

/**
 * Reusable hook for inline slash command detection, menu state,
 * and inline component insertion into a contentEditable element.
 */
export const useInlineSlashCommands = ({
    enabled,
    containerRef,
}: UseInlineSlashCommandsOptions): UseInlineSlashCommandsReturn => {
    const [showSlashMenu, setShowSlashMenu] = useState(false);
    const [slashQuery, setSlashQuery] = useState('');
    const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
    const slashPositionRef = useRef<number>(-1);

    const handleSlashInput = useCallback(() => {
        if (!enabled || !containerRef.current) return;

        let text = containerRef.current.innerText || '';
        text = text.replace(/[\n\r]+$/, '');

        if (!text) {
            setShowSlashMenu(false);
            setSlashQuery('');
            slashPositionRef.current = -1;
            return;
        }

        const lastSlashIndex = text.lastIndexOf('/');

        if (lastSlashIndex !== -1) {
            const queryAfterSlash = text.substring(lastSlashIndex + 1);

            if (!queryAfterSlash.includes(' ')) {
                // Position the menu below the caret
                const sel = window.getSelection();
                if (sel && sel.rangeCount > 0) {
                    const range = sel.getRangeAt(0);
                    const rect = range.getBoundingClientRect();
                    setMenuPosition({
                        top: rect.bottom + 4,
                        left: rect.left,
                    });
                } else {
                    // Fallback to container position
                    const containerRect = containerRef.current.getBoundingClientRect();
                    setMenuPosition({
                        top: containerRect.bottom + 4,
                        left: containerRect.left,
                    });
                }

                setShowSlashMenu(true);
                setSlashQuery(queryAfterSlash);
                slashPositionRef.current = lastSlashIndex;
            } else {
                setShowSlashMenu(false);
                setSlashQuery('');
                slashPositionRef.current = -1;
            }
        } else {
            setShowSlashMenu(false);
            setSlashQuery('');
            slashPositionRef.current = -1;
        }
    }, [enabled, containerRef]);

    const handleSlashKeyDown = useCallback(
        (e: React.KeyboardEvent): boolean => {
            if (!enabled || !showSlashMenu) return false;

            if (['ArrowDown', 'ArrowUp', 'Enter', 'Escape'].includes(e.key)) {
                // Let the SlashCommandMenu's global keydown handler process
                // ArrowDown/ArrowUp/Enter. We just prevent the contentEditable default.
                if (e.key !== 'Escape') {
                    e.preventDefault();
                }
                if (e.key === 'Escape') {
                    e.preventDefault();
                    setShowSlashMenu(false);
                    setSlashQuery('');
                    slashPositionRef.current = -1;
                }
                return true; // consumed
            }
            return false;
        },
        [enabled, showSlashMenu]
    );

    const handleSlashCommandSelect = useCallback(
        (commandType: SlashCommandType) => {
            setShowSlashMenu(false);
            setSlashQuery('');

            if (!containerRef.current) return;

            // Only handle inline commands here
            if (!isInlineCommand(commandType)) return;

            const uniqueId = createInlineMarkerId(commandType);
            const componentHTML = getInlineComponentHTML(commandType, uniqueId);
            const container = containerRef.current;

            // Restore focus (may have moved to the menu)
            container.focus();

            // Surgically remove only the "/query" text from the DOM using
            // TreeWalker + Range API so existing inline components are preserved.
            const treeWalker = document.createTreeWalker(
                container,
                NodeFilter.SHOW_TEXT,
                {
                    acceptNode: (node) => {
                        // Skip text inside inline component spans
                        if (node.parentElement?.closest('[data-inline-component]')) {
                            return NodeFilter.FILTER_REJECT;
                        }
                        return NodeFilter.FILTER_ACCEPT;
                    },
                },
            );

            let targetNode: Text | null = null;
            let slashOffset = -1;

            // Find the last text node containing "/" (that's the one the user typed in)
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
                // Select from "/" to end of this text node (the query the user typed),
                // then delete and insert the component in its place.
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

            // Resolve blockId from the container's closest data-block-id ancestor
            const blockEl = container.closest('[data-block-id]');
            const blockId = blockEl?.getAttribute('data-block-id') || '';

            // Immediately open the editor modal for the newly inserted inline component
            setTimeout(() => {
                dispatchEditorOpenRequest(commandType as InlineCommandType, uniqueId, blockId);
            }, 50);

            slashPositionRef.current = -1;
        },
        [containerRef]
    );

    const handleCloseSlashMenu = useCallback(() => {
        setShowSlashMenu(false);
        setSlashQuery('');
    }, []);

    return {
        showSlashMenu,
        slashQuery,
        menuPosition,
        handleSlashInput,
        handleSlashKeyDown,
        handleSlashCommandSelect,
        handleCloseSlashMenu,
    };
};
