import { type CSSProperties } from "react";
import DesmosRenderer from "./DesmosRenderer";

export interface DesmosExpression {
    id?: string;
    latex: string;
    color?: string;
    label?: string;
    showLabel?: boolean;
    hidden?: boolean;
    sliderBounds?: {
        min?: number;
        max?: number;
        step?: number;
    };
}

export interface DesmosGraphProps {
    /** Array of expressions to render */
    expressions?: DesmosExpression[];
    /** Desmos calculator state object */
    state?: any;
    /** Desmos calculator options */
    options?: {
        expressions?: boolean;
        settingsMenu?: boolean;
        keypad?: boolean;
        zoomButtons?: boolean;
        [key: string]: any;
    };
    /** Single LaTeX expression (alternative to expressions array) */
    latex?: string;
    /** Container height - can be number (pixels), string (CSS), or 'auto' */
    height?: number | string | "auto";
    /** Aspect ratio (e.g., "16/9", "4/3", "1/1") for responsive height */
    aspectRatio?: string;
    className?: string;
}

/**
 * DesmosGraph component wraps DesmosRenderer with a cleaner API.
 * Use this for creating interactive mathematical visualizations.
 */
export const DesmosGraph = ({
    expressions,
    state,
    options,
    latex,
    height = 400,
    aspectRatio,
    className = ""
}: DesmosGraphProps) => {
    // If aspectRatio is specified, use it; otherwise use the height prop
    const containerStyle: CSSProperties = {};

    if (aspectRatio) {
        containerStyle.aspectRatio = aspectRatio;
        containerStyle.width = "100%";
    } else if (height === "auto") {
        // Auto height with a reasonable default aspect ratio
        containerStyle.aspectRatio = "16/9";
        containerStyle.width = "100%";
    } else {
        containerStyle.height = typeof height === 'number' ? `${height}px` : height;
        containerStyle.width = "100%";
    }

    return (
        <div
            className={`w-full ${className}`}
            style={containerStyle}
        >
            <DesmosRenderer
                expressions={expressions}
                state={state}
                options={options}
                latex={latex}
                className="w-full h-full"
                style={{ margin: 0, padding: 0, height: "100%" }}
            />
        </div>
    );
};
