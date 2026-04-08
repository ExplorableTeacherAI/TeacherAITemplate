import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Hand,
    MoveHorizontal,
    MoveVertical,
    MousePointerClick,
    Pointer,
    ArrowUpDown,
    RotateCw,
    Move3d,
    Maximize2,
    type LucideProps,
} from "lucide-react";
import { useVar } from "@/stores/variableStore";

// ── Types ─────────────────────────────────────────────────────────────────────

export type GestureType = 
    | "drag" 
    | "click" 
    | "hover" 
    | "scroll" 
    | "drag-horizontal" 
    | "drag-vertical"
    | "drag-circular"
    | "pinch"
    | "rotate"
    | "orbit-3d";

/**
 * Custom drag path configuration for intuitive hint animations.
 * Use this to show exactly HOW to drag based on the actual interaction.
 */
export interface DragPathConfig {
    /**
     * Type of path for the drag animation.
     * - "arc": Curved path along a circular arc (for points on circles, angles, etc.)
     * - "line": Straight line from start to end position
     * - "custom": Custom keyframe path with explicit x/y arrays
     */
    type: "arc" | "line" | "custom";
    
    /**
     * For "arc" type: Starting angle in degrees (0 = right, 90 = down, 180 = left, 270 = up)
     */
    startAngle?: number;
    
    /**
     * For "arc" type: Ending angle in degrees
     */
    endAngle?: number;
    
    /**
     * For "arc" type: Radius of the arc in pixels. Default: 30
     */
    radius?: number;
    
    /**
     * For "line" type: Starting offset from center {x, y} in pixels
     */
    startOffset?: { x: number; y: number };
    
    /**
     * For "line" type: Ending offset from center {x, number} in pixels
     */
    endOffset?: { x: number; y: number };
    
    /**
     * For "custom" type: Array of x values for keyframes
     */
    xKeyframes?: number[];
    
    /**
     * For "custom" type: Array of y values for keyframes  
     */
    yKeyframes?: number[];
}

// ── Gesture Icons (Lucide) ────────────────────────────────────────────────────

/** Returns the appropriate Lucide icon component for a given gesture type */
function getGestureIcon(gesture: GestureType): React.ComponentType<LucideProps> {
    switch (gesture) {
        case "drag": return Hand;
        case "drag-horizontal": return MoveHorizontal;
        case "drag-vertical": return MoveVertical;
        case "drag-circular": return Hand;
        case "click": return MousePointerClick;
        case "hover": return Pointer;
        case "scroll": return ArrowUpDown;
        case "pinch": return Maximize2;
        case "rotate": return RotateCw;
        case "orbit-3d": return Move3d;
        default: return Hand;
    }
}

// ── Gesture Animations ────────────────────────────────────────────────────────

/**
 * Generate keyframe arrays from a DragPathConfig
 * Returns { x: number[], y: number[] } for the animation keyframes
 */
function generatePathKeyframes(
    dragPath: DragPathConfig
): { x: number[]; y: number[] } {
    switch (dragPath.type) {
        case "arc": {
            const startAngle = (dragPath.startAngle ?? 0) * (Math.PI / 180);
            const endAngle = (dragPath.endAngle ?? 90) * (Math.PI / 180);
            const radius = dragPath.radius ?? 30;
            
            // Generate points along the arc (8 points for smooth animation)
            const numPoints = 8;
            const x: number[] = [0]; // Start at center
            const y: number[] = [0];
            
            for (let i = 0; i <= numPoints; i++) {
                const t = i / numPoints;
                const angle = startAngle + (endAngle - startAngle) * t;
                // Calculate position relative to center
                // Offset by the starting position to begin from center
                x.push(Math.cos(angle) * radius - Math.cos(startAngle) * radius);
                y.push(Math.sin(angle) * radius - Math.sin(startAngle) * radius);
            }
            
            // Return to center
            x.push(0);
            y.push(0);
            
            return { x, y };
        }
        
        case "line": {
            const start = dragPath.startOffset ?? { x: 0, y: 0 };
            const end = dragPath.endOffset ?? { x: 30, y: 0 };
            
            // Animate from start to end and back
            return {
                x: [0, start.x, end.x, end.x, start.x, 0],
                y: [0, start.y, end.y, end.y, start.y, 0],
            };
        }
        
        case "custom": {
            return {
                x: dragPath.xKeyframes ?? [0],
                y: dragPath.yKeyframes ?? [0],
            };
        }
        
        default:
            return { x: [0], y: [0] };
    }
}

