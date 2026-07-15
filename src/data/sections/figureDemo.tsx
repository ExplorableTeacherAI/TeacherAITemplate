/**
 * Figure Demo — REFERENCE ONLY (like exampleBlocks.tsx)
 * =====================================================
 *
 * NOT registered in blocks.tsx. This file is the copyable exemplar for
 * bespoke figures: a custom SVG drawing wrapped in the <Figure> shell, driven
 * by the motion toolkit (src/lib/motion.ts) and the global variable store,
 * following FIGURE_DESIGN_LANGUAGE.md exactly — one idea (torque balance),
 * one accent hue, two stroke weights, direct labels, spring-settled motion.
 *
 * Because reference sections are not wired into src/data/variables.ts, this
 * file defines its variables locally and merges them with registerVariables()
 * (the same mechanism dynamically-added explorables use). Real lessons define
 * variables in src/data/variables.ts instead.
 */

import React, { useRef, useState, type ReactElement } from "react";
import { StackLayout } from "@/components/layouts";
import { Block } from "@/components/templates";
import {
    EditableH2,
    EditableParagraph,
    InlineScrubbleNumber,
    InteractionHintSequence,
} from "@/components/atoms";
import { Figure, FigureSlider } from "@/components/molecules";
import { useVar, useSetVar, registerVariables } from "@/stores";
import { clamp, remap, useRafLoop, useSpring, vec2, type Vec2 } from "@/lib/motion";
import { numberPropsFromDefinition, type VariableDefinition } from "../variables";

// ── Variables (local because this file is reference-only) ────────────────────

const figureDemoVariableDefinitions: Record<string, VariableDefinition> = {
    leverRightDistance: {
        defaultValue: 1.5,
        type: "number",
        label: "Right mass distance",
        description: "Distance of the draggable 1 kg mass from the fulcrum",
        unit: "m",
        min: 0.5,
        max: 4.5,
        step: 0.1,
        color: "#62D0AD",
    },
    leverPlaying: {
        defaultValue: false,
        type: "boolean",
        label: "Lever sweep playing",
        description: "Whether the 1 kg mass sweeps along the beam automatically",
    },
};
registerVariables(figureDemoVariableDefinitions);

// ── Domain model ─────────────────────────────────────────────────────────────

const LEFT_MASS = 2; // kg, fixed
const LEFT_DISTANCE = 2; // m, fixed
const RIGHT_MASS = 1; // kg, draggable along the beam
const MIN_DISTANCE = 0.5; // m
const MAX_DISTANCE = 4.5; // m
const DEFAULT_DISTANCE = 1.5; // m — tilted: poses the question, not the answer

// ── View constants (24px+ padding on all sides, safe viewBox) ────────────────

const VIEW_WIDTH = 560;
const VIEW_HEIGHT = 320;
const PIVOT: Vec2 = { x: 280, y: 230 };
const PIXELS_PER_METER = 52;
const BEAM_HALF_LENGTH = 247; // px ≈ 4.75 m each side
const MAX_TILT_DEGREES = 12;

const INK = "#334155"; // labels
const INK_STRUCTURE = "#64748B"; // outlines, beam
const INK_QUIET = "#CBD5E1"; // ticks, ground
const PAPER_FILL = "#F1F5F9"; // fulcrum fill
const ACCENT = "#62D0AD"; // ONE accent: the manipulable mass and its lever arm

// ── The bespoke drawing ──────────────────────────────────────────────────────

