# CLAUDE.md — Agent Instructions

## Project Overview

Interactive explorable-explanation template built with React + TypeScript + Vite.
Content is organized as **blocks** inside **layouts**, with shared state via a **global variable store** (Zustand).

---

## Files You MUST Edit (lesson content goes here)

| File | Purpose |
|------|---------|
| `src/data/variables.ts` | **Define all shared variables** — edit this FIRST before adding any interactive component |
| `src/data/blocks.tsx` | **Define all blocks** (content, layouts) — this is the main entry point for your lesson |
| `src/data/sections/*.tsx` | Extract complex block components here, then import into `blocks.tsx` |

## Files to READ as Reference Only (NEVER modify)

| File | Purpose |
|------|---------|
| `src/stores/variableStore.ts` | Zustand store implementation (do not edit) |

---

## Standard Import Pattern for blocks.tsx

Always start `blocks.tsx` with this import structure to access all helper functions:

```tsx
// Initialize variables and colors from the central variable definitions (single source of truth)
import { useVariableStore, initializeVariableColors } from "@/stores";
import {
    variableDefinitions,
    getDefaultValues,
    getVariableInfo,
} from "./variables";
useVariableStore.getState().initialize(getDefaultValues());
initializeVariableColors(variableDefinitions);
```

---

## Critical Rule: Global Variables

**NEVER pass numeric props inline to a component that reads the variable store.** Always define variables in the central variables file first, then reference them by name.

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

#### Step 2: Read the variable in a component

```tsx
import { useVar } from '@/stores';
const amplitude = useVar('amplitude', 1); // reactive — re-renders on change
```

### Writing Variables in Components

```tsx
import { useSetVar } from '@/stores';
const setVar = useSetVar();
setVar('amplitude', 2.5);
```

## InlineFormula (Inline Math)

`InlineFormula` renders a static KaTeX formula inline within paragraph text. It has no interaction and does not use the variable store.

```tsx
<EditableParagraph id="para-formula-area" blockId="formula-circle-area">
    The area of a circle is <InlineFormula latex="A = \pi r^2" />, where{" "}
    <InlineFormula latex="r" /> is the radius.
</EditableParagraph>
```

| Prop | Type | Default | Purpose |
|------|------|---------|---------|
| `latex` | `string` | *(required)* | LaTeX formula string — use single `\` for commands (see escaping rule below) |

`FormulaBlock` (import from `@/components/molecules`) renders the same kind of static formula as a centred, display-size block: `<FormulaBlock latex="F = m \times a" />`.

### Critical Rule: LaTeX Escaping in JSX String Attributes

**Use a single `\` for LaTeX commands in JSX string attributes — NEVER `\\`.**

In JSX string attributes (`latex="..."`), a single backslash is passed through literally to KaTeX. Using `\\` produces two literal backslashes in the string, which KaTeX cannot parse — causing broken rendering (e.g., formula text split across lines as plain italic text).

```tsx
// WRONG — double backslash produces "\\sin" which KaTeX cannot parse
<InlineFormula latex="y = A\\sin(\\omega x + \\phi)" />

// CORRECT — single backslash produces "\sin" which KaTeX renders properly
<InlineFormula latex="y = A\sin(\omega x + \phi)" />
```

This applies to **all** LaTeX commands: `\sin`, `\cos`, `\omega`, `\pi`, `\phi`, `\alpha`, `\frac`, `\sqrt`, `\sum`, `\int`, etc.

### Critical Rule: ASCII-Only LaTeX — Never Paste Unicode Math Characters

**LaTeX strings must contain ONLY ASCII characters.** KaTeX has no glyphs for
precomposed accented Unicode (`î`, `ĵ`, `â`, …) — they render as missing-glyph
boxes in the lesson. Always write the LaTeX command form:

```tsx
// WRONG — Unicode î/ĵ render as broken boxes
<InlineFormula latex="a\,î + b\,ĵ + c\,k̂" />

