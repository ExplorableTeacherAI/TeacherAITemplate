import React, { useRef, useMemo, useState, useCallback, Suspense } from "react";
import { Canvas, useFrame, useThree, ThreeEvent } from "@react-three/fiber";
import {
    OrbitControls,
    PerspectiveCamera,
    Text,
    Grid,
    Line,
    Cylinder,
    Cone,
    Sphere,
    Environment,
} from "@react-three/drei";
import * as THREE from "three";
import { useVar } from "@/stores/variableStore";

// ── 3D Plot item type definitions ─────────────────────────────────────────────

/** Surface z = fn(x, y) over a rectangular domain */
export interface SurfacePlot3D {
    type: "surface";
    /** The function to plot: receives (x, y), returns z */
    fn: (x: number, y: number) => number;
    /** X domain (default [-5, 5]) */
    xDomain?: [number, number];
    /** Y domain (default [-5, 5]) */
    yDomain?: [number, number];
    /** Number of grid divisions along each axis (default 40) */
    resolution?: number;
    color?: string;
    /** Surface opacity (default 0.8) */
    opacity?: number;
    /** Show wireframe overlay (default false) */
    wireframe?: boolean;
    /** Color surfaces by height (default false) */
    colorByHeight?: boolean;
    /** Low color for height-based coloring (default blue) */
    lowColor?: string;
    /** High color for height-based coloring (default red) */
    highColor?: string;
    highlightId?: string;
}

/** 3D parametric curve — [x, y, z] as a function of parameter t */
export interface ParametricCurve3D {
    type: "parametric";
    /** Returns [x, y, z] for a given t */
    xyz: (t: number) => [number, number, number];
    /** Parameter range (default [0, 2π]) */
    tRange?: [number, number];
    /** Number of samples (default 200) */
    samples?: number;
    color?: string;
    /** Line width (default 2) */
    lineWidth?: number;
    highlightId?: string;
}

/** 3D parametric surface — [x, y, z] = fn(u, v) */
export interface ParametricSurface3D {
    type: "parametric-surface";
    /** Returns [x, y, z] for given (u, v) */
    fn: (u: number, v: number) => [number, number, number];
    /** U parameter range (default [0, 2π]) */
    uRange?: [number, number];
    /** V parameter range (default [0, π]) */
    vRange?: [number, number];
    /** Resolution per axis (default 30) */
    resolution?: number;
    color?: string;
    opacity?: number;
    wireframe?: boolean;
    highlightId?: string;
}

/** A fixed (non-interactive) 3D dot */
export interface StaticPoint3D {
    type: "point";
    position: [number, number, number];
    color?: string;
    /** Sphere radius (default 0.1) */
    size?: number;
    highlightId?: string;
}

/** A 3D arrow from tail to tip */
export interface VectorPlot3D {
    type: "vector";
    /** Tail position (default [0, 0, 0]) */
    tail?: [number, number, number];
    tip: [number, number, number];
    color?: string;
    /** Shaft radius (default 0.04) */
    shaftRadius?: number;
    highlightId?: string;
}

/** A 3D line segment between two points */
export interface SegmentPlot3D {
    type: "segment";
    point1: [number, number, number];
    point2: [number, number, number];
    color?: string;
    /** Line width (default 2) */
    lineWidth?: number;
    /** Dash pattern (default false) */
    dashed?: boolean;
    highlightId?: string;
}

/** A 3D sphere */
export interface SpherePlot3D {
    type: "sphere";
    center: [number, number, number];
    radius: number;
    color?: string;
    opacity?: number;
    wireframe?: boolean;
    highlightId?: string;
}

/** A plane defined by a point and normal vector */
export interface PlanePlot3D {
    type: "plane";
    /** A point the plane passes through (default [0,0,0]) */
    point?: [number, number, number];
    /** Normal vector of the plane */
    normal: [number, number, number];
    /** Side length of the rendered plane quad (default 10) */
    size?: number;
    color?: string;
    opacity?: number;
    highlightId?: string;
}

/** A polyline connecting multiple 3D points */
export interface PolylinePlot3D {
    type: "polyline";
    points: [number, number, number][];
    color?: string;
    lineWidth?: number;
    highlightId?: string;
}

