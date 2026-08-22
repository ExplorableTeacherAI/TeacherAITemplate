import { useEffect, useRef, useState } from "react";
import { Hand, Lightbulb, Loader2, PenLine, RefreshCw, Sparkles, Star } from "lucide-react";
import { useAppMode } from "@/contexts/AppModeContext";

const ACTION_LABEL = "Students do:";

export interface VisualOptionCard {
    /** Stable id for this option, e.g. "unit-circle-drag" */
    id: string;
    /** What the visual shows — a short plain description (up to ~14 words) */
    title: string;
    /** What students do with it — one sentence */
    manipulate: string;
    /** What it shows them — one sentence */
    reveals: string;
    /** What is on the screen — one or two plain sentences */
    looks: string;
    /** Optional: the misconception this option addresses (shown as "Clears up:") */
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

/** Selection state persisted across iframe reloads (the editor reloads the
 *  preview after every builder turn; without this the teacher's queued picks
 *  would visually reset to unchosen). Cleared automatically when the cards
 *  themselves change (regenerated) or after MAX_AGE (a failed build should
 *  not lock the chooser forever). */
type StoredChoice = {
    mode: "chosen" | "regen" | "custom";
    cardId?: string;
    idea?: string;
    /** Fingerprint of the card ids this choice was made against */
    fp: string;
    at: number;
};

const MAX_AGE_MS = 20 * 60 * 1000;

const storageKey = (blockId: string) => `visual-option-cards:${blockId}`;

const loadChoice = (blockId: string, fp: string): StoredChoice | null => {
    try {
        const raw = sessionStorage.getItem(storageKey(blockId));
        if (!raw) return null;
        const stored = JSON.parse(raw) as StoredChoice;
        if (stored.fp !== fp || Date.now() - stored.at > MAX_AGE_MS) {
            sessionStorage.removeItem(storageKey(blockId));
            return null;
        }
        return stored;
    } catch {
        return null;
    }
};

const saveChoice = (blockId: string, choice: StoredChoice) => {
    try {
        sessionStorage.setItem(storageKey(blockId), JSON.stringify(choice));
    } catch {
        /* storage unavailable — state just won't survive reloads */
    }
};

/**
 * VisualOptionCards — teacher-facing chooser for a section's visualization.
 *
 * Rendered by the builder during phase 1 (text-first section builds) in the
 * spot where the section's interactive visual will go. Each card is a brief
 * design spec; when the teacher picks one (or describes their own idea), the
 * choice is posted to the parent editor frame, which forwards it to the
 * builder as a chat message. The builder then builds that visual and
 * REPLACES this block with it (phase 2).
 *
 * Editor-mode only: students never see this block — in preview mode it
 * renders nothing, so an unfinished section is just clean text.
 */
export const VisualOptionCards = ({ blockId, intro, cards }: VisualOptionCardsProps) => {
    const { isPreview } = useAppMode();
    const fp = cards.map((c) => c.id).join("|");
    const [choice, setChoice] = useState<StoredChoice | null>(() =>
        typeof window === "undefined" ? null : loadChoice(blockId, fp),
    );
    const [ideaOpen, setIdeaOpen] = useState(false);
    const [ideaText, setIdeaText] = useState("");
    // When the teacher first SAW these options, so the time spent deciding is
    // recoverable — a click timestamp alone cannot separate an instant accept
    // from two minutes of comparing.
    const shownAtRef = useRef<number>(Date.now());

    useEffect(() => {
        if (isPreview || choice) return;
        shownAtRef.current = Date.now();
        window.parent.postMessage(
            {
                type: "visual-cards-shown",
                blockId,
                cards: cards.map((c) => ({
                    id: c.id,
                    title: c.title,
                    recommended: !!c.recommended,
                    targetsMisconception: c.targetsMisconception,
                    manipulate: c.manipulate,
                })),
            },
            "*",
        );
        // Re-report when the option set itself changes (regenerated ideas).
    }, [blockId, fp, isPreview, choice, cards]);

    if (isPreview) return null;

    const busy = choice !== null;

    const commit = (next: StoredChoice, message: Record<string, unknown>) => {
        if (busy) return;
        saveChoice(blockId, next);
        setChoice(next);
        window.parent.postMessage(message, "*");
    };

    const choose = (card: VisualOptionCard) =>
        commit(
            { mode: "chosen", cardId: card.id, fp, at: Date.now() },
            {
                type: "visual-card-selected",
                blockId,
                cardId: card.id,
                cardTitle: card.title,
                wasRecommended: !!card.recommended,
                deliberationMs: Date.now() - shownAtRef.current,
                optionCount: cards.length,
            },
        );

    const askForDifferentIdeas = () =>
        commit(
            { mode: "regen", fp, at: Date.now() },
            { type: "visual-cards-regenerate", blockId, deliberationMs: Date.now() - shownAtRef.current, optionCount: cards.length },
        );

    const submitIdea = () => {
        const idea = ideaText.trim();
        if (!idea) return;
        commit(
            { mode: "custom", idea, fp, at: Date.now() },
            { type: "visual-card-custom", blockId, idea, deliberationMs: Date.now() - shownAtRef.current, optionCount: cards.length },
        );
    };

    // ---- building / regenerating state ------------------------------------
    if (choice) {
        const chosenCard =
            choice.mode === "chosen" ? cards.find((c) => c.id === choice.cardId) : undefined;
        const heading =
            choice.mode === "regen"
                ? "Coming up with new visual ideas…"
                : choice.mode === "custom"
                    ? "Building the visual from your idea…"
                    : `Building your visual — ${chosenCard?.title ?? "chosen design"}…`;

        return (
            <div
                data-visual-option-cards
                className="w-full rounded-xl border border-slate-200 bg-white p-6"
            >
                <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 flex-none animate-spin text-[#62D0AD]" />
                    <span className="text-sm font-medium text-slate-600">{heading}</span>
                </div>

                {chosenCard && (
                    <div className="mt-4 rounded-lg border border-[#62D0AD]/40 bg-[#62D0AD]/5 p-4">
                        <p className="mb-2 text-sm font-semibold text-slate-700">{chosenCard.title}</p>
                        <div className="mb-1.5 flex items-start gap-2">
                            <Hand className="mt-0.5 h-3.5 w-3.5 flex-none text-slate-400" />
                            <p className="text-xs leading-relaxed text-slate-600">
                                <span className="font-medium text-slate-700">
                                    {ACTION_LABEL}
                                </span>{" "}
                                {chosenCard.manipulate}
                            </p>
                        </div>
                        <div className="flex items-start gap-2">
                            <Lightbulb className="mt-0.5 h-3.5 w-3.5 flex-none text-amber-400" />
                            <p className="text-xs leading-relaxed text-slate-600">
                                <span className="font-medium text-slate-700">They discover:</span>{" "}
                                {chosenCard.reveals}
                            </p>
                        </div>
                    </div>
                )}

                {choice.mode === "custom" && choice.idea && (
                    <div className="mt-4 rounded-lg border border-[#62D0AD]/40 bg-[#62D0AD]/5 p-4">
                        <p className="mb-1 text-xs font-medium text-slate-700">Your idea:</p>
                        <p className="text-xs leading-relaxed text-slate-600">{choice.idea}</p>
                    </div>
                )}

                <p className="mt-3 text-xs text-slate-400">
                    {choice.mode === "regen"
                        ? "The cards here will be replaced with fresh designs shortly."
                        : "This usually takes a couple of minutes — the finished visual will replace these cards automatically."}
                </p>
            </div>
        );
    }

    // ---- chooser state ----------------------------------------------------
    return (
        <div
            data-visual-option-cards
            className="w-full rounded-xl border border-dashed border-slate-300 bg-slate-50/60 p-5"
        >
            <div className="mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 flex-none text-[#62D0AD]" />
                <span className="text-sm font-medium text-slate-600">
                    {intro ?? "Choose the interactive visual for this section"}
                </span>
            </div>

            <div className="flex snap-x snap-mandatory items-stretch gap-4 overflow-x-auto pb-3 pt-1">
                {cards.map((card) => (
                    <div
                        key={card.id}
                        className={`flex w-72 flex-none snap-start flex-col rounded-lg border bg-white shadow-sm ${
                            card.recommended ? "border-[#62D0AD]" : "border-slate-200"
                        }`}
                    >
                        <div className="flex flex-1 flex-col p-4">
                            <div className="mb-2 flex items-start justify-between gap-2">
                                <h4 className="text-sm font-semibold leading-snug text-slate-800">
                                    {card.title}
                                </h4>
                                {card.recommended && (
                                    <span className="flex flex-none items-center gap-1 rounded-full bg-[#62D0AD] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                                        <Star className="h-3 w-3" /> Pick
                                    </span>
                                )}
                            </div>
                            <p className="mb-3 text-xs leading-relaxed text-slate-500">{card.looks}</p>
                            <div className="mb-2 flex items-start gap-2">
                                <Hand className="mt-0.5 h-3.5 w-3.5 flex-none text-slate-400" />
                                <p className="text-xs leading-relaxed text-slate-600">
                                    <span className="font-medium text-slate-700">
                                        {ACTION_LABEL}
                                    </span>{" "}
                                    {card.manipulate}
                                </p>
                            </div>
                            <div className="flex items-start gap-2">
                                <Lightbulb className="mt-0.5 h-3.5 w-3.5 flex-none text-amber-400" />
                                <p className="text-xs leading-relaxed text-slate-600">
                                    <span className="font-medium text-slate-700">They discover:</span>{" "}
                                    {card.reveals}
                                </p>
                            </div>
                            {card.targetsMisconception && (
                                <p className="mt-3 rounded bg-amber-50 px-2 py-1.5 text-[11px] leading-relaxed text-amber-700">
                                    Clears up: {card.targetsMisconception}
                                </p>
                            )}
                        </div>
                        <div className="px-4 pb-4">
                            <button
                                type="button"
                                disabled={busy}
                                onClick={() => choose(card)}
                                className="w-full rounded-md bg-[#62D0AD] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#4fbf9c] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                Use this visual
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-2">
                <button
                    type="button"
                    disabled={busy}
                    onClick={askForDifferentIdeas}
                    className="flex items-center gap-1.5 text-xs font-medium text-slate-500 transition hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    <RefreshCw className="h-3.5 w-3.5" />
                    None of these — show me different ideas
                </button>
                <button
                    type="button"
                    disabled={busy}
                    onClick={() => setIdeaOpen((open) => !open)}
                    className="flex items-center gap-1.5 text-xs font-medium text-slate-500 transition hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    <PenLine className="h-3.5 w-3.5" />
                    I have my own idea
                </button>
            </div>

            {ideaOpen && (
                <div className="mt-3 rounded-lg border border-slate-200 bg-white p-3">
                    <textarea
                        value={ideaText}
                        onChange={(e) => setIdeaText(e.target.value)}
                        rows={3}
                        placeholder="Describe the visual you have in mind — what should students see, and what should they be able to move or change?"
                        className="w-full resize-none rounded-md border border-slate-200 p-2 text-xs leading-relaxed text-slate-700 placeholder:text-slate-400 focus:border-[#62D0AD] focus:outline-none"
                    />
                    <div className="mt-2 flex justify-end">
                        <button
                            type="button"
                            disabled={busy || !ideaText.trim()}
                            onClick={submitIdea}
                            className="rounded-md bg-[#62D0AD] px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-[#4fbf9c] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Build my idea
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VisualOptionCards;
