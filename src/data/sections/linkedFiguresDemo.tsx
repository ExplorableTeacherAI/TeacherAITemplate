/**
 * Linked Figures Demo — REFERENCE ONLY (like exampleBlocks.tsx / figureDemo.tsx)
 * =============================================================================
 *
 * NOT registered in blocks.tsx. This file is the copyable exemplar for a
 * LINKED PAIR of visuals: two bespoke figures, side by side, that are the same
 * idea seen two ways (the unit circle and the sine graph).
 *
 * Read this whenever a concept matches a linked-pair trigger — object ↔ its
 * measure, space ↔ time, concrete ↔ abstract, rate ↔ accumulation, part ↔
 * whole, one case ↔ many cases. Two linked views beat one overloaded view AND
 * one impoverished view.
 *
 * What makes these two figures LINKED (copy all five, not just the first):
 *
 *   1. ONE SOURCE OF TRUTH — both drawings read `linkedAngle` from the store.
 *      Neither holds its own copy, and neither notifies the other. Dragging in
 *      one moves the other because they read the same number.
 *   2. BIDIRECTIONAL — the angle is draggable in EITHER view.
 *   3. THE CORRESPONDENCE PROBLEM IS SOLVED — a shared highlight variable
 *      (`linkedViewHighlight`) connects counterparts: hovering the height in
 *      one view pops the height in the other while everything else recedes.
 *      Without this, students cannot map one view onto the other and the pair
 *      teaches LESS than a single view would. It is the whole ballgame.
 *   4. THE TIE IS VISIBLE — both views share the same vertical scale and the
 *      same zero line (AMPLITUDE_PX / AXIS_Y below), so sin θ is literally the
 *      same number of pixels tall in both. The mapping is shown, not inferred.
 *   5. BOTH VISIBLE AT ONCE — one SplitLayout, never tabs or an accordion. A
 *      representation you have to remember is not linked.
 *
 * Deliberate exception to the usual motion rules: the shared angle is read RAW
 * in both views (no spring). For linked views, exact lockstep beats easing —
 * a spring in each view would let them drift visibly apart mid-drag. Springs
 * stay for local affordances only (the handle scale-up on hover).
 *
 * Everything else follows FIGURE_DESIGN_LANGUAGE.md: white ground, ink
 * #334155/#64748B, ONE accent hue, two stroke weights, direct labels,
 * tabular-nums readouts, soft shadow on draggables only.
 *
 * Because reference sections are not wired into src/data/variables.ts, this
 * file defines its variables locally and merges them with registerVariables().
 * Real lessons define variables in src/data/variables.ts instead.
 */

import React, { useRef, useState, type ReactElement } from "react";
import { SplitLayout, StackLayout } from "@/components/layouts";
import { Block } from "@/components/templates";
import {
    EditableH2,
    EditableParagraph,
    InlineLinkedHighlight,
    InlineScrubbleNumber,
    InteractionHintSequence,
} from "@/components/atoms";
import { Figure, FigureSlider } from "@/components/molecules";
import { useVar, useSetVar, registerVariables } from "@/stores";
import { clamp, remap, useRafLoop, useSpring, type Vec2 } from "@/lib/motion";
import {
    linkedHighlightPropsFromDefinition,
    numberPropsFromDefinition,
    type VariableDefinition,
} from "../variables";

// ── Variables (local because this file is reference-only) ────────────────────

const linkedDemoVariableDefinitions: Record<string, VariableDefinition> = {
    // The ONE shared quantity. Both figures read and write this — nothing else
    // connects them.
    linkedAngle: {
        defaultValue: 35,
        type: "number",
        label: "Angle",
        description: "Angle swept around the unit circle, shared by both views",
        unit: "°",
        min: 0,
        max: 360,
        step: 1,
        color: "#62D0AD",
    },
    // The shared highlight channel: '' | 'height' | 'angle'. Hovering an
    // element in either view — or the bound phrase in the prose — writes this,
    // and BOTH views respond. This is what makes the pair mappable.
    linkedViewHighlight: {
        defaultValue: "",
        type: "text",
        label: "Linked view highlight",
        description: "Which quantity is currently highlighted across both views",
        color: "#62D0AD",
        bgColor: "rgba(98, 208, 173, 0.22)",
    },
    linkedPlaying: {
        defaultValue: false,
        type: "boolean",
        label: "Angle sweep playing",
        description: "Whether the shared angle sweeps automatically",
    },
};
registerVariables(linkedDemoVariableDefinitions);

