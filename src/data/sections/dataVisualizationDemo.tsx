import { type ReactElement } from "react";
import { Block } from "@/components/templates";
import { StackLayout, SplitLayout } from "@/components/layouts";
import {
    EditableH1,
    EditableH2,
    EditableParagraph,
    InlineScrubbleNumber,
    InlineToggle,
    InlineTooltip,
    DataVisualization,
    SimulationPanel,
} from "@/components/atoms";
import type { ChartType, ChartDataPoint, ScatterDataPoint } from "@/components/atoms";
import { useVar } from "@/stores";
import {
    getExampleVariableInfo,
    numberPropsFromDefinition,
    togglePropsFromDefinition,
} from "../exampleVariables";

// ─── Reactive wrapper: reads category values from the store ──────────────────

function ReactiveBarChart() {
    const a = useVar("dvCategoryA", 42) as number;
    const b = useVar("dvCategoryB", 28) as number;
    const c = useVar("dvCategoryC", 65) as number;
    const d = useVar("dvCategoryD", 53) as number;
    const e = useVar("dvCategoryE", 37) as number;
    const scale = useVar("dvScaleFactor", 1) as number;
    const showValues = useVar("dvShowValues", false) as boolean;

    const data: ChartDataPoint[] = [
        { label: "Physics", value: Math.round(a * scale), color: "#6366f1" },
        { label: "Chemistry", value: Math.round(b * scale), color: "#f43f5e" },
        { label: "Biology", value: Math.round(c * scale), color: "#22c55e" },
        { label: "Math", value: Math.round(d * scale), color: "#f59e0b" },
        { label: "English", value: Math.round(e * scale), color: "#3b82f6" },
    ];

    return (
        <DataVisualization
            type="bar"
            data={data}
            title="Student Scores by Subject"
            xLabel="Subject"
            yLabel="Score"
            showValues={showValues}
            width={560}
            height={340}
        />
    );
}

function ReactiveLineChart() {
    const a = useVar("dvCategoryA", 42) as number;
    const b = useVar("dvCategoryB", 28) as number;
    const c = useVar("dvCategoryC", 65) as number;
    const d = useVar("dvCategoryD", 53) as number;
    const e = useVar("dvCategoryE", 37) as number;
    const scale = useVar("dvScaleFactor", 1) as number;
    const showValues = useVar("dvShowValues", false) as boolean;
    const curveType = useVar("dvCurve", "smooth") as "linear" | "smooth" | "step";

    const data: ChartDataPoint[] = [
        { label: "Week 1", value: Math.round(a * scale) },
        { label: "Week 2", value: Math.round(b * scale) },
        { label: "Week 3", value: Math.round(c * scale) },
        { label: "Week 4", value: Math.round(d * scale) },
        { label: "Week 5", value: Math.round(e * scale) },
    ];

    return (
        <DataVisualization
            type="line"
            data={data}
            color="#6366f1"
            title="Weekly Progress"
            xLabel="Week"
            yLabel="Score"
            showValues={showValues}
            curve={curveType}
            width={560}
            height={340}
        />
    );
}

function ReactiveAreaChart() {
    const a = useVar("dvCategoryA", 42) as number;
    const b = useVar("dvCategoryB", 28) as number;
    const c = useVar("dvCategoryC", 65) as number;
    const d = useVar("dvCategoryD", 53) as number;
    const e = useVar("dvCategoryE", 37) as number;
    const scale = useVar("dvScaleFactor", 1) as number;
    const curveType = useVar("dvCurve", "smooth") as "linear" | "smooth" | "step";

    const data: ChartDataPoint[] = [
        { label: "Jan", value: Math.round(a * scale) },
        { label: "Feb", value: Math.round(b * scale) },
        { label: "Mar", value: Math.round(c * scale) },
        { label: "Apr", value: Math.round(d * scale) },
        { label: "May", value: Math.round(e * scale) },
    ];

    return (
        <DataVisualization
            type="area"
            data={data}
            color="#22c55e"
            title="Monthly Revenue (k$)"
            xLabel="Month"
            yLabel="Revenue"
            curve={curveType}
            width={560}
            height={340}
        />
    );
}

