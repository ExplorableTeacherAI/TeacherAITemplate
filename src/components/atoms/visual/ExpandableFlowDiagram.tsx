import React, { useMemo, useCallback, useState, useEffect } from 'react';
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    Handle,
    Position,
    Node,
    Edge,
    NodeProps,
    BackgroundVariant,
    ReactFlowProvider,
    useNodesState,
    useEdgesState,
    useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// ============================================================================
// TYPES
// ============================================================================

export interface TreeNode {
    id: string;
    label: string | React.ReactNode;
    position?: { x: number; y: number };
    style?: React.CSSProperties;
    data?: Record<string, unknown>;
    /** Child nodes that will be revealed on click */
    children?: TreeNode[];
    /** Whether this node starts expanded */
    expanded?: boolean;
}

export interface TreeEdge {
    id?: string;
    label?: string;
    animated?: boolean;
    style?: React.CSSProperties;
    type?: 'default' | 'straight' | 'step' | 'smoothstep' | 'bezier';
}

export interface ExpandableFlowDiagramProps {
    /** Root node of the tree */
    rootNode: TreeNode;
    /** Default edge style for all edges */
    defaultEdgeStyle?: TreeEdge;
    /** Height of the diagram container */
    height?: number | string;
    /** Width of the diagram container */
    width?: number | string;
    /** Background color */
    backgroundColor?: string;
    /** Show background grid/dots */
    showBackground?: boolean;
    /** Background variant: dots, lines, or cross */
    backgroundVariant?: 'dots' | 'lines' | 'cross';
    /** Background pattern color */
    backgroundColor2?: string;
    /** Show zoom/pan controls */
    showControls?: boolean;
    /** Show minimap */
    showMinimap?: boolean;
    /** Allow nodes to be dragged */
    nodesDraggable?: boolean;
    /** Allow panning */
    panOnDrag?: boolean;
    /** Allow zooming */
    zoomOnScroll?: boolean;
    /** Fit view on initial render */
    fitView?: boolean;
    /** Padding when fitting view */
    fitViewPadding?: number;
    /** Horizontal spacing between sibling nodes */
    horizontalSpacing?: number;
    /** Vertical spacing between parent and child nodes */
    verticalSpacing?: number;
    /** Callback when a node is clicked */
    onNodeClick?: (node: TreeNode, isExpanded: boolean) => void;
    /** Additional className for container */
    className?: string;
}

// ============================================================================
// DEFAULT LIGHT THEME STYLES
// ============================================================================

const defaultLightTheme = {
    background: '#ffffff',
    backgroundPattern: '#e2e8f0',
    nodeBg: '#ffffff',
    nodeBorder: '#e2e8f0',
    nodeText: '#1e293b',
    nodeShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    edgeColor: '#94a3b8',
    controlsBg: '#ffffff',
    controlsBorder: '#e2e8f0',
    minimapBg: '#f8fafc',
    minimapNode: '#94a3b8',
    expandableIndicator: '#3b82f6',
};

// ============================================================================
// CUSTOM NODE COMPONENT
// ============================================================================

interface CustomNodeData {
    label: string | React.ReactNode;
    style?: React.CSSProperties;
    hasChildren: boolean;
    isExpanded: boolean;
    onToggle: () => void;
}

