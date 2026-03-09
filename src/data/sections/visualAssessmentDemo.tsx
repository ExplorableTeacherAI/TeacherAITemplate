import { type ReactElement, useCallback, useMemo } from "react";
import { StackLayout, SplitLayout } from "@/components/layouts";
import { Block } from "@/components/templates";
import {
    Cartesian2D,
    EditableH3,
    EditableH4,
    EditableParagraph,
} from "@/components/atoms";
import type { PlotItem } from "@/components/atoms";
import { useVar, useSetVar } from "@/stores";

// ══════════════════════════════════════════════════════════════════════════════
// VISUAL ASSESSMENT DEMO
// ══════════════════════════════════════════════════════════════════════════════
//
// This file demonstrates visual/interactive assessment tasks where students
// demonstrate understanding through interaction with visualizations, not just
// text input.
//
// Task types demonstrated:
// 1. Position Task - Drag a point to a specific location
// 2. Construction Task - Use movable points to draw/construct elements
// 3. Selection Task - Click on the correct element
// ══════════════════════════════════════════════════════════════════════════════

// ── Helper: Distance between two points ──────────────────────────────────────
function distance(p1: [number, number], p2: [number, number]): number {
    return Math.sqrt((p1[0] - p2[0]) ** 2 + (p1[1] - p2[1]) ** 2);
}

// ══════════════════════════════════════════════════════════════════════════════
// TASK 1: Draw a Radius
// ══════════════════════════════════════════════════════════════════════════════
// Student must drag an endpoint to the circle's edge to create a valid radius.
// The starting point is fixed at the center.

function DrawRadiusTask() {
    const setVar = useSetVar();
    const taskStatus = useVar("radiusTaskStatus", "pending") as string;
    const circleRadius = 3;
    const tolerance = 0.4; // How close the endpoint needs to be

    // Validation function for radius
    const validateRadius = useCallback(
        (endpoint: [number, number]) => {
            const distanceFromCenter = distance(endpoint, [0, 0]);
            const isOnCircle = Math.abs(distanceFromCenter - circleRadius) < tolerance;

            if (isOnCircle) {
                setVar("radiusTaskStatus", "correct");
            } else if (distanceFromCenter < circleRadius - tolerance) {
                setVar("radiusTaskStatus", "inside");
            } else if (distanceFromCenter > circleRadius + tolerance) {
                setVar("radiusTaskStatus", "outside");
            } else {
                setVar("radiusTaskStatus", "pending");
            }
        },
        [setVar, circleRadius, tolerance]
    );

    // Color based on status
    const lineColor = useMemo(() => {
        switch (taskStatus) {
            case "correct":
                return "#22c55e"; // green
            case "inside":
            case "outside":
                return "#f59e0b"; // amber
            default:
                return "#3b82f6"; // blue
        }
    }, [taskStatus]);

    return (
        <Cartesian2D
            height={350}
            viewBox={{ x: [-5, 5], y: [-5, 5] }}
            movablePoints={[
                {
                    initial: [1.5, 1.5],
                    color: lineColor,
                    onChange: (point) => validateRadius(point as [number, number]),
                },
            ]}
            dynamicPlots={([endpoint]) => {
                const plots: PlotItem[] = [
                    // The circle
                    {
                        type: "circle",
                        center: [0, 0],
                        radius: circleRadius,
                        color: "#64748b",
                        fillOpacity: 0.05,
                    },
                    // Center point (fixed)
                    {
                        type: "point",
                        x: 0,
                        y: 0,
                        color: "#3b82f6",
                    },
                    // The line from center to draggable endpoint
                    {
                        type: "segment",
                        point1: [0, 0],
                        point2: endpoint,
                        color: lineColor,
                        weight: 3,
                    },
                ];

                // Show success indicator
                if (taskStatus === "correct") {
                    plots.push({
                        type: "point",
                        x: endpoint[0],
                        y: endpoint[1],
                        color: "#22c55e",
                    });
                }

                return plots;
            }}
        />
    );
}

// ══════════════════════════════════════════════════════════════════════════════
// TASK 2: Find the Midpoint
// ══════════════════════════════════════════════════════════════════════════════
// Given two fixed points, student must drag a third point to the midpoint.