// ── Shared view geometry — THE VISIBLE TIE ───────────────────────────────────
// Both figures use the same viewBox, the same zero line, and the same pixels
// per unit. sin θ is therefore the identical pixel height in both drawings.

const VIEW_WIDTH = 360;
const VIEW_HEIGHT = 300;
const AXIS_Y = 150; // y of the value 0 in BOTH views
const AMPLITUDE_PX = 96; // pixels per unit in BOTH views

const CIRCLE_CX = 150;
const PLOT_LEFT = 56;
const PLOT_RIGHT = 330;

const DEFAULT_ANGLE = 35;

const INK = "#334155"; // labels
const INK_STRUCTURE = "#64748B"; // axes, circle outline, radius
const INK_QUIET = "#CBD5E1"; // ticks, guides
const ACCENT = "#62D0AD"; // ONE accent: the shared height and its handles

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
const formatAngle = (degrees: number) => `${Math.round(degrees)}°`; // one formatter…
const formatHeight = (value: number) => value.toFixed(2); // …per quantity, both views

// ── Shared highlight helpers ─────────────────────────────────────────────────
// The linked-highlight contract, applied identically in both figures: the
// target pops (stroke ≥1.5× plus a ~28% halo) while EVERY other element recedes
// to 30-45%, both eased over ~150ms. Changing only the target reads as nothing
// happening — the simultaneous dimming is what makes it visible.

const EASE_150 = { transition: "opacity 150ms ease, stroke-width 150ms ease" } as const;

const useHighlightState = () => {
    const highlight = useVar<string>("linkedViewHighlight", "");
    const setVar = useSetVar();
    return {
        /** Opacity for an element belonging to `id` given the active highlight. */
        opacity: (id: string) => (highlight && highlight !== id ? 0.35 : 1),
        /** Stroke weight for an element belonging to `id`, popped when active. */
        weight: (id: string, resting: number) => (highlight === id ? resting * 1.6 : resting),
        isActive: (id: string) => highlight === id,
        /** Pointer handlers that write the SHARED variable — both views react. */
        hoverProps: (id: string) => ({
            onPointerEnter: () => setVar("linkedViewHighlight", id),
            onPointerLeave: () => setVar("linkedViewHighlight", ""),
        }),
    };
};

/** The soft halo half of the "pop": a wider stroke of the same hue underneath. */
const Halo = ({ active, children }: { active: boolean; children: React.ReactNode }) =>
    active ? <g opacity={0.28}>{children}</g> : null;

// ── Pointer helper ───────────────────────────────────────────────────────────

const svgPointFromEvent = (
    event: React.PointerEvent,
    svg: SVGSVGElement | null,
): Vec2 => {
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    return {
        x: ((event.clientX - rect.left) / rect.width) * VIEW_WIDTH,
        y: ((event.clientY - rect.top) / rect.height) * VIEW_HEIGHT,
    };
};

// ── Shared readout strip — identical in both figures, another visible tie ────

function SharedReadouts({ angle }: { angle: number }) {
    const { opacity } = useHighlightState();
    return (
        <g fontSize="12" style={{ fontVariantNumeric: "tabular-nums", ...EASE_150 }}>
            <text x="24" y="34" fill={INK} opacity={opacity("angle")}>
                {`θ = ${formatAngle(angle)}`}
            </text>
            <text
                x={VIEW_WIDTH - 24}
                y="34"
                fill={ACCENT}
                textAnchor="end"
                opacity={opacity("height")}
            >
                {`sin θ = ${formatHeight(Math.sin(toRadians(angle)))}`}
            </text>
        </g>
    );
}

// ── VIEW A: the unit circle (the concrete situation) ─────────────────────────

