import type { ReactNode, SVGProps } from "react";

export const SCENE_CARD_WIDTH = 232;
export const SCENE_CARD_HEIGHT = 150;

export const SCENE_COLORS = {
    manipulated: "#f59e0b",
    responds: "#14b8a6",
    primaryInk: "#334155",
    secondaryInk: "#64748b",
    context: "#cbd5e1",
    faint: "#e2e8f0",
    surface: "#ffffff",
} as const;

type SceneStageProps = Omit<SVGProps<SVGSVGElement>, "viewBox"> & {
    children: ReactNode;
    title?: string;
};

/** Responsive SVG stage sized to the visual-map card's real 232x150 viewport. */
export function SceneStage({ children, title, style, ...props }: SceneStageProps) {
    return (
        <svg
            viewBox={`0 0 ${SCENE_CARD_WIDTH} ${SCENE_CARD_HEIGHT}`}
            role={title ? "img" : undefined}
            aria-label={title}
            preserveAspectRatio="xMidYMid meet"
            style={{
                display: "block",
                width: "100%",
                height: "auto",
                overflow: "hidden",
                touchAction: "none",
                ...style,
            }}
            {...props}
        >
            {children}
        </svg>
    );
}

type DragCueProps = {
    x: number;
    y: number;
    axis?: "x" | "y";
    span?: number;
    color?: string;
};

/** Compact bidirectional cue; omit after first interaction when appropriate. */
export function DragCue({
    x,
    y,
    axis = "x",
    span = 13,
    color = SCENE_COLORS.manipulated,
}: DragCueProps) {
    const horizontal = axis === "x";
    const x1 = horizontal ? x - span : x;
    const y1 = horizontal ? y : y - span;
    const x2 = horizontal ? x + span : x;
    const y2 = horizontal ? y : y + span;
    const arrow = 3;
    return (
        <g aria-hidden="true" opacity="0.9" pointerEvents="none">
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="1.5" />
            {horizontal ? (
                <>
                    <path d={`M ${x1 + arrow} ${y1 - arrow} L ${x1} ${y1} L ${x1 + arrow} ${y1 + arrow}`} fill="none" stroke={color} strokeWidth="1.5" />
                    <path d={`M ${x2 - arrow} ${y2 - arrow} L ${x2} ${y2} L ${x2 - arrow} ${y2 + arrow}`} fill="none" stroke={color} strokeWidth="1.5" />
                </>
            ) : (
                <>
                    <path d={`M ${x1 - arrow} ${y1 + arrow} L ${x1} ${y1} L ${x1 + arrow} ${y1 + arrow}`} fill="none" stroke={color} strokeWidth="1.5" />
                    <path d={`M ${x2 - arrow} ${y2 - arrow} L ${x2} ${y2} L ${x2 + arrow} ${y2 - arrow}`} fill="none" stroke={color} strokeWidth="1.5" />
                </>
            )}
        </g>
    );
}

type ConstrainedHandleProps = Omit<SVGProps<SVGGElement>, "transform"> & {
    x: number;
    y: number;
    axis?: "x" | "y";
    active?: boolean;
    showCue?: boolean;
    label: string;
};

/** A consistent 30px pointer/touch target with the map's amber input encoding. */
export function ConstrainedHandle({
    x,
    y,
    axis = "x",
    active = false,
    showCue = false,
    label,
    style,
    ...props
}: ConstrainedHandleProps) {
    return (
        <g
            transform={`translate(${x} ${y})`}
            role="slider"
            aria-label={label}
            tabIndex={0}
            style={{ cursor: axis === "x" ? "ew-resize" : "ns-resize", outline: "none", ...style }}
            {...props}
        >
            <circle r="15" fill="transparent" />
            <circle
                r={active ? 8 : 7}
                fill={SCENE_COLORS.manipulated}
                stroke={SCENE_COLORS.surface}
                strokeWidth="2"
            />
            <circle r={active ? 11 : 10} fill="none" stroke={SCENE_COLORS.manipulated} strokeWidth="1" opacity={active ? 0.55 : 0.3} />
            {showCue && <DragCue x={0} y={axis === "x" ? 18 : 0} axis={axis} span={10} />}
        </g>
    );
}

type VectorArrowProps = {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    color?: string;
    width?: number;
    opacity?: number;
};