/**
 * Generate trail dot positions from a DragPathConfig
 */
function generatePathTrailDots(
    dragPath: DragPathConfig
): Array<{ x: number; y: number }> {
    switch (dragPath.type) {
        case "arc": {
            const startAngle = (dragPath.startAngle ?? 0) * (Math.PI / 180);
            const endAngle = (dragPath.endAngle ?? 90) * (Math.PI / 180);
            const radius = dragPath.radius ?? 30;
            
            // Generate 6 dots along the arc
            const dots: Array<{ x: number; y: number }> = [];
            const numDots = 6;
            
            for (let i = 0; i <= numDots; i++) {
                const t = i / numDots;
                const angle = startAngle + (endAngle - startAngle) * t;
                dots.push({
                    x: Math.cos(angle) * radius - Math.cos(startAngle) * radius,
                    y: Math.sin(angle) * radius - Math.sin(startAngle) * radius,
                });
            }
            
            return dots;
        }
        
        case "line": {
            const start = dragPath.startOffset ?? { x: 0, y: 0 };
            const end = dragPath.endOffset ?? { x: 30, y: 0 };
            
            // Generate 4 dots along the line
            const dots: Array<{ x: number; y: number }> = [];
            for (let i = 0; i <= 3; i++) {
                const t = i / 3;
                dots.push({
                    x: start.x + (end.x - start.x) * t,
                    y: start.y + (end.y - start.y) * t,
                });
            }
            return dots;
        }
        
        case "custom": {
            const xKeys = dragPath.xKeyframes ?? [0];
            const yKeys = dragPath.yKeyframes ?? [0];
            const len = Math.min(xKeys.length, yKeys.length);
            const dots: Array<{ x: number; y: number }> = [];
            
            // Sample evenly from the keyframes
            const step = Math.max(1, Math.floor(len / 6));
            for (let i = 0; i < len; i += step) {
                dots.push({ x: xKeys[i], y: yKeys[i] });
            }
            return dots;
        }
        
        default:
            return [];
    }
}