// CORRECT — LaTeX accent commands with dotless \imath/\jmath
<InlineFormula latex="a\hat{\imath} + b\hat{\jmath} + c\hat{k}" />
```

| Never type | Write instead |
|:---|:---|
| `î`, `ĵ`, `k̂` | `\hat{\imath}`, `\hat{\jmath}`, `\hat{k}` |
| `π`, `θ`, `ω` | `\pi`, `\theta`, `\omega` |
| `×`, `·`, `≤`, `≥`, `≠` | `\times`, `\cdot`, `\le`, `\ge`, `\ne` |
| `°` | `^\circ` |
| `→`, `⇒` | `\to`, `\Rightarrow` |

(Unicode is fine in prose text — this rule is only for `latex="..."` strings.)

**Same rule for `FormulaBlock`:**

```tsx
// CORRECT
<FormulaBlock latex="F = m \times a" />
```

## InlineHyperlink (Click to Navigate)

`InlineHyperlink` is a clickable inline element that either **opens an external URL** in a new tab or **smooth-scrolls to a block** on the page. Does **NOT** use the variable store.

```tsx
<EditableParagraph id="para-hyperlink-examples" blockId="hyperlink-examples">
    For a comprehensive mathematical breakdown, you can dive into the{" "}
    <InlineHyperlink href="https://en.wikipedia.org/wiki/Circle">
        Wikipedia article on circles
    </InlineHyperlink>
    . Alternatively, if you want to review how interactive buttons function, you can easily{" "}
    <InlineHyperlink targetBlockId="heading-trigger">
        scroll back up to the Triggers section
    </InlineHyperlink>
    .
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
| `select` | `{ defaultValue: 'sine', type: 'select', options: ['sine', 'cosine'] }` |
| `select` | `{ defaultValue: 'triangle', type: 'select', options: ['triangle', 'square', 'pentagon'], color: '#D946EF' }` |
| `boolean` | `{ defaultValue: true, type: 'boolean' }` |
| `array` | `{ defaultValue: [1, 2, 3], type: 'array' }` |
| `object` | `{ defaultValue: { x: 0, y: 0 }, type: 'object', schema: '{ x: number, y: number }' }` |

## Block Structure

Every block must be wrapped in a `Layout` > `Block` hierarchy:

```tsx
<StackLayout key="layout-unique-key" maxWidth="xl">
    <Block id="intro-title" padding="sm">
        <EditableParagraph id="para-unique-id" blockId="intro-title">
            Content here.
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

**Exception:** Inline components (`InlineHyperlink`, `InlineFormula`) belong *inside* their parent `EditableParagraph`.

### Critical Rule: Hierarchical ID Naming Convention

Every block, layout, and component MUST have a **unique, descriptive, hierarchical ID** that reflects the content hierarchy. Well-structured IDs make it easy to find, edit, and understand the structure of the lesson.

**New Stricter ID Format Rules:**
- **No generic wrappers**: NEVER use the words "block", "container", "item", or similar generic terms in IDs. (e.g., `intro-title` instead of `block-intro-title`).
- **No arbitrary numbers**: NEVER use arbitrary numbering like `-01`, `-02`, `-03`. IDs must be contextually meaningful based on their content (e.g., `paragraph-circle-area` instead of `paragraph-01`).
- **No abbreviations or short forms**: NEVER use cryptic abbreviations or short forms in any ID (block IDs, paragraph IDs, variable names, etc.). IDs must be immediately understandable. Examples of **bad** IDs: `bcircle`, `c2d`, `mt`, `vid`, `btn`, `para-qc`. Examples of **good** IDs: `block-circle`, `cartesian-2d`, `math-tree`, `video`, `button`, `para-quarter-circle`. If in doubt, spell it out.

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

When a `<Block>` contains a **visual component** (chart, diagram, interactive visualization), you **MUST** set `hasVisualization={true}`. This enables a magic wand icon on hover that lets the teacher request AI-generated alternative visualizations.

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

### Critical Rule: Safe SVG Dimensions and Anti-Clipping

**When creating custom `<svg>` visual components, ALWAYS establish a safe `viewBox` and width/height that securely encompasses all shapes, texts, and potential animations/transforms.**

This ensures:
- Labels and texts appearing near the edges do not get cropped abruptly.
- Drop shadows or glow effects (`filter`) do not clip at bounding box borders.
- Bounding box limits accurately describe the artwork, enabling responsive scaling.

**Rules:**
1. Leave plenty of padded space or margin (at least `20px` to `40px`) around the perimeter of visual items.
2. If text may change or grow (e.g. reactive variables or bold interactive states), ensure the `viewBox` bounds can accommodate the maximum possible width of that text.
3. **Budget label width before you place the plot.** Text is roughly `characters × fontSize × 0.6` units wide (`"Positive"` at 12px ≈ 58 units). Reserve gutters for every label that sits beside the drawing, then size the plot with what's left: `plotWidth = viewBoxWidth − leftGutter − rightGutter`. Never pick a round plot size and hope the labels fit next to it.
4. **Anchor edge labels back toward the ink.** Right of the plot → `textAnchor="end"` at `x = viewBoxWidth − pad`. Left of the plot → `textAnchor="start"` at `x = pad`. Centered under a column → `textAnchor="middle"` with the x clamped so the half-width still fits.
5. **Check every reachable state.** Walk each slider/drag to its minimum and maximum and confirm the longest string still renders whole. A label that fits at the default value and is sliced at the extreme is a failed visualization.

```tsx
// WRONG — text at X=290 will be clipped by the strict width=300 boundary
<svg width={300} height={200} viewBox="0 0 300 200">
    <text x={290} y={100}>Hypotenuse</text>
