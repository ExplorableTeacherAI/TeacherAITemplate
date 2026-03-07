import { type ReactElement } from "react";
import { Block } from "@/components/templates";
import { StackLayout, SplitLayout } from "@/components/layouts";
import {
    EditableH2,
    EditableH3,
    EditableH4,
    EditableParagraph,
    InlineScrubbleNumber,
    InlineTooltip,
} from "@/components/atoms";
import { DesmosGraph } from "@/components/organisms";
import {
    getExampleVariableInfo,
    numberPropsFromDefinition,
} from "../exampleVariables";

export const desmosDemoBlocks: ReactElement[] = [
    // ── Title ────────────────────────────────────────────────────────────────
    <StackLayout key="layout-desmos-title" maxWidth="xl">
        <Block id="desmos-title" padding="md">
            <EditableH3 id="h3-desmos-title" blockId="desmos-title">
                Desmos Graphing Component
            </EditableH3>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-desmos-intro" maxWidth="xl">
        <Block id="desmos-intro" padding="sm">
            <EditableParagraph id="para-desmos-intro" blockId="desmos-intro">
                The{" "}
                <InlineTooltip
                    id="tooltip-desmos-comp"
                    tooltip="A wrapper for the Desmos API that uses variables from the global store."
                >
                    DesmosGraph
                </InlineTooltip>{" "}
                component uses the powerful calculation capabilities of Desmos.
                With our recent updates, it integrates seamlessly with the global variable
                store, allowing the graph's parameters to dynamically update directly
                from scrubble numbers elsewhere on the page.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // ── Reactive Desmos Example ───────────────────────────────────────────
    <StackLayout key="layout-desmos-reactive-h2" maxWidth="xl">
        <Block id="desmos-reactive-h2" padding="sm">
            <EditableH4 id="h4-desmos-reactive" blockId="desmos-reactive-h2">
                Realtime Reactive Graph
            </EditableH4>
        </Block>
    </StackLayout>,

    <SplitLayout key="layout-desmos-reactive" ratio="1:1" gap="lg">
        <div className="space-y-4">
            <Block id="desmos-reactive-text" padding="sm">
                <EditableParagraph id="para-desmos-reactive-text" blockId="desmos-reactive-text">
                    By specifying `varName="desmosEquation"`, the component reads its
                    primary expression directly from the global store. We can also link
                    parameters `a_1` and `a_2` directly to variable state variables.
                    Drag the{" "}
                    <InlineScrubbleNumber
                        id="scrubble-desmos-amp"
                        varName="desmosAmp"
                        {...numberPropsFromDefinition(getExampleVariableInfo("desmosAmp"))}
                    />{" "}
                    amplitude or the{" "}
                    <InlineScrubbleNumber
                        id="scrubble-desmos-freq"
                        varName="desmosFreq"
                        {...numberPropsFromDefinition(getExampleVariableInfo("desmosFreq"))}
                    />{" "}
                    frequency. The parameters are passed to Desmos magically without any
                    intermediary react components.
                </EditableParagraph>
            </Block>
        </div>
        <Block id="desmos-viz" padding="sm" hasVisualization>
            <DesmosGraph
                varName="desmosEquation"
                paramVars={["desmosAmp", "desmosFreq"]}
                options={{ keypad: false, settingsMenu: false }}
                height={400}
                className="rounded-xl overflow-hidden border border-border"
            />
        </Block>
    </SplitLayout>,
];
