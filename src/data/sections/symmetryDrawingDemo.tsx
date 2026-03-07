import { type ReactElement, useMemo } from "react";
import { StackLayout, SplitLayout } from "@/components/layouts";
import { Block } from "@/components/templates";
import {
    Cartesian2D,
    EditableH2,
    EditableH4,
    EditableParagraph,
    InlineScrubbleNumber,
    InlineSpotColor,
    InlineToggle,
} from "@/components/atoms";
import type { PlotItem } from "@/components/atoms";
import { FormulaBlock } from "@/components/molecules";
import { useVar } from "@/stores";
import {
    getExampleVariableInfo,
    numberPropsFromDefinition,
    togglePropsFromDefinition,
    spotColorPropsFromDefinition,
} from "../exampleVariables";

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Reflect point [px, py] across the line y = mx + b */
function reflectAcrossLine(
    px: number,
    py: number,
    m: number,
    b: number
): [number, number] {
    // For a line y = mx + b, the reflection of point (px, py) is:
    // x' = ((1 - m²)·px + 2m·py - 2m·b) / (1 + m²)
    // y' = ((m² - 1)·py + 2m·px + 2b) / (1 + m²)
    const m2 = m * m;
    const denom = 1 + m2;
    const rx = ((1 - m2) * px + 2 * m * py - 2 * m * b) / denom;
    const ry = ((m2 - 1) * py + 2 * m * px + 2 * b) / denom;
    return [rx, ry];
}

/** Reflect point [px, py] across the vertical line x = c */
function reflectAcrossVertical(
    px: number,
    py: number,
    c: number
): [number, number] {
    return [2 * c - px, py];
}

/** Reflect point [px, py] across the horizontal line y = c */
function reflectAcrossHorizontal(
    px: number,
    py: number,
    c: number
): [number, number] {
    return [px, 2 * c - py];
}

// ── Demo 1: Line of Symmetry Explorer ────────────────────────────────────────

/**
 * Visualization: A draggable triangle is reflected across a configurable line
 * of symmetry. Users can drag the 3 vertices of the original shape and see
 * the mirrored shape update in real time.
 */
function SymmetryLineExplorer() {
    const symmetryType = useVar("symLineType", "y-axis") as string;
    const symSlope = useVar("symSlope", 1) as number;
    const symIntercept = useVar("symIntercept", 0) as number;

    // Compute the line-of-symmetry function & its reflection logic
    const { linePlots, reflect } = useMemo(() => {
        let linePlots: PlotItem[] = [];
        let reflect: (px: number, py: number) => [number, number];

        switch (symmetryType) {
            case "y-axis":
                linePlots = [
                    {
                        type: "segment" as const,
                        point1: [0, -6] as [number, number],
                        point2: [0, 6] as [number, number],
                        color: "#64748b",
                        weight: 2,
                        style: "dashed" as const,
                    },
                ];
                reflect = (px, py) => reflectAcrossVertical(px, py, 0);
                break;
            case "x-axis":
                linePlots = [
                    {
                        type: "segment" as const,
                        point1: [-6, 0] as [number, number],
                        point2: [6, 0] as [number, number],
                        color: "#64748b",
                        weight: 2,
                        style: "dashed" as const,
                    },
                ];
                reflect = (px, py) => reflectAcrossHorizontal(px, py, 0);
                break;
            case "y = x":
                linePlots = [
                    {
                        type: "function" as const,
                        fn: (x: number) => x,
                        color: "#64748b",
                        weight: 2,
                    },
                ];
                reflect = (px, py) => reflectAcrossLine(px, py, 1, 0);
                break;
            case "y = -x":
                linePlots = [
                    {
                        type: "function" as const,
                        fn: (x: number) => -x,
                        color: "#64748b",
                        weight: 2,
                    },
                ];
                reflect = (px, py) => reflectAcrossLine(px, py, -1, 0);
                break;
            case "custom":
            default:
                linePlots = [
                    {
                        type: "function" as const,
                        fn: (x: number) => symSlope * x + symIntercept,
                        color: "#64748b",
                        weight: 2,
                    },
                ];
                reflect = (px, py) =>
                    reflectAcrossLine(px, py, symSlope, symIntercept);
                break;
        }

        return { linePlots, reflect };
    }, [symmetryType, symSlope, symIntercept]);

    return (
        <Cartesian2D
            height={420}
            viewBox={{ x: [-5, 5], y: [-5, 5] }}
            movablePoints={[
                { initial: [-3, 1], color: "#3b82f6" },
                { initial: [-1, 3], color: "#3b82f6" },
                { initial: [-2, -1], color: "#3b82f6" },
            ]}
            plots={linePlots}
            dynamicPlots={([p0, p1, p2]) => {
                // Reflect each vertex
                const r0 = reflect(p0[0], p0[1]);
                const r1 = reflect(p1[0], p1[1]);
                const r2 = reflect(p2[0], p2[1]);

                return [
                    // Original triangle edges (blue)
                    {
                        type: "segment",
                        point1: p0,
                        point2: p1,
                        color: "#3b82f6",
                        weight: 2.5,
                    },
                    {
                        type: "segment",
                        point1: p1,
                        point2: p2,
                        color: "#3b82f6",
                        weight: 2.5,
                    },
                    {
                        type: "segment",
                        point1: p2,
                        point2: p0,
                        color: "#3b82f6",
                        weight: 2.5,
                    },

                    // Reflected triangle edges (red)
                    {
                        type: "segment",
                        point1: r0,
                        point2: r1,
                        color: "#ef4444",
                        weight: 2.5,
                    },
                    {
                        type: "segment",
                        point1: r1,
                        point2: r2,
                        color: "#ef4444",
                        weight: 2.5,
                    },
                    {
                        type: "segment",
                        point1: r2,
                        point2: r0,
                        color: "#ef4444",
                        weight: 2.5,
                    },

                    // Reflected vertices (red dots)
                    { type: "point", x: r0[0], y: r0[1], color: "#ef4444" },
                    { type: "point", x: r1[0], y: r1[1], color: "#ef4444" },
                    { type: "point", x: r2[0], y: r2[1], color: "#ef4444" },

                    // Connection lines (dashed, from original to reflected)
                    {
                        type: "segment",
                        point1: p0,
                        point2: r0,
                        color: "#a855f7",
                        weight: 1,
                        style: "dashed" as const,
                    },
                    {
                        type: "segment",
                        point1: p1,
                        point2: r1,
                        color: "#a855f7",
                        weight: 1,
                        style: "dashed" as const,
                    },
                    {
                        type: "segment",
                        point1: p2,
                        point2: r2,
                        color: "#a855f7",
                        weight: 1,
                        style: "dashed" as const,
                    },
                ];
            }}
        />
    );
}

