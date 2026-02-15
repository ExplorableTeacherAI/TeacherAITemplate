import { useEffect, useRef } from "react";
import Two from "two.js";

export interface CoordinateSystemProps {
    /** Width of the canvas */
    width?: number;
    /** Height of the canvas */
    height?: number;
    /** Grid spacing in pixels */
    gridSpacing?: number;
    /** Show grid lines */
    showGrid?: boolean;
    /** Show axis labels */
    showLabels?: boolean;
    /** Primary color for axes */
    axisColor?: string;
    /** Grid color */
    gridColor?: string;
    /** Axis thickness */
    axisThickness?: number;
    /** Range for x-axis labels */
    xRange?: { min: number; max: number; step: number };
    /** Range for y-axis labels */
    yRange?: { min: number; max: number; step: number };
    /** Optional className for styling */
    className?: string;
}

/**
 * CoordinateSystem - A Two.js coordinate system with axes, arrows, and grid
 * 
 * Creates a mathematical coordinate system with customizable grid and labels.
 * 
 * @example
 * ```tsx
 * <CoordinateSystem
 *   width={600}
 *   height={400}
 *   showGrid={true}
 *   showLabels={true}
 *   gridSpacing={40}
 * />
 * ```
 */
export const CoordinateSystem = ({
    width = 600,
    height = 400,
    gridSpacing = 40,
    showGrid = true,
    showLabels = true,
    axisColor = "#444",
    gridColor = "#888",
    axisThickness = 2,
    xRange = { min: -10, max: 10, step: 1 },
    yRange = { min: -10, max: 10, step: 1 },
    className = "",
}: CoordinateSystemProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const twoRef = useRef<Two | null>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // Create Two.js instance directly
        const two = new Two({
            width,
            height,
            autostart: false,
        }).appendTo(containerRef.current);

        twoRef.current = two;

        // Set proper SVG viewBox to prevent clipping
        const svgElement = containerRef.current.querySelector('svg');
        if (svgElement) {
            svgElement.setAttribute('viewBox', `0 0 ${width} ${height}`);
            svgElement.setAttribute('preserveAspectRatio', 'xMidYMid meet');
            svgElement.style.width = '100%';
            svgElement.style.height = '100%';
        }

        // Use exact center of canvas for axes
        const centerX = width / 2;
        const centerY = height / 2;

        // Draw grid first (so it appears behind axes)
        if (showGrid) {
            // Vertical grid lines
            for (let i = 0; i * gridSpacing <= width; i++) {
                // Lines to the right of center
                if (centerX + i * gridSpacing <= width) {
                    const x = centerX + i * gridSpacing;
                    const line = two.makeLine(x, 0, x, height);
                    line.stroke = gridColor;
                    line.linewidth = 1;
                    line.opacity = 0.15;
                }
                // Lines to the left of center (skip i=0 to avoid duplicate)
                if (i > 0 && centerX - i * gridSpacing >= 0) {
                    const x = centerX - i * gridSpacing;
                    const line = two.makeLine(x, 0, x, height);
                    line.stroke = gridColor;
                    line.linewidth = 1;
                    line.opacity = 0.15;
                }
            }

            // Horizontal grid lines
            for (let i = 0; i * gridSpacing <= height; i++) {
                // Lines below center
                if (centerY + i * gridSpacing <= height) {
                    const y = centerY + i * gridSpacing;
                    const line = two.makeLine(0, y, width, y);
                    line.stroke = gridColor;
                    line.linewidth = 1;
                    line.opacity = 0.15;
                }
                // Lines above center (skip i=0 to avoid duplicate)
                if (i > 0 && centerY - i * gridSpacing >= 0) {
                    const y = centerY - i * gridSpacing;
                    const line = two.makeLine(0, y, width, y);
                    line.stroke = gridColor;
                    line.linewidth = 1;
                    line.opacity = 0.15;
                }
            }
        }

        // Draw main axes
        const xAxis = two.makeLine(0, centerY, width, centerY);
        xAxis.stroke = axisColor;
        xAxis.linewidth = axisThickness;
        xAxis.opacity = 0.8;

        const yAxis = two.makeLine(centerX, 0, centerX, height);
        yAxis.stroke = axisColor;
        yAxis.linewidth = axisThickness;
        yAxis.opacity = 0.8;

        // Draw arrows at the end of axes
        const arrowSize = 15;
        const arrowWidth = 8;

        // X-axis arrow (right)
        const xArrow1 = two.makeLine(
            width - 5,
            centerY,
            width - arrowSize - 5,
            centerY - arrowWidth
        );
        xArrow1.stroke = axisColor;
        xArrow1.linewidth = 2;
        xArrow1.opacity = 1.0;
        xArrow1.cap = "round";

        const xArrow2 = two.makeLine(
            width - 5,
            centerY,
            width - arrowSize - 5,
            centerY + arrowWidth
        );
        xArrow2.stroke = axisColor;
        xArrow2.linewidth = 2;
        xArrow2.opacity = 1.0;
        xArrow2.cap = "round";

        // Y-axis arrow (up)
        const yArrow1 = two.makeLine(
            centerX,
            5,
            centerX - arrowWidth,
            arrowSize + 5
        );
        yArrow1.stroke = axisColor;
        yArrow1.linewidth = 2;
        yArrow1.opacity = 1.0;
        yArrow1.cap = "round";

        const yArrow2 = two.makeLine(
            centerX,
            5,
            centerX + arrowWidth,
            arrowSize + 5
        );
        yArrow2.stroke = axisColor;
        yArrow2.linewidth = 2;
        yArrow2.opacity = 1.0;
        yArrow2.cap = "round";

        // Draw tick marks and labels
        if (showLabels) {
            const arrowMargin = 30;

            // X-axis labels
            const numXTicks = Math.floor(width / gridSpacing);
            for (let i = -numXTicks; i <= numXTicks; i++) {
                if (i === 0) continue;

                const x = centerX + i * gridSpacing;
                if (x < arrowMargin || x > width - arrowMargin) continue;

                const tick = two.makeLine(x, centerY - 5, x, centerY + 5);
                tick.stroke = axisColor;
                tick.linewidth = 1.5;
                tick.opacity = 0.6;

                const value = (i * xRange.step).toFixed(xRange.step < 1 ? 1 : 0);
                const text = two.makeText(value, x, centerY + 20, {
                    family: "Arial, sans-serif",
                    size: 12,
                    fill: axisColor,
                    alignment: "center",
                } as any);
                text.opacity = 0.7;
            }

            // Y-axis labels
            const numYTicks = Math.floor(height / gridSpacing);
            for (let i = -numYTicks; i <= numYTicks; i++) {
                if (i === 0) continue;

                const y = centerY - i * gridSpacing;
                if (y < arrowMargin || y > height - arrowMargin) continue;

                const tick = two.makeLine(centerX - 5, y, centerX + 5, y);
                tick.stroke = axisColor;
                tick.linewidth = 1.5;
                tick.opacity = 0.6;

                const value = (i * yRange.step).toFixed(yRange.step < 1 ? 1 : 0);
                const text = two.makeText(value, centerX - 20, y + 4, {
                    family: "Arial, sans-serif",
                    size: 12,
                    fill: axisColor,
                    alignment: "right",
                } as any);
                text.opacity = 0.7;
            }

            // Origin label
            const originText = two.makeText("0", centerX - 15, centerY + 20, {
                family: "Arial, sans-serif",
                size: 12,
                fill: axisColor,
                alignment: "right",
            } as any);
            originText.opacity = 0.7;

            // Axis labels
            const xLabel = two.makeText("x", width - 10, centerY + 25, {
                family: "Arial, sans-serif",
                size: 16,
                fill: axisColor,
                weight: "bold",
                alignment: "center",
            } as any);
            xLabel.opacity = 0.8;

            const yLabel = two.makeText("y", centerX + 25, 20, {
                family: "Arial, sans-serif",
                size: 16,
                fill: axisColor,
                weight: "bold",
                alignment: "center",
            } as any);
            yLabel.opacity = 0.8;
        }

        two.update();

        // Cleanup
        return () => {
            if (twoRef.current) {
                twoRef.current.clear();
                if (containerRef.current) {
                    containerRef.current.innerHTML = "";
                }
            }
        };
    }, [width, height, gridSpacing, showGrid, showLabels, axisColor, gridColor, axisThickness, xRange, yRange]);

    return (
        <div
            ref={containerRef}
            className={className}
            style={{
                width: '100%',
                height: 'auto',
                aspectRatio: `${width}/${height}`,
                display: 'block',
            }}
        />
    );
};
