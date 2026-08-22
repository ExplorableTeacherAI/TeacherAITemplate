# MathVibe Template

Interactive explorable-explanation template for creating mathematics lessons. Built with React + TypeScript + Vite + Tailwind CSS. Content is organized as **blocks** inside **layouts**, with shared state via a **global variable store** (Zustand).

---

## Core Concept: Everything Lives in a Block

The **Block** is the fundamental unit of content. Every piece of a lesson — a paragraph, an equation, a chart, a visualization — must live inside a `<Block>`.

- **Rearrangeable** — teachers drag-and-drop blocks to reorder content
- **Editable** — each block has its own toolbar for inline editing, deleting, and inserting
- **Trackable** — the block manager sees and controls every piece individually

**Rule 1: Never use a component outside a Block.** Unwrapped components are invisible to the editing system.

**Rule 2: Each Block must contain exactly ONE primary component.** A single heading, a single paragraph, a single formula, or a single visual. Teachers add, delete, and reorder blocks individually — combining multiple components in one block makes them inseparable and breaks the editing system. The block manager needs to identify and control each piece individually.

> **Exception:** Inline components (`InlineHyperlink`, `InlineFormula`) belong *inside* their parent `EditableParagraph` — they are part of the text, not separate blocks.

Every block follows the pattern: **Layout > Block > Component**.

**Rule 3: Set `hasVisualization` on visualization blocks.** When a Block contains a visual component (chart, diagram, interactive visualization), add `hasVisualization` to enable the AI alternatives wand icon.

```tsx
// Text block — no hasVisualization
<Block id="intro-paragraph" padding="sm">
    <EditableParagraph id="para-text" blockId="intro-paragraph">Content</EditableParagraph>
</Block>

// Visualization block — with hasVisualization
<Block id="data-chart" padding="sm" hasVisualization>
    <Cartesian2D plots={[...]} />
</Block>
```

**Applies to:** `Cartesian2D`, `DataVisualization`, `GeometricDiagram`, `MatrixVisualization`, `FlowDiagram`, `ExpandableFlowDiagram`, `SimulationPanel`, `DesmosGraph`, `GeoGebraGraph`, and custom visualizations.

**Does NOT apply to:** `EditableParagraph`, `EditableH1/H2/H3`, `FormulaBlock`, `ImageDisplay`, `VideoDisplay`, `Table`.

---

## Project Structure