/** Returns framer-motion props for the hand icon based on gesture type */
function getGestureAnimation(
    gesture: GestureType, 
    loopCount: number,
    dragPath?: DragPathConfig
) {
    const transition = {
        repeat: loopCount === Infinity ? Infinity : loopCount - 1,
        repeatType: "loop" as const,
        ease: "easeInOut" as const,
    };

    // If custom dragPath is provided, use it for the animation
    if (dragPath) {
        const { x, y } = generatePathKeyframes(dragPath);
        return {
            animate: {
                x,
                y,
                scale: [1, ...Array(x.length - 2).fill(0.92), 1],
            },
            transition: { ...transition, duration: 2.4 },
        };
    }

    switch (gesture) {
        case "drag":
            return {
                animate: {
                    x: [0, 30, 30, -20, -20, 0],
                    y: [0, -15, -15, 10, 10, 0],
                    scale: [1, 0.92, 0.92, 0.92, 0.92, 1],
                },
                transition: { ...transition, duration: 2.8 },
            };

        case "drag-horizontal":
            return {
                animate: {
                    x: [0, 40, 40, -40, -40, 0],
                    scale: [1, 0.92, 0.92, 0.92, 0.92, 1],
                },
                transition: { ...transition, duration: 2.4 },
            };

        case "drag-vertical":
            return {
                animate: {
                    y: [0, 30, 30, -25, -25, 0],
                    scale: [1, 0.92, 0.92, 0.92, 0.92, 1],
                },
                transition: { ...transition, duration: 2.4 },
            };

        case "click":
            return {
                animate: {
                    scale: [1, 0.85, 1, 1],
                    y: [0, 3, 0, 0],
                },
                transition: { ...transition, duration: 1.4 },
            };

        case "hover":
            return {
                animate: {
                    scale: [1, 1, 0.9, 1, 1],
                    opacity: [0.7, 1, 1, 1, 0.7],
                },
                transition: { ...transition, duration: 2.2 },
            };

        case "scroll":
            return {
                animate: {
                    y: [0, -20, 0, -20, 0],
                    opacity: [1, 0.8, 1, 0.8, 1],
                },
                transition: { ...transition, duration: 2.0 },
            };

        case "drag-circular":
            return {
                animate: {
                    x: [0, 20, 28, 20, 0, -20, -28, -20, 0],
                    y: [0, -12, 0, 12, 0, -12, 0, 12, 0],
                    scale: [1, 0.92, 0.92, 0.92, 0.92, 0.92, 0.92, 0.92, 1],
                },
                transition: { ...transition, duration: 2.8 },
            };

        case "pinch":
            return {
                animate: {
                    scale: [1, 0.7, 1, 1.3, 1],
                },
                transition: { ...transition, duration: 2.0 },
            };

        case "rotate":
            return {
                animate: {
                    rotate: [0, 45, 0, -45, 0],
                },
                transition: { ...transition, duration: 2.2 },
            };

        case "orbit-3d":
            return {
                animate: {
                    x: [0, 25, 0, -25, 0],
                    y: [0, -10, 0, -10, 0],
                    rotateY: [0, 15, 0, -15, 0],
                },
                transition: { ...transition, duration: 2.8 },
            };

        default:
            return {
                animate: { scale: [1, 0.9, 1] },
                transition: { ...transition, duration: 1.5 },
            };
    }
}

/** Returns the appropriate label for a gesture type */
function getDefaultLabel(gesture: GestureType): string {
    switch (gesture) {
        case "drag":
            return "Click and drag to reposition elements";
        case "drag-horizontal":
            return "Drag left and right to adjust the value";
        case "drag-vertical":
            return "Drag up and down to adjust the value";
        case "drag-circular":
            return "Drag along the circular path to explore";
        case "click":
            return "Click to interact with this element";
        case "hover":
            return "Hover over elements to reveal details";
        case "scroll":
            return "Scroll up and down to explore more";
        case "pinch":
            return "Pinch to zoom in and out";
        case "rotate":
            return "Rotate to adjust the angle";
        case "orbit-3d":
            return "Click and drag to orbit the 3D view";
        default:
            return "Interact with this visualization";
    }
}

// ── Ripple Effect ─────────────────────────────────────────────────────────────

function ClickRipple({ color, gesture }: { color: string; gesture: GestureType }) {
    if (gesture !== "click") return null;

    return (
        <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{
                width: 44,
                height: 44,
                top: 24, // icon center: p-2 (8px) + half of 32px icon = 24px
                left: "50%",
                marginTop: -22, // center the 44px ripple vertically
                marginLeft: -22, // center the 44px ripple horizontally
                border: `2px solid ${color}`,
            }}
            animate={{
                scale: [0, 0, 0.5, 1.6, 0],
                opacity: [0, 0, 0.8, 0, 0],
            }}
            transition={{
                repeat: Infinity,
                duration: 1.4,
                ease: "easeOut",
                times: [0, 0.25, 0.35, 0.7, 1], // sync with icon press at 25%
            }}
        />
    );
}

// ── Trail dots for drag gestures ──────────────────────────────────────────────

