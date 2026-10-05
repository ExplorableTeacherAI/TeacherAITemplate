import { useActivityRecovery } from "@/lib/activityRecovery";
import { useEffect, useRef, useState } from "react";
import { BlockRenderer } from "@/components/templates";
import { explorables } from "@/data/explorables";
import { useAppMode } from "@/contexts/AppModeContext";
import * as stores from "@/stores";
import {
    CHAT_INTERACTION_VAR,
    type ChatTerm,
    type ChatVariable,
    type VariableDefinitionLike,
    deriveChatVariables,
    sanitizeChatTerms,
    sanitizeChatVariables,
    settableVariables,
    snapToSettable,
} from "@/lib/chatTerms";

const { useVariableStore } = stores;

// The numbers an explorable registered, for deriving its chat variables. A
// workspace whose store predates the definitions registry (it is synced on
// the next preview start) degrades to "no derived variables" here instead of
// failing to import.
const registeredDefinitions = (): Record<string, VariableDefinitionLike> =>
    (stores as { getRegisteredDefinitions?: () => Record<string, VariableDefinitionLike> })
        .getRegisteredDefinitions?.() ?? {};

// Each explorable file may export `chatTerms` and `chatVariables` (see
// src/lib/chatTerms.ts); without `chatVariables` the numbers it registered
// stand in. Lazy on purpose: only the current explorable's module is
// touched, and the registry has already imported it, so this resolves to
// the loaded module.
const explorableModules = import.meta.glob<Record<string, unknown>>("../data/explorables/*.tsx");

interface ChatSpec {
    terms: ChatTerm[];
    variables: ChatVariable[];
}

const HEX_COLOR_RE = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

