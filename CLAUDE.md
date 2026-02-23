# CLAUDE.md — Agent Instructions

## Project Overview

Interactive explorable-explanation template built with React + TypeScript + Vite.
Content is organized as **blocks** inside **layouts**, with shared state via a **global variable store** (Zustand).

## Files You MUST Edit (lesson content goes here)

| File | Purpose |
|------|---------|
| `src/data/variables.ts` | **Define all shared variables** — edit this FIRST before adding any interactive component |
| `src/data/blocks.tsx` | **Define all blocks** (content, layouts) — this is the main entry point for your lesson |
| `src/data/sections/*.tsx` | Extract complex block components here, then import into `blocks.tsx` |

## Files to READ as Reference Only (NEVER modify)

| File | Purpose |
|------|---------|
| `src/data/exampleBlocks.tsx` | **Reference only** — shows how to use every layout, component, and pattern. Copy patterns into `blocks.tsx`. |
| `src/data/exampleVariables.ts` | **Reference only** — shows how to define every variable type. Copy structure into `variables.ts`. |
| `src/stores/variableStore.ts` | Zustand store implementation (do not edit) |

## Critical Rule: Global Variables

**NEVER pass inline numeric props to `InlineScrubbleNumber`.** Always define variables in the central variables file first, then reference them.

### Two-Step Workflow

#### Step 1: Define the variable in `src/data/variables.ts`

```ts
// src/data/variables.ts
export const variableDefinitions: Record<string, VariableDefinition> = {
    amplitude: {
        defaultValue: 1,
        type: 'number',
        label: 'Amplitude',
        description: 'Wave amplitude',
        unit: 'm',
        min: 0,
        max: 10,
        step: 0.1,
    },
};
```

(See `src/data/exampleVariables.ts` for reference on how to define different variable types.)

#### Step 2: Use the variable in `src/data/blocks.tsx`

```tsx
import { getVariableInfo, numberPropsFromDefinition } from "./variables";

<InlineScrubbleNumber
    varName="amplitude"
    {...numberPropsFromDefinition(getVariableInfo('amplitude'))}
/>
```

### What NOT to do

```tsx
// WRONG — never hardcode numeric props inline
<InlineScrubbleNumber
    varName="amplitude"
    defaultValue={1}
    min={0}
    max={10}
    step={0.1}
/>

// CORRECT — always use the centralized variable definition
<InlineScrubbleNumber
    varName="amplitude"
    {...numberPropsFromDefinition(getVariableInfo('amplitude'))}
/>
```

### Reading/Writing Variables in Components

```tsx
// Read a variable (reactive — auto-updates on change):
import { useVar } from '@/stores';
const amplitude = useVar('amplitude', 1);

// Write a variable:
import { useSetVar } from '@/stores';
const setVar = useSetVar();
setVar('amplitude', 2.5);
```

### Adding a `formatValue` Prop

`formatValue` is the only prop that can be added inline alongside the spread:

```tsx
<InlineScrubbleNumber
    varName="temperature"
    {...numberPropsFromDefinition(getVariableInfo('temperature'))}
    formatValue={(v) => `${v}°C`}
/>
```

## Critical Rule: InlineClozeInput (Fill-in-the-Blank)

**NEVER pass inline props directly to `InlineClozeInput`.** Always define the variable in the central variables file first, then reference it — same pattern as `InlineScrubbleNumber`.

### Two-Step Workflow for Cloze Inputs

#### Step 1: Define the variable in `src/data/variables.ts`

```ts
quarterCircleAngle: {
    defaultValue: '',
    type: 'text',
    label: 'Quarter Circle Angle',
    description: 'Student answer for the quarter circle angle question',
    placeholder: '???',
    correctAnswer: '90',
    color: '#3B82F6',
},
```

#### Step 2: Use the variable in `src/data/blocks.tsx`

```tsx
import { getVariableInfo, clozePropsFromDefinition } from "./variables";

<InlineClozeInput
    varName="quarterCircleAngle"
    correctAnswer="90"
    {...clozePropsFromDefinition(getVariableInfo('quarterCircleAngle'))}
/>
```

### Key Cloze Variable Fields

| Field | Purpose |
|-------|---------|
| `correctAnswer` | The expected answer string (not stored in variable store — stays as a prop) |
| `caseSensitive` | Whether matching is case sensitive (default: `false`) |
| `placeholder` | Button text shown before student types (default: `"???"`) |
| `color` | Text/border color |
| `bgColor` | Background color (supports RGBA) |

