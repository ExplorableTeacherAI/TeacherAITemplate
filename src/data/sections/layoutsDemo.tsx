import { type ReactElement } from "react";
import { Block } from "@/components/templates";
import {
    StackLayout,
    SplitLayout,
    GridLayout,
    ScrollytellingLayout,
    ScrollStep,
    ScrollVisual,
    SlideLayout,
    Slide,
    StepLayout,
    Step,
} from "@/components/layouts";
import {
    EditableH1,
    EditableH2,
    EditableH3,
    EditableParagraph,
    AnimatedGraph,
    MafsInteractive,
    InlineScrubbleNumber,
    InlineClozeInput,
    InlineTrigger,
    InlineTooltip,
    InlineFormula,
    EditableH4,
} from "@/components/atoms";
import { useVar, useSetVar } from "@/stores";
import { getExampleVariableInfo, numberPropsFromDefinition, clozePropsFromDefinition } from "../exampleVariables";

// ─── Reactive visual for StepLayout demo ────────────────────────────────────
function ReactiveStepViz() {
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

// ─── Reactive visual for SlideLayout demo ────────────────────────────────────
const SLIDE_VARIANTS = ["sine-wave", "parametric", "pendulum", "lissajous"] as const;
const SLIDE_COLORS = [
    { color: "#3B82F6", secondary: "#8B5CF6" },
    { color: "#EC4899", secondary: "#F59E0B" },
    { color: "#10B981", secondary: "#06B6D4" },
    { color: "#F59E0B", secondary: "#EF4444" },
];

function SlideViz() {
    const idx = useVar("slideIndex", 0) as number;
    const safeIdx = Math.min(Math.max(0, idx), SLIDE_VARIANTS.length - 1);
    return (
        <div className="rounded-xl overflow-hidden">
            <AnimatedGraph
                key={safeIdx}
                variant={SLIDE_VARIANTS[safeIdx]}
                color={SLIDE_COLORS[safeIdx].color}
                secondaryColor={SLIDE_COLORS[safeIdx].secondary}
                width={420}
                height={260}
                showAxes={true}
                showGrid={false}
            />
        </div>
    );
}

// ─── Reactive visual for StackLayout demo ───────────────────────────────────
function ReactiveStackViz() {
    const speed = useVar("animationSpeed", 1) as number;
    return (
        <div className="rounded-2xl overflow-hidden">
            <AnimatedGraph
                variant="fourier"
                color="#F59E0B"
                secondaryColor="#EF4444"
                width={900}
                height={260}
                showAxes={true}
                showGrid={true}
                speed={speed}
            />
        </div>
    );
}

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
        <div className="rounded-2xl overflow-hidden bg-card p-4 flex flex-col gap-3">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Step {idx + 1} of {SCROLL_VARIANTS.length}
            </div>
            <div className="rounded-xl overflow-hidden">
                <Block id="scrollviz-animated-graph" padding="none" hasVisualization>
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
                </Block>
            </div>
            <div className="flex gap-1.5 justify-center">
                {SCROLL_VARIANTS.map((_, i) => (
                    <div
                        key={i}
                        className={`w-2 h-2 rounded-full transition-all ${i === idx ? "w-6 bg-[#3cc499] scale-125" : "bg-[#3cc499]/25"}`}
                    />
                ))}
            </div>
        </div>
    );
}

