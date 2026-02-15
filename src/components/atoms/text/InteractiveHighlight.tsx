import React, { createContext, useContext, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

export interface HighlightStyle {
    /** Base color for the term */
    color: string;
    /** Background color when highlighted (default: color with 20% opacity) */
    highlightBg?: string;
    /** Underline style */
    underline?: 'none' | 'solid' | 'dashed' | 'dotted';
    /** Whether to show scale effect on highlight */
    scaleOnHighlight?: boolean;
}

export interface InteractiveHighlightContextValue {
    /** Currently active/highlighted term ID */
    activeId: string | null;
    /** Set the active term */
    setActiveId: (id: string | null) => void;
    /** Map of term IDs to their styles */
    styleMap: Record<string, HighlightStyle>;
}

// ============================================================================
// CONTEXT
// ============================================================================

const InteractiveHighlightContext = createContext<InteractiveHighlightContextValue | null>(null);

/**
 * Hook to access the interactive highlight context.
 * Returns null if not within a provider (allowing standalone usage).
 */
export const useInteractiveHighlight = () => {
    return useContext(InteractiveHighlightContext);
};

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

export interface InteractiveHighlightProviderProps {
    /** Map of term IDs to their color/style configuration */
    styleMap: Record<string, HighlightStyle | string>;
    /** Child components */
    children: React.ReactNode;
    /** Additional class name */
    className?: string;
}

/**
 * InteractiveHighlightProvider - Context provider for coordinating highlights.
 * 
 * Enables bidirectional highlighting between multiple InteractiveText components
 * and any external visualizations (diagrams, graphs, etc.).
 * 
 * @example
 * ```tsx
 * <InteractiveHighlightProvider styleMap={{
 *   'data': '#3b82f6',
 *   'model': '#22c55e',
 *   'train': { color: '#ec4899', underline: 'dotted' }
 * }}>
 *   <p>
 *     First we collect <InteractiveText id="data">training data</InteractiveText>,
 *     then build a <InteractiveText id="model">model</InteractiveText>.
 *   </p>
 *   <FlowDiagram ... />
 * </InteractiveHighlightProvider>
 * ```
 */
export const InteractiveHighlightProvider: React.FC<InteractiveHighlightProviderProps> = ({
    styleMap: inputStyleMap,
    children,
    className = '',
}) => {
    const [activeId, setActiveId] = useState<string | null>(null);

    // Normalize styleMap to always have HighlightStyle objects
    const styleMap = React.useMemo(() => {
        const normalized: Record<string, HighlightStyle> = {};
        for (const [key, value] of Object.entries(inputStyleMap)) {
            if (typeof value === 'string') {
                normalized[key] = { color: value };
            } else {
                normalized[key] = value;
            }
        }
        return normalized;
    }, [inputStyleMap]);

    return (
        <InteractiveHighlightContext.Provider value={{ activeId, setActiveId, styleMap }}>
            <div className={cn("interactive-highlight-provider", className)}>
                {children}
            </div>
        </InteractiveHighlightContext.Provider>
    );
};

// ============================================================================
// INTERACTIVE TEXT COMPONENT
// ============================================================================

export interface InteractiveTextProps {
    /** Unique identifier for this term (used for coordination) */
    id: string;
    /** Text content */
    children: React.ReactNode;
    /** Color (required if not using provider, optional if using provider) */
    color?: string;
    /** Whether this term is currently active (for external state control) */
    isActive?: boolean;
    /** Callback when hover starts (for external state control) */
    onHoverStart?: (id: string) => void;
    /** Callback when hover ends (for external state control) */
    onHoverEnd?: (id: string) => void;
    /** Callback when clicked */
    onClick?: (id: string) => void;
    /** Underline style */
    underline?: 'none' | 'solid' | 'dashed' | 'dotted';
    /** Whether to dim other terms when one is active */
    dimOthers?: boolean;
    /** Additional class name */
    className?: string;
}

/**
 * InteractiveText - A hoverable/clickable text element for bidirectional highlighting.
 * 
 * Can be used in two modes:
 * 1. **Context mode**: Inside InteractiveHighlightProvider, automatically coordinates
 *    with other InteractiveText components and external elements.
 * 2. **Standalone mode**: With isActive/onHoverStart/onHoverEnd props for 
 *    manual state management.
 * 
 * @example Context mode:
 * ```tsx
 * <InteractiveHighlightProvider styleMap={{ term1: '#ff0000' }}>
 *   <InteractiveText id="term1">Some text</InteractiveText>
 * </InteractiveHighlightProvider>
 * ```
 * 
 * @example Standalone mode:
 * ```tsx
 * const [activeId, setActiveId] = useState(null);
 * <InteractiveText 
 *   id="term1" 
 *   color="#ff0000"
 *   isActive={activeId === 'term1'}
 *   onHoverStart={() => setActiveId('term1')}
 *   onHoverEnd={() => setActiveId(null)}
 * >
 *   Some text
 * </InteractiveText>
 * ```
 */
export const InteractiveText: React.FC<InteractiveTextProps> = ({
    id,
    children,
    color: propColor,
    isActive: propIsActive,
    onHoverStart,
    onHoverEnd,
    onClick,
    underline = 'dotted',
    dimOthers = true,
    className = '',
}) => {
    const context = useInteractiveHighlight();

    // Determine if we're in context mode or standalone mode
    const isContextMode = context !== null && propIsActive === undefined;

    // Get the appropriate values based on mode
    const color = isContextMode
        ? (context.styleMap[id]?.color ?? propColor ?? '#3b82f6')
        : (propColor ?? '#3b82f6');

    const style = isContextMode ? context.styleMap[id] : undefined;
    const underlineStyle = style?.underline ?? underline;

    const isActive = isContextMode
        ? context.activeId === id
        : propIsActive ?? false;

    const hasAnyActive = isContextMode
        ? context.activeId !== null
        : false;

    const handleMouseEnter = useCallback(() => {
        if (isContextMode) {
            context.setActiveId(id);
        }
        onHoverStart?.(id);
    }, [context, id, isContextMode, onHoverStart]);

    const handleMouseLeave = useCallback(() => {
        if (isContextMode) {
            context.setActiveId(null);
        }
        onHoverEnd?.(id);
    }, [context, id, isContextMode, onHoverEnd]);

    const handleClick = useCallback(() => {
        onClick?.(id);
    }, [id, onClick]);

    // Calculate highlight background
    const highlightBg = style?.highlightBg ?? `${color}22`;

    // Determine opacity based on active state
    const opacity = dimOthers && hasAnyActive ? (isActive ? 1 : 0.4) : 1;

    const textStyle: React.CSSProperties = {
        color: color,
        opacity,
        textDecoration: underlineStyle === 'none' ? 'none' : 'underline',
        textDecorationStyle: underlineStyle === 'none' ? undefined : underlineStyle,
        textDecorationColor: color,
        backgroundColor: isActive ? highlightBg : 'transparent',
        padding: '1px 4px',
        borderRadius: 4,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        transform: isActive && style?.scaleOnHighlight ? 'scale(1.02)' : 'scale(1)',
    };

    return (
        <span
            className={cn("interactive-text", className)}
            style={textStyle}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
            role={onClick ? "button" : undefined}
            tabIndex={onClick ? 0 : undefined}
            onKeyPress={onClick ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') handleClick();
            } : undefined}
        >
            {children}
        </span>
    );
};

