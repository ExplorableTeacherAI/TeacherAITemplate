import React, { type ReactElement } from "react";
import { Section } from "@/components/templates";
import { twoJsAnimationsDemo } from "./sections/twoJsAnimationsDemo";
import { threeJsAnimationsDemo } from "./sections/threeJsAnimationsDemo";
import { d3Demo } from "./sections/d3Demo";
import { mafsDemo } from "./sections/mafsDemo";
import { annotationsDemoSections } from "./sections/annotationsDemo";
import {
    exampleDesmosInteractive,
    exampleEquationColoring,
    exampleSchrodingerEquation,
    exampleInlineEquation,
    exampleUnifiedHighlight
} from "@/examples/sections-examples";


// Import layout components
import { FullWidthLayout, SplitLayout, GridLayout, SidebarLayout, Sidebar, Main } from "@/components/layouts";

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





const exampleSections: ReactElement[] = [
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
