import { FullWidthLayout, GridLayout, SplitLayout } from "@/components/layouts";
import { Block } from "@/components/templates";
import { D3BarChart } from "@/components/atoms";

const sampleData1 = [
    { label: "Apple", value: 30 },
    { label: "Banana", value: 80 },
    { label: "Cherry", value: 45 },
    { label: "Date", value: 60 },
    { label: "Elderberry", value: 20 },
    { label: "Fig", value: 90 },
    { label: "Grape", value: 55 }
];

const sampleData2 = [
    { label: "Jan", value: 120 },
    { label: "Feb", value: 200 },
    { label: "Mar", value: 150 },
    { label: "Apr", value: 320 },
    { label: "May", value: 280 }
];

export const d3Demo = [
    // Header
    <FullWidthLayout key="d3-header" maxWidth="xl">
        <Block id="d3-header">
            <div className="prose dark:prose-invert max-w-none">
                <h1 className="text-4xl font-bold text-foreground">
                    Data Visualization with D3.js
                </h1>
                <p className="text-lg text-muted-foreground">
                    Powerful, interactive data visualizations integrated directly into your educational content.
                </p>
            </div>
        </Block>
    </FullWidthLayout>,

    // Basic Bar Chart
    <SplitLayout key="d3-basic-chart" ratio="1:1" gap="lg">
        <Block id="d3-basic-text">
            <div className="space-y-4">
                <h2 className="text-2xl font-bold">Interactive Bar Charts</h2>
                <p>
                    D3.js allows for complete control over the rendering of SVG elements.
                    This bar chart component demonstrates:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                    <li>Dynamic scaling using <code>scaleBand</code> and <code>scaleLinear</code></li>
                    <li>Smooth entrance animations</li>
                    <li>Interactive hover effects with tooltips</li>
                    <li>Theme-aware styling (colors adapt to CSS variables)</li>
                </ul>
                <p className="text-muted-foreground">
                    Hover over the bars to see value details.
                </p>
            </div>
        </Block>
        <Block id="d3-basic-viz">
            <div className="p-4 bg-card rounded-xl">
                <h3 className="text-lg font-semibold mb-4 text-center">Fruit Sales</h3>
                <D3BarChart data={sampleData1} width={500} height={350} />
            </div>
        </Block>
    </SplitLayout>
];
