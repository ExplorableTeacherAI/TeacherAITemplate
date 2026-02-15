/**
 * Annotation System
 *
 * A standardized system for interactive paragraph elements.
 *
 * Categories:
 * - Informational: Hoverable, Glossary, Whisper
 * - Mutable: Toggle
 * - Validatable: MultiChoice (for fill-in-the-blank, use InlineClozeInput from @/components/atoms)
 * - Connective: Linked, Trigger
 *
 * Visual Style Guide:
 * - Solid underline ─────── : Draggable values
 * - Dashed underline - - -  : Toggleable states (Toggle)
 * - Dotted underline ······ : Definitions (Glossary, Linked)
 * - No underline (color)    : Tooltips (Hoverable, Whisper)
 * - Background highlight    : Quiz inputs (MultiChoice)
 */

// Components
export { Hoverable } from './Hoverable';
export { Glossary } from './Glossary';
export { Whisper } from './Whisper';
export { Toggle } from './Toggle';
export { MultiChoice } from './MultiChoice';
export { Linked, LinkedProvider, useLinkedContext, useActiveLink, useSetActiveLink } from './Linked';
export { Trigger } from './Trigger';

// Types
export * from './types';

// Styles - import this in your app
import './annotations.css';
