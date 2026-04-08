import { type ReactElement, useState, useCallback, useEffect, useMemo, useRef } from "react";
import { StackLayout, SplitLayout } from "@/components/layouts";
import { Block } from "@/components/templates";
import {
    Cartesian2D,
    EditableH2,
    EditableH4,
    EditableParagraph,
    InlineLinkedHighlight,
    InlineScrubbleNumber,
    InlineSpotColor,
    EditableH3,
    InlineHyperlink,
} from "@/components/atoms";
import type { PlotItem } from "@/components/atoms";
import { Mafs, Coordinates, Plot, useMovablePoint } from "mafs";
import { FormulaBlock } from "@/components/molecules";
import { useVar, useSetVar } from "@/stores";
import { getExampleVariableInfo, numberPropsFromDefinition, linkedHighlightPropsFromDefinition, spotColorPropsFromDefinition } from "../exampleVariables";


// ── Demo 1: Static Function Plots ────────────────────────────────────────────

function BasicFunctionsViz() {
    return (
        <Cartesian2D
            viewBox={{ x: [-5, 5], y: [-2.5, 2.5] }}
            movablePoints={[
                {
                    initial: [Math.PI / 2, 0],
                    color: "#3b82f6",
                    constrain: "horizontal"
                }
            ]}
            dynamicPlots={([p]) => {
                const px = p[0];
                return [
                    { type: "function", fn: Math.sin, color: "#3b82f6", weight: 3 },
                    { type: "function", fn: Math.cos, color: "#f59e0b", weight: 3 },
                    {
                        type: "function",
                        fn: (x) => -Math.sin(x),
                        color: "#ef4444",
                        weight: 2,
                        domain: [-Math.PI, Math.PI],
                    },
                    // Mark the key points evaluated exactly at the dragged x-coordinate
                    { type: "point", x: px, y: Math.sin(px), color: "#3b82f6" },
                    { type: "point", x: px, y: Math.cos(px), color: "#f59e0b" },
                    {
                        type: "segment",
                        point1: [px, 0],
                        point2: [px, Math.sin(px)],
                        color: "#3b82f6",
                        style: "dashed",
                        weight: 1,
                    },
                    {
                        type: "segment",
                        point1: [px, 0],
                        point2: [px, Math.cos(px)],
                        color: "#f59e0b",
                        style: "dashed",
                        weight: 1,
                    },
                ];
            }}
        />
    );
}

// ── Demo 2: Unit Circle Explorer ─────────────────────────────────────────────

