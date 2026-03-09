import { type ReactElement } from "react";
import { StackLayout, SplitLayout } from "@/components/layouts";
import { Block } from "@/components/templates";
import {
    EditableH2,
    EditableH3,
    EditableParagraph,
    InlineLinkedHighlight,
    GeometricDiagram,
    EditableH4,
} from "@/components/atoms";
import {
    getExampleVariableInfo,
    linkedHighlightPropsFromDefinition,
} from "../exampleVariables";
import { useVar } from "@/stores";

function ReactiveGeometricDiagram() {
    const radius = useVar("gdRadius", 110) as number;
    const angle = useVar("gdAngle", 55) as number;
    const sides = useVar("gdSides", 6) as number;
    const variant = useVar("gdVariant", "circle") as "circle" | "triangle" | "polygon";

    return (
        <GeometricDiagram
            variant={variant}
            radius={radius}
            angleDegrees={angle}
            sides={sides}
            height={400}
            highlightVarName="gdHighlight"
        />
    );
}

export const geometricDiagramDemo: ReactElement[] = [
    <StackLayout key="layout-geometric-diagram-title" maxWidth="xl">
        <Block id="geometric-diagram-title" padding="md">
            <EditableH3 id="h3-geometric-diagram-title" blockId="geometric-diagram-title">
                Geometric Diagram (SVG)
            </EditableH3>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-geometric-diagram-intro" maxWidth="xl">
        <Block id="geometric-diagram-intro" padding="sm">
            <EditableParagraph id="para-geometric-diagram-intro" blockId="geometric-diagram-intro">
                Geometric shapes become more intuitive when you can manipulate their properties directly.
                The diagrams below respond to your input in real time. Hover over highlighted terms to see
                how text and visuals connect.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-geometric-diagram-demo1-title" maxWidth="xl">
        <Block id="geometric-diagram-demo1-title" padding="sm">
            <EditableH4 id="h4-geometric-diagram-demo1-title" blockId="geometric-diagram-demo1-title">
                Reactive Shape Controls
            </EditableH4>
        </Block>
    </StackLayout>,

    <SplitLayout key="layout-geometric-diagram-demo1" ratio="1:1" gap="lg">
        <Block id="geometric-diagram-demo1-text" padding="sm">
            <EditableParagraph id="para-geometric-diagram-demo1-text" blockId="geometric-diagram-demo1-text">
                Every geometric shape can be described by a set of defining measurements. Circles are characterized by their radius, the distance from center to edge. Polygons add the number of sides, which determines their structure. An angle can highlight a wedge-shaped sector of any shape. Use the controls on the visualization to explore how changing these properties transforms the figure.
            </EditableParagraph>
        </Block>
        <Block id="geometric-diagram-demo1-viz" padding="sm" hasVisualization>
            <ReactiveGeometricDiagram />
        </Block>
    </SplitLayout>,

    <StackLayout key="layout-geometric-diagram-demo2-title" maxWidth="xl">
        <Block id="geometric-diagram-demo2-title" padding="sm">
            <EditableH4 id="h4-geometric-diagram-demo2-title" blockId="geometric-diagram-demo2-title">
                Linked-Highlight Geometry Vocabulary
            </EditableH4>
        </Block>
    </StackLayout>,

    <SplitLayout key="layout-geometric-diagram-demo2" ratio="1:1" gap="lg">
        <Block id="geometric-diagram-demo2-text" padding="sm">
            <EditableParagraph id="para-geometric-diagram-demo2-text" blockId="geometric-diagram-demo2-text">
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
        <Block id="geometric-diagram-demo2-viz" padding="sm" hasVisualization>
            <ReactiveGeometricDiagram />
        </Block>
    </SplitLayout>,
];
