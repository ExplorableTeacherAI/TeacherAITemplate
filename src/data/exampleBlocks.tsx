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
import { FullWidthLayout, SplitLayout, GridLayout } from "@/components/layouts";

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
} from "@/components/atoms";

// Import visual components
import {
    AnimatedGraph,
    D3BarChart,
    FlowDiagram,
    ThreeCanvas,
    RotatingCube,
    PulsingSphere,
    ThreeCoordinateSystem,
    Equation,
    MafsBasic,
    MafsInteractive,
} from "@/components/atoms";
import { DesmosGraph } from "@/components/organisms";
import type { FlowNode, FlowEdge } from "@/components/atoms";

// Import store hooks for reactive visual wrappers
import { useVar, useSetVar } from "@/stores";

// ============================================================================
// REACTIVE VISUAL WRAPPERS
// These small components read from the global variable store (useVar)
// so that InlineScrubbleNumber and InlineTrigger changes drive the visuals.
// ============================================================================

/** SVG circle whose radius is driven by the "radius" variable */
function ReactiveCircle() {
    const r = useVar('radius', 5) as number;
    const maxR = 20;
    const svgSize = 320;
    const scaledR = (r / maxR) * (svgSize / 2 - 10);
    const area = Math.PI * r * r;
    const circumference = 2 * Math.PI * r;

    return (
        <div className="flex flex-col items-center gap-3 p-4 bg-card rounded-xl">
            <svg width={svgSize} height={svgSize} viewBox={`0 0 ${svgSize} ${svgSize}`}>
                <circle
                    cx={svgSize / 2}
                    cy={svgSize / 2}
                    r={scaledR}
                    fill="rgba(60, 196, 153, 0.15)"
                    stroke="#3cc499"
                    strokeWidth={2.5}
                    style={{ transition: 'r 0.15s ease-out' }}
                />
                <line
                    x1={svgSize / 2}
                    y1={svgSize / 2}
                    x2={svgSize / 2 + scaledR}
                    y2={svgSize / 2}
                    stroke="#3cc499"
                    strokeWidth={2}
                    strokeDasharray="6 3"
                />
                <text
                    x={svgSize / 2 + scaledR / 2}
                    y={svgSize / 2 - 8}
                    textAnchor="middle"
                    fill="#3cc499"
                    fontSize={14}
                    fontWeight={600}
                >
                    r = {r}
                </text>
                <circle cx={svgSize / 2} cy={svgSize / 2} r={3} fill="#3cc499" />
            </svg>
            <div className="text-sm text-muted-foreground space-y-1 text-center">
                <div>Area = <span className="font-mono font-semibold text-foreground">{area.toFixed(1)}</span> m²</div>
                <div>Circumference = <span className="font-mono font-semibold text-foreground">{circumference.toFixed(1)}</span> m</div>
            </div>
        </div>
    );
}

/** 3D Rotating Cube driven by "cubeSize" and "cubeSpeed" variables */
function ReactiveCube() {
    const size = useVar('cubeSize', 1.5) as number;
    const speed = useVar('cubeSpeed', 1) as number;

    return (
        <div className="rounded-lg overflow-hidden bg-background">
            <ThreeCanvas height={320}>
                <RotatingCube size={size} speed={speed} color="#4F46E5" />
            </ThreeCanvas>
        </div>
    );
}

