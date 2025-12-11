import { type ReactNode, Children } from "react";

export interface SplitLayoutProps {
    /** Children content to render (should be exactly 2 children) */
    children: ReactNode;
    /** Optional className for custom styling */
    className?: string;
    /** Ratio of the split (left:right) */
    ratio?: "1:1" | "1:2" | "2:1" | "1:3" | "3:1" | "2:3" | "3:2";
    /** Gap between columns */
    gap?: "none" | "sm" | "md" | "lg" | "xl";
    /** Reverse the order of columns */
    reverse?: boolean;
    /** Vertical alignment of columns */
    align?: "start" | "center" | "end" | "stretch";
}

/**
 * SplitLayout - Two-column layout with customizable ratios.
 * Perfect for pairing text explanations with visualizations.
 */
export const SplitLayout = ({
    children,
    className = "",
    ratio = "1:1",
    gap = "md",
    reverse = false,
    align = "start"
}: SplitLayoutProps) => {
    const childrenArray = Children.toArray(children);

    if (childrenArray.length !== 2) {
        console.warn(`SplitLayout expects exactly 2 children, but received ${childrenArray.length}`);
    }

    const ratioClasses = {
        "1:1": "grid-cols-1 md:grid-cols-2",
        "1:2": "grid-cols-1 md:grid-cols-3",
        "2:1": "grid-cols-1 md:grid-cols-3",
        "1:3": "grid-cols-1 md:grid-cols-4",
        "3:1": "grid-cols-1 md:grid-cols-4",
        "2:3": "grid-cols-1 md:grid-cols-5",
        "3:2": "grid-cols-1 md:grid-cols-5"
    };

    const childClasses = {
        "1:1": ["", ""],
        "1:2": ["md:col-span-1", "md:col-span-2"],
        "2:1": ["md:col-span-2", "md:col-span-1"],
        "1:3": ["md:col-span-1", "md:col-span-3"],
        "3:1": ["md:col-span-3", "md:col-span-1"],
        "2:3": ["md:col-span-2", "md:col-span-3"],
        "3:2": ["md:col-span-3", "md:col-span-2"]
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

    const [firstChild, secondChild] = reverse ? [childrenArray[1], childrenArray[0]] : childrenArray;
    const [firstClass, secondClass] = reverse ? [childClasses[ratio][1], childClasses[ratio][0]] : childClasses[ratio];

    return (
        <div
            className={`grid ${ratioClasses[ratio]} ${gapClasses[gap]} ${alignClasses[align]} ${className}`}
            data-layout-type="split"
            data-layout-ratio={ratio}
        >
            <div className={firstClass}>
                {firstChild}
            </div>
            <div className={secondClass}>
                {secondChild}
            </div>
        </div>
    );
};
