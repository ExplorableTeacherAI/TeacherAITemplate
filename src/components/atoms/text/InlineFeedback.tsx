import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVar, useVariableStore } from '@/stores/variableStore';
import { cn } from '@/lib/utils';
import { Eye } from 'lucide-react';
import { InlineHyperlink } from './InlineHyperlink';
import type { HintStep } from '@/components/atoms/visual/InteractionHint';

// ─────────────────────────────────────────────────────────────────────────────
// InlineFeedback — inline feedback for cloze inputs / choices
// ─────────────────────────────────────────────────────────────────────────────

export type FeedbackPosition = 'terminal' | 'mid' | 'standalone';

/** Configuration for linking feedback to a section in the lesson */
export interface SectionLink {
    /** Block ID to scroll to */
    blockId: string;
    /** Display label for the link */
    label: string;
}

/** Configuration for showing an animated visualization hint on wrong answer */
export interface VisualizationHintConfig {
    /** Block ID of the visualization to scroll to */
    blockId: string;
    /** The hint key to use for the InteractionHintSequence */
    hintKey: string;
    /** Steps for the animated hint overlay */
    steps: HintStep[];
    /** Label for the "See it" button (default: "See it in action") */
    label?: string;
    /** Accent color for the hint animation */
    color?: string;
    /**
     * Variables to reset before showing the hint.
     * Useful for ensuring the visualization starts in a state where the
     * guided hint makes sense.
     * @example { fbDemoAmplitude: 1.0 }
     */
    resetVars?: Record<string, number | string | boolean>;
}

export interface InlineFeedbackProps {
    /** Variable name to watch in the store (must match the cloze component's varName) */
    varName: string;
    /** Expected correct value (compared against the store value) */
    correctValue: string;
    /** Case-sensitive comparison (default: false) */
    caseSensitive?: boolean;
    /**
     * Position of the blank in the sentence. Affects default feedback style:
     * - 'terminal': Blank ends the sentence — detailed feedback is okay
     * - 'mid': Blank has words after it — feedback should be ultra-brief
     * - 'standalone': Question ends with ? then blank — conversational feedback
     * @default 'terminal'
     */
    position?: FeedbackPosition;
    /** Message shown when the answer is correct — celebrate and explain WHY it's right (no trailing period) */
    successMessage?: string;
    /** Message shown when the answer is wrong — be encouraging, not discouraging (no trailing period) */
    failureMessage?: string;
    /** Hint to help the student figure out the answer — guide them to discover it (no trailing period) */
    hint?: string;
    /** Block ID to scroll to so the student can review the relevant concept */
    reviewBlockId?: string;
    /** Label for the review link (default: "Review this concept") */
    reviewLabel?: string;
    /**
     * Section links — clickable links to navigate to specific lesson sections.
     * Each link scrolls to the target block and highlights it briefly.
     *
     * @example
     * ```tsx
     * sectionLinks={[
     *   { blockId: "radius-definition", label: "Review: Radius" },
     *   { blockId: "diameter-formula", label: "Review: Diameter formula" },
     * ]}
     * ```
     */
    sectionLinks?: SectionLink[];
    /**
     * Visualization hint config — when a wrong answer is given, the student
     * can click a button to navigate to a visualization and see an animated
     * hint showing exactly how to explore the concept interactively.
     *
     * @example
     * ```tsx
     * visualizationHint={{
     *   blockId: "cartesian-2d-unit-viz",
     *   hintKey: "feedback-unit-circle",
     *   steps: [{ gesture: "drag-circular", label: "Drag around the circle" }],
     *   label: "See it in action",
     * }}
     * ```
     */
    visualizationHint?: VisualizationHintConfig;
    /** The inline content (e.g., "The diameter is {cloze}.") */
    children: React.ReactNode;
    /** Custom class name for the wrapper */
    className?: string;
}

/**
 * Scroll smoothly to a block and briefly flash a highlight ring.
 */
const scrollToBlock = (blockId: string) => {
    const el = document.querySelector(`[data-block-id="${blockId}"]`);
    if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring-2', 'ring-blue-400', 'ring-offset-2');
        setTimeout(() => el.classList.remove('ring-2', 'ring-blue-400', 'ring-offset-2'), 2000);
    }
};

/**
 * Scroll to a visualization block and dispatch a custom event
 * to trigger the InteractionHintSequence on that block.
 */
