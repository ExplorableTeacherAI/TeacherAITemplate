import { type ReactElement } from "react";
import { StackLayout, SplitLayout } from "@/components/layouts";
import { Block } from "@/components/templates";
import {
    EditableH3,
    EditableH4,
    EditableParagraph,
    InlineClozeInput,
    InlineClozeChoice,
    InlineFeedback,
    InlineSpotColor,
    InlineScrubbleNumber,
    Cartesian2D,
    InteractionHintSequence,
    TriggeredHintOverlay,
} from "@/components/atoms";
import {
    getExampleVariableInfo,
    clozePropsFromDefinition,
    choicePropsFromDefinition,
    numberPropsFromDefinition,
} from "../exampleVariables";
import { useVar, useSetVar } from "@/stores";

// ─────────────────────────────────────────────────────────────────────────────
// Teaching Visualizations — Interactive explorations students are guided through
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Unit Circle Explorer — students discover cos/sin by dragging a point
 * around the circle and watching the blue (cos) and green (sin) projections.
 *
 * The guided hint sequence walks them through:
 *   Step 1. Drag the point to the TOP of the circle → notice cos shrinks to 0
 *   Step 2. Drag to the LEFT → notice cos becomes negative
 *   Step 3. Bring it back to the RIGHT → cos returns to 1
 *
 * This builds the intuition that cos(θ) = how far RIGHT the point is.
 */
function UnitCircleExplorerViz() {
    const setVar = useSetVar();
    const theta = useVar('fbDemoTheta', 0) as number;

    // Position the θ label along the bisector of the arc
    const thetaRad = theta * (Math.PI / 180);
    const midAngle = thetaRad / 2;
    const labelR = 0.55;
    const labelX = labelR * Math.cos(midAngle);
    const labelY = labelR * Math.sin(midAngle);
    // Convert graph coords → percentage of the viewBox [-1.8, 1.8]
    const leftPct = ((labelX + 1.8) / 3.6) * 100;
    const topPct = ((1.8 - labelY) / 3.6) * 100;

    // Derive the point position from theta for bidirectional binding
    const pointX = Math.cos(thetaRad);
    const pointY = Math.sin(thetaRad);

    return (
        <div className="relative">
            <Cartesian2D
                height={360}
                viewBox={{ x: [-1.8, 1.8], y: [-1.8, 1.8] }}
                movablePoints={[
                    {
                        initial: [1, 0],
                        position: [pointX, pointY],
                        color: "#ef4444",
                        constrain: ([px, py]) => {
                            const angle = Math.atan2(py, px);
                            return [Math.cos(angle), Math.sin(angle)];
                        },
                        onChange: ([px, py]) => {
                            setVar('fbDemoCos', px);
                            setVar('fbDemoSin', py);
                            const angleDeg = Math.atan2(py, px) * (180 / Math.PI);
                            setVar('fbDemoTheta', Math.round(angleDeg));
                        }
                    },
                ]}
                plots={[
                    { type: "circle", center: [0, 0], radius: 1, color: "#64748b", fillOpacity: 0.03, strokeStyle: "dashed" },
                ]}
                dynamicPlots={([p]) => {
                    const [cx, cy] = p;
                    const angle = Math.atan2(cy, cx);
                    const arcR = 0.3;
                    // Build the arc range so it always sweeps from 0 toward the point
                    const arcRange: [number, number] = angle >= 0
                        ? [0, angle]
                        : [angle, 0];
                    return [
                        // θ arc (amber) — small arc from the +x axis to the current angle
                        ...(Math.abs(angle) > 0.03 ? [{
                            type: "parametric" as const,
                            xy: (t: number): [number, number] => [arcR * Math.cos(t), arcR * Math.sin(t)],
                            tRange: arcRange,
                            color: "#f59e0b",
                            weight: 2.5,
                        }] : []),
                        // Radius vector (red)
                        { type: "vector" as const, tail: [0, 0] as [number, number], tip: p, color: "#ef4444", weight: 2.5 },
                        // cos(θ) = x-projection (blue): horizontal line from point down to x-axis
                        { type: "segment" as const, point1: [cx, 0] as [number, number], point2: p, color: "#3b82f6", style: "dashed" as const, weight: 2 },
                        { type: "segment" as const, point1: [0, 0] as [number, number], point2: [cx, 0] as [number, number], color: "#3b82f6", weight: 3 },
                        { type: "point" as const, x: cx, y: 0, color: "#3b82f6" },
                        // sin(θ) = y-projection (green): vertical line from point to y-axis
                        { type: "segment" as const, point1: [0, cy] as [number, number], point2: p, color: "#22c55e", style: "dashed" as const, weight: 2 },
                        { type: "segment" as const, point1: [0, 0] as [number, number], point2: [0, cy] as [number, number], color: "#22c55e", weight: 3 },
                        { type: "point" as const, x: 0, y: cy, color: "#22c55e" },
                    ];
                }}
            />
            {/* θ label — positioned at the bisector of the angle arc */}
            {Math.abs(theta) > 2 && (
                <div
                    className="absolute pointer-events-none select-none font-semibold text-sm"
                    style={{
                        left: `${leftPct}%`,
                        top: `${topPct}%`,
                        transform: "translate(-50%, -50%)",
                        color: "#f59e0b",
                    }}
                >
                    θ = {theta}°
                </div>
            )}
            {/* Initial hint — just gets them started */}
            <InteractionHintSequence
                hintKey="fb-demo-unit-circle"
                steps={[{
                    gesture: "drag-circular",
                    label: "Drag the red point around the unit circle to see how cos(θ) and sin(θ) change with the angle",
                    position: { x: "70%", y: "22%" },
                    dragPath: { type: "arc", startAngle: 0, endAngle: -90, radius: 35 }
                }]}
            />
            {/* Triggered hint — a GUIDED DISCOVERY sequence activated by wrong-answer feedback */}
            <TriggeredHintOverlay hintKey="feedback-unit-circle-hint" />
        </div>
    );
}