function UnitCircleDrawing() {
    const setVar = useSetVar();
    const angle = useVar<number>("linkedAngle", DEFAULT_ANGLE);
    const playing = useVar<boolean>("linkedPlaying", false);
    const { opacity, weight, isActive, hoverProps } = useHighlightState();

    const [dragging, setDragging] = useState(false);
    const [hovered, setHovered] = useState(false);
    // A REF, not state: a fast drag can deliver its first pointermove before a
    // state update has flushed, and the stale closure would swallow it. State
    // stays only for the visual affordance (cursor + scale).
    const draggingRef = useRef(false);
    const svgRef = useRef<SVGSVGElement>(null);
    const handleScale = useSpring(dragging || hovered ? 1.15 : 1, {
        stiffness: 400,
        damping: 26,
    });

    // Play mode writes the SHARED variable, so both views sweep together.
    useRafLoop(
        (_dt, elapsed) => setVar("linkedAngle", (elapsed * 45) % 360),
        { paused: !playing || dragging },
    );

    // Direct 1:1 tracking: the pointer angle IS the model angle.
    const handlePointerMove = (event: React.PointerEvent<SVGCircleElement>) => {
        if (!draggingRef.current) return;
        const point = svgPointFromEvent(event, svgRef.current);
        const degrees = (Math.atan2(AXIS_Y - point.y, point.x - CIRCLE_CX) * 180) / Math.PI;
        setVar("linkedAngle", (degrees + 360) % 360);
    };

    const radians = toRadians(angle);
    const pointX = CIRCLE_CX + Math.cos(radians) * AMPLITUDE_PX;
    const pointY = AXIS_Y - Math.sin(radians) * AMPLITUDE_PX;
    const arcRadius = 34;
    const largeArc = angle > 180 ? 1 : 0;
    const arcPath =
        `M ${CIRCLE_CX + arcRadius} ${AXIS_Y} ` +
        `A ${arcRadius} ${arcRadius} 0 ${largeArc} 0 ` +
        `${CIRCLE_CX + Math.cos(radians) * arcRadius} ${AXIS_Y - Math.sin(radians) * arcRadius}`;

    return (
        <svg
            ref={svgRef}
            viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
            className="block w-full select-none"
            role="img"
            aria-label="Unit circle with a draggable point; its height above the axis is sin theta"
        >
            <defs>
                <filter id="linked-demo-circle-shadow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#0F172A" floodOpacity="0.25" />
                </filter>
            </defs>

            <SharedReadouts angle={angle} />

            {/* Axes — ambient structure, always quiet. */}
            <g opacity={opacity("__structure")} style={EASE_150}>
                <line x1={CIRCLE_CX - 120} y1={AXIS_Y} x2={CIRCLE_CX + 120} y2={AXIS_Y} stroke={INK_QUIET} strokeWidth="1.5" />
                <line x1={CIRCLE_CX} y1={AXIS_Y - 120} x2={CIRCLE_CX} y2={AXIS_Y + 120} stroke={INK_QUIET} strokeWidth="1.5" />
                <circle cx={CIRCLE_CX} cy={AXIS_Y} r={AMPLITUDE_PX} fill="none" stroke={INK_STRUCTURE} strokeWidth="1.5" />
            </g>

            {/* ANGLE group — arc + radius. Hovering writes the shared variable,
                so the sine GRAPH dims its angle span at the same instant. */}
            <g {...hoverProps("angle")} opacity={opacity("angle")} style={EASE_150}>
                <Halo active={isActive("angle")}>
                    <path d={arcPath} fill="none" stroke={INK_STRUCTURE} strokeWidth={weight("angle", 2) + 6} strokeLinecap="round" />
                </Halo>
                <path d={arcPath} fill="none" stroke={INK_STRUCTURE} strokeWidth={weight("angle", 2)} strokeLinecap="round" />
                <line x1={CIRCLE_CX} y1={AXIS_Y} x2={pointX} y2={pointY} stroke={INK_STRUCTURE} strokeWidth={weight("angle", 2)} strokeLinecap="round" />
                <text x={CIRCLE_CX + 44} y={AXIS_Y - 12} fill={INK} fontSize="12">
                    θ
                </text>
            </g>

            {/* HEIGHT group — the shared quantity, in the ONE accent hue.
                Its counterpart in the graph view carries the same id. */}
            <g {...hoverProps("height")} opacity={opacity("height")} style={EASE_150}>
                <Halo active={isActive("height")}>
                    <line x1={pointX} y1={AXIS_Y} x2={pointX} y2={pointY} stroke={ACCENT} strokeWidth={weight("height", 3) + 6} strokeLinecap="round" />
                </Halo>
                <line x1={pointX} y1={AXIS_Y} x2={pointX} y2={pointY} stroke={ACCENT} strokeWidth={weight("height", 3)} strokeLinecap="round" />
                {/* Dashed guide out to the shared zero line — the same guide
                    appears at the same height in the graph view. */}
                <line x1={pointX} y1={pointY} x2={CIRCLE_CX + 132} y2={pointY} stroke={ACCENT} strokeWidth="1.5" strokeDasharray="3 4" opacity={0.6} />
            </g>

            {/* Draggable point — accent handle, soft shadow, 24px hit area. */}
            <g transform={`translate(${pointX} ${pointY}) scale(${handleScale})`}>
                <circle r="8" fill={ACCENT} filter="url(#linked-demo-circle-shadow)" />
            </g>
            <circle
                cx={pointX}
                cy={pointY}
                r="24"
                fill="transparent"
                style={{ cursor: dragging ? "grabbing" : "grab", touchAction: "none" }}
                onPointerDown={(event) => {
                    event.currentTarget.setPointerCapture(event.pointerId);
                    draggingRef.current = true;
                    setDragging(true);
                }}
                onPointerMove={handlePointerMove}
                onPointerUp={() => {
                    draggingRef.current = false;
                    setDragging(false);
                }}
                onPointerCancel={() => {
                    draggingRef.current = false;
                    setDragging(false);
                }}
                onPointerEnter={() => setHovered(true)}
                onPointerLeave={() => setHovered(false)}
            />
        </svg>
    );
}