const scrollToVisualizationAndTriggerHint = (config: VisualizationHintConfig) => {
    document.dispatchEvent(new CustomEvent('dismiss-interaction-hints'));

    // Reset variables to a known state before showing the hint
    if (config.resetVars) {
        const setVar = useVariableStore.getState().setVariable;
        for (const [name, value] of Object.entries(config.resetVars)) {
            setVar(name, value);
        }
    }

    const el = document.querySelector(`[data-block-id="${config.blockId}"]`);
    if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Highlight the visualization block with a beautiful glow effect
        el.classList.add('ring-2', 'ring-purple-400/60', 'ring-offset-2', 'ring-offset-purple-50/30');
        setTimeout(() => {
            el.classList.remove('ring-2', 'ring-purple-400/60', 'ring-offset-2', 'ring-offset-purple-50/30');
        }, 3500);

        // After scroll completes, dispatch event to trigger the hint overlay
        setTimeout(() => {
            const event = new CustomEvent('trigger-viz-hint', {
                detail: {
                    hintKey: config.hintKey,
                    steps: config.steps,
                    color: config.color,
                },
                bubbles: true,
            });
            el.dispatchEvent(event);
        }, 600); // Wait for scroll to settle
    }
};

/**
 * Get default messages based on position.
 * - Terminal/Standalone: More detailed defaults
 * - Mid: Ultra-brief defaults to maintain sentence flow
 */
const getDefaultMessages = (position: FeedbackPosition) => {
    switch (position) {
        case 'mid':
            return {
                success: '✓',
                failure: '✗',
            };
        case 'standalone':
            return {
                success: "That's right!",
                failure: 'Not quite!',
            };
        case 'terminal':
        default:
            return {
                success: "— exactly right!",
                failure: "— not quite.",
            };
    }
};

/**
 * InlineFeedback
 *
 * Shows instant feedback right next to the cloze input or choice as natural
 * flowing text. Blends seamlessly with the paragraph content. Designed to be
 * encouraging and educational — celebrating correct answers and guiding
 * students toward understanding when they need another try.
 *
 * **Position matters:**
 * - 'terminal': Blank ends the sentence → detailed feedback allowed
 * - 'mid': Blank mid-sentence → ultra-brief feedback (✓/✗ by default)
 * - 'standalone': Question ends with ? → conversational feedback
 *
 * **Section Links** (NEW):
 * - Add `sectionLinks` to show clickable navigation buttons to related content
 * - Each link scrolls smoothly and highlights the target block
 *
 * **Visualization Hints** (NEW):
 * - Add `visualizationHint` to show a "See it in action" button on wrong answers
 * - Scrolls to the visualization and triggers an animated interaction hint
 * - Uses the InteractionHintSequence system for beautiful animated overlays
 *
 * Note: Avoid trailing periods in messages since the paragraph usually ends with one.
 *
 * @example Terminal position with section links:
 * ```tsx
 * <InlineFeedback
 *   varName="answer_diameter"
 *   correctValue="6"
 *   position="terminal"
 *   successMessage="— exactly! Diameter is always twice the radius"
 *   failureMessage="— not quite."
 *   hint="Remember: diameter = 2 × radius"
 *   sectionLinks={[
 *     { blockId: "circle-radius-section", label: "Review: Radius" },
 *   ]}
 * >
 *   <InlineClozeInput varName="answer_diameter" correctAnswer="6" />
 * </InlineFeedback>
 * ```
 *
 * @example With visualization hint navigation:
 * ```tsx
 * <InlineFeedback
 *   varName="circleAnswer"
 *   correctValue="cos"
 *   position="standalone"
 *   failureMessage="Not quite!"
 *   hint="Try exploring the unit circle"
 *   visualizationHint={{
 *     blockId: "cartesian-2d-unit-viz",
 *     hintKey: "feedback-unit-circle",
 *     steps: [{ gesture: "drag-circular", label: "Drag around the circle to see cos and sin" }],
 *     label: "See it in action",
 *   }}
 * >
 *   <InlineClozeChoice varName="circleAnswer" options={["sin", "cos", "tan"]} />
 * </InlineFeedback>
 * ```
 */