export type PlotItem3D =
    | SurfacePlot3D
    | ParametricCurve3D
    | ParametricSurface3D
    | StaticPoint3D
    | VectorPlot3D
    | SegmentPlot3D
    | SpherePlot3D
    | PlanePlot3D
    | PolylinePlot3D;

// ── Draggable point configuration ─────────────────────────────────────────────

export interface DraggablePoint3DConfig {
    /** Starting position */
    initial: [number, number, number];
    color?: string;
    /** Sphere radius for the handle (default 0.15) */
    size?: number;
    /**
     * Constrain dragging to a plane or axis.
     * - `"xy"` / `"xz"` / `"yz"` — restrict to a plane
     * - `"x"` / `"y"` / `"z"` — restrict to an axis
     */
    constrain?: "xy" | "xz" | "yz" | "x" | "y" | "z";
    /** Called on every frame the point moves */
    onChange?: (point: [number, number, number]) => void;
}

// ── Component props ───────────────────────────────────────────────────────────

export interface Cartesian3DProps {
    /** Canvas height in pixels (default 500) */
    height?: number;
    /** Camera position (default [8, 6, 8]) */
    cameraPosition?: [number, number, number];
    /** Axis length (default 5) */
    axisLength?: number;
    /** Show x/y/z axes (default true) */
    showAxes?: boolean;
    /** Show grid on the XZ plane (default true) */
    showGrid?: boolean;
    /** Show axis labels X, Y, Z (default true) */
    showLabels?: boolean;
    /** Grid size (default 10) */
    gridSize?: number;
    /** Axis colors — [x, y, z] */
    axisColors?: [string, string, string];
    /** Static plot items */
    plots?: PlotItem3D[];
    /** Up to 4 draggable points */
    draggablePoints?: DraggablePoint3DConfig[];
    /**
     * A callback that receives current draggable-point positions
     * and returns additional PlotItem3Ds to draw.
     */
    dynamicPlots?: (points: [number, number, number][]) => PlotItem3D[];
    /** Extra CSS class for the wrapper div */
    className?: string;
    /** Auto-rotate the camera (default false) */
    autoRotate?: boolean;
    /** Auto-rotate speed (default 1) */
    autoRotateSpeed?: number;
    /** Background color (default "transparent") */
    backgroundColor?: string;
    /**
     * Variable name for linked highlight support.
     * When set, each plot item's highlightId is compared with the store value.
     */
    highlightVarName?: string;
}

// ── Highlight helpers ─────────────────────────────────────────────────────────

interface HighlightStyle3D {
    opacity: number;
    isHighlighted: boolean;
}

function getHighlightStyle3D(
    highlightId: string | undefined,
    activeId: string | null | undefined,
    baseOpacity = 0.8
): HighlightStyle3D {
    const isHighlighted = Boolean(highlightId && activeId === highlightId);
    const hasActive = activeId !== null && activeId !== undefined;
    return {
        opacity: isHighlighted
            ? Math.min(baseOpacity + 0.15, 1)
            : hasActive && highlightId
                ? baseOpacity * 0.2
                : baseOpacity,
        isHighlighted,
    };
}

// ── Internal 3D scene components ──────────────────────────────────────────────

