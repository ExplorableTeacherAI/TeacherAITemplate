import React, { useMemo } from "react";

export interface NumberLineProps {
    min?: number;
    max?: number;
    step?: number;
    value?: number;
    width?: number;
    height?: number;
    showTicks?: boolean;
    showLabels?: boolean;
    className?: string;
    showContainerBorder?: boolean;
    onValueChange?: (value: number) => void;
}

const theme = {
    axis: "#475569",
    tick: "#64748b",
    label: "#475569",
    marker: "#EC4899",
    markerText: "#BE185D",
};

export const NumberLine: React.FC<NumberLineProps> = ({
    min = -10,
    max = 10,
    step = 1,
    value = 0,
    width = 640,
    height = 180,
    showTicks = true,
    showLabels = true,
    className = "",
    showContainerBorder = false,
    onValueChange,
}) => {
    const safeMax = max <= min ? min + 1 : max;
    const safeStep = step <= 0 ? 1 : step;
    const valueClamped = Math.min(safeMax, Math.max(min, value));

    const paddingX = 50;
    const axisY = height * 0.52;
    const usableWidth = width - paddingX * 2;

    const ticks = useMemo(() => {
        const arr: number[] = [];
        for (let t = min; t <= safeMax + safeStep / 2; t += safeStep) {
            arr.push(Number(t.toFixed(6)));
            if (arr.length > 200) break;
        }
        return arr;
    }, [min, safeMax, safeStep]);

    const xOf = (n: number) => paddingX + ((n - min) / (safeMax - min)) * usableWidth;
    const valueX = xOf(valueClamped);

    const handleClick = (event: React.MouseEvent<SVGSVGElement>) => {
        if (!onValueChange) return;
        const rect = event.currentTarget.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const lineX = Math.min(width - paddingX, Math.max(paddingX, (clickX / rect.width) * width));
        const raw = min + ((lineX - paddingX) / usableWidth) * (safeMax - min);
        const snapped = Math.round(raw / safeStep) * safeStep;
        const clamped = Math.min(safeMax, Math.max(min, snapped));
        onValueChange(Number(clamped.toFixed(6)));
    };

    return (
        <div
            className={`w-full rounded-xl bg-card p-3 ${showContainerBorder ? "border" : ""} ${className}`}
        >
            <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} onClick={handleClick}>
                <line x1={paddingX} y1={axisY} x2={width - paddingX} y2={axisY} stroke={theme.axis} strokeWidth={2.5} />

                {showTicks &&
                    ticks.map((t) => {
                        const x = xOf(t);
                        const isMajor = Math.abs(t % (safeStep * 2)) < 1e-6 || Math.abs(t) < 1e-6;
                        return (
                            <g key={t}>
                                <line
                                    x1={x}
                                    y1={axisY - (isMajor ? 9 : 6)}
                                    x2={x}
                                    y2={axisY + (isMajor ? 9 : 6)}
                                    stroke={theme.tick}
                                    strokeWidth={isMajor ? 1.8 : 1.2}
                                />
                                {showLabels && isMajor && (
                                    <text x={x} y={axisY + 26} textAnchor="middle" fill={theme.label} fontSize={12}>
                                        {Number.isInteger(t) ? t : t.toFixed(1)}
                                    </text>
                                )}
                            </g>
                        );
                    })}

                <line x1={valueX} y1={axisY - 24} x2={valueX} y2={axisY + 24} stroke={theme.marker} strokeWidth={3} />
                <circle cx={valueX} cy={axisY} r={6} fill={theme.marker} />

                <text x={valueX} y={axisY - 34} textAnchor="middle" fill={theme.markerText} fontSize={13} fontWeight={700}>
                    {Number.isInteger(valueClamped) ? valueClamped : valueClamped.toFixed(2)}
                </text>
            </svg>
        </div>
    );
};
