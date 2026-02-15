import { useState, type ReactNode } from "react";

export interface InteractiveTermProps {
    /** The text content to display */
    children: ReactNode;
    /** Callback when the term is clicked */
    onClick?: () => void;
    /** Callback when hovering starts */
    onHoverStart?: () => void;
    /** Callback when hovering ends */
    onHoverEnd?: () => void;
    /** Whether the term is currently active/highlighted */
    isActive?: boolean;
    /** Custom color for the interactive term (default: red/pink) */
    color?: string;
    /** Whether to show as inline math (wrapped in $...$) */
    asMath?: boolean;
    /** Custom CSS class */
    className?: string;
    /** Underline style: 'solid', 'dashed', 'dotted', 'none' */
    underlineStyle?: 'solid' | 'dashed' | 'dotted' | 'none';
}

/**
 * InteractiveTerm - A clickable/hoverable text element that triggers actions.
 * Can be used inline within paragraphs to link text to visual changes.
 * 
 * @example
 * ```tsx
 * <InteractiveTerm 
 *   onClick={() => updateGraph('dropXAxis')}
 *   color="#c74440"
 * >
 *   click here to see that dropping the X axis
 * </InteractiveTerm>
 * ```
 */
export const InteractiveTerm = ({
    children,
    onClick,
    onHoverStart,
    onHoverEnd,
    isActive = false,
    color = "#c74440",
    asMath = false,
    className = "",
    underlineStyle = 'solid'
}: InteractiveTermProps) => {
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseEnter = () => {
        setIsHovered(true);
        onHoverStart?.();
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        onHoverEnd?.();
    };

    const handleClick = () => {
        onClick?.();
    };

    const getUnderlineClass = () => {
        switch (underlineStyle) {
            case 'dashed':
                return 'border-b-2 border-dashed';
            case 'dotted':
                return 'border-b-2 border-dotted';
            case 'solid':
                return 'border-b-2 border-solid';
            case 'none':
                return '';
            default:
                return 'border-b-2 border-solid';
        }
    };

    const baseStyles = `
        inline-block
        cursor-pointer
        transition-all
        duration-200
        ease-in-out
        ${getUnderlineClass()}
        ${isHovered ? 'opacity-80' : 'opacity-100'}
        ${isActive ? 'font-semibold' : ''}
        ${className}
    `;


    const content = asMath ? `$${children}$` : children;

    return (
        <span
            className={baseStyles}
            style={{
                color: color,
                borderColor: color,
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    handleClick();
                }
            }}
        >
            {content}
        </span>
    );
};
