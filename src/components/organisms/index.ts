// Visual choice carousel (phase-1 section builds; editor-mode only)
export { VisualOptionCards, type VisualOptionCard } from "./VisualOptionCards";

// Compatibility re-exports: Figure/FigureSlider live in molecules, but a
// generated section importing them from this barrel is a frequent mistake and
// a failed import blanks the entire lesson page. Re-exporting costs nothing
// and turns a page-killing crash into a harmless import-path variation.
export { Figure, FigureSlider } from "../molecules";

// Visualization Components
export { DesmosGraph } from "./visual/DesmosGraph";
export { GeoGebraGraph } from "./visual/GeoGebraGraph";
export { InteractiveAnimation } from "./visual/InteractiveAnimation";

// Renderer Components
export { default as DesmosRenderer } from "./visual/DesmosRenderer";
export { default as GeogebraRenderer } from "./visual/GeogebraRenderer";
export { default as ExcalidrawRenderer } from "./visual/ExcalidrawRenderer";
export { default as MermaidRenderer } from "./visual/MermaidRenderer";

// Editor Components
export { default as DiagramEditorDialog } from "./visual/DiagramEditorDialog";