/** Colored XYZ axes with arrow tips and optional labels */
function Axes3D({
    length,
    showLabels,
    colors,
}: {
    length: number;
    showLabels: boolean;
    colors: [string, string, string];
}) {
    const axisRadius = 0.03;
    const arrowHeight = length * 0.08;
    const shaftLen = length - arrowHeight;
    const shaftOffset = shaftLen / 2;
    const arrowOffset = shaftLen + arrowHeight / 2;

    const axes: {
        label: string;
        color: string;
        rotation: [number, number, number];
        labelPos: [number, number, number];
    }[] = [
        {
            label: "X",
            color: colors[0],
            rotation: [0, 0, -Math.PI / 2],
            labelPos: [length + 0.4, 0, 0],
        },
        {
            label: "Y",
            color: colors[1],
            rotation: [0, 0, 0],
            labelPos: [0, length + 0.4, 0],
        },
        {
            label: "Z",
            color: colors[2],
            rotation: [Math.PI / 2, 0, 0],
            labelPos: [0, 0, length + 0.4],
        },
    ];

    // Position helper: convert axis rotation + offset into world position
    function axisPosition(
        rotation: [number, number, number],
        dist: number
    ): [number, number, number] {
        // X axis: along +X
        if (rotation[2] === -Math.PI / 2) return [dist, 0, 0];
        // Y axis: along +Y
        if (rotation[2] === 0 && rotation[0] === 0) return [0, dist, 0];
        // Z axis: along +Z
        return [0, 0, dist];
    }

    return (
        <group>
            {/* Origin sphere */}
            <mesh>
                <sphereGeometry args={[axisRadius * 2.5, 16, 16]} />
                <meshStandardMaterial color="#6B7280" />
            </mesh>

            {axes.map((axis) => (
                <group key={axis.label}>
                    {/* Shaft */}
                    <group
                        rotation={axis.rotation}
                        position={axisPosition(axis.rotation, shaftOffset)}
                    >
                        <Cylinder args={[axisRadius, axisRadius, shaftLen, 12]}>
                            <meshStandardMaterial color={axis.color} />
                        </Cylinder>
                    </group>

                    {/* Arrowhead */}
                    <group
                        rotation={axis.rotation}
                        position={axisPosition(axis.rotation, arrowOffset)}
                    >
                        <Cone args={[axisRadius * 3, arrowHeight, 12]}>
                            <meshStandardMaterial color={axis.color} />
                        </Cone>
                    </group>

                    {/* Negative axis (thin dashed look) */}
                    <Line
                        points={[
                            [0, 0, 0],
                            axisPosition(axis.rotation, -length * 0.6),
                        ]}
                        color={axis.color}
                        lineWidth={1}
                        dashed
                        dashSize={0.15}
                        gapSize={0.1}
                    />

                    {/* Label */}
                    {showLabels && (
                        <Text
                            position={axis.labelPos}
                            fontSize={0.4}
                            color={axis.color}
                            anchorX="center"
                            anchorY="middle"
                        >
                            {axis.label}
                        </Text>
                    )}
                </group>
            ))}
        </group>
    );
}

/** Tick marks along each axis */
function AxisTicks({
    length,
    colors,
    step = 1,
}: {
    length: number;
    colors: [string, string, string];
    step?: number;
}) {
    const ticks: React.ReactNode[] = [];
    for (let i = step; i <= length; i += step) {
        // X ticks
        ticks.push(
            <Line
                key={`xt-${i}`}
                points={[
                    [i, 0, -0.08],
                    [i, 0, 0.08],
                ]}
                color={colors[0]}
                lineWidth={1}
            />
        );
        // Y ticks
        ticks.push(
            <Line
                key={`yt-${i}`}
                points={[
                    [-0.08, i, 0],
                    [0.08, i, 0],
                ]}
                color={colors[1]}
                lineWidth={1}
            />
        );
        // Z ticks
        ticks.push(
            <Line
                key={`zt-${i}`}
                points={[
                    [-0.08, 0, i],
                    [0.08, 0, i],
                ]}
                color={colors[2]}
                lineWidth={1}
            />
        );
    }
    return <group>{ticks}</group>;
}

// ── Surface mesh component ────────────────────────────────────────────────────

