# MathVibe Template

Interactive explorable-explanation template for creating mathematics lessons. Built with React + TypeScript + Vite + Tailwind CSS. Content is organized as **blocks** inside **layouts**, with shared state via a **global variable store** (Zustand).

---

## CRITICAL: EVERY VISUALIZATION MUST BE INTERACTIVE

**This is an explorable explanation platform — NOT a textbook.** Static diagrams defeat the entire purpose. Every visualization MUST allow student manipulation.

### The Non-Negotiable Interactivity Rules

1. **No static charts** — Every `Cartesian2D`, `DataVisualization`, `GeometricDiagram` must have at least one manipulable element (`movablePoints`, brush selection, or bound to `InlineScrubbleNumber`)

2. **Bi-directional binding** — The same `varName` must connect:
   - Prose (`InlineScrubbleNumber`)
   - Formulas (`FormulaBlock` with `\scrub{}`)
   - Visualizations (point positions, function parameters)
   
3. **Linked highlights** — Use `InlineLinkedHighlight` to connect prose terms to visual elements. When students hover "radius" in the text, the radius line in the diagram should highlight.

4. **Observable change** — When students manipulate one element, they must see real-time changes in other elements. Dragging a point should update values in both formulas AND prose.

5. **Interaction hints** — Every visualization with actual in-viz interactivity MUST include an `InteractionHintSequence` overlay showing students how to interact with it. The hint displays an animated hand gesture that auto-dismisses when the user interacts. **CRITICAL: NEVER add interaction hints to a visualization that is not actually interactive.** If there's no real draggable/clickable element, showing hints creates confusion. Inline components (`InlineScrubbleNumber`, `InlineToggle`, etc.) also auto-show interaction hints — use `showHint={false}` to disable for navigation/TOC links. **FormulaBlock** shows hints below **each** interactive element (`\scrub{}`, `\highlight{}`, `\cloze{}`, `\choice{}`) — not just one.

### Before Creating Any Visualization, Ask:

- **What can the student drag, scrub, or click?** ← If nothing, STOP and redesign
- **What changes when they interact?** ← At least one derived value must update
- **Is the same variable used in prose, formula, AND visual?** ← If not, connect them
- **Does it have actual interactivity AND an InteractionHintSequence?** ← If interactive, add hints; if not interactive, NO hints

### Use Soft, Muted Colors

**Never use saturated primaries (`#FF0000`, `#00FF00`, `#0000FF`).** Use the recommended soft palette:

- `#62D0AD` (teal) — primary variables
- `#8E90F5` (indigo) — secondary variables  
- `#F7B23B` (amber) — highlights, attention
- `#AC8BF9` (violet) — tertiary variables
- `#F8A0CD` (rose) — emphasis
- `#62CCF9` (sky) — alternative primary
- `#F4A89A` (coral) — warmth
- `#A8D5A2` (sage) — natural concepts
- `#FFCBA4` (peach) — gentle highlights
- `#7DD3C0` (mint) — fresh/clean
- `#C9B8E8` (lavender) — subtle emphasis
- `#22c55e` (green) — success/correct
- `#ef4444` (red) — errors (use sparingly)

---

## Core Concept: Everything Lives in a Block

The **Block** is the fundamental unit of content. Every piece of a lesson — a paragraph, an equation, a chart, a visualization — must live inside a `<Block>`.

- **Rearrangeable** — teachers drag-and-drop blocks to reorder content
- **Editable** — each block has its own toolbar for inline editing, deleting, and inserting
- **Trackable** — the block manager sees and controls every piece individually

**Rule 1: Never use a component outside a Block.** Unwrapped components are invisible to the editing system.

**Rule 2: Each Block must contain exactly ONE primary component.** A single heading, a single paragraph, a single formula, or a single visual. Teachers add, delete, and reorder blocks individually — combining multiple components in one block makes them inseparable and breaks the editing system. The block manager needs to identify and control each piece individually.

> **Exception:** Inline components (`InlineScrubbleNumber`, `InlineClozeInput`, `InlineTooltip`, etc.) belong *inside* their parent `EditableParagraph` — they are part of the text, not separate blocks.

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

**Does NOT apply to:** `EditableParagraph`, `EditableH1/H2/H3`, `FormulaBlock`, `ImageDisplay`, `VideoDisplay`, `Table`, `InlineFeedback`.

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
│   │   ├── formula/                #   FormulaBlock
│   │   └── InteractionLegend.tsx   #   Auto-rendered how-to-interact banner
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
        <Block id="intro-title" padding="md">
            <EditableH1 id="h1-intro-title" blockId="intro-title">
                Understanding Waves
            </EditableH1>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-intro-text" maxWidth="xl">
        <Block id="intro-text" padding="sm">
            <EditableParagraph id="para-intro-text" blockId="intro-text">
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

### ID Conventions — Hierarchical, Descriptive Naming