// ── Demo 2: Symmetry of Functions ────────────────────────────────────────────

/**
 * Shows even/odd function symmetry. Users pick a function type and see
 * the original f(x) vs f(-x) to understand reflective (even) and
 * rotational (odd) symmetry.
 */
function FunctionSymmetryViz() {
    const fnType = useVar("symFnType", "x²") as string;
    const xProbe = useVar("symProbeX", 2) as number;

    const fnMap: Record<string, (x: number) => number> = {
        "x²": (x) => x * x,
        "x³": (x) => x * x * x,
        "|x|": (x) => Math.abs(x),
        "sin(x)": (x) => Math.sin(x),
        "cos(x)": (x) => Math.cos(x),
    };

    const fn = fnMap[fnType] ?? ((x: number) => x * x);
    const yValue = fn(xProbe);
    const yNeg = fn(-xProbe);


    return (
        <Cartesian2D
            height={400}
            viewBox={{ x: [-5, 5], y: [-4, 4] }}
            plots={[
                // The function curve
                {
                    type: "function",
                    fn: fn,
                    color: "#3b82f6",
                    weight: 3,
                },
                // f(-x) mirrored — draw as parametric to flip x
                {
                    type: "function",
                    fn: (x: number) => fn(-x),
                    color: "#ef4444",
                    weight: 2,
                },
                // Probe point at (xProbe, f(xProbe))
                {
                    type: "point",
                    x: xProbe,
                    y: yValue,
                    color: "#3b82f6",
                },
                // Probe point at (-xProbe, f(-xProbe))
                {
                    type: "point",
                    x: -xProbe,
                    y: yNeg,
                    color: "#ef4444",
                },
                // Vertical dashed lines at probe points
                {
                    type: "segment",
                    point1: [xProbe, 0],
                    point2: [xProbe, yValue],
                    color: "#3b82f6",
                    style: "dashed",
                    weight: 1.5,
                },
                {
                    type: "segment",
                    point1: [-xProbe, 0],
                    point2: [-xProbe, yNeg],
                    color: "#ef4444",
                    style: "dashed",
                    weight: 1.5,
                },
                // Horizontal connection between the two probe points
                {
                    type: "segment",
                    point1: [xProbe, yValue],
                    point2: [-xProbe, yNeg],
                    color: "#a855f7",
                    style: "dashed",
                    weight: 1,
                },
            ]}
        />
    );
}

