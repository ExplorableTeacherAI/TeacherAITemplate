/**
 * Annotation System
 *
 * A standardized system for interactive paragraph elements.
 *
 * Categories:
 * - Informational: Hoverable, Glossary, Whisper
 * - Mutable: (Toggle has been replaced by InlineToggle in @/components/atoms)
 * - Connective: Linked, Trigger
 *
 * For fill-in-the-blank / quiz interactions, use InlineClozeInput and
 * InlineClozeChoice from @/components/atoms instead.
 *
 * Visual Style Guide:
 * - Solid underline ─────── : Draggable values
 * - Dashed underline - - -  : Toggleable states (use InlineToggle from atoms)
 * - Dotted underline ······ : Definitions (Glossary, Linked)
 * - No underline (color)    : Tooltips (Hoverable, Whisper)
 */

// Components
export { Hoverable } from './Hoverable';
export { Glossary } from './Glossary';
export { Whisper } from './Whisper';
export { Linked, LinkedProvider, useLinkedContext, useActiveLink, useSetActiveLink } from './Linked';
export { Trigger } from './Trigger';

// Types
export * from './types';

// Styles - import this in your app
import './annotations.css';