## Critical Rule: InlineClozeChoice (Dropdown Fill-in-the-Blank)

**NEVER pass inline props directly to `InlineClozeChoice`.** Always define the variable in the central variables file first, then reference it.

### Two-Step Workflow for Cloze Choices

#### Step 1: Define the variable in `src/data/variables.ts`

```ts
shapeAnswer: {
    defaultValue: '',
    type: 'select',
    label: 'Shape Answer',
    description: 'Student answer for the 2D shape question',
    placeholder: '???',
    correctAnswer: 'circle',
    options: ['cube', 'circle', 'square', 'triangle'],
    color: '#D81B60',
},
```

#### Step 2: Use the variable in `src/data/blocks.tsx`

```tsx
import { getVariableInfo, choicePropsFromDefinition } from "./variables";

<InlineClozeChoice
    varName="shapeAnswer"
    correctAnswer="circle"
    options={["cube", "circle", "square", "triangle"]}
    {...choicePropsFromDefinition(getVariableInfo('shapeAnswer'))}
/>
```

## Critical Rule: InlineToggle (Click to Cycle)

**NEVER pass inline props directly to `InlineToggle`.** Always define the variable in the central variables file first.

### Two-Step Workflow for Toggles

#### Step 1: Define the variable in `src/data/variables.ts`

```ts
currentShape: {
    defaultValue: 'triangle',
    type: 'select',
    label: 'Current Shape',
    description: 'The currently selected polygon shape',
    options: ['triangle', 'square', 'pentagon', 'hexagon'],
    color: '#D946EF',
},
```

#### Step 2: Use the variable in `src/data/blocks.tsx`

```tsx
import { getVariableInfo, togglePropsFromDefinition } from "./variables";

<InlineToggle
    varName="currentShape"
    options={["triangle", "square", "pentagon", "hexagon"]}
    {...togglePropsFromDefinition(getVariableInfo('currentShape'))}
/>
```

## InlineTooltip (Hover Tooltip)

`InlineTooltip` shows a tooltip/definition on hover. Does **NOT** use the variable store — purely informational. No `varName` prop needed.

```tsx
<EditableParagraph id="para-example" blockId="block-example">
    Every point on a{" "}
    <InlineTooltip tooltip="A shape where all points are equidistant from the center.">
        circle
    </InlineTooltip>{" "}
    has the same distance from its center.
</EditableParagraph>
```

| Prop | Type | Default | Purpose |
|------|------|---------|---------|
| `children` | `ReactNode` | *(required)* | The trigger text displayed inline |
| `tooltip` | `string` | *(required)* | The tooltip content shown on hover |
| `color` | `string` | `#F59E0B` | Text color (amber) |
| `bgColor` | `string` | `rgba(245, 158, 11, 0.15)` | Background color on hover |
| `position` | `string` | `'auto'` | Tooltip position: `'auto'`, `'top'`, `'bottom'` |
| `maxWidth` | `number` | `400` | Maximum tooltip width in pixels |

## InlineFormula (Inline Math)

`InlineFormula` renders a KaTeX math formula inline within paragraph text, with optional colored variables using `\clr{name}{content}` syntax. Does **NOT** use the variable store.

```tsx
<EditableParagraph id="para-example" blockId="block-example">
    The area of a circle is{" "}
    <InlineFormula
        latex="\clr{area}{A} = \clr{pi}{\pi} \clr{radius}{r}^2"
        colorMap={{ area: '#ef4444', pi: '#3b82f6', radius: '#3cc499' }}
    />{" "}
    where r is the radius.
</EditableParagraph>
```

| Prop | Type | Default | Purpose |
|------|------|---------|---------|
| `latex` | `string` | *(required)* | LaTeX formula string — use single `\` for commands (see escaping rule below) |
| `colorMap` | `Record<string, string>` | `{}` | Term name → hex color mapping for `\clr{}{}` |
| `color` | `string` | `#8B5CF6` | Wrapper accent color (violet) |

### Critical Rule: LaTeX Escaping in JSX String Attributes

**Use a single `\` for LaTeX commands in JSX string attributes — NEVER `\\`.**

In JSX string attributes (`latex="..."`), a single backslash is passed through literally to KaTeX. Using `\\` produces two literal backslashes in the string, which KaTeX cannot parse — causing broken rendering (e.g., formula text split across lines as plain italic text).

```tsx
// WRONG — double backslash produces "\\sin" which KaTeX cannot parse
<InlineFormula latex="y = A\\sin(\\omega x + \\phi)" colorMap={{}} />

