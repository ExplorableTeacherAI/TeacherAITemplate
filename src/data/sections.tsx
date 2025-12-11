import { type ReactElement } from "react";
import { Section } from "@/components/templates";
import {
    Paragraph,
    MathBlock,
    Heading
} from "@/components/molecules";
import {
    DesmosGraph
} from "@/components/organisms";
import { Spacer } from "@/components/atoms";
import { type DesmosExpression } from "@/components/organisms/DesmosGraph";
import { QuickStartInteractiveExample } from "@/examples/quick-start-interactive";
import { twoJsAnimationsDemoSection } from "./sections/twoJsAnimationsDemo";
import { threeJsAnimationsDemoSection } from "./sections/threeJsAnimationsDemo";
import { interactiveAnimationDemoSection } from "./sections/interactiveAnimationDemo";
import { infoTooltipDemoSection } from "./sections/infoTooltipDemo";
import { inlineDropdownDemoSection } from "./sections/inlineDropdownDemo";
import { inlineTextInputDemoSection } from "./sections/inlineTextInputDemo";
import { inlineStepperDemoSection } from "./sections/inlineStepperDemo";

// Import layout components
import { FullWidthLayout, SplitLayout, GridLayout, SidebarLayout, Sidebar, Main } from "@/components/layouts";

// Import layout demo sections
import {
    layoutIntroSection,
    splitDemoLeftSection,
    splitDemoRightSection,
    gridDemoSection1,
    gridDemoSection2,
    gridDemoSection3,
    sidebarDemoSidebarSection,
    sidebarDemoMainSection,
    fullWidthDemoSection,
} from "./sections/layoutsDemo";

/**
 * Sections configuration for the canvas.
 * This file uses React components instead of JSON for better type safety,
 * composition, and developer experience.
 * 
 * NOW WITH LAYOUT SYSTEM: Sections can be wrapped in layout components
 * to control how they are arranged on the page.
 * 
 * Vite will watch this file for changes and hot-reload automatically.
 */

export const sectionsMetadata = {
    version: "2.0",
    title: "TeacherAI Sections - Component Based with Layouts",
    description: "Configurable sections using React components with flexible layout system.",
};

