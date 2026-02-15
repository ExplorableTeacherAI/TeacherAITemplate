# MathVibe Template

Interactive explorable-explanation template for creating mathematics lessons. Built with React + TypeScript + Vite + Tailwind CSS. Content is organized as **blocks** inside **layouts**, with shared state via a **global variable store** (Zustand).

---

## Core Concept: Everything Lives in a Block

The **Block** is the fundamental unit of content. Every piece of a lesson — a paragraph, an equation, a chart, a visualization — must live inside a `<Block>`. This is what makes the system work:

- **Rearrangeable** — teachers drag-and-drop blocks to reorder content
- **Editable** — each block has its own toolbar for inline editing, deleting, and inserting
- **Trackable** — the block manager sees and controls every piece individually

**Rule: never use a component outside a Block.** Unwrapped components are invisible to the editing and reordering system.

```tsx
// CORRECT — component lives inside a Block, can be rearranged and edited
<FullWidthLayout key="layout-chart" maxWidth="xl">
    <Block id="block-chart" padding="sm">
        <D3BarChart data={myData} />
    </Block>
</FullWidthLayout>

// WRONG — not in a Block, invisible to the block manager
<D3BarChart data={myData} />
```

Every block follows the pattern: **Layout > Block > Component(s)**.

```
Layout (controls width, columns, spacing)
  └── Block (unit of editing — has toolbar, id tracking)
        └── Component(s) (atoms, molecules, organisms)
```

---

## Project Structure

```
src/
├── data/                           # LESSON CONTENT (edit these files)
│   ├── variables.ts                # Define all shared variables (EDIT FIRST)
│   ├── blocks.tsx                  # Define all blocks (main entry point)
│   ├── sections/                   # Extract section blocks here
│   ├── exampleBlocks.tsx           # Reference only — copy patterns from here
│   └── exampleVariables.ts         # Reference only — copy structure from here
│
├── components/
│   ├── atoms/                      # Smallest reusable building blocks
│   │   ├── text/                   #   EditableHeadings, EditableParagraph, EditableText,
│   │   │                           #   InlineScrubbleNumber, InlineClozeInput, InlineDropdown,
│   │   │                           #   InteractiveHighlight
│   │   ├── formula/                #   Equation, ColoredEquation
│   │   ├── visual/                 #   D3BarChart, Mafs*, Three*, AnimatedBackground,
│   │   │                           #   AnimatedGraph, MorphingShapes, ParticleSystem,
│   │   │                           #   CoordinateSystem, FlowDiagram, ExpandableFlowDiagram
│   │   ├── ui/                     #   shadcn/ui primitives (Button, Card, Dialog, etc.)
│   │   └── index.ts                #   Barrel — import from "@/components/atoms"
│   │
│   ├── molecules/                  # Composed from multiple atoms
│   │   ├── text/                   #   InteractiveTerm
│   │   ├── formula/                #   MathBlock, InteractiveEquation
│   │   └── index.ts                #   Barrel — import from "@/components/molecules"
│   │
│   ├── organisms/                  # Complex self-contained visualizations
│   │   ├── visual/                 #   DesmosGraph, GeoGebraGraph, InteractiveAnimation,
│   │   │                           #   DesmosRenderer, GeogebraRenderer, ExcalidrawRenderer,
│   │   │                           #   MermaidRenderer, DiagramEditorDialog
│   │   └── index.ts                #   Barrel — import from "@/components/organisms"
│   │
│   ├── annotations/                # Inline annotation wrappers
│   │   ├── Hoverable, Glossary, Whisper, Toggle
│   │   ├── MultiChoice, Linked, Trigger
│   │   └── index.ts
│   │
│   ├── layouts/                    # Layout containers
│   │   ├── FullWidthLayout, SplitLayout, GridLayout, SidebarLayout
│   │   └── index.ts
│   │
│   ├── templates/                  # Page-level infrastructure (system)
│   │   ├── Block.tsx               # Content block container
│   │   ├── BlockRenderer.tsx       # Renders block array
│   │   ├── BlockInput.tsx          # New block input
│   │   ├── LessonView.tsx          # Main lesson wrapper
│   │   └── SlashCommandMenu.tsx
│   │
│   └── utility/                    # Infrastructure — NOT for lesson content
│       ├── Spacer, ModeIndicator, InfoTooltip
│       ├── AnnotationOverlay, LoadingScreen
│       ├── EquationEditorModal, ScrubbleNumberEditorModal, ClozeInputEditorModal
│       └── index.ts
│
├── stores/                         # Zustand global variable store
├── contexts/                       # React contexts (AppMode, Editing, Block)
├── hooks/                          # Custom hooks
└── lib/                            # Utilities
```

