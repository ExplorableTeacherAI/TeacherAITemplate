/**
 * Annotation System Types
 * 
 * This file defines the core types and interfaces for the annotation system.
 * Annotations are categorized by their purpose:
 * 
 * 1. Informational - Reveals information on hover
 * 2. Mutable - Values that can be changed
 * 3. Validatable - Quiz/input interactions
 * 4. Connective - Links text to visuals
 * 5. Draggable - Spatial manipulation
 */

// ============================================================================
// ANNOTATION CATEGORIES
// ============================================================================

export type AnnotationCategory =
    | 'informational'  // Reveals info on hover
    | 'mutable'        // Can be changed
    | 'validatable'    // Quiz/input
    | 'connective'     // Links to visuals
    | 'draggable';     // Can be moved

// ============================================================================
// UNDERLINE STYLES
// ============================================================================

export type UnderlineStyle =
    | 'none'           // No underline (color only)
    | 'solid'          // ─────── Draggable values
    | 'dashed'         // - - - - Toggleable states
    | 'dotted'         // ······· Definitions
    | 'wavy'           // ~~~~~~~ Continuous sliders
    | 'double';        // ═══════ Precision controls

// ============================================================================
// BASE ANNOTATION PROPS
// ============================================================================

export interface BaseAnnotationProps {
    /** Unique identifier for the annotation */
    id?: string;
    /** Custom CSS class */
    className?: string;
    /** Primary color for the annotation */
    color?: string;
    /** Background/glow color */
    bgColor?: string;
    /** Underline style */
    underline?: UnderlineStyle;
}

// ============================================================================
// CATEGORY: INFORMATIONAL
// ============================================================================

// Note: HoverableProps has been removed. Use InlineTooltip from @/components/atoms instead.

export interface GlossaryProps extends BaseAnnotationProps {
    /** The term to display */
    term: string;
    /** Definition text */
    definition: string;
    /** Optional pronunciation */
    pronunciation?: string;
    /** Optional related terms */
    relatedTerms?: string[];
}

export interface WhisperProps extends BaseAnnotationProps {
    /** The visible text */
    children: React.ReactNode;
    /** The hidden content revealed on hover */
    hiddenContent: React.ReactNode;
    /** Initial opacity of the text */
    initialOpacity?: number;
}

// ============================================================================
// CATEGORY: MUTABLE
// ============================================================================

export interface ScrubberProps extends BaseAnnotationProps {
    /** Current value */
    value?: number;
    /** Initial value */
    initialValue?: number;
    /** Minimum value */
    min?: number;
    /** Maximum value */
    max?: number;
    /** Step increment */
    step?: number;
    /** Decimal precision */
    precision?: number;
    /** Scrub sensitivity (pixels per step) */
    sensitivity?: number;
    /** Callback when value changes */
    onChange?: (value: number) => void;
}

// ============================================================================
// CATEGORY: VALIDATABLE
// Note: FillBlank and MultiChoice have been replaced by InlineClozeInput
// and InlineClozeChoice in @/components/atoms.
// ============================================================================

export interface SortableProps extends BaseAnnotationProps {
    /** Items to sort */
    items: string[];
    /** Correct order (array of indices) */
    correctOrder?: number[];
    /** Callback when order changes */
    onChange?: (items: string[], isCorrect: boolean) => void;
}

// ============================================================================
// CATEGORY: CONNECTIVE
// ============================================================================

export interface LinkedProps extends BaseAnnotationProps {
    /** Unique link ID for bidirectional highlighting */
    linkId: string;
    /** Content to display */
    children: React.ReactNode;
    /** Callback when hovered */
    onHoverStart?: (linkId: string) => void;
    /** Callback when hover ends */
    onHoverEnd?: (linkId: string) => void;
    /** Callback when clicked */
    onClick?: (linkId: string) => void;
    /** Whether currently active */
    isActive?: boolean;
    /** Dim other elements when active */
    dimOthers?: boolean;
}

// Note: TriggerProps has been removed. Use InlineTrigger from @/components/atoms instead.
// Note: FocusProps has been removed. Use InlineHyperlink with targetBlockId from @/components/atoms instead.

// ============================================================================
// CATEGORY: DRAGGABLE
// ============================================================================

export interface DragWordProps extends BaseAnnotationProps {
    /** The word/content to drag */
    children: React.ReactNode;
    /** Drag data identifier */
    dragId: string;
    /** Valid drop zones */
    dropZones?: string[];
    /** Callback when dropped */
    onDrop?: (dropZoneId: string) => void;
}

export interface MovableProps extends BaseAnnotationProps {
    /** Content to display */
    children: React.ReactNode;
    /** Initial position */
    initialPosition?: { x: number; y: number };
    /** Constrain to parent bounds */
    constrain?: boolean;
    /** Callback when position changes */
    onMove?: (position: { x: number; y: number }) => void;
}

// ============================================================================
// COLOR PALETTE
// ============================================================================

export const ANNOTATION_COLORS = {
    informational: {
        primary: '#F59E0B',     // Amber
        glow: 'rgba(245, 158, 11, 0.3)',
        bg: 'rgba(245, 158, 11, 0.15)',
    },
    mutable: {
        primary: '#D946EF',     // Fuchsia
        glow: 'rgba(217, 70, 239, 0.3)',
        bg: 'rgba(217, 70, 239, 0.15)',
    },
    validatable: {
        primary: '#3B82F6',     // Blue
        glow: 'rgba(59, 130, 246, 0.35)',
        bg: 'rgba(59, 130, 246, 0.15)',
    },
    connective: {
        primary: '#10B981',     // Emerald
        glow: 'rgba(16, 185, 129, 0.3)',
        bg: 'rgba(16, 185, 129, 0.15)',
    },
    draggable: {
        primary: '#6366F1',     // Indigo
        glow: 'rgba(99, 102, 241, 0.3)',
        bg: 'rgba(99, 102, 241, 0.15)',
    },
    // Status colors
    success: {
        primary: '#22C55E',     // Green
        glow: 'rgba(34, 197, 94, 0.3)',
        bg: 'rgba(34, 197, 94, 0.15)',
    },
    error: {
        primary: '#EF4444',     // Red
        glow: 'rgba(239, 68, 68, 0.3)',
        bg: 'rgba(239, 68, 68, 0.15)',
    },
} as const;

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type AnnotationColorKey = keyof typeof ANNOTATION_COLORS;

export interface AnnotationStyleConfig {
    category: AnnotationCategory;
    underline: UnderlineStyle;
    defaultColor: AnnotationColorKey;
}

// Mapping of annotation types to their style configuration
export const ANNOTATION_STYLE_CONFIG: Record<string, AnnotationStyleConfig> = {
    Glossary: { category: 'informational', underline: 'dotted', defaultColor: 'informational' },
    Whisper: { category: 'informational', underline: 'none', defaultColor: 'informational' },
    Scrubber: { category: 'mutable', underline: 'double', defaultColor: 'mutable' },
    Sortable: { category: 'validatable', underline: 'none', defaultColor: 'validatable' },
    Linked: { category: 'connective', underline: 'dotted', defaultColor: 'connective' },
    DragWord: { category: 'draggable', underline: 'dashed', defaultColor: 'draggable' },
    Movable: { category: 'draggable', underline: 'none', defaultColor: 'draggable' },
};