function SurfaceMesh({
    fn,
    xDomain = [-5, 5],
    yDomain = [-5, 5],
    resolution = 40,
    color = "#3B82F6",
    opacity = 0.8,
    wireframe = false,
    colorByHeight = false,
    lowColor = "#3B82F6",
    highColor = "#EF4444",
}: SurfacePlot3D & { opacity: number }) {
    const geometry = useMemo(() => {
        const geom = new THREE.BufferGeometry();
        const xMin = xDomain[0],
            xMax = xDomain[1];
        const yMin = yDomain[0],
            yMax = yDomain[1];
        const res = resolution;

        const vertices: number[] = [];
        const indices: number[] = [];
        const colors: number[] = [];

        // Sample z values for height coloring range
        let zMin = Infinity,
            zMax = -Infinity;
        const zValues: number[][] = [];

        for (let i = 0; i <= res; i++) {
            zValues[i] = [];
            const x = xMin + (i / res) * (xMax - xMin);
            for (let j = 0; j <= res; j++) {
                const y = yMin + (j / res) * (yMax - yMin);
                let z: number;
                try {
                    z = fn(x, y);
                    if (!isFinite(z)) z = 0;
                } catch {
                    z = 0;
                }
                zValues[i][j] = z;
                if (z < zMin) zMin = z;
                if (z > zMax) zMax = z;
            }
        }

        const zRange = zMax - zMin || 1;
        const lowCol = new THREE.Color(lowColor);
        const highCol = new THREE.Color(highColor);

        for (let i = 0; i <= res; i++) {
            const x = xMin + (i / res) * (xMax - xMin);
            for (let j = 0; j <= res; j++) {
                const y = yMin + (j / res) * (yMax - yMin);
                const z = zValues[i][j];
                vertices.push(x, z, y); // Y-up convention: Three.js Y = math Z

                if (colorByHeight) {
                    const t = (z - zMin) / zRange;
                    const c = lowCol.clone().lerp(highCol, t);
                    colors.push(c.r, c.g, c.b);
                }
            }
        }

        for (let i = 0; i < res; i++) {
            for (let j = 0; j < res; j++) {
                const a = i * (res + 1) + j;
                const b = a + 1;
                const c = (i + 1) * (res + 1) + j;
                const d = c + 1;
                indices.push(a, b, d);
                indices.push(a, d, c);
            }
        }

        geom.setAttribute(
            "position",
            new THREE.Float32BufferAttribute(vertices, 3)
        );
        geom.setIndex(indices);
        geom.computeVertexNormals();

        if (colorByHeight && colors.length > 0) {
            geom.setAttribute(
                "color",
                new THREE.Float32BufferAttribute(colors, 3)
            );
        }

        return geom;
    }, [fn, xDomain, yDomain, resolution, colorByHeight, lowColor, highColor]);

    return (
        <mesh geometry={geometry}>
            <meshStandardMaterial
                color={colorByHeight ? undefined : color}
                vertexColors={colorByHeight}
                transparent
                opacity={opacity}
                side={THREE.DoubleSide}
                wireframe={wireframe}
                roughness={0.6}
                metalness={0.1}
            />
        </mesh>
    );
}

// ── Parametric surface mesh component ─────────────────────────────────────────

function ParametricSurfaceMesh({
    fn,
    uRange = [0, 2 * Math.PI],
    vRange = [0, Math.PI],
    resolution = 30,
    color = "#8B5CF6",
    opacity = 0.8,
    wireframe = false,
}: ParametricSurface3D & { opacity: number }) {
    const geometry = useMemo(() => {
        const geom = new THREE.BufferGeometry();
        const res = resolution;
        const vertices: number[] = [];
        const indices: number[] = [];

        for (let i = 0; i <= res; i++) {
            const u = uRange[0] + (i / res) * (uRange[1] - uRange[0]);
            for (let j = 0; j <= res; j++) {
                const v = vRange[0] + (j / res) * (vRange[1] - vRange[0]);
                let [x, y, z] = fn(u, v);
                if (!isFinite(x)) x = 0;
                if (!isFinite(y)) y = 0;
                if (!isFinite(z)) z = 0;
                vertices.push(x, y, z);
            }
        }

        for (let i = 0; i < res; i++) {
            for (let j = 0; j < res; j++) {
                const a = i * (res + 1) + j;
                const b = a + 1;
                const c = (i + 1) * (res + 1) + j;
                const d = c + 1;
                indices.push(a, b, d);
                indices.push(a, d, c);
            }
        }

        geom.setAttribute(
            "position",
            new THREE.Float32BufferAttribute(vertices, 3)
        );
        geom.setIndex(indices);
        geom.computeVertexNormals();

        return geom;
    }, [fn, uRange, vRange, resolution]);

    return (
        <mesh geometry={geometry}>
            <meshStandardMaterial
                color={color}
                transparent
                opacity={opacity}
                side={THREE.DoubleSide}
                wireframe={wireframe}
                roughness={0.6}
                metalness={0.1}
            />
        </mesh>
    );
}

// ── 3D Vector (arrow) component ───────────────────────────────────────────────

