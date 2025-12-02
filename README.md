# TeacherAI Template

A modern template for creating **interactive educational content** with a component-based architecture and live hot-reload support.

## ✨ Features

- 🧩 **Component-Based** - Use React components for type safety and flexibility
- 🔥 **Live Hot Reload** - Edit sections and see changes instantly
- 📝 **Rich Content Components** - Paragraph, MathBlock, Heading, DesmosGraph, GeoGebraGraph
- 🎨 **Tailwind CSS** - Modern, responsive styling
- 🧮 **MathJax Support** - Beautiful mathematical notation with LaTeX
- ⚡ **Vite** - Lightning-fast development experience
- 📦 **TypeScript** - Full type safety and IDE support

## 🚀 Quick Start

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will start at `http://localhost:8080`.

## 📝 Creating Content

Edit `src/data/sections.tsx` to create your educational content:

```tsx
import { Section } from "@/components/sections";
import { Paragraph, MathBlock, Heading, DesmosGraph } from "@/components/content";

export const sections = [
  <Section key="intro">
    <Heading level={1}>My Lesson Title</Heading>
    <Paragraph>
      Consider the equation $x^2 = mx + n$
    </Paragraph>
    <MathBlock equation={String.raw`x^2 = mx + n`} numbered="1" />
  </Section>,
  
  <Section key="viz">
    <DesmosGraph
      aspectRatio="16/9"
      expressions={[
        { latex: "y=x^2", color: "#c74440" }
      ]}
    />
  </Section>
];
```

Save and watch it hot-reload! ✨

## 📚 Component Reference

### Heading

```tsx
<Heading level={1}>Title</Heading>             // h1 - Large, bold
<Heading level={2}>Subtitle</Heading>          // h2
<Heading level={3}>Section</Heading>           // h3
```

### Paragraph

```tsx
<Paragraph>
  Plain text or text with inline math: $x^2 + y^2 = r^2$
</Paragraph>
```

### MathBlock

**Important:** Use `String.raw` for LaTeX equations to preserve backslashes!

```tsx
<MathBlock equation={String.raw`E = mc^2`} />

<MathBlock 
  equation={String.raw`x = \frac{-b \pm \sqrt{b^2-4ac}}{2a}`} 
  numbered="1" 
/>
```

### DesmosGraph

```tsx
// Responsive with aspect ratio (recommended)
<DesmosGraph
  aspectRatio="16/9"
  expressions={[
    { id: "a", latex: "a=1", sliderBounds: { min: 0, max: 5, step: 0.1 } },
    { latex: "y=a x^2", color: "#c74440" }
  ]}
/>

// Fixed height
<DesmosGraph
  height={400}
  expressions={[...]}
/>

// Auto height (uses 16:9)
<DesmosGraph
  height="auto"
  expressions={[...]}
/>
```

### GeoGebraGraph

```tsx
// Responsive with aspect ratio (recommended)
<GeoGebraGraph
  app="geometry"
  mode="applet"
  aspectRatio="16/9"
  params={{
    showMenuBar: false,
    showToolBar: false
  }}
  commands={[
    "A = (0, 0)",
    "B = (3, 4)",
    "Segment(A, B)"
  ]}
/>

// Fixed height
<GeoGebraGraph
  app="graphing"
  height={440}
  commands={[...]}
/>

// Auto height (uses 16:9)
<GeoGebraGraph
  height="auto"
  commands={[...]}
/>
```

### Spacer

```tsx
<Spacer height={16} />       // 16px
<Spacer height="2rem" />     // CSS units
```

### Section (Container)

```tsx
<Section key="unique-key" id="unique-id" padding="md">
  {/* Your content here */}
</Section>
```

**Padding options:** `"none"`, `"sm"`, `"md"` (default), `"lg"`

## 💡 Common Patterns

### Text + Equation

```tsx
<Section key="pythagorean">
  <Paragraph>The Pythagorean theorem states:</Paragraph>
  <MathBlock equation={String.raw`a^2 + b^2 = c^2`} numbered="1" />
</Section>
```

### Interactive Visualization

