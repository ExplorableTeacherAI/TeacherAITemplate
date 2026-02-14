# MathVibe Template

Interactive explorable-explanation template for creating mathematics lessons. Built with React + TypeScript + Vite + Tailwind CSS. Content is organized as **blocks** inside **layouts**, with shared state via a **global variable store** (Zustand).


## Project Structure

```
src/
├── data/                        # LESSON CONTENT (edit these files)
│   ├── variables.ts             # Define all shared variables (EDIT FIRST)
│   ├── blocks.tsx               # Define all blocks (main entry point)
│   ├── sections/                # Extract section blocks here
│   ├── exampleBlocks.tsx        # Reference only — copy patterns from here
│   └── exampleVariables.ts      # Reference only — copy structure from here
│
├── components/
│   ├── atoms/                   # Base components (text, inline, math, viz)
│   │   ├── EditableHeadings.tsx  # EditableH1–H6
│   │   ├── EditableParagraph.tsx # EditableParagraph, EditableSpan
│   │   ├── InlineScrubbleNumber.tsx
│   │   ├── InlineDropdown.tsx
│   │   ├── InlineTextInput.tsx
│   │   ├── Equation.tsx          # KaTeX math rendering
│   │   ├── ColoredEquation.tsx   # Colored/highlighted equations
│   │   ├── InfoTooltip.tsx
│   │   ├── MafsBasic.tsx         # Math graphing (Mafs)
│   │   ├── MafsInteractive.tsx
│   │   ├── CoordinateSystem.tsx  # 2D coordinate system (Two.js)
│   │   ├── AnimatedGraph.tsx     # 2D animated graphs
│   │   ├── ThreeCanvas.tsx       # 3D graphics (Three.js)
│   │   ├── D3BarChart.tsx        # Data visualization (D3)
│   │   ├── FlowDiagram.tsx       # Flow diagrams (React Flow)
│   │   ├── InteractiveHighlight.tsx
│   │   └── ui/                   # shadcn/ui components (60+)
│   │
│   ├── molecules/               # Compound components
│   │   ├── MathBlock.tsx
│   │   ├── InteractiveEquation.tsx
│   │   └── InteractiveTerm.tsx
│   │
│   ├── organisms/               # Complex interactive components
│   │   ├── DesmosGraph.tsx       # Desmos graphing calculator
│   │   ├── GeoGebraGraph.tsx     # GeoGebra geometry
│   │   ├── ExcalidrawRenderer.tsx # Hand-drawn diagrams
│   │   ├── MermaidRenderer.tsx    # Diagram syntax
│   │   └── InteractiveAnimation.tsx
│   │
│   ├── layouts/                 # Page layout components
│   │   ├── FullWidthLayout.tsx   # Single column
│   │   ├── SplitLayout.tsx       # Side-by-side
│   │   ├── GridLayout.tsx        # Multi-column grid
│   │   └── SidebarLayout.tsx     # Main + sidebar
│   │
│   ├── templates/               # Block management
│   │   ├── Block.tsx             # Content block container
│   │   ├── BlockRenderer.tsx     # Renders block array
│   │   ├── BlockInput.tsx        # New block input
│   │   └── LessonView.tsx        # Main lesson wrapper
│   │
│   ├── editing/                 # Editing system
│   │   ├── EditableText.tsx      # Base editable text wrapper
│   │   ├── ScrubbleNumberEditorModal.tsx
│   │   └── EquationEditorModal.tsx
│   │
│   └── annotations/             # Interactive text annotations
│       ├── Hoverable.tsx         # Tooltip on hover
│       ├── Glossary.tsx          # Definition popup
│       ├── Whisper.tsx           # Hidden content reveal
│       ├── Toggle.tsx            # Click to toggle
│       ├── FillBlank.tsx         # Input validation
│       ├── MultiChoice.tsx       # Quiz selection
│       ├── Linked.tsx            # Cross-reference highlighting
│       └── Trigger.tsx           # Event trigger
│
├── stores/
│   ├── variableStore.ts          # Zustand global variable store
│   └── index.ts                  # useVar, useSetVar, useVariableStore
│
├── contexts/
│   ├── AppModeContext.tsx         # Editor vs preview mode
│   ├── BlockContext.tsx           # Block management context
│   └── EditingContext.tsx         # Edit tracking context
│
└── lib/
    ├── block-loader.ts           # Dynamic block loading
    └── utils.ts                  # Utilities
```

### Key Files

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

**Supported types:** `number`, `text`, `select`, `boolean`, `array`, `object`

### Step 2: Create Section Blocks (`src/data/sections/`)

Each section exports a **flat array** of `Layout > Block` elements. This is critical for the block management system (add, delete, reorder) to work.

