import React, { useEffect } from 'react';
import { useSetVar, useVar } from '@/stores';
import { CHAT_INTERACTION_VAR } from '@/lib/chatTerms';

interface RevealOnInteractionProps {
    /**
     * Boolean variable in the global store that becomes `true` once the student
     * has interacted with the visualization. Pair it with the `interactionVar`
     * prop on `Cartesian2D` (or set the variable from any `onChange` handler).
     */
    varName: string;
    /** Content revealed once `varName` is truthy (e.g. the embedded question). */
    children: React.ReactNode;
    /**
     * Optional content shown BEFORE the student interacts — usually a soft nudge
     * to explore first. Defaults to nothing so the question simply appears.
     */
    placeholder?: React.ReactNode;
    /** Render as a block (`div`) instead of inline (`span`). Default inline. */
    block?: boolean;
}

/**
 * RevealOnInteraction
 *
 * Hides its children until the student has explored the visualization, then
 * fades them in. This keeps an embedded question out of sight until the
 * student has actually dragged/scrubbed something — so they explore first and
 * are prompted for the answer second.
 *
 * The hidden children still take up their space (`visibility: hidden`, not
 * `display: none`): in the tutor chat the explorable's height is what the
 * transcript scrolls by, and content that appears from nothing makes the
 * figure jump and the chat shift under the student. Reserving the space
 * means the reveal changes nothing but what is visible.
 *
 * @example
 * ```tsx
 * // 1. The visualization flips the flag on first drag:
 * <Cartesian2D interactionVar="sameSegmentAngles_explored" movablePoints={[...]} />
 *
 * // 2. The question stays hidden until then:
 * <RevealOnInteraction varName="sameSegmentAngles_explored">
 *     When inscribed angles subtend the same arc, they are{" "}
 *     <InlineFeedback ...><InlineClozeChoice ... /></InlineFeedback>.
 * </RevealOnInteraction>
 * ```
 */
export const RevealOnInteraction: React.FC<RevealOnInteractionProps> = ({
    varName,
    children,
    placeholder = null,
    block = false,
}) => {
    const flagged = useVar<boolean>(varName, false);
    // In the tutor chat the student can change the figure's variables from
    // the bubbles (scrub a number, click a `set:` chip or a term). That is
    // exploring too, but it never runs the figure's own onChange that would
    // flip the flag — so the embedded view counts those changes here, and
    // the first one reveals the question and sets the flag for everyone else.
    const chatInteractions = useVar<number>(CHAT_INTERACTION_VAR, 0);
    const setVar = useSetVar();
    const revealed = flagged || chatInteractions > 0;
    useEffect(() => {
        if (!flagged && chatInteractions > 0) setVar(varName, true);
    }, [flagged, chatInteractions, setVar, varName]);

    const Tag = block ? 'div' : 'span';

    if (!revealed) {
        // The `data-reveal-pending` marker lets the editor's EditableText tell
        // "content staged behind an interaction" apart from a truly empty
        // block, so no "Click to edit empty block…" placeholder appears over
        // content that is merely waiting to be revealed. The children are
        // laid out but invisible and inert, so the reveal keeps the height.
        return placeholder
            ? <Tag data-reveal-pending="true" className="text-slate-400">{placeholder}</Tag>
            : (
                <Tag data-reveal-pending="true" aria-hidden="true"
                    style={{ visibility: 'hidden', pointerEvents: 'none' }}
                    // @ts-expect-error inert is not in React's typings yet
                    inert="">
                    {children}
                </Tag>
            );
    }

    return (
        <Tag className="animate-in fade-in slide-in-from-bottom-1 duration-500">
            {children}
        </Tag>
    );
};

export default RevealOnInteraction;
