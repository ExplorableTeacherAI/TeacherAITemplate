# MathVibe Template

Welcome to the **MathVibe Template**! This repository is designed to help you build interactive, explorable educational content with ease. It provides a structured way to create lessons, visualizations, and interactive components using pre-built components in React.

## 🚀 Overview

This template allows agents and developers to:
- Quickly scaffold educational "sections".
- Organize content using flexible **Layouts**.
- Integrate interactive components (Two.js, Three.js, Desmos, etc.).
- Maintain a clean separation between content configuration and component logic.

---

## 📂 Project Structure

Here is an overview of the file structure and key directories:

```text
src/
├── components/          # React components organized by complexity
│   ├── atoms/           # Basic UI building blocks (Buttons, Inputs, etc.)
│   ├── molecules/       # Compound components (Search bars, Cards)
│   ├── organisms/       # Complex widgets (Graphs, Chat interfaces)
│   ├── layouts/         # Layout wrappers (FullWidth, Split, Grid, Sidebar)
│   └── templates/       # Page-level structures and base Section component
├── data/                # Content configuration
│   ├── sections/        # Individual section components for modularity (You will create new files here)
│   ├── sections.tsx     # MAIN ENTRY: Array of sections to render (You will edit this file)
│   ├── variables.ts     # VARIABLES: Define shared variables here (You will edit this file)
│   ├── exampleSections.tsx # Reference examples for all layouts
│   └── exampleVariables.ts # Variables for example/demo sections
├── stores/              # Global state management (Zustand)
│   ├── index.ts         # Exports for useVar, useSetVar, etc.
│   └── variableStore.ts # The variable store implementation
├── hooks/               # Custom React hooks
├── lib/                 # Utilities and helper functions
├── pages/               # Top-level application pages (Index, NotFound)
└── main.tsx             # Application entry point
```

### Key Files in Detail

- **`src/data/sections.tsx`**: **START HERE**. This is the main entry point for your lesson content. The `sections` array in this file determines what is rendered on the page.
- **`src/data/variables.ts`**: **DEFINE VARIABLES HERE**. All variables must be defined in this file.
- **`src/data/exampleSections.tsx`**: A reference file containing comprehensive examples of all available layouts and extensive component usage. Use this for inspiration!
- **`src/data/exampleVariables.ts`**: Variables used by the example/demo sections.
- **`src/components/layouts/*`**: Contains the core layout components (`FullWidthLayout`, `SplitLayout`, `GridLayout`, `SidebarLayout`).
- **`src/components/templates/Section.tsx`**: The core wrapper component for all content blocks.
- **`src/components/atoms/ui`**: Reusable UI components (Buttons, Inputs, etc.) built with Tailwind CSS.

---

## 🛠️ How to Make Content

Creating content involves three simple steps: **Create**, **Layout**, and **Register**.

### 1. Create a Block with Editable Components

The `<Block>` component is the fundamental building block. It wraps your editable content and provides necessary hooks for the AI agent (like highlighting and context awareness). **All text content must use editable components** for proper tracking and editing.

**Block Props:**
- `id` (required): A unique string identifier for the block (e.g., "block-intro-01", "block-simulation-1").
- `padding` (optional): "none" | "sm" | "md" | "lg" (default: "md").

**Editable Component Props:**
- `id` (required): A unique identifier for the specific editable element (e.g., "h1-main-title", "para-intro-1").
- `sectionId` (required): References the parent Block's `id` for proper tracking.

```tsx
import { Block } from "@/components/templates";
import { EditableH1, EditableParagraph } from "@/components/atoms";

const MyContent = () => (
  <Block id="block-hello-world-01" padding="md">
    <EditableH1 id="h1-main-title" sectionId="block-hello-world-01">
      Hello World
    </EditableH1>
    <EditableParagraph id="para-intro-1" sectionId="block-hello-world-01">
      This is my first editable paragraph.
    </EditableParagraph>
  </Block>
);
```

### 2. Choose a Layout

We provide 4 powerful layouts to organize your sections.

#### A. FullWidthLayout
Best for titles, introductions, or large visualizations that need maximum space.

**Props:**
- `maxWidth`: `"none" | "md" | "lg" | "xl" | "2xl" | "full"` (default: `xl`)

