# Figure Design Language

Art direction for **bespoke figures** — the custom canvas/SVG visualizations that are the star
of every section. This document has three consumers:

1. **The builder agent** — read this BEFORE writing any figure code; every rule below is a
   generation-time requirement, not a suggestion.
2. **The verification harness** — the VLM polish channel critiques screenshots against the
   checklist at the end of this document.
3. **Humans** — reviewing why a figure does or doesn't feel right.

The bar: the interactive essays at ciechanow.ski (gears, mechanical watch, cameras). Every
figure in those essays is custom-drawn, minimal, smooth, and makes exactly one idea impossible
to miss. That is what "done" looks like.

This document extends (never contradicts) the color and interactivity rules in `CLAUDE.md`.

---

## 1. Philosophy

- **One figure, one idea.** A figure exists to make a single relationship visible. If it
  demonstrates two ideas, it is two figures. Complexity enters the lesson across figures
  (progressive disclosure), never within one.
- **Figures are drawn, not assembled.** The star visual of a section is bespoke canvas/SVG
  rendered from the domain model. Library components (`Cartesian2D`, `DataVisualization`, …)
  are for supporting material — quick charts, coordinate checks — never the section's main
  visual unless the concept literally IS a standard chart.
- **The model draws the view.** Figure code renders from explicit domain-model state
  (variables in the store / model module). No visual quantity is ever hand-placed if it can
  be computed from the model — positions, angles, and lengths derive from the math they
  represent, so the drawing cannot lie.
- **Chrome is uniform, content is unique.** Every figure lives in the `<Figure>` shell
  (caption, reset, optional play/pause, consistent slider styling). Never rebuild chrome
  per-figure; never customize the shell's look.

## 2. Color

Ground rules from `CLAUDE.md` still apply: white/very-light background, flat colors, no
gradients, soft muted palette only. On top of that:

- **The ink-and-accent rule.** A figure has three color layers:
  1. **Paper** — white / near-white ground (`#FFFFFF`, grid at most `#F1F5F9`).
  2. **Ink** — structure: outlines, static geometry, axes, labels. Warm dark gray
     (`#334155` – `#64748B` range), NEVER pure black (`#000000` is forbidden).
  3. **Accent** — exactly ONE accent hue per figure, reserved for the concept-relevant,
     manipulable, or changing element. Default: Soft Teal `#62D0AD`.
- **A second accent is allowed only for covariation** — when the concept is a relationship
  between two quantities that must be tracked simultaneously (e.g. input vs output). Use
  Soft Indigo `#8E90F5`. A third simultaneous accent is a design failure.
- **Highlight/attention flashes** (guided feedback, hint targets) use Warm Amber `#F7B23B`,
  transient only — amber never rests permanently in a figure.
- **Fills are quiet.** Filled regions use the accent at 12–18% opacity
  (e.g. `rgba(98, 208, 173, 0.15)`); strokes carry the identity, fills whisper it.
- **Same quantity, same color, everywhere.** A variable's color in the figure MUST match its
  color in prose (`InlineSpotColor`), formula (`\clr{}`), and readouts. One quantity never
  changes color between representations.

## 3. Line, shape, and depth

- **Rounded everything.** `stroke-linecap: round`, `stroke-linejoin: round` on all paths.
  Sharp miters read as engineering CAD, not explanation.
- **Two stroke weights only.** Structure/ink: 1.5–2px. Concept/accent: 2.5–3.5px. The accent
  element is always the heaviest line on screen. Never more than two weights in one figure.
- **Depth is earned, not decorated.** No drop shadows on static geometry. A single soft
  shadow (`0 1px 3px rgba(15, 23, 42, 0.15)` or SVG blur equivalent) is allowed on
  *draggable* elements only — depth signals "you can pick this up."
- **Whitespace is load-bearing.** ≥ 24px padding inside the drawing surface on all sides;
  labels never touch the frame; nothing is ever clipped (see the safe-viewBox rule in
  `CLAUDE.md`). If a figure feels crowded, the fix is removing elements, not shrinking them.
- **Scale the canvas to the content.** Drawing surface ≤ ~560px tall; the whole figure with
  its controls fits one laptop screen (≤ ~780px). Coordinate bounds hug the action (content
  extent + ~15% margin) so the ink spans well over half of the canvas in both axes at every
  reachable state. A big canvas with the action huddled in one corner — or a giant dead band
  of nothing — is a hard verification failure, exactly like clipping. If most of the range is
  never used, shrink the bounds; never pad the world with empty space.
- **No chart-junk, ever:** no 3D effects on 2D data, no clip-art, no emoji inside the drawing
  surface, no decorative icons, no full gridlines when tick marks suffice, no legend when
  direct labeling is possible (it almost always is).

## 4. Typography and labels

- Labels are set in the page's sans-serif at 11–13px, ink-gray, sentence case; math symbols
  italic to match KaTeX prose.
