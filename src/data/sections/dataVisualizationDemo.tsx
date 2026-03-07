import { type ReactElement } from "react";
import { Block } from "@/components/templates";
import { StackLayout, SplitLayout } from "@/components/layouts";
import {
    EditableH1,
    EditableH2,
    EditableParagraph,
    DataVisualization,
    SimulationPanel,
    EditableH3,
    EditableH4,
} from "@/components/atoms";
import type { ChartType, ChartDataPoint, ScatterDataPoint } from "@/components/atoms";
import { useVar } from "@/stores";
import {
    getExampleVariableInfo,
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
    <StackLayout key="layout-data-visualization-title" maxWidth="xl">
        <Block id="data-visualization-title" padding="md">
            <EditableH3 id="h3-data-visualization-title" blockId="data-visualization-title">
                Data Visualization
            </EditableH3>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-data-visualization-intro" maxWidth="xl">
        <Block id="data-visualization-intro" padding="sm">
            <EditableParagraph id="para-data-visualization-intro" blockId="data-visualization-intro">
                Data visualization transforms raw numbers into visual patterns that our brains can quickly interpret. Whether comparing categories with bar charts, tracking trends with line graphs, or showing proportions with pie charts, each visualization type has its strengths. The examples below demonstrate how the same underlying data can be presented in different ways.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // ── Interactive Multi-Type Explorer (SimulationPanel) ─────────────────────
    <StackLayout key="layout-data-visualization-multi-h2" maxWidth="xl">
        <Block id="data-visualization-multi-h2" padding="sm">
            <EditableH4 id="h4-data-visualization-multi" blockId="data-visualization-multi-h2">
                Interactive Chart Explorer
            </EditableH4>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-data-visualization-multi-desc" maxWidth="xl">
        <Block id="data-visualization-multi-desc" padding="sm">
            <EditableParagraph id="para-data-visualization-multi-desc" blockId="data-visualization-multi-desc">
                The same data can tell different stories depending on how we visualize it. Use the controls on the right to switch between chart types and adjust values. Notice how bar charts emphasize individual comparisons, while pie charts highlight proportions, and line charts reveal trends. Each representation offers a unique perspective on the same underlying numbers.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-data-visualization-multi" maxWidth="xl">
        <Block id="data-visualization-multi" padding="sm">
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
    <StackLayout key="layout-data-visualization-bar-h2" maxWidth="xl">
        <Block id="data-visualization-bar-h2" padding="sm">
            <EditableH4 id="h4-data-visualization-bar" blockId="data-visualization-bar-h2">
                Bar Chart
            </EditableH4>
        </Block>
    </StackLayout>,

    <SplitLayout key="layout-data-visualization-bar" ratio="1:1" gap="lg">
        <div className="space-y-4">
            <Block id="data-visualization-bar-text" padding="sm">
                <EditableParagraph id="para-data-visualization-bar-text" blockId="data-visualization-bar-text">
                    Bar charts are ideal for comparing discrete categories at a glance. Each vertical bar represents a subject, with its height showing the student's score. This makes it easy to spot which subjects a student excels in and where they might need more practice. Try adjusting the values using the simulation panel above to see how the bars respond.
                </EditableParagraph>
            </Block>
        </div>
        <Block id="data-visualization-bar-viz" padding="sm" hasVisualization>
            <ReactiveBarChart />
        </Block>
    </SplitLayout>,

    // ── Line Chart Example ───────────────────────────────────────────────────
    <StackLayout key="layout-data-visualization-line-h2" maxWidth="xl">
        <Block id="data-visualization-line-h2" padding="sm">
            <EditableH4 id="h4-data-visualization-line" blockId="data-visualization-line-h2">
                Line Chart
            </EditableH4>
        </Block>
    </StackLayout>,

    <SplitLayout key="layout-data-visualization-line" ratio="1:1" gap="lg">
        <div className="space-y-4">
            <Block id="data-visualization-line-text" padding="sm">
                <EditableParagraph id="para-data-visualization-line-text" blockId="data-visualization-line-text">
                    Line charts excel at showing trends over time. By connecting data points, they reveal patterns that might be hidden in a table of numbers. The way points are connected matters too: a smooth curve suggests continuous change, linear segments emphasize the exact path between measurements, and step lines highlight that values remain constant until the next observation.
                </EditableParagraph>
            </Block>
        </div>
        <Block id="data-visualization-line-viz" padding="sm" hasVisualization>
            <ReactiveLineChart />
        </Block>
    </SplitLayout>,

    // ── Area Chart Example ───────────────────────────────────────────────────
    <StackLayout key="layout-data-visualization-area-h2" maxWidth="xl">
        <Block id="data-visualization-area-h2" padding="sm">
            <EditableH4 id="h4-data-visualization-area" blockId="data-visualization-area-h2">
                Area Chart
            </EditableH4>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-data-visualization-area" maxWidth="xl">
        <Block id="data-visualization-area-viz" padding="sm" hasVisualization>
            <ReactiveAreaChart />
        </Block>
    </StackLayout>,

    // ── Pie & Donut Charts ───────────────────────────────────────────────────
    <StackLayout key="layout-data-visualization-pie-h2" maxWidth="xl">
        <Block id="data-visualization-pie-h2" padding="sm">
            <EditableH4 id="h4-data-visualization-pie" blockId="data-visualization-pie-h2">
                Pie &amp; Donut Charts
            </EditableH4>
        </Block>
    </StackLayout>,

    <SplitLayout key="layout-data-visualization-pie-donut" ratio="1:1" gap="lg">
        <Block id="data-visualization-pie-viz" padding="sm" hasVisualization>
            <ReactivePieChart />
        </Block>
        <Block id="data-visualization-donut-viz" padding="sm" hasVisualization>
            <ReactiveDonutChart />
        </Block>
    </SplitLayout>,

    // ── Scatter Chart Example ────────────────────────────────────────────────
    <StackLayout key="layout-data-visualization-scatter-h2" maxWidth="xl">
        <Block id="data-visualization-scatter-h2" padding="sm">
            <EditableH4 id="h4-data-visualization-scatter" blockId="data-visualization-scatter-h2">
                Scatter Plot
            </EditableH4>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-data-visualization-scatter-desc" maxWidth="xl">
        <Block id="data-visualization-scatter-desc" padding="sm">
            <EditableParagraph id="para-data-visualization-scatter-desc" blockId="data-visualization-scatter-desc">
                Scatter plots reveal relationships between two variables by displaying individual data points as dots on a coordinate plane. Each dot represents one observation, showing how study hours relate to test scores. When points cluster in a pattern (rising from left to right), we see a positive correlation. Scattered points suggest little relationship between the variables.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-data-visualization-scatter" maxWidth="xl">
        <Block id="data-visualization-scatter-viz" padding="sm" hasVisualization>
            <ReactiveScatterChart />
        </Block>
    </StackLayout>,
];
