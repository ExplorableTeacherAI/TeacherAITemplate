# Responsive template and loading review

Companion branches: TeacherAIFrontend and TeacherAIBackend `feat/responsive-mobile-tablet`.

Responsive CSS is separate from authored index.css. Layout columns, dialogs, editor controls and SVG matrix sizing adapt to small/touch viewports. Named component imports resolve to existing leaf modules before Vite traverses export barrels; unknown and namespace imports retain their original form. Teacher editor tools and full LessonView are loaded on demand. The Vite wrapper preserves the original per-lesson config and applies the same rrweb WebKit navigation guard used by Frontend.

Validation on 2026-10-13: production build passed; `node --test tests/component-imports.test.mjs` passed 3/3; nine component galleries at 390/820/1440px and real teacher paragraph editing passed (10 cases). Actual 3D rendering was inspected. The integrated frontend passed six real-course device profiles and 146 mobile UI checks, with answer/orientation/chat/recording assertions. Frontend carries the detailed report and selected evidence.

Full Template typecheck still reports 38 pre-existing errors, identical to base e264f77 after normalizing diagnostic locations; no new errors. Local cold-browser course loads measured 1.17–3.19s, not a claim about production or cellular-network latency. Tests use Playwright device emulation and isolated business APIs, not physical iOS devices or live model calls.

Run `npm run build`, `node --test tests/component-imports.test.mjs`, and the companion Frontend acceptance scripts. The real-course tests additionally require a local copy of the published Bayesian lesson; generated lesson data is deliberately not committed here. The wrapper is selected by npm dev/build scripts and the updated Backend startup command. Existing preview processes require a restart after a separately approved rollout. No merge or deployment has been performed.
