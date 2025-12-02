import { Section } from "@/components/sections";
import {
    Paragraph,
    MathBlock,
    Heading,
    DesmosGraph,
    GeoGebraGraph,
    Spacer
} from "@/components/content";

/**
 * Example sections showcasing various component combinations.
 * Copy these examples into your sections.tsx file and customize as needed!
 */

// Example 1: Simple text with math
export const exampleTextWithMath = (
    <Section key="example-text" id="example-text">
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
);

// Example 2: Interactive Desmos with sliders
export const exampleDesmosInteractive = (
    <Section key="example-desmos" id="example-desmos">
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
);

// Example 3: GeoGebra geometric construction
export const exampleGeoGebraGeometry = (
    <Section key="example-geogebra" id="example-geogebra">
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
);

// Example 4: Multi-step problem with spacing
export const exampleMultiStepProblem = (
    <Section key="example-problem" id="example-problem">
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
);

// Example 5: Side-by-side concept (using div layout)
export const exampleSideBySide = (
    <Section key="example-comparison" id="example-comparison">
        <Heading level={2}>Comparing Functions</Heading>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <Heading level={3}>Linear Function</Heading>
                <Paragraph>$f(x) = mx + b$</Paragraph>
                <MathBlock equation="f(x) = 2x + 1" mode="block" />
            </div>
            <div>
                <Heading level={3}>Quadratic Function</Heading>
                <Paragraph>$g(x) = ax^2 + bx + c$</Paragraph>
                <MathBlock equation="g(x) = x^2 - 3x + 2" mode="block" />
            </div>
        </div>
    </Section>
);

// Example 6: Full lesson combining everything
export const exampleFullLesson = [
    <Section key="lesson-title" id="lesson-title">
        <Heading level={1}>Understanding Parabolas</Heading>
    </Section>,

    <Section key="lesson-intro" id="lesson-intro">
        <Paragraph>
            A parabola is the graph of a quadratic function. In this lesson, we'll explore
            how different parameters affect the shape and position of a parabola.
        </Paragraph>
    </Section>,

    <Section key="lesson-standard-form" id="lesson-standard-form">
        <Heading level={2}>Standard Form</Heading>
        <Paragraph>
            The standard form of a quadratic function is:
        </Paragraph>
        <MathBlock equation="f(x) = ax^2 + bx + c" numbered="1" />
        <Paragraph>
            where $a \neq 0$, and $a$, $b$, $c$ are constants.
        </Paragraph>
    </Section>,

    <Section key="lesson-interactive" id="lesson-interactive">
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
    </Section>,

    <Section key="lesson-conclusion" id="lesson-conclusion">
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
];

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
