import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as d3 from 'd3';

// ─── Types ───────────────────────────────────────────────────────────────────

export type ChartType = 'bar' | 'line' | 'area' | 'pie' | 'donut' | 'scatter';

export interface ChartDataPoint {
    label: string;
    value: number;
    color?: string;
}

export interface ScatterDataPoint {
    x: number;
    y: number;
    label?: string;
    color?: string;
    size?: number;
}

export interface DataVisualizationProps {
    /** Chart type: 'bar' | 'line' | 'area' | 'pie' | 'donut' | 'scatter' */
    type: ChartType;
    /** Data for bar, line, area, pie, donut charts */
    data?: ChartDataPoint[];
    /** Data specifically for scatter plots */
    scatterData?: ScatterDataPoint[];
    /** Width of the chart (default: 600) */
    width?: number;
    /** Height of the chart (default: 400) */
    height?: number;
    /** Title displayed above the chart */
    title?: string;
    /** X-axis label */
    xLabel?: string;
    /** Y-axis label */
    yLabel?: string;
    /** Default color (used if data points don't specify one) */
    color?: string;
    /** Array of colors for multi-series or pie slices */
    colors?: string[];
    /** Whether to show grid lines (default: true) */
    showGrid?: boolean;
    /** Whether to animate on mount (default: true) */
    animate?: boolean;
    /** Whether to show data value labels on the chart */
    showValues?: boolean;
    /** Whether to show a legend (for pie/donut) */
    showLegend?: boolean;
    /** Inner radius ratio for donut charts (0 to 1, default: 0.55) */
    donutRatio?: number;
    /** Curve interpolation for line/area: 'linear' | 'smooth' | 'step' */
    curve?: 'linear' | 'smooth' | 'step';
    /** Caption below the chart */
    caption?: string;
}

// ─── Color palette ───────────────────────────────────────────────────────────

const DEFAULT_PALETTE = [
    '#6366f1', // indigo
    '#f43f5e', // rose
    '#22c55e', // green
    '#f59e0b', // amber
    '#3b82f6', // blue
    '#ec4899', // pink
    '#14b8a6', // teal
    '#a855f7', // purple
    '#ef4444', // red
    '#06b6d4', // cyan
];

// ─── Component ───────────────────────────────────────────────────────────────

