import React, { useMemo } from 'react';

// ─────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────

export interface MatrixVisualizationProps {
    /** 2D array of numbers representing the matrix */
    data: number[][];
    /** Optional label displayed above the matrix (e.g. "A") */
    label?: string;
    /** Width in pixels (auto-sizes cells) */
    width?: number;
    /** Height in pixels (auto-sizes cells) */
    height?: number;
    /** Color scheme for cells — 'none' shows no fill, 'heatmap' maps values to color intensity */
    colorScheme?: 'none' | 'heatmap' | 'diverging' | 'categorical';
    /** Base color for heatmap mode */
    color?: string;
    /** Positive-end color for diverging mode */
    positiveColor?: string;
    /** Negative-end color for diverging mode */
    negativeColor?: string;
    /** Whether to show grid lines between cells */
    showGrid?: boolean;
    /** Whether to display numeric values in each cell */
    showValues?: boolean;
    /** Number of decimal places for displayed values */
    precision?: number;
    /** Indices of rows to highlight (0-based) */
    highlightRows?: number[];
    /** Indices of columns to highlight (0-based) */
    highlightCols?: number[];
    /** Specific cells to highlight as [row, col] pairs */
    highlightCells?: [number, number][];
    /** Color used for highlights */
    highlightColor?: string;
    /** Show row/column index labels */
    showIndices?: boolean;
    /** Whether to show the bracket delimiters */
    showBrackets?: boolean;
    /** Font size for cell values */
    fontSize?: number;
    /** Cell border radius */
    cellRadius?: number;
    /** Callback when a cell is clicked */
    onCellClick?: (row: number, col: number, value: number) => void;
    /** Callback when a cell is hovered */
    onCellHover?: (row: number, col: number, value: number) => void;
    /** Callback when hover leaves the matrix */
    onHoverLeave?: () => void;
}

// ─────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
        : [79, 70, 229]; // fallback indigo
}

function lerp(a: number, b: number, t: number) {
    return a + (b - a) * t;
}