function ReactivePieChart() {
    const a = useVar("dvCategoryA", 42) as number;
    const b = useVar("dvCategoryB", 28) as number;
    const c = useVar("dvCategoryC", 65) as number;
    const d = useVar("dvCategoryD", 53) as number;
    const e = useVar("dvCategoryE", 37) as number;
    const scale = useVar("dvScaleFactor", 1) as number;
    const showValues = useVar("dvShowValues", false) as boolean;

    const data: ChartDataPoint[] = [
        { label: "Physics", value: Math.round(a * scale) },
        { label: "Chemistry", value: Math.round(b * scale) },
        { label: "Biology", value: Math.round(c * scale) },
        { label: "Math", value: Math.round(d * scale) },
        { label: "English", value: Math.round(e * scale) },
    ];

    return (
        <DataVisualization
            type="pie"
            data={data}
            title="Distribution by Subject"
            showValues={showValues}
            width={520}
            height={340}
        />
    );
}

function ReactiveDonutChart() {
    const a = useVar("dvCategoryA", 42) as number;
    const b = useVar("dvCategoryB", 28) as number;
    const c = useVar("dvCategoryC", 65) as number;
    const d = useVar("dvCategoryD", 53) as number;
    const e = useVar("dvCategoryE", 37) as number;
    const scale = useVar("dvScaleFactor", 1) as number;
    const showValues = useVar("dvShowValues", false) as boolean;

    const data: ChartDataPoint[] = [
        { label: "Physics", value: Math.round(a * scale) },
        { label: "Chemistry", value: Math.round(b * scale) },
        { label: "Biology", value: Math.round(c * scale) },
        { label: "Math", value: Math.round(d * scale) },
        { label: "English", value: Math.round(e * scale) },
    ];

    return (
        <DataVisualization
            type="donut"
            data={data}
            title="Score Breakdown"
            showValues={showValues}
            width={520}
            height={340}
        />
    );
}

function ReactiveScatterChart() {
    const scale = useVar("dvScaleFactor", 1) as number;

    const scatterData: ScatterDataPoint[] = [
        { x: 2, y: 35 * scale, label: "Student A", color: "#6366f1" },
        { x: 3, y: 50 * scale, label: "Student B", color: "#6366f1" },
        { x: 4, y: 65 * scale, label: "Student C", color: "#6366f1" },
        { x: 5, y: 55 * scale, label: "Student D", color: "#6366f1" },
        { x: 6, y: 80 * scale, label: "Student E", color: "#6366f1" },
        { x: 7, y: 70 * scale, label: "Student F", color: "#6366f1" },
        { x: 3, y: 40 * scale, label: "Student G", color: "#f43f5e" },
        { x: 5, y: 72 * scale, label: "Student H", color: "#f43f5e" },
        { x: 6, y: 60 * scale, label: "Student I", color: "#f43f5e" },
        { x: 8, y: 90 * scale, label: "Student J", color: "#f43f5e" },
        { x: 2, y: 25 * scale, label: "Student K", color: "#22c55e" },
        { x: 4, y: 45 * scale, label: "Student L", color: "#22c55e" },
        { x: 7, y: 85 * scale, label: "Student M", color: "#22c55e" },
        { x: 9, y: 92 * scale, label: "Student N", color: "#22c55e" },
    ];

    return (
        <DataVisualization
            type="scatter"
            scatterData={scatterData}
            title="Study Hours vs. Test Score"
            xLabel="Hours Studied"
            yLabel="Test Score"
            width={560}
            height={340}
        />
    );
}

