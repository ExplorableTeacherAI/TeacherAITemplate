import { useState } from "react";

import {
    Heading,
    InteractiveTerm,
    InteractiveEquation,
    InteractiveParagraph
} from "@/components/molecules";
import { FullWidthLayout } from "@/components/layouts";
import { Section } from "@/components/templates";
import { DesmosGraph } from "@/components/organisms";
import { Spacer } from "@/components/atoms";

/**
 * Quick Start Example - Interactive LDA Visualization
 * This example replicates the pattern from your uploaded image.
 * 
 * To use: Import this in your sections.tsx file:
 * import { QuickStartInteractiveExample } from './examples/quick-start-interactive';
 * 
 * Then add to your sections array:
 * export const sections = [<QuickStartInteractiveExample key="quick-start" />];
 */

export const QuickStartInteractiveExample = () => {

    const [graphState, setGraphState] = useState<'default' | 'dropX' | 'bestLine'>('default');
    const [highlightEquation, setHighlightEquation] = useState(false);

    // Define graph expressions based on current state
    const getGraphExpressions = () => {
        // Base points (red and blue clusters)
        const basePoints = [
            // Red points (upper left cluster)
            { id: 'red1', latex: '(1.5, 3.5)', color: '#c74440' },
            { id: 'red2', latex: '(2, 3)', color: '#c74440' },
            { id: 'red3', latex: '(2.5, 2.5)', color: '#c74440' },
            { id: 'red4', latex: '(4, 1.8)', color: '#c74440' },

            // Blue points (lower right cluster)
            { id: 'blue1', latex: '(1, 1.5)', color: '#2d70b3' },
            { id: 'blue2', latex: '(3.5, 2)', color: '#2d70b3' },
            { id: 'blue3', latex: '(4, 1.2)', color: '#2d70b3' },
            { id: 'blue4', latex: '(2.2, 0.8)', color: '#2d70b3' },
        ];

        // Add projection line based on state
        if (graphState === 'dropX') {
            return [
                ...basePoints,
                {
                    id: 'xLine',
                    latex: 'x=2.5',
                    color: '#ffa500',
                    lineStyle: 'DASHED' as const,
                    lineWidth: 2
                },
            ];
        } else if (graphState === 'bestLine') {
            return [
                ...basePoints,
                {
                    id: 'bestFit',
                    latex: 'y=-0.77*x+4',
                    color: highlightEquation ? '#ff0066' : '#ffa500',
                    lineWidth: highlightEquation ? 3 : 2
                },
            ];
        }

        return basePoints;
    };

    return (
        <FullWidthLayout maxWidth="xl">
            <Section id="quick-start-interactive">
                <Heading level={1}>Linear Discriminant Analysis (LDA)</Heading>

                <Spacer height={16} />

                <InteractiveParagraph>
                    You can{' '}
                    <InteractiveTerm
                        onClick={() => setGraphState(prev => prev === 'dropX' ? 'default' : 'dropX')}
                        onHoverStart={() => setGraphState('dropX')}
                        onHoverEnd={() => setGraphState('default')}
                        color="#c74440"
                        isActive={graphState === 'dropX'}
                    >
                        click here to see that dropping the X axis
                    </InteractiveTerm>
                    {' '}isn't much better, but these aren't the only two choices.
                    Geometrically, we have an infinite number of lines we can project on!
                </InteractiveParagraph>

                <Spacer height={12} />

                <InteractiveParagraph>
                    Out of all these possible lines, the line{' '}
                    <InteractiveEquation
                        equation="(0.79)y = (-0.61)x"
                        onClick={() => {
                            setGraphState('bestLine');
                            setHighlightEquation(!highlightEquation);
                        }}
                        onHoverStart={() => {
                            setGraphState('bestLine');
                            setHighlightEquation(true);
                        }}
                        onHoverEnd={() => {
                            setHighlightEquation(false);
                            if (!highlightEquation) setGraphState('default');
                        }}
                        isActive={highlightEquation}
                        color="#c74440"
                    />
                    {' '}provides the best possible separation.
                    This best line is what LDA allows us to find.
                </InteractiveParagraph>

                <Spacer height={20} />

                <DesmosGraph
                    height={450}
                    expressions={getGraphExpressions()}
                    options={{
                        expressions: false,
                        settingsMenu: false,
                        keypad: false,
                        zoomButtons: true,
                        xAxisLabel: 'Price',
                        yAxisLabel: 'Distance'
                    }}
                />

                <Spacer height={16} />

                <InteractiveParagraph className="text-sm text-gray-600">
                    💡 <strong>Try it:</strong> Click or hover over the highlighted text to see the graph change!
                </InteractiveParagraph>
            </Section>
        </FullWidthLayout>
    );
};