Every block, layout, and component MUST have a **unique, descriptive, hierarchical ID** that reflects the content hierarchy. Well-structured IDs make it easy to find, edit, and understand the lesson structure.

**Stricter ID Format Rules:**
- **No generic wrappers**: NEVER use the words "block", "container", "item", or similar generic terms in IDs. (e.g., `intro-title` instead of `block-intro-title`).
- **No arbitrary numbers**: NEVER use arbitrary numbering like `-01`, `-02`, `-03`. IDs must be contextually meaningful based on their content (e.g., `paragraph-cloze-angle` instead of `paragraph-cloze-01`).
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

### Descriptive Phrasing for Interactions

**NEVER use command-style phrasing like "set to", "increase to", or "change to" when referencing inline interactive components.**

Because inline components (e.g., `InlineScrubbleNumber`) display real-time reactive values, instructions like "increase the amplitude to 2" will not make sense if the user has already changed the value to 3.

**Use exploratory, state-based, or descriptive language instead:**
- **WRONG**: "Set the amplitude to 3 to see what happens."
- **CORRECT**: "If the amplitude is 3, what happens?"
- **WRONG**: "Increase the frequency to 5."
- **CORRECT**: "Explore what happens when the frequency is 5."
- **WRONG**: "Change the mode to custom."
- **CORRECT**: "This applies when the mode is custom."