function UnitCircleExplorer() {
    const setVar = useSetVar();
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
                    onChange: ([px, py]) => {
                        setVar('ucCosineVal', px);
                        setVar('ucSineVal', py);
                    }
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



// ── Demo 3: Reactive Sine Wave Visualization ─────────────────────────────────

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

// SineWaveLegend removed — colors are now shown inline via InlineSpotColor

// ── Demo 4: Scatter Plot with Trend Line ──────────────────────────────────────

// Group A data — positive correlation (e.g. study hours vs score)
const groupAPoints: [number, number][] = [
    [1.0, 2.1], [1.5, 2.8], [2.0, 3.5], [2.3, 3.0], [2.8, 4.2],
    [3.2, 4.0], [3.5, 4.8], [4.0, 5.1], [4.3, 5.6], [4.8, 5.9],
    [5.2, 6.3], [5.5, 6.0], [6.0, 7.1], [6.5, 7.5], [7.0, 7.8],
];

// Group B data — same x range, systematically lower
const groupBPoints: [number, number][] = [
    [1.2, 1.0], [1.8, 1.5], [2.2, 1.8], [2.5, 2.3], [3.0, 2.5],
    [3.3, 2.9], [3.8, 3.2], [4.2, 3.0], [4.5, 3.8], [5.0, 4.0],
    [5.3, 4.3], [5.8, 4.6], [6.2, 4.9], [6.8, 5.2], [7.2, 5.5],
];

// Simple linear regression over combined data for the trend line
function linReg(pts: [number, number][]): { m: number; b: number } {
    const n = pts.length;
    const sx = pts.reduce((s, p) => s + p[0], 0);
    const sy = pts.reduce((s, p) => s + p[1], 0);
    const sxy = pts.reduce((s, p) => s + p[0] * p[1], 0);
    const sx2 = pts.reduce((s, p) => s + p[0] * p[0], 0);
    const m = (n * sxy - sx * sy) / (n * sx2 - sx * sx);
    const b = (sy - m * sx) / n;
    return { m, b };
}

const { m: trendM, b: trendB } = linReg([...groupAPoints, ...groupBPoints]);

/** A single draggable data point inside a Mafs canvas */
function DraggableDataPoint({
    initial,
    color,
    onMove,
}: {
    initial: [number, number];
    color: string;
    onMove: (pos: [number, number]) => void;
}) {
    const mp = useMovablePoint(initial, { color });

    // Fire callback when point moves
    const prev = useState(initial)[0];
    if (mp.point[0] !== prev[0] || mp.point[1] !== prev[1]) {
        prev[0] = mp.point[0];
        prev[1] = mp.point[1];
        onMove(mp.point as [number, number]);
    }

    return <>{mp.element}</>;
}

function ScatterPlotViz() {
    // Mutable arrays that track current point positions
    const [aPositions, setAPositions] = useState<[number, number][]>(() =>
        groupAPoints.map((p) => [...p] as [number, number])
    );
    const [bPositions, setBPositions] = useState<[number, number][]>(() =>
        groupBPoints.map((p) => [...p] as [number, number])
    );

    const handleMoveA = useCallback(
        (idx: number, pos: [number, number]) => {
            setAPositions((prev) => {
                const next = [...prev];
                next[idx] = pos;
                return next;
            });
        },
        []
    );

    const handleMoveB = useCallback(
        (idx: number, pos: [number, number]) => {
            setBPositions((prev) => {
                const next = [...prev];
                next[idx] = pos;
                return next;
            });
        },
        []
    );

    // Live linear regression from current positions
    const all = [...aPositions, ...bPositions];
    const { m, b } = linReg(all);

    // Write slope & intercept to store so the equation text can read them
    const setVar = useSetVar();
    useEffect(() => {
        setVar('scSlope', Math.round(m * 100) / 100);
        setVar('scIntercept', Math.round(b * 100) / 100);
    }, [m, b, setVar]);

    return (
        <div className="w-full overflow-hidden rounded-xl">
            <Mafs
                height={400}
                viewBox={{ x: [0, 8], y: [0, 9] }}
            >
                <Coordinates.Cartesian subdivisions={1} />

                {/* Trend line from live regression */}
                <Plot.OfX
                    y={(x) => m * x + b}
                    color="#94a3b8"
                    weight={2}
                    domain={[0.5, 7.5]}
                />

                {/* Group A draggable points */}
                {groupAPoints.map((p, i) => (
                    <DraggableDataPoint
                        key={`a-${i}`}
                        initial={p}
                        color="#6366f1"
                        onMove={(pos) => handleMoveA(i, pos)}
                    />
                ))}

                {/* Group B draggable points */}
                {groupBPoints.map((p, i) => (
                    <DraggableDataPoint
                        key={`b-${i}`}
                        initial={p}
                        color="#f97316"
                        onMove={(pos) => handleMoveB(i, pos)}
                    />
                ))}
            </Mafs>
        </div>
    );
}

/** Reads slope & intercept from the store and renders the live equation */
function LiveRegressionEquation() {
    const slope = useVar('scSlope', Math.round(trendM * 100) / 100) as number;
    const intercept = useVar('scIntercept', Math.round(trendB * 100) / 100) as number;
    const sign = intercept >= 0 ? '+' : '−';
    const absB = Math.abs(intercept).toFixed(2);
    return (
        <div className="text-center font-mono text-lg py-2">
            <span style={{ color: '#94a3b8' }}>
                y = {slope.toFixed(2)}x {sign} {absB}
            </span>
        </div>
    );
}

// ── Demo 5: Line Drawing Playground ─────────────────────────────────────────

function LineDrawingViz() {
    const snapToGrid = useVar('ldSnapToGrid', 'on') as string;
    const drawMode = useVar('ldDrawMode', 'lines') as string;
    const [points, setPoints] = useState<[number, number][]>([]);
    const overlayRef = useRef<HTMLDivElement>(null);

    const viewBox = { x: [-6, 6] as [number, number], y: [-6, 6] as [number, number] };

    const clientToMath = useCallback((clientX: number, clientY: number): [number, number] | null => {
        const overlay = overlayRef.current;
        if (!overlay) return null;

        const rect = overlay.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return null;

        const relX = clientX - rect.left;
        const relY = clientY - rect.top;

        const [xMin, xMax] = viewBox.x;
        const [yMin, yMax] = viewBox.y;

        const x = xMin + (relX / rect.width) * (xMax - xMin);
        const y = yMax - (relY / rect.height) * (yMax - yMin);

        return [x, y];
    }, []);

    const handleAddPoint = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (e.button !== 0) return;
        const raw = clientToMath(e.clientX, e.clientY);
        if (!raw) return;

        const nextPoint: [number, number] = snapToGrid === 'on'
            ? [Math.round(raw[0]), Math.round(raw[1])]
            : [Math.round(raw[0] * 10) / 10, Math.round(raw[1] * 10) / 10];

        setPoints((prev) => [...prev, nextPoint]);
    }, [clientToMath, snapToGrid]);

    const clearDrawing = useCallback(() => {
        setPoints([]);
    }, []);

    const plots = useMemo<PlotItem[]>(() => {
        const dynamic: PlotItem[] = points.map(([x, y]) => ({
            type: 'point',
            x,
            y,
            color: '#ef4444',
        }));

        for (let i = 0; i < points.length - 1; i++) {
            dynamic.push({
                type: 'segment',
                point1: points[i],
                point2: points[i + 1],
                color: '#3b82f6',
                weight: 2.5,
            });

            const mx = (points[i][0] + points[i + 1][0]) / 2;
            const my = (points[i][1] + points[i + 1][1]) / 2;
            dynamic.push({
                type: 'point',
                x: mx,
                y: my,
                color: '#f59e0b',
            });
        }

        if (drawMode === 'polygon' && points.length > 2) {
            dynamic.push({
                type: 'segment',
                point1: points[points.length - 1],
                point2: points[0],
                color: '#a855f7',
                weight: 2,
                style: 'dashed',
            });

            const closingMidX = (points[points.length - 1][0] + points[0][0]) / 2;
            const closingMidY = (points[points.length - 1][1] + points[0][1]) / 2;
            dynamic.push({
                type: 'point',
                x: closingMidX,
                y: closingMidY,
                color: '#f59e0b',
            });
        }

        return dynamic;
    }, [points, drawMode]);

    return (
        <div className="relative">
            <Cartesian2D
                height={420}
                viewBox={viewBox}
                plots={plots}
            />

            <div
                ref={overlayRef}
                className="absolute inset-0 cursor-crosshair"
                onClick={handleAddPoint}
            />

            <button
                type="button"
                className="absolute right-3 top-3 rounded-md border border-border bg-background/95 px-3 py-1 text-xs font-medium shadow-sm"
                onClick={clearDrawing}
            >
                Clear
            </button>
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
    <StackLayout key="layout-cartesian-2d-header-title" maxWidth="xl">
        <Block id="cartesian-2d-header-title" padding="sm">
            <EditableH3 id="h3-cartesian-2d-title" blockId="cartesian-2d-header-title">
                2D Cartesian Visualizations
            </EditableH3>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-cartesian-2d-header-desc" maxWidth="xl">
        <Block id="cartesian-2d-header-desc" padding="sm">
            <EditableParagraph id="para-cartesian-2d-desc" blockId="cartesian-2d-header-desc">
                The Cartesian coordinate system provides a framework for visualizing mathematical relationships in two dimensions. MathVibe tightly incorporates the incredibly fast and powerful <InlineHyperlink id="link-mafs" href="https://mafs.dev" targetBlockId="">Mafs library</InlineHyperlink> (a declarative React geometry framework built on top of D3) directly inside our plotting blocks, allowing you to instantly build highly interactive, performant 2D canvas plots seamlessly right out of the box.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // ── Demo 1: Basic Function Plots ─────────────────────────────────────────
    <StackLayout key="layout-cartesian-2d-basic-title" maxWidth="xl">
        <Block id="cartesian-2d-basic-title" padding="sm">
            <EditableH4 id="h4-cartesian-2d-basic" blockId="cartesian-2d-basic-title">
                Function Plots
            </EditableH4>
        </Block>
    </StackLayout>,

    <SplitLayout key="layout-cartesian-2d-basic-split" ratio="1:1" gap="lg">
        <Block id="cartesian-2d-basic-desc" padding="sm">
            <EditableParagraph id="para-cartesian-2d-basic-desc" blockId="cartesian-2d-basic-desc">
                This example shows the simplest usage: passing an array of function objects. Three
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
                {" "}(restricted domain). Try dragging the blue point along the x-axis to instantly evaluate the sine and cosine functions simultaneously exactly at that x-coordinate! The tracking dashed drop-lines recalculate synchronously as you drag.
            </EditableParagraph>
        </Block>
        <Block id="cartesian-2d-basic-viz" padding="sm" hasVisualization>
            <BasicFunctionsViz />
        </Block>
    </SplitLayout>,

    // ── Demo 2: Unit Circle Explorer ─────────────────────────────────────────
    <StackLayout key="layout-cartesian-2d-unit-title" maxWidth="xl">
        <Block id="cartesian-2d-unit-title" padding="sm">
            <EditableH4 id="h4-cartesian-2d-unit" blockId="cartesian-2d-unit-title">
                Unit Circle Explorer
            </EditableH4>
        </Block>
    </StackLayout>,

    <SplitLayout key="layout-cartesian-2d-unit-split" ratio="1:1" gap="lg">
        <Block id="cartesian-2d-unit-desc" padding="sm">
            <EditableParagraph id="para-cartesian-2d-unit-desc" blockId="cartesian-2d-unit-desc">
                <strong>Learning Goal:</strong> Understand the relationship between circular motion and trigonometric functions. <br /><br />
                By constraining a movable point to a circle of radius 1, we can dynamically visualize the fundamental definitions of sine and cosine. Try dragging the red{" "}
                <InlineSpotColor varName="ucRadius" color="#ef4444">
                    radius vector
                </InlineSpotColor>
                {" "}around the unit circle. You'll immediately notice that the point's horizontal position maps precisely to its{" "}
                <InlineSpotColor varName="ucCosine" color="#3b82f6">
                    cos(θ) projection
                </InlineSpotColor>
                {" "}(<InlineScrubbleNumber varName="ucCosineVal" {...numberPropsFromDefinition(getExampleVariableInfo('ucCosineVal'))} color="#3b82f6" formatValue={(v) => v.toFixed(2)} />), and its vertical position corresponds exactly to its{" "}
                <InlineSpotColor varName="ucSine" color="#22c55e">
                    sin(θ) projection
                </InlineSpotColor>
                {" "}(<InlineScrubbleNumber varName="ucSineVal" {...numberPropsFromDefinition(getExampleVariableInfo('ucSineVal'))} color="#22c55e" formatValue={(v) => v.toFixed(2)} />). Visualizing how these projections grow, shrink, and oscillate interactively builds a much deeper intuition than memorizing a formula!
            </EditableParagraph>
        </Block>
        <Block id="cartesian-2d-unit-viz" padding="sm" hasVisualization>
            <UnitCircleExplorer />
        </Block>
    </SplitLayout>,

    // ── Demo 3: Sine Wave Explorer (InlineLinkedHighlight + Store) ─────────────
    <StackLayout key="layout-cartesian-2d-explorer-title" maxWidth="xl">
        <Block id="cartesian-2d-explorer-title" padding="sm">
            <EditableH4 id="h4-cartesian-2d-explorer" blockId="cartesian-2d-explorer-title">
                Sine Wave Explorer
            </EditableH4>
        </Block>
    </StackLayout>,

    <SplitLayout key="layout-cartesian-2d-explorer-split" ratio="1:1" gap="lg">
        <div className="space-y-4">
            <Block id="cartesian-2d-explorer-intro" padding="sm">
                <EditableParagraph id="para-cartesian-2d-explorer-intro" blockId="cartesian-2d-explorer-intro">
                    The general sine wave y = A · sin(ωx + φ) has three parameters.
                    The plot shows{" "}
                    <InlineSpotColor varName="swReference"
                        {...spotColorPropsFromDefinition(getExampleVariableInfo('swReference'))}
                    >
                        sin(x)
                    </InlineSpotColor>
                    {" "}as a reference,{" "}
                    <InlineSpotColor varName="swAmplitude"
                        {...spotColorPropsFromDefinition(getExampleVariableInfo('swAmplitude'))}
                    >
                        A·sin(x)
                    </InlineSpotColor>
                    {" "}for amplitude,{" "}
                    <InlineSpotColor varName="swFrequency"
                        {...spotColorPropsFromDefinition(getExampleVariableInfo('swFrequency'))}
                    >
                        sin(ωx)
                    </InlineSpotColor>
                    {" "}for frequency, and{" "}
                    <InlineSpotColor varName="swFullWave"
                        {...spotColorPropsFromDefinition(getExampleVariableInfo('swFullWave'))}
                    >
                        A·sin(ωx + φ)
                    </InlineSpotColor>
                    {" "}as the full wave. Hover over a term or drag its slider to highlight the effect.
                </EditableParagraph>
            </Block>
            <Block id="cartesian-2d-explorer-params" padding="sm">
                <EditableParagraph id="para-cartesian-2d-explorer-params" blockId="cartesian-2d-explorer-params">
                    The{" "}
                    <InlineLinkedHighlight
                        varName="c2dHighlight"
                        highlightId="amplitude"
                        {...linkedHighlightPropsFromDefinition(getExampleVariableInfo('c2dHighlight'))}
                        color="#ef4444"
                    >
                        amplitude
                    </InlineLinkedHighlight>{" "}
                    (A) stretches the wave vertically. The current value is{" "}
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
                    (ω) controls how many oscillations fit per unit. The current value is{" "}
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
                    (φ) shifts the wave horizontally. The current value is{" "}
                    <InlineScrubbleNumber
                        varName="sinePhase"
                        {...numberPropsFromDefinition(getExampleVariableInfo('sinePhase'))}
                        formatValue={(v) => `${(v / Math.PI).toFixed(2)}π`}
                    />.
                </EditableParagraph>
            </Block>

            <Block id="cartesian-2d-explorer-equation" padding="sm">
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
            <Block id="cartesian-2d-explorer-hint" padding="sm">
                <EditableParagraph id="para-cartesian-2d-explorer-hint" blockId="cartesian-2d-explorer-hint">
                    💡 Drag the numbers above or hover the parameter names
                    to highlight each curve in the plot.
                </EditableParagraph>
            </Block>
        </div>
        <Block id="cartesian-2d-explorer-viz" padding="sm" hasVisualization>
            <ReactiveSineWaveViz />
        </Block>
    </SplitLayout>,

    // ── Demo 4: Scatter Plot ──────────────────────────────────────────────────
    <StackLayout key="layout-cartesian-2d-scatter-title" maxWidth="xl">
        <Block id="cartesian-2d-scatter-title" padding="sm">
            <EditableH4 id="h4-cartesian-2d-scatter" blockId="cartesian-2d-scatter-title">
                Scatter Plot
            </EditableH4>
        </Block>
    </StackLayout>,

    <SplitLayout key="layout-cartesian-2d-scatter-split" ratio="1:1" gap="lg">
        <div className="space-y-4">
            <Block id="cartesian-2d-scatter-desc" padding="sm">
                <EditableParagraph id="para-cartesian-2d-scatter-desc" blockId="cartesian-2d-scatter-desc">
                    Scatter plots display individual data points to reveal patterns and relationships. In this example, two groups of students are plotted based on their study hours and test scores. A trend line shows the overall relationship between these variables. Try dragging any data point to a new position and watch how the trend line automatically recalculates using linear regression.
                </EditableParagraph>
            </Block>
            <Block id="cartesian-2d-scatter-equation" padding="sm">
                <LiveRegressionEquation />
            </Block>
        </div>
        <Block id="cartesian-2d-scatter-viz" padding="sm" hasVisualization>
            <ScatterPlotViz />
        </Block>
    </SplitLayout>,

    // ── Demo 5: Line Drawing Playground ─────────────────────────────────────
    <StackLayout key="layout-cartesian-2d-drawing-title" maxWidth="xl">
        <Block id="cartesian-2d-drawing-title" padding="sm">
            <EditableH4 id="h4-cartesian-2d-drawing" blockId="cartesian-2d-drawing-title">
                Line Drawing
            </EditableH4>
        </Block>
    </StackLayout>,

    <SplitLayout key="layout-cartesian-2d-drawing-split" ratio="1:1" gap="lg">
        <div className="space-y-4">
            <Block id="cartesian-2d-drawing-desc" padding="sm">
                <EditableParagraph id="para-cartesian-2d-drawing-desc" blockId="cartesian-2d-drawing-desc">
                    This drawing canvas lets you create geometric shapes directly on the coordinate plane. Click anywhere to place a point, and the system will automatically connect consecutive points with line segments. Each segment displays its midpoint, helping visualize geometric relationships as you draw.
                </EditableParagraph>
            </Block>

            <Block id="cartesian-2d-drawing-controls" padding="sm">
                <EditableParagraph id="para-cartesian-2d-drawing-controls" blockId="cartesian-2d-drawing-controls">
                    Toggle grid snapping to constrain your points to integer coordinates, making it easier to draw precise shapes. In polygon mode, a dashed line automatically connects your last point back to the first, forming a closed figure.
                </EditableParagraph>
            </Block>

            <Block id="cartesian-2d-drawing-hint" padding="sm">
                <EditableParagraph id="para-cartesian-2d-drawing-hint" blockId="cartesian-2d-drawing-hint">
                    💡 Use the Clear button in the top-right of the graph to start a new sketch.
                </EditableParagraph>
            </Block>
        </div>

        <Block id="cartesian-2d-drawing-viz" padding="sm" hasVisualization>
            <LineDrawingViz />
        </Block>
    </SplitLayout>,
];