/** The multi-type reactive chart — switches type based on the dvChartType variable */
function ReactiveMultiChart() {
    const chartType = useVar("dvChartType", "bar") as ChartType;
    const a = useVar("dvCategoryA", 42) as number;
    const b = useVar("dvCategoryB", 28) as number;
    const c = useVar("dvCategoryC", 65) as number;
    const d = useVar("dvCategoryD", 53) as number;
    const e = useVar("dvCategoryE", 37) as number;
    const scale = useVar("dvScaleFactor", 1) as number;
    const showValues = useVar("dvShowValues", false) as boolean;
    const curveType = useVar("dvCurve", "smooth") as "linear" | "smooth" | "step";

    const data: ChartDataPoint[] = [
        { label: "Physics", value: Math.round(a * scale), color: "#6366f1" },
        { label: "Chemistry", value: Math.round(b * scale), color: "#f43f5e" },
        { label: "Biology", value: Math.round(c * scale), color: "#22c55e" },
        { label: "Math", value: Math.round(d * scale), color: "#f59e0b" },
        { label: "English", value: Math.round(e * scale), color: "#3b82f6" },
    ];

    const scatterData: ScatterDataPoint[] = [
        { x: 2, y: Math.round(a * scale * 0.8), label: "A", color: "#6366f1" },
        { x: 3.5, y: Math.round(b * scale * 1.2), label: "B", color: "#f43f5e" },
        { x: 5, y: Math.round(c * scale * 0.9), label: "C", color: "#22c55e" },
        { x: 6.5, y: Math.round(d * scale), label: "D", color: "#f59e0b" },
        { x: 8, y: Math.round(e * scale * 1.1), label: "E", color: "#3b82f6" },
        { x: 4, y: Math.round(a * scale * 0.6), label: "F", color: "#6366f1" },
        { x: 7, y: Math.round(c * scale * 1.1), label: "G", color: "#22c55e" },
        { x: 3, y: Math.round(b * scale * 0.7), label: "H", color: "#f43f5e" },
    ];

    return (
        <DataVisualization
            type={chartType}
            data={data}
            scatterData={chartType === "scatter" ? scatterData : undefined}
            title="Interactive Data Explorer"
            xLabel={chartType === "scatter" ? "X Axis" : "Category"}
            yLabel={chartType === "scatter" ? "Y Axis" : "Value"}
            showValues={showValues}
            curve={curveType}
            width={600}
            height={380}
        />
    );
}

// ─── Helper ──────────────────────────────────────────────────────────────────

function numDef(varName: string) {
    const def = getExampleVariableInfo(varName);
    return {
        min: def?.min ?? 0,
        max: def?.max ?? 10,
        step: def?.step ?? 1,
        unit: def?.unit,
        color: def?.color,
        label: def?.label ?? varName,
    };
}

const dvScale = numDef("dvScaleFactor");
const dvA = numDef("dvCategoryA");
const dvB = numDef("dvCategoryB");
const dvC = numDef("dvCategoryC");
const dvD = numDef("dvCategoryD");
const dvE = numDef("dvCategoryE");

// ─── Exported block array ────────────────────────────────────────────────────

