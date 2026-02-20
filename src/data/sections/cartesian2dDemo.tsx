import { type ReactElement } from "react";
import { FullWidthLayout, SplitLayout } from "@/components/layouts";
import { Block } from "@/components/templates";
import {
    Cartesian2D,
    EditableH1,
    EditableH2,
    EditableParagraph,
    InlineLinkedHighlight,
    InlineScrubbleNumber,
} from "@/components/atoms";
import { useVar } from "@/stores";
import { getExampleVariableInfo, numberPropsFromDefinition, linkedHighlightPropsFromDefinition } from "../exampleVariables";

// ── Demo 1: Static Function Plots ────────────────────────────────────────────

function BasicFunctionsViz() {
    return (
        <Cartesian2D
            viewBox={{ x: [-5, 5], y: [-2.5, 2.5] }}
            plots={[
                { type: "function", fn: Math.sin, color: "#3b82f6", weight: 3 },
                { type: "function", fn: Math.cos, color: "#f59e0b", weight: 3 },
                {
                    type: "function",
                    fn: (x) => -Math.sin(x),
                    color: "#ef4444",
                    weight: 2,
                    domain: [-Math.PI, Math.PI],
                },
                // Mark the key points: sin(π/2) = 1, cos(0) = 1
                { type: "point", x: Math.PI / 2, y: 1, color: "#3b82f6" },
                { type: "point", x: 0, y: 1, color: "#f59e0b" },
                {
                    type: "segment",
                    point1: [Math.PI / 2, 0],
                    point2: [Math.PI / 2, 1],
                    color: "#3b82f6",
                    style: "dashed",
                    weight: 1,
                },
            ]}
        />
    );
}

// ── Demo 2: Unit Circle Explorer ─────────────────────────────────────────────

function UnitCircleExplorer() {
    return (
        <Cartesian2D
            viewBox={{ x: [-2, 2], y: [-2, 2] }}
            // Constrain the draggable point to the unit circle
            movablePoints={[
                {
                    initial: [1, 0],
                    color: "#ef4444",
                    constrain: ([px, py]) => {
                        const angle = Math.atan2(py, px);
                        return [Math.cos(angle), Math.sin(angle)];
                    },
                },
            ]}
            plots={[
                // Unit circle outline
                {
                    type: "circle",
                    center: [0, 0],
                    radius: 1,
                    color: "#64748b",
                    fillOpacity: 0.05,
                    strokeStyle: "dashed",
                },
            ]}
            dynamicPlots={([p]) => {
                const [cx, cy] = p;
                return [
                    // Radius vector from origin to point
                    { type: "vector", tail: [0, 0], tip: p, color: "#ef4444", weight: 2.5 },
                    // cos(θ): horizontal drop-line from point to x-axis
                    {
                        type: "segment",
                        point1: [cx, 0],
                        point2: p,
                        color: "#3b82f6",
                        style: "dashed",
                        weight: 1.5,
                    },
                    // sin(θ): vertical drop-line from point to y-axis
                    {
                        type: "segment",
                        point1: [0, cy],
                        point2: p,
                        color: "#22c55e",
                        style: "dashed",
                        weight: 1.5,
                    },
                    // cos(θ) foot on x-axis
                    { type: "point", x: cx, y: 0, color: "#3b82f6" },
                    // sin(θ) foot on y-axis
                    { type: "point", x: 0, y: cy, color: "#22c55e" },
                ];
            }}
        />
    );
}

// ── Demo 3: Parametric Curves ─────────────────────────────────────────────────

function ParametricCurvesViz() {
    return (
        <Cartesian2D
            viewBox={{ x: [-3, 3], y: [-3, 3] }}
            plots={[
                // Lissajous figure: a=2, b=3
                {
                    type: "parametric",
                    xy: (t) => [2 * Math.sin(2 * t), 2 * Math.sin(3 * t)],
                    tRange: [0, 2 * Math.PI],
                    color: "#8b5cf6",
                    weight: 2.5,
                },
                // Epicycloid: small circle rolling on bigger
                {
                    type: "parametric",
                    xy: (t) => [
                        1.5 * Math.cos(t) - 0.6 * Math.cos(2.5 * t),
                        1.5 * Math.sin(t) - 0.6 * Math.sin(2.5 * t),
                    ],
                    tRange: [0, 4 * Math.PI],
                    color: "#f97316",
                    weight: 2,
                },
            ]}
        />
    );
}