export const InlineFeedback: React.FC<InlineFeedbackProps> = ({
    varName,
    correctValue,
    caseSensitive = false,
    position = 'terminal',
    successMessage,
    failureMessage,
    hint,
    reviewBlockId,
    reviewLabel = 'Review this concept',
    sectionLinks,
    visualizationHint,
    children,
    className,
}) => {
    const storeValue = useVar(varName, '') as string;
    const defaults = getDefaultMessages(position);
    const [vizHintTriggered, setVizHintTriggered] = useState(false);

    // Use provided messages or position-appropriate defaults
    const effectiveSuccessMessage = successMessage ?? defaults.success;
    const effectiveFailureMessage = failureMessage ?? defaults.failure;

    const hasAnswer = storeValue.trim() !== '';
    const isCorrect =
        hasAnswer &&
        (caseSensitive
            ? storeValue.trim() === correctValue.trim()
            : storeValue.trim().toLowerCase() === correctValue.trim().toLowerCase());

    // For mid-position, hints appear but are kept brief
    // For terminal/standalone, hints can be more detailed
    const showHint = hint && !isCorrect && hasAnswer;
    const showReviewLink = reviewBlockId && !isCorrect && hasAnswer;
    const showSectionLinks = sectionLinks && sectionLinks.length > 0 && !isCorrect && hasAnswer;
    const showVizHint = visualizationHint && !isCorrect && hasAnswer;

    // Determine if we should show detailed feedback or just symbols
    const isCompact = position === 'mid';

    const handleVizHintClick = useCallback(() => {
        if (!visualizationHint) return;
        setVizHintTriggered(true);
        scrollToVisualizationAndTriggerHint(visualizationHint);
        // Reset after a while so they can click again
        setTimeout(() => setVizHintTriggered(false), 5000);
    }, [visualizationHint]);

    // Reset viz hint triggered when answer changes
    React.useEffect(() => {
        setVizHintTriggered(false);
    }, [storeValue]);

    return (
        <span className={cn("inline", className)}>
            {/* The cloze component */}
            {children}

            {/* Inline feedback - appears right after the cloze component as flowing text */}
            <AnimatePresence>
                {hasAnswer && (
                    <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                    >
                        {isCorrect ? (
                            // Correct feedback — flows naturally as text
                            <span className="text-green-700 dark:text-green-400">
                                {" "}{effectiveSuccessMessage}
                            </span>
                        ) : (
                            // Incorrect feedback — hint flows as text
                            <span className="text-amber-700 dark:text-amber-400">
                                {" "}{effectiveFailureMessage}
                                {showHint && (
                                    <span>
                                        {isCompact ? ` ${hint}` : ` ${hint}`}
                                    </span>
                                )}

                                {/* Section links — inline hyperlinks embedded with the text flow */}
                                {showSectionLinks && !isCompact && (
                                    <motion.span
                                        className="ml-1"
                                        initial={{ opacity: 0, y: 4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: 0.15, ease: 'easeOut' }}
                                    >
                                        {' '}
                                        {sectionLinks!.map((link, idx) => (
                                            <React.Fragment key={`${link.blockId}-${idx}`}>
                                                {idx > 0 ? ' ' : ''}
                                                <InlineHyperlink
                                                    id={`feedback-link-${varName}-${idx}`}
                                                    showHint={false}
                                                    targetBlockId={link.blockId}
                                                    color="#2563eb"
                                                    bgColor="rgba(37, 99, 235, 0.12)"
                                                >
                                                    {link.label}
                                                </InlineHyperlink>
                                            </React.Fragment>
                                        ))}
                                    </motion.span>
                                )}

                                {/* Legacy review link (backwards compatible) */}
                                {showReviewLink && !showSectionLinks && (
                                    <button
                                        onClick={() => scrollToBlock(reviewBlockId)}
                                        className="ml-1 text-blue-600 dark:text-blue-400 hover:underline transition-colors"
                                    >
                                        {reviewLabel}
                                    </button>
                                )}

                                {/* Visualization hint CTA */}
                                {showVizHint && !isCompact && (
                                    <motion.span
                                        className="inline-block ml-1.5 align-middle"
                                        initial={{ opacity: 0, scale: 0.85, y: 2 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        transition={{ duration: 0.4, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                                    >
                                        <button
                                            onClick={handleVizHintClick}
                                            disabled={vizHintTriggered}
                                            className={cn(
                                                "group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full",
                                                "text-xs font-semibold",
                                                "transition-all duration-300 ease-out",
                                                "cursor-pointer",
                                                "active:scale-[0.96]",
                                                vizHintTriggered
                                                    ? "bg-white text-slate-400 border border-slate-200 shadow-sm"
                                                    : cn(
                                                        "bg-white text-slate-700 border border-slate-200",
                                                        "shadow-sm",
                                                        "hover:bg-slate-50 hover:border-slate-300 hover:shadow-md",
                                                        "hover:-translate-y-[1px]",
                                                    )
                                            )}
                                        >
                                            {vizHintTriggered ? (
                                                <>
                                                    <Eye className="w-3 h-3" />
                                                    <span>Showing hint…</span>
                                                </>
                                            ) : (
                                                <span>{visualizationHint!.label ?? 'See it in action'}</span>
                                            )}
                                        </button>
                                    </motion.span>
                                )}
                            </span>
                        )}
                    </motion.span>
                )}
            </AnimatePresence>
        </span>
    );
};

export default InlineFeedback;
