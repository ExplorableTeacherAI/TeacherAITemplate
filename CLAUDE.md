# CLAUDE.md — Agent Instructions

## Project Overview

Interactive explorable-explanation template built with React + TypeScript + Vite.
Content is organized as **blocks** inside **layouts**, with shared state via a **global variable store** (Zustand).

---

## CRITICAL: EVERY VISUALIZATION MUST BE INTERACTIVE

**This is an explorable explanation platform — NOT a textbook.** Static diagrams defeat the entire purpose. Every visualization MUST allow student manipulation.

### The Non-Negotiable Interactivity Rules

| Rule | Description | Bad Example | Good Example |
|:---|:---|:---|:---|
| **1. No static charts** | Every chart/graph must have at least one manipulable element | `<Cartesian2D plots={[...]} />` with no movable points | `<Cartesian2D ... movablePoints={[...]} />` with bound variables |
| **2. Bi-directional binding** | Prose ↔ Formula ↔ Visual must ALL sync via shared variables | Scrubbing text doesn't update the chart | `varName="radius"` used in `InlineScrubbleNumber`, `FormulaBlock \scrub{}`, AND `Cartesian2D` |
| **3. Linked highlights** | Hovering prose terms highlights visual elements and vice versa | No visual connection between explanation and diagram | `InlineLinkedHighlight` connects "radius" text to the radius line in the diagram |
| **4. Observable change** | When user manipulates, they see real-time consequences | User drags a point but nothing else changes | Dragging the radius updates the area value in both formula and prose |

### Before Creating Any Visualization, Ask:

1. **What can the student drag, scrub, or click?** ← If nothing, STOP and redesign
2. **What changes when they interact?** ← At least one derived value must update
3. **Is the same variable used in prose, formula, AND visual?** ← If not, connect them
4. **Can hovering prose highlight the visual element?** ← Add `InlineLinkedHighlight` if not

### Quick Interactivity Checklist

- [ ] `Cartesian2D` has `movablePoints` OR is bound to `InlineScrubbleNumber` variables
- [ ] `DataVisualization` has interactive data series OR brush selection
- [ ] `FormulaBlock` uses `\scrub{}` for key variables
- [ ] Prose uses `InlineScrubbleNumber` for the SAME variables as the visual
- [ ] At least one `InlineLinkedHighlight` connects prose to visual elements
- [ ] Derived values (area, sum, etc.) display via `readonly` scrubble numbers
- [ ] **Every visualization with actual in-viz interactivity has an `InteractionHintSequence`** — but NEVER add hints if the visualization isn't truly interactive

### Visualization Validation Checklist (Do this for EVERY visualization)

Before considering a visualization complete, walk through these checks:

**A. Prose-Visual Alignment:**
- [ ] Every element mentioned in prose (point, line, shape, label) EXISTS in the visualization
- [ ] Colors in prose MATCH the visualization ("the red point" → there IS a red point)
- [ ] Positions in prose MATCH the visualization ("at the top" → element IS at the top)
- [ ] Interactive elements described in prose ARE actually interactive

**B. Mathematical Accuracy:**
- [ ] Visualization correctly represents the math concept (radius goes center→edge, area formula correct)
- [ ] Scale and proportions are reasonable (radius 3 looks 3× larger than radius 1)
- [ ] Labels show correct values with correct units
- [ ] Derived values (area, sum) update correctly when inputs change

**C. Visual Clarity:**
- [ ] All text/labels are readable (not too small, not overlapping, not cut off)
- [ ] Colors have sufficient contrast against white background
- [ ] Interactive elements are visually distinct from static elements
- [ ] No visual clutter — elements don't compete for attention

**D. Interactivity Works:**
- [ ] Every described interaction WORKS when tried
- [ ] Feedback is immediate — visual response on interaction
- [ ] Bounds are reasonable — can't drag off-screen or to invalid values
- [ ] Interactions don't break the visualization (no NaN, no glitches)

**E. Hint Accuracy (if InteractionHintSequence present):**
- [ ] Hint describes an element that EXISTS
- [ ] Hint describes IN-VISUALIZATION interaction (NOT "drag the number below")
- [ ] Hint position matches where the element actually is
- [ ] Hint gesture matches the interaction type

### Use Soft, Muted Colors Only

**Never use saturated primaries like `#FF0000`, `#00FF00`, `#0000FF`.** Always use the recommended palette:

| Purpose | Color | Hex |
|:---|:---|:---|
| Primary variables | Soft Teal | `#62D0AD` |
| Secondary variables | Soft Indigo | `#8E90F5` |
| Highlights/Attention | Warm Amber | `#F7B23B` |
| Tertiary variables | Soft Violet | `#AC8BF9` |
| Emphasis | Soft Rose | `#F8A0CD` |
| Alternative primary | Soft Sky | `#62CCF9` |
| Warmth | Soft Coral | `#F4A89A` |
| Natural concepts | Soft Sage | `#A8D5A2` |
| Gentle highlights | Soft Peach | `#FFCBA4` |
| Fresh/Clean | Soft Mint | `#7DD3C0` |
| Subtle emphasis | Soft Lavender | `#C9B8E8` |
| Success/Correct | Soft Green | `#22c55e` |
| Error (use sparingly) | Soft Red | `#ef4444` |

