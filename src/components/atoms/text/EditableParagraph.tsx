import React from 'react';
import { EditableText } from './EditableText';
import { cn } from '@/lib/utils';

interface EditableParagraphProps {
    children: React.ReactNode;
    id?: string;
    blockId?: string;
    className?: string;
    /** Text size variant */
    size?: 'sm' | 'base' | 'lg' | 'xl';
    /** Leading/line-height variant */
    leading?: 'tight' | 'snug' | 'normal' | 'relaxed' | 'loose';
}

/**
 * Size styles for paragraphs
 */
const sizeStyles = {
    sm: 'text-sm sm:text-base',
    base: 'text-base sm:text-lg',
    lg: 'text-lg sm:text-xl',
    xl: 'text-xl sm:text-2xl',
};

/**
 * Line-height styles
 */
const leadingStyles = {
    tight: 'leading-tight',
    snug: 'leading-snug',
    normal: 'leading-normal',
    relaxed: 'leading-relaxed',
    loose: 'leading-loose',
};

/**
 * EditableParagraph - Body text with inline component support
 * 
 * Use this for regular paragraph content that may contain inline
 * interactive components like InlineScrubbleNumber, equations, etc.
 * 
 * Features:
 * - Supports inline editing in editor mode
 * - Can contain inline components (InlineScrubbleNumber, Equation, etc.)
 * - Configurable text size and line-height
 * - Comfortable reading experience by default
 * 
 * @example Basic usage
 * ```tsx
 * <EditableParagraph blockId="intro">
 *   This is the introduction text that explains the concept.
 * </EditableParagraph>
 * ```
 * 
 * @example With inline number
 * ```tsx
 * <EditableParagraph blockId="demo">
 *   If we set the value to{" "}
 *   <InlineScrubbleNumber varName="myValue" defaultValue={5} min={0} max={10} />
 *   {" "}we can see the effect in real-time.
 * </EditableParagraph>
 * ```
 * 
 * @example With equation
 * ```tsx
 * <EditableParagraph blockId="physics">
 *   The famous equation <Equation latex="E = mc^2" /> describes mass-energy equivalence.
 * </EditableParagraph>
 * ```
 */
export const EditableParagraph: React.FC<EditableParagraphProps> = ({
    children,
    id,
    blockId,
    className = '',
    size = 'base',
    leading = 'relaxed',
}) => (
    <EditableText
        as="p"
        id={id}
        blockId={blockId}
        className={cn(
            'text-muted-foreground',
            sizeStyles[size],
            leadingStyles[leading],
            className
        )}
        enableSlashCommands
    >
        {children}
    </EditableText>
);

/**
 * EditableSpan - Inline text wrapper with editing support
 * 
 * Use for inline text that needs to be editable but shouldn't
 * break the flow of a paragraph. Useful when you need finer control
 * over which parts of text are editable.
 * 
 * @example
 * ```tsx
 * <p>
 *   This is regular text with an{" "}
 *   <EditableSpan blockId="highlight">editable portion</EditableSpan>
 *   {" "}in the middle.
 * </p>
 * ```
 */
export const EditableSpan: React.FC<Omit<EditableParagraphProps, 'size' | 'leading'>> = ({
    children,
    id,
    blockId,
    className = '',
}) => (
    <EditableText
        as="span"
        id={id}
        blockId={blockId}
        className={className}
    >
        {children}
    </EditableText>
);

export default EditableParagraph;