/** `#RRGGBB` / `#RGB` → the `rgb(r, g, b)` form getComputedStyle reports. */
const hexToRgb = (hex: string): string => {
    const h = hex.length === 4 ? hex.slice(1).split("").map((c) => c + c).join("") : hex.slice(1);
    const n = parseInt(h, 16);
    return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`;
};

/**
 * Linked highlight for a chat term that has no `highlight` binding: every
 * SVG element currently drawn in the term's exact spot color pops, the rest
 * of that drawing recedes — the same look the contract asks of a bound
 * highlight. Spot colors are exact by contract, so a color match IS the
 * element. Draws nothing when nothing on screen has the color (an option the
 * figure is not showing); only a binding can preview those.
 */
const highlightByColor = (root: HTMLElement, color: string, on: boolean) => {
    for (const el of root.querySelectorAll<SVGElement>("svg [data-chat-lit]")) {
        el.removeAttribute("data-chat-lit");
        el.style.removeProperty("--chat-lit");
    }
    for (const svg of root.querySelectorAll("svg[data-chat-dim]")) svg.removeAttribute("data-chat-dim");
    if (!on || !HEX_COLOR_RE.test(color)) return;
    const rgb = hexToRgb(color);
    const svgs = new Set<Element>();
    for (const el of root.querySelectorAll<SVGElement>("svg *")) {
        if (el instanceof SVGDefsElement || el.closest("defs")) continue;
        const cs = getComputedStyle(el);
        const painted =
            (cs.fill === rgb && cs.fill !== "none") || (cs.stroke === rgb && cs.stroke !== "none");
        if (!painted) continue;
        el.setAttribute("data-chat-lit", "1");
        el.style.setProperty("--chat-lit", color);
        const svg = el.closest("svg");
        if (svg) svgs.add(svg);
    }
    for (const svg of svgs) svg.setAttribute("data-chat-dim", "1");
};

/**
 * ExplorableView — renders exactly one registered explorable, selected via
 * the `?explorable=<id>` URL query parameter (read before the hash, since
 * the app uses HashRouter).
 *
 * Used by AI tutor sessions: each chat bubble embeds an iframe pointing at
 * this view so the student sees a single small interactive explanation.
 *
 * While the explorable is not registered yet (the agent is still writing
 * it), a "preparing" placeholder is shown; Vite HMR reloads the iframe
 * automatically once the registry changes.
 */
const ExplorableView = () => {
    const id = new URLSearchParams(window.location.search).get("explorable") ?? "";
    const entry = explorables[id];
    // Editor mode (?mode=editor) enables the block-based inline editing UI —
    // used by the teacher's explorable editor page. Students always get
    // preview mode.
    const { isEditor } = useAppMode();
    const hydrated = useActivityRecovery(id, !isEditor && !!entry);
    const [dots, setDots] = useState("");
    const rootRef = useRef<HTMLDivElement>(null);
    // null until known — so the chat is never told "no terms" before they load
    const [chatSpec, setChatSpec] = useState<ChatSpec | null>(null);

    // Embedded in the tutor chat, the explorable must read as part of the
    // chat, not a separate panel: clear the template's page background (the
    // body's gradient) so the chat's own background shows through. The chat
    // sizes the iframe to our content, so no scrollbar should ever show here
    // either; when the chat docks us into a shorter side panel the page still
    // scrolls, just without a visible bar. The teacher's editor keeps the
    // normal page.
    useEffect(() => {
        if (isEditor) return;
        const style = document.createElement("style");
        // overflow-x: clip, not hidden: `hidden` forces overflow-y to `auto`,
        // which turns <body> into a scroll container — an open dropdown then
        // shows a scrollbar and the height reports creep 1px per resize.
        // overflow-y: clip as well: the chat sizes the frame to the content,
        // so this document must never scroll on its own — a wheel over it
        // used to scroll the document inside the frame and cut the figure
        // off at the top (with no scrollbar to show why). Wheel events now
        // chain out to the chat transcript or the side panel's box instead.
        style.textContent = `
            html, body { background: transparent !important; overflow-x: clip; overflow-y: clip; }
            body { min-height: 0 !important; }
            html, body { scrollbar-width: none; -ms-overflow-style: none; }
            html::-webkit-scrollbar, body::-webkit-scrollbar { display: none; width: 0; height: 0; }
            /* Chat hover fallback (see highlightByColor): pop what is drawn in
               the term's color, let the rest of that drawing recede. */
            svg[data-chat-dim] * { transition: opacity 150ms ease, filter 150ms ease; }
            svg[data-chat-dim] *:not([data-chat-lit]):not(:has([data-chat-lit])) { opacity: 0.4; }
            svg[data-chat-dim] [data-chat-lit] {
                filter: drop-shadow(0 0 3px var(--chat-lit)) drop-shadow(0 0 1px var(--chat-lit));
            }
        `;
        document.head.appendChild(style);
        // Belt and braces for engines that still let the viewport scroll
        // programmatically: snap it back so the top of the figure stays put.
        const resetScroll = () => {
            if (window.scrollY !== 0 || window.scrollX !== 0) window.scrollTo(0, 0);
        };
        window.addEventListener("scroll", resetScroll);
        return () => {
            style.remove();
            window.removeEventListener("scroll", resetScroll);
        };
    }, [isEditor]);

    useEffect(() => {
        if (!entry) return;
        const derived = () => deriveChatVariables(id, registeredDefinitions());
        const load = explorableModules[`../data/explorables/${id}.tsx`];
        if (!load) {
            setChatSpec({ terms: [], variables: derived() });
            return;
        }
        let cancelled = false;
        load()
            .then((mod) => {
                if (cancelled) return;
                setChatSpec({
                    terms: sanitizeChatTerms(mod.chatTerms),
                    // An explicit export replaces the derived list, so a file
                    // can hide a number or add a derived readout.
                    variables:
                        mod.chatVariables === undefined
                            ? derived()
                            : sanitizeChatVariables(mod.chatVariables),
                });
            })
            // plain spot colors in chat, numbers still derived
            .catch(() => { if (!cancelled) setChatSpec({ terms: [], variables: derived() }); });
        return () => { cancelled = true; };
    }, [entry, id]);

    // The chat ⇄ explorable link. Outbound: what the chat can name/show
    // (terms, variables), then a live state channel — current variable
    // values and which elements are highlighted, whoever highlighted them —
    // so chat pills light up and readouts update as the student works.
    // Inbound: hover highlights (restored on leave), click selections, and
    // value changes, each limited to what the explorable declared.
    useEffect(() => {
        if (!entry || !id || !hydrated || chatSpec === null || window.parent === window) return;
        const { terms, variables } = chatSpec;
        window.parent.postMessage({ type: "mathvibe-explorable-terms", explorableId: id, terms, variables }, "*");
        if (terms.length === 0 && variables.length === 0) return;

        const highlightVars = [...new Set(terms.flatMap((t) => (t.highlight ? [t.highlight.varName] : [])))];
        const snapshot = () => {
            const vars = useVariableStore.getState().variables;
            const values: Record<string, number | null> = {};
            for (const v of variables) {
                const raw = vars[v.varName];
                values[v.id] = typeof raw === "number" && Number.isFinite(raw) ? raw : null;
            }
            const highlights: Record<string, unknown> = {};
            for (const name of highlightVars) highlights[name] = vars[name] ?? "";
            return { values, highlights };
        };
        let last = "";
        let raf = 0;
        const sendState = () => {
            raf = 0;
            const state = snapshot();
            const encoded = JSON.stringify(state);
            if (encoded === last) return;
            last = encoded;
            window.parent.postMessage({ type: "mathvibe-explorable-chat-state", explorableId: id, ...state }, "*");
        };
        sendState();
        const unsubscribe = useVariableStore.subscribe(() => {
            if (!raf) raf = requestAnimationFrame(sendState);
        });

        const allowed = settableVariables(terms);
        const saved = new Map<string, unknown>(); // value before a hover highlight
        const handler = (event: MessageEvent) => {
            if (event.source !== window.parent) return;
            const d = event.data;
            if (!d || d.explorableId !== id) return;
            const store = useVariableStore.getState();
            // A value change made from the chat counts as exploring the figure
            // (RevealOnInteraction watches this); hover highlights do not.
            const countInteraction = () => {
                const n = store.variables[CHAT_INTERACTION_VAR];
                store.setVariable(CHAT_INTERACTION_VAR, (typeof n === "number" ? n : 0) + 1);
            };
            if (d.type === "mathvibe-explorable-highlight-color") {
                if (rootRef.current && typeof d.color === "string") {
                    highlightByColor(rootRef.current, d.color, d.on === true);
                }
                return;
            }
            if (d.type === "mathvibe-explorable-set-value") {
                const v = variables.find((x) => x.id === d.variableId);
                if (!v?.settable || typeof d.value !== "number" || !Number.isFinite(d.value)) return;
                store.setVariable(v.varName, snapToSettable(d.value, v.settable));
                countInteraction();
                return;
            }
            if (typeof d.varName !== "string") return;
            if (d.type === "mathvibe-explorable-restore") {
                if (saved.has(d.varName)) {
                    store.setVariable(d.varName, saved.get(d.varName) as never);
                    saved.delete(d.varName);
                }
                return;
            }
            if (d.type !== "mathvibe-explorable-set" || !allowed.get(d.varName)?.has(d.value)) return;
            if (d.mode === "highlight") {
                if (!saved.has(d.varName)) saved.set(d.varName, store.variables[d.varName] ?? "");
            } else {
                saved.delete(d.varName); // a click is a deliberate choice — keep it
                countInteraction();
            }
            store.setVariable(d.varName, d.value);
        };
        window.addEventListener("message", handler);
        return () => {
            unsubscribe();
            if (raf) cancelAnimationFrame(raf);
            window.removeEventListener("message", handler);
        };
    }, [entry, id, hydrated, chatSpec]);

    useEffect(() => {
        if (entry) return;
        const t = setInterval(() => setDots((d) => (d.length >= 3 ? "" : d + ".")), 500);
        // Vite HMR may not reach this iframe through proxied preview URLs, so
        // a registry update would never arrive — hard-reload periodically
        // until the explorable is registered instead of waiting forever.
        const r = setTimeout(() => window.location.reload(), 2500);
        return () => {
            clearInterval(t);
            clearTimeout(r);
        };
    }, [entry]);

    // Report the content height to the embedding chat page so the iframe can
    // size itself to the explorable (no inner scrollbar).
    useEffect(() => {
        if (!entry || !id || !hydrated || window.parent === window) return;
        let lastHeight = 0;
        const measure = (): number => {
            // Height of the content block INCLUDING its layout overflow:
            // scrollHeight on a non-scrolling element covers absolutely
            // positioned descendants such as an open cloze dropdown, so the
            // frame grows to show the whole menu. Crucially it never depends
            // on the iframe's own height (unlike documentElement.scrollHeight,
            // which is at least the viewport) — a measure that does creates a
            // grow/shrink feedback loop: the frame flickers and the page
            // scrollbar flashes on every shrink. Fixed-position portals
            // (tooltips) are viewport-anchored and deliberately excluded.
            const root = rootRef.current;
            if (!root) return 0;
            const top = root.getBoundingClientRect().top + window.scrollY;
            return Math.ceil(top + root.scrollHeight);
        };
        const sendHeight = () => {
            const height = measure();
            if (height > 0 && height !== lastHeight) {
                lastHeight = height;
                window.parent.postMessage(
                    { type: "mathvibe-explorable-height", explorableId: id, height },
                    "*"
                );
            }
        };
        sendHeight();
        window.parent.postMessage({
            type: "mathvibe-activity-ready", explorableId: id,
            channel: new URLSearchParams(window.location.search).get("activityChannel"),
        }, "*");
        const observer = new ResizeObserver(sendHeight);
        observer.observe(document.body);
        if (rootRef.current) observer.observe(rootRef.current);
        // Popovers and reveals (dropdown menus, RevealOnInteraction, feedback)
        // change the extent without resizing the body — catch DOM changes too,
        // coalesced to one measurement per frame.
        let raf = 0;
        const mutations = new MutationObserver(() => {
            if (raf) return;
            raf = requestAnimationFrame(() => {
                raf = 0;
                sendHeight();
            });
        });
        mutations.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ["style", "class", "open", "hidden", "data-state"],
        });
        // Fallback for late layout shifts (KaTeX, charts, fonts)
        const timer = setInterval(sendHeight, 1500);
        return () => {
            observer.disconnect();
            mutations.disconnect();
            if (raf) cancelAnimationFrame(raf);
            clearInterval(timer);
        };
    }, [entry, id, hydrated]);

    // Report student interactions (variable changes: scrubs, answers, toggles)
    // to the embedding chat page, so the tutor can react without the student
    // having to retype what they did.
    useEffect(() => {
        if (!entry || !id || !hydrated || window.parent === window) return;
        let prev = useVariableStore.getState().variables;
        // Chat-driven hover highlights are not something the student did here.
        const terms = chatSpec?.terms ?? [];
        const highlightOnly = new Set(
            terms.flatMap((t) => (t.highlight ? [t.highlight.varName] : []))
                .filter((v) => !terms.some((t) => t.select?.varName === v)),
        );
        const unsubscribe = useVariableStore.subscribe((state) => {
            const vars = state.variables;
            if (vars === prev) return;
            for (const [name, value] of Object.entries(vars)) {
                if (prev[name] !== value) {
                    // RevealOnInteraction and similar gates are implementation
                    // details, not concept variables the tutor should discuss.
                    const isInternalState =
                        /_(explored|interacted|revealed)$/.test(name) || name === CHAT_INTERACTION_VAR;
                    if (isInternalState || highlightOnly.has(name)) continue;
                    window.parent.postMessage(
                        {
                            type: "mathvibe-explorable-interaction",
                            explorableId: id,
                            varName: name,
                            previousValue: prev[name],
                            value,
                            // Generic store changes are exploration. Assessed
                            // answers are reported explicitly by InlineFeedback.
                            interactionKind: "variable_change",
                        },
                        "*"
                    );
                }
            }
            prev = vars;
        });
        return () => unsubscribe();
    }, [entry, id, hydrated, chatSpec]);

    if (!entry) {
        return (
            <div className={`h-screen flex items-center justify-center ${isEditor ? "bg-white" : "bg-transparent"}`}>
                <div className="text-center text-slate-400">
                    <div className="text-base font-medium">Preparing your interactive explanation{dots}</div>
                    <div className="text-xs mt-2">This appears automatically when it is ready</div>
                </div>
            </div>
        );
    }

    if (!hydrated) return <div role="status">Restoring your activity…</div>;

    return (
        <div ref={rootRef} className={`relative ${isEditor ? "bg-white" : "bg-transparent"}`}>
            <BlockRenderer
                initialBlocks={entry.blocks}
                isPreview={!isEditor}
                hideLegend
                embedded
            />
        </div>
    );
};

export default ExplorableView;
