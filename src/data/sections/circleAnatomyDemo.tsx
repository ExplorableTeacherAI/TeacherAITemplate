import { type ReactElement } from "react";
import { StackLayout, SplitLayout } from "@/components/layouts";
import { Block } from "@/components/templates";
import {
    Cartesian2D,
    EditableH4,
    EditableParagraph,
    InlineLinkedHighlight,
    InlineFormula,
} from "@/components/atoms";
import { useVar } from "@/stores";
import {
    getExampleVariableInfo,
    linkedHighlightPropsFromDefinition,
} from "../exampleVariables";

// ── Reactive Circle Anatomy Visualization ────────────────────────────────────

/**
 * A Cartesian2D plot showing a circle with distinctly-coloured parts:
 * centre point, radius segment, diameter segment, and circumference outline.
 * Each part carries a `highlightId` so hovering the corresponding
 * `InlineLinkedHighlight` in the text highlights it in the graph.
 *
 * The radius is read from the store (`circleRadius`) so it responds
 * to the `InlineScrubbleNumber` in the text.
 */
function ReactiveCircleAnatomy() {
    const r = useVar("circleRadius", 2) as number;

    // Derived quantities for visual annotations
    const angle = Math.PI / 4; // 45° for radius line
    const rx = r * Math.cos(angle);
    const ry = r * Math.sin(angle);

    return (
        <Cartesian2D
            height={420}
            viewBox={{ x: [-5, 5], y: [-5, 5] }}
            highlightVarName="circleHighlight"
            plots={[
                // ── Circumference (outline) ──────────────────────────
                {
                    type: "circle",
                    center: [0, 0],
                    radius: r,
                    color: "#8b5cf6",
                    fillOpacity: 0.06,
                    highlightId: "circumference",
                },

                // ── Diameter segment (horizontal, full) ──────────────
                {
                    type: "segment",
                    point1: [-r, 0],
                    point2: [r, 0],
                    color: "#f97316",
                    weight: 2.5,
                    style: "dashed",
                    highlightId: "diameter",
                },
                // Diameter end-points
                { type: "point", x: -r, y: 0, color: "#f97316", highlightId: "diameter" },
                { type: "point", x: r, y: 0, color: "#f97316", highlightId: "diameter" },

                // ── Radius segment (from centre to point on circle) ──
                {
                    type: "vector",
                    tail: [0, 0],
                    tip: [rx, ry],
                    color: "#ef4444",
                    weight: 2.5,
                    highlightId: "radius",
                },

                // ── Area fill ────────────────────────────────────────
                // Show as a larger, more opaque circle behind the outline
                {
                    type: "circle",
                    center: [0, 0],
                    radius: r,
                    color: "#22c55e",
                    fillOpacity: 0.12,
                    strokeStyle: "dashed",
                    highlightId: "area",
                },

                // ── Centre point (drawn last so it sits on top) ──────
                { type: "point", x: 0, y: 0, color: "#3b82f6", highlightId: "center" },
            ]}
        />
    );
}

// ── Exported demo blocks ─────────────────────────────────────────────────────

export const circleAnatomyDemo: ReactElement[] = [
    // ── Title ─────────────────────────────────────────────────────────────
    <StackLayout key="layout-circle-anatomy-title" maxWidth="xl">
        <Block id="circle-anatomy-title" padding="sm">
            <EditableH4 id="h4-circle-anatomy-title" blockId="circle-anatomy-title">
                Circle Anatomy — Linked Highlights on a 2D Graph
            </EditableH4>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-circle-anatomy-intro" maxWidth="xl">
        <Block id="circle-anatomy-intro" padding="sm">
            <EditableParagraph id="para-circle-anatomy-intro" blockId="circle-anatomy-intro">
                A circle is defined entirely by its center point and radius. From these two simple ingredients emerge all the other properties: diameter, circumference, and area. Understanding how these parts relate helps build intuition for circular geometry.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // ── Split: text (left) + Cartesian graph (right) ─────────────────────
    <SplitLayout key="layout-circle-anatomy-split" ratio="1:1" gap="lg">
        <div className="space-y-4">
            <Block id="circle-anatomy-description" padding="sm">
                <EditableParagraph id="para-circle-anatomy-description" blockId="circle-anatomy-description">
                    Every circle can be placed on a coordinate plane, making its geometry precise and measurable. The visualization shows a circle centered at the origin, with its key parts highlighted as you interact with the text.
                </EditableParagraph>
            </Block>

            <Block id="circle-anatomy-parts" padding="sm">
                <EditableParagraph id="para-circle-anatomy-parts" blockId="circle-anatomy-parts">
                    The{" "}
                    <InlineLinkedHighlight
                        varName="circleHighlight"
                        highlightId="center"
                        {...linkedHighlightPropsFromDefinition(
                            getExampleVariableInfo("circleHighlight")
                        )}
                        color="#3b82f6"
                    >
                        centre
                    </InlineLinkedHighlight>{" "}
                    is the fixed point from which every point on the circle is equidistant.
                    The{" "}
                    <InlineLinkedHighlight
                        varName="circleHighlight"
                        highlightId="radius"
                        {...linkedHighlightPropsFromDefinition(
                            getExampleVariableInfo("circleHighlight")
                        )}
                        color="#ef4444"
                    >
                        radius
                    </InlineLinkedHighlight>{" "}
                    is the distance from the centre to any point on the edge.
                    The{" "}
                    <InlineLinkedHighlight
                        varName="circleHighlight"
                        highlightId="diameter"
                        {...linkedHighlightPropsFromDefinition(
                            getExampleVariableInfo("circleHighlight")
                        )}
                        color="#f97316"
                    >
                        diameter
                    </InlineLinkedHighlight>{" "}
                    passes through the centre and is exactly twice the radius.
                </EditableParagraph>
            </Block>

            <Block id="circle-anatomy-measures" padding="sm">
                <EditableParagraph id="para-circle-anatomy-measures" blockId="circle-anatomy-measures">
                    The{" "}
                    <InlineLinkedHighlight
                        varName="circleHighlight"
                        highlightId="circumference"
                        {...linkedHighlightPropsFromDefinition(
                            getExampleVariableInfo("circleHighlight")
                        )}
                        color="#8b5cf6"
                    >
                        circumference
                    </InlineLinkedHighlight>{" "}
                    is the total length around the circle, given by{" "}
                    <InlineFormula
                        latex="C = 2\pi r"
                        colorMap={{ C: "#8b5cf6", r: "#ef4444" }}
                    />. The{" "}
                    <InlineLinkedHighlight
                        varName="circleHighlight"
                        highlightId="area"
                        {...linkedHighlightPropsFromDefinition(
                            getExampleVariableInfo("circleHighlight")
                        )}
                        color="#22c55e"
                    >
                        area
                    </InlineLinkedHighlight>{" "}
                    enclosed by the circle is{" "}
                    <InlineFormula
                        latex="A = \pi r^2"
                        colorMap={{ A: "#22c55e", r: "#ef4444" }}
                    />.
                </EditableParagraph>
            </Block>

            <Block id="circle-anatomy-hint" padding="sm">
                <EditableParagraph id="para-circle-anatomy-hint" blockId="circle-anatomy-hint">
                    💡 Hover the coloured terms to highlight parts on the plot, or hover
                    elements on the plot to highlight the matching term in the text.
                    Drag the radius value to resize the circle interactively.
                </EditableParagraph>
            </Block>
        </div>

        <Block id="circle-anatomy-viz" padding="sm" hasVisualization>
            <ReactiveCircleAnatomy />
        </Block>
    </SplitLayout>,
];
