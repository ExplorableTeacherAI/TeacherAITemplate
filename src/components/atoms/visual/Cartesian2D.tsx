import { useEffect, useRef, Fragment } from "react";
import {
    Mafs,
    Coordinates,
    Plot,
    Point,
    Line,
    Circle,
    useMovablePoint,
} from "mafs";
import { useVar } from "@/stores/variableStore";

// ── Plot item type definitions ────────────────────────────────────────────────

/** Plot y = fn(x) over the visible domain */
export interface FunctionPlot {
    type: "function";
    /** The function to plot: receives x, returns y */
    fn: (x: number) => number;
    color?: string;
    /** Stroke weight (default 2) */
    weight?: number;
    /** Restrict plotting to this x domain */
    domain?: [number, number];
    /**
     * When this highlightId matches the active linked highlight variable
     * the plot is visually emphasized; others are dimmed.
     */
    highlightId?: string;
}

/** Parametric curve — [x, y] as a function of parameter t */
export interface ParametricPlot {
    type: "parametric";
    /** Returns [x, y] for a given t */
    xy: (t: number) => [number, number];
    /** Parameter range (default [0, 2π]) */
    tRange?: [number, number];
    color?: string;
    weight?: number;
    highlightId?: string;
}

/** A fixed (non-interactive) dot */
export interface StaticPoint {
    type: "point";
    x: number;
    y: number;
    color?: string;
    highlightId?: string;
}

/**
 * An arrow from `tail` to `tip`.
 * Rendered as a directed `Line.Segment` with an arrowhead indicator.
 */
export interface VectorPlot {
    type: "vector";
    /** Tail position (default [0, 0]) */
    tail?: [number, number];
    tip: [number, number];
    color?: string;
    weight?: number;
    highlightId?: string;
}

/** A straight line segment between two points */
export interface SegmentPlot {
    type: "segment";
    point1: [number, number];
    point2: [number, number];
    color?: string;
    weight?: number;
    style?: "solid" | "dashed";
    highlightId?: string;
}

/** A circle with a given center and radius */
export interface CirclePlot {
    type: "circle";
    center: [number, number];
    radius: number;
    color?: string;
    fillOpacity?: number;
    strokeStyle?: "solid" | "dashed";
    highlightId?: string;
}

export type PlotItem =
    | FunctionPlot
    | ParametricPlot
    | StaticPoint
    | VectorPlot
    | SegmentPlot
    | CirclePlot;

// ── Movable point configuration ───────────────────────────────────────────────

export interface MovablePointConfig {
    /** Starting position */
    initial: [number, number];
    color?: string;
    /**
     * Constrain dragging to a single axis or to a custom curve.
     * Pass `"horizontal"`, `"vertical"`, or a function
     * `(point) => [snappedX, snappedY]`.
     */
    constrain?:
        | "horizontal"
        | "vertical"
        | ((point: [number, number]) => [number, number]);
    /** Called on every frame the point moves */
    onChange?: (point: [number, number]) => void;
}

// ── Component props ───────────────────────────────────────────────────────────

export interface Cartesian2DProps {
    /** Canvas height in pixels (default 400) */
    height?: number;
    /**
     * Visible viewport bounds.
     * Default: `{ x: [-5, 5], y: [-5, 5] }`
     */
    viewBox?: { x: [number, number]; y: [number, number] };
    /**
     * Static plot items — functions, parametric curves, points,
     * vectors, segments, and circles.
     */
    plots?: PlotItem[];
    /**
     * Up to **4** movable, draggable points.
     * The component always calls four `useMovablePoint` hooks internally
     * to keep the React hook order stable; unused slots are hidden.
     */
    movablePoints?: MovablePointConfig[];
    /**
     * A callback that receives the **current positions** of every active
     * movable point and returns additional `PlotItem`s to draw.
     * Use this to show geometry that is derived from draggable points.
     *
     * @example
     * ```tsx
     * dynamicPlots={([p0]) => [
     *   { type: "circle", center: [0, 0], radius: Math.hypot(p0[0], p0[1]) },
     *   { type: "segment", point1: [0, 0], point2: p0 },
     * ]}
     * ```
     */
    dynamicPlots?: (points: [number, number][]) => PlotItem[];
    /** Show the Cartesian grid (default true) */
    showGrid?: boolean;
    /**
     * Number of minor grid subdivisions per major cell.
     * Pass `false` to show only major gridlines (default 1).
     */
    subdivisions?: number | false;
    /** Extra Tailwind / CSS class for the wrapper div */
    className?: string;
    /**
     * Variable name in the global store that holds the currently active
     * highlight ID.  When set, each plot item's `highlightId` is compared
     * against the store value to dim/emphasize elements.
     *
     * Use together with `InlineLinkedHighlight` components that share
     * the same `varName`.
     */
    highlightVarName?: string;
}

// ── Internal helpers ──────────────────────────────────────────────────────────

