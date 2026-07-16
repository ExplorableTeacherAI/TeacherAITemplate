/**
 * Motion & Math Toolkit
 * =====================
 *
 * Small, dependency-free helpers for **bespoke canvas/SVG figures** — the
 * custom visualizations described in `FIGURE_DESIGN_LANGUAGE.md`. These are a
 * floor to build on, never a ceiling: figures own their drawing code and use
 * these helpers for frame loops, settling animations, and 2D math.
 *
 * Quick reference:
 * - `useRafLoop(cb, opts)`  — shared requestAnimationFrame loop (real dt, seconds)
 * - `useSpring(target, opts)` — spring-settled value that tracks a changing target
 * - `linear` / `easeOutCubic` / `easeInOutCubic` — easing functions over t ∈ [0, 1]
 * - `lerp` / `clamp` / `remap` / `damp` — scalar helpers
 * - `vec2` — plain-object 2D vector helpers over `{ x, y }`
 */

import { useEffect, useRef, useState } from "react";

// ── Frame loop ───────────────────────────────────────────────────────────────

/**
 * Maximum delta-time per frame, in seconds. Frames longer than this (tab
 * switches, long GC pauses) are clamped so simulations never "spiral" trying
 * to catch up on a huge dt.
 */
export const MAX_FRAME_DT = 0.064;

export interface RafLoopOptions {
    /** When `true`, the loop is suspended (no callbacks fire). Default: `false`. */
    paused?: boolean;
}

/**
 * Shared requestAnimationFrame loop hook for figure simulations.
 *
 * - **Frame-rate independent:** the callback receives the real elapsed time
 *   since the previous frame (`dt`, seconds, clamped to {@link MAX_FRAME_DT})
 *   plus the total accumulated running time (`elapsed`, seconds — paused time
 *   is not counted).
 * - **Auto-pauses** when the document is hidden (`visibilitychange`) and when
 *   `opts.paused` is `true`; on resume, `dt` continues smoothly with no jump.
 * - **No per-frame allocations** inside the hook itself.
 * - The latest `callback` is always used — passing a new closure each render
 *   is fine and does not restart the loop.
 *
 * @param callback Called once per animation frame with `(dt, elapsed)` in seconds.
 * @param opts     `{ paused }` — suspend/resume the loop.
 *
 * @example
 * useRafLoop((dt, elapsed) => {
 *     setVar("orbitAngle", (elapsed * Math.PI) % (2 * Math.PI));
 * }, { paused: !playing });
 */
export function useRafLoop(
    callback: (dt: number, elapsed: number) => void,
    opts: RafLoopOptions = {},
): void {
    const { paused = false } = opts;
    const callbackRef = useRef(callback);
    callbackRef.current = callback;
    const elapsedRef = useRef(0);

    useEffect(() => {
        if (paused) return;

        let frameId = 0;
        let last = -1; // -1 = first frame after (re)start, used to re-prime dt
        let running = false;

        const tick = (now: number) => {
            frameId = requestAnimationFrame(tick);
            if (last < 0) {
                last = now;
                return;
            }
            const dt = Math.min((now - last) / 1000, MAX_FRAME_DT);
            last = now;
            elapsedRef.current += dt;
            callbackRef.current(dt, elapsedRef.current);
        };

        const start = () => {
            if (running) return;
            running = true;
            last = -1;
            frameId = requestAnimationFrame(tick);
        };

        const stop = () => {
            if (!running) return;
            running = false;
            cancelAnimationFrame(frameId);
        };

        const handleVisibility = () => {
            if (document.hidden) stop();
            else start();
        };

        document.addEventListener("visibilitychange", handleVisibility);
        if (!document.hidden) start();

        return () => {
            document.removeEventListener("visibilitychange", handleVisibility);
            stop();
        };
    }, [paused]);
}

// ── Spring ───────────────────────────────────────────────────────────────────

export interface SpringOptions {
    /** Spring stiffness (higher = snappier). Default: `170`. */
    stiffness?: number;
    /**
     * Damping coefficient. The default (`22`) is gentle and slightly
     * under-damped per the figure design language — a soft physical settle
     * with the faintest overshoot.
     */
    damping?: number;
    /** Rest threshold for both displacement and velocity. Default: `0.001`. */
    precision?: number;
}

/** Fixed integration sub-step (seconds) that keeps stiff springs stable. */
const MAX_SPRING_STEP = 1 / 120;

/**
 * Spring-settled numeric value for release animations and discrete-state
 * transitions ("nothing teleports").
 *
 * Tracks `target` continuously: retargeting mid-flight preserves the current
 * position and velocity, so the motion redirects smoothly instead of
 * restarting. The internal rAF loop pauses automatically once the spring is
 * at rest (within `precision`).
 *
 * @param target The value to settle toward — change it freely at any time.
 * @param opts   Spring tuning; defaults follow the design language.
 * @returns The animated value for this frame.
 *
 * @example
 * // Beam angle eases to its physics target; hover scale pops gently.
 * const angle = useSpring(targetAngle);
 * const scale = useSpring(isHovered ? 1.15 : 1, { stiffness: 400, damping: 26 });
 */