/** Mafs interactive sine wave driven by "amplitude" and "frequency" variables */
function ReactiveSineWave() {
    const amp = useVar('amplitude', 1) as number;
    const freq = useVar('frequency', 1) as number;
    const setVar = useSetVar();

    return (
        <div className="w-full rounded-lg overflow-hidden">
            <MafsInteractive
                amplitude={amp}
                frequency={freq}
                onAmplitudeChange={(v) => setVar('amplitude', v)}
                onFrequencyChange={(v) => setVar('frequency', v)}
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
    // VISUAL COMPONENTS — ANIMATED GRAPHS
    // ========================================
    <FullWidthLayout key="layout-heading-visuals" maxWidth="xl">
        <Block id="block-heading-visuals" padding="md">
            <EditableH2 id="h2-visuals-title" blockId="block-heading-visuals">
                Visual Components
            </EditableH2>
        </Block>
    </FullWidthLayout>,

    <FullWidthLayout key="layout-visuals-intro" maxWidth="xl">
        <Block id="block-visuals-intro" padding="sm">
            <EditableParagraph id="para-visuals-intro" blockId="block-visuals-intro">
                Visual components bring concepts to life with animated graphs, interactive
                charts, 3D models, flow diagrams, and embedded math tools. Below are examples
                of each type, using SplitLayout, GridLayout, and other arrangements.
            </EditableParagraph>
        </Block>
    </FullWidthLayout>,

    // ── Animated Sine Wave (SplitLayout) ──
    <FullWidthLayout key="layout-heading-animated-graph" maxWidth="xl">
        <Block id="block-heading-animated-graph" padding="sm">
            <EditableH3 id="h3-animated-graph-title" blockId="block-heading-animated-graph">
                Animated Math Graph (Two.js)
            </EditableH3>
        </Block>
    </FullWidthLayout>,

    <SplitLayout key="layout-animated-sine" ratio="1:1" gap="lg">
        <Block id="block-animated-sine-text" padding="sm">
            <EditableParagraph id="para-animated-sine" blockId="block-animated-sine-text">
                This{" "}
                <InlineTooltip id="tooltip-sine-wave" tooltip="A smooth, periodic oscillation described by y = A sin(ωx + φ).">
                    sine wave
                </InlineTooltip>{" "}
                animation is rendered using Two.js. The green curve traces a continuously
                moving wave while the blue reference dot marks the current phase. Sine waves
                are the building blocks of all periodic phenomena — from sound to light.
            </EditableParagraph>
            <EditableParagraph id="para-animated-sine-formula" blockId="block-animated-sine-text">
                The general form is{" "}
                <InlineFormula
                    id="formula-sine-general"
                    latex="\clr{y}{y} = \clr{A}{A} \sin(\clr{omega}{\omega} \clr{x}{x} + \clr{phi}{\varphi})"
                    colorMap={{ y: '#10B981', A: '#ef4444', omega: '#3b82f6', x: '#f97316', phi: '#a855f7' }}
                />
                {" "}where each parameter shapes the wave differently.
            </EditableParagraph>
        </Block>
        <Block id="block-animated-sine-viz" padding="sm">
            <div className="rounded-lg overflow-hidden bg-background">
                <AnimatedGraph
                    variant="sine-wave"
                    color="#10B981"
                    secondaryColor="#3B82F6"
                    width={500}
                    height={350}
                    showAxes={true}
                    showGrid={false}
                />
            </div>
        </Block>
    </SplitLayout>,

    // ── Pendulum Animation (SplitLayout) ──
    <SplitLayout key="layout-animated-pendulum" ratio="1:1" gap="lg">
        <Block id="block-animated-pendulum-viz" padding="sm">
            <div className="rounded-lg overflow-hidden bg-background">
                <AnimatedGraph
                    variant="pendulum"
                    color="#8B5CF6"
                    secondaryColor="#EC4899"
                    width={500}
                    height={350}
                    showAxes={false}
                />
            </div>
        </Block>
        <Block id="block-animated-pendulum-text" padding="sm">
            <EditableParagraph id="para-animated-pendulum" blockId="block-animated-pendulum-text">
                A{" "}
                <InlineTooltip id="tooltip-pendulum" tooltip="A weight suspended from a pivot so that it can swing freely back and forth.">
                    pendulum
                </InlineTooltip>{" "}
                demonstrates{" "}
                <InlineTooltip id="tooltip-shm" tooltip="Motion that repeats with a constant period, like a spring or pendulum.">
                    simple harmonic motion
                </InlineTooltip>{" "}
                — one of the most fundamental concepts in physics. The bob swings back
                and forth under gravity, tracing a periodic path. For small angles, the
                period depends only on the length of the string and gravitational acceleration.
            </EditableParagraph>
            <EditableParagraph id="para-pendulum-period" blockId="block-animated-pendulum-text">
                The period is{" "}
                <InlineFormula
                    id="formula-pendulum-period"
                    latex="\clr{T}{T} = 2\pi\sqrt{\frac{\clr{L}{L}}{\clr{g}{g}}}"
                    colorMap={{ T: '#8B5CF6', L: '#EC4899', g: '#06b6d4' }}
                />
                {" "}regardless of the mass.
            </EditableParagraph>
        </Block>
    </SplitLayout>,

    // ========================================
    // D3 BAR CHART
    // ========================================
    <FullWidthLayout key="layout-heading-d3-chart" maxWidth="xl">
        <Block id="block-heading-d3-chart" padding="sm">
            <EditableH3 id="h3-d3-chart-title" blockId="block-heading-d3-chart">
                D3 Bar Chart (Data Visualization)
            </EditableH3>
        </Block>
    </FullWidthLayout>,

    <SplitLayout key="layout-d3-chart" ratio="1:1" gap="lg">
        <Block id="block-d3-chart-text" padding="sm">
            <EditableParagraph id="para-d3-chart-intro" blockId="block-d3-chart-text">
                D3.js enables rich, interactive data visualizations right inside your lesson
                content. This bar chart displays planet distances from the Sun in astronomical
                units. Hover over each bar to see the exact value — the chart uses smooth
                entrance animations and responsive scaling.
            </EditableParagraph>
            <EditableParagraph id="para-d3-chart-detail" blockId="block-d3-chart-text">
                Bar charts are ideal for comparing discrete categories. Notice how{" "}
                <InlineTooltip id="tooltip-au" tooltip="One AU equals the average distance from Earth to the Sun, about 150 million km.">
                    astronomical units
                </InlineTooltip>{" "}
                make it easy to compare vast interplanetary distances on a single scale.
            </EditableParagraph>
        </Block>
        <Block id="block-d3-chart-viz" padding="sm">
            <div className="p-4 bg-card rounded-xl">
                <D3BarChart
                    data={[
                        { label: "Mercury", value: 0.39 },
                        { label: "Venus", value: 0.72 },
                        { label: "Earth", value: 1.0 },
                        { label: "Mars", value: 1.52 },
                        { label: "Jupiter", value: 5.2 },
                        { label: "Saturn", value: 9.54 },
                    ]}
                    width={480}
                    height={340}
                    color="#3B82F6"
                />
            </div>
        </Block>
    </SplitLayout>,

    // ========================================
    // FLOW DIAGRAM
    // ========================================
    <FullWidthLayout key="layout-heading-flow" maxWidth="xl">
        <Block id="block-heading-flow" padding="sm">
            <EditableH3 id="h3-flow-title" blockId="block-heading-flow">
                Flow Diagram (Process Visualization)
            </EditableH3>
        </Block>
    </FullWidthLayout>,

    <FullWidthLayout key="layout-flow-intro" maxWidth="xl">
        <Block id="block-flow-intro" padding="sm">
            <EditableParagraph id="para-flow-intro" blockId="block-flow-intro">
                Flow diagrams show relationships and processes as nodes connected by edges.
                The diagram below illustrates the scientific method — drag the nodes around,
                zoom in and out, or use the mini-map to navigate.
            </EditableParagraph>
        </Block>
    </FullWidthLayout>,

    <FullWidthLayout key="layout-flow-diagram" maxWidth="xl">
        <Block id="block-flow-diagram" padding="sm">
            <FlowDiagram
                nodes={[
                    { id: "1", label: "Observe", position: { x: 50, y: 150 }, type: "input", style: { background: '#DBEAFE', border: '2px solid #3B82F6', color: '#1E40AF', fontWeight: 600 } },
                    { id: "2", label: "Question", position: { x: 250, y: 50 }, style: { background: '#FEF3C7', border: '2px solid #F59E0B', color: '#92400E', fontWeight: 600 } },
                    { id: "3", label: "Hypothesize", position: { x: 250, y: 250 }, style: { background: '#D1FAE5', border: '2px solid #10B981', color: '#065F46', fontWeight: 600 } },
                    { id: "4", label: "Experiment", position: { x: 500, y: 150 }, style: { background: '#EDE9FE', border: '2px solid #8B5CF6', color: '#5B21B6', fontWeight: 600 } },
                    { id: "5", label: "Analyze", position: { x: 700, y: 50 }, style: { background: '#FCE7F3', border: '2px solid #EC4899', color: '#9D174D', fontWeight: 600 } },
                    { id: "6", label: "Conclude", position: { x: 700, y: 250 }, type: "output", style: { background: '#FFEDD5', border: '2px solid #F97316', color: '#9A3412', fontWeight: 600 } },
                ] as FlowNode[]}
                edges={[
                    { id: "e1-2", source: "1", target: "2", animated: true, label: "leads to" },
                    { id: "e1-3", source: "1", target: "3", animated: true, label: "inspires" },
                    { id: "e2-4", source: "2", target: "4", label: "test with" },
                    { id: "e3-4", source: "3", target: "4", label: "verify via" },
                    { id: "e4-5", source: "4", target: "5", label: "produces" },
                    { id: "e5-6", source: "5", target: "6", label: "supports" },
                    { id: "e6-1", source: "6", target: "1", type: "smoothstep", animated: true, label: "repeat", style: { stroke: '#9CA3AF', strokeDasharray: '5 5' } },
                ] as FlowEdge[]}
                height={380}
                showBackground={true}
                backgroundVariant="dots"
                showControls={true}
                showMinimap={false}
                nodesDraggable={true}
                fitView={true}
            />
        </Block>
    </FullWidthLayout>,

    // ========================================
    // 3D VISUALIZATIONS (Three.js)
    // ========================================
    <FullWidthLayout key="layout-heading-threejs" maxWidth="xl">
        <Block id="block-heading-threejs" padding="sm">
            <EditableH3 id="h3-threejs-title" blockId="block-heading-threejs">
                3D Visualizations (Three.js)
            </EditableH3>
        </Block>
    </FullWidthLayout>,

    <FullWidthLayout key="layout-threejs-intro" maxWidth="xl">
        <Block id="block-threejs-intro" padding="sm">
            <EditableParagraph id="para-threejs-intro" blockId="block-threejs-intro">
                Three.js brings interactive 3D graphics to your lessons. Drag to orbit,
                scroll to zoom, and hover to interact. These components are useful for
                teaching spatial geometry, molecular structures, and physics simulations.
            </EditableParagraph>
        </Block>
    </FullWidthLayout>,

    <GridLayout key="layout-threejs-grid" columns={2} gap="lg">
        <Block id="block-threejs-cube" padding="sm">
            <EditableH3 id="h3-cube-title" blockId="block-threejs-cube">
                Rotating Cube
            </EditableH3>
            <EditableParagraph id="para-cube-desc" blockId="block-threejs-cube">
                A cube has 6 faces, 12 edges, and 8 vertices. Hover to change color.
            </EditableParagraph>
            <div className="rounded-lg overflow-hidden bg-background mt-2">
                <ThreeCanvas height={280}>
                    <RotatingCube size={1.5} color="#4F46E5" />
                </ThreeCanvas>
            </div>
        </Block>
        <Block id="block-threejs-sphere" padding="sm">
            <EditableH3 id="h3-sphere-title" blockId="block-threejs-sphere">
                Pulsing Sphere
            </EditableH3>
            <EditableParagraph id="para-sphere-desc" blockId="block-threejs-sphere">
                A sphere is the set of all points equidistant from a center in 3D space.
            </EditableParagraph>
            <div className="rounded-lg overflow-hidden bg-background mt-2">
                <ThreeCanvas height={280}>
                    <PulsingSphere color="#10B981" />
                </ThreeCanvas>
            </div>
        </Block>
    </GridLayout>,

    <SplitLayout key="layout-threejs-coords" ratio="1:1" gap="lg">
        <Block id="block-threejs-coords-text" padding="sm">
            <EditableParagraph id="para-coords-3d" blockId="block-threejs-coords-text">
                A{" "}
                <InlineTooltip id="tooltip-3d-coords" tooltip="A system using three perpendicular axes (X, Y, Z) to describe positions in three-dimensional space.">
                    3D coordinate system
                </InlineTooltip>{" "}
                extends the familiar 2D plane by adding a third axis perpendicular to both
                X and Y. Each point in space is described by an ordered triple{" "}
                <InlineFormula
                    id="formula-3d-point"
                    latex="(\clr{x}{x}, \clr{y}{y}, \clr{z}{z})"
                    colorMap={{ x: '#ef4444', y: '#22c55e', z: '#3b82f6' }}
                />
                . The{" "}
                <InlineFormula
                    id="formula-x-axis"
                    latex="\clr{x}{x}"
                    colorMap={{ x: '#ef4444' }}
                />{" "}axis is red,{" "}
                <InlineFormula
                    id="formula-y-axis"
                    latex="\clr{y}{y}"
                    colorMap={{ y: '#22c55e' }}
                />{" "}is green, and{" "}
                <InlineFormula
                    id="formula-z-axis"
                    latex="\clr{z}{z}"
                    colorMap={{ z: '#3b82f6' }}
                />{" "}is blue.
            </EditableParagraph>
        </Block>
        <Block id="block-threejs-coords-viz" padding="sm">
            <div className="rounded-lg overflow-hidden bg-background">
                <ThreeCanvas height={340} cameraPosition={[5, 5, 5]}>
                    <ThreeCoordinateSystem size={4} showGrid={true} gridSize={10} />
                </ThreeCanvas>
            </div>
        </Block>
    </SplitLayout>,

    // ========================================
    // DESMOS INTERACTIVE GRAPH
    // ========================================
    <FullWidthLayout key="layout-heading-desmos" maxWidth="xl">
        <Block id="block-heading-desmos" padding="sm">
            <EditableH3 id="h3-desmos-title" blockId="block-heading-desmos">
                Desmos Interactive Graph
            </EditableH3>
        </Block>
    </FullWidthLayout>,

    <SplitLayout key="layout-desmos-graph" ratio="1:1" gap="lg">
        <Block id="block-desmos-text" padding="sm">
            <EditableParagraph id="para-desmos-intro" blockId="block-desmos-text">
                Desmos provides a full-featured graphing calculator embedded directly in
                the lesson. Students can type new expressions, adjust sliders, and explore
                mathematical relationships interactively.
            </EditableParagraph>
            <EditableParagraph id="para-desmos-detail" blockId="block-desmos-text">
                This graph shows a{" "}
                <InlineTooltip id="tooltip-parabola" tooltip="The U-shaped curve formed by a quadratic equation y = ax² + bx + c.">
                    parabola
                </InlineTooltip>{" "}
                and a sine curve. Try modifying the expressions or adding your own — the
                calculator supports everything from trigonometry to calculus.
            </EditableParagraph>
        </Block>
        <Block id="block-desmos-viz" padding="sm">
            <div className="rounded-lg overflow-hidden">
                <DesmosGraph
                    expressions={[
                        { latex: "y = x^2", color: "#2d70b3" },
                        { latex: "y = \\sin(x)", color: "#c74440" },
                    ]}
                    height={380}
                    options={{
                        expressions: true,
                        settingsMenu: false,
                        zoomButtons: true,
                    }}
                />
            </div>
        </Block>
    </SplitLayout>,

    // ========================================
    // GRID LAYOUT WITH MULTIPLE ANIMATIONS
    // ========================================
    <FullWidthLayout key="layout-heading-grid-visuals" maxWidth="xl">
        <Block id="block-heading-grid-visuals" padding="sm">
            <EditableH3 id="h3-grid-visuals-title" blockId="block-heading-grid-visuals">
                Grid Layout — Math Animation Gallery
            </EditableH3>
        </Block>
    </FullWidthLayout>,

    <FullWidthLayout key="layout-grid-visuals-intro" maxWidth="xl">
        <Block id="block-grid-visuals-intro" padding="sm">
            <EditableParagraph id="para-grid-visuals-intro" blockId="block-grid-visuals-intro">
                GridLayout arranges multiple visualizations side by side. Below is a
                gallery of mathematical animations — each rendered with Two.js — showcasing
                parametric curves, Fourier series, and Lissajous figures.
            </EditableParagraph>
        </Block>
    </FullWidthLayout>,

    <GridLayout key="layout-animation-gallery" columns={3} gap="md">
        <Block id="block-viz-parametric" padding="sm">
            <EditableH3 id="h3-parametric" blockId="block-viz-parametric">
                Parametric Rose
            </EditableH3>
            <div className="rounded-lg overflow-hidden bg-background">
                <AnimatedGraph
                    variant="parametric"
                    color="#EC4899"
                    secondaryColor="#F59E0B"
                    width={320}
                    height={280}
                    showAxes={true}
                    showGrid={true}
                />
            </div>
        </Block>
        <Block id="block-viz-fourier" padding="sm">
            <EditableH3 id="h3-fourier" blockId="block-viz-fourier">
                Fourier Series
            </EditableH3>
            <div className="rounded-lg overflow-hidden bg-background">
                <AnimatedGraph
                    variant="fourier"
                    color="#F59E0B"
                    secondaryColor="#EF4444"
                    width={320}
                    height={280}
                    showAxes={true}
                    showGrid={true}
                />
            </div>
        </Block>
        <Block id="block-viz-lissajous" padding="sm">
            <EditableH3 id="h3-lissajous" blockId="block-viz-lissajous">
                Lissajous Curve
            </EditableH3>
            <div className="rounded-lg overflow-hidden bg-background">
                <AnimatedGraph
                    variant="lissajous"
                    color="#06B6D4"
                    secondaryColor="#3B82F6"
                    width={320}
                    height={280}
                    showAxes={true}
                    showGrid={true}
                />
            </div>
        </Block>
    </GridLayout>,

    // ========================================
    // BLOCK-LEVEL EQUATION
    // ========================================
    <FullWidthLayout key="layout-heading-equation" maxWidth="xl">
        <Block id="block-heading-equation" padding="sm">
            <EditableH3 id="h3-equation-title" blockId="block-heading-equation">
                Block-Level Equation
            </EditableH3>
        </Block>
    </FullWidthLayout>,

    <FullWidthLayout key="layout-equation-intro" maxWidth="xl">
        <Block id="block-equation-intro" padding="sm">
            <EditableParagraph id="para-equation-intro" blockId="block-equation-intro">
                The Equation component renders block-level KaTeX math with colored terms.
                Hover over individual terms to highlight them — this creates a visual
                connection between the symbols and their meaning.
            </EditableParagraph>
        </Block>
    </FullWidthLayout>,

    <FullWidthLayout key="layout-equation-euler" maxWidth="xl">
        <Block id="block-equation-euler" padding="sm">
            <EditableParagraph id="para-euler-context" blockId="block-equation-euler">
                Euler's identity is often called the most beautiful equation in mathematics
                because it connects five fundamental constants:
            </EditableParagraph>
            <div className="my-4 flex justify-center">
                <Equation
                    latex="\clr{e}{e}^{\clr{i}{i}\clr{pi}{\pi}} + \clr{one}{1} = \clr{zero}{0}"
                    colorMap={{
                        e: '#ef4444',
                        i: '#3b82f6',
                        pi: '#10B981',
                        one: '#f97316',
                        zero: '#8B5CF6',
                    }}
                />
            </div>
            <EditableParagraph id="para-euler-explanation" blockId="block-equation-euler">
                Here{" "}
                <InlineFormula id="formula-e" latex="\clr{e}{e}" colorMap={{ e: '#ef4444' }} />
                {" "}is Euler's number,{" "}
                <InlineFormula id="formula-i" latex="\clr{i}{i}" colorMap={{ i: '#3b82f6' }} />
                {" "}is the imaginary unit, and{" "}
                <InlineFormula id="formula-pi" latex="\clr{pi}{\pi}" colorMap={{ pi: '#10B981' }} />
                {" "}is pi. Together they form a deep link between algebra, geometry, and analysis.
            </EditableParagraph>
        </Block>
    </FullWidthLayout>,

    // ── Mafs Coordinate System ──
    <FullWidthLayout key="layout-heading-mafs" maxWidth="xl">
        <Block id="block-heading-mafs" padding="sm">
            <EditableH3 id="h3-mafs-title" blockId="block-heading-mafs">
                Mafs Coordinate System (Interactive Math)
            </EditableH3>
        </Block>
    </FullWidthLayout>,

    <SplitLayout key="layout-mafs-basic" ratio="1:1" gap="lg">
        <Block id="block-mafs-text" padding="sm">
            <EditableParagraph id="para-mafs-intro" blockId="block-mafs-text">
                Mafs is a React library purpose-built for math visualizations. It renders
                clean coordinate systems with proper mathematical conventions — axis labels,
                grid lines, and smooth function plots.
            </EditableParagraph>
            <EditableParagraph id="para-mafs-detail" blockId="block-mafs-text">
                The plot on the right shows{" "}
                <InlineFormula
                    id="formula-mafs-sine"
                    latex="\clr{y}{y} = \sin(\clr{x}{x})"
                    colorMap={{ y: '#ef4444', x: '#3b82f6' }}
                />
                {" "}rendered with Mafs. Unlike canvas-based approaches, Mafs uses SVG for
                crisp rendering at any zoom level.
            </EditableParagraph>
        </Block>
        <Block id="block-mafs-viz" padding="sm">
            <div className="w-full rounded-lg overflow-hidden">
                <MafsBasic />
            </div>
        </Block>
    </SplitLayout>,

    // ========================================
    // INTERACTIVE VISUALS — Scrubble Numbers & Triggers Drive Graphics
    // ========================================
    <FullWidthLayout key="layout-heading-interactive-visuals" maxWidth="xl">
        <Block id="block-heading-interactive-visuals" padding="md">
            <EditableH2 id="h2-interactive-visuals-title" blockId="block-heading-interactive-visuals">
                Interactive Visuals (Variables Drive Graphics)
            </EditableH2>
        </Block>
    </FullWidthLayout>,

    <FullWidthLayout key="layout-interactive-visuals-intro" maxWidth="xl">
        <Block id="block-interactive-visuals-intro" padding="sm">
            <EditableParagraph id="para-interactive-visuals-intro" blockId="block-interactive-visuals-intro">
                The real power of explorable explanations comes from linking inline controls
                directly to visualizations. When a student drags a scrubbable number or clicks
                a trigger, the graphic updates instantly. All values flow through the global
                variable store — the same variable powers both the text and the visual.
            </EditableParagraph>
        </Block>
    </FullWidthLayout>,

    // ── 1. SVG Circle driven by radius ──
    <FullWidthLayout key="layout-heading-reactive-circle" maxWidth="xl">
        <Block id="block-heading-reactive-circle" padding="sm">
            <EditableH3 id="h3-reactive-circle-title" blockId="block-heading-reactive-circle">
                SVG Circle Controlled by Scrubble Number
            </EditableH3>
        </Block>
    </FullWidthLayout>,

    <SplitLayout key="layout-reactive-circle" ratio="1:1" gap="lg">
        <Block id="block-reactive-circle-text" padding="sm">
            <EditableParagraph id="para-reactive-circle-1" blockId="block-reactive-circle-text">
                Drag the{" "}
                <InlineSpotColor id="spot-radius-viz" varName="radius"
                    {...spotColorPropsFromDefinition(getExampleVariableInfo('radius'))}
                >
                    radius
                </InlineSpotColor>
                {" "}to see the circle change size in real time. The radius is currently{" "}
                <InlineScrubbleNumber
                    id="scrubble-radius-viz"
                    varName="radius"
                    {...numberPropsFromDefinition(getExampleVariableInfo('radius'))}
                    formatValue={(v) => `${v} m`}
                />
                . The area and circumference update automatically.
            </EditableParagraph>
            <EditableParagraph id="para-reactive-circle-2" blockId="block-reactive-circle-text">
                Quick presets:{" "}
                <InlineTrigger id="trigger-radius-small" varName="radius" value={2}>
                    small (2 m)
                </InlineTrigger>{" "}
                <InlineTrigger id="trigger-radius-medium" varName="radius" value={8}>
                    medium (8 m)
                </InlineTrigger>{" "}
                <InlineTrigger id="trigger-radius-large" varName="radius" value={16}>
                    large (16 m)
                </InlineTrigger>
            </EditableParagraph>
            <EditableParagraph id="para-reactive-circle-formulas" blockId="block-reactive-circle-text">
                The formulas at work:{" "}
                <InlineFormula
                    id="formula-circle-area-viz"
                    latex="\clr{A}{A} = \pi \clr{r}{r}^2"
                    colorMap={{ A: '#ef4444', r: '#3cc499' }}
                />
                {" "}and{" "}
                <InlineFormula
                    id="formula-circle-circ-viz"
                    latex="\clr{C}{C} = 2\pi \clr{r}{r}"
                    colorMap={{ C: '#3b82f6', r: '#3cc499' }}
                />
                .
            </EditableParagraph>
        </Block>
        <Block id="block-reactive-circle-viz" padding="sm">
            <ReactiveCircle />
        </Block>
    </SplitLayout>,

    // ── 2. 3D Cube driven by cubeSize / cubeSpeed ──
    <FullWidthLayout key="layout-heading-reactive-cube" maxWidth="xl">
        <Block id="block-heading-reactive-cube" padding="sm">
            <EditableH3 id="h3-reactive-cube-title" blockId="block-heading-reactive-cube">
                3D Cube Controlled by Scrubble Numbers & Triggers
            </EditableH3>
        </Block>
    </FullWidthLayout>,

    <SplitLayout key="layout-reactive-cube" ratio="1:1" gap="lg">
        <Block id="block-reactive-cube-text" padding="sm">
            <EditableParagraph id="para-reactive-cube-1" blockId="block-reactive-cube-text">
                This 3D cube is controlled by two variables from the store. The{" "}
                <InlineSpotColor id="spot-cubesize" varName="cubeSize"
                    {...spotColorPropsFromDefinition(getExampleVariableInfo('cubeSize'))}
                >
                    size
                </InlineSpotColor>
                {" "}is{" "}
                <InlineScrubbleNumber
                    id="scrubble-cubesize"
                    varName="cubeSize"
                    {...numberPropsFromDefinition(getExampleVariableInfo('cubeSize'))}
                />
                {" "}and the{" "}
                <InlineSpotColor id="spot-cubespeed" varName="cubeSpeed"
                    {...spotColorPropsFromDefinition(getExampleVariableInfo('cubeSpeed'))}
                >
                    rotation speed
                </InlineSpotColor>
                {" "}is{" "}
                <InlineScrubbleNumber
                    id="scrubble-cubespeed"
                    varName="cubeSpeed"
                    {...numberPropsFromDefinition(getExampleVariableInfo('cubeSpeed'))}
                    formatValue={(v) => `${v}x`}
                />
                . Drag either number and watch the cube react.
            </EditableParagraph>
            <EditableParagraph id="para-reactive-cube-2" blockId="block-reactive-cube-text">
                Preset configurations:{" "}
                <InlineTrigger id="trigger-cube-tiny" varName="cubeSize" value={0.5} icon="zap">
                    tiny
                </InlineTrigger>{" "}
                <InlineTrigger id="trigger-cube-default" varName="cubeSize" value={1.5} icon="refresh">
                    default
                </InlineTrigger>{" "}
                <InlineTrigger id="trigger-cube-huge" varName="cubeSize" value={3} icon="zap">
                    huge
                </InlineTrigger>
                {" "}&mdash;{" "}
                <InlineTrigger id="trigger-cube-freeze" varName="cubeSpeed" value={0}>
                    freeze
                </InlineTrigger>{" "}
                <InlineTrigger id="trigger-cube-fast" varName="cubeSpeed" value={4} icon="zap">
                    turbo spin
                </InlineTrigger>
            </EditableParagraph>
            <EditableParagraph id="para-reactive-cube-3" blockId="block-reactive-cube-text">
                A cube with side length{" "}
                <InlineFormula
                    id="formula-cube-side"
                    latex="\clr{s}{s}"
                    colorMap={{ s: '#4F46E5' }}
                />
                {" "}has volume{" "}
                <InlineFormula
                    id="formula-cube-vol"
                    latex="\clr{V}{V} = \clr{s}{s}^3"
                    colorMap={{ V: '#ef4444', s: '#4F46E5' }}
                />
                {" "}and surface area{" "}
                <InlineFormula
                    id="formula-cube-sa"
                    latex="\clr{SA}{SA} = 6\clr{s}{s}^2"
                    colorMap={{ SA: '#3b82f6', s: '#4F46E5' }}
                />
                .
            </EditableParagraph>
        </Block>
        <Block id="block-reactive-cube-viz" padding="sm">
            <ReactiveCube />
        </Block>
    </SplitLayout>,

    // ── 3. Mafs Interactive Sine Wave driven by amplitude / frequency ──
    <FullWidthLayout key="layout-heading-reactive-sine" maxWidth="xl">
        <Block id="block-heading-reactive-sine" padding="sm">
            <EditableH3 id="h3-reactive-sine-title" blockId="block-heading-reactive-sine">
                Interactive Sine Wave (Bidirectional Control)
            </EditableH3>
        </Block>
    </FullWidthLayout>,

    <FullWidthLayout key="layout-reactive-sine-intro" maxWidth="xl">
        <Block id="block-reactive-sine-intro" padding="sm">
            <EditableParagraph id="para-reactive-sine-intro" blockId="block-reactive-sine-intro">
                This example shows true bidirectional linking. Drag the scrubbable numbers in
                the text below and the graph updates. Or drag the colored points directly in
                the graph and the numbers in the text update. Both directions flow through the
                same global variable store.
            </EditableParagraph>
        </Block>
    </FullWidthLayout>,

    <SplitLayout key="layout-reactive-sine" ratio="1:1" gap="lg">
        <Block id="block-reactive-sine-text" padding="sm">
            <EditableParagraph id="para-reactive-sine-1" blockId="block-reactive-sine-text">
                A sine wave is described by{" "}
                <InlineFormula
                    id="formula-reactive-sine"
                    latex="\clr{y}{y} = \clr{A}{A} \sin(\clr{f}{f} \cdot \clr{x}{x})"
                    colorMap={{ y: '#10B981', A: '#ef4444', f: '#3b82f6', x: '#f97316' }}
                />
                . The{" "}
                <InlineSpotColor id="spot-amplitude" varName="amplitude"
                    color="#ef4444"
                >
                    amplitude
                </InlineSpotColor>
                {" "}controls vertical stretch:{" "}
                <InlineScrubbleNumber
                    id="scrubble-amplitude-viz"
                    varName="amplitude"
                    {...numberPropsFromDefinition(getExampleVariableInfo('amplitude'))}
                />
                . The{" "}
                <InlineSpotColor id="spot-frequency" varName="frequency"
                    color="#3b82f6"
                >
                    frequency
                </InlineSpotColor>
                {" "}controls oscillation rate:{" "}
                <InlineScrubbleNumber
                    id="scrubble-frequency-viz"
                    varName="frequency"
                    {...numberPropsFromDefinition(getExampleVariableInfo('frequency'))}
                    formatValue={(v) => `${v} Hz`}
                />
                .
            </EditableParagraph>
            <EditableParagraph id="para-reactive-sine-2" blockId="block-reactive-sine-text">
                Try these interesting configurations:{" "}
                <InlineTrigger id="trigger-amp-flat" varName="amplitude" value={0.2}>
                    flat wave
                </InlineTrigger>{" "}
                <InlineTrigger id="trigger-amp-tall" varName="amplitude" value={4} icon="zap">
                    tall wave
                </InlineTrigger>{" "}
                <InlineTrigger id="trigger-freq-slow" varName="frequency" value={0.3}>
                    low frequency
                </InlineTrigger>{" "}
                <InlineTrigger id="trigger-freq-fast" varName="frequency" value={5} icon="zap">
                    high frequency
                </InlineTrigger>
            </EditableParagraph>
            <EditableParagraph id="para-reactive-sine-3" blockId="block-reactive-sine-text">
                Reset to defaults:{" "}
                <InlineTrigger id="trigger-amp-reset" varName="amplitude" value={1} icon="refresh">
                    amplitude = 1
                </InlineTrigger>{" "}
                <InlineTrigger id="trigger-freq-reset" varName="frequency" value={1} icon="refresh">
                    frequency = 1
                </InlineTrigger>
            </EditableParagraph>
        </Block>
        <Block id="block-reactive-sine-viz" padding="sm">
            <ReactiveSineWave />
        </Block>
    </SplitLayout>,
];

export { exampleBlocks };
