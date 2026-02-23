import { type ReactNode, Children, useState, useEffect, useCallback } from "react";
import { useSetVar } from "@/stores";

// ─── Sub-component ────────────────────────────────────────────────────────────

export interface SlideProps {
    /** Content for this slide */
    children: ReactNode;
    /** Optional className for custom styling */
    className?: string;
}

/**
 * Slide - A single slide in a SlideLayout.
 * Wrap one Block (or a div containing multiple Blocks) per Slide.
 */
export const Slide = ({ children, className = "" }: SlideProps) => {
    return <div className={`slide-content w-full h-full ${className}`}>{children}</div>;
};

// ─── Main Layout ──────────────────────────────────────────────────────────────

export interface SlideLayoutProps {
    /**
     * Children — should be a sequence of <Slide> elements.
     */
    children: ReactNode;
    /** Optional className for the outer container */
    className?: string;
    /**
     * Name of the global variable (defined in variables.ts) that will receive
     * the 0-based index of the currently active slide.
     * Read it in any component with: const idx = useVar(varName, 0) as number;
     */
    varName?: string;
    /** Height of the slide stage */
    height?: "sm" | "md" | "lg" | "xl" | "auto";
    /** Visual transition between slides */
    transition?: "fade" | "slide" | "none";
    /** Show ← → navigation arrows */
    showArrows?: boolean;
    /** Where the arrows are rendered */
    arrowPosition?: "inside" | "outside";
    /** Show dot progress indicator below the stage */
    showDots?: boolean;
    /** Show "N / total" slide counter below the stage */
    showCounter?: boolean;
    /** Optional callback fired whenever the active slide changes */
    onSlideChange?: (index: number) => void;
}

/**
 * SlideLayout
 *
 * A presentation-style layout that shows one slide at a time with
 * animated transitions, navigation arrows, dot indicators, and an
 * optional slide counter.
 *
 * The active slide index is written to a global variable via `varName`
 * so other components (e.g. a reactive visual) can react to slide changes.
 * Keyboard ← / → also navigate between slides.
 *
 * Usage:
 * ```tsx
 * // 1. (Optional) Define a variable in variables.ts:
 * //    slideIndex: { defaultValue: 0, type: 'number', min: 0, max: 4, step: 1 }
 *
 * // 2. Build your slides:
 * <SlideLayout varName="slideIndex" height="lg" showDots showCounter>
 *   <Slide>
 *     <Block id="block-slide-1" padding="lg">
 *       <EditableH2 id="h2-slide-1" blockId="block-slide-1">Slide 1</EditableH2>
 *     </Block>
 *   </Slide>
 *   <Slide>
 *     <Block id="block-slide-2" padding="lg">
 *       <EditableParagraph id="para-slide-2" blockId="block-slide-2">
 *         Content for slide 2.
 *       </EditableParagraph>
 *     </Block>
 *   </Slide>
 * </SlideLayout>
 * ```
 */
