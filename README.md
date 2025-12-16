# MathVibe Template

Welcome to the **MathVibe Template**! This repository is designed to help you build interactive, explorable educational content with ease. It provides a structured way to create lessons, visualizations, and interactive components using React and a pre-built layout system.

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
│   ├── sections/        # Individual section components for modularity
│   ├── sections.tsx     # 🛑 MAIN ENTRY: Array of sections to render
│   └── exampleSections.tsx # Reference examples for all layouts
├── hooks/               # Custom React hooks
├── lib/                 # Utilities and helper functions
├── pages/               # Top-level application pages (Index, NotFound)
└── main.tsx             # Application entry point
```

### Key Files in Detail

- **`src/data/sections.tsx`**: 🛑 **START HERE**. This is the main entry point for your lesson content. The `sections` array in this file determines what is rendered on the page.
- **`src/data/exampleSections.tsx`**: A reference file containing comprehensive examples of all available layouts and extensive component usage. Use this for inspiration!
- **`src/components/layouts/*`**: Contains the core layout components (`FullWidthLayout`, `SplitLayout`, `GridLayout`, `SidebarLayout`).
- **`src/components/templates/Section.tsx`**: The core wrapper component for all content blocks.
- **`src/components/atoms/ui`**: Reusable UI components (Buttons, Inputs, etc.) built with Tailwind CSS.

---

## 🛠️ How to Make Content

Creating content involves three simple steps: **Create**, **Layout**, and **Register**.

### 1. Create a Section via `<Section>`

The `<Section>` component is the fundamental building block. It wraps your content and provides necessary hooks for the AI agent (like highlighting and context awareness).

**Props:**
- `id` (required): A unique string identifier for the section (e.g., "intro-text", "simulation-1").
- `padding` (optional): "none" | "sm" | "md" | "lg" (default: "md").

```tsx
import { Section } from "@/components/templates";

const MyContent = () => (
  <Section id="my-unique-section-id">
    <h1 className="text-2xl font-bold">Hello World</h1>
    <p>This is my first section.</p>
  </Section>
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

<FullWidthLayout maxWidth="xl">
  <Section id="header">
    <h1>Chapter 1: The Beginning</h1>
  </Section>
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

<SplitLayout ratio="1:1" gap="lg" align="start">
  <Section id="explanation">
    <p>On the right, you can see the atom structure...</p>
  </Section>
  <Section id="visualization">
    <MyAtomVisualizer />
  </Section>
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

<GridLayout columns={3} gap="md">
  <Section id="card-1">Card 1</Section>
  <Section id="card-2">Card 2</Section>
  <Section id="card-3">Card 3</Section>
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

<SidebarLayout sidebarPosition="left" sidebarWidth="medium">
  <Sidebar>
    <Section id="tools">Toolbox</Section>
  </Sidebar>
  <Main>
    <Section id="content">Main Lesson Content...</Section>
  </Main>
</SidebarLayout>
```

### 3. Register in `sections.tsx`

Finally, add your configured layout to the `sections` array in `src/data/sections.tsx`.

```tsx
// src/data/sections.tsx
import { type ReactElement } from "react";
import { FullWidthLayout, SplitLayout } from "@/components/layouts";
import { Section } from "@/components/templates";

export const sections: ReactElement[] = [
  <FullWidthLayout key="intro" maxWidth="xl">
    <Section id="intro-content">
      <h1>Welcome</h1>
    </Section>
  </FullWidthLayout>,

  <SplitLayout key="demo" ratio="1:1">
     {/* ... content ... */}
  </SplitLayout>
];
```

---

## 🧩 Reusability & specialized Components

To keep `sections.tsx` clean, it is highly recommended to **define complex sections in separate files** and import them.

**Example Pattern:**

1. Create `src/data/sections/MyTopicDemo.tsx`:
   ```tsx
   export const myTopicSection = <Section id="topic">...</Section>;
   ```
2. Import in `src/data/sections.tsx`:
   ```tsx
   import { myTopicSection } from "./sections/MyTopicDemo";
   
   export const sections = [
       <FullWidthLayout>{myTopicSection}</FullWidthLayout>
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

## ⚡ Development Tips

- **Run Dev Server**: `npm run dev`
- **Toggle Examples**: Check your `.env` file. Set `VITE_SHOW_EXAMPLES=true` to see the built-in demo content instead of your `sections.tsx` content. This is great for reference!
- **Hot Reloading**: Changes to `sections.tsx` and components reflect instantly.

---

## 🤖 Agent Instructions (for AI)

If you are an AI agent working on this repo:
1. **Always read `src/data/sections.tsx`** first to see the current content structure.
2. **Check `src/data/exampleSections.tsx`** if you need to know how to implement a specific layout or interactive component.
3. When asked to "add a section", **create the component first**, then wrap it in an appropriate **Layout**, and finally add it to the `sections` array.
4. Use **unique IDs** for every `<Section>`.
5. Prefer **splitting complex code** into separate files in `src/components` or `src/data/sections` rather than dumping everything into `sections.tsx`.
