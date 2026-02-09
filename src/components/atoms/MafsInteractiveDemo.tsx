import { useState } from "react";
import { SplitLayout } from "@/components/layouts";
import { Section } from "@/components/templates";
import {
    MafsInteractive,
    InteractiveHighlightProvider,
    InteractiveText,
    InlineScrubbleNumber
} from "@/components/atoms";

/**
 * Interactive Mafs Demo with bidirectional control
 * - Inline sliders in the paragraph control the visualization
 * - Dragging points in the visualization updates the inline sliders
 * - "Explorable explanation" style interface
 */
export function MafsInteractiveDemo() {
    const [amplitude, setAmplitude] = useState(2);
    const [frequency, setFrequency] = useState(1);

    return (
        <InteractiveHighlightProvider
            styleMap={{
                amplitude: { color: '#ef4444', underline: 'none', highlightBg: 'rgba(239, 68, 68, 0.15)' },
                frequency: { color: '#3b82f6', underline: 'none', highlightBg: 'rgba(59, 130, 246, 0.15)' },
            }}
        >
            <SplitLayout ratio="1:1" gap="lg">
                <Section id="mafs-interactive-text">
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold">Exploring Sine Waves</h2>

                        {/* Explorable paragraph with inline sliders */}
                        <div className="prose dark:prose-invert max-w-none text-lg leading-relaxed">
                            <p>
                                A sine wave is defined by two key parameters. The{" "}
                                <InteractiveText id="amplitude">amplitude</InteractiveText>{" "}
                                controls the height of the wave — try setting it to{" "}
                                <InlineScrubbleNumber
                                    value={amplitude}
                                    onChange={setAmplitude}
                                    min={0.1}
                                    max={4}
                                    step={0.1}
                                    color="#ef4444"
                                    formatValue={(v) => v.toFixed(1)}
                                />{" "}
                                and watch how the wave stretches vertically.
                            </p>

                            <p className="mt-4">
                                The{" "}
                                <InteractiveText id="frequency">frequency</InteractiveText>{" "}
                                determines how rapidly the wave oscillates. Currently set to{" "}
                                <InlineScrubbleNumber
                                    value={frequency}
                                    onChange={setFrequency}
                                    min={0.1}
                                    max={2}
                                    step={0.1}
                                    color="#3b82f6"
                                    formatValue={(v) => v.toFixed(1)}
                                />{" "}
                                — a higher frequency means more oscillations per unit distance.
                            </p>
                        </div>

                        {/* Formula Display */}
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

                        <p className="text-sm text-muted-foreground">
                            💡 <strong>Tip:</strong> You can also drag the colored points directly
                            in the chart — the values above will update automatically!
                        </p>
                    </div>
                </Section>
                <Section id="mafs-interactive-viz">
                    <div className="w-full">
                        <MafsInteractive
                            amplitude={amplitude}
                            frequency={frequency}
                            onAmplitudeChange={setAmplitude}
                            onFrequencyChange={setFrequency}
                        />
                    </div>
                </Section>
            </SplitLayout>
        </InteractiveHighlightProvider>
    );
}
