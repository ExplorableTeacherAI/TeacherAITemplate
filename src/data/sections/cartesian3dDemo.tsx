import { type ReactElement } from "react";
import { FullWidthLayout, SplitLayout } from "@/components/layouts";
import { Block } from "@/components/templates";
import {
    Cartesian3D,
    EditableH1,
    EditableH2,
    EditableParagraph,
    InlineLinkedHighlight,
    InlineScrubbleNumber,
    InlineSpotColor,
    InlineTrigger,
} from "@/components/atoms";
import { FormulaBlock } from "@/components/molecules";
import { useVar } from "@/stores";
import {
    getExampleVariableInfo,
    numberPropsFromDefinition,
    linkedHighlightPropsFromDefinition,
    spotColorPropsFromDefinition,
} from "../exampleVariables";

// ── Demo 1: Static Vectors & Points ──────────────────────────────────────────

function VectorsAndPointsViz() {
    return (
        <Cartesian3D
            height={420}
            axisLength={4}
            highlightVarName="c3dHighlight"
            plots={[
                // Two vectors from origin
                {
                    type: "vector",
                    tip: [3, 1, 0],
                    color: "#EF4444",
                    highlightId: "vecA",
                },
                {
                    type: "vector",
                    tip: [0, 2, 3],
                    color: "#3B82F6",
                    highlightId: "vecB",
                },
                // Cross product: a × b = (1·3 − 0·2, 0·0 − 3·3, 3·2 − 1·0) = (3, −9, 6)
                // Scaled down to fit nicely
                {
                    type: "vector",
                    tip: [0.5, -1.5, 1],
                    color: "#22C55E",
                    highlightId: "vecCross",
                },
                // Static points at the tips
                {
                    type: "point",
                    position: [3, 1, 0],
                    color: "#EF4444",
                    size: 0.12,
                    highlightId: "vecA",
                },
                {
                    type: "point",
                    position: [0, 2, 3],
                    color: "#3B82F6",
                    size: 0.12,
                    highlightId: "vecB",
                },
                // Dashed segment connecting the two tips
                {
                    type: "segment",
                    point1: [3, 1, 0],
                    point2: [0, 2, 3],
                    color: "#9CA3AF",
                    dashed: true,
                    lineWidth: 1,
                },
            ]}
        />
    );
}

// ── Demo 2: Parametric Helix ─────────────────────────────────────────────────

function ReactiveHelixViz() {
    const turns = useVar("helixTurns", 3) as number;
    const radius = useVar("helixRadius", 2) as number;

    return (
        <Cartesian3D
            height={420}
            axisLength={4}
            cameraPosition={[7, 5, 7]}
            plots={[
                {
                    type: "parametric",
                    xyz: (t) => [
                        radius * Math.cos(t),
                        t / (2 * Math.PI),
                        radius * Math.sin(t),
                    ],
                    tRange: [0, turns * 2 * Math.PI],
                    samples: 300,
                    color: "#8B5CF6",
                    lineWidth: 3,
                },
                // Shadow projection on the XZ plane (y=0)
                {
                    type: "parametric",
                    xyz: (t) => [
                        radius * Math.cos(t),
                        0,
                        radius * Math.sin(t),
                    ],
                    tRange: [0, turns * 2 * Math.PI],
                    samples: 150,
                    color: "#C4B5FD",
                    lineWidth: 1,
                },
                // Point at the start of the helix
                {
                    type: "point",
                    position: [radius, 0, 0],
                    color: "#F59E0B",
                    size: 0.12,
                },
            ]}
        />
    );
}

// ── Demo 3: Reactive Surface Plot ────────────────────────────────────────────

function ReactiveSurfaceViz() {
    const freqX = useVar("surfaceFreqX", 1) as number;
    const freqY = useVar("surfaceFreqY", 1) as number;
    const scale = useVar("surfaceScale", 1) as number;

    return (
        <Cartesian3D
            height={420}
            axisLength={4}
            cameraPosition={[8, 6, 8]}
            plots={[
                {
                    type: "surface",
                    fn: (x, y) =>
                        scale *
                        Math.sin(freqX * x) *
                        Math.cos(freqY * y),
                    xDomain: [-4, 4],
                    yDomain: [-4, 4],
                    resolution: 50,
                    colorByHeight: true,
                    lowColor: "#3B82F6",
                    highColor: "#EF4444",
                    opacity: 0.85,
                },
            ]}
        />
    );
}

