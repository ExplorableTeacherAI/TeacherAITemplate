import React, { useMemo, useCallback, useEffect } from 'react';
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
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// ============================================================================
// TYPES
// ============================================================================

export interface FlowNode {
    id: string;
    label: string | React.ReactNode;
    position: { x: number; y: number };
    type?: 'default' | 'input' | 'output' | 'custom';
    style?: React.CSSProperties;
    data?: Record<string, unknown>;
}

export interface FlowEdge {
    id: string;
    source: string;
    target: string;
    label?: string;
    animated?: boolean;
    style?: React.CSSProperties;
    type?: 'default' | 'straight' | 'step' | 'smoothstep' | 'bezier';
}

export interface FlowDiagramProps {
    /** Array of nodes to display */
    nodes: FlowNode[];
    /** Array of edges connecting nodes */
    edges: FlowEdge[];
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
    /** Default node style */
    defaultNodeStyle?: React.CSSProperties;
    /** Default edge style */
    defaultEdgeStyle?: React.CSSProperties;
    /** Node border radius */
    nodeBorderRadius?: number;
    /** Callback when a node is clicked */
    onNodeClick?: (node: FlowNode) => void;
    /** Callback when an edge is clicked */
    onEdgeClick?: (edge: FlowEdge) => void;
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
};

// ============================================================================
// CUSTOM NODE COMPONENT
// ============================================================================

interface CustomNodeData {
    label: string | React.ReactNode;
    style?: React.CSSProperties;
    borderRadius?: number;
}

const CustomNode = ({ data }: NodeProps) => {
    const nodeData = data as unknown as CustomNodeData;

    const nodeStyle: React.CSSProperties = {
        padding: '12px 20px',
        background: defaultLightTheme.nodeBg,
        border: `1px solid ${defaultLightTheme.nodeBorder}`,
        borderRadius: nodeData.borderRadius ?? 8,
        color: defaultLightTheme.nodeText,
        fontSize: '14px',
        fontWeight: 500,
        boxShadow: defaultLightTheme.nodeShadow,
        minWidth: 80,
        textAlign: 'center' as const,
        cursor: 'grab',
        ...nodeData.style,
    };

    return (
        <div style={nodeStyle} className="nodrag-false">
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
        </div>
    );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const FlowDiagramInner: React.FC<FlowDiagramProps> = ({
    nodes: inputNodes,
    edges: inputEdges,
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
    fitViewPadding = 0.2,
    defaultNodeStyle,
    defaultEdgeStyle,
    nodeBorderRadius = 8,
    onNodeClick,
    onEdgeClick,
    className = '',
}) => {
    const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);

    // Convert input nodes to ReactFlow format
    const initialNodes: Node[] = useMemo(() =>
        inputNodes.map(node => ({
            id: node.id,
            position: node.position,
            type: 'custom',
            draggable: nodesDraggable,
            selectable: true,
            data: {
                label: node.label,
                style: { ...defaultNodeStyle, ...node.style },
                borderRadius: nodeBorderRadius,
                ...node.data,
            },
        })),
        [inputNodes, defaultNodeStyle, nodeBorderRadius, nodesDraggable]
    );

    // Convert input edges to ReactFlow format
    const initialEdges: Edge[] = useMemo(() =>
        inputEdges.map(edge => ({
            id: edge.id,
            source: edge.source,
            target: edge.target,
            label: edge.label,
            animated: edge.animated ?? false,
            type: edge.type ?? 'smoothstep',
            style: {
                stroke: defaultLightTheme.edgeColor,
                strokeWidth: 2,
                ...defaultEdgeStyle,
                ...edge.style,
            },
            labelStyle: {
                fill: defaultLightTheme.nodeText,
                fontSize: 12,
            },
            labelBgStyle: {
                fill: backgroundColor,
            },
        })),
        [inputEdges, defaultEdgeStyle, backgroundColor]
    );

    // Use React Flow's state management for interactivity
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    // Update nodes and edges when input props change
    useEffect(() => {
        setNodes(initialNodes);
    }, [initialNodes, setNodes]);

    useEffect(() => {
        setEdges(initialEdges);
    }, [initialEdges, setEdges]);

    // Background variant mapping
    const bgVariant = useMemo(() => {
        switch (backgroundVariant) {
            case 'lines': return BackgroundVariant.Lines;
            case 'cross': return BackgroundVariant.Cross;
            default: return BackgroundVariant.Dots;
        }
    }, [backgroundVariant]);

    // Handle node click
    const handleNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
        if (onNodeClick) {
            const originalNode = inputNodes.find(n => n.id === node.id);
            if (originalNode) onNodeClick(originalNode);
        }
    }, [onNodeClick, inputNodes]);

    // Handle edge click
    const handleEdgeClick = useCallback((_event: React.MouseEvent, edge: Edge) => {
        if (onEdgeClick) {
            const originalEdge = inputEdges.find(e => e.id === edge.id);
            if (originalEdge) onEdgeClick(originalEdge);
        }
    }, [onEdgeClick, inputEdges]);

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
                onNodeClick={handleNodeClick}
                onEdgeClick={handleEdgeClick}
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

// Wrap with ReactFlowProvider for proper context
export const FlowDiagram: React.FC<FlowDiagramProps> = (props) => (
    <ReactFlowProvider>
        <FlowDiagramInner {...props} />
    </ReactFlowProvider>
);

export default FlowDiagram;

