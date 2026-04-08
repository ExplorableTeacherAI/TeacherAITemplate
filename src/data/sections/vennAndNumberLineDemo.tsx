import { type ReactElement } from "react";
import { StackLayout, SplitLayout } from "@/components/layouts";
import { Block } from "@/components/templates";
import {
    EditableH3,
    EditableParagraph,
    InlineLinkedHighlight,
    InlineScrubbleNumber,
    InlineSpotColor,
    InlineTrigger,
    InteractionHintSequence,
    VennDiagram,
    NumberLine,
    EditableH4,
} from "@/components/atoms";
import {
    getExampleVariableInfo,
    linkedHighlightPropsFromDefinition,
    numberPropsFromDefinition,
} from "../exampleVariables";
import { useVar, useSetVar } from "@/stores";

function ReactiveVennDiagram() {
    const leftOnly = useVar("vennLeftOnly", 54) as number;
    const overlap = useVar("vennOverlap", 46) as number;
    const rightOnly = useVar("vennRightOnly", 83) as number;
    const outside = useVar("vennNeither", 17) as number;

    return (
        <div className="relative">
            <VennDiagram
                leftLabel="Car"
                rightLabel="Airplane"
                leftOnlyCount={leftOnly}
                overlapCount={overlap}
                rightOnlyCount={rightOnly}
                outsideCount={outside}
                height={380}
                highlightVarName="vennHighlight"
                showContainerBorder={false}
            />
            <InteractionHintSequence
                hintKey="venn-diagram-explore"
                steps={[{
                    gesture: "click",
                    label: "Hover the labels in the text to highlight each region — then try changing the counts with the scrubble numbers",
                    position: { x: "50%", y: "50%" },
                }]}
            />
        </div>
    );
}

/** Reactive wrapper: shows total surveyed */
function VennTotalDisplay() {
    const leftOnly = useVar("vennLeftOnly", 54) as number;
    const overlap = useVar("vennOverlap", 46) as number;
    const rightOnly = useVar("vennRightOnly", 83) as number;
    const outside = useVar("vennNeither", 17) as number;

    const total = leftOnly + overlap + rightOnly + outside;
    const totalCar = leftOnly + overlap;
    const totalAirplane = rightOnly + overlap;

    return (
        <div className="text-center font-mono text-sm py-2 px-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <span>
                Total surveyed: <strong>{total}</strong>
                {" | "}
                <span style={{ color: "#3B82F6" }}>Car lovers: {totalCar}</span>
                {" | "}
                <span style={{ color: "#EC4899" }}>Airplane fans: {totalAirplane}</span>
            </span>
        </div>
    );
}

function ReactiveNumberLine() {
    const min = useVar("nlMin", -10) as number;
    const max = useVar("nlMax", 10) as number;
    const step = useVar("nlStep", 1) as number;
    const point = useVar("nlPoint", 2) as number;
    const setVar = useSetVar();

    return (
        <div className="relative">
            <NumberLine
                min={min}
                max={max}
                step={step}
                value={point}
                onValueChange={(v) => setVar("nlPoint", v)}
                height={200}
                showContainerBorder={false}
            />
            <InteractionHintSequence
                hintKey="number-line-explore"
                steps={[{
                    gesture: "click",
                    label: "Click anywhere on the number line to place the marker — then adjust the range and step with the controls",
                    position: { x: "50%", y: "40%" },
                }]}
            />
        </div>
    );
}