// ── Demo 4: Sphere + Plane intersection ──────────────────────────────────────

function SphereAndPlaneViz() {
    return (
        <Cartesian3D
            height={420}
            axisLength={4}
            cameraPosition={[6, 5, 6]}
            autoRotate
            autoRotateSpeed={0.5}
            plots={[
                // Semi-transparent sphere
                {
                    type: "sphere",
                    center: [0, 1.5, 0],
                    radius: 1.5,
                    color: "#8B5CF6",
                    opacity: 0.25,
                    wireframe: false,
                },
                // Wireframe sphere overlay
                {
                    type: "sphere",
                    center: [0, 1.5, 0],
                    radius: 1.5,
                    color: "#C4B5FD",
                    opacity: 0.5,
                    wireframe: true,
                },
                // Cutting plane at y = 1.5
                {
                    type: "plane",
                    point: [0, 1.5, 0],
                    normal: [0, 1, 0],
                    size: 5,
                    color: "#F59E0B",
                    opacity: 0.2,
                },
                // Circle of intersection (parametric curve at y = 1.5)
                {
                    type: "parametric",
                    xyz: (t) => [
                        1.5 * Math.cos(t),
                        1.5,
                        1.5 * Math.sin(t),
                    ],
                    tRange: [0, 2 * Math.PI],
                    samples: 100,
                    color: "#F59E0B",
                    lineWidth: 3,
                },
                // Center point
                {
                    type: "point",
                    position: [0, 1.5, 0],
                    color: "#F59E0B",
                    size: 0.1,
                },
                // Radius vector on the plane
                {
                    type: "vector",
                    tail: [0, 1.5, 0],
                    tip: [1.5, 1.5, 0],
                    color: "#EF4444",
                },
            ]}
        />
    );
}

// ── Exported demo blocks ──────────────────────────────────────────────────────

