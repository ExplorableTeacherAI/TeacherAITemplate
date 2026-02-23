import React, { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface MathTreeNode {
    id: string;
    label: string;
    value?: string;
    children?: MathTreeNode[];
    color?: string;
}

export interface MathTreeScaffoldStep {
    id: string;
    title: string;
    description: string;
    revealDepth?: number;
    focusNodeId?: string;
}

export interface MathTreeVisualizationProps {
    rootNode: MathTreeNode;
    scaffoldSteps?: MathTreeScaffoldStep[];
    currentStep?: number;
    width?: number | string;
    height?: number;
    nodeWidth?: number;
    nodeHeight?: number;
    horizontalGap?: number;
    verticalGap?: number;
    className?: string;
    showContainerBorder?: boolean;
    showScaffoldPanel?: boolean;
    onNodeClick?: (node: MathTreeNode) => void;
    onStepChange?: (step: number) => void;
}

type PositionedNode = {
    node: MathTreeNode;
    depth: number;
    xIndex: number;
    children: PositionedNode[];
};

const theme = {
    edge: "#94A3B8",
    nodeBg: "#F8FAFC",
    nodeBorder: "#CBD5E1",
    nodeText: "#0F172A",
    valueText: "#475569",
    focusBorder: "#3B82F6",
    focusBg: "#DBEAFE",
    stepDone: "#16A34A",
    stepCurrent: "#2563EB",
    stepPending: "#94A3B8",
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

function buildPositionedTree(
    node: MathTreeNode,
    revealDepth: number,
    depth = 0,
    leafCursorRef = { value: 0 }
): PositionedNode | null {
    if (depth > revealDepth) return null;

    const children = (node.children ?? [])
        .map((child) => buildPositionedTree(child, revealDepth, depth + 1, leafCursorRef))
        .filter((child): child is PositionedNode => child !== null);

    if (children.length === 0) {
        const leafX = leafCursorRef.value;
        leafCursorRef.value += 1;
        return {
            node,
            depth,
            xIndex: leafX,
            children: [],
        };
    }

    const xIndex = children.reduce((sum, child) => sum + child.xIndex, 0) / children.length;
    return {
        node,
        depth,
        xIndex,
        children,
    };
}

function flattenTree(root: PositionedNode): PositionedNode[] {
    const out: PositionedNode[] = [];
    const walk = (n: PositionedNode) => {
        out.push(n);
        n.children.forEach(walk);
    };
    walk(root);
    return out;
}

export const MathTreeVisualization: React.FC<MathTreeVisualizationProps> = ({
    rootNode,
    scaffoldSteps = [],
    currentStep = 1,
    width = "100%",
    height = 440,
    nodeWidth = 140,
    nodeHeight = 56,
    horizontalGap = 64,
    verticalGap = 92,
    className = "",
    showContainerBorder = false,
    showScaffoldPanel = true,
    onNodeClick,
    onStepChange,
}) => {
    const safeStepIndex = scaffoldSteps.length > 0
        ? clamp(Math.round(currentStep) - 1, 0, scaffoldSteps.length - 1)
        : 0;
    const activeStep = scaffoldSteps[safeStepIndex];
    const revealDepth = activeStep?.revealDepth ?? Number.POSITIVE_INFINITY;
    const focusNodeId = activeStep?.focusNodeId;

    const layout = useMemo(() => {
        const positionedRoot = buildPositionedTree(rootNode, revealDepth);
        if (!positionedRoot) return null;

        const allNodes = flattenTree(positionedRoot);
        const maxDepth = allNodes.reduce((max, n) => Math.max(max, n.depth), 0);
        const leafCount = Math.max(1, allNodes.filter((n) => n.children.length === 0).length);

        const sidePadding = 36;
        const topPadding = 28;
        const requiredWidth = sidePadding * 2 + leafCount * nodeWidth + (leafCount - 1) * horizontalGap;
        const baseWidth = typeof width === "number" ? width : 920;
        const viewWidth = Math.max(baseWidth, requiredWidth);

        const xScale = leafCount > 1
            ? (viewWidth - sidePadding * 2 - nodeWidth) / (leafCount - 1)
            : 0;

        const positionedMap = new Map<string, { x: number; y: number; node: PositionedNode }>();

        allNodes.forEach((n) => {
            const x = sidePadding + n.xIndex * xScale;
            const y = topPadding + n.depth * verticalGap;
            positionedMap.set(n.node.id, { x, y, node: n });
        });

        return {
            root: positionedRoot,
            allNodes,
            positionedMap,
            viewWidth,
            viewHeight: Math.max(height, topPadding * 2 + (maxDepth + 1) * verticalGap),
        };
    }, [rootNode, revealDepth, width, nodeWidth, horizontalGap, verticalGap, height]);

    if (!layout) return null;

    const canGoPrev = safeStepIndex > 0;
    const canGoNext = safeStepIndex < scaffoldSteps.length - 1;

    return (
        <div className={`w-full rounded-xl bg-card p-4 ${showContainerBorder ? "border" : ""} ${className}`}>
            <svg
                width={typeof width === "number" ? width : "100%"}
                height={layout.viewHeight}
                viewBox={`0 0 ${layout.viewWidth} ${layout.viewHeight}`}
            >
                {layout.allNodes.flatMap((entry) => {
                    const parentPos = layout.positionedMap.get(entry.node.id);
                    if (!parentPos) return [];
                    return entry.children.map((child) => {
                        const childPos = layout.positionedMap.get(child.node.id);
                        if (!childPos) return null;
                        const path = `M ${parentPos.x + nodeWidth / 2} ${parentPos.y + nodeHeight} C ${parentPos.x + nodeWidth / 2} ${parentPos.y + nodeHeight + 26}, ${childPos.x + nodeWidth / 2} ${childPos.y - 26}, ${childPos.x + nodeWidth / 2} ${childPos.y}`;
                        const isFocusEdge = focusNodeId === child.node.id || focusNodeId === entry.node.id;
                        return (
                            <path
                                key={`edge-${entry.node.id}-${child.node.id}`}
                                d={path}
                                fill="none"
                                stroke={isFocusEdge ? theme.focusBorder : theme.edge}
                                strokeWidth={isFocusEdge ? 2.5 : 1.8}
                                opacity={0.95}
                            />
                        );
                    }).filter((item): item is React.ReactElement => item !== null);
                })}

                {layout.allNodes.map((entry) => {
                    const pos = layout.positionedMap.get(entry.node.id);
                    if (!pos) return null;
                    const isFocused = focusNodeId === entry.node.id;
                    const fill = isFocused ? theme.focusBg : (entry.node.color ?? theme.nodeBg);
                    const stroke = isFocused ? theme.focusBorder : theme.nodeBorder;
                    return (
                        <g key={entry.node.id} onClick={() => onNodeClick?.(entry.node)} style={{ cursor: onNodeClick ? "pointer" : "default" }}>
                            <rect
                                x={pos.x}
                                y={pos.y}
                                width={nodeWidth}
                                height={nodeHeight}
                                rx={12}
                                fill={fill}
                                stroke={stroke}
                                strokeWidth={isFocused ? 2.6 : 1.4}
                            />
                            <text
                                x={pos.x + nodeWidth / 2}
                                y={pos.y + 24}
                                textAnchor="middle"
                                fill={theme.nodeText}
                                fontSize={13}
                                fontWeight={700}
                            >
                                {entry.node.label}
                            </text>
                            {entry.node.value && (
                                <text
                                    x={pos.x + nodeWidth / 2}
                                    y={pos.y + 42}
                                    textAnchor="middle"
                                    fill={theme.valueText}
                                    fontSize={12}
                                    fontWeight={500}
                                >
                                    {entry.node.value}
                                </text>
                            )}
                        </g>
                    );
                })}
            </svg>

            {onStepChange && scaffoldSteps.length > 0 && (
                <div className="mt-3 flex items-center justify-between gap-3">
                    <button
                        onClick={() => canGoPrev && onStepChange(safeStepIndex)}
                        disabled={!canGoPrev}
                        className="flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                    </button>
                    <span className="text-sm text-muted-foreground">
                        Step {safeStepIndex + 1} / {scaffoldSteps.length}
                    </span>
                    <button
                        onClick={() => canGoNext && onStepChange(safeStepIndex + 2)}
                        disabled={!canGoNext}
                        className="flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        Next
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            )}

            {showScaffoldPanel && scaffoldSteps.length > 0 && (
                <div className="mt-4 rounded-lg border bg-muted/30 p-3">
                    <div className="space-y-2">
                        {scaffoldSteps.map((step, index) => {
                            const isDone = index < safeStepIndex;
                            const isCurrent = index === safeStepIndex;
                            const dotColor = isCurrent
                                ? theme.stepCurrent
                                : isDone
                                    ? theme.stepDone
                                    : theme.stepPending;
                            return (
                                <div key={step.id} className="flex items-start gap-2">
                                    <div
                                        className="mt-1 h-2.5 w-2.5 rounded-full"
                                        style={{ backgroundColor: dotColor }}
                                    />
                                    <div className="text-sm">
                                        <div className="font-semibold text-foreground">{step.title}</div>
                                        <div className="text-muted-foreground">{step.description}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};
