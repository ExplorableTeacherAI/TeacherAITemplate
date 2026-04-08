import { useState, useEffect, useRef, useCallback, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pointer, CircleHelp, type LucideIcon, Hand } from 'lucide-react';
import { 
    type InlineComponentType, 
    useInlineInteractionHint 
} from '@/contexts/InlineInteractionHintContext';

// ── Gesture Configuration ─────────────────────────────────────────────────────

interface GestureConfig {
    icon: LucideIcon;
    animation: {
        animate: Record<string, number[]>;
        duration: number;
    };
}

const gestureConfigs: Record<InlineComponentType, GestureConfig> = {
    'scrubble-number': {
        icon: Hand,
        animation: {
            animate: { x: [0, 0, -10, 0] },
            duration: 1.4,
        },
    },
    'linked-highlight': {
        icon: Pointer,
        animation: {
            animate: { y: [0, -3, 0] },
            duration: 1.4,
        },
    },
    'trigger': {
        icon: Pointer,
        animation: {
            animate: { scale: [1, 1.15, 1] },
            duration: 1.4,
        },
    },
    'spot-color': {
        icon: Pointer,
        animation: {
            animate: { y: [0, -3, 0] },
            duration: 1.4,
        },
    },
    'cloze-input': {
        icon: Pointer,
        animation: {
            animate: { scale: [1, 1.15, 1] },
            duration: 1.4,
        },
    },
    'cloze-choice': {
        icon: Pointer,
        animation: {
            animate: { scale: [1, 1.15, 1] },
            duration: 1.4,
        },
    },
    'toggle': {
        icon: Pointer,
        animation: {
            animate: { scale: [1, 1.15, 1] },
            duration: 1.4,
        },
    },
    'tooltip': {
        icon: CircleHelp,
        animation: {
            animate: { y: [0, -3, 0] },
            duration: 1.4,
        },
    },
    'hyperlink': {
        icon: Pointer,
        animation: {
            animate: { scale: [1, 1.15, 1] },
            duration: 1.4,
        },
    },
    'formula-scrubble': {
        icon: Hand,
        animation: {
            animate: { x: [0, 0, -10, 0] },
            duration: 1.4,
        },
    },
    'formula-linked-highlight': {
        icon: Pointer,
        animation: {
            animate: { y: [0, -3, 0] },
            duration: 1.4,
        },
    },
    'formula-cloze-input': {
        icon: Pointer,
        animation: {
            animate: { scale: [1, 1.15, 1] },
            duration: 1.4,
        },
    },
    'formula-cloze-choice': {
        icon: Pointer,
        animation: {
            animate: { scale: [1, 1.15, 1] },
            duration: 1.4,
        },
    },
};

// ── Reusable Hook ─────────────────────────────────────────────────────────────

export interface UseComponentHintOptions {
    /** Whether hints are enabled for this instance (default: true) */
    enabled?: boolean;
    /** Delay before showing hint in ms (default: 600) */
    delay?: number;
}

/**
 * Hook to manage interaction hint state for an inline component.
 * 
 * @param type - The component type (e.g., 'scrubble-number', 'toggle')
 * @param options - Configuration options
 * @returns { hintVisible, dismissHint } - State and dismiss function
 * 
 * @example
 * ```tsx
 * const { hintVisible, dismissHint } = useComponentHint('toggle', { enabled: showHint });
 * 
 * const handleClick = () => {
 *   dismissHint();
 *   // ... rest of click handler
 * };
 * ```
 */
export function useComponentHint(
    type: InlineComponentType,
    options: UseComponentHintOptions = {}
) {
    const { enabled = true, delay = 600 } = options;
    const hintContext = useInlineInteractionHint();
    const [hintVisible, setHintVisible] = useState(false);
    const [hasRequestedHint, setHasRequestedHint] = useState(false);

    // Request hint on mount (only first component of this type wins)
    useEffect(() => {
        if (!enabled || hasRequestedHint || !hintContext) return;
        
        const timer = setTimeout(() => {
            const isFirst = hintContext.requestHint(type);
            setHasRequestedHint(true);
            if (isFirst) {
                setHintVisible(true);
            }
        }, delay);

        return () => clearTimeout(timer);
    }, [enabled, hasRequestedHint, hintContext, type, delay]);

    // Dismiss hint
    const dismissHint = useCallback(() => {
        if (hintVisible && hintContext) {
            hintContext.dismissHint(type);
            setHintVisible(false);
        }
    }, [hintVisible, hintContext, type]);

    return { hintVisible, dismissHint };
}

// ── Reusable Hint Icon Component ──────────────────────────────────────────────

export interface HintIconProps {
    /** The component type to show hint for */
    type: InlineComponentType;
    /** Whether the hint is visible */
    visible: boolean;
    /** Whether we're in editing mode (hides hint) */
    isEditing?: boolean;
}

/**
 * Animated hint icon that appears below inline components.
 * Use with useComponentHint hook.
 * 
 * @example
 * ```tsx
 * const { hintVisible, dismissHint } = useComponentHint('toggle');
 * 
 * return (
 *   <span className="inline-flex items-center relative">
 *     <span onClick={() => { dismissHint(); handleClick(); }}>
 *       {content}
 *     </span>
 *     <HintIcon type="toggle" visible={hintVisible} isEditing={isEditing} />
 *   </span>
 * );
 * ```
 */