function LeverBalanceDrawing() {
    const setVar = useSetVar();
    const distance = useVar<number>("leverRightDistance", DEFAULT_DISTANCE);
    const playing = useVar<boolean>("leverPlaying", false);

    const [dragging, setDragging] = useState(false);
    const [hovered, setHovered] = useState(false);
    const svgRef = useRef<SVGSVGElement>(null);

    // The model draws the view: tilt derives from net torque, never hand-placed.
    const leftTorque = LEFT_MASS * LEFT_DISTANCE;
    const rightTorque = RIGHT_MASS * distance;
    const netTorque = leftTorque - rightTorque; // > 0 → left side sinks
    const targetAngle = clamp(
        remap(netTorque, -leftTorque, leftTorque, MAX_TILT_DEGREES, -MAX_TILT_DEGREES),
        -MAX_TILT_DEGREES,
        MAX_TILT_DEGREES,
    );

    // Spring settle for the beam (physical, slightly under-damped) and a
    // gentle scale-up affordance for the handle on hover/press.
    const angle = useSpring(targetAngle, { stiffness: 120, damping: 14 });
    const handleScale = useSpring(dragging || hovered ? 1.15 : 1, {
        stiffness: 400,
        damping: 26,
    });

    // Play mode: sweep the mass along the beam on the shared rAF loop
    // (real dt / elapsed → frame-rate independent, pauses when hidden).
    useRafLoop(
        (_dt, elapsed) => {
            const sweep = 2.5 + 2 * Math.sin(elapsed * 0.6);
            setVar("leverRightDistance", clamp(sweep, MIN_DISTANCE, MAX_DISTANCE));
        },
        { paused: !playing || dragging },
    );

    // Pointer → SVG viewBox coordinates.
    const svgPointFromEvent = (event: React.PointerEvent): Vec2 => {
        const svg = svgRef.current;
        if (!svg) return { x: 0, y: 0 };
        const rect = svg.getBoundingClientRect();
        return {
            x: ((event.clientX - rect.left) / rect.width) * VIEW_WIDTH,
            y: ((event.clientY - rect.top) / rect.height) * VIEW_HEIGHT,
        };
    };

    // Direct 1:1 tracking during drag: project the pointer onto the beam axis.
    const handlePointerMove = (event: React.PointerEvent<SVGCircleElement>) => {
        if (!dragging) return;
        const point = svgPointFromEvent(event);
        const beamDirection = vec2.rotate({ x: 1, y: 0 }, (angle * Math.PI) / 180);
        const alongBeam = vec2.dot(vec2.sub(point, PIVOT), beamDirection);
        setVar(
            "leverRightDistance",
            clamp(alongBeam / PIXELS_PER_METER, MIN_DISTANCE, MAX_DISTANCE),
        );
    };

    // Positions inside the rotated beam frame (y = beam line).
    const leftMassX = PIVOT.x - LEFT_DISTANCE * PIXELS_PER_METER;
    const handleX = PIVOT.x + distance * PIXELS_PER_METER;
    const handleY = PIVOT.y - 15; // ball rests on the beam
    const balanced = Math.abs(netTorque) < 0.05;

    return (
        <svg
            ref={svgRef}
            viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
            className="block w-full"
            role="img"
            aria-label="Balance beam with a fixed 2 kilogram mass and a draggable 1 kilogram mass"
        >
            <defs>
                {/* Soft shadow: draggable elements only — depth signals "pick me up". */}
                <filter id="figure-demo-handle-shadow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#0F172A" floodOpacity="0.25" />
                </filter>
            </defs>

            {/* Torque readouts — static, tabular-nums so nothing jitters. */}
            <g fontSize="12" style={{ fontVariantNumeric: "tabular-nums" }}>
                <text x="36" y="48" fill={INK}>
                    {`${LEFT_MASS} kg × ${LEFT_DISTANCE.toFixed(1)} m = ${leftTorque.toFixed(1)}`}
                </text>
                <text x="280" y="48" fill={INK} fontWeight="600" textAnchor="middle">
                    {balanced ? "=" : netTorque > 0 ? ">" : "<"}
                </text>
                <text x="524" y="48" fill={ACCENT} textAnchor="end">
                    {`${RIGHT_MASS} kg × ${distance.toFixed(1)} m = ${rightTorque.toFixed(1)}`}
                </text>
            </g>

            {/* Ground and fulcrum — static structure, quiet ink. */}
            <line x1="120" y1="284" x2="440" y2="284" stroke={INK_QUIET} strokeWidth="2" strokeLinecap="round" />
            <polygon
                points="280,232 258,284 302,284"
                fill={PAPER_FILL}
                stroke={INK_STRUCTURE}
                strokeWidth="2"
                strokeLinejoin="round"
            />

            {/* Everything that tilts lives in one rotated group. */}
            <g transform={`rotate(${angle} ${PIVOT.x} ${PIVOT.y})`}>
                {/* Beam — structure weight (2px). */}
                <line
                    x1={PIVOT.x - BEAM_HALF_LENGTH}
                    y1={PIVOT.y}
                    x2={PIVOT.x + BEAM_HALF_LENGTH}
                    y2={PIVOT.y}
                    stroke={INK_STRUCTURE}
                    strokeWidth="2"
                    strokeLinecap="round"
                />

                {/* Meter ticks — grid-level, quieter than ink. */}
                {[-4, -3, -2, -1, 1, 2, 3, 4].map((meters) => (
                    <line
                        key={meters}
                        x1={PIVOT.x + meters * PIXELS_PER_METER}
                        y1={PIVOT.y + 4}
                        x2={PIVOT.x + meters * PIXELS_PER_METER}
                        y2={PIVOT.y + 10}
                        stroke={INK_QUIET}
                        strokeWidth="2"
                        strokeLinecap="round"
                    />
                ))}

                {/* Fixed 2 kg mass — ink element, deliberately NOT grabbable-looking. */}
                <rect x={leftMassX - 17} y={PIVOT.y - 32} width="34" height="30" rx="4" fill={INK_STRUCTURE} />
                <text x={leftMassX} y={PIVOT.y - 42} fill={INK} fontSize="12" textAnchor="middle">
                    2 kg
                </text>

                {/* Lever arm — the concept quantity, accent and heaviest stroke (3.5px). */}
                <line
                    x1={PIVOT.x}
                    y1={PIVOT.y}
                    x2={handleX}
                    y2={PIVOT.y}
                    stroke={ACCENT}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                />

                {/* Draggable 1 kg mass — accent handle with full affordances:
                    14px radius, soft shadow, grab cursor, spring scale on hover. */}
                <g transform={`translate(${handleX} ${handleY}) scale(${handleScale})`}>
                    <circle r="14" fill={ACCENT} filter="url(#figure-demo-handle-shadow)" />
                </g>
                <text x={handleX} y={handleY - 26} fill={INK} fontSize="12" textAnchor="middle">
                    1 kg
                </text>
                {/* Oversized invisible hit area (24px radius ≥ touch target). */}
                <circle
                    cx={handleX}
                    cy={handleY}
                    r="24"
                    fill="transparent"
                    style={{ cursor: dragging ? "grabbing" : "grab", touchAction: "none" }}
                    onPointerDown={(event) => {
                        event.currentTarget.setPointerCapture(event.pointerId);
                        setDragging(true);
                    }}
                    onPointerMove={handlePointerMove}
                    onPointerUp={() => setDragging(false)}
                    onPointerCancel={() => setDragging(false)}
                    onPointerEnter={() => setHovered(true)}
                    onPointerLeave={() => setHovered(false)}
                />
            </g>
        </svg>
    );
}

