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

## Available Editable Components

- `EditableH1`, `EditableH2`, `EditableH3` — headings
- `EditableParagraph` — body text (supports inline components)
- `InlineScrubbleNumber` — draggable inline number bound to global variable
- `InlineDropdown` — inline dropdown
- `InlineTextInput` — inline text input
- `Equation`, `InteractiveEquation`, `ColoredEquation` — math equations

## Critical Rule: Use Editable Components for All Content

**ALWAYS use `EditableParagraph` for paragraph text — NEVER use `InteractiveParagraph`, plain `<p>`, or other non-editable wrappers.**

The visual editor allows teachers to directly edit text, headings, and inline interactive components in the rendered page. This only works when editable components are used:

| Instead of | ALWAYS use |
|------------|------------|
| `<p>`, `InteractiveParagraph` | `EditableParagraph` |
| `<h1>`, `<h2>`, `<h3>` | `EditableH1`, `EditableH2`, `EditableH3` |

Every `EditableParagraph` and heading MUST have:
- A unique `id` prop (e.g., `id="para-intro"`)
- A `blockId` prop matching the parent `Block`'s `id` (e.g., `blockId="block-intro"`)

```tsx
// WRONG — InteractiveParagraph is NOT editable by the visual editor
<InteractiveParagraph>
    Content with <InlineScrubbleNumber varName="x" ... />
</InteractiveParagraph>

// CORRECT — EditableParagraph enables text editing in the visual editor
<EditableParagraph id="para-intro" blockId="block-intro">
    Content with <InlineScrubbleNumber varName="x" ... />
</EditableParagraph>
```

## Environment Variables

| Variable | Values | Purpose |
|----------|--------|---------|
| `VITE_APP_MODE` | `editor` / `preview` | Editor enables editing UI; preview is read-only |
| `VITE_SHOW_EXAMPLES` | `true` / `false` | Load example blocks+variables instead of lesson content |
