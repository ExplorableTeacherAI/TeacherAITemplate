# Layout System

A flexible, composable layout system for organizing educational content sections. This system allows you to control how sections are arranged on the page using dedicated layout components.

## Philosophy

**Sections Inside Layouts** - Rather than each section defining its own layout, we use dedicated layout components that wrap sections. This provides:

- ✅ **Maximum flexibility** - compose multiple sections in different layouts
- ✅ **Separation of concerns** - content is separate from presentation
- ✅ **Reusable sections** - same section can appear in different layouts
- ✅ **Better composition** - easily create complex page structures

## Available Layouts

### 1. FullWidthLayout

Default layout that takes full container width with optional max-width constraints.

```tsx
<FullWidthLayout maxWidth="xl">
    <Section id="intro">
        <h1>Introduction</h1>
        <p>Content goes here...</p>
    </Section>
</FullWidthLayout>
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

### 4. SidebarLayout

Layout with a sidebar and main content area. Sidebar can stick while scrolling.

```tsx
<SidebarLayout sidebarPosition="left" sidebarWidth="medium" gap="lg">
    <Sidebar>
        <Section id="glossary">
            <h3>Key Concepts</h3>
            <ul>...</ul>
        </Section>
    </Sidebar>
    <Main>
        <Section id="main-content">
            <h2>Main Content</h2>
            <p>...</p>
        </Section>
    </Main>
</SidebarLayout>
```

**Props:**
- `sidebarPosition?: "left" | "right"` - Position of sidebar
- `sidebarWidth?: "narrow" | "medium" | "wide"` - Width of sidebar
- `gap?: "none" | "sm" | "md" | "lg" | "xl"` - Space between sidebar and main
- `stickySidebar?: boolean` - Whether sidebar should stick while scrolling (default: true)
- `className?: string` - Custom CSS classes

**Special Components:**
- `<Sidebar>` - Wraps sidebar content
- `<Main>` - Wraps main content

**Use when:**
- Persistent navigation
- Glossaries or vocabulary
- Table of contents
- Related links or resources

**Responsive:** Sidebar moves to top on mobile devices.

---

## Usage Examples

### Basic Page Structure

```tsx
import { FullWidthLayout, SplitLayout } from '@/components/layouts';
import { Section } from '@/components/templates';

export const sections = [
    // Intro
    <FullWidthLayout maxWidth="xl">
        <Section id="intro">
            <h1>Chapter 1: Introduction</h1>
            <p>Welcome to the lesson...</p>
        </Section>
    </FullWidthLayout>,
    
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
    <FullWidthLayout maxWidth="xl">
        <Section id="intro">...</Section>
    </FullWidthLayout>,
    
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
    
    // Sidebar for deep dive
    <SidebarLayout>
        <Sidebar><Section id="toc">...</Section></Sidebar>
        <Main><Section id="content">...</Section></Main>
    </SidebarLayout>,
];
```

### Nested Sections

You can include multiple sections within a layout or within a single sidebar/main area:

```tsx
<SidebarLayout>
    <Sidebar>
        <Section id="glossary">Glossary</Section>
        <Section id="navigation">Navigation</Section>
    </Sidebar>
    <Main>
        <Section id="intro">Introduction</Section>
        <Section id="content">Main Content</Section>
    </Main>
</SidebarLayout>
```

---

## Responsive Behavior

All layouts are responsive by default:

| Layout | Desktop | Tablet | Mobile |
|--------|---------|--------|--------|
| **FullWidthLayout** | Max-width constrained | Max-width constrained | Full width |
| **SplitLayout** | Two columns | Two columns | Single column (stacked) |
| **GridLayout** | N columns | Auto-reduced | 1-2 columns |
| **SidebarLayout** | Side by side | Side by side | Stacked (sidebar on top) |

---

## Best Practices

### 1. Choose the Right Layout

- **FullWidthLayout**: Default choice for most content
- **SplitLayout**: When pairing related content (theory + practice)
- **GridLayout**: When showcasing multiple similar items
- **SidebarLayout**: When persistent context is helpful

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

- **StackLayout**: Vertical stacking with customizable spacing
- **TabLayout**: Tabbed content areas
- **AccordionLayout**: Collapsible sections
- **HeroLayout**: Full-screen hero sections
- **CompareLayout**: Side-by-side comparison tables
- **TimelineLayout**: Chronological content flow

---

## Questions?

The layout system is designed to be intuitive and flexible. For more examples, see `/src/data/sections.tsx` which demonstrates all layout types in action.
