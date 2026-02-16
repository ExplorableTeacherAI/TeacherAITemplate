import React, { useRef, useCallback, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { useEditing } from '@/contexts/EditingContext';
import { useAppMode } from '@/contexts/AppModeContext';
import { cn } from '@/lib/utils';
import { useInlineSlashCommands, extractContentWithMarkers } from '@/hooks/useInlineSlashCommands';
import { SlashCommandMenu } from '@/components/templates/SlashCommandMenu';

interface EditableTextProps {
    children: React.ReactNode;
    id?: string;
    blockId?: string;
    className?: string;
    as?: keyof JSX.IntrinsicElements;
    /** When true, typing "/" opens the inline slash command menu. */
    enableSlashCommands?: boolean;
}

// Context to check if we are inside an editable text component
const EditableTextContext = React.createContext<{ isParentEditable: boolean }>({ isParentEditable: false });

export const useEditableTextContext = () => React.useContext(EditableTextContext);

/**
 * EditableText wrapper component.
 * In editor mode, makes text content editable with click-to-edit functionality.
 * Preserves styling and structure while enabling inline editing.
 */
export const EditableText: React.FC<EditableTextProps> = ({
    children,
    id,
    blockId = '',
    className = '',
    as: Component = 'span',
    enableSlashCommands = false,
}) => {
    const { isEditor } = useAppMode();
    const { addTextEdit } = useEditing();
    const containerRef = useRef<HTMLElement>(null);
    const [isContentEditable, setIsContentEditable] = useState(false);
    const originalTextRef = useRef<string>('');
    const originalHtmlRef = useRef<string>('');
    const originalInlineCountRef = useRef<number>(0);

    // Inline slash commands (inert when enableSlashCommands is false)
    const {
        showSlashMenu,
        slashQuery,
        menuPosition,
        handleSlashInput,
        handleSlashKeyDown,
        handleSlashCommandSelect,
        handleCloseSlashMenu,
    } = useInlineSlashCommands({
        enabled: enableSlashCommands && isContentEditable,
        containerRef,
    });

    // Generate a unique path for this element based on its position in the DOM
    const getElementPath = useCallback(() => {
        if (!containerRef.current) return '';

        const path: string[] = [];
        let el: HTMLElement | null = containerRef.current;

        while (el && el !== document.body) {
            const parent = el.parentElement;
            if (parent) {
                const siblings = Array.from(parent.children);
                const index = siblings.indexOf(el);
                const tagName = el.tagName.toLowerCase();
                path.unshift(`${tagName}[${index}]`);
            }
            el = parent;
        }

        return path.join(' > ');
    }, []);

    // Handle click to enable editing
    const handleClick = useCallback((e: React.MouseEvent) => {
        if (!isEditor) return;

        e.stopPropagation();

        if (!isContentEditable && containerRef.current) {
            // Store original text AND inner HTML before editing
            // Use innerHTML (not outerHTML) to avoid capturing contentEditable/data-editing attributes
            // which change when entering/leaving edit mode and cause false-positive diffs
            originalTextRef.current = containerRef.current.innerText;
            originalHtmlRef.current = containerRef.current.innerHTML;
            // Track how many inline components exist BEFORE editing so we can detect
            // truly new insertions on blur (not pre-existing ones like InlineTrigger).
            originalInlineCountRef.current = containerRef.current.querySelectorAll('[data-inline-component]').length;
            setIsContentEditable(true);

            // Focus and select the content
            setTimeout(() => {
                if (containerRef.current) {
                    containerRef.current.focus();

                    // Select all text
                    const range = document.createRange();
                    range.selectNodeContents(containerRef.current);
                    const selection = window.getSelection();
                    selection?.removeAllRanges();
                    selection?.addRange(range);
                }
            }, 0);
        }
    }, [isEditor, isContentEditable]);

    // Handle blur to save changes
    const handleBlur = useCallback(() => {
        if (!containerRef.current) return;

        const newText = containerRef.current.innerText;
        const newHtml = containerRef.current.innerHTML;
        const originalText = originalTextRef.current;
        const originalHtml = originalHtmlRef.current;

        // Check if NEW inline component placeholders were inserted during this edit session.
        // Compare the current count against the count recorded when editing started.
        // This prevents unnecessary round-trips when pre-existing inline components
        // (e.g. InlineTrigger, InlineScrubbleNumber) are already in the paragraph.
        const currentInlineCount = containerRef.current.querySelectorAll('[data-inline-component]').length;
        const hasNewInlineComponents = enableSlashCommands && currentInlineCount > originalInlineCountRef.current;

        // Only create edit if the actual content changed (text or inner HTML)
        if (newText !== originalText || newHtml !== originalHtml) {
            addTextEdit({
                blockId: blockId,
                elementPath: getElementPath(),
                originalText,
                originalHtml,
                newText,
                newHtml,
            });
        }

        // If inline components were inserted, extract content as markers and
        // dispatch an event so LessonView can re-render the block with real React components.
        // This must happen BEFORE setIsContentEditable(false) so LessonView's state update
        // is batched with our state update — the old component is unmounted and the new one
        // with real inline components is mounted in a single render.
        if (hasNewInlineComponents) {
            const contentWithMarkers = extractContentWithMarkers(containerRef.current);
            window.dispatchEvent(new CustomEvent('block-inline-content-update', {
                detail: { blockId, content: contentWithMarkers },
            }));
        }

        setIsContentEditable(false);
    }, [blockId, getElementPath, addTextEdit, enableSlashCommands]);

    // Handle keyboard events
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        // Let the slash menu consume ArrowDown/ArrowUp/Enter/Escape first
        if (handleSlashKeyDown(e)) return;

        // Save on Enter (for single-line elements)
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            containerRef.current?.blur();
        }

        // Cancel on Escape — restore innerHTML (not innerText) to preserve existing inline components
        if (e.key === 'Escape') {
            if (containerRef.current) {
                containerRef.current.innerHTML = originalHtmlRef.current;
            }
            setIsContentEditable(false);
        }
    }, [handleSlashKeyDown]);

    // Disable editing when mode changes
    useEffect(() => {
        if (!isEditor) {
            setIsContentEditable(false);
        }
    }, [isEditor]);

    // If not in editor mode, just render children normally
    if (!isEditor) {
        return React.createElement(Component, { id, className }, children);
    }

    // Handle input events — forward to slash command detector
    const handleInput = useCallback(() => {
        handleSlashInput();
    }, [handleSlashInput]);

    // Close slash menu when leaving edit mode
    const handleBlurWithSlash = useCallback(() => {
        handleCloseSlashMenu();
        handleBlur();
    }, [handleCloseSlashMenu, handleBlur]);

    return (
        <EditableTextContext.Provider value={{ isParentEditable: isContentEditable }}>
            {React.createElement(
                Component,
                {
                    id,
                    ref: containerRef,
                    className: cn(
                        className,
                        isEditor && 'cursor-text transition-all duration-150 outline-none focus:outline-none'
                    ),
                    contentEditable: isContentEditable,
                    suppressContentEditableWarning: true,
                    onClick: handleClick,
                    onBlur: handleBlurWithSlash,
                    onKeyDown: handleKeyDown,
                    onInput: enableSlashCommands ? handleInput : undefined,
                    'data-editable': 'true',
                    'data-editing': isContentEditable ? 'true' : undefined,
                },
                children
            )}
            {enableSlashCommands && ReactDOM.createPortal(
                <SlashCommandMenu
                    isOpen={showSlashMenu}
                    searchQuery={slashQuery}
                    onSelect={handleSlashCommandSelect}
                    onClose={handleCloseSlashMenu}
                    position={menuPosition}
                    categories={['inline']}
                />,
                document.body
            )}
        </EditableTextContext.Provider>
    );
};

/**
 * Higher-order component to make any element's text content editable.
 * Automatically wraps text nodes in EditableText components.
 */
export const withEditableText = <P extends object>(
    WrappedComponent: React.ComponentType<P>,
    blockId?: string
) => {
    const WithEditableText: React.FC<P> = (props) => {
        return (
            <EditableText blockId={blockId}>
                <WrappedComponent {...props} />
            </EditableText>
        );
    };

    WithEditableText.displayName = `WithEditableText(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

    return WithEditableText;
};

export default EditableText;
