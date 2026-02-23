import { type ReactElement } from "react";
import { StackLayout, SplitLayout } from "@/components/layouts";
import { Block } from "@/components/templates";
import {
    EditableH2,
    EditableH3,
    EditableParagraph,
    InlineScrubbleNumber,
    InlineLinkedHighlight,
    NodeLinkDiagram,
} from "@/components/atoms";
import {
    getExampleVariableInfo,
    numberPropsFromDefinition,
    linkedHighlightPropsFromDefinition,
} from "../exampleVariables";
import { useVar } from "@/stores";

// ── Demo 1: Simple Social Network ───────────────────────────────────────────

const socialNodes = [
    { id: "alice", label: "Alice", group: "a" },
    { id: "bob", label: "Bob", group: "a" },
    { id: "carol", label: "Carol", group: "b" },
    { id: "dave", label: "Dave", group: "b" },
    { id: "eve", label: "Eve", group: "c" },
    { id: "frank", label: "Frank", group: "c" },
];

const socialLinks = [
    { source: "alice", target: "bob", label: "friends" },
    { source: "alice", target: "carol", label: "colleagues" },
    { source: "bob", target: "dave" },
    { source: "carol", target: "dave", label: "siblings" },
    { source: "carol", target: "eve" },
    { source: "dave", target: "frank" },
    { source: "eve", target: "frank", label: "neighbours" },
    { source: "alice", target: "eve" },
];

// ── Demo 2: Directed Dependency Graph ────────────────────────────────────────

const depNodes = [
    { id: "app", label: "App", group: "a" },
    { id: "router", label: "Router", group: "b" },
    { id: "store", label: "Store", group: "b" },
    { id: "api", label: "API", group: "c" },
    { id: "auth", label: "Auth", group: "c" },
    { id: "ui", label: "UI Kit", group: "d" },
    { id: "utils", label: "Utils", group: "d" },
];

const depLinks = [
    { source: "app", target: "router", directed: true },
    { source: "app", target: "store", directed: true },
    { source: "app", target: "ui", directed: true },
    { source: "router", target: "auth", directed: true },
    { source: "store", target: "api", directed: true },
    { source: "store", target: "utils", directed: true },
    { source: "api", target: "auth", directed: true },
    { source: "ui", target: "utils", directed: true },
];

// ── Demo 3: Reactive — charge strength controlled by scrubble ────────────────

function ReactiveNodeLink() {
    const charge = useVar("nlCharge", -300) as number;
    const dist = useVar("nlDistance", 100) as number;

    return (
        <NodeLinkDiagram
            nodes={socialNodes}
            links={socialLinks}
            height={380}
            chargeStrength={charge}
            linkDistance={dist}
            showLinkLabels
            showContainerBorder={false}
        />
    );
}

// ── Demo 4: Linked-highlight integration ─────────────────────────────────────

const highlightNodes = [
    { id: "input", label: "Input", group: "a", highlightId: "nlInput" },
    { id: "hidden1", label: "Hidden 1", group: "b", highlightId: "nlHidden" },
    { id: "hidden2", label: "Hidden 2", group: "b", highlightId: "nlHidden" },
    { id: "output", label: "Output", group: "c", highlightId: "nlOutput" },
];

const highlightLinks = [
    { source: "input", target: "hidden1", directed: true, highlightId: "nlInput" },
    { source: "input", target: "hidden2", directed: true, highlightId: "nlInput" },
    { source: "hidden1", target: "output", directed: true, highlightId: "nlOutput" },
    { source: "hidden2", target: "output", directed: true, highlightId: "nlOutput" },
];

// ── Blocks ───────────────────────────────────────────────────────────────────