```tsx
<Section key="explore">
  <Paragraph>Adjust the parameter to explore:</Paragraph>
  <Spacer height={12} />
  <DesmosGraph
    aspectRatio="16/9"
    expressions={[
      { id: "a", latex: "a=1", sliderBounds: { min: 0, max: 5 } },
      { latex: "y=a x^2", color: "#c74440" }
    ]}
  />
</Section>
```

### Multi-Step Problem

```tsx
<Section key="steps">
  <Heading level={2}>Solution</Heading>
  
  <Heading level={3}>Step 1</Heading>
  <Paragraph>First, we identify...</Paragraph>
  <MathBlock equation={String.raw`...`} numbered="1" />
  
  <Spacer height={16} />
  
  <Heading level={3}>Step 2</Heading>
  <Paragraph>Then, we apply...</Paragraph>
</Section>
```

## 🏗️ Architecture

### File Structure

```
src/
├── data/
│   └── sections.tsx          # Your content (edit here!)
├── components/
│   ├── content/              # Content components
│   │   ├── Paragraph.tsx
│   │   ├── MathBlock.tsx
│   │   ├── Heading.tsx
│   │   ├── DesmosGraph.tsx
│   │   └── GeoGebraGraph.tsx
│   ├── sections/
│   │   └── Section.tsx       # Section wrapper
│   ├── LessonView.tsx        # Main lesson view
│   └── SectionRenderer.tsx   # Section renderer
└── lib/
    └── section-loader.ts     # Section loading with HMR
```

### Why Component-Based?

✅ **Type Safety** - TypeScript catches errors at compile time  
✅ **IDE Support** - Autocomplete, refactoring, inline docs  
✅ **Composition** - Combine components naturally with JSX  
✅ **Reusable** - Define once, use everywhere  
✅ **No JSON parsing** - Faster and fewer bugs  

## 🛠️ Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Shadcn/ui** - UI components
- **MathJax** - Math rendering
- **Desmos API** - Interactive graphs
- **GeoGebra API** - Dynamic geometry

## 💎 Best Practices

### 1. Always use `String.raw` for LaTeX

```tsx
// ❌ Wrong - backslashes get consumed
equation="x = \\frac{a}{b}"

// ✅ Correct - backslashes preserved
equation={String.raw`x = \frac{a}{b}`}
```

### 2. Use aspect ratio for responsive graphs

```tsx
// ✅ Responsive
<DesmosGraph aspectRatio="16/9" />

// ⚠️ Fixed (use only when necessary)
<DesmosGraph height={400} />
```

### 3. Always add unique keys

```tsx
<Section key="unique-key" id="unique-id">
  {/* content */}
</Section>
```

### 4. Use `$...$` for inline math

```tsx
<Paragraph>
  The derivative is $f'(x) = 2x$
</Paragraph>
```

## 🔧 Advanced Usage

### Custom Styling

```tsx
<Heading level={1} className="text-blue-600">
  Custom Color Title
</Heading>

<Section className="bg-gray-50 rounded-lg p-4">
  {/* content */}
</Section>
```

### Multiple Visualizations

```tsx
<Section key="comparison">
  <Heading level={2}>Comparison</Heading>
  
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <DesmosGraph aspectRatio="1/1" expressions={[...]} />
    <GeoGebraGraph height={400} commands={[...]} />
  </div>
</Section>
```

## 📖 Examples

Check `src/examples/sections-examples.tsx` for more comprehensive examples.

## 🐛 Troubleshooting

### MathJax not rendering

1. Check that LaTeX syntax is correct
2. Use `String.raw` for equations with backslashes
3. Make sure `enableMath={true}` (default)

### Components not hot-reloading

1. Restart dev server: `npm run dev`
2. Check for TypeScript errors in console
3. Clear browser cache

### Desmos not loading

1. Check browser console for API errors
2. Verify internet connection (Desmos API loads from CDN)

## 📄 License

MIT License

## 🎓 Support

For questions or issues, check the documentation in `src/examples/sections-examples.tsx` or review this README.

---

**Happy Teaching! 🚀**
