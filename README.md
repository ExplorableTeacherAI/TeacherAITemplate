# MathVibe Template

Interactive explorable-explanation template for creating mathematics lessons. Built with React + TypeScript + Vite + Tailwind CSS. Content is organized as **blocks** inside **layouts**, with shared state via a **global variable store** (Zustand).

---

## Core Concept: Everything Lives in a Block

The **Block** is the fundamental unit of content. Every piece of a lesson — a paragraph, an equation, a chart, a visualization — must live inside a `<Block>`.

- **Rearrangeable** — teachers drag-and-drop blocks to reorder content
- **Editable** — each block has its own toolbar for inline editing, deleting, and inserting
- **Trackable** — the block manager sees and controls every piece individually

**Rule 1: Never use a component outside a Block.** Unwrapped components are invisible to the editing system.

**Rule 2: Each Block must contain exactly ONE primary component.** Teachers add, delete, and reorder blocks individually — combining components makes them inseparable.

> **Exception:** Inline components (`InlineScrubbleNumber`, `InlineClozeInput`, `InlineTooltip`, etc.) belong *inside* their parent `EditableParagraph` — they are part of the text, not separate blocks.

Every block follows the pattern: **Layout > Block > Component**.

---

## Project Structure

```
src/
├── data/                           # LESSON CONTENT (edit these files)
│   ├── variables.ts                #   Define all shared variables (EDIT FIRST)
│   ├── blocks.tsx                  #   Define all blocks (main entry point)
│   ├── sections/                   #   Extract section blocks here
│   ├── exampleBlocks.tsx           #   Reference only — copy patterns from here
│   └── exampleVariables.ts         #   Reference only — copy structure from here
│
├── components/
│   ├── atoms/                      # Smallest reusable building blocks
│   │   ├── text/                   #   EditableHeadings, EditableParagraph,
│   │   │                           #   InlineScrubbleNumber, InlineClozeInput,
│   │   │                           #   InlineClozeChoice, InlineToggle, InlineTooltip,
│   │   │                           #   InlineTrigger, InlineHyperlink, InlineSpotColor,
│   │   │                           #   InlineLinkedHighlight
│   │   ├── formula/                #   InlineFormula
│   │   ├── visual/                 #   DataVisualization, ImageDisplay, VideoDisplay,
│   │   │                           #   Cartesian2D, FlowDiagram, ExpandableFlowDiagram,
│   │   │                           #   Table, GeometricDiagram, NodeLinkDiagram
│   │   └── ui/                     #   shadcn/ui primitives
│   │
│   ├── molecules/                  # Composed from multiple atoms
│   │   └── formula/                #   FormulaBlock
│   │
│   ├── organisms/                  # Complex self-contained visualizations
│   │   └── visual/                 #   DesmosGraph, GeoGebraGraph
│   │
│   ├── layouts/                    # StackLayout, SplitLayout, GridLayout, ScrollytellingLayout, SlideLayout, StepLayout
│   │
│   ├── templates/                  # Page infrastructure (Block, LessonView) — do not modify
│   │
│   └── utility/                    # Editor modals, overlays — not lesson content
│
├── stores/                         # Zustand global variable store
├── contexts/                       # React contexts (AppMode, Editing, Block)
├── hooks/                          # Custom hooks
└── lib/                            # Utilities
```

---

## How to Create Content

### Step 1: Define Variables (`src/data/variables.ts`)

Every interactive value must be defined here first.

```ts
export const variableDefinitions: Record<string, VariableDefinition> = {
    amplitude: {
        defaultValue: 1, type: 'number', label: 'Amplitude',
        min: 0, max: 10, step: 0.1, unit: 'm',
    },
};
```

**Supported types:** `number`, `text`, `select`, `boolean`, `array`, `object`

### Step 2: Create Section Blocks (`src/data/sections/`)

Each section exports a **flat array** of `Layout > Block` elements.

