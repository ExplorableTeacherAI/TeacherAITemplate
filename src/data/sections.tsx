import { type ReactElement } from "react";
import { Section } from "@/components/templates";
import {
    Paragraph,
    MathBlock,
    Heading
} from "@/components/molecules";
import {
    DesmosGraph,
    GeoGebraGraph
} from "@/components/organisms";
import { Spacer } from "@/components/atoms";
import { type DesmosExpression } from "@/components/organisms/DesmosGraph";
import { QuickStartInteractiveExample } from "@/examples/quick-start-interactive";
import { twoJsAnimationsDemoSection } from "./sections/twoJsAnimationsDemo";
import { interactiveAnimationDemoSection } from "./sections/interactiveAnimationDemo";

/**
 * Sections configuration for the canvas.
 * This file uses React components instead of JSON for better type safety,
 * composition, and developer experience.
 * 
 * Vite will watch this file for changes and hot-reload automatically.
 */

export const sectionsMetadata = {
    version: "2.0",
    title: "TeacherAI Sections - Component Based",
    description: "Configurable sections using React components for maximum flexibility.",
};

export const sections: ReactElement[] = [
    // Title Section
    <Section key="intro-title" id="intro-title">
        <Heading level={1}>Geometric interpretation of quadratic and cubic equations</Heading>
    </Section>,

    // Introduction Paragraph
    <Section key="intro-paragraph" id="intro-paragraph">
        <Paragraph>
            Consider a quadratic equation
        </Paragraph>
    </Section>,

    // First Equation
    <Section key="equation-1" id="equation-1">
        <MathBlock equation="x^2 = mx + n" numbered="1" />
    </Section>,

    // Explanation Paragraph
    <Section key="explanation-1" id="explanation-1">
        <Paragraph>
            From elementary school we have learned how to find its solutions, that is,
            all the values of $x$ that satisfy equation (1). To do so we just need to
            use the widely known quadratic formula
        </Paragraph>
    </Section>,

    // Quadratic Formula
    <Section key="quadratic-formula" id="quadratic-formula">
        <MathBlock
            equation={String.raw`x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}`}
            numbered="2"
        />
    </Section>,

    // General Form
    <Section key="general-form" id="general-form">
        <Paragraph>
            of the general quadratic equation
        </Paragraph>
        <MathBlock equation="ax^2 + bx + c = 0" numbered="3" />
    </Section>,

    // Rewriting
    <Section key="rewriting" id="rewriting">
        <Paragraph>
            By rewriting equation $x^2 - mx - n = 0$ (1) as we can use (2) to obtain
        </Paragraph>
    </Section>,

    // Solution Formula
    <Section key="solution-formula" id="solution-formula">
        <MathBlock
            equation={String.raw`x = \frac{m \pm \sqrt{m^2 + 4n}}{2}`}
            numbered="4"
        />
    </Section>,

    // Geometric Interpretation
    <Section key="geometric-interpretation" id="geometric-interpretation">
        <Paragraph>
            If we plot equation (1) we can observe geometrically that it represents the
            intersection of the parabola $y = x^2$ with the line $y = mx + n.$ This can
            be appreciated in the following applet. Drag the sliders below and observe
            what happens with the intersection points $x_0$ and $x_1.$
        </Paragraph>
    </Section>,

    // Add some spacing before visualization
    <Section key="spacer-1" id="spacer-1" padding="none">
        <Spacer height={8} />
    </Section>,

    // Desmos Visualization
    <Section key="desmos-visualization" id="desmos-visualization">
        <DesmosGraph
            aspectRatio="16/9"
            expressions={[
                {
                    id: "parabola",
                    latex: "y=x^2",
                    color: "#c74440",
                    label: "x²",
                    showLabel: true
                },
                {
                    id: "m",
                    latex: "m=0.3",
                    sliderBounds: { min: -2, max: 2, step: 0.1 }
                },
                {
                    id: "n",
                    latex: "n=1.5",
                    sliderBounds: { min: -3, max: 3, step: 0.1 }
                },
                {
                    id: "line",
                    latex: "y=m x + n",
                    color: "#000000",
                    label: "mx+n",
                    showLabel: true
                },
                {
                    id: "x0",
                    latex: String.raw`x_0=\frac{m-\sqrt{m^2+4n}}{2}`,
                    hidden: true
                },
                {
                    id: "x1",
                    latex: String.raw`x_1=\frac{m+\sqrt{m^2+4n}}{2}`,
                    hidden: true
                },
                {
                    id: "p0",
                    latex: "(x_0, x_0^2)",
                    color: "#2d70b3",
                    showLabel: true,
                    label: "x₀"
                },
                {
                    id: "p1",
                    latex: "(x_1, x_1^2)",
                    color: "#2d70b3",
                    showLabel: true,
                    label: "x₁"
                }
            ] as DesmosExpression[]}
            options={{
                expressions: true,
                settingsMenu: false,
                keypad: false,
                zoomButtons: false
            }}
        />
    </Section>,

    // Spacer before GeoGebra
    <Section key="spacer-2" id="spacer-2" padding="none">
        <Spacer height={24} />
    </Section>,

    // GeoGebra Alternative Visualization
    <Section key="geogebra-visualization" id="geogebra-visualization">
        <Paragraph>
            Here's the same visualization using GeoGebra:
        </Paragraph>
        <Spacer height={12} />
        <GeoGebraGraph
            app="graphing"
            mode="applet"
            aspectRatio="16/9"
            params={{
                showMenuBar: false,
                showToolBar: false,
                showAlgebraInput: false,
                enableRightClick: false,
                enableLabelDrags: false,
                showResetIcon: false
            }}
            commands={[
                // Create the functions
                "f(x) = x^2",
                "g(x) = 0.3*x + 1.5",
                // Find intersections
                "A = Intersect(f, g, 1)",
                "B = Intersect(f, g, 2)",
                // Style the parabola
                "SetColor(f, 199, 68, 64)",
                "SetLineThickness(f, 5)",
                // Style the line
                "SetColor(g, 0, 0, 0)",
                "SetLineThickness(g, 3)",
                // Style intersection points
                "SetColor(A, 45, 112, 179)",
                "SetColor(B, 45, 112, 179)",
                "SetPointSize(A, 5)",
                "SetPointSize(B, 5)",
                "ShowLabel(A, true)",
                "ShowLabel(B, true)"
            ]}
        />
    </Section>,

    // Conclusion
    <Section key="conclusion" id="conclusion">
        <Paragraph>
            As you can see, both Desmos and GeoGebra provide interactive visualizations to help understand how the parameters affect the intersection points.
        </Paragraph>
    </Section>,

    // New Interactive Component Example
    <Section key="interactive-example" id="interactive-example">
        <QuickStartInteractiveExample />
    </Section>,

    // Two.js Animations Demo
    <Section key="twojs-animations" id="twojs-animations">
        {twoJsAnimationsDemoSection.content}
    </Section>,

    // Interactive Animation Controls Demo
    <Section key="interactive-animation" id="interactive-animation">
        {interactiveAnimationDemoSection.content}
    </Section>,
];