/**
 * Sine Wave Amplitude Explorer — students discover the role of amplitude
 * by dragging a slider that controls A in y = A·sin(x).
 *
 * Two waves are shown:
 *   - Gray: original sin(x) (A = 1) — always visible as reference
 *   - Red: A·sin(x) — stretches/shrinks as student drags
 *
 * The guided hint sequence walks them through:
 *   Step 1. Drag the amplitude up to see the wave grow taller
 *   Step 2. Drag it back down — notice the wave never shifts sideways
 *   Step 3. See that both waves still cross zero at the same x-values
 */
function SineAmplitudeExplorerViz() {
    const amplitude = useVar('fbDemoAmplitude', 1.5) as number;
    const setVar = useSetVar();

    return (
        <div className="relative">
            <Cartesian2D
                height={360}
                viewBox={{ x: [-5, 5], y: [-3.5, 3.5] }}
                movablePoints={[
                    {
                        initial: [1.57, 1.5],
                        position: [Math.PI / 2, amplitude],
                        color: "#ef4444",
                        constrain: ([, py]) => [1.57, Math.max(0.2, Math.min(3, py))],
                        onChange: ([, py]) => setVar('fbDemoAmplitude', Math.round(py * 10) / 10),
                    },
                ]}
                plots={[
                    // Reference wave: sin(x) in gray — this is always A=1
                    { type: "function", fn: Math.sin, color: "#94a3b8", weight: 1.5 },
                    // Student-controlled wave: A·sin(x) in bold red
                    { type: "function", fn: (x) => amplitude * Math.sin(x), color: "#ef4444", weight: 3 },
                    // Mark the peak of the controlled wave
                    { type: "point", x: Math.PI / 2, y: amplitude, color: "#ef4444" },
                    // Mark the peak of the reference
                    { type: "point", x: Math.PI / 2, y: 1, color: "#94a3b8" },
                    // Dashed line showing the amplitude height
                    { type: "segment", point1: [Math.PI / 2, 0], point2: [Math.PI / 2, amplitude], color: "#ef4444", style: "dashed" as const, weight: 1.5 },
                ]}
            />
            {/* Initial gentle hint */}
            <InteractionHintSequence
                hintKey="fb-demo-sine-amp"
                steps={[{
                    gesture: "drag-vertical",
                    label: "Drag the red point up or down to change the amplitude (A) — notice only the wave height changes",
                    position: { x: "45%", y: "25%" },
                    dragPath: { type: "line", startOffset: { x: 0, y: -20 }, endOffset: { x: 0, y: 20 } }
                }]}
            />
            {/* Triggered multi-step discovery hint from feedback */}
            <TriggeredHintOverlay hintKey="feedback-sine-amplitude-hint" />
        </div>
    );
}

