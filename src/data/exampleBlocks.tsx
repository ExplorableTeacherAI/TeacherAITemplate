import { type ReactElement } from "react";
import { Block } from "@/components/templates";

// Initialize variables from example variable definitions (single source of truth)
import { useVariableStore } from "@/stores";
import {
    getExampleDefaultValues,
    getExampleVariableInfo,
    numberPropsFromDefinition,
    clozePropsFromDefinition,
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
];

export { exampleBlocks };
