import { useEffect, useRef, type CSSProperties } from "react";
import Two from "two.js";

export interface TwoCanvasProps {
    /** Width of the canvas */
    width?: number;
    /** Height of the canvas */
    height?: number;
    /** Optional className for styling */
    className?: string;
    /** Optional inline styles */
    style?: CSSProperties;
    /** Callback to setup and animate the Two.js instance */
    onSetup?: (two: Two) => void | (() => void);
    /** Whether to auto-start the animation loop */
    autoStart?: boolean;
    /** Background color */
    backgroundColor?: string;
    /** Whether to fit content automatically */
    fitted?: boolean;
}

/**
 * TwoCanvas - Base component for Two.js animations
 * 
 * This component provides a canvas element configured for Two.js rendering.
 * Use the onSetup callback to create your animations.
 * 
 * @example
 * ```tsx
 * <TwoCanvas
 *   width={600}
 *   height={400}
 *   onSetup={(two) => {
 *     const circle = two.makeCircle(300, 200, 50);
 *     circle.fill = '#FF6B6B';
 *     two.update();
 *   }}
 * />
 * ```
 */
export const TwoCanvas = ({
    width = 800,
    height = 600,
    className = "",
    style = {},
    onSetup,
    autoStart = true,
    backgroundColor = "transparent",
    fitted = false,
}: TwoCanvasProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const twoRef = useRef<Two | null>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // Create Two.js instance
        const params: any = {
            width,
            height,
            autostart: autoStart,
        };

        if (fitted) {
            params.fitted = true;
        }

        const two = new Two(params).appendTo(containerRef.current);
        twoRef.current = two;

        // Set background color if specified
        if (backgroundColor !== "transparent") {
            const bg = two.makeRectangle(width / 2, height / 2, width, height);
            bg.fill = backgroundColor;
            bg.noStroke();
        }

        // Call setup callback if provided
        let cleanup: void | (() => void);
        if (onSetup) {
            cleanup = onSetup(two);
        }

        // Cleanup function
        return () => {
            if (typeof cleanup === "function") {
                cleanup();
            }
            if (twoRef.current) {
                twoRef.current.pause();
                twoRef.current.clear();
            }
        };
    }, [width, height, backgroundColor, fitted, autoStart, onSetup]);

    return (
        <div
            ref={containerRef}
            className={`two-canvas ${className}`}
            style={{
                width: `${width}px`,
                height: `${height}px`,
                ...style,
            }}
        />
    );
};
