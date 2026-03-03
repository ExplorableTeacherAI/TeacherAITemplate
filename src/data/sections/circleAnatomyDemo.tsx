import { type ReactElement } from "react";
import { StackLayout, SplitLayout } from "@/components/layouts";
import { Block } from "@/components/templates";
import {
    Cartesian2D,
    EditableH2,
    EditableParagraph,
    InlineLinkedHighlight,
    InlineScrubbleNumber,
    InlineFormula,
} from "@/components/atoms";
import { useVar } from "@/stores";
import {
    getExampleVariableInfo,
    numberPropsFromDefinition,
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
                { type: "point", x: r,  y: 0, color: "#f97316", highlightId: "diameter" },

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
    <StackLayout key="layout-ca-title" maxWidth="xl">
        <Block id="block-ca-title" padding="sm">
            <EditableH2 id="h2-ca-title" blockId="block-ca-title">
                Circle Anatomy — Linked Highlights on a 2D Graph
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-ca-intro" maxWidth="xl">
        <Block id="block-ca-intro" padding="sm">
            <EditableParagraph id="para-ca-intro" blockId="block-ca-intro">
                Hover over any term below to highlight the corresponding part of the circle
                on the Cartesian plot. Drag the radius value to resize the circle and watch
                all measurements update in real time.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // ── Split: text (left) + Cartesian graph (right) ─────────────────────
    <SplitLayout key="layout-ca-split" ratio="1:1" gap="lg">
        <div className="space-y-4">
            <Block id="block-ca-description" padding="sm">
                <EditableParagraph id="para-ca-description" blockId="block-ca-description">
                    A circle with radius{" "}
                    <InlineScrubbleNumber
                        varName="circleRadius"
                        {...numberPropsFromDefinition(getExampleVariableInfo("circleRadius"))}
                        formatValue={(v) => v.toFixed(1)}
                    />{" "}
                    is drawn on the coordinate plane. Its key parts are:
                </EditableParagraph>
            </Block>

            <Block id="block-ca-parts" padding="sm">
                <EditableParagraph id="para-ca-parts" blockId="block-ca-parts">
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

            <Block id="block-ca-measures" padding="sm">
                <EditableParagraph id="para-ca-measures" blockId="block-ca-measures">
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

            <Block id="block-ca-hint" padding="sm">
                <EditableParagraph id="para-ca-hint" blockId="block-ca-hint">
                    💡 Hover the coloured terms to highlight parts on the plot, or hover
                    elements on the plot to highlight the matching term in the text.
                    Drag the radius value to resize the circle interactively.
                </EditableParagraph>
            </Block>
        </div>

        <Block id="block-ca-viz" padding="sm" hasVisualization>
            <ReactiveCircleAnatomy />
        </Block>
    </SplitLayout>,
];