interface HighlightStyle {
    opacity: number;
    weight: number;
    isHighlighted: boolean;
}

/**
 * Compute opacity / weight adjustments driven by the active highlight ID.
 * This is a plain function (not a hook) so it is safe to call inside loops
 * and switch statements.
 */
function getHighlightStyle(
    highlightId: string | undefined,
    activeId: string | null | undefined,
    baseWeight = 2
): HighlightStyle {
    const isHighlighted = Boolean(highlightId && activeId === highlightId);
    const hasActiveHighlight = activeId !== null && activeId !== undefined;
    return {
        opacity: isHighlighted
            ? 1
            : hasActiveHighlight && highlightId
                ? 0.15
                : 0.9,
        weight: isHighlighted ? Math.max(baseWeight * 1.5, 4) : baseWeight,
        isHighlighted,
    };
}

/** Render a single PlotItem (plain function, NOT a hook component) */
function renderPlotItem(
    item: PlotItem,
    index: number,
    activeId: string | null | undefined
): React.ReactNode {
    const key = `cplot-${index}`;

    switch (item.type) {
        case "function": {
            const { opacity, weight } = getHighlightStyle(
                item.highlightId,
                activeId,
                item.weight ?? 2
            );
            return (
                <Plot.OfX
                    key={key}
                    y={item.fn}
                    color={item.color}
                    weight={weight}
                    opacity={opacity}
                    {...(item.domain ? { domain: item.domain } : {})}
                />
            );
        }

        case "parametric": {
            const { opacity, weight } = getHighlightStyle(
                item.highlightId,
                activeId,
                item.weight ?? 2
            );
            return (
                <Plot.Parametric
                    key={key}
                    xy={item.xy}
                    t={item.tRange ?? [0, 2 * Math.PI]}
                    color={item.color}
                    weight={weight}
                    opacity={opacity}
                />
            );
        }

        case "point": {
            const { opacity } = getHighlightStyle(item.highlightId, activeId);
            return (
                <Point
                    key={key}
                    x={item.x}
                    y={item.y}
                    color={item.color}
                    opacity={opacity}
                />
            );
        }

        case "vector": {
            // Rendered as a directed line segment; the arrowhead is a small
            // filled circle at the tip to keep the dependency list slim.
            const tail = item.tail ?? ([0, 0] as [number, number]);
            const { opacity, weight } = getHighlightStyle(
                item.highlightId,
                activeId,
                item.weight ?? 2
            );
            return (
                <Fragment key={key}>
                    <Line.Segment
                        point1={tail}
                        point2={item.tip}
                        color={item.color}
                        weight={weight}
                        opacity={opacity}
                    />
                    {/* Arrowhead indicator at tip */}
                    <Circle
                        center={item.tip}
                        radius={0.08}
                        color={item.color}
                        fillOpacity={opacity}
                    />
                </Fragment>
            );
        }

        case "segment": {
            const { opacity, weight } = getHighlightStyle(
                item.highlightId,
                activeId,
                item.weight ?? 2
            );
            return (
                <Line.Segment
                    key={key}
                    point1={item.point1}
                    point2={item.point2}
                    color={item.color}
                    weight={weight}
                    opacity={opacity}
                    style={item.style}
                />
            );
        }

        case "circle": {
            const { opacity } = getHighlightStyle(item.highlightId, activeId);
            return (
                <Circle
                    key={key}
                    center={item.center}
                    radius={item.radius}
                    color={item.color}
                    fillOpacity={(item.fillOpacity ?? 0.15) * opacity}
                    strokeStyle={item.strokeStyle}
                />
            );
        }
    }
}

// ── Main component ────────────────────────────────────────────────────────────

/**
 * **Cartesian2D** — A flexible 2D Cartesian visualization powered by
 * [Mafs](https://mafs.dev).
 *
 * ## Features
 * - **Function plots** — `y = f(x)` with optional domain restriction
 * - **Parametric curves** — `[x(t), y(t)]`
 * - **Static elements** — points, line segments, circles, vectors
 * - **Movable points** (up to 4) — draggable handles with `onChange` callbacks
 * - **Dynamic plots** — geometry derived from the current movable-point positions
 * - **Linked Highlight** — per-element `highlightId` dims/emphasizes items
 *   in sync with `InlineLinkedHighlight` nodes elsewhere on the page
 *   via the global variable store (`highlightVarName` prop)
 *
 * ## Basic usage
 * ```tsx
 * <Cartesian2D
 *   plots={[
 *     { type: "function", fn: Math.sin,  color: "#3b82f6", weight: 3 },
 *     { type: "function", fn: Math.cos,  color: "#f59e0b", weight: 2 },
 *     { type: "point",    x: Math.PI/2,  y: 1, color: "#ef4444" },
 *   ]}
 * />
 * ```
 *
 * ## Movable point + derived circle
 * ```tsx
 * <Cartesian2D
 *   viewBox={{ x: [-6, 6], y: [-6, 6] }}
 *   movablePoints={[{ initial: [3, 0], color: "#ef4444" }]}
 *   dynamicPlots={([p]) => [
 *     { type: "circle",  center: [0, 0], radius: Math.hypot(p[0], p[1]) },
 *     { type: "segment", point1: [0, 0], point2: p, style: "dashed" },
 *     { type: "vector",  tip: p, color: "#ef4444" },
 *   ]}
 * />
 * ```
 *
 * ## With InlineLinkedHighlight
 * ```tsx
 * <EditableParagraph id="para-trig" blockId="block-trig">
 *   The <InlineLinkedHighlight varName="myHighlight" highlightId="sin">
 *     sine curve
 *   </InlineLinkedHighlight> oscillates between −1 and 1.
 * </EditableParagraph>
 * <Cartesian2D
 *   highlightVarName="myHighlight"
 *   plots={[
 *     { type: "function", fn: Math.sin, color: "#3b82f6", highlightId: "sin" },
 *     { type: "function", fn: Math.cos, color: "#f59e0b", highlightId: "cos" },
 *   ]}
 * />
 * ```
 */
