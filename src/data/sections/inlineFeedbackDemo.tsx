import { type ReactElement } from "react";
import { StackLayout } from "@/components/layouts";
import { Block } from "@/components/templates";
import {
    EditableH2,
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
            <EditableH2 id="h2-inline-feedback-title" blockId="inline-feedback-title">
                Inline Feedback — Interactive Assessment
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-inline-feedback-intro" maxWidth="xl">
        <Block id="inline-feedback-intro" padding="sm">
            <EditableParagraph id="para-inline-feedback-intro" blockId="inline-feedback-intro">
                Inline feedback provides instant responses right next to your answer, 
                eliminating the need for a separate "Check Answer" button. When you 
                answer correctly, you'll see a confirmation with an explanation. If 
                you need another try, you'll get a helpful hint. Try the questions below!
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // ── Q1: Circle diameter (fill-in-the-blank) ───────────────────────────
    <StackLayout key="layout-inline-feedback-q1" maxWidth="xl">
        <Block id="inline-feedback-q1" padding="md">
            <EditableParagraph id="para-inline-feedback-q1" blockId="inline-feedback-q1">
                A circle with radius 3 has a diameter of{" "}
                <InlineFeedback
                    varName="fbCircleDiameter"
                    correctValue="6"
                    successMessage="Brilliant! You nailed it — the diameter is always twice the radius, so 2 × 3 = 6"
                    failureMessage="Almost there!"
                    hint="The diameter stretches all the way across the circle through its centre, which means it's exactly twice the radius — try 2 × 3"
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

    // ── Q2: Circle part (dropdown choice) ─────────────────────────────────
    <StackLayout key="layout-inline-feedback-q2" maxWidth="xl">
        <Block id="inline-feedback-q2" padding="md">
            <EditableParagraph id="para-inline-feedback-q2" blockId="inline-feedback-q2">
                The part of a circle that connects the centre to a point on the edge is
                called the{" "}
                <InlineFeedback
                    varName="fbCirclePart"
                    correctValue="radius"
                    successMessage="Excellent! The radius is like a spoke on a wheel — it reaches from the very centre out to the edge, and every point on a circle is exactly one radius away from the centre"
                    failureMessage="Good thinking, but not quite!"
                    hint="Picture drawing a line from the centre dot to the circle's edge — that's the measurement we're looking for, and it's half as long as the diameter"
                >
                    <InlineClozeChoice
                        varName="fbCirclePart"
                        correctAnswer="radius"
                        options={["diameter", "radius", "circumference", "arc"]}
                        {...choicePropsFromDefinition(getExampleVariableInfo("fbCirclePart"))}
                    />
                </InlineFeedback>.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // ── Q3: Area formula (dropdown choice) ────────────────────────────────
    <StackLayout key="layout-inline-feedback-q3" maxWidth="xl">
        <Block id="inline-feedback-q3" padding="md">
            <EditableParagraph id="para-inline-feedback-q3" blockId="inline-feedback-q3">
                The formula for the area of a circle is{" "}
                <InlineFeedback
                    varName="fbAreaFormula"
                    correctValue="πr²"
                    successMessage="Perfect! Area = πr² is one of the most beautiful formulas in mathematics — the radius gets squared because area measures two-dimensional space"
                    failureMessage="Close, but let's think about this differently —"
                    hint="circumference (2πr) measures the distance around, but area measures the space inside, so we need to square the radius"
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

    // ── Q4: Triangle area (fill-in-the-blank) ─────────────────────────────
    <StackLayout key="layout-inline-feedback-q4" maxWidth="xl">
        <Block id="inline-feedback-q4" padding="md">
            <EditableParagraph id="para-inline-feedback-q4" blockId="inline-feedback-q4">
                A triangle with base 4 and height 3 has an area of{" "}
                <InlineFeedback
                    varName="ifTriangleArea"
                    correctValue="6"
                    successMessage="Fantastic work! You correctly used the formula: ½ × base × height = ½ × 4 × 3 = 6 — a triangle is always half the area of a rectangle with the same base and height"
                    failureMessage="You're on the right track!"
                    hint="A triangle's area is half of what a rectangle would be — multiply base × height (4 × 3 = 12), then take half of that"
                >
                    <InlineClozeInput
                        varName="ifTriangleArea"
                        correctAnswer="6"
                        {...clozePropsFromDefinition(getExampleVariableInfo("ifTriangleArea"))}
                    />
                </InlineFeedback>.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // ── Q5: Triangle angles (dropdown choice) ─────────────────────────────
    <StackLayout key="layout-inline-feedback-q5" maxWidth="xl">
        <Block id="inline-feedback-q5" padding="md">
            <EditableParagraph id="para-inline-feedback-q5" blockId="inline-feedback-q5">
                The sum of interior angles in any triangle is{" "}
                <InlineFeedback
                    varName="ifTriangleAngles"
                    correctValue="180°"
                    successMessage="You've got it! This is one of geometry's fundamental truths — no matter how you stretch or squish a triangle, its three angles will always add up to exactly 180°"
                    failureMessage="Not quite, but here's a way to remember —"
                    hint="imagine tearing off the three corners of a triangle and placing them together, they form a straight line, which is 180°"
                >
                    <InlineClozeChoice
                        varName="ifTriangleAngles"
                        correctAnswer="180°"
                        options={["90°", "180°", "360°", "270°"]}
                        {...choicePropsFromDefinition(getExampleVariableInfo("ifTriangleAngles"))}
                    />
                </InlineFeedback>.
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
