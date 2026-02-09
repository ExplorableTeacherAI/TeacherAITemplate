import React, { useRef, useCallback, useEffect, useState } from 'react';
import { useEditing } from '@/contexts/EditingContext';
import { useAppMode } from '@/contexts/AppModeContext';
import { cn } from '@/lib/utils';

interface EditableTextProps {
    children: React.ReactNode;
    id?: string;
    sectionId?: string;
    className?: string;
    as?: keyof JSX.IntrinsicElements;
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
    sectionId = '',
    className = '',
    as: Component = 'span',
}) => {
    const { isEditor } = useAppMode();
    const { addTextEdit } = useEditing();
    const containerRef = useRef<HTMLElement>(null);
    const [isContentEditable, setIsContentEditable] = useState(false);
    const originalTextRef = useRef<string>('');
    const originalHtmlRef = useRef<string>('');

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
            // Store original text AND HTML before editing
            originalTextRef.current = containerRef.current.innerText;
            originalHtmlRef.current = containerRef.current.outerHTML; // Capture the element itself
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
        const newHtml = containerRef.current.outerHTML;
        const originalText = originalTextRef.current;
        const originalHtml = originalHtmlRef.current;

        // Only create edit if text actually changed OR html changed (e.g. deleting all content)
        if (newText !== originalText || newHtml !== originalHtml) {
            addTextEdit({
                sectionId,
                elementPath: getElementPath(),
                originalText,
                originalHtml,
                newText,
                newHtml,
            });
        }

        setIsContentEditable(false);
    }, [sectionId, getElementPath, addTextEdit]);

    // Handle keyboard events
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        // Save on Enter (for single-line elements)
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            containerRef.current?.blur();
        }

        // Cancel on Escape
        if (e.key === 'Escape') {
            if (containerRef.current) {
                containerRef.current.innerText = originalTextRef.current;
            }
            setIsContentEditable(false);
        }
    }, []);

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
                    onBlur: handleBlur,
                    onKeyDown: handleKeyDown,
                    'data-editable': 'true',
                    'data-editing': isContentEditable ? 'true' : undefined,
                },
                children
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
    sectionId?: string
) => {
    const WithEditableText: React.FC<P> = (props) => {
        return (
            <EditableText sectionId={sectionId}>
                <WrappedComponent {...props} />
            </EditableText>
        );
    };

    WithEditableText.displayName = `WithEditableText(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

    return WithEditableText;
};

export default EditableText;