export const DataVisualization: React.FC<DataVisualizationProps> = ({
    type,
    data = [],
    scatterData,
    width = 600,
    height = 400,
    title,
    xLabel,
    yLabel,
    color,
    colors,
    showGrid = true,
    animate = true,
    showValues = false,
    showLegend = true,
    donutRatio = 0.55,
    curve = 'smooth',
    caption,
}) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const [tooltip, setTooltip] = useState<{
        visible: boolean;
        x: number;
        y: number;
        content: string;
    }>({ visible: false, x: 0, y: 0, content: '' });

    const palette = useMemo(
        () => colors ?? DEFAULT_PALETTE,
        [colors],
    );

    const getColor = (i: number, fallback?: string) =>
        fallback ?? palette[i % palette.length];

    // ── Cartesian charts (bar, line, area, scatter) ──────────────────────────

    useEffect(() => {
        if (!svgRef.current) return;
        if (type === 'pie' || type === 'donut') return; // handled separately

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const margin = {
            top: title ? 40 : 20,
            right: 30,
            bottom: xLabel ? 60 : 50,
            left: yLabel ? 70 : 60,
        };
        const cw = width - margin.left - margin.right;
        const ch = height - margin.top - margin.bottom;
        const g = svg
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // ── Title ────────────────────────────────────────────────────────────
        if (title) {
            svg.append('text')
                .attr('x', width / 2)
                .attr('y', 22)
                .attr('text-anchor', 'middle')
                .attr('fill', 'hsl(var(--foreground))')
                .attr('font-size', 15)
                .attr('font-weight', 600)
                .text(title);
        }

        // ── Axes helpers ─────────────────────────────────────────────────────
        const setupAxes = (
            xScale: d3.ScaleBand<string> | d3.ScaleLinear<number, number>,
            yScale: d3.ScaleLinear<number, number>,
            isBand: boolean,
        ) => {
            // X axis
            const xAxis = isBand
                ? d3.axisBottom(xScale as d3.ScaleBand<string>)
                : d3.axisBottom(xScale as d3.ScaleLinear<number, number>).ticks(6);

            g.append('g')
                .attr('transform', `translate(0,${ch})`)
                .call(xAxis as any)
                .selectAll('text')
                .attr('fill', 'hsl(var(--muted-foreground))')
                .attr('font-size', 11)
                .attr('transform', isBand && data.length > 6 ? 'rotate(-35)' : 'rotate(0)')
                .style('text-anchor', isBand && data.length > 6 ? 'end' : 'middle');

            // Y axis
            g.append('g')
                .call(d3.axisLeft(yScale).ticks(5))
                .selectAll('text')
                .attr('fill', 'hsl(var(--muted-foreground))')
                .attr('font-size', 11);

            // Grid lines
            if (showGrid) {
                g.append('g')
                    .attr('class', 'grid')
                    .call(
                        d3
                            .axisLeft(yScale)
                            .ticks(5)
                            .tickSize(-cw)
                            .tickFormat(() => ''),
                    )
                    .selectAll('line')
                    .attr('stroke', 'hsl(var(--border))')
                    .attr('stroke-opacity', 0.5)
                    .attr('stroke-dasharray', '3,3');
            }

            // Remove domain lines
            g.selectAll('.domain').remove();

            // Axis labels
            if (xLabel) {
                svg.append('text')
                    .attr('x', margin.left + cw / 2)
                    .attr('y', height - 8)
                    .attr('text-anchor', 'middle')
                    .attr('fill', 'hsl(var(--muted-foreground))')
                    .attr('font-size', 12)
                    .text(xLabel);
            }
            if (yLabel) {
                svg.append('text')
                    .attr('x', -(margin.top + ch / 2))
                    .attr('y', 16)
                    .attr('text-anchor', 'middle')
                    .attr('fill', 'hsl(var(--muted-foreground))')
                    .attr('font-size', 12)
                    .attr('transform', 'rotate(-90)')
                    .text(yLabel);
            }
        };

        // ── BAR ──────────────────────────────────────────────────────────────
        if (type === 'bar') {
            const x = d3
                .scaleBand()
                .domain(data.map((d) => d.label))
                .range([0, cw])
                .padding(0.25);

            const y = d3
                .scaleLinear()
                .domain([0, d3.max(data, (d) => d.value) ?? 0])
                .nice()
                .range([ch, 0]);

            setupAxes(x, y, true);

            const bars = g
                .selectAll('.viz-bar')
                .data(data)
                .enter()
                .append('rect')
                .attr('class', 'viz-bar')
                .attr('x', (d) => x(d.label)!)
                .attr('width', x.bandwidth())
                .attr('rx', 4)
                .attr('fill', (d, i) => getColor(i, d.color ?? color));

            if (animate) {
                bars.attr('y', ch)
                    .attr('height', 0)
                    .transition()
                    .duration(700)
                    .delay((_, i) => i * 40)
                    .ease(d3.easeElastic.period(0.55))
                    .attr('y', (d) => y(d.value))
                    .attr('height', (d) => ch - y(d.value));
            } else {
                bars.attr('y', (d) => y(d.value)).attr(
                    'height',
                    (d) => ch - y(d.value),
                );
            }

            // Value labels
            if (showValues) {
                g.selectAll('.viz-val')
                    .data(data)
                    .enter()
                    .append('text')
                    .attr('class', 'viz-val')
                    .attr('x', (d) => x(d.label)! + x.bandwidth() / 2)
                    .attr('y', (d) => y(d.value) - 6)
                    .attr('text-anchor', 'middle')
                    .attr('fill', 'hsl(var(--foreground))')
                    .attr('font-size', 11)
                    .attr('font-weight', 500)
                    .text((d) => d.value);
            }

            // Hover
            g.selectAll('.viz-bar')
                .on('mouseenter', function (event, d: any) {
                    d3.select(this).attr('opacity', 0.8);
                    setTooltip({
                        visible: true,
                        x: event.pageX + 12,
                        y: event.pageY - 30,
                        content: `${d.label}: ${d.value}`,
                    });
                })
                .on('mousemove', function (event) {
                    setTooltip((prev) => ({
                        ...prev,
                        x: event.pageX + 12,
                        y: event.pageY - 30,
                    }));
                })
                .on('mouseleave', function () {
                    d3.select(this).attr('opacity', 1);
                    setTooltip((prev) => ({ ...prev, visible: false }));
                });
        }

        // ── LINE / AREA ──────────────────────────────────────────────────────
        if (type === 'line' || type === 'area') {
            const x = d3
                .scaleBand()
                .domain(data.map((d) => d.label))
                .range([0, cw])
                .padding(0.1);

            const y = d3
                .scaleLinear()
                .domain([0, (d3.max(data, (d) => d.value) ?? 0) * 1.1])
                .nice()
                .range([ch, 0]);

            setupAxes(x, y, true);

            const curveFactory =
                curve === 'step'
                    ? d3.curveStep
                    : curve === 'smooth'
                        ? d3.curveMonotoneX
                        : d3.curveLinear;

            const lineGen = d3
                .line<ChartDataPoint>()
                .x((d) => x(d.label)! + x.bandwidth() / 2)
                .y((d) => y(d.value))
                .curve(curveFactory);

            const mainColor = color ?? palette[0];

            // Area fill
            if (type === 'area') {
                const areaGen = d3
                    .area<ChartDataPoint>()
                    .x((d) => x(d.label)! + x.bandwidth() / 2)
                    .y0(ch)
                    .y1((d) => y(d.value))
                    .curve(curveFactory);

                // Gradient
                const gradId = `area-grad-${Math.random().toString(36).slice(2, 8)}`;
                const defs = svg.append('defs');
                const grad = defs
                    .append('linearGradient')
                    .attr('id', gradId)
                    .attr('x1', '0')
                    .attr('y1', '0')
                    .attr('x2', '0')
                    .attr('y2', '1');
                grad.append('stop')
                    .attr('offset', '0%')
                    .attr('stop-color', mainColor)
                    .attr('stop-opacity', 0.35);
                grad.append('stop')
                    .attr('offset', '100%')
                    .attr('stop-color', mainColor)
                    .attr('stop-opacity', 0.03);

                g.append('path')
                    .datum(data)
                    .attr('fill', `url(#${gradId})`)
                    .attr('d', areaGen);
            }

            // Line path
            const path = g
                .append('path')
                .datum(data)
                .attr('fill', 'none')
                .attr('stroke', mainColor)
                .attr('stroke-width', 2.5)
                .attr('stroke-linecap', 'round')
                .attr('d', lineGen);

            // Animate draw-in
            if (animate) {
                const totalLength = (path.node() as SVGPathElement)?.getTotalLength?.() ?? 0;
                if (totalLength) {
                    path.attr('stroke-dasharray', `${totalLength} ${totalLength}`)
                        .attr('stroke-dashoffset', totalLength)
                        .transition()
                        .duration(1200)
                        .ease(d3.easeQuadOut)
                        .attr('stroke-dashoffset', 0);
                }
            }

            // Data dots
            g.selectAll('.viz-dot')
                .data(data)
                .enter()
                .append('circle')
                .attr('class', 'viz-dot')
                .attr('cx', (d) => x(d.label)! + x.bandwidth() / 2)
                .attr('cy', (d) => y(d.value))
                .attr('r', 4)
                .attr('fill', mainColor)
                .attr('stroke', 'hsl(var(--background))')
                .attr('stroke-width', 2)
                .on('mouseenter', function (event, d: any) {
                    d3.select(this).attr('r', 6);
                    setTooltip({
                        visible: true,
                        x: event.pageX + 12,
                        y: event.pageY - 30,
                        content: `${d.label}: ${d.value}`,
                    });
                })
                .on('mousemove', function (event) {
                    setTooltip((prev) => ({
                        ...prev,
                        x: event.pageX + 12,
                        y: event.pageY - 30,
                    }));
                })
                .on('mouseleave', function () {
                    d3.select(this).attr('r', 4);
                    setTooltip((prev) => ({ ...prev, visible: false }));
                });

            // Value labels
            if (showValues) {
                g.selectAll('.viz-val')
                    .data(data)
                    .enter()
                    .append('text')
                    .attr('class', 'viz-val')
                    .attr('x', (d) => x(d.label)! + x.bandwidth() / 2)
                    .attr('y', (d) => y(d.value) - 10)
                    .attr('text-anchor', 'middle')
                    .attr('fill', 'hsl(var(--foreground))')
                    .attr('font-size', 10)
                    .attr('font-weight', 500)
                    .text((d) => d.value);
            }
        }

        // ── SCATTER ──────────────────────────────────────────────────────────
        if (type === 'scatter') {
            const pts = scatterData ?? [];
            const xExtent = d3.extent(pts, (d) => d.x) as [number, number];
            const yExtent = d3.extent(pts, (d) => d.y) as [number, number];

            const x = d3
                .scaleLinear()
                .domain([
                    (xExtent[0] ?? 0) - Math.abs((xExtent[0] ?? 0)) * 0.1,
                    (xExtent[1] ?? 0) + Math.abs((xExtent[1] ?? 0)) * 0.1,
                ])
                .nice()
                .range([0, cw]);

            const y = d3
                .scaleLinear()
                .domain([
                    (yExtent[0] ?? 0) - Math.abs((yExtent[0] ?? 0)) * 0.1,
                    (yExtent[1] ?? 0) + Math.abs((yExtent[1] ?? 0)) * 0.1,
                ])
                .nice()
                .range([ch, 0]);

            setupAxes(x, y, false);

            const dots = g
                .selectAll('.viz-scatter')
                .data(pts)
                .enter()
                .append('circle')
                .attr('class', 'viz-scatter')
                .attr('cx', (d) => x(d.x))
                .attr('cy', (d) => y(d.y))
                .attr('fill', (d, i) => d.color ?? color ?? palette[i % palette.length])
                .attr('stroke', 'hsl(var(--background))')
                .attr('stroke-width', 1.5);

            if (animate) {
                dots.attr('r', 0)
                    .transition()
                    .duration(600)
                    .delay((_, i) => i * 20)
                    .ease(d3.easeBackOut)
                    .attr('r', (d) => d.size ?? 5);
            } else {
                dots.attr('r', (d) => d.size ?? 5);
            }

            // Hover
            g.selectAll('.viz-scatter')
                .on('mouseenter', function (event, d: any) {
                    d3.select(this).attr('r', (d.size ?? 5) + 2);
                    setTooltip({
                        visible: true,
                        x: event.pageX + 12,
                        y: event.pageY - 30,
                        content: d.label
                            ? `${d.label} (${d.x}, ${d.y})`
                            : `(${d.x}, ${d.y})`,
                    });
                })
                .on('mousemove', function (event) {
                    setTooltip((prev) => ({
                        ...prev,
                        x: event.pageX + 12,
                        y: event.pageY - 30,
                    }));
                })
                .on('mouseleave', function (_, d: any) {
                    d3.select(this).attr('r', d.size ?? 5);
                    setTooltip((prev) => ({ ...prev, visible: false }));
                });
        }
    }, [type, data, scatterData, width, height, color, colors, showGrid, animate, showValues, title, xLabel, yLabel, curve, palette]);

    // ── Pie / donut ──────────────────────────────────────────────────────────

    useEffect(() => {
        if (!svgRef.current) return;
        if (type !== 'pie' && type !== 'donut') return;

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const titleOffset = title ? 25 : 0;
        const legendWidth = showLegend ? 140 : 0;
        const rad = Math.min(width - legendWidth, height - titleOffset * 2) / 2 - 10;
        const cx = (width - legendWidth) / 2;
        const cy = height / 2 + titleOffset / 2;

        if (title) {
            svg.append('text')
                .attr('x', width / 2)
                .attr('y', 22)
                .attr('text-anchor', 'middle')
                .attr('fill', 'hsl(var(--foreground))')
                .attr('font-size', 15)
                .attr('font-weight', 600)
                .text(title);
        }

        const g = svg.append('g').attr('transform', `translate(${cx},${cy})`);

        const pieGen = d3
            .pie<ChartDataPoint>()
            .sort(null)
            .value((d) => d.value);

        const innerR = type === 'donut' ? rad * donutRatio : 0;

        const arcGen = d3
            .arc<d3.PieArcDatum<ChartDataPoint>>()
            .innerRadius(innerR)
            .outerRadius(rad)
            .cornerRadius(3)
            .padAngle(0.015);

        const slices = g
            .selectAll('.viz-slice')
            .data(pieGen(data))
            .enter()
            .append('path')
            .attr('class', 'viz-slice')
            .attr('fill', (d, i) => getColor(i, d.data.color ?? color))
            .attr('stroke', 'hsl(var(--background))')
            .attr('stroke-width', 2);

        if (animate) {
            slices.each(function (d) {
                const interpolate = d3.interpolate(
                    { startAngle: d.startAngle, endAngle: d.startAngle },
                    d,
                );
                d3.select(this)
                    .transition()
                    .duration(800)
                    .ease(d3.easeQuadOut)
                    .attrTween('d', () => (t: number) => arcGen(interpolate(t)) ?? '');
            });
        } else {
            slices.attr('d', arcGen);
        }

        // Hover on slices
        g.selectAll('.viz-slice')
            .on('mouseenter', function (event, d: any) {
                d3.select(this)
                    .transition()
                    .duration(150)
                    .attr(
                        'transform',
                        `translate(${d3.arc<d3.PieArcDatum<ChartDataPoint>>().innerRadius(0).outerRadius(8).centroid(d)})`,
                    );
                const total = data.reduce((s, p) => s + p.value, 0);
                const pct = total > 0 ? ((d.data.value / total) * 100).toFixed(1) : '0';
                setTooltip({
                    visible: true,
                    x: event.pageX + 12,
                    y: event.pageY - 30,
                    content: `${d.data.label}: ${d.data.value} (${pct}%)`,
                });
            })
            .on('mousemove', function (event) {
                setTooltip((prev) => ({
                    ...prev,
                    x: event.pageX + 12,
                    y: event.pageY - 30,
                }));
            })
            .on('mouseleave', function () {
                d3.select(this)
                    .transition()
                    .duration(150)
                    .attr('transform', 'translate(0,0)');
                setTooltip((prev) => ({ ...prev, visible: false }));
            });

        // Value labels on slices
        if (showValues) {
            const labelArc = d3
                .arc<d3.PieArcDatum<ChartDataPoint>>()
                .innerRadius(rad * 0.6)
                .outerRadius(rad * 0.6);

            g.selectAll('.viz-pie-val')
                .data(pieGen(data))
                .enter()
                .append('text')
                .attr('class', 'viz-pie-val')
                .attr('transform', (d) => `translate(${labelArc.centroid(d)})`)
                .attr('text-anchor', 'middle')
                .attr('dominant-baseline', 'central')
                .attr('fill', '#fff')
                .attr('font-size', 11)
                .attr('font-weight', 600)
                .text((d) => d.data.value);
        }

        // Donut center total
        if (type === 'donut') {
            const total = data.reduce((s, p) => s + p.value, 0);
            g.append('text')
                .attr('text-anchor', 'middle')
                .attr('dominant-baseline', 'central')
                .attr('fill', 'hsl(var(--foreground))')
                .attr('font-size', 22)
                .attr('font-weight', 700)
                .text(total);

            g.append('text')
                .attr('text-anchor', 'middle')
                .attr('y', 22)
                .attr('fill', 'hsl(var(--muted-foreground))')
                .attr('font-size', 11)
                .text('Total');
        }

        // Legend
        if (showLegend) {
            const legendG = svg
                .append('g')
                .attr('transform', `translate(${width - legendWidth + 10}, ${cy - data.length * 12})`);

            data.forEach((d, i) => {
                const ly = i * 24;
                legendG
                    .append('rect')
                    .attr('x', 0)
                    .attr('y', ly)
                    .attr('width', 14)
                    .attr('height', 14)
                    .attr('rx', 3)
                    .attr('fill', getColor(i, d.color ?? color));

                legendG
                    .append('text')
                    .attr('x', 20)
                    .attr('y', ly + 11)
                    .attr('fill', 'hsl(var(--foreground))')
                    .attr('font-size', 12)
                    .text(d.label);
            });
        }
    }, [type, data, width, height, color, colors, animate, showValues, showLegend, donutRatio, title, palette]);

    return (
        <div className="flex flex-col items-center gap-2 p-4 bg-card rounded-xl border border-border/40 relative">
            <svg
                ref={svgRef}
                width={width}
                height={height}
                className="overflow-visible"
                viewBox={`0 0 ${width} ${height}`}
                style={{ maxWidth: '100%', height: 'auto' }}
            />
            {caption && (
                <p className="text-xs text-muted-foreground text-center mt-1">
                    {caption}
                </p>
            )}
            {/* Tooltip */}
            <div
                className="fixed z-50 px-3 py-1.5 text-sm text-white bg-gray-900 rounded-lg shadow-lg pointer-events-none transition-opacity duration-150"
                style={{
                    opacity: tooltip.visible ? 0.95 : 0,
                    left: tooltip.x,
                    top: tooltip.y,
                }}
            >
                {tooltip.content}
            </div>
        </div>
    );
};
