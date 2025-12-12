import React from "react";
import { Section } from "@/components/templates";
import { FullWidthLayout, SplitLayout } from "@/components/layouts";

import {
    Paragraph,
    MathBlock,
    Heading,
    InteractiveTerm,
    InteractiveEquation,
    InteractiveParagraph
} from "@/components/molecules";
import {
    DesmosGraph,
    GeoGebraGraph
} from "@/components/organisms";
import {
    Spacer,
    ColoredEquationProvider,
    ColoredEquation,
    HighlightedTerm,
    TermReveal
} from "@/components/atoms";


/**
 * Example sections showcasing various component combinations.
 * Copy these examples into your sections.tsx file and customize as needed!
 */

// Example 1: Simple text with math
export const exampleTextWithMath = (
    <FullWidthLayout key="example-text" maxWidth="xl">
        <Section id="example-text">
            <Heading level={2}>Introduction to Calculus</Heading>
            <Paragraph>
                The derivative of a function $f(x)$ at a point $x = a$ is defined as:
            </Paragraph>
            <MathBlock
                equation="f'(a) = \lim_{h \to 0} \frac{f(a+h) - f(a)}{h}"
                numbered="1"
            />
            <Paragraph>
                This limit, when it exists, gives us the instantaneous rate of change.
            </Paragraph>
        </Section>
    </FullWidthLayout>
);

// Example 2: Interactive Desmos with sliders
export const exampleDesmosInteractive = (
    <FullWidthLayout key="example-desmos" maxWidth="xl">
        <Section id="example-desmos">
            <Heading level={2}>Quadratic Function Explorer</Heading>
            <Paragraph>
                Adjust the parameters $a$, $b$, and $c$ to see how they affect the parabola $y = ax^2 + bx + c$:
            </Paragraph>
            <Spacer height={12} />
            <DesmosGraph
                height={450}
                expressions={[
                    {
                        id: "a",
                        latex: "a=1",
                        sliderBounds: { min: -3, max: 3, step: 0.1 }
                    },
                    {
                        id: "b",
                        latex: "b=0",
                        sliderBounds: { min: -5, max: 5, step: 0.1 }
                    },
                    {
                        id: "c",
                        latex: "c=0",
                        sliderBounds: { min: -5, max: 5, step: 0.1 }
                    },
                    {
                        id: "parabola",
                        latex: "y=a x^2 + b x + c",
                        color: "#c74440",
                        label: "f(x)",
                        showLabel: true
                    },
                    {
                        id: "vertex_x",
                        latex: "h=-b/(2a)",
                        hidden: true
                    },
                    {
                        id: "vertex_y",
                        latex: "k=a h^2 + b h + c",
                        hidden: true
                    },
                    {
                        id: "vertex",
                        latex: "(h, k)",
                        color: "#2d70b3",
                        showLabel: true,
                        label: "vertex"
                    }
                ]}
                options={{
                    expressions: true,
                    settingsMenu: false,
                    keypad: false,
                    zoomButtons: true
                }}
            />
        </Section>
    </FullWidthLayout>
);

// Example 3: GeoGebra geometric construction
export const exampleGeoGebraGeometry = (
    <FullWidthLayout key="example-geogebra" maxWidth="xl">
        <Section id="example-geogebra">
            <Heading level={2}>Triangle Properties</Heading>
            <Paragraph>
                This interactive diagram shows a triangle with its centroid, orthocenter, and circumcenter.
                Notice how these special points are related!
            </Paragraph>
            <Spacer height={16} />
            <GeoGebraGraph
                app="geometry"
                mode="applet"
                height={500}
                params={{
                    showMenuBar: false,
                    showToolBar: true,
                    showAlgebraInput: false,
                    showZoomButtons: true
                }}
                commands={[
                    "A = (0, 0)",
                    "B = (6, 0)",
                    "C = (2, 4)",
                    "triangle = Polygon(A, B, C)",
                    "centroid = Centroid(triangle)",
                    "SetPointStyle(centroid, 4)",
                    "SetPointSize(centroid, 6)",
                    "SetColor(centroid, \"red\")",
                    "SetLabel(centroid, \"Centroid\")",
                    "ShowLabel(centroid, true)"
                ]}
            />
        </Section>
    </FullWidthLayout>
);