// CORRECT — single backslash produces "\sin" which KaTeX renders properly
<InlineFormula latex="y = A\sin(\omega x + \phi)" colorMap={{}} />
```

This applies to **all** LaTeX commands: `\sin`, `\cos`, `\omega`, `\pi`, `\phi`, `\alpha`, `\frac`, `\sqrt`, `\sum`, `\int`, `\clr`, etc.

**Same rule for `FormulaBlock`:**

```tsx
// CORRECT
<FormulaBlock latex="\clr{force}{F} = \scrub{mass} \times \scrub{acceleration}" ... />
```

## InlineTrigger (Click to Set Variable)

`InlineTrigger` is a clickable inline element that **sets a global variable to a specific value** on click. Belongs to the connective category (emerald `#10B981`).

```tsx
<EditableParagraph id="para-example" blockId="block-example">
    The speed is <InlineScrubbleNumber varName="speed" ... />.
    You can{" "}
    <InlineTrigger varName="speed" value={1} icon="refresh">
        reset it to 1
    </InlineTrigger>{" "}
    or{" "}
    <InlineTrigger varName="speed" value={5} icon="zap">
        max it out
    </InlineTrigger>.
</EditableParagraph>
```

| Prop | Type | Default | Purpose |
|------|------|---------|---------|
| `children` | `ReactNode` | *(required)* | The clickable text displayed inline |
| `varName` | `string` | `undefined` | Variable to set on click |
| `value` | `string \| number \| boolean` | `undefined` | Value to set the variable to |
| `color` | `string` | `#10B981` | Text color (emerald) |
| `bgColor` | `string` | `rgba(16, 185, 129, 0.15)` | Background color on hover |
| `icon` | `string` | `undefined` | Icon after text: `'play'`, `'refresh'`, `'zap'`, `'none'` |
| `onTrigger` | `() => void` | `undefined` | Optional callback after click (not serializable) |

**Note:** `InlineTrigger` does not need a variable definition in `variables.ts` — it only *writes* to the store. The `varName` should reference a variable already defined for another component.

## InlineHyperlink (Click to Navigate)

`InlineHyperlink` is a clickable inline element that either **opens an external URL** in a new tab or **smooth-scrolls to a block** on the page. Does **NOT** use the variable store.

```tsx
<EditableParagraph id="para-example" blockId="block-example">
    Read the{" "}
    <InlineHyperlink href="https://en.wikipedia.org/wiki/Circle">
        Wikipedia article on circles
    </InlineHyperlink>{" "}
    for more background, or{" "}
    <InlineHyperlink targetBlockId="block-intro">
        jump to the intro
    </InlineHyperlink>{" "}
    to start over.
</EditableParagraph>
```

| Prop | Type | Default | Purpose |
|------|------|---------|---------|
| `children` | `ReactNode` | *(required)* | The clickable text displayed inline |
| `href` | `string` | `undefined` | External URL — opens in new tab (`noopener,noreferrer`) |
| `targetBlockId` | `string` | `undefined` | Block ID to scroll to on page (smooth scroll) |
| `color` | `string` | `#10B981` | Text color (emerald) |
| `bgColor` | `string` | `rgba(16, 185, 129, 0.15)` | Background color on hover |

**Click behavior:** `href` → opens URL in new tab; `targetBlockId` → smooth scrolls; both set → `href` takes priority.

## Variable Types

| Type | Example Definition |
|------|--------------------|
| `number` | `{ defaultValue: 5, type: 'number', min: 0, max: 10, step: 1 }` |
| `text` | `{ defaultValue: 'Hello', type: 'text', placeholder: 'Enter...' }` |
| `text` (cloze) | `{ defaultValue: '', type: 'text', correctAnswer: '90', placeholder: '???', color: '#3B82F6' }` |
| `select` | `{ defaultValue: 'sine', type: 'select', options: ['sine', 'cosine'] }` |
| `select` (cloze choice) | `{ defaultValue: '', type: 'select', correctAnswer: 'circle', options: ['cube', 'circle'], placeholder: '???', color: '#D81B60' }` |
| `select` (toggle) | `{ defaultValue: 'triangle', type: 'select', options: ['triangle', 'square', 'pentagon'], color: '#D946EF' }` |
| `boolean` | `{ defaultValue: true, type: 'boolean' }` |
| `array` | `{ defaultValue: [1, 2, 3], type: 'array' }` |
| `object` | `{ defaultValue: { x: 0, y: 0 }, type: 'object', schema: '{ x: number, y: number }' }` |

