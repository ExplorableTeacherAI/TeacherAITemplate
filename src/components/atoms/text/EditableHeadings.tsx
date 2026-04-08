import React from 'react';
import { EditableText } from './EditableText';
import { cn } from '@/lib/utils';

interface EditableHeadingProps {
    children: React.ReactNode;
    id?: string;
    blockId?: string;
    className?: string;
}

/**
 * Base heading styles following a consistent typography scale.
 * These provide semantic HTML structure with proper visual hierarchy.
 */
export const headingStyles = {
    h1: 'text-4xl sm:text-5xl font-bold tracking-tight leading-tight',
    h2: 'text-3xl sm:text-4xl font-semibold tracking-tight leading-snug',
    h3: 'text-2xl sm:text-3xl font-semibold leading-snug',
    h4: 'text-xl sm:text-2xl font-medium leading-normal',
    h5: 'text-lg sm:text-xl font-medium leading-normal',
    h6: 'text-base sm:text-lg font-medium leading-normal',
};

/**
 * EditableH1 - Primary page/section title
 * 
 * Use for the main title of a page or a major section.
 * Largest and most prominent heading.
 * 
 * @example
 * ```tsx
 * <EditableH1 id="title-1" blockId="intro">
 *   Welcome to Maths
 * </EditableH1>
 * ```
 */
export const EditableH1: React.FC<EditableHeadingProps> = ({
    children,
    id,
    blockId,
    className = '',
}) => (
    <EditableText
        as="h1"
        id={id}
        blockId={blockId}
        className={cn(headingStyles.h1, className)}
    >
        {children}
    </EditableText>
);

/**
 * EditableH2 - Section heading
 * 
 * Use for major sections within a page.
 * Second level in heading hierarchy.
 * 
 * @example
 * ```tsx
 * <EditableH2 id="chapter-heading-1" blockId="chapter-1">
 *   Chapter 1: Introduction
 * </EditableH2>
 * ```
 */
export const EditableH2: React.FC<EditableHeadingProps> = ({
    children,
    id,
    blockId,
    className = '',
}) => (
    <EditableText
        as="h2"
        id={id}
        blockId={blockId}
        className={cn(headingStyles.h2, className)}
    >
        {children}
    </EditableText>
);

/**
 * EditableH3 - Subsection heading
 * 
 * Use for subsections within a major section.
 * Third level in heading hierarchy.
 * 
 * @example
 * ```tsx
 * <EditableH3 id="subsection-1-1" blockId="1-1">
 *   1.1 Basic Concepts
 * </EditableH3>
 * ```
 */
export const EditableH3: React.FC<EditableHeadingProps> = ({
    children,
    id,
    blockId,
    className = '',
}) => (
    <EditableText
        as="h3"
        id={id}
        blockId={blockId}
        className={cn(headingStyles.h3, className)}
    >
        {children}
    </EditableText>
);

/**
 * EditableH4 - Minor heading
 * 
 * Use for smaller divisions within a subsection.
 * Fourth level in heading hierarchy.
 * 
 * @example
 * ```tsx
 * <EditableH4 id="definitions-heading" blockId="definitions">
 *   Key Definitions
 * </EditableH4>
 * ```
 */
export const EditableH4: React.FC<EditableHeadingProps> = ({
    children,
    id,
    blockId,
    className = '',
}) => (
    <EditableText
        as="h4"
        id={id}
        blockId={blockId}
        className={cn(headingStyles.h4, className)}
    >
        {children}
    </EditableText>
);

/**
 * EditableH5 - Fine heading
 * 
 * Use for fine-grained organization.
 * Fifth level in heading hierarchy.
 */
export const EditableH5: React.FC<EditableHeadingProps> = ({
    children,
    id,
    blockId,
    className = '',
}) => (
    <EditableText
        as="h5"
        id={id}
        blockId={blockId}
        className={cn(headingStyles.h5, className)}
    >
        {children}
    </EditableText>
);

/**
 * EditableH6 - Smallest heading
 * 
 * Use for the finest level of organization.
 * Sixth level in heading hierarchy.
 */
export const EditableH6: React.FC<EditableHeadingProps> = ({
    children,
    id,
    blockId,
    className = '',
}) => (
    <EditableText
        as="h6"
        id={id}
        blockId={blockId}
        className={cn(headingStyles.h6, className)}
    >
        {children}
    </EditableText>
);