// ── VIEW B: the sine graph (the same idea, unrolled in time) ─────────────────

function SineGraphDrawing() {
    const setVar = useSetVar();
    const angle = useVar<number>("linkedAngle", DEFAULT_ANGLE);
    const { opacity, weight, isActive, hoverProps } = useHighlightState();

    const [dragging, setDragging] = useState(false);
    const [hovered, setHovered] = useState(false);
    const draggingRef = useRef(false); // see the circle view: ref, not state
    const svgRef = useRef<SVGSVGElement>(null);
    const handleScale = useSpring(dragging || hovered ? 1.15 : 1, {
        stiffness: 400,
        damping: 26,
    });

    const xForAngle = (degrees: number) =>
        remap(degrees, 0, 360, PLOT_LEFT, PLOT_RIGHT);
    const yForAngle = (degrees: number) =>
        AXIS_Y - Math.sin(toRadians(degrees)) * AMPLITUDE_PX;

    const handlePointerMove = (event: React.PointerEvent<SVGCircleElement>) => {
        if (!draggingRef.current) return;
        const point = svgPointFromEvent(event, svgRef.current);
        setVar(
            "linkedAngle",
            clamp(remap(point.x, PLOT_LEFT, PLOT_RIGHT, 0, 360), 0, 360),
        );
    };

    const samples = Array.from({ length: 181 }, (_, index) => index * 2);
    const pathFor = (upTo: number) =>
        samples
            .filter((degrees) => degrees <= upTo)
            .map((degrees, index) => `${index === 0 ? "M" : "L"} ${xForAngle(degrees)} ${yForAngle(degrees)}`)
            .join(" ");

    const markerX = xForAngle(angle);
    const markerY = yForAngle(angle);

    return (
        <svg
            ref={svgRef}
            viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
            className="block w-full select-none"
            role="img"
            aria-label="Graph of sine against angle with a draggable marker on the curve"
        >
            <defs>
                <filter id="linked-demo-graph-shadow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#0F172A" floodOpacity="0.25" />
                </filter>
            </defs>

            <SharedReadouts angle={angle} />

            {/* Axes and y labels — same zero line and same pixels-per-unit as
                the circle, which is what makes the two views comparable. */}
            <g opacity={opacity("__structure")} style={EASE_150}>
                <line x1={PLOT_LEFT} y1={AXIS_Y} x2={PLOT_RIGHT} y2={AXIS_Y} stroke={INK_QUIET} strokeWidth="1.5" />
                <line x1={PLOT_LEFT} y1={AXIS_Y - AMPLITUDE_PX} x2={PLOT_LEFT} y2={AXIS_Y + AMPLITUDE_PX} stroke={INK_QUIET} strokeWidth="1.5" />
                <g fill={INK} fontSize="12" textAnchor="end" style={{ fontVariantNumeric: "tabular-nums" }}>
                    <text x={PLOT_LEFT - 10} y={AXIS_Y - AMPLITUDE_PX + 4}>1</text>
                    <text x={PLOT_LEFT - 10} y={AXIS_Y + 4}>0</text>
                    <text x={PLOT_LEFT - 10} y={AXIS_Y + AMPLITUDE_PX + 4}>−1</text>
                </g>
                {/* Edge labels anchored back toward the ink so nothing clips. */}
                <g fill={INK} fontSize="12">
                    <text x={PLOT_LEFT} y={AXIS_Y + AMPLITUDE_PX + 30} textAnchor="start">0°</text>
                    <text x={xForAngle(180)} y={AXIS_Y + AMPLITUDE_PX + 30} textAnchor="middle">180°</text>
                    <text x={PLOT_RIGHT} y={AXIS_Y + AMPLITUDE_PX + 30} textAnchor="end">360°</text>
                </g>
                {/* The not-yet-traced curve, quiet: the before-state reference. */}
                <path d={pathFor(360)} fill="none" stroke={INK_QUIET} strokeWidth="1.5" />
            </g>

            {/* ANGLE group — the swept span along the axis. Counterpart of the
                circle's arc: same id, so hovering either dims the other view. */}
            <g {...hoverProps("angle")} opacity={opacity("angle")} style={EASE_150}>
                <Halo active={isActive("angle")}>
                    <line x1={PLOT_LEFT} y1={AXIS_Y} x2={markerX} y2={AXIS_Y} stroke={INK_STRUCTURE} strokeWidth={weight("angle", 2) + 6} strokeLinecap="round" />
                </Halo>
                <line x1={PLOT_LEFT} y1={AXIS_Y} x2={markerX} y2={AXIS_Y} stroke={INK_STRUCTURE} strokeWidth={weight("angle", 2)} strokeLinecap="round" />
                <text x={(PLOT_LEFT + markerX) / 2} y={AXIS_Y + 18} fill={INK} fontSize="12" textAnchor="middle">
                    θ
                </text>
            </g>

            {/* HEIGHT group — same id, same accent, same pixel height as the
                circle's vertical leg. This is the pair's whole argument. */}
            <g {...hoverProps("height")} opacity={opacity("height")} style={EASE_150}>
                <path d={pathFor(angle)} fill="none" stroke={ACCENT} strokeWidth={weight("height", 2.5)} strokeLinecap="round" strokeLinejoin="round" />
                <Halo active={isActive("height")}>
                    <line x1={markerX} y1={AXIS_Y} x2={markerX} y2={markerY} stroke={ACCENT} strokeWidth={weight("height", 3) + 6} strokeLinecap="round" />
                </Halo>
                <line x1={markerX} y1={AXIS_Y} x2={markerX} y2={markerY} stroke={ACCENT} strokeWidth={weight("height", 3)} strokeLinecap="round" />
                <line x1={PLOT_LEFT} y1={markerY} x2={markerX} y2={markerY} stroke={ACCENT} strokeWidth="1.5" strokeDasharray="3 4" opacity={0.6} />
            </g>

            <g transform={`translate(${markerX} ${markerY}) scale(${handleScale})`}>
                <circle r="8" fill={ACCENT} filter="url(#linked-demo-graph-shadow)" />
            </g>
            <circle
                cx={markerX}
                cy={markerY}
                r="24"
                fill="transparent"
                style={{ cursor: dragging ? "grabbing" : "grab", touchAction: "none" }}
                onPointerDown={(event) => {
                    event.currentTarget.setPointerCapture(event.pointerId);
                    draggingRef.current = true;
                    setDragging(true);
                }}
                onPointerMove={handlePointerMove}
                onPointerUp={() => {
                    draggingRef.current = false;
                    setDragging(false);
                }}
                onPointerCancel={() => {
                    draggingRef.current = false;
                    setDragging(false);
                }}
                onPointerEnter={() => setHovered(true)}
                onPointerLeave={() => setHovered(false)}
            />
        </svg>
    );
}