## Block Structure

Every block must be wrapped in a `Layout` > `Block` hierarchy:

```tsx
<StackLayout key="layout-unique-key" maxWidth="xl">
    <Block id="block-unique-id" padding="sm">
        <EditableParagraph id="para-unique-id" blockId="block-unique-id">
            Content here with{" "}
            <InlineScrubbleNumber
                varName="myVar"
                {...numberPropsFromDefinition(getVariableInfo('myVar'))}
            />
            {" "}inline.
        </EditableParagraph>
    </Block>
</StackLayout>
```

### Critical Rule: One Component Per Block

**Each `<Block>` must contain exactly ONE primary component** — a single heading, a single paragraph, a single formula, or a single visual. Never place multiple components inside the same Block.

```tsx
// WRONG — two components crammed into one Block
<Block id="block-demo" padding="lg">
    <FormulaBlock latex="E = mc^2" />
    <EditableParagraph id="para-explain" blockId="block-demo">
        This is the explanation.
    </EditableParagraph>
</Block>

// CORRECT — each component in its own Block
<StackLayout key="layout-formula" maxWidth="xl">
    <Block id="block-formula" padding="lg">
        <FormulaBlock latex="E = mc^2" />
    </Block>
</StackLayout>,

<StackLayout key="layout-explanation" maxWidth="xl">
    <Block id="block-explanation" padding="sm">
        <EditableParagraph id="para-explain" blockId="block-explanation">
            This is the explanation.
        </EditableParagraph>
    </Block>
</StackLayout>
```

**Exception:** Inline components (`InlineScrubbleNumber`, `InlineClozeInput`, `InlineTooltip`, etc.) belong *inside* their parent `EditableParagraph`.

### ID Conventions
- Layout keys: `layout-<descriptive-name>` (e.g., `layout-paragraph-04`)
- Block IDs: `block-<descriptive-name>` (e.g., `block-paragraph-04`)
- Element IDs: `<type>-<descriptive-name>` (e.g., `para-radius-example`, `h1-main-title`)
- Pass `blockId` prop to editable components matching the parent Block's `id`

## Available Layouts

Import from `@/components/layouts`.

- `StackLayout` — single column, use `maxWidth` prop (`sm`, `md`, `lg`, `xl`, `2xl`, `full`)
- `SplitLayout` — side-by-side (ideal for text + visual), use `ratio` (`1:1`, `1:2`, `2:1`, `1:3`, `3:1`, `2:3`, `3:2`), `gap` (`none`, `sm`, `md`, `lg`, `xl`), `align` (`start`, `center`, `end`, `stretch`)
- `GridLayout` — grid of items (ideal for visual galleries), use `columns` (2–6), `gap`, `mobileColumns`
- `ScrollytellingLayout` — sticky visual + scrolling text steps; use `<ScrollStep>` for each text step and `<ScrollVisual>` for the visualization; `varName` writes the active 0-based step index to a global variable; props: `visualPosition`, `visualWidth`, `gap`, `threshold`, `onStepChange`
- `SlideLayout` — one-slide-at-a-time deck with animated transitions, arrow buttons, dot indicators, keyboard navigation, and an optional slide counter; use `<Slide>` for each slide; `varName` writes the active 0-based slide index to a global variable; props: `height` (`sm`, `md`, `lg`, `xl`, `auto`), `transition` (`fade`, `slide`, `none`), `showArrows`, `arrowPosition` (`inside`, `outside`), `showDots`, `showCounter`, `onSlideChange`
- `StepLayout` — progressive-disclosure layout that reveals content one step at a time; completed steps remain visible above the current one; each step shows a "Continue →" button (or auto-advances when a question is answered correctly); use `<Step>` for each step; `varName` writes the 0-based revealed step index to a global variable; props: `revealLabel`, `showProgress` (text counter, default `true`), `allowBack`, `onStepReveal`

### StepLayout (Progressive Disclosure with Questions)

`StepLayout` reveals lesson content one step at a time. Steps stack vertically — completed steps stay visible above the current one so learners retain context. Two step modes are supported:

