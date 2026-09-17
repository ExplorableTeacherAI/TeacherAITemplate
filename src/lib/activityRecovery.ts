import { useEffect, useState } from "react";
import { useVariableStore, type VarValue } from "@/stores/variableStore";

// Source changes invalidate snapshots even after the parent page has reloaded.
const sources = import.meta.glob("../data/explorables/**/*.tsx", { query: "?raw", import: "default", eager: true });
let hash = 2166136261;
for (const [path, source] of Object.entries(sources).sort()) {
    for (const char of path + String(source)) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
}
const revision = String(hash >>> 0);
let restored: Record<string, VarValue> = {};
export const isRestoredAnswer = (name: string, value: unknown) =>
    Object.prototype.hasOwnProperty.call(restored, name) && Object.is(restored[name], value);

export function validSnapshot(value: unknown): value is Record<string, VarValue> {
    if (!value || typeof value !== "object" || Array.isArray(value)) return false;
    try {
        const values = Object.values(value);
        return JSON.stringify(value).length <= 200000 &&
            values.every(item => item !== null && ["number", "string", "boolean", "object"].includes(typeof item)) &&
            !Object.keys(value).some(key => ["__proto__", "constructor", "prototype"].includes(key));
    } catch { return false; }
}

/** Only student frames explicitly opted in by the tutor page use recovery. */
export function useActivityRecovery(id: string, enabled: boolean) {
    const query = new URLSearchParams(window.location.search);
    const channel = query.get("activityChannel");
    const active = enabled && query.get("activityRecovery") === "1" && window.parent !== window;
    const [hydrated, setHydrated] = useState(!active);
    useEffect(() => {
        if (!active) return;
        let finished = false;
        let unsubscribe = () => {};
        const parentOrigin = (() => {
            try { return new URL(document.referrer).origin; } catch { return null; }
        })();
        const send = (type: string, extra = {}) => window.parent.postMessage(
            { type, channel, explorableId: id, revision, ...extra }, parentOrigin ?? "*");
        const finish = (snapshot: unknown) => {
            if (finished) return;
            finished = true;
            const defaults = useVariableStore.getState().variables;
            restored = validSnapshot(snapshot) ? Object.fromEntries(Object.entries(snapshot).filter(([name, value]) =>
                !(name in defaults) || (typeof value === typeof defaults[name] && Array.isArray(value) === Array.isArray(defaults[name]))
            )) : {};
            useVariableStore.getState().setVariables(restored);
            let previous = useVariableStore.getState().variables;
            unsubscribe = useVariableStore.subscribe(state => {
                if (state.variables === previous) return;
                for (const name of Object.keys(restored)) {
                    if (!Object.is(state.variables[name], restored[name])) delete restored[name];
                }
                previous = state.variables;
                send("mathvibe-activity-state", { variables: previous });
            });
            setHydrated(true);
        };
        const receive = (event: MessageEvent) => {
            if (event.source !== window.parent || (parentOrigin && event.origin !== parentOrigin)) return;
            if (event.data?.type === "mathvibe-activity-restore" && event.data.channel === channel) finish(event.data.variables);
        };
        window.addEventListener("message", receive);
        send("mathvibe-activity-hello");
        const hello = window.setInterval(() => { if (!finished) send("mathvibe-activity-hello"); }, 250);
        // A missing parent bridge must not make an otherwise healthy activity unusable.
        const fallback = window.setTimeout(() => finish(null), 3000);
        return () => {
            window.removeEventListener("message", receive);
            clearInterval(hello);
            clearTimeout(fallback);
            unsubscribe();
        };
    }, [active, channel, id]);
    return hydrated;
}
