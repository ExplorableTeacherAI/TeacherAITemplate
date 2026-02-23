import { type ReactElement } from "react";
import { StackLayout, SplitLayout } from "@/components/layouts";
import { Block } from "@/components/templates";
import {
    EditableH2,
    EditableH3,
    EditableParagraph,
    InlineScrubbleNumber,
    InlineToggle,
    InlineLinkedHighlight,
    GeometricDiagram,
} from "@/components/atoms";
import {
    getExampleVariableInfo,
    numberPropsFromDefinition,
    togglePropsFromDefinition,
    linkedHighlightPropsFromDefinition,
} from "../exampleVariables";
import { useVar } from "@/stores";

function ReactiveGeometricDiagram() {
    const radius = useVar("gdRadius", 90) as number;
    const angle = useVar("gdAngle", 55) as number;
    const sides = useVar("gdSides", 6) as number;
    const variant = useVar("gdVariant", "circle") as "circle" | "triangle" | "polygon";

    return (
        <GeometricDiagram
            variant={variant}
            radius={radius}
            angleDegrees={angle}
            sides={sides}
            height={340}
            highlightVarName="gdHighlight"
        />
    );
}

export const geometricDiagramDemo: ReactElement[] = [
    <StackLayout key="layout-gd-title" maxWidth="xl">
        <Block id="block-gd-title" padding="md">
            <EditableH2 id="h2-gd-title" blockId="block-gd-title">
                Geometric Diagram (SVG)
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-gd-intro" maxWidth="xl">
        <Block id="block-gd-intro" padding="sm">
            <EditableParagraph id="para-gd-intro" blockId="block-gd-intro">
                This component renders circle, triangle, and regular polygon diagrams with store-driven controls.
                Use inline controls to update geometry in real time, then hover highlights to connect explanation text
                with the diagram parts.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-gd-demo1-title" maxWidth="xl">
        <Block id="block-gd-demo1-title" padding="sm">
            <EditableH3 id="h3-gd-demo1-title" blockId="block-gd-demo1-title">
                1. Reactive Shape Controls
            </EditableH3>
        </Block>
    </StackLayout>,

    <SplitLayout key="layout-gd-demo1" ratio="1:1" gap="lg">
        <Block id="block-gd-demo1-text" padding="sm">
            <EditableParagraph id="para-gd-demo1-text" blockId="block-gd-demo1-text">
                Choose the diagram type as{" "}
                <InlineToggle
                    varName="gdVariant"
                    options={["circle", "triangle", "polygon"]}
                    {...togglePropsFromDefinition(getExampleVariableInfo("gdVariant"))}
                />
                {" "}and set the radius to{" "}
                <InlineScrubbleNumber
                    varName="gdRadius"
                    {...numberPropsFromDefinition(getExampleVariableInfo("gdRadius"))}
                />
                . Adjust the central angle to{" "}
                <InlineScrubbleNumber
                    varName="gdAngle"
                    {...numberPropsFromDefinition(getExampleVariableInfo("gdAngle"))}
                />
                ° and, for polygons, the number of sides to{" "}
                <InlineScrubbleNumber
                    varName="gdSides"
                    {...numberPropsFromDefinition(getExampleVariableInfo("gdSides"))}
                />
                .
            </EditableParagraph>
        </Block>
        <Block id="block-gd-demo1-viz" padding="sm">
            <ReactiveGeometricDiagram />
        </Block>
    </SplitLayout>,

    <StackLayout key="layout-gd-demo2-title" maxWidth="xl">
        <Block id="block-gd-demo2-title" padding="sm">
            <EditableH3 id="h3-gd-demo2-title" blockId="block-gd-demo2-title">
                2. Linked-Highlight Geometry Vocabulary
            </EditableH3>
        </Block>
    </StackLayout>,

    <SplitLayout key="layout-gd-demo2" ratio="1:1" gap="lg">
        <Block id="block-gd-demo2-text" padding="sm">
            <EditableParagraph id="para-gd-demo2-text" blockId="block-gd-demo2-text">
                Hover the{" "}
                <InlineLinkedHighlight
                    varName="gdHighlight"
                    highlightId="radius"
                    {...linkedHighlightPropsFromDefinition(getExampleVariableInfo("gdHighlight"))}
                    color="#EC4899"
                >
                    radius
                </InlineLinkedHighlight>
                {" "}term to emphasize the segment from center to boundary. Hover{" "}
                <InlineLinkedHighlight
                    varName="gdHighlight"
                    highlightId="angle"
                    {...linkedHighlightPropsFromDefinition(getExampleVariableInfo("gdHighlight"))}
                    color="#14B8A6"
                >
                    angle
                </InlineLinkedHighlight>
                {" "}to focus the central arc, and hover{" "}
                <InlineLinkedHighlight
                    varName="gdHighlight"
                    highlightId="boundary"
                    {...linkedHighlightPropsFromDefinition(getExampleVariableInfo("gdHighlight"))}
                    color="#F59E0B"
                >
                    boundary
                </InlineLinkedHighlight>
                {" "}to spotlight the outer shape.
            </EditableParagraph>
        </Block>
        <Block id="block-gd-demo2-viz" padding="sm">
            <ReactiveGeometricDiagram />
        </Block>
    </SplitLayout>,
];