function DragTrail({ 
    color, 
    gesture,
    dragPath 
}: { 
    color: string; 
    gesture: GestureType;
    dragPath?: DragPathConfig;
}) {
    if (!gesture.startsWith("drag") && gesture !== "orbit-3d") return null;

    // Use custom dragPath dots if provided
    const dots = dragPath 
        ? generatePathTrailDots(dragPath)
        : gesture === "drag-horizontal"
            ? [{ x: -20, y: 0 }, { x: -10, y: 0 }, { x: 10, y: 0 }, { x: 20, y: 0 }]
            : gesture === "drag-vertical"
                ? [{ x: 0, y: -16 }, { x: 0, y: -8 }, { x: 0, y: 8 }, { x: 0, y: 16 }]
                : gesture === "drag-circular"
                    ? [{ x: 18, y: 0 }, { x: 12, y: 12 }, { x: 0, y: 18 }, { x: -12, y: 12 }, { x: -18, y: 0 }, { x: -12, y: -12 }, { x: 0, y: -18 }, { x: 12, y: -12 }]
                    : gesture === "orbit-3d"
                        ? [{ x: -20, y: -6 }, { x: 20, y: -6 }, { x: -16, y: 6 }, { x: 16, y: 6 }]
                        : [{ x: -14, y: 8 }, { x: -7, y: 4 }, { x: 7, y: -4 }, { x: 14, y: -8 }];

    return (
        <>
            {dots.map((dot, i) => (
                <motion.div
                    key={i}
                    className="absolute rounded-full pointer-events-none"
                    style={{
                        width: 5,
                        height: 5,
                        backgroundColor: color,
                        top: "50%",
                        left: "50%",
                        marginTop: dot.y - 2.5,
                        marginLeft: dot.x - 2.5,
                    }}
                    animate={{
                        opacity: [0, 0.5, 0],
                    }}
                    transition={{
                        repeat: Infinity,
                        duration: 2.4,
                        delay: i * 0.15,
                        ease: "easeInOut",
                    }}
                />
            ))}
        </>
    );
}

// ── InteractionHintSequence ───────────────────────────────────────────────────

export interface HintStep {
    /** Type of interaction gesture to animate for this step */
    gesture: GestureType;
    /** Short instruction text for this step */
    label?: string;
    /**
     * Position of the hint relative to the parent container (percentage).
     * Defaults to center (50%, 50%).
     */
    position?: { x?: string; y?: string };
    /** Optional accent color override for this step */
    color?: string;
    /**
     * Custom drag path configuration for intuitive animations.
     * When provided, overrides the default gesture animation to show
     * the exact drag motion the user should perform.
     * 
     * @example Arc path for dragging a point along a circle:
     * ```tsx
     * dragPath: { type: "arc", startAngle: 0, endAngle: 90, radius: 40 }
     * ```
     * 
     * @example Line path for dragging from one point to another:
     * ```tsx
     * dragPath: { type: "line", startOffset: { x: -30, y: 0 }, endOffset: { x: 30, y: 0 } }
     * ```
     */
    dragPath?: DragPathConfig;
    
    /**
     * Variable name to watch for step completion.
     * When specified, the step only completes when the variable reaches the target value.
     * @example "fbDemoTheta" for watching the angle variable
     */
    completionVar?: string;
    
    /**
     * Target value the variable should reach for step completion.
     * @example 90 for when the angle should be at 90 degrees
     */
    completionValue?: number;
    
    /**
     * Tolerance for completion check (±tolerance).
     * @default 10
     * @example 15 means the step completes when value is within ±15 of completionValue
     */
    completionTolerance?: number;
}

export interface InteractionHintSequenceProps {
    /** Unique key for sessionStorage to remember progress */
    hintKey: string;
    /** Ordered array of hint steps to show sequentially */
    steps: HintStep[];
    /**
     * **Controlled mode**: the parent tells which step to show.
     * Derive this from your visualization state (e.g. `points.length`).
     *
     * When `currentStep >= steps.length`, the entire sequence is dismissed.
     * When `currentStep` is `undefined`, the component manages its own step
     * counter internally (auto-advance mode).
     */
    currentStep?: number;
    /**
     * Called when a step is completed (user interacted on the parent).
     * In controlled mode this lets the parent decide whether to advance.
     * In auto-advance mode it fires as a notification.
     */
    onStepComplete?: (completedStepIndex: number) => void;
    /**
     * If true, the sequence always shows (ignores sessionStorage).
     * Useful for demos / documentation. Default: false.
     */
    alwaysShow?: boolean;
    /**
     * Delay in ms before the first hint appears after mount.
     * Default: 800.
     */
    delay?: number;
    /**
     * Default accent color for all steps (individual steps can override).
     * Default: "#62D0AD".
     */
    color?: string;
    /** Called when the full sequence finishes or is externally dismissed. */
    onSequenceComplete?: () => void;
}

