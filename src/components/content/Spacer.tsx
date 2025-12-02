

export interface SpacerProps {
    /** Height in pixels or CSS units */
    height?: number | string;
    className?: string;
}

/**
 * Spacer component for adding vertical spacing between content.
 */
export const Spacer = ({
    height = 16,
    className = ""
}: SpacerProps) => {
    return (
        <div
            className={className}
            style={{ height: typeof height === 'number' ? `${height}px` : height }}
            aria-hidden="true"
        />
    );
};
