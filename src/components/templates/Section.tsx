import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface SectionProps {
    /** Unique identifier for the section - used for navigation and grouping */
    id: string;
    /** Children content (typically Block components) */
    children: ReactNode;
    /** Optional className for custom styling */
    className?: string;
    /** Optional title for the section (for accessibility and navigation) */
    title?: string;
}

/**
 * Section component - A simple semantic wrapper for content.
 * 
 * Note: Section is now optional. Blocks can be used directly without a Section wrapper.
 * Section is primarily useful for:
 * - Semantic grouping of related content
 * - Navigation anchors (via id)
 * - Accessibility landmarks
 * 
 * @example
 * ```tsx
 * <Section id="introduction" title="Introduction">
 *   <Block id="intro-title">
 *     <EditableH1>Welcome to Physics</EditableH1>
 *   </Block>
 * </Section>
 * ```
 * 
 * Or use Block directly without Section:
 * ```tsx
 * <Block id="intro-title">
 *   <EditableH1>Welcome to Physics</EditableH1>
 * </Block>
 * ```
 */
export const Section = ({
    id,
    children,
    className = "",
    title,
}: SectionProps) => {
    return (
        <section
            id={id}
            data-section-id={id}
            aria-label={title}
            className={cn("w-full", className)}
        >
            {children}
        </section>
    );
};

export default Section;