// ============================================================================
// HOOK FOR EXTERNAL STATE INTEGRATION
// ============================================================================

/**
 * Hook to get the current active ID from context.
 * Useful for external components like FlowDiagram that need to react to highlights.
 * 
 * @example
 * ```tsx
 * const activeId = useActiveHighlight();
 * const nodes = myNodes.map(n => ({
 *   ...n,
 *   style: { background: activeId === n.id ? 'highlight' : 'default' }
 * }));
 * ```
 */
export const useActiveHighlight = (): string | null => {
    const context = useInteractiveHighlight();
    return context?.activeId ?? null;
};

/**
 * Hook to get the setActiveId function from context.
 * Useful for external components to trigger highlights programmatically.
 * 
 * @example
 * ```tsx
 * const setActiveId = useSetActiveHighlight();
 * <button onClick={() => setActiveId('myTerm')}>Highlight term</button>
 * ```
 */
export const useSetActiveHighlight = (): ((id: string | null) => void) | null => {
    const context = useInteractiveHighlight();
    return context?.setActiveId ?? null;
};

/**
 * Hook that returns both the active ID and setter.
 * Convenience hook for components that need full control.
 */
export const useHighlightState = (): [string | null, (id: string | null) => void] => {
    const context = useInteractiveHighlight();
    const noop = useCallback(() => { }, []);
    return [context?.activeId ?? null, context?.setActiveId ?? noop];
};

export default InteractiveText;