function FindMidpointTask() {
    const setVar = useSetVar();
    const taskStatus = useVar("midpointTaskStatus", "pending") as string;

    // Fixed endpoints
    const pointA: [number, number] = [-3, -2];
    const pointB: [number, number] = [3, 2];
    const correctMidpoint: [number, number] = [
        (pointA[0] + pointB[0]) / 2,
        (pointA[1] + pointB[1]) / 2,
    ];
    const tolerance = 0.5;

    const validateMidpoint = useCallback(
        (guess: [number, number]) => {
            const dist = distance(guess, correctMidpoint);
            if (dist < tolerance) {
                setVar("midpointTaskStatus", "correct");
            } else {
                setVar("midpointTaskStatus", "incorrect");
            }
        },
        [setVar]
    );

    const pointColor = taskStatus === "correct" ? "#22c55e" : "#ef4444";

    return (
        <Cartesian2D
            height={350}
            viewBox={{ x: [-5, 5], y: [-5, 5] }}
            movablePoints={[
                {
                    initial: [1, 1],
                    color: pointColor,
                    onChange: (point) => validateMidpoint(point as [number, number]),
                },
            ]}
            dynamicPlots={([_guess]) => {
                const plots: PlotItem[] = [
                    // Line segment AB
                    {
                        type: "segment",
                        point1: pointA,
                        point2: pointB,
                        color: "#64748b",
                        weight: 2,
                    },
                    // Fixed point A
                    {
                        type: "point",
                        x: pointA[0],
                        y: pointA[1],
                        color: "#3b82f6",
                    },
                    // Fixed point B
                    {
                        type: "point",
                        x: pointB[0],
                        y: pointB[1],
                        color: "#3b82f6",
                    },
                ];

                // Show correct location when solved
                if (taskStatus === "correct") {
                    plots.push({
                        type: "point",
                        x: correctMidpoint[0],
                        y: correctMidpoint[1],
                        color: "#22c55e",
                    });
                }

                return plots;
            }}
        />
    );
}

// ══════════════════════════════════════════════════════════════════════════════
// TASK 3: Position the Vertex
// ══════════════════════════════════════════════════════════════════════════════
// Given a target area, student must position the triangle's apex to achieve it.

function PositionVertexTask() {
    const setVar = useSetVar();
    const taskStatus = useVar("vertexTaskStatus", "pending") as string;
    // Note: currentArea is read in the feedback component via useVar

    // Fixed base from (-3, 0) to (3, 0), length = 6
    const baseLength = 6;
    const targetArea = 9; // Target: area = 9, so height must be 3
    const tolerance = 0.5;

    const validateArea = useCallback(
        (apex: [number, number]) => {
            // Area = 0.5 * base * height, where height is |y| of apex
            const height = Math.abs(apex[1]);
            const area = 0.5 * baseLength * height;
            setVar("triangleArea", parseFloat(area.toFixed(1)));

            if (Math.abs(area - targetArea) < tolerance) {
                setVar("vertexTaskStatus", "correct");
            } else {
                setVar("vertexTaskStatus", "incorrect");
            }
        },
        [setVar]
    );

    const apexColor = taskStatus === "correct" ? "#22c55e" : "#ef4444";

    return (
        <Cartesian2D
            height={350}
            viewBox={{ x: [-5, 5], y: [-1, 6] }}
            movablePoints={[
                {
                    initial: [0, 2],
                    color: apexColor,
                    constrain: "vertical", // Only allow vertical movement
                    onChange: (point) => validateArea(point as [number, number]),
                },
            ]}
            dynamicPlots={([apex]) => {
                const plots: PlotItem[] = [
                    // Base of triangle
                    {
                        type: "segment",
                        point1: [-3, 0],
                        point2: [3, 0],
                        color: "#3b82f6",
                        weight: 3,
                    },
                    // Left side
                    {
                        type: "segment",
                        point1: [-3, 0],
                        point2: apex,
                        color: apexColor,
                        weight: 2,
                    },
                    // Right side
                    {
                        type: "segment",
                        point1: [3, 0],
                        point2: apex,
                        color: apexColor,
                        weight: 2,
                    },
                    // Height line (dashed)
                    {
                        type: "segment",
                        point1: [apex[0], 0],
                        point2: apex,
                        color: "#64748b",
                        weight: 1,
                        style: "dashed",
                    },
                    // Base endpoints
                    { type: "point", x: -3, y: 0, color: "#3b82f6" },
                    { type: "point", x: 3, y: 0, color: "#3b82f6" },
                ];

                return plots;
            }}
        />
    );
}

