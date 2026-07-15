import { useEffect, useState } from "react";
import { BlockRenderer } from "@/components/templates";
import { explorables } from "@/data/explorables";
import { useAppMode } from "@/contexts/AppModeContext";
import { useVariableStore } from "@/stores";

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
    const [dots, setDots] = useState("");

    // Embedded in the tutor chat, the explorable must sit directly on the
    // chat's background — clear the app's own page background so the iframe
    // can be transparent. The teacher's editor keeps the normal white page.
    useEffect(() => {
        if (isEditor) return;
        document.documentElement.style.background = "transparent";
        document.body.style.background = "transparent";
    }, [isEditor]);

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
        if (!entry || !id || window.parent === window) return;
        let lastHeight = 0;
        const sendHeight = () => {
            const height = Math.ceil(document.documentElement.scrollHeight);
            if (height !== lastHeight) {
                lastHeight = height;
                window.parent.postMessage(
                    { type: "mathvibe-explorable-height", explorableId: id, height },
                    "*"
                );
            }
        };
        sendHeight();
        const observer = new ResizeObserver(sendHeight);
        observer.observe(document.body);
        // Fallback for late layout shifts (KaTeX, charts, fonts)
        const timer = setInterval(sendHeight, 1500);
        return () => {
            observer.disconnect();
            clearInterval(timer);
        };
    }, [entry, id]);

    // Report student interactions (variable changes: scrubs, answers, toggles)
    // to the embedding chat page, so the tutor can react without the student
    // having to retype what they did.
    useEffect(() => {
        if (!entry || !id || window.parent === window) return;
        let prev = useVariableStore.getState().variables;
        const unsubscribe = useVariableStore.subscribe((state) => {
            const vars = state.variables;
            if (vars === prev) return;
            for (const [name, value] of Object.entries(vars)) {
                if (prev[name] !== value) {
                    window.parent.postMessage(
                        {
                            type: "mathvibe-explorable-interaction",
                            explorableId: id,
                            varName: name,
                            value,
                        },
                        "*"
                    );
                }
            }
            prev = vars;
        });
        return () => unsubscribe();
    }, [entry, id]);

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

    return (
        <div className={`relative ${isEditor ? "bg-white" : "bg-transparent"}`}>
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
