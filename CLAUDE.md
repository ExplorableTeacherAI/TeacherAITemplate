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

The variable store holds the **student's typed answer** (text string). The `correctAnswer` stays as a prop configured via the editor modal.

## Critical Rule: InlineClozeChoice (Dropdown Fill-in-the-Blank)

**NEVER pass inline props directly to `InlineClozeChoice`.** Always define the variable in the central variables file first, then reference it — same pattern as `InlineClozeInput`.

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

### Key Cloze Choice Variable Fields

| Field | Purpose |
|-------|---------|
| `correctAnswer` | The expected answer string (must be one of the options) |
| `options` | Array of choices to display in the dropdown |
| `placeholder` | Button text shown before student selects (default: `"???"`) |
| `color` | Text/border color |
| `bgColor` | Background color (supports RGBA) |

The variable store holds the **student's selected option** (text string). The `correctAnswer` and `options` stay as props configured via the editor modal.

## Critical Rule: InlineToggle (Click to Cycle)

**NEVER pass inline props directly to `InlineToggle`.** Always define the variable in the central variables file first, then reference it — same pattern as `InlineClozeChoice`.

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

### Key Toggle Variable Fields

| Field | Purpose |
|-------|---------|
| `options` | Array of strings to cycle through (at least 2) |
| `color` | Text/border color (default: `#D946EF` fuchsia) |
| `bgColor` | Background color (supports RGBA) |

The variable store holds the **currently selected option** (text string). Unlike cloze components, toggles have no `correctAnswer` — they are for exploration, not validation.

## InlineTooltip (Hover Tooltip)

`InlineTooltip` shows a tooltip/definition on hover. Unlike other inline components, it does **NOT** use the variable store — tooltips are purely informational with no mutable state. No `varName` prop needed.

### Usage

```tsx
import { InlineTooltip } from "@/components/atoms";

<EditableParagraph id="para-example" blockId="block-example">
    Every point on a{" "}
    <InlineTooltip tooltip="A shape where all points are equidistant from the center.">
        circle
    </InlineTooltip>{" "}
    has the same distance from its center.
</EditableParagraph>
```

### InlineTooltip Props

| Prop | Type | Default | Purpose |
|------|------|---------|---------|
| `children` | `ReactNode` | *(required)* | The trigger text displayed inline |
| `tooltip` | `string` | *(required)* | The tooltip content shown on hover |
| `color` | `string` | `#F59E0B` | Text color (amber) |
| `bgColor` | `string` | `rgba(245, 158, 11, 0.15)` | Background color on hover |
| `position` | `string` | `'auto'` | Tooltip position: `'auto'`, `'top'`, `'bottom'` |
| `maxWidth` | `number` | `400` | Maximum tooltip width in pixels |

## InlineFormula (Inline Math)

`InlineFormula` renders a KaTeX math formula inline within paragraph text, with optional colored variables using `\clr{name}{content}` syntax. It does **NOT** use the variable store.

### Usage

```tsx
import { InlineFormula } from "@/components/atoms";

<EditableParagraph id="para-example" blockId="block-example">
    The area of a circle is{" "}
    <InlineFormula
        latex="\clr{area}{A} = \clr{pi}{\pi} \clr{radius}{r}^2"
        colorMap={{ area: '#ef4444', pi: '#3b82f6', radius: '#3cc499' }}
    />{" "}
    where r is the radius.
</EditableParagraph>
```

### InlineFormula Props

| Prop | Type | Default | Purpose |
|------|------|---------|---------|
| `latex` | `string` | *(required)* | LaTeX formula string |
| `colorMap` | `Record<string, string>` | `{}` | Term name → hex color mapping for `\clr{}{}` |
| `color` | `string` | `#8B5CF6` | Wrapper accent color (violet) |

## InlineTrigger (Click to Set Variable)

`InlineTrigger` is a clickable inline element that **sets a global variable to a specific value** on click. It belongs to the connective category (emerald `#10B981`) and integrates with the variable store.

### Usage

```tsx
import { InlineTrigger } from "@/components/atoms";

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

### InlineTrigger Props

| Prop | Type | Default | Purpose |
|------|------|---------|---------|
| `children` | `ReactNode` | *(required)* | The clickable text displayed inline |
| `varName` | `string` | `undefined` | Variable to set on click |
| `value` | `string \| number \| boolean` | `undefined` | Value to set the variable to |
| `color` | `string` | `#10B981` | Text color (emerald) |
| `bgColor` | `string` | `rgba(16, 185, 129, 0.15)` | Background color on hover |
| `icon` | `string` | `undefined` | Icon after text: `'play'`, `'refresh'`, `'zap'`, `'none'` |
| `onTrigger` | `() => void` | `undefined` | Optional callback after click (not serializable) |

**Note:** Unlike `InlineScrubbleNumber`, `InlineTrigger` does not need a variable definition in `variables.ts` — it only *writes* to the store, it does not read from it. The `varName` should reference a variable already defined for another component (like a scrubble number) that you want to reset or set.

## InlineHyperlink (Click to Navigate)

`InlineHyperlink` is a clickable inline element that either **opens an external URL** in a new tab or **smooth-scrolls to a block** on the page. It belongs to the connective category (emerald `#10B981`) and does **NOT** use the variable store.

### Usage

