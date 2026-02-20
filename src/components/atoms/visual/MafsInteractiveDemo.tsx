import { SplitLayout } from "@/components/layouts";
import { Block } from "@/components/templates";
import {
    MafsInteractive,
    InlineLinkedHighlight,
    InlineScrubbleNumber,
    EditableH2,
    EditableParagraph,
} from "@/components/atoms";
import { useVar, useSetVar } from "@/stores";
import {
    getExampleVariableInfo,
    numberPropsFromDefinition,
    linkedHighlightPropsFromDefinition,
} from "@/data/exampleVariables";

/**
 * Reactive equation display for the Mafs demo.
 * Reads amplitude and frequency from the global variable store.
 */
function MafsEquationDisplay() {
    const amplitude = useVar('mafsAmplitude', 2) as number;
    const frequency = useVar('mafsFrequency', 1) as number;

    return (
        <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 via-green-500/10 to-teal-500/10 border border-green-500/20">
            <p className="text-sm text-muted-foreground mb-2">The wave equation:</p>
            <p className="font-mono text-xl">
                y ={" "}
                <span
                    className="px-2 py-1 rounded-lg transition-colors"
                    style={{
                        backgroundColor: 'rgba(239, 68, 68, 0.15)',
                        color: '#ef4444',
                        fontWeight: 600,
                    }}
                >
                    {amplitude.toFixed(1)}
                </span>
                {" "}× sin(
                <span
                    className="px-2 py-1 rounded-lg transition-colors"
                    style={{
                        backgroundColor: 'rgba(59, 130, 246, 0.15)',
                        color: '#3b82f6',
                        fontWeight: 600,
                    }}
                >
                    {frequency.toFixed(1)}
                </span>
                x)
            </p>
        </div>
    );
}

/**
 * Reactive Mafs visualization wrapper.
 * Reads amplitude and frequency from the store and passes them to MafsInteractive,
 * and writes back changes from dragged points.
 */
function ReactiveMafsViz() {
    const amplitude = useVar('mafsAmplitude', 2) as number;
    const frequency = useVar('mafsFrequency', 1) as number;
    const setVar = useSetVar();

    return (
        <MafsInteractive
            amplitude={amplitude}
            frequency={frequency}
            onAmplitudeChange={(v) => setVar('mafsAmplitude', v)}
            onFrequencyChange={(v) => setVar('mafsFrequency', v)}
            highlightVarName="mafsHighlight"
        />
    );
}

/**
 * Interactive Mafs Demo with bidirectional control
 * - Inline sliders in the paragraph control the visualization
 * - Dragging points in the visualization updates the inline sliders
 * - "Explorable explanation" style interface
 * - Uses global variable store + InlineLinkedHighlight (no local state)
 */
export function MafsInteractiveDemo() {
    return (
        <SplitLayout ratio="1:1" gap="lg">
            <Block id="block-mafs-interactive-text" padding="sm">
                <EditableH2 id="h2-mafs-exploring" blockId="block-mafs-interactive-text">
                    Exploring Sine Waves
                </EditableH2>

                <EditableParagraph id="para-mafs-amplitude" blockId="block-mafs-interactive-text">
                    A sine wave is defined by two key parameters. The{" "}
                    <InlineLinkedHighlight
                        varName="mafsHighlight"
                        highlightId="amplitude"
                        {...linkedHighlightPropsFromDefinition(getExampleVariableInfo('mafsHighlight'))}
                        color="#ef4444"
                    >
                        amplitude
                    </InlineLinkedHighlight>{" "}
                    controls the height of the wave — try setting it to{" "}
                    <InlineScrubbleNumber
                        varName="mafsAmplitude"
                        {...numberPropsFromDefinition(getExampleVariableInfo('mafsAmplitude'))}
                        formatValue={(v) => v.toFixed(1)}
                    />{" "}
                    and watch how the wave stretches vertically.
                </EditableParagraph>

                <EditableParagraph id="para-mafs-frequency" blockId="block-mafs-interactive-text">
                    The{" "}
                    <InlineLinkedHighlight
                        varName="mafsHighlight"
                        highlightId="frequency"
                        {...linkedHighlightPropsFromDefinition(getExampleVariableInfo('mafsHighlight'))}
                        color="#3b82f6"
                    >
                        frequency
                    </InlineLinkedHighlight>{" "}
                    determines how rapidly the wave oscillates. Currently set to{" "}
                    <InlineScrubbleNumber
                        varName="mafsFrequency"
                        {...numberPropsFromDefinition(getExampleVariableInfo('mafsFrequency'))}
                        formatValue={(v) => v.toFixed(1)}
                    />{" "}
                    — a higher frequency means more oscillations per unit distance.
                </EditableParagraph>

                {/* Formula Display */}
                <MafsEquationDisplay />

                <EditableParagraph id="para-mafs-tip" blockId="block-mafs-interactive-text">
                    💡 You can also drag the colored points directly
                    in the chart — the values above will update automatically!
                </EditableParagraph>
            </Block>
            <Block id="block-mafs-interactive-viz" padding="sm">
                <div className="w-full">
                    <ReactiveMafsViz />
                </div>
            </Block>
        </SplitLayout>
    );
}
