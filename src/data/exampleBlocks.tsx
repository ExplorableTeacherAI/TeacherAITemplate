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
import { FullWidthLayout, SplitLayout } from "@/components/layouts";

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
} from "@/components/atoms";

// Import molecule components
import { FormulaBlock } from "@/components/molecules";

// Import store hooks
import { useVar } from "@/stores";

// Import section demos
import { cartesian2dDemo } from "./sections/cartesian2dDemo";
import { cartesian3dDemo } from "./sections/cartesian3dDemo";

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
    // ========================================
    // EDITABLE HEADINGS DEMO
    // ========================================
    <FullWidthLayout key="layout-heading-h1-01" maxWidth="xl">
        <Block id="block-heading-h1-01" padding="sm">
            <EditableH1 id="h1-main-title" blockId="block-heading-h1-01">
                Main Title (H1) - Click to Edit
            </EditableH1>
        </Block>
    </FullWidthLayout>,

    <FullWidthLayout key="layout-heading-h2-01" maxWidth="xl">
        <Block id="block-heading-h2-01" padding="sm">
            <EditableH2 id="h2-section-heading" blockId="block-heading-h2-01">
                Section Heading (H2) - Click to Edit
            </EditableH2>
        </Block>
    </FullWidthLayout>,

    <FullWidthLayout key="layout-heading-h3-01" maxWidth="xl">
        <Block id="block-heading-h3-01" padding="sm">
            <EditableH3 id="h3-subsection-heading" blockId="block-heading-h3-01">
                Subsection Heading (H3) - Click to Edit
            </EditableH3>
        </Block>
    </FullWidthLayout>,

    // ========================================
    // EDITABLE PARAGRAPHS DEMO
    // ========================================
    <FullWidthLayout key="layout-heading-h2-02" maxWidth="xl">
        <Block id="block-heading-h2-02" padding="sm">
            <EditableH2 id="h2-paragraphs-title" blockId="block-heading-h2-02">
                Editable Paragraphs
            </EditableH2>
        </Block>
    </FullWidthLayout>,

    <FullWidthLayout key="layout-paragraph-01" maxWidth="xl">
        <Block id="block-paragraph-01" padding="sm">
            <EditableParagraph id="para-intro-1" blockId="block-paragraph-01">
                This is an editable paragraph. Click on it to start editing the text.
                You can modify the content directly in-place. The changes are tracked
                and can be saved to the backend.
            </EditableParagraph>
        </Block>
    </FullWidthLayout>,

    <FullWidthLayout key="layout-paragraph-02" maxWidth="xl">
        <Block id="block-paragraph-02" padding="sm">
            <EditableParagraph id="para-intro-2" blockId="block-paragraph-02">
                Here's another paragraph to demonstrate that multiple paragraphs
                can be edited independently. Each paragraph maintains its own state
                and editing session.
            </EditableParagraph>
        </Block>
    </FullWidthLayout>,

    // ========================================
    // INLINE COMPONENTS DEMO
    // ========================================
    <FullWidthLayout key="layout-heading-h2-03" maxWidth="xl">
        <Block id="block-heading-h2-03" padding="sm">
            <EditableH2 id="h2-inline-title" blockId="block-heading-h2-03">
                Inline Components
            </EditableH2>
        </Block>
    </FullWidthLayout>,

    <FullWidthLayout key="layout-paragraph-03" maxWidth="xl">
        <Block id="block-paragraph-03" padding="sm">
            <EditableParagraph id="para-inline-intro" blockId="block-paragraph-03">
                Inline components allow interactive elements within text. Below are
                examples of scrubbable numbers that can be adjusted by dragging.
            </EditableParagraph>
        </Block>
    </FullWidthLayout>,

    // Inline scrubble number examples (use global vars from exampleVariables.ts)
    <FullWidthLayout key="layout-paragraph-04" maxWidth="xl">
        <Block id="block-paragraph-04" padding="sm">
            <EditableParagraph id="para-radius-example" blockId="block-paragraph-04">
                The circle has a radius of{" "}
                <InlineScrubbleNumber
                    id="scrubble-radius"
                    varName="radius"
                    {...numberPropsFromDefinition(getExampleVariableInfo('radius'))}
                />
                {" "}units, giving it an area proportional to r².
            </EditableParagraph>
        </Block>
    </FullWidthLayout>,

    <FullWidthLayout key="layout-paragraph-05" maxWidth="xl">
        <Block id="block-paragraph-05" padding="sm">
            <EditableParagraph id="para-temperature-example" blockId="block-paragraph-05">
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
    </FullWidthLayout>,

    <FullWidthLayout key="layout-paragraph-06" maxWidth="xl">
        <Block id="block-paragraph-06" padding="sm">
            <EditableParagraph id="para-count-example" blockId="block-paragraph-06">
                There are{" "}
                <InlineScrubbleNumber
                    id="scrubble-count"
                    varName="count"
                    {...numberPropsFromDefinition(getExampleVariableInfo('count'))}
                />
                {" "}items in the collection. Try dragging the number to adjust.
            </EditableParagraph>
        </Block>
    </FullWidthLayout>,

    // ========================================
    // CLOZE INPUT (Fill-in-the-blank) DEMO
    // ========================================
    <FullWidthLayout key="layout-heading-h2-cloze" maxWidth="xl">
        <Block id="block-heading-h2-cloze" padding="sm">
            <EditableH2 id="h2-cloze-title" blockId="block-heading-h2-cloze">
                Cloze Inputs (Fill-in-the-Blank)
            </EditableH2>
        </Block>
    </FullWidthLayout>,

    <FullWidthLayout key="layout-paragraph-cloze-intro" maxWidth="xl">
        <Block id="block-paragraph-cloze-intro" padding="sm">
            <EditableParagraph id="para-cloze-intro" blockId="block-paragraph-cloze-intro">
                Cloze inputs let students type answers inline. They auto-validate as
                you type and turn green when correct. Try the examples below.
            </EditableParagraph>
        </Block>
    </FullWidthLayout>,

    <FullWidthLayout key="layout-paragraph-cloze-01" maxWidth="xl">
        <Block id="block-paragraph-cloze-01" padding="sm">
            <EditableParagraph id="para-cloze-angle" blockId="block-paragraph-cloze-01">
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
    </FullWidthLayout>,

    <FullWidthLayout key="layout-paragraph-cloze-02" maxWidth="xl">
        <Block id="block-paragraph-cloze-02" padding="sm">
            <EditableParagraph id="para-cloze-unit" blockId="block-paragraph-cloze-02">
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
    </FullWidthLayout>,

    // ========================================
    // CLOZE CHOICES (Dropdown Fill-in-the-Blank)
    // ========================================
    <FullWidthLayout key="layout-heading-h2-cloze-choice" maxWidth="xl">
        <Block id="block-heading-h2-cloze-choice" padding="sm">
            <EditableH2 id="h2-cloze-choice-title" blockId="block-heading-h2-cloze-choice">
                Cloze Choices (Dropdown Fill-in-the-Blank)
            </EditableH2>
        </Block>
    </FullWidthLayout>,

    <FullWidthLayout key="layout-paragraph-choice-01" maxWidth="xl">
        <Block id="block-paragraph-choice-01" padding="sm">
            <EditableParagraph id="para-choice-shape" blockId="block-paragraph-choice-01">
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
    </FullWidthLayout>,

    <FullWidthLayout key="layout-paragraph-choice-02" maxWidth="xl">
        <Block id="block-paragraph-choice-02" padding="sm">
            <EditableParagraph id="para-choice-wave" blockId="block-paragraph-choice-02">
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
    </FullWidthLayout>,

    // ========================================
    // TOGGLE DEMO (Click to Cycle)
    // ========================================
    <FullWidthLayout key="layout-heading-h2-toggle" maxWidth="xl">
        <Block id="block-heading-h2-toggle" padding="sm">
            <EditableH2 id="h2-toggle-title" blockId="block-heading-h2-toggle">
                Toggle (Click to Cycle)
            </EditableH2>
        </Block>
    </FullWidthLayout>,

    <FullWidthLayout key="layout-paragraph-toggle-01" maxWidth="xl">
        <Block id="block-paragraph-toggle-01" padding="sm">
            <EditableParagraph id="para-toggle-shapes" blockId="block-paragraph-toggle-01">
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
    </FullWidthLayout>,

    <FullWidthLayout key="layout-paragraph-toggle-02" maxWidth="xl">
        <Block id="block-paragraph-toggle-02" padding="sm">
            <EditableParagraph id="para-toggle-measurement" blockId="block-paragraph-toggle-02">
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
    </FullWidthLayout>,

    // ========================================
    // TOOLTIP DEMO (Hover to Reveal)
    // ========================================
    <FullWidthLayout key="layout-heading-h2-tooltip" maxWidth="xl">
        <Block id="block-heading-h2-tooltip" padding="sm">
            <EditableH2 id="h2-tooltip-title" blockId="block-heading-h2-tooltip">
                Tooltip (Hover to Reveal)
            </EditableH2>
        </Block>
    </FullWidthLayout>,

    <FullWidthLayout key="layout-paragraph-tooltip-intro" maxWidth="xl">
        <Block id="block-paragraph-tooltip-intro" padding="sm">
            <EditableParagraph id="para-tooltip-intro" blockId="block-paragraph-tooltip-intro">
                Tooltips show definitions or extra information on hover. Unlike other
                inline components, they don't use the variable store — they're purely
                informational. Hover over the highlighted words below to see them in action.
            </EditableParagraph>
        </Block>
    </FullWidthLayout>,

    <FullWidthLayout key="layout-paragraph-tooltip-01" maxWidth="xl">
        <Block id="block-paragraph-tooltip-01" padding="sm">
            <EditableParagraph id="para-tooltip-circle" blockId="block-paragraph-tooltip-01">
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
    </FullWidthLayout>,

    <FullWidthLayout key="layout-paragraph-tooltip-02" maxWidth="xl">
        <Block id="block-paragraph-tooltip-02" padding="sm">
            <EditableParagraph id="para-tooltip-physics" blockId="block-paragraph-tooltip-02">
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
    </FullWidthLayout>,

    // ========================================
    // MIXED CONTENT DEMO (Physics Example)
    // ========================================
    <FullWidthLayout key="layout-heading-h2-04" maxWidth="xl">
        <Block id="block-heading-h2-04" padding="sm">
            <EditableH2 id="h2-physics-title" blockId="block-heading-h2-04">
                Physics Example: Projectile Motion
            </EditableH2>
        </Block>
    </FullWidthLayout>,

    <FullWidthLayout key="layout-paragraph-07" maxWidth="xl">
        <Block id="block-paragraph-07" padding="sm">
            <EditableParagraph id="para-projectile-intro" blockId="block-paragraph-07">
                Consider a projectile launched at an angle. The initial velocity is{" "}
                <InlineScrubbleNumber
                    id="scrubble-velocity"
                    varName="velocity"
                    {...numberPropsFromDefinition(getExampleVariableInfo('velocity'))}
                    formatValue={(v) => `${v} m/s`}
                />
                {" "}and the launch angle is{" "}
                <InlineScrubbleNumber
                    id="scrubble-angle"
                    varName="angle"
                    {...numberPropsFromDefinition(getExampleVariableInfo('angle'))}
                    formatValue={(v) => `${v}°`}
                />
                .
            </EditableParagraph>
        </Block>
    </FullWidthLayout>,

    <FullWidthLayout key="layout-heading-h3-02" maxWidth="xl">
        <Block id="block-heading-h3-02" padding="sm">
            <EditableH3 id="h3-parameters-title" blockId="block-heading-h3-02">
                Key Parameters
            </EditableH3>
        </Block>
    </FullWidthLayout>,

    <FullWidthLayout key="layout-paragraph-08" maxWidth="xl">
        <Block id="block-paragraph-08" padding="sm">
            <EditableParagraph id="para-gravity-example" blockId="block-paragraph-08">
                The gravitational acceleration is{" "}
                <InlineScrubbleNumber
                    id="scrubble-acceleration"
                    varName="acceleration"
                    {...numberPropsFromDefinition(getExampleVariableInfo('acceleration'))}
                    formatValue={(v) => `${v.toFixed(1)} m/s²`}
                />
                . You can adjust these values to see how they affect the trajectory.
            </EditableParagraph>
        </Block>
    </FullWidthLayout>,

    // ========================================
    // TRIGGER (CLICK TO SET VARIABLE) DEMO
    // ========================================
    <FullWidthLayout key="layout-heading-trigger" maxWidth="xl">
        <Block id="block-heading-trigger" padding="md">
            <EditableH2 id="h2-trigger-title" blockId="block-heading-trigger">
                Trigger (Click to Set Variable)
            </EditableH2>
        </Block>
    </FullWidthLayout>,

    <FullWidthLayout key="layout-trigger-intro" maxWidth="xl">
        <Block id="block-trigger-intro" padding="sm">
            <EditableParagraph id="para-trigger-intro" blockId="block-trigger-intro">
                InlineTrigger lets you set a variable to a specific value on click. Combine it with
                InlineScrubbleNumber so students can explore a value and quickly snap it to key points.
            </EditableParagraph>
        </Block>
    </FullWidthLayout>,

    <FullWidthLayout key="layout-trigger-example" maxWidth="xl">
        <Block id="block-trigger-example" padding="sm">
            <EditableParagraph id="para-trigger-example" blockId="block-trigger-example">
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
    </FullWidthLayout>,

    // ========================================
    // HYPERLINK (CLICK TO NAVIGATE) DEMO
    // ========================================
    <FullWidthLayout key="layout-heading-hyperlink" maxWidth="xl">
        <Block id="block-heading-hyperlink" padding="md">
            <EditableH2 id="h2-hyperlink-title" blockId="block-heading-hyperlink">
                Hyperlink (Click to Navigate)
            </EditableH2>
        </Block>
    </FullWidthLayout>,

    <FullWidthLayout key="layout-hyperlink-intro" maxWidth="xl">
        <Block id="block-hyperlink-intro" padding="sm">
            <EditableParagraph id="para-hyperlink-intro" blockId="block-hyperlink-intro">
                InlineHyperlink turns text into a clickable link that either opens an external URL in a
                new tab or smooth-scrolls to another block on the page.
            </EditableParagraph>
        </Block>
    </FullWidthLayout>,

    <FullWidthLayout key="layout-hyperlink-examples" maxWidth="xl">
        <Block id="block-hyperlink-examples" padding="sm">
            <EditableParagraph id="para-hyperlink-examples" blockId="block-hyperlink-examples">
                Read the{" "}
                <InlineHyperlink id="link-wikipedia-circles" href="https://en.wikipedia.org/wiki/Circle">
                    Wikipedia article on circles
                </InlineHyperlink>{" "}
                for more background, or{" "}
                <InlineHyperlink id="link-jump-trigger" targetBlockId="block-heading-trigger">
                    jump to the Trigger section
                </InlineHyperlink>{" "}
                above to see how triggers work.
            </EditableParagraph>
        </Block>
    </FullWidthLayout>,

    // ========================================
    // INLINE FORMULA DEMO (Inline Math)
    // ========================================
    <FullWidthLayout key="layout-heading-formula" maxWidth="xl">
        <Block id="block-heading-formula" padding="md">
            <EditableH2 id="h2-formula-title" blockId="block-heading-formula">
                Inline Formula (Inline Math)
            </EditableH2>
        </Block>
    </FullWidthLayout>,

    <FullWidthLayout key="layout-formula-intro" maxWidth="xl">
        <Block id="block-formula-intro" padding="sm">
            <EditableParagraph id="para-formula-intro" blockId="block-formula-intro">
                InlineFormula renders KaTeX math formulas directly within paragraph text.
                Like InlineTooltip, it does not use the variable store — it's purely for
                display. Use the{" "}
                <InlineTooltip id="tooltip-clr-syntax" tooltip="Syntax: \clr{name}{content} — maps term names to colors via the colorMap prop.">
                    \clr syntax
                </InlineTooltip>{" "}
                to color individual terms in the formula.
            </EditableParagraph>
        </Block>
    </FullWidthLayout>,

    <FullWidthLayout key="layout-formula-01" maxWidth="xl">
        <Block id="block-formula-01" padding="sm">
            <EditableParagraph id="para-formula-area" blockId="block-formula-01">
                The area of a circle is{" "}
                <InlineFormula
                    id="formula-circle-area"
                    latex="\clr{area}{A} = \clr{pi}{\pi} \clr{radius}{r}^2"
                    colorMap={{ area: '#ef4444', pi: '#3b82f6', radius: '#3cc499' }}
                />
                {" "}where r is the radius.
            </EditableParagraph>
        </Block>
    </FullWidthLayout>,

    <FullWidthLayout key="layout-formula-02" maxWidth="xl">
        <Block id="block-formula-02" padding="sm">
            <EditableParagraph id="para-formula-einstein" blockId="block-formula-02">
                Einstein's famous equation{" "}
                <InlineFormula
                    id="formula-einstein"
                    latex="\clr{energy}{E} = \clr{mass}{m}\clr{speed}{c}^2"
                    colorMap={{ energy: '#f97316', mass: '#a855f7', speed: '#06b6d4' }}
                />
                {" "}shows the equivalence of mass and energy.
            </EditableParagraph>
        </Block>
    </FullWidthLayout>,

    <FullWidthLayout key="layout-formula-03" maxWidth="xl">
        <Block id="block-formula-03" padding="sm">
            <EditableParagraph id="para-formula-quadratic" blockId="block-formula-03">
                The quadratic formula{" "}
                <InlineFormula
                    id="formula-quadratic"
                    latex="\clr{x}{x} = \frac{-\clr{b}{b} \pm \sqrt{\clr{b}{b}^2 - 4\clr{a}{a}\clr{c}{c}}}{2\clr{a}{a}}"
                    colorMap={{ x: '#ef4444', a: '#3b82f6', b: '#3cc499', c: '#f97316' }}
                />
                {" "}gives the roots of any quadratic equation.
            </EditableParagraph>
        </Block>
    </FullWidthLayout>,

    // ========================================
    // SPOT COLOR DEMO (Color-Coded Variables)
    // ========================================
    <FullWidthLayout key="layout-heading-spotcolor" maxWidth="xl">
        <Block id="block-heading-spotcolor" padding="md">
            <EditableH2 id="h2-spotcolor-title" blockId="block-heading-spotcolor">
                Spot Color (Color-Coded Variables)
            </EditableH2>
        </Block>
    </FullWidthLayout>,

    <FullWidthLayout key="layout-spotcolor-intro" maxWidth="xl">
        <Block id="block-spotcolor-intro" padding="sm">
            <EditableParagraph id="para-spotcolor-intro" blockId="block-spotcolor-intro">
                InlineSpotColor defines a color for a variable. When the same variable
                appears in a formula, the formula picks up the same color from the
                variable definition — creating a consistent visual link between
                prose and math.
            </EditableParagraph>
        </Block>
    </FullWidthLayout>,

    <FullWidthLayout key="layout-spotcolor-01" maxWidth="xl">
        <Block id="block-spotcolor-01" padding="sm">
            <EditableParagraph id="para-spotcolor-circle" blockId="block-spotcolor-01">
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
    </FullWidthLayout>,

    <FullWidthLayout key="layout-spotcolor-02" maxWidth="xl">
        <Block id="block-spotcolor-02" padding="sm">
            <EditableParagraph id="para-spotcolor-physics" blockId="block-spotcolor-02">
                The{" "}
                <InlineSpotColor id="spot-acceleration" varName="acceleration"
                    {...spotColorPropsFromDefinition(getExampleVariableInfo('acceleration'))}
                >
                    acceleration
                </InlineSpotColor>
                {" "}of an object is determined by the net force and its{" "}
                <InlineSpotColor id="spot-mass-2" varName="mass"
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
    </FullWidthLayout>,

    // ========================================
    // INTERACTIVE FORMULA DEMO (Formula with Scrubble Numbers)
    // ========================================
    <FullWidthLayout key="layout-heading-interactive-formula" maxWidth="xl">
        <Block id="block-heading-interactive-formula" padding="md">
            <EditableH2 id="h2-interactive-formula-title" blockId="block-heading-interactive-formula">
                Interactive Formula (Scrubble Numbers in Equations)
            </EditableH2>
        </Block>
    </FullWidthLayout>,

    <FullWidthLayout key="layout-interactive-formula-intro" maxWidth="xl">
        <Block id="block-interactive-formula-intro" padding="sm">
            <EditableParagraph id="para-interactive-formula-intro" blockId="block-interactive-formula-intro">
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
    </FullWidthLayout>,

    <FullWidthLayout key="layout-interactive-formula-demo" maxWidth="xl">
        <Block id="block-interactive-formula-demo" padding="lg">
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
    </FullWidthLayout>,

    <FullWidthLayout key="layout-interactive-formula-explanation" maxWidth="xl">
        <Block id="block-interactive-formula-explanation" padding="sm">
            <EditableParagraph id="para-interactive-formula-explanation" blockId="block-interactive-formula-explanation">
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
    </FullWidthLayout>,

    // ========================================
    // FORMULA BLOCK: CLOZE INPUT DEMO
    // ========================================
    <FullWidthLayout key="layout-heading-formula-cloze" maxWidth="xl">
        <Block id="block-heading-formula-cloze" padding="md">
            <EditableH2 id="h2-formula-cloze-title" blockId="block-heading-formula-cloze">
                Formula Cloze Input (Fill-in-the-Blank in Equations)
            </EditableH2>
        </Block>
    </FullWidthLayout>,

    <FullWidthLayout key="layout-formula-cloze-intro" maxWidth="xl">
        <Block id="block-formula-cloze-intro" padding="sm">
            <EditableParagraph id="para-formula-cloze-intro" blockId="block-formula-cloze-intro">
                Use{" "}
                <InlineTooltip tooltip="\cloze{varName} renders a clickable fill-in-the-blank input inside the formula. Configure the correct answer, placeholder, and color in the Cloze tab of the editor.">
                    \cloze&#123;varName&#125;
                </InlineTooltip>
                {" "}syntax to embed interactive fill-in-the-blank inputs directly
                inside KaTeX equations. Click on the blue boxes below to type your
                answer. Can you complete the formula for the area of a circle?
            </EditableParagraph>
        </Block>
    </FullWidthLayout>,

    <FullWidthLayout key="layout-formula-cloze-demo" maxWidth="xl">
        <Block id="block-formula-cloze-demo" padding="lg">
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
    </FullWidthLayout>,

    <FullWidthLayout key="layout-formula-cloze-hint" maxWidth="xl">
        <Block id="block-formula-cloze-hint" padding="sm">
            <EditableParagraph id="para-formula-cloze-hint" blockId="block-formula-cloze-hint">
                Hint: The area of a circle is π times the square of the radius.
                Click the pink box in the formula and type your answer!
            </EditableParagraph>
        </Block>
    </FullWidthLayout>,

    // ========================================
    // FORMULA BLOCK: CLOZE CHOICE DEMO
    // ========================================
    <FullWidthLayout key="layout-heading-formula-choice" maxWidth="xl">
        <Block id="block-heading-formula-choice" padding="md">
            <EditableH2 id="h2-formula-choice-title" blockId="block-heading-formula-choice">
                Formula Cloze Choice (Dropdown in Equations)
            </EditableH2>
        </Block>
    </FullWidthLayout>,

    <FullWidthLayout key="layout-formula-choice-intro" maxWidth="xl">
        <Block id="block-formula-choice-intro" padding="sm">
            <EditableParagraph id="para-formula-choice-intro" blockId="block-formula-choice-intro">
                Use{" "}
                <InlineTooltip tooltip="\choice{varName} renders a clickable dropdown choice inside the formula. Configure the correct answer, options, and color in the Choices tab of the editor.">
                    \choice&#123;varName&#125;
                </InlineTooltip>
                {" "}syntax to embed dropdown multiple-choice selectors inside
                formulas. Click the purple box below and choose the correct operator
                for the quadratic formula!
            </EditableParagraph>
        </Block>
    </FullWidthLayout>,

    <FullWidthLayout key="layout-formula-choice-demo" maxWidth="xl">
        <Block id="block-formula-choice-demo" padding="lg">
            <FormulaBlock
                latex="\clr{x}{x} = \frac{-\clr{b}{b} \pm \sqrt{\clr{b}{b}^2 - 4\clr{a}{a}\clr{c}{c}}}{2 \choice{formulaOperator} \clr{a}{a}}"
                colorMap={{ x: '#ef4444', a: '#3b82f6', b: '#22c55e', c: '#f59e0b' }}
                clozeChoices={{
                    formulaOperator: {
                        correctAnswer: '×',
                        options: ['+', '-', '×', '÷'],
                        placeholder: '?',
                        color: '#8B5CF6',
                    },
                }}
            />
        </Block>
    </FullWidthLayout>,

    <FullWidthLayout key="layout-formula-choice-hint" maxWidth="xl">
        <Block id="block-formula-choice-hint" padding="sm">
            <EditableParagraph id="para-formula-choice-hint" blockId="block-formula-choice-hint">
                Hint: In the quadratic formula, the denominator is 2 times{" "}
                <InlineFormula
                    latex="\clr{a}{a}"
                    colorMap={{ a: '#3b82f6' }}
                />. What operation goes between 2 and{" "}
                <InlineFormula
                    latex="\clr{a}{a}"
                    colorMap={{ a: '#3b82f6' }}
                />?
            </EditableParagraph>
        </Block>
    </FullWidthLayout>,

    // ========================================
    // FORMULA BLOCK: LINKED HIGHLIGHT DEMO
    // ========================================
    <FullWidthLayout key="layout-heading-formula-highlight" maxWidth="xl">
        <Block id="block-heading-formula-highlight" padding="md">
            <EditableH2 id="h2-formula-highlight-title" blockId="block-heading-formula-highlight">
                Formula Linked Highlight (Hover-to-Highlight in Equations)
            </EditableH2>
        </Block>
    </FullWidthLayout>,

    <FullWidthLayout key="layout-formula-highlight-intro" maxWidth="xl">
        <Block id="block-formula-highlight-intro" padding="sm">
            <EditableParagraph id="para-formula-highlight-intro" blockId="block-formula-highlight-intro">
                Use{" "}
                <InlineTooltip tooltip="\highlight{id}{content} renders a hover-interactive term inside the formula. When hovered, it sets a shared variable so other components can react.">
                    \highlight&#123;id&#125;&#123;content&#125;
                </InlineTooltip>
                {" "}syntax to create linked hover-highlight terms inside formulas.
                Hover over the colored terms in the equation below — the matching
                description lights up, and vice versa!
            </EditableParagraph>
        </Block>
    </FullWidthLayout>,

    <SplitLayout key="layout-formula-highlight-demo" ratio="1:1" gap="lg">
        <Block id="block-formula-highlight-eq" padding="lg">
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
        <Block id="block-formula-highlight-desc" padding="sm">
            <EditableParagraph id="para-formula-highlight-desc" blockId="block-formula-highlight-desc">
                Hover over each part of the formula to see its role:{" "}
                <InlineLinkedHighlight
                    id="lh-fArea"
                    varName="formulaHighlightGroup"
                    highlightId="fArea"
                    color="#ef4444"
                >
                    A
                </InlineLinkedHighlight>
                {" "}is the area of the circle,{" "}
                <InlineLinkedHighlight
                    id="lh-fPi"
                    varName="formulaHighlightGroup"
                    highlightId="fPi"
                    color="#3b82f6"
                >
                    π
                </InlineLinkedHighlight>
                {" "}is the ratio of circumference to diameter (≈ 3.14159),{" "}
                <InlineLinkedHighlight
                    id="lh-fRadius"
                    varName="formulaHighlightGroup"
                    highlightId="fRadius"
                    color="#22c55e"
                >
                    r
                </InlineLinkedHighlight>
                {" "}is the radius, and the exponent{" "}
                <InlineLinkedHighlight
                    id="lh-fSquared"
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
    <FullWidthLayout key="layout-heading-linkedhighlight" maxWidth="xl">
        <Block id="block-heading-linkedhighlight" padding="md">
            <EditableH2 id="h2-linkedhighlight-title" blockId="block-heading-linkedhighlight">
                Linked Highlight (Hover-to-Highlight)
            </EditableH2>
        </Block>
    </FullWidthLayout>,

    <FullWidthLayout key="layout-linkedhighlight-intro" maxWidth="xl">
        <Block id="block-linkedhighlight-intro" padding="sm">
            <EditableParagraph id="para-linkedhighlight-intro" blockId="block-linkedhighlight-intro">
                InlineLinkedHighlight creates a coordination link between text and visuals.
                Hover over a highlighted term and the matching part of the diagram lights up.
                All highlights sharing the same group variable coordinate automatically
                through the global variable store.
            </EditableParagraph>
        </Block>
    </FullWidthLayout>,

    <SplitLayout key="layout-linkedhighlight-demo" ratio="1:1" gap="lg">
        <Block id="block-linkedhighlight-text" padding="sm">
            <EditableParagraph id="para-linkedhighlight-demo" blockId="block-linkedhighlight-text">
                A simple data pipeline has three stages. First, the{" "}
                <InlineLinkedHighlight
                    id="lh-input"
                    varName="activeHighlight"
                    highlightId="input"
                    color="#3b82f6"
                >
                    input
                </InlineLinkedHighlight>
                {" "}stage collects raw data. Then the{" "}
                <InlineLinkedHighlight
                    id="lh-process"
                    varName="activeHighlight"
                    highlightId="process"
                    color="#22c55e"
                >
                    process
                </InlineLinkedHighlight>
                {" "}stage transforms it. Finally, the{" "}
                <InlineLinkedHighlight
                    id="lh-output"
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
        <Block id="block-linkedhighlight-viz" padding="sm">
            <ReactiveHighlightDiagram />
        </Block>
    </SplitLayout>,

    // ========================================
    // CARTESIAN 2D DEMO
    // ========================================
    ...cartesian2dDemo,

    // ========================================
    // CARTESIAN 3D DEMO
    // ========================================
    ...cartesian3dDemo,

];

export { exampleBlocks };