// ── Demo 4: Reactive Sine Wave Visualization ─────────────────────────────────

/**
 * Reactive wrapper that reads sine wave parameters from the global variable store
 * and renders the Cartesian2D visualization.
 */
function ReactiveSineWaveViz() {
    const amplitude = useVar('sineAmplitude', 1.5) as number;
    const omega = useVar('sineOmega', 1) as number;
    const phase = useVar('sinePhase', 0) as number;

    return (
        <>
            <Cartesian2D
                viewBox={{ x: [-5, 5], y: [-3.5, 3.5] }}
                highlightVarName="c2dHighlight"
                plots={[
                    // Reference: y = sin(x) (unmodified)
                    {
                        type: "function",
                        fn: (x) => Math.sin(x),
                        color: "#94a3b8",
                        weight: 1.5,
                    },
                    // Amplitude effect: A·sin(x) — highlights amplitude role
                    {
                        type: "function",
                        fn: (x) => amplitude * Math.sin(x),
                        color: "#ef4444",
                        weight: 2.5,
                        highlightId: "amplitude",
                    },
                    // Frequency effect: sin(ω·x) — highlights frequency role
                    {
                        type: "function",
                        fn: (x) => Math.sin(omega * x),
                        color: "#3b82f6",
                        weight: 2.5,
                        highlightId: "frequency",
                    },
                    // Full wave with all three parameters
                    {
                        type: "function",
                        fn: (x) => amplitude * Math.sin(omega * x + phase),
                        color: "#22c55e",
                        weight: 3,
                    },
                    // Phase indicator: mark where the full wave crosses zero
                    {
                        type: "point",
                        x: -phase / omega,
                        y: 0,
                        color: "#a855f7",
                        highlightId: "phase",
                    },
                    {
                        type: "segment",
                        point1: [-phase / omega, 0],
                        point2: [-phase / omega, amplitude * Math.sin(omega * (-phase / omega) + phase)],
                        color: "#a855f7",
                        style: "dashed",
                        weight: 1.5,
                        highlightId: "phase",
                    },
                ]}
            />
            <p className="text-xs text-muted-foreground mt-2 text-center">
                <span style={{ color: "#94a3b8" }}>━</span> Reference sin(x) ·{" "}
                <span style={{ color: "#ef4444" }}>━</span> A·sin(x) ·{" "}
                <span style={{ color: "#3b82f6" }}>━</span> sin(ωx) ·{" "}
                <span style={{ color: "#22c55e" }}>━</span> Full wave
            </p>
        </>
    );
}

/**
 * Reactive live equation display that reads from the global variable store.
 */
function ReactiveEquationDisplay() {
    const amplitude = useVar('sineAmplitude', 1.5) as number;
    const omega = useVar('sineOmega', 1) as number;
    const phase = useVar('sinePhase', 0) as number;

    return (
        <div className="p-4 rounded-xl bg-card border text-center font-mono text-lg">
            y ={" "}
            <span style={{ color: "#ef4444", fontWeight: 600 }}>
                {amplitude.toFixed(1)}
            </span>
            {" "}· sin(
            <span style={{ color: "#3b82f6", fontWeight: 600 }}>
                {omega.toFixed(1)}
            </span>
            x{" "}
            {phase >= 0 ? "+" : "−"}{" "}
            <span style={{ color: "#a855f7", fontWeight: 600 }}>
                {Math.abs(phase / Math.PI).toFixed(2)}π
            </span>
            )
        </div>
    );
}

// ── Exported demo blocks ──────────────────────────────────────────────────────