// ── Figure shells ────────────────────────────────────────────────────────────

function UnitCircleFigure() {
    const setVar = useSetVar();
    return (
        <Figure
            id="linked-demo-unit-circle"
            playable
            playVarName="linkedPlaying"
            onReset={() => {
                setVar("linkedAngle", DEFAULT_ANGLE);
                setVar("linkedPlaying", false);
                setVar("linkedViewHighlight", "");
            }}
            caption="Drag the teal point around the circle. Its height above the middle line is sin θ."
        >
            <UnitCircleDrawing />
            <InteractionHintSequence
                hintKey="linked-demo-circle-drag"
                steps={[
                    {
                        gesture: "drag-circular",
                        label: "Drag the point around the circle",
                        position: { x: "62%", y: "34%" },
                        dragPath: { type: "arc", startAngle: -35, endAngle: -120, radius: 38 },
                    },
                ]}
            />
        </Figure>
    );
}

function SineGraphFigure() {
    const setVar = useSetVar();
    return (
        <Figure
            id="linked-demo-sine-graph"
            onReset={() => {
                setVar("linkedAngle", DEFAULT_ANGLE);
                setVar("linkedViewHighlight", "");
            }}
            caption="The same height, plotted against the angle. Drag this marker instead — the circle follows."
        >
            <SineGraphDrawing />
            <div className="px-6 pb-5">
                <FigureSlider
                    varName="linkedAngle"
                    label="Angle"
                    {...numberPropsFromDefinition(linkedDemoVariableDefinitions.linkedAngle)}
                    formatValue={formatAngle}
                />
            </div>
            <InteractionHintSequence
                hintKey="linked-demo-graph-drag"
                steps={[
                    {
                        gesture: "drag-horizontal",
                        label: "Drag the marker along the curve",
                        position: { x: "30%", y: "38%" },
                        dragPath: { type: "line", startOffset: { x: -28, y: 0 }, endOffset: { x: 28, y: 0 } },
                    },
                ]}
            />
        </Figure>
    );
}

