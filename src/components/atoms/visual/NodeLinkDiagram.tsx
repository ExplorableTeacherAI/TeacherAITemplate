import React, { useRef, useEffect, useState, useCallback, useMemo } from "react";
import * as d3 from "d3";
import { useVar, useSetVar } from "@/stores/variableStore";

// ============================================================================
// TYPES
// ============================================================================

export interface DiagramNode {
    /** Unique identifier for the node */
    id: string;
    /** Display label */
    label: string;
    /** Optional group/category for coloring */
    group?: string;
    /** Node color override (takes precedence over group color) */
    color?: string;
    /** Node radius (default: auto-computed from label length) */
    radius?: number;
    /** Fix the node at a specific position (prevents force movement) */
    fx?: number | null;
    fy?: number | null;
    /** Optional highlight ID for linked-highlight integration */
    highlightId?: string;
    /** Extra data attached to the node */
    data?: Record<string, unknown>;
}

export interface DiagramLink {
    /** Source node ID */
    source: string;
    /** Target node ID */
    target: string;
    /** Link label (displayed at midpoint) */
    label?: string;
    /** Link weight / strength (affects thickness and force) */
    weight?: number;
    /** Link color override */
    color?: string;
    /** Whether the link is directed (shows arrowhead) */
    directed?: boolean;
    /** Optional highlight ID for linked-highlight integration */
    highlightId?: string;
}

export interface NodeLinkDiagramProps {
    /** Array of nodes */
    nodes: DiagramNode[];
    /** Array of links between nodes */
    links: DiagramLink[];
    /** Height of the diagram (default: 400) */
    height?: number;
    /** Width — number or CSS string (default: '100%') */
    width?: number | string;
    /** Force simulation charge strength — negative values repel (default: -300) */
    chargeStrength?: number;
    /** Preferred link distance (default: 100) */
    linkDistance?: number;
    /** Center gravity strength (default: 0.1) */
    centerStrength?: number;
    /** Allow dragging nodes (default: true) */
    draggable?: boolean;
    /** Show link labels (default: true) */
    showLinkLabels?: boolean;
    /** Color palette for groups */
    groupColors?: Record<string, string>;
    /** Default node color when no group or color is set */
    defaultNodeColor?: string;
    /** Default link color */
    defaultLinkColor?: string;
    /** Minimum node radius (default: 20) */
    minNodeRadius?: number;
    /** Maximum node radius (default: 40) */
    maxNodeRadius?: number;
    /** Variable name for linked-highlight integration */
    highlightVarName?: string;
    /** Callback when a node is clicked */
    onNodeClick?: (node: DiagramNode) => void;
    /** Callback when a link is clicked */
    onLinkClick?: (link: DiagramLink) => void;
    /** Additional CSS class for container */
    className?: string;
    /** Show zoom/pan controls (default: false) */
    zoomable?: boolean;
    /** Whether link thickness scales with weight (default: true) */
    weightedLinks?: boolean;
    /** Show a subtle background grid (default: false) */
    showGrid?: boolean;
    /** Show container border (default: true) */
    showContainerBorder?: boolean;
}

// ============================================================================
// INTERNAL TYPES (D3 simulation)
// ============================================================================

interface SimNode extends d3.SimulationNodeDatum {
    id: string;
    label: string;
    group?: string;
    color?: string;
    radius: number;
    highlightId?: string;
    data?: Record<string, unknown>;
    _original: DiagramNode;
}

interface SimLink extends d3.SimulationLinkDatum<SimNode> {
    label?: string;
    weight: number;
    color?: string;
    directed: boolean;
    highlightId?: string;
    _original: DiagramLink;
}

// ============================================================================
// THEME
// ============================================================================

const theme = {
    background: "#ffffff",
    gridColor: "#f1f5f9",
    nodeFill: "#6366F1",
    nodeStroke: "#ffffff",
    nodeStrokeWidth: 2,
    nodeText: "#ffffff",
    nodeShadow: "drop-shadow(0 2px 4px rgba(0,0,0,0.12))",
    linkColor: "#cbd5e1",
    linkLabelColor: "#64748b",
    linkLabelBg: "#ffffff",
    hoverRing: "#818cf8",
    hoverRingWidth: 3,
    dimOpacity: 0.15,
    tooltipBg: "#1e293b",
    tooltipText: "#f8fafc",
};

