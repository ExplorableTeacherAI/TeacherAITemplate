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
    InlineSpotColor,
} from "@/components/atoms";
import { FormulaBlock } from "@/components/molecules";
import { useVar } from "@/stores";
import { getExampleVariableInfo, numberPropsFromDefinition, linkedHighlightPropsFromDefinition, spotColorPropsFromDefinition } from "../exampleVariables";

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
        </>
    );
}

// ── Sine Wave Legend ──────────────────────────────────────────────────────────

function SineWaveLegend() {
    return (
        <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
                <span className="inline-block w-4 h-1 rounded" style={{ backgroundColor: "#94a3b8" }} />
                <span className="font-mono">sin(x)</span>
                <span className="text-muted-foreground">(reference)</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="inline-block w-4 h-1 rounded" style={{ backgroundColor: "#ef4444" }} />
                <span className="font-mono">A·sin(x)</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="inline-block w-4 h-1 rounded" style={{ backgroundColor: "#3b82f6" }} />
                <span className="font-mono">sin(ωx)</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="inline-block w-4 h-1 rounded" style={{ backgroundColor: "#22c55e" }} />
                <span className="font-mono">A·sin(ωx + φ)</span>
                <span className="text-muted-foreground">(full wave)</span>
            </div>
        </div>
    );
}

// ── Legend Components ──────────────────────────────────────────────────────────

// BasicFunctionsLegend removed — colors are now shown inline via InlineSpotColor

// UnitCircleLegend removed — colors are now shown inline via InlineSpotColor

