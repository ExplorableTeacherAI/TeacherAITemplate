import React, { useEffect, useState, type ReactNode } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useVar, useSetVar, useVarColor } from "@/stores";

/**
 * Figure — uniform chrome for bespoke canvas/SVG figures
 * ======================================================
 *
 * A thin shell that gives every custom figure the same quiet polish (frame,
 * caption, reset / play-pause controls) while the drawing inside stays fully
 * bespoke. See `FIGURE_DESIGN_LANGUAGE.md`: chrome is uniform, content is
 * unique — never rebuild this chrome per-figure, never restyle the shell.
 *
 * The children get the full surface: the frame is a `position: relative`
 * container, so absolutely-positioned overlays such as
 * `InteractionHintSequence` keep working inside.
 */
export interface FigureProps {
    /** Unique figure id — emitted as `data-figure-id` for the verification harness. */
    id: string;
    /** Caption rendered below the frame (13px, ink-gray, sentence case). */
    caption?: ReactNode;
    /** When provided, shows a reset icon button that invokes this callback. */
    onReset?: () => void;
    /** When `true`, shows a play/pause toggle in the figure chrome. */
    playable?: boolean;
    /**
     * Store variable that receives the playing state (boolean) so figure code
     * can read it with `useVar(playVarName, false)` and pause its `useRafLoop`.
     * Without it the toggle keeps local state only.
     */
    playVarName?: string;
    /** Optional CSS `aspect-ratio` for the frame (e.g. `"16 / 9"`). */
    aspectRatio?: string;
    /** The bespoke drawing (SVG/canvas) plus any figure-local controls. */
    children: ReactNode;
    /** Extra classes for the outer `<figure>` element. */
    className?: string;
}

const controlButtonClass = cn(
    "flex h-7 w-7 items-center justify-center rounded-lg",
    "bg-white/90 text-[#64748B] transition-colors",
    "hover:bg-slate-50 hover:text-slate-800",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300",
);

/**
 * Chrome wrapper for bespoke figures.
 *
 * @example
 * <Figure
 *     id="lever-balance"
 *     playable
 *     playVarName="leverPlaying"
 *     onReset={() => setVar("leverRightDistance", 1.5)}
 *     caption="Drag the teal mass until the torques match and the beam levels."
 * >
 *     <LeverBalanceDrawing />
 * </Figure>
 */
