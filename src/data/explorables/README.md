# Tutor Explorables

One file per mini explorable explanation generated during an AI tutor session.

## File template (`src/data/explorables/<id>.tsx`)

```tsx
import { type ReactElement } from "react";
import { Block } from "@/components/templates";
import { StackLayout } from "@/components/layouts";
import { EditableH2, EditableParagraph, InlineScrubbleNumber } from "@/components/atoms";
import { registerVariables } from "@/stores";
import { type VariableDefinition, numberPropsFromDefinition } from "../variables";

// Every variable name MUST be prefixed with the explorable id (camelCase)
// to avoid collisions with other explorables in the same session.
const defs: Record<string, VariableDefinition> = {
    fractionBars_numerator: {
        defaultValue: 1, type: "number", label: "Numerator",
        min: 0, max: 8, step: 1, color: "#62D0AD",
    },
};
registerVariables(defs);

export const blocks: ReactElement[] = [
    <StackLayout key="layout-fraction-bars-title" maxWidth="xl">
        <Block id="fraction-bars-title" padding="md">
            <EditableH2 id="h2-fraction-bars-title" blockId="fraction-bars-title">
                Fraction bars
            </EditableH2>
        </Block>
    </StackLayout>,
    // ... 2-5 blocks total, at most one visualization
];
```

Then register it in `src/data/explorables.tsx`:

```tsx
import { blocks as fractionBarsBlocks } from "./explorables/fraction-bars";
// inside the record:
"fraction-bars": { blocks: fractionBarsBlocks, title: "Fraction bars" },
```

Rules:
- Follow ALL design rules from the project CLAUDE.md (interactivity, one
  component per Block, soft colors, hierarchical IDs, hints, ...).
- Keep it SMALL: 2-5 blocks, at most one visualization.
- Use `registerVariables` (NOT `useVariableStore.getState().initialize`,
  which only works once per app load).
- Never modify `src/data/blocks.tsx` or `src/data/variables.ts`.