// ParametricCurvesLegend removed — colors are now shown inline via InlineSpotColor

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
    <FullWidthLayout key="layout-c2d-basic-title" maxWidth="xl">
        <Block id="block-c2d-basic-title" padding="sm">
            <EditableH2 id="h2-c2d-basic" blockId="block-c2d-basic-title">
                Function Plots
            </EditableH2>
        </Block>
    </FullWidthLayout>,

    <SplitLayout key="layout-c2d-basic-split" ratio="1:1" gap="lg">
        <Block id="block-c2d-basic-desc" padding="sm">
            <EditableParagraph id="para-c2d-basic-desc" blockId="block-c2d-basic-desc">
                The simplest usage — pass a plots array of function objects. Three
                curves are shown:{" "}
                <InlineSpotColor varName="fpSin"
                    {...spotColorPropsFromDefinition(getExampleVariableInfo('fpSin'))}
                >
                    sin(x)
                </InlineSpotColor>
                ,{" "}
                <InlineSpotColor varName="fpCos"
                    {...spotColorPropsFromDefinition(getExampleVariableInfo('fpCos'))}
                >
                    cos(x)
                </InlineSpotColor>
                , and{" "}
                <InlineSpotColor varName="fpNegSin"
                    {...spotColorPropsFromDefinition(getExampleVariableInfo('fpNegSin'))}
                >
                    −sin(x)
                </InlineSpotColor>
                {" "}(restricted domain). The dot marks the maximum of sin(x) at
                x = π/2, and the dashed vertical line shows the drop to the x-axis.
            </EditableParagraph>
        </Block>
        <Block id="block-c2d-basic-viz" padding="sm">
            <BasicFunctionsViz />
        </Block>
    </SplitLayout>,

    // ── Demo 2: Unit Circle Explorer ─────────────────────────────────────────
    <FullWidthLayout key="layout-c2d-unit-title" maxWidth="xl">
        <Block id="block-c2d-unit-title" padding="sm">
            <EditableH2 id="h2-c2d-unit" blockId="block-c2d-unit-title">
                Unit Circle Explorer
            </EditableH2>
        </Block>
    </FullWidthLayout>,

    <SplitLayout key="layout-c2d-unit-split" ratio="1:1" gap="lg">
        <Block id="block-c2d-unit-desc" padding="sm">
            <EditableParagraph id="para-c2d-unit-desc" blockId="block-c2d-unit-desc">
                A movable point is constrained to the unit circle. Drag the{" "}
                <InlineSpotColor varName="ucRadius"
                    {...spotColorPropsFromDefinition(getExampleVariableInfo('ucRadius'))}
                >
                    radius vector
                </InlineSpotColor>
                {" "}around the circle and watch how the{" "}
                <InlineSpotColor varName="ucCosine"
                    {...spotColorPropsFromDefinition(getExampleVariableInfo('ucCosine'))}
                >
                    cos(θ) projection
                </InlineSpotColor>
                {" "}(horizontal) and{" "}
                <InlineSpotColor varName="ucSine"
                    {...spotColorPropsFromDefinition(getExampleVariableInfo('ucSine'))}
                >
                    sin(θ) projection
                </InlineSpotColor>
                {" "}(vertical) change in real time.
            </EditableParagraph>
        </Block>
        <Block id="block-c2d-unit-viz" padding="sm">
            <UnitCircleExplorer />
        </Block>
    </SplitLayout>,

    // ── Demo 3: Parametric Curves ─────────────────────────────────────────────
    <FullWidthLayout key="layout-c2d-parametric-title" maxWidth="xl">
        <Block id="block-c2d-parametric-title" padding="sm">
            <EditableH2 id="h2-c2d-parametric" blockId="block-c2d-parametric-title">
                Parametric Curves
            </EditableH2>
        </Block>
    </FullWidthLayout>,

    <SplitLayout key="layout-c2d-parametric-split" ratio="1:1" gap="lg">
        <Block id="block-c2d-parametric-desc" padding="sm">
            <EditableParagraph id="para-c2d-parametric-desc" blockId="block-c2d-parametric-desc">
                Parametric plot types draw curves that can’t be expressed as
                simple functions of x. Two curves are shown:{" "}
                <InlineSpotColor varName="pcLissajous"
                    {...spotColorPropsFromDefinition(getExampleVariableInfo('pcLissajous'))}
                >
                    Lissajous (a=2, b=3)
                </InlineSpotColor>
                {" "}and{" "}
                <InlineSpotColor varName="pcEpitrochoid"
                    {...spotColorPropsFromDefinition(getExampleVariableInfo('pcEpitrochoid'))}
                >
                    Epitrochoid
                </InlineSpotColor>
                , both looping over a full period.
            </EditableParagraph>
        </Block>
        <Block id="block-c2d-parametric-viz" padding="sm">
            <ParametricCurvesViz />
        </Block>
    </SplitLayout>,

    // ── Demo 4: Sine Wave Explorer (InlineLinkedHighlight + Store) ─────────────
    <FullWidthLayout key="layout-c2d-explorer-title" maxWidth="xl">
        <Block id="block-c2d-explorer-title" padding="sm">
            <EditableH2 id="h2-c2d-explorer" blockId="block-c2d-explorer-title">
                Sine Wave Explorer
            </EditableH2>
        </Block>
    </FullWidthLayout>,

    <SplitLayout key="layout-c2d-explorer-split" ratio="1:1" gap="lg">
        <div className="space-y-4">
            <Block id="block-c2d-explorer-intro" padding="sm">
                <EditableParagraph id="para-c2d-explorer-intro" blockId="block-c2d-explorer-intro">
                    The general sine wave y = A · sin(ωx + φ) has three parameters.
                    Hover over a term or drag its slider to highlight the effect in the plot.
                </EditableParagraph>
            </Block>
            <Block id="block-c2d-explorer-params" padding="sm">
                <EditableParagraph id="para-c2d-explorer-params" blockId="block-c2d-explorer-params">
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
            </Block>
            <Block id="block-c2d-explorer-legend" padding="sm">
                <SineWaveLegend />
            </Block>
            <Block id="block-c2d-explorer-equation" padding="sm">
                <FormulaBlock
                    latex="\clr{result}{y} = \scrub{sineAmplitude} \cdot \sin\!\left( \scrub{sineOmega}\, x + \scrub{sinePhase} \right)"
                    colorMap={{ result: '#22c55e' }}
                    variables={{
                        sineAmplitude: { min: 0.1, max: 3, step: 0.1, color: '#ef4444', formatValue: (v) => v.toFixed(1) },
                        sineOmega: { min: 0.2, max: 4, step: 0.1, color: '#3b82f6', formatValue: (v) => v.toFixed(1) },
                        sinePhase: { min: -Math.PI, max: Math.PI, step: 0.05, color: '#a855f7', formatValue: (v) => `${(v / Math.PI).toFixed(2)}π` },
                    }}
                />
            </Block>
            <Block id="block-c2d-explorer-hint" padding="sm">
                <EditableParagraph id="para-c2d-explorer-hint" blockId="block-c2d-explorer-hint">
                    💡 Drag the numbers above or hover the parameter names
                    to highlight each curve in the plot.
                </EditableParagraph>
            </Block>
        </div>
        <Block id="block-c2d-explorer-viz" padding="sm">
            <ReactiveSineWaveViz />
        </Block>
    </SplitLayout>,
];
