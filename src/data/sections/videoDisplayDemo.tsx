import { type ReactElement } from "react";
import { Block } from "@/components/templates";
import { StackLayout, SplitLayout } from "@/components/layouts";
import {
    EditableH1,
    EditableH2,
    EditableParagraph,
    InlineTooltip,
    VideoDisplay,
} from "@/components/atoms";

// ─── Exported block array ────────────────────────────────────────────────────

export const videoDisplayDemoBlocks: ReactElement[] = [
    // ── Title ────────────────────────────────────────────────────────────────
    <StackLayout key="layout-vid-title" maxWidth="xl">
        <Block id="block-vid-title" padding="md">
            <EditableH1 id="h1-vid-title" blockId="block-vid-title">
                Video Display
            </EditableH1>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-vid-intro" maxWidth="xl">
        <Block id="block-vid-intro" padding="sm">
            <EditableParagraph id="para-vid-intro" blockId="block-vid-intro">
                The{" "}
                <InlineTooltip
                    id="tooltip-vid-display"
                    tooltip="A styled video renderer with captions, accent-colour borders, YouTube embed support, and HTML5 playback controls."
                >
                    VideoDisplay
                </InlineTooltip>{" "}
                component renders videos inside lessons with optional captions,
                coloured borders, and HTML5 playback controls. YouTube URLs are
                automatically detected and rendered as embedded iframes. It reads
                its accent colour from the global variable store so it stays in
                sync with the rest of a lesson.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // ── YouTube Embed — 3Blue1Brown ──────────────────────────────────────────
    <StackLayout key="layout-vid-yt-h2" maxWidth="xl">
        <Block id="block-vid-yt-h2" padding="sm">
            <EditableH2 id="h2-vid-yt" blockId="block-vid-yt-h2">
                1) YouTube Embed — Essence of Linear Algebra
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-vid-yt-desc" maxWidth="xl">
        <Block id="block-vid-yt-desc" padding="sm">
            <EditableParagraph id="para-vid-yt-desc" blockId="block-vid-yt-desc">
                Pass any YouTube URL to <code>src</code> and the component
                automatically renders an embedded iframe with proper aspect
                ratio. This is 3Blue1Brown's introduction to vectors and linear
                algebra.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-vid-yt" maxWidth="xl">
        <Block id="block-vid-yt-viz" padding="sm">
            <VideoDisplay
                id="vid-yt-linear-algebra"
                src="https://www.youtube.com/watch?v=WUvTyaaNkzM"
                alt="3Blue1Brown — Essence of Linear Algebra, Chapter 1: Vectors"
                caption="3Blue1Brown — Vectors | Chapter 1, Essence of Linear Algebra"
                bordered
                borderRadius="0.75rem"
                color="#3b82f6"
            />
        </Block>
    </StackLayout>,

    // ── Side-by-side YouTube embeds ──────────────────────────────────────────
    <StackLayout key="layout-vid-split-h2" maxWidth="xl">
        <Block id="block-vid-split-h2" padding="sm">
            <EditableH2 id="h2-vid-split" blockId="block-vid-split-h2">
                2) Side-by-Side — Calculus & Neural Networks
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-vid-split-desc" maxWidth="xl">
        <Block id="block-vid-split-desc" padding="sm">
            <EditableParagraph id="para-vid-split-desc" blockId="block-vid-split-desc">
                Multiple videos can be placed side-by-side using a{" "}
                <code>SplitLayout</code>. Each video detects the YouTube URL
                independently and renders its own embedded player with
                individual accent colours.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <SplitLayout key="layout-vid-split" ratio="1:1" gap="lg">
        <Block id="block-vid-calculus" padding="sm">
            <VideoDisplay
                id="vid-yt-calculus"
                src="https://www.youtube.com/watch?v=WUvTyaaNkzM"
                alt="3Blue1Brown — The Essence of Calculus"
                caption="Essence of Calculus"
                bordered
                color="#22c55e"
            />
        </Block>
        <Block id="block-vid-neural" padding="sm">
            <VideoDisplay
                id="vid-yt-neural"
                src="https://www.youtube.com/watch?v=aircAruvnKk"
                alt="3Blue1Brown — But what is a Neural Network?"
                caption="Neural Networks"
                bordered
                color="#f97316"
            />
        </Block>
    </SplitLayout>,

    // ── Bordered YouTube with custom colour ──────────────────────────────────
    <StackLayout key="layout-vid-fourier-h2" maxWidth="xl">
        <Block id="block-vid-fourier-h2" padding="sm">
            <EditableH2 id="h2-vid-fourier" blockId="block-vid-fourier-h2">
                3) Bordered &amp; Constrained — Fourier Transform
            </EditableH2>
        </Block>
    </StackLayout>,

    <SplitLayout key="layout-vid-fourier" ratio="1:1" gap="lg">
        <div className="space-y-4">
            <Block id="block-vid-fourier-text" padding="sm">
                <EditableParagraph id="para-vid-fourier-text" blockId="block-vid-fourier-text">
                    Enable the <code>bordered</code> prop to add a subtle
                    accent-coloured border. Combine with <code>maxWidth</code>{" "}
                    to constrain size. This example features 3Blue1Brown's
                    visual explanation of the Fourier Transform — one of the
                    most important mathematical tools in signal processing,
                    physics, and engineering.
                </EditableParagraph>
            </Block>
        </div>
        <Block id="block-vid-fourier-viz" padding="sm">
            <VideoDisplay
                id="vid-yt-fourier"
                src="https://www.youtube.com/watch?v=spUNpyF58BY"
                alt="3Blue1Brown — But what is the Fourier Transform?"
                caption="But what is the Fourier Transform? — 3Blue1Brown"
                bordered
                borderRadius="1rem"
                color="#a855f7"
            />
        </Block>
    </SplitLayout>,

    // ── Size-constrained ─────────────────────────────────────────────────────
    <StackLayout key="layout-vid-constrained-h2" maxWidth="xl">
        <Block id="block-vid-constrained-h2" padding="sm">
            <EditableH2 id="h2-vid-constrained" blockId="block-vid-constrained-h2">
                4) Size-Constrained — Quaternions
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-vid-constrained" maxWidth="xl">
        <Block id="block-vid-constrained-viz" padding="sm">
            <div className="flex justify-center">
                <VideoDisplay
                    id="vid-constrained-demo"
                    src="https://www.youtube.com/watch?v=d4EgbgTm0Bg"
                    alt="3Blue1Brown — Visualizing Quaternions"
                    caption="Quaternions visualised — maxWidth: 560px, centred"
                    bordered
                    maxWidth={560}
                    borderRadius="1rem"
                    color="#f59e0b"
                />
            </div>
        </Block>
    </StackLayout>,
];
