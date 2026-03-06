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
} from "@/components/atoms";

// Import molecule components
import { FormulaBlock } from "@/components/molecules";

// Import store hooks
import { useVar } from "@/stores";

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

/** SVG diagram with parts that react to the "activeHighlight" variable */
function ReactiveHighlightDiagram() {
    const activeId = useVar('activeHighlight', '') as string;

    const parts = [
        { id: 'input', label: 'Input', x: 30, y: 60, w: 100, h: 50, color: '#3b82f6' },
        { id: 'process', label: 'Process', x: 160, y: 60, w: 100, h: 50, color: '#22c55e' },
        { id: 'output', label: 'Output', x: 290, y: 60, w: 100, h: 50, color: '#f97316' },
    ];

    return (
        <div className="flex flex-col items-center gap-3 p-4 bg-card rounded-xl">
            <svg width={420} height={140} viewBox="0 0 420 140">
                {/* Arrows */}
                <line x1={130} y1={85} x2={155} y2={85} stroke="#94a3b8" strokeWidth={2} markerEnd="url(#arrowhead)" />
                <line x1={260} y1={85} x2={285} y2={85} stroke="#94a3b8" strokeWidth={2} markerEnd="url(#arrowhead)" />
                <defs>
                    <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                        <polygon points="0 0, 8 3, 0 6" fill="#94a3b8" />
                    </marker>
                </defs>
                {parts.map((p) => {
                    const isActive = activeId === p.id;
                    return (
                        <g key={p.id}>
                            <rect
                                x={p.x}
                                y={p.y}
                                width={p.w}
                                height={p.h}
                                rx={8}
                                fill={isActive ? `${p.color}30` : '#f1f5f9'}
                                stroke={isActive ? p.color : '#cbd5e1'}
                                strokeWidth={isActive ? 3 : 1.5}
                                style={{ transition: 'all 0.2s ease' }}
                            />
                            <text
                                x={p.x + p.w / 2}
                                y={p.y + p.h / 2 + 5}
                                textAnchor="middle"
                                fill={isActive ? p.color : '#64748b'}
                                fontSize={14}
                                fontWeight={isActive ? 700 : 500}
                                style={{ transition: 'all 0.2s ease' }}
                            >
                                {p.label}
                            </text>
                        </g>
                    );
                })}
            </svg>
            <div className="text-xs text-muted-foreground">
                {activeId ? (
                    <span>Highlighting: <strong style={{ color: parts.find(p => p.id === activeId)?.color }}>{activeId}</strong></span>
                ) : (
                    <span>Hover over a highlighted term to see the linked part light up</span>
                )}
            </div>
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
                    { cells: [<InlineHyperlink id="link-editable-headings" targetBlockId="editable-headings">Editable Heading</InlineHyperlink>, 'Headings that can be edited in-place.'] },
                    { cells: [<InlineHyperlink id="link-toc-cart2d" targetBlockId="cartesian-2d-header-title">2D Cartesian Graphing</InlineHyperlink>, 'Interactive 2D plots with coordinate logic.'] },
                    { cells: [<InlineHyperlink id="link-toc-cart3d" targetBlockId="cartesian-3d-header-title">3D Cartesian Graphing</InlineHyperlink>, '3D math visualizations using Three.js.'] },
                    { cells: [<InlineHyperlink id="link-toc-matrix" targetBlockId="matrix-title">Matrix Visualization</InlineHyperlink>, 'Interactive matrices and vectors.'] },
                    { cells: [<InlineHyperlink id="link-toc-tables" targetBlockId="table-title">Data Tables</InlineHyperlink>, 'Render basic and interactive tables.'] },
                    { cells: [<InlineHyperlink id="link-toc-layouts" targetBlockId="demo-title">Layouts & Containers</InlineHyperlink>, 'Responsive multi-column, grid, scrolling, and sliding layouts.'] },
                    { cells: [<InlineHyperlink id="link-toc-sim" targetBlockId="simulation-title">Simulation Panel</InlineHyperlink>, 'Controls, sliders, and buttons for dynamic examples.'] },
                    { cells: [<InlineHyperlink id="link-toc-mt" targetBlockId="math-tree-title">Math Trees</InlineHyperlink>, 'AST and equation derivation trees.'] },
                    { cells: [<InlineHyperlink id="link-toc-desmos" targetBlockId="desmos-title">Desmos Calculator</InlineHyperlink>, 'Embed fully interactive Desmos graphing calculators.'] },
                    { cells: [<InlineHyperlink id="link-toc-ca" targetBlockId="circle-anatomy-title">Circle Anatomy Diagram</InlineHyperlink>, 'Interactive SVG geometry basics.'] },
                    { cells: [<InlineHyperlink id="link-toc-dv" targetBlockId="data-visualization-title">Data Visualization</InlineHyperlink>, 'Bar charts, line charts, area charts, pies, and scatter plots.'] },
                    { cells: [<InlineHyperlink id="link-toc-nl" targetBlockId="node-link-title">Node-Link Diagrams</InlineHyperlink>, 'Force-directed graph visualizations.'] },
                    { cells: [<InlineHyperlink id="link-toc-venn" targetBlockId="venn-numberline-title">Venn & Number Line</InlineHyperlink>, 'Diagrams for set theory and basic intervals.'] },
                    { cells: [<InlineHyperlink id="link-toc-sym" targetBlockId="symmetry-header-title">Symmetry Drawing</InlineHyperlink>, 'Interactive symmetric drawing canvas.'] },
                    { cells: [<InlineHyperlink id="link-toc-img" targetBlockId="image-title">Media & Images</InlineHyperlink>, 'Display images with various fit and border modes.'] },
                    { cells: [<InlineHyperlink id="link-toc-vid" targetBlockId="video-title">Video Display</InlineHyperlink>, 'Embed web videos interactively.'] },
                    { cells: [<InlineHyperlink id="link-toc-ifd" targetBlockId="inline-feedback-title">Inline Feedback</InlineHyperlink>, 'Show feedback depending on variables.'] },
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
    <StackLayout key="layout-heading-paragraphs" maxWidth="xl">
        <Block id="heading-paragraphs-title" padding="sm">
            <EditableH2 id="h2-paragraphs-title" blockId="heading-paragraphs-title">
                Editable Paragraphs
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-paragraph-intro" maxWidth="xl">
        <Block id="paragraph-intro" padding="sm">
            <EditableParagraph id="para-intro-primary" blockId="paragraph-intro">
                This is an editable paragraph. Click on it to start editing the text.
                You can modify the content directly in-place. The changes are tracked
                and can be saved to the backend.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-paragraph-independent" maxWidth="xl">
        <Block id="paragraph-independent" padding="sm">
            <EditableParagraph id="para-intro-secondary" blockId="paragraph-independent">
                Here's another paragraph to demonstrate that multiple paragraphs
                can be edited independently. Each paragraph maintains its own state
                and editing session.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // ========================================
    // INLINE COMPONENTS DEMO
    // ========================================
    <StackLayout key="layout-heading-inline-components" maxWidth="xl">
        <Block id="heading-inline-components" padding="sm">
            <EditableH2 id="h2-inline-title" blockId="heading-inline-components">
                Inline Components
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-paragraph-inline-intro" maxWidth="xl">
        <Block id="paragraph-inline-intro" padding="sm">
            <EditableParagraph id="para-inline-intro" blockId="paragraph-inline-intro">
                Inline components allow interactive elements within text. Below are
                examples of scrubbable numbers that can be adjusted by dragging.
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
                {" "}units, giving it an area proportional to r².
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-paragraph-scrubble-temperature" maxWidth="xl">
        <Block id="paragraph-scrubble-temperature" padding="sm">
            <EditableParagraph id="para-temperature-example" blockId="paragraph-scrubble-temperature">
                If we increase the temperature to{" "}
                <InlineScrubbleNumber
                    id="scrubble-temperature"
                    varName="temperature"
                    {...numberPropsFromDefinition(getExampleVariableInfo('temperature'))}
                    formatValue={(v) => `${v}°C`}
                />
                {" "}the reaction rate will change accordingly.
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

    // ========================================
    // CLOZE INPUT (Fill-in-the-blank) DEMO
    // ========================================
    <StackLayout key="layout-heading-h2-cloze" maxWidth="xl">
        <Block id="heading-h2-cloze" padding="sm">
            <EditableH2 id="h2-cloze-title" blockId="heading-h2-cloze">
                Cloze Inputs (Fill-in-the-Blank)
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-paragraph-cloze-intro" maxWidth="xl">
        <Block id="paragraph-cloze-intro" padding="sm">
            <EditableParagraph id="para-cloze-intro" blockId="paragraph-cloze-intro">
                Cloze inputs let students type answers inline. They auto-validate as
                you type and turn green when correct. Try the examples below.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-paragraph-cloze-angle" maxWidth="xl">
        <Block id="paragraph-cloze-angle" padding="sm">
            <EditableParagraph id="para-cloze-angle" blockId="paragraph-cloze-angle">
                A quarter circle is{" "}
                <InlineClozeInput
                    id="cloze-quarter-circle-angle"
                    varName="quarterCircleAngle"
                    correctAnswer="90"
                    {...clozePropsFromDefinition(getExampleVariableInfo('quarterCircleAngle'))}
                />
                {" "}degrees, representing one-fourth of a complete rotation.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-paragraph-cloze-unit" maxWidth="xl">
        <Block id="paragraph-cloze-unit" padding="sm">
            <EditableParagraph id="para-cloze-unit" blockId="paragraph-cloze-unit">
                The SI unit of frequency is{" "}
                <InlineClozeInput
                    id="cloze-wave-unit"
                    varName="waveUnit"
                    correctAnswer="Hertz"
                    {...clozePropsFromDefinition(getExampleVariableInfo('waveUnit'))}
                />
                {" "}(abbreviated Hz).
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // ========================================
    // CLOZE CHOICES (Dropdown Fill-in-the-Blank)
    // ========================================
    <StackLayout key="layout-heading-h2-cloze-choice" maxWidth="xl">
        <Block id="heading-h2-cloze-choice" padding="sm">
            <EditableH2 id="h2-cloze-choice-title" blockId="heading-h2-cloze-choice">
                Cloze Choices (Dropdown Fill-in-the-Blank)
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-paragraph-choice-shape" maxWidth="xl">
        <Block id="paragraph-choice-shape" padding="sm">
            <EditableParagraph id="para-choice-shape" blockId="paragraph-choice-shape">
                The definition of a sphere is similar to a{" "}
                <InlineClozeChoice
                    id="choice-shape-answer"
                    varName="shapeAnswer"
                    correctAnswer="circle"
                    options={["cube", "circle", "square", "triangle"]}
                    {...choicePropsFromDefinition(getExampleVariableInfo('shapeAnswer'))}
                />
                {" "}&mdash; except in three dimensions!
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-paragraph-choice-wave" maxWidth="xl">
        <Block id="paragraph-choice-wave" padding="sm">
            <EditableParagraph id="para-choice-wave" blockId="paragraph-choice-wave">
                Light waves are an example of{" "}
                <InlineClozeChoice
                    id="choice-wave-type"
                    varName="waveTypeAnswer"
                    correctAnswer="transverse"
                    options={["transverse", "longitudinal", "surface"]}
                    {...choicePropsFromDefinition(getExampleVariableInfo('waveTypeAnswer'))}
                />
                {" "}waves.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // ========================================
    // TOGGLE DEMO (Click to Cycle)
    // ========================================
    <StackLayout key="layout-heading-h2-toggle" maxWidth="xl">
        <Block id="heading-h2-toggle" padding="sm">
            <EditableH2 id="h2-toggle-title" blockId="heading-h2-toggle">
                Toggle (Click to Cycle)
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-paragraph-toggle-shapes" maxWidth="xl">
        <Block id="paragraph-toggle-shapes" padding="sm">
            <EditableParagraph id="para-toggle-shapes" blockId="paragraph-toggle-shapes">
                The current shape is a{" "}
                <InlineToggle
                    id="toggle-current-shape"
                    varName="currentShape"
                    options={["triangle", "square", "pentagon", "hexagon"]}
                    {...togglePropsFromDefinition(getExampleVariableInfo('currentShape'))}
                />
                {" "}with equal sides. Click to cycle through the shapes!
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-paragraph-toggle-measurement" maxWidth="xl">
        <Block id="paragraph-toggle-measurement" padding="sm">
            <EditableParagraph id="para-toggle-measurement" blockId="paragraph-toggle-measurement">
                A circle has three key measurements. The{" "}
                <InlineToggle
                    id="toggle-measurement-type"
                    varName="measurementType"
                    options={["radius", "diameter", "circumference"]}
                    {...togglePropsFromDefinition(getExampleVariableInfo('measurementType'))}
                />
                {" "}is an important property of a circle.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // ========================================
    // TOOLTIP DEMO (Hover to Reveal)
    // ========================================
    <StackLayout key="layout-heading-h2-tooltip" maxWidth="xl">
        <Block id="heading-h2-tooltip" padding="sm">
            <EditableH2 id="h2-tooltip-title" blockId="heading-h2-tooltip">
                Tooltip (Hover to Reveal)
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-paragraph-tooltip-intro" maxWidth="xl">
        <Block id="paragraph-tooltip-intro" padding="sm">
            <EditableParagraph id="para-tooltip-intro" blockId="paragraph-tooltip-intro">
                Tooltips show definitions or extra information on hover. Unlike other
                inline components, they don't use the variable store — they're purely
                informational. Hover over the highlighted words below to see them in action.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-paragraph-tooltip-circle" maxWidth="xl">
        <Block id="paragraph-tooltip-circle" padding="sm">
            <EditableParagraph id="para-tooltip-circle" blockId="paragraph-tooltip-circle">
                Every point on a{" "}
                <InlineTooltip id="tooltip-circle-def" tooltip="A shape where all points are equidistant from the center.">
                    circle
                </InlineTooltip>
                {" "}is the same distance from its center. This distance is called the{" "}
                <InlineTooltip id="tooltip-radius-def" tooltip="The distance from the center of a circle to any point on its edge.">
                    radius
                </InlineTooltip>
                .
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-paragraph-tooltip-physics" maxWidth="xl">
        <Block id="paragraph-tooltip-physics" padding="sm">
            <EditableParagraph id="para-tooltip-physics" blockId="paragraph-tooltip-physics">
                In physics,{" "}
                <InlineTooltip
                    id="tooltip-vectors-def"
                    tooltip="A quantity that has both magnitude and direction, represented by an arrow."
                    color="#3B82F6"
                >
                    vectors
                </InlineTooltip>
                {" "}are used to describe forces and motion. The{" "}
                <InlineTooltip
                    id="tooltip-acceleration-def"
                    tooltip="The rate of change of velocity with respect to time, measured in m/s²."
                    color="#10B981"
                >
                    acceleration
                </InlineTooltip>
                {" "}of an object depends on the net force applied.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // ========================================
    // MIXED CONTENT DEMO (Math Example)
    // ========================================
    <StackLayout key="layout-heading-mixed-content" maxWidth="xl">
        <Block id="heading-mixed-content" padding="sm">
            <EditableH2 id="h2-physics-title" blockId="heading-mixed-content">
                Math Example: Sine Wave Parameters
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-paragraph-mixed-wave" maxWidth="xl">
        <Block id="paragraph-mixed-wave" padding="sm">
            <EditableParagraph id="para-projectile-intro" blockId="paragraph-mixed-wave">
                Consider the wave equation y = A sin(ωx + φ). The amplitude is{" "}
                <InlineScrubbleNumber
                    id="scrubble-velocity"
                    varName="amplitude"
                    {...numberPropsFromDefinition(getExampleVariableInfo('amplitude'))}
                />
                {" "}and the phase shift is{" "}
                <InlineScrubbleNumber
                    id="scrubble-angle"
                    varName="phase"
                    {...numberPropsFromDefinition(getExampleVariableInfo('phase'))}
                    formatValue={(v) => `${v}°`}
                />
                .
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-heading-mixed-params" maxWidth="xl">
        <Block id="heading-mixed-params" padding="sm">
            <EditableH3 id="h3-parameters-title" blockId="heading-mixed-params">
                Key Parameters
            </EditableH3>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-paragraph-mixed-frequency" maxWidth="xl">
        <Block id="paragraph-mixed-frequency" padding="sm">
            <EditableParagraph id="para-gravity-example" blockId="paragraph-mixed-frequency">
                The wave frequency is{" "}
                <InlineScrubbleNumber
                    id="scrubble-acceleration"
                    varName="frequency"
                    {...numberPropsFromDefinition(getExampleVariableInfo('frequency'))}
                    formatValue={(v) => `${v.toFixed(1)} Hz`}
                />
                . You can adjust these values to see how they reshape the waveform.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // ========================================
    // TRIGGER (CLICK TO SET VARIABLE) DEMO
    // ========================================
    <StackLayout key="layout-heading-trigger" maxWidth="xl">
        <Block id="heading-trigger" padding="md">
            <EditableH2 id="h2-trigger-title" blockId="heading-trigger">
                Trigger (Click to Set Variable)
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-trigger-intro" maxWidth="xl">
        <Block id="trigger-intro" padding="sm">
            <EditableParagraph id="para-trigger-intro" blockId="trigger-intro">
                InlineTrigger lets you set a variable to a specific value on click. Combine it with
                InlineScrubbleNumber so students can explore a value and quickly snap it to key points.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-trigger-example" maxWidth="xl">
        <Block id="trigger-example" padding="sm">
            <EditableParagraph id="para-trigger-example" blockId="trigger-example">
                The animation speed is{" "}
                <InlineScrubbleNumber
                    id="scrubble-animation-speed"
                    varName="animationSpeed"
                    {...numberPropsFromDefinition(getExampleVariableInfo('animationSpeed'))}
                />
                . You can{" "}
                <InlineTrigger id="trigger-speed-reset" varName="animationSpeed" value={1}>
                    reset it to 1
                </InlineTrigger>{" "}
                or{" "}
                <InlineTrigger id="trigger-speed-max" varName="animationSpeed" value={5}>
                    max it out
                </InlineTrigger>.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // ========================================
    // HYPERLINK (CLICK TO NAVIGATE) DEMO
    // ========================================
    <StackLayout key="layout-heading-hyperlink" maxWidth="xl">
        <Block id="heading-hyperlink" padding="md">
            <EditableH2 id="h2-hyperlink-title" blockId="heading-hyperlink">
                Hyperlink (Click to Navigate)
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-hyperlink-intro" maxWidth="xl">
        <Block id="hyperlink-intro" padding="sm">
            <EditableParagraph id="para-hyperlink-intro" blockId="hyperlink-intro">
                InlineHyperlink turns text into a clickable link that either opens an external URL in a
                new tab or smooth-scrolls to another block on the page.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-hyperlink-examples" maxWidth="xl">
        <Block id="hyperlink-examples" padding="sm">
            <EditableParagraph id="para-hyperlink-examples" blockId="hyperlink-examples">
                Read the{" "}
                <InlineHyperlink id="link-wikipedia-circles" href="https://en.wikipedia.org/wiki/Circle">
                    Wikipedia article on circles
                </InlineHyperlink>{" "}
                for more background, or{" "}
                <InlineHyperlink id="link-jump-trigger" targetBlockId="heading-trigger">
                    jump to the Trigger section
                </InlineHyperlink>{" "}
                above to see how triggers work.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // ========================================
    // INLINE FORMULA DEMO (Inline Math)
    // ========================================
    <StackLayout key="layout-heading-formula" maxWidth="xl">
        <Block id="heading-formula" padding="md">
            <EditableH2 id="h2-formula-title" blockId="heading-formula">
                Inline Formula (Inline Math)
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-formula-intro" maxWidth="xl">
        <Block id="formula-intro" padding="sm">
            <EditableParagraph id="para-formula-intro" blockId="formula-intro">
                InlineFormula renders KaTeX math formulas directly within paragraph text.
                Like InlineTooltip, it does not use the variable store — it's purely for
                display. Use the{" "}
                <InlineTooltip id="tooltip-clr-syntax" tooltip="Syntax: \clr{name}{content} — maps term names to colors via the colorMap prop.">
                    \clr syntax
                </InlineTooltip>{" "}
                to color individual terms in the formula.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-formula-circle-area" maxWidth="xl">
        <Block id="formula-circle-area" padding="sm">
            <EditableParagraph id="para-formula-area" blockId="formula-circle-area">
                The area of a circle is{" "}
                <InlineFormula
                    id="formula-circle-area"
                    latex="\clr{area}{A} = \clr{pi}{\pi} \clr{radius}{r}^2"
                    colorMap={{ area: '#ef4444', pi: '#3b82f6', radius: '#3cc499' }}
                />
                {" "}where r is the radius.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-formula-einstein" maxWidth="xl">
        <Block id="formula-einstein" padding="sm">
            <EditableParagraph id="para-formula-einstein" blockId="formula-einstein">
                Einstein's famous equation{" "}
                <InlineFormula
                    id="formula-einstein"
                    latex="\clr{energy}{E} = \clr{mass}{m}\clr{speed}{c}^2"
                    colorMap={{ energy: '#f97316', mass: '#a855f7', speed: '#06b6d4' }}
                />
                {" "}shows the equivalence of mass and energy.
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
            <EditableH2 id="h2-spotcolor-title" blockId="heading-spotcolor">
                Spot Color (Color-Coded Variables)
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-spotcolor-intro" maxWidth="xl">
        <Block id="spotcolor-intro" padding="sm">
            <EditableParagraph id="para-spotcolor-intro" blockId="spotcolor-intro">
                InlineSpotColor defines a color for a variable. When the same variable
                appears in a formula, the formula picks up the same color from the
                variable definition — creating a consistent visual link between
                prose and math.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-spotcolor-kinetic" maxWidth="xl">
        <Block id="spotcolor-kinetic" padding="sm">
            <EditableParagraph id="para-spotcolor-circle" blockId="spotcolor-kinetic">
                With the{" "}
                <InlineSpotColor id="spot-mass" varName="mass"
                    {...spotColorPropsFromDefinition(getExampleVariableInfo('mass'))}
                >
                    mass
                </InlineSpotColor>
                {" "}of an object and its{" "}
                <InlineSpotColor id="spot-velocity" varName="velocity"
                    {...spotColorPropsFromDefinition(getExampleVariableInfo('velocity'))}
                >
                    velocity
                </InlineSpotColor>
                , you can compute the kinetic energy:{" "}
                <InlineFormula
                    id="formula-spotcolor-kinetic"
                    latex="KE = \frac{1}{2} \clr{mass}{m} \clr{velocity}{v}^2"
                    colorMap={{
                        mass: getExampleVariableInfo('mass')?.color ?? '#a855f7',
                        velocity: getExampleVariableInfo('velocity')?.color ?? '#f97316',
                    }}
                />
                .
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-spotcolor-newton" maxWidth="xl">
        <Block id="spotcolor-newton" padding="sm">
            <EditableParagraph id="para-spotcolor-physics" blockId="spotcolor-newton">
                The{" "}
                <InlineSpotColor id="spot-acceleration" varName="acceleration"
                    {...spotColorPropsFromDefinition(getExampleVariableInfo('acceleration'))}
                >
                    acceleration
                </InlineSpotColor>
                {" "}of an object is determined by the net force and its{" "}
                <InlineSpotColor id="spot-mass-newtons-law" varName="mass"
                    {...spotColorPropsFromDefinition(getExampleVariableInfo('mass'))}
                >
                    mass
                </InlineSpotColor>
                . Newton's second law states{" "}
                <InlineFormula
                    id="formula-spotcolor-newton"
                    latex="F = \clr{mass}{m} \clr{acceleration}{a}"
                    colorMap={{
                        mass: getExampleVariableInfo('mass')?.color ?? '#a855f7',
                        acceleration: getExampleVariableInfo('acceleration')?.color ?? '#06b6d4',
                    }}
                />
                .
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // ========================================
    // INTERACTIVE FORMULA DEMO (Formula with Scrubble Numbers)
    // ========================================
    <StackLayout key="layout-heading-interactive-formula" maxWidth="xl">
        <Block id="heading-interactive-formula" padding="md">
            <EditableH2 id="h2-interactive-formula-title" blockId="heading-interactive-formula">
                Interactive Formula (Scrubble Numbers in Equations)
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-interactive-formula-intro" maxWidth="xl">
        <Block id="interactive-formula-intro" padding="sm">
            <EditableParagraph id="para-interactive-formula-intro" blockId="interactive-formula-intro">
                InteractiveFormula embeds draggable scrubble numbers directly inside a
                KaTeX equation. Use{" "}
                <InlineTooltip tooltip="\scrub{varName} renders the variable's current value as a draggable number inside the equation.">
                    \scrub&#123;varName&#125;
                </InlineTooltip>
                {" "}syntax for interactive variables, and the familiar{" "}
                <InlineTooltip tooltip="\clr{name}{content} colors a static part of the formula.">
                    \clr&#123;name&#125;&#123;content&#125;
                </InlineTooltip>
                {" "}syntax for colored static terms. Drag the numbers below to see
                the force update in real time!
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-interactive-formula-demo" maxWidth="xl">
        <Block id="interactive-formula-demo" padding="lg">
            <FormulaBlock
                latex="\clr{force}{F} = \scrub{mass} \times \scrub{acceleration}"
                colorMap={{ force: '#ef4444' }}
                variables={{
                    mass: {
                        min: 0.1,
                        max: 100,
                        step: 0.1,
                        color: getExampleVariableInfo('mass')?.color ?? '#a855f7',
                    },
                    acceleration: {
                        min: -20,
                        max: 20,
                        step: 0.1,
                        color: getExampleVariableInfo('acceleration')?.color ?? '#06b6d4',
                    },
                }}
            />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-interactive-formula-explanation" maxWidth="xl">
        <Block id="interactive-formula-explanation" padding="sm">
            <EditableParagraph id="para-interactive-formula-explanation" blockId="interactive-formula-explanation">
                Drag the{" "}
                <InlineScrubbleNumber
                    varName="mass"
                    {...numberPropsFromDefinition(getExampleVariableInfo('mass'))}
                />{" "}kg mass or the{" "}
                <InlineScrubbleNumber
                    varName="acceleration"
                    {...numberPropsFromDefinition(getExampleVariableInfo('acceleration'))}
                />{" "}m/s² acceleration — both the equation above and these
                inline numbers stay in sync through the global variable store.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // ========================================
    // FORMULA BLOCK: CLOZE INPUT DEMO
    // ========================================
    <StackLayout key="layout-heading-formula-cloze" maxWidth="xl">
        <Block id="heading-formula-cloze" padding="md">
            <EditableH2 id="h2-formula-cloze-title" blockId="heading-formula-cloze">
                Formula Cloze Input (Fill-in-the-Blank in Equations)
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-formula-cloze-intro" maxWidth="xl">
        <Block id="formula-cloze-intro" padding="sm">
            <EditableParagraph id="para-formula-cloze-intro" blockId="formula-cloze-intro">
                Use{" "}
                <InlineTooltip tooltip="\cloze{varName} renders a clickable fill-in-the-blank input inside the formula. Configure the correct answer, placeholder, and color in the Cloze tab of the editor.">
                    \cloze&#123;varName&#125;
                </InlineTooltip>
                {" "}syntax to embed interactive fill-in-the-blank inputs directly
                inside KaTeX equations. Click on the blue boxes below to type your
                answer. Can you complete the formula for the area of a circle?
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-formula-cloze-demo" maxWidth="xl">
        <Block id="formula-cloze-demo" padding="lg">
            <FormulaBlock
                latex="\clr{area}{A} = \clr{pi}{\pi} \cdot \cloze{formulaShapeChoice}"
                colorMap={{ area: '#ef4444', pi: '#3b82f6' }}
                clozeInputs={{
                    formulaShapeChoice: {
                        correctAnswer: 'r^2',
                        placeholder: '???',
                        color: '#D81B60',
                    },
                }}
            />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-formula-cloze-hint" maxWidth="xl">
        <Block id="formula-cloze-hint" padding="sm">
            <EditableParagraph id="para-formula-cloze-hint" blockId="formula-cloze-hint">
                Hint: The area of a circle is π times the square of the radius.
                Click the pink box in the formula and type your answer!
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // ========================================
    // FORMULA BLOCK: CLOZE CHOICE DEMO
    // ========================================
    <StackLayout key="layout-heading-formula-choice" maxWidth="xl">
        <Block id="heading-formula-choice" padding="md">
            <EditableH2 id="h2-formula-choice-title" blockId="heading-formula-choice">
                Formula Cloze Choice (Dropdown in Equations)
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-formula-choice-intro" maxWidth="xl">
        <Block id="formula-choice-intro" padding="sm">
            <EditableParagraph id="para-formula-choice-intro" blockId="formula-choice-intro">
                Use{" "}
                <InlineTooltip tooltip="\choice{varName} renders a clickable dropdown choice inside the formula. Configure the correct answer, options, and color in the Choices tab of the editor.">
                    \choice&#123;varName&#125;
                </InlineTooltip>
                {" "}syntax to embed dropdown multiple-choice selectors inside
                formulas. Click the purple box below and choose the correct
                expression for the denominator of the quadratic formula!
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-formula-choice-demo" maxWidth="xl">
        <Block id="formula-choice-demo" padding="lg">
            <FormulaBlock
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
                Hint: The denominator of the quadratic formula is two times{" "}
                <InlineFormula
                    latex="\clr{a}{a}"
                    colorMap={{ a: '#3b82f6' }}
                />. Which expression in the dropdown represents that?
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // ========================================
    // FORMULA BLOCK: LINKED HIGHLIGHT DEMO
    // ========================================
    <StackLayout key="layout-heading-formula-highlight" maxWidth="xl">
        <Block id="heading-formula-highlight" padding="md">
            <EditableH2 id="h2-formula-highlight-title" blockId="heading-formula-highlight">
                Formula Linked Highlight (Hover-to-Highlight in Equations)
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-formula-highlight-intro" maxWidth="xl">
        <Block id="formula-highlight-intro" padding="sm">
            <EditableParagraph id="para-formula-highlight-intro" blockId="formula-highlight-intro">
                Use{" "}
                <InlineTooltip tooltip="\highlight{id}{content} renders a hover-interactive term inside the formula. When hovered, it sets a shared variable so other components can react.">
                    \highlight&#123;id&#125;&#123;content&#125;
                </InlineTooltip>
                {" "}syntax to create linked hover-highlight terms inside formulas.
                Hover over the colored terms in the equation below — the matching
                description lights up, and vice versa!
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <SplitLayout key="layout-formula-highlight-demo" ratio="1:1" gap="lg">
        <Block id="formula-highlight-eq" padding="lg">
            <FormulaBlock
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
                Hover over each part of the formula to see its role:{" "}
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
                {" "}means we square the radius. Hover on either side!
            </EditableParagraph>
        </Block>
    </SplitLayout>,

    // ========================================
    // LINKED HIGHLIGHT DEMO (Hover-to-Highlight)
    // ========================================
    <StackLayout key="layout-heading-linkedhighlight" maxWidth="xl">
        <Block id="heading-linkedhighlight" padding="md">
            <EditableH2 id="h2-linkedhighlight-title" blockId="heading-linkedhighlight">
                Linked Highlight (Hover-to-Highlight)
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-linkedhighlight-intro" maxWidth="xl">
        <Block id="linkedhighlight-intro" padding="sm">
            <EditableParagraph id="para-linkedhighlight-intro" blockId="linkedhighlight-intro">
                InlineLinkedHighlight creates a coordination link between text and visuals.
                Hover over a highlighted term and the matching part of the diagram lights up.
                All highlights sharing the same group variable coordinate automatically
                through the global variable store.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <SplitLayout key="layout-linkedhighlight-demo" ratio="1:1" gap="lg">
        <Block id="linkedhighlight-text" padding="sm">
            <EditableParagraph id="para-linkedhighlight-demo" blockId="linkedhighlight-text">
                A simple data pipeline has three stages. First, the{" "}
                <InlineLinkedHighlight
                    id="linked-highlight-input"
                    varName="activeHighlight"
                    highlightId="input"
                    color="#3b82f6"
                >
                    input
                </InlineLinkedHighlight>
                {" "}stage collects raw data. Then the{" "}
                <InlineLinkedHighlight
                    id="linked-highlight-process"
                    varName="activeHighlight"
                    highlightId="process"
                    color="#22c55e"
                >
                    process
                </InlineLinkedHighlight>
                {" "}stage transforms it. Finally, the{" "}
                <InlineLinkedHighlight
                    id="linked-highlight-output"
                    varName="activeHighlight"
                    highlightId="output"
                    color="#f97316"
                >
                    output
                </InlineLinkedHighlight>
                {" "}stage delivers the result. Hover over any term to see
                the corresponding box light up in the diagram.
            </EditableParagraph>
        </Block>
        <Block id="linkedhighlight-viz" padding="sm" hasVisualization>
            <ReactiveHighlightDiagram />
        </Block>
    </SplitLayout>,

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
    // MATH TREE SCAFFOLD DEMO
    // ========================================
    ...mathTreeDemo,

    // ========================================
    // GEOMETRIC DIAGRAM DEMO
    // ========================================
    ...geometricDiagramDemo,

    // ========================================
    // VENN + NUMBER LINE DEMOS
    // ========================================
    ...vennAndNumberLineDemo,

    // ========================================
    // MATRIX VISUALIZATION DEMO
    // ========================================
    ...matrixDemoBlocks,

    // ========================================
    // SIMULATION PANEL DEMOS
    // ========================================
    ...simulationDemoBlocks,

    // ========================================
    // TABLE COMPONENT DEMO
    // ========================================
    ...tableDemoBlocks,

    // ========================================
    // DATA VISUALIZATION DEMO
    // ========================================
    ...dataVisualizationDemoBlocks,

    // ========================================
    // IMAGE DISPLAY DEMO
    // ========================================
    ...imageDisplayDemoBlocks,

    // ========================================
    // VIDEO DISPLAY DEMO
    // ========================================
    ...videoDisplayDemoBlocks,

    // ========================================
    // DESMOS DEMO
    // ========================================
    ...desmosDemoBlocks,

    // ========================================
    // BLOCK FEEDBACK DEMO
    // ========================================
    ...inlineFeedbackDemoBlocks,

    // ========================================
    // LAYOUTS DEMO
    // ========================================
    ...layoutsDemoBlocks,

];

export { exampleBlocks };
