import { type ReactElement } from "react";
import { StackLayout } from "@/components/layouts";
import { Block } from "@/components/templates";
import {
    EditableH2,
    EditableH3,
    EditableParagraph,
    InlineScrubbleNumber,
    InlineToggle,
    InlineTrigger,
    MathTreeVisualization,
    type MathTreeNode,
    type MathTreeScaffoldStep,
} from "@/components/atoms";
import {
    getExampleVariableInfo,
    numberPropsFromDefinition,
    togglePropsFromDefinition,
} from "../exampleVariables";
import { useVar, useSetVar } from "@/stores";

const factorTree84: MathTreeNode = {
    id: "f-root",
    label: "84",
    value: "composite",
    children: [
        {
            id: "f-12",
            label: "12",
            value: "12 × 7",
            children: [
                { id: "f-3", label: "3", value: "prime" },
                {
                    id: "f-4",
                    label: "4",
                    value: "2 × 2",
                    children: [
                        { id: "f-2a", label: "2", value: "prime" },
                        { id: "f-2b", label: "2", value: "prime" },
                    ],
                },
            ],
        },
        { id: "f-7", label: "7", value: "prime" },
    ],
};

const factorTree60: MathTreeNode = {
    id: "f-root",
    label: "60",
    value: "composite",
    children: [
        {
            id: "f-12",
            label: "12",
            value: "12 × 5",
            children: [
                { id: "f-3", label: "3", value: "prime" },
                {
                    id: "f-4",
                    label: "4",
                    value: "2 × 2",
                    children: [
                        { id: "f-2a", label: "2", value: "prime" },
                        { id: "f-2b", label: "2", value: "prime" },
                    ],
                },
            ],
        },
        { id: "f-7", label: "5", value: "prime" },
    ],
};

const factorSteps: MathTreeScaffoldStep[] = [
    {
        id: "fs-1",
        title: "Step 1 — Start with the whole number",
        description: "Identify a composite number to break down.",
        revealDepth: 0,
        focusNodeId: "f-root",
    },
    {
        id: "fs-2",
        title: "Step 2 — First factor split",
        description: "Split into two factors whose product gives the root.",
        revealDepth: 1,
        focusNodeId: "f-12",
    },
    {
        id: "fs-3",
        title: "Step 3 — Keep factoring composites",
        description: "Continue only on branches that are not prime yet.",
        revealDepth: 2,
        focusNodeId: "f-4",
    },
    {
        id: "fs-4",
        title: "Step 4 — Stop at prime leaves",
        description: "All leaves are prime, so prime factorization is complete.",
        revealDepth: 3,
        focusNodeId: "f-2a",
    },
];

const probabilityTree: MathTreeNode = {
    id: "p-root",
    label: "Start",
    value: "Weather",
    children: [
        {
            id: "p-rain",
            label: "Rain",
            value: "P=0.3",
            children: [
                { id: "p-rain-umbrella", label: "Umbrella", value: "P=0.9" },
                { id: "p-rain-no", label: "No Umbrella", value: "P=0.1" },
            ],
        },
        {
            id: "p-dry",
            label: "No Rain",
            value: "P=0.7",
            children: [
                { id: "p-dry-umbrella", label: "Umbrella", value: "P=0.2" },
                { id: "p-dry-no", label: "No Umbrella", value: "P=0.8" },
            ],
        },
    ],
};

const probabilitySteps: MathTreeScaffoldStep[] = [
    {
        id: "ps-1",
        title: "Step 1 — Define the first branch",
        description: "Split by the first event with probabilities summing to 1.",
        revealDepth: 1,
        focusNodeId: "p-root",
    },
    {
        id: "ps-2",
        title: "Step 2 — Add conditional branches",
        description: "Expand each branch with conditional outcomes.",
        revealDepth: 2,
        focusNodeId: "p-rain",
    },
    {
        id: "ps-3",
        title: "Step 3 — Read full paths",
        description: "Use path multiplication for joint probabilities.",
        revealDepth: 2,
        focusNodeId: "p-rain-umbrella",
    },
];

function ReactiveFactorTree() {
    const step = useVar("mtFactorStep", 1) as number;
    const gap = useVar("mtTreeGap", 64) as number;
    const scaffoldPanel = useVar("mtScaffoldPanel", "show") as string;
    const target = useVar("mtFactorTarget", "84") as string;
    const setVar = useSetVar();
    const tree = target === "60" ? factorTree60 : factorTree84;

    return (
        <MathTreeVisualization
            rootNode={tree}
            scaffoldSteps={factorSteps}
            currentStep={step}
            horizontalGap={gap}
            showScaffoldPanel={scaffoldPanel === "show"}
            showContainerBorder={false}
            height={600}
            onStepChange={(s) => setVar("mtFactorStep", s)}
        />
    );
}