export function HintIcon({ type, visible, isEditing = false }: HintIconProps) {
    const config = gestureConfigs[type];
    if (!config) return null;
    
    const Icon = config.icon;

    return (
        <AnimatePresence>
            {visible && !isEditing && (
                <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.2 }}
                    className="absolute left-1/2 -translate-x-1/2 z-50 pointer-events-none"
                    style={{ top: 'calc(100% - 8px)' }}
                >
                    <motion.div
                        animate={config.animation.animate}
                        transition={{
                            repeat: Infinity,
                            duration: config.animation.duration,
                            ease: 'easeInOut',
                        }}
                    >
                        <Icon size={18} className="text-gray-400" />
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// ── Formula Hint Icon (positions relative to ALL matching elements) ───────────

export interface FormulaHintIconProps {
    /** The component type to show hint for */
    type: InlineComponentType;
    /** Whether the hint is visible */
    visible: boolean;
    /** Whether we're in editing mode (hides hint) */
    isEditing?: boolean;
    /** Ref to the container element (e.g., katex container) */
    containerRef: React.RefObject<HTMLElement | null>;
    /** CSS selector to find all interactive elements */
    selector: string;
}

/**
 * Animated hint icons that position themselves near ALL matching elements in a container.
 * Use for formula blocks where hints need to appear near specific interactive elements.
 * 
 * @example
 * ```tsx
 * <FormulaHintIcon 
 *   type="formula-scrubble" 
 *   visible={scrubbleHintVisible} 
 *   isEditing={isEditing}
 *   containerRef={katexRef}
 *   selector=".scrub-x, .scrub-y"
 * />
 * ```
 */
export function FormulaHintIcon({ type, visible, isEditing = false, containerRef, selector }: FormulaHintIconProps) {
    const config = gestureConfigs[type];
    const [positions, setPositions] = useState<Array<{ left: number; top: number }>>([]);
    
    // Find ALL matching elements and calculate positions
    useEffect(() => {
        if (!visible || !containerRef.current || isEditing || !selector) {
            setPositions([]);
            return;
        }
        
        const elements = containerRef.current.querySelectorAll<HTMLElement>(selector);
        if (elements.length === 0) {
            setPositions([]);
            return;
        }
        
        // Get positions for all elements relative to container
        const containerRect = containerRef.current.getBoundingClientRect();
        const newPositions: Array<{ left: number; top: number }> = [];
        
        elements.forEach((element) => {
            const elementRect = element.getBoundingClientRect();
            newPositions.push({
                left: elementRect.left - containerRect.left + elementRect.width / 2,
                top: elementRect.bottom - containerRect.top,
            });
        });
        
        setPositions(newPositions);
    }, [visible, isEditing, containerRef, selector]);
    
    if (!config || positions.length === 0) return null;
    
    const Icon = config.icon;

    return (
        <AnimatePresence>
            {visible && !isEditing && positions.map((position, index) => (
                <motion.div
                    key={`hint-${type}-${index}`}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.2 }}
                    className="absolute z-50 pointer-events-none -translate-x-1/2"
                    style={{ left: position.left, top: position.top - 8 }}
                >
                    <motion.div
                        animate={config.animation.animate}
                        transition={{
                            repeat: Infinity,
                            duration: config.animation.duration,
                            ease: 'easeInOut',
                        }}
                    >
                        <Icon size={18} className="text-gray-400" />
                    </motion.div>
                </motion.div>
            ))}
        </AnimatePresence>
    );
}

// ── Legacy Wrapper Component (for backward compatibility) ─────────────────────

export interface InlineInteractionHintProps {
    /** The type of inline component */
    type: InlineComponentType;
    /** The inline component to wrap */
    children: ReactNode;
    /** Delay before showing hint (ms, default: 600) */
    delay?: number;
    /** Called when the component is interacted with */
    onInteraction?: () => void;
}

/**
 * @deprecated Use useComponentHint hook and HintIcon component instead.
 * 
 * InlineInteractionHint wraps an inline component and shows a floating
 * hint icon when the user hasn't interacted with this component type yet.
 */
export function InlineInteractionHint({
    type,
    children,
    delay = 600,
    onInteraction,
}: InlineInteractionHintProps) {
    const { hintVisible, dismissHint } = useComponentHint(type, { delay });
    const containerRef = useRef<HTMLSpanElement>(null);

    // Handle interaction - dismiss hint
    const handleInteraction = useCallback(() => {
        if (hintVisible) {
            dismissHint();
            onInteraction?.();
        }
    }, [hintVisible, dismissHint, onInteraction]);

    // Attach interaction listeners
    useEffect(() => {
        if (!hintVisible || !containerRef.current) return;

        const container = containerRef.current;

        const handlePointerDown = () => handleInteraction();
        const handlePointerEnter = () => {
            if (type === 'linked-highlight' || type === 'spot-color' || type === 'tooltip') {
                handleInteraction();
            }
        };

        container.addEventListener('pointerdown', handlePointerDown, { passive: true });
        container.addEventListener('pointerenter', handlePointerEnter, { passive: true });

        return () => {
            container.removeEventListener('pointerdown', handlePointerDown);
            container.removeEventListener('pointerenter', handlePointerEnter);
        };
    }, [hintVisible, handleInteraction, type]);

    return (
        <span ref={containerRef} className="inline-flex items-center relative">
            {children}
            <HintIcon type={type} visible={hintVisible} />
        </span>
    );
}

export default InlineInteractionHint;