**For backgrounds:** Use RGBA with 15% opacity (e.g., `rgba(98, 208, 173, 0.15)` for teal highlight).

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
| `src/data/exampleBlocks.tsx` | **Reference only** — shows how to use every layout, component, and pattern. Copy patterns into `blocks.tsx`. |
| `src/data/exampleVariables.ts` | **Reference only** — shows how to define every variable type. Copy structure into `variables.ts`. |
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
    numberPropsFromDefinition,
    clozePropsFromDefinition,
    choicePropsFromDefinition,
    togglePropsFromDefinition,
    spotColorPropsFromDefinition,
    linkedHighlightPropsFromDefinition,
} from "./variables";
useVariableStore.getState().initialize(getDefaultValues());
initializeVariableColors(variableDefinitions);
```

---

## Helper Functions Quick Reference

| Component | Helper Function | Variable Type |
|-----------|----------------|---------------|
| `InlineScrubbleNumber` | `numberPropsFromDefinition(getVariableInfo('varName'))` | `number` |
| `InlineClozeInput` | `clozePropsFromDefinition(getVariableInfo('varName'))` | `text` |
| `InlineClozeChoice` | `choicePropsFromDefinition(getVariableInfo('varName'))` | `select` |
| `InlineToggle` | `togglePropsFromDefinition(getVariableInfo('varName'))` | `select` |
| `InlineSpotColor` | `spotColorPropsFromDefinition(getVariableInfo('varName'))` | any (uses `color`) |
| `InlineLinkedHighlight` | `linkedHighlightPropsFromDefinition(getVariableInfo('varName'))` | any (uses `color`, `bgColor`) |

**Usage pattern:**

```tsx
<ComponentName
    varName="myVar"
    {...helperFunction(getVariableInfo('myVar'))}
/>
```

---

## Critical Rule: Global Variables

**NEVER pass inline numeric props to any interactive component (eg., `InlineScrubbleNumber`).** Always define variables in the central variables file first, then reference them. This way we can reuse the variables in any place easily. 

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
// Reactive text component returning different strings based on the toggle value
function ReactiveToggleShapeText() {
    const shape = useVar('currentShape', 'triangle') as string;
    if (shape === 'square') return <span>has 4 equal sides and interior angles of 90°</span>;
    if (shape === 'pentagon') return <span>has 5 equal sides and interior angles of 108°</span>;
    if (shape === 'hexagon') return <span>has 6 equal sides and interior angles of 120°</span>;
    return <span>has 3 equal sides and interior angles of 60°</span>;
}

<EditableParagraph id="para-toggle-shapes" blockId="paragraph-toggle-shapes">
    By changing the number of sides, we can define different regular polygons. For example, a regular{" "}
    <InlineToggle
        id="toggle-current-shape"
        varName="currentShape"
        options={["triangle", "square", "pentagon", "hexagon"]}
        {...togglePropsFromDefinition(getVariableInfo('currentShape'))}
    />
    {" "}<ReactiveToggleShapeText />. Click the shape name to cycle through other options and see its properties change.
</EditableParagraph>
```

## InlineTooltip (Hover Tooltip)

`InlineTooltip` shows a tooltip/definition on hover. Does **NOT** use the variable store — purely informational. No `varName` prop needed.

```tsx
<EditableParagraph id="para-tooltip-circle" blockId="paragraph-tooltip-circle">
    In geometry, measuring a{" "}
    <InlineTooltip id="tooltip-circle-def" tooltip="A perfect 2D shape where every point on the boundary is identically distanced from the center.">
        circle
    </InlineTooltip>
    {" "}requires understanding its core properties. The most fundamental of these is the{" "}
    <InlineTooltip id="tooltip-radius-def" tooltip="The straight-line distance from the exact center of a circle to any point on its boundary.">
        radius
    </InlineTooltip>
    , which acts as the building block for all other circular formulas.
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
<EditableParagraph id="para-formula-area" blockId="formula-circle-area">
    For example, the total 2D space encapsulated by a boundary is measured as the{" "}
    <InlineFormula
        latex="\clr{area}{A} = \clr{pi}{\pi} \clr{radius}{r}^2"
        colorMap={{ area: '#ef4444', pi: '#3b82f6', radius: '#3cc499' }}
    />
    . Here, the term <InlineFormula latex="\clr{radius}{r}" colorMap={{radius: '#3cc499'}} /> explicitly represents the radius.
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

## InlineTrigger (Click to Snap Value)

`InlineTrigger` is a clickable inline element that **snaps a global variable to a specific value** on click. Belongs to the connective category (emerald `#10B981`).

```tsx
<EditableParagraph id="para-trigger-example" blockId="trigger-example">
    Try dragging the simulation speed to a custom value:{" "}
    <InlineScrubbleNumber varName="speed" ... />.
    Once you lose track of the original pace, you can easily{" "}
    <InlineTrigger varName="speed" value={1} icon="refresh">
        restore the default speed
    </InlineTrigger>{" "}
    or instantly{" "}
    <InlineTrigger varName="speed" value={5} icon="zap">
        maximize the velocity
    </InlineTrigger>{" "}
    with a single click.
</EditableParagraph>
```

