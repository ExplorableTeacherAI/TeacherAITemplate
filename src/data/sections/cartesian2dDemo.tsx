import { type ReactElement, useState, useCallback, useEffect, useMemo, useRef } from "react";
import { StackLayout, SplitLayout } from "@/components/layouts";
import { Block } from "@/components/templates";
import {
    Cartesian2D,
    EditableH1,
    EditableH2,
    EditableParagraph,
    InlineToggle,
    InlineLinkedHighlight,
    InlineScrubbleNumber,
    InlineSpotColor,
} from "@/components/atoms";
import type { PlotItem } from "@/components/atoms";
import { Mafs, Coordinates, Plot, useMovablePoint } from "mafs";
import { FormulaBlock } from "@/components/molecules";
import { useVar, useSetVar } from "@/stores";
import { getExampleVariableInfo, numberPropsFromDefinition, linkedHighlightPropsFromDefinition, spotColorPropsFromDefinition, togglePropsFromDefinition } from "../exampleVariables";


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

// SineWaveLegend removed — colors are now shown inline via InlineSpotColor

// ── Demo 5: Scatter Plot with Trend Line ──────────────────────────────────────

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

// ── Demo 6: Line Drawing Playground ─────────────────────────────────────────

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
    <StackLayout key="layout-c2d-header-title" maxWidth="xl">
        <Block id="block-c2d-header-title" padding="sm">
            <EditableH1 id="h1-c2d-title" blockId="block-c2d-header-title">
                2D Cartesian Visualizations
            </EditableH1>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-c2d-header-desc" maxWidth="xl">
        <Block id="block-c2d-header-desc" padding="sm">
            <EditableParagraph id="para-c2d-desc" blockId="block-c2d-header-desc">
                Interactive 2D math plots powered by Cartesian2D — supporting
                function plots, parametric curves, movable points, dynamic
                geometry, and linked highlights.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // ── Demo 1: Basic Function Plots ─────────────────────────────────────────
    <StackLayout key="layout-c2d-basic-title" maxWidth="xl">
        <Block id="block-c2d-basic-title" padding="sm">
            <EditableH2 id="h2-c2d-basic" blockId="block-c2d-basic-title">
                Function Plots
            </EditableH2>
        </Block>
    </StackLayout>,

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
    <StackLayout key="layout-c2d-unit-title" maxWidth="xl">
        <Block id="block-c2d-unit-title" padding="sm">
            <EditableH2 id="h2-c2d-unit" blockId="block-c2d-unit-title">
                Unit Circle Explorer
            </EditableH2>
        </Block>
    </StackLayout>,

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
    <StackLayout key="layout-c2d-parametric-title" maxWidth="xl">
        <Block id="block-c2d-parametric-title" padding="sm">
            <EditableH2 id="h2-c2d-parametric" blockId="block-c2d-parametric-title">
                Parametric Curves
            </EditableH2>
        </Block>
    </StackLayout>,

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
    <StackLayout key="layout-c2d-explorer-title" maxWidth="xl">
        <Block id="block-c2d-explorer-title" padding="sm">
            <EditableH2 id="h2-c2d-explorer" blockId="block-c2d-explorer-title">
                Sine Wave Explorer
            </EditableH2>
        </Block>
    </StackLayout>,

    <SplitLayout key="layout-c2d-explorer-split" ratio="1:1" gap="lg">
        <div className="space-y-4">
            <Block id="block-c2d-explorer-intro" padding="sm">
                <EditableParagraph id="para-c2d-explorer-intro" blockId="block-c2d-explorer-intro">
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

    // ── Demo 5: Scatter Plot ──────────────────────────────────────────────────
    <StackLayout key="layout-c2d-scatter-title" maxWidth="xl">
        <Block id="block-c2d-scatter-title" padding="sm">
            <EditableH2 id="h2-c2d-scatter" blockId="block-c2d-scatter-title">
                Scatter Plot
            </EditableH2>
        </Block>
    </StackLayout>,

    <SplitLayout key="layout-c2d-scatter-split" ratio="1:1" gap="lg">
        <div className="space-y-4">
            <Block id="block-c2d-scatter-desc" padding="sm">
                <EditableParagraph id="para-c2d-scatter-desc" blockId="block-c2d-scatter-desc">
                    A scatter plot built from individual point items. Two
                    groups are shown:{" "}
                    <InlineSpotColor varName="scGroupA"
                        {...spotColorPropsFromDefinition(getExampleVariableInfo('scGroupA'))}
                    >
                        Group A
                    </InlineSpotColor>
                    {" "}(higher scores) and{" "}
                    <InlineSpotColor varName="scGroupB"
                        {...spotColorPropsFromDefinition(getExampleVariableInfo('scGroupB'))}
                    >
                        Group B
                    </InlineSpotColor>
                    {" "}(lower scores), with a{" "}
                    <InlineSpotColor varName="scTrend"
                        {...spotColorPropsFromDefinition(getExampleVariableInfo('scTrend'))}
                    >
                        trend line
                    </InlineSpotColor>
                    {" "}fitted by linear regression across both groups.
                    Drag any data point to reposition it — the trend line
                    recalculates in real time.
                </EditableParagraph>
            </Block>
            <Block id="block-c2d-scatter-equation" padding="sm">
                <LiveRegressionEquation />
            </Block>
        </div>
        <Block id="block-c2d-scatter-viz" padding="sm">
            <ScatterPlotViz />
        </Block>
    </SplitLayout>,

    // ── Demo 6: Line Drawing Playground ─────────────────────────────────────
    <StackLayout key="layout-c2d-drawing-title" maxWidth="xl">
        <Block id="block-c2d-drawing-title" padding="sm">
            <EditableH2 id="h2-c2d-drawing" blockId="block-c2d-drawing-title">
                Line Drawing Playground
            </EditableH2>
        </Block>
    </StackLayout>,

    <SplitLayout key="layout-c2d-drawing-split" ratio="1:1" gap="lg">
        <div className="space-y-4">
            <Block id="block-c2d-drawing-desc" padding="sm">
                <EditableParagraph id="para-c2d-drawing-desc" blockId="block-c2d-drawing-desc">
                    Click inside the graph to place points and draw connected{" "}
                    <InlineSpotColor
                        varName="ldLineColor"
                        {...spotColorPropsFromDefinition(getExampleVariableInfo('ldLineColor'))}
                    >
                        segments
                    </InlineSpotColor>
                    . Every point becomes a{" "}
                    <InlineSpotColor
                        varName="ldPointColor"
                        {...spotColorPropsFromDefinition(getExampleVariableInfo('ldPointColor'))}
                    >
                        vertex
                    </InlineSpotColor>
                    , and each segment shows its{" "}
                    <InlineSpotColor
                        varName="ldMidpointColor"
                        {...spotColorPropsFromDefinition(getExampleVariableInfo('ldMidpointColor'))}
                    >
                        midpoint
                    </InlineSpotColor>
                    .
                </EditableParagraph>
            </Block>

            <Block id="block-c2d-drawing-controls" padding="sm">
                <EditableParagraph id="para-c2d-drawing-controls" blockId="block-c2d-drawing-controls">
                    Snap to grid: {" "}
                    <InlineToggle
                        varName="ldSnapToGrid"
                        options={["on", "off"]}
                        {...togglePropsFromDefinition(getExampleVariableInfo('ldSnapToGrid'))}
                    />
                    . Draw mode: {" "}
                    <InlineToggle
                        varName="ldDrawMode"
                        options={["lines", "polygon"]}
                        {...togglePropsFromDefinition(getExampleVariableInfo('ldDrawMode'))}
                    />
                    . In polygon mode, a{" "}
                    <InlineSpotColor
                        varName="ldClosingColor"
                        {...spotColorPropsFromDefinition(getExampleVariableInfo('ldClosingColor'))}
                    >
                        dashed closing edge
                    </InlineSpotColor>
                    {" "}connects the last point back to the first.
                </EditableParagraph>
            </Block>

            <Block id="block-c2d-drawing-hint" padding="sm">
                <EditableParagraph id="para-c2d-drawing-hint" blockId="block-c2d-drawing-hint">
                    💡 Use the Clear button in the top-right of the graph to start a new sketch.
                </EditableParagraph>
            </Block>
        </div>

        <Block id="block-c2d-drawing-viz" padding="sm">
            <LineDrawingViz />
        </Block>
    </SplitLayout>,
];
