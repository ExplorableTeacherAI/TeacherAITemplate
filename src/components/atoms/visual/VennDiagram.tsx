import React, { useId } from "react";
import { useVar, useSetVar } from "@/stores/variableStore";

export interface VennDiagramProps {
    width?: number;
    height?: number;
    leftLabel?: string;
    rightLabel?: string;
    leftOnlyCount?: number;
    overlapCount?: number;
    rightOnlyCount?: number;
    outsideCount?: number;
    outsideLabel?: string;
    className?: string;
    showCounts?: boolean;
    showContainerBorder?: boolean;
    highlightVarName?: string;
}

const colors = {
    leftFill: "rgba(59,130,246,0.24)",
    rightFill: "rgba(236,72,153,0.24)",
    overlapFill: "rgba(139,92,246,0.30)",
    leftStroke: "#3B82F6",
    rightStroke: "#EC4899",
    activeStroke: "#F59E0B",
    text: "#334155",
};

export const VennDiagram: React.FC<VennDiagramProps> = ({
    width = 520,
    height = 320,
    leftLabel = "Set A",
    rightLabel = "Set B",
    leftOnlyCount = 4,
    overlapCount = 2,
    rightOnlyCount = 5,
    outsideCount,
    outsideLabel,
    className = "",
    showCounts = true,
    showContainerBorder = false,
    highlightVarName,
}) => {
    const overlapClipId = useId();
    const activeHighlight = useVar(highlightVarName ?? "__noop__", "") as string;
    const setVar = useSetVar();

    const cxLeft = width * 0.42;
    const cxRight = width * 0.58;
    const cy = height * 0.55;
    const radius = Math.min(width, height) * 0.24;

    const setHighlight = (part: string) => {
        if (!highlightVarName) return;
        setVar(highlightVarName, part);
    };

    const clearHighlight = () => {
        if (!highlightVarName) return;
        setVar(highlightVarName, "");
    };

    const isActive = (part: string) => activeHighlight && activeHighlight === part;

    return (
        <div
            className={`w-full rounded-xl bg-card p-3 ${showContainerBorder ? "border" : ""} ${className}`}
        >
            <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
                <defs>
                    <clipPath id={overlapClipId}>
                        <circle cx={cxLeft} cy={cy} r={radius} />
                    </clipPath>
                </defs>

                <circle
                    cx={cxLeft}
                    cy={cy}
                    r={radius}
                    fill={isActive("left") ? "rgba(59,130,246,0.35)" : colors.leftFill}
                    stroke={isActive("left") ? colors.activeStroke : colors.leftStroke}
                    strokeWidth={isActive("left") ? 3 : 2.5}
                    onMouseEnter={() => setHighlight("left")}
                    onMouseLeave={clearHighlight}
                    style={{ transition: "all 0.2s ease" }}
                />

                <circle
                    cx={cxRight}
                    cy={cy}
                    r={radius}
                    fill={isActive("right") ? "rgba(236,72,153,0.35)" : colors.rightFill}
                    stroke={isActive("right") ? colors.activeStroke : colors.rightStroke}
                    strokeWidth={isActive("right") ? 3 : 2.5}
                    onMouseEnter={() => setHighlight("right")}
                    onMouseLeave={clearHighlight}
                    style={{ transition: "all 0.2s ease" }}
                />

                <circle
                    cx={cxRight}
                    cy={cy}
                    r={radius}
                    clipPath={`url(#${overlapClipId})`}
                    fill={isActive("overlap") ? "rgba(139,92,246,0.45)" : colors.overlapFill}
                    stroke="none"
                    onMouseEnter={() => setHighlight("overlap")}
                    onMouseLeave={clearHighlight}
                    style={{ transition: "all 0.2s ease" }}
                />

                <text x={cxLeft - radius * 0.68} y={cy - radius - 14} fill={colors.leftStroke} fontSize={14} fontWeight={700}>
                    {leftLabel}
                </text>
                <text x={cxRight + radius * 0.28} y={cy - radius - 14} fill={colors.rightStroke} fontSize={14} fontWeight={700}>
                    {rightLabel}
                </text>

                {showCounts && (
                    <>
                        <text x={cxLeft - radius * 0.44} y={cy + 5} textAnchor="middle" fill={colors.text} fontSize={18} fontWeight={700}>
                            {leftOnlyCount}
                        </text>
                        <text x={(cxLeft + cxRight) / 2} y={cy + 5} textAnchor="middle" fill={colors.text} fontSize={18} fontWeight={700}>
                            {overlapCount}
                        </text>
                        <text x={cxRight + radius * 0.44} y={cy + 5} textAnchor="middle" fill={colors.text} fontSize={18} fontWeight={700}>
                            {rightOnlyCount}
                        </text>

                        {outsideCount !== undefined && (
                            <>
                                <text
                                    x={(cxLeft + cxRight) / 2}
                                    y={cy + radius + 30}
                                    textAnchor="middle"
                                    fill={colors.text}
                                    fontSize={18}
                                    fontWeight={700}
                                >
                                    {outsideCount}
                                </text>
                                {outsideLabel && (
                                    <text
                                        x={(cxLeft + cxRight) / 2}
                                        y={cy + radius + 48}
                                        textAnchor="middle"
                                        fill={colors.text}
                                        fontSize={12}
                                        fontWeight={500}
                                    >
                                        {outsideLabel}
                                    </text>
                                )}
                            </>
                        )}
                    </>
                )}
            </svg>
        </div>
    );
};
