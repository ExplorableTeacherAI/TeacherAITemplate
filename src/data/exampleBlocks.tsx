import { type ReactElement } from "react";
import { Block } from "@/components/templates";

// Initialize variables and their colors from example variable definitions (single source of truth)
import { useVariableStore, initializeVariableColors } from "@/stores";
import {
    exampleVariableDefinitions,
    getExampleDefaultValues,
    getExampleVariableInfo,
    numberPropsFromDefinition,
    clozePropsFromDefinition,
    choicePropsFromDefinition,
    togglePropsFromDefinition,
    spotColorPropsFromDefinition,
} from "./exampleVariables";
useVariableStore.getState().initialize(getExampleDefaultValues());
initializeVariableColors(exampleVariableDefinitions);

// Import layout components
import { StackLayout, SplitLayout } from "@/components/layouts";

// Import editable components
import {
    EditableH1,
    EditableH2,
    EditableH3,
    EditableParagraph,
    InlineScrubbleNumber,
    InlineClozeInput,
    InlineClozeChoice,
    InlineToggle,
    InlineTooltip,
    InlineTrigger,
    InlineHyperlink,
    InlineFormula,
    InlineSpotColor,
    InlineLinkedHighlight,
    Table,
    Cartesian2D,
    InteractionHintSequence,
} from "@/components/atoms";

// Import molecule components
import { FormulaBlock } from "@/components/molecules";

// Import store hooks
import { useVar, useSetVar } from "@/stores";
import { useEffect } from "react";

// Import section demos
import { cartesian2dDemo } from "./sections/cartesian2dDemo";
import { cartesian3dDemo } from "./sections/cartesian3dDemo";
import { nodeLinkDemo } from "./sections/nodeLinkDemo";
import { mathTreeDemo } from "./sections/mathTreeDemo";
import { circleAnatomyDemo } from "./sections/circleAnatomyDemo";
import { symmetryDrawingDemo } from "./sections/symmetryDrawingDemo";
import { geometricDiagramDemo } from "./sections/geometricDiagramDemo";
import { vennAndNumberLineDemo } from "./sections/vennAndNumberLineDemo";
import { matrixDemoBlocks } from "./sections/matrixDemo";
import { simulationDemoBlocks } from "./sections/simulationDemo";
import { layoutsDemoBlocks } from "./sections/layoutsDemo";
import { tableDemoBlocks } from "./sections/tableDemo";
import { dataVisualizationDemoBlocks } from "./sections/dataVisualizationDemo";
import { imageDisplayDemoBlocks } from "./sections/imageDisplayDemo";
import { videoDisplayDemoBlocks } from "./sections/videoDisplayDemo";
import { desmosDemoBlocks } from "./sections/desmosDemo";
import { inlineFeedbackDemoBlocks } from "./sections/inlineFeedbackDemo";
import { visualAssessmentDemoBlocks } from "./sections/visualAssessmentDemo";

/** Computes triangle area and writes it to the store */
function AreaCalculator() {
    const base = useVar('base', 3) as number;
    const height = useVar('height', 4) as number;
    const setVar = useSetVar();

    useEffect(() => {
        setVar('area', parseFloat((0.5 * base * height).toFixed(2)));
    }, [base, height, setVar]);

    return null;
}

/** Interactive right-triangle diagram — drag vertices to reshape, hover sides to highlight */
function ReactiveHighlightDiagram() {
    const activeId = useVar('activeHighlight', '') as string;

    return (
        <div className="relative">
            <Cartesian2D
                height={320}
                viewBox={{ x: [-1, 7], y: [-1, 6] }}
                highlightVarName="activeHighlight"
                movablePoints={[
                    {
                        initial: [1, 1],
                        color: "#64748b",
                        constrain: ([px, py]) => [Math.max(0, Math.min(6, px)), Math.max(0, Math.min(5, py))],
                    },
                    {
                        initial: [5, 1],
                        color: "#64748b",
                        constrain: ([px, py]) => [Math.max(0, Math.min(6, px)), Math.max(0, Math.min(5, py))],
                    },
                    {
                        initial: [5, 4],
                        color: "#64748b",
                        constrain: ([px, py]) => [Math.max(0, Math.min(6, px)), Math.max(0, Math.min(5, py))],
                    },
                ]}
                dynamicPlots={([pA, pB, pC]) => {
                    return [
                        // Adjacent (bottom) — from vertex A to vertex B
                        {
                            type: "segment" as const,
                            point1: pA,
                            point2: pB,
                            color: activeId === "adjacent" ? "#22c55e" : "#94a3b8",
                            weight: activeId === "adjacent" ? 5 : 2.5,
                            highlightId: "adjacent",
                        },
                        // Opposite (right) — from vertex B to vertex C
                        {
                            type: "segment" as const,
                            point1: pB,
                            point2: pC,
                            color: activeId === "opposite" ? "#3b82f6" : "#94a3b8",
                            weight: activeId === "opposite" ? 5 : 2.5,
                            highlightId: "opposite",
                        },
                        // Hypotenuse — from vertex A to vertex C
                        {
                            type: "segment" as const,
                            point1: pA,
                            point2: pC,
                            color: activeId === "hypotenuse" ? "#ef4444" : "#94a3b8",
                            weight: activeId === "hypotenuse" ? 5 : 2.5,
                            highlightId: "hypotenuse",
                        },
                        // Vertex points
                        { type: "point" as const, x: pA[0], y: pA[1], color: "#475569" },
                        { type: "point" as const, x: pB[0], y: pB[1], color: "#475569" },
                        { type: "point" as const, x: pC[0], y: pC[1], color: "#475569" },
                    ];
                }}
            />
            <InteractionHintSequence
                hintKey="highlight-triangle-drag"
                steps={[{
                    gesture: "drag",
                    label: "Drag any vertex to reshape the triangle — hover the labeled text to highlight each side",
                    position: { x: "50%", y: "40%" },
                }]}
            />
        </div>
    );
}

/**
 * Blocks configuration for the canvas.
 *
 * PROCEDURE: Define variables in src/data/exampleVariables.ts, then use them here
 * by varName. Use only exampleVariables.ts: getExampleVariableInfo(name) + numberPropsFromDefinition(...).
 * Same structure as blocks.tsx, which uses only variables.ts.
 *
 * This file contains examples for:
 * - Editing H tags (H1, H2, H3)
 * - Editing paragraphs
 * - Inline components (InlineScrubbleNumber) bound to global variables
 *
 * Each Block has a unique id for identification.
 * Each editable component within a Block also has its own unique id.
 *
 * Vite will watch this file for changes and hot-reload automatically.
 */

function ReactiveRadiusAreaValue() {
    const radius = useVar('radius', 5) as number;
    return <>{(radius * radius).toFixed(1)}</>;
}

function ReactiveToggleShapeText() {
    const shape = useVar('currentShape', 'triangle') as string;
    if (shape === 'square') return <span>has 4 equal sides and interior angles of 90°</span>;
    if (shape === 'pentagon') return <span>has 5 equal sides and interior angles of 108°</span>;
    if (shape === 'hexagon') return <span>has 6 equal sides and interior angles of 120°</span>;
    return <span>has 3 equal sides and interior angles of 60°</span>;
}

function ReactiveToggleMeasurementText() {
    const meas = useVar('measurementType', 'radius') as string;
    if (meas === 'diameter') return <span>is the length of a straight line passing from side to side through the center, exactly twice the radius</span>;
    if (meas === 'circumference') return <span>is the total perimeter distance around the boundary, calculated as 2πr</span>;
    return <span>is the straight-line distance from the exact center to any point on the boundary</span>;
}