```tsx
// src/data/sections/Introduction.tsx
export const introBlocks: ReactElement[] = [
    <StackLayout key="layout-intro-title" maxWidth="xl">
        <Block id="block-intro-title" padding="md">
            <EditableH1 id="h1-intro-title" blockId="block-intro-title">
                Understanding Waves
            </EditableH1>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-intro-text" maxWidth="xl">
        <Block id="block-intro-text" padding="sm">
            <EditableParagraph id="para-intro-text" blockId="block-intro-text">
                A wave with amplitude{" "}
                <InlineScrubbleNumber
                    varName="amplitude"
                    {...numberPropsFromDefinition(getVariableInfo('amplitude'))}
                />{" "}meters.
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
```

### Step 3: Assemble in `blocks.tsx`

```tsx
import { introBlocks } from "./sections/Introduction";
export const blocks: ReactElement[] = [...introBlocks];
```

---

## Section Structure Rules

Sections MUST export a **flat array** — never a wrapper component. Each element = one manageable block.

### ID Conventions

| Element | Pattern | Example |
|---------|---------|---------|
| Layout keys | `layout-<name>` | `layout-intro-title` |
| Block IDs | `block-<name>` | `block-intro-title` |
| Element IDs | `<type>-<name>` | `para-intro-text`, `h1-main-title` |
| `blockId` prop | Must match parent Block's `id` | |

---

## Component Reference

### Text Components (`@/components/atoms`)

