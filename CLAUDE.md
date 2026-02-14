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

## Variable Types

| Type | Example Definition |
|------|--------------------|
| `number` | `{ defaultValue: 5, type: 'number', min: 0, max: 10, step: 1 }` |
| `text` | `{ defaultValue: 'Hello', type: 'text', placeholder: 'Enter...' }` |
| `select` | `{ defaultValue: 'sine', type: 'select', options: ['sine', 'cosine'] }` |
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
- `InlineDropdown` — inline dropdown
- `InlineTextInput` — inline text input

### Math Components

- `Equation`, `InteractiveEquation`, `ColoredEquation` — math equations

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
import { EditableH1, EditableH2, EditableParagraph, InlineScrubbleNumber } from "@/components/atoms";
import { getVariableInfo, numberPropsFromDefinition } from "../variables";

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