/** SVG arrow without marker ids, so several generated scenes cannot collide. */
export function VectorArrow({
    x1,
    y1,
    x2,
    y2,
    color = SCENE_COLORS.responds,
    width = 3,
    opacity = 1,
}: VectorArrowProps) {
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const headLength = 8;
    const wing = Math.PI / 7;
    const leftX = x2 - headLength * Math.cos(angle - wing);
    const leftY = y2 - headLength * Math.sin(angle - wing);
    const rightX = x2 - headLength * Math.cos(angle + wing);
    const rightY = y2 - headLength * Math.sin(angle + wing);
    return (
        <g opacity={opacity} pointerEvents="none">
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={width} strokeLinecap="round" />
            <path d={`M ${leftX} ${leftY} L ${x2} ${y2} L ${rightX} ${rightY}`} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" />
        </g>
    );
}

type AxisGridProps = {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    xStep?: number;
    yStep?: number;
    showAxes?: boolean;
};

/** Muted context grid with bounded line count for compact scenes. */
export function AxisGrid({
    x = 12,
    y = 10,
    width = 208,
    height = 126,
    xStep = 26,
    yStep = 21,
    showAxes = true,
}: AxisGridProps) {
    const verticals = Array.from({ length: Math.floor(width / xStep) + 1 }, (_, index) => x + index * xStep);
    const horizontals = Array.from({ length: Math.floor(height / yStep) + 1 }, (_, index) => y + index * yStep);
    return (
        <g aria-hidden="true" pointerEvents="none">
            {verticals.map((lineX) => <line key={`x-${lineX}`} x1={lineX} y1={y} x2={lineX} y2={y + height} stroke={SCENE_COLORS.faint} strokeWidth="1" />)}
            {horizontals.map((lineY) => <line key={`y-${lineY}`} x1={x} y1={lineY} x2={x + width} y2={lineY} stroke={SCENE_COLORS.faint} strokeWidth="1" />)}
            {showAxes && (
                <>
                    <line x1={x} y1={y + height} x2={x + width} y2={y + height} stroke={SCENE_COLORS.context} strokeWidth="1.5" />
                    <line x1={x} y1={y} x2={x} y2={y + height} stroke={SCENE_COLORS.context} strokeWidth="1.5" />
                </>
            )}
        </g>
    );
}

type MeasurementBracketProps = {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    color?: string;
};

export function MeasurementBracket({
    x1,
    y1,
    x2,
    y2,
    color = SCENE_COLORS.responds,
}: MeasurementBracketProps) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.hypot(dx, dy) || 1;
    const nx = (-dy / length) * 4;
    const ny = (dx / length) * 4;
    return (
        <g pointerEvents="none" stroke={color} strokeWidth="1.5" strokeLinecap="round">
            <line x1={x1} y1={y1} x2={x2} y2={y2} />
            <line x1={x1 - nx} y1={y1 - ny} x2={x1 + nx} y2={y1 + ny} />
            <line x1={x2 - nx} y1={y2 - ny} x2={x2 + nx} y2={y2 + ny} />
        </g>
    );
}

type DerivedReadoutProps = {
    x: number;
    y: number;
    label?: string;
    value: string | number;
    unit?: string;
    color?: string;
};

export function DerivedReadout({
    x,
    y,
    label,
    value,
    unit = "",
    color = SCENE_COLORS.responds,
}: DerivedReadoutProps) {
    const text = `${label ? `${label} ` : ""}${value}${unit}`;
    const width = Math.max(34, text.length * 6.5 + 12);
    return (
        <g transform={`translate(${x} ${y})`} pointerEvents="none">
            <rect x={-width / 2} y="-11" width={width} height="22" rx="6" fill={SCENE_COLORS.surface} stroke={color} strokeWidth="1.25" />
            <text x="0" y="4" textAnchor="middle" fill={SCENE_COLORS.primaryInk} fontSize="11" fontWeight="600" style={{ fontVariantNumeric: "tabular-nums" }}>
                {text}
            </text>
        </g>
    );
}

type TransformationGhostProps = {
    children: ReactNode;
    opacity?: number;
};

export function TransformationGhost({ children, opacity = 0.22 }: TransformationGhostProps) {
    return (
        <g aria-hidden="true" opacity={opacity} pointerEvents="none" strokeDasharray="3 3">
            {children}
        </g>
    );
}