```
src/
├── data/                           # LESSON CONTENT (edit these files)
│   ├── variables.ts                #   Define all shared variables (EDIT FIRST)
│   ├── blocks.tsx                  #   Define all blocks (main entry point)
│   ├── sections/                   #   Extract section blocks here
│
├── components/
│   ├── atoms/                      # Smallest reusable building blocks
│   │   ├── text/                   #   EditableHeadings, EditableParagraph,
│   │   │                           #   InlineHyperlink
│   │   ├── formula/                #   InlineFormula
│   │   ├── visual/                 #   DataVisualization, ImageDisplay, VideoDisplay,
│   │   │                           #   Cartesian2D, FlowDiagram, ExpandableFlowDiagram,
│   │   │                           #   Table, GeometricDiagram, NodeLinkDiagram
│   │   └── ui/                     #   shadcn/ui primitives
│   │
│   ├── molecules/                  # Composed from multiple atoms
│   │   ├── formula/                #   FormulaBlock
│   │
│   ├── organisms/                  # Complex self-contained visualizations
│   │   └── visual/                 #   DesmosGraph, GeoGebraGraph
│   │
│   ├── layouts/                    # StackLayout, SplitLayout, GridLayout
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
        <Block id="intro-title" padding="md">
            <EditableH1 id="h1-intro-title" blockId="intro-title">
                Understanding Waves
            </EditableH1>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-intro-text" maxWidth="xl">
        <Block id="intro-text" padding="sm">
            <EditableParagraph id="para-intro-text" blockId="intro-text">
                A wave with amplitude 1 meter.
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

### ID Conventions — Hierarchical, Descriptive Naming

Every block, layout, and component MUST have a **unique, descriptive, hierarchical ID** that reflects the content hierarchy. Well-structured IDs make it easy to find, edit, and understand the lesson structure.

**Stricter ID Format Rules:**
- **No generic wrappers**: NEVER use the words "block", "container", "item", or similar generic terms in IDs. (e.g., `intro-title` instead of `block-intro-title`).
- **No arbitrary numbers**: NEVER use arbitrary numbering like `-01`, `-02`, `-03`. IDs must be contextually meaningful based on their content (e.g., `paragraph-circle-area` instead of `paragraph-01`).
- **No abbreviations**: NEVER use short obscure abbreviations. Use full words (e.g., `cartesian-2d-` instead of `c2d-`, `math-tree-` instead of `mt-`, `video-` instead of `vid-`).

| Element | Pattern | Example |
|---------|---------|---------|
| Layout keys | `layout-<section>-<purpose>` | `layout-intro-title`, `layout-waves-chart` |
| Block IDs | `<section>-<purpose>` | `intro-title`, `waves-chart` |
| Heading IDs | `h1/h2/h3-<section>-<purpose>` | `h1-intro-title`, `h2-waves-heading` |
| Paragraph IDs | `para-<section>-<purpose>` | `para-intro-description`, `para-waves-explanation` |
| Visual IDs | Use block ID hierarchy | `waves-sine-chart` |
| `blockId` prop | Must match parent Block's `id` | |

**Rules:**
- IDs must be **unique across the entire lesson** — never reuse an ID
- IDs should be **descriptive and readable** — a developer should understand what the block contains from its ID alone

## Component Reference

### Text Components (`@/components/atoms`)

| Component | Purpose |
|-----------|---------|
| `EditableH1` ... `EditableH3` | Headings (never use plain `<h1>` tags) |
| `EditableParagraph` | Body text — supports inline components |
| `InlineHyperlink` | Click to open URL or scroll to block (emerald) |
| `InlineFormula` | Static inline KaTeX formula (use single `\` for LaTeX commands) |

### Formula Components (`@/components/molecules`)

| Component | Purpose |
|-----------|---------|
| `FormulaBlock` | Static block-level math display (`latex` prop) |
### Standard UI Components (`@/components/atoms`, shadcn/ui)

The full shadcn/ui kit is available for ordinary page interactivity — `Input`, `Textarea`, `Select`, `RadioGroup`, `Checkbox`, `Switch`, `Slider`, `Button`, `Tabs`, `Accordion`, `Collapsible`, `Card`, `Alert`, `Badge`, `Progress`, `Dialog`, `Popover`, `Tooltip`, `Separator`. Use them for controls, answer entry and panels; keep lesson prose in the editable text components, and keep shared values in the variable store (`useVar` / `useSetVar`). `Table` from this barrel is the lesson table component, not shadcn's primitive. See `CLAUDE.md` for a worked example.

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

## Layouts

| Layout | Best For | Key Props |
|--------|----------|-----------|
| `StackLayout` | Single column | `maxWidth`: `sm` / `md` / `lg` / `xl` / `2xl` / `full` |
| `SplitLayout` | Side-by-side | `ratio`: `1:1` / `1:2` / `2:1`; `gap`; `align` |
| `GridLayout` | Multiple items | `columns`: 2–6; `gap` |

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

---

## LaTeX Escaping in JSX

**Use a single `\` for LaTeX commands in JSX string attributes — NEVER `\\`.**

In JSX string attributes (`latex="..."`), a single backslash is passed through literally to KaTeX. Using `\\` produces two literal backslashes in the string, which KaTeX cannot parse — causing broken rendering (formula text appears as split plain italic text).

```tsx
// WRONG — double backslash breaks KaTeX
<InlineFormula latex="y = A\\sin(\\omega x + \\phi)" />

// CORRECT — single backslash
<InlineFormula latex="y = A\sin(\omega x + \phi)" />

// CORRECT — FormulaBlock follows the same rule
<FormulaBlock latex="F = m \times a" />
```

This applies to **all** LaTeX commands: `\sin`, `\cos`, `\omega`, `\pi`, `\phi`, `\alpha`, `\frac`, `\sqrt`, `\sum`, `\int`, etc.

---

## Table (Table with Inline Components)

`Table` renders a styled HTML table where **each cell can contain any React node** — plain strings, numbers, or rich inline components such as `InlineFormula`, `InlineHyperlink`, etc.

The table reads its accent colour from the global variable store (via `varName`) so colours stay consistent across the lesson.

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

## Visual Styling Rules

### Safe SVG Dimensions and Anti-Clipping

When manually writing custom `<svg>` visual components, **always establish a safe `viewBox` width and height** that securely encompasses all shapes, texts, and potential transforms. Give a margin of 20px-40px.

- **Bad**: `viewBox="0 0 300 200"` while placing text at `x={290}` (gets cut off right off the edge).
- **Good**: Expand `viewBox="0 0 340 200"` and `width={340}` to safely pad the drawing area preventing crop-offs.

---

## Tech Stack

- **Framework:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS + shadcn/ui
- **State:** Zustand + React Context
- **Math:** KaTeX, Mafs, Desmos, GeoGebra
- **Graphics:** Three.js, Two.js, D3, React Flow
- **Icons:** lucide-react

