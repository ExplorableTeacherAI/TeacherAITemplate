# TeacherAI Template

A flexible, modern template for creating interactive educational content with live hot-reload support.

## ✨ Features

- 🔥 **Live Hot Reload** - Edit sections and see changes instantly without server restart
- 📝 **Multiple Section Types** - HTML, Desmos, GeoGebra, Mermaid, Excalidraw
- 🎨 **Tailwind CSS** - Modern, responsive styling
- 🧮 **MathJax Support** - Beautiful mathematical notation rendering
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

The app will start at `http://localhost:8080` (or next available port).

### Build for Production

```bash
npm run build
```

## 📝 Editing Sections

**The easiest way to add/edit content:**

1. Open `src/data/sections.ts`
2. Edit the `sections` array
3. Save the file
4. **Changes appear instantly!** ✨

See **[SECTIONS_GUIDE.md](./SECTIONS_GUIDE.md)** for examples and tips.

## 🏗️ Architecture

This template uses a flexible section loading architecture that supports:

- **Module Strategy (Default)** - TypeScript files with hot-reload
- **JSON Strategy** - Static JSON files or API endpoints
- **Custom Strategies** - Easy to extend

### Key Files

- `src/data/sections.ts` - Section content (edit here for live updates!)
- `src/lib/section-loader.ts` - Section loading logic
- `src/config/sections-loader.config.ts` - Configuration
- `src/components/Canvas.tsx` - Main canvas component
- `src/components/SectionCanvas.tsx` - Section rendering
- `src/components/SectionBlock.tsx` - Individual section component

See **[ARCHITECTURE.md](./ARCHITECTURE.md)** for detailed documentation.

## 📚 Documentation

- **[SECTIONS_GUIDE.md](./SECTIONS_GUIDE.md)** - Quick reference for editing sections
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Detailed architecture documentation

## 🎯 Section Types

### HTML Sections
Basic HTML content with MathJax support for mathematical notation.

### Desmos Sections
Interactive mathematical graphs and calculators.

### GeoGebra Sections
Dynamic geometry, algebra, and calculus applets.

### Mermaid Sections
Flowcharts, diagrams, and visualizations.

### Excalidraw Sections
Hand-drawn style diagrams.

## 🔧 Configuration

### Switching Loading Strategies

Edit `src/config/sections-loader.config.ts`:

```typescript
// Use TypeScript module (hot-reload)
export default { strategy: 'module' }

// Or use JSON file
export default { strategy: 'json-public', url: '/sections.json' }

// Or use API endpoint
export default { strategy: 'json-api', url: '/api/sections' }
```

## 🛠️ Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Shadcn/ui** - UI components
- **MathJax** - Math rendering
- **Desmos API** - Interactive graphs
- **GeoGebra API** - Dynamic geometry
- **Mermaid** - Diagrams
- **Excalidraw** - Hand-drawn diagrams

## 📖 Usage Examples

### Adding Math Content

```typescript
{
  id: "quadratic",
  type: "html",
  title: "Quadratic Formula",
  content: `
    <div class="mathjax-process">
      <p>The quadratic formula is:</p>
      <p>$$x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}$$</p>
    </div>
  `,
}
```

### Adding Interactive Graph

```typescript
{
  id: "graph",
  type: "desmos",
  title: "Parabola",
  content: `{
    "expressions": [
      { "latex": "y=x^2", "color": "#c74440" }
    ]
  }`,
}
```

## 🤝 Contributing

1. Edit sections in `src/data/sections.ts`
2. Changes are automatically visible in development
3. Test your changes
4. Commit and push

## 📄 License

MIT License - see LICENSE file for details

## 🙋 Support

For questions or issues, see the documentation files:
- [Sections Guide](./SECTIONS_GUIDE.md)
- [Architecture Documentation](./ARCHITECTURE.md)

---

**Happy Teaching! 🎓**