// ─── Layout Demo Blocks ───────────────────────────────────────────────────────
export const layoutsDemoBlocks: ReactElement[] = [

    // ── Section title ──────────────────────────────────────────────────────────
    <StackLayout key="layout-demo-title" maxWidth="xl">
        <Block id="demo-title" padding="md">
            <EditableH3 id="h3-demo-title" blockId="demo-title">
                Layouts
            </EditableH3>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-demo-intro" maxWidth="xl">
        <Block id="demo-intro" padding="sm">
            <EditableParagraph id="para-demo-intro" blockId="demo-intro">
                This page demonstrates the six available layouts: StackLayout, SplitLayout,
                GridLayout, ScrollytellingLayout, SlideLayout, and StepLayout. Each is shown
                with live interactive content.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // ── 1. StackLayout ──────────────────────────────────────────────────

    <StackLayout key="layout-demo-full-width-heading" maxWidth="xl">
        <Block id="demo-full-width-heading" padding="md">
            <EditableH4 id="h4-demo-fw" blockId="demo-full-width-heading">
                StackLayout
            </EditableH4>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-demo-full-width-desc" maxWidth="xl">
        <Block id="demo-full-width-desc" padding="sm">
            <EditableParagraph id="para-demo-full-width-desc" blockId="demo-full-width-desc">
                StackLayout centres its single child with an optional max-width constraint.
                Use it for headings, prose paragraphs, and wide visualizations. Available
                max-widths are <strong>sm, md, lg, xl, 2xl, full</strong>. The animation
                speed is{" "}
                <InlineScrubbleNumber
                    varName="animationSpeed"
                    {...numberPropsFromDefinition(getExampleVariableInfo("animationSpeed"))}
                />{" "}
                &mdash; drag the number to change it, or{" "}
                <InlineTrigger varName="animationSpeed" value={1} icon="refresh">reset to 1</InlineTrigger>.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-demo-full-width-viz" maxWidth="2xl">
        <Block id="demo-full-width-viz" padding="sm" hasVisualization>
            <ReactiveStackViz />
        </Block>
    </StackLayout>,

    // ── 2. SplitLayout ──────────────────────────────────────────────────────
    <StackLayout key="layout-demo-split-heading" maxWidth="xl">
        <Block id="demo-split-heading" padding="md">
            <EditableH4 id="h4-demo-split" blockId="demo-split-heading">
                SplitLayout
            </EditableH4>
        </Block>
    </StackLayout>,

    <SplitLayout key="layout-demo-split" ratio="1:1" gap="lg" align="center">
        <div className="space-y-4">
            <Block id="demo-split-text" padding="sm">
                <EditableParagraph id="para-demo-split-text" blockId="demo-split-text">
                    SplitLayout places two children side-by-side. Here the amplitude is{" "}
                    <InlineScrubbleNumber
                        varName="amplitude"
                        {...numberPropsFromDefinition(getExampleVariableInfo("amplitude"))}
                    />{" "}
                    and the frequency is{" "}
                    <InlineScrubbleNumber
                        varName="frequency"
                        {...numberPropsFromDefinition(getExampleVariableInfo("frequency"))}
                    />. Drag the numbers or drag the points on the graph, and they stay in sync.
                </EditableParagraph>
            </Block>
            <Block id="demo-split-reset" padding="sm">
                <EditableParagraph id="para-demo-split-reset" blockId="demo-split-reset">
                    Reset to defaults:{" "}
                    <InlineTrigger varName="amplitude" value={1} icon="refresh">amplitude = 1</InlineTrigger>{" "}
                    ·{" "}
                    <InlineTrigger varName="frequency" value={1} icon="refresh">frequency = 1</InlineTrigger>
                </EditableParagraph>
            </Block>
        </div>
        <Block id="demo-split-viz" padding="sm" hasVisualization>
            <ReactiveSineWave />
        </Block>
    </SplitLayout>,

    // ── 3. GridLayout ──────────────────────────────────────────────────────
    <StackLayout key="layout-demo-grid-heading" maxWidth="xl">
        <Block id="demo-grid-heading" padding="md">
            <EditableH4 id="h4-demo-grid" blockId="demo-grid-heading">
                GridLayout
            </EditableH4>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-demo-grid-desc" maxWidth="xl">
        <Block id="demo-grid-desc" padding="sm">
            <EditableParagraph id="para-demo-grid-desc" blockId="demo-grid-desc">
                <InlineTooltip tooltip="GridLayout divides the row into equal-width columns. Use the columns prop (2–6) to control how many fit per row.">
                    GridLayout
                </InlineTooltip>{" "}
                arranges children in an equal-column grid (2–6 columns). It automatically
                collapses to fewer columns on smaller screens. Each card below shows a different{" "}
                <InlineTooltip tooltip="A periodic function repeats its values at regular intervals. Sine, cosine, and their combinations are the most common examples.">
                    periodic waveform
                </InlineTooltip>.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <GridLayout key="layout-demo-grid" columns={3} gap="md">
        <div className="space-y-3 rounded-xl bg-card p-4 h-full">
            <Block id="demo-grid-1-title" padding="none">
                <EditableH3 id="h3-demo-grid-1" blockId="demo-grid-1-title">Parametric Rose</EditableH3>
            </Block>
            <Block id="demo-grid-1-viz" padding="none" hasVisualization>
                <AnimatedGraph variant="parametric" color="#EC4899" secondaryColor="#F59E0B" width={300} height={220} showAxes={false} showGrid={false} />
            </Block>
            <Block id="demo-grid-1-desc" padding="none">
                <EditableParagraph id="para-demo-grid-1" blockId="demo-grid-1-desc">
                    Patterns from{" "}
                    <InlineTooltip tooltip="Parametric equations define x and y independently as functions of a third variable t. Varying t traces out a curve in 2D space, and the curve can loop back on itself.">
                        parametric equations
                    </InlineTooltip>.
                    Two sinusoids with a frequency ratio produce characteristic petal shapes.
                </EditableParagraph>
            </Block>
        </div>
        <div className="space-y-3 rounded-xl bg-card p-4 h-full">
            <Block id="demo-grid-2-title" padding="none">
                <EditableH3 id="h3-demo-grid-2" blockId="demo-grid-2-title">Pendulum Motion</EditableH3>
            </Block>
            <Block id="demo-grid-2-viz" padding="none" hasVisualization>
                <AnimatedGraph variant="pendulum" color="#8B5CF6" secondaryColor="#EC4899" width={300} height={220} showAxes={false} />
            </Block>
            <Block id="demo-grid-2-desc" padding="none">
                <EditableParagraph id="para-demo-grid-2" blockId="demo-grid-2-desc">
                    Physics simulation of{" "}
                    <InlineTooltip tooltip="Simple harmonic motion occurs when the restoring force is proportional to displacement. A pendulum approximates this for small angles.">
                        simple harmonic motion
                    </InlineTooltip>
                    {" "}governed by{" "}
                    <InlineFormula latex="\theta(t) = A\cos(\omega t + \phi)" colorMap={{ A: "#8B5CF6", omega: "#EC4899" }} />.
                </EditableParagraph>
            </Block>
        </div>
        <div className="space-y-3 rounded-xl bg-card p-4 h-full">
            <Block id="demo-grid-3-title" padding="none">
                <EditableH3 id="h3-demo-grid-3" blockId="demo-grid-3-title">Lissajous Curve</EditableH3>
            </Block>
            <Block id="demo-grid-3-viz" padding="none" hasVisualization>
                <AnimatedGraph variant="lissajous" color="#06B6D4" secondaryColor="#3B82F6" width={300} height={220} showAxes={false} showGrid={true} />
            </Block>
            <Block id="demo-grid-3-desc" padding="none">
                <EditableParagraph id="para-demo-grid-3" blockId="demo-grid-3-desc">
                    Patterns from{" "}
                    <InlineTooltip tooltip="A Lissajous figure is the graph of (A·sin(at+δ), B·sin(bt)). Integer frequency ratios a:b produce closed, repeating curves; irrational ratios never close.">
                        perpendicular oscillations
                    </InlineTooltip>
                    {" "}with a fixed{" "}
                    <InlineFormula latex="f_x : f_y" colorMap={{ fx: "#06B6D4", fy: "#3B82F6" }} />{" "}
                    frequency ratio.
                </EditableParagraph>
            </Block>
        </div>
    </GridLayout>,

    // ── 4. ScrollytellingLayout ────────────────────────────────────────────
    <StackLayout key="layout-demo-scroll-heading" maxWidth="xl">
        <Block id="demo-scroll-heading" padding="md">
            <EditableH4 id="h4-demo-scroll" blockId="demo-scroll-heading">
                ScrollytellingLayout
            </EditableH4>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-demo-scroll-desc" maxWidth="xl">
        <Block id="demo-scroll-desc" padding="sm">
            <EditableParagraph id="para-demo-scroll-desc" blockId="demo-scroll-desc">
                <InlineTooltip tooltip="ScrollytellingLayout pins a visual to one side of the screen while text steps scroll into view on the other side. Each step can trigger changes in the pinned visual.">
                    ScrollytellingLayout
                </InlineTooltip>{" "}
                keeps a visualization{" "}
                <InlineTooltip tooltip="The sticky element stays fixed in the viewport as the user scrolls, so it remains visible while the narrative text moves past it.">
                    sticky
                </InlineTooltip>{" "}
                on one side while text steps scroll past on the other. The active step index is
                written to a{" "}
                <InlineTooltip tooltip="A global variable is stored in the Zustand variable store and is accessible from any component on the page, including the sticky visual.">
                    global variable
                </InlineTooltip>{" "}
                so the visual can react. Scroll through the steps below to see it in action.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <ScrollytellingLayout key="layout-demo-scrolly" varName="layoutDemoStep" visualPosition="right" gap="lg">
        <ScrollStep>
            <div className="space-y-4">
                <Block id="scroll-step-0-title" padding="sm">
                    <EditableH3 id="h3-scroll-step-0" blockId="scroll-step-0-title">Step 1 · Sine Wave</EditableH3>
                </Block>
                <Block id="scroll-step-0-body" padding="sm">
                    <EditableParagraph id="para-scroll-step-0" blockId="scroll-step-0-body">
                        The{" "}
                        <InlineTooltip tooltip="A sine wave is a smooth, periodic oscillation. It is the simplest waveform and the building block of all periodic signals via the Fourier theorem.">
                            sine wave
                        </InlineTooltip>{" "}
                        is the most fundamental{" "}
                        <InlineTooltip tooltip="A periodic function repeats its pattern exactly every T seconds, where T = 1/f is the period and f is the frequency.">
                            periodic function
                        </InlineTooltip>. Its shape is fully described by{" "}
                        <InlineFormula
                            latex="y = \clr{A}{A}\sin(2\pi \clr{f}{f}\,t + \clr{phi}{\phi})"
                            colorMap={{ A: "#10B981", f: "#3B82F6", phi: "#F59E0B" }}
                        />{" "}
                        where <InlineFormula latex="\clr{A}{A}" colorMap={{ A: "#10B981" }} /> is amplitude,{" "}
                        <InlineFormula latex="\clr{f}{f}" colorMap={{ f: "#3B82F6" }} /> is frequency, and{" "}
                        <InlineFormula latex="\clr{phi}{\phi}" colorMap={{ phi: "#F59E0B" }} /> is phase.
                    </EditableParagraph>
                </Block>
            </div>
        </ScrollStep>
        <ScrollStep>
            <div className="space-y-4">
                <Block id="scroll-step-1-title" padding="sm">
                    <EditableH3 id="h3-scroll-step-1" blockId="scroll-step-1-title">Step 2 · Parametric Curves</EditableH3>
                </Block>
                <Block id="scroll-step-1-body" padding="sm">
                    <EditableParagraph id="para-scroll-step-1" blockId="scroll-step-1-body">
                        When two periodic functions drive the <InlineFormula latex="x" /> and{" "}
                        <InlineFormula latex="y" /> axes simultaneously, the result is a{" "}
                        <InlineTooltip tooltip="A parametric curve defines position as (x(t), y(t)) where both coordinates are functions of an independent parameter t. Unlike y=f(x), a parametric curve can loop back on itself.">
                            parametric curve
                        </InlineTooltip>. The{" "}
                        <InlineTooltip tooltip="The frequency ratio determines how many petals the rose curve has. A ratio of p:q (in lowest terms) produces p or 2p petals depending on whether p+q is odd or even.">
                            frequency ratio
                        </InlineTooltip>{" "}
                        between the two oscillations produces the characteristic petal shapes of a{" "}
                        <InlineTooltip tooltip="A rose curve (rhodonea) has the polar form r = cos(kθ). Its Cartesian parametric form is x = cos(kt)·cos(t), y = cos(kt)·sin(t).">
                            rose curve
                        </InlineTooltip>.
                    </EditableParagraph>
                </Block>
            </div>
        </ScrollStep>
        <ScrollStep>
            <div className="space-y-4">
                <Block id="scroll-step-2-title" padding="sm">
                    <EditableH3 id="h3-scroll-step-2" blockId="scroll-step-2-title">Step 3 · Fourier Series</EditableH3>
                </Block>
                <Block id="scroll-step-2-body" padding="sm">
                    <EditableParagraph id="para-scroll-step-2" blockId="scroll-step-2-body">
                        Any periodic function can be reconstructed by summing sine waves of
                        different frequencies. This is the{" "}
                        <InlineTooltip tooltip="The Fourier series decomposes any periodic function into a sum of sines and cosines. Joseph Fourier proved in 1822 that even discontinuous functions can be represented this way.">
                            Fourier series
                        </InlineTooltip>:{" "}
                        <InlineFormula
                            latex="f(t) = \sum_{n=1}^{\infty} \clr{a}{a_n}\cos(2\pi n t) + \clr{b}{b_n}\sin(2\pi n t)"
                            colorMap={{ a: "#F59E0B", b: "#EF4444" }}
                        />.{" "}
                        The visualization shows rotating{" "}
                        <InlineTooltip tooltip="An epicycle is a small circle whose centre moves along the circumference of a larger circle. Fourier series can be visualised as nested epicycles, each adding a new frequency component.">
                            epicycles
                        </InlineTooltip>{" "}
                        tracing out a complex waveform. Adding more terms increases accuracy.
                    </EditableParagraph>
                </Block>
            </div>
        </ScrollStep>
        <ScrollStep>
            <div className="space-y-4">
                <Block id="scroll-step-3-title" padding="sm">
                    <EditableH3 id="h3-scroll-step-3" blockId="scroll-step-3-title">Step 4 · Lissajous Figures</EditableH3>
                </Block>
                <Block id="scroll-step-3-body" padding="sm">
                    <EditableParagraph id="para-scroll-step-3" blockId="scroll-step-3-body">
                        <InlineTooltip tooltip="Jules Antoine Lissajous first studied these figures in 1857. They appear on oscilloscopes when comparing two AC signals and are used to measure frequency ratios.">
                            Lissajous figures
                        </InlineTooltip>{" "}
                        are defined by{" "}
                        <InlineFormula
                            latex="\clr{x}{x}=A\sin(\clr{a}{a}\,t+\delta),\;\clr{y}{y}=B\sin(\clr{b}{b}\,t)"
                            colorMap={{ x: "#06B6D4", y: "#3B82F6", a: "#F59E0B", b: "#EF4444" }}
                        />.{" "}
                        Simple integer{" "}
                        <InlineTooltip tooltip="When a:b is a ratio of small integers (e.g. 1:2, 3:4), the curve closes after a finite number of oscillations. An irrational ratio like 1:√2 never closes.">
                            frequency ratios
                        </InlineTooltip>{" "}
                        <InlineFormula latex="\clr{a}{a}:\clr{b}{b}" colorMap={{ a: "#F59E0B", b: "#EF4444" }} />{" "}
                        produce closed curves; irrational ratios produce curves that never quite close.
                    </EditableParagraph>
                </Block>
            </div>
        </ScrollStep>
        <ScrollVisual>
            <ScrollViz />
        </ScrollVisual>
    </ScrollytellingLayout>,

    // ── 5. SlideLayout ─────────────────────────────────────────────────────
    <StackLayout key="layout-demo-slide-heading" maxWidth="xl">
        <Block id="demo-slide-heading" padding="md">
            <EditableH4 id="h4-demo-slide" blockId="demo-slide-heading">
                SlideLayout
            </EditableH4>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-demo-slide-desc" maxWidth="xl">
        <Block id="demo-slide-desc" padding="sm">
            <EditableParagraph id="para-demo-slide-desc" blockId="demo-slide-desc">
                <InlineTooltip tooltip="SlideLayout renders one slide at a time inside a card stage. Navigate with the ← → arrows, clickable dot indicators, or the keyboard arrow keys.">
                    SlideLayout
                </InlineTooltip>{" "}
                presents content as a{" "}
                <InlineTooltip tooltip="A slide deck shows one panel at a time with transitions between slides. Each slide can hold any block content: text, formulas, visualizations, or interactive elements.">
                    slide deck
                </InlineTooltip>.
                One slide is visible at a time with smooth transitions. Use keyboard{" "}
                <strong>← / →</strong> to navigate, or click the arrow buttons and dot indicators
                below the stage. The active slide index is written to a{" "}
                <InlineTooltip tooltip="A global variable is stored in the Zustand variable store. Any component on the page can read it with useVar() and react whenever it changes.">
                    global variable
                </InlineTooltip>{" "}
                so external visuals can respond.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-demo-slide-deck" maxWidth="2xl">
        <SlideLayout
            varName="slideIndex"
            height="lg"
            transition="slide"
            showArrows
            arrowPosition="inside"
            showDots
            showCounter
        >
            {/* ── Slide 1: Introduction ── */}
            <Slide>
                <SplitLayout ratio="1:1" gap="lg" align="center">
                    <div className="space-y-4">
                        <Block id="slide-1-title" padding="none">
                            <EditableH2 id="h2-slide-1" blockId="slide-1-title">
                                Waves &amp; Oscillations
                            </EditableH2>
                        </Block>
                        <Block id="slide-1-body" padding="none">
                            <EditableParagraph id="para-slide-1" blockId="slide-1-body">
                                Periodic motion is one of the most fundamental ideas in physics. A{" "}
                                <InlineTooltip tooltip="A wave is a disturbance that transfers energy through a medium without transferring matter. The shape repeats itself in both space (wavelength) and time (period).">
                                    wave
                                </InlineTooltip>{" "}
                                carries energy through space described by{" "}
                                <InlineFormula
                                    latex="y = \clr{A}{A}\sin\!\bigl(2\pi \clr{f}{f}\,t\bigr)"
                                    colorMap={{ A: "#3B82F6", f: "#8B5CF6" }}
                                />.
                                Navigate to the next slide to interact with the parameters.
                            </EditableParagraph>
                        </Block>
                    </div>
                    <Block id="slide-1-viz" padding="none" hasVisualization>
                        <SlideViz />
                    </Block>
                </SplitLayout>
            </Slide>

            {/* ── Slide 2: Amplitude ── */}
            <Slide>
                <SplitLayout ratio="1:1" gap="lg" align="center">
                    <div className="space-y-4">
                        <Block id="slide-2-title" padding="none">
                            <EditableH2 id="h2-slide-2" blockId="slide-2-title">
                                Amplitude
                            </EditableH2>
                        </Block>
                        <Block id="slide-2-body" padding="none">
                            <EditableParagraph id="para-slide-2" blockId="slide-2-body">
                                The{" "}
                                <InlineTooltip tooltip="Amplitude is the maximum displacement from the equilibrium position. Doubling the amplitude quadruples the energy carried by the wave.">
                                    amplitude
                                </InlineTooltip>{" "}
                                <InlineFormula latex="\clr{A}{A}" colorMap={{ A: "#3B82F6" }} />{" "}
                                is currently{" "}
                                <InlineScrubbleNumber
                                    varName="amplitude"
                                    {...numberPropsFromDefinition(getExampleVariableInfo("amplitude"))}
                                />. Drag the number left or right to scale the wave height. Reset
                                with{" "}
                                <InlineTrigger varName="amplitude" value={1} icon="refresh">
                                    amplitude = 1
                                </InlineTrigger>.
                            </EditableParagraph>
                        </Block>
                    </div>
                    <Block id="slide-2-viz" padding="none" hasVisualization>
                        <SlideViz />
                    </Block>
                </SplitLayout>
            </Slide>

            {/* ── Slide 3: Frequency ── */}
            <Slide>
                <SplitLayout ratio="1:1" gap="lg" align="center">
                    <div className="space-y-4">
                        <Block id="slide-3-title" padding="none">
                            <EditableH2 id="h2-slide-3" blockId="slide-3-title">
                                Frequency
                            </EditableH2>
                        </Block>
                        <Block id="slide-3-body" padding="none">
                            <EditableParagraph id="para-slide-3" blockId="slide-3-body">
                                The{" "}
                                <InlineTooltip tooltip="Frequency is the number of complete cycles per second, measured in Hertz (Hz). Higher frequency means faster oscillation and shorter wavelength for the same wave speed.">
                                    frequency
                                </InlineTooltip>{" "}
                                <InlineFormula latex="\clr{f}{f}" colorMap={{ f: "#8B5CF6" }} />{" "}
                                is currently{" "}
                                <InlineScrubbleNumber
                                    varName="frequency"
                                    {...numberPropsFromDefinition(getExampleVariableInfo("frequency"))}
                                />{" "}
                                Hz. The{" "}
                                <InlineTooltip tooltip="The period T = 1/f is the time for one complete cycle. Doubling the frequency halves the period.">
                                    period
                                </InlineTooltip>{" "}
                                is{" "}
                                <InlineFormula latex="T = 1/\clr{f}{f}" colorMap={{ f: "#8B5CF6" }} />.
                                Try{" "}
                                <InlineTrigger varName="frequency" value={3} icon="zap">
                                    triple frequency
                                </InlineTrigger>{" "}
                                or{" "}
                                <InlineTrigger varName="frequency" value={1} icon="refresh">
                                    reset
                                </InlineTrigger>.
                            </EditableParagraph>
                        </Block>
                    </div>
                    <Block id="slide-3-viz" padding="none" hasVisualization>
                        <SlideViz />
                    </Block>
                </SplitLayout>
            </Slide>

            {/* ── Slide 4: Summary ── */}
            <Slide>
                <SplitLayout ratio="1:1" gap="lg" align="center">
                    <div className="space-y-4">
                        <Block id="slide-4-title" padding="none">
                            <EditableH2 id="h2-slide-4" blockId="slide-4-title">
                                Lissajous Patterns
                            </EditableH2>
                        </Block>
                        <Block id="slide-4-body" padding="none">
                            <EditableParagraph id="para-slide-4" blockId="slide-4-body">
                                When two oscillations drive{" "}
                                <InlineFormula latex="x" /> and{" "}
                                <InlineFormula latex="y" /> independently, the result is a{" "}
                                <InlineTooltip tooltip="Lissajous figures appear on oscilloscopes when comparing two AC signals. Simple integer frequency ratios produce closed, repeating curves.">
                                    Lissajous figure
                                </InlineTooltip>{" "}
                                defined by{" "}
                                <InlineFormula
                                    latex="\clr{x}{x}=A\sin(\clr{a}{a}t+\delta),\;\clr{y}{y}=B\sin(\clr{b}{b}t)"
                                    colorMap={{ x: "#F59E0B", y: "#EF4444", a: "#F59E0B", b: "#EF4444" }}
                                />.
                                The shape changes dramatically with the{" "}
                                <InlineTooltip tooltip="The frequency ratio a:b determines how many times the curve crosses each axis. Integer ratios produce closed curves; irrational ratios produce curves that densely fill a rectangle.">
                                    frequency ratio
                                </InlineTooltip>.
                            </EditableParagraph>
                        </Block>
                    </div>
                    <Block id="slide-4-viz" padding="none" hasVisualization>
                        <SlideViz />
                    </Block>
                </SplitLayout>
            </Slide>
        </SlideLayout>
    </StackLayout>,

    // ── 6. StepLayout ──────────────────────────────────────────────────────────
    <StackLayout key="layout-demo-step-heading" maxWidth="xl">
        <Block id="demo-step-heading" padding="md">
            <EditableH4 id="h4-demo-step" blockId="demo-step-heading">
                StepLayout
            </EditableH4>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-demo-step-desc" maxWidth="xl">
        <Block id="demo-step-desc" padding="sm">
            <EditableParagraph id="para-demo-step-desc" blockId="demo-step-desc">
                <InlineTooltip tooltip="StepLayout reveals content one step at a time. Previous steps stay visible above the current one so learners retain context. A Continue button advances to the next step, and question-type steps auto-advance as soon as the correct answer is given.">
                    StepLayout
                </InlineTooltip>{" "}
                guides learners through{" "}
                <InlineTooltip tooltip="Progressive disclosure means showing only as much content as the learner needs at a given moment. This reduces cognitive load and keeps the focus on one idea at a time.">
                    progressively revealed
                </InlineTooltip>.{" "}
                Each step builds on the previous one. Some steps include{" "}
                <InlineTooltip tooltip="A normal step shows a Continue button. A question-type step (autoAdvance) hides the button entirely, and the next step appears automatically the moment the learner types the correct answer.">
                    checkpoint questions
                </InlineTooltip>{" "}
                that must be answered correctly before continuing. Try the lesson below to
                experience how gated progression keeps learners engaged and ensures understanding.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-demo-step-layout" maxWidth="xl">
        <StepLayout
            varName="stepLayoutProgress"
            revealLabel="Continue"
            showProgress={false}
            allowBack
        >
            {/* ── Step 1: Question — auto-advances on correct answer ── */}
            <Step completionVarName="stepPeriodAnswer" correctAnswer="0.5" autoAdvance>
                <Block id="step-demo-4-body" padding="none">
                    <EditableParagraph id="para-step-demo-4" blockId="step-demo-4-body">
                        <strong>Before we start:</strong> if a wave completes{" "}
                        <InlineFormula latex="\clr{f}{2}" colorMap={{ f: "#8B5CF6" }} />{" "}
                        full cycles every second, how long does each single cycle take?{" "}
                        <InlineClozeInput
                            varName="stepPeriodAnswer"
                            correctAnswer="0.5"
                            {...clozePropsFromDefinition(getExampleVariableInfo("stepPeriodAnswer"))}
                        />{" "}
                        seconds. Answer correctly to continue.
                    </EditableParagraph>
                </Block>
            </Step>

            {/* ── Step 2: Introduction ── */}
            <Step>
                <SplitLayout ratio="1:1" gap="lg" align="center">
                    <div className="space-y-4">
                        <Block id="step-demo-1-title" padding="none">
                            <EditableH3 id="h3-step-demo-1" blockId="step-demo-1-title">
                                What is a Sine Wave?
                            </EditableH3>
                        </Block>
                        <Block id="step-demo-1-body" padding="none">
                            <EditableParagraph id="para-step-demo-1" blockId="step-demo-1-body">
                                A{" "}
                                <InlineTooltip tooltip="A sine wave is the smoothest possible oscillation. It is the building block of all periodic signals, and any repeating waveform can be expressed as a sum of sines via the Fourier series.">
                                    sine wave
                                </InlineTooltip>{" "}
                                is a smooth, repeating oscillation described by{" "}
                                <InlineFormula
                                    latex="y = \clr{A}{A}\sin(2\pi\,\clr{f}{f}\,t)"
                                    colorMap={{ A: "#3B82F6", f: "#8B5CF6" }}
                                />. The two key parameters are{" "}
                                <InlineFormula latex="\clr{A}{A}" colorMap={{ A: "#3B82F6" }} />{" "}
                                (amplitude) and{" "}
                                <InlineFormula latex="\clr{f}{f}" colorMap={{ f: "#8B5CF6" }} />{" "}
                                (frequency). Press <strong>Continue</strong> to explore each one.
                            </EditableParagraph>
                        </Block>
                    </div>
                    <Block id="step-demo-1-viz" padding="none" hasVisualization>
                        <ReactiveStepViz />
                    </Block>
                </SplitLayout>
            </Step>

            {/* ── Step 3: Amplitude ── */}
            <Step>
                <SplitLayout ratio="1:1" gap="lg" align="center">
                    <div className="space-y-4">
                        <Block id="step-demo-2-title" padding="none">
                            <EditableH3 id="h3-step-demo-2" blockId="step-demo-2-title">
                                Amplitude
                            </EditableH3>
                        </Block>
                        <Block id="step-demo-2-body" padding="none">
                            <EditableParagraph id="para-step-demo-2" blockId="step-demo-2-body">
                                The{" "}
                                <InlineTooltip tooltip="Amplitude is the maximum displacement from equilibrium. Doubling amplitude quadruples the energy carried by the wave.">
                                    amplitude
                                </InlineTooltip>{" "}
                                <InlineFormula latex="\clr{A}{A}" colorMap={{ A: "#3B82F6" }} />{" "}
                                controls how tall the wave is. Currently it is{" "}
                                <InlineScrubbleNumber
                                    varName="amplitude"
                                    {...numberPropsFromDefinition(getExampleVariableInfo("amplitude"))}
                                />{" "}
                                and you can explore different values using the scrubber, or try{" "}
                                <InlineTrigger varName="amplitude" value={1} icon="refresh">
                                    resetting to 1
                                </InlineTrigger>{" "}
                                or{" "}
                                <InlineTrigger varName="amplitude" value={3} icon="zap">
                                    snapping to 3
                                </InlineTrigger>.
                                Watch the graph update live on the right.
                            </EditableParagraph>
                        </Block>
                    </div>
                    <Block id="step-demo-2-viz" padding="none" hasVisualization>
                        <ReactiveStepViz />
                    </Block>
                </SplitLayout>
            </Step>

            {/* ── Step 4: Amplitude checkpoint ── */}
            <Step completionVarName="stepAmplitudeAnswer" correctAnswer="3" autoAdvance>
                <Block id="step-amp-check" padding="none">
                    <EditableParagraph id="para-step-amp-check" blockId="step-amp-check">
                        <strong>Quick check:</strong> If the amplitude{" "}
                        <InlineFormula latex="\clr{A}{A}" colorMap={{ A: "#3B82F6" }} />{" "}
                        is 3, how tall will the wave be at its peak?{" "}
                        <InlineClozeInput
                            varName="stepAmplitudeAnswer"
                            correctAnswer="3"
                            {...clozePropsFromDefinition(getExampleVariableInfo("stepAmplitudeAnswer"))}
                        />{" "}
                        units. Answer correctly to continue.
                    </EditableParagraph>
                </Block>
            </Step>

            {/* ── Step 5: Frequency ── */}
            <Step>
                <SplitLayout ratio="1:1" gap="lg" align="center">
                    <div className="space-y-4">
                        <Block id="step-demo-3-title" padding="none">
                            <EditableH3 id="h3-step-demo-3" blockId="step-demo-3-title">
                                Frequency &amp; Period
                            </EditableH3>
                        </Block>
                        <Block id="step-demo-3-body" padding="none">
                            <EditableParagraph id="para-step-demo-3" blockId="step-demo-3-body">
                                The{" "}
                                <InlineTooltip tooltip="Frequency is the number of complete cycles per second, measured in Hertz (Hz). A frequency of 1 Hz means one full oscillation every second.">
                                    frequency
                                </InlineTooltip>{" "}
                                <InlineFormula latex="\clr{f}{f}" colorMap={{ f: "#8B5CF6" }} />{" "}
                                controls how fast the wave oscillates. Currently it is{" "}
                                <InlineScrubbleNumber
                                    varName="frequency"
                                    {...numberPropsFromDefinition(getExampleVariableInfo("frequency"))}
                                />{" "}
                                Hz. The{" "}
                                <InlineTooltip tooltip="The period T is the time for one complete cycle. It is the reciprocal of frequency: T = 1/f. A higher frequency means a shorter period.">
                                    period
                                </InlineTooltip>{" "}
                                is related by{" "}
                                <InlineFormula
                                    latex="\clr{T}{T} = 1 / \clr{f}{f}"
                                    colorMap={{ T: "#EC4899", f: "#8B5CF6" }}
                                />.
                            </EditableParagraph>
                        </Block>
                    </div>
                    <Block id="step-demo-3-viz" padding="none" hasVisualization>
                        <ReactiveStepViz />
                    </Block>
                </SplitLayout>
            </Step>

            {/* ── Step 6: Frequency checkpoint ── */}
            <Step completionVarName="stepFrequencyAnswer" correctAnswer="2" autoAdvance>
                <Block id="step-freq-check" padding="none">
                    <EditableParagraph id="para-step-freq-check" blockId="step-freq-check">
                        <strong>Quick check:</strong> If the period{" "}
                        <InlineFormula latex="\clr{T}{T}" colorMap={{ T: "#EC4899" }} />{" "}
                        is 0.5 seconds, what is the frequency{" "}
                        <InlineFormula latex="\clr{f}{f}" colorMap={{ f: "#8B5CF6" }} />{" "}
                        in Hz?{" "}
                        <InlineClozeInput
                            varName="stepFrequencyAnswer"
                            correctAnswer="2"
                            {...clozePropsFromDefinition(getExampleVariableInfo("stepFrequencyAnswer"))}
                        />{" "}
                        Hz. Answer correctly to continue.
                    </EditableParagraph>
                </Block>
            </Step>

            {/* ── Step 7: Conclusion ── */}
            <Step>
                <SplitLayout ratio="1:1" gap="lg" align="center">
                    <div className="space-y-4">
                        <Block id="step-demo-5-title" padding="none">
                            <EditableH3 id="h3-step-demo-5" blockId="step-demo-5-title">
                                Putting It All Together
                            </EditableH3>
                        </Block>
                        <Block id="step-demo-5-body" padding="none">
                            <EditableParagraph id="para-step-demo-5" blockId="step-demo-5-body">
                                Your instinct was right: at{" "}
                                <InlineFormula latex="\clr{f}{f} = 2" colorMap={{ f: "#8B5CF6" }} />{" "}
                                Hz each cycle lasts exactly{" "}
                                <InlineFormula latex="\clr{T}{T} = 0.5" colorMap={{ T: "#EC4899" }} />{" "}
                                seconds, since{" "}
                                <InlineFormula
                                    latex="\clr{T}{T} = 1 / \clr{f}{f}"
                                    colorMap={{ T: "#EC4899", f: "#8B5CF6" }}
                                />. The full wave equation is{" "}
                                <InlineFormula
                                    latex="y = \clr{A}{A}\sin\!(2\pi \cdot \clr{f}{f} \cdot t)"
                                    colorMap={{ A: "#3B82F6", f: "#8B5CF6" }}
                                />. Drag amplitude and frequency freely and watch the graph respond.{" "}
                                <InlineTrigger varName="amplitude" value={1} icon="refresh">
                                    Reset amplitude
                                </InlineTrigger>{" "}
                                ·{" "}
                                <InlineTrigger varName="frequency" value={1} icon="refresh">
                                    Reset frequency
                                </InlineTrigger>
                            </EditableParagraph>
                        </Block>
                    </div>
                    <Block id="step-demo-5-viz" padding="none" hasVisualization>
                        <ReactiveStepViz />
                    </Block>
                </SplitLayout>
            </Step>
        </StepLayout>
    </StackLayout>,
];
