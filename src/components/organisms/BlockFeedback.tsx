import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { create } from 'zustand';
import { useVar } from '@/stores/variableStore';
import Lottie from 'lottie-react';

// ─────────────────────────────────────────────────────────────────────────────
// Shared store — only one BlockFeedback shows its panel at a time
// ─────────────────────────────────────────────────────────────────────────────
const useActiveFeedback = create<{
    activeVar: string | null;
    setActive: (v: string | null) => void;
}>((set) => ({
    activeVar: null,
    setActive: (v) => set({ activeVar: v }),
}));

// ─────────────────────────────────────────────────────────────────────────────
// BlockFeedback — lightweight feedback wrapper for cloze-input / cloze-choice
// ─────────────────────────────────────────────────────────────────────────────

export interface BlockFeedbackProps {
    /** Variable name to watch in the store (must match the cloze component's varName) */
    varName: string;
    /** Expected correct value (compared against the store value) */
    correctValue: string;
    /** Case-sensitive comparison (default: false) */
    caseSensitive?: boolean;
    /** Message shown when the answer is correct — can be a string or JSX with inline components */
    successMessage?: React.ReactNode;
    /** Message shown when the answer is wrong — can be a string or JSX with inline components */
    failureMessage?: React.ReactNode;
    /** Hint shown for wrong answers — can be a string or JSX with inline components */
    hint?: React.ReactNode;
    /** Block ID to scroll to so the student can review the relevant concept */
    reviewBlockId?: string;
    /** Label for the review link (default: "Review this concept") */
    reviewLabel?: string;
    /** The block content to wrap (paragraph with cloze input/choice inside) */
    children: React.ReactNode;
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
 * BlockFeedback
 *
 * A reusable wrapper that watches a cloze variable and shows contextual
 * feedback as a mascot + speech bubble below the block. Works with both
 * `InlineClozeInput` and `InlineClozeChoice`.
 *
 * **Submission timing**: Feedback only appears after the student actually
 * submits their answer — NOT while they are still typing. For
 * `InlineClozeInput`, submission happens on Enter, blur (clicking away),
 * or when the typed value auto-matches the correct answer. For
 * `InlineClozeChoice`, selecting a dropdown option counts as submission.
 *
 * @example
 * ```tsx
 * <BlockFeedback
 *     varName="answer_radius"
 *     correctValue="5"
 *     successMessage="The radius is half the diameter."
 *     failureMessage="Think about the relationship between radius and diameter."
 *     hint="If the diameter is 10, what is 10 ÷ 2?"
 *     reviewBlockId="block-circle-intro"
 * >
 *     <EditableParagraph id="para-q1" blockId="block-q1">
 *         A circle with diameter 10 has radius{" "}
 *         <InlineClozeInput varName="answer_radius" correctAnswer="5" ... />.
 *     </EditableParagraph>
 * </BlockFeedback>
 * ```
 */
export const BlockFeedback: React.FC<BlockFeedbackProps> = ({
    varName,
    correctValue,
    caseSensitive = false,
    successMessage = 'Correct! Well done.',
    failureMessage = 'Not quite right. Try again.',
    hint,
    reviewBlockId,
    reviewLabel = 'Review this concept',
    children,
}) => {
    const storeValue = useVar(varName, '') as string;
    const prevValueRef = useRef(storeValue);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const { activeVar, setActive } = useActiveFeedback();
    const [confettiData, setConfettiData] = useState<object | null>(null);
    const [sadFaceData, setSadFaceData] = useState<object | null>(null);

    // Lazy-load Lottie JSON files (use BASE_URL so it works under any deploy path)
    useEffect(() => {
        if (!confettiData) {
            fetch(`${import.meta.env.BASE_URL}Corgi%20running.json`)
                .then((r) => r.json())
                .then(setConfettiData)
                .catch(() => {});
        }
        if (!sadFaceData) {
            fetch(`${import.meta.env.BASE_URL}Happy%20Dog.json`)
                .then((r) => r.json())
                .then(setSadFaceData)
                .catch(() => {});
        }
    }, [confettiData, sadFaceData]);

    // When the student's answer changes, claim active status
    useEffect(() => {
        if (storeValue !== prevValueRef.current) {
            prevValueRef.current = storeValue;
            if (storeValue.trim() !== '') {
                setActive(varName);
            }
        }
    }, [storeValue, varName, setActive]);

    const hasAnswer = storeValue.trim() !== '';
    const isCorrect =
        hasAnswer &&
        (caseSensitive
            ? storeValue.trim() === correctValue.trim()
            : storeValue.trim().toLowerCase() === correctValue.trim().toLowerCase());
    const showPanel = hasAnswer && activeVar === varName;

    const bubbleBg = 'bg-gray-100 dark:bg-gray-800';
    const bubbleText = 'text-gray-800 dark:text-gray-100';

    // Pick the right Lottie data
    const lottieData = isCorrect ? confettiData : sadFaceData;

    return (
        <div ref={wrapperRef}>
            {/* Wrapped content — rendered in normal flow */}
            {children}

            {/* Feedback — mascot + speech bubble below the block */}
            <AnimatePresence>
                {showPanel && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                        className="flex items-center gap-0 -mt-1"
                    >
                        {/* Lottie mascot */}
                        {lottieData && (
                            <div className="shrink-0 -mr-1 z-10 self-center">
                                <Lottie
                                    animationData={lottieData}
                                    loop
                                    autoplay
                                    style={{ width: '200px', height: '200px' }}
                                />
                            </div>
                        )}

                        {/* Speech bubble with left-pointing tail */}
                        <div className={`relative rounded-2xl ${bubbleBg} px-5 py-3 text-sm ${bubbleText} leading-relaxed max-w-md shadow-sm`}>
                            {/* Tail pointing to mascot */}
                            <div
                                className="absolute top-1/2 -left-2 -translate-y-1/2 w-0 h-0"
                                style={{
                                    borderTop: '8px solid transparent',
                                    borderBottom: '8px solid transparent',
                                    borderRight: '8px solid #f3f4f6',
                                }}
                            />
                            {/* Close button */}
                            <button
                                onClick={() => setActive(null)}
                                className="absolute top-2 right-2 p-0.5 rounded-full opacity-40 hover:opacity-70 transition-opacity"
                                aria-label="Dismiss feedback"
                            >
                                <X className="w-3 h-3" />
                            </button>

                            {isCorrect ? (
                                <p className="pr-5">{successMessage}</p>
                            ) : (
                                <p className="pr-5">
                                    {failureMessage}
                                    {hint && (
                                        <> {hint}</>  
                                    )}
                                    {reviewBlockId && (
                                        <>{" "}
                                            <button
                                                onClick={() => scrollToBlock(reviewBlockId)}
                                                className="inline font-medium cursor-pointer hover:underline"
                                                style={{ color: '#10B981' }}
                                            >
                                                {reviewLabel}
                                            </button>
                                        </>
                                    )}
                                </p>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BlockFeedback;