1. **Normal step** — shows a "Continue →" button to advance.
2. **Question step** (`autoAdvance`) — hides the button entirely; the next step appears automatically once the learner gives the correct answer.

**Step props:**

| Prop | Type | Default | Purpose |
|------|------|---------|--------|
| `revealLabel` | `string` | layout-level `revealLabel` | Override the Continue button label for this step |
| `completionVarName` | `string` | — | Variable that must be truthy before the learner can proceed (gates the Continue button) |
| `autoAdvance` | `boolean` | `false` | When `true` + `completionVarName` is set, hides the Continue button and auto-reveals next step on correct answer |

```tsx
<StepLayout varName="stepProgress" showProgress={false}>
    {/* Question step — auto-advances on correct answer */}
    <Step completionVarName="myAnswer" autoAdvance>
        <Block id="block-step-q" padding="sm">
            <EditableParagraph id="para-step-q" blockId="block-step-q">
                What is 2 + 2?{" "}
                <InlineClozeInput
                    varName="myAnswer"
                    correctAnswer="4"
                    {...clozePropsFromDefinition(getVariableInfo('myAnswer'))}
                />
            </EditableParagraph>
        </Block>
    </Step>

    {/* Normal step — shows Continue button */}
    <Step>
        <Block id="block-step-1" padding="sm">
            <EditableParagraph id="para-step-1" blockId="block-step-1">
                Correct! Now let's explore further.
            </EditableParagraph>
        </Block>
    </Step>

    {/* Gated step — Continue button disabled until activity is done */}
    <Step completionVarName="nextAnswer">
        <Block id="block-step-2" padding="sm">
            <EditableParagraph id="para-step-2" blockId="block-step-2">
                Complete this to continue:{" "}
                <InlineClozeInput
                    varName="nextAnswer"
                    correctAnswer="yes"
                    {...clozePropsFromDefinition(getVariableInfo('nextAnswer'))}
                />
            </EditableParagraph>
        </Block>
    </Step>
</StepLayout>
```

### SplitLayout with Multiple Components Per Side

`SplitLayout` expects exactly **2 children**. To place multiple blocks on one side, wrap them in a `<div className="space-y-4">` container. Each block inside the wrapper remains independently manageable.

```tsx
<SplitLayout key="layout-example-split" ratio="1:1" gap="lg">
    {/* Left side: multiple blocks wrapped in a div */}
    <div className="space-y-4">
        <Block id="block-left-desc" padding="sm">
            <EditableParagraph id="para-left-desc" blockId="block-left-desc">
                Description text with an interactive value of{" "}
                <InlineScrubbleNumber
                    varName="myVar"
                    {...numberPropsFromDefinition(getVariableInfo('myVar'))}
                />{" "}units.
            </EditableParagraph>
        </Block>
        <Block id="block-left-equation" padding="sm">
            <FormulaBlock latex="y = mx + b" />
        </Block>
        <Block id="block-left-hint" padding="sm">
            <EditableParagraph id="para-left-hint" blockId="block-left-hint">
                Drag the number above to see the visualization update.
            </EditableParagraph>
        </Block>
    </div>
    {/* Right side: single block (no wrapper needed) */}
    <Block id="block-right-viz" padding="sm">
        <ReactiveVisualization />
    </Block>
</SplitLayout>
```

**Key rules:**
- The `<div>` wrapper counts as one child — `SplitLayout` still sees exactly 2 children.
- Use `className="space-y-4"` (or `space-y-2`, `space-y-6`) on the wrapper to control vertical spacing between blocks.
- Each `<Block>` inside the wrapper still follows the **one primary component per Block** rule.
- If both sides need multiple blocks, wrap both sides in `<div>` containers.

## Available Components

### Text Components (ONLY use these for all text content)

- `EditableH1`, `EditableH2`, `EditableH3` — headings (import from `@/components/atoms`)
- `EditableParagraph` — body text, supports inline components (import from `@/components/atoms`)

**NEVER use** plain `<p>`, `<h1>`, `<h2>`, `<h3>` HTML tags. Always use the editable components above.

### Inline Interactive Components

