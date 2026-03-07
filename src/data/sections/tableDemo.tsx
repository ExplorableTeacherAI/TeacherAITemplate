/**
 * Table Component Demo
 * --------------------
 * Showcases the Table component with inline components in cells:
 *   - Static text / number cells
 *   - InlineScrubbleNumber for adjustable values
 *   - InlineFormula for math in cells
 *   - InlineClozeInput for fill-in-the-blank in cells
 *   - InlineToggle for cycling values in cells
 *   - InlineLinkedHighlight for hover-coordination in cells
 *   - InlineTooltip for definitions in cells
 *   - InlineTrigger for quick-set actions in cells
 */

import { type ReactElement } from "react";
import { Block } from "@/components/templates";
import { StackLayout, SplitLayout } from "@/components/layouts";
import {
    EditableH1,
    EditableH2,
    EditableParagraph,
    Table,
    InlineScrubbleNumber,
    InlineClozeInput,
    InlineToggle,
    InlineTooltip,
    InlineTrigger,
    InlineFormula,
    InlineLinkedHighlight,
    InlineSpotColor,
    EditableH3,
    EditableH4,
} from "@/components/atoms";
import {
    getExampleVariableInfo as getVariableInfo,
    numberPropsFromDefinition,
    clozePropsFromDefinition,
    togglePropsFromDefinition,
    spotColorPropsFromDefinition,
} from "../exampleVariables";
import { useVar } from "@/stores";

// ─────────────────────────────────────────────────────
// Reactive wrapper: a computed-area row that reads
// tableRadius from the store and shows π r²
// ─────────────────────────────────────────────────────

function ComputedAreaCell() {
    const r = useVar("tableRadius", 5) as number;
    const area = Math.PI * r * r;
    return <span className="font-mono tabular-nums">{area.toFixed(2)}</span>;
}

function ComputedVolumeCell() {
    const r = useVar("tableRadius", 5) as number;
    const h = useVar("tableHeight", 10) as number;
    const volume = Math.PI * r * r * h;
    return <span className="font-mono tabular-nums">{volume.toFixed(2)}</span>;
}

// ─────────────────────────────────────────────────────
// Block array (flat, follows project conventions)
// ─────────────────────────────────────────────────────

