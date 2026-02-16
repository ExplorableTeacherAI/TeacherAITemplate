/**
 * Annotation System Demo
 * 
 * Showcases all annotation types with examples.
 */

import { useState } from 'react';
import { Block } from '@/components/templates';
import { FullWidthLayout } from '@/components/layouts';
import {
    Glossary,
    Whisper,
    Linked,
} from '@/components/annotations';
import { InlineClozeInput, InlineClozeChoice, InlineToggle, InlineTooltip, InlineTrigger } from '@/components/atoms';

// Demo visualization component for Linked annotations
const LinkedVisualization = ({ activeId }: { activeId: string | null }) => (
    <div className="p-6 bg-gray-50 rounded-xl flex items-center justify-center gap-4">
        {['radius', 'diameter', 'circumference'].map((id) => (
            <div
                key={id}
                className="px-4 py-2 rounded-lg transition-all duration-200"
                style={{
                    background: activeId === id ? '#10B981' : '#e5e7eb',
                    color: activeId === id ? 'white' : '#374151',
                    transform: activeId === id ? 'scale(1.1)' : 'scale(1)',
                }}
            >
                {id}
            </div>
        ))}
    </div>
);

export const annotationsDemoSections = [
    // Header
    <FullWidthLayout key="annotations-header">
        <Block id="annotations-intro">
            <h2 className="text-2xl font-bold mb-4">📐 Annotation System Demo</h2>
            <p className="text-lg text-muted-foreground">
                Interactive annotations for explorable explanations. Each annotation type has a distinct visual style.
            </p>
        </Block>
    </FullWidthLayout>,

    // Informational Category
    <FullWidthLayout key="informational-demo">
        <Block id="informational-annotations">
            <h3 className="text-xl font-semibold mb-4 text-amber-600">🔍 Informational Annotations</h3>

            <div className="space-y-6">
                {/* InlineTooltip */}
                <div className="p-4 bg-amber-50 rounded-lg">
                    <h4 className="font-medium mb-2">InlineTooltip (Tooltip on hover)</h4>
                    <p className="text-lg leading-relaxed">
                        Every point on a{' '}
                        <InlineTooltip tooltip="A circle is a shape where all points are equidistant from a center point called the origin.">
                            circle
                        </InlineTooltip>{' '}
                        has the same distance from its center. This distance is called the{' '}
                        <InlineTooltip tooltip="The radius is the distance from the center to any point on the circle. It equals half the diameter.">
                            radius
                        </InlineTooltip>.
                    </p>
                </div>

                {/* Glossary */}
                <div className="p-4 bg-amber-50 rounded-lg">
                    <h4 className="font-medium mb-2">Glossary (Definition cards)</h4>
                    <p className="text-lg leading-relaxed">
                        The{' '}
                        <Glossary
                            term="circumference"
                            definition="The total distance around the outside of a circle. It equals π times the diameter (C = πd)."
                            pronunciation="/sərˈkəmf(ə)rəns/"
                            relatedTerms={['radius', 'diameter', 'pi']}
                        />{' '}
                        of a circle can be calculated using the formula C = 2πr.
                    </p>
                </div>

                {/* Whisper */}
                <div className="p-4 bg-amber-50 rounded-lg">
                    <h4 className="font-medium mb-2">Whisper (Reveals hidden content)</h4>
                    <p className="text-lg leading-relaxed">
                        The answer to the famous equation E = mc² shows that{' '}
                        <Whisper hiddenContent="energy equals mass times the speed of light squared!">
                            ??? (hover to reveal)
                        </Whisper>
                    </p>
                </div>
            </div>
        </Block>
    </FullWidthLayout>,

    // Mutable Category
    <FullWidthLayout key="mutable-demo">
        <Block id="mutable-annotations">
            <h3 className="text-xl font-semibold mb-4 text-fuchsia-600">🔄 Mutable Annotations</h3>

            <div className="space-y-6">
                {/* Toggle */}
                <div className="p-4 bg-fuchsia-50 rounded-lg">
                    <h4 className="font-medium mb-2">Toggle (Cycle through options)</h4>
                    <p className="text-lg leading-relaxed">
                        The current shape is a{' '}
                        <InlineToggle options={['triangle', 'square', 'pentagon', 'hexagon']} />{' '}
                        with equal sides. Click to cycle through options!
                    </p>
                </div>
            </div>
        </Block>
    </FullWidthLayout>,

    // Validatable Category
    <FullWidthLayout key="validatable-demo">
        <Block id="validatable-annotations">
            <h3 className="text-xl font-semibold mb-4 text-blue-600">✅ Validatable Annotations</h3>

            <div className="space-y-6">
                {/* ClozeInput */}
                <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium mb-2">ClozeInput (Fill-in-the-blank quiz)</h4>
                    <p className="text-lg leading-relaxed">
                        A right angle has exactly{' '}
                        <InlineClozeInput correctAnswer="90" placeholder="???" />{' '}
                        degrees. Type your answer!
                    </p>
                </div>

                {/* ClozeChoice */}
                <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium mb-2">ClozeChoice (Dropdown quiz)</h4>
                    <p className="text-lg leading-relaxed">
                        The definition of a sphere is similar to a{' '}
                        <InlineClozeChoice
                            correctAnswer="circle"
                            options={['cube', 'circle', 'square', 'triangle']}
                            placeholder="???"
                        />{' '}
                        – except in three dimensions!
                    </p>
                </div>
            </div>
        </Block>
    </FullWidthLayout>,

    // Connective Category
    <FullWidthLayout key="connective-demo">
        <Block id="connective-annotations">
            <h3 className="text-xl font-semibold mb-4 text-emerald-600">🔗 Connective Annotations</h3>

            <div className="space-y-6">
                {/* Linked with visualization */}
                <LinkedDemoSection />

                {/* InlineTrigger */}
                <div className="p-4 bg-emerald-50 rounded-lg">
                    <h4 className="font-medium mb-2">InlineTrigger (Click to activate)</h4>
                    <p className="text-lg leading-relaxed">
                        <InlineTrigger onTrigger={() => alert('Animation triggered!')} icon="play">
                            Click here to trigger an animation
                        </InlineTrigger>{' '}
                        and watch the magic happen!
                    </p>
                </div>
            </div>
        </Block>
    </FullWidthLayout>,
];

// Separate component for Linked demo to manage state
function LinkedDemoSection() {
    const [activeId, setActiveId] = useState<string | null>(null);

    return (
        <div className="p-4 bg-emerald-50 rounded-lg">
            <h4 className="font-medium mb-2">Linked (Bidirectional highlighting)</h4>
            <div className="grid grid-cols-2 gap-4">
                <p className="text-lg leading-relaxed">
                    A circle has three key measurements: the{' '}
                    <Linked
                        linkId="radius"
                        isActive={activeId === 'radius'}
                        onHoverStart={setActiveId}
                        onHoverEnd={() => setActiveId(null)}
                    >
                        radius
                    </Linked>, the{' '}
                    <Linked
                        linkId="diameter"
                        isActive={activeId === 'diameter'}
                        onHoverStart={setActiveId}
                        onHoverEnd={() => setActiveId(null)}
                    >
                        diameter
                    </Linked>, and the{' '}
                    <Linked
                        linkId="circumference"
                        isActive={activeId === 'circumference'}
                        onHoverStart={setActiveId}
                        onHoverEnd={() => setActiveId(null)}
                    >
                        circumference
                    </Linked>.
                </p>
                <LinkedVisualization activeId={activeId} />
            </div>
        </div>
    );
}

export default annotationsDemoSections;