// ══════════════════════════════════════════════════════════════════════════════
// TASK 4: Construct a Perpendicular
// ══════════════════════════════════════════════════════════════════════════════
// Given a horizontal line, student must position a point to create a perpendicular.

function ConstructPerpendicularTask() {
    const setVar = useSetVar();
    const taskStatus = useVar("perpTaskStatus", "pending") as string;

    // The horizontal line is y = 0 from x = -4 to x = 4
    // A valid perpendicular touches the line at some point and goes straight up or down
    const tolerance = 0.3;

    const validatePerpendicular = useCallback(
        (lineEnd: [number, number]) => {
            // The line starts at (0, 0) - check if endpoint is directly above/below
            const isVertical = Math.abs(lineEnd[0]) < tolerance;
            const hasLength = Math.abs(lineEnd[1]) > 1; // Must have some length

            if (isVertical && hasLength) {
                setVar("perpTaskStatus", "correct");
            } else {
                setVar("perpTaskStatus", "incorrect");
            }
        },
        [setVar]
    );

    const lineColor = taskStatus === "correct" ? "#22c55e" : "#ef4444";

    return (
        <Cartesian2D
            height={350}
            viewBox={{ x: [-5, 5], y: [-5, 5] }}
            movablePoints={[
                {
                    initial: [1, 2],
                    color: lineColor,
                    onChange: (point) => validatePerpendicular(point as [number, number]),
                },
            ]}
            dynamicPlots={([endpoint]) => {
                const plots: PlotItem[] = [
                    // The horizontal reference line
                    {
                        type: "segment",
                        point1: [-4, 0],
                        point2: [4, 0],
                        color: "#64748b",
                        weight: 3,
                    },
                    // Origin point (where perpendicular should start)
                    {
                        type: "point",
                        x: 0,
                        y: 0,
                        color: "#3b82f6",
                    },
                    // The student's line
                    {
                        type: "segment",
                        point1: [0, 0],
                        point2: endpoint,
                        color: lineColor,
                        weight: 2.5,
                    },
                ];

                // Show right angle indicator when correct
                if (taskStatus === "correct") {
                    // Small square to indicate 90°
                    const squareSize = 0.4;
                    const dir = endpoint[1] > 0 ? 1 : -1;
                    plots.push(
                        {
                            type: "segment",
                            point1: [squareSize, 0],
                            point2: [squareSize, squareSize * dir],
                            color: "#22c55e",
                            weight: 1.5,
                        },
                        {
                            type: "segment",
                            point1: [squareSize, squareSize * dir],
                            point2: [0, squareSize * dir],
                            color: "#22c55e",
                            weight: 1.5,
                        }
                    );
                }

                return plots;
            }}
        />
    );
}

// ══════════════════════════════════════════════════════════════════════════════
// EXPORTED DEMO BLOCKS
// ══════════════════════════════════════════════════════════════════════════════