export const cartesian3dDemo: ReactElement[] = [
    // ── Header ──────────────────────────────────────────────────────────────
    <FullWidthLayout key="layout-c3d-header-title" maxWidth="xl">
        <Block id="block-c3d-header-title" padding="sm">
            <EditableH1 id="h1-c3d-title" blockId="block-c3d-header-title">
                3D Cartesian Visualizations
            </EditableH1>
        </Block>
    </FullWidthLayout>,

    <FullWidthLayout key="layout-c3d-header-desc" maxWidth="xl">
        <Block id="block-c3d-header-desc" padding="sm">
            <EditableParagraph id="para-c3d-desc" blockId="block-c3d-header-desc">
                Interactive 3D math plots powered by Cartesian3D — supporting
                surface plots, parametric curves, vectors, spheres, planes,
                draggable points, and linked highlights. Orbit the camera by
                dragging, and scroll to zoom.
            </EditableParagraph>
        </Block>
    </FullWidthLayout>,

    // ── Demo 1: Vectors & Points ─────────────────────────────────────────────
    <FullWidthLayout key="layout-c3d-vectors-title" maxWidth="xl">
        <Block id="block-c3d-vectors-title" padding="sm">
            <EditableH2 id="h2-c3d-vectors" blockId="block-c3d-vectors-title">
                3D Vectors
            </EditableH2>
        </Block>
    </FullWidthLayout>,

    <SplitLayout key="layout-c3d-vectors-split" ratio="1:1" gap="lg">
        <div className="space-y-4">
            <Block id="block-c3d-vectors-desc" padding="sm">
                <EditableParagraph
                    id="para-c3d-vectors-desc"
                    blockId="block-c3d-vectors-desc"
                >
                    Two vectors originate from the origin. Hover the labels to
                    highlight each in the plot:{" "}
                    <InlineLinkedHighlight
                        varName="c3dHighlight"
                        highlightId="vecA"
                        {...linkedHighlightPropsFromDefinition(
                            getExampleVariableInfo("c3dHighlight")
                        )}
                        color="#EF4444"
                    >
                        vector a = (3, 1, 0)
                    </InlineLinkedHighlight>
                    ,{" "}
                    <InlineLinkedHighlight
                        varName="c3dHighlight"
                        highlightId="vecB"
                        {...linkedHighlightPropsFromDefinition(
                            getExampleVariableInfo("c3dHighlight")
                        )}
                        color="#3B82F6"
                    >
                        vector b = (0, 2, 3)
                    </InlineLinkedHighlight>
                    , and their{" "}
                    <InlineLinkedHighlight
                        varName="c3dHighlight"
                        highlightId="vecCross"
                        {...linkedHighlightPropsFromDefinition(
                            getExampleVariableInfo("c3dHighlight")
                        )}
                        color="#22C55E"
                    >
                        cross product
                    </InlineLinkedHighlight>{" "}
                    (scaled). The dashed line connects the two tips.
                </EditableParagraph>
            </Block>
            <Block id="block-c3d-vectors-eq" padding="sm">
                <FormulaBlock
                    latex="\clr{a}{\vec{a}} \times \clr{b}{\vec{b}} = \clr{cross}{\vec{c}}"
                    colorMap={{
                        a: "#EF4444",
                        b: "#3B82F6",
                        cross: "#22C55E",
                    }}
                />
            </Block>
        </div>
        <Block id="block-c3d-vectors-viz" padding="sm">
            <VectorsAndPointsViz />
        </Block>
    </SplitLayout>,

    // ── Demo 2: Parametric Helix ─────────────────────────────────────────────
    <FullWidthLayout key="layout-c3d-helix-title" maxWidth="xl">
        <Block id="block-c3d-helix-title" padding="sm">
            <EditableH2 id="h2-c3d-helix" blockId="block-c3d-helix-title">
                Parametric Helix
            </EditableH2>
        </Block>
    </FullWidthLayout>,

    <SplitLayout key="layout-c3d-helix-split" ratio="1:1" gap="lg">
        <div className="space-y-4">
            <Block id="block-c3d-helix-desc" padding="sm">
                <EditableParagraph
                    id="para-c3d-helix-desc"
                    blockId="block-c3d-helix-desc"
                >
                    A helix winds upwards around the Y axis. The{" "}
                    <InlineSpotColor
                        varName="c3dHelix"
                        {...spotColorPropsFromDefinition(
                            getExampleVariableInfo("c3dHelix")
                        )}
                    >
                        purple curve
                    </InlineSpotColor>{" "}
                    traces the helix, while a faint projection is drawn on the
                    floor plane. Adjust the number of turns to{" "}
                    <InlineScrubbleNumber
                        varName="helixTurns"
                        {...numberPropsFromDefinition(
                            getExampleVariableInfo("helixTurns")
                        )}
                        formatValue={(v) => v.toFixed(1)}
                    />{" "}
                    and the radius to{" "}
                    <InlineScrubbleNumber
                        varName="helixRadius"
                        {...numberPropsFromDefinition(
                            getExampleVariableInfo("helixRadius")
                        )}
                        formatValue={(v) => v.toFixed(1)}
                    />.
                </EditableParagraph>
            </Block>
            <Block id="block-c3d-helix-eq" padding="sm">
                <FormulaBlock
                    latex="\vec{r}(t) = \left(\clr{rad}{R}\cos t,\;\frac{t}{2\pi},\;\clr{rad}{R}\sin t\right)"
                    colorMap={{ rad: "#F59E0B" }}
                />
            </Block>
            <Block id="block-c3d-helix-hint" padding="sm">
                <EditableParagraph
                    id="para-c3d-helix-hint"
                    blockId="block-c3d-helix-hint"
                >
                    You can{" "}
                    <InlineTrigger varName="helixTurns" value={1}>
                        set 1 turn
                    </InlineTrigger>{" "}
                    or{" "}
                    <InlineTrigger varName="helixTurns" value={6} icon="zap">
                        crank it to 6
                    </InlineTrigger>
                    . Orbit the camera by dragging the 3D view.
                </EditableParagraph>
            </Block>
        </div>
        <Block id="block-c3d-helix-viz" padding="sm">
            <ReactiveHelixViz />
        </Block>
    </SplitLayout>,

    // ── Demo 3: Reactive Surface Plot ────────────────────────────────────────
    <FullWidthLayout key="layout-c3d-surface-title" maxWidth="xl">
        <Block id="block-c3d-surface-title" padding="sm">
            <EditableH2 id="h2-c3d-surface" blockId="block-c3d-surface-title">
                Surface Plot
            </EditableH2>
        </Block>
    </FullWidthLayout>,

    <SplitLayout key="layout-c3d-surface-split" ratio="1:1" gap="lg">
        <div className="space-y-4">
            <Block id="block-c3d-surface-desc" padding="sm">
                <EditableParagraph
                    id="para-c3d-surface-desc"
                    blockId="block-c3d-surface-desc"
                >
                    A height-coloured surface z = A · sin(ωₓ x) · cos(ωᵧ y).
                    The vertical scale (A) is{" "}
                    <InlineScrubbleNumber
                        varName="surfaceScale"
                        {...numberPropsFromDefinition(
                            getExampleVariableInfo("surfaceScale")
                        )}
                        formatValue={(v) => v.toFixed(1)}
                    />
                    , the x-frequency (ωₓ) is{" "}
                    <InlineScrubbleNumber
                        varName="surfaceFreqX"
                        {...numberPropsFromDefinition(
                            getExampleVariableInfo("surfaceFreqX")
                        )}
                        formatValue={(v) => v.toFixed(1)}
                    />
                    , and the y-frequency (ωᵧ) is{" "}
                    <InlineScrubbleNumber
                        varName="surfaceFreqY"
                        {...numberPropsFromDefinition(
                            getExampleVariableInfo("surfaceFreqY")
                        )}
                        formatValue={(v) => v.toFixed(1)}
                    />
                    . Low values are{" "}
                    <InlineSpotColor
                        varName="c3dVecB"
                        {...spotColorPropsFromDefinition(
                            getExampleVariableInfo("c3dVecB")
                        )}
                    >
                        blue
                    </InlineSpotColor>{" "}
                    and peaks are{" "}
                    <InlineSpotColor
                        varName="c3dVecA"
                        {...spotColorPropsFromDefinition(
                            getExampleVariableInfo("c3dVecA")
                        )}
                    >
                        red
                    </InlineSpotColor>
                    .
                </EditableParagraph>
            </Block>
            <Block id="block-c3d-surface-eq" padding="sm">
                <FormulaBlock
                    latex="z = \clr{amp}{A}\;\sin\!\left(\clr{fx}{\omega_x}\, x\right)\cos\!\left(\clr{fy}{\omega_y}\, y\right)"
                    colorMap={{
                        amp: "#22C55E",
                        fx: "#EF4444",
                        fy: "#3B82F6",
                    }}
                />
            </Block>
            <Block id="block-c3d-surface-triggers" padding="sm">
                <EditableParagraph
                    id="para-c3d-surface-triggers"
                    blockId="block-c3d-surface-triggers"
                >
                    Try{" "}
                    <InlineTrigger varName="surfaceFreqX" value={2}>
                        doubling ωₓ
                    </InlineTrigger>{" "}
                    or{" "}
                    <InlineTrigger varName="surfaceScale" value={2.5} icon="zap">
                        cranking the amplitude
                    </InlineTrigger>
                    . You can{" "}
                    <InlineTrigger varName="surfaceFreqX" value={1} icon="refresh">
                        reset ωₓ
                    </InlineTrigger>{" "}
                    to start fresh.
                </EditableParagraph>
            </Block>
        </div>
        <Block id="block-c3d-surface-viz" padding="sm">
            <ReactiveSurfaceViz />
        </Block>
    </SplitLayout>,

    // ── Demo 4: Sphere & Plane ───────────────────────────────────────────────
    <FullWidthLayout key="layout-c3d-sphere-title" maxWidth="xl">
        <Block id="block-c3d-sphere-title" padding="sm">
            <EditableH2 id="h2-c3d-sphere" blockId="block-c3d-sphere-title">
                Sphere & Plane Intersection
            </EditableH2>
        </Block>
    </FullWidthLayout>,

    <SplitLayout key="layout-c3d-sphere-split" ratio="1:1" gap="lg">
        <Block id="block-c3d-sphere-desc" padding="sm">
            <EditableParagraph
                id="para-c3d-sphere-desc"
                blockId="block-c3d-sphere-desc"
            >
                A semi-transparent sphere of radius 1.5 sits at the origin.
                A horizontal cutting plane intersects it at
                its centre, revealing the circle of intersection
                (shown in{" "}
                <InlineSpotColor
                    varName="c3dSurface"
                    {...spotColorPropsFromDefinition(
                        getExampleVariableInfo("c3dSurface")
                    )}
                >
                    amber
                </InlineSpotColor>
                ). The auto-rotating camera lets you inspect the
                geometry from every angle.
            </EditableParagraph>
        </Block>
        <Block id="block-c3d-sphere-viz" padding="sm">
            <SphereAndPlaneViz />
        </Block>
    </SplitLayout>,
];