function Vector3D({
    tail = [0, 0, 0],
    tip,
    color = "#EF4444",
    shaftRadius = 0.04,
    opacity = 1,
}: {
    tail?: [number, number, number];
    tip: [number, number, number];
    color?: string;
    shaftRadius?: number;
    opacity?: number;
}) {
    const direction = useMemo(() => {
        const dir = new THREE.Vector3(
            tip[0] - tail[0],
            tip[1] - tail[1],
            tip[2] - tail[2]
        );
        return dir;
    }, [tail, tip]);

    const length = direction.length();
    if (length < 0.001) return null;

    const arrowHeadLength = Math.min(length * 0.2, 0.3);
    const shaftLength = length - arrowHeadLength;

    const midpoint = useMemo(
        () =>
            new THREE.Vector3(
                tail[0] + (direction.x / length) * (shaftLength / 2),
                tail[1] + (direction.y / length) * (shaftLength / 2),
                tail[2] + (direction.z / length) * (shaftLength / 2)
            ),
        [tail, direction, length, shaftLength]
    );

    const arrowBase = useMemo(
        () =>
            new THREE.Vector3(
                tail[0] + (direction.x / length) * (shaftLength + arrowHeadLength / 2),
                tail[1] + (direction.y / length) * (shaftLength + arrowHeadLength / 2),
                tail[2] + (direction.z / length) * (shaftLength + arrowHeadLength / 2)
            ),
        [tail, direction, length, shaftLength, arrowHeadLength]
    );

    // Quaternion to rotate cylinder from Y-up to the vector direction
    const quaternion = useMemo(() => {
        const q = new THREE.Quaternion();
        const up = new THREE.Vector3(0, 1, 0);
        const normalized = direction.clone().normalize();
        q.setFromUnitVectors(up, normalized);
        return q;
    }, [direction]);

    return (
        <group>
            {/* Shaft */}
            <group position={midpoint} quaternion={quaternion}>
                <Cylinder args={[shaftRadius, shaftRadius, shaftLength, 8]}>
                    <meshStandardMaterial
                        color={color}
                        transparent
                        opacity={opacity}
                    />
                </Cylinder>
            </group>
            {/* Arrowhead */}
            <group position={arrowBase} quaternion={quaternion}>
                <Cone args={[shaftRadius * 3, arrowHeadLength, 8]}>
                    <meshStandardMaterial
                        color={color}
                        transparent
                        opacity={opacity}
                    />
                </Cone>
            </group>
        </group>
    );
}

// ── Draggable point component ─────────────────────────────────────────────────

function DraggablePoint3D({
    config,
    onPositionChange,
}: {
    config: DraggablePoint3DConfig;
    onPositionChange: (pos: [number, number, number]) => void;
}) {
    const { camera, raycaster, gl } = useThree();
    const meshRef = useRef<THREE.Mesh>(null!);
    const [isDragging, setIsDragging] = useState(false);
    const [hovered, setHovered] = useState(false);
    const dragPlane = useRef(new THREE.Plane());
    const offset = useRef(new THREE.Vector3());

    const {
        color = "#F59E0B",
        size = 0.15,
        constrain,
    } = config;

    const handlePointerDown = useCallback(
        (e: ThreeEvent<PointerEvent>) => {
            e.stopPropagation();
            setIsDragging(true);
            (gl.domElement as HTMLElement).style.cursor = "grabbing";

            // Setup the drag plane based on constraint or camera
            const pos = meshRef.current.position.clone();
            if (constrain === "xy") {
                dragPlane.current.setFromNormalAndCoplanarPoint(
                    new THREE.Vector3(0, 0, 1),
                    pos
                );
            } else if (constrain === "xz") {
                dragPlane.current.setFromNormalAndCoplanarPoint(
                    new THREE.Vector3(0, 1, 0),
                    pos
                );
            } else if (constrain === "yz") {
                dragPlane.current.setFromNormalAndCoplanarPoint(
                    new THREE.Vector3(1, 0, 0),
                    pos
                );
            } else {
                // Face camera
                dragPlane.current.setFromNormalAndCoplanarPoint(
                    camera.getWorldDirection(new THREE.Vector3()).negate(),
                    pos
                );
            }

            // Calculate offset between intersection and mesh position
            const intersection = new THREE.Vector3();
            raycaster.ray.intersectPlane(dragPlane.current, intersection);
            offset.current.copy(pos).sub(intersection);
        },
        [camera, raycaster, gl, constrain]
    );

    const handlePointerUp = useCallback(() => {
        setIsDragging(false);
        (gl.domElement as HTMLElement).style.cursor = hovered ? "grab" : "auto";
    }, [gl, hovered]);

    useFrame(() => {
        if (!isDragging) return;

        const intersection = new THREE.Vector3();
        if (!raycaster.ray.intersectPlane(dragPlane.current, intersection))
            return;

        const newPos = intersection.add(offset.current);
        const currentPos = meshRef.current.position;

        if (constrain === "x") {
            currentPos.set(newPos.x, currentPos.y, currentPos.z);
        } else if (constrain === "y") {
            currentPos.set(currentPos.x, newPos.y, currentPos.z);
        } else if (constrain === "z") {
            currentPos.set(currentPos.x, currentPos.y, newPos.z);
        } else {
            currentPos.copy(newPos);
        }

        onPositionChange([currentPos.x, currentPos.y, currentPos.z]);
    });

    // Attach global pointer events for dragging
    React.useEffect(() => {
        if (!isDragging) return;
        const domEl = gl.domElement as HTMLElement;
        const onUp = () => {
            setIsDragging(false);
            domEl.style.cursor = "auto";
        };
        window.addEventListener("pointerup", onUp);
        return () => window.removeEventListener("pointerup", onUp);
    }, [isDragging, gl]);

    return (
        <Sphere
            ref={meshRef}
            args={[size, 16, 16]}
            position={config.initial}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerOver={(e) => {
                e.stopPropagation();
                setHovered(true);
                (gl.domElement as HTMLElement).style.cursor = "grab";
            }}
            onPointerOut={() => {
                setHovered(false);
                if (!isDragging)
                    (gl.domElement as HTMLElement).style.cursor = "auto";
            }}
        >
            <meshStandardMaterial
                color={hovered || isDragging ? "#FBBF24" : color}
                emissive={hovered || isDragging ? color : "#000000"}
                emissiveIntensity={hovered || isDragging ? 0.3 : 0}
                roughness={0.3}
                metalness={0.5}
            />
        </Sphere>
    );
}