// ── Exported demo blocks (flat array, one component per Block) ───────────────

export const linkedFiguresDemoBlocks: ReactElement[] = [
    <StackLayout key="layout-linked-demo-heading" maxWidth="xl">
        <Block id="linked-demo-heading" padding="md">
            <EditableH2 id="h2-linked-demo-heading" blockId="linked-demo-heading">
                A circle and a wave are the same picture
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-linked-demo-intro" maxWidth="xl">
        <Block id="linked-demo-intro" padding="sm">
            <EditableParagraph id="para-linked-demo-intro" blockId="linked-demo-intro">
                Send the point{" "}
                <InlineScrubbleNumber
                    varName="linkedAngle"
                    {...numberPropsFromDefinition(linkedDemoVariableDefinitions.linkedAngle)}
                    formatValue={formatAngle}
                />{" "}
                around the circle and watch its{" "}
                {/* Prose → BOTH views: this writes the same shared highlight
                    variable the two figures read. */}
                <InlineLinkedHighlight
                    varName="linkedViewHighlight"
                    highlightId="height"
                    {...linkedHighlightPropsFromDefinition(
                        linkedDemoVariableDefinitions.linkedViewHighlight,
                    )}
                >
                    height
                </InlineLinkedHighlight>{" "}
                rise and fall. The wave beside it is not a second idea — it is that same
                height, laid out against the angle instead of stacked on the circle.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // BOTH VIEWS VISIBLE AT ONCE — never tabs, never an accordion.
    <SplitLayout key="layout-linked-demo-pair" ratio="1:1" gap="lg" align="start">
        <Block id="linked-demo-circle" padding="sm" hasVisualization>
            <UnitCircleFigure />
        </Block>
        <Block id="linked-demo-graph" padding="sm" hasVisualization>
            <SineGraphFigure />
        </Block>
    </SplitLayout>,
];
