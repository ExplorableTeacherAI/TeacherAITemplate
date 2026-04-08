import { type ReactElement } from "react";
import { StackLayout, SplitLayout } from "@/components/layouts";
import { Block } from "@/components/templates";
import {
    EditableH2,
    EditableH3,
    EditableH4,
    EditableParagraph,
    InlineLinkedHighlight,
    NodeLinkDiagram,
} from "@/components/atoms";
import {
    getExampleVariableInfo,
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
    <StackLayout key="layout-node-link-title" maxWidth="xl">
        <Block id="node-link-title" padding="md">
            <EditableH3 id="h3-node-link-title" blockId="node-link-title">
                Node-Link Diagram (Force-Directed Graph)
            </EditableH3>
        </Block>
    </StackLayout>,

    // ── Demo 1: Simple social network ─────────────────────────────────────

    <StackLayout key="layout-node-link-social-title" maxWidth="xl">
        <Block id="node-link-social-title" padding="sm">
            <EditableH4 id="h4-node-link-social-title" blockId="node-link-social-title">
                Social Network
            </EditableH4>
        </Block>
    </StackLayout>,

    <SplitLayout key="layout-node-link-social" ratio="1:1" gap="lg">
        <Block id="node-link-social-desc" padding="sm">
            <EditableParagraph id="para-node-link-social-desc" blockId="node-link-social-desc">
                An undirected force-directed graph showing social connections.
                Hover over a node to highlight its immediate neighbours and dim
                the rest of the network. Drag nodes to rearrange the layout.
            </EditableParagraph>
        </Block>
        <Block id="node-link-social-viz" padding="sm" hasVisualization>
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

    <StackLayout key="layout-node-link-dep-title" maxWidth="xl">
        <Block id="node-link-dep-title" padding="sm">
            <EditableH4 id="h4-node-link-dep-title" blockId="node-link-dep-title">
                Directed Dependency Graph
            </EditableH4>
        </Block>
    </StackLayout>,

    <SplitLayout key="layout-node-link-dep" ratio="1:1" gap="lg">
        <Block id="node-link-dep-desc" padding="sm">
            <EditableParagraph id="para-node-link-dep-desc" blockId="node-link-dep-desc">
                Arrows show the direction of dependencies. The force simulation
                naturally clusters related modules together.
            </EditableParagraph>
        </Block>
        <Block id="node-link-dep-viz" padding="sm" hasVisualization>
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

    <StackLayout key="layout-node-link-reactive-title" maxWidth="xl">
        <Block id="node-link-reactive-title" padding="sm">
            <EditableH4 id="h4-node-link-reactive-title" blockId="node-link-reactive-title">
                Reactive Force Parameters
            </EditableH4>
        </Block>
    </StackLayout>,

    <SplitLayout key="layout-node-link-reactive" ratio="1:1" gap="lg">
        <div className="space-y-4">
            <Block id="node-link-reactive-text" padding="sm">
                <EditableParagraph id="para-node-link-reactive" blockId="node-link-reactive-text">
                    Force-directed layouts use simulated physics to position nodes automatically. Two fundamental forces govern the layout: a repulsive charge between all nodes (like electrons pushing each other apart) and an attractive spring force along each link (pulling connected nodes together). The balance between these forces determines the final arrangement of the graph.
                </EditableParagraph>
            </Block>
        </div>
        <Block id="node-link-reactive-viz" padding="sm" hasVisualization>
            <ReactiveNodeLink />
        </Block>
    </SplitLayout>,

    // ── Demo 4: Linked-highlight integration ──────────────────────────────

    <StackLayout key="layout-node-link-highlight-title" maxWidth="xl">
        <Block id="node-link-highlight-title" padding="sm">
            <EditableH4 id="h4-node-link-highlight-title" blockId="node-link-highlight-title">
                Linked-Highlight Integration
            </EditableH4>
        </Block>
    </StackLayout>,

    <SplitLayout key="layout-node-link-highlight" ratio="1:1" gap="lg">
        <div className="space-y-4">
            <Block id="node-link-highlight-text" padding="sm">
                <EditableParagraph id="para-node-link-highlight" blockId="node-link-highlight-text">
                    Neural networks flow information through layers of nodes, starting from the{" "}
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
                    through one or more{" "}
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
                    to produce results at the{" "}
                    <InlineLinkedHighlight
                        varName="nlHighlight"
                        highlightId="nlOutput"
                        {...linkedHighlightPropsFromDefinition(
                            getExampleVariableInfo("nlHighlight")
                        )}
                        color="#14B8A6"
                    >
                        output layer
                    </InlineLinkedHighlight>
                    . Hover over any term to see the corresponding part of the network light up.
                </EditableParagraph>
            </Block>
        </div>
        <Block id="node-link-highlight-viz" padding="sm" hasVisualization>
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
