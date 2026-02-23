import { type ReactElement } from "react";
import { Block } from "@/components/templates";
import { StackLayout, SplitLayout } from "@/components/layouts";
import {
    EditableH1,
    EditableH2,
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
        <Block id="block-desmos-title" padding="md">
            <EditableH1 id="h1-desmos-title" blockId="block-desmos-title">
                Desmos Graphing Component
            </EditableH1>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-desmos-intro" maxWidth="xl">
        <Block id="block-desmos-intro" padding="sm">
            <EditableParagraph id="para-desmos-intro" blockId="block-desmos-intro">
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
        <Block id="block-desmos-reactive-h2" padding="sm">
            <EditableH2 id="h2-desmos-reactive" blockId="block-desmos-reactive-h2">
                Realtime Reactive Graph
            </EditableH2>
        </Block>
    </StackLayout>,

    <SplitLayout key="layout-desmos-reactive" ratio="1:1" gap="lg">
        <div className="space-y-4">
            <Block id="block-desmos-reactive-text" padding="sm">
                <EditableParagraph id="para-desmos-reactive-text" blockId="block-desmos-reactive-text">
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
        <Block id="block-desmos-viz" padding="sm">
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