| Prop | Type | Default | Purpose |
|------|------|---------|---------|
| `children` | `ReactNode` | *(required)* | The clickable text displayed inline |
| `varName` | `string` | `undefined` | Variable to snap on click |
| `value` | `string \| number \| boolean` | `undefined` | Value to snap the variable to |
| `color` | `string` | `#10B981` | Text color (emerald) |
| `bgColor` | `string` | `rgba(16, 185, 129, 0.15)` | Background color on hover |
| `icon` | `string` | `undefined` | Icon after text: `'play'`, `'refresh'`, `'zap'`, `'none'` |
| `onTrigger` | `() => void` | `undefined` | Optional callback after click (not serializable) |

**Note:** `InlineTrigger` does not need a variable definition in `variables.ts` — it only *writes* to the store. The `varName` should reference a variable already defined for another component.

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

## Inline Interaction Hints (`showHint` prop)

All interactive inline components (`InlineScrubbleNumber`, `InlineToggle`, `InlineTrigger`, `InlineHyperlink`, `InlineClozeInput`, `InlineClozeChoice`, `InlineLinkedHighlight`, `InlineTooltip`) support a **`showHint`** prop that displays an animated gesture icon below the component to teach students how to interact with it.

**FormulaBlock** also supports interaction hints for all its interactive elements (`\scrub{}`, `\highlight{}`, `\cloze{}`, and `\choice{}`). Hints appear below **each** interactive element in the formula — not just one. Each hint auto-dismisses when the user interacts with the corresponding element (drag a scrubble, hover a highlight, focus a cloze input, or click a choice).

Hints are automatically managed:
- Only the **first instance** of each component type on the page shows a hint
- The hint **auto-dismisses** when the user interacts with the component
- Dismissal is remembered in **sessionStorage** for the session

**Props:**

| Prop | Type | Default | Purpose |
|------|------|---------|--------|
| `showHint` | `boolean` | `true` | Enable/disable the interaction hint for this component |

**Usage — Disable hints for navigation components:**

```tsx
// Table of contents links — hints disabled
<InlineHyperlink id="link-toc-intro" showHint={false} targetBlockId="heading-intro">Introduction</InlineHyperlink>
<InlineHyperlink id="link-toc-circles" showHint={false} targetBlockId="heading-circles">Circles</InlineHyperlink>

// Content links — hints enabled (default)
<InlineHyperlink id="link-wikipedia" href="https://en.wikipedia.org/wiki/Circle">Wikipedia article</InlineHyperlink>

// FormulaBlock — hints enabled by default
<FormulaBlock 
    latex="\\scrub{mass} \\times \\scrub{acceleration}"
    showHint={true}  // default
/>
```

**When to disable hints:**
- Table of contents / navigation links (use `showHint={false}`)
- Repeated instances of the same component type
- When hints would be redundant or distracting

**For building custom components** — use the `useComponentHint` hook and `HintIcon` component:

```tsx
import { useComponentHint, HintIcon } from './InlineInteractionHint';

function MyInlineComponent({ showHint = true }) {
    const { hintVisible, dismissHint } = useComponentHint('my-component-type', { enabled: showHint });

    const handleClick = () => {
        dismissHint(); // Dismiss hint on interaction
        // ... rest of handler
    };

    return (
        <span onClick={handleClick}>
            Content
            <HintIcon type="my-component-type" visible={hintVisible} isEditing={false} />
        </span>
    );
}
```

## InlineSpotColor (Color-Coded Variables)

`InlineSpotColor` highlights a word with the exact same color defined for a variable. When that identical variable appears in a mathematical formula, the colors align completely — establishing a powerful, subconscious visual link between prose and math.

```tsx
<EditableParagraph id="para-spotcolor" blockId="spotcolor">
    For instance, by multiplying the{" "}
    <InlineSpotColor varName="base" color="#a855f7">
        base
    </InlineSpotColor>
    {" "}of a triangle by its perpendicular{" "}
    <InlineSpotColor varName="height" color="#f97316">
        height
    </InlineSpotColor>
    , you can easily compute its total geometric area:{" "}
    <InlineFormula
        latex="Area = \frac{1}{2} \clr{base}{b} \clr{height}{h}"
        colorMap={{ base: '#a855f7', height: '#f97316' }}
    />.
</EditableParagraph>
```

| Prop | Type | Default | Purpose |
|------|------|---------|---------|
| `children` | `ReactNode` | *(required)* | Text content to color |
| `varName` | `string` | *(required)* | Variable key to lookup the color for |
| `color` | `string` | *(required)* | The hex color for this variable (usually via store) |

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

### Critical Rule: Descriptive Phrasing for Interactions

**NEVER use command-style phrasing like "set to", "increase to", or "change to" when referencing inline interactive components.**

Because inline components (e.g., `InlineScrubbleNumber`) display real-time reactive values, instructions like "increase the amplitude to 2" will not make sense since the user has already changed the value to 2.

**Use exploratory, state-based, or descriptive language instead:**
- **WRONG**: "Set the amplitude to 3 to see what happens."
- **CORRECT**: "If the amplitude is 3, what happens?"
- **WRONG**: "Increase the frequency to 5."
- **CORRECT**: "When the frequency is 5, the graph changes in this way..."

For `InlineTrigger`, avoid verbs like "set" or "change". Use verbs like "snap to", "reset", or state the action contextually.

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