export const vennAndNumberLineDemo: ReactElement[] = [
    <StackLayout key="layout-venn-numberline-title" maxWidth="xl">
        <Block id="venn-numberline-title" padding="md">
            <EditableH3 id="h3-venn-numberline-title" blockId="venn-numberline-title">
                Venn Diagram and Number Line
            </EditableH3>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-venn-numberline-intro" maxWidth="xl">
        <Block id="venn-numberline-intro" padding="sm">
            <EditableParagraph id="para-venn-numberline-intro" blockId="venn-numberline-intro">
                These two fundamental visualization types let you explore set relationships
                and number placement interactively. Change the counts, adjust the range,
                and watch the visualizations update in real time.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-venn-title" maxWidth="xl">
        <Block id="venn-title" padding="sm">
            <EditableH4 id="h4-venn-title" blockId="venn-title">
                Venn Diagram Example
            </EditableH4>
        </Block>
    </StackLayout>,

    <SplitLayout key="layout-venn-demo" ratio="1:1" gap="lg">
        <div className="space-y-4">
            <Block id="venn-text" padding="sm">
                <EditableParagraph id="para-venn-text" blockId="venn-text">
                    A Venn diagram visualizes how two sets overlap. In this survey about
                    transport preferences, the{" "}
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
                    shows people who enjoy both. Hover over each term to highlight the
                    corresponding region.
                </EditableParagraph>
            </Block>
            <Block id="venn-controls" padding="sm">
                <EditableParagraph id="para-venn-controls" blockId="venn-controls">
                    Adjust the survey results:{" "}
                    <InlineSpotColor
                        varName="vennLeftSpot"
                        color="#3B82F6"
                    >
                        Car only
                    </InlineSpotColor>{" "}
                    ={" "}
                    <InlineScrubbleNumber
                        varName="vennLeftOnly"
                        {...numberPropsFromDefinition(getExampleVariableInfo("vennLeftOnly"))}
                        formatValue={(v) => `${v}`}
                    />,{" "}
                    <InlineSpotColor
                        varName="vennOverlapSpot"
                        color="#8B5CF6"
                    >
                        Both
                    </InlineSpotColor>{" "}
                    ={" "}
                    <InlineScrubbleNumber
                        varName="vennOverlap"
                        {...numberPropsFromDefinition(getExampleVariableInfo("vennOverlap"))}
                        formatValue={(v) => `${v}`}
                    />,{" "}
                    <InlineSpotColor
                        varName="vennRightSpot"
                        color="#EC4899"
                    >
                        Airplane only
                    </InlineSpotColor>{" "}
                    ={" "}
                    <InlineScrubbleNumber
                        varName="vennRightOnly"
                        {...numberPropsFromDefinition(getExampleVariableInfo("vennRightOnly"))}
                        formatValue={(v) => `${v}`}
                    />,{" "}
                    Neither ={" "}
                    <InlineScrubbleNumber
                        varName="vennNeither"
                        {...numberPropsFromDefinition(getExampleVariableInfo("vennNeither"))}
                        formatValue={(v) => `${v}`}
                    />.
                </EditableParagraph>
            </Block>
            <Block id="venn-presets" padding="sm">
                <EditableParagraph id="para-venn-presets" blockId="venn-presets">
                    Try some presets:{" "}
                    <InlineTrigger varName="vennOverlap" value={0}>
                        Disjoint sets (no overlap)
                    </InlineTrigger>{" "}
                    or{" "}
                    <InlineTrigger varName="vennOverlap" value={100} icon="zap">
                        Massive overlap
                    </InlineTrigger>.
                </EditableParagraph>
            </Block>
            <Block id="venn-totals" padding="sm">
                <VennTotalDisplay />
            </Block>
        </div>
        <Block id="venn-viz" padding="sm" hasVisualization>
            <ReactiveVennDiagram />
        </Block>
    </SplitLayout>,

    <StackLayout key="layout-numberline-title" maxWidth="xl">
        <Block id="numberline-title" padding="sm">
            <EditableH4 id="h4-numberline-title" blockId="numberline-title">
                Number Line Example
            </EditableH4>
        </Block>
    </StackLayout>,

    <SplitLayout key="layout-numberline-demo" ratio="1:1" gap="lg">
        <div className="space-y-4">
            <Block id="numberline-text" padding="sm">
                <EditableParagraph id="para-numberline-text" blockId="numberline-text">
                    A number line provides a visual representation of numbers arranged
                    in order along a straight path. Click anywhere on the line to place
                    or move the marker. Use the controls below to adjust the range and
                    see how the same number line can represent different scales.
                </EditableParagraph>
            </Block>
            <Block id="numberline-controls" padding="sm">
                <EditableParagraph id="para-numberline-controls" blockId="numberline-controls">
                    Range: from{" "}
                    <InlineScrubbleNumber
                        varName="nlMin"
                        {...numberPropsFromDefinition(getExampleVariableInfo("nlMin"))}
                        formatValue={(v) => `${v}`}
                    />{" "}
                    to{" "}
                    <InlineScrubbleNumber
                        varName="nlMax"
                        {...numberPropsFromDefinition(getExampleVariableInfo("nlMax"))}
                        formatValue={(v) => `${v}`}
                    />{" "}
                    with step size{" "}
                    <InlineScrubbleNumber
                        varName="nlStep"
                        {...numberPropsFromDefinition(getExampleVariableInfo("nlStep"))}
                        formatValue={(v) => `${v}`}
                    />.
                    Current value:{" "}
                    <InlineScrubbleNumber
                        varName="nlPoint"
                        {...numberPropsFromDefinition(getExampleVariableInfo("nlPoint"))}
                        color="#EC4899"
                        formatValue={(v) => `${v}`}
                    />.
                </EditableParagraph>
            </Block>
            <Block id="numberline-presets" padding="sm">
                <EditableParagraph id="para-numberline-presets" blockId="numberline-presets">
                    Quick presets:{" "}
                    <InlineTrigger varName="nlMin" value={0}>
                        Start from 0
                    </InlineTrigger>,{" "}
                    <InlineTrigger varName="nlMax" value={20} icon="zap">
                        Extend to 20
                    </InlineTrigger>,{" "}
                    or{" "}
                    <InlineTrigger varName="nlStep" value={5}>
                        Count by fives
                    </InlineTrigger>.
                </EditableParagraph>
            </Block>
        </div>
        <Block id="numberline-viz" padding="sm" hasVisualization>
            <ReactiveNumberLine />
        </Block>
    </SplitLayout>,
];
