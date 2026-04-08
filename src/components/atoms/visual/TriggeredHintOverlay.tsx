import { useState, useEffect, useRef, useCallback } from 'react';
import { InteractionHintSequence } from '@/components/atoms/visual/InteractionHint';
import type { HintStep } from '@/components/atoms/visual/InteractionHint';

// ─────────────────────────────────────────────────────────────────────────────
// TriggeredHintOverlay — shows an InteractionHintSequence when triggered
// by the InlineFeedback navigation system via a custom DOM event.
// ─────────────────────────────────────────────────────────────────────────────

export interface TriggeredHintOverlayProps {
    /**
     * Unique key for this hint overlay (should match the hintKey in
     * VisualizationHintConfig passed to InlineFeedback).
     */
    hintKey: string;
    /** Default steps (used if the trigger event doesn't provide steps) */
    defaultSteps?: HintStep[];
    /** Default accent color */
    color?: string;
}

/**
 * TriggeredHintOverlay
 *
 * Place this inside a `position: relative` container (typically next to your
 * Cartesian2D/3D visualization). It listens for `trigger-viz-hint` custom events
 * on its parent and shows an animated interaction hint overlay when triggered.
 *
 * The hint auto-dismisses when the user interacts with the visualization.
 *
 * @example
 * ```tsx
 * <div className="relative">
 *   <Cartesian2D ... />
 *   <TriggeredHintOverlay hintKey="feedback-unit-circle" />
 * </div>
 * ```
 *
 * This works with InlineFeedback's `visualizationHint` prop:
 * ```tsx
 * <InlineFeedback
 *   visualizationHint={{
 *     blockId: "unit-circle-viz",
 *     hintKey: "feedback-unit-circle",
 *     steps: [{ gesture: "drag-circular", label: "Drag around the circle" }],
 *   }}
 * >
 *   ...
 * </InlineFeedback>
 * ```
 */
export function TriggeredHintOverlay({
    hintKey,
    defaultSteps,
    color = '#62D0AD',
}: TriggeredHintOverlayProps) {
    const [triggered, setTriggered] = useState(false);
    const [activeSteps, setActiveSteps] = useState<HintStep[]>(defaultSteps ?? []);
    const [activeColor, setActiveColor] = useState(color);
    const [sequenceVersion, setSequenceVersion] = useState(0);
    const overlayRef = useRef<HTMLDivElement>(null);

    // Listen for the custom event on the parent (block) element
    useEffect(() => {
        const overlayEl = overlayRef.current;
        // Walk up to find the [data-block-id] container — that's where
        // InlineFeedback dispatches the event.
        let target: HTMLElement | null = overlayEl;
        while (target && !target.hasAttribute('data-block-id')) {
            target = target.parentElement;
        }
        if (!target) {
            // Fallback: listen on the direct parent
            target = overlayEl?.parentElement ?? null;
        }
        if (!target) {
            return;
        }

        const handler = (e: Event) => {
            const detail = (e as CustomEvent).detail;
            if (detail?.hintKey !== hintKey) {
                return;
            }

            document.dispatchEvent(new CustomEvent('dismiss-interaction-hints', {
                detail: { exceptHintKey: `triggered-${hintKey}` },
            }));

            // Set the steps and color from the event (or use defaults)
            if (detail.steps && detail.steps.length > 0) {
                setActiveSteps(detail.steps);
            }
            if (detail.color) {
                setActiveColor(detail.color);
            }

            // Show the hint - no auto-dismiss, let user complete the steps
            setSequenceVersion((version) => version + 1);
            setTriggered(true);
        };

        target.addEventListener('trigger-viz-hint', handler);
        return () => {
            target?.removeEventListener('trigger-viz-hint', handler);
        };
    }, [hintKey]);

    // Dismiss when another part of the page requests all hints to close
    useEffect(() => {
        const handleDismissAll = (e: Event) => {
            const detail = (e as CustomEvent).detail;
            if (detail?.exceptHintKey === `triggered-${hintKey}`) return;
            setTriggered(false);
        };

        document.addEventListener('dismiss-interaction-hints', handleDismissAll);
        return () => document.removeEventListener('dismiss-interaction-hints', handleDismissAll);
    }, [hintKey]);

    const handleSequenceComplete = useCallback(() => {
        setTriggered(false);
    }, []);

    if (!triggered || activeSteps.length === 0) {
        return <div ref={overlayRef} className="hidden" />;
    }

    return (
        <div ref={overlayRef}>
            <InteractionHintSequence
                hintKey={`triggered-${hintKey}-${sequenceVersion}`}
                steps={activeSteps}
                alwaysShow
                color={activeColor}
                delay={200}
                onSequenceComplete={handleSequenceComplete}
            />
        </div>
    );
}

export default TriggeredHintOverlay;
