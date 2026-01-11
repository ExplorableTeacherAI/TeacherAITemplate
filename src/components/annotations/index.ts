/**
 * Annotation System
 * 
 * A standardized system for interactive paragraph elements.
 * 
 * Categories:
 * - Informational: Hoverable, Glossary, Whisper
 * - Mutable: Stepper, Toggle
 * - Validatable: FillBlank, MultiChoice
 * - Connective: Linked, Trigger
 * 
 * Visual Style Guide:
 * - Solid underline ─────── : Draggable values (Stepper)
 * - Dashed underline - - -  : Toggleable states (Toggle)
 * - Dotted underline ······ : Definitions (Glossary, Linked)
 * - No underline (color)    : Tooltips (Hoverable, Whisper)
 * - Background highlight    : Quiz inputs (FillBlank, MultiChoice)
 */

// Components
export { Hoverable } from './Hoverable';
export { Glossary } from './Glossary';
export { Whisper } from './Whisper';
export { Stepper } from './Stepper';
export { Toggle } from './Toggle';
export { FillBlank } from './FillBlank';
export { MultiChoice } from './MultiChoice';
export { Linked, LinkedProvider, useLinkedContext, useActiveLink, useSetActiveLink } from './Linked';
export { Trigger } from './Trigger';

// Types
export * from './types';

// Styles - import this in your app
import './annotations.css';
