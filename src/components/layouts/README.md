# Layout System

A flexible, composable layout system for organizing educational content sections. This system allows you to control how sections are arranged on the page using dedicated layout components.

## Philosophy

**Sections Inside Layouts** - Rather than each section defining its own layout, we use dedicated layout components that wrap sections. This provides:

- ✅ **Maximum flexibility** - compose multiple sections in different layouts
- ✅ **Separation of concerns** - content is separate from presentation
- ✅ **Reusable sections** - same section can appear in different layouts
- ✅ **Better composition** - easily create complex page structures

## Available Layouts

### 1. StackLayout

Default layout that takes full container width with optional max-width constraints.

```tsx
<StackLayout maxWidth="xl">
    <Section id="intro">
        <h1>Introduction</h1>
        <p>Content goes here...</p>
    </Section>
</StackLayout>
```

**Props:**
- `maxWidth?: "none" | "md" | "lg" | "xl" | "2xl" | "full"` - Maximum width constraint
- `className?: string` - Custom CSS classes

**Use when:**
- Long-form text content
- Full-width visualizations
- Standard page sections

---

### 2. SplitLayout

Two-column layout with customizable ratios. Perfect for pairing text with visualizations.

```tsx
<SplitLayout ratio="1:1" gap="lg">
    <Section id="explanation">
        <h2>Concept Explanation</h2>
        <p>Text content...</p>
    </Section>
    <Section id="visualization">
        <AnimatedGraph variant="sine-wave" />
    </Section>
</SplitLayout>
```

**Props:**
- `ratio?: "1:1" | "1:2" | "2:1" | "1:3" | "3:1" | "2:3" | "3:2"` - Column width ratio
- `gap?: "none" | "sm" | "md" | "lg" | "xl"` - Space between columns
- `reverse?: boolean` - Swap column order
- `align?: "start" | "center" | "end" | "stretch"` - Vertical alignment
- `className?: string` - Custom CSS classes

**Use when:**
- Pairing explanations with visualizations
- Comparing two concepts side by side
- Code examples with live demos

**Responsive:** Collapses to single column on mobile devices.

---

### 3. GridLayout

Multi-column grid for displaying multiple items. Automatically responsive.

```tsx
<GridLayout columns={3} gap="md">
    <Section id="example-1">Example 1</Section>
    <Section id="example-2">Example 2</Section>
    <Section id="example-3">Example 3</Section>
</GridLayout>
```

**Props:**
- `columns?: 2 | 3 | 4 | 5 | 6` - Number of columns on desktop
- `tabletColumns?: 1 | 2 | 3 | 4` - Columns on tablet (auto-calculated if not provided)
- `mobileColumns?: 1 | 2` - Columns on mobile (default: 1)
- `gap?: "none" | "sm" | "md" | "lg" | "xl"` - Space between items
- `align?: "start" | "center" | "end" | "stretch"` - Vertical alignment
- `className?: string` - Custom CSS classes

**Use when:**
- Showcasing multiple examples
- Card-based content
- Image galleries
- Feature lists

**Responsive:** Automatically adjusts columns for tablet and mobile.

---

### 4. ScrollytellingLayout

Scrollytelling layout: text steps scroll on one side while a sticky visualization reacts to each step. Active step index is written to a global variable so any visual component can react reactively.

```tsx
// 1. Define a step variable in variables.ts:
// scrollStep: { defaultValue: 0, type: 'number', min: 0, max: 3, step: 1 }

// 2. Create a reactive visual:
function ReactiveViz() {
    const step = useVar('scrollStep', 0) as number;
    return <MyVisualization step={step} />;
}

// 3. Assemble the layout:
<ScrollytellingLayout varName="scrollStep" visualPosition="right" gap="lg">
    <ScrollStep>
        <Block id="block-step-0" padding="sm">
            <EditableParagraph id="para-step-0" blockId="block-step-0">
                Step 0 — introduce the concept.
            </EditableParagraph>
        </Block>
    </ScrollStep>

    <ScrollStep>
        <Block id="block-step-1" padding="sm">
            <EditableParagraph id="para-step-1" blockId="block-step-1">
                Step 1 — add detail.
            </EditableParagraph>
        </Block>
    </ScrollStep>

    <ScrollVisual>
        <Block id="block-viz" padding="sm">
            <ReactiveViz />
        </Block>
    </ScrollVisual>
</ScrollytellingLayout>
```

**Props:**
- `varName?: string` - Global variable name (defined in `variables.ts`) to receive the 0-based active step index
- `visualPosition?: "left" | "right"` - Which side the sticky visual appears on (default: `"right"`)
- `visualWidth?: "narrow" | "medium" | "wide"` - Width of the sticky visual column
- `gap?: "none" | "sm" | "md" | "lg" | "xl"` - Space between text and visual columns
- `threshold?: number` - Intersection fraction that triggers a step (default: `0.5`)
- `onStepChange?: (stepIndex: number) => void` - Optional callback on step change
- `className?: string` - Custom CSS classes

