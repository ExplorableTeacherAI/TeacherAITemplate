import { type ReactNode } from "react";

export interface GridLayoutProps {
    /** Children content to render */
    children: ReactNode;
    /** Optional className for custom styling */
    className?: string;
    /** Number of columns on desktop */
    columns?: 2 | 3 | 4 | 5 | 6;
    /** Number of columns on tablet (default: columns - 1 or 2) */
    tabletColumns?: 1 | 2 | 3 | 4;
    /** Number of columns on mobile (default: 1) */
    mobileColumns?: 1 | 2;
    /** Gap between grid items */
    gap?: "none" | "sm" | "md" | "lg" | "xl";
    /** Vertical alignment of grid items */
    align?: "start" | "center" | "end" | "stretch";
}

/**
 * GridLayout - Multi-column grid layout for displaying multiple items.
 * Perfect for showcasing examples, cards, or collections.
 */
export const GridLayout = ({
    children,
    className = "",
    columns = 3,
    tabletColumns,
    mobileColumns = 1,
    gap = "md",
    align = "start"
}: GridLayoutProps) => {
    const columnClasses = {
        1: "md:grid-cols-1 lg:grid-cols-1",
        2: "md:grid-cols-2 lg:grid-cols-2",
        3: "md:grid-cols-2 lg:grid-cols-3",
        4: "md:grid-cols-3 lg:grid-cols-4",
        5: "md:grid-cols-3 lg:grid-cols-5",
        6: "md:grid-cols-4 lg:grid-cols-6"
    };

    const tabletColumnClasses = {
        1: "md:grid-cols-1",
        2: "md:grid-cols-2",
        3: "md:grid-cols-3",
        4: "md:grid-cols-4"
    };

    const mobileColumnClasses = {
        1: "grid-cols-1",
        2: "grid-cols-2"
    };

    const gapClasses = {
        none: "gap-0",
        sm: "gap-3",
        md: "gap-6",
        lg: "gap-8",
        xl: "gap-12"
    };

    const alignClasses = {
        start: "items-start",
        center: "items-center",
        end: "items-end",
        stretch: "items-stretch"
    };

    // Use custom tablet columns if provided, otherwise use auto-calculated
    const responsiveColumns = tabletColumns
        ? `${mobileColumnClasses[mobileColumns]} ${tabletColumnClasses[tabletColumns]} lg:grid-cols-${columns}`
        : `${mobileColumnClasses[mobileColumns]} ${columnClasses[columns]}`;

    return (
        <div
            className={`grid ${responsiveColumns} ${gapClasses[gap]} ${alignClasses[align]} ${className}`}
            data-layout-type="grid"
            data-layout-columns={columns}
        >
            {children}
        </div>
    );
};