### Folder Roles

| Folder | Used by | Purpose |
|--------|---------|---------|
| `atoms/` | Agent | Smallest building blocks for composing lesson content |
| `molecules/` | Agent | Components built from multiple atoms |
| `organisms/` | Agent | Complex self-contained visualizations |
| `annotations/` | Agent | Inline wrappers for interactivity (hover, toggle, glossary) |
| `layouts/` | Agent | Containers that control width, columns, spacing |
| `templates/` | System | Page infrastructure (Block, LessonView) — do not modify |
| `utility/` | System | Editor modals, loading screen, overlays — not lesson content |

---

## Key Files

| File | Purpose |
|------|---------|
| `src/data/variables.ts` | **Define ALL shared variables here first** |
| `src/data/blocks.tsx` | **Main entry point for lesson content** |
| `src/data/sections/*.tsx` | Extract complex section blocks here |
| `src/data/exampleBlocks.tsx` | Reference only — shows all patterns |
| `src/data/exampleVariables.ts` | Reference only — shows all variable types |

---

## How to Create Content

### Step 1: Define Variables (`src/data/variables.ts`)

Every interactive number must be defined here first. This centralizes all variable metadata in one place.

```ts
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
    quarterCircleAngle: {
        defaultValue: '',
        type: 'text',
        label: 'Quarter Circle Angle',
        description: 'Student answer for quarter circle angle',
        placeholder: 'Type answer...',
        correctAnswer: '90',
        color: '#3B82F6',
    },
    waveType: {
        defaultValue: 'sine',
        type: 'select',
        label: 'Wave Type',
        options: ['sine', 'cosine', 'square'],
    },
    showGrid: {
        defaultValue: true,
        type: 'boolean',
        label: 'Show Grid',
    },
};
```

**Supported types:** `number`, `text` (including cloze), `select`, `boolean`, `array`, `object`

### Step 2: Create Section Blocks (`src/data/sections/`)

Each section exports a **flat array** of `Layout > Block` elements. This is critical — the block management system can only manage blocks that are individual top-level elements in the array.

```tsx
// src/data/sections/Introduction.tsx
import { type ReactElement } from "react";
import { Block } from "@/components/templates";
import { FullWidthLayout } from "@/components/layouts";
import { EditableH1, EditableParagraph, InlineScrubbleNumber, InlineClozeInput } from "@/components/atoms";
import { getVariableInfo, numberPropsFromDefinition, clozePropsFromDefinition } from "../variables";

export const introBlocks: ReactElement[] = [
    <FullWidthLayout key="layout-intro-title" maxWidth="xl">
        <Block id="block-intro-title" padding="md">
            <EditableH1 id="h1-intro-title" blockId="block-intro-title">
                Understanding Waves
            </EditableH1>
        </Block>
    </FullWidthLayout>,

    <FullWidthLayout key="layout-intro-text" maxWidth="xl">
        <Block id="block-intro-text" padding="sm">
            <EditableParagraph id="para-intro-text" blockId="block-intro-text">
                A wave with amplitude{" "}
                <InlineScrubbleNumber
                    varName="amplitude"
                    {...numberPropsFromDefinition(getVariableInfo('amplitude'))}
                />
                {" "}meters oscillates between positive and negative values.
            </EditableParagraph>
        </Block>
    </FullWidthLayout>,
];
```

### Step 3: Assemble in `blocks.tsx`

```tsx
import { introBlocks } from "./sections/Introduction";

export const blocks: ReactElement[] = [
    ...introBlocks,
];
```

---

## Section Structure Rules

### Sections Must Be Flat Arrays

The block management system (add, delete, reorder) requires each block to be a separate top-level element in the array. **Never wrap blocks in a React component.**

```tsx
// WRONG — block manager can't see individual blocks
export const MySection = () => (
    <>
        <FullWidthLayout key="a"><Block id="a">...</Block></FullWidthLayout>
        <FullWidthLayout key="b"><Block id="b">...</Block></FullWidthLayout>
    </>
);
export const blocks = [<MySection key="section" />]; // 1 opaque element

// CORRECT — each block is individually manageable
export const mySectionBlocks: ReactElement[] = [
    <FullWidthLayout key="layout-a" maxWidth="xl">
        <Block id="block-a" padding="md">...</Block>
    </FullWidthLayout>,
    <FullWidthLayout key="layout-b" maxWidth="xl">
        <Block id="block-b" padding="sm">...</Block>
    </FullWidthLayout>,
];
```

