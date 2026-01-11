/**
 * Annotation System Demo
 * 
 * Showcases all annotation types with examples.
 */

import { useState } from 'react';
import { Section } from '@/components/templates';
import { FullWidthLayout } from '@/components/layouts';
import {
    Hoverable,
    Glossary,
    Whisper,
    Stepper,
    Toggle,
    FillBlank,
    MultiChoice,
    Linked,
    Trigger,
} from '@/components/annotations';

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
        <Section id="annotations-intro">
            <h2 className="text-2xl font-bold mb-4">📐 Annotation System Demo</h2>
            <p className="text-lg text-muted-foreground">
                Interactive annotations for explorable explanations. Each annotation type has a distinct visual style.
            </p>
        </Section>
    </FullWidthLayout>,

    // Informational Category
    <FullWidthLayout key="informational-demo">
        <Section id="informational-annotations">
            <h3 className="text-xl font-semibold mb-4 text-amber-600">🔍 Informational Annotations</h3>

            <div className="space-y-6">
                {/* Hoverable */}
                <div className="p-4 bg-amber-50 rounded-lg">
                    <h4 className="font-medium mb-2">Hoverable (Tooltip on hover)</h4>
                    <p className="text-lg leading-relaxed">
                        Every point on a{' '}
                        <Hoverable tooltip="A circle is a shape where all points are equidistant from a center point called the origin.">
                            circle
                        </Hoverable>{' '}
                        has the same distance from its center. This distance is called the{' '}
                        <Hoverable tooltip="The radius is the distance from the center to any point on the circle. It equals half the diameter.">
                            radius
                        </Hoverable>.
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
        </Section>
    </FullWidthLayout>,

    // Mutable Category
    <FullWidthLayout key="mutable-demo">
        <Section id="mutable-annotations">
            <h3 className="text-xl font-semibold mb-4 text-fuchsia-600">🔄 Mutable Annotations</h3>

            <div className="space-y-6">
                {/* Stepper */}
                <div className="p-4 bg-fuchsia-50 rounded-lg">
                    <h4 className="font-medium mb-2">Stepper (Numeric values)</h4>
                    <p className="text-lg leading-relaxed">
                        If we increase the number of polygon sides to{' '}
                        <Stepper initialValue={6} min={3} max={20} />{' '}
                        the shape becomes more circular. Try dragging the number!
                    </p>
                </div>

                {/* Toggle */}
                <div className="p-4 bg-fuchsia-50 rounded-lg">
                    <h4 className="font-medium mb-2">Toggle (Cycle through options)</h4>
                    <p className="text-lg leading-relaxed">
                        The current shape is a{' '}
                        <Toggle options={['triangle', 'square', 'pentagon', 'hexagon']} />{' '}
                        with equal sides. Click to cycle through options!
                    </p>
                </div>
            </div>
        </Section>
    </FullWidthLayout>,

    // Validatable Category
    <FullWidthLayout key="validatable-demo">
        <Section id="validatable-annotations">
            <h3 className="text-xl font-semibold mb-4 text-blue-600">✅ Validatable Annotations</h3>

            <div className="space-y-6">
                {/* FillBlank */}
                <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium mb-2">FillBlank (Text input quiz)</h4>
                    <p className="text-lg leading-relaxed">
                        A right angle has exactly{' '}
                        <FillBlank correctAnswer="90" placeholder="???" />{' '}
                        degrees. Type your answer!
                    </p>
                </div>

                {/* MultiChoice */}
                <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium mb-2">MultiChoice (Dropdown quiz)</h4>
                    <p className="text-lg leading-relaxed">
                        The definition of a sphere is similar to a{' '}
                        <MultiChoice
                            correctAnswer="circle"
                            options={['cube', 'circle', 'square', 'triangle']}
                            placeholder="???"
                        />{' '}
                        – except in three dimensions!
                    </p>
                </div>
            </div>
        </Section>
    </FullWidthLayout>,

    // Connective Category
    <FullWidthLayout key="connective-demo">
        <Section id="connective-annotations">
            <h3 className="text-xl font-semibold mb-4 text-emerald-600">🔗 Connective Annotations</h3>

            <div className="space-y-6">
                {/* Linked with visualization */}
                <LinkedDemoSection />

                {/* Trigger */}
                <div className="p-4 bg-emerald-50 rounded-lg">
                    <h4 className="font-medium mb-2">Trigger (Click to activate)</h4>
                    <p className="text-lg leading-relaxed">
                        <Trigger action={() => alert('Animation triggered!')} icon="play">
                            Click here to trigger an animation
                        </Trigger>{' '}
                        and watch the magic happen!
                    </p>
                </div>
            </div>
        </Section>
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
