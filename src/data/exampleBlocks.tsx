import { type ReactElement } from "react";
import { Block } from "@/components/templates";

// Initialize variables from example variable definitions (single source of truth)
import { useVariableStore } from "@/stores";
import {
    getExampleDefaultValues,
    getExampleVariableInfo,
    numberPropsFromDefinition,
    clozePropsFromDefinition,
    choicePropsFromDefinition,
    togglePropsFromDefinition,
} from "./exampleVariables";
useVariableStore.getState().initialize(getExampleDefaultValues());

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
                <InlineTooltip tooltip="A shape where all points are equidistant from the center.">
                    circle
                </InlineTooltip>
                {" "}is the same distance from its center. This distance is called the{" "}
                <InlineTooltip tooltip="The distance from the center of a circle to any point on its edge.">
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
                    tooltip="A quantity that has both magnitude and direction, represented by an arrow."
                    color="#3B82F6"
                >
                    vectors
                </InlineTooltip>
                {" "}are used to describe forces and motion. The{" "}
                <InlineTooltip
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
                    varName="velocity"
                    {...numberPropsFromDefinition(getExampleVariableInfo('velocity'))}
                    formatValue={(v) => `${v} m/s`}
                />
                {" "}and the launch angle is{" "}
                <InlineScrubbleNumber
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
                    varName="animationSpeed"
                    {...numberPropsFromDefinition(getExampleVariableInfo('animationSpeed'))}
                />
                . You can{" "}
                <InlineTrigger varName="animationSpeed" value={1} icon="refresh">
                    reset it to 1
                </InlineTrigger>{" "}
                or{" "}
                <InlineTrigger varName="animationSpeed" value={5} icon="zap">
                    max it out
                </InlineTrigger>.
            </EditableParagraph>
        </Block>
    </FullWidthLayout>,
];

export { exampleBlocks };