### Critical Rule: `InteractionHintSequence` for Interactive Visualizations

**Every interactive visualization MUST include an `InteractionHintSequence` overlay** to show students how to interact with it. The hint displays an animated hand gesture (drag, click, hover, scroll) that auto-dismisses when the user interacts with the visualization and remembers via sessionStorage so students only see it once per session.

**This is NOT optional.** Visualizations without interaction hints are incomplete and fail to guide students on how to explore them.

**CRITICAL: Hints describe IN-VISUALIZATION interactions ONLY — misleading hints are WORSE than no hints.**

Before adding ANY `InteractionHintSequence`, verify ALL of these:

| ✓ | Check | If Fails |
|:---|:---|:---|
| ☐ | Visualization has `movablePoints` or draggable elements INSIDE it | Do NOT add hint — make viz interactive first |
| ☐ | Hint label describes an element that ACTUALLY EXISTS and IS DRAGGABLE | Fix label to match real elements, or remove hint |
| ☐ | Hint describes IN-VISUALIZATION interaction (NOT "drag the number below") | Remove hint — text controls have their own hints |
| ☐ | Hint position is ON or NEAR the interactive element | Fix position to match where element actually is |

**ANTI-PATTERNS — Never do these:**

| ❌ Anti-Pattern | Why It's Wrong | What To Do |
|:---|:---|:---|
| "Drag the number below" | Describes text control outside viz, not in-viz interaction | Remove hint OR add actual movablePoint and fix label |
| Hint on static diagram | No draggable elements — hint is lying | Remove hint, then make viz actually interactive |
| "Drag the point" but no point exists | Visualization doesn't have `movablePoints` | Add `movablePoints` first, then add hint |
| Hint at center when element is at edge | Wrong position — student won't find interaction | Position hint where the actual element is |

**Usage:** Wrap the visualization in a `<div className="relative">` and place `InteractionHintSequence` as a sibling:

```tsx
function MyInteractiveViz() {
    return (
        <div className="relative">
            <Cartesian2D
                movablePoints={[{ initial: [1, 0], color: "#ef4444" }]}
                ...
            />
            <InteractionHintSequence
                hintKey="my-viz-drag"
                steps={[{ gesture: "drag", label: "Drag the red point", position: { x: "65%", y: "35%" } }]}
            />
        </div>
    );
}
```

**For multi-step tutorials** (e.g., line drawing canvas):

```tsx
<InteractionHintSequence
    hintKey="line-drawing-tutorial"
    currentStep={points.length >= 3 ? 3 : points.length}
    steps={[
        { gesture: "click", label: "Click to place a point", position: { x: "45%", y: "45%" } },
        { gesture: "click", label: "Click again to draw a line", position: { x: "55%", y: "35%" } },
        { gesture: "click", label: "Keep clicking to continue", position: { x: "35%", y: "55%" } },
    ]}
/>
```

**Props:**

| Prop | Type | Default | Purpose |
|------|------|---------|---------|
| `hintKey` | `string` | *(required)* | Unique sessionStorage key — use `kebab-case` matching the viz purpose |
| `steps` | `HintStep[]` | *(required)* | Array of hint steps, each with gesture, label, position, and optional color |
| `currentStep` | `number` | auto | Controlled mode: parent tells which step to show |
| `delay` | `number` | `800` | Delay in ms before the hint appears after mount |
| `color` | `string` | `#62D0AD` | Default accent color for the hand icon |
| `alwaysShow` | `boolean` | `false` | Ignores sessionStorage (for demos/documentation) |

**HintStep properties:**

| Property | Type | Purpose |
|------|------|---------|
| `gesture` | `GestureType` | Animation type: `"drag"`, `"drag-horizontal"`, `"drag-vertical"`, `"drag-circular"`, `"click"`, `"hover"`, `"scroll"`, `"pinch"`, `"rotate"`, `"orbit-3d"` |
| `label` | `string` | Short instruction text shown below the icon |
| `position` | `{ x?: string; y?: string }` | Position relative to the parent container (CSS percentages) |
| `color` | `string` | Optional accent color override for this step |
| `dragPath` | `DragPathConfig` | **Custom drag path for intuitive animations** (see below) |

#### Custom Drag Path (`dragPath`) — Intuitive Hint Animations

**Use `dragPath` to make the hint animation follow the ACTUAL drag motion.** Without this, `drag-circular` just rotates in place. With `dragPath`, the hand icon traces the curved path the student should drag.

**Path types:**

| Type | Use When | Properties |
|:---|:---|:---|
| `"arc"` | Point on a circle, angle control | `startAngle`, `endAngle` (degrees), `radius` (px) |
| `"line"` | Slider, straight drag | `startOffset: {x, y}`, `endOffset: {x, y}` (px) |
| `"custom"` | Complex paths | `xKeyframes: number[]`, `yKeyframes: number[]` |

**Arc path — for circular motion (COMMON):**
```tsx
// Unit circle: drag point from right (0°) upward to top (-90° / 270°)
{ 
  gesture: "drag-circular", 
  label: "Drag around the circle",
  dragPath: { type: "arc", startAngle: 0, endAngle: -90, radius: 40 }
}

// Angle control sweeping from 30° to 120°
{ 
  gesture: "drag-circular", 
  label: "Adjust the angle",
  dragPath: { type: "arc", startAngle: 30, endAngle: 120, radius: 35 }
}
```

