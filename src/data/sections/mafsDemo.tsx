import { FullWidthLayout, SplitLayout } from "@/components/layouts";
import { Block } from "@/components/templates";
import { MafsBasic, MafsAnimated, MafsInteractiveDemo } from "@/components/atoms";

export const mafsDemo = [
    // Header
    <FullWidthLayout key="mafs-header" maxWidth="xl">
        <Block id="mafs-header">
            <div className="prose dark:prose-invert max-w-none">
                <h1 className="text-4xl font-bold text-foreground">
                    Math Visualization with Mafs
                </h1>
                <p className="text-lg text-muted-foreground">
                    Interactive math visualizations using Mafs.
                </p>
            </div>
        </Block>
    </FullWidthLayout>,

    // Basic Mafs Example
    <SplitLayout key="mafs-basic" ratio="1:1" gap="lg">
        <Block id="mafs-basic-text">
            <div className="space-y-4">
                <h2 className="text-2xl font-bold">Coordinate System</h2>
                <p>
                    A basic Cartesian coordinate system rendered with Mafs,
                    showing a sine wave plot with clean axes and grid lines.
                </p>
            </div>
        </Block>
        <Block id="mafs-basic-viz">
            <div className="h-[400px] w-full">
                <MafsBasic />
            </div>
        </Block>
    </SplitLayout>,

    // Animated Mafs Example
    <SplitLayout key="mafs-animated" ratio="1:1" gap="lg">
        <Block id="mafs-animated-text">
            <div className="space-y-4">
                <h2 className="text-2xl font-bold">Animated Visualization</h2>
                <p>
                    This example uses <code>useStopwatch</code> to create
                    continuous animations. Watch the red point trace along
                    the sine wave while the green point orbits the origin.
                </p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>🔴 Red point: Follows the sine wave</li>
                    <li>🟢 Green point: Rotates around the origin</li>
                    <li>⚪ Dashed circle: Shows the orbit path</li>
                </ul>
            </div>
        </Block>
        <Block id="mafs-animated-viz">
            <div className="h-[400px] w-full">
                <MafsAnimated />
            </div>
        </Block>
    </SplitLayout>,

    // Interactive Mafs Example with Bidirectional Sliders
    <MafsInteractiveDemo key="mafs-interactive" />,
];
