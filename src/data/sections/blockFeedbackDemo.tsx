import { type ReactElement } from "react";
import { StackLayout } from "@/components/layouts";
import { Block } from "@/components/templates";
import {
    EditableH2,
    EditableParagraph,
    InlineClozeInput,
    InlineClozeChoice,
} from "@/components/atoms";
import { BlockFeedback } from "@/components/organisms";
import {
    getExampleVariableInfo,
    clozePropsFromDefinition,
    choicePropsFromDefinition,
} from "../exampleVariables";

// ── Exported demo blocks ─────────────────────────────────────────────────────

export const blockFeedbackDemoBlocks: ReactElement[] = [
    // ── Title ─────────────────────────────────────────────────────────────
    <StackLayout key="layout-bfd-title" maxWidth="xl">
        <Block id="block-bfd-title" padding="sm">
            <EditableH2 id="h2-bfd-title" blockId="block-bfd-title">
                Block Feedback — Inline Assessment Feedback
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-bfd-intro" maxWidth="xl">
        <Block id="block-bfd-intro" padding="sm">
            <EditableParagraph id="para-bfd-intro" blockId="block-bfd-intro">
                The BlockFeedback component wraps any block that contains a cloze
                input or cloze choice. Feedback appears automatically beside the
                content — no "Check Answer" button needed. When the answer is wrong, a
                hint and review link guide the student. Try each question below.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // ── Q1: Fill-in-the-blank with BlockFeedback ──────────────────────────
    <StackLayout key="layout-bfd-q1" maxWidth="xl">
        <Block id="block-bfd-q1" padding="md">
            <BlockFeedback
                varName="fbCircleDiameter"
                correctValue="6"
                successMessage="Nice work! The diameter is always twice the radius — 2 × 3 = 6. Now see if you can name the parts of a circle below."
                failureMessage="Not quite — remember, the diameter is always twice the radius."
                hint="If r = 3, what is 2 × 3? Take another look at"
                reviewBlockId="block-ca-parts"
                reviewLabel="circle anatomy."
            >
                <EditableParagraph id="para-bfd-q1" blockId="block-bfd-q1">
                    A circle with radius 3 has a diameter of{" "}
                    <InlineClozeInput
                        varName="fbCircleDiameter"
                        correctAnswer="6"
                        {...clozePropsFromDefinition(getExampleVariableInfo("fbCircleDiameter"))}
                    />.
                </EditableParagraph>
            </BlockFeedback>
        </Block>
    </StackLayout>,

    // ── Q2: Dropdown choice with BlockFeedback ────────────────────────────
    <StackLayout key="layout-bfd-q2" maxWidth="xl">
        <Block id="block-bfd-q2" padding="md">
            <BlockFeedback
                varName="fbCirclePart"
                correctValue="radius"
                successMessage="Great job! The radius goes from the centre to the edge. You're on a roll — try the formula question next!"
                failureMessage="Think about which measurement starts at the centre and ends at the circle's edge."
                hint="It's the distance from the centre to the circumference — shorter than the diameter. You can revisit"
                reviewBlockId="block-ca-parts"
                reviewLabel="circle parts."
            >
                <EditableParagraph id="para-bfd-q2" blockId="block-bfd-q2">
                    The part of a circle that connects the centre to a point on the edge is
                    called the{" "}
                    <InlineClozeChoice
                        varName="fbCirclePart"
                        correctAnswer="radius"
                        options={["diameter", "radius", "circumference", "arc"]}
                        {...choicePropsFromDefinition(getExampleVariableInfo("fbCirclePart"))}
                    />.
                </EditableParagraph>
            </BlockFeedback>
        </Block>
    </StackLayout>,

    // ── Q3: Dropdown choice with BlockFeedback ────────────────────────────
    <StackLayout key="layout-bfd-q3" maxWidth="xl">
        <Block id="block-bfd-q3" padding="md">
            <BlockFeedback
                varName="fbAreaFormula"
                correctValue="πr²"
                successMessage="You got it! Area = πr² — you've nailed all three. You really know your circles!"
                failureMessage="Think about which formula involves squaring the radius."
                hint="Circumference is 2πr — area uses r², not just r. Check out"
                reviewBlockId="block-ca-measures"
                reviewLabel="circle formulas."
            >
                <EditableParagraph id="para-bfd-q3" blockId="block-bfd-q3">
                    The formula for the area of a circle is{" "}
                    <InlineClozeChoice
                        varName="fbAreaFormula"
                        correctAnswer="πr²"
                        options={["2πr", "πr²", "πd", "r²"]}
                        {...choicePropsFromDefinition(getExampleVariableInfo("fbAreaFormula"))}
                    />.
                </EditableParagraph>
            </BlockFeedback>
        </Block>
    </StackLayout>,
];
