import { useEffect, useRef, useState } from "react";
import DOMPurify from "dompurify";

export interface InteractiveEquationProps {
    /** The LaTeX equation to display (without $ delimiters) */
    equation: string;
    /** Callback when the equation is clicked */
    onClick?: () => void;
    /** Callback when hovering starts */
    onHoverStart?: () => void;
    /** Callback when hovering ends */
    onHoverEnd?: () => void;
    /** Whether the equation is currently active/highlighted */
    isActive?: boolean;
    /** Custom color for the equation text (default: #c74440) */
    color?: string;
    /** Custom background color on hover (default: rgba(0,0,0,0.05)) */
    hoverBackgroundColor?: string;
    /** Whether to display inline or as block */
    mode?: 'inline' | 'block';
    /** Custom CSS class */
    className?: string;
    /** Show a background highlight on hover */
    showHoverBackground?: boolean;
}

/**
 * InteractiveEquation - A clickable/hoverable mathematical equation.
 * Rendered using MathJax with interactive capabilities.
 * 
 * @example
 * ```tsx
 * <InteractiveEquation
 *   equation="(0.79)y = (-0.61)x"
 *   onClick={() => highlightLine()}
 *   color="#c74440"
 * />
 * ```
 */
export const InteractiveEquation = ({
    equation,
    onClick,
    onHoverStart,
    onHoverEnd,
    isActive = false,
    color = "#c74440",
    hoverBackgroundColor = "rgba(0, 0, 0, 0.05)",
    mode = 'inline',
    className = "",
    showHoverBackground = true
}: InteractiveEquationProps) => {
    const [isHovered, setIsHovered] = useState(false);
    const contentRef = useRef<HTMLSpanElement | HTMLDivElement>(null);

    // Typeset MathJax
    useEffect(() => {
        const el = contentRef.current;
        const mj = window.MathJax;
        if (!el || !mj) return;

        try {
            if (mj.typesetPromise) {
                mj.typesetPromise([el]).catch(() => { });
            } else if (mj.typeset) {
                mj.typeset([el]);
            }
        } catch { }
    }, [equation]);

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

    const baseStyles = `
        cursor-pointer
        transition-all
        duration-200
        ease-in-out
        rounded
        ${isActive ? 'font-bold' : ''}
        ${mode === 'inline' ? 'inline-block px-1' : 'block px-3 py-2'}
        ${className}
    `;

    const mathDelimiters = mode === 'inline' ? ['$', '$'] : ['$$', '$$'];
    const sanitizedEquation = DOMPurify.sanitize(equation);
    const mathContent = `${mathDelimiters[0]}${sanitizedEquation}${mathDelimiters[1]}`;

    const Component = mode === 'inline' ? 'span' : 'div';

    return (
        <Component
            ref={contentRef as any}
            className={`${baseStyles} mathjax-process`}
            style={{
                color: color,
                backgroundColor: isHovered && showHoverBackground ? hoverBackgroundColor : 'transparent',
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
            dangerouslySetInnerHTML={{ __html: mathContent }}
        />
    );
};

