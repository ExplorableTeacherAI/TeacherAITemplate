import React, { type ReactElement } from "react";
import { Section } from "@/components/templates";
import { twoJsAnimationsDemo } from "./sections/twoJsAnimationsDemo";
import { threeJsAnimationsDemo } from "./sections/threeJsAnimationsDemo";
import { d3Demo } from "./sections/d3Demo";
import { mafsDemo } from "./sections/mafsDemo";
import { annotationsDemoSections } from "./sections/annotationsDemo";
import { storeDemoSections } from "./sections/StoreDemoSection";
import {
    exampleDesmosInteractive,
    exampleEquationColoring,
    exampleSchrodingerEquation,
    exampleInlineEquation,
    exampleUnifiedHighlight
} from "@/examples/sections-examples";

// Initialize variables from example variable definitions
import { useVariableStore } from "@/stores";
import { getExampleDefaultValues } from "./exampleVariables";
useVariableStore.getState().initialize(getExampleDefaultValues());


// Import layout components
import { FullWidthLayout, SplitLayout, GridLayout, SidebarLayout, Sidebar, Main } from "@/components/layouts";

// Import equation components for inline editing demo
import { Equation, ColoredEquation, ColoredEquationProvider, HighlightedTerm } from "@/components/atoms";

// Import EditableText for inline text editing
import { EditableText } from "@/components/editing/EditableText";

// Import layout demo sections
import {
    splitDemoLeftSection,
    splitDemoRightSection,
    gridDemoSection1,
    gridDemoSection2,
    gridDemoSection3,
    sidebarDemoSidebarSection,
    sidebarDemoMainSection,

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




// Color map for equation coloring demo
const inlineEditingColors = {
    energy: "#22c55e",
    mass: "#3b82f6",
    velocity: "#f97316",
    momentum: "#a855f7",
};

const exampleSections: ReactElement[] = [
    // ========================================
    // INLINE EDITING DEMO (Test the editing feature)
    // ========================================
    <FullWidthLayout key="inline-editing-header" maxWidth="xl">
        <Section id="inline-editing-header">
            <div className="mb-8">
                <EditableText as="h2" sectionId="inline-editing-header" className="text-3xl font-bold mb-4">
                    Inline Editing Demo
                </EditableText>
                <EditableText as="p" sectionId="inline-editing-header" className="text-muted-foreground mb-4">
                    This section demonstrates the inline editing feature. Click the Edit button
                    in the header to enable editing mode. Then you can click on text to edit it
                    directly, or hover over equations to see the edit button.
                </EditableText>
                <EditableText as="p" sectionId="inline-editing-header" className="text-lg">
                    Physics is the study of matter, energy, and the fundamental forces
                    that govern the universe. Try editing this paragraph!
                </EditableText>
            </div>
        </Section>
    </FullWidthLayout>,

    <FullWidthLayout key="inline-editing-equations" maxWidth="xl">
        <Section id="inline-editing-equations">
            <EditableText as="h3" sectionId="inline-editing-equations" className="text-2xl font-bold mb-4">
                Editable Equations
            </EditableText>
            <EditableText as="p" sectionId="inline-editing-equations" className="mb-6">
                These equations can be edited in edit mode. Hover over them and click the pencil icon.
            </EditableText>

            <div className="space-y-6">
                <div className="p-4 bg-muted rounded-lg">
                    <EditableText as="h4" sectionId="inline-editing-equations" className="text-xl font-semibold mb-2">
                        Mass-Energy Equivalence
                    </EditableText>
                    <EditableText as="p" sectionId="inline-editing-equations" className="mb-3">
                        Einstein's famous equation:
                    </EditableText>
                    <div className="text-2xl text-center py-2">
                        <Equation latex="E = mc^2" />
                    </div>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                    <EditableText as="h4" sectionId="inline-editing-equations" className="text-xl font-semibold mb-2">
                        Newton's Second Law
                    </EditableText>
                    <EditableText as="p" sectionId="inline-editing-equations" className="mb-3">
                        Force equals mass times acceleration:
                    </EditableText>
                    <div className="text-2xl text-center py-2">
                        <Equation latex="F = ma" />
                    </div>
                </div>
            </div>
        </Section>
    </FullWidthLayout>,

    <FullWidthLayout key="inline-editing-colored" maxWidth="xl">
        <ColoredEquationProvider colorMap={inlineEditingColors}>
            <Section id="inline-editing-colored">
                <EditableText as="h3" sectionId="inline-editing-colored" className="text-2xl font-bold mb-4">
                    Colored Equations
                </EditableText>
                <EditableText as="p" sectionId="inline-editing-colored" className="mb-6">
                    Colored equations with the \clr syntax for term coloring:
                </EditableText>
                <div className="p-4 bg-muted rounded-lg">
                    <p className="mb-3">
                        <EditableText sectionId="inline-editing-colored">The </EditableText>
                        <HighlightedTerm name="momentum" sectionId="inline-editing-colored">momentum</HighlightedTerm>
                        <EditableText sectionId="inline-editing-colored"> of an object is the product of its </EditableText>
                        <HighlightedTerm name="mass" sectionId="inline-editing-colored">mass</HighlightedTerm>
                        <EditableText sectionId="inline-editing-colored"> and </EditableText>
                        <HighlightedTerm name="velocity" sectionId="inline-editing-colored">velocity</HighlightedTerm>
                        <EditableText sectionId="inline-editing-colored">:</EditableText>
                    </p>
                    <div className="text-2xl text-center py-2">
                        <ColoredEquation latex="\clr{momentum}{p} = \clr{mass}{m} \cdot \clr{velocity}{v}" />
                    </div>
                </div>
            </Section>
        </ColoredEquationProvider>
    </FullWidthLayout>,

    // ========================================
    // VARIABLE STORE DEMO (Cross-Section State)
    // ========================================
    ...storeDemoSections,

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
    // DESMOS INTERACTIVE EXAMPLE
    // ========================================
    exampleDesmosInteractive,

    // ========================================
    // TWO.JS ANIMATIONS DEMO
    // ========================================
    ...twoJsAnimationsDemo,

    // ========================================
    // THREE.JS ANIMATIONS DEMO
    // ========================================
    ...threeJsAnimationsDemo,

    // ========================================
    // D3.JS DEMO
    // ========================================
    ...d3Demo,

    // ========================================
    // MAFS DEMO
    // ========================================
    ...mafsDemo,

    // ========================================
    // EQUATION COLORING DEMO
    // ========================================
    exampleEquationColoring,
    exampleSchrodingerEquation,
    exampleInlineEquation,

    // ========================================
    // ANNOTATIONS SYSTEM DEMO
    // ========================================
    ...annotationsDemoSections,

    // ========================================
    // UNIFIED HIGHLIGHT SYSTEM DEMO
    // ========================================
    React.createElement(exampleUnifiedHighlight, { key: "unified-highlight" }),
];

export { exampleSections };