export const dataVisualizationDemoBlocks: ReactElement[] = [
    // ── Title ────────────────────────────────────────────────────────────────
    <StackLayout key="layout-dv-title" maxWidth="xl">
        <Block id="block-dv-title" padding="md">
            <EditableH1 id="h1-dv-title" blockId="block-dv-title">
                Data Visualization
            </EditableH1>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-dv-intro" maxWidth="xl">
        <Block id="block-dv-intro" padding="sm">
            <EditableParagraph id="para-dv-intro" blockId="block-dv-intro">
                The{" "}
                <InlineTooltip
                    id="tooltip-data-viz"
                    tooltip="A versatile D3-powered component that renders bar, line, area, pie, donut, and scatter charts — all reactive to the global variable store."
                >
                    DataVisualization
                </InlineTooltip>{" "}
                component visualises data in multiple chart types. Every example
                below reads its data from the global variable store, so adjusting a
                value instantly updates every chart on the page.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // ── Interactive Multi-Type Explorer (SimulationPanel) ─────────────────────
    <StackLayout key="layout-dv-multi-h2" maxWidth="xl">
        <Block id="block-dv-multi-h2" padding="sm">
            <EditableH2 id="h2-dv-multi" blockId="block-dv-multi-h2">
                1) Interactive Chart Explorer
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-dv-multi-desc" maxWidth="xl">
        <Block id="block-dv-multi-desc" padding="sm">
            <EditableParagraph id="para-dv-multi-desc" blockId="block-dv-multi-desc">
                Use the controls to switch chart type, adjust individual category
                values, and apply a{" "}
                <InlineScrubbleNumber
                    id="scrubble-dv-scale"
                    varName="dvScaleFactor"
                    {...numberPropsFromDefinition(getExampleVariableInfo("dvScaleFactor"))}
                />{" "}
                scale factor. The chart reacts to every change in real time.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-dv-multi" maxWidth="xl">
        <Block id="block-dv-multi" padding="sm">
            <SimulationPanel
                title="Chart Controls"
                controlsPosition="right"
                controlsWidth="sm"
                height={380}
                controls={[
                    {
                        type: "select",
                        varName: "dvChartType",
                        label: "Chart Type",
                        options: [
                            { label: "Bar", value: "bar" },
                            { label: "Line", value: "line" },
                            { label: "Area", value: "area" },
                            { label: "Pie", value: "pie" },
                            { label: "Donut", value: "donut" },
                            { label: "Scatter", value: "scatter" },
                        ],
                    },
                    {
                        type: "slider",
                        varName: "dvScaleFactor",
                        label: dvScale.label,
                        min: dvScale.min,
                        max: dvScale.max,
                        step: dvScale.step,
                        color: dvScale.color,
                    },
                    {
                        type: "slider",
                        varName: "dvCategoryA",
                        label: dvA.label,
                        min: dvA.min,
                        max: dvA.max,
                        step: dvA.step,
                        color: dvA.color,
                    },
                    {
                        type: "slider",
                        varName: "dvCategoryB",
                        label: dvB.label,
                        min: dvB.min,
                        max: dvB.max,
                        step: dvB.step,
                        color: dvB.color,
                    },
                    {
                        type: "slider",
                        varName: "dvCategoryC",
                        label: dvC.label,
                        min: dvC.min,
                        max: dvC.max,
                        step: dvC.step,
                        color: dvC.color,
                    },
                    {
                        type: "slider",
                        varName: "dvCategoryD",
                        label: dvD.label,
                        min: dvD.min,
                        max: dvD.max,
                        step: dvD.step,
                        color: dvD.color,
                    },
                    {
                        type: "slider",
                        varName: "dvCategoryE",
                        label: dvE.label,
                        min: dvE.min,
                        max: dvE.max,
                        step: dvE.step,
                        color: dvE.color,
                    },
                    {
                        type: "toggle",
                        varName: "dvShowValues",
                        label: "Show Values",
                    },
                ]}
            >
                <ReactiveMultiChart />
            </SimulationPanel>
        </Block>
    </StackLayout>,

    // ── Bar Chart Example ────────────────────────────────────────────────────
    <StackLayout key="layout-dv-bar-h2" maxWidth="xl">
        <Block id="block-dv-bar-h2" padding="sm">
            <EditableH2 id="h2-dv-bar" blockId="block-dv-bar-h2">
                2) Bar Chart
            </EditableH2>
        </Block>
    </StackLayout>,

    <SplitLayout key="layout-dv-bar" ratio="1:1" gap="lg">
        <div className="space-y-4">
            <Block id="block-dv-bar-text" padding="sm">
                <EditableParagraph id="para-dv-bar-text" blockId="block-dv-bar-text">
                    The bar chart displays{" "}
                    <InlineScrubbleNumber
                        id="scrubble-dv-a"
                        varName="dvCategoryA"
                        {...numberPropsFromDefinition(getExampleVariableInfo("dvCategoryA"))}
                    />{" "}
                    in Physics,{" "}
                    <InlineScrubbleNumber
                        id="scrubble-dv-b"
                        varName="dvCategoryB"
                        {...numberPropsFromDefinition(getExampleVariableInfo("dvCategoryB"))}
                    />{" "}
                    in Chemistry,{" "}
                    <InlineScrubbleNumber
                        id="scrubble-dv-c"
                        varName="dvCategoryC"
                        {...numberPropsFromDefinition(getExampleVariableInfo("dvCategoryC"))}
                    />{" "}
                    in Biology,{" "}
                    <InlineScrubbleNumber
                        id="scrubble-dv-d"
                        varName="dvCategoryD"
                        {...numberPropsFromDefinition(getExampleVariableInfo("dvCategoryD"))}
                    />{" "}
                    in Math, and{" "}
                    <InlineScrubbleNumber
                        id="scrubble-dv-e"
                        varName="dvCategoryE"
                        {...numberPropsFromDefinition(getExampleVariableInfo("dvCategoryE"))}
                    />{" "}
                    in English. Drag any number to instantly update the chart.
                </EditableParagraph>
            </Block>
        </div>
        <Block id="block-dv-bar-viz" padding="sm">
            <ReactiveBarChart />
        </Block>
    </SplitLayout>,

    // ── Line Chart Example ───────────────────────────────────────────────────
    <StackLayout key="layout-dv-line-h2" maxWidth="xl">
        <Block id="block-dv-line-h2" padding="sm">
            <EditableH2 id="h2-dv-line" blockId="block-dv-line-h2">
                3) Line Chart
            </EditableH2>
        </Block>
    </StackLayout>,

    <SplitLayout key="layout-dv-line" ratio="1:1" gap="lg">
        <div className="space-y-4">
            <Block id="block-dv-line-text" padding="sm">
                <EditableParagraph id="para-dv-line-text" blockId="block-dv-line-text">
                    The line chart uses the same data points but visualises them as a
                    continuous trend. Change the curve type to{" "}
                    <InlineToggle
                        id="toggle-dv-curve"
                        varName="dvCurve"
                        options={["linear", "smooth", "step"]}
                        {...togglePropsFromDefinition(getExampleVariableInfo("dvCurve"))}
                    />{" "}
                    to see different interpolation styles.
                </EditableParagraph>
            </Block>
        </div>
        <Block id="block-dv-line-viz" padding="sm">
            <ReactiveLineChart />
        </Block>
    </SplitLayout>,

    // ── Area Chart Example ───────────────────────────────────────────────────
    <StackLayout key="layout-dv-area-h2" maxWidth="xl">
        <Block id="block-dv-area-h2" padding="sm">
            <EditableH2 id="h2-dv-area" blockId="block-dv-area-h2">
                4) Area Chart
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-dv-area" maxWidth="xl">
        <Block id="block-dv-area-viz" padding="sm">
            <ReactiveAreaChart />
        </Block>
    </StackLayout>,

    // ── Pie & Donut Charts ───────────────────────────────────────────────────
    <StackLayout key="layout-dv-pie-h2" maxWidth="xl">
        <Block id="block-dv-pie-h2" padding="sm">
            <EditableH2 id="h2-dv-pie" blockId="block-dv-pie-h2">
                5) Pie &amp; Donut Charts
            </EditableH2>
        </Block>
    </StackLayout>,

    <SplitLayout key="layout-dv-pie-donut" ratio="1:1" gap="lg">
        <Block id="block-dv-pie-viz" padding="sm">
            <ReactivePieChart />
        </Block>
        <Block id="block-dv-donut-viz" padding="sm">
            <ReactiveDonutChart />
        </Block>
    </SplitLayout>,

    // ── Scatter Chart Example ────────────────────────────────────────────────
    <StackLayout key="layout-dv-scatter-h2" maxWidth="xl">
        <Block id="block-dv-scatter-h2" padding="sm">
            <EditableH2 id="h2-dv-scatter" blockId="block-dv-scatter-h2">
                6) Scatter Plot
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-dv-scatter-desc" maxWidth="xl">
        <Block id="block-dv-scatter-desc" padding="sm">
            <EditableParagraph id="para-dv-scatter-desc" blockId="block-dv-scatter-desc">
                Scatter plots show individual data points on a 2D plane. Adjust the{" "}
                <InlineScrubbleNumber
                    id="scrubble-dv-scale-s"
                    varName="dvScaleFactor"
                    {...numberPropsFromDefinition(getExampleVariableInfo("dvScaleFactor"))}
                />{" "}
                scale factor to see how all Y values rescale proportionally.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-dv-scatter" maxWidth="xl">
        <Block id="block-dv-scatter-viz" padding="sm">
            <ReactiveScatterChart />
        </Block>
    </StackLayout>,
];
