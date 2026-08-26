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

// Context to check if we are inside an editable text component.
// `skipBlurRef` allows child inline components (InlineFormula, InlineHyperlink, etc.)
// to suppress the parent EditableText's handleBlur when opening their editor modal.
interface EditableTextContextValue {
    isParentEditable: boolean;
    skipBlurRef: React.MutableRefObject<boolean>;
}

const defaultSkipBlurRef = { current: false };
const EditableTextContext = React.createContext<EditableTextContextValue>({
    isParentEditable: false,
    skipBlurRef: defaultSkipBlurRef,
});

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
    const originalTextWithoutInlineRef = useRef<string>('');
    const skipBlurRef = useRef(false);
    const [isVisuallyEmpty, setIsVisuallyEmpty] = useState(false);

    const refreshEmptyState = useCallback(() => {
        const element = containerRef.current;
        if (!element) return;
        // Hidden staged content (e.g. RevealOnInteraction before the student
        // interacts) counts as content: the block is not empty, its text just
        // has not appeared yet — the "empty block" placeholder would mislead.
        const hasHiddenContent = Boolean(
            element.querySelector('[data-inline-component], [data-reveal-pending]')
        );
        const text = (element.innerText || element.textContent || '')
            .replace(/(?:\s|\u00a0|\u200B|\u200C|\u200D|\uFEFF)+/g, '');
        setIsVisuallyEmpty(!hasHiddenContent && text.length === 0);
    }, []);

    useEffect(() => {
        refreshEmptyState();
    }, [children, refreshEmptyState]);

    // Content can change without this component re-rendering — a
    // RevealOnInteraction firing, state-bound text updating, an inline
    // component mounting late. Watch the DOM itself so the empty flag (and
    // with it the placeholder overlay) can never go stale and sit behind
    // text that appeared after mount.
    useEffect(() => {
        const element = containerRef.current;
        if (!element || !isEditor) return;
        const observer = new MutationObserver(refreshEmptyState);
        observer.observe(element, { subtree: true, childList: true, characterData: true });
        return () => observer.disconnect();
    }, [isEditor, refreshEmptyState]);

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

    // Extract text content from an element, skipping inline component subtrees.
    // Used to compare only the "real" text (not rendered inline component output)
    // when deciding whether a text edit should be created.
    const extractTextWithoutInline = useCallback((el: HTMLElement): string => {
        let text = '';
        for (const node of Array.from(el.childNodes)) {
            if (node.nodeType === Node.TEXT_NODE) {
                text += node.textContent || '';
            } else if (node instanceof HTMLElement) {
                if (node.hasAttribute('data-inline-component')) continue;
                text += extractTextWithoutInline(node);
            }
        }
        return text;
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
            // truly new insertions on blur (not pre-existing ones like InlineHyperlink).
            originalInlineCountRef.current = containerRef.current.querySelectorAll('[data-inline-component]').length;
            // Capture text excluding inline component output for accurate change detection
            originalTextWithoutInlineRef.current = extractTextWithoutInline(containerRef.current);
            setIsContentEditable(true);

            // Focus and select the content
            setTimeout(() => {
                if (containerRef.current) {
                    containerRef.current.focus();

                    // Select all text
                    const range = document.createRange();
                    range.selectNodeContents(containerRef.current);
                    if (isVisuallyEmpty) range.collapse(true);
                    const selection = window.getSelection();
                    selection?.removeAllRanges();
                    selection?.addRange(range);
                }
            }, 0);
        }
    }, [isEditor, isContentEditable, extractTextWithoutInline, isVisuallyEmpty]);

    // Capture the current DOM without necessarily ending the editing session.
    // Auto-save uses finishEditing=false so it never steals keyboard focus.
    const captureChanges = useCallback((finishEditing: boolean) => {
        if (!containerRef.current) return;

        // If a child inline component editor is opening, skip blur processing entirely.
        // The inline editor has its own edit pipeline — creating text edits here
        // would be incorrect (the text hasn't changed, only the inline component's props).
        if (skipBlurRef.current) {
            skipBlurRef.current = false;
            if (finishEditing) setIsContentEditable(false);
            return;
        }

        const newText = containerRef.current.innerText;
        const newHtml = containerRef.current.innerHTML;
        const originalText = originalTextRef.current;
        const originalHtml = originalHtmlRef.current;
        refreshEmptyState();

        // Check if NEW inline component placeholders were inserted during this edit session.
        // Compare the current count against the count recorded when editing started.
        // This prevents unnecessary round-trips when pre-existing inline components
        // (e.g. InlineHyperlink, InlineFormula) are already in the paragraph.
        const currentInlineCount = containerRef.current.querySelectorAll('[data-inline-component]').length;
        const hasNewInlineComponents = enableSlashCommands && currentInlineCount > originalInlineCountRef.current;
        const hasAnyInlineComponents = currentInlineCount > 0;

        // Debug: log inline component counts to diagnose duplication issues
        if (hasAnyInlineComponents) {
            console.log(`[EditableText blur] blockId=${blockId} inline: current=${currentInlineCount} original=${originalInlineCountRef.current} hasNew=${hasNewInlineComponents}`);
        }

        // Decide whether the actual (non-component) text changed.
        // For paragraphs with inline components, innerText/innerHTML will differ
        // whenever an inline component re-renders (e.g. after editing its props
        // via the editor modal) even though the surrounding text is unchanged.
        // Sending such a text edit to the backend fails because the rendered
        // inline component text doesn't exist in the JSX source.
        // When inline components are present, normalize whitespace before
        // comparing — browsers may reformat the DOM when entering
        // contentEditable mode, causing spurious diffs.
        const normalizeWs = (s: string) => s
            .replace(/(?:\s|\u200B|\u200C|\u200D|\uFEFF)+/g, ' ')
            .trim();
        let textContentChanged: boolean;
        if (hasAnyInlineComponents) {
            const newTextWithout = extractTextWithoutInline(containerRef.current);
            textContentChanged = normalizeWs(newTextWithout) !== normalizeWs(originalTextWithoutInlineRef.current);
        } else {
            textContentChanged = newText !== originalText || newHtml !== originalHtml;
        }

        // Only create a text edit when no NEW inline components were inserted.
        // New inline components (from slash commands) have their own edit pipeline
        // (hyperlink/formula edits). Including their rendered text in the
        // text edit causes duplicates: the backend writes the rendered text as plain
        // text AND the component edit inserts the real <InlineHyperlink> / etc.
        if (textContentChanged && !hasNewInlineComponents) {
            console.log(`[EditableText blur] Creating text edit for blockId=${blockId} hasInline=${hasAnyInlineComponents}`);
            if (hasAnyInlineComponents) {
                // Strip inline component rendered text — source has JSX tags, not rendered values
                const cleanOriginal = originalTextWithoutInlineRef.current;
                const cleanNew = extractTextWithoutInline(containerRef.current);
                addTextEdit({
                    blockId: blockId,
                    elementPath: getElementPath(),
                    originalText: cleanOriginal,
                    originalHtml,
                    newText: cleanNew,
                    newHtml,
                    fullContent: extractContentWithMarkers(containerRef.current),
                });
            } else {
                addTextEdit({
                    blockId: blockId,
                    elementPath: getElementPath(),
                    originalText,
                    originalHtml,
                    newText,
                    newHtml,
                    fullContent: extractContentWithMarkers(containerRef.current),
                });
            }
        }

        // If inline components were inserted, extract content as markers and
        // dispatch an event so LessonView can re-render the block with real React components.
        // This must happen BEFORE setIsContentEditable(false) so LessonView's state update
        // is batched with our state update — the old component is unmounted and the new one
        // with real inline components is mounted in a single render.
        if (hasNewInlineComponents) {
            const contentWithMarkers = extractContentWithMarkers(containerRef.current);
            console.log(`[EditableText blur] Dispatching block-inline-content-update for blockId=${blockId} markers=${contentWithMarkers.substring(0, 100)}`);
            window.dispatchEvent(new CustomEvent('block-inline-content-update', {
                detail: { blockId, content: contentWithMarkers },
            }));
        }

        if (finishEditing) setIsContentEditable(false);
    }, [blockId, getElementPath, addTextEdit, enableSlashCommands, extractTextWithoutInline, refreshEmptyState]);

    const handleBlur = useCallback(() => captureChanges(true), [captureChanges]);

    useEffect(() => {
        const flush = () => {
            if (isContentEditable && containerRef.current) captureChanges(false);
        };
        window.addEventListener('editor-flush-request', flush);
        return () => window.removeEventListener('editor-flush-request', flush);
    }, [captureChanges, isContentEditable]);

    useEffect(() => {
        const removeCancelledPlaceholder = (event: Event) => {
            const detail = (event as CustomEvent<{
                blockId?: string;
                componentId?: string;
            }>).detail;
            if (!detail?.componentId || detail.blockId !== blockId || !containerRef.current) return;

            const provisional = Array.from(
                containerRef.current.querySelectorAll<HTMLElement>('[data-component-id]')
            ).find(element => element.getAttribute('data-component-id') === detail.componentId);
            provisional?.remove();
            setIsContentEditable(false);
        };
        window.addEventListener('inline-component-cancelled', removeCancelledPlaceholder);
        return () => window.removeEventListener('inline-component-cancelled', removeCancelledPlaceholder);
    }, [blockId]);

    // Handle keyboard events
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        // Let the slash menu consume ArrowDown/ArrowUp/Enter/Escape first
        if (handleSlashKeyDown(e)) return;

        // Save on Enter (for single-line elements)
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            containerRef.current?.blur();
            // Enter is the teacher's explicit commit gesture. Inline component
            // edits intentionally opt out of auto-save, so ask the host to run
            // a manual save after React has captured the blur transaction.
            requestAnimationFrame(() => {
                window.parent.postMessage({ type: 'request-manual-save' }, '*');
            });
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

    // Capture ordinary keystrokes immediately into the pending transaction.
    // The parent debounces persistence; this only updates local edit state.
    const handleInput = useCallback(() => {
        handleSlashInput();
        refreshEmptyState();
        const inlineCount = containerRef.current?.querySelectorAll('[data-inline-component]').length ?? 0;
        if (inlineCount <= originalInlineCountRef.current) captureChanges(false);
    }, [handleSlashInput, captureChanges, refreshEmptyState]);

    // Close slash menu when leaving edit mode
    const handleBlurWithSlash = useCallback(() => {
        handleCloseSlashMenu();
        handleBlur();
    }, [handleCloseSlashMenu, handleBlur]);

    // Hooks must run in the same order in preview and editor modes.
    if (!isEditor) {
        return React.createElement(Component, { id, className }, children);
    }

    return (
        <EditableTextContext.Provider value={{ isParentEditable: isContentEditable, skipBlurRef }}>
            {React.createElement(
                Component,
                {
                    id,
                    ref: containerRef,
                    className: cn(
                        className,
                        isEditor && 'relative cursor-text transition-all duration-150 outline-none focus:outline-none',
                        isEditor && Component === 'span'
                            ? 'inline-block min-h-[1.5em] min-w-[1ch]'
                            : 'block w-full min-h-[1.75em]',
                        isEditor && 'data-[empty=true]:before:absolute data-[empty=true]:before:inset-0 data-[empty=true]:before:content-[attr(data-placeholder)] data-[empty=true]:before:text-muted-foreground/50 data-[empty=true]:before:pointer-events-none'
                    ),
                    contentEditable: isContentEditable,
                    suppressContentEditableWarning: true,
                    onClick: handleClick,
                    onBlur: handleBlurWithSlash,
                    onKeyDown: handleKeyDown,
                    onInput: handleInput,
                    'data-editable': 'true',
                    'data-editing': isContentEditable ? 'true' : undefined,
                    'data-empty': isVisuallyEmpty ? 'true' : 'false',
                    'data-placeholder': 'Click to edit empty block…',
                    'aria-label': isVisuallyEmpty ? 'Empty editable lesson block' : undefined,
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
