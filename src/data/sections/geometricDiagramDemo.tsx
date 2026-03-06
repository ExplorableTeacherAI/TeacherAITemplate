import { type ReactElement } from "react";
import { StackLayout, SplitLayout } from "@/components/layouts";
import { Block } from "@/components/templates";
import {
    EditableH2,
    EditableH3,
    EditableParagraph,
    InlineLinkedHighlight,
    GeometricDiagram,
} from "@/components/atoms";
import {
    getExampleVariableInfo,
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
                Geometric shapes become more intuitive when you can manipulate their properties directly.
                The diagrams below respond to your input in real time. Hover over highlighted terms to see
                how text and visuals connect.
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
                Every geometric shape can be described by a set of defining measurements. Circles are characterized by their radius, the distance from center to edge. Polygons add the number of sides, which determines their structure. An angle can highlight a wedge-shaped sector of any shape. Use the controls on the visualization to explore how changing these properties transforms the figure.
            </EditableParagraph>
        </Block>
        <Block id="block-gd-demo1-viz" padding="sm" hasVisualization>
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
                Understanding geometric vocabulary is easier when you can see each term in action. The{" "}
                <InlineLinkedHighlight
                    varName="gdHighlight"
                    highlightId="radius"
                    {...linkedHighlightPropsFromDefinition(getExampleVariableInfo("gdHighlight"))}
                    color="#EC4899"
                >
                    radius
                </InlineLinkedHighlight>
                {" "}connects the center to any point on the boundary. The{" "}
                <InlineLinkedHighlight
                    varName="gdHighlight"
                    highlightId="angle"
                    {...linkedHighlightPropsFromDefinition(getExampleVariableInfo("gdHighlight"))}
                    color="#14B8A6"
                >
                    central angle
                </InlineLinkedHighlight>
                {" "}measures the opening of a sector at the center. The{" "}
                <InlineLinkedHighlight
                    varName="gdHighlight"
                    highlightId="boundary"
                    {...linkedHighlightPropsFromDefinition(getExampleVariableInfo("gdHighlight"))}
                    color="#F59E0B"
                >
                    boundary
                </InlineLinkedHighlight>
                {" "}forms the outer edge of the shape.
            </EditableParagraph>
        </Block>
        <Block id="block-gd-demo2-viz" padding="sm" hasVisualization>
            <ReactiveGeometricDiagram />
        </Block>
    </SplitLayout>,
];