```tsx
import { FullWidthLayout } from "@/components/layouts";
import { Block } from "@/components/templates";
import { EditableH1 } from "@/components/atoms";

<FullWidthLayout maxWidth="xl">
  <Block id="block-header-01" padding="md">
    <EditableH1 id="h1-chapter-title" sectionId="block-header-01">
      Chapter 1: The Beginning
    </EditableH1>
  </Block>
</FullWidthLayout>
```

#### B. SplitLayout
Perfect for "Explanation + Visualization" pairs. Side-by-side content.

**Props:**
- `ratio`: `"1:1" | "1:2" | "2:1" | "1:3" | "3:1" | "2:3" | "3:2"`
- `gap`: `"none" | "sm" | "md" | "lg" | "xl"`
- `reverse`: `boolean` (optional)
- `align`: `"start" | "center" | "end" | "stretch"`

```tsx
import { SplitLayout } from "@/components/layouts";
import { Block } from "@/components/templates";
import { EditableParagraph } from "@/components/atoms";

<SplitLayout ratio="1:1" gap="lg" align="start">
  <Block id="block-explanation-01" padding="md">
    <EditableParagraph id="para-atom-desc" sectionId="block-explanation-01">
      On the right, you can see the atom structure...
    </EditableParagraph>
  </Block>
  <Block id="block-visualization-01" padding="md">
    <MyAtomVisualizer />
  </Block>
</SplitLayout>
```

#### C. GridLayout
Great for cards, galleries, or multiple small items.

**Props:**
- `columns`: `2 | 3 | 4 | 5 | 6`
- `gap`: `"none" | "sm" | "md" | "lg" | "xl"`
- `align`: `"start" | "center" | "end" | "stretch"`

```tsx
import { GridLayout } from "@/components/layouts";
import { Block } from "@/components/templates";
import { EditableParagraph } from "@/components/atoms";

<GridLayout columns={3} gap="md">
  <Block id="block-card-01" padding="md">
    <EditableParagraph id="para-card-1" sectionId="block-card-01">
      Card 1
    </EditableParagraph>
  </Block>
  <Block id="block-card-02" padding="md">
    <EditableParagraph id="para-card-2" sectionId="block-card-02">
      Card 2
    </EditableParagraph>
  </Block>
  <Block id="block-card-03" padding="md">
    <EditableParagraph id="para-card-3" sectionId="block-card-03">
      Card 3
    </EditableParagraph>
  </Block>
</GridLayout>
```

#### D. SidebarLayout
Useful for persistent tools, glossaries, or navigation that stays visible while scrolling main content.

**Props:**
- `sidebarPosition`: `"left" | "right"`
- `sidebarWidth`: `"narrow" | "medium" | "wide"`
- `stickySidebar`: `boolean` (default: true)

```tsx
import { SidebarLayout, Sidebar, Main } from "@/components/layouts";
import { Block } from "@/components/templates";
import { EditableH2, EditableParagraph } from "@/components/atoms";

<SidebarLayout sidebarPosition="left" sidebarWidth="medium">
  <Sidebar>
    <Block id="block-tools-01" padding="md">
      <EditableH2 id="h2-tools-title" sectionId="block-tools-01">
        Toolbox
      </EditableH2>
    </Block>
  </Sidebar>
  <Main>
    <Block id="block-content-01" padding="md">
      <EditableParagraph id="para-main-content" sectionId="block-content-01">
        Main Lesson Content...
      </EditableParagraph>
    </Block>
  </Main>
</SidebarLayout>
```

### 3. Register in `sections.tsx`

Finally, add your configured layout to the `sections` array in `src/data/sections.tsx`.

```tsx
// src/data/sections.tsx
import { type ReactElement } from "react";
import { FullWidthLayout, SplitLayout } from "@/components/layouts";
import { Block } from "@/components/templates";
import { EditableH1, EditableParagraph } from "@/components/atoms";

export const sections: ReactElement[] = [
  <FullWidthLayout key="layout-intro-01" maxWidth="xl">
    <Block id="block-intro-01" padding="md">
      <EditableH1 id="h1-welcome" sectionId="block-intro-01">
        Welcome
      </EditableH1>
    </Block>
  </FullWidthLayout>,

  <SplitLayout key="layout-demo-01" ratio="1:1">
     {/* ... content with Block and editable components ... */}
  </SplitLayout>
];
```