const exampleBlocks: ReactElement[] = [
    <StackLayout key="layout-example-h1" maxWidth="xl">
        <Block id="example-h1" padding="md">
            <EditableH1 id="mathvibe-wiki-h1" blockId="example-h1">MathVibe Wiki</EditableH1>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-example-intro" maxWidth="xl">
        <Block id="example-intro" padding="sm">
            <EditableParagraph id="para-example-intro" blockId="example-intro">
                This is the wiki page for the Mathvibe project. It explains the components used in the project.
            </EditableParagraph>
        </Block>
    </StackLayout>,
    // ========================================
    // TABLE OF CONTENTS
    // ========================================
    <StackLayout key="layout-table-of-contents-header" maxWidth="xl">
        <Block id="table-of-contents-heading" padding="md">
            <EditableH2 id="h2-table-of-contents" blockId="table-of-contents-heading">
                Table of Contents
            </EditableH2>
        </Block>
    </StackLayout>,
    <StackLayout key="layout-table-of-contents-details" maxWidth="xl">
        <Block id="table-of-contents-details" padding="sm">
            <EditableParagraph id="para-toc-details" blockId="table-of-contents-details">
                Click any of the links in the table above to jump directly to that section of the document. Each section demonstrates different components ranging from basic editable text to complex interactive visualizations and layouts, providing a comprehensive overview of the MathVibe component library.
            </EditableParagraph>
        </Block>
    </StackLayout>,
    <StackLayout key="layout-example-table-editable-link" maxWidth="xl">
        <Block id="table-of-contents" padding="sm">
            <Table
                columns={[{ header: 'Section', align: 'left', width: '30%' }, { header: 'Description', align: 'left' }]}
                rows={[
                    { cells: [<InlineHyperlink id="link-editable-headings" showHint={false} targetBlockId="editable-headings">Editable Headings</InlineHyperlink>, 'Headings that can be edited in-place.'] },
                    { cells: [<InlineHyperlink id="link-editable-paragraphs" showHint={false} targetBlockId="editable-paragraphs-title">Editable Paragraphs</InlineHyperlink>, 'Paragraphs that can be edited in-place and allow to embed interactive elements within the text.'] },
                    { cells: [<div className="font-semibold"><InlineHyperlink id="link-toc-inline" showHint={false} targetBlockId="heading-inline-components">Inline Components</InlineHyperlink></div>, 'Embed dynamic components directly inside paragraph text.'] },
                    { cells: [<div className="ml-4 pl-4 border-l-2 border-gray-200"><InlineHyperlink id="link-toc-scrubble" showHint={false} targetBlockId="heading-scrubble-number">Scrubble Numbers</InlineHyperlink></div>, 'Drag to change numeric values reactively.'] },
                    { cells: [<div className="ml-4 pl-4 border-l-2 border-gray-200"><InlineHyperlink id="link-toc-cloze" showHint={false} targetBlockId="heading-h2-cloze">Cloze Inputs</InlineHyperlink></div>, 'Fill-in-the-blank text fields.'] },
                    { cells: [<div className="ml-4 pl-4 border-l-2 border-gray-200"><InlineHyperlink id="link-toc-choice" showHint={false} targetBlockId="heading-h2-cloze-choice">Cloze Choices</InlineHyperlink></div>, 'Dropdown fill-in-the-blank selector.'] },
                    { cells: [<div className="ml-4 pl-4 border-l-2 border-gray-200"><InlineHyperlink id="link-toc-ifd" showHint={false} targetBlockId="inline-feedback-title">Inline Feedback</InlineHyperlink></div>, 'Show textual feedback after submission.'] },
                    { cells: [<div className="ml-4 pl-4 border-l-2 border-gray-200"><InlineHyperlink id="link-toc-toggle" showHint={false} targetBlockId="heading-h2-toggle">Toggles</InlineHyperlink></div>, 'Clickable words that cycle through options.'] },
                    { cells: [<div className="ml-4 pl-4 border-l-2 border-gray-200"><InlineHyperlink id="link-toc-tooltip" showHint={false} targetBlockId="heading-h2-tooltip">Tooltips / Contextual Help</InlineHyperlink></div>, 'Hoverable words that reveal definitions.'] },
                    { cells: [<div className="ml-4 pl-4 border-l-2 border-gray-200"><InlineHyperlink id="link-toc-trigger" showHint={false} targetBlockId="heading-trigger">Triggers</InlineHyperlink></div>, 'Click to execute actions or set variables.'] },
                    { cells: [<div className="ml-4 pl-4 border-l-2 border-gray-200"><InlineHyperlink id="link-toc-hyperlink" showHint={false} targetBlockId="heading-hyperlink">Hyperlinks</InlineHyperlink></div>, 'Navigate to URLs or scroll to blocks.'] },
                    { cells: [<div className="ml-4 pl-4 border-l-2 border-gray-200"><InlineHyperlink id="link-toc-spotcolor" showHint={false} targetBlockId="heading-spotcolor">Spot Color</InlineHyperlink></div>, 'Highlights text mapped to a variable color.'] },
                    { cells: [<div className="ml-4 pl-4 border-l-2 border-gray-200"><InlineHyperlink id="link-toc-linkedhighlight" showHint={false} targetBlockId="heading-linkedhighlight">Linked Highlight</InlineHyperlink></div>, 'Hover text to highlight diagram parts.'] },
                    { cells: [<div className="font-semibold"><InlineHyperlink id="link-toc-formula-main" showHint={false} targetBlockId="heading-formula">Formula</InlineHyperlink></div>, 'Interactive KaTeX math expressions.'] },
                    { cells: [<div className="ml-4 pl-4 border-l-2 border-gray-200"><InlineHyperlink id="link-toc-formula-colored" showHint={false} targetBlockId="heading-formula-colored">Formula Colored Variables</InlineHyperlink></div>, 'Consistent coloring between text and math formulas.'] },
                    { cells: [<div className="ml-4 pl-4 border-l-2 border-gray-200"><InlineHyperlink id="link-toc-formula-scrubble" showHint={false} targetBlockId="heading-formula-scrubble">Formula Scrubble Variable</InlineHyperlink></div>, 'Draggable numbers inside math formulas.'] },
                    { cells: [<div className="ml-4 pl-4 border-l-2 border-gray-200"><InlineHyperlink id="link-toc-formula-cloze" showHint={false} targetBlockId="heading-formula-cloze">Formula Cloze Input</InlineHyperlink></div>, 'Fill-in-the-blank inputs within math formulas.'] },
                    { cells: [<div className="ml-4 pl-4 border-l-2 border-gray-200"><InlineHyperlink id="link-toc-formula-choice" showHint={false} targetBlockId="heading-formula-choice">Formula Cloze Choice</InlineHyperlink></div>, 'Dropdown selectors within math formulas.'] },
                    { cells: [<div className="ml-4 pl-4 border-l-2 border-gray-200"><InlineHyperlink id="link-toc-formula-highlight" showHint={false} targetBlockId="heading-formula-highlight">Formula Linked Highlight</InlineHyperlink></div>, 'Hover-to-highlight interactions in math formulas.'] },
                    { cells: [<div className="font-semibold"><InlineHyperlink id="link-toc-visualizations" showHint={false} targetBlockId="heading-visualizations">Visualizations</InlineHyperlink></div>, 'Interactive graphical components.'] },
                    { cells: [<div className="ml-4 pl-4 border-l-2 border-gray-200"><InlineHyperlink id="link-toc-cart2d" showHint={false} targetBlockId="cartesian-2d-header-title">2D Cartesian Graphing</InlineHyperlink></div>, 'Interactive 2D plots with coordinate logic.'] },
                    { cells: [<div className="ml-4 pl-4 border-l-2 border-gray-200"><InlineHyperlink id="link-toc-ca" showHint={false} targetBlockId="circle-anatomy-title">Circle Anatomy Diagram</InlineHyperlink></div>, 'Interactive SVG geometry basics.'] },
                    { cells: [<div className="ml-4 pl-4 border-l-2 border-gray-200"><InlineHyperlink id="link-toc-sym" showHint={false} targetBlockId="symmetry-header-title">Symmetry Drawing</InlineHyperlink></div>, 'Interactive symmetric drawing canvas.'] },
                    { cells: [<div className="ml-4 pl-4 border-l-2 border-gray-200"><InlineHyperlink id="link-toc-cart3d" showHint={false} targetBlockId="cartesian-3d-header-title">3D Cartesian Graphing</InlineHyperlink></div>, '3D math visualizations using Three.js.'] },
                    { cells: [<div className="ml-4 pl-4 border-l-2 border-gray-200"><InlineHyperlink id="link-toc-nl" showHint={false} targetBlockId="node-link-title">Node-Link Diagram</InlineHyperlink></div>, 'Force-directed graph visualizations.'] },
                    { cells: [<div className="ml-4 pl-4 border-l-2 border-gray-200"><InlineHyperlink id="link-toc-gd" showHint={false} targetBlockId="geometric-diagram-title">Geometric Diagram</InlineHyperlink></div>, 'Interactive generic geometric shapes.'] },
                    { cells: [<div className="ml-4 pl-4 border-l-2 border-gray-200"><InlineHyperlink id="link-toc-matrix" showHint={false} targetBlockId="matrix-title">Matrix Visualization</InlineHyperlink></div>, 'Interactive matrices and vectors.'] },
                    { cells: [<div className="ml-4 pl-4 border-l-2 border-gray-200"><InlineHyperlink id="link-toc-tables" showHint={false} targetBlockId="table-title">Data Tables</InlineHyperlink></div>, 'Render basic and interactive tables.'] },
                    { cells: [<div className="ml-4 pl-4 border-l-2 border-gray-200"><InlineHyperlink id="link-toc-dv" showHint={false} targetBlockId="data-visualization-title">Data Visualization</InlineHyperlink></div>, 'Bar charts, line charts, area charts, pies, and scatter plots.'] },
                    { cells: [<div className="ml-4 pl-4 border-l-2 border-gray-200"><InlineHyperlink id="link-toc-mt" showHint={false} targetBlockId="math-tree-title">Math Trees</InlineHyperlink></div>, 'AST and equation derivation trees.'] },
                    { cells: [<div className="ml-4 pl-4 border-l-2 border-gray-200"><InlineHyperlink id="link-toc-venn" showHint={false} targetBlockId="venn-numberline-title">Venn & Number Line</InlineHyperlink></div>, 'Diagrams for set theory and basic intervals.'] },
                    { cells: [<div className="ml-4 pl-4 border-l-2 border-gray-200"><InlineHyperlink id="link-toc-sim" showHint={false} targetBlockId="simulation-title">Simulation Panel</InlineHyperlink></div>, 'Controls, sliders, and buttons for dynamic examples.'] },
                    { cells: [<div className="ml-4 pl-4 border-l-2 border-gray-200"><InlineHyperlink id="link-toc-desmos" showHint={false} targetBlockId="desmos-title">Desmos Calculator</InlineHyperlink></div>, 'Embed fully interactive Desmos graphing calculators.'] },
                    { cells: [<div className="ml-4 pl-4 border-l-2 border-gray-200"><InlineHyperlink id="link-toc-visual-assessment" showHint={false} targetBlockId="visual-assessment-title">Tasks in Visualizations</InlineHyperlink></div>, 'Interactive tasks within visualizations.'] },
                    { cells: [<div className="font-semibold"><InlineHyperlink id="link-toc-media" showHint={false} targetBlockId="heading-media">Media Elements</InlineHyperlink></div>, 'Images and interactive video components.'] },
                    { cells: [<div className="ml-4 pl-4 border-l-2 border-gray-200"><InlineHyperlink id="link-toc-img" showHint={false} targetBlockId="image-title">Images</InlineHyperlink></div>, 'Display images with various fit and border modes.'] },
                    { cells: [<div className="ml-4 pl-4 border-l-2 border-gray-200"><InlineHyperlink id="link-toc-vid" showHint={false} targetBlockId="video-title">Video Display</InlineHyperlink></div>, 'Embed web videos interactively.'] },
                    { cells: [<div className="font-semibold"><InlineHyperlink id="link-toc-layouts" showHint={false} targetBlockId="demo-title">Layouts</InlineHyperlink></div>, 'Different layouting options available.'] },
                    { cells: [<div className="ml-4 pl-4 border-l-2 border-gray-200"><InlineHyperlink id="link-toc-layout-stack" showHint={false} targetBlockId="demo-full-width-heading">StackLayout</InlineHyperlink></div>, 'Vertical stack with adjustable gaps.'] },
                    { cells: [<div className="ml-4 pl-4 border-l-2 border-gray-200"><InlineHyperlink id="link-toc-layout-split" showHint={false} targetBlockId="demo-split-heading">SplitLayout</InlineHyperlink></div>, 'Side-by-side columns with configurable ratio.'] },
                    { cells: [<div className="ml-4 pl-4 border-l-2 border-gray-200"><InlineHyperlink id="link-toc-layout-grid" showHint={false} targetBlockId="demo-grid-heading">GridLayout</InlineHyperlink></div>, 'Multi-column balanced flow layout.'] },
                    { cells: [<div className="ml-4 pl-4 border-l-2 border-gray-200"><InlineHyperlink id="link-toc-layout-scroll" showHint={false} targetBlockId="demo-scroll-heading">ScrollytellingLayout</InlineHyperlink></div>, 'Scrollable text passing over a sticky visual.'] },
                    { cells: [<div className="ml-4 pl-4 border-l-2 border-gray-200"><InlineHyperlink id="link-toc-layout-slide" showHint={false} targetBlockId="demo-slide-heading">SlideLayout</InlineHyperlink></div>, 'Horizontal swipeable presentation slides.'] },
                    { cells: [<div className="ml-4 pl-4 border-l-2 border-gray-200"><InlineHyperlink id="link-toc-layout-step" showHint={false} targetBlockId="demo-step-heading">StepLayout</InlineHyperlink></div>, 'Vertical scrolling step-by-step disclosure.'] },
                ]}
                color="#6366f1"
                striped={true}
                bordered={true}
                compact={true}
            />
        </Block>
    </StackLayout>,
    // ========================================
    // EDITABLE HEADINGS DEMO
    // ========================================
    <StackLayout key="layout-divider-example-headings" maxWidth="xl">
        <Block id="divider-example-headings" padding="sm">
            <hr className="my-6 border-t border-gray-200" />
        </Block>
    </StackLayout>,
    <StackLayout key="layout-example-headings-h2" maxWidth="xl">
        <Block id="editable-headings" padding="md">
            <EditableH2 id="h2-example-headings" blockId="editable-headings">
                Editable headings
            </EditableH2>
        </Block>
    </StackLayout>,
    <StackLayout key="layout-headings-intro" maxWidth="xl">
        <Block id="headings-intro" padding="sm">
            <EditableParagraph id="para-headings-intro" blockId="headings-intro">
                Editable headings allow you to create semantic structure (like H1, H2, and H3) that can be clicked and edited directly in place. They are perfect for building flexible, user-modifiable documents and wikis.
            </EditableParagraph>
        </Block>
    </StackLayout>,
    <StackLayout key="layout-heading-main-title" maxWidth="xl">
        <Block id="heading-main-title" padding="sm">
            <EditableH1 id="h1-main-title" blockId="heading-main-title">
                Main Title (H1) - Click to Edit
            </EditableH1>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-heading-section" maxWidth="xl">
        <Block id="heading-section" padding="sm">
            <EditableH2 id="h2-section-heading" blockId="heading-section">
                Section Heading (H2) - Click to Edit
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-heading-subsection" maxWidth="xl">
        <Block id="heading-subsection" padding="sm">
            <EditableH3 id="h3-subsection-heading" blockId="heading-subsection">
                Subsection Heading (H3) - Click to Edit
            </EditableH3>
        </Block>
    </StackLayout>,

    // ========================================
    // EDITABLE PARAGRAPHS DEMO
    // ========================================
    <StackLayout key="layout-divider-example-paragraphs" maxWidth="xl">
        <Block id="divider-example-paragraphs" padding="sm">
            <hr className="my-6 border-t border-gray-200" />
        </Block>
    </StackLayout>,
    <StackLayout key="layout-heading-paragraphs" maxWidth="xl">
        <Block id="editable-paragraphs-title" padding="sm">
            <EditableH2 id="h2-paragraphs-title" blockId="editable-paragraphs-title">
                Editable Paragraphs
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-paragraph-intro" maxWidth="xl">
        <Block id="paragraph-intro" padding="sm">
            <EditableParagraph id="para-intro-primary" blockId="paragraph-intro">
                This is an editable paragraph. Click on it to start editing the text.
                You can modify the content directly in-place.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-paragraph-independent" maxWidth="xl">
        <Block id="paragraph-independent" padding="sm">
            <EditableParagraph id="para-intro-secondary" blockId="paragraph-independent">
                Additionally, these paragraphs allow you to seamlessly embed interactive inline components within the text. You can explore these capabilities in the{" "}
                <InlineHyperlink id="link-inline-components" targetBlockId="heading-inline-components">Inline Components</InlineHyperlink> section. You can manually add an inline component by typing "/" in any paragraph to open the command menu, then selecting the component you want.
                You can also type part of a component's name to quickly filter the menu. For example, typing "/scrub" will instantly narrow the list down so you can easily select the <InlineHyperlink id="link-scrubble-number" targetBlockId="heading-scrubble-number">scrubble number component</InlineHyperlink>.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // ========================================
    // INLINE COMPONENTS DEMO
    // ========================================
    <StackLayout key="layout-divider-example-inline-components" maxWidth="xl">
        <Block id="divider-example-inline-components" padding="sm">
            <hr className="my-6 border-t border-gray-200" />
        </Block>
    </StackLayout>,
    <StackLayout key="layout-heading-inline-components" maxWidth="xl">
        <Block id="heading-inline-components" padding="sm">
            <EditableH2 id="h2-inline-title" blockId="heading-inline-components">
                Inline Components
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-paragraph-inline-components-intro" maxWidth="xl">
        <Block id="paragraph-inline-components-intro" padding="sm">
            <EditableParagraph id="para-inline-components-intro" blockId="paragraph-inline-components-intro">
                Inline components are interactive elements that flow seamlessly within your text. They allow learners to manipulate variables, answer questions, and discover hints without breaking their reading flow.
            </EditableParagraph>
        </Block>
    </StackLayout>,


    <StackLayout key="layout-heading-scrubble-number" maxWidth="xl">
        <Block id="heading-scrubble-number" padding="sm">
            <EditableH3 id="h3-scrubble-number" blockId="heading-scrubble-number">
                Scrubble Number (Drag to change value)
            </EditableH3>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-paragraph-inline-intro" maxWidth="xl">
        <Block id="paragraph-inline-intro" padding="sm">
            <EditableParagraph id="para-inline-intro" blockId="paragraph-inline-intro">
                Scrubble numbers allow you to seamlessly change the value of a variable by clicking and dragging left or right. They are styled with an underline and inherit the color from their variable definition.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // Inline scrubble number examples (use global vars from exampleVariables.ts)
    <StackLayout key="layout-paragraph-scrubble-radius" maxWidth="xl">
        <Block id="paragraph-scrubble-radius" padding="sm">
            <EditableParagraph id="para-radius-example" blockId="paragraph-scrubble-radius">
                The circle has a radius of{" "}
                <InlineScrubbleNumber
                    id="scrubble-radius"
                    varName="radius"
                    {...numberPropsFromDefinition(getExampleVariableInfo('radius'))}
                />
                {" "}units, giving it an area proportional to <ReactiveRadiusAreaValue /> (r²).
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-paragraph-scrubble-temperature" maxWidth="xl">
        <Block id="paragraph-scrubble-temperature" padding="sm">
            <EditableParagraph id="para-temperature-example" blockId="paragraph-scrubble-temperature">
                With a temperature of{" "}
                <InlineScrubbleNumber
                    id="scrubble-temperature"
                    varName="temperature"
                    {...numberPropsFromDefinition(getExampleVariableInfo('temperature'))}
                    formatValue={(v) => `${v}°C`}
                />
                {", "}the reaction rate will adjust accordingly.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-paragraph-scrubble-count" maxWidth="xl">
        <Block id="paragraph-scrubble-count" padding="sm">
            <EditableParagraph id="para-count-example" blockId="paragraph-scrubble-count">
                There are{" "}
                <InlineScrubbleNumber
                    id="scrubble-count"
                    varName="count"
                    {...numberPropsFromDefinition(getExampleVariableInfo('count'))}
                />
                {" "}items in the collection. Try dragging the number to adjust.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-paragraph-scrubble-exponent" maxWidth="xl">
        <Block id="paragraph-scrubble-exponent" padding="sm">
            <EditableParagraph id="para-exponent-example" blockId="paragraph-scrubble-exponent">
                The power expression{" "}
                <InlineScrubbleNumber
                    id="scrubble-base"
                    varName="base"
                    defaultValue={5}
                    min={1}
                    max={10}
                    step={1}
                    color="#8E90F5"
                />
                <sup>
                    <InlineScrubbleNumber
                        id="scrubble-exponent"
                        varName="exponent"
                        defaultValue={2}
                        min={1}
                        max={5}
                        step={1}
                        color="#F7B23B"
                    />
                </sup>
                {" "}demonstrates how scrubble numbers work with exponents. The underline stays at the text baseline.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // ========================================
    // CLOZE INPUT (Fill-in-the-blank) DEMO
    // ========================================
    <StackLayout key="layout-heading-h2-cloze" maxWidth="xl">
        <Block id="heading-h2-cloze" padding="sm">
            <EditableH3 id="h2-cloze-title" blockId="heading-h2-cloze">
                Cloze Inputs (Fill-in-the-Blank)
            </EditableH3>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-paragraph-cloze-intro" maxWidth="xl">
        <Block id="paragraph-cloze-intro" padding="sm">
            <EditableParagraph id="para-cloze-intro" blockId="paragraph-cloze-intro">
                Cloze inputs allow you to embed fill-in-the-blank questions directly into the flow of reading. They evaluate the answer once you submit—by pressing Enter, clicking away, or when your input perfectly matches the correct answer. This provides a seamless way to test knowledge without breaking the narrative.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-paragraph-cloze-angle" maxWidth="xl">
        <Block id="paragraph-cloze-angle" padding="sm">
            <EditableParagraph id="para-cloze-angle" blockId="paragraph-cloze-angle">
                A circle split into four equal parts gives a quarter circle, which has an angle of{" "}
                <InlineClozeInput
                    id="cloze-quarter-circle-angle"
                    varName="quarterCircleAngle"
                    correctAnswer="90"
                    {...clozePropsFromDefinition(getExampleVariableInfo('quarterCircleAngle'))}
                />
                {" "}degrees. This specific angle is fundamental in geometry, representing exactly one-fourth of a complete 360-degree rotation.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-paragraph-cloze-unit" maxWidth="xl">
        <Block id="paragraph-cloze-unit" padding="sm">
            <EditableParagraph id="para-cloze-unit" blockId="paragraph-cloze-unit">
                When measuring how often a repeating event occurs over time, we use the SI unit of frequency. It is expressed in{" "}
                <InlineClozeInput
                    id="cloze-wave-unit"
                    varName="waveUnit"
                    correctAnswer="Hertz"
                    {...clozePropsFromDefinition(getExampleVariableInfo('waveUnit'))}
                />
                {", "}which is frequently abbreviated as 'Hz' in scientific equations.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // ========================================
    // CLOZE CHOICES (Dropdown Fill-in-the-Blank)
    // ========================================
    <StackLayout key="layout-heading-h2-cloze-choice" maxWidth="xl">
        <Block id="heading-h2-cloze-choice" padding="sm">
            <EditableH3 id="h2-cloze-choice-title" blockId="heading-h2-cloze-choice">
                Cloze Choices (Dropdown Fill-in-the-Blank)
            </EditableH3>
        </Block>
    </StackLayout>,
    <StackLayout key="layout-paragraph-choice-intro" maxWidth="xl">
        <Block id="paragraph-choice-intro" padding="sm">
            <EditableParagraph id="para-choice-intro" blockId="paragraph-choice-intro">
                Cloze choices act as dropdown menus embedded directly in the text. They provide a constrained set of options, allowing you to test learners on categorical knowledge. Like cloze inputs, they evaluate the answer immediately upon selection.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-paragraph-choice-shape" maxWidth="xl">
        <Block id="paragraph-choice-shape" padding="sm">
            <EditableParagraph id="para-choice-shape" blockId="paragraph-choice-shape">
                The mathematical definition of a sphere is fundamentally identical to that of a{" "}
                <InlineClozeChoice
                    id="choice-shape-answer"
                    varName="shapeAnswer"
                    correctAnswer="circle"
                    options={["cube", "circle", "square", "triangle"]}
                    {...choicePropsFromDefinition(getExampleVariableInfo('shapeAnswer'))}
                />
                {", "}except that it extends into three dimensions instead of being confined to a flat plane.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-paragraph-choice-wave" maxWidth="xl">
        <Block id="paragraph-choice-wave" padding="sm">
            <EditableParagraph id="para-choice-wave" blockId="paragraph-choice-wave">
                When studying the electromagnetic spectrum, we model light as having perpendicular oscillations. Therefore, light waves are a perfect example of{" "}
                <InlineClozeChoice
                    id="choice-wave-type"
                    varName="waveTypeAnswer"
                    correctAnswer="transverse"
                    options={["transverse", "longitudinal", "surface"]}
                    {...choicePropsFromDefinition(getExampleVariableInfo('waveTypeAnswer'))}
                />
                {" "}waves, unlike sound waves which compress and expand parallel to their direction of travel.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // ========================================
    // INLINE FEEDBACK DEMO
    // ========================================
    ...inlineFeedbackDemoBlocks,

    // ========================================
    // TOGGLE DEMO (Click to Cycle)
    // ========================================
    <StackLayout key="layout-heading-h2-toggle" maxWidth="xl">
        <Block id="heading-h2-toggle" padding="sm">
            <EditableH3 id="h2-toggle-title" blockId="heading-h2-toggle">
                Toggle (Click to Cycle)
            </EditableH3>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-paragraph-toggle-intro" maxWidth="xl">
        <Block id="paragraph-toggle-intro" padding="sm">
            <EditableParagraph id="para-toggle-intro" blockId="paragraph-toggle-intro">
                Toggles act as clickable interactive words that instantly cycle through a predefined list of options. They are excellent for letting readers explore related concepts without leaving the flow of the text. As you click a toggle, the rest of the sentence can react dynamically to match your selection.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-paragraph-toggle-shapes" maxWidth="xl">
        <Block id="paragraph-toggle-shapes" padding="sm">
            <EditableParagraph id="para-toggle-shapes" blockId="paragraph-toggle-shapes">
                By changing the number of sides, we can define different regular polygons. For example, a regular{" "}
                <InlineToggle
                    id="toggle-current-shape"
                    varName="currentShape"
                    options={["triangle", "square", "pentagon", "hexagon"]}
                    {...togglePropsFromDefinition(getExampleVariableInfo('currentShape'))}
                />
                {" "}<ReactiveToggleShapeText />. Click the shape name to cycle through other options and see its properties change.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-paragraph-toggle-measurement" maxWidth="xl">
        <Block id="paragraph-toggle-measurement" padding="sm">
            <EditableParagraph id="para-toggle-measurement" blockId="paragraph-toggle-measurement">
                A circle has three fundamental 1-dimensional measurements. The{" "}
                <InlineToggle
                    id="toggle-measurement-type"
                    varName="measurementType"
                    options={["radius", "diameter", "circumference"]}
                    {...togglePropsFromDefinition(getExampleVariableInfo('measurementType'))}
                />
                {" "}<ReactiveToggleMeasurementText />. Try clicking the measurement to explore the other definitions!
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // ========================================
    // TOOLTIP DEMO (Hover to Reveal)
    // ========================================
    <StackLayout key="layout-heading-h2-tooltip" maxWidth="xl">
        <Block id="heading-h2-tooltip" padding="sm">
            <EditableH3 id="h2-tooltip-title" blockId="heading-h2-tooltip">
                Tooltip/Contexual Help (Hover to Reveal)
            </EditableH3>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-paragraph-tooltip-intro" maxWidth="xl">
        <Block id="paragraph-tooltip-intro" padding="sm">
            <EditableParagraph id="para-tooltip-intro" blockId="paragraph-tooltip-intro">
                Tooltips provide rapid, contextual definitions without cluttering the main text or forcing the reader to navigate to a glossary. They are triggered purely by hovering your mouse over a colored term.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-paragraph-tooltip-circle" maxWidth="xl">
        <Block id="paragraph-tooltip-circle" padding="sm">
            <EditableParagraph id="para-tooltip-circle" blockId="paragraph-tooltip-circle">
                In geometry, measuring a{" "}
                <InlineTooltip id="tooltip-circle-def" tooltip="A perfect 2D shape where every point on the boundary is identically distanced from the center.">
                    circle
                </InlineTooltip>
                {" "}requires understanding its core properties. The most fundamental of these is the{" "}
                <InlineTooltip id="tooltip-radius-def" tooltip="The straight-line distance from the exact center of a circle to any point on its boundary.">
                    radius
                </InlineTooltip>
                , which acts as the building block for all other circular formulas.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-paragraph-tooltip-physics" maxWidth="xl">
        <Block id="paragraph-tooltip-physics" padding="sm">
            <EditableParagraph id="para-tooltip-physics" blockId="paragraph-tooltip-physics">
                When analyzing physical motion, we use{" "}
                <InlineTooltip
                    id="tooltip-vectors-def"
                    tooltip="A mathematical entity that possesses both magnitude (size) and direction, represented visually by an arrow."
                    color="#3B82F6"
                >
                    vectors
                </InlineTooltip>
                {" "}to describe forces. If a net force is applied to an object, it will cause a proportional{" "}
                <InlineTooltip
                    id="tooltip-acceleration-def"
                    tooltip="The continuous rate of change of an object's velocity over time, measured in meters per second squared (m/s²)."
                    color="#10B981"
                >
                    acceleration
                </InlineTooltip>
                , perfectly aligned with the direction of that applied force.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // ========================================
    // TRIGGER (CLICK TO SET VARIABLE) DEMO
    // ========================================
    <StackLayout key="layout-heading-trigger" maxWidth="xl">
        <Block id="heading-trigger" padding="md">
            <EditableH3 id="h3-trigger-title" blockId="heading-trigger">
                Trigger (Click to set variable)
            </EditableH3>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-trigger-intro" maxWidth="xl">
        <Block id="trigger-intro" padding="sm">
            <EditableParagraph id="para-trigger-intro" blockId="trigger-intro">
                Triggers act as interactive buttons embedded directly within your text. They are designed to instantly snap a global variable to a specific, predefined value when clicked. This is exceptionally useful for quickly resetting simulations or jumping between key states.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-trigger-example" maxWidth="xl">
        <Block id="trigger-example" padding="sm">
            <EditableParagraph id="para-trigger-example" blockId="trigger-example">
                Try dragging the simulation speed to a custom value:{" "}
                <InlineScrubbleNumber
                    id="scrubble-animation-speed"
                    varName="animationSpeed"
                    {...numberPropsFromDefinition(getExampleVariableInfo('animationSpeed'))}
                    formatValue={(v) => `${v.toFixed(1)}x`}
                />
                . Once you lose track of the original pace, you can easily{" "}
                <InlineTrigger id="trigger-speed-reset" varName="animationSpeed" value={1}>
                    restore the default speed
                </InlineTrigger>{" "}
                or instantly{" "}
                <InlineTrigger id="trigger-speed-max" varName="animationSpeed" value={5}>
                    maximize the velocity
                </InlineTrigger>{" "}
                with a single click.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // ========================================
    // HYPERLINK (CLICK TO NAVIGATE) DEMO
    // ========================================
    <StackLayout key="layout-heading-hyperlink" maxWidth="xl">
        <Block id="heading-hyperlink" padding="md">
            <EditableH3 id="h3-hyperlink-title" blockId="heading-hyperlink">
                Hyperlink (Click to Navigate)
            </EditableH3>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-hyperlink-intro" maxWidth="xl">
        <Block id="hyperlink-intro" padding="sm">
            <EditableParagraph id="para-hyperlink-intro" blockId="hyperlink-intro">
                Hyperlinks securely integrate external resources and connect distant parts of the same lesson. Depending on their configuration, they can either instantly open web resources in a new browser tab or smoothly scroll the reader to a related section on the immediate page.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-hyperlink-examples" maxWidth="xl">
        <Block id="hyperlink-examples" padding="sm">
            <EditableParagraph id="para-hyperlink-examples" blockId="hyperlink-examples">
                For a comprehensive mathematical breakdown, you can dive into the{" "}
                <InlineHyperlink id="link-wikipedia-circles" href="https://en.wikipedia.org/wiki/Circle">
                    Wikipedia article on circles
                </InlineHyperlink>
                . Alternatively, if you want to review how interactive buttons function, you can easily{" "}
                <InlineHyperlink id="link-jump-trigger" targetBlockId="heading-trigger">
                    scroll back up to the Triggers section
                </InlineHyperlink>
                .
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // ========================================
    // INLINE FORMULA DEMO (Inline Math)
    // ========================================
    <StackLayout key="layout-heading-formula" maxWidth="xl">
        <Block id="heading-formula" padding="md">
            <EditableH3 id="h3-formula-title" blockId="heading-formula">
                Inline Formula (Inline Math)
            </EditableH3>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-formula-intro" maxWidth="xl">
        <Block id="formula-intro" padding="sm">
            <EditableParagraph id="para-formula-intro" blockId="formula-intro">
                Mathematical elegance is crucial. Inline Formula renders perfect math expressions directly inline with your text. You can even color the terms in a formula.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-formula-circle-area" maxWidth="xl">
        <Block id="formula-circle-area" padding="sm">
            <EditableParagraph id="para-formula-area" blockId="formula-circle-area">
                For example, the total 2D space encapsulated by a boundary is measured as the{" "}
                <InlineFormula
                    id="formula-circle-area"
                    latex="\clr{area}{A} = \clr{pi}{\pi} \clr{radius}{r}^2"
                    colorMap={{ area: '#ef4444', pi: '#3b82f6', radius: '#3cc499' }}
                />
                . Here, the term <InlineFormula id="formula-var-r" latex="\clr{radius}{r}" colorMap={{ radius: '#3cc499' }} /> explicitly represents the radius.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-formula-quadratic" maxWidth="xl">
        <Block id="formula-quadratic" padding="sm">
            <EditableParagraph id="para-formula-quadratic" blockId="formula-quadratic">
                The quadratic formula{" "}
                <InlineFormula
                    id="formula-quadratic"
                    latex="\clr{x}{x} = \frac{-\clr{b}{b} \pm \sqrt{\clr{b}{b}^2 - 4\clr{a}{a}\clr{c}{c}}}{2\clr{a}{a}}"
                    colorMap={{ x: '#ef4444', a: '#3b82f6', b: '#3cc499', c: '#f97316' }}
                />
                {" "}gives the roots of any quadratic equation.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // ========================================
    // SPOT COLOR DEMO (Color-Coded Variables)
    // ========================================
    <StackLayout key="layout-heading-spotcolor" maxWidth="xl">
        <Block id="heading-spotcolor" padding="md">
            <EditableH3 id="h3-spotcolor-title" blockId="heading-spotcolor">
                Spot Color (Color-Coded Variables)
            </EditableH3>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-spotcolor-intro" maxWidth="xl">
        <Block id="spotcolor-intro" padding="sm">
            <EditableParagraph id="para-spotcolor-intro" blockId="spotcolor-intro">
                Cognitive load is drastically reduced when colors match concepts. Spot Color highlights a word with the exact same color defined for a variable. When that identical variable appears in a mathematical formula, the colors align completely, establishing a powerful, subconscious visual link between prose and math.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-spotcolor-kinetic" maxWidth="xl">
        <Block id="spotcolor-kinetic" padding="sm">
            <EditableParagraph id="para-spotcolor-circle" blockId="spotcolor-kinetic">
                For instance, by multiplying the{" "}
                <InlineSpotColor id="spot-base" varName="base"
                    {...spotColorPropsFromDefinition(getExampleVariableInfo('base'))}
                >
                    base
                </InlineSpotColor>
                {" "}of a triangle by its perpendicular{" "}
                <InlineSpotColor id="spot-height" varName="height"
                    {...spotColorPropsFromDefinition(getExampleVariableInfo('height'))}
                >
                    height
                </InlineSpotColor>
                , you can easily compute its total geometric area:{" "}
                <InlineFormula
                    id="formula-spotcolor-kinetic"
                    latex="Area = \frac{1}{2} \clr{base}{b} \clr{height}{h}"
                    colorMap={{
                        base: getExampleVariableInfo('base')?.color ?? '#a855f7',
                        height: getExampleVariableInfo('height')?.color ?? '#f97316',
                    }}
                />
                .
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-spotcolor-newton" maxWidth="xl">
        <Block id="spotcolor-newton" padding="sm">
            <EditableParagraph id="para-spotcolor-physics" blockId="spotcolor-newton">
                Furthermore, the true scale of any circle is intrinsically linked to exactly how much{" "}
                <InlineSpotColor id="spot-radius" varName="radius"
                    {...spotColorPropsFromDefinition(getExampleVariableInfo('radius'))}
                >
                    radius
                </InlineSpotColor>
                {" "}it has extending from its center. The standard area formula elegantly summarizes this nonlinear relationship via the equation{" "}
                <InlineFormula
                    id="formula-spotcolor-newton"
                    latex="A = \pi \clr{radius}{r}^2"
                    colorMap={{
                        radius: getExampleVariableInfo('radius')?.color ?? '#3cc499',
                    }}
                />
                .
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // ========================================
    // LINKED HIGHLIGHT DEMO (Hover-to-Highlight)
    // ========================================
    <StackLayout key="layout-heading-linkedhighlight" maxWidth="xl">
        <Block id="heading-linkedhighlight" padding="md">
            <EditableH3 id="h3-linkedhighlight-title" blockId="heading-linkedhighlight">
                Linked Highlight (Hover-to-Highlight)
            </EditableH3>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-linkedhighlight-intro" maxWidth="xl">
        <Block id="linkedhighlight-intro" padding="sm">
            <EditableParagraph id="para-linkedhighlight-intro" blockId="linkedhighlight-intro">
                Linked Highlight creates a coordination link between text and other elements.
                Hovering over a colored term with dotted underline instantly makes the matching element light up.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <SplitLayout key="layout-linkedhighlight-demo" ratio="1:1" gap="lg">
        <Block id="linkedhighlight-text" padding="sm">
            <EditableParagraph id="para-linkedhighlight-demo" blockId="linkedhighlight-text">
                In a right-angled triangle, the sine of an angle commonly involves its relationship with specific sides. The longest side is always the{" "}
                <InlineLinkedHighlight
                    id="linked-highlight-hyp"
                    varName="activeHighlight"
                    highlightId="hypotenuse"
                    color="#ef4444"
                >
                    hypotenuse
                </InlineLinkedHighlight>
                {". "}The vertical side directly facing the angle is called the{" "}
                <InlineLinkedHighlight
                    id="linked-highlight-opp"
                    varName="activeHighlight"
                    highlightId="opposite"
                    color="#3b82f6"
                >
                    opposite
                </InlineLinkedHighlight>
                {". "}Lastly, the horizontal side structurally next to the angle is the{" "}
                <InlineLinkedHighlight
                    id="linked-highlight-adj"
                    varName="activeHighlight"
                    highlightId="adjacent"
                    color="#22c55e"
                >
                    adjacent
                </InlineLinkedHighlight>
                {". "}Hover over any side name to locate it in the diagram immediately.
            </EditableParagraph>
        </Block>
        <Block id="linkedhighlight-viz" padding="sm" hasVisualization>
            <ReactiveHighlightDiagram />
        </Block>
    </SplitLayout>,

    // ========================================
    // FORMULA DEMO 
    // ========================================
    <StackLayout key="layout-heading-formula" maxWidth="xl">
        <Block id="heading-formula" padding="md">
            <EditableH2 id="h2-formula-title" blockId="heading-formula">
                Formula
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-interactive-formula-intro" maxWidth="xl">
        <Block id="interactive-formula-intro" padding="sm">
            <EditableParagraph id="para-interactive-formula-intro" blockId="interactive-formula-intro">
                Mathematical formulas are a cornerstone of pedagogy. In order to make them truly explorable, we use KaTeX extended with a predefined custom syntax to seamlessly manage advanced interactive behaviors directly within equations. We discuss these specific syntaxes in the sections below.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // ========================================
    // FORMULA BLOCK: COLORED VARIABLES DEMO
    // ========================================
    <StackLayout key="layout-heading-formula-colored" maxWidth="xl">
        <Block id="heading-formula-colored" padding="md">
            <EditableH3 id="h3-formula-colored-title" blockId="heading-formula-colored">
                Formula Colored Variables
            </EditableH3>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-formula-colored-intro" maxWidth="xl">
        <Block id="formula-colored-intro" padding="sm">
            <EditableParagraph id="para-formula-colored-intro" blockId="formula-colored-intro">
                Whenever you explain mathematical logic, maintaining a consistent color palette across text and equations drastically reduces cognitive load. You do not need to manually synchronize hex codes everywhere. Simply assign a color to a semantic variable directly in the editor!
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <SplitLayout key="layout-formula-colored-demo" ratio="1:1" gap="lg">
        <Block id="formula-colored-eq" padding="lg">
            <FormulaBlock
                latex="\clr{hypotenuse}{c}^2 = \clr{legA}{a}^2 + \clr{legB}{b}^2"
                colorMap={{ hypotenuse: '#ef4444', legA: '#3b82f6', legB: '#22c55e' }}
            />
        </Block>
        <Block id="formula-colored-desc" padding="sm">
            <EditableParagraph id="para-formula-colored-desc" blockId="formula-colored-desc">
                In geometry, the square of the <InlineSpotColor varName="hypotenuse" color="#ef4444">hypotenuse</InlineSpotColor> is equal to the sum of the squares of the{" "}
                <InlineSpotColor varName="legA" color="#3b82f6">first leg</InlineSpotColor> and the{" "}
                <InlineSpotColor varName="legB" color="#22c55e">second leg</InlineSpotColor>. Look at how seamlessly the variables match the equation using the same semantic names!
            </EditableParagraph>
        </Block>
    </SplitLayout>,

    <StackLayout key="layout-formula-colored-hint" maxWidth="xl">
        <Block id="formula-colored-hint" padding="sm">
            <EditableParagraph id="para-formula-colored-hint" blockId="formula-colored-hint">
                Here's how it works:
                <ul className="list-disc pl-5 mt-2 space-y-2">
                    <li><strong>\clr&#123;name&#125;&#123;content&#125;</strong> maps the <code>content</code> text fragment to the globally defined color mapped to the variable <code>name</code>.</li>
                    <li>Because of the shared global map, creating an inline text Spot Color for "hypotenuse" will successfully color the <code>\clr&#123;hypotenuse&#125;</code> math tag instantly and natively!</li>
                </ul>
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-heading-formula-scrubble" maxWidth="xl">
        <Block id="heading-formula-scrubble" padding="md">
            <EditableH3 id="h3-formula-scrubble-title" blockId="heading-formula-scrubble">
                Formula Scrubble Variable
            </EditableH3>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-formula-scrubble-intro" maxWidth="xl">
        <Block id="formula-scrubble-intro" padding="sm">
            <EditableParagraph id="para-formula-scrubble-intro" blockId="formula-scrubble-intro">
                Formula blocks can embed draggable scrubble numbers directly into mathematical equations. Use the{" "}
                <InlineTooltip tooltip="\scrub{varName} renders the variable's current value as a draggable number inside the equation.">
                    \scrub&#123;varName&#125;
                </InlineTooltip>
                {" "}syntax for interactive variables, and the{" "}
                <InlineTooltip tooltip="\clr{name}{content} colors a static part of the formula.">
                    \clr&#123;name&#125;&#123;content&#125;
                </InlineTooltip>
                {" "}syntax for colored static terms. To display dynamically calculated results, you can use the{" "}
                <InlineTooltip tooltip="\val{varName} renders a read-only variable value driven by the global store.">
                    \val&#123;varName&#125;
                </InlineTooltip>
                {" "}syntax. But do not worry about the syntax, MathVibe will automatically generate the syntax for you.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-interactive-formula-demo" maxWidth="xl">
        <Block id="interactive-formula-demo" padding="lg">
            <AreaCalculator key="area-calculator" />
            <FormulaBlock
                showHint={true}
                latex="\clr{area}{A} = \frac{1}{2} \times \scrub{base} \times \scrub{height} = \clr{area}{\val{area}}"
                colorMap={{ area: '#ef4444' }}
                variables={{
                    base: {
                        min: 1,
                        max: 20,
                        step: 0.5,
                        color: getExampleVariableInfo('base')?.color ?? '#a855f7',
                    },
                    height: {
                        min: 1,
                        max: 20,
                        step: 0.5,
                        color: getExampleVariableInfo('height')?.color ?? '#f97316',
                    },
                    area: {
                        color: getExampleVariableInfo('area')?.color ?? '#ef4444',
                    }
                }}
            />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-interactive-formula-example-explanation" maxWidth="xl">
        <Block id="interactive-formula-example-explanation" padding="sm">
            <EditableParagraph id="para-interactive-formula-example-explanation" blockId="interactive-formula-example-explanation">
                Drag the{" "}
                <InlineScrubbleNumber
                    varName="base"
                    {...numberPropsFromDefinition(getExampleVariableInfo('base'))}
                />{" "}unit base or the{" "}
                <InlineScrubbleNumber
                    varName="height"
                    {...numberPropsFromDefinition(getExampleVariableInfo('height'))}
                />{" "}unit height in here or in the formula above, you will see the interactive equation react synchronously, recalculating the total area instantly.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-interactive-formula-explanation" maxWidth="xl">
        <Block id="interactive-formula-explanation" padding="sm">
            <EditableParagraph id="para-interactive-formula-explanation" blockId="interactive-formula-explanation">
                Here's how it works:
                <ul className="list-disc pl-5 mt-2 space-y-2">
                    <li><strong>\clr&#123;area&#125;&#123;A&#125;</strong> renders the static letter <InlineSpotColor varName="area" color="#ef4444">A</InlineSpotColor> using the globally mapped area color.</li>
                    <li><strong>\scrub&#123;base&#125;</strong> and <strong>\scrub&#123;height&#125;</strong> mount the interactive scrubble inputs directly inside the math block.</li>
                    <li><strong>\val&#123;area&#125;</strong> renders the automatically recalculated area as a static, non-draggable value.</li>
                </ul>
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // ========================================
    // FORMULA BLOCK: CLOZE INPUT DEMO
    // ========================================
    <StackLayout key="layout-heading-formula-cloze" maxWidth="xl">
        <Block id="heading-formula-cloze" padding="md">
            <EditableH3 id="h3-formula-cloze-title" blockId="heading-formula-cloze">
                Formula Cloze Input (Fill-in-the-Blank in Formula)
            </EditableH3 >
        </Block>
    </StackLayout>,

    <StackLayout key="layout-formula-cloze-intro" maxWidth="xl">
        <Block id="formula-cloze-intro" padding="sm">
            <EditableParagraph id="para-formula-cloze-intro" blockId="formula-cloze-intro">
                You can use the{" "}
                <InlineTooltip tooltip="\cloze{varName} renders a clickable fill-in-the-blank input inside the formula. Configure the correct answer, placeholder, and color in the Cloze tab of the editor.">
                    \cloze&#123;varName&#125;
                </InlineTooltip>
                {" "}syntax to embed interactive fill-in-the-blank inputs directly
                inside mathematical formulas. This creates a moment of active recall for the learner. Just like before, the exact syntax is handled seamlessly by MathVibe.
                Can you complete the formula for the area of a circle?
                Click the red box below and type your math answer in!
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-formula-cloze-demo" maxWidth="xl">
        <Block id="formula-cloze-demo" padding="lg">
            <FormulaBlock
                showHint={true}
                latex="\cloze{circleAreaAnswer} = \clr{pi}{\pi} \cdot \clr{radiusSquared}{r^2}"
                colorMap={{ pi: '#3b82f6', radiusSquared: '#D81B60' }}
                clozeInputs={{
                    circleAreaAnswer: {
                        correctAnswer: 'A',
                        placeholder: '?',
                        color: '#ef4444',
                    },
                }}
            />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-formula-cloze-hint" maxWidth="xl">
        <Block id="formula-cloze-hint" padding="sm">
            <EditableParagraph id="para-formula-cloze-hint" blockId="formula-cloze-hint">
                Here's how it works:
                <ul className="list-disc pl-5 mt-2 space-y-2">
                    <li><strong>\clr&#123;pi&#125;&#123;\pi&#125;</strong> and <strong>\clr&#123;radiusSquared&#125;&#123;r^2&#125;</strong> render the static colored math terms.</li>
                    <li><strong>\cloze&#123;circleAreaAnswer&#125;</strong> turns the first term into an input box expecting the exact math answer <code>A</code>. The editor allows setting formatting, placeholder text, and exact answer mappings behind-the-scenes.</li>
                </ul>
                <br />

            </EditableParagraph>
        </Block>
    </StackLayout>,

    // ========================================
    // FORMULA BLOCK: CLOZE CHOICE DEMO
    // ========================================
    <StackLayout key="layout-heading-formula-choice" maxWidth="xl">
        <Block id="heading-formula-choice" padding="md">
            <EditableH3 id="h3-formula-choice-title" blockId="heading-formula-choice">
                Formula Cloze Choice (Dropdown in Formula)
            </EditableH3>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-formula-choice-intro" maxWidth="xl">
        <Block id="formula-choice-intro" padding="sm">
            <EditableParagraph id="para-formula-choice-intro" blockId="formula-choice-intro">
                You can also use the{" "}
                <InlineTooltip tooltip="\choice{varName} renders a clickable dropdown choice inside the formula. Configure the correct answer, options, and color in the Choices tab of the editor.">
                    \choice&#123;varName&#125;
                </InlineTooltip>
                {" "}syntax to embed multiple-choice dropdown selectors directly inside
                formulas. This is a fantastic way to scaffold learners through a multi-step formula without requiring them to type exactly.  Can you complete the quadratic formula? Click the purple box below and choose the correct expression for the denominator!
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-formula-choice-demo" maxWidth="xl">
        <Block id="formula-choice-demo" padding="lg">
            <FormulaBlock
                showHint={true}
                latex="\clr{x}{x} = \frac{-\clr{b}{b} \pm \sqrt{\clr{b}{b}^2 - 4\clr{a}{a}\clr{c}{c}}}{\choice{denominator}}"
                colorMap={{ x: '#ef4444', a: '#3b82f6', b: '#22c55e', c: '#f59e0b' }}
                clozeChoices={{
                    denominator: {
                        correctAnswer: '2a',
                        options: ['2a', '2+a', 'a²', '2-a'],
                        placeholder: '???',
                        color: '#8B5CF6',
                    },
                }}
            />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-formula-choice-hint" maxWidth="xl">
        <Block id="formula-choice-hint" padding="sm">
            <EditableParagraph id="para-formula-choice-hint" blockId="formula-choice-hint">
                Here's how it works:
                <ul className="list-disc pl-5 mt-2 space-y-2">
                    <li><strong>\clr</strong> tags are scattered throughout the massive quadratic formula text to provide spot coloring based on the global variables.</li>
                    <li><strong>\choice&#123;denominator&#125;</strong> is placed specifically in the denominator position of the LaTeX fraction (`\frac`), rendering the purple dropdown selection.</li>
                </ul>
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // ========================================
    // FORMULA BLOCK: LINKED HIGHLIGHT DEMO
    // ========================================
    <StackLayout key="layout-heading-formula-highlight" maxWidth="xl">
        <Block id="heading-formula-highlight" padding="md">
            <EditableH3 id="h3-formula-highlight-title" blockId="heading-formula-highlight">
                Formula Linked Highlight (Hover-to-Highlight in Formula)
            </EditableH3>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-formula-highlight-intro" maxWidth="xl">
        <Block id="formula-highlight-intro" padding="sm">
            <EditableParagraph id="para-formula-highlight-intro" blockId="formula-highlight-intro">
                Finally, use the{" "}
                <InlineTooltip tooltip="\highlight{id}{content} renders a hover-interactive term inside the formula. When hovered, it sets a shared variable so other components can react.">
                    \highlight&#123;id&#125;&#123;content&#125;
                </InlineTooltip>
                {" "}syntax to establish powerful visual connections across your page. Hovering over a term inside the math block magically illuminates matching text explanations alongside it!
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <SplitLayout key="layout-formula-highlight-demo" ratio="1:1" gap="lg">
        <Block id="formula-highlight-eq" padding="lg">
            <FormulaBlock
                showHint={true}
                latex="\highlight{fArea}{A} = \highlight{fPi}{\pi} \highlight{fRadius}{r}^{\highlight{fSquared}{2}}"
                linkedHighlights={{
                    fArea: { varName: 'formulaHighlightGroup', color: '#ef4444' },
                    fPi: { varName: 'formulaHighlightGroup', color: '#3b82f6' },
                    fRadius: { varName: 'formulaHighlightGroup', color: '#22c55e' },
                    fSquared: { varName: 'formulaHighlightGroup', color: '#f59e0b' },
                }}
            />
        </Block>
        <Block id="formula-highlight-desc" padding="sm">
            <EditableParagraph id="para-formula-highlight-desc" blockId="formula-highlight-desc">
                Hover over each part of the formula on the left to see its role light up here:{" "}
                <InlineLinkedHighlight
                    id="linked-highlight-fArea"
                    varName="formulaHighlightGroup"
                    highlightId="fArea"
                    color="#ef4444"
                >
                    A
                </InlineLinkedHighlight>
                {" "}is the area of the circle,{" "}
                <InlineLinkedHighlight
                    id="linked-highlight-fPi"
                    varName="formulaHighlightGroup"
                    highlightId="fPi"
                    color="#3b82f6"
                >
                    π
                </InlineLinkedHighlight>
                {" "}is the ratio of circumference to diameter (≈ 3.14159),{" "}
                <InlineLinkedHighlight
                    id="linked-highlight-fRadius"
                    varName="formulaHighlightGroup"
                    highlightId="fRadius"
                    color="#22c55e"
                >
                    r
                </InlineLinkedHighlight>
                {" "}is the radius, and the exponent{" "}
                <InlineLinkedHighlight
                    id="linked-highlight-fSquared"
                    varName="formulaHighlightGroup"
                    highlightId="fSquared"
                    color="#f59e0b"
                >
                    2
                </InlineLinkedHighlight>
                {" "}means we square the radius. You can hover on either side to see the connection!
            </EditableParagraph>
        </Block>
    </SplitLayout>,

    <StackLayout key="layout-formula-highlight-hint" maxWidth="xl">
        <Block id="formula-highlight-hint" padding="sm">
            <EditableParagraph id="para-formula-highlight-hint" blockId="formula-highlight-hint">
                Here's how it works:
                <ul className="list-disc pl-5 mt-2 space-y-2">
                    <li><strong>\highlight&#123;id&#125;&#123;content&#125;</strong> wraps portions of the LaTeX string, turning them into interactive hover targets.</li>
                    <li>When hovered, the exact <code>id</code> (e.g., <code>fArea</code> or <code>fPi</code>) is broadcast to the global variable store.</li>
                    <li>Any other component identically listening to that shared variable, like the linked text explanations on the right, will instantly light up to match!</li>
                </ul>
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // ========================================
    // VISUALIZATIONS
    // ========================================
    <StackLayout key="layout-heading-visualizations" maxWidth="xl">
        <Block id="heading-visualizations" padding="md">
            <EditableH2 id="h2-visualizations-title" blockId="heading-visualizations">
                Visualizations
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-visualizations-intro" maxWidth="xl">
        <Block id="visualizations-intro" padding="sm">
            <EditableParagraph id="para-visualizations-intro" blockId="visualizations-intro">
                Visualizing abstract concepts is one of the most powerful tools in pedagogy. Interactive visualization components bridge the gap between static content and experiential learning. They allow learners to manipulate parameters, observe real-time changes, and deeply intuit underlying principles rather than just memorizing them. MathVibe provides a rich ecosystem of visualization blocks out-of-the-box.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // ========================================
    // CARTESIAN 2D DEMO
    // ========================================
    ...cartesian2dDemo,

    // ========================================
    // CIRCLE ANATOMY — LINKED HIGHLIGHT + CARTESIAN 2D
    // ========================================
    ...circleAnatomyDemo,

    // ========================================
    // SYMMETRY DRAWING DEMO
    // ========================================
    ...symmetryDrawingDemo,

    // ========================================
    // CARTESIAN 3D DEMO
    // ========================================
    ...cartesian3dDemo,

    // ========================================
    // NODE-LINK DIAGRAM DEMO
    // ========================================
    ...nodeLinkDemo,

    // ========================================
    // GEOMETRIC DIAGRAM DEMO
    // ========================================
    ...geometricDiagramDemo,

    // ========================================
    // MATRIX VISUALIZATION DEMO
    // ========================================
    ...matrixDemoBlocks,

    // ========================================
    // TABLE COMPONENT DEMO
    // ========================================
    ...tableDemoBlocks,

    // ========================================
    // DATA VISUALIZATION DEMO
    // ========================================
    ...dataVisualizationDemoBlocks,

    // ========================================
    // MATH TREE SCAFFOLD DEMO
    // ========================================
    ...mathTreeDemo,

    // ========================================
    // VENN + NUMBER LINE DEMOS
    // ========================================
    ...vennAndNumberLineDemo,

    // ========================================
    // SIMULATION PANEL DEMOS
    // ========================================
    ...simulationDemoBlocks,

    // ========================================
    // DESMOS DEMO
    // ========================================
    ...desmosDemoBlocks,

    // ========================================
    // VISUAL ASSESSMENT DEMO
    // ========================================
    ...visualAssessmentDemoBlocks,


    // ========================================
    // MEDIA DEMOS
    // ========================================
    <StackLayout key="layout-heading-media" maxWidth="xl">
        <Block id="heading-media" padding="md">
            <EditableH2 id="h2-media-title" blockId="heading-media">
                Media Elements
            </EditableH2>
        </Block>
    </StackLayout>,
    <StackLayout key="layout-heading-media-desc" maxWidth="xl">
        <Block id="heading-media-desc" padding="sm">
            <EditableParagraph id="para-media-desc" blockId="heading-media-desc">
                Embed rich media directly into your documents. Images and interactive videos help illustrate explanations and ground abstract concepts in real-world examples.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // ========================================
    // IMAGE DISPLAY DEMO
    // ========================================
    ...imageDisplayDemoBlocks,

    // ========================================
    // VIDEO DISPLAY DEMO
    // ========================================
    ...videoDisplayDemoBlocks,

    // ========================================
    // LAYOUTS DEMO
    // ========================================
    ...layoutsDemoBlocks,

];

export { exampleBlocks };
