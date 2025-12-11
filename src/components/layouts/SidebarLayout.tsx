import { type ReactNode } from "react";

export interface SidebarLayoutProps {
    /** Children content - use Sidebar and Main components */
    children: ReactNode;
    /** Optional className for custom styling */
    className?: string;
    /** Position of the sidebar */
    sidebarPosition?: "left" | "right";
    /** Width of the sidebar */
    sidebarWidth?: "narrow" | "medium" | "wide";
    /** Gap between sidebar and main content */
    gap?: "none" | "sm" | "md" | "lg" | "xl";
    /** Whether sidebar should be sticky */
    stickysidebar?: boolean;
}

export interface SidebarProps {
    children: ReactNode;
    className?: string;
}

export interface MainProps {
    children: ReactNode;
    className?: string;
}

/**
 * Sidebar component - use inside SidebarLayout
 */
export const Sidebar = ({ children, className = "" }: SidebarProps) => {
    return <aside className={className}>{children}</aside>;
};

/**
 * Main component - use inside SidebarLayout
 */
export const Main = ({ children, className = "" }: MainProps) => {
    return <main className={className}>{children}</main>;
};

/**
 * SidebarLayout - Layout with a sidebar and main content area.
 * Great for glossaries, navigation, or persistent context.
 */
export const SidebarLayout = ({
    children,
    className = "",
    sidebarPosition = "left",
    sidebarWidth = "medium",
    gap = "md",
    stickysidebar = true
}: SidebarLayoutProps) => {
    const sidebarWidthClasses = {
        narrow: "md:w-48 lg:w-56",
        medium: "md:w-56 lg:w-64",
        wide: "md:w-64 lg:w-80"
    };

    const gapClasses = {
        none: "gap-0",
        sm: "gap-3",
        md: "gap-6",
        lg: "gap-8",
        xl: "gap-12"
    };

    return (
        <div
            className={`flex flex-col md:flex-row ${gapClasses[gap]} ${sidebarPosition === "right" ? "md:flex-row-reverse" : ""
                } ${className}`}
            data-layout-type="sidebar"
            data-sidebar-position={sidebarPosition}
        >
            {/* Find sidebar child */}
            {Array.isArray(children) &&
                children.map((child, index) => {
                    if (child && typeof child === "object" && "type" in child && child.type === Sidebar) {
                        return (
                            <div
                                key={index}
                                className={`w-full ${sidebarWidthClasses[sidebarWidth]} flex-shrink-0 ${stickysidebar ? "md:sticky md:top-8 md:self-start" : ""
                                    }`}
                            >
                                {child}
                            </div>
                        );
                    }
                    return null;
                })}

            {/* Find main content child */}
            {Array.isArray(children) &&
                children.map((child, index) => {
                    if (child && typeof child === "object" && "type" in child && child.type === Main) {
                        return (
                            <div key={index} className="flex-1 min-w-0">
                                {child}
                            </div>
                        );
                    }
                    return null;
                })}
        </div>
    );
};