**Angle reference (screen coordinates):**
- `0°` = right (3 o'clock position)
- `90°` = down (6 o'clock)
- `180°` = left (9 o'clock)
- `270°` or `-90°` = up (12 o'clock)
- Use **negative angles** for counterclockwise (e.g., 0 → -90 drags upward on the right)

**Line path — for straight drags:**
```tsx
// Horizontal slider
{ 
  gesture: "drag-horizontal", 
  label: "Drag left and right",
  dragPath: { type: "line", startOffset: { x: -30, y: 0 }, endOffset: { x: 30, y: 0 } }
}

// Diagonal drag
{ 
  gesture: "drag", 
  label: "Drag diagonally",
  dragPath: { type: "line", startOffset: { x: -25, y: 15 }, endOffset: { x: 25, y: -15 } }
}
```

**Gesture selection guide — CHOOSE THE CORRECT GESTURE:**

| Use Case | Gesture | Icon | Description |
|:---|:---|:---|:---|
| Free-form point dragging | `"drag"` | Hand | General drag in any direction |
| Horizontal slider/scrubbler | `"drag-horizontal"` | ↔ Arrows | Constrained left-right motion |
| Vertical slider/adjuster | `"drag-vertical"` | ↕ Arrows | Constrained up-down motion |
| Point on circle circumference | `"drag-circular"` | Circular arrow | Drag around a circular path |
| Angle adjustment handles | `"drag-circular"` | Circular arrow | Rotate around a center point |
| Click to place/toggle | `"click"` | Click pointer | Single tap/click interaction |
| Hover to reveal tooltips | `"hover"` | Pointer | Mouse-over interaction |
| Scroll through content | `"scroll"` | Up-down arrows | Scroll wheel interaction |
| 3D camera orbit controls | `"orbit-3d"` | 3D cube | Drag to rotate 3D view |
| Rotate an object | `"rotate"` | Rotate arrow | Rotation gestures |
| Zoom in/out | `"pinch"` | Expand arrows | Pinch or zoom gestures |

**Examples for common visualization types:**

```tsx
// Point on a circle (BEST: use dragPath for intuitive arc motion)
{ 
  gesture: "drag-circular", 
  label: "Drag the point around the circle",
  dragPath: { type: "arc", startAngle: 0, endAngle: 90, radius: 40 }
}

// Unit circle angle control (drag upward from right side)
{
  gesture: "drag-circular",
  label: "Drag to change the angle",
  position: { x: "80%", y: "50%" }, // Position near the point on the right
  dragPath: { type: "arc", startAngle: 0, endAngle: -90, radius: 35 }
}

// Horizontal slider (e.g., time slider, x-axis value)
{ gesture: "drag-horizontal", label: "Drag to change the value" }

// 3D surface or model
{ gesture: "orbit-3d", label: "Drag to rotate the view" }

// Triangle vertex dragging
{ gesture: "drag", label: "Drag any vertex to reshape" }

// Click to place points
{ gesture: "click", label: "Click to place a point" }

// Angle rotation handle (with custom arc)
{ 
  gesture: "drag-circular", 
  label: "Drag to adjust the angle",
  dragPath: { type: "arc", startAngle: 30, endAngle: 150, radius: 30 }
}
```

**Rules:**
1. `hintKey` must be **unique across the entire lesson** — never reuse a key
2. Position the hint **ON or NEAR the interactive element**, not at the center of the viz
3. **Use `dragPath` for circular interactions** — it makes the hint follow the actual drag path
4. For 3D visualizations, use `gesture="orbit-3d"` with label "Drag to rotate the view"
5. The label should be **descriptive and specific** — "Drag the red point" not just "Drag"
6. **NEVER use hints like "Drag the number below"** — hints describe IN-VIZ interactions only, not text controls
7. **NEVER add hints to non-interactive visualizations** — if there's no `movablePoints`, there's no hint
8. **Verify the element exists before adding a hint** — if label says "red point", there must BE a red movable point

#### Positioning the Hint

The `position` prop uses CSS percentages. The hint icon is **centered on the specified point**.

For **centered math visualizations** (Mafs, etc. where origin is at center):
- `x: "50%", y: "50%"` = center of visualization (corresponds to mathematical origin 0,0)
- `x: "50%", y: "30%"` = same horizontal center, 20% above center (y-axis offset)
- Think of `50%` as the center point, then offset from there

For the CSS coordinate system:
- `x: "0%"` = left edge, `x: "100%"` = right edge
- `y: "0%"` = top edge, `y: "100%"` = bottom edge
- The hint icon is centered on this point via `transform: translate(-50%, -50%)`

**Best Practice:** Position hints by visual testing. Place the hint slightly above or beside the interactive element so it doesn't obscure the draggable point.

**Common positions for centered visualizations:**
- `{ x: "50%", y: "30%" }` — center horizontally, above center (good for unit circle point at angle ~0-90°)
- `{ x: "50%", y: "50%" }` — exact center (default)
- `{ x: "70%", y: "50%" }` — right of center
- `{ x: "30%", y: "50%" }` — left of center


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

### Critical Rule: Safe SVG Dimensions and Anti-Clipping

**When creating custom `<svg>` visual components, ALWAYS establish a safe `viewBox` and width/height that securely encompasses all shapes, texts, and potential animations/transforms.**

This ensures:
- Labels and texts appearing near the edges do not get cropped abruptly.
- Drop shadows or glow effects (`filter`) do not clip at bounding box borders.
- Bounding box limits accurately describe the artwork, enabling responsive scaling.

**Rules:**
1. Leave plenty of padded space or margin (at least `20px` to `40px`) around the perimeter of visual items.
2. If text may change or grow (e.g. reactive variables or bold interactive states), ensure the `viewBox` bounds can accommodate the maximum possible width of that text.

```tsx
// WRONG — text at X=290 will be clipped by the strict width=300 boundary
<svg width={300} height={200} viewBox="0 0 300 200">
    <text x={290} y={100}>Hypotenuse</text>
</svg>

// CORRECT — width/viewBox gives 40px padding for the text to breathe safely
<svg width={340} height={200} viewBox="0 0 340 200">
    <text x={290} y={100}>Hypotenuse</text>
</svg>
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
                If you have two apples and someone gives you two more, you now have a total of{" "}
                <InlineClozeInput
                    varName="myAnswer"
                    correctAnswer="4"
                    {...clozePropsFromDefinition(getVariableInfo('myAnswer'))}
                />
                {" "}apples.
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
- `InlineTrigger` — click to snap a variable to a specific value (connective, emerald)
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
| `position` | `'terminal' \| 'mid' \| 'standalone'` | `'terminal'` | Position of blank in sentence — affects default feedback style |
| `caseSensitive` | `boolean` | `false` | Whether comparison is case-sensitive |
| `successMessage` | `string` | *(varies by position)* | Message shown on correct answer — celebrate and explain WHY (no trailing period) |
| `failureMessage` | `string` | *(varies by position)* | Message shown on wrong answer — be encouraging (no trailing period) |
| `hint` | `string` | — | Hint that flows after `failureMessage` — guide discovery (no trailing period) |
| `reviewBlockId` | `string` | — | Block ID to scroll to for reviewing the concept |
| `reviewLabel` | `string` | `"Review this concept"` | Label for the review link |

**Position determines feedback style:**

| Position | When to use | Default success | Default failure |
|:---|:---|:---|:---|
| `terminal` | Blank ends the sentence | `"— exactly right!"` | `"— not quite."` |
| `mid` | Words follow the blank | `"✓"` | `"✗"` |
| `standalone` | Question ends with `?` then blank | `"That's right!"` | `"Not quite!"` |

---

### Feedback Position Examples

**1. Terminal Position (blank at end) — PREFERRED:**

Blank ends the sentence, so detailed feedback is natural. Period comes AFTER the InlineFeedback in JSX.

```tsx
<EditableParagraph id="para-q1" blockId="q1">
    Because the diameter passes through the center, a circle with radius 3 has diameter{" "}
    <InlineFeedback
        varName="fbCircleDiameter"
        correctValue="6"
        position="terminal"
        successMessage="— exactly! The diameter is always twice the radius, so 2 × 3 = 6"
        failureMessage="— not quite."
        hint="The diameter stretches all the way across through the center"
    >
        <InlineClozeInput varName="fbCircleDiameter" correctAnswer="6"
            {...clozePropsFromDefinition(getVariableInfo('fbCircleDiameter'))} />
    </InlineFeedback>.
</EditableParagraph>
// Renders: "...has diameter 6 — exactly! The diameter is always twice the radius, so 2 × 3 = 6."
```

**2. Mid-sentence Position (words after blank):**

Feedback must be ULTRA-BRIEF to maintain sentence flow. Use symbols or very short phrases.

```tsx
<EditableParagraph id="para-q2" blockId="q2">
    An interior cell has exactly{" "}
    <InlineFeedback
        varName="fbNeighbors"
        correctValue="4"
        position="mid"
        hint="Count: up, down, left, right"
    >
        <InlineClozeInput varName="fbNeighbors" correctAnswer="4"
            {...clozePropsFromDefinition(getVariableInfo('fbNeighbors'))} />
    </InlineFeedback>{" "}
    neighbors.
</EditableParagraph>
// Correct renders: "An interior cell has exactly 4 ✓ neighbors."
// Wrong renders: "An interior cell has exactly 3 ✗ Count: up, down, left, right neighbors."
```

**3. Standalone Position (question then blank):**

Question ends with `?`, so feedback is a natural conversational response.

```tsx
<EditableParagraph id="para-q3" blockId="q3">
    How many neighbors does an interior cell have?{" "}
    <InlineFeedback
        varName="fbNeighborCount"
        correctValue="4"
        position="standalone"
        successMessage="Correct! The four cardinal directions: up, down, left, and right"
        failureMessage="Not quite!"
        hint="Think about the directions you can move on a grid"
    >
        <InlineClozeInput varName="fbNeighborCount" correctAnswer="4"
            {...clozePropsFromDefinition(getVariableInfo('fbNeighborCount'))} />
    </InlineFeedback>
</EditableParagraph>
// Renders: "How many neighbors...? 4 Correct! The four cardinal directions..."
```

---

### Key Rules for InlineFeedback:

**Matching rules:**
- The `varName` in `InlineFeedback` must match the `varName` in the cloze component inside
- The `correctValue` in `InlineFeedback` must match the `correctAnswer` of the cloze component

**Position rules:**
- **Prefer terminal position** — restructure questions so the blank ends the sentence
- **For mid-sentence**: Keep feedback ultra-short; consider omitting custom messages to use `✓`/`✗` defaults
- **Read the full sentence aloud** — does it sound natural with feedback inserted?

**Punctuation rules:**
- Put the period AFTER `</InlineFeedback>` in JSX, not inside the message
- **Never use trailing periods** in messages — the JSX template handles punctuation
- Use em dashes (—) or commas to connect feedback naturally: `"— exactly because..."`
- **NEVER use `--` (double hyphens)** — use `—` (em dash) instead

**Feedback curating rules:**
- **Success messages**: Start with celebration ("Exactly!", "That's right!"), then explain WHY
- **Failure messages**: Be encouraging ("Not quite!", "Almost!") — never discouraging
- **Hints**: Guide discovery with concrete scaffolding, not just restating the question
- **Avoid word duplication** — don't repeat words that appear after the blank

**Technical rules:**
- Works with `InlineClozeInput` (text fill-in) and `InlineClozeChoice` (dropdown)
- Define answer variables in `variables.ts` just like any other cloze variable
- Feedback appears only after submission — not during typing

---

### Visual Hints in Feedback (Guided Discovery)

When a student answers incorrectly, you can guide them to **discover the answer themselves** through an interactive visualization. The `visualizationHint` prop on `InlineFeedback` creates a button that, when clicked, navigates to a visualization and shows step-by-step interactive hints.

**InlineFeedback with visualizationHint example:**

```tsx
<InlineFeedback
    varName="fbUnitCircleCos"
    correctValue="-1"
    position="standalone"
    failureMessage="Hmm, not quite."
    hint="Think about where the point sits at 180°"
    visualizationHint={{
        blockId: "unit-circle-viz",
        hintKey: "feedback-unit-circle-hint",
        steps: [
            {
                gesture: "drag-circular",
                label: "Drag the red point upward toward the top — watch cos shrink toward zero",
                position: { x: "70%", y: "35%" },
                dragPath: { type: "arc", startAngle: 0, endAngle: -90, radius: 40 },
                completionVar: "theta",
                completionValue: 90,
                completionTolerance: 15,
            },
            {
                gesture: "drag-circular",
                label: "Keep dragging to the left — notice cos becomes negative!",
                position: { x: "30%", y: "50%" },
                dragPath: { type: "arc", startAngle: -90, endAngle: -180, radius: 40 },
                completionVar: "theta",
                completionValue: 180,
                completionTolerance: 20,
            },
        ],
        label: "Discover it yourself",
        resetVars: { theta: 0 },
    }}
>
    <InlineClozeChoice varName="fbUnitCircleCos" correctAnswer="-1" options={["0", "1", "-1"]} />
</InlineFeedback>
```

### Critical Rules for Visual Hints

| Rule | Description | Bad Example | Good Example |
|:---|:---|:---|:---|
| **1. Question must match the visualization journey** | The question answer should be discoverable through the guided steps | Asking cos(0°) but guiding to 180° | Asking cos(180°) and guiding from 0° → 90° → 180° |
| **2. Always reset to starting position** | Use `resetVars` to reset the visualization when button clicked | No resetVars (user may have moved things) | `resetVars: { theta: 0 }` |
| **3. Steps must be actionable** | Every step must describe a concrete action the user performs | "Look at where the point is" | "Drag the point upward to the top" |
| **4. Steps must be verifiable** | Each step needs `completionVar`, `completionValue`, and `completionTolerance` | "Drag the point" (no way to verify) | "Drag to 90°" with `completionVar: "theta", completionValue: 90` |
| **5. Steps auto-advance on completion** | The hint watches the variable and advances when target is reached | Manual next buttons | Auto-advance when `theta` reaches 90° (±15°) |
| **6. Clear, concise labels** | Step labels should be short and describe action + observation | Long explanations | "Drag upward — watch cos shrink toward zero" |

### Step Properties for Visual Hints

| Property | Type | Required | Purpose |
|:---|:---|:---|:---|
| `gesture` | `GestureType` | Yes | Animation type: `"drag"`, `"drag-circular"`, `"drag-vertical"`, `"click"`, etc. |
| `label` | `string` | Yes | Short instruction: action + what to observe |
| `position` | `{ x: string, y: string }` | No | Position of hint icon (percentage, e.g., `{ x: "70%", y: "35%" }`) |
| `dragPath` | `DragPathConfig` | No | Animation path for the gesture hint |
| `completionVar` | `string` | **Yes*** | Variable to watch for step completion |
| `completionValue` | `number` | **Yes*** | Target value the variable should reach |
| `completionTolerance` | `number` | No | Acceptable range (±tolerance), default: 15 |

*Required for meaningful step progression. Steps without completion conditions advance on any interaction.

### VisualizationHintConfig Properties

| Property | Type | Required | Purpose |
|:---|:---|:---|:---|
| `blockId` | `string` | Yes | Block ID of the visualization to scroll to |
| `hintKey` | `string` | Yes | Unique key for the hint sequence |
| `steps` | `HintStep[]` | Yes | Array of guided steps |
| `label` | `string` | No | Button label (default: "See it in action") |
| `resetVars` | `Record<string, number \| string \| boolean>` | **Yes*** | Variables to reset when button clicked |

*Always include `resetVars` to ensure the visualization starts in the correct state for the guided journey.

### Design Workflow for Visual Hints

1. **Design the question** — What concept are you testing? What answer should the student discover?
2. **Plan the journey** — What interactive steps lead to discovering the answer?
3. **Identify the variables** — Which variables change during the journey? What are the milestone values?
4. **Write the steps** — Each step: action verb + target + observation
5. **Set completion conditions** — `completionVar`, `completionValue`, `completionTolerance` for each step
6. **Add resetVars** — Reset all relevant variables to the starting position

### Example: Teaching cos(180°) through guided exploration

**Question**: "What is cos(180°)?"
**Answer**: -1

**Journey**:
1. Start at θ = 0° (rightmost point, cos = 1)
2. Drag to θ = 90° (top, cos = 0) — student sees cos decrease
3. Drag to θ = 180° (leftmost, cos = -1) — student discovers the answer

**Steps**:
```tsx
steps: [
    {
        gesture: "drag-circular",
        label: "Drag the red point upward toward the top — watch cos shrink toward zero",
        completionVar: "theta", completionValue: 90, completionTolerance: 15,
    },
    {
        gesture: "drag-circular",
        label: "Keep dragging to the left — notice cos becomes -1 at 180°!",
        completionVar: "theta", completionValue: 180, completionTolerance: 20,
    },
],
resetVars: { theta: 0 },
```

## Visual Assessment Tasks

Beyond text-based questions (`InlineClozeInput`, `InlineClozeChoice`), you can create **interactive visual tasks** where students demonstrate understanding by manipulating elements in a visualization — drawing lines, positioning points, or constructing shapes.

### Key Principles

1. **Don't reveal the answer in instructions.** Say "Draw a radius" not "Draw a line from center to edge"
2. **Use tolerance-based validation.** Students aren't precision instruments — accept answers within reasonable bounds (typically ±5-10%)
3. **Provide immediate visual feedback.** Correct answers glow green; incorrect attempts show amber with hints
4. **Allow multiple attempts.** Visual tasks should let students try again with progressive hints

### Task Types

| Type | Student Action | Validation Approach |
|:---|:---|:---|
| **Draw/Position** | Drag endpoint to location | `distance(point, target) < tolerance` |
| **Construct** | Move multiple points | Validate geometric properties (area, angle, length) |
| **Adjust to value** | Change parameter to hit target | Check final value within range |

### Implementation Pattern

Visual assessment tasks use `movablePoints` in `Cartesian2D` with an `onChange` callback that validates the position and updates a status variable:

```tsx
// 1. Define status variable in variables.ts
radiusTaskStatus: {
    defaultValue: 'pending',
    type: 'text',
    label: 'Radius Task Status',
},

// 2. Create validation function
const validateRadius = useCallback((endpoint: [number, number]) => {
    const distanceFromCenter = distance(endpoint, [0, 0]);
    const isOnCircle = Math.abs(distanceFromCenter - circleRadius) < tolerance;
    
    if (isOnCircle) {
        setVar("radiusTaskStatus", "correct");
    } else if (distanceFromCenter < circleRadius) {
        setVar("radiusTaskStatus", "inside");
    } else {
        setVar("radiusTaskStatus", "outside");
    }
}, [setVar, circleRadius, tolerance]);

// 3. Visualization with movable point
<Cartesian2D
    height={350}
    viewBox={{ x: [-5, 5], y: [-5, 5] }}
    movablePoints={[{
        initial: [1.5, 1.5],
        color: lineColor,
        onChange: (point) => validateRadius(point as [number, number]),
    }]}
    dynamicPlots={([endpoint]) => [
        { type: "circle", center: [0, 0], radius: circleRadius, color: "#64748b" },
        { type: "point", x: 0, y: 0, color: "#3b82f6" },
        { type: "segment", point1: [0, 0], point2: endpoint, color: lineColor, weight: 3 },
    ]}
/>

// 4. Reactive feedback component
function RadiusTaskFeedback() {
    const status = useVar("radiusTaskStatus", "pending") as string;
    if (status === "correct") {
        return <span className="text-green-600 font-medium">Excellent! That is a valid radius.</span>;
    }
    if (status === "inside") {
        return <span className="text-amber-600">The endpoint is inside the circle. A radius must reach the edge.</span>;
    }
    if (status === "outside") {
        return <span className="text-amber-600">The endpoint is outside the circle. Pull it back to touch the edge.</span>;
    }
    return <span className="text-slate-500">Drag the point to complete the radius.</span>;
}
```

### Reference Demo

See `src/data/sections/visualAssessmentDemo.tsx` for complete working examples:

- **Draw a Radius** — drag endpoint to circle edge
- **Find the Midpoint** — position a point at segment center
- **Position the Vertex** — adjust triangle apex to achieve target area (9 sq units)
- **Construct a Perpendicular** — create a 90° angle from a line

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