</svg>

// CORRECT — width/viewBox gives 40px padding for the text to breathe safely
<svg width={340} height={200} viewBox="0 0 340 200">
    <text x={290} y={100}>Hypotenuse</text>
</svg>

// WRONG — plot ends at 520 inside a 560-wide viewBox; "Positive" needs ~58 more
// units and renders as "Posit". The SVG clips it silently — no error, no warning.
<text x={chartX + chartWidth + 12} y={chartY + 20} fontSize="12">Positive</text>

// CORRECT — gutter reserved first, label anchored back toward the plot
const PAD = 24, RIGHT_GUTTER = 72;
const chartWidth = VIEWBOX_WIDTH - PAD - RIGHT_GUTTER;
<text x={VIEWBOX_WIDTH - PAD} y={chartY + 20} textAnchor="end" fontSize="12">Positive</text>
```

## Available Layouts

Import from `@/components/layouts`.

**Layout prop values are closed sets — use ONLY the values listed below.** Do not
guess additional variants: passing an unlisted value (e.g. a size a sibling layout
happens to accept) is a TypeScript error that fails the build. The exact unions:
`StackLayout.maxWidth`: `none | sm | md | lg | xl | 2xl | full` ·
`SplitLayout.gap` / `GridLayout.gap`: `none | sm | md | lg | xl` ·
`SplitLayout.ratio`: `1:1 | 1:2 | 2:1 | 1:3 | 3:1 | 2:3 | 3:2` ·
`GridLayout.columns`: `2–6` · `align`: `start | center | end | stretch`.

- `StackLayout` — single column, use `maxWidth` prop (`sm`, `md`, `lg`, `xl`, `2xl`, `full`)
- `SplitLayout` — side-by-side (ideal for text + visual), use `ratio` (`1:1`, `1:2`, `2:1`, `1:3`, `3:1`, `2:3`, `3:2`), `gap` (`none`, `sm`, `md`, `lg`, `xl`), `align` (`start`, `center`, `end`, `stretch`)
- `GridLayout` — grid of items (ideal for visual galleries), use `columns` (2–6), `gap`, `mobileColumns`

### SplitLayout with Multiple Components Per Side

`SplitLayout` expects exactly **2 children**. To place multiple blocks on one side, wrap them in a `<div className="space-y-4">` container. Each block inside the wrapper remains independently manageable.

```tsx
<SplitLayout key="layout-example-split" ratio="1:1" gap="lg">
    {/* Left side: multiple blocks wrapped in a div */}
    <div className="space-y-4">
        <Block id="left-description" padding="sm">
            <EditableParagraph id="para-left-desc" blockId="left-description">
                Description text.
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

### Inline Components

- `InlineHyperlink` — click to open external URL or scroll to a block on page (connective, emerald)
- `Table` — block-level table with inline components in cells (import from `@/components/atoms`)

### Math Components

- `InlineFormula` — static inline math formula (import from `@/components/atoms`)
- `FormulaBlock` — static block-level math display (import from `@/components/molecules`)

### Standard UI Components (shadcn/ui — import from `@/components/atoms`)

The full shadcn/ui kit ships with the project and is exported from the same barrel as everything else. Use these for ordinary web-page interactivity — controls, panels, navigation, answer entry:

| Component | Use for |
|---|---|
| `Input`, `Textarea` | Typed answers, numeric entry |
| `Select` (`SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem`) | Dropdown choice |
| `RadioGroup`, `RadioGroupItem`, `Checkbox`, `Switch` | Single/multiple choice, on-off options |
| `Slider` | Dragging a number through a range |
| `Button` | Check answer, reset, step, reveal |
| `Tabs`, `Accordion`, `Collapsible` | Grouping content the student can switch between or expand |
| `Card`, `Alert`, `Badge`, `Separator`, `Progress` | Panels, callouts, labels, dividers, progress |
| `Dialog`, `Popover`, `HoverCard`, `Tooltip` | Overlays and hover help |

**Rules:**
1. **Lesson TEXT still uses the editable components** (`EditableParagraph`, `EditableH1`-`H3`). Never put lesson prose inside a `Card`/`Alert` as raw text — the teacher could not edit it.
2. **Keep shared values in the variable store** so a control and a visual stay in sync: read with `useVar`, write with `useSetVar` (see *Critical Rule: Global Variables*). Local `useState` is fine for state nothing else needs.
3. `Table` imported from `@/components/atoms` is the lesson table component, not shadcn's table primitive.