- **Direct labeling beats legends.** Put the word next to the thing, in the thing's color.
- **Numeric readouts are stable.** Use tabular numerals / fixed decimal places so values
  don't jitter in width while scrubbing; a changing number never reflows its neighbors.
- Labels never overlap geometry or each other at ANY reachable state of the interaction —
  check the extremes of every slider/drag range, not just the default.

## 5. Motion

- **Nothing teleports.** Every visual state change is either continuously driven by the
  user's gesture (1:1, zero-lag) or eased over 150–300ms. A discrete jump (e.g. toggling a
  mode) still animates — that's what the motion toolkit's springs are for.
- **During drag: direct.** While the pointer is down, the element tracks the pointer/model
  exactly — no smoothing lag between hand and figure. Easing on release (spring settle),
  never during the gesture.
- **Simulations run on the shared rAF loop** (`useRafLoop` from the motion toolkit), advance
  by real `dt` (frame-rate independent), pause when off-screen or when the shell's pause is
  engaged, and never allocate per frame.
- **Easing vocabulary:** UI transitions `easeOutCubic`; physical settling `spring` (gentle,
  slightly under-damped); constant-rate processes linear. Never `ease-in` for something
  appearing (it feels hesitant), never bounce for non-physical quantities.
- **Traces follow the rubric's trace strategy.** If the mini-spec says accumulation or
  trajectory matters, the trace persists (thin, accent at ~40% opacity, oldest fades); if
  not, no ghosting — stale pixels are clutter.

## 6. Salience and attention (rubric A3/A4 made visual)

- **The concept-relevant change must be the most salient thing on screen** while it happens:
  heaviest stroke, the one saturated accent, largest changed region. If a viewer squints,
  the accent element is what survives.
- **One thing moves per idea.** For univariate concepts exactly one visual cue changes at a
  time; deliberate paired cues only for covariation concepts (and then linked by color).
  If three things animate simultaneously, the figure is overloaded — split it or stage it.
- **The initial state poses the question, not the answer.** Default parameter values show
  the interesting problem state, invite the manipulation, and leave the aha discoverable.

## 7. Affordances (what invites the hand)

- Draggable handles look grabbable: ≥ 12px visual radius (≥ 24px hit area), accent-colored,
  the soft shadow from §3, `cursor: grab`/`grabbing`, and a subtle scale-up (~1.15×,
  spring-eased) on hover/press.
- Static geometry must NOT look grabbable: no handles, no hover reaction beyond linked
  highlights.
- Every interactive element visible at the default state — nothing interactive hidden
  behind scroll, hover, or off-canvas positions.

## 8. Anti-patterns (instant fails for the VLM critique)

| # | Anti-pattern | Why it fails |
|---|---|---|
| 1 | Default browser/library colors (pure black, `steelblue`, matplotlib defaults) | Signals "unstyled programmer art" |
| 2 | More than one resting accent hue (plus at most one covariation partner) | Attention has no anchor |
| 3 | Gradients, 3D bevels, drop shadows on static shapes | Decoration over information |
| 4 | Legend box when direct labels fit | Forces gaze ping-pong |
| 5 | Full background grid at high contrast | Competes with the concept |
| 6 | Overlapping/clipped labels at any slider extreme | Unreadable = unverifiable |
| 7 | Discrete state change with no transition (teleport) | Breaks temporal legibility (A2) |
| 8 | Draggable element with no visual affordance | Interaction undiscoverable |
| 9 | Emoji/clip-art inside the drawing surface | Tone mismatch, salience noise |
| 10 | The star visual is a stock library chart wearing the lesson's labels | The library-ceiling failure this document exists to prevent |

---

## 9. VLM polish checklist (scored 1–5 each, from a screenshot)

The harness asks these questions of every figure screenshot. "5" descriptors are anchored;
below 3 on any item = polish failure, figure goes back for refinement.

1. **Accent discipline** — 5: exactly one resting accent hue, on the concept-relevant
   element; ink/paper otherwise. 1: ≥ 3 competing hues or accent on chrome.
2. **Ink quality** — 5: warm-gray structure, two stroke weights, rounded caps, no pure
   black. 1: hairline default strokes, mixed weights, CAD look.
3. **Label legibility** — 5: every label readable, direct-labeled, non-overlapping, inside
   the frame. 1: any clipped/overlapping/colliding label.
4. **Whitespace & composition** — 5: breathing room on all sides, balanced weight, nothing
   cramped, content fills the canvas. 1: elements touch the frame or each other, OR the
   content huddles in a corner of a mostly-empty oversized canvas.
5. **Affordance clarity** — 5: draggables unmistakably grabbable (size, accent, depth);
   static elements unmistakably static. 1: cannot tell what is interactive.
6. **Junk-free** — 5: zero anti-patterns from §8. 1: any of #1, #3, #9, #10 present.
7. **Question-posing initial state** — 5: default state shows the problem and invites the
   gesture. 1: default state already displays the answer/degenerate case.
8. **Cohesion with the lesson** — 5: same palette, stroke language, and label style as the
   lesson's other figures (one hand drew them all). 1: visibly different visual dialect.
