import React, { useMemo } from "react";
import { useVar, useSetVar } from "@/stores/variableStore";

export type GeometricVariant = "circle" | "triangle" | "polygon";

export interface GeometricDiagramProps {
    variant?: GeometricVariant;
    radius?: number;
    angleDegrees?: number;
    sides?: number;
    width?: number;
    height?: number;
    showLabels?: boolean;
    showGuides?: boolean;
    className?: string;
    strokeColor?: string;
    fillColor?: string;
    accentColor?: string;
    highlightVarName?: string;
}

const baseTheme = {
    stroke: "#6366F1",
    fill: "rgba(99, 102, 241, 0.12)",
    accent: "#EC4899",
    guide: "#94a3b8",
    text: "#334155",
    point: "#0f172a",
    activeStroke: "#F59E0B",
    activeFill: "rgba(245, 158, 11, 0.18)",
};

function polarToCartesian(cx: number, cy: number, radius: number, angleDeg: number) {
    const rad = (angleDeg * Math.PI) / 180;
    return {
        x: cx + radius * Math.cos(rad),
        y: cy - radius * Math.sin(rad),
    };
}

export const GeometricDiagram: React.FC<GeometricDiagramProps> = ({
    variant = "circle",
    radius = 90,
    angleDegrees = 50,
    sides = 5,
    width = 520,
    height = 360,
    showLabels = true,
    showGuides = true,
    className = "",
    strokeColor = baseTheme.stroke,
    fillColor = baseTheme.fill,
    accentColor = baseTheme.accent,
    highlightVarName,
}) => {
    const activeHighlight = useVar(highlightVarName ?? "__noop__", "") as string;
    const setVar = useSetVar();

    const cx = width / 2;
    const cy = height / 2;
    const safeRadius = Math.max(20, Math.min(radius, Math.min(width, height) * 0.42));
    const safeSides = Math.max(3, Math.min(12, Math.round(sides)));
    const clampedAngle = ((angleDegrees % 360) + 360) % 360;

    const radiusEnd = useMemo(
        () => polarToCartesian(cx, cy, safeRadius, clampedAngle),
        [cx, cy, safeRadius, clampedAngle]
    );

    const polygonPoints = useMemo(() => {
        const step = 360 / safeSides;
        return Array.from({ length: safeSides }, (_, i) => {
            const a = -90 + i * step;
            return polarToCartesian(cx, cy, safeRadius, a);
        });
    }, [cx, cy, safeRadius, safeSides]);

    const trianglePoints = useMemo(() => {
        const b = polarToCartesian(cx, cy, safeRadius, 0);
        const c = polarToCartesian(cx, cy, safeRadius, clampedAngle);
        return [
            { x: cx, y: cy, label: "A" },
            { ...b, label: "B" },
            { ...c, label: "C" },
        ];
    }, [cx, cy, safeRadius, clampedAngle]);

    const isActive = (part: string) => activeHighlight && activeHighlight === part;

    const setHighlight = (part: string) => {
        if (!highlightVarName) return;
        setVar(highlightVarName, part);
    };

    const clearHighlight = () => {
        if (!highlightVarName) return;
        setVar(highlightVarName, "");
    };

    const primaryStroke = isActive("boundary") ? baseTheme.activeStroke : strokeColor;
    const primaryFill = isActive("boundary") ? baseTheme.activeFill : fillColor;
    const radiusStroke = isActive("radius") ? baseTheme.activeStroke : accentColor;
    const angleStroke = isActive("angle") ? baseTheme.activeStroke : "#14B8A6";

    return (
        <div className={`w-full rounded-xl bg-card p-3 ${className}`}>
            <svg
                width="100%"
                height={height}
                viewBox={`0 0 ${width} ${height}`}
                role="img"
                aria-label="Geometric diagram"
            >
                {showGuides && (
                    <>
                        <line x1={0} y1={cy} x2={width} y2={cy} stroke={baseTheme.guide} strokeDasharray="4 4" />
                        <line x1={cx} y1={0} x2={cx} y2={height} stroke={baseTheme.guide} strokeDasharray="4 4" />
                    </>
                )}

                {variant === "circle" && (
                    <>
                        <circle
                            cx={cx}
                            cy={cy}
                            r={safeRadius}
                            fill={primaryFill}
                            stroke={primaryStroke}
                            strokeWidth={2.5}
                            onMouseEnter={() => setHighlight("boundary")}
                            onMouseLeave={clearHighlight}
                            style={{ transition: "all 0.2s ease" }}
                        />
                        <line
                            x1={cx}
                            y1={cy}
                            x2={radiusEnd.x}
                            y2={radiusEnd.y}
                            stroke={radiusStroke}
                            strokeWidth={3}
                            onMouseEnter={() => setHighlight("radius")}
                            onMouseLeave={clearHighlight}
                            style={{ transition: "all 0.2s ease" }}
                        />
                        <path
                            d={`M ${cx + 28} ${cy} A 28 28 0 ${clampedAngle > 180 ? 1 : 0} 0 ${
                                cx + 28 * Math.cos((clampedAngle * Math.PI) / 180)
                            } ${cy - 28 * Math.sin((clampedAngle * Math.PI) / 180)}`}
                            fill="none"
                            stroke={angleStroke}
                            strokeWidth={3}
                            onMouseEnter={() => setHighlight("angle")}
                            onMouseLeave={clearHighlight}
                            style={{ transition: "all 0.2s ease" }}
                        />
                    </>
                )}

                {variant === "triangle" && (
                    <>
                        <polygon
                            points={trianglePoints.map((p) => `${p.x},${p.y}`).join(" ")}
                            fill={primaryFill}
                            stroke={primaryStroke}
                            strokeWidth={2.5}
                            onMouseEnter={() => setHighlight("boundary")}
                            onMouseLeave={clearHighlight}
                            style={{ transition: "all 0.2s ease" }}
                        />
                        <line
                            x1={cx}
                            y1={cy}
                            x2={trianglePoints[1].x}
                            y2={trianglePoints[1].y}
                            stroke={radiusStroke}
                            strokeWidth={3}
                            onMouseEnter={() => setHighlight("radius")}
                            onMouseLeave={clearHighlight}
                        />
                        <line
                            x1={cx}
                            y1={cy}
                            x2={trianglePoints[2].x}
                            y2={trianglePoints[2].y}
                            stroke={angleStroke}
                            strokeWidth={3}
                            onMouseEnter={() => setHighlight("angle")}
                            onMouseLeave={clearHighlight}
                        />
                    </>
                )}

                {variant === "polygon" && (
                    <>
                        <polygon
                            points={polygonPoints.map((p) => `${p.x},${p.y}`).join(" ")}
                            fill={primaryFill}
                            stroke={primaryStroke}
                            strokeWidth={2.5}
                            onMouseEnter={() => setHighlight("boundary")}
                            onMouseLeave={clearHighlight}
                            style={{ transition: "all 0.2s ease" }}
                        />
                        <line
                            x1={cx}
                            y1={cy}
                            x2={polygonPoints[0].x}
                            y2={polygonPoints[0].y}
                            stroke={radiusStroke}
                            strokeWidth={3}
                            onMouseEnter={() => setHighlight("radius")}
                            onMouseLeave={clearHighlight}
                        />
                    </>
                )}

                <circle cx={cx} cy={cy} r={4.5} fill={baseTheme.point} />

                {showLabels && (
                    <>
                        <text x={cx + 8} y={cy - 8} fill={baseTheme.text} fontSize={13}>
                            O
                        </text>
                        <text x={radiusEnd.x + 8} y={radiusEnd.y} fill={radiusStroke} fontSize={13}>
                            r
                        </text>
                        {variant !== "polygon" && (
                            <text x={cx + 38} y={cy - 8} fill={angleStroke} fontSize={13}>
                                θ = {Math.round(clampedAngle)}°
                            </text>
                        )}
                        {variant === "polygon" && (
                            <text x={16} y={28} fill={baseTheme.text} fontSize={14}>
                                n = {safeSides} sides
                            </text>
                        )}
                    </>
                )}
            </svg>
        </div>
    );
};
