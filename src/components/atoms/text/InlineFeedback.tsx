import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useVar, useVariableStore } from '@/stores/variableStore';
import { cn } from '@/lib/utils';
import { useAppMode } from '@/contexts/AppModeContext';
import { useEditing } from '@/contexts/EditingContext';
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
     */
    sectionLinks?: SectionLink[];
    /**
     * Visualization hint config — when a wrong answer is given, the student
     * can click a button to navigate to a visualization and see an animated
     * hint showing exactly how to explore the concept interactively.
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

    if (config.resetVars) {
        const setVar = useVariableStore.getState().setVariable;
        for (const [name, value] of Object.entries(config.resetVars)) {
            setVar(name, value);
        }
    }

    const el = document.querySelector(`[data-block-id="${config.blockId}"]`);
    if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });

        el.classList.add('ring-2', 'ring-emerald-400/60', 'ring-offset-2', 'ring-offset-emerald-50/30');
        setTimeout(() => {
            el.classList.remove('ring-2', 'ring-emerald-400/60', 'ring-offset-2', 'ring-offset-emerald-50/30');
        }, 3500);

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
        }, 600);
    }
};

const getDefaultMessages = (position: FeedbackPosition) => {
    switch (position) {
        case 'mid':
            return { success: '✓', failure: '✗' };
        case 'standalone':
            return { success: "That's right!", failure: 'Not quite!' };
        case 'terminal':
        default:
            return { success: "— exactly right!", failure: "— not quite." };
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// FeedbackSectionLink — clickable span that navigates to a lesson section.
// Uses onMouseDown (not onClick) to work inside contentEditable regions.
// ─────────────────────────────────────────────────────────────────────────────

const FeedbackSectionLink: React.FC<{ link: SectionLink; isEditing: boolean }> = ({ link, isEditing }) => {
    const [hovered, setHovered] = useState(false);

    const handleInteraction = useCallback((e: React.MouseEvent | React.KeyboardEvent) => {
        e.preventDefault();
        e.stopPropagation();
        scrollToBlock(link.blockId);
    }, [link.blockId]);

    return (
        <span
            role="button"
            tabIndex={0}
            onMouseDown={handleInteraction}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') handleInteraction(e);
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                display: 'inline',
                color: '#2563eb',
                fontWeight: 500,
                cursor: 'pointer',
                borderBottom: '2px solid #2563eb',
                paddingBottom: '1px',
                background: hovered ? 'rgba(37, 99, 235, 0.12)' : 'transparent',
                borderRadius: hovered ? '3px 3px 0 0' : '0',
                transition: 'background 0.15s ease',
                userSelect: 'none',
            }}
        >
            {link.label}
        </span>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// FeedbackVizHintButton — styled "button" that triggers the visualization hint.
// Uses onMouseDown to work inside contentEditable regions.
// ─────────────────────────────────────────────────────────────────────────────

const FeedbackVizHintButton: React.FC<{
    label: string;
    triggered: boolean;
    onClick: () => void;
    isEditing: boolean;
}> = ({ label, triggered, onClick, isEditing }) => {
    const [hovered, setHovered] = useState(false);

    const bgColor = triggered
        ? '#f1f5f9'
        : hovered
            ? '#f5f5f5'
            : '#ffffff';
    const textColor = triggered ? '#94a3b8' : '#1f2937';
    const borderColor = triggered ? '#e2e8f0' : hovered ? '#374151' : '#4b5563';

    const handleInteraction = useCallback((e: React.MouseEvent | React.KeyboardEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!triggered) onClick();
    }, [triggered, onClick]);

    return (
        <span
            role="button"
            tabIndex={0}
            onMouseDown={handleInteraction}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') handleInteraction(e);
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '4px 12px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 600,
                lineHeight: '1.4',
                cursor: triggered ? 'default' : 'pointer',
                backgroundColor: bgColor,
                color: textColor,
                border: `1px solid ${borderColor}`,
                boxShadow: triggered
                    ? 'none'
                    : '0 1px 2px rgba(0, 0, 0, 0.05)',
                transition: 'all 0.15s ease',
                userSelect: 'none',
                verticalAlign: 'middle',
            }}
        >
            <span>{triggered ? 'Showing hint…' : label}</span>
        </span>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// InlineFeedback — main component
// ─────────────────────────────────────────────────────────────────────────────

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
    const feedbackRef = useRef<HTMLSpanElement>(null);
    const [visible, setVisible] = useState(false);

    // Detect edit mode
    const { isEditor } = useAppMode();
    const { isEditing } = useEditing();
    const isStandalone = typeof window !== 'undefined' && window.self === window.top;
    const canEdit = isEditor || isStandalone;
    const inEditMode = canEdit && isEditing;

    const effectiveSuccessMessage = successMessage ?? defaults.success;
    const effectiveFailureMessage = failureMessage ?? defaults.failure;

    const hasAnswer = storeValue.trim() !== '';
    const isCorrect =
        hasAnswer &&
        (caseSensitive
            ? storeValue.trim() === correctValue.trim()
            : storeValue.trim().toLowerCase() === correctValue.trim().toLowerCase());

    const showHint = hint && !isCorrect && hasAnswer;
    const showReviewLink = reviewBlockId && !isCorrect && hasAnswer;
    const showSectionLinks = sectionLinks && sectionLinks.length > 0 && !isCorrect && hasAnswer;
    const showVizHint = visualizationHint && !isCorrect && hasAnswer;

    const isCompact = position === 'mid';

    // Fade-in animation
    useEffect(() => {
        if (hasAnswer) {
            const raf = requestAnimationFrame(() => setVisible(true));
            return () => cancelAnimationFrame(raf);
        }
        setVisible(false);
    }, [hasAnswer]);

    const handleVizHintClick = useCallback(() => {
        if (!visualizationHint) return;
        setVizHintTriggered(true);
        scrollToVisualizationAndTriggerHint(visualizationHint);
        setTimeout(() => setVizHintTriggered(false), 5000);
    }, [visualizationHint]);

    useEffect(() => {
        setVizHintTriggered(false);
    }, [storeValue]);

    const handleReviewClick = useCallback((e: React.MouseEvent | React.KeyboardEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (reviewBlockId) scrollToBlock(reviewBlockId);
    }, [reviewBlockId]);

    return (
        <span
            className={cn("inline", className)}
            data-inline-component="inlineFeedback"
        >
            {children}

            {hasAnswer && (
                <span
                    ref={feedbackRef}
                    data-inline-component="inlineFeedbackResult"
                    contentEditable={false}
                    style={{
                        opacity: visible ? 1 : 0,
                        transition: 'opacity 0.2s ease-out',
                        display: 'inline',
                    }}
                >
                    {isCorrect ? (
                        <span style={{ color: '#15803d' }}>
                            {" "}{effectiveSuccessMessage}
                        </span>
                    ) : (
                        <span style={{ display: 'inline' }}>
                            {/* Failure message + hint text */}
                            <span style={{ color: '#b45309' }}>
                                {" "}{effectiveFailureMessage}
                                {showHint && <span>{` ${hint}`}</span>}
                            </span>

                            {/* Section links */}
                            {showSectionLinks && !isCompact && (
                                <span style={{ display: 'inline' }}>
                                    {' '}
                                    {sectionLinks!.map((link, idx) => (
                                        <React.Fragment key={`${link.blockId}-${idx}`}>
                                            {idx > 0 ? ' ' : ''}
                                            <FeedbackSectionLink link={link} isEditing={inEditMode} />
                                        </React.Fragment>
                                    ))}
                                </span>
                            )}

                            {/* Legacy review link (backwards compatible) */}
                            {showReviewLink && !showSectionLinks && (
                                <span
                                    role="button"
                                    tabIndex={0}
                                    onMouseDown={handleReviewClick}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') handleReviewClick(e);
                                    }}
                                    style={{
                                        marginLeft: '4px',
                                        color: '#2563eb',
                                        cursor: 'pointer',
                                        fontWeight: 500,
                                        borderBottom: '2px solid #2563eb',
                                        paddingBottom: '1px',
                                        userSelect: 'none',
                                    }}
                                >
                                    {reviewLabel}
                                </span>
                            )}

                            {/* Visualization hint CTA */}
                            {showVizHint && !isCompact && (
                                <span style={{ marginLeft: '8px', display: 'inline' }}>
                                    <FeedbackVizHintButton
                                        label={visualizationHint!.label ?? 'See it in action'}
                                        triggered={vizHintTriggered}
                                        onClick={handleVizHintClick}
                                        isEditing={inEditMode}
                                    />
                                </span>
                            )}
                        </span>
                    )}
                </span>
            )}
        </span>
    );
};

export default InlineFeedback;
