import React from 'react';
import { useVar } from '@/stores';

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
    const revealed = useVar<boolean>(varName, false);

    const Tag = block ? 'div' : 'span';

    if (!revealed) {
        return placeholder ? <Tag className="text-slate-400">{placeholder}</Tag> : null;
    }

    return (
        <Tag className="animate-in fade-in slide-in-from-bottom-1 duration-500">
            {children}
        </Tag>
    );
};

export default RevealOnInteraction;
