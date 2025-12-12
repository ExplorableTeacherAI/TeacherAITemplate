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
    TermReveal,
    FlowDiagram,
    type FlowNode,
    type FlowEdge,
    ExpandableFlowDiagram,
    type TreeNode,
    InteractiveHighlightProvider,
    InteractiveText,
    useActiveHighlight,
    useSetActiveHighlight
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
        <Section id="example-equation-coloring-header">
            <Heading level={2}>Einstein's Mass-Energy Equivalence</Heading>
        </Section>

        <ColoredEquationProvider
            colorMap={{
                energy: "#e11d48",  // red
                mass: "#2563eb",    // blue
                light: "#d97706"    // amber
            }}
        >
            <Section id="example-equation-coloring-equation">
                <p className="text-lg">
                    Perhaps the most famous equation in physics:
                </p>
                <div className="flex justify-center py-4">
                    <ColoredEquation
                        latex="\clr{energy}{E} = \clr{mass}{m} \clr{light}{c}^2"
                        className="text-4xl md:text-5xl"
                    />
                </div>
            </Section>

            <Section id="example-equation-coloring-explanation">
                <div className="text-lg leading-relaxed space-y-4">
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
            </Section>
        </ColoredEquationProvider>
    </FullWidthLayout>
);

// Example 12: Schrödinger Equation with Inline Paragraph
export const exampleSchrodingerEquation = (
    <FullWidthLayout key="example-schrodinger" maxWidth="xl">
        <Section id="example-schrodinger-header">
            <Heading level={2}>The Schrödinger Equation</Heading>
        </Section>

        <ColoredEquationProvider
            colorMap={{
                h: "#8b5cf6",    // violet
                Psi: "#ec4899",  // pink
                m: "#f59e0b",    // amber
                V: "#10b981",    // emerald
                r: "#3b82f6"     // blue
            }}
        >
            <Section id="example-schrodinger-equation">
                <p className="text-lg">
                    The time-dependent Schrödinger equation describes how quantum systems evolve:
                </p>
                <div className="flex justify-center py-4">
                    <ColoredEquation
                        latex="i \clr{h}{\hbar} \frac{\partial}{\partial t} \clr{Psi}{\Psi}(\clr{r}{\mathbf{r}},t) = \left[ \frac{-\clr{h}{\hbar}^2}{2\clr{m}{m}} \nabla^2 + \clr{V}{V}(\clr{r}{\mathbf{r}},t) \right] \clr{Psi}{\Psi}(\clr{r}{\mathbf{r}},t)"
                        className="text-xl md:text-2xl"
                    />
                </div>
            </Section>

            <Section id="example-schrodinger-explanation">
                <div className="text-lg leading-relaxed space-y-4">
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
            </Section>
        </ColoredEquationProvider>
    </FullWidthLayout>
);

// Example 13: Inline Equation with Paragraph Explanations
export const exampleInlineEquation = (
    <FullWidthLayout key="example-inline-equation" maxWidth="xl">
        <Section id="example-inline-equation-header">
            <Heading level={2}>Inline Equation Explanations</Heading>
        </Section>

        <ColoredEquationProvider
            colorMap={{
                F: "#ef4444",  // red
                m: "#3b82f6",  // blue  
                a: "#22c55e"   // green
            }}
        >
            <Section id="example-inline-equation-content">
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
            </Section>
        </ColoredEquationProvider>
    </FullWidthLayout>
);

// ============================================================================
// FLOW DIAGRAM EXAMPLES (React Flow)
// ============================================================================

// Sample nodes and edges for examples
const sampleNodes: FlowNode[] = [
    { id: '1', label: 'Start', position: { x: 150, y: 0 } },
    { id: '2', label: 'Process A', position: { x: 50, y: 100 } },
    { id: '3', label: 'Process B', position: { x: 250, y: 100 } },
    { id: '4', label: 'Decision', position: { x: 150, y: 200 } },
    { id: '5', label: 'End', position: { x: 150, y: 300 } },
];

const sampleEdges: FlowEdge[] = [
    { id: 'e1-2', source: '1', target: '2' },
    { id: 'e1-3', source: '1', target: '3' },
    { id: 'e2-4', source: '2', target: '4' },
    { id: 'e3-4', source: '3', target: '4' },
    { id: 'e4-5', source: '4', target: '5', label: 'Done' },
];