---

## 🧩 Reusability & specialized Components

To keep `sections.tsx` clean, it is highly recommended to **define complex sections in separate files** and import them.

**Example Pattern:**

1. Create `src/data/sections/MyTopicDemo.tsx`:
   ```tsx
   import { Block } from "@/components/templates";
   import { EditableH2, EditableParagraph } from "@/components/atoms";
   
   export const myTopicSection = (
     <Block id="block-my-topic-01" padding="md">
       <EditableH2 id="h2-topic-title" sectionId="block-my-topic-01">
         My Topic
       </EditableH2>
       <EditableParagraph id="para-topic-intro" sectionId="block-my-topic-01">
         This is the introduction to my topic.
       </EditableParagraph>
     </Block>
   );
   ```
2. Import in `src/data/sections.tsx`:
   ```tsx
   import { myTopicSection } from "./sections/MyTopicDemo";
   import { FullWidthLayout } from "@/components/layouts";
   
   export const sections = [
       <FullWidthLayout key="layout-topic-01">{myTopicSection}</FullWidthLayout>
   ];
   ```

### Specialized Components
You can find specialized "molecule" and "organism" components in `src/components`.
- **`src/components/molecules`**: Compound components like search bars or specialized cards.
- **`src/components/organisms`**: Complex widgets like interactive graphs or chat interfaces.

---

## 🎨 Styling

- **Tailwind CSS**: Use utility classes for almost all styling needs (`className="p-4 bg-gray-100 rounded"`).
- **Icons**: We use `lucide-react` for icons.
- **Theme**: Colors and variables are defined in `src/index.css`.

---

## 🔗 Cross-Section Variables

Share state between different sections using the global variable store. This is essential for creating interactive lessons where changing a value in one section updates visualizations in another.

### Key Files