/** Reads the current symmetry type and shows status */
function SymmetryStatus() {
    const fnType = useVar("symFnType", "x²") as string;
    const xProbe = useVar("symProbeX", 2) as number;

    const fnMap: Record<string, (x: number) => number> = {
        "x²": (x) => x * x,
        "x³": (x) => x * x * x,
        "|x|": (x) => Math.abs(x),
        "sin(x)": (x) => Math.sin(x),
        "cos(x)": (x) => Math.cos(x),
    };

    const fn = fnMap[fnType] ?? ((x: number) => x * x);
    const yValue = fn(xProbe);
    const yNeg = fn(-xProbe);
    const isEven = Math.abs(yValue - yNeg) < 0.001;
    const isOdd = Math.abs(yValue + yNeg) < 0.001;

    return (
        <div className="text-center font-mono text-sm py-2 px-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <span>
                f({xProbe.toFixed(1)}) ={" "}
                <span style={{ color: "#3b82f6" }}>{yValue.toFixed(3)}</span>
                {" | "}
                f({(-xProbe).toFixed(1)}) ={" "}
                <span style={{ color: "#ef4444" }}>{yNeg.toFixed(3)}</span>
            </span>
            <br />
            <span
                style={{
                    color: isEven ? "#22c55e" : isOdd ? "#f59e0b" : "#94a3b8",
                    fontWeight: 600,
                }}
            >
                {isEven
                    ? "✓ Even symmetry: f(x) = f(−x)"
                    : isOdd
                        ? "✓ Odd symmetry: f(x) = −f(−x)"
                        : "✗ No simple symmetry"}
            </span>
        </div>
    );
}

// ── Exported demo blocks ──────────────────────────────────────────────────────