function getCellColor(
    value: number,
    min: number,
    max: number,
    scheme: MatrixVisualizationProps['colorScheme'],
    color: string,
    positiveColor: string,
    negativeColor: string,
): string {
    if (scheme === 'none') return 'transparent';

    const range = max - min || 1;

    if (scheme === 'heatmap') {
        const t = (value - min) / range;
        const [r, g, b] = hexToRgb(color);
        const alpha = 0.1 + t * 0.7;
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    if (scheme === 'diverging') {
        const absMax = Math.max(Math.abs(min), Math.abs(max)) || 1;
        const t = value / absMax; // -1 to 1
        if (t >= 0) {
            const [r, g, b] = hexToRgb(positiveColor);
            return `rgba(${r}, ${g}, ${b}, ${t * 0.7 + 0.05})`;
        } else {
            const [r, g, b] = hexToRgb(negativeColor);
            return `rgba(${r}, ${g}, ${b}, ${Math.abs(t) * 0.7 + 0.05})`;
        }
    }

    if (scheme === 'categorical') {
        // Use hue rotation for distinct integer values
        const palette = [
            '#4F46E5', '#06B6D4', '#10B981', '#F59E0B',
            '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6',
        ];
        const idx = Math.abs(Math.round(value)) % palette.length;
        const [r, g, b] = hexToRgb(palette[idx]);
        return `rgba(${r}, ${g}, ${b}, 0.25)`;
    }

    return 'transparent';
}

// ─────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────

export const MatrixVisualization: React.FC<MatrixVisualizationProps> = ({
    data,
    label,
    width = 400,
    height,
    colorScheme = 'heatmap',
    color = '#4F46E5',
    positiveColor = '#10B981',
    negativeColor = '#EF4444',
    showGrid = true,
    showValues = true,
    precision = 2,
    highlightRows = [],
    highlightCols = [],
    highlightCells = [],
    highlightColor = '#FBBF24',
    showIndices = false,
    showBrackets = true,
    fontSize = 14,
    cellRadius = 4,
    onCellClick,
    onCellHover,
    onHoverLeave,
}) => {
    const rows = data.length;
    const cols = data[0]?.length ?? 0;

    // Auto-compute height if not provided
    const computedHeight = height ?? Math.max(120, rows * 48 + 40);

    // Compute value bounds
    const { min, max } = useMemo(() => {
        let mn = Infinity;
        let mx = -Infinity;
        for (const row of data) {
            for (const v of row) {
                if (v < mn) mn = v;
                if (v > mx) mx = v;
            }
        }
        return { min: mn, max: mx };
    }, [data]);

    // Layout calculations
    const bracketWidth = showBrackets ? 12 : 0;
    const indexWidth = showIndices ? 28 : 0;
    const indexHeight = showIndices ? 24 : 0;
    const labelHeight = label ? 28 : 0;
    const padding = 16;

    const matrixAreaWidth = width - padding * 2 - bracketWidth * 2 - indexWidth;
    const matrixAreaHeight = computedHeight - padding * 2 - indexHeight - labelHeight;

    const cellWidth = matrixAreaWidth / (cols || 1);
    const cellHeight = matrixAreaHeight / (rows || 1);

    // Origin of matrix cell grid
    const originX = padding + indexWidth + bracketWidth;
    const originY = padding + labelHeight + indexHeight;

    // Build highlight lookup sets for O(1) checks
    const highlightRowSet = useMemo(() => new Set(highlightRows), [highlightRows]);
    const highlightColSet = useMemo(() => new Set(highlightCols), [highlightCols]);
    const highlightCellSet = useMemo(() => {
        const s = new Set<string>();
        for (const [r, c] of highlightCells) s.add(`${r},${c}`);
        return s;
    }, [highlightCells]);

    const isHighlighted = (r: number, c: number) =>
        highlightRowSet.has(r) || highlightColSet.has(c) || highlightCellSet.has(`${r},${c}`);

    // Format value
    const fmt = (v: number) => {
        if (Number.isInteger(v)) return String(v);
        return v.toFixed(precision);
    };

    return (
        <div className="flex justify-center p-2 relative">
            <svg
                width={width}
                height={computedHeight}
                viewBox={`0 0 ${width} ${computedHeight}`}
                className="overflow-visible"
                onMouseLeave={onHoverLeave}
            >
                {/* Label */}
                {label && (
                    <text
                        x={width / 2}
                        y={padding + 6}
                        textAnchor="middle"
                        className="fill-foreground font-semibold"
                        fontSize={fontSize + 4}
                        fontStyle="italic"
                    >
                        {label}
                    </text>
                )}

                {/* Column indices */}
                {showIndices && cols > 0 && Array.from({ length: cols }).map((_, c) => (
                    <text
                        key={`col-idx-${c}`}
                        x={originX + c * cellWidth + cellWidth / 2}
                        y={originY - 6}
                        textAnchor="middle"
                        className="fill-muted-foreground"
                        fontSize={fontSize - 2}
                    >
                        {c}
                    </text>
                ))}

                {/* Row indices */}
                {showIndices && rows > 0 && Array.from({ length: rows }).map((_, r) => (
                    <text
                        key={`row-idx-${r}`}
                        x={originX - bracketWidth - 6}
                        y={originY + r * cellHeight + cellHeight / 2 + 4}
                        textAnchor="end"
                        className="fill-muted-foreground"
                        fontSize={fontSize - 2}
                    >
                        {r}
                    </text>
                ))}

                {/* Left bracket */}
                {showBrackets && (
                    <path
                        d={`M ${originX - 2} ${originY - 2} 
                            L ${originX - bracketWidth} ${originY - 2} 
                            L ${originX - bracketWidth} ${originY + rows * cellHeight + 2} 
                            L ${originX - 2} ${originY + rows * cellHeight + 2}`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        className="text-foreground"
                    />
                )}

                {/* Right bracket */}
                {showBrackets && (
                    <path
                        d={`M ${originX + cols * cellWidth + 2} ${originY - 2} 
                            L ${originX + cols * cellWidth + bracketWidth} ${originY - 2} 
                            L ${originX + cols * cellWidth + bracketWidth} ${originY + rows * cellHeight + 2} 
                            L ${originX + cols * cellWidth + 2} ${originY + rows * cellHeight + 2}`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        className="text-foreground"
                    />
                )}

                {/* Cells */}
                {data.map((row, r) =>
                    row.map((value, c) => {
                        const x = originX + c * cellWidth;
                        const y = originY + r * cellHeight;
                        const highlighted = isHighlighted(r, c);
                        const bg = highlighted
                            ? `rgba(${hexToRgb(highlightColor).join(',')}, 0.3)`
                            : getCellColor(value, min, max, colorScheme, color, positiveColor, negativeColor);

                        return (
                            <g
                                key={`cell-${r}-${c}`}
                                style={{ cursor: onCellClick ? 'pointer' : 'default' }}
                                onClick={() => onCellClick?.(r, c, value)}
                                onMouseEnter={() => onCellHover?.(r, c, value)}
                            >
                                {/* Cell background */}
                                <rect
                                    x={x + 1}
                                    y={y + 1}
                                    width={cellWidth - 2}
                                    height={cellHeight - 2}
                                    rx={cellRadius}
                                    fill={bg}
                                    className="transition-colors duration-200"
                                />

                                {/* Grid lines */}
                                {showGrid && (
                                    <rect
                                        x={x}
                                        y={y}
                                        width={cellWidth}
                                        height={cellHeight}
                                        fill="none"
                                        stroke="hsl(var(--border))"
                                        strokeWidth={0.5}
                                    />
                                )}

                                {/* Highlight border */}
                                {highlighted && (
                                    <rect
                                        x={x + 1}
                                        y={y + 1}
                                        width={cellWidth - 2}
                                        height={cellHeight - 2}
                                        rx={cellRadius}
                                        fill="none"
                                        stroke={highlightColor}
                                        strokeWidth={2}
                                    />
                                )}

                                {/* Value text */}
                                {showValues && (
                                    <text
                                        x={x + cellWidth / 2}
                                        y={y + cellHeight / 2 + fontSize * 0.35}
                                        textAnchor="middle"
                                        className="fill-foreground font-mono"
                                        fontSize={fontSize}
                                    >
                                        {fmt(value)}
                                    </text>
                                )}
                            </g>
                        );
                    })
                )}
            </svg>
        </div>
    );
};