// Example 4: Multi-step problem with spacing
export const exampleMultiStepProblem = (
    <FullWidthLayout key="example-problem" maxWidth="xl">
        <Section id="example-problem">
            <Heading level={2}>Solving a Quadratic Equation</Heading>
            <Paragraph>
                Let's solve the equation $x^2 - 5x + 6 = 0$ step by step.
            </Paragraph>

            <Spacer height={12} />
            <Heading level={3}>Step 1: Identify coefficients</Heading>
            <Paragraph>
                Comparing with $ax^2 + bx + c = 0$, we have: $a=1$, $b=-5$, $c=6$
            </Paragraph>

            <Spacer height={12} />
            <Heading level={3}>Step 2: Apply the quadratic formula</Heading>
            <MathBlock
                equation="x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}"
                numbered="1"
            />

            <Spacer height={12} />
            <Heading level={3}>Step 3: Substitute values</Heading>
            <MathBlock
                equation="x = \frac{5 \pm \sqrt{25 - 24}}{2} = \frac{5 \pm 1}{2}"
                numbered="2"
            />

            <Spacer height={12} />
            <Heading level={3}>Step 4: Solve for both roots</Heading>
            <Paragraph>
                Therefore: $x_1 = 3$ and $x_2 = 2$
            </Paragraph>
        </Section>
    </FullWidthLayout>
);

// Example 5: Side-by-side concept (using div layout)
export const exampleSideBySide = [
    <FullWidthLayout key="example-comparison-title" maxWidth="xl">
        <Section id="example-comparison-title" padding="sm">
            <Heading level={2}>Comparing Functions</Heading>
        </Section>
    </FullWidthLayout>,
    <SplitLayout key="example-comparison" ratio="1:1" gap="md">
        <Section id="example-comparison-left">
            <Heading level={3}>Linear Function</Heading>
            <Paragraph>$f(x) = mx + b$</Paragraph>
            <MathBlock equation="f(x) = 2x + 1" mode="block" />
        </Section>
        <Section id="example-comparison-right">
            <Heading level={3}>Quadratic Function</Heading>
            <Paragraph>$g(x) = ax^2 + bx + c$</Paragraph>
            <MathBlock equation="g(x) = x^2 - 3x + 2" mode="block" />
        </Section>
    </SplitLayout>
];

// Example 6: Full lesson combining everything
export const exampleFullLesson = [
    <FullWidthLayout key="lesson-title" maxWidth="xl">
        <Section id="lesson-title">
            <Heading level={1}>Understanding Parabolas</Heading>
        </Section>
    </FullWidthLayout>,

    <FullWidthLayout key="lesson-intro" maxWidth="xl">
        <Section id="lesson-intro">
            <Paragraph>
                A parabola is the graph of a quadratic function. In this lesson, we'll explore
                how different parameters affect the shape and position of a parabola.
            </Paragraph>
        </Section>
    </FullWidthLayout>,

    <FullWidthLayout key="lesson-standard-form" maxWidth="xl">
        <Section id="lesson-standard-form">
            <Heading level={2}>Standard Form</Heading>
            <Paragraph>
                The standard form of a quadratic function is:
            </Paragraph>
            <MathBlock equation="f(x) = ax^2 + bx + c" numbered="1" />
            <Paragraph>
                where $a \neq 0$, and $a$, $b$, $c$ are constants.
            </Paragraph>
        </Section>
    </FullWidthLayout>,

    <FullWidthLayout key="lesson-interactive" maxWidth="xl">
        <Section id="lesson-interactive">
            <Heading level={2}>Interactive Exploration</Heading>
            <Paragraph>
                Use the sliders below to see how changing $a$, $b$, and $c$ affects the parabola:
            </Paragraph>
            <DesmosGraph
                height={400}
                expressions={[
                    { id: "a", latex: "a=1", sliderBounds: { min: -3, max: 3, step: 0.1 } },
                    { id: "b", latex: "b=0", sliderBounds: { min: -5, max: 5, step: 0.5 } },
                    { id: "c", latex: "c=0", sliderBounds: { min: -5, max: 5, step: 0.5 } },
                    { id: "f", latex: "y=a x^2 + b x + c", color: "#c74440" }
                ]}
                options={{ expressions: true, settingsMenu: false }}
            />
        </Section>
    </FullWidthLayout>,

    <FullWidthLayout key="lesson-conclusion" maxWidth="xl">
        <Section id="lesson-conclusion">
            <Heading level={2}>Key Observations</Heading>
            <Paragraph>
                Notice that:
            </Paragraph>
            <ul className="list-disc list-inside space-y-2 ml-4">
                <li>The parameter $a$ controls the "width" and direction (up/down) of the parabola</li>
                <li>The parameter $b$ affects the horizontal position of the vertex</li>
                <li>The parameter $c$ is the $y$-intercept</li>
            </ul>
        </Section>
    </FullWidthLayout>
];