export const symmetryDrawingDemo: ReactElement[] = [
    // ── Header ──────────────────────────────────────────────────────────────
    <StackLayout key="layout-symmetry-header-title" maxWidth="xl">
        <Block id="symmetry-header-title" padding="sm">
            <EditableH4 id="h4-symmetry-title" blockId="symmetry-header-title">
                Drawing Symmetry
            </EditableH4>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-symmetry-header-desc" maxWidth="xl">
        <Block id="symmetry-header-desc" padding="sm">
            <EditableParagraph id="para-symmetry-desc" blockId="symmetry-header-desc">
                Symmetry is one of the most beautiful ideas in mathematics.
                A shape is symmetric when it looks the same after being
                reflected across a line. Drag the vertices below to build any
                triangle and watch its mirror image appear in real time.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <SplitLayout key="layout-symmetry-line-split" ratio="1:1" gap="lg">
        <div className="space-y-4">
            <Block id="symmetry-line-desc" padding="sm">
                <EditableParagraph
                    id="para-symmetry-line-desc"
                    blockId="symmetry-line-desc"
                >
                    Drag the three{" "}
                    <InlineSpotColor
                        varName="symOrigColor"
                        {...spotColorPropsFromDefinition(
                            getExampleVariableInfo("symOrigColor")
                        )}
                    >
                        blue vertices
                    </InlineSpotColor>{" "}
                    to reshape the original triangle. The{" "}
                    <InlineSpotColor
                        varName="symReflColor"
                        {...spotColorPropsFromDefinition(
                            getExampleVariableInfo("symReflColor")
                        )}
                    >
                        red mirror image
                    </InlineSpotColor>{" "}
                    updates instantly. The{" "}
                    <InlineSpotColor
                        varName="symConnColor"
                        {...spotColorPropsFromDefinition(
                            getExampleVariableInfo("symConnColor")
                        )}
                    >
                        purple dashed lines
                    </InlineSpotColor>{" "}
                    connect each vertex to its reflection, always perpendicular
                    to the{" "}
                    <InlineSpotColor
                        varName="symLineColor"
                        {...spotColorPropsFromDefinition(
                            getExampleVariableInfo("symLineColor")
                        )}
                    >
                        line of symmetry
                    </InlineSpotColor>.
                </EditableParagraph>
            </Block>
            <Block id="symmetry-line-controls" padding="sm">
                <EditableParagraph
                    id="para-symmetry-line-controls"
                    blockId="symmetry-line-controls"
                >
                    Reflect across:{" "}
                    <InlineToggle
                        varName="symLineType"
                        options={[
                            "y-axis",
                            "x-axis",
                            "y = x",
                            "y = -x",
                            "custom",
                        ]}
                        {...togglePropsFromDefinition(
                            getExampleVariableInfo("symLineType")
                        )}
                    />
                </EditableParagraph>
            </Block>
            <Block id="symmetry-custom-params" padding="sm">
                <EditableParagraph
                    id="para-symmetry-custom-params"
                    blockId="symmetry-custom-params"
                >
                    Custom line: y ={" "}
                    <InlineScrubbleNumber
                        varName="symSlope"
                        {...numberPropsFromDefinition(
                            getExampleVariableInfo("symSlope")
                        )}
                        formatValue={(v) => v.toFixed(1)}
                    />
                    x +{" "}
                    <InlineScrubbleNumber
                        varName="symIntercept"
                        {...numberPropsFromDefinition(
                            getExampleVariableInfo("symIntercept")
                        )}
                        formatValue={(v) => v.toFixed(1)}
                    />
                    . These controls only apply when the line type is "custom".
                </EditableParagraph>
            </Block>
            <Block id="symmetry-line-equation" padding="sm">
                <FormulaBlock
                    latex="\clr{reflected}{P'} = \clr{original}{P} - 2\,\frac{(\clr{line}{\mathbf{n}} \cdot \clr{original}{P} + d)}{|\clr{line}{\mathbf{n}}|^2}\,\clr{line}{\mathbf{n}}"
                    colorMap={{
                        reflected: "#ef4444",
                        original: "#3b82f6",
                        line: "#64748b",
                    }}
                />
            </Block>
            <Block id="symmetry-line-hint" padding="sm">
                <EditableParagraph
                    id="para-symmetry-line-hint"
                    blockId="symmetry-line-hint"
                >
                    💡 Notice that the connection lines are always
                    perpendicular to the mirror line and each vertex is the
                    same distance from the line as its reflected counterpart.
                </EditableParagraph>
            </Block>
        </div>
        <Block id="symmetry-line-viz" padding="sm" hasVisualization>
            <SymmetryLineExplorer />
        </Block>
    </SplitLayout>,

    // ── Demo 2: Function Symmetry (Even / Odd) ──────────────────────────────
    <StackLayout key="layout-symmetry-fn-title" maxWidth="xl">
        <Block id="symmetry-fn-title" padding="sm">
            <EditableH4 id="h4-symmetry-fn" blockId="symmetry-fn-title">
                Even &amp; Odd Function Symmetry
            </EditableH4>
        </Block>
    </StackLayout>,

    <SplitLayout key="layout-symmetry-fn-split" ratio="1:1" gap="lg">
        <div className="space-y-4">
            <Block id="symmetry-fn-desc" padding="sm">
                <EditableParagraph
                    id="para-symmetry-fn-desc"
                    blockId="symmetry-fn-desc"
                >
                    Functions can be symmetric too! An{" "}
                    <InlineSpotColor
                        varName="symEvenColor"
                        {...spotColorPropsFromDefinition(
                            getExampleVariableInfo("symEvenColor")
                        )}
                    >
                        even function
                    </InlineSpotColor>{" "}
                    satisfies f(x) = f(−x), so its graph is a mirror image
                    across the y-axis (like x² or cos x). An{" "}
                    <InlineSpotColor
                        varName="symOddColor"
                        {...spotColorPropsFromDefinition(
                            getExampleVariableInfo("symOddColor")
                        )}
                    >
                        odd function
                    </InlineSpotColor>{" "}
                    satisfies f(x) = −f(−x), giving it 180° rotational
                    symmetry about the origin (like x³ or sin x).
                </EditableParagraph>
            </Block>
            <Block id="symmetry-fn-controls" padding="sm">
                <EditableParagraph
                    id="para-symmetry-fn-controls"
                    blockId="symmetry-fn-controls"
                >
                    Choose a function:{" "}
                    <InlineToggle
                        varName="symFnType"
                        options={["x²", "x³", "|x|", "sin(x)", "cos(x)"]}
                        {...togglePropsFromDefinition(
                            getExampleVariableInfo("symFnType")
                        )}
                    />
                    . The{" "}
                    <InlineSpotColor
                        varName="symFnOrigColor"
                        {...spotColorPropsFromDefinition(
                            getExampleVariableInfo("symFnOrigColor")
                        )}
                    >
                        blue curve
                    </InlineSpotColor>{" "}
                    shows f(x) and the{" "}
                    <InlineSpotColor
                        varName="symFnMirrorColor"
                        {...spotColorPropsFromDefinition(
                            getExampleVariableInfo("symFnMirrorColor")
                        )}
                    >
                        red curve
                    </InlineSpotColor>{" "}
                    shows f(−x). When the curves overlap, the function is even.
                </EditableParagraph>
            </Block>
            <Block id="symmetry-fn-probe" padding="sm">
                <EditableParagraph
                    id="para-symmetry-fn-probe"
                    blockId="symmetry-fn-probe"
                >
                    Probe at x ={" "}
                    <InlineScrubbleNumber
                        varName="symProbeX"
                        {...numberPropsFromDefinition(
                            getExampleVariableInfo("symProbeX")
                        )}
                        formatValue={(v) => v.toFixed(1)}
                    />
                    . Compare the probe dots on both sides to check the
                    symmetry condition.
                </EditableParagraph>
            </Block>
            <Block id="symmetry-fn-status" padding="sm">
                <SymmetryStatus />
            </Block>
        </div>
        <Block id="symmetry-fn-viz" padding="sm" hasVisualization>
            <FunctionSymmetryViz />
        </Block>
    </SplitLayout>,
];
