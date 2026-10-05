/**
 * Chat terms — the named elements of a tutor explorable, so the tutor's chat
 * text can point at them.
 *
 * An explorable file exports them next to its blocks:
 *
 *     export const chatTerms: ChatTerm[] = [
 *         { id: "rings", label: "concentric rings", color: "#AC8BF9",
 *           highlight: { varName: "circleDissection_highlight", value: "rings" },
 *           select: { varName: "circleDissection_mode", value: "rings" } },
 *     ];
 *
 * ExplorableView reports them to the chat page, which forwards them to the
 * tutor each turn. The tutor writes `[concentric rings](el:rings)`; the chat
 * renders it as a pill in the element's color, and hovering / clicking the
 * pill sets the declared store variables inside the explorable (a linked
 * highlight, or "show me this one"). Only variables declared here can be set
 * from outside the iframe.
 */

export type ChatTermValue = string | number | boolean;

export interface ChatTermBinding {
    /** Store variable of this explorable (id-prefixed, e.g. `circleDissection_highlight`) */
    varName: string;
    value: ChatTermValue;
}

/**
 * Store counter the embedded view bumps whenever the chat changes a value
 * (a scrub, a `set:` chip, a term click). Changing the figure from the chat
 * is exploring it, so RevealOnInteraction treats a bump like a drag.
 */
export const CHAT_INTERACTION_VAR = "mathvibe_chatInteracted";

export interface ChatTerm {
    /** Short id, unique within the explorable — the tutor writes `[label](el:<id>)` */
    id: string;
    /** How the element is named in words, e.g. "concentric rings" */
    label: string;
    /** The element's exact spot color in the figure (#RRGGBB) */
    color: string;
    /** Hovering the term in chat sets varName=value (linked highlight); leaving restores it */
    highlight?: ChatTermBinding;
    /** Clicking the term in chat sets varName=value (e.g. switch the figure to this element) */
    select?: ChatTermBinding;
}

const ID_RE = /^[A-Za-z0-9_-]{1,40}$/;
const HEX_RE = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
const VAR_RE = /^[A-Za-z][A-Za-z0-9_]{0,80}$/;

const isValue = (v: unknown): v is ChatTermValue =>
    typeof v === "string" || typeof v === "boolean" || (typeof v === "number" && Number.isFinite(v));

const binding = (b: unknown): ChatTermBinding | undefined => {
    if (!b || typeof b !== "object") return undefined;
    const { varName, value } = b as Record<string, unknown>;
    return typeof varName === "string" && VAR_RE.test(varName) && isValue(value)
        ? { varName, value }
        : undefined;
};

/** Keep only well-formed terms (agent-written code — never trust the shape). */
export const sanitizeChatTerms = (raw: unknown): ChatTerm[] => {
    if (!Array.isArray(raw)) return [];
    const seen = new Set<string>();
    const out: ChatTerm[] = [];
    for (const t of raw.slice(0, 24)) {
        if (!t || typeof t !== "object") continue;
        const { id, label, color } = t as Record<string, unknown>;
        if (typeof id !== "string" || !ID_RE.test(id) || seen.has(id)) continue;
        if (typeof label !== "string" || !label.trim() || typeof color !== "string" || !HEX_RE.test(color)) continue;
        seen.add(id);
        out.push({
            id,
            label: label.trim().slice(0, 60),
            color,
            highlight: binding((t as ChatTerm).highlight),
            select: binding((t as ChatTerm).select),
        });
    }
    return out;
};

/** Variables the chat page may set for these terms, with their allowed values. */
export const settableVariables = (terms: ChatTerm[]): Map<string, Set<ChatTermValue>> => {
    const allowed = new Map<string, Set<ChatTermValue>>();
    for (const t of terms) {
        for (const b of [t.highlight, t.select]) {
            if (!b) continue;
            if (!allowed.has(b.varName)) allowed.set(b.varName, new Set());
            allowed.get(b.varName)!.add(b.value);
        }
    }
    return allowed;
};

/**
 * Chat variables — numeric store variables the tutor's chat text can show
 * live or change. Exported next to `chatTerms`:
 *
 *     export const chatVariables: ChatVariable[] = [
 *         { id: "rings", label: "number of rings", varName: "circleDissection_numRings",
 *           color: DISSECTION_COLORS.rings, settable: { min: 1, max: 12, step: 1 } },
 *         { id: "area", label: "area", varName: "circleDissection_area", decimals: 1, unit: "cm²" },
 *     ];
 *
 * The tutor writes `[area](value:area)` (live readout), `[4](scrub:rings)`
 * (a number the student drags in chat) or `[8 rings](set:rings=8)` (click to
 * set). Only variables with `settable` can be changed from chat, and only
 * within its range, snapped to its step.
 */
export interface ChatVariable {
    /** Short id, unique within the explorable */
    id: string;
    /** What the number is, in words */
    label: string;
    /** Numeric store variable of this explorable */
    varName: string;
    /** Spot color of the quantity (#RRGGBB) */
    color?: string;
    unit?: string;
    /** Decimal places shown in chat (default 0) — match the explorable's formatter */
    decimals?: number;
    /** Present when the chat may change it */
    settable?: { min: number; max: number; step: number };
}

