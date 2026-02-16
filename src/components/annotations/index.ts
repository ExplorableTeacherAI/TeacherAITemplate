/**
 * Annotation System
 *
 * A standardized system for interactive paragraph elements.
 *
 * Categories:
 * - Informational: Glossary, Whisper (Hoverable has been replaced by InlineTooltip in @/components/atoms)
 * - Mutable: (Toggle has been replaced by InlineToggle in @/components/atoms)
 * - Connective: Linked (Trigger has been replaced by InlineTrigger in @/components/atoms)
 *
 * For fill-in-the-blank / quiz interactions, use InlineClozeInput and
 * InlineClozeChoice from @/components/atoms instead.
 *
 * For tooltips on hover, use InlineTooltip from @/components/atoms instead.
 *
 * Visual Style Guide:
 * - Solid underline ─────── : Draggable values
 * - Dashed underline - - -  : Toggleable states (use InlineToggle from atoms)
 * - Dotted underline ······ : Definitions (Glossary, Linked)
 * - No underline (color)    : Tooltips (use InlineTooltip from atoms, Whisper)
 */

// Components
export { Glossary } from './Glossary';
export { Whisper } from './Whisper';
export { Linked, LinkedProvider, useLinkedContext, useActiveLink, useSetActiveLink } from './Linked';

// Types
export * from './types';

// Styles - import this in your app
import './annotations.css';
