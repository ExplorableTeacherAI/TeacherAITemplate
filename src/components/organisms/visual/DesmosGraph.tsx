import { type CSSProperties, useMemo } from "react";
import DesmosRenderer from "./DesmosRenderer";
import { useVar, useVariableStore } from "@/stores";

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

    // ── Variable-store integration ──────────────────────────────────────

    /**
     * Name of the variable in the global store whose value is a **LaTeX string**
     * that will be used as the primary expression.
     * When provided, the component re-renders whenever the variable changes.
     */
    varName?: string;

    /**
     * Default LaTeX value used when the variable hasn't been set yet.
     * Only meaningful when `varName` is provided.
     */
    defaultLatex?: string;

    /**
     * Additional variables to read from the store and inject into the graph
     * as numbered parameters.  For example, `paramVars={["amplitude", "freq"]}`
     * creates Desmos parameters `a_1 = <amplitude>` and `a_2 = <freq>`.
     *
     * This lets you write expressions like `y = a_1 \sin(a_2 x)` and have
     * the graph react to changes in the global store.
     */
    paramVars?: string[];

    /**
     * Callback fired once the Desmos calculator instance is ready.
     */
    onCalculatorReady?: (calc: any) => void;
}

/**
 * DesmosGraph component wraps DesmosRenderer with a cleaner API.
 * Use this for creating interactive mathematical visualizations.
 *
 * Supports two modes of operation:
 * 1. **Static** — pass `expressions`, `latex`, or `state` directly.
 * 2. **Reactive** — set `varName` (and optionally `paramVars`) so the graph
 *    reads its data from the global variable store and updates in real time.
 */
export const DesmosGraph = ({
    expressions,
    state,
    options,
    latex,
    height = 400,
    aspectRatio,
    className = "",
    varName,
    defaultLatex,
    paramVars,
    onCalculatorReady,
}: DesmosGraphProps) => {
    // ── Read reactive values from the store ──────────────────────────────

    const storeLatex = useVar(varName ?? "__desmos_unused__", defaultLatex ?? "") as string;

    // Read each paramVar from the store
    const paramValues: number[] = [];
    // We always call useVar for up to 8 param slots to keep hook call count stable
    const pv0 = useVar(paramVars?.[0] ?? "__desmos_p0__", 0) as number;
    const pv1 = useVar(paramVars?.[1] ?? "__desmos_p1__", 0) as number;
    const pv2 = useVar(paramVars?.[2] ?? "__desmos_p2__", 0) as number;
    const pv3 = useVar(paramVars?.[3] ?? "__desmos_p3__", 0) as number;
    const pv4 = useVar(paramVars?.[4] ?? "__desmos_p4__", 0) as number;
    const pv5 = useVar(paramVars?.[5] ?? "__desmos_p5__", 0) as number;
    const pv6 = useVar(paramVars?.[6] ?? "__desmos_p6__", 0) as number;
    const pv7 = useVar(paramVars?.[7] ?? "__desmos_p7__", 0) as number;

    const allPv = [pv0, pv1, pv2, pv3, pv4, pv5, pv6, pv7];
    if (paramVars) {
        for (let i = 0; i < paramVars.length && i < 8; i++) {
            paramValues.push(allPv[i]);
        }
    }

    // ── Build effective expressions ─────────────────────────────────────

    const effectiveExpressions = useMemo(() => {
        // If a varName is set, use the store value as the primary expression
        const baseExprs: DesmosExpression[] = [];

        if (varName) {
            const latexVal = storeLatex;
            if (typeof latexVal === "string" && latexVal.trim().length > 0) {
                baseExprs.push({ id: "expr-reactive", latex: latexVal, color: "#2d70b3" });
            }
        }

        // Merge in any statically provided expressions
        if (expressions && expressions.length > 0) {
            baseExprs.push(...expressions);
        } else if (!varName && typeof latex === "string" && latex.trim().length > 0) {
            baseExprs.push({ id: "expr-1", latex, color: "#2d70b3" });
        }

        // Inject paramVar values as Desmos parameters (a_1, a_2, …)
        if (paramVars && paramVars.length > 0) {
            paramVars.forEach((_, i) => {
                if (i < paramValues.length) {
                    baseExprs.push({
                        id: `param-${i + 1}`,
                        latex: `a_{${i + 1}} = ${paramValues[i]}`,
                        hidden: true,
                    });
                }
            });
        }

        return baseExprs.length > 0 ? baseExprs : undefined;
    }, [varName, storeLatex, expressions, latex, paramVars, ...paramValues]);

    // ── Container sizing ────────────────────────────────────────────────

    const containerStyle: CSSProperties = {};

    if (aspectRatio) {
        containerStyle.aspectRatio = aspectRatio;
        containerStyle.width = "100%";
    } else if (height === "auto") {
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
                expressions={effectiveExpressions}
                state={state}
                options={options}
                className="w-full h-full"
                style={{ margin: 0, padding: 0, height: "100%" }}
            />
        </div>
    );
};