// Example 14: Basic Flow Diagram
export const exampleFlowDiagramBasic = (
    <FullWidthLayout key="example-flow-basic" maxWidth="xl">
        <Section id="example-flow-basic">
            <Heading level={2}>Flow Diagram</Heading>
            <Paragraph>
                A simple flow diagram showing a basic process. Nodes can be dragged and the
                diagram can be panned and zoomed.
            </Paragraph>
            <Spacer height={16} />
            <FlowDiagram
                nodes={sampleNodes}
                edges={sampleEdges}
                height={400}
                showControls={true}
                showBackground={true}
                backgroundVariant="dots"
            />
        </Section>
    </FullWidthLayout>
);

// Example 15: Interactive Flow Diagram
export const exampleFlowDiagramInteractive = () => {
    const [clickedNode, setClickedNode] = React.useState<FlowNode | null>(null);

    const nodes: FlowNode[] = [
        { id: 'input', label: 'Input Data', position: { x: 150, y: 0 } },
        { id: 'validate', label: 'Validate', position: { x: 150, y: 100 } },
        { id: 'transform', label: 'Transform', position: { x: 150, y: 200 } },
        { id: 'output', label: 'Output', position: { x: 150, y: 300 } },
    ];

    const edges: FlowEdge[] = [
        { id: 'e-input-validate', source: 'input', target: 'validate', animated: true },
        { id: 'e-validate-transform', source: 'validate', target: 'transform', animated: true },
        { id: 'e-transform-output', source: 'transform', target: 'output', animated: true },
    ];

    return (
        <FullWidthLayout key="example-flow-interactive" maxWidth="xl">
            <Section id="example-flow-interactive">
                <Heading level={2}>Interactive Pipeline Diagram</Heading>
                <Paragraph>
                    Click on any node to see its details. Edges are animated to show data flow direction.
                </Paragraph>
                <Spacer height={16} />

                <FlowDiagram
                    nodes={nodes}
                    edges={edges}
                    height={400}
                    showControls={true}
                    onNodeClick={(node) => setClickedNode(node)}
                />

                <Spacer height={16} />

                {clickedNode && (
                    <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
                        <p className="text-lg">
                            You clicked on: <strong>{String(clickedNode.label)}</strong> (ID: {clickedNode.id})
                        </p>
                    </div>
                )}
            </Section>
        </FullWidthLayout>
    );
};

// Example 16: Flow Diagram with Custom Nodes
export const exampleFlowDiagramCustom = (
    <FullWidthLayout key="example-flow-custom" maxWidth="xl">
        <Section id="example-flow-custom">
            <Heading level={2}>Concept Map Example</Heading>
            <Paragraph>
                FlowDiagram can be used for various visualizations like concept maps,
                decision trees, and process flows.
            </Paragraph>
            <Spacer height={16} />

            <FlowDiagram
                nodes={[
                    {
                        id: 'main',
                        label: 'Machine Learning',
                        position: { x: 200, y: 0 },
                        style: { background: '#dbeafe', border: '2px solid #3b82f6' }
                    },
                    {
                        id: 'supervised',
                        label: 'Supervised',
                        position: { x: 50, y: 100 },
                        style: { background: '#dcfce7', border: '2px solid #22c55e' }
                    },
                    {
                        id: 'unsupervised',
                        label: 'Unsupervised',
                        position: { x: 200, y: 100 },
                        style: { background: '#fef9c3', border: '2px solid #eab308' }
                    },
                    {
                        id: 'reinforcement',
                        label: 'Reinforcement',
                        position: { x: 350, y: 100 },
                        style: { background: '#fce7f3', border: '2px solid #ec4899' }
                    },
                    {
                        id: 'classification',
                        label: 'Classification',
                        position: { x: 0, y: 200 }
                    },
                    {
                        id: 'regression',
                        label: 'Regression',
                        position: { x: 100, y: 200 }
                    },
                    {
                        id: 'clustering',
                        label: 'Clustering',
                        position: { x: 200, y: 200 }
                    },
                ]}
                edges={[
                    { id: 'e1', source: 'main', target: 'supervised' },
                    { id: 'e2', source: 'main', target: 'unsupervised' },
                    { id: 'e3', source: 'main', target: 'reinforcement' },
                    { id: 'e4', source: 'supervised', target: 'classification' },
                    { id: 'e5', source: 'supervised', target: 'regression' },
                    { id: 'e6', source: 'unsupervised', target: 'clustering' },
                ]}
                height={350}
                showControls={true}
                showMinimap={false}
            />
        </Section>
    </FullWidthLayout>
);

