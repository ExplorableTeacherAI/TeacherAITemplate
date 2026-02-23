import { type ReactNode, Children, useState, useCallback, isValidElement, useEffect, useRef } from "react";
import { useSetVar, useVar } from "@/stores";

// ─── Sub-component ────────────────────────────────────────────────────────────

export interface StepProps {
    /** Content for this step */
    children: ReactNode;
    /** Optional className for custom styling */
    className?: string;
    /**
     * Override the layout-level `revealLabel` for just this step.
     * The button at the *bottom* of this step will use this label.
     */
    revealLabel?: string;
    /**
     * Name of a global variable (defined in variables.ts) that must be
     * truthy (non-empty string, non-zero number, or `true`) before the
     * "Continue" button for this step is enabled.
     *
     * Useful for cloze inputs or activities that must be completed before
     * the learner is allowed to proceed.
     *
     * Example:  completionVarName="stepPeriodAnswer"
     */
    completionVarName?: string;
    /**
     * When true the step hides the Continue button entirely and instead
     * watches `completionVarName` — as soon as that variable becomes truthy
     * (i.e. the learner gives the correct answer) the next step is revealed
     * automatically after a short delay.
     *
     * Requires `completionVarName` to be set.
     */
    autoAdvance?: boolean;
}

/**
 * Step - A single step inside a StepLayout.
 * Wrap one Block (or a div containing multiple Blocks) per Step.
 */
export const Step = ({ children, className = "" }: StepProps) => {
    return <div className={`step-content w-full ${className}`}>{children}</div>;
};

// ─── Internal: Auto-advance watcher ─────────────────────────────────────────

interface AutoAdvanceWatcherProps {
    gateVarName: string;
    onReady: () => void;
}

/**
 * AutoAdvanceWatcher — subscribes to `gateVarName` and fires `onReady` once,
 * with a brief delay, as soon as the variable becomes truthy.
 */
function AutoAdvanceWatcher({ gateVarName, onReady }: AutoAdvanceWatcherProps) {
    const gateValue = useVar(gateVarName, "");
    const hasTriggered = useRef(false);

    const isReady =
        gateValue !== "" && gateValue !== 0 && gateValue !== false;

    useEffect(() => {
        if (isReady && !hasTriggered.current) {
            hasTriggered.current = true;
            const timer = setTimeout(onReady, 700);
            return () => clearTimeout(timer);
        }
    }, [isReady, onReady]);

    return null;
}

// ─── Internal: Continue button (reads the gate variable reactively) ───────────

interface ContinueButtonProps {
    label: string;
    onClick: () => void;
    gateVarName?: string;
    isLast: boolean;
}

/**
 * ContinueButton — subscribes to `gateVarName` so it can enable/disable
 * itself reactively without a top-level re-render of the entire StepLayout.
 */
function ContinueButton({ label, onClick, gateVarName, isLast }: ContinueButtonProps) {
    // Always call useVar — pass a sentinel key when there is no gate so the
    // hook call count is stable across renders.
    const gateValue = useVar(gateVarName ?? "__step_no_gate__", "");
    const isReady =
        !gateVarName ||
        (gateValue !== "" && gateValue !== 0 && gateValue !== false);

    if (isLast) return null;

    return (
        <div className="flex flex-col items-start gap-1.5 mt-4">
            {gateVarName && !isReady && (
                <p className="text-xs text-[#3cc499]/70 italic">
                    Complete the activity above to continue.
                </p>
            )}
            <button
                onClick={onClick}
                disabled={!isReady}
                className="
                    inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
                    bg-[#3cc499] text-white shadow
                    transition-all duration-150
                    hover:opacity-90 active:scale-95
                    disabled:opacity-30 disabled:cursor-not-allowed disabled:pointer-events-none
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3cc499]
                    select-none
                "
            >
                <span>{label}</span>
                <span className="text-base leading-none">→</span>
            </button>
        </div>
    );
}

// ─── Main Layout ──────────────────────────────────────────────────────────────

export interface StepLayoutProps {
    /**
     * Children — should be a sequence of <Step> elements.
     */
    children: ReactNode;
    /** Optional className for the outer container */
    className?: string;
    /**
     * Name of the global variable (defined in variables.ts) that will receive
     * the 0-based index of the currently revealed step.
     * Read it in any component with: const idx = useVar(varName, 0) as number;
     */
    varName?: string;
    /**
     * Default label for the "Continue" button shown at the bottom of each
     * step (except the last). Can be overridden per-step via <Step revealLabel>.
     * @default "Continue"
     */
    revealLabel?: string;
    /**
     * Show a progress indicator above the steps ("Step N of M" + dots).
     * @default true
     */
    showProgress?: boolean;
    /**
     * Allow the user to re-collapse already-revealed steps by clicking a
     * back button. Useful for review flows.
     * @default false
     */
    allowBack?: boolean;
    /** Optional callback fired whenever a new step is revealed */
    onStepReveal?: (revealedUpTo: number) => void;
}