| File | Purpose |
|------|---------|
| `src/data/variables.ts` | **Define ALL variables here (Required)** |
| `src/data/exampleVariables.ts` | Variables for example/demo sections |
| `src/stores/variableStore.ts` | The Zustand store (don't modify) |

### 1. Define Variables in `variables.ts`

```typescript
// src/data/variables.ts
export const variableDefinitions: Record<string, VariableDefinition> = {
    // NUMBER - Use with sliders
    amplitude: {
        defaultValue: 1,
        type: 'number',
        label: 'Amplitude',
        description: 'Wave amplitude',
        min: 0, max: 5, step: 0.1,
    },

    // TEXT - Free text input
    lessonTitle: {
        defaultValue: 'My Lesson',
        type: 'text',
        label: 'Title',
        placeholder: 'Enter a title...',
    },

    // SELECT - Dropdown with options
    waveType: {
        defaultValue: 'sine',
        type: 'select',
        label: 'Wave Type',
        options: ['sine', 'cosine', 'square'],
    },

    // BOOLEAN - Toggle switch
    showGrid: {
        defaultValue: true,
        type: 'boolean',
        label: 'Show Grid',
    },

    // ARRAY - List of numbers
    dataPoints: {
        defaultValue: [1, 4, 9, 16],
        type: 'array',
        label: 'Data Points',
    },

    // OBJECT - Complex data
    graphSettings: {
        defaultValue: { xMin: -10, xMax: 10 },
        type: 'object',
        schema: '{ xMin: number, xMax: number }',
    },
};
```

### 2. Use Variables in Sections

```tsx
import { useVar, useSetVar } from '@/stores';

// READING a variable (reactive - auto-updates when value changes)
const amplitude = useVar('amplitude', 1);
const title = useVar('lessonTitle', 'Default');
const showGrid = useVar('showGrid', true);

// SETTING a variable
const setVar = useSetVar();
setVar('amplitude', 2.5);
setVar('lessonTitle', 'New Title');
setVar('showGrid', false);
```

### 3. Example: Linked Slider and Visualization

**Section A - Controls:**
```tsx
const ControlPanel = () => {
    const setVar = useSetVar();
    const amplitude = useVar('amplitude', 1);

    return (
        <Slider
            value={[amplitude]}
            onValueChange={([v]) => setVar('amplitude', v)}
        />
    );
};
```

**Section B - Visualization:**
```tsx
const WaveDisplay = () => {
    const amplitude = useVar('amplitude', 1);
    
    // amplitude updates automatically when slider moves!
    return <WaveGraph amplitude={amplitude} />;
};
```

### Variable Type Reference

| Type | Default Example | UI Component |
|------|-----------------|--------------|
| `number` | `5` | Slider |
| `text` | `'Hello'` | Input |
| `select` | `'option1'` | Dropdown |
| `boolean` | `true` | Switch/Toggle |
| `array` | `[1, 2, 3]` | Custom |
| `object` | `{ x: 0, y: 0 }` | Custom |

---



## ✏️ Editable Components

To make content editable within the application (so users can tweak the lesson text without changing code), you **must** use editable component wrappers. Each editable component requires both an `id` and `sectionId` prop for proper tracking.

### Available Editable Components

- `EditableH1`, `EditableH2`, `EditableH3` - Editable headings
- `EditableParagraph` - Editable paragraph text
- `InlineScrubbleNumber` - Interactive inline numeric values that can be dragged

### Basic Usage

```tsx
import { Block } from "@/components/templates";
import { EditableH1, EditableH2, EditableParagraph } from "@/components/atoms";

<Block id="block-example-01" padding="md">
  <EditableH1 id="h1-title" sectionId="block-example-01">
    My Editable Title
  </EditableH1>
  <EditableH2 id="h2-subtitle" sectionId="block-example-01">
    My Subtitle
  </EditableH2>
  <EditableParagraph id="para-intro" sectionId="block-example-01">
    This paragraph can be edited by clicking on it in Editor Mode.
  </EditableParagraph>
</Block>
```

### Inline Components in Paragraphs

You can embed interactive components like `InlineScrubbleNumber` within paragraphs:

```tsx
import { Block } from "@/components/templates";
import { EditableParagraph, InlineScrubbleNumber } from "@/components/atoms";

<Block id="block-physics-01" padding="md">
  <EditableParagraph id="para-velocity" sectionId="block-physics-01">
    The object is moving at{" "}
    <InlineScrubbleNumber
      varName="velocity"
      defaultValue={20}
      min={0}
      max={100}
      step={1}
      formatValue={(v) => `${v} m/s`}
    />
    {" "}through the air.
  </EditableParagraph>
</Block>
```

### ID Naming Conventions

- **Block IDs**: Use format `block-<description>-<number>` (e.g., `block-intro-01`, `block-physics-demo-02`)
- **Editable Component IDs**: Use format `<type>-<description>` (e.g., `h1-main-title`, `para-intro-1`, `h2-section-heading`)
- Each ID must be **unique** across the entire application
- `sectionId` must match the parent Block's `id`

---

## 🤖 Agent Instructions (for AI)

If you are an AI agent working on this repo:
1. **Always read `src/data/sections.tsx`** first to see the current content structure.
2. **Always read `src/data/variables.ts`** to see available shared variables.
3. **Check `src/data/exampleSections.tsx`** for comprehensive reference examples but do not modify it.
4. **Shared Variables ONLY**: Do not use `useState` for any lesson content or interactive state. **ALWAYS** define variables in `src/data/variables.ts` and use `useVar` / `useSetVar`.
5. **Block-Based Approach**: All content MUST be wrapped in `<Block>` components with unique IDs.
6. **Editable Components ALWAYS**: Every piece of text (headings, paragraphs) **MUST** use editable component wrappers:
   - Use `EditableH1`, `EditableH2`, `EditableH3` for headings
   - Use `EditableParagraph` for paragraph text
   - Import from `@/components/atoms`
7. **ID Requirements**:
   - Every `<Block>` must have a unique `id` prop (format: `block-<description>-<number>`)
   - Every editable component must have:
     - A unique `id` prop (format: `<type>-<description>`)
     - A `sectionId` prop matching its parent Block's `id`
8. **Inline Components**: Use `InlineScrubbleNumber` for interactive numeric values within paragraphs.
9. When asked to "add a section", **create the Block with editable components first**, wrap it in a **Layout**, and add it to `sections.tsx`.
10. Prefer **splitting complex code** into separate files in `src/data/sections/`.