- `InlineScrubbleNumber` — draggable inline number bound to global variable
- `InlineClozeInput` — fill-in-the-blank input with answer validation, bound to global variable
- `InlineClozeChoice` — dropdown choice with answer validation, bound to global variable
- `InlineToggle` — click to cycle through options, bound to global variable
- `InlineTooltip` — hover to show tooltip/definition (no variable store)
- `InlineTrigger` — click to set a variable to a specific value (connective, emerald)
- `InlineHyperlink` — click to open external URL or scroll to a block on page (connective, emerald)
- `InlineSpotColor` — colored text highlight
- `InlineLinkedHighlight` — bidirectional highlighting
- `Table` — block-level table with inline components in cells (import from `@/components/atoms`)

### Math Components

- `InlineFormula` — inline math formula with colored variables (no variable store, import from `@/components/atoms`)
- `FormulaBlock` — block-level math display with interactive elements (import from `@/components/molecules`)

### Visual Components (import from `@/components/atoms`)

#### Media

- `ImageDisplay` — block-level image renderer
  - `src`, `alt`, `caption`, `bordered`, `zoomable`, `objectFit`, `width`, `height`
- `VideoDisplay` — block-level video renderer (files or YouTube)
  - `src`, `alt`, `caption`, `controls`, `autoPlay`, `loop`, `poster`, `aspectRatio`

#### Interactive Math (Mafs)

- `Cartesian2D` — full-featured 2D coordinate system with functions, parametric curves, points, vectors, segments, and circles

#### Data Visualization (D3)

- `DataVisualization` — multi-type chart component (bar, line, area, pie, donut, scatter)
  - `type`: `"bar"` | `"line"` | `"area"` | `"pie"` | `"donut"` | `"scatter"`
  - `data: { label: string, value: number, color?: string }[]` — for bar/line/area/pie/donut
  - `scatterData: { x: number, y: number, label?: string, color?: string, size?: number }[]` — for scatter
  - `width`, `height`, `title`, `xLabel`, `yLabel`
  - `color` (default single color), `colors` (palette array)
  - `showGrid`, `animate`, `showValues`, `showLegend`
  - `curve`: `"linear"` | `"smooth"` | `"step"` — line/area interpolation
  - `donutRatio` — inner radius ratio for donut charts (0–1, default 0.55)
  - `caption` — text below the chart

#### Flow Diagrams (React Flow)

- `FlowDiagram` — interactive node-edge diagrams
  - `nodes: FlowNode[]`, `edges: FlowEdge[]`
  - `height`, `width`, `showBackground`, `backgroundVariant`, `showControls`, `showMinimap`, `nodesDraggable`, `fitView`
- `ExpandableFlowDiagram` — collapsible tree diagrams
  - `rootNode: TreeNode`, `horizontalSpacing`, `verticalSpacing`

#### Matrix Visualization

- `MatrixVisualization` — SVG matrix display with color-coded cells, brackets, indices, and highlighting
  - `data: number[][]`, `label`, `width`, `height`
  - `colorScheme`: `"none"` | `"heatmap"` | `"diverging"` | `"categorical"`
  - `color`, `positiveColor`, `negativeColor`
  - `showGrid`, `showValues`, `showIndices`, `showBrackets`
  - `highlightRows`, `highlightCols`, `highlightCells`, `highlightColor`
  - `onCellClick`, `onCellHover`, `onHoverLeave`

### External Graph Tools (import from `@/components/organisms`)

- `DesmosGraph` — embedded Desmos graphing calculator
  - `expressions: { latex: string, color?: string }[]`, `height`, `options`
- `GeoGebraGraph` — embedded GeoGebra applet
  - `app`: `"classic"` | `"graphing"` | `"geometry"` | `"3d"` | `"cas"`
  - `materialId`, `commands`, `width`, `height`

### Required Props for All Text Components

Every `EditableParagraph` and `EditableH1/H2/H3` MUST have:
- A unique `id` prop (e.g., `id="para-intro"`)
- A `blockId` prop matching the parent `Block`'s `id` (e.g., `blockId="block-intro"`)

```tsx
// WRONG — plain HTML tags, missing id and blockId
<p>Content here</p>

// CORRECT — Editable components with required id and blockId
<EditableParagraph id="para-intro" blockId="block-intro">
    Content here
</EditableParagraph>
```

## Critical Rule: Section Structure (Flat Block Arrays)

Sections MUST export a **flat array of `Layout > Block` elements** — NEVER a wrapper component.

