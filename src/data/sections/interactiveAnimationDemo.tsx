import { InteractiveAnimation } from "@/components/organisms";

export const interactiveAnimationDemoSection = {
    id: "interactive-animation-demo",
    title: "Interactive Mathematical Visualizations",
    content: (
        <InteractiveAnimation
            type="graph"
            initialVariant="sine-wave"
            title="Sine Wave Visualization"
            description="Explore the sine wave - adjust speed, toggle axes/grid, and change colors"
            width={700}
            height={400}
        />
    ),
};