// ============================================================================
// INTERACTIVE COMPONENTS EXAMPLES
// ============================================================================

// Example 7: Interactive Text with Visual Changes (like the uploaded image)
export const exampleInteractiveText = () => {
    const [graphState, setGraphState] = React.useState<'default' | 'dropX' | 'dropY' | 'bestLine'>('default');
    const [highlightedEquation, setHighlightedEquation] = React.useState(false);

    // Graph expressions that change based on state
    const getGraphExpressions = () => {
        const basePoints = [
            { id: 'point1', latex: '(1, 3)', color: '#c74440' },
            { id: 'point2', latex: '(2, 2.5)', color: '#c74440' },
            { id: 'point3', latex: '(3, 1)', color: '#c74440' },
            { id: 'point4', latex: '(4, 2)', color: '#2d70b3' },
            { id: 'point5', latex: '(5, 1.5)', color: '#2d70b3' },
            { id: 'point6', latex: '(6, 0.5)', color: '#2d70b3' },
        ];

        if (graphState === 'dropX') {
            return [
                ...basePoints,
                { id: 'xLine', latex: 'x=3', color: '#ffa500', lineStyle: 'DASHED' as const },
            ];
        } else if (graphState === 'dropY') {
            return [
                ...basePoints,
                { id: 'yLine', latex: 'y=2', color: '#ffa500', lineStyle: 'DASHED' as const },
            ];
        } else if (graphState === 'bestLine') {
            return [
                ...basePoints,
                {
                    id: 'bestFit',
                    latex: '0.79y=-0.61x+4',
                    color: highlightedEquation ? '#ff0000' : '#ffa500',
                    lineWidth: highlightedEquation ? 3 : 2
                },
            ];
        }

        return basePoints;
    };

    return (
        <FullWidthLayout key="example-interactive" maxWidth="xl">
            <Section id="example-interactive">
                <Heading level={2}>Linear Discriminant Analysis (LDA)</Heading>

                <InteractiveParagraph>
                    You can{' '}
                    <InteractiveTerm
                        onClick={() => setGraphState('dropX')}
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
                            setHighlightedEquation(!highlightedEquation);
                        }}
                        onHoverStart={() => {
                            setGraphState('bestLine');
                            setHighlightedEquation(true);
                        }}
                        onHoverEnd={() => {
                            setHighlightedEquation(false);
                        }}
                        isActive={highlightedEquation}
                        color="#c74440"
                    />
                    {' '}provides the best possible separation. This best line is what LDA allows us to find.
                </InteractiveParagraph>

                <Spacer height={16} />

                <DesmosGraph
                    height={400}
                    expressions={getGraphExpressions()}
                    options={{
                        expressions: false,
                        settingsMenu: false,
                        keypad: false,
                        xAxisLabel: 'Price',
                        yAxisLabel: 'Distance'
                    }}
                />
            </Section>
        </FullWidthLayout>
    );
};