| Component | Purpose |
|-----------|---------|
| `EditableH1` ... `EditableH3` | Headings (never use plain `<h1>` tags) |
| `EditableParagraph` | Body text — supports inline components |
| `InlineScrubbleNumber` | Draggable number bound to a global variable |
| `InlineClozeInput` | Fill-in-the-blank input with answer validation |
| `InlineClozeChoice` | Dropdown choice with answer validation |
| `InlineToggle` | Click to cycle through options |
| `InlineTooltip` | Shows tooltip/definition on hover (no variable store) |
| `InlineTrigger` | Click to set a variable to a value (emerald) |
| `InlineHyperlink` | Click to open URL or scroll to block (emerald) |
| `InlineFormula` | Inline KaTeX formula with colored terms (use single `\` for LaTeX commands) |
| `InlineSpotColor` | Colored text highlight |
| `InlineLinkedHighlight` | Bidirectional highlighting |

### Formula Components (`@/components/molecules`)

| Component | Purpose |
|-----------|---------|
| `FormulaBlock` | Block-level math display with interactive elements |

### Visual Components

| Component | Library | Key Props |
|-----------|---------|-----------|
| `ImageDisplay` | — | `src`, `alt`, `caption`, `bordered`, `zoomable`, `objectFit` |
| `VideoDisplay` | — | `src`, `alt`, `caption`, `controls`, `autoPlay`, `poster` |
| `Cartesian2D` | Mafs | Functions, parametric curves, points, vectors, segments |
| `DataVisualization` | D3 | `type`, `data`, `scatterData`, `color`, `curve`, `showValues` |
| `FlowDiagram` | React Flow | `nodes`, `edges`, `height`, `fitView` |
| `ExpandableFlowDiagram` | React Flow | `rootNode` |
| `MatrixVisualization` | SVG | `data`, `colorScheme`, `highlightRows/Cols/Cells` |
| `Table` | — | `columns`, `rows`, `color`, `compact`, `bordered` |
| `DesmosGraph` | Desmos | `expressions`, `height`, `options` |
| `GeoGebraGraph` | GeoGebra | `app`, `materialId`, `commands` |

---

## Layouts

| Layout | Best For | Key Props |
|--------|----------|-----------|
| `StackLayout` | Single column | `maxWidth`: `sm` / `md` / `lg` / `xl` / `2xl` / `full` |
| `SplitLayout` | Side-by-side | `ratio`: `1:1` / `1:2` / `2:1`; `gap`; `align` |
| `GridLayout` | Multiple items | `columns`: 2–6; `gap` |
| `ScrollytellingLayout` | Sticky visual + scroll steps | `varName`, `visualPosition`, `visualWidth`, `gap` || `SlideLayout` | One-at-a-time slide deck | `varName`, `height`, `transition`, `showArrows`, `showDots`, `showCounter` |
| `StepLayout` | Progressive disclosure (step-by-step) | `varName`, `revealLabel`, `showProgress`, `allowBack` |

### StepLayout (Progressive Disclosure with Questions)

Reveals content one step at a time. Completed steps stack above the current one. Supports two modes:

- **Normal steps** — show a "Continue →" button.
- **Question steps** (`autoAdvance`) — auto-reveal the next step once the correct answer is given.

```tsx
import { StepLayout, Step } from "@/components/layouts";

<StepLayout varName="stepProgress" showProgress={false}>
    {/* Question step — auto-advances on correct answer */}
    <Step completionVarName="myAnswer" autoAdvance>
        <Block id="block-q" padding="sm">
            <EditableParagraph id="para-q" blockId="block-q">
                What is 2 + 2?{" "}
                <InlineClozeInput varName="myAnswer" correctAnswer="4" ... />
            </EditableParagraph>
        </Block>
    </Step>

    {/* Normal step */}
    <Step>
        <Block id="block-1" padding="sm">
            <EditableParagraph id="para-1" blockId="block-1">
                Correct! Press Continue to proceed.
            </EditableParagraph>
        </Block>
    </Step>
</StepLayout>
```

**Step props:**

| Prop | Type | Default | Purpose |
|------|------|---------|--------|
| `revealLabel` | `string` | `"Continue"` | Override the button label for this step |
| `completionVarName` | `string` | — | Gate: variable must be truthy to enable Continue |
| `autoAdvance` | `boolean` | `false` | Auto-reveal next step when `completionVarName` becomes truthy (hides button) |
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

---

## LaTeX Escaping in JSX

**Use a single `\` for LaTeX commands in JSX string attributes — NEVER `\\`.**

In JSX string attributes (`latex="..."`), a single backslash is passed through literally to KaTeX. Using `\\` produces two literal backslashes in the string, which KaTeX cannot parse — causing broken rendering (formula text appears as split plain italic text).

```tsx
// WRONG — double backslash breaks KaTeX
<InlineFormula latex="y = A\\sin(\\omega x + \\phi)" colorMap={{}} />

// CORRECT — single backslash
<InlineFormula latex="y = A\sin(\omega x + \phi)" colorMap={{}} />

// CORRECT — with \clr color syntax
<InlineFormula
    latex="\clr{area}{A} = \clr{pi}{\pi} \clr{radius}{r}^2"
    colorMap={{ area: '#ef4444', pi: '#3b82f6', radius: '#3cc499' }}
/>

// CORRECT — FormulaBlock follows the same rule
<FormulaBlock latex="\clr{force}{F} = \scrub{mass} \times \scrub{acceleration}" ... />
```

This applies to **all** LaTeX commands: `\sin`, `\cos`, `\omega`, `\pi`, `\phi`, `\alpha`, `\frac`, `\sqrt`, `\sum`, `\int`, `\clr`, `\scrub`, etc.

---

## Table (Table with Inline Components)

`Table` renders a styled HTML table where **each cell can contain any React node** — plain strings, numbers, or rich inline components such as `InlineScrubbleNumber`, `InlineFormula`, `InlineClozeInput`, `InlineToggle`, `InlineLinkedHighlight`, etc.

The table reads its accent colour from the global variable store (via `varName`) so colours stay consistent across the lesson.

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

---

## Linking Variables to Visuals

Create a reactive wrapper that reads from the store and passes values as props:

```tsx
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

---

## Environment Variables

| Variable | Values | Purpose |
|----------|--------|---------|
| `VITE_APP_MODE` | `editor` / `preview` | Editor enables editing UI; preview is read-only |
| `VITE_SHOW_EXAMPLES` | `true` / `false` | Load example blocks+variables instead of lesson content |

## NPM Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run dev:editor` | Start in editor mode |
| `npm run dev:preview` | Start in preview mode |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |

## Tech Stack

- **Framework:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS + shadcn/ui
- **State:** Zustand + React Context
- **Math:** KaTeX, Mafs, Desmos, GeoGebra
- **Graphics:** Three.js, Two.js, D3, React Flow
- **Icons:** lucide-react
