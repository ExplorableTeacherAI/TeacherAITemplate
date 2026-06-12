/**
 * Explorables Registry
 * ====================
 *
 * Maps an explorable id to its block array. Each entry is a SMALL,
 * self-contained explorable explanation generated during an AI tutor
 * session and rendered standalone via the `?explorable=<id>` URL param
 * (see src/pages/ExplorableView.tsx).
 *
 * Conventions for each explorable (see src/data/explorables/README.md):
 * - One file per explorable in src/data/explorables/<id>.tsx
 * - The file exports a flat `blocks: ReactElement[]` array (Layout > Block)
 * - The file registers its own variables via `registerVariables` from
 *   '@/stores', with every variable name prefixed by the explorable id
 *   (camelCase), e.g. `fractionBars_numerator`
 * - Never modify src/data/blocks.tsx or src/data/variables.ts
 *
 * TUTOR AGENT: register each new explorable by adding an import and one
 * entry below. Never remove or modify existing entries.
 */
import { type ReactElement } from "react";

export interface ExplorableEntry {
    /** Flat array of Layout > Block elements (same shape as blocks.tsx) */
    blocks: ReactElement[];
    /** Short human-readable title */
    title?: string;
}

export const explorables: Record<string, ExplorableEntry> = {
    // Example (added by the tutor agent):
    // "fraction-bars": { blocks: fractionBarsBlocks, title: "Fraction bars" },
};