```tsx
// WRONG — wrapper component hides blocks from the block manager
export const MySection = () => (
    <>
        <StackLayout key="section-title" maxWidth="xl">
            <Block id="section-title" padding="md">...</Block>
        </StackLayout>
    </>
);
export const mySectionBlocks = [<MySection key="my-section" />];

// CORRECT — flat array of individual block elements
export const mySectionBlocks: ReactElement[] = [
    <StackLayout key="layout-section-title" maxWidth="xl">
        <Block id="block-section-title" padding="md">
            <EditableH1 id="h1-section-title" blockId="block-section-title">
                Section Title
            </EditableH1>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-section-content" maxWidth="xl">
        <Block id="block-section-content" padding="sm">
            <EditableParagraph id="para-section-content" blockId="block-section-content">
                Content here...
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
```

### Section File Template

```tsx
// src/data/sections/MySection.tsx
import { type ReactElement } from "react";
import { Block } from "@/components/templates";
import { StackLayout, SplitLayout, GridLayout } from "@/components/layouts";
import {
    EditableH1, EditableH2, EditableParagraph,
    InlineScrubbleNumber, InlineClozeInput, InlineClozeChoice,
    InlineToggle, InlineTooltip, InlineTrigger, InlineFormula,
    Table,
} from "@/components/atoms";
import { getVariableInfo, numberPropsFromDefinition, clozePropsFromDefinition, togglePropsFromDefinition } from "../variables";

import { DataVisualization, ImageDisplay, FlowDiagram, MatrixVisualization } from "@/components/atoms";
import { FormulaBlock } from "@/components/molecules";
import { DesmosGraph } from "@/components/organisms";

// Store hooks for reactive visual wrappers
import { useVar, useSetVar } from "@/stores";

export const mySectionBlocks: ReactElement[] = [
    <StackLayout key="layout-my-title" maxWidth="xl">
        <Block id="block-my-title" padding="md">
            <EditableH1 id="h1-my-title" blockId="block-my-title">
                My Section Title
            </EditableH1>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-my-intro" maxWidth="xl">
        <Block id="block-my-intro" padding="sm">
            <EditableParagraph id="para-my-intro" blockId="block-my-intro">
                Introduction text with an interactive value of{" "}
                <InlineScrubbleNumber
                    varName="myVar"
                    {...numberPropsFromDefinition(getVariableInfo('myVar'))}
                />
                {" "}units.
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
```

Then in `blocks.tsx`:
```tsx
import { mySectionBlocks } from "./sections/MySection";

export const blocks: ReactElement[] = [
    ...mySectionBlocks,
];
```

## Table (Table with Inline Components)

`Table` renders a styled block-level HTML table. Each cell can hold **any React node** — text, numbers, or inline components like `InlineScrubbleNumber`, `InlineFormula`, `InlineClozeInput`, `InlineToggle`, `InlineLinkedHighlight`, etc.

The table reads its accent colour from the global variable store (via `varName`) to stay in sync with the rest of the lesson.

### Basic Usage

```tsx
<StackLayout key="layout-table" maxWidth="xl">
    <Block id="block-table" padding="sm">
        <Table
            columns={[
                { header: 'Parameter', align: 'left' },
                { header: 'Value', align: 'center', width: 160 },
                { header: 'Description' },
            ]}
            rows={[
                {
                    cells: [
                        'Radius',
                        <InlineScrubbleNumber
                            varName="radius"
                            {...numberPropsFromDefinition(getVariableInfo('radius'))}
                        />,
                        'The circle radius',
                    ],
                },
                {
                    cells: [
                        'Area formula',
                        <InlineFormula
                            latex="\pi r^2"
                            colorMap={{}}
                        />,
                        'Computed from radius',
                    ],
                    highlight: true,
                    highlightColor: '#ef4444',
                },
            ]}
            color="#6366f1"
            caption="Table — Interactive parameters"
        />
    </Block>
</StackLayout>
```

### Props Reference

| Prop | Type | Default | Purpose |
|------|------|---------|---------| 
| `columns` | `TableColumn[]` | *(required)* | Column definitions (header, width, align) |
| `rows` | `TableRow[]` | *(required)* | Rows — each has `cells: ReactNode[]`, optional `highlight`, `highlightColor` |
| `varName` | `string` | — | Variable name for accent colour in the store |
| `color` | `string` | `#6366f1` | Accent colour for header/highlights |
| `showHeader` | `boolean` | `true` | Show column headers |
| `striped` | `boolean` | `true` | Alternating row stripes |
| `bordered` | `boolean` | `true` | Show table borders |
| `compact` | `boolean` | `false` | Reduces cell padding |
| `caption` | `string` | — | Caption below the table |