// ── Exported demo blocks ─────────────────────────────────────────────────────

export const inlineFeedbackDemoBlocks: ReactElement[] = [
    // ── Title ─────────────────────────────────────────────────────────────
    <StackLayout key="layout-inline-feedback-title" maxWidth="xl">
        <Block id="inline-feedback-title" padding="sm">
            <EditableH3 id="h3-inline-feedback-title" blockId="inline-feedback-title">
                Guided Feedback — Learn from Mistakes
            </EditableH3>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-inline-feedback-intro" maxWidth="xl">
        <Block id="inline-feedback-intro" padding="sm">
            <EditableParagraph id="para-inline-feedback-intro" blockId="inline-feedback-intro">
                Getting a question wrong isn't a dead end — it's the beginning of a learning
                journey. Our feedback system gently addresses <em>why</em> a student might be
                confused, links them to the relevant concept, and when possible, navigates
                them straight to an interactive visualization where they can <strong>discover
                    the answer themselves</strong> through hands-on exploration.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // ══════════════════════════════════════════════════════════════════════
    //  STORY 1: The Unit Circle — Understanding cos(θ)
    // ══════════════════════════════════════════════════════════════════════

    <StackLayout key="layout-inline-feedback-story1-title" maxWidth="xl">
        <Block id="inline-feedback-story1-title" padding="sm">
            <EditableH4 id="h4-inline-feedback-story1" blockId="inline-feedback-story1-title">
                Journey 1: What Does Cosine Really Mean?
            </EditableH4>
        </Block>
    </StackLayout>,

    // ── Teaching paragraph (this is the "lesson" the section link navigates to) ─
    <StackLayout key="layout-inline-feedback-concept-cos" maxWidth="xl">
        <Block id="inline-feedback-concept-cos" padding="sm">
            <EditableParagraph id="para-inline-feedback-concept-cos" blockId="inline-feedback-concept-cos">
                Imagine placing a point on a circle of radius 1 (the <em>unit circle</em>).
                As it travels around, it traces a path. At any moment, that{" "}
                point's horizontal position — <strong>how far right or left it is from the
                    center</strong> — is what we call the{" "}
                <InlineSpotColor varName="ucCosine" color="#3b82f6">
                    cosine
                </InlineSpotColor>
                {" "}of the angle. Meanwhile, its vertical position gives us the{" "}
                <InlineSpotColor varName="ucSine" color="#22c55e">
                    sine
                </InlineSpotColor>
                . When the angle is 0° (pointing directly right), the point sits at the
                rightmost edge of the circle — as far right as it can go.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // ── The question + visualization side-by-side ─────────────────────────
    <SplitLayout key="layout-inline-feedback-unit-circle" ratio="1:1" gap="lg">
        <div className="space-y-4">
            <Block id="inline-feedback-q-unit" padding="md">
                <EditableParagraph id="para-inline-feedback-q-unit" blockId="inline-feedback-q-unit">
                    A point starts at (1, 0) on the unit circle — the rightmost position. The{" "}
                    <InlineSpotColor varName="ucCosine" color="#3b82f6">
                        blue projection
                    </InlineSpotColor>
                    {" "}shows its horizontal distance from the center. What value
                    does cos(0°) equal?{" "}
                    <InlineFeedback
                        varName="fbUnitCircleCos"
                        correctValue="1"
                        position="standalone"
                        successMessage="Yes! The point is at the rightmost edge — its horizontal distance from center is the full radius: 1"
                        failureMessage="Hmm, not quite."
                        hint="Think about where the point is sitting at angle 0° — is it at the top? the center? or the far right of the circle?"
                        sectionLinks={[
                            { blockId: "inline-feedback-concept-cos", label: "Re-read: What is cosine?" },
                        ]}
                        visualizationHint={{
                            blockId: "inline-feedback-unit-viz",
                            hintKey: "feedback-unit-circle-hint",
                            steps: [
                                {
                                    gesture: "click",
                                    label: "Look at where the point is right now — it's at the far right of the circle, at position (1, 0)",
                                    position: { x: "75%", y: "50%" },
                                },
                                {
                                    gesture: "drag-circular",
                                    label: "Now drag upward toward the top — the blue horizontal line (cos) shrinks toward zero",
                                    position: { x: "55%", y: "25%" },
                                    dragPath: { type: "arc", startAngle: 0, endAngle: -90, radius: 40 },
                                },
                                {
                                    gesture: "drag-circular",
                                    label: "Keep going to the left side — the blue line crosses zero and becomes negative!",
                                    position: { x: "25%", y: "50%" },
                                    dragPath: { type: "arc", startAngle: -90, endAngle: -180, radius: 40 },
                                },
                            ],
                            label: "Discover it yourself",
                            color: "#3b82f6",
                        }}
                    >
                        <InlineClozeChoice
                            varName="fbUnitCircleCos"
                            correctAnswer="1"
                            options={["0", "1", "-1", "0.5"]}
                            {...choicePropsFromDefinition(getExampleVariableInfo("fbUnitCircleCos"))}
                        />
                    </InlineFeedback>
                </EditableParagraph>
            </Block>
            <Block id="inline-feedback-unit-live" padding="sm">
                <EditableParagraph id="para-inline-feedback-unit-live" blockId="inline-feedback-unit-live">
                    Live values: θ ={" "}
                    <InlineScrubbleNumber
                        varName="fbDemoTheta"
                        {...numberPropsFromDefinition(getExampleVariableInfo("fbDemoTheta"))}
                        color="#ef4444"
                        formatValue={(v) => `${v}°`}
                    />,{" "}
                    <InlineSpotColor varName="ucCosine" color="#3b82f6">cos(θ)</InlineSpotColor>
                    {" "}={" "}
                    <InlineScrubbleNumber
                        varName="fbDemoCos"
                        {...numberPropsFromDefinition(getExampleVariableInfo("fbDemoCos"))}
                        color="#3b82f6"
                        formatValue={(v) => v.toFixed(2)}
                    />,{" "}
                    <InlineSpotColor varName="ucSine" color="#22c55e">sin(θ)</InlineSpotColor>
                    {" "}={" "}
                    <InlineScrubbleNumber
                        varName="fbDemoSin"
                        {...numberPropsFromDefinition(getExampleVariableInfo("fbDemoSin"))}
                        color="#22c55e"
                        formatValue={(v) => v.toFixed(2)}
                    />
                </EditableParagraph>
            </Block>
        </div>
        <Block id="inline-feedback-unit-viz" padding="sm" hasVisualization>
            <UnitCircleExplorerViz />
        </Block>
    </SplitLayout>,

    // ══════════════════════════════════════════════════════════════════════
    //  STORY 2: Sine Wave Amplitude — What Does "A" Actually Do?
    // ══════════════════════════════════════════════════════════════════════

    <StackLayout key="layout-inline-feedback-story2-title" maxWidth="xl">
        <Block id="inline-feedback-story2-title" padding="sm">
            <EditableH4 id="h4-inline-feedback-story2" blockId="inline-feedback-story2-title">
                Journey 2: What Happens When You Change the Amplitude?
            </EditableH4>
        </Block>
    </StackLayout>,

    // ── Teaching paragraph ────────────────────────────────────────────────
    <StackLayout key="layout-inline-feedback-concept-amp" maxWidth="xl">
        <Block id="inline-feedback-concept-amp" padding="sm">
            <EditableParagraph id="para-inline-feedback-concept-amp" blockId="inline-feedback-concept-amp">
                In the equation y = A·sin(x), the letter <strong>A</strong> is the amplitude.
                Think of it as a volume knob for the wave's height. The basic wave sin(x)
                oscillates between −1 and +1. When you multiply by A, the peaks reach A
                and the valleys drop to −A. <em>Crucially, this only stretches the wave
                    vertically</em> — the wave still crosses zero at the same x-values, and the
                spacing between peaks doesn't change. That horizontal spacing is controlled
                by a completely different parameter: the frequency.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // ── The question + visualization ──────────────────────────────────────
    <SplitLayout key="layout-inline-feedback-sine-wave" ratio="1:1" gap="lg">
        <div className="space-y-4">
            <Block id="inline-feedback-q-sine" padding="md">
                <EditableParagraph id="para-inline-feedback-q-sine" blockId="inline-feedback-q-sine">
                    The{" "}
                    <InlineSpotColor varName="swReference" color="#94a3b8">
                        gray wave
                    </InlineSpotColor>
                    {" "}is the basic sin(x) with A = 1. The{" "}
                    <InlineSpotColor varName="swAmplitude" color="#ef4444">
                        red wave
                    </InlineSpotColor>
                    {" "}has A ={" "}
                    <InlineScrubbleNumber
                        varName="fbDemoAmplitude"
                        {...numberPropsFromDefinition(getExampleVariableInfo("fbDemoAmplitude"))}
                        formatValue={(v) => v.toFixed(1)}
                    />.
                    If you increase A from 1 to 2, what changes about the wave?{" "}
                    <InlineFeedback
                        varName="fbSineWaveAmp"
                        correctValue="height doubles"
                        position="standalone"
                        successMessage="Exactly! The amplitude is like a volume knob — turning it up only makes the wave taller, nothing else changes"
                        failureMessage="Not quite."
                        hint="Compare the red wave with the gray one. The zero-crossings and spacing stay fixed; only the height changes."
                        sectionLinks={[
                            { blockId: "inline-feedback-concept-amp", label: "Re-read: What is amplitude?" },
                        ]}
                        visualizationHint={{
                            blockId: "inline-feedback-sine-viz",
                            hintKey: "feedback-sine-amplitude-hint",
                            steps: [
                                {
                                    gesture: "drag-vertical",
                                    label: "Drag the red point upward — the red wave stretches taller while the gray reference stays the same",
                                    position: { x: "50%", y: "20%" },
                                    dragPath: { type: "line", startOffset: { x: 0, y: 10 }, endOffset: { x: 0, y: -30 } },
                                },
                            ],
                            label: "reveal answer hints",
                            color: "#ef4444",
                            resetVars: { fbDemoAmplitude: 1.0 },
                        }}
                    >
                        <InlineClozeChoice
                            varName="fbSineWaveAmp"
                            correctAnswer="height doubles"
                            options={["wave shifts right", "height doubles", "wave gets faster", "wave flattens"]}
                            {...choicePropsFromDefinition(getExampleVariableInfo("fbSineWaveAmp"))}
                        />
                    </InlineFeedback>
                </EditableParagraph>
            </Block>
        </div>
        <Block id="inline-feedback-sine-viz" padding="sm" hasVisualization>
            <SineAmplitudeExplorerViz />
        </Block>
    </SplitLayout>,

    // ══════════════════════════════════════════════════════════════════════
    //  STORY 3: Cross Product (section-links only, no embedded viz)
    // ══════════════════════════════════════════════════════════════════════

    <StackLayout key="layout-inline-feedback-story3-title" maxWidth="xl">
        <Block id="inline-feedback-story3-title" padding="sm">
            <EditableH4 id="h4-inline-feedback-story3" blockId="inline-feedback-story3-title">
                Journey 3: Section Links to Other Parts of the Lesson
            </EditableH4>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-inline-feedback-story3-desc" maxWidth="xl">
        <Block id="inline-feedback-story3-desc" padding="sm">
            <EditableParagraph id="para-inline-feedback-story3-desc" blockId="inline-feedback-story3-desc">
                Not every question needs its own visualization. Sometimes the best help is
                navigating the student to a section they've already seen — perhaps they read
                it too quickly or missed a key detail. Section links scroll smoothly to the
                relevant block and briefly highlight it, making it easy to review.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-inline-feedback-q-cross" maxWidth="xl">
        <Block id="inline-feedback-q-cross" padding="md">
            <EditableParagraph id="para-inline-feedback-q-cross" blockId="inline-feedback-q-cross">
                When you take the cross product of two vectors, the result is a new vector.
                If you laid both original vectors flat on a table, which direction would
                the cross product point?{" "}
                <InlineFeedback
                    varName="fbCrossProduct"
                    correctValue="perpendicular to both"
                    position="standalone"
                    successMessage="Correct! The cross product always 'pops out' perpendicular to the plane containing both vectors — like a stick standing straight up from a table"
                    failureMessage="Not quite."
                    hint="If both vectors lie flat on a table, think about the only direction that has nothing to do with either of them. It's not along the table surface…"
                    sectionLinks={[
                        { blockId: "cartesian-3d-vectors-desc", label: "Review: 3D Vectors" },
                        { blockId: "cartesian-3d-vectors-eq", label: "See: Cross Product Formula" },
                    ]}
                >
                    <InlineClozeChoice
                        varName="fbCrossProduct"
                        correctAnswer="perpendicular to both"
                        options={["parallel to both", "perpendicular to both", "same as first vector", "opposite direction"]}
                        {...choicePropsFromDefinition(getExampleVariableInfo("fbCrossProduct"))}
                    />
                </InlineFeedback>
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // ── Classic Feedback (simpler examples, for reference) ────────────────
    <StackLayout key="layout-inline-feedback-classic-title" maxWidth="xl">
        <Block id="inline-feedback-classic-title" padding="sm">
            <EditableH4 id="h4-inline-feedback-classic" blockId="inline-feedback-classic-title">
                Simple Inline Feedback (No Navigation)
            </EditableH4>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-inline-feedback-q1" maxWidth="xl">
        <Block id="inline-feedback-q1" padding="md">
            <EditableParagraph id="para-inline-feedback-q1" blockId="inline-feedback-q1">
                A circle with radius 3 has a diameter that stretches all the way across
                through the center. That diameter equals{" "}
                <InlineFeedback
                    varName="fbCircleDiameter"
                    correctValue="6"
                    position="terminal"
                    successMessage="— exactly! The diameter always spans the full width: 2 × radius"
                    failureMessage="— not quite."
                    hint="The diameter is what you get when you draw a straight line from one side of the circle to the other, passing through the center. How does that relate to the radius?"
                >
                    <InlineClozeInput
                        varName="fbCircleDiameter"
                        correctAnswer="6"
                        {...clozePropsFromDefinition(getExampleVariableInfo("fbCircleDiameter"))}
                    />
                </InlineFeedback>.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-inline-feedback-q2" maxWidth="xl">
        <Block id="inline-feedback-q2" padding="md">
            <EditableParagraph id="para-inline-feedback-q2" blockId="inline-feedback-q2">
                The circumference formula 2πr measures the <em>distance around</em> the
                circle. But the area formula measures the <em>space inside</em>. Which
                formula gives the area?{" "}
                <InlineFeedback
                    varName="fbAreaFormula"
                    correctValue="πr²"
                    position="standalone"
                    successMessage="Yes! Area = πr² measures the space enclosed inside the circle"
                    failureMessage="Hmm, not that one."
                    hint="Circumference (2πr) is about distance around. Area is about space inside — it grows much faster because you're filling a 2D region, not just tracing a line"
                >
                    <InlineClozeChoice
                        varName="fbAreaFormula"
                        correctAnswer="πr²"
                        options={["2πr", "πr²", "πd", "r²"]}
                        {...choicePropsFromDefinition(getExampleVariableInfo("fbAreaFormula"))}
                    />
                </InlineFeedback>
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
