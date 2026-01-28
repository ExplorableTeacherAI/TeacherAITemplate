import React, { useRef, useCallback, useEffect, useState } from 'react';
import { useEditing } from '@/contexts/EditingContext';
import { useAppMode } from '@/contexts/AppModeContext';
import { cn } from '@/lib/utils';

interface EditableTextProps {
    children: React.ReactNode;
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
    sectionId = '',
    className = '',
    as: Component = 'span',
}) => {
    const { isEditor } = useAppMode();
    const { isEditing, addTextEdit } = useEditing();
    const containerRef = useRef<HTMLElement>(null);
    const [isContentEditable, setIsContentEditable] = useState(false);
    const originalTextRef = useRef<string>('');

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
        if (!isEditor || !isEditing) return;

        e.stopPropagation();

        if (!isContentEditable && containerRef.current) {
            // Store original text before editing
            originalTextRef.current = containerRef.current.innerText;
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
    }, [isEditor, isEditing, isContentEditable]);

    // Handle blur to save changes
    const handleBlur = useCallback(() => {
        if (!containerRef.current) return;

        const newText = containerRef.current.innerText;
        const originalText = originalTextRef.current;

        // Only create edit if text actually changed
        if (newText !== originalText) {
            addTextEdit({
                sectionId,
                elementPath: getElementPath(),
                originalText,
                newText,
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
        if (!isEditing) {
            setIsContentEditable(false);
        }
    }, [isEditing]);

    // If not in editor mode, just render children normally
    if (!isEditor) {
        return <>{children}</>;
    }

    return (
        <EditableTextContext.Provider value={{ isParentEditable: isContentEditable }}>
            {React.createElement(
                Component,
                {
                    ref: containerRef,
                    className: cn(
                        className,
                        isEditing && 'cursor-text hover:outline hover:outline-2 hover:outline-dashed hover:outline-offset-2 hover:outline-[#3cc499] transition-all duration-150',
                        isContentEditable && 'outline outline-2 outline-solid outline-offset-2 outline-[#3cc499] bg-[#3cc499]/10'
                    ),
                    contentEditable: isContentEditable,
                    suppressContentEditableWarning: true,
                    onClick: handleClick,
                    onBlur: handleBlur,
                    onKeyDown: handleKeyDown,
                    'data-editable': isEditing ? 'true' : undefined,
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
