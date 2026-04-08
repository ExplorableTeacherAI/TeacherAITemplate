import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

/**
 * Types of inline interactive components that can show hints.
 */
export type InlineComponentType = 
    | 'scrubble-number'    // InlineScrubbleNumber - drag to adjust
    | 'linked-highlight'   // InlineLinkedHighlight - hover to highlight
    | 'trigger'            // InlineTrigger - click to trigger
    | 'spot-color'         // InlineSpotColor - visual marker (hover)
    | 'cloze-input'        // InlineClozeInput - click to type answer
    | 'cloze-choice'       // InlineClozeChoice - click to select answer
    | 'toggle'             // InlineToggle - click to cycle options
    | 'tooltip'            // InlineTooltip - hover to see tooltip
    | 'hyperlink'          // InlineHyperlink - click to navigate
    | 'formula-scrubble'   // FormulaBlock \scrub{} - drag to adjust
    | 'formula-linked-highlight' // FormulaBlock \highlight{} - hover to highlight
    | 'formula-cloze-input'      // FormulaBlock \cloze{} - click to type answer
    | 'formula-cloze-choice';    // FormulaBlock \choice{} - click to select answer

interface InlineInteractionHintContextType {
    /**
     * Check if a hint has already been shown for this component type.
     */
    hasShownHint: (type: InlineComponentType) => boolean;

    /**
     * Mark that a hint should be shown for this component type.
     * Returns true if this is the first request (hint should show).
     */
    requestHint: (type: InlineComponentType) => boolean;

    /**
     * Mark that the user has interacted with a component type, 
     * so the hint should be dismissed for that type.
     */
    dismissHint: (type: InlineComponentType) => void;

    /**
     * Check if hints should show for a component type.
     * Returns true if the hint should currently be visible.
     */
    shouldShowHint: (type: InlineComponentType) => boolean;

    /**
     * Reset all hint states (useful for demos/testing).
     */
    resetAllHints: () => void;
}

const InlineInteractionHintContext = createContext<InlineInteractionHintContextType | undefined>(undefined);

const STORAGE_KEY = 'inline-interaction-hints';

interface HintState {
    /** Component types where a hint has been requested to show */
    requested: Set<InlineComponentType>;
    /** Component types where the user has already interacted (hint dismissed) */
    dismissed: Set<InlineComponentType>;
}

/**
 * Load dismissed hints from sessionStorage.
 */
function loadDismissedFromStorage(): Set<InlineComponentType> {
    try {
        const stored = sessionStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored) as InlineComponentType[];
            return new Set(parsed);
        }
    } catch {
        // Ignore storage errors
    }
    return new Set();
}

/**
 * Save dismissed hints to sessionStorage.
 */
function saveDismissedToStorage(dismissed: Set<InlineComponentType>) {
    try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify([...dismissed]));
    } catch {
        // Ignore storage errors
    }
}

interface InlineInteractionHintProviderProps {
    children: ReactNode;
    /**
     * If true, always show hints (ignore sessionStorage).
     * Useful for demos.
     */
    alwaysShow?: boolean;
}

/**
 * Provider for the inline interaction hint system.
 * 
 * This context manages which inline component types have shown their
 * interaction hints. Only the first instance of each component type
 * shows a hint, and hints are dismissed after user interaction.
 * 
 * Dismissed hints persist for the session via sessionStorage.
 * 
 * @example
 * ```tsx
 * // In App.tsx
 * <InlineInteractionHintProvider>
 *   <YourContent />
 * </InlineInteractionHintProvider>
 * ```
 */
export function InlineInteractionHintProvider({ 
    children, 
    alwaysShow = false 
}: InlineInteractionHintProviderProps) {
    const [state, setState] = useState<HintState>(() => ({
        requested: new Set(),
        dismissed: alwaysShow ? new Set() : loadDismissedFromStorage(),
    }));

    const hasShownHint = useCallback((type: InlineComponentType) => {
        return state.requested.has(type);
    }, [state.requested]);

    const requestHint = useCallback((type: InlineComponentType) => {
        // If already dismissed, don't show
        if (!alwaysShow && state.dismissed.has(type)) {
            return false;
        }
        // If already requested by another instance, don't show
        if (state.requested.has(type)) {
            return false;
        }
        // This is the first request - mark it and allow showing
        setState(prev => ({
            ...prev,
            requested: new Set([...prev.requested, type]),
        }));
        return true;
    }, [state.dismissed, state.requested, alwaysShow]);

    const dismissHint = useCallback((type: InlineComponentType) => {
        setState(prev => {
            const newDismissed = new Set([...prev.dismissed, type]);
            if (!alwaysShow) {
                saveDismissedToStorage(newDismissed);
            }
            return {
                ...prev,
                dismissed: newDismissed,
            };
        });
    }, [alwaysShow]);

    const shouldShowHint = useCallback((type: InlineComponentType) => {
        // Show if requested and not dismissed
        return state.requested.has(type) && !state.dismissed.has(type);
    }, [state.requested, state.dismissed]);

    const resetAllHints = useCallback(() => {
        setState({
            requested: new Set(),
            dismissed: new Set(),
        });
        try {
            sessionStorage.removeItem(STORAGE_KEY);
        } catch {
            // Ignore
        }
    }, []);

    return (
        <InlineInteractionHintContext.Provider
            value={{
                hasShownHint,
                requestHint,
                dismissHint,
                shouldShowHint,
                resetAllHints,
            }}
        >
            {children}
        </InlineInteractionHintContext.Provider>
    );
}

/**
 * Hook to access the inline interaction hint system.
 */
export function useInlineInteractionHint() {
    const context = useContext(InlineInteractionHintContext);
    if (!context) {
        throw new Error('useInlineInteractionHint must be used within InlineInteractionHintProvider');
    }
    return context;
}

/**
 * Hook that returns whether the current component should show a hint.
 * Automatically requests the hint on mount (only first caller wins).
 */
export function useInlineHintForType(type: InlineComponentType) {
    const context = useContext(InlineInteractionHintContext);
    const [shouldShow, setShouldShow] = useState(false);

    // On mount, try to request the hint
    useState(() => {
        if (context) {
            const isFirst = context.requestHint(type);
            setShouldShow(isFirst);
        }
    });

    const dismiss = useCallback(() => {
        if (context) {
            context.dismissHint(type);
            setShouldShow(false);
        }
    }, [context, type]);

    return { shouldShow, dismiss };
}