**Special Components:**
- `<ScrollStep>` - Wraps one prose block (or several in a `<div className="space-y-4">`). Each step is ~60 vh tall so it naturally scrolls.
- `<ScrollVisual>` - Wraps the sticky visualization panel.

**How it works:**
An `IntersectionObserver` watches each `<ScrollStep>`. When a step crosses the middle 40% of the viewport it becomes active and its 0-based index is written to the `varName` variable. Your visual reads that variable with `useVar(varName, 0)` and updates accordingly.

**Use when:**
- Walking a reader through a multi-step derivation or proof
- Annotated data visualizations that change per section
- Animated diagrams tied to narrative steps

**Responsive:** Collapses to single column (text above visual) on mobile.

---

### 5. SlideLayout

Presentation-style layout that shows one `<Slide>` at a time with smooth transitions. Navigate with arrow buttons, clickable dot indicators, or keyboard **← / →** keys. The active slide index is written to a global variable so any component can react to slide changes.

```tsx
// 1. (Optional) Define a step variable in variables.ts:
// slideIndex: { defaultValue: 0, type: 'number', min: 0, max: 3, step: 1 }

// 2. Create a reactive visual that reads the active slide:
function ReactiveViz() {
    const idx = useVar('slideIndex', 0) as number;
    return <MyVisualization slide={idx} />;
}

// 3. Assemble the deck:
<SlideLayout
    varName="slideIndex"
    height="lg"
    transition="slide"
    showArrows
    arrowPosition="inside"
    showDots
    showCounter
>
    <Slide>
        <Block id="block-slide-1" padding="lg">
            <EditableH2 id="h2-slide-1" blockId="block-slide-1">Slide 1</EditableH2>
        </Block>
    </Slide>

    <Slide>
        <SplitLayout ratio="1:1" gap="lg" align="center">
            <Block id="block-slide-2-text" padding="lg">
                <EditableParagraph id="para-slide-2" blockId="block-slide-2-text">
                    Content for slide 2.
                </EditableParagraph>
            </Block>
            <Block id="block-slide-2-viz" padding="sm">
                <ReactiveViz />
            </Block>
        </SplitLayout>
    </Slide>
</SlideLayout>
```

**Props:**
- `varName?: string` - Global variable name (defined in `variables.ts`) to receive the 0-based active slide index
- `height?: "sm" | "md" | "lg" | "xl" | "auto"` - Height of the slide stage (default: `"md"`)
- `transition?: "fade" | "slide" | "none"` - Visual transition between slides (default: `"fade"`)
- `showArrows?: boolean` - Show ← → navigation buttons (default: `true`)
- `arrowPosition?: "inside" | "outside"` - Whether arrows are overlaid on the stage or flank it (default: `"inside"`)
- `showDots?: boolean` - Show clickable dot progress indicator (default: `true`)
- `showCounter?: boolean` - Show "N / total" slide counter (default: `false`)
- `onSlideChange?: (index: number) => void` - Optional callback on slide change
- `className?: string` - Custom CSS classes

**Special Components:**
- `<Slide>` - Wraps the content of a single slide. Can contain a `Block`, a `SplitLayout`, or a `<div className="space-y-4">` with multiple Blocks.

**Keyboard navigation:** Pressing **← / →** (or **↑ / ↓**) anywhere on the page while this layout is mounted will navigate between slides.

**Use when:**
- Step-by-step walkthroughs of a concept or proof
- Before/after comparisons
- Interactive quizzes where each question is a slide
- Sequential demonstrations where showing everything at once would be overwhelming

---

## Usage Examples

### Basic Page Structure

```tsx
import { StackLayout, SplitLayout } from '@/components/layouts';
import { Section } from '@/components/templates';

export const sections = [
    // Intro
    <StackLayout maxWidth="xl">
        <Section id="intro">
            <h1>Chapter 1: Introduction</h1>
            <p>Welcome to the lesson...</p>
        </Section>
    </StackLayout>,
    
    // Concept with visualization
    <SplitLayout ratio="1:1" gap="lg">
        <Section id="theory">
            <h2>Theory</h2>
            <p>Explanation...</p>
        </Section>
        <Section id="demo">
            <AnimatedGraph />
        </Section>
    </SplitLayout>,
];
```

### Mixed Layouts

You can combine different layout types on the same page:

```tsx
export const sections = [
    // Full-width intro
    <StackLayout maxWidth="xl">
        <Section id="intro">...</Section>
    </StackLayout>,
    
    // Split layout for concept + visualization
    <SplitLayout ratio="60:40">
        <Section id="concept">...</Section>
        <Section id="viz">...</Section>
    </SplitLayout>,
    
    // Grid for multiple examples
    <GridLayout columns={3} gap="md">
        <Section id="ex1">...</Section>
        <Section id="ex2">...</Section>
        <Section id="ex3">...</Section>
    </GridLayout>,
    
];
```

---

## Responsive Behavior

All layouts are responsive by default:

