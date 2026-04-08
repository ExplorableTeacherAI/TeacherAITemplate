import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVar } from '@/stores/variableStore';
import { cn } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// InlineFeedback — inline feedback for cloze inputs / choices
// ─────────────────────────────────────────────────────────────────────────────

export interface InlineFeedbackProps {
    /** Variable name to watch in the store (must match the cloze component's varName) */
    varName: string;
    /** Expected correct value (compared against the store value) */
    correctValue: string;
    /** Case-sensitive comparison (default: false) */
    caseSensitive?: boolean;
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
 * InlineFeedback
 *
 * Shows instant feedback right next to the cloze input or choice as natural
 * flowing text. Blends seamlessly with the paragraph content. Designed to be
 * encouraging and educational — celebrating correct answers and guiding
 * students toward understanding when they need another try.
 *
 * Note: Avoid trailing periods in messages since the paragraph usually ends with one.
 *
 * @example
 * ```tsx
 * <p>
 *   A circle with radius 3 has diameter{" "}
 *   <InlineFeedback
 *     varName="answer_diameter"
 *     correctValue="6"
 *     successMessage="Brilliant! The diameter is always twice the radius, so 2 × 3 = 6"
 *     failureMessage="Almost there!"
 *     hint="The diameter stretches all the way across — it's exactly twice the radius"
 *   >
 *     <InlineClozeInput varName="answer_diameter" correctAnswer="6" />
 *   </InlineFeedback>.
 * </p>
 * ```
 */
export const InlineFeedback: React.FC<InlineFeedbackProps> = ({
    varName,
    correctValue,
    caseSensitive = false,
    successMessage = "Well done! That's exactly right",
    failureMessage = "Good effort!",
    hint,
    reviewBlockId,
    reviewLabel = 'Review this concept',
    children,
    className,
}) => {
    const storeValue = useVar(varName, '') as string;

    const hasAnswer = storeValue.trim() !== '';
    const isCorrect =
        hasAnswer &&
        (caseSensitive
            ? storeValue.trim() === correctValue.trim()
            : storeValue.trim().toLowerCase() === correctValue.trim().toLowerCase());

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
                                {" "}{successMessage}
                            </span>
                        ) : (
                            // Incorrect feedback — hint flows as text
                            <span className="text-amber-700 dark:text-amber-400">
                                {" "}{failureMessage}
                                {hint && <span> {hint}</span>}
                                {reviewBlockId && (
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
