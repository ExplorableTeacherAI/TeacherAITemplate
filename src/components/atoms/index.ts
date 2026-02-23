// UI Components (from shadcn/ui)
export * from "./ui/accordion";
export * from "./ui/alert";
export * from "./ui/alert-dialog";
export * from "./ui/aspect-ratio";
export * from "./ui/avatar";
export * from "./ui/badge";
export * from "./ui/breadcrumb";
export * from "./ui/button";
export * from "./ui/calendar";
export * from "./ui/card";
export * from "./ui/carousel";
export * from "./ui/chart";
export * from "./ui/checkbox";
export * from "./ui/collapsible";
export * from "./ui/command";
export * from "./ui/context-menu";
export * from "./ui/dialog";
export * from "./ui/drawer";
export * from "./ui/dropdown-menu";
export * from "./ui/form";
export * from "./ui/hover-card";
export * from "./ui/input";
export * from "./ui/input-otp";
export * from "./ui/label";
export * from "./ui/menubar";
export * from "./ui/navigation-menu";
export * from "./ui/pagination";
export * from "./ui/popover";
export * from "./ui/progress";
export * from "./ui/radio-group";
export * from "./ui/resizable";
export * from "./ui/scroll-area";
export * from "./ui/select";
export * from "./ui/separator";
export * from "./ui/sheet";
export * from "./ui/sidebar";
export * from "./ui/skeleton";
export * from "./ui/slider";
export * from "./ui/switch";
export * from "./ui/table";
export * from "./ui/tabs";
export * from "./ui/textarea";
export * from "./ui/toggle";
export * from "./ui/toggle-group";
export * from "./ui/tooltip";
export * from "./ui/use-toast";

// Text Components
export { InlineClozeChoice } from "./text/InlineClozeChoice";
export { InlineClozeInput } from "./text/InlineClozeInput";
export { InlineToggle } from "./text/InlineToggle";
export { InlineTooltip } from "./text/InlineTooltip";
export { InlineTrigger } from "./text/InlineTrigger";
export { InlineHyperlink } from "./text/InlineHyperlink";
export { InlineScrubbleNumber } from "./text/InlineScrubbleNumber";
export { InlineSpotColor } from "./text/InlineSpotColor";
export { InlineLinkedHighlight } from "./text/InlineLinkedHighlight";
export {
    EditableH1,
    EditableH2,
    EditableH3,
    EditableH4,
    EditableH5,
    EditableH6,
    headingStyles
} from "./text/EditableHeadings";
export { EditableParagraph, EditableSpan } from "./text/EditableParagraph";
export { EditableText, withEditableText, useEditableTextContext } from "./text/EditableText";

// Formula Components
export { InlineFormula } from "./formula/InlineFormula";

// Visual — Two.js Animation Components
export { AnimatedBackground } from "./visual/AnimatedBackground";
export { MorphingShapes } from "./visual/MorphingShapes";
export { ParticleSystem } from "./visual/ParticleSystem";
export { AnimatedGraph } from "./visual/AnimatedGraph";
export { CoordinateSystem } from "./visual/CoordinateSystem";

// Visual — 2D Cartesian (Mafs-powered, primary 2D math component)
export { Cartesian2D } from "./visual/Cartesian2D";
export type {
    Cartesian2DProps,
    PlotItem,
    FunctionPlot,
    ParametricPlot,
    StaticPoint,
    VectorPlot,
    SegmentPlot,
    CirclePlot,
    MovablePointConfig,
} from "./visual/Cartesian2D";

// Visual — 3D Cartesian (Three.js-powered, primary 3D math component)
export { Cartesian3D } from "./visual/Cartesian3D";
export type {
    Cartesian3DProps,
    PlotItem3D,
    SurfacePlot3D,
    ParametricCurve3D,
    ParametricSurface3D,
    StaticPoint3D,
    VectorPlot3D,
    SegmentPlot3D,
    SpherePlot3D,
    PlanePlot3D,
    PolylinePlot3D,
    DraggablePoint3DConfig,
} from "./visual/Cartesian3D";

// Visual — Three.js Components
export { ThreeCanvas } from "./visual/ThreeCanvas";
export { ThreeCoordinateSystem } from "./visual/ThreeCoordinateSystem";
export * from "./visual/ThreeVisuals";

// Visual — D3 Components
export { D3BarChart } from "./visual/D3BarChart";
export type { D3BarChartProps, DataPoint } from "./visual/D3BarChart";

// Visual — Data Visualization (D3-powered multi-chart component)
export { DataVisualization } from "./visual/DataVisualization";
export type { DataVisualizationProps, ChartType, ChartDataPoint, ScatterDataPoint } from "./visual/DataVisualization";

// Visual — SVG Geometry Components
export { GeometricDiagram } from "./visual/GeometricDiagram";
export type { GeometricDiagramProps, GeometricVariant } from "./visual/GeometricDiagram";
export { VennDiagram } from "./visual/VennDiagram";
export type { VennDiagramProps } from "./visual/VennDiagram";
export { NumberLine } from "./visual/NumberLine";
export type { NumberLineProps } from "./visual/NumberLine";
export { MathTreeVisualization } from "./visual/MathTreeVisualization";
export type {
    MathTreeNode,
    MathTreeScaffoldStep,
    MathTreeVisualizationProps,
} from "./visual/MathTreeVisualization";

// Visual — Mafs Components
export { MafsBasic } from "./visual/MafsBasic";
export { MafsAnimated } from "./visual/MafsAnimated";
export { MafsInteractive } from "./visual/MafsInteractive";
export { MafsInteractiveDemo } from "./visual/MafsInteractiveDemo";

// Visual — React Flow Components
export { FlowDiagram } from "./visual/FlowDiagram";
export type { FlowNode, FlowEdge, FlowDiagramProps } from "./visual/FlowDiagram";
export { ExpandableFlowDiagram } from "./visual/ExpandableFlowDiagram";
export type { TreeNode, TreeEdge, ExpandableFlowDiagramProps } from "./visual/ExpandableFlowDiagram";

// Visual — Simulation Panel
export { SimulationPanel } from "./visual/SimulationPanel";
export type {
    SimulationPanelProps,
    SimulationControl,
    SliderControl,
    ToggleControl,
    ButtonControl,
    SelectControl,
    ButtonGroupControl,
} from "./visual/SimulationPanel";

// Visual — D3 Node-Link Diagram (force-directed graph)
export { NodeLinkDiagram } from "./visual/NodeLinkDiagram";
export type { DiagramNode, DiagramLink, NodeLinkDiagramProps } from "./visual/NodeLinkDiagram";

// Visual — Matrix Visualization
export { MatrixVisualization } from "./visual/MatrixVisualization";
export type { MatrixVisualizationProps } from "./visual/MatrixVisualization";

// Visual — Table
export { Table } from "./visual/Table";
export type { TableProps, TableColumn, TableRow } from "./visual/Table";

// Visual — Image Display
export { ImageDisplay } from "./visual/ImageDisplay";
export type { ImageDisplayProps, ImageFit } from "./visual/ImageDisplay";

// Visual — Video Display
export { VideoDisplay } from "./visual/VideoDisplay";
export type { VideoDisplayProps, VideoFit } from "./visual/VideoDisplay";