// ── Plot item renderer ────────────────────────────────────────────────────────

function RenderPlotItem({
    item,
    activeId,
}: {
    item: PlotItem3D;
    activeId: string | null | undefined;
}) {
    switch (item.type) {
        case "surface": {
            const { opacity } = getHighlightStyle3D(
                item.highlightId,
                activeId,
                item.opacity ?? 0.8
            );
            return <SurfaceMesh {...item} opacity={opacity} />;
        }

        case "parametric": {
            const { opacity } = getHighlightStyle3D(
                item.highlightId,
                activeId,
                1
            );
            const samples = item.samples ?? 200;
            const tRange = item.tRange ?? [0, 2 * Math.PI];
            const points: [number, number, number][] = [];
            for (let i = 0; i <= samples; i++) {
                const t = tRange[0] + (i / samples) * (tRange[1] - tRange[0]);
                let [x, y, z] = item.xyz(t);
                if (!isFinite(x)) x = 0;
                if (!isFinite(y)) y = 0;
                if (!isFinite(z)) z = 0;
                points.push([x, y, z]);
            }
            return (
                <Line
                    points={points}
                    color={item.color ?? "#3B82F6"}
                    lineWidth={item.lineWidth ?? 2}
                    transparent
                    opacity={opacity}
                />
            );
        }

        case "parametric-surface": {
            const { opacity } = getHighlightStyle3D(
                item.highlightId,
                activeId,
                item.opacity ?? 0.8
            );
            return <ParametricSurfaceMesh {...item} opacity={opacity} />;
        }

        case "point": {
            const { opacity } = getHighlightStyle3D(
                item.highlightId,
                activeId,
                1
            );
            return (
                <Sphere
                    args={[item.size ?? 0.1, 16, 16]}
                    position={item.position}
                >
                    <meshStandardMaterial
                        color={item.color ?? "#EF4444"}
                        transparent
                        opacity={opacity}
                        roughness={0.3}
                        metalness={0.5}
                    />
                </Sphere>
            );
        }

        case "vector": {
            const { opacity } = getHighlightStyle3D(
                item.highlightId,
                activeId,
                1
            );
            return (
                <Vector3D
                    tail={item.tail}
                    tip={item.tip}
                    color={item.color ?? "#EF4444"}
                    shaftRadius={item.shaftRadius}
                    opacity={opacity}
                />
            );
        }

        case "segment": {
            const { opacity } = getHighlightStyle3D(
                item.highlightId,
                activeId,
                1
            );
            return (
                <Line
                    points={[item.point1, item.point2]}
                    color={item.color ?? "#6B7280"}
                    lineWidth={item.lineWidth ?? 2}
                    dashed={item.dashed}
                    dashSize={0.15}
                    gapSize={0.1}
                    transparent
                    opacity={opacity}
                />
            );
        }

        case "sphere": {
            const { opacity } = getHighlightStyle3D(
                item.highlightId,
                activeId,
                item.opacity ?? 0.4
            );
            return (
                <Sphere args={[item.radius, 32, 32]} position={item.center}>
                    <meshStandardMaterial
                        color={item.color ?? "#8B5CF6"}
                        transparent
                        opacity={opacity}
                        wireframe={item.wireframe}
                        side={THREE.DoubleSide}
                        roughness={0.5}
                        metalness={0.2}
                    />
                </Sphere>
            );
        }

        case "plane": {
            const { opacity } = getHighlightStyle3D(
                item.highlightId,
                activeId,
                item.opacity ?? 0.3
            );
            const point = item.point ?? [0, 0, 0];
            const normal = new THREE.Vector3(...item.normal).normalize();
            const quaternion = new THREE.Quaternion().setFromUnitVectors(
                new THREE.Vector3(0, 0, 1),
                normal
            );
            const planeSize = item.size ?? 10;
            return (
                <mesh
                    position={point}
                    quaternion={quaternion}
                >
                    <planeGeometry args={[planeSize, planeSize]} />
                    <meshStandardMaterial
                        color={item.color ?? "#10B981"}
                        transparent
                        opacity={opacity}
                        side={THREE.DoubleSide}
                    />
                </mesh>
            );
        }

        case "polyline": {
            const { opacity } = getHighlightStyle3D(
                item.highlightId,
                activeId,
                1
            );
            return (
                <Line
                    points={item.points}
                    color={item.color ?? "#F59E0B"}
                    lineWidth={item.lineWidth ?? 2}
                    transparent
                    opacity={opacity}
                />
            );
        }
    }
}

