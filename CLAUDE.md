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

> **Submission timing**: `InlineClozeInput` does NOT update the variable store while the student is typing. The store is only written when the student **submits**: by pressing **Enter**, **clicking away** (blur), or when the typed text **auto-matches** the correct answer. This is important because `InlineFeedback` watches the store — feedback only appears after submission, not during typing.

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
<EditableParagraph id="para-example" blockId="circle-definition">
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
<EditableParagraph id="para-example" blockId="circle-definition">
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
<EditableParagraph id="para-example" blockId="circle-definition">
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
<EditableParagraph id="para-example" blockId="circle-definition">
    Read the{" "}
    <InlineHyperlink href="https://en.wikipedia.org/wiki/Circle">
        Wikipedia article on circles
    </InlineHyperlink>{" "}
    for more background, or{" "}
    <InlineHyperlink targetBlockId="intro">
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
    <Block id="intro-title" padding="sm">
        <EditableParagraph id="para-unique-id" blockId="intro-title">
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

**Each `<Block>` MUST contain exactly ONE primary component** — a single heading, a single paragraph, a single formula, or a single visual. This is essential because:
- Each block is independently editable, deletable, and reorderable by teachers
- Combining components makes them inseparable and breaks the editing system
- The block manager needs to identify and control each piece individually

**NEVER place multiple components inside the same Block.**

```tsx
// WRONG — two components crammed into one Block
<Block id="formula-einstein" padding="lg">
    <FormulaBlock latex="E = mc^2" />
    <EditableParagraph id="para-explain" blockId="formula-einstein">
        This is the explanation.
    </EditableParagraph>
</Block>

// CORRECT — each component in its own Block
<StackLayout key="layout-formula" maxWidth="xl">
    <Block id="einstein-formula" padding="lg">
        <FormulaBlock latex="E = mc^2" />
    </Block>
</StackLayout>,

<StackLayout key="layout-explanation" maxWidth="xl">
    <Block id="einstein-explanation" padding="sm">
        <EditableParagraph id="para-explain" blockId="einstein-explanation">
            This is the explanation.
        </EditableParagraph>
    </Block>
</StackLayout>
```

**Exception:** Inline components (`InlineScrubbleNumber`, `InlineClozeInput`, `InlineTooltip`, etc.) belong *inside* their parent `EditableParagraph`.

### Critical Rule: Hierarchical ID Naming Convention

Every block, layout, and component MUST have a **unique, descriptive, hierarchical ID** that reflects the content hierarchy. Well-structured IDs make it easy to find, edit, and understand the structure of the lesson.

**New Stricter ID Format Rules:**
- **No generic wrappers**: NEVER use the words "block", "container", "item", or similar generic terms in IDs. (e.g., `intro-title` instead of `block-intro-title`).
- **No arbitrary numbers**: NEVER use arbitrary numbering like `-01`, `-02`, `-03`. IDs must be contextually meaningful based on their content (e.g., `paragraph-cloze-angle` instead of `paragraph-cloze-01`).
- **No abbreviations**: NEVER use short obscure abbreviations. Use full words (e.g., `cartesian-2d-` instead of `c2d-`, `math-tree-` instead of `mt-`, `video-` instead of `vid-`).

| Element | Pattern | Example |
|---------|---------|---------|
| Layout keys | `layout-<section>-<purpose>` | `layout-intro-title`, `layout-waves-chart` |
| Block IDs | `<section>-<purpose>` | `intro-title`, `waves-chart` |
| Heading IDs | `h1/h2/h3-<section>-<purpose>` | `h1-intro-title`, `h2-waves-heading` |
| Paragraph IDs | `para-<section>-<purpose>` | `para-intro-description`, `para-waves-explanation` |
| Visual IDs | Use block ID hierarchy | `waves-sine-chart` |

**Rules:**
- IDs must be **unique across the entire lesson** — never reuse an ID
- IDs should be **descriptive and readable** — a developer should understand what the block contains from its ID alone
- Pass `blockId` prop to editable components matching the parent Block's `id`