```tsx
// A control panel driving a visual, and a typed answer with a check button
import { useState } from "react";
import { Input, Button, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/atoms";
import { useVar, useSetVar } from "@/stores";

const RadiusControls = () => {
    const radius = useVar("circleRadius", 3);
    const setVar = useSetVar();
    return (
        <div className="flex items-center gap-3">
            <Select value={String(radius)} onValueChange={(v) => setVar("circleRadius", Number(v))}>
                <SelectTrigger className="w-32"><SelectValue placeholder="Radius" /></SelectTrigger>
                <SelectContent>
                    {[1, 2, 3, 4, 5].map((r) => (
                        <SelectItem key={r} value={String(r)}>{r} cm</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => setVar("circleRadius", 3)}>Reset</Button>
        </div>
    );
};

const AreaCheck = () => {
    const [answer, setAnswer] = useState("");
    const [result, setResult] = useState<string | null>(null);
    return (
        <div className="flex items-center gap-2">
            <Input value={answer} onChange={(e) => setAnswer(e.target.value)} className="w-28" placeholder="Area" />
            <Button onClick={() => setResult(Math.abs(Number(answer) - 28.27) < 0.5 ? "Correct" : "Not quite — try again")}>
                Check
            </Button>
            {result && <span className="text-sm text-slate-600">{result}</span>}
        </div>
    );
};
```

Wrap such a component in its own `<Block>` like any other component, and define its variables in `src/data/variables.ts` first.

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
- A `blockId` prop matching the parent `Block`'s `id` (e.g., `blockId="intro"`)

```tsx
// WRONG — plain HTML tags, missing id and blockId
<p>Content here</p>

// CORRECT — Editable components with required id and blockId
<EditableParagraph id="para-intro" blockId="intro">
    Content here
</EditableParagraph>
```

## VisualOptionCards (visual chooser — temporary block)

`VisualOptionCards` (import from `@/components/organisms`) is a teacher-facing block that offers 2-3 visual options for a section. Students never see it (it renders nothing in preview mode). Place it in its own `<Block>` exactly where the visual will go; when the teacher picks a card, the block is replaced by the built visual under the SAME block id, so the chooser must never remain in a finished section.

```tsx
import { VisualOptionCards } from "@/components/organisms";

<Block id="circle-area-visual" padding="sm">
    <VisualOptionCards
        blockId="circle-area-visual"
        intro="Pick how your students will explore the area of a circle."
        cards={[
            {
                id: "sectors",
                title: "A circle cut into sectors that rearrange into a rectangle",
                looks: "A circle divided into equal slices. Next to it, the same slices laid out in a row that looks more and more like a rectangle as the slices get thinner.",
                manipulate: "Change the number of slices and watch the row straighten out",
                reveals: "The rectangle's sides are the radius and half the circumference, so the area is pi times r squared",
                recommended: true,
            },
            {
                id: "grid",
                title: "A circle on a square grid with the covered squares counted",
                looks: "A circle drawn over graph paper; squares inside the circle are shaded and counted.",
                manipulate: "Change the radius and read the count of shaded squares",
                reveals: "The count grows with the square of the radius, not with the radius itself",
                targetsMisconception: "Students think doubling the radius doubles the area",
            },
        ]}
    />
</Block>
```

| Prop | Type | Purpose |
|------|------|---------|
| `blockId` | `string` | The id of the `<Block>` this chooser lives in (the visual will replace this block) |
| `intro` | `string` | Optional one-line prompt above the cards |
| `cards` | `VisualOptionCard[]` | 2-3 options; each has `id`, `title`, `looks`, `manipulate`, `reveals`, optional `targetsMisconception`, and `recommended` on exactly one card |

Write every card for a teacher, in plain language — no component names, coordinates or colour codes.

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
    InlineFormula,
    Table,
} from "@/components/atoms";

import { DataVisualization, ImageDisplay, FlowDiagram, MatrixVisualization } from "@/components/atoms";
import { FormulaBlock } from "@/components/molecules";
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
                Introduction text.
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

`Table` renders a styled block-level HTML table. Each cell can hold **any React node** — text, numbers, or inline components like `InlineFormula`, `InlineHyperlink`, etc.

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
                        '5',
                        'The circle radius',
                    ],
                },
                {
                    cells: [
                        'Area formula',
                        <InlineFormula latex="\pi r^2" />,
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
