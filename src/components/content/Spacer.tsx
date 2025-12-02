import React from "react";

export interface SpacerProps {
    /** Height in pixels or CSS units */
    height?: number | string;
    className?: string;
}

/**
 * Spacer component for adding vertical spacing between content.
 */
export const Spacer: React.FC<SpacerProps> = ({
    height = 16,
    className = ""
}) => {
    return (
        <div
            className={className}
            style={{ height: typeof height === 'number' ? `${height}px` : height }}
            aria-hidden="true"
        />
    );
};