For `InlineTrigger`, avoid verbs like "set" or "change". Use verbs like "snap to", "reset", or state the action contextually.

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
| `InlineTrigger` | Click to snap a variable to a value (emerald) |
| `InlineHyperlink` | Click to open URL or scroll to block (emerald) |
| `InlineFormula` | Inline KaTeX formula with colored terms (use single `\` for LaTeX commands) |
| `InlineSpotColor` | Highlights text with a global variable's color |
| `InlineLinkedHighlight` | Bidirectional highlighting |

### Formula Components (`@/components/molecules`)

| Component | Purpose |
|-----------|---------|
| `FormulaBlock` | Block-level math display with interactive elements |
### Interaction Legend (`@/components/molecules`)

| Component | Purpose |
|-----------|---------||
| `InteractionLegend` | Collapsible "How to read this article" banner with live mini-demos |

`InteractionLegend` is **automatically rendered** at the top of every article by `BlockRenderer`. It shows three self-contained mini-demos (drag a number, fill in a blank, pick from a dropdown) so first-time readers learn the interaction patterns before encountering them in the lesson. The component uses `localStorage` to remember if the user has already seen the expanded legend, collapsing it on subsequent visits. **Do not add this component in section files** — it is handled by the template infrastructure.
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

### Feedback Components (`@/components/atoms/text`)

| Component | Purpose |
|-----------|----------|
| `InlineFeedback` | Wraps a cloze input/choice and shows contextual feedback as inline flowing text |

`InlineFeedback` watches a variable from the store, compares it against a correct value, and displays **feedback as natural paragraph text** immediately after the cloze component. Key features:

- **Automatic** — feedback appears as soon as the student **submits** their answer; no "Check Answer" button
- **Submission triggers** — for `InlineClozeInput`: Enter key, blur (clicking away), or auto-correct match while typing. For `InlineClozeChoice`: selecting an option. Feedback never appears while the student is still typing.
- **Position-aware** — feedback adapts based on where it appears: terminal (end of sentence), mid-sentence, or standalone
- **Inline flow** — feedback flows as part of the paragraph text, not as a separate block
- **Subtle styling** — green text for correct, amber for incorrect — no icons, no backgrounds
- **Animated** — smooth fade-in/out transitions with Framer Motion

**Position-based defaults:**

| Position | When to use | Success default | Failure default |
|:---|:---|:---|:---|
| `terminal` | Blank ends the sentence | `"— exactly right!"` | `"— not quite."` |
| `mid` | Words follow the blank | `"✓"` | `"✗"` |
| `standalone` | Question ends with ? then blank | `"That's right!"` | `"Not quite!"` |

**Terminal position example (blank at end):**
```tsx
<EditableParagraph>
    A circle with radius 3 has diameter{" "}
    <InlineFeedback
        varName="fbCircleDiameter" correctValue="6" position="terminal"
        successMessage="— exactly! Diameter is always twice the radius"
        failureMessage="— not quite." hint="Diameter = 2 × radius"
    >
        <InlineClozeInput varName="fbCircleDiameter" correctAnswer="6" ... />
    </InlineFeedback>.
</EditableParagraph>
```

**Mid-sentence example (words follow blank):**
```tsx
<EditableParagraph>
    An interior cell has exactly{" "}
    <InlineFeedback varName="fbNeighbors" correctValue="4" position="mid">
        <InlineClozeInput varName="fbNeighbors" correctAnswer="4" ... />
    </InlineFeedback>{" "}
    neighbors in each direction.
</EditableParagraph>
// Renders: "...has exactly 4 ✓ neighbors in each direction."
```

| Prop | Type | Default | Purpose |
|------|------|---------|--------|
| `varName` | `string` | *(required)* | Variable to watch (must match the cloze component's `varName`) |
| `correctValue` | `string` | *(required)* | Expected correct value |
| `position` | `'terminal' \| 'mid' \| 'standalone'` | `'terminal'` | Position of blank — affects default feedback style |
| `caseSensitive` | `boolean` | `false` | Case-sensitive comparison |
| `successMessage` | `string` | *(varies by position)* | Encouraging message for correct answers |
| `failureMessage` | `string` | *(varies by position)* | Supportive message for wrong answers |
| `hint` | `string` | — | Additional guidance after failure message |
| `reviewBlockId` | `string` | — | Block ID to scroll to for review |
| `reviewLabel` | `string` | `"Review this concept"` | Review link text |

### Visual Assessment Tasks

Beyond text-based questions, you can create **interactive visual tasks** where students demonstrate understanding by manipulating elements in a visualization — drawing lines, positioning points, or constructing shapes.

**Key principles:**
- **Don't reveal the answer in instructions.** Say "Draw a radius" not "Draw a line from center to edge"
- **Use tolerance-based validation.** Students aren't precision instruments — accept answers within reasonable bounds
- **Provide visual feedback.** Correct answers glow green; incorrect attempts show amber with hints
- **Allow multiple attempts.** Visual tasks should let students try again after hints

**Example pattern — Drag to validate:**

```tsx
// Validation function checks if endpoint is on the circle
const validateRadius = useCallback((endpoint: [number, number]) => {
    const distanceFromCenter = distance(endpoint, [0, 0]);
    const isOnCircle = Math.abs(distanceFromCenter - circleRadius) < tolerance;
    setVar("taskStatus", isOnCircle ? "correct" : "incorrect");
}, [setVar]);

// Visualization with movable point
<Cartesian2D
    movablePoints={[{
        initial: [1.5, 1.5],
        color: lineColor,
        onChange: (point) => validateRadius(point as [number, number]),
    }]}
    dynamicPlots={([endpoint]) => [
        { type: "circle", center: [0, 0], radius: 3, color: "#64748b" },
        { type: "segment", point1: [0, 0], point2: endpoint, color: lineColor },
    ]}
/>
```

**Task types:**
| Type | Student Action | Validation Approach |
|:---|:---|:---|
| Draw/Position | Drag endpoint to location | Distance from target < tolerance |
| Construct | Move multiple points | Validate geometric properties |
| Adjust to value | Change parameter to hit target | Check final value within range |

See `src/data/sections/visualAssessmentDemo.tsx` for complete working examples of:
- **Draw a Radius** — drag endpoint to circle edge
- **Find the Midpoint** — position a point at segment center  
- **Position the Vertex** — adjust triangle apex to achieve target area
- **Construct a Perpendicular** — create a 90° angle

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
        <Block id="intro-question" padding="sm">
            <EditableParagraph id="para-intro-question" blockId="intro-question">
                If you have two apples and someone gives you two more, you now have a total of{" "}
                <InlineClozeInput varName="myAnswer" correctAnswer="4" ... />
                {" "}apples.
            </EditableParagraph>
        </Block>
    </Step>

    {/* Normal step */}
    <Step>
        <Block id="intro-success" padding="sm">
            <EditableParagraph id="para-intro-success" blockId="intro-success">
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

### White Backgrounds for Visualizations

**ALL visualization components MUST use a white (`#FFFFFF`) or very light neutral background.** Never use colored, dark, or gradient backgrounds behind charts, diagrams, or interactive visuals. This ensures maximum readability, clean appearance, and consistency.

### No Gradients — Flat Muted Colors Only

**NEVER use gradient backgrounds or gradient colors** in any component. Always use **flat, solid colors** with **muted, not overly saturated tones**.

- No `linear-gradient()`, `radial-gradient()`, or CSS gradient functions
- No gradient fills in SVG, Canvas, or custom components
- Use muted, desaturated colors (HSL saturation < 70%)
- **Good:** `#6366f1` (soft indigo), `#3cc499` (muted teal), `#f59e0b` (warm amber), `#8b5cf6` (soft violet)
- **Avoid:** `#FF0000`, `#00FF00`, `#0000FF`, neon colors, pure saturated primaries

### Safe SVG Dimensions and Anti-Clipping

When manually writing custom `<svg>` visual components, **always establish a safe `viewBox` width and height** that securely encompasses all shapes, texts, and potential transforms. Give a margin of 20px-40px.

- **Bad**: `viewBox="0 0 300 200"` while placing text at `x={290}` (gets cut off right off the edge).
- **Good**: Expand `viewBox="0 0 340 200"` and `width={340}` to safely pad the drawing area preventing crop-offs.

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

## Tech Stack

- **Framework:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS + shadcn/ui
- **State:** Zustand + React Context
- **Math:** KaTeX, Mafs, Desmos, GeoGebra
- **Graphics:** Three.js, Two.js, D3, React Flow
- **Icons:** lucide-react