```tsx
// src/data/sections/Introduction.tsx
import { type ReactElement } from "react";
import { Block } from "@/components/templates";
import { FullWidthLayout } from "@/components/layouts";
import { EditableH1, EditableParagraph, InlineScrubbleNumber } from "@/components/atoms";
import { getVariableInfo, numberPropsFromDefinition } from "../variables";

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

## Text Components

**Always use editable components for all text content.** These support inline editing in editor mode.

| Component | Purpose | Import from |
|-----------|---------|-------------|
| `EditableH1` | Page/section title | `@/components/atoms` |
| `EditableH2` | Section heading | `@/components/atoms` |
| `EditableH3` | Subsection heading | `@/components/atoms` |
| `EditableH4`–`H6` | Minor headings | `@/components/atoms` |
| `EditableParagraph` | Body text | `@/components/atoms` |
| `EditableSpan` | Inline editable text | `@/components/atoms` |

### Required Props

Every text component needs:
- `id` — unique element identifier (e.g., `"para-intro"`)
- `blockId` — must match the parent `Block`'s `id` (e.g., `"block-intro"`)

```tsx
<Block id="block-intro" padding="sm">
    <EditableH2 id="h2-intro" blockId="block-intro">Heading</EditableH2>
    <EditableParagraph id="para-intro" blockId="block-intro">
        Body text here.
    </EditableParagraph>
</Block>
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

## Inline Interactive Components

### InlineScrubbleNumber

Draggable inline number bound to a global variable. **Never hardcode numeric props.**

```tsx
import { InlineScrubbleNumber } from "@/components/atoms";
import { getVariableInfo, numberPropsFromDefinition } from "./variables";

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

### InlineDropdown / InlineTextInput

```tsx
<InlineDropdown varName="waveType" options={['sine', 'cosine', 'square']} />
<InlineTextInput correctAnswer="90" placeholder="???" />
```

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

// Sidebar
<SidebarLayout key="layout-sidebar" sidebarPosition="left" sidebarWidth="medium">
    <Sidebar><Block id="block-sidebar" padding="md">...</Block></Sidebar>
    <Main><Block id="block-main" padding="md">...</Block></Main>
</SidebarLayout>
```

---

## Annotation System

Interactive inline annotations for explorable explanations. Import from `@/components/annotations`.

| Annotation | Visual Style | Purpose |
|-----------|-------------|---------|
| `Hoverable` | Colored text | Shows tooltip on hover |
| `Glossary` | Dotted underline | Definition popup with pronunciation |
| `Whisper` | Faded text | Reveals hidden content on hover |
| `Toggle` | Dashed underline | Cycles through options on click |
| `FillBlank` | Input field | Text answer validation |
| `MultiChoice` | Dropdown | Quiz selection validation |
| `Linked` | Dotted underline | Bidirectional cross-reference highlighting |
| `Trigger` | Solid underline | Triggers an action on click |

```tsx
import { Hoverable, FillBlank, Toggle } from '@/components/annotations';

<EditableParagraph id="para-example" blockId="block-example">
    Every point on a{' '}
    <Hoverable tooltip="A shape where all points are equidistant from center">
        circle
    </Hoverable>{' '}
    has the same distance from its center. A right angle has{' '}
    <FillBlank correctAnswer="90" placeholder="???" />{' '}
    degrees. The shape is a{' '}
    <Toggle options={['triangle', 'square', 'pentagon']} />.
</EditableParagraph>
```

---

## Math Components

```tsx
import { Equation, ColoredEquation } from '@/components/atoms';
import { InteractiveEquation } from '@/components/molecules';

// Static equation (KaTeX)
<Equation latex="E = mc^2" />

// Interactive equation (updates with variables)
<InteractiveEquation latex="y = {amplitude} \sin({frequency} x)" />

// Colored equation with highlighted terms
<ColoredEquation
    latex="F = ma"
    terms={{ F: '#ef4444', m: '#3b82f6', a: '#22c55e' }}
/>
```

---

## Visualization Libraries

| Library | Components | Use For |
|---------|-----------|---------|
| **Mafs** | `MafsBasic`, `MafsInteractive`, `MafsAnimated` | Interactive math graphs, function plots |
| **Two.js** | `CoordinateSystem`, `AnimatedGraph`, `AnimatedBackground` | 2D coordinate systems, animations |
| **Three.js** | `ThreeCanvas`, `ThreeCoordinateSystem`, `ThreeVisuals` | 3D graphics, spatial geometry |
| **D3** | `D3BarChart` | Data visualization, charts |
| **React Flow** | `FlowDiagram`, `ExpandableFlowDiagram` | Node/edge diagrams, flowcharts |
| **Desmos** | `DesmosGraph` | Graphing calculator |
| **GeoGebra** | `GeoGebraGraph` | Geometry constructions |
| **Excalidraw** | `ExcalidrawRenderer` | Hand-drawn diagrams |
| **Mermaid** | `MermaidRenderer` | Diagram syntax (flowcharts, sequences) |

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
