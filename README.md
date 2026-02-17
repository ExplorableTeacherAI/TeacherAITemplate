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
│   │   │                           #   InlineScrubbleNumber, InlineClozeInput, InlineClozeChoice, InlineToggle,
│   │   │                           #   InlineTooltip, InlineTrigger, InlineHyperlink, InteractiveHighlight
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
│   │   ├── Glossary, Whisper        # (Hoverable replaced by InlineTooltip in atoms)
│   │   ├── Linked                   # (Trigger replaced by InlineTrigger in atoms)
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
│       ├── EquationEditorModal, ScrubbleNumberEditorModal,
│       │   ClozeInputEditorModal, ClozeChoiceEditorModal, ToggleEditorModal,
│       │   TooltipEditorModal, TriggerEditorModal, HyperlinkEditorModal
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
| `annotations/` | Agent | Inline wrappers for interactivity (glossary, whisper, linked) |
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

Every interactive value must be defined here first. This centralizes all variable metadata in one place.

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
        placeholder: '???',
        correctAnswer: '90',
        color: '#3B82F6',
    },
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
    currentShape: {
        defaultValue: 'triangle',
        type: 'select',
        label: 'Current Shape',
        description: 'Currently selected polygon shape',
        options: ['triangle', 'square', 'pentagon', 'hexagon'],
        color: '#D946EF',
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

**Supported types:** `number`, `text` (including cloze input), `select` (including cloze choice and toggle), `boolean`, `array`, `object`

### Step 2: Create Section Blocks (`src/data/sections/`)

Each section exports a **flat array** of `Layout > Block` elements. This is critical — the block management system can only manage blocks that are individual top-level elements in the array.

```tsx
// src/data/sections/Introduction.tsx
import { type ReactElement } from "react";
import { Block } from "@/components/templates";
import { FullWidthLayout, SplitLayout, GridLayout } from "@/components/layouts";
import {
    EditableH1, EditableParagraph, InlineScrubbleNumber, InlineClozeInput,
    InlineClozeChoice, InlineToggle, InlineTooltip, InlineTrigger,
    InlineHyperlink, InlineFormula,
} from "@/components/atoms";
import { getVariableInfo, numberPropsFromDefinition, clozePropsFromDefinition, choicePropsFromDefinition, togglePropsFromDefinition } from "../variables";

// Visual components (import only what you need)
import { AnimatedGraph, ThreeCanvas, RotatingCube, MafsInteractive, D3BarChart, Equation, FlowDiagram } from "@/components/atoms";
import { DesmosGraph } from "@/components/organisms";
import { useVar, useSetVar } from "@/stores";

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
- Inline component IDs: `<type>-<name>` (e.g., `scrubble-radius`, `tooltip-circle-def`, `formula-circle-area`, `cloze-angle`, `choice-shape`, `toggle-shape`, `trigger-reset`, `link-wikipedia`)
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
| `InlineClozeChoice` | Dropdown choice with answer validation |
| `InlineToggle` | Click to cycle through options, bound to global variable |
| `InlineTooltip` | Shows tooltip/definition on hover (no variable store) |
| `InlineTrigger` | Click to set a variable to a specific value (connective, emerald) |
| `InlineHyperlink` | Click to open external URL or scroll to a block on page (connective, emerald) |
| `InlineFormula` | Inline KaTeX math formula with colored terms |
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

| Component | Level | Library | Key Props |
|-----------|-------|---------|-----------|
| `D3BarChart` | atom | D3 | `data`, `width`, `height`, `color` |
| `MafsBasic` | atom | Mafs | *(none — static sine wave)* |
| `MafsAnimated` | atom | Mafs | *(none — auto-animated)* |
| `MafsInteractive` | atom | Mafs | `amplitude`, `frequency`, `onAmplitudeChange`, `onFrequencyChange` |
| `AnimatedGraph` | atom | Two.js | `variant`, `color`, `secondaryColor`, `speed`, `width`, `height`, `showAxes`, `showGrid` |
| `CoordinateSystem` | atom | Two.js | `width`, `height`, `gridSpacing`, `showGrid`, `showLabels`, `axisColor`, `gridColor` |
| `AnimatedBackground` | atom | Two.js | `variant`, `color`, `secondaryColor`, `speed` |
| `MorphingShapes` | atom | Two.js | `variant`, `color`, `speed` |
| `ThreeCanvas` | atom | Three.js | `height`, `cameraPosition`, `showControls`, `shadows`, `autoRotate` |
| `RotatingCube` | atom | Three.js | `color`, `size`, `speed` |
| `PulsingSphere` | atom | Three.js | `color` |
| `GeometricCollection` | atom | Three.js | *(none)* |
| `AtomicStructure` | atom | Three.js | *(none)* |
| `ThreeCoordinateSystem` | atom | Three.js | `size`, `showGrid`, `showLabels`, `gridSize` |
| `FlowDiagram` | atom | React Flow | `nodes`, `edges`, `height`, `showBackground`, `backgroundVariant`, `showControls`, `showMinimap`, `nodesDraggable`, `fitView` |
| `ExpandableFlowDiagram` | atom | React Flow | `rootNode`, `horizontalSpacing`, `verticalSpacing` |
| `DesmosGraph` | organism | Desmos | `expressions`, `height`, `options`, `latex`, `aspectRatio` |
| `GeoGebraGraph` | organism | GeoGebra | `app`, `materialId`, `commands`, `width`, `height` |
| `InteractiveAnimation` | organism | Two.js | `type`, `initialVariant`, `showControls`, `width`, `height` |

#### AnimatedGraph Variants

| Variant | Description |
|---------|-------------|
| `"sine-wave"` | Continuously moving sine wave with phase dot |
| `"parametric"` | Parametric rose curve pattern |
| `"pendulum"` | Simple pendulum swinging under gravity |
| `"fourier"` | Fourier series — circles combining into wave patterns |
| `"lissajous"` | Complex curve from two perpendicular oscillations |

#### Three.js Usage

Three.js components must be placed inside a `ThreeCanvas` wrapper:

```tsx
<Block id="block-3d" padding="sm">
    <ThreeCanvas height={320} cameraPosition={[5, 5, 5]}>
        <RotatingCube size={1.5} color="#4F46E5" />
    </ThreeCanvas>
</Block>
```

#### Flow Diagram Usage

```tsx
import type { FlowNode, FlowEdge } from "@/components/atoms";

<FlowDiagram
    nodes={[
        { id: "1", label: "Start", position: { x: 0, y: 100 }, type: "input",
          style: { background: '#DBEAFE', border: '2px solid #3B82F6' } },
        { id: "2", label: "Process", position: { x: 250, y: 100 },
          style: { background: '#D1FAE5', border: '2px solid #10B981' } },
        { id: "3", label: "End", position: { x: 500, y: 100 }, type: "output",
          style: { background: '#EDE9FE', border: '2px solid #8B5CF6' } },
    ] as FlowNode[]}
    edges={[
        { id: "e1-2", source: "1", target: "2", animated: true, label: "next" },
        { id: "e2-3", source: "2", target: "3", label: "done" },
    ] as FlowEdge[]}
    height={300}
    fitView={true}
    showBackground={true}
    backgroundVariant="dots"
/>
```

#### Desmos Usage

```tsx
<DesmosGraph
    expressions={[
        { latex: "y = x^2", color: "#2d70b3" },
        { latex: "y = \\sin(x)", color: "#c74440" },
    ]}
    height={400}
    options={{ expressions: true, settingsMenu: false, zoomButtons: true }}
/>
```

#### Common Visual Layout Pattern

Most visuals pair well with `SplitLayout` — text on one side, visual on the other:

```tsx
<SplitLayout key="layout-viz" ratio="1:1" gap="lg">
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

Use `GridLayout` for galleries of multiple visuals:

```tsx
<GridLayout key="layout-gallery" columns={3} gap="md">
    <Block id="block-sine" padding="sm">
        <AnimatedGraph variant="sine-wave" color="#10B981" width={320} height={280} />
    </Block>
    <Block id="block-fourier" padding="sm">
        <AnimatedGraph variant="fourier" color="#F59E0B" width={320} height={280} />
    </Block>
    <Block id="block-lissajous" padding="sm">
        <AnimatedGraph variant="lissajous" color="#06B6D4" width={320} height={280} />
    </Block>
</GridLayout>
```

### Annotations — `annotations/`

Inline wrappers that go inside `EditableParagraph`. Import from `@/components/annotations`.

| Annotation | Visual Style | Purpose |
|-----------|-------------|---------|
| `Glossary` | Dotted underline | Definition popup with pronunciation |
| `Whisper` | Faded text | Reveals hidden content on hover |
| `Linked` | Dotted underline | Bidirectional cross-reference highlighting |

> **Note:** `Hoverable` has been replaced by `InlineTooltip`, `Trigger` has been replaced by `InlineTrigger`, and `Focus` has been replaced by `InlineHyperlink` with `targetBlockId` (all in `@/components/atoms`).

```tsx
<EditableParagraph id="para-example" blockId="block-example">
    Every point on a{' '}
    <InlineTooltip id="tooltip-circle" tooltip="A shape where all points are equidistant from center">
        circle
    </InlineTooltip>{' '}
    has the same distance from its center. A right angle has{' '}
    <InlineClozeInput
        id="cloze-right-angle"
        varName="rightAngle"
        correctAnswer="90"
        {...clozePropsFromDefinition(getVariableInfo('rightAngle'))}
    />{' '}
    degrees. The shape of a wheel is a{' '}
    <InlineClozeChoice
        id="choice-shape"
        varName="shapeAnswer"
        correctAnswer="circle"
        options={["cube", "circle", "square", "triangle"]}
        {...choicePropsFromDefinition(getVariableInfo('shapeAnswer'))}
    />. The current shape is a{' '}
    <InlineToggle
        id="toggle-shape"
        varName="currentShape"
        options={["triangle", "square", "pentagon", "hexagon"]}
        {...togglePropsFromDefinition(getVariableInfo('currentShape'))}
    />. You can{' '}
    <InlineTrigger id="trigger-reset-amplitude" varName="amplitude" value={1} icon="refresh">
        reset amplitude
    </InlineTrigger>. Read the{' '}
    <InlineHyperlink id="link-wikipedia" href="https://en.wikipedia.org/wiki/Wave">
        Wikipedia article
    </InlineHyperlink>{' '}
    or{' '}
    <InlineHyperlink id="link-jump-intro" targetBlockId="block-intro-title">
        jump to the intro
    </InlineHyperlink>.
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
    id="scrubble-amplitude"
    varName="amplitude"
    {...numberPropsFromDefinition(getVariableInfo('amplitude'))}
/>

// With format function (the only allowed inline prop)
<InlineScrubbleNumber
    id="scrubble-temperature"
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
    id="cloze-quarter-angle"
    varName="quarterCircleAngle"
    correctAnswer="90"
    {...clozePropsFromDefinition(getVariableInfo('quarterCircleAngle'))}
/>

// Variable definition in variables.ts:
quarterCircleAngle: {
    defaultValue: '',
    type: 'text',
    label: 'Quarter Circle Angle',
    placeholder: '???',
    correctAnswer: '90',
    color: '#3B82F6',
},
```

**Cloze input variable fields:** `correctAnswer`, `placeholder`, `color`, `bgColor`, `caseSensitive`

### InlineClozeChoice

Dropdown choice bound to a global variable. The variable store holds the **student's selected option**; the `correctAnswer` and `options` stay as props.

```tsx
// CORRECT — uses centralized variable definition
<InlineClozeChoice
    id="choice-shape"
    varName="shapeAnswer"
    correctAnswer="circle"
    options={["cube", "circle", "square", "triangle"]}
    {...choicePropsFromDefinition(getVariableInfo('shapeAnswer'))}
/>

// Variable definition in variables.ts:
shapeAnswer: {
    defaultValue: '',
    type: 'select',
    label: 'Shape Answer',
    placeholder: '???',
    correctAnswer: 'circle',
    options: ['cube', 'circle', 'square', 'triangle'],
    color: '#D81B60',
},
```

**Cloze choice variable fields:** `correctAnswer`, `options`, `placeholder`, `color`, `bgColor`

### InlineToggle

Click to cycle through options, bound to a global variable. Unlike cloze components, toggles have no `correctAnswer` — they are for exploration, not validation.

```tsx
// CORRECT — uses centralized variable definition
<InlineToggle
    id="toggle-shape"
    varName="currentShape"
    options={["triangle", "square", "pentagon", "hexagon"]}
    {...togglePropsFromDefinition(getVariableInfo('currentShape'))}
/>

// Variable definition in variables.ts:
currentShape: {
    defaultValue: 'triangle',
    type: 'select',
    label: 'Current Shape',
    options: ['triangle', 'square', 'pentagon', 'hexagon'],
    color: '#D946EF',
},
```

**Toggle variable fields:** `options`, `color`, `bgColor`

### InlineTooltip

Shows a tooltip/definition on hover. Unlike other inline components, `InlineTooltip` does **not** use the variable store — tooltips are purely informational with no mutable state. No variable definition needed.

```tsx
<InlineTooltip id="tooltip-circle" tooltip="A shape where all points are equidistant from the center.">
    circle
</InlineTooltip>
```

| Prop | Type | Default | Purpose |
|------|------|---------|---------|
| `id` | `string` | *(auto-generated)* | Unique identifier for this component instance |
| `children` | `ReactNode` | *(required)* | The trigger text displayed inline |
| `tooltip` | `string` | *(required)* | Tooltip content shown on hover |
| `color` | `string` | `#F59E0B` | Text color (amber) |
| `bgColor` | `string` | `rgba(245, 158, 11, 0.15)` | Background color on hover |
| `position` | `string` | `'auto'` | `'auto'`, `'top'`, `'bottom'` |
| `maxWidth` | `number` | `400` | Maximum tooltip width in pixels |

### InlineTrigger

Clickable inline text that **sets a global variable to a specific value** on click. Belongs to the connective category (emerald `#10B981`). Unlike other inline components, `InlineTrigger` does not need its own variable definition — it *writes* to a variable defined for another component (like a scrubble number).

```tsx
<InlineTrigger id="trigger-reset" varName="amplitude" value={1} icon="refresh">
    reset it to 1
</InlineTrigger>

<InlineTrigger id="trigger-max" varName="amplitude" value={5} icon="zap">
    max it out
</InlineTrigger>
```

| Prop | Type | Default | Purpose |
|------|------|---------|---------|
| `id` | `string` | *(auto-generated)* | Unique identifier for this component instance |
| `children` | `ReactNode` | *(required)* | Clickable text displayed inline |
| `varName` | `string` | `undefined` | Variable to set on click |
| `value` | `string \| number \| boolean` | `undefined` | Value to set the variable to |
| `color` | `string` | `#10B981` | Text color (emerald) |
| `bgColor` | `string` | `rgba(16, 185, 129, 0.15)` | Background color on hover |
| `icon` | `string` | `undefined` | `'play'`, `'refresh'`, `'zap'`, `'none'` |
| `onTrigger` | `() => void` | `undefined` | Optional callback after click |

### InlineHyperlink

Clickable inline text that either **opens an external URL** in a new tab or **smooth-scrolls to a block** on the page. Belongs to the connective category (emerald `#10B981`). Does **not** use the variable store — purely navigational.

```tsx
<InlineHyperlink id="link-wiki" href="https://en.wikipedia.org/wiki/Circle">
    Wikipedia article on circles
</InlineHyperlink>

<InlineHyperlink id="link-jump" targetBlockId="block-intro">
    jump to the intro
</InlineHyperlink>
```

| Prop | Type | Default | Purpose |
|------|------|---------|---------|
| `id` | `string` | *(auto-generated)* | Unique identifier for this component instance |
| `children` | `ReactNode` | *(required)* | Clickable text displayed inline |
| `href` | `string` | `undefined` | External URL — opens in new tab |
| `targetBlockId` | `string` | `undefined` | Block ID to scroll to on page |
| `color` | `string` | `#10B981` | Text color (emerald) |
| `bgColor` | `string` | `rgba(16, 185, 129, 0.15)` | Background color on hover |

**Click behavior:** `href` → opens new tab; `targetBlockId` → smooth scrolls to block; both set → `href` takes priority.

### InlineFormula

Inline KaTeX math formula rendered directly within paragraph text. Supports colored terms via `\clr{name}{content}` syntax, which maps term names to colors through the `colorMap` prop. Like `InlineTooltip`, it does **not** use the variable store — purely for display.

```tsx
// Basic formula
<InlineFormula
    id="formula-area"
    latex="A = \pi r^2"
/>

// With colored terms
<InlineFormula
    id="formula-circle-area"
    latex="\clr{area}{A} = \clr{pi}{\pi} \clr{radius}{r}^2"
    colorMap={{ area: '#ef4444', pi: '#3b82f6', radius: '#3cc499' }}
/>

// Inside a paragraph
<EditableParagraph id="para-math" blockId="block-math">
    Einstein's famous equation{" "}
    <InlineFormula
        id="formula-einstein"
        latex="\clr{energy}{E} = \clr{mass}{m}\clr{speed}{c}^2"
        colorMap={{ energy: '#f97316', mass: '#a855f7', speed: '#06b6d4' }}
    />
    {" "}shows the equivalence of mass and energy.
</EditableParagraph>
```

| Prop | Type | Default | Purpose |
|------|------|---------|---------|
| `id` | `string` | *(auto-generated)* | Unique identifier for this formula instance |
| `latex` | `string` | *(required)* | LaTeX formula string |
| `colorMap` | `Record<string, string>` | `{}` | Term name → hex color mapping for `\clr{name}{content}` syntax |
| `color` | `string` | `#8B5CF6` | Wrapper accent color (violet) |

**Colored terms:** Use `\clr{termName}{content}` in the LaTeX string, then provide `colorMap={{ termName: '#hexcolor' }}`. Each term gets its own color in the rendered formula.

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

## Linking Variables to Visual Components

The most powerful pattern connects inline controls (`InlineScrubbleNumber`, `InlineTrigger`) to visual components so that interacting with text instantly updates graphics.

### Reactive Visual Wrapper Pattern

Create a small React component that reads from the store with `useVar` and passes the values as props to a visual:

```tsx
import { useVar, useSetVar } from '@/stores';
import { ThreeCanvas, RotatingCube } from "@/components/atoms";

function ReactiveCube() {
    const size = useVar('cubeSize', 1.5) as number;
    const speed = useVar('cubeSpeed', 1) as number;

    return (
        <ThreeCanvas height={320}>
            <RotatingCube size={size} speed={speed} color="#4F46E5" />
        </ThreeCanvas>
    );
}
```

Then use it inside a `SplitLayout` paired with scrubble numbers and triggers:

```tsx
<SplitLayout key="layout-cube" ratio="1:1" gap="lg">
    <Block id="block-cube-text" padding="sm">
        <EditableParagraph id="para-cube" blockId="block-cube-text">
            The cube size is{" "}
            <InlineScrubbleNumber
                varName="cubeSize"
                {...numberPropsFromDefinition(getVariableInfo('cubeSize'))}
            />
            . You can{" "}
            <InlineTrigger varName="cubeSize" value={0.5}>make it tiny</InlineTrigger>{" "}
            or{" "}
            <InlineTrigger varName="cubeSize" value={3} icon="zap">make it huge</InlineTrigger>.
        </EditableParagraph>
    </Block>
    <Block id="block-cube-viz" padding="sm">
        <ReactiveCube />
    </Block>
</SplitLayout>
```

### Bidirectional Control (Mafs)

`MafsInteractive` supports bidirectional linking — scrubble numbers update the graph, and dragging graph points updates the scrubble numbers:

```tsx
function ReactiveSineWave() {
    const amp = useVar('amplitude', 1) as number;
    const freq = useVar('frequency', 1) as number;
    const setVar = useSetVar();

    return (
        <MafsInteractive
            amplitude={amp}
            frequency={freq}
            onAmplitudeChange={(v) => setVar('amplitude', v)}
            onFrequencyChange={(v) => setVar('frequency', v)}
        />
    );
}
```

### Important: Wrappers Go Inside Blocks

Reactive wrappers are **inner** components used inside a `<Block>`, not top-level block wrappers. The flat array rule still applies — each `<Layout>` in the exported array is a separate manageable block.

### Controllable Props Reference

| Component | Controllable Props | Best Paired With |
|-----------|-------------------|-----------------|
| `RotatingCube` | `size`, `speed`, `color` | `InlineScrubbleNumber` + `InlineTrigger` |
| `MafsInteractive` | `amplitude`, `frequency` | `InlineScrubbleNumber` (bidirectional) |
| `AnimatedGraph` | `speed` | `InlineScrubbleNumber` |
| `D3BarChart` | `data` | Computed from variables |
| `DesmosGraph` | `expressions` | Dynamic LaTeX strings |
| SVG elements | any attribute | `useVar` for reactive rendering |

---

## Imports

Use barrel imports for agent-facing components:

```tsx
// Text & inline components
import {
    EditableH1, EditableH2, EditableH3, EditableParagraph,
    InlineScrubbleNumber, InlineClozeInput, InlineClozeChoice,
    InlineToggle, InlineTooltip, InlineTrigger, InlineHyperlink,
    InlineFormula, InlineSpotColor,
} from "@/components/atoms";

// Math / equation components
import { Equation } from "@/components/atoms";
import { MathBlock, InteractiveEquation } from "@/components/molecules";

// Visual components (import only what you need)
import {
    AnimatedGraph, CoordinateSystem,                          // Two.js
    MafsBasic, MafsAnimated, MafsInteractive,                 // Mafs
    ThreeCanvas, RotatingCube, PulsingSphere,                  // Three.js
    ThreeCoordinateSystem, GeometricCollection, AtomicStructure,
    D3BarChart,                                                // D3
    FlowDiagram, ExpandableFlowDiagram,                        // React Flow
} from "@/components/atoms";
import type { FlowNode, FlowEdge } from "@/components/atoms";

// External graph tools
import { DesmosGraph, GeoGebraGraph } from "@/components/organisms";

// Layouts & templates
import { Block } from "@/components/templates";
import { FullWidthLayout, SplitLayout, GridLayout, SidebarLayout, Sidebar, Main } from "@/components/layouts";

// Global variable store (for reactive visual wrappers)
import { useVar, useSetVar } from "@/stores";

// Variable definitions & helpers
import {
    getVariableInfo, numberPropsFromDefinition,
    clozePropsFromDefinition, choicePropsFromDefinition, togglePropsFromDefinition,
} from "./variables";

// Annotations
import { Glossary } from "@/components/annotations";
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
