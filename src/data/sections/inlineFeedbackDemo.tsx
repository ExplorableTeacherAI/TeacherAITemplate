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
                Inline Feedback
            </EditableH3>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-inline-feedback-intro" maxWidth="xl">
        <Block id="inline-feedback-intro" padding="sm">
            <EditableParagraph id="para-inline-feedback-intro" blockId="inline-feedback-intro">
                Inline feedback provides instant responses right next to your answer. When you
                answer correctly, you'll see a confirmation with an explanation. If
                you need another try, you'll get a helpful hint. Try the questions below!
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // ── Q1: Circle diameter (fill-in-the-blank) ───────────────────────────
    <StackLayout key="layout-inline-feedback-q1" maxWidth="xl">
        <Block id="inline-feedback-q1" padding="md">
            <EditableParagraph id="para-inline-feedback-q1" blockId="inline-feedback-q1">
                Because a circle's diameter is defined as passing straight across the center, a circle with a radius of 3 must have a diameter exactly equal to{" "}
                <InlineFeedback
                    varName="fbCircleDiameter"
                    correctValue="6"
                    successMessage="Brilliant! You nailed it, since the diameter is always twice the radius, so 2 × 3 = 6"
                    failureMessage="Almost there!"
                    hint="The diameter stretches all the way across the circle through its centre, which means it is exactly twice the radius. Try calculating 2 × 3"
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

    // ── Q2: Area formula (dropdown choice) ────────────────────────────────
    <StackLayout key="layout-inline-feedback-q2" maxWidth="xl">
        <Block id="inline-feedback-q2" padding="md">
            <EditableParagraph id="para-inline-feedback-q2" blockId="inline-feedback-q2">
                Since we compute the distance around a circle with 2πr, we compute the space inside the circle by equating its area to{" "}
                <InlineFeedback
                    varName="fbAreaFormula"
                    correctValue="πr²"
                    successMessage="Perfect! Area = πr² is one of the most beautiful formulas in mathematics. The radius gets squared because area measures two-dimensional space"
                    failureMessage="Close, but let's think about this differently:"
                    hint="Circumference (2πr) measures the distance around, but area measures the space inside, so we need to square the radius"
                >
                    <InlineClozeChoice
                        varName="fbAreaFormula"
                        correctAnswer="πr²"
                        options={["2πr", "πr²", "πd", "r²"]}
                        {...choicePropsFromDefinition(getExampleVariableInfo("fbAreaFormula"))}
                    />
                </InlineFeedback>.
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