// Example 17: Expandable Tree Diagram - Click to reveal children
export const exampleExpandableTree = () => {
    const [lastClicked, setLastClicked] = React.useState<string | null>(null);

    // Define the tree structure
    const treeData: TreeNode = {
        id: 'root',
        label: '🌳 Click me to expand',
        expanded: false,
        children: [
            {
                id: 'branch-1',
                label: 'Branch A',
                children: [
                    { id: 'leaf-1a', label: '🍃 Leaf A1' },
                    { id: 'leaf-1b', label: '🍃 Leaf A2' },
                ]
            },
            {
                id: 'branch-2',
                label: 'Branch B',
                children: [
                    { id: 'leaf-2a', label: '🍃 Leaf B1' },
                    {
                        id: 'sub-branch',
                        label: 'Sub-branch',
                        children: [
                            { id: 'deep-leaf-1', label: '🌿 Deep Leaf 1' },
                            { id: 'deep-leaf-2', label: '🌿 Deep Leaf 2' },
                        ]
                    },
                ]
            },
            {
                id: 'branch-3',
                label: 'Branch C',
                children: [
                    { id: 'leaf-3a', label: '🍃 Leaf C1' },
                ]
            },
        ]
    };

    return (
        <FullWidthLayout key="example-expandable-tree" maxWidth="xl">
            <Section id="example-expandable-tree">
                <Heading level={2}>Expandable Tree Diagram</Heading>
                <Paragraph>
                    Click on any node with a <strong>+</strong> indicator to reveal its children.
                    Click again to collapse. This is perfect for visualizing hierarchical data.
                </Paragraph>
                <Spacer height={16} />

                <ExpandableFlowDiagram
                    rootNode={treeData}
                    height={450}
                    showControls={true}
                    onNodeClick={(node, isExpanded) => {
                        setLastClicked(`${node.label} (${isExpanded ? 'expanded' : 'collapsed'})`);
                    }}
                />

                <Spacer height={16} />

                {lastClicked && (
                    <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
                        <p className="text-lg">
                            Last action: <strong>{lastClicked}</strong>
                        </p>
                    </div>
                )}
            </Section>
        </FullWidthLayout>
    );
};

// Example 18: Factor Tree using Expandable Diagram
export const exampleFactorTreeExpandable = () => {
    // Factor tree for 60: 60 = 2 × 2 × 3 × 5
    const factorTreeData: TreeNode = {
        id: '60',
        label: '60',
        expanded: true,
        style: { background: '#dbeafe', border: '2px solid #3b82f6' },
        children: [
            {
                id: '2-first',
                label: '2',
                style: { background: '#dcfce7', border: '2px solid #22c55e' },
            },
            {
                id: '30',
                label: '30',
                expanded: true,
                style: { background: '#dbeafe', border: '2px solid #3b82f6' },
                children: [
                    {
                        id: '2-second',
                        label: '2',
                        style: { background: '#dcfce7', border: '2px solid #22c55e' },
                    },
                    {
                        id: '15',
                        label: '15',
                        expanded: true,
                        style: { background: '#dbeafe', border: '2px solid #3b82f6' },
                        children: [
                            {
                                id: '3',
                                label: '3',
                                style: { background: '#dcfce7', border: '2px solid #22c55e' },
                            },
                            {
                                id: '5',
                                label: '5',
                                style: { background: '#dcfce7', border: '2px solid #22c55e' },
                            },
                        ]
                    },
                ]
            },
        ]
    };

    return (
        <FullWidthLayout key="example-factor-tree-expandable" maxWidth="xl">
            <Section id="example-factor-tree-expandable">
                <Heading level={2}>Factor Tree Example</Heading>
                <Paragraph>
                    A factor tree showing the prime factorization of 60.
                    <span style={{ color: '#22c55e', fontWeight: 'bold' }}> Green nodes</span> are prime numbers.
                </Paragraph>
                <Spacer height={16} />

                <ExpandableFlowDiagram
                    rootNode={factorTreeData}
                    height={400}
                    showControls={true}
                    horizontalSpacing={100}
                    verticalSpacing={80}
                />

                <Spacer height={12} />
                <MathBlock
                    equation="60 = 2 \times 2 \times 3 \times 5 = 2^2 \times 3 \times 5"
                    numbered="1"
                />
            </Section>
        </FullWidthLayout>
    );
};