### Why Flat Arrays?
- Each element = one manageable block
- Teachers can add blocks between any two elements
- Teachers can delete or reorder individual blocks
- The block toolbar (add/delete/drag) appears on each block

### ID Conventions

- Layout keys: `layout-<name>` (e.g., `layout-intro-title`)
- Block IDs: `block-<name>` (e.g., `block-intro-title`)
- Element IDs: `<type>-<name>` (e.g., `para-intro-text`, `h1-main-title`)
- `blockId` prop must match the parent `Block`'s `id`

---

## Component Reference

All components below are used by the agent to compose lessons. **Every component must be placed inside a `<Block>`.**

### Text — `atoms/text/`

| Component | Purpose |
|-----------|---------|
| `EditableH1` ... `EditableH6` | Headings (never use plain `<h1>` tags) |
| `EditableParagraph` | Body text — supports inline components |
| `EditableSpan` | Inline editable text |
| `InlineScrubbleNumber` | Draggable number bound to a global variable |
| `InlineClozeInput` | Fill-in-the-blank input with answer validation |
| `InlineDropdown` | Inline dropdown selector |
| `InteractiveHighlightProvider` | Bidirectional highlighting context |
| `InteractiveText` | Text that highlights on hover |

All text components require `id` and `blockId` props:

```tsx
<Block id="block-intro" padding="sm">
    <EditableH2 id="h2-intro" blockId="block-intro">Heading</EditableH2>
    <EditableParagraph id="para-intro" blockId="block-intro">
        Body text here.
    </EditableParagraph>
</Block>
```

### Formula — `atoms/formula/` + `molecules/formula/`

| Component | Level | Purpose |
|-----------|-------|---------|
| `Equation` | atom | Static LaTeX equation |
| `ColoredEquation` | atom | LaTeX with color-coded terms |
| `MathBlock` | molecule | Block-level math display |
| `InteractiveEquation` | molecule | Equation with interactive variable terms |

```tsx
<Block id="block-eq" padding="sm">
    <Equation latex="E = mc^2" />
</Block>
```

### Visual — `atoms/visual/` + `organisms/visual/`

| Component | Level | Library |
|-----------|-------|---------|
| `D3BarChart` | atom | D3 |
| `MafsBasic`, `MafsAnimated`, `MafsInteractive` | atom | Mafs |
| `AnimatedBackground`, `AnimatedGraph`, `MorphingShapes`, `ParticleSystem` | atom | Two.js |
| `CoordinateSystem` | atom | Two.js |
| `ThreeCanvas`, `ThreeVisuals`, `ThreeCoordinateSystem` | atom | Three.js |
| `FlowDiagram`, `ExpandableFlowDiagram` | atom | React Flow |
| `DesmosGraph` | organism | Desmos |
| `GeoGebraGraph` | organism | GeoGebra |
| `InteractiveAnimation` | organism | — |
| `DesmosRenderer`, `GeogebraRenderer`, `ExcalidrawRenderer`, `MermaidRenderer` | organism | Various |

```tsx
<SplitLayout key="layout-viz" ratio="1:1">
    <Block id="block-text" padding="sm">
        <EditableParagraph id="para-explain" blockId="block-text">
            Drag the point to change the amplitude.
        </EditableParagraph>
    </Block>
    <Block id="block-graph" padding="sm">
        <MafsInteractive />
    </Block>
</SplitLayout>
```

### Annotations — `annotations/`

Inline wrappers that go inside `EditableParagraph`. Import from `@/components/annotations`.

| Annotation | Visual Style | Purpose |
|-----------|-------------|---------|
| `Hoverable` | Colored text | Shows tooltip on hover |
| `Glossary` | Dotted underline | Definition popup with pronunciation |
| `Whisper` | Faded text | Reveals hidden content on hover |
| `Toggle` | Dashed underline | Cycles through options on click |
| `MultiChoice` | Dropdown | Quiz selection validation |
| `Linked` | Dotted underline | Bidirectional cross-reference highlighting |
| `Trigger` | Solid underline | Triggers an action on click |