// Example 8: Simple Interactive Term with Hover Effects
export const exampleSimpleInteractive = () => {
    const [activeSection, setActiveSection] = React.useState<string | null>(null);

    return (
        <FullWidthLayout key="example-simple-interactive" maxWidth="xl">
            <Section id="example-simple-interactive">
                <Heading level={2}>Interactive Terminology</Heading>

                <InteractiveParagraph>
                    The{' '}
                    <InteractiveTerm
                        onHoverStart={() => setActiveSection('derivative')}
                        onHoverEnd={() => setActiveSection(null)}
                        color="#2d70b3"
                        underlineStyle="dashed"
                    >
                        derivative
                    </InteractiveTerm>
                    {' '}of a function measures its rate of change, while the{' '}
                    <InteractiveTerm
                        onHoverStart={() => setActiveSection('integral')}
                        onHoverEnd={() => setActiveSection(null)}
                        color="#388c46"
                        underlineStyle="dashed"
                    >
                        integral
                    </InteractiveTerm>
                    {' '}measures the area under its curve.
                </InteractiveParagraph>

                <Spacer height={12} />

                {activeSection === 'derivative' && (
                    <MathBlock equation="f'(x) = \lim_{h \to 0} \frac{f(x+h) - f(x)}{h}" mode="block" />
                )}

                {activeSection === 'integral' && (
                    <MathBlock equation="\int_a^b f(x) \, dx" mode="block" />
                )}
            </Section>
        </FullWidthLayout>
    );
};

// Example 9: Interactive Equation Comparison
export const exampleEquationComparison = () => {
    const [selectedEquation, setSelectedEquation] = React.useState<'linear' | 'quadratic' | null>(null);

    return (
        <FullWidthLayout key="example-equation-compare" maxWidth="xl">
            <Section id="example-equation-compare">
                <Heading level={2}>Compare Function Types</Heading>

                <InteractiveParagraph>
                    Compare the{' '}
                    <InteractiveEquation
                        equation="f(x) = mx + b"
                        onClick={() => setSelectedEquation('linear')}
                        isActive={selectedEquation === 'linear'}
                        color="#2d70b3"
                    />
                    {' '}linear function with the{' '}
                    <InteractiveEquation
                        equation="g(x) = ax^2 + bx + c"
                        onClick={() => setSelectedEquation('quadratic')}
                        isActive={selectedEquation === 'quadratic'}
                        color="#c74440"
                    />
                    {' '}quadratic function.
                </InteractiveParagraph>

                <Spacer height={16} />

                {selectedEquation && (
                    <DesmosGraph
                        height={350}
                        expressions={[
                            ...(selectedEquation === 'linear' ? [
                                { id: 'm', latex: 'm=2', sliderBounds: { min: -5, max: 5, step: 0.1 } },
                                { id: 'b', latex: 'b=1', sliderBounds: { min: -5, max: 5, step: 0.1 } },
                                { id: 'linear', latex: 'y=m*x+b', color: '#2d70b3' }
                            ] : []),
                            ...(selectedEquation === 'quadratic' ? [
                                { id: 'a', latex: 'a=1', sliderBounds: { min: -3, max: 3, step: 0.1 } },
                                { id: 'b', latex: 'b=0', sliderBounds: { min: -5, max: 5, step: 0.1 } },
                                { id: 'c', latex: 'c=0', sliderBounds: { min: -5, max: 5, step: 0.1 } },
                                { id: 'quadratic', latex: 'y=a*x^2+b*x+c', color: '#c74440' }
                            ] : [])
                        ]}
                        options={{ expressions: true, settingsMenu: false }}
                    />
                )}
            </Section>
        </FullWidthLayout>
    );
};