/**
 * StepLayout
 *
 * A progressive-disclosure layout that shows lesson content step-by-step.
 * Steps are revealed sequentially — completed steps stack above the current
 * one so the learner retains context. Each step shows a "Continue →" button
 * that reveals the next step (optionally gated behind completing an activity).
 *
 * The index of the currently revealed step is written to a global variable
 * via `varName` so external components can react to learner progress.
 *
 * Usage:
 * ```tsx
 * // 1. (Optional) Define a variable in variables.ts:
 * //    stepProgress: { defaultValue: 0, type: 'number', min: 0, max: 4, step: 1 }
 *
 * // 2. Add an activity variable (optional, for gating):
 * //    myAnswer: { defaultValue: '', type: 'text', correctAnswer: '42', placeholder: '???' }
 *
 * // 3. Build your steps:
 * <StepLayout varName="stepProgress" revealLabel="Next step" showProgress>
 *   <Step>
 *     <Block id="block-step-0" padding="md">
 *       <EditableH2 id="h2-step-0" blockId="block-step-0">Introduction</EditableH2>
 *     </Block>
 *   </Step>
 *
 *   <Step completionVarName="myAnswer">
 *     <Block id="block-step-1" padding="sm">
 *       <EditableParagraph id="para-step-1" blockId="block-step-1">
 *         Fill in the answer: <InlineClozeInput varName="myAnswer" correctAnswer="42" ... />
 *       </EditableParagraph>
 *     </Block>
 *   </Step>
 *
 *   <Step>
 *     <Block id="block-step-2" padding="sm">
 *       <EditableParagraph id="para-step-2" blockId="block-step-2">
 *         Well done! Here is the explanation.
 *       </EditableParagraph>
 *     </Block>
 *   </Step>
 * </StepLayout>
 * ```
 */
export const StepLayout = ({
    children,
    className = "",
    varName,
    revealLabel = "Continue",
    showProgress = true,
    allowBack = false,
    onStepReveal,
}: StepLayoutProps) => {
    const steps = Children.toArray(children);
    const total = steps.length;
    const [revealedUpTo, setRevealedUpTo] = useState(0);
    const setVar = useSetVar();

    const reveal = useCallback(
        (index: number) => {
            if (index < 0 || index >= total) return;
            setRevealedUpTo(index);
            if (varName) setVar(varName, index);
            onStepReveal?.(index);
        },
        [total, varName, setVar, onStepReveal]
    );

    const revealNext = useCallback(
        (current: number) => reveal(current + 1),
        [reveal]
    );

    const revealPrev = useCallback(
        (current: number) => reveal(Math.max(0, current - 1)),
        [reveal]
    );

    // ── Helpers ────────────────────────────────────────────────────────────────

    /** Extract per-step props from the Step element if JSX props are accessible. */
    const getStepProps = (child: ReturnType<typeof Children.toArray>[number]): StepProps => {
        if (isValidElement(child) && child.type === Step) {
            return child.props as StepProps;
        }
        return {};
    };

    // ── Progress counter (optional, text-based rather than dots) ──────────────

    const progressBar = showProgress && total > 1 && (
        <div className="mb-5 text-xs font-medium text-[#3cc499]/60 tracking-wide select-none">
            Step {revealedUpTo + 1} / {total}
        </div>
    );

    // ── Render ─────────────────────────────────────────────────────────────────

    return (
        <div
            className={`w-full flex flex-col ${className}`}
            data-layout-type="step"
            data-layout-total={total}
            data-layout-revealed={revealedUpTo}
        >
            {progressBar}

            <div className="flex flex-col">
                {steps.map((child, index) => {
                    const isCurrentStep = index === revealedUpTo;
                    const isFuture = index > revealedUpTo;
                    const isLast = index === total - 1;
                    const stepProps = getStepProps(child);
                    const buttonLabel = stepProps.revealLabel ?? revealLabel;
                    const isAutoAdvance = !!stepProps.autoAdvance && !!stepProps.completionVarName;

                    if (isFuture) return null;

                    return (
                        <div
                            key={index}
                            className={`
                                w-full
                                animate-in fade-in slide-in-from-bottom-3 duration-500
                                ${index > 0 ? "pt-6 mt-2" : ""}
                            `}
                        >
                            {/* Step content */}
                            <div>{child}</div>

                            {/* Auto-advance watcher (question-type steps) */}
                            {isCurrentStep && isAutoAdvance && !isLast && (
                                <AutoAdvanceWatcher
                                    gateVarName={stepProps.completionVarName!}
                                    onReady={() => revealNext(index)}
                                />
                            )}

                            {/* Continue / Back buttons (normal steps only) */}
                            <div className="flex items-center gap-3 flex-wrap">
                                {isCurrentStep && !isAutoAdvance && (
                                    <ContinueButton
                                        label={buttonLabel}
                                        onClick={() => revealNext(index)}
                                        gateVarName={stepProps.completionVarName}
                                        isLast={isLast}
                                    />
                                )}
                                {allowBack && index > 0 && isCurrentStep && (
                                    <button
                                        onClick={() => revealPrev(index)}
                                        className="
                                            inline-flex items-center gap-1.5 mt-4 px-3 py-2 rounded-xl
                                            text-xs font-medium text-[#3cc499]
                                            border border-[#3cc499]/30 bg-background
                                            hover:bg-[#3cc499]/10
                                            transition-all duration-150 select-none
                                            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3cc499]
                                        "
                                    >
                                        <span>←</span>
                                        <span>Back</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
