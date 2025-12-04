import { InteractiveAnimation } from "@/components/organisms";

export const interactiveAnimationDemoSection = {
    id: "interactive-animation-demo",
    title: "Interactive Mathematical Visualizations",
    content: (
        <div className="space-y-12">
            <div className="prose dark:prose-invert max-w-none">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Interactive Mathematical Visualizations
                </h1>
                <p className="text-lg text-muted-foreground">
                    Explore mathematical concepts with real-time controls. Adjust speed, colors, and parameters to see how they affect the visualization!
                </p>
            </div>

            {/* Sine Wave Demo */}
            <div className="space-y-4">
                <h2 className="text-2xl font-semibold">Sine Wave Exploration</h2>
                <p className="text-muted-foreground">
                    Interactive sine wave with controls for speed, colors, axes, and grid. Perfect for teaching trigonometry and wave properties.
                </p>
                <InteractiveAnimation
                    type="graph"
                    initialVariant="sine-wave"
                    title="Sine Wave Visualization"
                    description="Explore the sine wave - adjust speed, toggle axes/grid, and change colors"
                    width={700}
                    height={400}
                />
            </div>

            {/* Fourier Series Demo */}
            <div className="space-y-4">
                <h2 className="text-2xl font-semibold">Fourier Series</h2>
                <p className="text-muted-foreground">
                    Watch how circular motions combine to create wave patterns. Demonstrates the fundamental concept of Fourier analysis.
                </p>
                <InteractiveAnimation
                    type="graph"
                    initialVariant="fourier"
                    title="Fourier Series Visualization"
                    description="See how epicycles combine to form complex waveforms"
                    width={700}
                    height={400}
                />
            </div>

            {/* Pendulum Demo */}
            <div className="space-y-4">
                <h2 className="text-2xl font-semibold">Simple Harmonic Motion</h2>
                <p className="text-muted-foreground">
                    A pendulum demonstrating periodic motion and conservation of energy. Slow down the animation to observe the motion in detail.
                </p>
                <InteractiveAnimation
                    type="graph"
                    initialVariant="pendulum"
                    title="Pendulum Simulation"
                    description="Observe the periodic swing and energy conservation"
                    width={700}
                    height={450}
                />
            </div>

            {/* Educational Use Cases */}
            <div className="space-y-4">
                <h2 className="text-2xl font-semibold">Educational Use Cases</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-muted p-4 rounded-lg">
                        <h3 className="font-semibold mb-2">📐 Algebra & Trigonometry</h3>
                        <p className="text-sm">
                            Use sine and parametric curves to visualize functions, explore periodicity,
                            and understand the relationship between equations and their graphs.
                        </p>
                    </div>
                    <div className="bg-muted p-4 rounded-lg">
                        <h3 className="font-semibold mb-2">⚛️ Physics</h3>
                        <p className="text-sm">
                            Demonstrate pendulum motion, wave propagation, and harmonic oscillators.
                            Interactive controls help students explore cause and effect relationships.
                        </p>
                    </div>
                    <div className="bg-muted p-4 rounded-lg">
                        <h3 className="font-semibold mb-2">📊 Calculus</h3>
                        <p className="text-sm">
                            Visualize parametric equations, explore derivatives and rates of change,
                            and understand the behavior of mathematical functions dynamically.
                        </p>
                    </div>
                    <div className="bg-muted p-4 rounded-lg">
                        <h3 className="font-semibold mb-2">🎵 Signal Processing</h3>
                        <p className="text-sm">
                            Fourier series visualization shows how complex signals decompose into
                            simpler components - fundamental to signal processing and analysis.
                        </p>
                    </div>
                </div>
            </div>

            {/* Tips */}
            <div className="bg-blue-50 dark:bg-blue-950 p-6 rounded-lg">
                <h3 className="font-semibold mb-3 text-blue-900 dark:text-blue-100">💡 Teaching Tips</h3>
                <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                    <li>• <strong>Start slow:</strong> Begin with speed at 0.5x to help students observe details</li>
                    <li>• <strong>Guided exploration:</strong> Ask students to predict changes before adjusting controls</li>
                    <li>• <strong>Compare variants:</strong> Use the variant switcher to compare different mathematical curves</li>
                    <li>• <strong>Use pause:</strong> Freeze the animation at key moments for detailed examination</li>
                    <li>• <strong>Color coding:</strong> Use different colors to highlight relationships between components</li>
                    <li>• <strong>Show axes/grid:</strong> Toggle them on to help students see coordinates and measurements</li>
                </ul>
            </div>
        </div>
    ),
};