export function useSpring(target: number, opts: SpringOptions = {}): number {
    const { stiffness = 170, damping = 22, precision = 0.001 } = opts;

    const [value, setValue] = useState(target);
    const valueRef = useRef(target);
    const velocityRef = useRef(0);
    const targetRef = useRef(target);
    targetRef.current = target;

    const settled =
        Math.abs(value - target) <= precision &&
        Math.abs(velocityRef.current) <= precision;

    useRafLoop(
        (dt) => {
            let x = valueRef.current;
            let v = velocityRef.current;
            let remaining = dt;
            // Semi-implicit Euler with fixed sub-steps for stability.
            while (remaining > 0) {
                const h = Math.min(remaining, MAX_SPRING_STEP);
                v += (stiffness * (targetRef.current - x) - damping * v) * h;
                x += v * h;
                remaining -= h;
            }
            if (
                Math.abs(targetRef.current - x) <= precision &&
                Math.abs(v) <= precision
            ) {
                x = targetRef.current;
                v = 0;
            }
            valueRef.current = x;
            velocityRef.current = v;
            setValue(x);
        },
        { paused: settled },
    );

    return value;
}

// ── Easing (t ∈ [0, 1] → [0, 1]) ─────────────────────────────────────────────

/** Identity easing — for constant-rate processes (spins, flows, clocks). */
export const linear = (t: number): number => t;

/**
 * Cubic ease-out — the default for UI transitions per the design language
 * (fast start, gentle arrival; never use ease-in for something appearing).
 */
export const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

/** Cubic ease-in-out — for symmetric A→B moves where both ends should be soft. */
export const easeInOutCubic = (t: number): number =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

// ── Scalar helpers ───────────────────────────────────────────────────────────

/** Linear interpolation from `a` to `b` by `t` (unclamped). */
export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

/** Clamps `value` into `[min, max]`. */
export const clamp = (value: number, min: number, max: number): number =>
    Math.min(Math.max(value, min), max);

/**
 * Remaps `value` from the range `[inMin, inMax]` to `[outMin, outMax]`
 * (unclamped — compose with {@link clamp} to bound the output).
 *
 * @example
 * // net torque −4…4 → beam angle 12…−12 degrees
 * const angle = clamp(remap(netTorque, -4, 4, 12, -12), -12, 12);
 */
export const remap = (
    value: number,
    inMin: number,
    inMax: number,
    outMin: number,
    outMax: number,
): number =>
    inMax === inMin
        ? outMin
        : outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin);

/**
 * Frame-rate-independent exponential smoothing (Freya Holmér's `damp`).
 * Moves `a` toward `b` with decay constant `lambda` (per second) over `dt`
 * seconds — equivalent to `lerp(a, b, k)` with a dt-corrected `k`, so the
 * result is identical at 30fps and 144fps.
 *
 * @example
 * cameraX = damp(cameraX, targetX, 8, dt);
 */
export const damp = (a: number, b: number, lambda: number, dt: number): number =>
    lerp(a, b, 1 - Math.exp(-lambda * dt));

// ── 2D vectors ───────────────────────────────────────────────────────────────

/** Plain 2D vector. Figures create these as object literals: `{ x, y }`. */
export interface Vec2 {
    x: number;
    y: number;
}

/**
 * 2D vector helpers over plain `{ x, y }` objects. All functions are pure and
 * return new objects — inputs are never mutated.
 *
 * Note on `rotate`: the math is the standard counterclockwise rotation, which
 * in SVG/canvas screen coordinates (y-down) appears **clockwise** for positive
 * angles — matching SVG's `rotate()` transform.
 */
export const vec2 = {
    /** Component-wise sum `a + b`. */
    add: (a: Vec2, b: Vec2): Vec2 => ({ x: a.x + b.x, y: a.y + b.y }),

    /** Component-wise difference `a − b`. */
    sub: (a: Vec2, b: Vec2): Vec2 => ({ x: a.x - b.x, y: a.y - b.y }),

    /** Scalar multiple `a · s`. */
    scale: (a: Vec2, s: number): Vec2 => ({ x: a.x * s, y: a.y * s }),

    /** Dot product `a · b`. */
    dot: (a: Vec2, b: Vec2): number => a.x * b.x + a.y * b.y,

    /** Euclidean length `|a|`. */
    len: (a: Vec2): number => Math.hypot(a.x, a.y),

    /** Euclidean distance between `a` and `b`. */
    dist: (a: Vec2, b: Vec2): number => Math.hypot(b.x - a.x, b.y - a.y),

    /** Unit vector in the direction of `a` (zero vector stays zero). */
    norm: (a: Vec2): Vec2 => {
        const length = Math.hypot(a.x, a.y);
        return length === 0 ? { x: 0, y: 0 } : { x: a.x / length, y: a.y / length };
    },

    /**
     * Rotates `a` by `angle` radians around `origin` (default: the origin).
     * Positive angles appear clockwise in y-down screen coordinates.
     */
    rotate: (a: Vec2, angle: number, origin: Vec2 = { x: 0, y: 0 }): Vec2 => {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const dx = a.x - origin.x;
        const dy = a.y - origin.y;
        return {
            x: origin.x + dx * cos - dy * sin,
            y: origin.y + dx * sin + dy * cos,
        };
    },
};
