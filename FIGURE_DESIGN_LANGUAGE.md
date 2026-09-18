# Figure Design Language

Art direction for **bespoke figures** — the custom canvas/SVG visualizations that are the star
of every section. This document has three consumers:

1. **The builder agent** — read this BEFORE writing any figure code; every rule below is a
   generation-time requirement, not a suggestion.
2. **Rendered self-review** — builders and scene reviewers inspect screenshots against the
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
- **No frame around a figure.** The `<Figure>` shell is borderless on purpose: the drawing
  sits directly on the page's white ground. NEVER add a border, ring, card, outline, or
  shadow around a figure — not with a wrapper `div` (`border`, `ring-*`, `shadow-*`,
  `rounded-* border`), not with a `<rect stroke=…>` drawn around the plot area, not by
  restyling the shell. The one exception is a stroke that carries meaning (the boundary of
  the thing being explained — a container, a region, a cell), and even then it is ink, not
  chrome. A box drawn "to hold the chart" is chart junk, exactly like a legend box.
- **Whitespace is load-bearing.** ≥ 24px padding inside the drawing surface on all sides;
  labels never touch the frame; nothing is ever clipped (see the safe-viewBox rule in
  `CLAUDE.md`). If a figure feels crowded, the fix is removing elements, not shrinking them.