```tsx
// WRONG — generic, non-descriptive, uses "block", uses numbers, uses abbreviations
<Block id="intro-success" padding="sm">
    <EditableParagraph id="para-intro-success" blockId="intro-success">...</EditableParagraph>
</Block>

// WRONG — missing section context, uses "block"
<Block id="title" padding="md">
    <EditableH1 id="h1-title" blockId="title">Circles</EditableH1>
</Block>

// CORRECT — hierarchical, descriptive IDs
<StackLayout key="layout-circles-title" maxWidth="xl">
    <Block id="circles-title" padding="md">
        <EditableH1 id="h1-circles-title" blockId="circles-title">
            Understanding Circles
        </EditableH1>
    </Block>
</StackLayout>,

<StackLayout key="layout-circles-radius-explanation" maxWidth="xl">
    <Block id="circles-radius-explanation" padding="sm">
        <EditableParagraph id="para-circles-radius-explanation" blockId="circles-radius-explanation">
            The radius is the distance from the center...
        </EditableParagraph>
    </Block>
</StackLayout>,

<StackLayout key="layout-circles-area-chart" maxWidth="xl">
    <Block id="circles-area-chart" padding="sm" hasVisualization>
        <ReactiveAreaChart />
    </Block>
</StackLayout>
```

### Critical Rule: `hasVisualization` Prop

When a `<Block>` contains a **visual component** (chart, diagram, interactive visualization), you **MUST** set `hasVisualization={true}`. This enables a magic wand icon (✨) on hover that lets the teacher request AI-generated alternative visualizations.

**Set `hasVisualization={true}` when the block contains:**
- `Cartesian2D`, `DataVisualization`, `GeometricDiagram`, `MatrixVisualization`
- `FlowDiagram`, `ExpandableFlowDiagram`, `NodeLinkDiagram`
- `SimulationPanel`, `DesmosGraph`, `GeoGebraGraph`
- Any custom visualization component (canvas, SVG-based, etc.)
- Any reactive visual wrapper component

**Do NOT set it for:**
- `EditableParagraph`, `EditableH1/H2/H3` (text blocks)
- `FormulaBlock`, `InlineFormula` (math display, not visual)
- `ImageDisplay`, `VideoDisplay` (static media)
- `Table` (data table, not a visualization)

```tsx
// CORRECT — visualization block with hasVisualization
<Block id="data-chart" padding="sm" hasVisualization>
    <Cartesian2D plots={[...]} />
</Block>

// CORRECT — text block without hasVisualization
<Block id="intro-paragraph" padding="sm">
    <EditableParagraph id="para-text" blockId="intro-paragraph">
        Some text...
    </EditableParagraph>
</Block>

// CORRECT — reactive wrapper visualization
<Block id="reactive-chart" padding="sm" hasVisualization>
    <ReactiveDataViz />
</Block>
```

### Critical Rule: White Backgrounds for Visualizations

**ALL visualization components MUST use a white (`#FFFFFF`) or very light neutral background.** Never use colored, dark, or gradient backgrounds behind charts, diagrams, or interactive visuals.

This ensures:
- Maximum readability and contrast for data elements
- Clean, professional appearance
- Consistent look across all visualizations
- Accessibility for all users

```tsx
// WRONG — colored or dark background on visualization
<div style={{ background: '#1a1a2e' }}>
    <DataVisualization type="bar" data={...} />
</div>

// WRONG — gradient background on visualization
<div style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
    <Cartesian2D plots={[...]} />
</div>

// CORRECT — white/clean background (default behavior, no wrapper needed)
<Block id="chart" padding="sm" hasVisualization>
    <DataVisualization type="bar" data={...} height={320} />
</Block>
```

**This applies to:**
- All chart/graph components (`DataVisualization`, `Cartesian2D`, `DesmosGraph`, etc.)
- All diagram components (`FlowDiagram`, `MatrixVisualization`, etc.)
- All custom wrapper visualization components
- SVG and Canvas-based custom visuals

### Critical Rule: No Gradients — Use Flat Muted Colors

**NEVER use gradient backgrounds or gradient colors in any component — whether custom or pre-built.** Always use **flat, solid colors** with **muted, not overly saturated tones**.