// ── Figure shell composition ─────────────────────────────────────────────────

function LeverBalanceFigure() {
    const setVar = useSetVar();

    return (
        <Figure
            id="figure-demo-lever-balance"
            playable
            playVarName="leverPlaying"
            onReset={() => {
                setVar("leverRightDistance", DEFAULT_DISTANCE);
                setVar("leverPlaying", false);
            }}
            caption="A 2 kg mass sits 2 m left of the fulcrum. Drag the teal 1 kg mass — or press play — and watch the beam settle where the torques lead it."
        >
            <LeverBalanceDrawing />
            <div className="px-6 pb-5">
                <FigureSlider
                    varName="leverRightDistance"
                    label="Distance from fulcrum"
                    {...numberPropsFromDefinition(figureDemoVariableDefinitions.leverRightDistance)}
                    formatValue={(v) => `${v.toFixed(1)} m`}
                />
            </div>
            <InteractionHintSequence
                hintKey="figure-demo-lever-drag"
                steps={[
                    {
                        gesture: "drag-horizontal",
                        label: "Drag the teal mass along the beam",
                        position: { x: "64%", y: "48%" },
                        dragPath: {
                            type: "line",
                            startOffset: { x: -30, y: 0 },
                            endOffset: { x: 30, y: 0 },
                        },
                    },
                ]}
            />
        </Figure>
    );
}

// ── Exported demo blocks (flat array, one component per Block) ───────────────

export const figureDemoBlocks: ReactElement[] = [
    <StackLayout key="layout-figure-demo-heading" maxWidth="xl">
        <Block id="figure-demo-heading" padding="md">
            <EditableH2 id="h2-figure-demo-heading" blockId="figure-demo-heading">
                Balancing a lever
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-figure-demo-explanation" maxWidth="xl">
        <Block id="figure-demo-explanation" padding="sm">
            <EditableParagraph id="para-figure-demo-explanation" blockId="figure-demo-explanation">
                A lever balances when the torques on both sides match — mass times
                distance from the fulcrum. With the 1 kg mass sitting{" "}
                <InlineScrubbleNumber
                    varName="leverRightDistance"
                    {...numberPropsFromDefinition(figureDemoVariableDefinitions.leverRightDistance)}
                    formatValue={(v) => `${v.toFixed(1)} m`}
                />{" "}
                from the fulcrum, which way does the beam tip? Somewhere along the
                beam there is exactly one spot where it levels out.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-figure-demo-lever" maxWidth="xl">
        <Block id="figure-demo-lever" padding="sm" hasVisualization>
            <LeverBalanceFigure />
        </Block>
    </StackLayout>,
];