/**
 * InteractionHintSequence – Multi-step guided interaction overlay.
 *
 * Shows one hint at a time from an ordered list of steps. Each step has its own
 * gesture animation, label, and position. The sequence advances either
 * automatically (on each user interaction with the parent) or under the
 * parent's control via the `currentStep` prop.
 *
 * Must be placed inside a `position: relative` parent (the visualization
 * wrapper div).
 *
 * ## Controlled mode (recommended for state-driven UIs)
 *
 * Derive `currentStep` from your app state so the hint automatically
 * reflects what the user should do next:
 *
 * @example
 * ```tsx
 * function LineDrawingViz() {
 *   const [points, setPoints] = useState<[number, number][]>([]);
 *
 *   return (
 *     <div className="relative">
 *       <Cartesian2D ... />
 *       <InteractionHintSequence
 *         hintKey="line-drawing-tutorial"
 *         currentStep={points.length >= 3 ? undefined : points.length}
 *         steps={[
 *           { gesture: "click", label: "Click to place a point" },
 *           { gesture: "click", label: "Click again for a line", position: { x: "60%", y: "40%" } },
 *           { gesture: "click", label: "One more for a triangle!", position: { x: "40%", y: "60%" } },
 *         ]}
 *       />
 *     </div>
 *   );
 * }
 * ```
 *
 * ## Auto-advance mode
 *
 * Omit `currentStep` and the component advances on each `pointerdown`:
 *
 * @example
 * ```tsx
 * <InteractionHintSequence
 *   hintKey="scatter-plot-tutorial"
 *   steps={[
 *     { gesture: "click", label: "Click any point" },
 *     { gesture: "drag", label: "Now drag it somewhere" },
 *   ]}
 * />
 * ```
 */
