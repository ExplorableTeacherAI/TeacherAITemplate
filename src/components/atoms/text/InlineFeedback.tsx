import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVar } from '@/stores/variableStore';
import { cn } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// InlineFeedback — inline feedback for cloze inputs / choices
// ─────────────────────────────────────────────────────────────────────────────

export type FeedbackPosition = 'terminal' | 'mid' | 'standalone';

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
 * Note: Avoid trailing periods in messages since the paragraph usually ends with one.
 *
 * @example Terminal position (blank at end):
 * ```tsx
 * <EditableParagraph>
 *   A circle with radius 3 has diameter{" "}
 *   <InlineFeedback
 *     varName="answer_diameter"
 *     correctValue="6"
 *     position="terminal"
 *     successMessage="— exactly! Diameter is always twice the radius"
 *     failureMessage="— not quite."
 *     hint="The diameter stretches all the way across"
 *   >
 *     <InlineClozeInput varName="answer_diameter" correctAnswer="6" />
 *   </InlineFeedback>.
 * </EditableParagraph>
 * ```
 *
 * @example Mid-sentence position (words after blank):
 * ```tsx
 * <EditableParagraph>
 *   An interior cell has exactly{" "}
 *   <InlineFeedback
 *     varName="answer_neighbors"
 *     correctValue="4"
 *     position="mid"
 *   >
 *     <InlineClozeInput varName="answer_neighbors" correctAnswer="4" />
 *   </InlineFeedback>{" "}
 *   neighbors.
 * </EditableParagraph>
 * // Renders: "...has exactly 4 ✓ neighbors."
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
    children,
    className,
}) => {
    const storeValue = useVar(varName, '') as string;
    const defaults = getDefaultMessages(position);

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

    // Determine if we should show detailed feedback or just symbols
    const isCompact = position === 'mid';

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
                                {showReviewLink && (
                                    <button
                                        onClick={() => scrollToBlock(reviewBlockId)}
                                        className="ml-1 text-blue-600 dark:text-blue-400 hover:underline transition-colors"
                                    >
                                        {reviewLabel}
                                    </button>
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