export function Cartesian2D({
    height = 400,
    viewBox = { x: [-5, 5], y: [-5, 5] },
    plots = [],
    movablePoints = [],
    dynamicPlots,
    showGrid = true,
    subdivisions = 1,
    className = "",
    highlightVarName,
}: Cartesian2DProps) {
    // Read the active highlight ID from the global variable store
    const activeId = useVar(highlightVarName ?? '', '') as string;
    // Treat empty string as "nothing highlighted"
    const effectiveActiveId = activeId || null;

    // Number of active movable points (capped at 4)
    const activeCount = Math.min(movablePoints.length, 4);

    // ── Always call exactly 4 movable-point hooks ──────────────────────────
    // React's rules of hooks require a stable call count per render, so we
    // pre-allocate four slots and only *display* the ones with a config entry.

    const mp0 = useMovablePoint(movablePoints[0]?.initial ?? [0, 0], {
        color: movablePoints[0]?.color,
        constrain: movablePoints[0]?.constrain,
    });
    const mp1 = useMovablePoint(movablePoints[1]?.initial ?? [0, 0], {
        color: movablePoints[1]?.color,
        constrain: movablePoints[1]?.constrain,
    });
    const mp2 = useMovablePoint(movablePoints[2]?.initial ?? [0, 0], {
        color: movablePoints[2]?.color,
        constrain: movablePoints[2]?.constrain,
    });
    const mp3 = useMovablePoint(movablePoints[3]?.initial ?? [0, 0], {
        color: movablePoints[3]?.color,
        constrain: movablePoints[3]?.constrain,
    });

    const allMPs = [mp0, mp1, mp2, mp3] as const;

    // ── Latest-ref pattern for onChange callbacks ──────────────────────────
    // Storing callbacks in refs avoids stale-closure bugs while preventing
    // the effects from re-firing whenever an inline function is re-created.
    const cb0 = useRef(movablePoints[0]?.onChange);
    const cb1 = useRef(movablePoints[1]?.onChange);
    const cb2 = useRef(movablePoints[2]?.onChange);
    const cb3 = useRef(movablePoints[3]?.onChange);

    cb0.current = movablePoints[0]?.onChange;
    cb1.current = movablePoints[1]?.onChange;
    cb2.current = movablePoints[2]?.onChange;
    cb3.current = movablePoints[3]?.onChange;

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { cb0.current?.(mp0.point as [number, number]); }, [mp0.point[0], mp0.point[1]]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { cb1.current?.(mp1.point as [number, number]); }, [mp1.point[0], mp1.point[1]]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { cb2.current?.(mp2.point as [number, number]); }, [mp2.point[0], mp2.point[1]]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { cb3.current?.(mp3.point as [number, number]); }, [mp3.point[0], mp3.point[1]]);

    // ── Compute derived plots from current movable-point positions ─────────
    const activePoints = allMPs
        .slice(0, activeCount)
        .map((mp) => mp.point as [number, number]);

    const dynItems = dynamicPlots ? dynamicPlots(activePoints) : [];
    const allPlots = [...plots, ...dynItems];

    // ── Render ─────────────────────────────────────────────────────────────
    return (
        <div className={`w-full overflow-hidden rounded-xl ${className}`}>
            <Mafs
                height={height}
                viewBox={{ x: viewBox.x, y: viewBox.y }}
            >
                {showGrid && (
                    <Coordinates.Cartesian subdivisions={subdivisions} />
                )}

                {/* Static + dynamic plot items */}
                {allPlots.map((item, i) => renderPlotItem(item, i, effectiveActiveId))}

                {/* Movable point handles — rendered in fixed order */}
                {activeCount > 0 && mp0.element}
                {activeCount > 1 && mp1.element}
                {activeCount > 2 && mp2.element}
                {activeCount > 3 && mp3.element}
            </Mafs>
        </div>
    );
}
