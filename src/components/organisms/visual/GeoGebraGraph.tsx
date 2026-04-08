import { type CSSProperties } from "react";
import GeogebraRenderer from "./GeogebraRenderer";

export interface GeoGebraGraphProps {
    /** GeoGebra app type */
    app?: "classic" | "graphing" | "geometry" | "3d" | "cas";
    /** Material ID from GeoGebra's material repository */
    materialId?: string;
    /** GeoGebra app parameters */
    params?: {
        showMenuBar?: boolean;
        showToolBar?: boolean;
        showAlgebraInput?: boolean;
        showZoomButtons?: boolean;
        [key: string]: any;
    };
    /** Rendering mode */
    mode?: "iframe" | "applet";
    /** GeoGebra commands to execute on load */
    commands?: string[];
    /** Base64 encoded .ggb file content */
    ggbBase64?: string;
    /** Container width */
    width?: number | string;
    /** Container height - can be number (pixels), string (CSS), or 'auto' */
    height?: number | string | "auto";
    /** Aspect ratio (e.g., "16/9", "4/3", "1/1") for responsive height */
    aspectRatio?: string;
    className?: string;
}

/**
 * GeoGebraGraph component wraps GeogebraRenderer with a cleaner API.
 * Use this for creating geometric and mathematical visualizations.
 */
export const GeoGebraGraph = ({
    app = "graphing",
    materialId,
    params,
    mode = "applet",
    commands,
    ggbBase64,
    width = "100%",
    height = 440,
    aspectRatio,
    className = ""
}: GeoGebraGraphProps) => {
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
        containerStyle.width = typeof width === 'number' ? `${width}px` : width;
    }

    return (
        <div
            className={`w-full ${className}`}
            style={containerStyle}
        >
            <GeogebraRenderer
                app={app}
                materialId={materialId}
                params={params}
                mode={mode}
                commands={commands}
                ggbBase64={ggbBase64}
                width="100%"
                height="100%"
                className="w-full h-full"
                style={{ margin: 0, padding: 0 }}
            />
        </div>
    );
};