export const tableDemoBlocks: ReactElement[] = [
    // ── Title ──────────────────────────────────────────
    <StackLayout key="layout-table-title" maxWidth="xl">
        <Block id="table-title" padding="md">
            <EditableH3 id="h3-table-title" blockId="table-title">
                Interactive Tables
            </EditableH3>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-table-intro" maxWidth="xl">
        <Block id="table-intro" padding="sm">
            <EditableParagraph id="para-table-intro" blockId="table-intro">
                Tables organize information into rows and columns, making it easy to compare values and spot patterns. Unlike static tables, interactive tables can contain adjustable values, formulas that update automatically, and highlighted elements that respond to your interactions.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // ══════════════════════════════════════════════════
    // Section 1: Basic Table with Text
    // ══════════════════════════════════════════════════
    <StackLayout key="layout-table-basic-heading" maxWidth="xl">
        <Block id="table-basic-heading" padding="sm">
            <EditableH4 id="h4-table-basic-heading" blockId="table-basic-heading">
                Basic Table
            </EditableH4>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-table-basic" maxWidth="xl">
        <Block id="table-basic" padding="sm">
            <Table
                id="table-basic-constants"
                columns={[
                    { header: "Constant", align: "left" },
                    { header: "Symbol", align: "center", width: 100 },
                    { header: "Value", align: "right", width: 140 },
                    { header: "Description" },
                ]}
                rows={[
                    {
                        cells: [
                            "Pi",
                            <InlineFormula latex="\pi" colorMap={{}} />,
                            "3.14159…",
                            "Ratio of circumference to diameter",
                        ],
                    },
                    {
                        cells: [
                            "Euler's number",
                            <InlineFormula latex="e" colorMap={{}} />,
                            "2.71828…",
                            "Base of natural logarithm",
                        ],
                    },
                    {
                        cells: [
                            "Golden ratio",
                            <InlineFormula latex="\varphi" colorMap={{}} />,
                            "1.61803…",
                            "Ratio found in nature and art",
                        ],
                    },
                    {
                        cells: [
                            "Square root of 2",
                            <InlineFormula latex="\sqrt{2}" colorMap={{}} />,
                            "1.41421…",
                            "Diagonal of a unit square",
                        ],
                        highlight: true,
                        highlightColor: "#22c55e",
                    },
                ]}
                color="#6366f1"
                caption="Table 1 — Important mathematical constants"
            />
        </Block>
    </StackLayout>,

    // ══════════════════════════════════════════════════
    // Section 2: Table with InlineScrubbleNumbers
    // ══════════════════════════════════════════════════
    <StackLayout key="layout-table-scrubble-heading" maxWidth="xl">
        <Block id="table-scrubble-heading" padding="sm">
            <EditableH4 id="h4-table-scrubble-heading" blockId="table-scrubble-heading">
                Scrubble Numbers in Tables
            </EditableH4>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-table-scrubble-intro" maxWidth="xl">
        <Block id="table-scrubble-intro" padding="sm">
            <EditableParagraph id="para-table-scrubble-intro" blockId="table-scrubble-intro">
                Tables become powerful learning tools when their values can be adjusted interactively. In this cylinder calculation example, changing the radius or height immediately recalculates the area and volume. This instant feedback helps build intuition for how these geometric formulas behave.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-table-scrubble" maxWidth="xl">
        <Block id="table-scrubble" padding="sm">
            <Table
                id="table-cylinder-params"
                columns={[
                    { header: "Parameter", align: "left" },
                    { header: "Value", align: "center", width: 160 },
                    { header: "Result", align: "right" },
                ]}
                rows={[
                    {
                        cells: [
                            "Radius (r)",
                            <InlineScrubbleNumber
                                id="scrubble-table-radius"
                                varName="tableRadius"
                                {...numberPropsFromDefinition(getVariableInfo("tableRadius"))}
                                formatValue={(v) => `${v} cm`}
                            />,
                            "—",
                        ],
                    },
                    {
                        cells: [
                            "Height (h)",
                            <InlineScrubbleNumber
                                id="scrubble-table-height"
                                varName="tableHeight"
                                {...numberPropsFromDefinition(getVariableInfo("tableHeight"))}
                                formatValue={(v) => `${v} cm`}
                            />,
                            "—",
                        ],
                    },
                    {
                        cells: [
                            <span>
                                Area{" "}
                                <InlineFormula
                                    latex="\clr{area}{\pi r^2}"
                                    colorMap={{ area: "#ef4444" }}
                                />
                            </span>,
                            "computed →",
                            <ComputedAreaCell />,
                        ],
                        highlight: true,
                        highlightColor: "#ef4444",
                    },
                    {
                        cells: [
                            <span>
                                Volume{" "}
                                <InlineFormula
                                    latex="\clr{vol}{\pi r^2 h}"
                                    colorMap={{ vol: "#3b82f6" }}
                                />
                            </span>,
                            "computed →",
                            <ComputedVolumeCell />,
                        ],
                        highlight: true,
                        highlightColor: "#3b82f6",
                    },
                ]}
                color="#6366f1"
                caption="Table 2 — Cylinder parameters with live computation"
            />
        </Block>
    </StackLayout>,

    // ══════════════════════════════════════════════════
    // Section 3: Mixed Inline Components in a Table
    // ══════════════════════════════════════════════════
    <StackLayout key="layout-table-mixed-heading" maxWidth="xl">
        <Block id="table-mixed-heading" padding="sm">
            <EditableH4 id="h4-table-mixed-heading" blockId="table-mixed-heading">
                Mixed Inline Components
            </EditableH4>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-table-mixed-intro" maxWidth="xl">
        <Block id="table-mixed-intro" padding="sm">
            <EditableParagraph id="para-table-mixed-intro" blockId="table-mixed-intro">
                Tables can include a variety of interactive elements within their cells. From adjustable numbers and mathematical formulas to fill-in-the-blank inputs and hover-activated highlights, each type of interaction serves a different educational purpose. The examples below showcase these possibilities.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-table-mixed" maxWidth="xl">
        <Block id="table-mixed" padding="sm">
            <Table
                id="table-mixed-inline"
                columns={[
                    { header: "Component", align: "left", width: 180 },
                    { header: "Example", align: "left" },
                    { header: "How It Works", align: "left" },
                ]}
                rows={[
                    {
                        cells: [
                            "Scrubble Number",
                            <InlineScrubbleNumber
                                id="scrubble-table-speed"
                                varName="tableSpeed"
                                {...numberPropsFromDefinition(getVariableInfo("tableSpeed"))}
                                formatValue={(v) => `${v} m/s`}
                            />,
                            "Drag left/right to change the value",
                        ],
                    },
                    {
                        cells: [
                            "Inline Formula",
                            <InlineFormula
                                latex="\clr{e}{E} = \clr{m}{m}\clr{c}{c}^2"
                                colorMap={{ e: "#f97316", m: "#a855f7", c: "#06b6d4" }}
                            />,
                            "Renders KaTeX math inline",
                        ],
                    },
                    {
                        cells: [
                            "Cloze Input",
                            <InlineClozeInput
                                id="cloze-table-unit"
                                varName="tableUnitAnswer"
                                correctAnswer="cm²"
                                {...clozePropsFromDefinition(getVariableInfo("tableUnitAnswer"))}
                            />,
                            "Type the unit for area (hint: cm²)",
                        ],
                    },
                    {
                        cells: [
                            "Toggle",
                            <InlineToggle
                                id="toggle-table-measurement"
                                varName="tableMeasurement"
                                options={["length", "area", "volume"]}
                                {...togglePropsFromDefinition(getVariableInfo("tableMeasurement"))}
                            />,
                            "Click to cycle between values",
                        ],
                    },
                    {
                        cells: [
                            "Tooltip",
                            <InlineTooltip
                                id="tooltip-table-demo"
                                tooltip="I'm a tooltip — I show extra info on hover!"
                                color="#ec4899"
                            >
                                Hover me
                            </InlineTooltip>,
                            "Hover to reveal information",
                        ],
                    },
                    {
                        cells: [
                            "Trigger",
                            <span>
                                <InlineTrigger id="trigger-table-reset" varName="tableSpeed" value={0}>
                                    Stop
                                </InlineTrigger>{" "}
                                /{" "}
                                <InlineTrigger id="trigger-table-max" varName="tableSpeed" value={10}>
                                    Max speed
                                </InlineTrigger>
                            </span>,
                            "Click to set a variable instantly",
                        ],
                    },
                    {
                        cells: [
                            "Linked Highlight",
                            <span>
                                <InlineLinkedHighlight
                                    id="linked-highlight-table-radius"
                                    varName="tableHighlight"
                                    highlightId="radius"
                                    color="#ef4444"
                                >
                                    radius
                                </InlineLinkedHighlight>{" "}
                                &{" "}
                                <InlineLinkedHighlight
                                    id="linked-highlight-table-height"
                                    varName="tableHighlight"
                                    highlightId="height"
                                    color="#3b82f6"
                                >
                                    height
                                </InlineLinkedHighlight>
                            </span>,
                            "Hover to highlight related terms",
                        ],
                    },
                    {
                        cells: [
                            "Spot Color",
                            <InlineSpotColor
                                id="spot-table-accent"
                                varName="tableAccentColor"
                                {...spotColorPropsFromDefinition(getVariableInfo("tableAccentColor"))}
                            >
                                accent color
                            </InlineSpotColor>,
                            "Assigns a colour to a variable name",
                        ],
                    },
                ]}
                color="#6366f1"
                caption="Table 3 — Every inline component type, all working inside cells"
            />
        </Block>
    </StackLayout>,

    // ══════════════════════════════════════════════════
    // Section 4: Compact & Borderless Variants
    // ══════════════════════════════════════════════════
    <StackLayout key="layout-table-variants-heading" maxWidth="xl">
        <Block id="table-variants-heading" padding="sm">
            <EditableH4 id="h4-table-variants-heading" blockId="table-variants-heading">
                Table Variants
            </EditableH4>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-table-variants-intro" maxWidth="xl">
        <Block id="table-variants-intro" padding="sm">
            <EditableParagraph id="para-table-variants-intro" blockId="table-variants-intro">
                Different contexts call for different table styles. A compact layout works well for dense data, while removing borders creates a cleaner look for simple lists. The visual styling can be adjusted to match the content and context of each lesson.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <SplitLayout key="layout-table-variants" ratio="1:1" gap="lg">
        <Block id="table-compact" padding="sm">
            <Table
                id="table-compact-example"
                columns={[
                    { header: "n", align: "center", width: 60 },
                    { header: "n²", align: "center", width: 80 },
                    { header: "n³", align: "center", width: 80 },
                ]}
                rows={[
                    { cells: ["1", "1", "1"] },
                    { cells: ["2", "4", "8"] },
                    { cells: ["3", "9", "27"] },
                    { cells: ["4", "16", "64"] },
                    { cells: ["5", "25", "125"] },
                    { cells: ["6", "36", "216"] },
                ]}
                compact
                color="#22c55e"
                caption="Compact mode"
            />
        </Block>
        <Block id="table-borderless" padding="sm">
            <Table
                id="table-borderless-example"
                columns={[
                    { header: "Shape", align: "left" },
                    { header: "Sides", align: "center" },
                    { header: "Sum of Angles", align: "right" },
                ]}
                rows={[
                    { cells: ["Triangle", "3", "180°"] },
                    { cells: ["Square", "4", "360°"] },
                    { cells: ["Pentagon", "5", "540°"] },
                    { cells: ["Hexagon", "6", "720°"], highlight: true },
                ]}
                bordered={false}
                color="#f59e0b"
                caption="No borders, striped"
            />
        </Block>
    </SplitLayout>,
];
