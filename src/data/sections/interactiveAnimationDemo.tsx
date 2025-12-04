import { InteractiveAnimation } from "@/components/organisms";

export const interactiveAnimationDemoSection = {
    id: "interactive-animation-demo",
    title: "Interactive Mathematical Visualizations",
    content: (
        <div className="space-y-12">
            <div className="prose dark:prose-invert max-w-none">
                <h1 className="text-4xl font-bold text-foreground">
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
        </div>
    ),
};
