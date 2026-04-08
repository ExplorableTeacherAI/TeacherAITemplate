import { type ReactElement } from "react";
import { Block } from "@/components/templates";
import { StackLayout, SplitLayout } from "@/components/layouts";
import {
    EditableH3,
    EditableH4,
    EditableParagraph,
    ImageDisplay,
} from "@/components/atoms";

// ─── Exported block array ────────────────────────────────────────────────────

export const imageDisplayDemoBlocks: ReactElement[] = [
    // ── Title ────────────────────────────────────────────────────────────────
    <StackLayout key="layout-image-title" maxWidth="xl">
        <Block id="image-title" padding="md">
            <EditableH3 id="h3-image-title" blockId="image-title">
                Image Display
            </EditableH3>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-image-intro" maxWidth="xl">
        <Block id="image-intro" padding="sm">
            <EditableParagraph id="para-image-intro" blockId="image-intro">
                Images enhance mathematical explanations by providing visual context that words alone cannot convey. From geometric diagrams to graphs and proofs, well-placed images help learners form mental models of abstract concepts. Click on any image below to view it in a larger lightbox.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // ── Basic Image ──────────────────────────────────────────────────────────
    <StackLayout key="layout-image-basic-h2" maxWidth="xl">
        <Block id="image-basic-h2" padding="sm">
            <EditableH4 id="h4-image-basic" blockId="image-basic-h2">
                1) Basic Image with Caption
            </EditableH4>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-image-basic-desc" maxWidth="xl">
        <Block id="image-basic-desc" padding="sm">
            <EditableParagraph id="para-image-basic-desc" blockId="image-basic-desc">
                A simple image with a caption underneath. Click on the image to
                zoom into a fullscreen lightbox overlay.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-image-basic" maxWidth="xl">
        <Block id="image-basic-viz" padding="sm">
            <ImageDisplay
                id="image-basic-demo"
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
    <StackLayout key="layout-image-bordered-h2" maxWidth="xl">
        <Block id="image-bordered-h2" padding="sm">
            <EditableH4 id="h4-image-bordered" blockId="image-bordered-h2">
                2) Bordered Image
            </EditableH4>
        </Block>
    </StackLayout>,

    <SplitLayout key="layout-image-bordered" ratio="1:1" gap="lg">
        <div className="space-y-4">
            <Block id="image-bordered-text" padding="sm">
                <EditableParagraph id="para-image-bordered-text" blockId="image-bordered-text">
                    The Pythagorean theorem is one of the most famous results in mathematics. This visual proof shows why a² + b² = c²: the area of the square built on the hypotenuse equals the combined areas of the squares built on the other two sides. Geometric diagrams like this make abstract algebraic relationships concrete and memorable.
                </EditableParagraph>
            </Block>
        </div>
        <Block id="image-bordered-viz" padding="sm">
            <ImageDisplay
                id="image-bordered-demo"
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
    <StackLayout key="layout-image-fit-h2" maxWidth="xl">
        <Block id="image-fit-h2" padding="sm">
            <EditableH4 id="h4-image-fit" blockId="image-fit-h2">
                3) Object-Fit Modes
            </EditableH4>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-image-fit-desc" maxWidth="xl">
        <Block id="image-fit-desc" padding="sm">
            <EditableParagraph id="para-image-fit-desc" blockId="image-fit-desc">
                Images can be displayed in different ways depending on the available space and content priorities. Some images benefit from filling their container completely even if parts are cropped, while others should be shown in full even if that leaves empty space around them.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <SplitLayout key="layout-image-fit-compare" ratio="1:1" gap="lg">
        <Block id="image-fit-cover" padding="sm">
            <ImageDisplay
                id="image-fit-cover"
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Unit_circle_angles_color.svg/800px-Unit_circle_angles_color.svg.png"
                alt="Conic sections diagram — cover mode"
                caption="objectFit: cover"
                objectFit="cover"
                height={220}
                bordered
                color="#22c55e"
            />
        </Block>
        <Block id="image-fit-contain" padding="sm">
            <ImageDisplay
                id="image-fit-contain"
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
    <StackLayout key="layout-image-constrained-h2" maxWidth="xl">
        <Block id="image-constrained-h2" padding="sm">
            <EditableH4 id="h4-image-constrained" blockId="image-constrained-h2">
                4) Size-Constrained Image
            </EditableH4>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-image-constrained" maxWidth="xl">
        <Block id="image-constrained-viz" padding="sm">
            <div className="flex justify-center">
                <ImageDisplay
                    id="image-constrained-demo"
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