export const Figure: React.FC<FigureProps> = ({
    id,
    caption,
    onReset,
    playable = false,
    playVarName,
    aspectRatio,
    children,
    className,
}) => {
    const setVar = useSetVar();
    const storePlaying = useVar<boolean>(playVarName ?? "", false);
    const [localPlaying, setLocalPlaying] = useState(false);
    const playing = playVarName ? Boolean(storePlaying) : localPlaying;

    const togglePlaying = () => {
        if (playVarName) setVar(playVarName, !playing);
        else setLocalPlaying((prev) => !prev);
    };

    const hasControls = playable || Boolean(onReset);

    return (
        <figure data-figure-id={id} className={cn("group w-full", className)}>
            <div
                className="relative w-full overflow-hidden rounded-xl border border-border/40 bg-white"
                style={aspectRatio ? { aspectRatio } : undefined}
            >
                {children}

                {hasControls && (
                    <div
                        className={cn(
                            "absolute right-2 top-2 z-10 flex items-center gap-1",
                            // Quiet chrome: fade in on hover/focus for pointer devices,
                            // always visible on touch.
                            "opacity-0 transition-opacity duration-150",
                            "focus-within:opacity-100 group-hover:opacity-100",
                            "[@media(pointer:coarse)]:opacity-100",
                        )}
                    >
                        {playable && (
                            <button
                                type="button"
                                aria-label={playing ? "Pause" : "Play"}
                                aria-pressed={playing}
                                data-figure-control="play"
                                onClick={togglePlaying}
                                className={controlButtonClass}
                            >
                                {playing ? (
                                    <Pause className="h-3.5 w-3.5" />
                                ) : (
                                    <Play className="h-3.5 w-3.5" />
                                )}
                            </button>
                        )}
                        {onReset && (
                            <button
                                type="button"
                                aria-label="Reset figure"
                                data-figure-control="reset"
                                onClick={onReset}
                                className={controlButtonClass}
                            >
                                <RotateCcw className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </div>
                )}
            </div>

            {caption && (
                <figcaption className="mt-2 px-1 text-[13px] leading-snug text-[#64748B]">
                    {caption}
                </figcaption>
            )}
        </figure>
    );
};

// ── FigureSlider ─────────────────────────────────────────────────────────────

/**
 * Range-input thumb/track styling shared by all FigureSlider instances.
 * Injected once into <head> — `<input type="range">` pseudo-elements cannot be
 * styled with utility classes.
 */
const FIGURE_SLIDER_STYLE_ID = "figure-slider-styles";
const FIGURE_SLIDER_CSS = `
.figure-slider {
    -webkit-appearance: none;
    appearance: none;
    height: 4px;
    border-radius: 9999px;
    background: #E2E8F0;
    outline: none;
}
.figure-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--figure-slider-accent, #62D0AD);
    border: 2px solid #FFFFFF;
    box-shadow: 0 1px 3px rgba(15, 23, 42, 0.15);
    cursor: grab;
    transition: transform 150ms cubic-bezier(0.33, 1, 0.68, 1);
}
.figure-slider::-webkit-slider-thumb:hover { transform: scale(1.15); }
.figure-slider::-webkit-slider-thumb:active { cursor: grabbing; }
.figure-slider::-moz-range-thumb {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: var(--figure-slider-accent, #62D0AD);
    border: 2px solid #FFFFFF;
    box-shadow: 0 1px 3px rgba(15, 23, 42, 0.15);
    cursor: grab;
    transition: transform 150ms cubic-bezier(0.33, 1, 0.68, 1);
}
.figure-slider::-moz-range-thumb:hover { transform: scale(1.15); }
.figure-slider::-moz-range-thumb:active { cursor: grabbing; }
.figure-slider:focus-visible {
    box-shadow: 0 0 0 2px rgba(148, 163, 184, 0.5);
}
`;

function ensureFigureSliderStyles(): void {
    if (typeof document === "undefined") return;
    if (document.getElementById(FIGURE_SLIDER_STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = FIGURE_SLIDER_STYLE_ID;
    style.textContent = FIGURE_SLIDER_CSS;
    document.head.appendChild(style);
}

export interface FigureSliderProps {
    /** Unique identifier for this control instance. */
    id?: string;
    /** Store variable the slider reads and writes (must be a `number` variable). */
    varName: string;
    /** Initial value when the store has no entry yet. */
    defaultValue?: number;
    /** Minimum value (default: 0). */
    min?: number;
    /** Maximum value (default: 100). */
    max?: number;
    /** Step increment (default: 1). */
    step?: number;
    /** Short label shown left of the track (12px, ink-gray, sentence case). */
    label?: string;
    /** Formats the readout right of the track (default: raw value). */
    formatValue?: (value: number) => string;
    /** Thumb accent color — usually supplied by the variable definition spread. */
    color?: string;
    /** Extra classes for the outer label row. */
    className?: string;
}

/**
 * The one continuous control most bespoke figures need — a quietly styled
 * range input bound to a store variable, matching the Figure chrome (ink-gray
 * label, slate track, accent thumb with soft shadow, tabular-nums readout).
 *
 * Like `InlineScrubbleNumber`, never hardcode `min`/`max`/`step` inline:
 * define the variable in `src/data/variables.ts` and spread
 * `numberPropsFromDefinition(getVariableInfo('varName'))`.
 *
 * @example
 * <FigureSlider
 *     varName="leverRightDistance"
 *     label="Distance from fulcrum"
 *     {...numberPropsFromDefinition(getVariableInfo('leverRightDistance'))}
 *     formatValue={(v) => `${v.toFixed(1)} m`}
 * />
 */
export const FigureSlider: React.FC<FigureSliderProps> = ({
    id,
    varName,
    defaultValue,
    min = 0,
    max = 100,
    step = 1,
    label,
    formatValue,
    color,
    className,
}) => {
    const setVar = useSetVar();
    const stored = useVar<number>(varName, defaultValue ?? min);
    const value = typeof stored === "number" ? stored : (defaultValue ?? min);
    const accent = useVarColor(varName, color ?? "#62D0AD");

    useEffect(() => {
        ensureFigureSliderStyles();
    }, []);

    return (
        <label
            id={id}
            className={cn(
                "flex w-full items-center gap-3 text-xs text-[#64748B]",
                className,
            )}
        >
            {label && <span className="shrink-0">{label}</span>}
            <input
                type="range"
                className="figure-slider min-w-0 flex-1"
                style={{ "--figure-slider-accent": accent } as React.CSSProperties}
                min={min}
                max={max}
                step={step}
                value={value}
                aria-label={label ?? varName}
                onChange={(event) => setVar(varName, Number(event.target.value))}
            />
            <span
                className="shrink-0 text-right text-slate-700"
                style={{ fontVariantNumeric: "tabular-nums" }}
            >
                {formatValue ? formatValue(value) : value}
            </span>
        </label>
    );
};
