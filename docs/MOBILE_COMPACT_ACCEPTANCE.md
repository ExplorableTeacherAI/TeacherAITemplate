# Responsive formula and touch-number runtime

InlineScrubbleNumber preserves desktop mouse scrubbing and teacher editing while adding touch direction detection, native vertical scrolling, and a precise number popover. The popover validates bounds/steps, accepts fractional and negative values, and restores focus after Done/Escape without stealing focus from outside controls. Decimal precision supports steps such as 0.25.

FormulaBlock imports its own stylesheet. Content starts at an accessible position and wraps at KaTeX base boundaries; indivisible fractions/matrices retain their structure and can scroll locally when oversized. Formula base font sizes are 18px below 640px, 20px through 1199px, and the existing 24px on wider screens. This is shared runtime, not an edit to one lesson's mathematics.

The companion backend PR synchronizes FormulaBlock.tsx and FormulaBlock.css to teacher and student workspaces. Install the template bundle before the backend change is used. Existing static exports require rebuilding.

On 2026-10-19, before integration with the latest main, browser checks passed 30 shared formula cases plus 6 drags, 16 formula width cases, 16 compact/touch cases, 3 popover-focus cases and 6 device course flows. The matching frontend PR includes scripts and screenshots. The previous production build passed; integration build/check results are stated in the PR.

Browser fixtures are in tests/formulas.html and tests/responsive.html. Run sibling frontend tests/shared_formula.py, formula_readability.py, compact_touch.py and number_editor_focus.py with this template running on 8081. Component import tests: node --test tests/component-imports.test.mjs.

An earlier intermittent popover close timeout was not reproduced in the final run; its cause is not established. A distinct reproducible focus-loss issue was fixed. Simulation is not physical-device or real OS keyboard acceptance; course business APIs and replies are fixtures. No merge/deployment is performed.