export const nodeLinkDemo: ReactElement[] = [
    // Title
    <StackLayout key="layout-nl-title" maxWidth="xl">
        <Block id="block-nl-title" padding="md">
            <EditableH2 id="h2-nl-title" blockId="block-nl-title">
                Node-Link Diagram (Force-Directed Graph)
            </EditableH2>
        </Block>
    </StackLayout>,

    // ── Demo 1: Simple social network ─────────────────────────────────────

    <StackLayout key="layout-nl-social-title" maxWidth="xl">
        <Block id="block-nl-social-title" padding="sm">
            <EditableH3 id="h3-nl-social-title" blockId="block-nl-social-title">
                1. Social Network
            </EditableH3>
        </Block>
    </StackLayout>,

    <SplitLayout key="layout-nl-social" ratio="1:1" gap="lg">
        <Block id="block-nl-social-desc" padding="sm">
            <EditableParagraph id="para-nl-social-desc" blockId="block-nl-social-desc">
                An undirected force-directed graph showing social connections.
                Hover over a node to highlight its immediate neighbours and dim
                the rest of the network. Drag nodes to rearrange the layout.
            </EditableParagraph>
        </Block>
        <Block id="block-nl-social-viz" padding="sm">
            <NodeLinkDiagram
                nodes={socialNodes}
                links={socialLinks}
                height={380}
                showLinkLabels
                showContainerBorder={false}
            />
        </Block>
    </SplitLayout>,

    // ── Demo 2: Directed dependency graph ─────────────────────────────────

    <StackLayout key="layout-nl-dep-title" maxWidth="xl">
        <Block id="block-nl-dep-title" padding="sm">
            <EditableH3 id="h3-nl-dep-title" blockId="block-nl-dep-title">
                2. Directed Dependency Graph
            </EditableH3>
        </Block>
    </StackLayout>,

    <SplitLayout key="layout-nl-dep" ratio="1:1" gap="lg">
        <Block id="block-nl-dep-desc" padding="sm">
            <EditableParagraph id="para-nl-dep-desc" blockId="block-nl-dep-desc">
                Arrows show the direction of dependencies. The force simulation
                naturally clusters related modules together.
            </EditableParagraph>
        </Block>
        <Block id="block-nl-dep-viz" padding="sm">
            <NodeLinkDiagram
                nodes={depNodes}
                links={depLinks}
                height={380}
                chargeStrength={-400}
                linkDistance={120}
                showContainerBorder={false}
            />
        </Block>
    </SplitLayout>,

    // ── Demo 3: Reactive parameters ───────────────────────────────────────

    <StackLayout key="layout-nl-reactive-title" maxWidth="xl">
        <Block id="block-nl-reactive-title" padding="sm">
            <EditableH3 id="h3-nl-reactive-title" blockId="block-nl-reactive-title">
                3. Reactive Force Parameters
            </EditableH3>
        </Block>
    </StackLayout>,

    <SplitLayout key="layout-nl-reactive" ratio="1:1" gap="lg">
        <div className="space-y-4">
            <Block id="block-nl-reactive-text" padding="sm">
                <EditableParagraph id="para-nl-reactive" blockId="block-nl-reactive-text">
                    Adjust the charge strength to{" "}
                    <InlineScrubbleNumber
                        varName="nlCharge"
                        {...numberPropsFromDefinition(getExampleVariableInfo("nlCharge"))}
                    />{" "}
                    — more negative values push nodes further apart. Set the
                    preferred link distance to{" "}
                    <InlineScrubbleNumber
                        varName="nlDistance"
                        {...numberPropsFromDefinition(getExampleVariableInfo("nlDistance"))}
                    />{" "}
                    to control how long edges want to be.
                </EditableParagraph>
            </Block>
        </div>
        <Block id="block-nl-reactive-viz" padding="sm">
            <ReactiveNodeLink />
        </Block>
    </SplitLayout>,

    // ── Demo 4: Linked-highlight integration ──────────────────────────────

    <StackLayout key="layout-nl-highlight-title" maxWidth="xl">
        <Block id="block-nl-highlight-title" padding="sm">
            <EditableH3 id="h3-nl-highlight-title" blockId="block-nl-highlight-title">
                4. Linked-Highlight Integration
            </EditableH3>
        </Block>
    </StackLayout>,

    <SplitLayout key="layout-nl-highlight" ratio="1:1" gap="lg">
        <div className="space-y-4">
            <Block id="block-nl-highlight-text" padding="sm">
                <EditableParagraph id="para-nl-highlight" blockId="block-nl-highlight-text">
                    This diagram uses{" "}
                    <InlineLinkedHighlight
                        varName="nlHighlight"
                        highlightId="nlInput"
                        {...linkedHighlightPropsFromDefinition(
                            getExampleVariableInfo("nlHighlight")
                        )}
                        color="#6366F1"
                    >
                        input layer
                    </InlineLinkedHighlight>{" "}
                    →{" "}
                    <InlineLinkedHighlight
                        varName="nlHighlight"
                        highlightId="nlHidden"
                        {...linkedHighlightPropsFromDefinition(
                            getExampleVariableInfo("nlHighlight")
                        )}
                        color="#EC4899"
                    >
                        hidden layers
                    </InlineLinkedHighlight>{" "}
                    →{" "}
                    <InlineLinkedHighlight
                        varName="nlHighlight"
                        highlightId="nlOutput"
                        {...linkedHighlightPropsFromDefinition(
                            getExampleVariableInfo("nlHighlight")
                        )}
                        color="#14B8A6"
                    >
                        output layer
                    </InlineLinkedHighlight>{" "}
                    highlighting. Hover the text or the nodes to see them
                    highlight bidirectionally.
                </EditableParagraph>
            </Block>
        </div>
        <Block id="block-nl-highlight-viz" padding="sm">
            <NodeLinkDiagram
                nodes={highlightNodes}
                links={highlightLinks}
                height={320}
                highlightVarName="nlHighlight"
                chargeStrength={-250}
                linkDistance={90}
                showContainerBorder={false}
            />
        </Block>
    </SplitLayout>,
];