**Column definition (`TableColumn`):**

| Field | Type | Purpose |
|-------|------|---------|
| `header` | `string` | Column header label |
| `width` | `string \| number` | Fixed column width |
| `align` | `'left' \| 'center' \| 'right'` | Cell text alignment |

**Row definition (`TableRow`):**

| Field | Type | Purpose |
|-------|------|---------|
| `cells` | `ReactNode[]` | One node per column — string, number, or inline component |
| `highlight` | `boolean` | Highlight this row with a coloured background |
| `highlightColor` | `string` | Custom highlight colour for this row |

### Variants

- **Compact**: `<Table compact ... />` — smaller cell padding for dense data
- **Borderless**: `<Table bordered={false} ... />` — no borders, stripes only
- **No header**: `<Table showHeader={false} ... />`
- **No stripes**: `<Table striped={false} ... />`

### Example Reference

See `src/data/sections/tableDemo.tsx` and `src/data/exampleBlocks.tsx` (Table Component Demo section) for full working examples including:
- Basic constants table with `InlineFormula` in cells
- Cylinder parameters with `InlineScrubbleNumber` and reactive computed cells
- Mixed inline components showcase (every component type in cells)
- Compact and borderless variants

## Linking Variables to Visual Components

The most powerful pattern is connecting `InlineScrubbleNumber` / `InlineTrigger` in the text to a visual component so that dragging a number or clicking a trigger instantly updates the graphic.

### Pattern: Reactive Visual Wrapper

Create a small React component that reads from the store with `useVar` and passes values as props to the visual:

```tsx
import { useVar } from '@/stores';
import { DataVisualization } from "@/components/atoms";

function ReactiveDataViz() {
    const value = useVar('myValue', 10) as number;

    return (
        <DataVisualization
            type="bar"
            data={[{ label: 'A', value }]}
            height={320}
        />
    );
}
```

Then use it inside a `SplitLayout` with scrubble numbers and triggers in the text:

```tsx
<SplitLayout key="layout-dataviz" ratio="1:1" gap="lg">
    <Block id="block-dataviz-text" padding="sm">
        <EditableParagraph id="para-dataviz" blockId="block-dataviz-text">
            The value is{" "}
            <InlineScrubbleNumber
                varName="myValue"
                {...numberPropsFromDefinition(getVariableInfo('myValue'))}
            />
            . You can{" "}
            <InlineTrigger varName="myValue" value={5}>make it small</InlineTrigger>{" "}
            or{" "}
            <InlineTrigger varName="myValue" value={50} icon="zap">make it huge</InlineTrigger>.
        </EditableParagraph>
    </Block>
    <Block id="block-dataviz-viz" padding="sm">
        <ReactiveDataViz />
    </Block>
</SplitLayout>
```

### Important: Wrapper Components vs Block Arrays

Reactive wrappers are **inner** components used inside a `<Block>`, not top-level block wrappers. The flat array rule still applies.

### Visual Component Quick Reference

| Component | Import From | Controllable Props | Use Case |
|-----------|------------|-------------------|----------|
| `ImageDisplay` | `@/components/atoms` | `src`, `zoomable` | Static image rendering |
| `VideoDisplay` | `@/components/atoms` | `src`, `controls` | Embedded video and YouTube |
| `Cartesian2D` | `@/components/atoms` | `varName` | 2D coordinate geometry |
| `DataVisualization` | `@/components/atoms` | `type`, `data`, `scatterData` | Multi-type charts |
| `DesmosGraph` | `@/components/organisms` | `expressions` | Full graphing calculator |
| `FlowDiagram` | `@/components/atoms` | `nodes`, `edges` | Process/relationship diagrams |
| `FormulaBlock` | `@/components/molecules` | `latex`, `variables` | Block-level math with interactive elements |
| `MatrixVisualization` | `@/components/atoms` | `data`, `colorScheme`, `highlightRows` | Matrix display |
| `Table` | `@/components/atoms` | `columns`, `rows`, `color`, `compact` | Table with inline components |

## Environment Variables

| Variable | Values | Purpose |
|----------|--------|---------|
| `VITE_APP_MODE` | `editor` / `preview` | Editor enables editing UI; preview is read-only |
| `VITE_SHOW_EXAMPLES` | `true` / `false` | Load example blocks+variables instead of lesson content |
