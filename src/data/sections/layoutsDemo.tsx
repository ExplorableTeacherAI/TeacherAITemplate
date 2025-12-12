import { AnimatedGraph } from "@/components/atoms";

/**
 * Demo sections showcasing different layout capabilities
 */



export const splitDemoLeftSection = {
    id: "split-demo-left",
    title: "Concept Explanation",
    content: (
        <div className="space-y-4 h-full flex flex-col justify-center">
            <h2 className="text-2xl font-semibold">Understanding Sine Waves</h2>
            <p className="text-muted-foreground">
                The sine function is one of the most fundamental trigonometric functions.
                It describes smooth, periodic oscillations and appears throughout physics,
                engineering, and mathematics.
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Period: 2π (360 degrees)</li>
                <li>Amplitude: Range from -1 to 1</li>
                <li>Applications: Sound waves, AC current, circular motion</li>
            </ul>
            <p className="text-sm text-muted-foreground italic">
                Try adjusting the visualization on the right to see how sine waves behave.
            </p>
        </div>
    ),
};

export const splitDemoRightSection = {
    id: "split-demo-right",
    title: "Visualization",
    content: (
        <div className="rounded-lg overflow-hidden bg-background">
            <AnimatedGraph
                variant="sine-wave"
                color="#10B981"
                secondaryColor="#3B82F6"
                width={500}
                height={400}
                showAxes={true}
                showGrid={false}
            />
        </div>
    ),
};

export const gridDemoSection1 = {
    id: "grid-demo-1",
    title: "Grid Example 1",
    content: (
        <div className="space-y-3 p-6 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors h-full">
            <h3 className="text-xl font-semibold">Parametric Rose</h3>
            <div className="rounded-lg overflow-hidden">
                <AnimatedGraph
                    variant="parametric"
                    color="#EC4899"
                    secondaryColor="#F59E0B"
                    width={300}
                    height={250}
                    showAxes={false}
                    showGrid={false}
                />
            </div>
            <p className="text-sm text-muted-foreground">
                Beautiful patterns created by parametric equations
            </p>
        </div>
    ),
};

export const gridDemoSection2 = {
    id: "grid-demo-2",
    title: "Grid Example 2",
    content: (
        <div className="space-y-3 p-6 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors h-full">
            <h3 className="text-xl font-semibold">Pendulum Motion</h3>
            <div className="rounded-lg overflow-hidden">
                <AnimatedGraph
                    variant="pendulum"
                    color="#8B5CF6"
                    secondaryColor="#EC4899"
                    width={300}
                    height={250}
                    showAxes={false}
                />
            </div>
            <p className="text-sm text-muted-foreground">
                Physics simulation of harmonic motion
            </p>
        </div>
    ),
};

export const gridDemoSection3 = {
    id: "grid-demo-3",
    title: "Grid Example 3",
    content: (
        <div className="space-y-3 p-6 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors h-full">
            <h3 className="text-xl font-semibold">Lissajous Curve</h3>
            <div className="rounded-lg overflow-hidden">
                <AnimatedGraph
                    variant="lissajous"
                    color="#06B6D4"
                    secondaryColor="#3B82F6"
                    width={300}
                    height={250}
                    showAxes={false}
                    showGrid={true}
                />
            </div>
            <p className="text-sm text-muted-foreground">
                Complex patterns from perpendicular oscillations
            </p>
        </div>
    ),
};

export const sidebarDemoSidebarSection = {
    id: "sidebar-demo-sidebar",
    title: "Key Concepts",
    content: (
        <div className="space-y-6 p-6 rounded-lg bg-card border border-border">
            <div>
                <h3 className="text-lg font-semibold mb-3">📚 Vocabulary</h3>
                <div className="space-y-3">
                    <div>
                        <p className="font-medium text-sm">Frequency</p>
                        <p className="text-xs text-muted-foreground">Number of oscillations per unit time</p>
                    </div>
                    <div>
                        <p className="font-medium text-sm">Amplitude</p>
                        <p className="text-xs text-muted-foreground">Maximum displacement from equilibrium</p>
                    </div>
                    <div>
                        <p className="font-medium text-sm">Phase</p>
                        <p className="text-xs text-muted-foreground">Position in the wave cycle</p>
                    </div>
                </div>
            </div>
            <div>
                <h3 className="text-lg font-semibold mb-3">🔗 Related Topics</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Fourier Analysis</li>
                    <li>• Wave Equations</li>
                    <li>• Signal Processing</li>
                </ul>
            </div>
        </div>
    ),
};

export const sidebarDemoMainSection = {
    id: "sidebar-demo-main",
    title: "Main Content",
    content: (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold">Fourier Series Deep Dive</h2>
            <p className="text-muted-foreground leading-relaxed">
                Fourier series allow us to represent periodic functions as sums of simple sine
                and cosine waves. This powerful mathematical tool has applications across physics,
                engineering, and signal processing.
            </p>
            <div className="rounded-lg overflow-hidden bg-background">
                <AnimatedGraph
                    variant="fourier"
                    color="#F59E0B"
                    secondaryColor="#EF4444"
                    width={600}
                    height={400}
                    showAxes={true}
                    showGrid={true}
                />
            </div>
            <p className="text-muted-foreground leading-relaxed">
                The visualization above shows how multiple sine waves (epicycles) combine to
                approximate complex waveforms. As we add more terms to the Fourier series,
                the approximation becomes more accurate.
            </p>
            <div className="p-4 rounded-lg bg-muted/50 border border-border">
                <p className="text-sm font-medium mb-2">💡 Key Insight</p>
                <p className="text-sm text-muted-foreground">
                    Any periodic function can be decomposed into a sum of sines and cosines
                    with different frequencies and amplitudes. This is the foundation of
                    modern signal analysis and digital communication.
                </p>
            </div>
        </div>
    ),
};


