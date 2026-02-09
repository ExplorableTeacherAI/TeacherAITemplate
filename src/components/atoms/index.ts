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

// Basic Atoms
export { Spacer } from "./Spacer";
export { ModeIndicator } from "./ModeIndicator";
export { InfoTooltip } from "./InfoTooltip";
export { InlineDropdown } from "./InlineDropdown";
export { InlineTextInput } from "./InlineTextInput";
export { InlineScrubbleNumber } from "./InlineScrubbleNumber";
export {
    EditableH1,
    EditableH2,
    EditableH3,
    EditableH4,
    EditableH5,
    EditableH6,
    headingStyles
} from "./EditableHeadings";
export { EditableParagraph, EditableSpan } from "./EditableParagraph";
export { AnnotationOverlay } from "./AnnotationOverlay";
export { LoadingScreen } from "./LoadingScreen";

// Two.js Animation Components
export { AnimatedBackground } from "./AnimatedBackground";
export { MorphingShapes } from "./MorphingShapes";
export { ParticleSystem } from "./ParticleSystem";
export { AnimatedGraph } from "./AnimatedGraph";
export { CoordinateSystem } from "./CoordinateSystem";

// Three.js Components
export { ThreeCanvas } from "./ThreeCanvas";
export { ThreeCoordinateSystem } from "./ThreeCoordinateSystem";
export * from "./ThreeVisuals";

// Colored Equation Components
export { Equation } from "./Equation";
export {
    ColoredEquationProvider,
    ColoredEquation,
    HighlightedTerm,
    TermReveal
} from "./ColoredEquation";

// D3 Components
export { D3BarChart } from "./D3BarChart";
export type { D3BarChartProps, DataPoint } from "./D3BarChart";

// Mafs Components
export { MafsBasic } from "./MafsBasic";
export { MafsAnimated } from "./MafsAnimated";
export { MafsInteractive } from "./MafsInteractive";
export { MafsInteractiveDemo } from "./MafsInteractiveDemo";

// React Flow Components
export { FlowDiagram } from "./FlowDiagram";
export type { FlowNode, FlowEdge, FlowDiagramProps } from "./FlowDiagram";
export { ExpandableFlowDiagram } from "./ExpandableFlowDiagram";
export type { TreeNode, TreeEdge, ExpandableFlowDiagramProps } from "./ExpandableFlowDiagram";

// Interactive Highlight Components (unified bidirectional highlighting system)
export {
    InteractiveHighlightProvider,
    InteractiveText,
    useInteractiveHighlight,
    useActiveHighlight,
    useSetActiveHighlight,
    useHighlightState
} from "./InteractiveHighlight";
export type {
    HighlightStyle,
    InteractiveHighlightContextValue,
    InteractiveHighlightProviderProps,
    InteractiveTextProps
} from "./InteractiveHighlight";