const finite = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);

export const sanitizeChatVariables = (raw: unknown): ChatVariable[] => {
    if (!Array.isArray(raw)) return [];
    const seen = new Set<string>();
    const out: ChatVariable[] = [];
    for (const v of raw.slice(0, 16)) {
        if (!v || typeof v !== "object") continue;
        const r = v as Record<string, unknown>;
        if (typeof r.id !== "string" || !ID_RE.test(r.id) || seen.has(r.id)) continue;
        if (typeof r.label !== "string" || !r.label.trim()) continue;
        if (typeof r.varName !== "string" || !VAR_RE.test(r.varName)) continue;
        const s = r.settable as Record<string, unknown> | undefined;
        const settable =
            s && finite(s.min) && finite(s.max) && finite(s.step) && s.max > s.min && s.step > 0
                ? { min: s.min, max: s.max, step: s.step }
                : undefined;
        seen.add(r.id);
        out.push({
            id: r.id,
            label: r.label.trim().slice(0, 60),
            varName: r.varName,
            color: typeof r.color === "string" && HEX_RE.test(r.color) ? r.color : undefined,
            unit: typeof r.unit === "string" ? r.unit.slice(0, 12) : undefined,
            decimals: finite(r.decimals) ? Math.min(Math.max(Math.round(r.decimals), 0), 4) : undefined,
            settable,
        });
    }
    return out;
};

/** Clamp to the range and snap to the step grid (anchored at min). */
export const snapToSettable = (value: number, s: { min: number; max: number; step: number }): number => {
    const clamped = Math.min(Math.max(value, s.min), s.max);
    const snapped = s.min + Math.round((clamped - s.min) / s.step) * s.step;
    // strip float noise like 0.30000000000000004
    return Math.min(Number(snapped.toFixed(10)), s.max);
};

/**
 * Derived chat variables — when an explorable exports no `chatVariables`,
 * the numbers it registered with `registerVariables` stand in: every number
 * definition whose name carries the explorable's camelCase prefix
 * (`circleDissection_numRings` for `circle-dissection`) becomes a variable
 * the chat can show live (`[…](value:numRings)`) and, when it has a
 * min/max/step, change (`[…](scrub:numRings)`, `[…](set:numRings=8)`).
 * Its id is the name after the prefix. Reveal gates, highlight variables and
 * answers are left out. An explicit `chatVariables` export replaces this
 * list entirely (also the way to hide a variable or add a derived readout).
 */
export interface VariableDefinitionLike {
    defaultValue?: unknown;
    color?: string;
    label?: string;
    type?: string;
    unit?: string;
    min?: number;
    max?: number;
    step?: number;
    correctAnswer?: unknown;
}

/** `circle-area-growth` → `circleAreaGrowth_`, the variable prefix its file must use. */
export const explorableVariablePrefix = (explorableId: string): string => {
    const parts = explorableId.split(/[^A-Za-z0-9]+/).filter(Boolean);
    return parts.map((p, i) => (i === 0 ? p : p[0].toUpperCase() + p.slice(1))).join("") + "_";
};

// Internal state and assessment variables: never something the chat should scrub.
const HIDDEN_SUFFIX_RE = /(explored|interacted|revealed|highlight|answer|correct|status)$/i;

const decimalsOfStep = (step: number): number => {
    const text = String(step);
    const dot = text.indexOf(".");
    return dot < 0 ? 0 : Math.min(text.length - dot - 1, 4);
};

const humanize = (name: string): string =>
    name.replace(/[_-]+/g, " ").replace(/([a-z0-9])([A-Z])/g, "$1 $2").toLowerCase().trim();

export const deriveChatVariables = (
    explorableId: string,
    definitions: Readonly<Record<string, VariableDefinitionLike>>,
): ChatVariable[] => {
    const prefix = explorableVariablePrefix(explorableId).toLowerCase();
    if (prefix === "_") return [];
    const raw: unknown[] = [];
    for (const [name, def] of Object.entries(definitions)) {
        if (!def || !name.toLowerCase().startsWith(prefix)) continue;
        const suffix = name.slice(prefix.length);
        if (!suffix || HIDDEN_SUFFIX_RE.test(suffix) || def.correctAnswer !== undefined) continue;
        const isNumber =
            def.type === "number" || (def.type === undefined && typeof def.defaultValue === "number");
        if (!isNumber) continue;
        const { min, max, step } = def;
        const settable =
            finite(min) && finite(max) && finite(step) && max > min && step > 0
                ? { min, max, step }
                : undefined;
        const defaultValue = typeof def.defaultValue === "number" ? def.defaultValue : 0;
        raw.push({
            id: suffix,
            label: def.label?.trim() || humanize(suffix),
            varName: name,
            color: def.color,
            unit: def.unit,
            decimals: settable ? decimalsOfStep(settable.step) : Number.isInteger(defaultValue) ? 0 : 2,
            settable,
        });
    }
    return sanitizeChatVariables(raw);
};
