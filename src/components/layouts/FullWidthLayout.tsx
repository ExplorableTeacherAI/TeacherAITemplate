import { type ReactNode } from "react";

export interface FullWidthLayoutProps {
    /** Children content to render */
    children: ReactNode;
    /** Optional className for custom styling */
    className?: string;
    /** Maximum width constraint */
    maxWidth?: "none" | "md" | "lg" | "xl" | "2xl" | "full";
}

/**
 * FullWidthLayout - Default layout that takes full container width.
 * Content is centered with optional max-width constraints.
 */
export const FullWidthLayout = ({
    children,
    className = "",
    maxWidth = "full"
}: FullWidthLayoutProps) => {
    const maxWidthClasses = {
        none: "",
        md: "max-w-2xl",
        lg: "max-w-4xl",
        xl: "max-w-5xl",
        "2xl": "max-w-7xl",
        full: "max-w-full"
    };

    return (
        <div
            className={`w-full ${maxWidthClasses[maxWidth]} ${className}`}
            data-layout-type="full-width"
        >
            {children}
        </div>
    );
};