```tsx
import { InlineHyperlink } from "@/components/atoms";

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

### InlineHyperlink Props

| Prop | Type | Default | Purpose |
|------|------|---------|---------|
| `children` | `ReactNode` | *(required)* | The clickable text displayed inline |
| `href` | `string` | `undefined` | External URL — opens in new tab (`noopener,noreferrer`) |
| `targetBlockId` | `string` | `undefined` | Block ID to scroll to on page (smooth scroll) |
| `color` | `string` | `#10B981` | Text color (emerald) |
| `bgColor` | `string` | `rgba(16, 185, 129, 0.15)` | Background color on hover |

**Click behavior:**
- `href` set → opens URL in new tab
- `targetBlockId` set → smooth scrolls to the target block
- Both set → `href` takes priority

**Note:** `InlineHyperlink` does not use the variable store — it is purely navigational. No `varName` prop needed.

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
<FullWidthLayout key="layout-unique-key" maxWidth="xl">
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
</FullWidthLayout>
```

### ID Conventions
- Layout keys: `layout-<descriptive-name>` (e.g., `layout-paragraph-04`)
- Block IDs: `block-<descriptive-name>` (e.g., `block-paragraph-04`)
- Element IDs: `<type>-<descriptive-name>` (e.g., `para-radius-example`, `h1-main-title`)
- Pass `blockId` prop to editable components matching the parent Block's `id`

## Available Layouts

- `FullWidthLayout` — single column, use `maxWidth` prop (`sm`, `md`, `lg`, `xl`, `2xl`, `full`)
- `SplitLayout` — side-by-side, use `ratio` (`1:1`, `1:2`, `2:1`) and `gap`
- `GridLayout` — grid of items, use `columns` and `gap`
- `SidebarLayout` — main + sidebar, use `<Sidebar>` and `<Main>` children

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

### Math Components

- `Equation`, `ColoredEquation` — math equations (block-level)
- `InlineFormula` — inline math formula with colored variables (no variable store)

### Required Props for All Text Components

Every `EditableParagraph` and `EditableH1/H2/H3` MUST have:
- A unique `id` prop (e.g., `id="para-intro"`)
- A `blockId` prop matching the parent `Block`'s `id` (e.g., `blockId="block-intro"`)

```tsx
// WRONG — plain HTML tags, missing id and blockId
<p>Content here</p>
<h2 className="text-2xl font-bold">Section Title</h2>

// CORRECT — Editable components with required id and blockId
<EditableParagraph id="para-intro" blockId="block-intro">
    Content here
</EditableParagraph>
<EditableH2 id="h2-section-title" blockId="block-section">
    Section Title
</EditableH2>
```

## Critical Rule: Section Structure (Flat Block Arrays)

Sections MUST export a **flat array of `Layout > Block` elements** — NEVER a wrapper component.

The block management system (add, delete, reorder) only works when each block is a separate top-level element in the array. Wrapping blocks inside a component makes them invisible to the block manager.

```tsx
// WRONG — wrapper component hides blocks from the block manager
export const MySection = () => (
    <>
        <FullWidthLayout key="section-title" maxWidth="xl">
            <Block id="section-title" padding="md">...</Block>
        </FullWidthLayout>
        <FullWidthLayout key="section-content" maxWidth="xl">
            <Block id="section-content" padding="sm">...</Block>
        </FullWidthLayout>
    </>
);
export const mySectionBlocks = [<MySection key="my-section" />];

// CORRECT — flat array of individual block elements
export const mySectionBlocks: ReactElement[] = [
    <FullWidthLayout key="layout-section-title" maxWidth="xl">
        <Block id="block-section-title" padding="md">
            <EditableH1 id="h1-section-title" blockId="block-section-title">
                Section Title
            </EditableH1>
        </Block>
    </FullWidthLayout>,

    <FullWidthLayout key="layout-section-content" maxWidth="xl">
        <Block id="block-section-content" padding="sm">
            <EditableParagraph id="para-section-content" blockId="block-section-content">
                Content here...
            </EditableParagraph>
        </Block>
    </FullWidthLayout>,
];
```

### Why Flat Arrays?
- Each element in the array = one manageable block
- Teachers can add blocks between any two elements
- Teachers can delete or reorder individual blocks
- The block toolbar (add/delete/drag) appears on each block

### Section File Template

```tsx
// src/data/sections/MySection.tsx
import { type ReactElement } from "react";
import { Block } from "@/components/templates";
import { FullWidthLayout } from "@/components/layouts";
import { EditableH1, EditableH2, EditableParagraph, InlineScrubbleNumber, InlineClozeInput, InlineClozeChoice, InlineToggle, InlineTooltip } from "@/components/atoms";
import { getVariableInfo, numberPropsFromDefinition, clozePropsFromDefinition, togglePropsFromDefinition } from "../variables";

export const mySectionBlocks: ReactElement[] = [
    <FullWidthLayout key="layout-my-title" maxWidth="xl">
        <Block id="block-my-title" padding="md">
            <EditableH1 id="h1-my-title" blockId="block-my-title">
                My Section Title
            </EditableH1>
        </Block>
    </FullWidthLayout>,

    <FullWidthLayout key="layout-my-intro" maxWidth="xl">
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
    </FullWidthLayout>,
];
```

Then in `blocks.tsx`:
```tsx
import { mySectionBlocks } from "./sections/MySection";

export const blocks: ReactElement[] = [
    ...mySectionBlocks,
];
```

## Environment Variables

| Variable | Values | Purpose |
|----------|--------|---------|
| `VITE_APP_MODE` | `editor` / `preview` | Editor enables editing UI; preview is read-only |
| `VITE_SHOW_EXAMPLES` | `true` / `false` | Load example blocks+variables instead of lesson content |
