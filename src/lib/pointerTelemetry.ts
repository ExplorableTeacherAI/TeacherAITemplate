/**
 * Pointer telemetry for an embedded explorable.
 *
 * Reports to the embedding chat page (postMessage, same channel as the
 * interaction reports in ExplorableView):
 *
 * - `mathvibe-explorable-figure-box` — where the figure sits in the iframe
 *   document, so the teacher's dashboard can place a dwell overlay on a
 *   thumbnail of the same explorable.
 * - `mathvibe-explorable-dwell` — how long the pointer lingered over each
 *   cell of a 24×18 grid laid over the figure, with the element under it.
 *
 * The grid is relative to the figure box, not the viewport, so a cell means
 * the same spot on every screen size. A parked pointer is not attention:
 * accumulation stops 1.5 s after the last movement and resumes on the next.
 * Everything here is best effort and must never throw into the explorable.
 */

export const DWELL_GRID_X = 24;
export const DWELL_GRID_Y = 18;
const SAMPLE_MS = 250;
const STATIONARY_LIMIT_MS = 1500;
const FLUSH_MS = 5000;
const MIN_FIGURE_PX = 40;
const EL_MAX_CHARS = 40;

export interface DwellCell {
    x: number;
    y: number;
    el: string;
    ms: number;
}

export interface FigureBox {
    x: number;
    y: number;
    w: number;
    h: number;
}

/** The explorable's figure: the largest visualization element in the root. */
export function findFigure(root: HTMLElement): HTMLElement {
    let best: HTMLElement = root;
    let bestArea = 0;
    const candidates = root.querySelectorAll<HTMLElement>("[data-figure], svg, canvas");
    candidates.forEach((el) => {
        // Nested visualization parts (an <svg> inside a bigger <svg>) would
        // otherwise compete with their own parent; the parent wins by area.
        const r = el.getBoundingClientRect();
        if (r.width < MIN_FIGURE_PX || r.height < MIN_FIGURE_PX) return;
        const area = r.width * r.height;
        if (area > bestArea) {
            bestArea = area;
            best = el;
        }
    });
    return best;
}

/** Figure box in CSS pixels of the iframe document (scroll offsets included). */
export function measureFigureBox(figure: HTMLElement): FigureBox {
    const r = figure.getBoundingClientRect();
    return {
        x: Math.round(r.left + window.scrollX),
        y: Math.round(r.top + window.scrollY),
        w: Math.round(r.width),
        h: Math.round(r.height),
    };
}

export function postFigureBox(explorableId: string, figure: HTMLElement): void {
    try {
        if (window.parent === window) return;
        const doc = document.documentElement;
        window.parent.postMessage(
            {
                type: "mathvibe-explorable-figure-box",
                explorableId,
                box: measureFigureBox(figure),
                doc: { w: doc.scrollWidth, h: doc.scrollHeight },
            },
            "*"
        );
    } catch {
        // telemetry is best effort
    }
}

/** Identify what the pointer is over: data-el, then an id inside the figure, then the tag. */
function elementLabel(target: EventTarget | null, figure: HTMLElement): string {
    if (!(target instanceof Element)) return "";
    const tagged = target.closest("[data-el]");
    if (tagged instanceof Element) {
        const v = tagged.getAttribute("data-el") || "";
        if (v) return v.slice(0, EL_MAX_CHARS);
    }
    for (let node: Element | null = target; node && node !== figure.parentElement; node = node.parentElement) {
        if (node.id && figure.contains(node)) return node.id.slice(0, EL_MAX_CHARS);
    }
    return target.tagName.toLowerCase().slice(0, EL_MAX_CHARS);
}

/**
 * Start sampling pointer dwell over the figure. Returns a stop function.
 * `getFigure` is called per sample so a re-rendered figure is picked up.
 */
export function startPointerTelemetry(
    root: HTMLElement,
    explorableId: string,
    getFigure: () => HTMLElement | null
): () => void {
    if (window.parent === window) return () => {};
    const cells = new Map<string, DwellCell>();
    let pointer: { x: number; y: number; target: EventTarget | null } | null = null;
    let lastMoveAt = 0;
    let lastSampleAt = 0;
    let stopped = false;

    const sample = (now: number) => {
        if (!pointer || now - lastMoveAt > STATIONARY_LIMIT_MS) return;
        const figure = getFigure();
        if (!figure) return;
        const r = figure.getBoundingClientRect();
        if (r.width <= 0 || r.height <= 0) return;
        const fx = (pointer.x - r.left) / r.width;
        const fy = (pointer.y - r.top) / r.height;
        if (fx < 0 || fx >= 1 || fy < 0 || fy >= 1) return;
        const x = Math.min(DWELL_GRID_X - 1, Math.floor(fx * DWELL_GRID_X));
        const y = Math.min(DWELL_GRID_Y - 1, Math.floor(fy * DWELL_GRID_Y));
        const el = elementLabel(pointer.target, figure);
        const key = `${x}:${y}:${el}`;
        const ms = Math.min(SAMPLE_MS, Math.max(0, now - lastSampleAt));
        const cell = cells.get(key);
        if (cell) cell.ms += ms;
        else cells.set(key, { x, y, el, ms });
    };

    const flush = () => {
        if (cells.size === 0) return;
        const out = [...cells.values()].filter((c) => c.ms > 0);
        cells.clear();
        if (out.length === 0) return;
        try {
            window.parent.postMessage(
                { type: "mathvibe-explorable-dwell", explorableId, at: Date.now(), cells: out },
                "*"
            );
        } catch {
            // telemetry is best effort
        }
    };

    const onMove = (e: PointerEvent) => {
        try {
            pointer = { x: e.clientX, y: e.clientY, target: e.target };
            lastMoveAt = performance.now();
        } catch {
            // ignore
        }
    };
    const onLeave = () => {
        pointer = null;
    };
    const onHidden = () => {
        if (document.visibilityState === "hidden") flush();
    };

    const tick = setInterval(() => {
        if (stopped) return;
        try {
            const now = performance.now();
            sample(now);
            lastSampleAt = now;
        } catch {
            // ignore
        }
    }, SAMPLE_MS);
    const flusher = setInterval(flush, FLUSH_MS);

    root.addEventListener("pointermove", onMove, { passive: true });
    root.addEventListener("pointerdown", onMove, { passive: true });
    root.addEventListener("pointerleave", onLeave);
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", onHidden);

    return () => {
        stopped = true;
        clearInterval(tick);
        clearInterval(flusher);
        root.removeEventListener("pointermove", onMove);
        root.removeEventListener("pointerdown", onMove);
        root.removeEventListener("pointerleave", onLeave);
        window.removeEventListener("pagehide", flush);
        document.removeEventListener("visibilitychange", onHidden);
        flush();
    };
}