export const sections: ReactElement[] = [
    // ========================================
    // FULL-WIDTH LAYOUT DEMO
    // ========================================
    <FullWidthLayout key="layout-intro" maxWidth="xl">
        <Section id="layout-intro">
            {layoutIntroSection.content}
        </Section>
    </FullWidthLayout>,

    // ========================================
    // SPLIT LAYOUT DEMO (50/50)
    // ========================================
    <FullWidthLayout key="split-layout-header" maxWidth="xl">
        <Section id="split-layout-header">
            <div className="mb-4">
                <h2 className="text-3xl font-bold mb-2">Split Layout Example</h2>
                <p className="text-muted-foreground">
                    Perfect for pairing explanations with visualizations. Content on the left, interactive demo on the right.
                </p>
            </div>
        </Section>
    </FullWidthLayout>,

    <SplitLayout key="split-demo" ratio="1:1" gap="lg">
        <Section id="split-demo-left">
            {splitDemoLeftSection.content}
        </Section>
        <Section id="split-demo-right">
            {splitDemoRightSection.content}
        </Section>
    </SplitLayout>,

    // ========================================
    // GRID LAYOUT DEMO (3 columns)
    // ========================================
    <FullWidthLayout key="grid-layout-header" maxWidth="xl">
        <Section id="grid-layout-header">
            <div className="mt-12 mb-4">
                <h2 className="text-3xl font-bold mb-2">Grid Layout Example</h2>
                <p className="text-muted-foreground">
                    Great for showcasing multiple examples or concepts side by side. Automatically responsive.
                </p>
            </div>
        </Section>
    </FullWidthLayout>,

    <GridLayout key="grid-demo" columns={3} gap="md">
        <Section id="grid-demo-1">
            {gridDemoSection1.content}
        </Section>
        <Section id="grid-demo-2">
            {gridDemoSection2.content}
        </Section>
        <Section id="grid-demo-3">
            {gridDemoSection3.content}
        </Section>
    </GridLayout>,

    // ========================================
    // SIDEBAR LAYOUT DEMO
    // ========================================
    <FullWidthLayout key="sidebar-layout-header" maxWidth="xl">
        <Section id="sidebar-layout-header">
            <div className="mt-12 mb-4">
                <h2 className="text-3xl font-bold mb-2">Sidebar Layout Example</h2>
                <p className="text-muted-foreground">
                    Useful for persistent context like glossaries or navigation. Sidebar sticks while scrolling.
                </p>
            </div>
        </Section>
    </FullWidthLayout>,

    <SidebarLayout key="sidebar-demo" sidebarPosition="left" sidebarWidth="medium" gap="lg">
        <Sidebar>
            <Section id="sidebar-demo-sidebar">
                {sidebarDemoSidebarSection.content}
            </Section>
        </Sidebar>
        <Main>
            <Section id="sidebar-demo-main">
                {sidebarDemoMainSection.content}
            </Section>
        </Main>
    </SidebarLayout>,

    // ========================================
    // FULL-WIDTH CONCLUSION
    // ========================================
    <FullWidthLayout key="full-width-demo" maxWidth="xl">
        <Section id="full-width-demo">
            {fullWidthDemoSection.content}
        </Section>
    </FullWidthLayout>,

    // ========================================
    // ORIGINAL CONTENT WITH LAYOUTS
    // ========================================
    <FullWidthLayout key="original-content-divider" maxWidth="xl">
        <Section id="original-content-divider">
            <div className="mt-16 mb-8 border-t pt-8">
                <h2 className="text-3xl font-bold mb-2">Original Lesson Content</h2>
                <p className="text-muted-foreground">
                    Below is your original geometric interpretation lesson, now wrapped in layout components.
                </p>
            </div>
        </Section>
    </FullWidthLayout>,

    // Title Section
    <FullWidthLayout key="intro-title" maxWidth="xl">
        <Section id="intro-title">
            <Heading level={1}>Geometric interpretation of quadratic and cubic equations</Heading>
        </Section>
    </FullWidthLayout>,

    // Introduction Paragraph
    <FullWidthLayout key="intro-paragraph" maxWidth="xl">
        <Section id="intro-paragraph">
            <Paragraph>
                Consider a quadratic equation
            </Paragraph>
        </Section>
    </FullWidthLayout>,

    // First Equation
    <FullWidthLayout key="equation-1" maxWidth="xl">
        <Section id="equation-1">
            <MathBlock equation="x^2 = mx + n" numbered="1" />
        </Section>
    </FullWidthLayout>,

    // Explanation Paragraph
    <FullWidthLayout key="explanation-1" maxWidth="xl">
        <Section id="explanation-1">
            <Paragraph>
                From elementary school we have learned how to find its solutions, that is,
                all the values of $x$ that satisfy equation (1). To do so we just need to
                use the widely known quadratic formula
            </Paragraph>
        </Section>
    </FullWidthLayout>,

    // Quadratic Formula
    <FullWidthLayout key="quadratic-formula" maxWidth="xl">
        <Section id="quadratic-formula">
            <MathBlock
                equation={String.raw`x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}`}
                numbered="2"
            />
        </Section>
    </FullWidthLayout>,

    // General Form
    <FullWidthLayout key="general-form" maxWidth="xl">
        <Section id="general-form">
            <Paragraph>
                of the general quadratic equation
            </Paragraph>
            <MathBlock equation="ax^2 + bx + c = 0" numbered="3" />
        </Section>
    </FullWidthLayout>,

    // Rewriting
    <FullWidthLayout key="rewriting" maxWidth="xl">
        <Section id="rewriting">
            <Paragraph>
                By rewriting equation $x^2 - mx - n = 0$ (1) as we can use (2) to obtain
            </Paragraph>
        </Section>
    </FullWidthLayout>,

    // Solution Formula
    <FullWidthLayout key="solution-formula" maxWidth="xl">
        <Section id="solution-formula">
            <MathBlock
                equation={String.raw`x = \frac{m \pm \sqrt{m^2 + 4n}}{2}`}
                numbered="4"
            />
        </Section>
    </FullWidthLayout>,

    // Geometric Interpretation
    <FullWidthLayout key="geometric-interpretation" maxWidth="xl">
        <Section id="geometric-interpretation">
            <Paragraph>
                If we plot equation (1) we can observe geometrically that it represents the
                intersection of the parabola $y = x^2$ with the line $y = mx + n.$ This can
                be appreciated in the following applet. Drag the sliders below and observe
                what happens with the intersection points $x_0$ and $x_1.$
            </Paragraph>
        </Section>
    </FullWidthLayout>,

    // Add some spacing before visualization
    <FullWidthLayout key="spacer-1" maxWidth="xl">
        <Section id="spacer-1" padding="none">
            <Spacer height={8} />
        </Section>
    </FullWidthLayout>,

    // Desmos Visualization
    <FullWidthLayout key="desmos-visualization" maxWidth="xl">
        <Section id="desmos-visualization">
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
        </Section>
    </FullWidthLayout>,

    // Conclusion
    <FullWidthLayout key="conclusion" maxWidth="xl">
        <Section id="conclusion">
            <Paragraph>
                The interactive Desmos visualization helps understand how the parameters affect the intersection points.
            </Paragraph>
        </Section>
    </FullWidthLayout>,

    // New Interactive Component Example
    <FullWidthLayout key="interactive-example" maxWidth="xl">
        <Section id="interactive-example">
            <QuickStartInteractiveExample />
        </Section>
    </FullWidthLayout>,

    // Two.js Animations Demo
    <FullWidthLayout key="twojs-animations" maxWidth="full">
        <Section id="twojs-animations">
            {twoJsAnimationsDemoSection.content}
        </Section>
    </FullWidthLayout>,

    // Three.js Animations Demo
    <FullWidthLayout key="threejs-animations" maxWidth="full">
        <Section id="threejs-animations">
            {threeJsAnimationsDemoSection.content}
        </Section>
    </FullWidthLayout>,

    // Interactive Animation Controls Demo
    <FullWidthLayout key="interactive-animation" maxWidth="xl">
        <Section id="interactive-animation">
            {interactiveAnimationDemoSection.content}
        </Section>
    </FullWidthLayout>,

    // InfoTooltip Demo
    <FullWidthLayout key="info-tooltip-demo" maxWidth="xl">
        <Section id="info-tooltip-demo">
            {infoTooltipDemoSection.content}
        </Section>
    </FullWidthLayout>,

    // InlineDropdown Demo
    <FullWidthLayout key="inline-dropdown-demo" maxWidth="xl">
        <Section id="inline-dropdown-demo">
            {inlineDropdownDemoSection.content}
        </Section>
    </FullWidthLayout>,

    // InlineTextInput Demo
    <FullWidthLayout key="inline-text-input-demo" maxWidth="xl">
        <Section id="inline-text-input-demo">
            {inlineTextInputDemoSection.content}
        </Section>
    </FullWidthLayout>,

    // InlineStepper Demo
    <FullWidthLayout key="inline-stepper-demo" maxWidth="xl">
        <Section id="inline-stepper-demo">
            {inlineStepperDemoSection.content}
        </Section>
    </FullWidthLayout>,
];