export const visualAssessmentDemoBlocks: ReactElement[] = [
    // ── Title ─────────────────────────────────────────────────────────────
    <StackLayout key="layout-visual-assessment-title" maxWidth="xl">
        <Block id="visual-assessment-title" padding="sm">
            <EditableH3 id="h3-visual-assessment-title" blockId="visual-assessment-title">
                Visual Assessment Tasks
            </EditableH3>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-visual-assessment-intro" maxWidth="xl">
        <Block id="visual-assessment-intro" padding="sm">
            <EditableParagraph id="para-visual-assessment-intro" blockId="visual-assessment-intro">
                These tasks test your understanding through interaction, not just text input.
                Drag points, construct shapes, and demonstrate what you know visually.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // ══════════════════════════════════════════════════════════════════════
    // TASK 1: Draw a Radius
    // ══════════════════════════════════════════════════════════════════════
    <StackLayout key="layout-radius-task-title" maxWidth="xl">
        <Block id="radius-task-title" padding="sm">
            <EditableH4 id="h4-radius-task-title" blockId="radius-task-title">
                Task 1: Draw a Radius
            </EditableH4>
        </Block>
    </StackLayout>,

    <SplitLayout key="layout-radius-task" ratio="1:1" gap="lg">
        <div className="space-y-4">
            <Block id="radius-task-instruction" padding="sm">
                <EditableParagraph id="para-radius-task-instruction" blockId="radius-task-instruction">
                    Draw a radius of the circle. Drag the endpoint to complete your construction.
                </EditableParagraph>
            </Block>
            <Block id="radius-task-feedback" padding="sm">
                <RadiusTaskFeedback />
            </Block>
        </div>
        <Block id="radius-task-viz" padding="none">
            <DrawRadiusTask />
        </Block>
    </SplitLayout>,

    // ══════════════════════════════════════════════════════════════════════
    // TASK 2: Find the Midpoint
    // ══════════════════════════════════════════════════════════════════════
    <StackLayout key="layout-midpoint-task-title" maxWidth="xl">
        <Block id="midpoint-task-title" padding="sm">
            <EditableH4 id="h4-midpoint-task-title" blockId="midpoint-task-title">
                Task 2: Find the Midpoint
            </EditableH4>
        </Block>
    </StackLayout>,

    <SplitLayout key="layout-midpoint-task" ratio="1:1" gap="lg">
        <div className="space-y-4">
            <Block id="midpoint-task-instruction" padding="sm">
                <EditableParagraph id="para-midpoint-task-instruction" blockId="midpoint-task-instruction">
                    Find the midpoint of segment AB. Drag the red point to where you think the midpoint is.
                </EditableParagraph>
            </Block>
            <Block id="midpoint-task-feedback" padding="sm">
                <MidpointTaskFeedback />
            </Block>
        </div>
        <Block id="midpoint-task-viz" padding="none">
            <FindMidpointTask />
        </Block>
    </SplitLayout>,

    // ══════════════════════════════════════════════════════════════════════
    // TASK 3: Position the Vertex (Area Target)
    // ══════════════════════════════════════════════════════════════════════
    <StackLayout key="layout-vertex-task-title" maxWidth="xl">
        <Block id="vertex-task-title" padding="sm">
            <EditableH4 id="h4-vertex-task-title" blockId="vertex-task-title">
                Task 3: Position the Vertex
            </EditableH4>
        </Block>
    </StackLayout>,

    <SplitLayout key="layout-vertex-task" ratio="1:1" gap="lg">
        <div className="space-y-4">
            <Block id="vertex-task-instruction" padding="sm">
                <EditableParagraph id="para-vertex-task-instruction" blockId="vertex-task-instruction">
                    Move the vertex up or down to create a triangle with area exactly 9 square units.
                    The base has length 6.
                </EditableParagraph>
            </Block>
            <Block id="vertex-task-feedback" padding="sm">
                <VertexTaskFeedback />
            </Block>
        </div>
        <Block id="vertex-task-viz" padding="none">
            <PositionVertexTask />
        </Block>
    </SplitLayout>,

    // ══════════════════════════════════════════════════════════════════════
    // TASK 4: Construct a Perpendicular
    // ══════════════════════════════════════════════════════════════════════
    <StackLayout key="layout-perp-task-title" maxWidth="xl">
        <Block id="perp-task-title" padding="sm">
            <EditableH4 id="h4-perp-task-title" blockId="perp-task-title">
                Task 4: Construct a Perpendicular
            </EditableH4>
        </Block>
    </StackLayout>,

    <SplitLayout key="layout-perp-task" ratio="1:1" gap="lg">
        <div className="space-y-4">
            <Block id="perp-task-instruction" padding="sm">
                <EditableParagraph id="para-perp-task-instruction" blockId="perp-task-instruction">
                    Construct a line perpendicular to the horizontal line, passing through the marked point.
                </EditableParagraph>
            </Block>
            <Block id="perp-task-feedback" padding="sm">
                <PerpTaskFeedback />
            </Block>
        </div>
        <Block id="perp-task-viz" padding="none">
            <ConstructPerpendicularTask />
        </Block>
    </SplitLayout>,
];

