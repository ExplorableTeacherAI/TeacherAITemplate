import React from "react";

export interface SectionProps {
    /** Unique identifier for the section */
    id?: string;
    /** Children content to render */
    children: React.ReactNode;
    /** Optional className for custom styling */
    className?: string;
    /** Optional padding override */
    padding?: "none" | "sm" | "md" | "lg";
}

/**
 * Section component wraps content and provides consistent layout.
 * This is the container for all content blocks in the canvas.
 */
export const Section: React.FC<SectionProps> = ({
    id,
    children,
    className = "",
    padding = "md"
}) => {
    const paddingClasses = {
        none: "",
        sm: "py-2",
        md: "py-3",
        lg: "py-6"
    };

    return (
        <section
            id={id}
            className={`w-full ${paddingClasses[padding]} ${className}`}
            data-section-id={id}
        >
            {children}
        </section>
    );
};
