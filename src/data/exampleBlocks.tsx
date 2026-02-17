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
import { FullWidthLayout } from "@/components/layouts";

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
];

export { exampleBlocks };