```tsx
<EditableParagraph id="para-example" blockId="block-example">
    Every point on a{' '}
    <Hoverable tooltip="A shape where all points are equidistant from center">
        circle
    </Hoverable>{' '}
    has the same distance from its center. A right angle has{' '}
    <InlineClozeInput
        varName="rightAngle"
        correctAnswer="90"
        {...clozePropsFromDefinition(getVariableInfo('rightAngle'))}
    />{' '}
    degrees.
</EditableParagraph>
```

---

## Layouts

| Layout | Best For | Key Props |
|--------|----------|-----------|
| `FullWidthLayout` | Single column content | `maxWidth`: `sm`, `md`, `lg`, `xl`, `2xl`, `full` |
| `SplitLayout` | Side-by-side panels | `ratio`: `1:1`, `1:2`, `2:1`; `gap`; `align` |
| `GridLayout` | Multiple equal items | `columns`: 2–6; `gap` |
| `SidebarLayout` | Main + sticky sidebar | `sidebarPosition`, `sidebarWidth`, `<Sidebar>`, `<Main>` |

```tsx
// Full width
<FullWidthLayout key="layout-example" maxWidth="xl">
    <Block id="block-example" padding="sm">...</Block>
</FullWidthLayout>

// Split
<SplitLayout key="layout-split" ratio="1:2" gap="lg">
    <Block id="block-left" padding="sm">...</Block>
    <Block id="block-right" padding="sm">...</Block>
</SplitLayout>

// Grid
<GridLayout key="layout-grid" columns={3} gap="md">
    <Block id="block-a" padding="sm">...</Block>
    <Block id="block-b" padding="sm">...</Block>
    <Block id="block-c" padding="sm">...</Block>
</GridLayout>
```

---

## Inline Interactive Components

### InlineScrubbleNumber

Draggable inline number bound to a global variable. **Never hardcode numeric props.**

```tsx
// CORRECT — uses centralized variable definition
<InlineScrubbleNumber
    varName="amplitude"
    {...numberPropsFromDefinition(getVariableInfo('amplitude'))}
/>

// With format function (the only allowed inline prop)
<InlineScrubbleNumber
    varName="temperature"
    {...numberPropsFromDefinition(getVariableInfo('temperature'))}
    formatValue={(v) => `${v}°C`}
/>

// WRONG — never hardcode props
<InlineScrubbleNumber defaultValue={5} min={0} max={10} step={1} />
```

### InlineClozeInput

Fill-in-the-blank input bound to a global variable. The variable store holds the **student's typed answer**; the `correctAnswer` stays as a prop (not exposed to students).

```tsx
// CORRECT — uses centralized variable definition
<InlineClozeInput
    varName="quarterCircleAngle"
    correctAnswer="90"
    {...clozePropsFromDefinition(getVariableInfo('quarterCircleAngle'))}
/>

// Variable definition in variables.ts:
quarterCircleAngle: {
    defaultValue: '',
    type: 'text',
    label: 'Quarter Circle Angle',
    placeholder: 'Type answer...',
    correctAnswer: '90',
    color: '#3B82F6',
},
```

**Cloze variable fields:** `correctAnswer`, `placeholder`, `color`, `bgColor`, `caseSensitive`

---

## Global Variable Store

Share state between blocks using Zustand hooks.

```tsx
import { useVar, useSetVar } from '@/stores';

// Read (reactive — auto-updates when value changes)
const amplitude = useVar('amplitude', 1);

// Write
const setVar = useSetVar();
setVar('amplitude', 2.5);
```

---

## Imports

Use barrel imports for agent-facing components:

```tsx
import { EditableParagraph, InlineScrubbleNumber, InlineClozeInput, Equation } from "@/components/atoms";
import { MathBlock, InteractiveEquation } from "@/components/molecules";
import { DesmosGraph } from "@/components/organisms";
import { Block } from "@/components/templates";
import { FullWidthLayout, SplitLayout } from "@/components/layouts";
import { Hoverable, MultiChoice } from "@/components/annotations";
import { getVariableInfo, numberPropsFromDefinition, clozePropsFromDefinition } from "./variables";
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
| `npm run build:editor` | Build editor mode |
| `npm run build:preview` | Build preview mode |
| `npm run lint` | Run ESLint |

## Tech Stack

- **Framework:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS + shadcn/ui (60+ components)
- **State:** Zustand (global variables) + React Context (editing, app mode)
- **Animations:** Framer Motion
- **Math:** KaTeX, Mafs, Desmos, GeoGebra
- **Graphics:** Three.js, Two.js, D3
- **Diagrams:** React Flow, Excalidraw, Mermaid
- **Icons:** lucide-react