const ExpandableNode = ({ data }: NodeProps) => {
    const nodeData = data as unknown as CustomNodeData;

    const nodeStyle: React.CSSProperties = {
        padding: '12px 20px',
        background: defaultLightTheme.nodeBg,
        border: `1px solid ${defaultLightTheme.nodeBorder}`,
        borderRadius: 8,
        color: defaultLightTheme.nodeText,
        fontSize: '14px',
        fontWeight: 500,
        boxShadow: defaultLightTheme.nodeShadow,
        minWidth: 80,
        textAlign: 'center' as const,
        cursor: nodeData.hasChildren ? 'pointer' : 'grab',
        position: 'relative' as const,
        ...nodeData.style,
    };

    const expandIndicatorStyle: React.CSSProperties = {
        position: 'absolute',
        bottom: -8,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 16,
        height: 16,
        borderRadius: '50%',
        background: defaultLightTheme.expandableIndicator,
        color: 'white',
        fontSize: '12px',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
    };

    return (
        <div style={nodeStyle} onClick={nodeData.hasChildren ? nodeData.onToggle : undefined}>
            <Handle
                type="target"
                position={Position.Top}
                style={{
                    background: defaultLightTheme.edgeColor,
                    border: 'none',
                    width: 8,
                    height: 8,
                }}
            />
            {nodeData.label}
            <Handle
                type="source"
                position={Position.Bottom}
                style={{
                    background: defaultLightTheme.edgeColor,
                    border: 'none',
                    width: 8,
                    height: 8,
                }}
            />
            {nodeData.hasChildren && (
                <div style={expandIndicatorStyle}>
                    {nodeData.isExpanded ? '−' : '+'}
                </div>
            )}
        </div>
    );
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Calculate positions for tree layout
const calculateNodePositions = (
    node: TreeNode,
    expandedNodes: Set<string>,
    x: number,
    y: number,
    horizontalSpacing: number,
    verticalSpacing: number
): { nodes: Array<TreeNode & { position: { x: number; y: number } }>; width: number } => {
    const result: Array<TreeNode & { position: { x: number; y: number } }> = [];

    // Add current node
    result.push({ ...node, position: { x, y } });

    // If node has children and is expanded, calculate their positions
    if (node.children && node.children.length > 0 && expandedNodes.has(node.id)) {
        let totalChildrenWidth = 0;
        const childResults: Array<{ nodes: Array<TreeNode & { position: { x: number; y: number } }>; width: number }> = [];

        // First pass: calculate widths of all subtrees
        for (const child of node.children) {
            const childResult = calculateNodePositions(
                child,
                expandedNodes,
                0, // temporary x
                y + verticalSpacing,
                horizontalSpacing,
                verticalSpacing
            );
            childResults.push(childResult);
            totalChildrenWidth += childResult.width;
        }

        // Add spacing between children
        totalChildrenWidth += (node.children.length - 1) * horizontalSpacing;

        // Second pass: assign actual x positions
        let currentX = x - totalChildrenWidth / 2;
        for (let i = 0; i < node.children.length; i++) {
            const childResult = childResults[i];
            const offsetX = currentX + childResult.width / 2;

            // Recalculate with correct position
            const repositioned = calculateNodePositions(
                node.children[i],
                expandedNodes,
                offsetX,
                y + verticalSpacing,
                horizontalSpacing,
                verticalSpacing
            );
            result.push(...repositioned.nodes);
            currentX += childResult.width + horizontalSpacing;
        }

        return { nodes: result, width: Math.max(100, totalChildrenWidth) };
    }

    return { nodes: result, width: 100 }; // Default node width
};

// Generate edges for visible nodes
const generateEdges = (
    node: TreeNode,
    expandedNodes: Set<string>,
    defaultEdgeStyle?: TreeEdge
): Edge[] => {
    const edges: Edge[] = [];

    if (node.children && node.children.length > 0 && expandedNodes.has(node.id)) {
        for (const child of node.children) {
            edges.push({
                id: `edge-${node.id}-${child.id}`,
                source: node.id,
                target: child.id,
                type: defaultEdgeStyle?.type ?? 'smoothstep',
                animated: defaultEdgeStyle?.animated ?? false,
                label: defaultEdgeStyle?.label,
                style: {
                    stroke: defaultLightTheme.edgeColor,
                    strokeWidth: 2,
                    ...defaultEdgeStyle?.style,
                },
            });

            // Recursively add edges for children
            edges.push(...generateEdges(child, expandedNodes, defaultEdgeStyle));
        }
    }

    return edges;
};

// Check if a node has children
const nodeHasChildren = (node: TreeNode): boolean => {
    return Boolean(node.children && node.children.length > 0);
};

// Get all initially expanded node IDs
const getInitiallyExpandedNodes = (node: TreeNode): Set<string> => {
    const expanded = new Set<string>();

    if (node.expanded && node.children) {
        expanded.add(node.id);
        for (const child of node.children) {
            const childExpanded = getInitiallyExpandedNodes(child);
            childExpanded.forEach(id => expanded.add(id));
        }
    }

    return expanded;
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const ExpandableFlowDiagramInner: React.FC<ExpandableFlowDiagramProps> = ({
    rootNode,
    defaultEdgeStyle,
    height = 400,
    width = '100%',
    backgroundColor = '#ffffff',
    showBackground = true,
    backgroundVariant = 'dots',
    backgroundColor2 = '#e2e8f0',
    showControls = true,
    showMinimap = false,
    nodesDraggable = true,
    panOnDrag = true,
    zoomOnScroll = true,
    fitView = true,
    fitViewPadding = 0.3,
    horizontalSpacing = 120,
    verticalSpacing = 100,
    onNodeClick,
    className = '',
}) => {
    const { fitView: fitViewFunc } = useReactFlow();

    // Track which nodes are expanded
    const [expandedNodes, setExpandedNodes] = useState<Set<string>>(() =>
        getInitiallyExpandedNodes(rootNode)
    );

    const nodeTypes = useMemo(() => ({ expandable: ExpandableNode }), []);

    // Toggle node expansion
    const toggleNode = useCallback((nodeId: string, treeNode: TreeNode) => {
        setExpandedNodes(prev => {
            const next = new Set(prev);
            const isExpanding = !next.has(nodeId);

            if (isExpanding) {
                next.add(nodeId);
            } else {
                next.delete(nodeId);
            }

            if (onNodeClick) {
                onNodeClick(treeNode, isExpanding);
            }

            return next;
        });
    }, [onNodeClick]);

    // Calculate visible nodes based on expansion state
    const visibleNodes = useMemo(() => {
        const { nodes } = calculateNodePositions(
            rootNode,
            expandedNodes,
            0,
            0,
            horizontalSpacing,
            verticalSpacing
        );
        return nodes;
    }, [rootNode, expandedNodes, horizontalSpacing, verticalSpacing]);

    // Convert to React Flow nodes
    const initialNodes: Node[] = useMemo(() =>
        visibleNodes.map(node => ({
            id: node.id,
            position: node.position,
            type: 'expandable',
            draggable: nodesDraggable,
            selectable: true,
            data: {
                label: node.label,
                style: node.style,
                hasChildren: nodeHasChildren(node),
                isExpanded: expandedNodes.has(node.id),
                onToggle: () => toggleNode(node.id, node),
            },
        })),
        [visibleNodes, nodesDraggable, expandedNodes, toggleNode]
    );

    // Generate edges
    const initialEdges: Edge[] = useMemo(() =>
        generateEdges(rootNode, expandedNodes, defaultEdgeStyle),
        [rootNode, expandedNodes, defaultEdgeStyle]
    );

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    // Update nodes and edges when they change
    useEffect(() => {
        setNodes(initialNodes);
        setEdges(initialEdges);
        // Fit view after expansion/collapse
        setTimeout(() => fitViewFunc({ padding: fitViewPadding }), 50);
    }, [initialNodes, initialEdges, setNodes, setEdges, fitViewFunc, fitViewPadding]);

    // Background variant mapping
    const bgVariant = useMemo(() => {
        switch (backgroundVariant) {
            case 'lines': return BackgroundVariant.Lines;
            case 'cross': return BackgroundVariant.Cross;
            default: return BackgroundVariant.Dots;
        }
    }, [backgroundVariant]);

    return (
        <div
            className={className}
            style={{
                width,
                height,
                borderRadius: 12,
                overflow: 'hidden',
            }}
        >
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodesDraggable={nodesDraggable}
                nodesConnectable={false}
                elementsSelectable={true}
                panOnDrag={panOnDrag}
                zoomOnScroll={zoomOnScroll}
                fitView={fitView}
                fitViewOptions={{ padding: fitViewPadding }}
                style={{ background: backgroundColor }}
                proOptions={{ hideAttribution: true }}
            >
                {showBackground && (
                    <Background
                        variant={bgVariant}
                        color={backgroundColor2}
                        gap={16}
                        size={1}
                    />
                )}
                {showControls && (
                    <Controls
                        style={{
                            background: defaultLightTheme.controlsBg,
                            border: `1px solid ${defaultLightTheme.controlsBorder}`,
                            borderRadius: 8,
                        }}
                    />
                )}
                {showMinimap && (
                    <MiniMap
                        style={{
                            background: defaultLightTheme.minimapBg,
                            border: `1px solid ${defaultLightTheme.controlsBorder}`,
                            borderRadius: 8,
                        }}
                        nodeColor={defaultLightTheme.minimapNode}
                    />
                )}
            </ReactFlow>
        </div>
    );
};

// Wrap with ReactFlowProvider
export const ExpandableFlowDiagram: React.FC<ExpandableFlowDiagramProps> = (props) => (
    <ReactFlowProvider>
        <ExpandableFlowDiagramInner {...props} />
    </ReactFlowProvider>
);

export default ExpandableFlowDiagram;
