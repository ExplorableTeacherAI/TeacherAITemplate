import { type ReactElement } from "react";
import { StackLayout, SplitLayout } from "@/components/layouts";
import { Block } from "@/components/templates";
import {
    EditableH2,
    EditableH3,
    EditableParagraph,
    InlineLinkedHighlight,
    VennDiagram,
    NumberLine,
} from "@/components/atoms";
import {
    getExampleVariableInfo,
    linkedHighlightPropsFromDefinition,
} from "../exampleVariables";
import { useVar, useSetVar } from "@/stores";

function ReactiveVennDiagram() {
    const leftOnly = useVar("vennLeftOnly", 54) as number;
    const overlap = useVar("vennOverlap", 46) as number;
    const rightOnly = useVar("vennRightOnly", 83) as number;
    const outside = useVar("vennNeither", 17) as number;

    return (
        <VennDiagram
            leftLabel="Car"
            rightLabel="Airplane"
            leftOnlyCount={leftOnly}
            overlapCount={overlap}
            rightOnlyCount={rightOnly}
            outsideCount={outside}
            height={300}
            highlightVarName="vennHighlight"
            showContainerBorder={false}
        />
    );
}

function ReactiveNumberLine() {
    const min = useVar("nlMin", -10) as number;
    const max = useVar("nlMax", 10) as number;
    const step = useVar("nlStep", 1) as number;
    const point = useVar("nlPoint", 2) as number;
    const setVar = useSetVar();

    return (
        <NumberLine
            min={min}
            max={max}
            step={step}
            value={point}
            onValueChange={(v) => setVar("nlPoint", v)}
            height={200}
            showContainerBorder={false}
        />
    );
}

export const vennAndNumberLineDemo: ReactElement[] = [
    <StackLayout key="layout-venn-numberline-title" maxWidth="xl">
        <Block id="block-venn-numberline-title" padding="md">
            <EditableH2 id="h2-venn-numberline-title" blockId="block-venn-numberline-title">
                Venn Diagram and Number Line Examples
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-venn-title" maxWidth="xl">
        <Block id="block-venn-title" padding="sm">
            <EditableH3 id="h3-venn-title" blockId="block-venn-title">
                1. Venn Diagram Example
            </EditableH3>
        </Block>
    </StackLayout>,

    <SplitLayout key="layout-venn-demo" ratio="1:1" gap="lg">
        <Block id="block-venn-text" padding="sm">
            <EditableParagraph id="para-venn-text" blockId="block-venn-text">
                A Venn diagram visualizes how two sets overlap. In this example, we survey people about their transport preferences: those who like cars, those who like airplanes, and those who like both. The{" "}
                <InlineLinkedHighlight
                    varName="vennHighlight"
                    highlightId="left"
                    {...linkedHighlightPropsFromDefinition(getExampleVariableInfo("vennHighlight"))}
                    color="#3B82F6"
                >
                    left circle
                </InlineLinkedHighlight>{" "}
                represents car enthusiasts, the{" "}
                <InlineLinkedHighlight
                    varName="vennHighlight"
                    highlightId="right"
                    {...linkedHighlightPropsFromDefinition(getExampleVariableInfo("vennHighlight"))}
                    color="#EC4899"
                >
                    right circle
                </InlineLinkedHighlight>{" "}
                represents airplane fans, and the{" "}
                <InlineLinkedHighlight
                    varName="vennHighlight"
                    highlightId="overlap"
                    {...linkedHighlightPropsFromDefinition(getExampleVariableInfo("vennHighlight"))}
                    color="#8B5CF6"
                >
                    overlapping region
                </InlineLinkedHighlight>{" "}
                shows people who enjoy both. Hover over each term to highlight the corresponding region.
            </EditableParagraph>
        </Block>
        <Block id="block-venn-viz" padding="sm" hasVisualization>
            <ReactiveVennDiagram />
        </Block>
    </SplitLayout>,

    <StackLayout key="layout-numberline-title" maxWidth="xl">
        <Block id="block-numberline-title" padding="sm">
            <EditableH3 id="h3-numberline-title" blockId="block-numberline-title">
                2. Number Line Example
            </EditableH3>
        </Block>
    </StackLayout>,

    <SplitLayout key="layout-numberline-demo" ratio="1:1" gap="lg">
        <Block id="block-numberline-text" padding="sm">
            <EditableParagraph id="para-numberline-text" blockId="block-numberline-text">
                A number line provides a visual representation of numbers arranged in order along a straight path. This interactive version lets you click anywhere on the line to place or move a point. The highlighted marker shows the currently selected value, making it easy to see where numbers fall relative to each other.
            </EditableParagraph>
        </Block>
        <Block id="block-numberline-viz" padding="sm" hasVisualization>
            <ReactiveNumberLine />
        </Block>
    </SplitLayout>,
];