const DEFAULT_GROUP_COLORS: Record<string, string> = {
    a: "#6366F1", // indigo
    b: "#EC4899", // pink
    c: "#14B8A6", // teal
    d: "#F59E0B", // amber
    e: "#EF4444", // red
    f: "#3B82F6", // blue
    g: "#22C55E", // green
    h: "#8B5CF6", // violet
};

// ============================================================================
// COMPONENT
// ============================================================================

export const NodeLinkDiagram: React.FC<NodeLinkDiagramProps> = ({
    nodes: inputNodes,
    links: inputLinks,
    height = 400,
    width = "100%",
    chargeStrength = -300,
    linkDistance = 100,
    centerStrength = 0.1,
    draggable = true,
    showLinkLabels = true,
    groupColors,
    defaultNodeColor = theme.nodeFill,
    defaultLinkColor = theme.linkColor,
    minNodeRadius = 20,
    maxNodeRadius = 40,
    highlightVarName,
    onNodeClick,
    onLinkClick,
    className = "",
    zoomable = false,
    weightedLinks = true,
    showGrid = false,
    showContainerBorder = false,
}) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const simulationRef = useRef<d3.Simulation<SimNode, SimLink> | null>(null);
    const [containerWidth, setContainerWidth] = useState<number>(
        typeof width === "number" ? width : 600
    );
    const [tooltip, setTooltip] = useState<{
        visible: boolean;
        x: number;
        y: number;
        label: string;
    }>({ visible: false, x: 0, y: 0, label: "" });

    // Linked highlight integration
    const activeHighlight = useVar(highlightVarName ?? "__noop__", null) as string | null;
    const setVar = useSetVar();

    const colors = useMemo(
        () => ({ ...DEFAULT_GROUP_COLORS, ...groupColors }),
        [groupColors]
    );

    // Resolve node color
    const getNodeColor = useCallback(
        (node: DiagramNode) => {
            if (node.color) return node.color;
            if (node.group && colors[node.group]) return colors[node.group];
            return defaultNodeColor;
        },
        [colors, defaultNodeColor]
    );

    // Compute node radius based on label length
    const getNodeRadius = useCallback(
        (node: DiagramNode) => {
            if (node.radius) return node.radius;
            const len = node.label.length;
            return Math.min(maxNodeRadius, Math.max(minNodeRadius, 10 + len * 3.5));
        },
        [minNodeRadius, maxNodeRadius]
    );

    // ── Observe container width ──────────────────────────────────────────────

    useEffect(() => {
        if (typeof width === "number") {
            setContainerWidth(width);
            return;
        }
        const el = containerRef.current;
        if (!el) return;
        const ro = new ResizeObserver((entries) => {
            for (const entry of entries) {
                setContainerWidth(entry.contentRect.width);
            }
        });
        ro.observe(el);
        return () => ro.disconnect();
    }, [width]);

    // ── Main D3 render ───────────────────────────────────────────────────────

    useEffect(() => {
        if (!svgRef.current || containerWidth === 0) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        const w = containerWidth;
        const h = height;

        // Build simulation data
        const simNodes: SimNode[] = inputNodes.map((n) => ({
            id: n.id,
            label: n.label,
            group: n.group,
            color: n.color,
            radius: getNodeRadius(n),
            highlightId: n.highlightId,
            data: n.data,
            fx: n.fx ?? undefined,
            fy: n.fy ?? undefined,
            _original: n,
        }));

        const nodeMap = new Map(simNodes.map((n) => [n.id, n]));

        const simLinks: SimLink[] = inputLinks
            .filter((l) => nodeMap.has(l.source) && nodeMap.has(l.target))
            .map((l) => ({
                source: l.source,
                target: l.target,
                label: l.label,
                weight: l.weight ?? 1,
                color: l.color,
                directed: l.directed ?? false,
                highlightId: l.highlightId,
                _original: l,
            }));

        // ── Defs ─────────────────────────────────────────────────────────────

        const defs = svg.append("defs");

        // Arrowhead marker
        defs
            .append("marker")
            .attr("id", "arrowhead")
            .attr("viewBox", "0 -5 10 10")
            .attr("refX", 10)
            .attr("refY", 0)
            .attr("markerWidth", 8)
            .attr("markerHeight", 8)
            .attr("orient", "auto")
            .append("path")
            .attr("d", "M0,-5L10,0L0,5")
            .attr("fill", defaultLinkColor);

        // Node drop shadow filter
        const filter = defs
            .append("filter")
            .attr("id", "node-shadow")
            .attr("x", "-50%")
            .attr("y", "-50%")
            .attr("width", "200%")
            .attr("height", "200%");
        filter
            .append("feDropShadow")
            .attr("dx", 0)
            .attr("dy", 1)
            .attr("stdDeviation", 2)
            .attr("flood-color", "rgba(0,0,0,0.12)");

        // ── Root group (for zoom/pan) ────────────────────────────────────────

        const root = svg.append("g");

        if (zoomable) {
            const zoomBehavior = d3
                .zoom<SVGSVGElement, unknown>()
                .scaleExtent([0.3, 4])
                .on("zoom", (event) => {
                    root.attr("transform", event.transform);
                });
            svg.call(zoomBehavior);
        }

        // ── Grid ─────────────────────────────────────────────────────────────

        if (showGrid) {
            const gridGroup = root.append("g").attr("class", "grid");
            const gridSpacing = 30;
            for (let x = 0; x < w; x += gridSpacing) {
                gridGroup
                    .append("line")
                    .attr("x1", x)
                    .attr("y1", 0)
                    .attr("x2", x)
                    .attr("y2", h)
                    .attr("stroke", theme.gridColor)
                    .attr("stroke-width", 1);
            }
            for (let y = 0; y < h; y += gridSpacing) {
                gridGroup
                    .append("line")
                    .attr("x1", 0)
                    .attr("y1", y)
                    .attr("x2", w)
                    .attr("y2", y)
                    .attr("stroke", theme.gridColor)
                    .attr("stroke-width", 1);
            }
        }

        // ── Links ────────────────────────────────────────────────────────────

        const linkGroup = root.append("g").attr("class", "links");

        const linkElements = linkGroup
            .selectAll<SVGLineElement, SimLink>("line")
            .data(simLinks)
            .join("line")
            .attr("stroke", (d) => d.color ?? defaultLinkColor)
            .attr("stroke-width", (d) =>
                weightedLinks ? Math.max(1.5, Math.min(6, d.weight * 2)) : 2
            )
            .attr("stroke-opacity", 0.6)
            .attr("marker-end", (d) => (d.directed ? "url(#arrowhead)" : ""))
            .style("cursor", onLinkClick ? "pointer" : "default")
            .on("click", (_event, d) => {
                if (onLinkClick) onLinkClick(d._original);
            });

        // Link labels
        let linkLabelElements: d3.Selection<
            SVGTextElement,
            SimLink,
            SVGGElement,
            unknown
        > | null = null;
        if (showLinkLabels) {
            const linkLabelGroup = root.append("g").attr("class", "link-labels");
            linkLabelElements = linkLabelGroup
                .selectAll<SVGTextElement, SimLink>("text")
                .data(simLinks.filter((l) => l.label))
                .join("text")
                .text((d) => d.label!)
                .attr("font-size", 11)
                .attr("font-family", "inherit")
                .attr("fill", theme.linkLabelColor)
                .attr("text-anchor", "middle")
                .attr("dy", -6)
                .attr("paint-order", "stroke")
                .attr("stroke", theme.linkLabelBg)
                .attr("stroke-width", 3)
                .attr("stroke-linecap", "round")
                .attr("stroke-linejoin", "round");
        }

        // ── Nodes ────────────────────────────────────────────────────────────

        const nodeGroup = root.append("g").attr("class", "nodes");

        const nodeElements = nodeGroup
            .selectAll<SVGGElement, SimNode>("g")
            .data(simNodes)
            .join("g")
            .attr("filter", "url(#node-shadow)")
            .style("cursor", draggable ? "grab" : onNodeClick ? "pointer" : "default");

        // Circle
        nodeElements
            .append("circle")
            .attr("r", (d) => d.radius)
            .attr("fill", (d) => getNodeColor(d._original))
            .attr("stroke", theme.nodeStroke)
            .attr("stroke-width", theme.nodeStrokeWidth);

        // Hover ring
        nodeElements
            .append("circle")
            .attr("class", "hover-ring")
            .attr("r", (d) => d.radius + theme.hoverRingWidth + 1)
            .attr("fill", "none")
            .attr("stroke", theme.hoverRing)
            .attr("stroke-width", theme.hoverRingWidth)
            .attr("stroke-opacity", 0);

        // Label
        nodeElements
            .append("text")
            .text((d) => d.label)
            .attr("text-anchor", "middle")
            .attr("dy", "0.35em")
            .attr("font-size", (d) => Math.max(10, Math.min(14, d.radius * 0.6)))
            .attr("font-weight", 500)
            .attr("font-family", "inherit")
            .attr("fill", theme.nodeText)
            .attr("pointer-events", "none");

        // ── Node interactions ────────────────────────────────────────────────

        nodeElements
            .on("mouseenter", function (_event, d) {
                d3.select(this)
                    .select(".hover-ring")
                    .transition()
                    .duration(150)
                    .attr("stroke-opacity", 0.6);

                // Dim non-connected elements
                const connectedIds = new Set<string>();
                connectedIds.add(d.id);
                simLinks.forEach((l) => {
                    const sid = String(
                        typeof l.source === "object" ? (l.source as SimNode).id : l.source
                    );
                    const tid = String(
                        typeof l.target === "object" ? (l.target as SimNode).id : l.target
                    );
                    if (sid === d.id) connectedIds.add(tid);
                    if (tid === d.id) connectedIds.add(sid);
                });

                nodeElements
                    .transition()
                    .duration(150)
                    .attr("opacity", (n) =>
                        connectedIds.has(n.id) ? 1 : theme.dimOpacity
                    );

                linkElements
                    .transition()
                    .duration(150)
                    .attr("stroke-opacity", (l) => {
                        const sid = typeof l.source === "object" ? (l.source as SimNode).id : l.source;
                        const tid = typeof l.target === "object" ? (l.target as SimNode).id : l.target;
                        return sid === d.id || tid === d.id ? 0.8 : 0.05;
                    });

                if (linkLabelElements) {
                    linkLabelElements
                        .transition()
                        .duration(150)
                        .attr("opacity", (l) => {
                            const sid = typeof l.source === "object" ? (l.source as SimNode).id : l.source;
                            const tid = typeof l.target === "object" ? (l.target as SimNode).id : l.target;
                            return sid === d.id || tid === d.id ? 1 : theme.dimOpacity;
                        });
                }

                // Set highlight variable
                if (highlightVarName && d.highlightId) {
                    setVar(highlightVarName, d.highlightId);
                }
            })
            .on("mouseleave", function () {
                d3.select(this)
                    .select(".hover-ring")
                    .transition()
                    .duration(200)
                    .attr("stroke-opacity", 0);

                nodeElements.transition().duration(200).attr("opacity", 1);
                linkElements.transition().duration(200).attr("stroke-opacity", 0.6);
                if (linkLabelElements) {
                    linkLabelElements.transition().duration(200).attr("opacity", 1);
                }

                if (highlightVarName) {
                    setVar(highlightVarName, null);
                }
            })
            .on("click", (_event, d) => {
                if (onNodeClick) onNodeClick(d._original);
            });

        // Tooltip on hover
        nodeElements
            .on("mousemove", (event, d) => {
                const rect = svgRef.current!.getBoundingClientRect();
                setTooltip({
                    visible: true,
                    x: event.clientX - rect.left,
                    y: event.clientY - rect.top - 12,
                    label: d.label,
                });
            })
            .on("mouseleave.tooltip", () => {
                setTooltip((t) => ({ ...t, visible: false }));
            });

        // ── Drag behavior ────────────────────────────────────────────────────

        if (draggable) {
            const dragBehavior = d3
                .drag<SVGGElement, SimNode>()
                .on("start", (event, d) => {
                    if (!event.active) simulation.alphaTarget(0.3).restart();
                    d.fx = d.x;
                    d.fy = d.y;
                    d3.select(event.sourceEvent.target.closest("g")).style(
                        "cursor",
                        "grabbing"
                    );
                })
                .on("drag", (event, d) => {
                    d.fx = event.x;
                    d.fy = event.y;
                })
                .on("end", (event, d) => {
                    if (!event.active) simulation.alphaTarget(0);
                    // Release unless originally fixed
                    if (
                        d._original.fx === undefined ||
                        d._original.fx === null
                    ) {
                        d.fx = null;
                        d.fy = null;
                    }
                    d3.select(event.sourceEvent.target.closest("g")).style(
                        "cursor",
                        "grab"
                    );
                });

            nodeElements.call(dragBehavior);
        }

        // ── Force simulation ─────────────────────────────────────────────────

        const simulation = d3
            .forceSimulation<SimNode>(simNodes)
            .force(
                "link",
                d3
                    .forceLink<SimNode, SimLink>(simLinks)
                    .id((d) => d.id)
                    .distance(linkDistance)
                    .strength((d) => Math.min(1, 0.3 + d.weight * 0.1))
            )
            .force(
                "charge",
                d3.forceManyBody<SimNode>().strength(chargeStrength)
            )
            .force("center", d3.forceCenter(w / 2, h / 2).strength(centerStrength))
            .force(
                "collision",
                d3.forceCollide<SimNode>().radius((d) => d.radius + 4)
            )
            .on("tick", () => {
                // Clamp nodes within viewBox
                simNodes.forEach((d) => {
                    d.x = Math.max(d.radius, Math.min(w - d.radius, d.x ?? w / 2));
                    d.y = Math.max(d.radius, Math.min(h - d.radius, d.y ?? h / 2));
                });

                linkElements
                    .attr("x1", (d) => (d.source as SimNode).x!)
                    .attr("y1", (d) => (d.source as SimNode).y!)
                    .attr("x2", (d) => {
                        if (!d.directed) return (d.target as SimNode).x!;
                        // Shorten for arrowhead
                        const src = d.source as SimNode;
                        const tgt = d.target as SimNode;
                        const dx = tgt.x! - src.x!;
                        const dy = tgt.y! - src.y!;
                        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                        return tgt.x! - (dx / dist) * tgt.radius;
                    })
                    .attr("y2", (d) => {
                        if (!d.directed) return (d.target as SimNode).y!;
                        const src = d.source as SimNode;
                        const tgt = d.target as SimNode;
                        const dx = tgt.x! - src.x!;
                        const dy = tgt.y! - src.y!;
                        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                        return tgt.y! - (dy / dist) * tgt.radius;
                    });

                if (linkLabelElements) {
                    linkLabelElements
                        .attr(
                            "x",
                            (d) =>
                                ((d.source as SimNode).x! +
                                    (d.target as SimNode).x!) /
                                2
                        )
                        .attr(
                            "y",
                            (d) =>
                                ((d.source as SimNode).y! +
                                    (d.target as SimNode).y!) /
                                2
                        );
                }

                nodeElements.attr(
                    "transform",
                    (d) => `translate(${d.x},${d.y})`
                );
            });

        simulationRef.current = simulation;

        return () => {
            simulation.stop();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        inputNodes,
        inputLinks,
        containerWidth,
        height,
        chargeStrength,
        linkDistance,
        centerStrength,
        draggable,
        showLinkLabels,
        defaultLinkColor,
        weightedLinks,
        zoomable,
        showGrid,
        getNodeColor,
        getNodeRadius,
    ]);

    // ── Linked highlight effect ──────────────────────────────────────────────

    useEffect(() => {
        if (!svgRef.current || !highlightVarName) return;
        const svg = d3.select(svgRef.current);

        if (activeHighlight) {
            svg
                .selectAll<SVGGElement, SimNode>("g.nodes > g")
                .transition()
                .duration(150)
                .attr("opacity", (d) =>
                    d.highlightId === activeHighlight ? 1 : theme.dimOpacity
                );

            svg
                .selectAll<SVGLineElement, SimLink>("g.links > line")
                .transition()
                .duration(150)
                .attr("stroke-opacity", (d) =>
                    d.highlightId === activeHighlight ? 0.8 : 0.05
                );
        } else {
            svg
                .selectAll<SVGGElement, SimNode>("g.nodes > g")
                .transition()
                .duration(200)
                .attr("opacity", 1);

            svg
                .selectAll<SVGLineElement, SimLink>("g.links > line")
                .transition()
                .duration(200)
                .attr("stroke-opacity", 0.6);
        }
    }, [activeHighlight, highlightVarName]);

    // ── Render ───────────────────────────────────────────────────────────────

    return (
        <div
            ref={containerRef}
            className={className}
            style={{
                width: typeof width === "number" ? width : "100%",
                height,
                position: "relative",
                borderRadius: 12,
                overflow: "hidden",
                background: theme.background,
                border: showContainerBorder ? "1px solid #e2e8f0" : "none",
            }}
        >
            <svg
                ref={svgRef}
                width={containerWidth}
                height={height}
                viewBox={`0 0 ${containerWidth} ${height}`}
                style={{ display: "block" }}
            />
            {/* Tooltip */}
            {tooltip.visible && (
                <div
                    style={{
                        position: "absolute",
                        left: tooltip.x,
                        top: tooltip.y,
                        transform: "translate(-50%, -100%)",
                        background: theme.tooltipBg,
                        color: theme.tooltipText,
                        padding: "4px 10px",
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 500,
                        pointerEvents: "none",
                        whiteSpace: "nowrap",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
                        zIndex: 10,
                    }}
                >
                    {tooltip.label}
                </div>
            )}
        </div>
    );
};

export default NodeLinkDiagram;