export const SlideLayout = ({
    children,
    className = "",
    varName,
    height = "md",
    transition = "fade",
    showArrows = true,
    arrowPosition = "inside",
    showDots = true,
    showCounter = false,
    onSlideChange,
}: SlideLayoutProps) => {
    const slides = Children.toArray(children);
    const total = slides.length;
    const [current, setCurrent] = useState(0);
    const [direction, setDirection] = useState<"next" | "prev">("next");
    const [animKey, setAnimKey] = useState(0);
    const setVar = useSetVar();

    const goTo = useCallback(
        (index: number) => {
            if (index < 0 || index >= total) return;
            setDirection(index >= current ? "next" : "prev");
            setCurrent(index);
            setAnimKey((k) => k + 1);
            if (varName) setVar(varName, index);
            onSlideChange?.(index);
        },
        [current, total, varName, setVar, onSlideChange]
    );

    const goPrev = useCallback(() => goTo(current - 1), [current, goTo]);
    const goNext = useCallback(() => goTo(current + 1), [current, goTo]);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "ArrowRight" || e.key === "ArrowDown") goNext();
            if (e.key === "ArrowLeft" || e.key === "ArrowUp") goPrev();
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [goNext, goPrev]);

    const heightClasses: Record<string, string> = {
        sm: "min-h-[200px]",
        md: "min-h-[360px]",
        lg: "min-h-[500px]",
        xl: "min-h-[660px]",
        auto: "",
    };

    const transitionClass =
        transition === "fade"
            ? "animate-in fade-in duration-300"
            : transition === "slide"
              ? direction === "next"
                  ? "animate-in slide-in-from-right-8 duration-300"
                  : "animate-in slide-in-from-left-8 duration-300"
              : "";

    const NavButton = ({
        onClick,
        disabled,
        label,
        icon,
    }: {
        onClick: () => void;
        disabled: boolean;
        label: string;
        icon: string;
    }) => (
        <button
            onClick={onClick}
            disabled={disabled}
            aria-label={label}
            className="
                flex items-center justify-center w-9 h-9 rounded-full
                border border-border bg-background/80 backdrop-blur-sm
                text-[#3cc499] transition-all duration-150
                hover:bg-[#3cc499]/10 hover:border-[#3cc499]/40
                disabled:opacity-25 disabled:cursor-not-allowed
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3cc499]
                select-none shrink-0
            "
        >
            <span className="text-base leading-none">{icon}</span>
        </button>
    );

    const insideArrows = showArrows && arrowPosition === "inside";
    const outsideArrows = showArrows && arrowPosition === "outside";

    return (
        <div
            className={`w-full flex flex-col gap-3 ${className}`}
            data-layout-type="slide"
            data-layout-total={total}
        >
            {/* ── Stage row ── */}
            <div className="flex items-center gap-3">
                {outsideArrows && (
                    <NavButton
                        onClick={goPrev}
                        disabled={current === 0}
                        label="Previous slide"
                        icon="←"
                    />
                )}

                {/* Slide stage */}
                <div
                    className={`
                        relative flex-1 ${heightClasses[height]}
                        rounded-2xl bg-card border border-border overflow-hidden
                        flex items-center justify-center
                    `}
                >
                    {insideArrows && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                            <NavButton
                                onClick={goPrev}
                                disabled={current === 0}
                                label="Previous slide"
                                icon="←"
                            />
                        </div>
                    )}

                    <div className={`w-full h-full ${insideArrows ? "px-14" : "px-6"} py-6 flex items-center`}>
                        <div key={animKey} className={`w-full ${transitionClass}`}>
                            {slides[current]}
                        </div>
                    </div>

                    {insideArrows && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10">
                            <NavButton
                                onClick={goNext}
                                disabled={current === total - 1}
                                label="Next slide"
                                icon="→"
                            />
                        </div>
                    )}
                </div>

                {outsideArrows && (
                    <NavButton
                        onClick={goNext}
                        disabled={current === total - 1}
                        label="Next slide"
                        icon="→"
                    />
                )}
            </div>

            {/* ── Bottom bar: dots + counter ── */}
            {(showDots || showCounter) && (
                <div className="flex items-center justify-center gap-4">
                    {showDots && (
                        <div className="flex gap-1.5 items-center">
                            {slides.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => goTo(i)}
                                    aria-label={`Go to slide ${i + 1}`}
                                    className={`
                                        h-2 rounded-full transition-all duration-200 cursor-pointer
                                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                                        ${i === current
                                            ? "w-6 bg-[#3cc499]"
                                            : "w-2 bg-[#3cc499]/25 hover:bg-[#3cc499]/50"
                                        }
                                    `}
                                />
                            ))}
                        </div>
                    )}
                    {showCounter && (
                        <span className="text-xs text-muted-foreground tabular-nums font-medium">
                            {current + 1} / {total}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
};