// ══════════════════════════════════════════════════════════════════════════════
// FEEDBACK COMPONENTS
// ══════════════════════════════════════════════════════════════════════════════
// These components read the task status and display appropriate feedback.

function RadiusTaskFeedback() {
    const status = useVar("radiusTaskStatus", "pending") as string;

    if (status === "correct") {
        return (
            <EditableParagraph id="para-radius-feedback-success" blockId="radius-task-feedback">
                <span className="text-green-600 font-medium">
                    Excellent! That is a valid radius — it connects the centre to the circumference.
                </span>
            </EditableParagraph>
        );
    }

    if (status === "inside") {
        return (
            <EditableParagraph id="para-radius-feedback-inside" blockId="radius-task-feedback">
                <span className="text-amber-600">
                    The endpoint is inside the circle. A radius must reach all the way to the edge.
                </span>
            </EditableParagraph>
        );
    }

    if (status === "outside") {
        return (
            <EditableParagraph id="para-radius-feedback-outside" blockId="radius-task-feedback">
                <span className="text-amber-600">
                    The endpoint is outside the circle. Pull it back so it touches the edge exactly.
                </span>
            </EditableParagraph>
        );
    }

    return (
        <EditableParagraph id="para-radius-feedback-pending" blockId="radius-task-feedback">
            <span className="text-slate-500">
                Drag the blue point to complete the radius.
            </span>
        </EditableParagraph>
    );
}

function MidpointTaskFeedback() {
    const status = useVar("midpointTaskStatus", "pending") as string;

    if (status === "correct") {
        return (
            <EditableParagraph id="para-midpoint-feedback-success" blockId="midpoint-task-feedback">
                <span className="text-green-600 font-medium">
                    Perfect! The midpoint M is exactly halfway between A and B.
                </span>
            </EditableParagraph>
        );
    }

    if (status === "incorrect") {
        return (
            <EditableParagraph id="para-midpoint-feedback-hint" blockId="midpoint-task-feedback">
                <span className="text-amber-600">
                    Not quite. Think about where the point would be if you folded the segment in half.
                </span>
            </EditableParagraph>
        );
    }

    return (
        <EditableParagraph id="para-midpoint-feedback-pending" blockId="midpoint-task-feedback">
            <span className="text-slate-500">
                Drag the red point to where you think the midpoint is.
            </span>
        </EditableParagraph>
    );
}

function VertexTaskFeedback() {
    const status = useVar("vertexTaskStatus", "pending") as string;
    const area = useVar("triangleArea", 0) as number;

    if (status === "correct") {
        return (
            <EditableParagraph id="para-vertex-feedback-success" blockId="vertex-task-feedback">
                <span className="text-green-600 font-medium">
                    Excellent! Area = ½ × base × height = ½ × 6 × 3 = 9 square units.
                </span>
            </EditableParagraph>
        );
    }

    return (
        <EditableParagraph id="para-vertex-feedback-area" blockId="vertex-task-feedback">
            <span className={area < 9 ? "text-amber-600" : area > 9 ? "text-amber-600" : "text-slate-500"}>
                Current area: {area} square units. {area < 9 ? "Move the vertex higher." : area > 9 ? "Move the vertex lower." : ""}
            </span>
        </EditableParagraph>
    );
}

function PerpTaskFeedback() {
    const status = useVar("perpTaskStatus", "pending") as string;

    if (status === "correct") {
        return (
            <EditableParagraph id="para-perp-feedback-success" blockId="perp-task-feedback">
                <span className="text-green-600 font-medium">
                    Perfect! The line is perpendicular — it forms a 90° angle with the horizontal.
                </span>
            </EditableParagraph>
        );
    }

    if (status === "incorrect") {
        return (
            <EditableParagraph id="para-perp-feedback-hint" blockId="perp-task-feedback">
                <span className="text-amber-600">
                    Not quite perpendicular. A perpendicular line goes straight up or down.
                </span>
            </EditableParagraph>
        );
    }

    return (
        <EditableParagraph id="para-perp-feedback-pending" blockId="perp-task-feedback">
            <span className="text-slate-500">
                Drag the point to create a perpendicular line.
            </span>
        </EditableParagraph>
    );
}