// Example 10: Complete Interactive Lesson (like the uploaded image)
export const exampleInteractiveLDALesson = () => {
    const [projectionAxis, setProjectionAxis] = React.useState<'x' | 'y' | 'optimal'>('optimal');
    const [showOptimalLine, setShowOptimalLine] = React.useState(false);

    const getProjectionExpressions = () => {
        const redPoints = [
            { id: 'red1', latex: '(2, 4)', color: '#c74440', pointStyle: 'POINT' },
            { id: 'red2', latex: '(3, 3.5)', color: '#c74440', pointStyle: 'POINT' },
            { id: 'red3', latex: '(5, 2.8)', color: '#c74440', pointStyle: 'POINT' },
        ];

        const bluePoints = [
            { id: 'blue1', latex: '(1.5, 2)', color: '#2d70b3', pointStyle: 'POINT' },
            { id: 'blue2', latex: '(4, 1.5)', color: '#2d70b3', pointStyle: 'POINT' },
            { id: 'blue3', latex: '(4.5, 1)', color: '#2d70b3', pointStyle: 'POINT' },
        ];

        const expressions: any[] = [...redPoints, ...bluePoints];

        if (projectionAxis === 'y' || showOptimalLine) {
            expressions.push({
                id: 'yAxis',
                latex: 'x=3',
                color: '#ffa500',
                lineStyle: 'DASHED'
            });
        }

        if (projectionAxis === 'optimal' && showOptimalLine) {
            expressions.push({
                id: 'optimalLine',
                latex: '0.79*y=-0.61*x+4',
                color: '#ff0066',
                lineWidth: 2.5
            });
        }

        return expressions;
    };

    return (
        <FullWidthLayout key="example-lda-full" maxWidth="xl">
            <Section id="example-lda-full">
                <Heading level={1}>Linear Discriminant Analysis</Heading>

                <Spacer height={12} />

                <InteractiveParagraph>
                    You can{' '}
                    <InteractiveTerm
                        onClick={() => setProjectionAxis('x')}
                        onHoverStart={() => setProjectionAxis('x')}
                        onHoverEnd={() => setProjectionAxis('optimal')}
                        color="#c74440"
                        isActive={projectionAxis === 'x'}
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
                        onClick={() => setShowOptimalLine(!showOptimalLine)}
                        onHoverStart={() => setShowOptimalLine(true)}
                        color="#c74440"
                        isActive={showOptimalLine}
                    />
                    {' '}provides the best possible separation.
                    This best line is what LDA allows us to find.
                </InteractiveParagraph>

                <Spacer height={20} />

                <SplitLayout ratio="1:1" gap="lg" align="start">
                    <div>
                        <Heading level={3}>2D Scatter Plot</Heading>
                        <DesmosGraph
                            height={350}
                            expressions={getProjectionExpressions()}
                            options={{
                                expressions: false,
                                settingsMenu: false,
                                xAxisLabel: 'Price',
                                yAxisLabel: 'Distance'
                            }}
                        />
                    </div>
                    <div>
                        <Heading level={3}>1D Projection</Heading>
                        <DesmosGraph
                            height={350}
                            expressions={[
                                { id: 'redProj1', latex: '(1, 0)', color: '#c74440' },
                                { id: 'redProj2', latex: '(2, 0)', color: '#c74440' },
                                { id: 'blueProj1', latex: '(4, 0)', color: '#2d70b3' },
                                { id: 'blueProj2', latex: '(5, 0)', color: '#2d70b3' },
                                { id: 'line', latex: 'y=0', color: '#000000' }
                            ]}

                            options={{
                                expressions: false,
                                settingsMenu: false,
                                yAxisNumbers: false
                            }}
                        />
                    </div>
                </SplitLayout>
            </Section>
        </FullWidthLayout>
    );
};

// Example 11: Einstein's Mass-Energy Equivalence with Inline Paragraph
export const exampleEquationColoring = (
    <FullWidthLayout key="example-equation-coloring" maxWidth="xl">
        <Section id="example-equation-coloring">
            <Heading level={2}>Einstein's Mass-Energy Equivalence</Heading>
            <Spacer height={16} />

            <ColoredEquationProvider
                colorMap={{
                    energy: "#e11d48",  // red
                    mass: "#2563eb",    // blue
                    light: "#d97706"    // amber
                }}
            >
                <div className="text-lg leading-relaxed space-y-4">
                    <p>
                        Perhaps the most famous equation in physics:
                    </p>

                    <div className="flex justify-center py-4">
                        <ColoredEquation
                            latex="\clr{energy}{E} = \clr{mass}{m} \clr{light}{c}^2"
                            className="text-4xl md:text-5xl"
                        />
                    </div>

                    <p>
                        This equation tells us that <HighlightedTerm name="energy">energy (E)</HighlightedTerm> and <HighlightedTerm name="mass">mass (m)</HighlightedTerm> are
                        interchangeable — they are different forms of the same thing. The <HighlightedTerm name="light">speed of light (c)</HighlightedTerm>,
                        approximately 300 million meters per second, acts as the conversion factor.
                    </p>

                    <p>
                        Because <HighlightedTerm name="light">c²</HighlightedTerm> is such an enormous number, even a tiny amount of <HighlightedTerm name="mass">mass</HighlightedTerm> contains
                        a tremendous amount of <HighlightedTerm name="energy">energy</HighlightedTerm>. This is the principle behind both nuclear power and nuclear weapons.
                    </p>
                </div>
            </ColoredEquationProvider>
        </Section>
    </FullWidthLayout>
);

