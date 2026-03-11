import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Hand,
    MoveHorizontal,
    MoveVertical,
    MousePointerClick,
    Pointer,
    ArrowUpDown,
    type LucideProps,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

export type GestureType = "drag" | "click" | "hover" | "scroll" | "drag-horizontal" | "drag-vertical";

// ── Gesture Icons (Lucide) ────────────────────────────────────────────────────

/** Returns the appropriate Lucide icon component for a given gesture type */
function getGestureIcon(gesture: GestureType): React.ComponentType<LucideProps> {
    switch (gesture) {
        case "drag": return Hand;
        case "drag-horizontal": return MoveHorizontal;
        case "drag-vertical": return MoveVertical;
        case "click": return MousePointerClick;
        case "hover": return Pointer;
        case "scroll": return ArrowUpDown;
        default: return Hand;
    }
}

// ── Gesture Animations ────────────────────────────────────────────────────────

/** Returns framer-motion props for the hand icon based on gesture type */
function getGestureAnimation(gesture: GestureType, loopCount: number) {
    const transition = {
        repeat: loopCount === Infinity ? Infinity : loopCount - 1,
        repeatType: "loop" as const,
        ease: "easeInOut" as const,
    };

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
                    x: [0, 12, 12, -8, -8, 0],
                    y: [0, -4, -4, 4, 4, 0],
                    opacity: [0.7, 1, 1, 1, 1, 0.7],
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
            return "Drag to explore";
        case "drag-horizontal":
            return "Drag left & right";
        case "drag-vertical":
            return "Drag up & down";
        case "click":
            return "Click to interact";
        case "hover":
            return "Hover to discover";
        case "scroll":
            return "Scroll to explore";
        default:
            return "Interact!";
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

function DragTrail({ color, gesture }: { color: string; gesture: GestureType }) {
    if (!gesture.startsWith("drag")) return null;

    const dots = gesture === "drag-horizontal"
        ? [{ x: -20, y: 0 }, { x: -10, y: 0 }, { x: 10, y: 0 }, { x: 20, y: 0 }]
        : gesture === "drag-vertical"
            ? [{ x: 0, y: -16 }, { x: 0, y: -8 }, { x: 0, y: 8 }, { x: 0, y: 16 }]
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
}: InteractionHintSequenceProps) {
    const storageKey = `interaction-hint-seq::${hintKey}`;
    const isControlled = controlledStep !== undefined;

    // Internal step counter (used only in auto-advance mode)
    const [internalStep, setInternalStep] = useState(0);
    const [visible, setVisible] = useState(false);
    const [listenerReady, setListenerReady] = useState(false);

    // Ref to locate our own DOM node and find the parent container
    const hintRef = useRef<HTMLDivElement>(null);

    // Determine the active step index
    const activeStep = isControlled ? controlledStep : internalStep;
    const isComplete = activeStep >= steps.length;

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
    }, [activeStep, isControlled, onStepComplete, steps.length, alwaysShow, storageKey]);

    // Listen for user interaction on the parent container
    useEffect(() => {
        if (!listenerReady || isComplete) return;

        const hintEl = hintRef.current;
        const parent = hintEl?.parentElement;
        if (!parent) return;

        const handleInteraction = () => handleStepInteraction();

        // Use capture phase to catch events before child elements (like Mafs canvas) can stop propagation
        parent.addEventListener("pointerdown", handleInteraction, { once: true, capture: true });
        parent.addEventListener("touchstart", handleInteraction, { once: true, capture: true });
        return () => {
            parent.removeEventListener("pointerdown", handleInteraction, { capture: true });
            parent.removeEventListener("touchstart", handleInteraction, { capture: true });
        };
    }, [listenerReady, isComplete, handleStepInteraction]);

    // Don't render if sequence is complete (and not alwaysShow)
    if (isComplete && !alwaysShow) return null;
    if (!visible) return null;

    // Current step data
    const step = steps[Math.min(activeStep, steps.length - 1)];
    const accentColor = step.color ?? color ?? "#62D0AD";
    const gestureAnim = getGestureAnimation(step.gesture, Infinity);
    const displayLabel = step.label ?? getDefaultLabel(step.gesture);
    const posX = step.position?.x ?? "50%";
    const posY = step.position?.y ?? "50%";

    const GestureIcon = getGestureIcon(step.gesture);

    const totalSteps = steps.length;
    const stepNumber = Math.min(activeStep + 1, totalSteps);

    return (
        <AnimatePresence mode="wait">
            {!isComplete && (
                <motion.div
                    key={`step-${activeStep}`}
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
                    <DragTrail color={accentColor} gesture={step.gesture} />

                    {/* Ripple for click gesture */}
                    <ClickRipple color={accentColor} gesture={step.gesture} />

                    {/* Animated gesture icon */}
                    <motion.div
                        className="flex flex-col items-center gap-1.5"
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

                        {/* Label pill */}
                        <div
                            className="whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium"
                            style={{
                                background: `rgba(255,255,255,0.92)`,
                                color: "#374151",
                                boxShadow: `0 2px 8px rgba(0,0,0,0.1)`,
                                backdropFilter: "blur(8px)",
                                border: `1px solid rgba(0,0,0,0.06)`,
                            }}
                        >
                            {displayLabel}
                        </div>
                    </motion.div>

                    {/* Step indicator pill */}
                    {totalSteps > 1 && (
                        <div
                            className="flex items-center justify-center gap-1.5 mt-2"
                        >
                            {/* Step dots */}
                            <div className="flex items-center gap-1">
                                {steps.map((_, i) => (
                                    <div
                                        key={i}
                                        className="rounded-full transition-all duration-300"
                                        style={{
                                            width: i === activeStep ? 16 : 6,
                                            height: 6,
                                            borderRadius: i === activeStep ? 3 : 3,
                                            backgroundColor: i < activeStep
                                                ? accentColor
                                                : i === activeStep
                                                    ? accentColor
                                                    : "rgba(156, 163, 175, 0.4)",
                                            opacity: i <= activeStep ? 1 : 0.5,
                                        }}
                                    />
                                ))}
                            </div>

                            {/* Step counter text */}
                            <span
                                className="text-[10px] font-medium ml-1"
                                style={{ color: "rgba(107, 114, 128, 0.8)" }}
                            >
                                {stepNumber}/{totalSteps}
                            </span>
                        </div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default InteractionHintSequence;
