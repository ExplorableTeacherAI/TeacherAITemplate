import { type ReactElement } from "react";
import { StackLayout } from "@/components/layouts";
import { Block } from "@/components/templates";
import {
    EditableH3,
    EditableParagraph,
    InlineClozeInput,
    InlineClozeChoice,
    InlineFeedback,
} from "@/components/atoms";
import {
    getExampleVariableInfo,
    clozePropsFromDefinition,
    choicePropsFromDefinition,
} from "../exampleVariables";

// ── Exported demo blocks ─────────────────────────────────────────────────────

export const inlineFeedbackDemoBlocks: ReactElement[] = [
    // ── Title ─────────────────────────────────────────────────────────────
    <StackLayout key="layout-inline-feedback-title" maxWidth="xl">
        <Block id="inline-feedback-title" padding="sm">
            <EditableH3 id="h3-inline-feedback-title" blockId="inline-feedback-title">
                Inline Feedback — Position Examples
            </EditableH3>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-inline-feedback-intro" maxWidth="xl">
        <Block id="inline-feedback-intro" padding="sm">
            <EditableParagraph id="para-inline-feedback-intro" blockId="inline-feedback-intro">
                Inline feedback adapts to where it appears in your text. The three examples
                below demonstrate terminal (blank at end), mid-sentence (blank with words
                after), and standalone (question then blank) positions.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // ── Q1: Terminal position — blank at end, detailed feedback OK ────────
    <StackLayout key="layout-inline-feedback-q1" maxWidth="xl">
        <Block id="inline-feedback-q1" padding="md">
            <EditableParagraph id="para-inline-feedback-q1-label" blockId="inline-feedback-q1">
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    Terminal position (blank ends sentence):
                </span>
            </EditableParagraph>
            <EditableParagraph id="para-inline-feedback-q1" blockId="inline-feedback-q1">
                Because a circle's diameter passes straight through the center, a circle
                with radius 3 has diameter{" "}
                <InlineFeedback
                    varName="fbCircleDiameter"
                    correctValue="6"
                    position="terminal"
                    successMessage="— exactly! The diameter is always twice the radius, so 2 × 3 = 6"
                    failureMessage="— not quite."
                    hint="The diameter stretches all the way across through the center"
                >
                    <InlineClozeInput
                        varName="fbCircleDiameter"
                        correctAnswer="6"
                        {...clozePropsFromDefinition(getExampleVariableInfo("fbCircleDiameter"))}
                    />
                </InlineFeedback>.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // ── Q2: Mid-sentence position — brief feedback to maintain flow ───────
    <StackLayout key="layout-inline-feedback-q2" maxWidth="xl">
        <Block id="inline-feedback-q2" padding="md">
            <EditableParagraph id="para-inline-feedback-q2-label" blockId="inline-feedback-q2">
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    Mid-sentence position (words follow blank):
                </span>
            </EditableParagraph>
            <EditableParagraph id="para-inline-feedback-q2" blockId="inline-feedback-q2">
                In a 4-way grid, an interior cell has exactly{" "}
                <InlineFeedback
                    varName="fbNeighbors"
                    correctValue="4"
                    position="mid"
                    hint="Count: up, down, left, right"
                >
                    <InlineClozeInput
                        varName="fbNeighbors"
                        correctAnswer="4"
                        {...clozePropsFromDefinition(getExampleVariableInfo("fbNeighbors"))}
                    />
                </InlineFeedback>{" "}
                neighbors, one in each cardinal direction.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // ── Q3: Standalone position — question ends with ?, conversational ────
    <StackLayout key="layout-inline-feedback-q3" maxWidth="xl">
        <Block id="inline-feedback-q3" padding="md">
            <EditableParagraph id="para-inline-feedback-q3-label" blockId="inline-feedback-q3">
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    Standalone position (question then blank):
                </span>
            </EditableParagraph>
            <EditableParagraph id="para-inline-feedback-q3" blockId="inline-feedback-q3">
                Since we compute the distance around a circle with 2πr, which formula
                gives us the area?{" "}
                <InlineFeedback
                    varName="fbAreaFormula"
                    correctValue="πr²"
                    position="standalone"
                    successMessage="Perfect! Area = πr² is one of the most beautiful formulas in mathematics"
                    failureMessage="Not quite!"
                    hint="Circumference measures the distance around, but area measures the space inside — we need to square the radius"
                >
                    <InlineClozeChoice
                        varName="fbAreaFormula"
                        correctAnswer="πr²"
                        options={["2πr", "πr²", "πd", "r²"]}
                        {...choicePropsFromDefinition(getExampleVariableInfo("fbAreaFormula"))}
                    />
                </InlineFeedback>
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
