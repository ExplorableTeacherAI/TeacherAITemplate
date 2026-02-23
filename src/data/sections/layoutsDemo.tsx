import { type ReactElement } from "react";
import { Block } from "@/components/templates";
import {
    FullWidthLayout,
    SplitLayout,
    GridLayout,
    ScrollytellingLayout,
    ScrollStep,
    ScrollVisual,
} from "@/components/layouts";
import {
    EditableH1,
    EditableH2,
    EditableH3,
    EditableParagraph,
    AnimatedGraph,
    MafsInteractive,
    InlineScrubbleNumber,
    InlineTrigger,
} from "@/components/atoms";
import { useVar, useSetVar } from "@/stores";
import { getExampleVariableInfo, numberPropsFromDefinition } from "../exampleVariables";

// ─── Reactive visual for SplitLayout demo ────────────────────────────────────
function ReactiveSineWave() {
    const amp = useVar("amplitude", 1) as number;
    const freq = useVar("frequency", 1) as number;
    const setVar = useSetVar();
    return (
        <MafsInteractive
            amplitude={amp}
            frequency={freq}
            onAmplitudeChange={(v) => setVar("amplitude", v)}
            onFrequencyChange={(v) => setVar("frequency", v)}
        />
    );
}

// ─── Reactive visual for ScrollytellingLayout demo ────────────────────────────
const SCROLL_VARIANTS = ["sine-wave", "parametric", "fourier", "lissajous"] as const;
const SCROLL_COLORS = [
    { color: "#10B981", secondary: "#3B82F6" },
    { color: "#EC4899", secondary: "#F59E0B" },
    { color: "#F59E0B", secondary: "#EF4444" },
    { color: "#06B6D4", secondary: "#8B5CF6" },
];

function ScrollViz() {
    const step = useVar("layoutDemoStep", 0) as number;
    const idx = Math.min(Math.max(0, step), SCROLL_VARIANTS.length - 1);
    return (
        <div className="rounded-2xl overflow-hidden border border-border bg-card p-4 flex flex-col gap-3">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Step {idx + 1} of {SCROLL_VARIANTS.length}
            </div>
            <div className="rounded-xl overflow-hidden">
                <AnimatedGraph
                    key={idx}
                    variant={SCROLL_VARIANTS[idx]}
                    color={SCROLL_COLORS[idx].color}
                    secondaryColor={SCROLL_COLORS[idx].secondary}
                    width={480}
                    height={340}
                    showAxes={true}
                    showGrid={false}
                />
            </div>
            <div className="flex gap-1.5 justify-center">
                {SCROLL_VARIANTS.map((_, i) => (
                    <div
                        key={i}
                        className={`w-2 h-2 rounded-full transition-all ${i === idx ? "bg-primary scale-125" : "bg-muted-foreground/30"}`}
                    />
                ))}
            </div>
        </div>
    );
}