export function InteractionHintSequence({
    hintKey,
    steps,
    currentStep: controlledStep,
    onStepComplete,
    alwaysShow = false,
    delay = 800,
    color,
    onSequenceComplete,
}: InteractionHintSequenceProps) {
    const storageKey = `interaction-hint-seq::${hintKey}`;
    const isControlled = controlledStep !== undefined;

    // Internal step counter (used only in auto-advance mode)
    const [internalStep, setInternalStep] = useState(0);
    const [visible, setVisible] = useState(false);
    const [listenerReady, setListenerReady] = useState(false);
    const [dismissed, setDismissed] = useState(false);

    // Ref to locate our own DOM node and find the parent container
    const hintRef = useRef<HTMLDivElement>(null);

    // Determine the active step index
    const activeStep = isControlled ? controlledStep : internalStep;
    const isComplete = activeStep >= steps.length;
    
    // Get current step's completion condition
    const currentStepData = steps[Math.min(activeStep, steps.length - 1)];
    const completionVar = currentStepData?.completionVar;
    const completionValue = currentStepData?.completionValue;
    const completionTolerance = currentStepData?.completionTolerance ?? 15;
    
    // Watch the completion variable (if specified)
    const watchedValue = useVar(completionVar ?? '', null) as number | null;

    useEffect(() => {
        setDismissed(false);
    }, [hintKey]);

    // On mount: clear stale localStorage, check sessionStorage
    useEffect(() => {
        try {
            localStorage.removeItem(storageKey);
        } catch {
            // ignore
        }

        if (alwaysShow) {
            const timer = setTimeout(() => setVisible(true), delay);
            return () => clearTimeout(timer);
        }

        const savedStep = sessionStorage.getItem(storageKey);
        if (savedStep) {
            const parsed = parseInt(savedStep, 10);
            if (!isNaN(parsed) && parsed >= steps.length) {
                // Sequence was already completed in this session
                return;
            }
            // Resume from the saved step (auto-advance mode only)
            if (!isControlled && !isNaN(parsed)) {
                setInternalStep(parsed);
            }
        }

        const timer = setTimeout(() => setVisible(true), delay);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [alwaysShow, delay, storageKey, steps.length]);

    useEffect(() => {
        const handleDismissAll = (e: Event) => {
            const detail = (e as CustomEvent).detail;
            if (detail?.exceptHintKey === hintKey) return;
            setDismissed(true);
            setVisible(false);
        };

        document.addEventListener('dismiss-interaction-hints', handleDismissAll);
        return () => document.removeEventListener('dismiss-interaction-hints', handleDismissAll);
    }, [hintKey]);

    // Delay attaching interaction listeners after hint becomes visible
    // to avoid programmatic events from Mafs/Three.js during initialization
    useEffect(() => {
        if (!visible || isComplete) {
            setListenerReady(false);
            return;
        }

        const timer = setTimeout(() => setListenerReady(true), 800);
        return () => clearTimeout(timer);
    }, [visible, isComplete, activeStep]);

    // Save progress to sessionStorage when step changes (auto-advance mode)
    useEffect(() => {
        if (isControlled || alwaysShow) return;
        try {
            sessionStorage.setItem(storageKey, String(internalStep));
        } catch {
            // ignore
        }
    }, [internalStep, isControlled, alwaysShow, storageKey]);

    /**
     * Handle step completion: advance to next step or finish sequence.
     */
    const handleStepInteraction = useCallback(() => {
        const completedIndex = activeStep;

        // Notify parent
        onStepComplete?.(completedIndex);

        // In auto-advance mode, move to the next step
        if (!isControlled) {
            const nextStep = completedIndex + 1;
            setInternalStep(nextStep);
            setListenerReady(false);  // Reset listener delay for next step

            // If sequence is now complete, persist to sessionStorage
            if (nextStep >= steps.length && !alwaysShow) {
                try {
                    sessionStorage.setItem(storageKey, String(nextStep));
                } catch {
                    // ignore
                }
            }
        }
    }, [activeStep, isControlled, onStepComplete, steps.length, alwaysShow, storageKey, onSequenceComplete]);

    useEffect(() => {
        if (isComplete) {
            onSequenceComplete?.();
        }
    }, [isComplete, onSequenceComplete]);
    
    // Watch for completion condition being met
    useEffect(() => {
        if (!visible || isComplete || !listenerReady) return;
        if (completionVar === undefined || completionValue === undefined) return;
        if (watchedValue === null) return;
        
        // Check if the watched value is within tolerance of the completion value
        const diff = Math.abs(watchedValue - completionValue);
        if (diff <= completionTolerance) {
            // Small delay to let the user see the result before advancing
            const timer = setTimeout(() => {
                handleStepInteraction();
            }, 400);
            return () => clearTimeout(timer);
        }
    }, [watchedValue, completionVar, completionValue, completionTolerance, visible, isComplete, listenerReady, handleStepInteraction]);

    // Listen for user interaction on the visualization container (only for steps WITHOUT completion conditions)
    useEffect(() => {
        // Skip if the current step has a completion condition - it will auto-advance when condition is met
        if (completionVar !== undefined && completionValue !== undefined) return;
        
        if (!listenerReady || isComplete) return;

        const hintEl = hintRef.current;
        if (!hintEl) return;

        // Walk up to find the actual visualization container
        // Look for either position:relative container or data-block-id element
        let container: HTMLElement | null = hintEl.parentElement;
        while (container) {
            const style = window.getComputedStyle(container);
            const hasRelativePosition = style.position === 'relative';
            const isBlockContainer = container.hasAttribute('data-block-id');
            
            // Stop at the first relative-positioned container that's not just a small wrapper
            if (hasRelativePosition && container.offsetWidth > 100 && container.offsetHeight > 100) {
                break;
            }
            if (isBlockContainer) {
                break;
            }
            container = container.parentElement;
        }

        if (!container) {
            container = hintEl.parentElement;
        }
        if (!container) return;

        const handleInteraction = () => handleStepInteraction();

        // Use capture phase to catch events before child elements (like Mafs canvas) can stop propagation
        container.addEventListener("pointerdown", handleInteraction, { once: true, capture: true });
        container.addEventListener("touchstart", handleInteraction, { once: true, capture: true });
        return () => {
            container?.removeEventListener("pointerdown", handleInteraction, { capture: true });
            container?.removeEventListener("touchstart", handleInteraction, { capture: true });
        };
    }, [listenerReady, isComplete, handleStepInteraction, completionVar, completionValue]);

    // Don't render if sequence is complete (and not alwaysShow)
    if (dismissed) return null;
    if (isComplete) return null;
    if (!visible) return null;

    // Current step data
    const step = steps[Math.min(activeStep, steps.length - 1)];
    const accentColor = step.color ?? color ?? "#62D0AD";
    const gestureAnim = getGestureAnimation(step.gesture, Infinity, step.dragPath);
    const displayLabel = step.label ?? getDefaultLabel(step.gesture);
    const posX = step.position?.x ?? "50%";
    const posY = step.position?.y ?? "50%";

    const GestureIcon = getGestureIcon(step.gesture);

    const totalSteps = steps.length;
    const stepNumber = Math.min(activeStep + 1, totalSteps);

    return (
        <AnimatePresence mode="wait">
            {!isComplete && (
                <>
                    {/* ── Icon overlay — positioned inside the visualization ── */}
                    <motion.div
                        key={`icon-${activeStep}`}
                        ref={hintRef}
                        className="absolute z-50 pointer-events-none select-none"
                        style={{
                            left: posX,
                            top: posY,
                            transform: "translate(-50%, -50%)",
                        }}
                        initial={{ opacity: 0, scale: 0.7 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.7 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                    >
                        {/* Trail dots for drag gestures */}
                        <DragTrail color={accentColor} gesture={step.gesture} dragPath={step.dragPath} />

                        {/* Ripple for click gesture */}
                        <ClickRipple color={accentColor} gesture={step.gesture} />

                        {/* Animated gesture icon — only the icon, no text */}
                        <motion.div
                            className="flex items-center justify-center"
                            {...gestureAnim}
                        >
                            <div
                                className="rounded-full p-2"
                                style={{
                                    background: `radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.7) 100%)`,
                                    boxShadow: `0 4px 20px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)`,
                                }}
                            >
                                <GestureIcon
                                    color={accentColor}
                                    size={32}
                                    strokeWidth={1.8}
                                    style={{ filter: `drop-shadow(0 2px 6px rgba(0,0,0,0.25))` }}
                                />
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* ── Instruction bar — simple box along the bottom ── */}
                    <motion.div
                        key={`label-${activeStep}`}
                        className="absolute z-50 pointer-events-none select-none"
                        style={{
                            left: 0,
                            right: 0,
                            bottom: 0,
                        }}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        transition={{ duration: 0.3, ease: "easeOut", delay: 0.1 }}
                    >
                        <div
                            className="flex items-center justify-center gap-2 px-4 py-2"
                            style={{
                                background: "rgba(249, 250, 251, 0.92)",
                                borderTop: "1px solid rgba(0,0,0,0.06)",
                            }}
                        >
                            {/* Step dots (before text when multi-step) */}
                            {totalSteps > 1 && (
                                <div className="flex items-center gap-1 shrink-0">
                                    {steps.map((_, i) => (
                                        <div
                                            key={i}
                                            className="rounded-full transition-all duration-300"
                                            style={{
                                                width: i === activeStep ? 14 : 5,
                                                height: 5,
                                                borderRadius: 3,
                                                backgroundColor: i < activeStep
                                                    ? accentColor
                                                    : i === activeStep
                                                        ? accentColor
                                                        : "rgba(156, 163, 175, 0.35)",
                                                opacity: i <= activeStep ? 1 : 0.5,
                                            }}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Instruction text */}
                            <span
                                className="text-xs font-medium"
                                style={{ color: "#6b7280" }}
                            >
                                {totalSteps > 1 && (
                                    <span
                                        className="font-semibold mr-1"
                                        style={{ color: accentColor }}
                                    >
                                        Step {stepNumber}:
                                    </span>
                                )}
                                {displayLabel}
                            </span>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

export default InteractionHintSequence;
