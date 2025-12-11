import { AnimatedGraph } from "@/components/atoms";

export const twoJsAnimationsDemoSection = {
    id: "twojs-animations-demo",
    title: "Two.js Mathematical Visualizations",
    content: (
        <div className="space-y-12">
            <div className="prose dark:prose-invert max-w-none">
                <h1 className="text-4xl font-bold text-foreground">
                    Mathematical Visualizations with Two.js
                </h1>
                <p className="text-lg text-muted-foreground">
                    Interactive mathematical animations to help students understand complex concepts through visualization.
                </p>
            </div>

            {/* Animated Graphs */}
            <div className="space-y-6">
                <h2 className="text-2xl font-semibold">Mathematical Visualizations</h2>
                <p className="text-muted-foreground">
                    Explore fundamental mathematical concepts through dynamic animations. Each visualization helps students understand abstract concepts visually.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <h3 className="text-lg font-medium">Sine Wave</h3>
                        <p className="text-sm text-muted-foreground">Fundamental trigonometric function showing periodic motion</p>
                        <div className="rounded-lg overflow-hidden bg-background">
                            <AnimatedGraph
                                variant="sine-wave"
                                color="#10B981"
                                secondaryColor="#3B82F6"
                                width={500}
                                height={350}
                                showAxes={true}
                                showGrid={false}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-lg font-medium">Parametric Curve (Rose)</h3>
                        <p className="text-sm text-muted-foreground">Beautiful parametric equations creating rose patterns</p>
                        <div className="rounded-lg overflow-hidden bg-background">
                            <AnimatedGraph
                                variant="parametric"
                                color="#EC4899"
                                secondaryColor="#F59E0B"
                                width={500}
                                height={350}
                                showAxes={true}
                                showGrid={true}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-lg font-medium">Pendulum Motion</h3>
                        <p className="text-sm text-muted-foreground">Physics simulation demonstrating simple harmonic motion</p>
                        <div className="rounded-lg overflow-hidden bg-background">
                            <AnimatedGraph
                                variant="pendulum"
                                color="#8B5CF6"
                                secondaryColor="#EC4899"
                                width={500}
                                height={350}
                                showAxes={false}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-lg font-medium">Fourier Series</h3>
                        <p className="text-sm text-muted-foreground">Visualizing how circles combine to create wave patterns</p>
                        <div className="rounded-lg overflow-hidden bg-background">
                            <AnimatedGraph
                                variant="fourier"
                                color="#F59E0B"
                                secondaryColor="#EF4444"
                                width={500}
                                height={350}
                                showAxes={true}
                                showGrid={true}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-lg font-medium">Lissajous Curve</h3>
                        <p className="text-sm text-muted-foreground">Complex patterns from two perpendicular oscillations</p>
                        <div className="rounded-lg overflow-hidden bg-background">
                            <AnimatedGraph
                                variant="lissajous"
                                color="#06B6D4"
                                secondaryColor="#3B82F6"
                                width={500}
                                height={350}
                                showAxes={true}
                                showGrid={true}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    ),
};