// ============================================================================
// BIDIRECTIONAL INTERACTION EXAMPLE
// ============================================================================

// Example 19: Side-by-side with bidirectional interactions
export const exampleBidirectionalInteraction = () => {
    // Track which element is highlighted (from either text or diagram interaction)
    const [highlightedNode, setHighlightedNode] = React.useState<string | null>(null);

    // Node definitions with colors for highlighting
    const nodeColors: Record<string, { default: string; highlight: string; border: string }> = {
        'data': { default: '#dbeafe', highlight: '#93c5fd', border: '#3b82f6' },
        'preprocess': { default: '#fef9c3', highlight: '#fde047', border: '#eab308' },
        'model': { default: '#dcfce7', highlight: '#86efac', border: '#22c55e' },
        'train': { default: '#fce7f3', highlight: '#f9a8d4', border: '#ec4899' },
        'evaluate': { default: '#e0e7ff', highlight: '#a5b4fc', border: '#6366f1' },
    };

    // Flow diagram nodes
    const nodes: FlowNode[] = [
        {
            id: 'data',
            label: '📊 Data Collection',
            position: { x: 150, y: 0 },
            style: {
                background: highlightedNode === 'data' ? nodeColors.data.highlight : nodeColors.data.default,
                border: `2px solid ${nodeColors.data.border}`,
                transition: 'all 0.3s ease',
                transform: highlightedNode === 'data' ? 'scale(1.05)' : 'scale(1)',
            }
        },
        {
            id: 'preprocess',
            label: '🔧 Preprocessing',
            position: { x: 150, y: 100 },
            style: {
                background: highlightedNode === 'preprocess' ? nodeColors.preprocess.highlight : nodeColors.preprocess.default,
                border: `2px solid ${nodeColors.preprocess.border}`,
                transition: 'all 0.3s ease',
                transform: highlightedNode === 'preprocess' ? 'scale(1.05)' : 'scale(1)',
            }
        },
        {
            id: 'model',
            label: '🧠 Model Selection',
            position: { x: 150, y: 200 },
            style: {
                background: highlightedNode === 'model' ? nodeColors.model.highlight : nodeColors.model.default,
                border: `2px solid ${nodeColors.model.border}`,
                transition: 'all 0.3s ease',
                transform: highlightedNode === 'model' ? 'scale(1.05)' : 'scale(1)',
            }
        },
        {
            id: 'train',
            label: '🎯 Training',
            position: { x: 150, y: 300 },
            style: {
                background: highlightedNode === 'train' ? nodeColors.train.highlight : nodeColors.train.default,
                border: `2px solid ${nodeColors.train.border}`,
                transition: 'all 0.3s ease',
                transform: highlightedNode === 'train' ? 'scale(1.05)' : 'scale(1)',
            }
        },
        {
            id: 'evaluate',
            label: '📈 Evaluation',
            position: { x: 150, y: 400 },
            style: {
                background: highlightedNode === 'evaluate' ? nodeColors.evaluate.highlight : nodeColors.evaluate.default,
                border: `2px solid ${nodeColors.evaluate.border}`,
                transition: 'all 0.3s ease',
                transform: highlightedNode === 'evaluate' ? 'scale(1.05)' : 'scale(1)',
            }
        },
    ];

    // Flow diagram edges
    const edges: FlowEdge[] = [
        { id: 'e1', source: 'data', target: 'preprocess', animated: highlightedNode === 'data' || highlightedNode === 'preprocess' },
        { id: 'e2', source: 'preprocess', target: 'model', animated: highlightedNode === 'preprocess' || highlightedNode === 'model' },
        { id: 'e3', source: 'model', target: 'train', animated: highlightedNode === 'model' || highlightedNode === 'train' },
        { id: 'e4', source: 'train', target: 'evaluate', animated: highlightedNode === 'train' || highlightedNode === 'evaluate' },
    ];

    // Interactive word component
    const InteractiveWord: React.FC<{
        nodeId: string;
        children: React.ReactNode;
        color: string;
    }> = ({ nodeId, children, color }) => (
        <span
            style={{
                color: highlightedNode === nodeId ? color : 'inherit',
                fontWeight: highlightedNode === nodeId ? 'bold' : 'normal',
                textDecoration: 'underline',
                textDecorationStyle: 'dotted',
                textDecorationColor: color,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                padding: '2px 4px',
                borderRadius: 4,
                backgroundColor: highlightedNode === nodeId ? `${color}22` : 'transparent',
            }}
            onMouseEnter={() => setHighlightedNode(nodeId)}
            onMouseLeave={() => setHighlightedNode(null)}
            onClick={() => setHighlightedNode(prev => prev === nodeId ? null : nodeId)}
        >
            {children}
        </span>
    );

    return (
        <FullWidthLayout key="example-bidirectional" maxWidth="full">
            <Section id="example-bidirectional">
                <Heading level={2}>Machine Learning Pipeline</Heading>
                <Paragraph>
                    Hover over the terms below or click on the diagram nodes to see the connection between text and visualization.
                </Paragraph>
                <Spacer height={20} />

                <SplitLayout ratio="1:1" gap="lg">
                    {/* Left side: Interactive paragraph */}
                    <div className="pr-4">
                        <div className="text-lg leading-relaxed space-y-4">
                            <p>
                                Building a machine learning model follows a systematic pipeline.
                                First, we need to gather our{' '}
                                <InteractiveWord nodeId="data" color={nodeColors.data.border}>
                                    training data
                                </InteractiveWord>
                                {' '}from various sources like databases, APIs, or manual collection.
                            </p>

                            <p>
                                Next comes{' '}
                                <InteractiveWord nodeId="preprocess" color={nodeColors.preprocess.border}>
                                    data preprocessing
                                </InteractiveWord>
                                , which includes cleaning, normalizing, and transforming the raw data
                                into a format suitable for machine learning algorithms.
                            </p>

                            <p>
                                With clean data, we can proceed to{' '}
                                <InteractiveWord nodeId="model" color={nodeColors.model.border}>
                                    model selection
                                </InteractiveWord>
                                . This involves choosing the right algorithm—whether it's
                                a neural network, random forest, or support vector machine—based
                                on our problem type.
                            </p>

                            <p>
                                The{' '}
                                <InteractiveWord nodeId="train" color={nodeColors.train.border}>
                                    training phase
                                </InteractiveWord>
                                {' '}is where the model learns patterns from our data.
                                This typically involves gradient descent and backpropagation
                                to minimize the loss function.
                            </p>

                            <p>
                                Finally,{' '}
                                <InteractiveWord nodeId="evaluate" color={nodeColors.evaluate.border}>
                                    model evaluation
                                </InteractiveWord>
                                {' '}measures performance using metrics like accuracy, precision,
                                recall, and F1-score on a held-out test set.
                            </p>
                        </div>

                        {highlightedNode && (
                            <div className="mt-6 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
                                <p className="text-sm text-slate-600 dark:text-slate-300">
                                    <strong>Currently highlighted:</strong> {highlightedNode.charAt(0).toUpperCase() + highlightedNode.slice(1)}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Right side: Interactive diagram */}
                    <div>
                        <FlowDiagram
                            nodes={nodes}
                            edges={edges}
                            height={500}
                            showControls={true}
                            nodesDraggable={true}
                            onNodeClick={(node) => {
                                setHighlightedNode(prev => prev === node.id ? null : node.id);
                            }}
                        />
                    </div>
                </SplitLayout>
            </Section>
        </FullWidthLayout>
    );
};

// Example 20: Neural Network Architecture with bidirectional interaction
export const exampleNeuralNetworkInteraction = () => {
    const [activeLayer, setActiveLayer] = React.useState<string | null>(null);

    const layerInfo: Record<string, { name: string; description: string; neurons: string }> = {
        'input': {
            name: 'Input Layer',
            description: 'Receives raw features from the data. Each neuron represents one input feature.',
            neurons: '784 neurons (28×28 pixels)'
        },
        'hidden1': {
            name: 'Hidden Layer 1',
            description: 'Learns basic patterns and features from the input data.',
            neurons: '256 neurons'
        },
        'hidden2': {
            name: 'Hidden Layer 2',
            description: 'Combines basic patterns to form more complex representations.',
            neurons: '128 neurons'
        },
        'output': {
            name: 'Output Layer',
            description: 'Produces the final prediction probabilities for each class.',
            neurons: '10 neurons (digits 0-9)'
        },
    };

    const nodes: FlowNode[] = [
        {
            id: 'input',
            label: '📥 Input Layer\n(784)',
            position: { x: 0, y: 150 },
            style: {
                background: activeLayer === 'input' ? '#bfdbfe' : '#dbeafe',
                border: activeLayer === 'input' ? '3px solid #2563eb' : '2px solid #3b82f6',
                fontWeight: activeLayer === 'input' ? 'bold' : 'normal',
            }
        },
        {
            id: 'hidden1',
            label: '🔮 Hidden 1\n(256)',
            position: { x: 150, y: 150 },
            style: {
                background: activeLayer === 'hidden1' ? '#bbf7d0' : '#dcfce7',
                border: activeLayer === 'hidden1' ? '3px solid #16a34a' : '2px solid #22c55e',
                fontWeight: activeLayer === 'hidden1' ? 'bold' : 'normal',
            }
        },
        {
            id: 'hidden2',
            label: '🔮 Hidden 2\n(128)',
            position: { x: 300, y: 150 },
            style: {
                background: activeLayer === 'hidden2' ? '#fde68a' : '#fef9c3',
                border: activeLayer === 'hidden2' ? '3px solid #ca8a04' : '2px solid #eab308',
                fontWeight: activeLayer === 'hidden2' ? 'bold' : 'normal',
            }
        },
        {
            id: 'output',
            label: '📤 Output\n(10)',
            position: { x: 450, y: 150 },
            style: {
                background: activeLayer === 'output' ? '#fbcfe8' : '#fce7f3',
                border: activeLayer === 'output' ? '3px solid #db2777' : '2px solid #ec4899',
                fontWeight: activeLayer === 'output' ? 'bold' : 'normal',
            }
        },
    ];

    const edges: FlowEdge[] = [
        { id: 'e1', source: 'input', target: 'hidden1', animated: activeLayer === 'input' || activeLayer === 'hidden1' },
        { id: 'e2', source: 'hidden1', target: 'hidden2', animated: activeLayer === 'hidden1' || activeLayer === 'hidden2' },
        { id: 'e3', source: 'hidden2', target: 'output', animated: activeLayer === 'hidden2' || activeLayer === 'output' },
    ];

    const LayerButton: React.FC<{ id: string }> = ({ id }) => {
        const info = layerInfo[id];
        return (
            <button
                className={`w-full p-4 text-left rounded-lg transition-all ${activeLayer === id
                    ? 'bg-blue-100 dark:bg-blue-900 border-2 border-blue-500'
                    : 'bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                onMouseEnter={() => setActiveLayer(id)}
                onMouseLeave={() => setActiveLayer(null)}
                onClick={() => setActiveLayer(prev => prev === id ? null : id)}
            >
                <h4 className="font-bold text-lg mb-1">{info.name}</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">{info.neurons}</p>
            </button>
        );
    };

    return (
        <FullWidthLayout key="example-neural-network" maxWidth="full">
            <Section id="example-neural-network">
                <Heading level={2}>Neural Network Architecture</Heading>
                <Paragraph>
                    Explore the layers of a neural network for digit classification.
                    Hover over the layer cards or click the diagram nodes.
                </Paragraph>
                <Spacer height={20} />

                <SplitLayout ratio="1:2" gap="lg">
                    {/* Left side: Layer cards */}
                    <div className="space-y-3">
                        <LayerButton id="input" />
                        <LayerButton id="hidden1" />
                        <LayerButton id="hidden2" />
                        <LayerButton id="output" />

                        {activeLayer && (
                            <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
                                <h4 className="font-bold mb-2">{layerInfo[activeLayer].name}</h4>
                                <p className="text-sm">{layerInfo[activeLayer].description}</p>
                            </div>
                        )}
                    </div>

                    {/* Right side: Diagram */}
                    <div>
                        <FlowDiagram
                            nodes={nodes}
                            edges={edges}
                            height={350}
                            showControls={true}
                            onNodeClick={(node) => {
                                setActiveLayer(prev => prev === node.id ? null : node.id);
                            }}
                        />
                    </div>
                </SplitLayout>
            </Section>
        </FullWidthLayout>
    );
};

// ============================================================================
// UNIFIED INTERACTIVE HIGHLIGHT EXAMPLE (Using the generic component)
// ============================================================================

// Helper component that uses the context hooks to integrate with FlowDiagram
const ConnectedFlowDiagram: React.FC<{
    nodes: FlowNode[];
    edges: FlowEdge[];
    height?: number;
}> = ({ nodes, edges, height = 400 }) => {
    const activeId = useActiveHighlight();
    const setActiveId = useSetActiveHighlight();

    // Enhance nodes with highlight styling based on context
    const enhancedNodes = nodes.map(node => ({
        ...node,
        style: {
            ...node.style,
            transition: 'all 0.2s ease',
            transform: activeId === node.id ? 'scale(1.05)' : 'scale(1)',
            boxShadow: activeId === node.id ? '0 4px 12px rgba(0,0,0,0.15)' : undefined,
        }
    }));

    // Animate edges connected to active node
    const enhancedEdges = edges.map(edge => ({
        ...edge,
        animated: activeId === edge.source || activeId === edge.target,
    }));

    return (
        <FlowDiagram
            nodes={enhancedNodes}
            edges={enhancedEdges}
            height={height}
            showControls={true}
            onNodeClick={(node) => {
                if (setActiveId) {
                    setActiveId(activeId === node.id ? null : node.id);
                }
            }}
        />
    );
};

// Example 21: Clean implementation using unified InteractiveHighlight system
export const exampleUnifiedHighlight = () => {
    // Define the style map with colors for each term
    const styleMap = {
        'input': '#3b82f6',  // blue
        'hidden': '#22c55e',  // green
        'output': '#ec4899',  // pink
        'weights': '#f59e0b', // amber
    };

    // Nodes for the diagram
    const nodes: FlowNode[] = [
        {
            id: 'input',
            label: '📥 Input Layer',
            position: { x: 0, y: 100 },
            style: { background: '#dbeafe', border: '2px solid #3b82f6' }
        },
        {
            id: 'hidden',
            label: '🧠 Hidden Layer',
            position: { x: 150, y: 100 },
            style: { background: '#dcfce7', border: '2px solid #22c55e' }
        },
        {
            id: 'output',
            label: '📤 Output Layer',
            position: { x: 300, y: 100 },
            style: { background: '#fce7f3', border: '2px solid #ec4899' }
        },
    ];

    const edges: FlowEdge[] = [
        { id: 'e1', source: 'input', target: 'hidden', label: 'weights' },
        { id: 'e2', source: 'hidden', target: 'output', label: 'weights' },
    ];

    return (
        <FullWidthLayout key="example-unified-highlight" maxWidth="full">
            <Section id="example-unified-highlight-header">
                <Heading level={2}>Unified Interactive Highlight System</Heading>
            </Section>
            <InteractiveHighlightProvider styleMap={styleMap}>
                <SplitLayout ratio="1:1" gap="lg">
                    {/* Left side: Text with interactive terms */}
                    <Section id="example-unified-highlight-text">
                        <div className="text-lg leading-relaxed space-y-4">
                            <p>
                                A neural network processes data through multiple layers. The{' '}
                                <InteractiveText id="input">input layer</InteractiveText>
                                {' '}receives raw features from your data.
                            </p>

                            <p>
                                Data then flows through the{' '}
                                <InteractiveText id="hidden">hidden layers</InteractiveText>
                                , where mathematical transformations extract patterns and features.
                            </p>

                            <p>
                                Finally, the{' '}
                                <InteractiveText id="output">output layer</InteractiveText>
                                {' '}produces predictions based on the learned representations.
                            </p>

                            <p>
                                Between layers, learnable{' '}
                                <InteractiveText id="weights">weights</InteractiveText>
                                {' '}determine how strongly each connection affects the output.
                            </p>
                        </div>
                    </Section>

                    {/* Right side: Connected diagram */}
                    <Section id="example-unified-highlight-diagram">
                        <ConnectedFlowDiagram
                            nodes={nodes}
                            edges={edges}
                            height={300}
                        />
                    </Section>
                </SplitLayout>
            </InteractiveHighlightProvider>
        </FullWidthLayout>
    );
};

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