This ensures:
- A clean, modern, distraction-free learning environment
- Content and data remain the visual focus
- Consistent, professional aesthetic across the lesson

**Rules:**
1. **No gradient backgrounds** — no `linear-gradient()`, `radial-gradient()`, or CSS gradient functions anywhere
2. **No gradient fills** in SVG, Canvas, or custom components
3. **Use muted, desaturated colors** — avoid pure/vibrant primaries like `#FF0000`, `#00FF00`, `#0000FF`
4. **Prefer soft color palettes** — use colors with reduced saturation (HSL saturation < 70%)
5. **Good color examples:** `#6366f1` (soft indigo), `#3cc499` (muted teal), `#f59e0b` (warm amber), `#8b5cf6` (soft violet)
6. **Bad color examples:** `#FF0000` (pure red), `#00FF00` (pure green), `#0000FF` (pure blue), neon colors

```tsx
// WRONG — gradient background
<div style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
    <h2>Section Title</h2>
</div>

// WRONG — overly saturated colors
<DataVisualization
    data={[{ label: 'A', value: 10, color: '#FF0000' }]}
    color="#00FF00"
/>

// CORRECT — flat muted colors
<DataVisualization
    data={[
        { label: 'A', value: 10, color: '#6366f1' },
        { label: 'B', value: 20, color: '#3cc499' },
    ]}
    color="#6366f1"
/>

// CORRECT — soft color palette for charts
const CHART_COLORS = [
    '#6366f1', // soft indigo
    '#3cc499', // muted teal
    '#f59e0b', // warm amber
    '#8b5cf6', // soft violet
    '#ec4899', // soft pink
    '#14b8a6', // muted cyan
];
```

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
        <Block id="step-question" padding="sm">
            <EditableParagraph id="para-step-question" blockId="step-question">
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
        <Block id="step-exploration" padding="sm">
            <EditableParagraph id="para-step-exploration" blockId="step-exploration">
                Correct! Now let's explore further.
            </EditableParagraph>
        </Block>
    </Step>

    {/* Gated step — Continue button disabled until activity is done */}
    <Step completionVarName="nextAnswer">
        <Block id="step-completion" padding="sm">
            <EditableParagraph id="para-step-completion" blockId="step-completion">
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
        <Block id="left-description" padding="sm">
            <EditableParagraph id="para-left-desc" blockId="left-description">
                Description text with an interactive value of{" "}
                <InlineScrubbleNumber
                    varName="myVar"
                    {...numberPropsFromDefinition(getVariableInfo('myVar'))}
                />{" "}units.
            </EditableParagraph>
        </Block>
        <Block id="left-formula" padding="sm">
            <FormulaBlock latex="y = mx + b" />
        </Block>
        <Block id="left-drag-hint" padding="sm">
            <EditableParagraph id="para-left-hint" blockId="left-drag-hint">
                Drag the number above to see the visualization update.
            </EditableParagraph>
        </Block>
    </div>
    {/* Right side: single block (no wrapper needed) */}
    <Block id="right-chart" padding="sm">
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

### UI Components (import from `@/components/molecules`)

- `InteractionLegend` — collapsible "How to read this article" banner with live mini-demos of each interaction type (drag a number, fill in a blank, pick from a dropdown). **Automatically rendered** at the top of every article by `BlockRenderer` — the AI should never add it manually. Uses `localStorage` to remember whether the user has already seen it (starts expanded for first-timers, collapsed thereafter).

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

### Feedback Components (import from `@/components/atoms`)

- `InlineFeedback` — A lightweight inline wrapper that shows feedback as flowing text right next to the cloze input or choice

**InlineFeedback** wraps a cloze component and watches a variable from the store. Feedback appears automatically inline when the student **submits** their answer — no "Check Answer" button needed. The feedback flows naturally as text within the paragraph.

> **Submission timing**: The variable store is only updated when the student actually submits, NOT while typing. For `InlineClozeInput`, submission happens on **Enter key**, **blur (clicking away)**, or when the typed value **auto-matches** the correct answer. For `InlineClozeChoice`, **selecting a dropdown option** counts as submission. This means feedback never appears while the student is still typing.

