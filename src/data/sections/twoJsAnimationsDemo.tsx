import { AnimatedGraph } from "@/components/atoms";

export const twoJsAnimationsDemoSection = {
    id: "twojs-animations-demo",
    title: "Two.js Mathematical Visualizations",
    content: (
        <div className="space-y-12">
            <div className="prose dark:prose-invert max-w-none">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
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
                        <div className="rounded-lg overflow-hidden border border-border bg-background">
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
                        <div className="rounded-lg overflow-hidden border border-border bg-background">
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
                        <div className="rounded-lg overflow-hidden border border-border bg-background">
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
                        <div className="rounded-lg overflow-hidden border border-border bg-background">
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
                        <div className="rounded-lg overflow-hidden border border-border bg-background">
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

            {/* Educational Context */}
            <div className="space-y-4">
                <h2 className="text-2xl font-semibold">Educational Applications</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-muted p-4 rounded-lg">
                        <h3 className="font-semibold mb-2">📐 Trigonometry</h3>
                        <p className="text-sm">
                            Use the sine wave visualization to teach students about periodic functions,
                            amplitude, frequency, and phase shifts in trigonometry.
                        </p>
                    </div>
                    <div className="bg-muted p-4 rounded-lg">
                        <h3 className="font-semibold mb-2">🔬 Physics</h3>
                        <p className="text-sm">
                            The pendulum demonstrates simple harmonic motion, conservation of energy,
                            and the relationship between position, velocity, and acceleration.
                        </p>
                    </div>
                    <div className="bg-muted p-4 rounded-lg">
                        <h3 className="font-semibold mb-2">📊 Calculus</h3>
                        <p className="text-sm">
                            Parametric curves show how functions can describe motion in two dimensions,
                            perfect for teaching derivatives and integrals of parametric equations.
                        </p>
                    </div>
                    <div className="bg-muted p-4 rounded-lg">
                        <h3 className="font-semibold mb-2">🎵 Signal Processing</h3>
                        <p className="text-sm">
                            Fourier series visualization helps students understand how complex waves
                            can be decomposed into simpler sine and cosine components.
                        </p>
                    </div>
                </div>
            </div>

            {/* Props Reference */}
            <div className="space-y-4">
                <h2 className="text-2xl font-semibold">Props Reference</h2>
                <div className="bg-background border rounded-lg overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-muted">
                            <tr>
                                <th className="text-left p-3">Prop</th>
                                <th className="text-left p-3">Type</th>
                                <th className="text-left p-3">Default</th>
                                <th className="text-left p-3">Description</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            <tr>
                                <td className="p-3 font-mono text-sm">variant</td>
                                <td className="p-3 text-sm">string</td>
                                <td className="p-3 text-sm">"sine-wave"</td>
                                <td className="p-3 text-sm">Graph type to display</td>
                            </tr>
                            <tr>
                                <td className="p-3 font-mono text-sm">color</td>
                                <td className="p-3 text-sm">string</td>
                                <td className="p-3 text-sm">"#10B981"</td>
                                <td className="p-3 text-sm">Primary color (hex, rgb, or hsl)</td>
                            </tr>
                            <tr>
                                <td className="p-3 font-mono text-sm">secondaryColor</td>
                                <td className="p-3 text-sm">string</td>
                                <td className="p-3 text-sm">"#3B82F6"</td>
                                <td className="p-3 text-sm">Secondary color for accents</td>
                            </tr>
                            <tr>
                                <td className="p-3 font-mono text-sm">width</td>
                                <td className="p-3 text-sm">number</td>
                                <td className="p-3 text-sm">600</td>
                                <td className="p-3 text-sm">Canvas width in pixels</td>
                            </tr>
                            <tr>
                                <td className="p-3 font-mono text-sm">height</td>
                                <td className="p-3 text-sm">number</td>
                                <td className="p-3 text-sm">400</td>
                                <td className="p-3 text-sm">Canvas height in pixels</td>
                            </tr>
                            <tr>
                                <td className="p-3 font-mono text-sm">speed</td>
                                <td className="p-3 text-sm">number</td>
                                <td className="p-3 text-sm">1.0</td>
                                <td className="p-3 text-sm">Animation speed (0.1 - 2.0)</td>
                            </tr>
                            <tr>
                                <td className="p-3 font-mono text-sm">showAxes</td>
                                <td className="p-3 text-sm">boolean</td>
                                <td className="p-3 text-sm">true</td>
                                <td className="p-3 text-sm">Display coordinate axes</td>
                            </tr>
                            <tr>
                                <td className="p-3 font-mono text-sm">showGrid</td>
                                <td className="p-3 text-sm">boolean</td>
                                <td className="p-3 text-sm">false</td>
                                <td className="p-3 text-sm">Display background grid</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    ),
};