// ── Scene wrapper ─────────────────────────────────────────────────────────────

function Cartesian3DScene({
    axisLength,
    showAxes,
    showGrid,
    showLabels,
    gridSize,
    axisColors,
    plots,
    draggablePoints,
    dynamicPlots,
    activeId,
}: {
    axisLength: number;
    showAxes: boolean;
    showGrid: boolean;
    showLabels: boolean;
    gridSize: number;
    axisColors: [string, string, string];
    plots: PlotItem3D[];
    draggablePoints: DraggablePoint3DConfig[];
    dynamicPlots?: (points: [number, number, number][]) => PlotItem3D[];
    activeId: string | null | undefined;
}) {
    // Track current positions of draggable points
    const positionsRef = useRef<[number, number, number][]>(
        draggablePoints.map((dp) => [...dp.initial])
    );
    const [, forceUpdate] = useState(0);

    const handlePositionChange = useCallback(
        (index: number, pos: [number, number, number]) => {
            positionsRef.current[index] = pos;
            draggablePoints[index]?.onChange?.(pos);
            // Trigger re-render for dynamic plots
            if (dynamicPlots) forceUpdate((n) => n + 1);
        },
        [draggablePoints, dynamicPlots]
    );

    const dynItems = dynamicPlots ? dynamicPlots(positionsRef.current) : [];
    const allPlots = [...plots, ...dynItems];

    return (
        <>
            {/* Lighting */}
            <ambientLight intensity={0.6} />
            <directionalLight position={[10, 10, 5]} intensity={0.8} />
            <directionalLight position={[-5, 5, -5]} intensity={0.3} />

            {/* Grid */}
            {showGrid && (
                <Grid
                    position={[0, -0.01, 0]}
                    args={[gridSize, gridSize]}
                    cellSize={1}
                    sectionSize={5}
                    sectionColor="#9ca3af"
                    cellColor="#e5e7eb"
                    fadeDistance={25}
                    infiniteGrid
                />
            )}

            {/* Axes */}
            {showAxes && (
                <>
                    <Axes3D
                        length={axisLength}
                        showLabels={showLabels}
                        colors={axisColors}
                    />
                    <AxisTicks length={axisLength} colors={axisColors} />
                </>
            )}

            {/* Plot items */}
            {allPlots.map((item, i) => (
                <RenderPlotItem key={`plot-${i}`} item={item} activeId={activeId} />
            ))}

            {/* Draggable points */}
            {draggablePoints.map((dp, i) => (
                <DraggablePoint3D
                    key={`drag-${i}`}
                    config={dp}
                    onPositionChange={(pos) => handlePositionChange(i, pos)}
                />
            ))}
        </>
    );
}