- **Scale the canvas to the content.** The `<Figure>` shell renders at most **560px wide**,
  centered in the content column (the shell enforces this — a `w-full` SVG never spans the
  1024px column). Design the viewBox for that width: prefer landscape-to-4:3 aspect
  (e.g. 560×320, 440×280, 400×300). Target a **280–360px drawing surface** on
  desktop and treat **420px as a hard visualization maximum**; use 240–340px when stacked
  on mobile. A square or portrait viewBox usually reads oversized. Put prose and figure
  beside each other when possible so both remain visible in one glance; never use
  `h-screen`, `min-h-screen`, or a full-viewport figure. Coordinate bounds hug the action (content
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
- **Readouts and status panels live BESIDE the drawing surface, never on it.** Estimate
  boxes, causal-chain panels, counters, and any card-style readout belong in a side rail
  or a row above/below the canvas — the plot area is reserved for the phenomenon itself.
  Inside the frame, only small annotations anchored to geometry are allowed (a point's
  coordinate tag, an arrow label), and they must never occlude the curve/shape they
  describe or collide with each other at ANY slider state.
- **Numeric readouts are stable.** Use tabular numerals / fixed decimal places so values
  don't jitter in width while scrubbing; a changing number never reflows its neighbors.
- Labels never overlap geometry or each other at ANY reachable state of the interaction —
  check the extremes of every slider/drag range, not just the default.

### 4a. Every label must FIT — the gutter contract

An SVG clips anything outside its own `viewBox`. A label that starts inside the box but
runs past its right edge is silently sliced in half — the reader sees `Posit`. This is the
single most common figure defect. It is never acceptable, and it is entirely preventable
with arithmetic before you draw.

**Budget the text, then place the geometry.** Text width in the viewBox's units is roughly
`characters × fontSize × 0.6` (13px sentence-case ≈ 7.5px per character; bold ≈ 8px).
`"Positive"` at 12px ≈ 58 units wide. Do this sum for the LONGEST string each label can
ever hold — including the widest value it will show while the student scrubs.

Then, concretely:

1. **Reserve gutters first, size the plot last.** Decide the label widths, subtract them
   from the viewBox, and give the remainder to the drawing:
   `plotWidth = viewBoxWidth − leftGutter − rightGutter`. Never pick a round plot size and
   hope the labels fit beside it.
2. **Anchor toward the ink.** Labels right of the plot: `textAnchor="end"` at
   `x = viewBoxWidth − pad`. Labels left of the plot: `textAnchor="start"` at `x = pad`.
   Labels under a column: `textAnchor="middle"`, and clamp the x so the half-width still
   fits (`clamp(cx, halfWidth + pad, viewBoxWidth − halfWidth − pad)`).
3. **Nothing is drawn outside `[pad, viewBoxWidth − pad] × [pad, viewBoxHeight − pad]`**
   with `pad ≥ 24`. If a computed x/y for a label falls outside that band at any reachable
   state, the label is in the wrong place — move it inside the plot or above it.
4. **Side labels are usually the wrong idea.** A row label beside the plot ("Positive" /
   "Negative") almost always fits better *inside* its own band, in that band's color, or
   directly above the plot. Prefer that over widening the gutters.
5. **Verify at the extremes.** Walk every control to min and max and re-check the longest
   rendered string at each. A label that fits at the default value and is clipped at max is
   a failed figure.

```tsx
// WRONG — viewBox 560 wide, plot ends at 520, label starts at 532 and needs ~58 more units.
// "Positive" renders as "Posit" and the reader never sees the word.
<text x={chartX + chartWidth + 12} y={chartY + 20} fontSize="12">Positive</text>

// CORRECT — gutter reserved up front, label anchored back toward the plot.
const PAD = 24, RIGHT_GUTTER = 72;              // widest row label + breathing room
const chartWidth = VIEWBOX_WIDTH - PAD - RIGHT_GUTTER;
<text x={VIEWBOX_WIDTH - PAD} y={chartY + 20} textAnchor="end" fontSize="12">Positive</text>
```

### 4b. One quantity, one number format

A quantity that appears in the drawing, in a `FigureSlider` readout, and in the prose must
render through **the same formatter** in all three places. Define it once at module scope
and call it everywhere:

```tsx
const fmtPercent = (v: number) => `${v.toFixed(1)}%`;   // 13.6%  — one source of truth
```

Rules:

- **Percentages are `%` with a fixed number of decimals.** `(13.6).toFixed(1) + "%"`.
  Never `‰`, never `pp`, never a bare number where its sibling readout shows a unit.
- **Never rescale a value to dodge a decimal point.** `Math.round(p * 10) + "‰"` is the
  classic version of this bug: it renders `136‰` next to a slider reading `13.6%`, and every
  reader parses it as a typo or a wrong number. If the value has a fraction, print the
  fraction.
- **Same decimal places at every state.** Pick the precision from the variable's `step`
  (`step: 0.1` → one decimal) and keep it constant, so the readout never gains or loses a
  digit mid-drag. Pair with `fontVariantNumeric: "tabular-nums"`.
- **Counts are integers, shares are percentages** — a figure never shows the same quantity
  as a count in one label and a percentage in another without saying so in words.
- **Read the rendered strings back.** Before you finish, list every string the figure prints
  at the default state and at both extremes of every control, and check each one is a number
  a teacher would write by hand.

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

### 6a. Linked highlights — pop the target, recede everything else

A hover binding (`InlineLinkedHighlight`, `highlightVarName`, `\highlight{}{}`) is only worth
having if the picture visibly answers the hover. The recurring failure is a target that shifts
a shade while its neighbours stay at full strength: the student hovers the phrase, nothing
seems to happen, and the binding teaches nothing. Contrast comes from doing both halves at
once.

- **Pop the target.** Stroke weight ≥1.5× its resting value — the heaviest line on screen
  while active — plus a **halo**: a second, wider stroke of the same hue underneath at ~25-30%
  opacity (`strokeWidth + 6`, `opacity 0.28`), or an equivalent soft glow filter. Points and
  handles also scale ~1.3×; filled regions raise their fill from ~15% to ~35% opacity.
- **Recede everything else.** While any highlight is active, every non-target stroke, fill,
  and label drops to **30-45% opacity** — one `opacity` expression on each sibling group.
  Dimming is what makes the highlight readable; popping alone is not enough.
- **Ease both directions** over ~150 ms (`transition: opacity 150ms ease-out`, same for
  stroke-width). Highlights never snap.
- **Bidirectional.** `onPointerEnter` / `onPointerLeave` on the drawn element write the same
  variable, so hovering the figure lights the prose phrase too.
- **The squint test.** Idle frame beside hovered frame: the highlighted element must be the
  obvious difference at a squint. If you have to hunt for what changed, raise the pop and
  deepen the dim.

```tsx
const highlight = useVar<string | null>("arrowHighlight", null);
const isActive = highlight === "rightArrow";
const recede = highlight && !isActive ? 0.38 : 1;

{isActive && (
    <path d={arrowPath} stroke="#62D0AD" strokeWidth={9} opacity={0.28}
        fill="none" strokeLinecap="round" />          {/* halo */}
)}
<path d={arrowPath} stroke="#62D0AD" strokeWidth={isActive ? 4 : 2.5}
    fill="none" strokeLinecap="round"
    style={{ transition: "stroke-width 150ms ease-out" }}
    onPointerEnter={() => setVar("arrowHighlight", "rightArrow")}
    onPointerLeave={() => setVar("arrowHighlight", null)} />

<g opacity={recede} style={{ transition: "opacity 150ms ease-out" }}>
    {/* every other element AND its labels recede together */}
</g>
```

Amber (`#F7B23B`) is the attention hue for guided hints and feedback flashes. A hover
highlight instead intensifies the element's OWN colour — it does not repaint the element in a
new hue, which would break the one-quantity-one-colour rule.

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
| 11 | Readout/status panels floating over the plot area, occluding data or colliding with labels | The panel wins the salience contest against the phenomenon — panels belong beside the canvas |
| 12 | A border/ring/card/shadow around the figure, or a `<rect>` frame drawn around the plot | Chrome competing with the drawing; the shell is borderless by design (§3) |
| 13 | Any label sliced by the viewBox edge (`Posit`, `Nega`) at any reachable state | Half a word is not a label — the gutter arithmetic in §4a was skipped |
| 14 | The same quantity printed in two formats/units (`136‰` in the figure, `13.6%` on the slider) | Reads as a typo or a contradiction; destroys trust in every other number |
| 15 | A linked highlight that only tints its target while every neighbour stays at full strength | Nothing visibly happens on hover — the binding is dead weight (§6a) |

---

## 9. Rendered polish checklist (scored 1–5 each, from a screenshot)

Use these questions for every figure screenshot. "5" descriptors are anchored;
below 3 on any item means the figure needs refinement.

1. **Accent discipline** — 5: exactly one resting accent hue, on the concept-relevant
   element; ink/paper otherwise. 1: ≥ 3 competing hues or accent on chrome.
2. **Ink quality** — 5: warm-gray structure, two stroke weights, rounded caps, no pure
   black. 1: hairline default strokes, mixed weights, CAD look.
3. **Label legibility** — 5: every label readable, direct-labeled, non-overlapping, and
   FULLY inside the viewBox at every reachable state; readout/status panels sit beside the
   drawing surface, not over the data. 1: any clipped/overlapping/colliding label (a single
   sliced word scores 1 on its own), or a panel occluding the plot.
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
9. **Number discipline** — 5: every quantity uses one formatter everywhere it appears
   (figure label, slider readout, prose), with fixed decimals and tabular numerals.
   1: mismatched units or formats for the same quantity (`136‰` vs `13.6%`), or a digit
   count that changes while scrubbing.
10. **Frame-free** — 5: no border, ring, card, or drawn box around the figure or its plot;
   the drawing meets the page directly. 1: a visible frame of any kind around the visual.
11. **Highlight legibility** — compare an idle screenshot with one taken while a bound
   phrase is hovered. 5: the target pops (heaviest stroke plus halo, or scaled-up mark) while
   every other element and label recedes to 30-45% — the difference is obvious at a squint,
   and the trigger phrase reads clearly on white. 1: nothing perceptible changes, or only the
   target shifts a shade while its neighbours stay at full strength.
12. **Visual–prose balance** — 5: the active prose and its figure are visible together;
   the drawing surface is compact (normally 280–360px, never above ~420px) and filled
   with meaningful content. 1: the figure consumes most of the viewport, forces the
   learner to scroll away from its explanation, or magnifies sparse content.
