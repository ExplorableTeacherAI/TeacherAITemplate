import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

export interface DataPoint {
    label: string;
    value: number;
}

export interface D3BarChartProps {
    data: DataPoint[];
    width?: number;
    height?: number;
    color?: string;
}

export const D3BarChart: React.FC<D3BarChartProps> = ({
    data,
    width = 600,
    height = 400,
    color = "hsl(var(--primary))"
}) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const [tooltip, setTooltip] = useState<{ visible: boolean; x: number; y: number; content: string }>({
        visible: false,
        x: 0,
        y: 0,
        content: ''
    });

    useEffect(() => {
        if (!svgRef.current) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove(); // Clear previous render

        const margin = { top: 30, right: 30, bottom: 50, left: 60 };
        const chartWidth = width - margin.left - margin.right;
        const chartHeight = height - margin.top - margin.bottom;

        const g = svg.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // X Axis
        const x = d3.scaleBand()
            .domain(data.map(d => d.label))
            .range([0, chartWidth])
            .padding(0.2);

        g.append("g")
            .attr("transform", `translate(0,${chartHeight})`)
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-45)")
            .style("text-anchor", "end")
            .attr("class", "text-sm fill-muted-foreground");

        // Y Axis
        const y = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.value) || 0])
            .nice()
            .range([chartHeight, 0]);

        g.append("g")
            .call(d3.axisLeft(y).ticks(5))
            .selectAll("text")
            .attr("class", "text-sm fill-muted-foreground");

        // Grid lines
        g.append("g")
            .attr("class", "grid")
            .call(d3.axisLeft(y)
                .ticks(5)
                .tickSize(-chartWidth)
                .tickFormat(() => "")
            )
            .selectAll("line")
            .attr("stroke", "hsl(var(--border))")
            .attr("stroke-dasharray", "3,3");

        // Remove domain lines for cleaner look
        g.selectAll(".domain").remove();

        // Bars
        g.selectAll(".bar")
            .data(data)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", d => x(d.label)!)
            .attr("y", chartHeight) // Start at bottom for animation
            .attr("width", x.bandwidth())
            .attr("height", 0) // Start with height 0
            .attr("fill", color)
            .attr("rx", 4) // Rounded corners
            .transition()
            .duration(800)
            .delay((_d, i) => i * 50)
            .ease(d3.easeElastic)
            .attr("y", d => y(d.value))
            .attr("height", d => chartHeight - y(d.value));

        // Hover effects using React state for tooltip
        g.selectAll(".bar")
            .on("mouseenter", function (event, d: DataPoint) {
                d3.select(this)
                    .transition().duration(200)
                    .attr("fill", "hsl(var(--primary) / 0.8)");

                setTooltip({
                    visible: true,
                    x: event.pageX + 10,
                    y: event.pageY - 28,
                    content: `${d.label}: <b>${d.value}</b>`
                });
            })
            .on("mousemove", function (event) {
                setTooltip(prev => ({
                    ...prev,
                    x: event.pageX + 10,
                    y: event.pageY - 28
                }));
            })
            .on("mouseleave", function () {
                d3.select(this)
                    .transition().duration(200)
                    .attr("fill", color);
                setTooltip(prev => ({ ...prev, visible: false }));
            });

    }, [data, width, height, color]);

    return (
        <div className="flex justify-center p-4 relative">
            <svg
                ref={svgRef}
                width={width}
                height={height}
                className="overflow-visible"
                viewBox={`0 0 ${width} ${height}`}
            />
            {/* React-managed tooltip - no DOM manipulation */}
            <div
                className="fixed z-50 px-2 py-1 text-sm text-white bg-black rounded shadow pointer-events-none transition-opacity duration-200"
                style={{
                    opacity: tooltip.visible ? 0.9 : 0,
                    left: tooltip.x,
                    top: tooltip.y,
                }}
                dangerouslySetInnerHTML={{ __html: tooltip.content }}
            />
        </div>
    );
};
