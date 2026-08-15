import { useState } from "react";
import { Hand, Lightbulb, Loader2, RefreshCw, Sparkles, Star } from "lucide-react";
import { useAppMode } from "@/contexts/AppModeContext";

export interface VisualOptionCard {
    /** Stable id for this option, e.g. "unit-circle-drag" */
    id: string;
    /** Short name of the visual, e.g. "Unrolling the circle" */
    title: string;
    /** The exact thing the student drags/moves INSIDE the visual */
    manipulate: string;
    /** The critical point / aha moment the interaction reveals */
    reveals: string;
    /** One or two sentences describing what the visual looks like */
    looks: string;
    /** Optional: the misconception this design targets */
    targetsMisconception?: string;
    /** Mark at most ONE card as recommended */
    recommended?: boolean;
}

interface VisualOptionCardsProps {
    /** The block id this carousel lives in (the visual will replace this block) */
    blockId: string;
    /** Optional one-line prompt above the cards */
    intro?: string;
    cards: VisualOptionCard[];
}

/**
 * VisualOptionCards — teacher-facing chooser for a section's visualization.
 *
 * Rendered by the builder during phase 1 (text-first section builds) in the
 * spot where the section's interactive visual will go. Each card is a brief
 * design spec; when the teacher picks one, the choice is posted to the parent
 * editor frame, which forwards it to the builder as a chat message. The
 * builder then builds that visual and REPLACES this block with it (phase 2).
 *
 * Editor-mode only: students never see this block — in preview mode it
 * renders nothing, so an unfinished section is just clean text.
 */
export const VisualOptionCards = ({ blockId, intro, cards }: VisualOptionCardsProps) => {
    const { isPreview } = useAppMode();
    const [chosenId, setChosenId] = useState<string | null>(null);
    const [regenerating, setRegenerating] = useState(false);

    if (isPreview) return null;

    const busy = chosenId !== null || regenerating;

    const choose = (card: VisualOptionCard) => {
        if (busy) return;
        setChosenId(card.id);
        window.parent.postMessage(
            {
                type: "visual-card-selected",
                blockId,
                cardId: card.id,
                cardTitle: card.title,
            },
            "*",
        );
    };

    const askForDifferentIdeas = () => {
        if (busy) return;
        setRegenerating(true);
        window.parent.postMessage(
            { type: "visual-cards-regenerate", blockId },
            "*",
        );
    };

    if (chosenId) {
        const chosen = cards.find((c) => c.id === chosenId);
        return (
            <div
                data-visual-option-cards
                className="w-full rounded-xl border border-slate-200 bg-white p-6"
            >
                <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-[#62D0AD]" />
                    <span className="text-sm font-medium text-slate-500">
                        Building your visual{chosen ? ` — ${chosen.title}` : ""}…
                    </span>
                </div>
                <div className="mt-4 animate-pulse space-y-3">
                    <div className="h-40 rounded-lg bg-slate-100" />
                    <div className="h-4 w-3/5 rounded bg-slate-100" />
                </div>
            </div>
        );
    }

    return (
        <div
            data-visual-option-cards
            className="w-full rounded-xl border border-dashed border-slate-300 bg-slate-50/60 p-5"
        >
            <div className="mb-4 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#62D0AD]" />
                <span className="text-sm font-medium text-slate-600">
                    {intro ?? "Choose the interactive visual for this section"}
                </span>
            </div>

            <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2">
                {cards.map((card) => (
                    <div
                        key={card.id}
                        className={`relative flex w-72 flex-none snap-start flex-col rounded-lg border bg-white p-4 shadow-sm ${
                            card.recommended ? "border-[#62D0AD]" : "border-slate-200"
                        } ${regenerating ? "opacity-50" : ""}`}
                    >
                        {card.recommended && (
                            <span className="absolute -top-2.5 right-3 flex items-center gap-1 rounded-full bg-[#62D0AD] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                                <Star className="h-3 w-3" /> Recommended
                            </span>
                        )}
                        <h4 className="mb-2 pr-2 text-sm font-semibold text-slate-800">
                            {card.title}
                        </h4>
                        <p className="mb-3 text-xs leading-relaxed text-slate-500">
                            {card.looks}
                        </p>
                        <div className="mb-2 flex items-start gap-2">
                            <Hand className="mt-0.5 h-3.5 w-3.5 flex-none text-slate-400" />
                            <p className="text-xs leading-relaxed text-slate-600">
                                <span className="font-medium text-slate-700">Students move:</span>{" "}
                                {card.manipulate}
                            </p>
                        </div>
                        <div className="mb-3 flex items-start gap-2">
                            <Lightbulb className="mt-0.5 h-3.5 w-3.5 flex-none text-amber-400" />
                            <p className="text-xs leading-relaxed text-slate-600">
                                <span className="font-medium text-slate-700">They discover:</span>{" "}
                                {card.reveals}
                            </p>
                        </div>
                        {card.targetsMisconception && (
                            <p className="mb-3 rounded bg-amber-50 px-2 py-1.5 text-[11px] leading-relaxed text-amber-700">
                                Clears up: {card.targetsMisconception}
                            </p>
                        )}
                        <button
                            type="button"
                            disabled={busy}
                            onClick={() => choose(card)}
                            className="mt-auto w-full rounded-md bg-[#62D0AD] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#4fbf9c] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            Use this visual
                        </button>
                    </div>
                ))}
            </div>

            <button
                type="button"
                disabled={busy}
                onClick={askForDifferentIdeas}
                className="mt-3 flex items-center gap-1.5 text-xs font-medium text-slate-500 transition hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
                {regenerating ? (
                    <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Coming up with new ideas…
                    </>
                ) : (
                    <>
                        <RefreshCw className="h-3.5 w-3.5" />
                        None of these — show me different ideas
                    </>
                )}
            </button>
        </div>
    );
};

export default VisualOptionCards;