function ReactiveProbabilityTree() {
    const step = useVar("mtProbStep", 1) as number;
    const panel = useVar("mtScaffoldPanel", "show") as string;
    const setVar = useSetVar();
    return (
        <MathTreeVisualization
            rootNode={probabilityTree}
            scaffoldSteps={probabilitySteps}
            currentStep={step}
            showScaffoldPanel={panel === "show"}
            showContainerBorder={false}
            height={560}
            onStepChange={(s) => setVar("mtProbStep", s)}
        />
    );
}

export const mathTreeDemo: ReactElement[] = [
    <StackLayout key="layout-mt-title" maxWidth="xl">
        <Block id="block-mt-title" padding="md">
            <EditableH2 id="h2-mt-title" blockId="block-mt-title">
                Math Tree Visualization with Step-by-Step Scaffolding
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-mt-factor-title" maxWidth="xl">
        <Block id="block-mt-factor-title" padding="sm">
            <EditableH3 id="h3-mt-factor-title" blockId="block-mt-factor-title">
                1. Prime Factorization Tree
            </EditableH3>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-mt-factor-desc" maxWidth="xl">
        <Block id="block-mt-factor-desc" padding="sm">
            <EditableParagraph id="para-mt-factor-desc" blockId="block-mt-factor-desc">
                Reveal the factorization progressively using step{" "}
                <InlineScrubbleNumber
                    varName="mtFactorStep"
                    {...numberPropsFromDefinition(getExampleVariableInfo("mtFactorStep"))}
                />
                . Horizontal spacing is{" "}
                <InlineScrubbleNumber
                    varName="mtTreeGap"
                    {...numberPropsFromDefinition(getExampleVariableInfo("mtTreeGap"))}
                />
                . Current target number is{" "}
                <InlineToggle
                    varName="mtFactorTarget"
                    options={["84", "60"]}
                    {...togglePropsFromDefinition(getExampleVariableInfo("mtFactorTarget"))}
                />
                .
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-mt-factor-controls" maxWidth="xl">
        <Block id="block-mt-factor-controls" padding="sm">
            <EditableParagraph id="para-mt-factor-controls" blockId="block-mt-factor-controls">
                Switch scaffold panel with{" "}
                <InlineToggle
                    varName="mtScaffoldPanel"
                    options={["show", "hide"]}
                    {...togglePropsFromDefinition(getExampleVariableInfo("mtScaffoldPanel"))}
                />
                . Jump directly using{" "}
                <InlineTrigger varName="mtFactorStep" value={1} icon="refresh">step 1</InlineTrigger>
                ,{" "}
                <InlineTrigger varName="mtFactorStep" value={2}>step 2</InlineTrigger>
                ,{" "}
                <InlineTrigger varName="mtFactorStep" value={3}>step 3</InlineTrigger>
                , and{" "}
                <InlineTrigger varName="mtFactorStep" value={4} icon="zap">step 4</InlineTrigger>
                .
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-mt-factor-viz" maxWidth="2xl">
        <Block id="block-mt-factor-viz" padding="sm">
            <ReactiveFactorTree />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-mt-prob-title" maxWidth="xl">
        <Block id="block-mt-prob-title" padding="sm">
            <EditableH3 id="h3-mt-prob-title" blockId="block-mt-prob-title">
                2. Probability Tree (Scaffolded)
            </EditableH3>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-mt-prob-text" maxWidth="xl">
        <Block id="block-mt-prob-text" padding="sm">
            <EditableParagraph id="para-mt-prob-text" blockId="block-mt-prob-text">
                Move through probability scaffolding using step{" "}
                <InlineScrubbleNumber
                    varName="mtProbStep"
                    {...numberPropsFromDefinition(getExampleVariableInfo("mtProbStep"))}
                />
                . Use{" "}
                <InlineTrigger varName="mtProbStep" value={1} icon="refresh">reset</InlineTrigger>
                ,{" "}
                <InlineTrigger varName="mtProbStep" value={2}>expand</InlineTrigger>
                , and{" "}
                <InlineTrigger varName="mtProbStep" value={3} icon="zap">path focus</InlineTrigger>
                .
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-mt-prob-viz" maxWidth="2xl">
        <Block id="block-mt-prob-viz" padding="sm">
            <ReactiveProbabilityTree />
        </Block>
    </StackLayout>,
];