**Key behaviours:**
- Feedback appears **inline** right after the cloze component as flowing paragraph text
- **Correct answer**: Green text with an encouraging message that explains WHY the answer is correct
- **Incorrect answer**: Amber text with failure message + hint + optional review link — flows naturally in the sentence
- Feedback animates in smoothly with a fade transition
- The review link (blue) scrolls smoothly to the relevant content block and flashes a highlight ring
- **No icons or backgrounds** — feedback is styled as natural paragraph text with subtle color

**InlineFeedback Props:**

| Prop | Type | Default | Purpose |
|------|------|---------|--------|
| `varName` | `string` | *(required)* | Variable to watch (must match the cloze component's `varName`) |
| `correctValue` | `string` | *(required)* | Expected correct value |
| `caseSensitive` | `boolean` | `false` | Whether comparison is case-sensitive |
| `successMessage` | `string` | `"Well done! That's exactly right"` | Message shown on correct answer — celebrate and explain WHY (no trailing period) |
| `failureMessage` | `string` | `"Good effort!"` | Message shown on wrong answer — be encouraging (no trailing period) |
| `hint` | `string` | — | Hint that flows after `failureMessage` — guide discovery (no trailing period) |
| `reviewBlockId` | `string` | — | Block ID to scroll to for reviewing the concept |
| `reviewLabel` | `string` | `"Review this concept"` | Label for the review link |

**Example usage:**

```tsx
import { InlineFeedback, InlineClozeInput, InlineClozeChoice } from "@/components/atoms";

// In variables.ts:
// answer_radius: { defaultValue: '', type: 'text', correctAnswer: '5', placeholder: '???', color: '#6366f1' }
// answer_shape: { defaultValue: '', type: 'select', correctAnswer: 'circle', options: ['square', 'circle', 'triangle'], placeholder: '???', color: '#6366f1' }

<StackLayout key="layout-circles-q1" maxWidth="xl">
    <Block id="circles-question-radius" padding="md">
        <EditableParagraph id="para-question-radius" blockId="circles-question-radius">
            If a circle has diameter 10, its radius is{" "}
            <InlineFeedback
                varName="answer_radius"
                correctValue="5"
                successMessage="Brilliant! The radius is always half the diameter, so 10 ÷ 2 = 5"
                failureMessage="Almost there!"
                hint="The radius is half the diameter — what is 10 ÷ 2?"
            >
                <InlineClozeInput
                    varName="answer_radius"
                    correctAnswer="5"
                    {...clozePropsFromDefinition(getVariableInfo('answer_radius'))}
                />
            </InlineFeedback>.
        </EditableParagraph>
    </Block>
</StackLayout>

<StackLayout key="layout-circles-q2" maxWidth="xl">
    <Block id="circles-question-diameter" padding="md">
        <EditableParagraph id="para-q2" blockId="circles-question-diameter">
            A shape where every point is the same distance from the center is a{" "}
            <InlineFeedback
                varName="answer_shape"
                correctValue="circle"
                successMessage="Excellent! Every point equidistant from the center defines a circle"
                failureMessage="Good thinking, but not quite!"
                hint="Squares and triangles have corners at different distances from the center"
            >
                <InlineClozeChoice
                    varName="answer_shape"
                    correctAnswer="circle"
                    options={["square", "circle", "triangle"]}
                    {...choicePropsFromDefinition(getVariableInfo('answer_shape'))}
                />
            </InlineFeedback>.
        </EditableParagraph>
    </Block>
</StackLayout>
```

**Key rules for InlineFeedback:**
- The `varName` in `InlineFeedback` must match the `varName` used in the `InlineClozeInput`/`InlineClozeChoice` inside
- The `correctValue` in `InlineFeedback` must match the `correctAnswer` of the inline component
- The `InlineFeedback` wraps the cloze component directly — the feedback appears inline after the cloze
- Define answer variables in `variables.ts` just like any other cloze variable
- Works with `InlineClozeInput` (text fill-in) and `InlineClozeChoice` (dropdown)
- **Avoid trailing periods** in messages since the paragraph usually ends with punctuation
- **Success messages**: Celebrate with words like "Brilliant!", "Excellent!", "Perfect!" — explain WHY the answer is correct
- **Failure messages**: Be encouraging ("Almost there!", "Good thinking!") — never discouraging
- **Hints**: Guide discovery with concrete scaffolding, not just restating the question
- **NEVER use `--` (double hyphens) in any feedback or lesson text.** Use commas, em dashes (—), or restructure the sentence instead
- **Feedback appears only after submission**: The cloze components write to the store only on submission, not during typing

### Required Props for All Text Components

Every `EditableParagraph` and `EditableH1/H2/H3` MUST have:
- A unique `id` prop (e.g., `id="para-intro"`)
- A `blockId` prop matching the parent `Block`'s `id` (e.g., `blockId="intro"`)

```tsx
// WRONG — plain HTML tags, missing id and blockId
<p>Content here</p>

// CORRECT — Editable components with required id and blockId
<EditableParagraph id="para-intro" blockId="intro">
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
        <Block id="section-title" padding="md">
            <EditableH1 id="h1-section-title" blockId="section-title">
                Section Title
            </EditableH1>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-section-content" maxWidth="xl">
        <Block id="section-content" padding="sm">
            <EditableParagraph id="para-section-content" blockId="section-content">
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
import { getVariableInfo, numberPropsFromDefinition, clozePropsFromDefinition, choicePropsFromDefinition, togglePropsFromDefinition } from "../variables";

import { DataVisualization, ImageDisplay, FlowDiagram, MatrixVisualization } from "@/components/atoms";
import { FormulaBlock } from "@/components/molecules";
// InteractionLegend is auto-rendered by BlockRenderer — do NOT import or use it in sections
import { DesmosGraph } from "@/components/organisms";

// Store hooks for reactive visual wrappers
import { useVar, useSetVar } from "@/stores";

export const mySectionBlocks: ReactElement[] = [
    <StackLayout key="layout-my-title" maxWidth="xl">
        <Block id="my-title" padding="md">
            <EditableH1 id="h1-my-title" blockId="my-title">
                My Section Title
            </EditableH1>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-my-intro" maxWidth="xl">
        <Block id="my-intro" padding="sm">
            <EditableParagraph id="para-my-intro" blockId="my-intro">
                Introduction text with an interactive value of{" "}
                <InlineScrubbleNumber
                    varName="myVar"
                    {...numberPropsFromDefinition(getVariableInfo('myVar'))}
                />
                {" "}units.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // Assessment question with inline feedback
    <StackLayout key="layout-my-q1" maxWidth="xl">
        <Block id="my-question-initial" padding="md">
            <EditableParagraph id="para-my-question-initial" blockId="my-question-initial">
                Your question here with{" "}
                <InlineFeedback
                    varName="answer_my_q1"
                    correctValue="expected"
                    successMessage="Brilliant! That's exactly right"
                    failureMessage="Almost there!"
                    hint="Remember the key relationship from the introduction"
                >
                    <InlineClozeInput
                        varName="answer_my_q1"
                        correctAnswer="expected"
                        {...clozePropsFromDefinition(getVariableInfo('answer_my_q1'))}
                    />
                </InlineFeedback>.
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
    <Block id="table" padding="sm">
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
    <Block id="dataviz-text" padding="sm">
        <EditableParagraph id="para-dataviz" blockId="dataviz-text">
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
    <Block id="dataviz-viz" padding="sm">
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
| `InteractionLegend` | `@/components/molecules` | _(none — auto-rendered)_ | Collapsible how-to-interact banner at top of article |
| `MatrixVisualization` | `@/components/atoms` | `data`, `colorScheme`, `highlightRows` | Matrix display |
| `Table` | `@/components/atoms` | `columns`, `rows`, `color`, `compact` | Table with inline components |

## Environment Variables

| Variable | Values | Purpose |
|----------|--------|---------|
| `VITE_APP_MODE` | `editor` / `preview` | Editor enables editing UI; preview is read-only |
| `VITE_SHOW_EXAMPLES` | `true` / `false` | Load example blocks+variables instead of lesson content |
