import { type ReactElement } from "react";
import { Block } from "@/components/templates";
import { StackLayout, SplitLayout } from "@/components/layouts";
import {
    EditableH1,
    EditableH2,
    EditableParagraph,
    InlineTooltip,
    ImageDisplay,
} from "@/components/atoms";

// ─── Exported block array ────────────────────────────────────────────────────

export const imageDisplayDemoBlocks: ReactElement[] = [
    // ── Title ────────────────────────────────────────────────────────────────
    <StackLayout key="layout-img-title" maxWidth="xl">
        <Block id="block-img-title" padding="md">
            <EditableH1 id="h1-img-title" blockId="block-img-title">
                Image Display
            </EditableH1>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-img-intro" maxWidth="xl">
        <Block id="block-img-intro" padding="sm">
            <EditableParagraph id="para-img-intro" blockId="block-img-intro">
                The{" "}
                <InlineTooltip
                    id="tooltip-img-display"
                    tooltip="A styled image renderer with captions, accent-colour borders, object-fit modes, and an optional click-to-zoom lightbox."
                >
                    ImageDisplay
                </InlineTooltip>{" "}
                component renders images inside lessons with optional captions,
                coloured borders, and a click-to-zoom lightbox. It reads its
                accent colour from the global variable store so it stays in
                sync with the rest of a lesson.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // ── Basic Image ──────────────────────────────────────────────────────────
    <StackLayout key="layout-img-basic-h2" maxWidth="xl">
        <Block id="block-img-basic-h2" padding="sm">
            <EditableH2 id="h2-img-basic" blockId="block-img-basic-h2">
                1) Basic Image with Caption
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-img-basic-desc" maxWidth="xl">
        <Block id="block-img-basic-desc" padding="sm">
            <EditableParagraph id="para-img-basic-desc" blockId="block-img-basic-desc">
                A simple image with a caption underneath. Click on the image to
                zoom into a fullscreen lightbox overlay.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-img-basic" maxWidth="xl">
        <Block id="block-img-basic-viz" padding="sm">
            <ImageDisplay
                id="img-basic-demo"
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Unit_circle_angles_color.svg/800px-Unit_circle_angles_color.svg.png"
                alt="Unit circle diagram showing standard angles and their sine/cosine coordinates"
                caption="Figure 1 — The unit circle with standard angle positions and (cos θ, sin θ) coordinates"
                objectFit="contain"
                height={420}
                borderRadius="0.75rem"
                color="#6366f1"
            />
        </Block>
    </StackLayout>,

    // ── Bordered Image ───────────────────────────────────────────────────────
    <StackLayout key="layout-img-bordered-h2" maxWidth="xl">
        <Block id="block-img-bordered-h2" padding="sm">
            <EditableH2 id="h2-img-bordered" blockId="block-img-bordered-h2">
                2) Bordered Image
            </EditableH2>
        </Block>
    </StackLayout>,

    <SplitLayout key="layout-img-bordered" ratio="1:1" gap="lg">
        <div className="space-y-4">
            <Block id="block-img-bordered-text" padding="sm">
                <EditableParagraph id="para-img-bordered-text" blockId="block-img-bordered-text">
                    Enable the <code>bordered</code> prop to add a subtle
                    accent-coloured border. The border colour is derived from
                    the component's accent colour (or the variable store value).
                    Here we see the classic Pythagorean theorem proof: the sum
                    of the areas of the two smaller squares equals the area of
                    the largest square.
                </EditableParagraph>
            </Block>
        </div>
        <Block id="block-img-bordered-viz" padding="sm">
            <ImageDisplay
                id="img-bordered-demo"
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Pythagorean.svg/600px-Pythagorean.svg.png"
                alt="Pythagorean theorem — a² + b² = c² with visual proof using squares on each side"
                caption="a² + b² = c² — the Pythagorean Theorem"
                bordered
                objectFit="contain"
                height={300}
                color="#a855f7"
            />
        </Block>
    </SplitLayout>,

    // ── Object-fit Comparison ────────────────────────────────────────────────
    <StackLayout key="layout-img-fit-h2" maxWidth="xl">
        <Block id="block-img-fit-h2" padding="sm">
            <EditableH2 id="h2-img-fit" blockId="block-img-fit-h2">
                3) Object-Fit Modes
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-img-fit-desc" maxWidth="xl">
        <Block id="block-img-fit-desc" padding="sm">
            <EditableParagraph id="para-img-fit-desc" blockId="block-img-fit-desc">
                The <code>objectFit</code> prop controls how the image scales
                within its container. Compare <strong>cover</strong> (fills the
                area, may crop) with <strong>contain</strong> (fits entirely,
                may letterbox).
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <SplitLayout key="layout-img-fit-compare" ratio="1:1" gap="lg">
        <Block id="block-img-fit-cover" padding="sm">
            <ImageDisplay
                id="img-fit-cover"
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Unit_circle_angles_color.svg/800px-Unit_circle_angles_color.svg.png"
                alt="Conic sections diagram — cover mode"
                caption="objectFit: cover"
                objectFit="cover"
                height={220}
                bordered
                color="#22c55e"
            />
        </Block>
        <Block id="block-img-fit-contain" padding="sm">
            <ImageDisplay
                id="img-fit-contain"
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Unit_circle_angles_color.svg/800px-Unit_circle_angles_color.svg.png"
                alt="Conic sections diagram — contain mode"
                caption="objectFit: contain"
                objectFit="contain"
                height={220}
                bordered
                color="#f43f5e"
            />
        </Block>
    </SplitLayout>,

    // ── Max-width constrained ────────────────────────────────────────────────
    <StackLayout key="layout-img-constrained-h2" maxWidth="xl">
        <Block id="block-img-constrained-h2" padding="sm">
            <EditableH2 id="h2-img-constrained" blockId="block-img-constrained-h2">
                4) Size-Constrained Image
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-img-constrained" maxWidth="xl">
        <Block id="block-img-constrained-viz" padding="sm">
            <div className="flex justify-center">
                <ImageDisplay
                    id="img-constrained-demo"
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Fibonacci_spiral_34.svg/600px-Fibonacci_spiral_34.svg.png"
                    alt="The golden ratio / Fibonacci spiral overlaid on golden rectangles"
                    caption="The Golden Ratio (φ ≈ 1.618) — maxWidth: 400px"
                    objectFit="contain"
                    maxWidth={400}
                    height={300}
                    bordered
                    borderRadius="1rem"
                    color="#f59e0b"
                />
            </div>
        </Block>
    </StackLayout>,
];