// ── Main component ────────────────────────────────────────────────────────────

/**
 * **Cartesian3D** — A flexible 3D Cartesian visualization powered by
 * React Three Fiber + drei.
 *
 * ## Features
 * - **Surface plots** — `z = f(x, y)` with optional height-based coloring
 * - **Parametric curves** — `[x(t), y(t), z(t)]`
 * - **Parametric surfaces** — `[x(u,v), y(u,v), z(u,v)]`
 * - **Static elements** — points, line segments, spheres, vectors, planes
 * - **Polylines** — connected sequences of 3D points
 * - **Draggable points** — interactive handles with constraint support
 * - **Dynamic plots** — geometry derived from draggable-point positions
 * - **Linked Highlight** — per-element `highlightId` for dim/emphasize behavior
 *
 * ## Basic usage
 * ```tsx
 * <Cartesian3D
 *   plots={[
 *     {
 *       type: "surface",
 *       fn: (x, y) => Math.sin(Math.sqrt(x*x + y*y)),
 *       colorByHeight: true,
 *     },
 *   ]}
 * />
 * ```
 *
 * ## Vectors and points
 * ```tsx
 * <Cartesian3D
 *   plots={[
 *     { type: "vector", tip: [3, 2, 1], color: "#EF4444" },
 *     { type: "vector", tip: [1, 3, 2], color: "#3B82F6" },
 *     { type: "point", position: [3, 2, 1], color: "#EF4444" },
 *   ]}
 * />
 * ```
 *
 * ## Parametric helix
 * ```tsx
 * <Cartesian3D
 *   plots={[
 *     {
 *       type: "parametric",
 *       xyz: (t) => [Math.cos(t), t / (2 * Math.PI), Math.sin(t)],
 *       tRange: [0, 6 * Math.PI],
 *       color: "#8B5CF6",
 *       lineWidth: 3,
 *     },
 *   ]}
 * />
 * ```
 *
 * ## Sphere with parametric surface
 * ```tsx
 * <Cartesian3D
 *   plots={[
 *     {
 *       type: "parametric-surface",
 *       fn: (u, v) => [
 *         2 * Math.sin(v) * Math.cos(u),
 *         2 * Math.cos(v),
 *         2 * Math.sin(v) * Math.sin(u),
 *       ],
 *       color: "#F59E0B",
 *       opacity: 0.6,
 *     },
 *   ]}
 * />
 * ```
 */
export function Cartesian3D({
    height = 500,
    cameraPosition = [8, 6, 8],
    axisLength = 5,
    showAxes = true,
    showGrid = true,
    showLabels = true,
    gridSize = 10,
    axisColors = ["#EF4444", "#10B981", "#3B82F6"],
    plots = [],
    draggablePoints = [],
    dynamicPlots,
    className = "",
    autoRotate = false,
    autoRotateSpeed = 1,
    backgroundColor = "transparent",
    highlightVarName,
}: Cartesian3DProps) {
    // Read the active highlight ID from the global variable store
    const activeId = useVar(highlightVarName ?? "", "") as string;
    const effectiveActiveId = activeId || null;

    return (
        <div
            className={`w-full overflow-hidden rounded-xl ${className}`}
            style={{ height, background: backgroundColor }}
        >
            <Canvas dpr={[1, 2]} style={{ background: backgroundColor }}>
                <PerspectiveCamera
                    makeDefault
                    position={cameraPosition}
                    fov={50}
                />
                <Suspense fallback={null}>
                    <Cartesian3DScene
                        axisLength={axisLength}
                        showAxes={showAxes}
                        showGrid={showGrid}
                        showLabels={showLabels}
                        gridSize={gridSize}
                        axisColors={axisColors}
                        plots={plots}
                        draggablePoints={draggablePoints}
                        dynamicPlots={dynamicPlots}
                        activeId={effectiveActiveId}
                    />
                </Suspense>
                <OrbitControls
                    makeDefault
                    autoRotate={autoRotate}
                    autoRotateSpeed={autoRotateSpeed}
                    enableDamping
                    dampingFactor={0.1}
                />
            </Canvas>
        </div>
    );
}
