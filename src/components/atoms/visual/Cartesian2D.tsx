import { useEffect, useRef, useCallback } from "react";
import {
    Mafs,
    Coordinates,
    Plot,
    Point,
    Line,
    Circle,
    Vector,
    useMovablePoint,
} from "mafs";
import { useSetVar } from "@/stores";

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
}

/** A fixed (non-interactive) dot */
export interface StaticPoint {
    type: "point";
    x: number;
    y: number;
    color?: string;
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
}

/** A straight line segment between two points */
export interface SegmentPlot {
    type: "segment";
    point1: [number, number];
    point2: [number, number];
    color?: string;
    weight?: number;
    style?: "solid" | "dashed";
}

/** A circle with a given center and radius */
export interface CirclePlot {
    type: "circle";
    center: [number, number];
    radius: number;
    color?: string;
    fillOpacity?: number;
    strokeStyle?: "solid" | "dashed";
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
    /**
     * Externally-driven position. When this changes, the movable point
     * jumps to this position (via `setPoint`). Use together with `onChange`
     * for full bidirectional binding between the store and the visualization.
     */
    position?: [number, number];
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
     * Variable name in the global store to flip to `true` the first time the
     * student genuinely drags one of the movable points (the initial mount
     * sync is ignored).
     * Pair it with a component that watches the same variable.
     */
    interactionVar?: string;
}

// ── Internal helpers ──────────────────────────────────────────────────────────

/** Render a single PlotItem (plain function, NOT a hook component) */
function renderPlotItem(item: PlotItem, index: number): React.ReactNode {
    const key = `cplot-${index}`;

    switch (item.type) {
        case "function": {
            const opacity = 0.9;
            const weight = item.weight ?? 2;
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
            const opacity = 0.9;
            const weight = item.weight ?? 2;
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
            const opacity = 0.9;
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
            const tail = item.tail ?? ([0, 0] as [number, number]);
            const opacity = 0.9;
            const weight = item.weight ?? 2;
            return (
                <g key={key} opacity={opacity}>
                    <Vector
                        tail={tail}
                        tip={item.tip}
                        color={item.color}
                        weight={weight}
                    />
                </g>
            );
        }

        case "segment": {
            const opacity = 0.9;
            const weight = item.weight ?? 2;
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
            const opacity = 0.9;
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
    interactionVar,
}: Cartesian2DProps) {
    const setVar = useSetVar();
    const wrapperRef = useRef<HTMLDivElement>(null);

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

    // ── Position sync suppression ────────────────────────────────────────
    // When a movable point is dragged, its onChange updates the store, which
    // changes the `position` prop. We suppress the resulting sync-back to
    // avoid fighting with the drag.
    const syncSuppressed = useRef([false, false, false, false]);

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

    // ── First-interaction tracking ─────────────────────────────────────────
    // The movable-point effects below also fire once on mount (initial sync);
    // `mountedRef` lets us ignore that and flip `interactionVar` only on a
    // genuine drag. `interactedRef` makes it a one-shot write.
    const mountedRef = useRef(false);
    const interactedRef = useRef(false);
    const markInteraction = useCallback(() => {
        if (!mountedRef.current || !interactionVar || interactedRef.current) return;
        interactedRef.current = true;
        setVar(interactionVar, true);
    }, [interactionVar, setVar]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { syncSuppressed.current[0] = true; cb0.current?.(mp0.point as [number, number]); markInteraction(); }, [mp0.point[0], mp0.point[1]]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { syncSuppressed.current[1] = true; cb1.current?.(mp1.point as [number, number]); markInteraction(); }, [mp1.point[0], mp1.point[1]]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { syncSuppressed.current[2] = true; cb2.current?.(mp2.point as [number, number]); markInteraction(); }, [mp2.point[0], mp2.point[1]]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { syncSuppressed.current[3] = true; cb3.current?.(mp3.point as [number, number]); markInteraction(); }, [mp3.point[0], mp3.point[1]]);

    // Runs after the four mount-time syncs above, so any later point change is
    // a real interaction.
    useEffect(() => { mountedRef.current = true; }, []);

    // ── Sync external position → movable point ──────────────────────────
    // Only applies when position comes from an external source (e.g. text
    // typing) — NOT from the drag round-trip through the store.
    const extPos0x = movablePoints[0]?.position?.[0];
    const extPos0y = movablePoints[0]?.position?.[1];
    const extPos1x = movablePoints[1]?.position?.[0];
    const extPos1y = movablePoints[1]?.position?.[1];
    const extPos2x = movablePoints[2]?.position?.[0];
    const extPos2y = movablePoints[2]?.position?.[1];
    const extPos3x = movablePoints[3]?.position?.[0];
    const extPos3y = movablePoints[3]?.position?.[1];

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (syncSuppressed.current[0]) { syncSuppressed.current[0] = false; return; }
        if (extPos0x != null && extPos0y != null && activeCount > 0) mp0.setPoint([extPos0x, extPos0y]);
    }, [extPos0x, extPos0y]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (syncSuppressed.current[1]) { syncSuppressed.current[1] = false; return; }
        if (extPos1x != null && extPos1y != null && activeCount > 1) mp1.setPoint([extPos1x, extPos1y]);
    }, [extPos1x, extPos1y]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (syncSuppressed.current[2]) { syncSuppressed.current[2] = false; return; }
        if (extPos2x != null && extPos2y != null && activeCount > 2) mp2.setPoint([extPos2x, extPos2y]);
    }, [extPos2x, extPos2y]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (syncSuppressed.current[3]) { syncSuppressed.current[3] = false; return; }
        if (extPos3x != null && extPos3y != null && activeCount > 3) mp3.setPoint([extPos3x, extPos3y]);
    }, [extPos3x, extPos3y]);

    // ── Compute derived plots from current movable-point positions ─────────
    const activePoints = allMPs
        .slice(0, activeCount)
        .map((mp) => mp.point as [number, number]);

    const dynItems = dynamicPlots ? dynamicPlots(activePoints) : [];
    const allPlots = [...plots, ...dynItems];

    // ── Render ─────────────────────────────────────────────────────────────
    return (
        <div
            ref={wrapperRef}
            className={`w-full overflow-hidden rounded-xl ${className}`}
        >
            <Mafs
                height={height}
                viewBox={{ x: viewBox.x, y: viewBox.y }}
            >
                {showGrid && (
                    <Coordinates.Cartesian subdivisions={subdivisions} />
                )}

                {/* Static + dynamic plot items */}
                {allPlots.map((item, i) => renderPlotItem(item, i))}

                {/* Movable point handles — rendered in fixed order */}
                {activeCount > 0 && mp0.element}
                {activeCount > 1 && mp1.element}
                {activeCount > 2 && mp2.element}
                {activeCount > 3 && mp3.element}
            </Mafs>
        </div>
    );
}