// Example 12: Schrödinger Equation with Inline Paragraph
export const exampleSchrodingerEquation = (
    <FullWidthLayout key="example-schrodinger" maxWidth="xl">
        <Section id="example-schrodinger">
            <Heading level={2}>The Schrödinger Equation</Heading>
            <Spacer height={16} />

            <ColoredEquationProvider
                colorMap={{
                    h: "#8b5cf6",    // violet
                    Psi: "#ec4899",  // pink
                    m: "#f59e0b",    // amber
                    V: "#10b981",    // emerald
                    r: "#3b82f6"     // blue
                }}
            >
                <div className="text-lg leading-relaxed space-y-4">
                    <p>
                        The time-dependent Schrödinger equation describes how quantum systems evolve:
                    </p>

                    <div className="flex justify-center py-4">
                        <ColoredEquation
                            latex="i \clr{h}{\hbar} \frac{\partial}{\partial t} \clr{Psi}{\Psi}(\clr{r}{\mathbf{r}},t) = \left[ \frac{-\clr{h}{\hbar}^2}{2\clr{m}{m}} \nabla^2 + \clr{V}{V}(\clr{r}{\mathbf{r}},t) \right] \clr{Psi}{\Psi}(\clr{r}{\mathbf{r}},t)"
                            className="text-xl md:text-2xl"
                        />
                    </div>

                    <p>
                        In this equation, <HighlightedTerm name="Psi">Ψ (Psi) is the wave function</HighlightedTerm> that describes
                        the quantum state of a particle at position <HighlightedTerm name="r">r</HighlightedTerm> and time t.
                        The <HighlightedTerm name="h">reduced Planck constant ℏ</HighlightedTerm> (pronounced "h-bar") sets the
                        fundamental scale of quantum mechanics.
                    </p>

                    <p>
                        The equation balances kinetic and potential energy: the term with <HighlightedTerm name="m">mass m</HighlightedTerm> in
                        the denominator relates to kinetic energy via the Laplacian operator ∇², while <HighlightedTerm name="V">V</HighlightedTerm> represents
                        the potential energy that the particle experiences from its environment.
                    </p>
                </div>

            </ColoredEquationProvider>
        </Section>
    </FullWidthLayout>
);

// Example 13: Inline Equation with Paragraph Explanations
export const exampleInlineEquation = (
    <FullWidthLayout key="example-inline-equation" maxWidth="xl">
        <Section id="example-inline-equation">
            <Heading level={2}>Inline Equation Explanations</Heading>
            <Spacer height={16} />

            <ColoredEquationProvider
                colorMap={{
                    F: "#ef4444",  // red
                    m: "#3b82f6",  // blue  
                    a: "#22c55e"   // green
                }}
            >
                <div className="text-lg leading-relaxed space-y-4">
                    <p>
                        Newton's Second Law is expressed as{' '}
                        <ColoredEquation latex="\clr{F}{F} = \clr{m}{m} \clr{a}{a}" />
                        {' '}where <HighlightedTerm name="F">F represents the net force</HighlightedTerm> applied to an object,{' '}
                        <HighlightedTerm name="m">m is the object's mass</HighlightedTerm>, and{' '}
                        <HighlightedTerm name="a">a is the resulting acceleration</HighlightedTerm>.
                    </p>

                    <p>
                        This relationship is fundamental because it shows that{' '}
                        <TermReveal terms="F">force is what causes an object to accelerate</TermReveal>{' '}
                        <TermReveal terms="m">— and the same force produces less acceleration on more massive objects</TermReveal>{' '}
                        <TermReveal terms="a">— meaning acceleration is inversely proportional to mass for a given force</TermReveal>.
                    </p>
                </div>
            </ColoredEquationProvider>
        </Section>
    </FullWidthLayout>
);

/**
 * Usage in sections.tsx:
 * 
 * import { exampleFullLesson } from './examples/sections-examples';
 * 
 * export const sections: React.ReactElement[] = [
 *   ...exampleFullLesson,

 *   // ... your other sections
 * ];
 */