| Layout | Desktop | Tablet | Mobile |
|--------|---------|--------|--------|
| **StackLayout** | Max-width constrained | Max-width constrained | Full width |
| **SplitLayout** | Two columns | Two columns | Single column (stacked) |
| **GridLayout** | N columns | Auto-reduced | 1-2 columns |
| **ScrollytellingLayout** | Text + sticky visual | Text + sticky visual | Single column (stacked) |
| **SlideLayout** | Card stage + arrows + dots | Card stage + arrows + dots | Card stage + arrows + dots |
| **StepLayout** | Steps stacked vertically | Steps stacked vertically | Steps stacked vertically |

---

## Best Practices

### 1. Choose the Right Layout

- **StackLayout**: Default choice for most content
- **SplitLayout**: When pairing related content (theory + practice)
- **GridLayout**: When showcasing multiple similar items
- **ScrollytellingLayout**: When walking through narrative steps with a reactive visualization
- **SlideLayout**: When presenting sequential content one panel at a time (walkthroughs, quizzes, step-by-step demos)
- **StepLayout**: When revealing content progressively — learners advance by clicking Continue or answering questions correctly

### 2. Consistent Spacing

Use consistent `gap` values across your page for visual harmony:
- `sm`: 12px - Tight spacing
- `md`: 24px - Standard spacing ✅ (recommended default)
- `lg`: 32px - Generous spacing
- `xl`: 48px - Extra spacious

### 3. Max-Width Strategy

For readable content, use appropriate max-widths:
- Text-heavy content: `md` or `lg`
- General content: `xl` ✅ (recommended default)
- Wide visualizations: `2xl` or `full`

### 4. Ratio Selection

Common `SplitLayout` ratios:
- `1:1` - Equal emphasis
- `2:1` or `1:2` - One dominant side
- `3:2` or `2:3` - Subtle emphasis

---

## Implementation Details

### How Props Are Passed

The `SectionRenderer` uses recursive prop injection to ensure all nested sections receive `isPreview` and `onEditSection` props, even when wrapped in layout components:

```tsx
const deepCloneWithProps = (element, props) => {
  // Recursively clone and inject props into all children
  // This ensures layouts and nested sections all receive necessary props
};
```

This means you don't need to manually pass these props - the system handles it automatically!

### TypeScript Support

All layout components are fully typed with TypeScript for excellent IDE support and type safety.

---

## Future Enhancements

Potential additions to the layout system:

- **TabLayout**: Tabbed content areas
- **AccordionLayout**: Collapsible sections
- **HeroLayout**: Full-screen hero sections
- **CompareLayout**: Side-by-side comparison tables
- **TimelineLayout**: Chronological content flow

---

## StepLayout

Progressive-disclosure layout that reveals content one step at a time. Completed steps remain visible above the current one.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `varName` | `string` | — | Global variable receiving the 0-based revealed step index |
| `revealLabel` | `string` | `"Continue"` | Default button label (overridable per step) |
| `showProgress` | `boolean` | `true` | Show "Step N / M" text counter |
| `allowBack` | `boolean` | `false` | Show a Back button on the current step |
| `onStepReveal` | `(index) => void` | — | Callback when a new step is revealed |

### Step Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `revealLabel` | `string` | layout default | Override the Continue button label |
| `completionVarName` | `string` | — | Gate: variable must be truthy before Continue is enabled |
| `autoAdvance` | `boolean` | `false` | Auto-reveal next step on correct answer (hides Continue button). Requires `completionVarName`. |

### Step Modes

1. **Normal** — shows a Continue → button.
2. **Gated** (`completionVarName`) — Continue button is disabled until the variable is truthy.
3. **Auto-advance** (`completionVarName` + `autoAdvance`) — no button; next step appears ~700ms after correct answer.

### Example

```tsx
<StepLayout varName="progress" showProgress={false}>
    {/* Question gates the flow */}
    <Step completionVarName="answer" autoAdvance>
        <Block id="block-q" padding="sm">
            <EditableParagraph id="para-q" blockId="block-q">
                What is 3 × 4?{" "}
                <InlineClozeInput varName="answer" correctAnswer="12" ... />
            </EditableParagraph>
        </Block>
    </Step>

    {/* Revealed after correct answer */}
    <Step>
        <Block id="block-1" padding="sm">
            <EditableParagraph id="para-1" blockId="block-1">
                That's right! Continue to the next topic.
            </EditableParagraph>
        </Block>
    </Step>

    {/* Gated step — button disabled until activity is done */}
    <Step completionVarName="task2">
        <Block id="block-2" padding="sm">
            <EditableParagraph id="para-2" blockId="block-2">
                Fill in:{" "}
                <InlineClozeInput varName="task2" correctAnswer="yes" ... />
            </EditableParagraph>
        </Block>
    </Step>
</StepLayout>
```

---

## Questions?

The layout system is designed to be intuitive and flexible. For more examples, see `/src/data/sections.tsx` which demonstrates all layout types in action.
