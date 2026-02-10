import { FullWidthLayout, GridLayout } from "@/components/layouts";
import { Block } from "@/components/templates";
import { AnimatedGraph, CoordinateSystem } from "@/components/atoms";

export const twoJsAnimationsDemo = [
    // Header
    <FullWidthLayout key="twojs-header" maxWidth="xl">
        <Block id="twojs-header">
            <div className="prose dark:prose-invert max-w-none">
                <h1 className="text-4xl font-bold text-foreground">
                    Mathematical Visualizations with Two.js
                </h1>
                <p className="text-lg text-muted-foreground">
                    Interactive mathematical animations to help students understand complex concepts through visualization.
                </p>
            </div>
        </Block>
    </FullWidthLayout>,

    // Coordinate System Section
    <FullWidthLayout key="coord-system-header" maxWidth="xl">
        <Block id="coord-system-header">
            <h2 className="text-2xl font-semibold">Coordinate System</h2>
            <p className="text-muted-foreground">
                A fundamental mathematical visualization showing a 2D coordinate plane with axes, arrows, and an optional grid.
            </p>
        </Block>
    </FullWidthLayout>,

    <GridLayout key="coord-system-grid" columns={2} gap="lg">
        <Block id="coord-standard">
            <div className="space-y-2">
                <h3 className="text-lg font-medium">Standard Coordinate System</h3>
                <p className="text-sm text-muted-foreground">Full coordinate plane with grid and labels</p>
                <div className="rounded-lg overflow-hidden bg-background">
                    <CoordinateSystem
                        width={460}
                        height={400}
                        showGrid={true}
                        showLabels={true}
                        gridSpacing={40}
                    />
                </div>
            </div>
        </Block>
        <Block id="coord-minimal">
            <div className="space-y-2">
                <h3 className="text-lg font-medium">Minimal Axes</h3>
                <p className="text-sm text-muted-foreground">Clean axes without grid for plotting</p>
                <div className="rounded-lg overflow-hidden bg-background">
                    <CoordinateSystem
                        width={460}
                        height={400}
                        showGrid={false}
                        showLabels={true}
                        gridSpacing={50}
                        axisColor="#3B82F6"
                    />
                </div>
            </div>
        </Block>
        <Block id="coord-fine">
            <div className="space-y-2">
                <h3 className="text-lg font-medium">Fine Grid</h3>
                <p className="text-sm text-muted-foreground">Smaller grid spacing for precise plotting</p>
                <div className="rounded-lg overflow-hidden bg-background">
                    <CoordinateSystem
                        width={460}
                        height={400}
                        showGrid={true}
                        showLabels={true}
                        gridSpacing={25}
                        gridColor="#10B981"
                        axisColor="#059669"
                    />
                </div>
            </div>
        </Block>
        <Block id="coord-coarse">
            <div className="space-y-2">
                <h3 className="text-lg font-medium">Coarse Grid</h3>
                <p className="text-sm text-muted-foreground">Larger grid spacing for overview</p>
                <div className="rounded-lg overflow-hidden bg-background">
                    <CoordinateSystem
                        width={460}
                        height={400}
                        showGrid={true}
                        showLabels={true}
                        gridSpacing={60}
                        gridColor="#EC4899"
                        axisColor="#DB2777"
                    />
                </div>
            </div>
        </Block>
    </GridLayout>,

    // Animated Graphs Section
    <FullWidthLayout key="math-viz-header" maxWidth="xl">
        <Block id="math-viz-header">
            <h2 className="text-2xl font-semibold">Mathematical Visualizations</h2>
            <p className="text-muted-foreground">
                Explore fundamental mathematical concepts through dynamic animations. Each visualization helps students understand abstract concepts visually.
            </p>
        </Block>
    </FullWidthLayout>,

    <GridLayout key="math-viz-grid" columns={2} gap="lg">
        <Block id="viz-sine">
            <div className="space-y-2">
                <h3 className="text-lg font-medium">Sine Wave</h3>
                <p className="text-sm text-muted-foreground">Fundamental trigonometric function showing periodic motion</p>
                <div className="rounded-lg overflow-hidden bg-background">
                    <AnimatedGraph
                        variant="sine-wave"
                        color="#10B981"
                        secondaryColor="#3B82F6"
                        width={460}
                        height={350}
                        showAxes={true}
                        showGrid={false}
                    />
                </div>
            </div>
        </Block>
        <Block id="viz-parametric">
            <div className="space-y-2">
                <h3 className="text-lg font-medium">Parametric Curve (Rose)</h3>
                <p className="text-sm text-muted-foreground">Beautiful parametric equations creating rose patterns</p>
                <div className="rounded-lg overflow-hidden bg-background">
                    <AnimatedGraph
                        variant="parametric"
                        color="#EC4899"
                        secondaryColor="#F59E0B"
                        width={460}
                        height={350}
                        showAxes={true}
                        showGrid={true}
                    />
                </div>
            </div>
        </Block>
        <Block id="viz-pendulum">
            <div className="space-y-2">
                <h3 className="text-lg font-medium">Pendulum Motion</h3>
                <p className="text-sm text-muted-foreground">Physics simulation demonstrating simple harmonic motion</p>
                <div className="rounded-lg overflow-hidden bg-background">
                    <AnimatedGraph
                        variant="pendulum"
                        color="#8B5CF6"
                        secondaryColor="#EC4899"
                        width={460}
                        height={350}
                        showAxes={false}
                    />
                </div>
            </div>
        </Block>
        <Block id="viz-fourier">
            <div className="space-y-2">
                <h3 className="text-lg font-medium">Fourier Series</h3>
                <p className="text-sm text-muted-foreground">Visualizing how circles combine to create wave patterns</p>
                <div className="rounded-lg overflow-hidden bg-background">
                    <AnimatedGraph
                        variant="fourier"
                        color="#F59E0B"
                        secondaryColor="#EF4444"
                        width={460}
                        height={350}
                        showAxes={true}
                        showGrid={true}
                    />
                </div>
            </div>
        </Block>
        <Block id="viz-lissajous">
            <div className="space-y-2">
                <h3 className="text-lg font-medium">Lissajous Curve</h3>
                <p className="text-sm text-muted-foreground">Complex patterns from two perpendicular oscillations</p>
                <div className="rounded-lg overflow-hidden bg-background">
                    <AnimatedGraph
                        variant="lissajous"
                        color="#06B6D4"
                        secondaryColor="#3B82F6"
                        width={460}
                        height={350}
                        showAxes={true}
                        showGrid={true}
                    />
                </div>
            </div>
        </Block>
    </GridLayout>
];