export const cartesian2dDemo: ReactElement[] = [
    // ── Header ──────────────────────────────────────────────────────────────
    <FullWidthLayout key="layout-c2d-header-title" maxWidth="xl">
        <Block id="block-c2d-header-title" padding="sm">
            <EditableH1 id="h1-c2d-title" blockId="block-c2d-header-title">
                2D Cartesian Visualizations
            </EditableH1>
        </Block>
    </FullWidthLayout>,

    <FullWidthLayout key="layout-c2d-header-desc" maxWidth="xl">
        <Block id="block-c2d-header-desc" padding="sm">
            <EditableParagraph id="para-c2d-desc" blockId="block-c2d-header-desc">
                Interactive 2D math plots powered by Cartesian2D — supporting
                function plots, parametric curves, movable points, dynamic
                geometry, and linked highlights.
            </EditableParagraph>
        </Block>
    </FullWidthLayout>,

    // ── Demo 1: Basic Function Plots ─────────────────────────────────────────
    <SplitLayout key="layout-c2d-basic" ratio="1:1" gap="lg">
        <Block id="block-c2d-basic-text" padding="sm">
            <EditableH2 id="h2-c2d-basic" blockId="block-c2d-basic-text">
                Function Plots
            </EditableH2>
            <EditableParagraph id="para-c2d-basic-desc" blockId="block-c2d-basic-text">
                The simplest usage — pass a plots array of function objects. Each
                entry is rendered as a continuous curve over the visible viewport.
            </EditableParagraph>
            <div className="space-y-2 text-sm mt-4">
                <div className="flex items-center gap-2">
                    <span className="inline-block w-4 h-1 rounded bg-blue-500" />
                    <span className="font-mono">y = sin(x)</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="inline-block w-4 h-1 rounded bg-yellow-500" />
                    <span className="font-mono">y = cos(x)</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="inline-block w-4 h-1 rounded bg-red-500" />
                    <span className="font-mono">y = −sin(x)</span>
                    <span className="text-muted-foreground">(restricted domain)</span>
                </div>
            </div>
            <EditableParagraph id="para-c2d-basic-hint" blockId="block-c2d-basic-text">
                The blue dot marks the maximum of sin(x) at x = π/2, and
                the dashed vertical line shows the drop to the x-axis.
            </EditableParagraph>
        </Block>
        <Block id="block-c2d-basic-viz" padding="sm">
            <BasicFunctionsViz />
        </Block>
    </SplitLayout>,

    // ── Demo 2: Unit Circle Explorer ─────────────────────────────────────────
    <SplitLayout key="layout-c2d-unit-circle" ratio="1:1" gap="lg">
        <Block id="block-c2d-unit-text" padding="sm">
            <EditableH2 id="h2-c2d-unit" blockId="block-c2d-unit-text">
                Unit Circle Explorer
            </EditableH2>
            <EditableParagraph id="para-c2d-unit-desc" blockId="block-c2d-unit-text">
                A movable point is constrained to the unit circle via a custom
                constrain function. dynamicPlots receives the live point position
                each frame and returns the projection lines.
            </EditableParagraph>
            <div className="space-y-2 text-sm mt-4">
                <div className="flex items-center gap-2">
                    <span className="inline-block w-4 h-1 rounded bg-red-500" />
                    <span>Radius vector (drag to rotate)</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="inline-block w-4 h-1 rounded bg-blue-500" />
                    <span>cos(θ) — horizontal projection</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="inline-block w-4 h-1 rounded bg-green-500" />
                    <span>sin(θ) — vertical projection</span>
                </div>
            </div>
            <EditableParagraph id="para-c2d-unit-hint" blockId="block-c2d-unit-text">
                💡 Drag the red point around the circle and watch how the
                cosine and sine projections change.
            </EditableParagraph>
        </Block>
        <Block id="block-c2d-unit-viz" padding="sm">
            <UnitCircleExplorer />
        </Block>
    </SplitLayout>,

    // ── Demo 3: Parametric Curves ─────────────────────────────────────────────
    <SplitLayout key="layout-c2d-parametric" ratio="1:1" gap="lg">
        <Block id="block-c2d-parametric-text" padding="sm">
            <EditableH2 id="h2-c2d-parametric" blockId="block-c2d-parametric-text">
                Parametric Curves
            </EditableH2>
            <EditableParagraph id="para-c2d-parametric-desc" blockId="block-c2d-parametric-text">
                Use parametric plot types to draw curves that can't be expressed
                as simple functions of x. Both curves loop over a full period.
            </EditableParagraph>
            <div className="space-y-2 text-sm mt-4">
                <div className="flex items-center gap-2">
                    <span className="inline-block w-4 h-1 rounded bg-violet-500" />
                    <span>Lissajous (a=2, b=3): </span>
                    <span className="font-mono text-xs">[2sin(2t), 2sin(3t)]</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="inline-block w-4 h-1 rounded bg-orange-500" />
                    <span>Epitrochoid: </span>
                    <span className="font-mono text-xs">[r·cos t − d·cos(5t/2), ...]</span>
                </div>
            </div>
        </Block>
        <Block id="block-c2d-parametric-viz" padding="sm">
            <ParametricCurvesViz />
        </Block>
    </SplitLayout>,

    // ── Demo 4: Sine Wave Explorer (InlineLinkedHighlight + Store) ─────────────
    <SplitLayout key="layout-c2d-explorer" ratio="1:1" gap="lg">
        <Block id="block-c2d-explorer-text" padding="sm">
            <EditableH2 id="h2-c2d-explorer" blockId="block-c2d-explorer-text">
                Sine Wave Explorer
            </EditableH2>

            <EditableParagraph id="para-c2d-explorer-intro" blockId="block-c2d-explorer-text">
                The general sine wave y = A · sin(ωx + φ) has three parameters.
                Hover over a term or drag its slider to highlight the effect in the plot.
            </EditableParagraph>

            <EditableParagraph id="para-c2d-explorer-amplitude" blockId="block-c2d-explorer-text">
                The{" "}
                <InlineLinkedHighlight
                    varName="c2dHighlight"
                    highlightId="amplitude"
                    {...linkedHighlightPropsFromDefinition(getExampleVariableInfo('c2dHighlight'))}
                    color="#ef4444"
                >
                    amplitude
                </InlineLinkedHighlight>{" "}
                (A) stretches the wave vertically — currently{" "}
                <InlineScrubbleNumber
                    varName="sineAmplitude"
                    {...numberPropsFromDefinition(getExampleVariableInfo('sineAmplitude'))}
                    formatValue={(v) => v.toFixed(1)}
                />.
            </EditableParagraph>

            <EditableParagraph id="para-c2d-explorer-frequency" blockId="block-c2d-explorer-text">
                The angular{" "}
                <InlineLinkedHighlight
                    varName="c2dHighlight"
                    highlightId="frequency"
                    {...linkedHighlightPropsFromDefinition(getExampleVariableInfo('c2dHighlight'))}
                    color="#3b82f6"
                >
                    frequency
                </InlineLinkedHighlight>{" "}
                (ω) controls how many oscillations fit per unit — currently{" "}
                <InlineScrubbleNumber
                    varName="sineOmega"
                    {...numberPropsFromDefinition(getExampleVariableInfo('sineOmega'))}
                    formatValue={(v) => v.toFixed(1)}
                />.
            </EditableParagraph>

            <EditableParagraph id="para-c2d-explorer-phase" blockId="block-c2d-explorer-text">
                The{" "}
                <InlineLinkedHighlight
                    varName="c2dHighlight"
                    highlightId="phase"
                    {...linkedHighlightPropsFromDefinition(getExampleVariableInfo('c2dHighlight'))}
                    color="#a855f7"
                >
                    phase shift
                </InlineLinkedHighlight>{" "}
                (φ) shifts the wave horizontally — currently{" "}
                <InlineScrubbleNumber
                    varName="sinePhase"
                    {...numberPropsFromDefinition(getExampleVariableInfo('sinePhase'))}
                    formatValue={(v) => `${(v / Math.PI).toFixed(2)}π`}
                />.
            </EditableParagraph>

            {/* Live equation display */}
            <ReactiveEquationDisplay />

            <EditableParagraph id="para-c2d-explorer-hint" blockId="block-c2d-explorer-text">
                💡 Drag the numbers above or hover the parameter names
                to highlight each curve in the plot.
            </EditableParagraph>
        </Block>

        <Block id="block-c2d-explorer-viz" padding="sm">
            <ReactiveSineWaveViz />
        </Block>
    </SplitLayout>,
];