// ─── Layout Demo Blocks ───────────────────────────────────────────────────────
export const layoutsDemoBlocks: ReactElement[] = [

    // ── Section title ──────────────────────────────────────────────────────────
    <FullWidthLayout key="layout-demo-title" maxWidth="xl">
        <Block id="block-demo-title" padding="md">
            <EditableH1 id="h1-demo-title" blockId="block-demo-title">
                Layout Showcase
            </EditableH1>
        </Block>
    </FullWidthLayout>,

    <FullWidthLayout key="layout-demo-intro" maxWidth="xl">
        <Block id="block-demo-intro" padding="sm">
            <EditableParagraph id="para-demo-intro" blockId="block-demo-intro">
                This page demonstrates the four available layouts: FullWidthLayout, SplitLayout,
                GridLayout, and ScrollytellingLayout. Each is shown with live interactive content.
            </EditableParagraph>
        </Block>
    </FullWidthLayout>,

    // ── 1. FullWidthLayout ──────────────────────────────────────────────────
    <FullWidthLayout key="layout-demo-fw-heading" maxWidth="xl">
        <Block id="block-demo-fw-heading" padding="md">
            <EditableH2 id="h2-demo-fw" blockId="block-demo-fw-heading">
                1 · FullWidthLayout
            </EditableH2>
        </Block>
    </FullWidthLayout>,

    <FullWidthLayout key="layout-demo-fw-desc" maxWidth="xl">
        <Block id="block-demo-fw-desc" padding="sm">
            <EditableParagraph id="para-demo-fw-desc" blockId="block-demo-fw-desc">
                FullWidthLayout centres its single child with an optional max-width constraint.
                Use it for headings, prose paragraphs, and wide visualizations. Available
                max-widths are <strong>sm, md, lg, xl, 2xl, full</strong>.
            </EditableParagraph>
        </Block>
    </FullWidthLayout>,

    <FullWidthLayout key="layout-demo-fw-viz" maxWidth="2xl">
        <Block id="block-demo-fw-viz" padding="sm">
            <div className="rounded-2xl overflow-hidden border border-border">
                <AnimatedGraph
                    variant="fourier"
                    color="#F59E0B"
                    secondaryColor="#EF4444"
                    width={900}
                    height={260}
                    showAxes={true}
                    showGrid={true}
                />
            </div>
        </Block>
    </FullWidthLayout>,

    // ── 2. SplitLayout ──────────────────────────────────────────────────────
    <FullWidthLayout key="layout-demo-split-heading" maxWidth="xl">
        <Block id="block-demo-split-heading" padding="md">
            <EditableH2 id="h2-demo-split" blockId="block-demo-split-heading">
                2 · SplitLayout
            </EditableH2>
        </Block>
    </FullWidthLayout>,

    <SplitLayout key="layout-demo-split" ratio="1:1" gap="lg" align="center">
        <div className="space-y-4">
            <Block id="block-demo-split-text" padding="sm">
                <EditableParagraph id="para-demo-split-text" blockId="block-demo-split-text">
                    SplitLayout places two children side-by-side. Here the amplitude is{" "}
                    <InlineScrubbleNumber
                        varName="amplitude"
                        {...numberPropsFromDefinition(getExampleVariableInfo("amplitude"))}
                    />{" "}
                    and the frequency is{" "}
                    <InlineScrubbleNumber
                        varName="frequency"
                        {...numberPropsFromDefinition(getExampleVariableInfo("frequency"))}
                    />. Drag the numbers or drag the points on the graph — they stay in sync.
                </EditableParagraph>
            </Block>
            <Block id="block-demo-split-reset" padding="sm">
                <EditableParagraph id="para-demo-split-reset" blockId="block-demo-split-reset">
                    Reset to defaults:{" "}
                    <InlineTrigger varName="amplitude" value={1} icon="refresh">amplitude = 1</InlineTrigger>{" "}
                    ·{" "}
                    <InlineTrigger varName="frequency" value={1} icon="refresh">frequency = 1</InlineTrigger>
                </EditableParagraph>
            </Block>
        </div>
        <Block id="block-demo-split-viz" padding="sm">
            <ReactiveSineWave />
        </Block>
    </SplitLayout>,

    // ── 3. GridLayout ──────────────────────────────────────────────────────
    <FullWidthLayout key="layout-demo-grid-heading" maxWidth="xl">
        <Block id="block-demo-grid-heading" padding="md">
            <EditableH2 id="h2-demo-grid" blockId="block-demo-grid-heading">
                3 · GridLayout
            </EditableH2>
        </Block>
    </FullWidthLayout>,

    <FullWidthLayout key="layout-demo-grid-desc" maxWidth="xl">
        <Block id="block-demo-grid-desc" padding="sm">
            <EditableParagraph id="para-demo-grid-desc" blockId="block-demo-grid-desc">
                GridLayout arranges children in an equal-column grid (2–6 columns). It
                automatically collapses to fewer columns on smaller screens.
            </EditableParagraph>
        </Block>
    </FullWidthLayout>,

    <GridLayout key="layout-demo-grid" columns={3} gap="md">
        <Block id="block-demo-grid-1" padding="sm">
            <div className="space-y-3 rounded-xl border border-border bg-card p-4 h-full">
                <EditableH3 id="h3-demo-grid-1" blockId="block-demo-grid-1">Parametric Rose</EditableH3>
                <div className="rounded-lg overflow-hidden">
                    <AnimatedGraph variant="parametric" color="#EC4899" secondaryColor="#F59E0B" width={300} height={220} showAxes={false} showGrid={false} />
                </div>
                <EditableParagraph id="para-demo-grid-1" blockId="block-demo-grid-1">
                    Patterns from parametric equations.
                </EditableParagraph>
            </div>
        </Block>
        <Block id="block-demo-grid-2" padding="sm">
            <div className="space-y-3 rounded-xl border border-border bg-card p-4 h-full">
                <EditableH3 id="h3-demo-grid-2" blockId="block-demo-grid-2">Pendulum Motion</EditableH3>
                <div className="rounded-lg overflow-hidden">
                    <AnimatedGraph variant="pendulum" color="#8B5CF6" secondaryColor="#EC4899" width={300} height={220} showAxes={false} />
                </div>
                <EditableParagraph id="para-demo-grid-2" blockId="block-demo-grid-2">
                    Physics simulation of harmonic motion.
                </EditableParagraph>
            </div>
        </Block>
        <Block id="block-demo-grid-3" padding="sm">
            <div className="space-y-3 rounded-xl border border-border bg-card p-4 h-full">
                <EditableH3 id="h3-demo-grid-3" blockId="block-demo-grid-3">Lissajous Curve</EditableH3>
                <div className="rounded-lg overflow-hidden">
                    <AnimatedGraph variant="lissajous" color="#06B6D4" secondaryColor="#3B82F6" width={300} height={220} showAxes={false} showGrid={true} />
                </div>
                <EditableParagraph id="para-demo-grid-3" blockId="block-demo-grid-3">
                    Patterns from perpendicular oscillations.
                </EditableParagraph>
            </div>
        </Block>
    </GridLayout>,

    // ── 4. ScrollytellingLayout ────────────────────────────────────────────
    <FullWidthLayout key="layout-demo-scroll-heading" maxWidth="xl">
        <Block id="block-demo-scroll-heading" padding="md">
            <EditableH2 id="h2-demo-scroll" blockId="block-demo-scroll-heading">
                4 · ScrollytellingLayout
            </EditableH2>
        </Block>
    </FullWidthLayout>,

    <FullWidthLayout key="layout-demo-scroll-desc" maxWidth="xl">
        <Block id="block-demo-scroll-desc" padding="sm">
            <EditableParagraph id="para-demo-scroll-desc" blockId="block-demo-scroll-desc">
                ScrollytellingLayout keeps a visualization sticky on one side while text steps
                scroll past on the other. The active step index is written to a global variable
                so the visual can react. Scroll through the steps below to see it in action.
            </EditableParagraph>
        </Block>
    </FullWidthLayout>,

    <ScrollytellingLayout key="layout-demo-scrolly" varName="layoutDemoStep" visualPosition="right" gap="lg">
        <ScrollStep>
            <Block id="block-scroll-step-0" padding="sm">
                <EditableH3 id="h3-scroll-step-0" blockId="block-scroll-step-0">Step 1 · Sine Wave</EditableH3>
                <EditableParagraph id="para-scroll-step-0" blockId="block-scroll-step-0">
                    The sine wave is the most fundamental periodic function. It describes
                    smooth oscillations and appears everywhere in nature — from ocean waves
                    to electrical signals. Its shape is completely determined by amplitude,
                    frequency, and phase.
                </EditableParagraph>
            </Block>
        </ScrollStep>
        <ScrollStep>
            <Block id="block-scroll-step-1" padding="sm">
                <EditableH3 id="h3-scroll-step-1" blockId="block-scroll-step-1">Step 2 · Parametric Curves</EditableH3>
                <EditableParagraph id="para-scroll-step-1" blockId="block-scroll-step-1">
                    When two periodic functions drive the x and y axes simultaneously, the
                    result is a parametric curve. Changing the frequency ratio between the
                    two oscillations produces the characteristic petal shapes of a rose curve.
                </EditableParagraph>
            </Block>
        </ScrollStep>
        <ScrollStep>
            <Block id="block-scroll-step-2" padding="sm">
                <EditableH3 id="h3-scroll-step-2" blockId="block-scroll-step-2">Step 3 · Fourier Series</EditableH3>
                <EditableParagraph id="para-scroll-step-2" blockId="block-scroll-step-2">
                    Any periodic function can be reconstructed by summing sine waves of
                    different frequencies — this is the Fourier series. The visualization
                    shows rotating epicycles tracing out a complex waveform. Adding more
                    terms increases the accuracy of the approximation.
                </EditableParagraph>
            </Block>
        </ScrollStep>
        <ScrollStep>
            <Block id="block-scroll-step-3" padding="sm">
                <EditableH3 id="h3-scroll-step-3" blockId="block-scroll-step-3">Step 4 · Lissajous Figures</EditableH3>
                <EditableParagraph id="para-scroll-step-3" blockId="block-scroll-step-3">
                    Lissajous figures emerge when two sinusoidal signals with a fixed frequency
                    ratio are plotted against each other. Simple integer ratios produce closed
                    curves; irrational ratios produce curves that never quite close, filling the
                    available space over time.
                </EditableParagraph>
            </Block>
        </ScrollStep>
        <ScrollVisual>
            <ScrollViz />
        </ScrollVisual>
    </ScrollytellingLayout>,
];


